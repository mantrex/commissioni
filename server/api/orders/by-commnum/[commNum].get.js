// server/api/orders/by-commnum/[commNum].get.js
import Order from "~~/server/models/Order";
import "~~/server/models/Client";
import "~~/server/models/Agent";
import "~~/server/models/Product";

export default defineEventHandler(async (event) => {
  const rawCommNum = getRouterParam(event, "commNum");

  try {
    const numericVal = parseInt(rawCommNum, 10);

    let order = null;

    if (!isNaN(numericVal)) {
      const regex = new RegExp(`^0*${numericVal}$`);
      order = await Order.findOne({
        commNum: { $regex: regex },
        deletedAt: null,
      })
        .populate(
          "clientId",
          "firstname lastname company address cap city region state tel fax email piva vip",
        )
        .populate("agentId", "firstname lastname")
        .populate("items.productId", "code name details")
        .lean();
    }

    if (!order) {
      order = await Order.findOne({ commNum: rawCommNum, deletedAt: null })
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

    return { success: true, order };
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
