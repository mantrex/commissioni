// server/api/invoices/[id].delete.js
import Invoice from "~~/server/models/Invoice";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  try {
    const invoice = await Invoice.findOne({ _id: id, deletedAt: null }).lean();

    if (!invoice) {
      throw createError({ statusCode: 404, message: "Fattura non trovata" });
    }

    await Invoice.findByIdAndUpdate(id, { deletedAt: new Date() });

    return { success: true, message: "Fattura eliminata" };
  } catch (error) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Errore durante l'eliminazione",
      data: error.message,
    });
  }
});
