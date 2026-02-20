// server/api/orders/adjacent.get.js
// Trova l'ordine precedente e successivo rispetto a un commNum
import Order from "~~/server/models/Order";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { commNum } = query;

  if (!commNum) {
    throw createError({ statusCode: 400, message: "commNum obbligatorio" });
  }

  try {
    const currentNum = parseInt(commNum);

    // Cerca il precedente (il più grande tra quelli minori)
    const prev = await Order.findOne({
      commNum: { $lt: String(currentNum).padStart(commNum.length, "0") },
    })
      .sort({ commNum: -1 })
      .select("_id commNum")
      .lean();

    // Cerca il successivo (il più piccolo tra quelli maggiori)
    const next = await Order.findOne({ commNum: { $gt: commNum } })
      .sort({ commNum: 1 })
      .select("_id commNum")
      .lean();

    return {
      success: true,
      prev: prev ? { id: prev._id, commNum: prev.commNum } : null,
      next: next ? { id: next._id, commNum: next.commNum } : null,
    };
  } catch (error) {
    console.error("Errore API adjacent orders:", error);
    throw createError({
      statusCode: 500,
      message: "Errore nel recupero ordini adiacenti",
      data: error.message,
    });
  }
});
