import Order from "~~/server/models/Order";
import "~~/server/models/Client";
import "~~/server/models/Agent";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const filters = {};
    const populateMatch = {};

    if (query.commNum)
      filters.commNum = { $regex: query.commNum, $options: "i" };
    if (query.status) filters.status = query.status;
    if (query.agentId) filters.agentId = query.agentId;

    if (query.expiredDays) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(query.expiredDays));
      filters.dueDate = { $lte: cutoff };
    } else if (query.notExpired === "true") {
      filters.dueDate = { $gt: new Date() };
    }

    if (query.dateFrom || query.dateTo) {
      filters.date = {};
      if (query.dateFrom) filters.date.$gte = new Date(query.dateFrom);
      if (query.dateTo) filters.date.$lte = new Date(query.dateTo);
    }
    if (query.dueDateFrom || query.dueDateTo) {
      if (!filters.dueDate) filters.dueDate = {};
      if (query.dueDateFrom) filters.dueDate.$gte = new Date(query.dueDateFrom);
      if (query.dueDateTo) filters.dueDate.$lte = new Date(query.dueDateTo);
    }

    if (query.clientLastname)
      populateMatch["clientId.lastname"] = {
        $regex: query.clientLastname,
        $options: "i",
      };
    if (query.clientFirstname)
      populateMatch["clientId.firstname"] = {
        $regex: query.clientFirstname,
        $options: "i",
      };
    if (query.clientCity)
      populateMatch["clientId.city"] = {
        $regex: query.clientCity,
        $options: "i",
      };
    if (query.clientCountry)
      populateMatch["clientId.state"] = {
        $regex: query.clientCountry,
        $options: "i",
      };
    if (query.clientVip !== undefined)
      populateMatch["clientId.vip"] = query.clientVip === "true";

    let orders = await Order.find(filters)
      .sort({ dueDate: 1 })
      .populate("clientId", "firstname lastname company city state")
      .populate("agentId", "firstname lastname")
      .lean();

    if (Object.keys(populateMatch).length > 0) {
      orders = orders.filter((order) => {
        for (const [key, condition] of Object.entries(populateMatch)) {
          const field = key.split(".")[1];
          const value = order.clientId?.[field];
          if (condition.$regex) {
            if (
              !value ||
              !new RegExp(condition.$regex, condition.$options).test(value)
            )
              return false;
          } else if (condition !== value) return false;
        }
        return true;
      });
    }

    return {
      success: true,
      orders: orders.map((o) => ({
        commNum: o.commNum,
        date: o.date,
        agent: o.agentId ? `${o.agentId.lastname} ${o.agentId.firstname}` : "",
        clientLastname: o.clientId?.lastname || "",
        clientFirstname: o.clientId?.firstname || "",
        clientCompany: o.clientId?.company || "",
        clientState: o.clientId?.state || "",
        clientCity: o.clientId?.city || "",
        position: o.position || "",
        ca: o.ca || false,
        rd: o.rd || false,
        balance: o.balance || 0,
        shipDate: o.shipDate || null,
        courier: o.courier || "",
        firstNote: o.notes && o.notes.length > 0 ? o.notes[0].text || "" : "",
      })),
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Errore stampa ordini",
      data: error.message,
    });
  }
});
