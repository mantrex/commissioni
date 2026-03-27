// server/api/orders/[id].delete.js
import Order from "~~/server/models/Order";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
console.log("DELETE order called, id:", id);
  try {
    const order = await Order.findOne({ _id: id, deletedAt: null }).lean();

    if (!order) {
      throw createError({
        statusCode: 404,
        message: "Commissione non trovata",
      });
    }

    await Order.findByIdAndUpdate(id, { deletedAt: new Date() });

    return { success: true, message: "Commissione eliminata" };
  } catch (error) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Errore durante l'eliminazione",
      data: error.message,
    });
  }
});
