// server/api/orders/by-commnum/[commNum].get.js
import Order from "~~/server/models/Order";
import "~~/server/models/Client";
import "~~/server/models/Agent";
import "~~/server/models/Product";

export default defineEventHandler(async (event) => {
  const rawCommNum = getRouterParam(event, "commNum");

  try {
    // Normalizza input: rimuovi zeri iniziali → numero puro
    // es. "0200" → 200, "00200" → 200, "200" → 200
    const numericVal = parseInt(rawCommNum, 10);

    let order = null;

    if (!isNaN(numericVal)) {
      // Cerca con regex che matcha qualsiasi numero di zeri iniziali
      // es. numericVal=200 → regex ^0*200$ → matcha "200", "0200", "00200"
      const regex = new RegExp(`^0*${numericVal}$`);
      order = await Order.findOne({ commNum: { $regex: regex } })
        .populate(
          "clientId",
          "firstname lastname company address cap city region state tel fax email piva vip",
        )
        .populate("agentId", "firstname lastname")
        .populate("items.productId", "code name details")
        .lean();
    }

    // Fallback: ricerca esatta se la regex non ha trovato nulla
    if (!order) {
      order = await Order.findOne({ commNum: rawCommNum })
        .populate(
          "clientId",
          "firstname lastname company address cap city region state tel fax email piva vip",
        )
        .populate("agentId", "firstname lastname")
        .populate("items.productId", "code name details")
        .lean();
    }

    if (!order) {
      throw createError({
        statusCode: 404,
        message: `Commissione "${rawCommNum}" non trovata`,
      });
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Errore API get order by commNum:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Errore nel recupero dell'ordine",
      data: error.message,
    });
  }
});
