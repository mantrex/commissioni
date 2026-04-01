import Order from "~~/server/models/Order";
import Invoice from "~~/server/models/Invoice";
import "~~/server/models/Client";
import "~~/server/models/Agent";
import {
  isValidStatus,
  getStatusLabel,
  getStatusCode,
} from "~~/server/utils/statuses";
import { Types } from "mongoose";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "dueDate";
    const sortDesc = query.sortDesc === "true";
    const effectiveSortBy = sortBy === "commNum" ? "commNumInt" : sortBy;
    const sort = { [effectiveSortBy]: sortDesc ? -1 : 1 };

    // ── Filtri diretti sull'ordine ───────────────────────────────────────────
    const match = { deletedAt: null };

    if (query.commNum) match.commNum = { $regex: query.commNum, $options: "i" };

    if (query.status) {
      if (!isValidStatus(query.status))
        throw createError({
          statusCode: 400,
          message: `Stato non valido: ${query.status}`,
        });
      match.status = query.status;
    }

    if (query.expiredDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(query.expiredDays));
      match.date = { $lte: cutoff };
      match.dueDate = { $ne: null };
    } else if (query.notExpired === "true") {
      match.dueDate = { $gt: new Date() };
    }

    if (query.balanceOpen === "true") match.balance = { $ne: 0 };
    else if (query.balanceClosed === "true") match.balance = 0;

    if (query.dateFrom || query.dateTo) {
      match.date = {};
      if (query.dateFrom) match.date.$gte = new Date(query.dateFrom);
      if (query.dateTo) match.date.$lte = new Date(query.dateTo);
    }

    if (query.dueDateFrom || query.dueDateTo) {
      if (!match.dueDate) match.dueDate = {};
      if (query.dueDateFrom) match.dueDate.$gte = new Date(query.dueDateFrom);
      if (query.dueDateTo) match.dueDate.$lte = new Date(query.dueDateTo);
    }

    if (query.productCode) {
      const Product = (await import("~~/server/models/Product")).default;
      const products = await Product.find(
        { code: { $regex: query.productCode, $options: "i" } },
        { _id: 1 },
      ).lean();
      if (products.length === 0)
        return { success: true, orders: [], total: 0, page, pages: 0 };
      match["items.productId"] = { $in: products.map((p) => p._id) };
    }

    // ── Filtri post-lookup cliente ───────────────────────────────────────────
    const clientMatch = {};
    if (query.clientLastname)
      clientMatch["clientId.lastname"] = { $regex: query.clientLastname, $options: "i" };
    if (query.clientFirstname)
      clientMatch["clientId.firstname"] = { $regex: query.clientFirstname, $options: "i" };
    if (query.clientCity)
      clientMatch["clientId.city"] = { $regex: query.clientCity, $options: "i" };
    if (query.clientCountry)
      clientMatch["clientId.state"] = { $regex: query.clientCountry, $options: "i" };
    if (query.clientVip !== undefined)
      clientMatch["clientId.vip"] = query.clientVip === "true";

    // ── Filtri post-lookup agente ────────────────────────────────────────────
    const agentMatch = {};
    if (query.agentId) {
      agentMatch["$or"] = [
        { "agentId.lastname": { $regex: query.agentId, $options: "i" } },
        { "agentId.firstname": { $regex: query.agentId, $options: "i" } },
      ];
    }

    const hasClientFilter = Object.keys(clientMatch).length > 0;
    const hasAgentFilter = Object.keys(agentMatch).length > 0;

    let orders, total;

    if (!hasClientFilter && !hasAgentFilter) {
      // ── PATH VELOCE: nessun filtro su cliente/agente ─────────────────────
      // Sort + pagina PRIMA dei lookup, join solo sui 25 record risultanti.
      // countDocuments usa direttamente gli indici, molto più veloce del $facet.
      const [rawOrders, count] = await Promise.all([
        Order.aggregate([
          { $match: match },
          { $sort: sort },
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "clients",
              localField: "clientId",
              foreignField: "_id",
              as: "clientId",
            },
          },
          { $unwind: { path: "$clientId", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "agents",
              localField: "agentId",
              foreignField: "_id",
              as: "agentId",
            },
          },
          { $unwind: { path: "$agentId", preserveNullAndEmptyArrays: true } },
        ]),
        Order.countDocuments(match),
      ]);

      orders = rawOrders;
      total = count;

    } else {
      // ── PATH CON FILTRI CLIENTE/AGENTE: lookup prima del sort ───────────
      const [result] = await Order.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "clientId",
          },
        },
        { $unwind: { path: "$clientId", preserveNullAndEmptyArrays: true } },
        ...(hasClientFilter ? [{ $match: clientMatch }] : []),
        {
          $lookup: {
            from: "agents",
            localField: "agentId",
            foreignField: "_id",
            as: "agentId",
          },
        },
        { $unwind: { path: "$agentId", preserveNullAndEmptyArrays: true } },
        ...(hasAgentFilter ? [{ $match: agentMatch }] : []),
        { $sort: sort },
        {
          $facet: {
            orders: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: "count" }],
          },
        },
      ]);

      orders = result.orders;
      total = result.total[0]?.count || 0;
    }

    // ── Arricchisci con fatture e stato ──────────────────────────────────────
    const orderCommNums = orders.map((o) => o.commNum).filter(Boolean);
    const invoices = await Invoice.find(
      { commNum: { $in: orderCommNums }, deletedAt: null },
      { commNum: 1 },
    ).lean();
    const invoicedCommNums = new Set(invoices.map((inv) => inv.commNum));

    const enrichedOrders = orders.map((order) => ({
      ...order,
      hasInvoice: invoicedCommNums.has(order.commNum),
      statusInfo: {
        key: order.status,
        label: getStatusLabel(order.status),
        code: getStatusCode(order.status),
      },
    }));

    return {
      success: true,
      orders: enrichedOrders,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Errore API orders:", error);
    if (error.statusCode === 400) throw error;
    throw createError({
      statusCode: 500,
      message: "Errore nel recupero degli ordini",
      data: error.message,
    });
  }
});