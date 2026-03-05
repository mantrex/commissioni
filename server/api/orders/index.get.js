import Order from "~~/server/models/Order";
import Invoice from "~~/server/models/Invoice";
import "~~/server/models/Client";
import "~~/server/models/Agent";

import {
  isValidStatus,
  getStatusLabel,
  getStatusCode,
} from "~~/server/utils/statuses";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // Parametri paginazione
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = query.sortBy || "dueDate";
    const sortDesc = query.sortDesc === "true";
    const sort = { [sortBy]: sortDesc ? -1 : 1 };

    // Costruisci filtri
    const filters = {};
    filter.deletedAt = null;
    
    // Filtro per numero commissione
    if (query.commNum) {
      filters.commNum = { $regex: query.commNum, $options: "i" };
    }

    // Filtro per stato (validato)
    if (query.status) {
      if (!isValidStatus(query.status)) {
        throw createError({
          statusCode: 400,
          message: `Stato non valido: ${query.status}`,
        });
      }
      filters.status = query.status;
    }

    // Filtro scadenza
    if (query.expiredDays) {
      const daysAgo = parseInt(query.expiredDays);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      filters.dueDate = { $lte: cutoffDate };
    } else if (query.notExpired === "true") {
      filters.dueDate = { $gt: new Date() };
    }

   if (query.balanceOpen === "true") {
     filters.balance = { $ne: 0 };
   } else if (query.balanceClosed === "true") {
     filters.balance = 0;
   }

    // Filtri avanzati cliente (tramite populate)
    const populateMatch = {};
    if (query.clientLastname) {
      populateMatch["clientId.lastname"] = {
        $regex: query.clientLastname,
        $options: "i",
      };
    }
    if (query.clientFirstname) {
      populateMatch["clientId.firstname"] = {
        $regex: query.clientFirstname,
        $options: "i",
      };
    }
    if (query.clientCity) {
      populateMatch["clientId.city"] = {
        $regex: query.clientCity,
        $options: "i",
      };
    }
    if (query.clientCountry) {
      populateMatch["clientId.state"] = {
        $regex: query.clientCountry,
        $options: "i",
      };
    }
    if (query.clientVip !== undefined) {
      populateMatch["clientId.vip"] = query.clientVip === "true";
    }

    // Filtro agente
    if (query.agentId) {
      filters.agentId = query.agentId;
    }

    // Filtro prodotto (cerca negli items)
    if (query.productCode) {
      // TODO: implementare ricerca nei products degli items
      // Per ora skippiamo, serve una query più complessa
    }

    // Filtri date commissione
    if (query.dateFrom || query.dateTo) {
      filters.date = {};
      if (query.dateFrom) filters.date.$gte = new Date(query.dateFrom);
      if (query.dateTo) filters.date.$lte = new Date(query.dateTo);
    }

    // Filtri date scadenza
    if (query.dueDateFrom || query.dueDateTo) {
      if (!filters.dueDate) filters.dueDate = {};
      if (query.dueDateFrom) {
        filters.dueDate.$gte = new Date(query.dueDateFrom);
      }
      if (query.dueDateTo) {
        filters.dueDate.$lte = new Date(query.dueDateTo);
      }
    }

    // Esegui query con populate
    let ordersQuery = Order.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("clientId", "firstname lastname company city state vip")
      .populate("agentId", "firstname lastname")
      .lean();

    const [orders, total] = await Promise.all([
      ordersQuery,
      Order.countDocuments(filters),
    ]);
    const orderCommNums = orders.map((o) => o.commNum).filter(Boolean);
    const invoices = await Invoice.find(
      { commNum: { $in: orderCommNums } },
      { commNum: 1 },
    ).lean();

    const invoicedCommNums = new Set(invoices.map((inv) => inv.commNum));

    let filteredOrders = orders;
    let filteredTotal = total; // ✅ NUOVO: mantieni il totale originale

    if (Object.keys(populateMatch).length > 0) {
      filteredOrders = orders.filter((order) => {
        for (const [key, condition] of Object.entries(populateMatch)) {
          const field = key.split(".")[1];
          const value = order.clientId?.[field];

          if (condition.$regex) {
            if (
              !value ||
              !new RegExp(condition.$regex, condition.$options).test(value)
            ) {
              return false;
            }
          } else if (condition !== value) {
            return false;
          }
        }
        return true;
      });

      // Quando filtriamo post-populate, ricalcola il totale
      // Questo è necessario perché countDocuments() non tiene conto dei filtri su campi popolati
      if (filteredOrders.length < orders.length) {
        // Se abbiamo filtrato qualcosa, il totale potenziale è diverso
        // Dobbiamo fare un conteggio separato considerando i filtri cliente
        // Per ora usiamo la lunghezza filtrata come approssimazione
        // In una implementazione production, dovresti fare una query separata
        filteredTotal = filteredOrders.length;
      }
    }
    // Arricchisci con info stato
    const enrichedOrders = filteredOrders.map((order) => ({
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
      total: filteredTotal,
      page,
      pages: Math.ceil(filteredOrders.length / limit),
    };
  } catch (error) {
    console.error("Errore API orders:", error);

    if (error.statusCode === 400) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: "Errore nel recupero degli ordini",
      data: error.message,
    });
  }
});
