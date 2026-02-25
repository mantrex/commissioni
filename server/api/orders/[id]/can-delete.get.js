import Order from "~~/server/models/Order";
import Invoice from "~~/server/models/Invoice";

export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, "id");

  const order = await Order.findById(orderId).select("commNum").lean();
  if (!order)
    throw createError({ statusCode: 404, message: "Commissione non trovata" });

  const invoiceCount = await Invoice.countDocuments({ commNum: order.commNum });

  return {
    canDelete: invoiceCount === 0,
    invoiceCount,
    commNum: order.commNum,
  };
});
