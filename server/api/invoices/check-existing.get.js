// server/api/invoices/check-existing.get.js
import Invoice from "~~/server/models/Invoice";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { commNum } = query;

    if (!commNum) {
      throw createError({ statusCode: 400, message: "commNum è obbligatorio" });
    }

    // Tutte le fatture per questo commNum (possono essere più di una)
    const invoices = await Invoice.find({ commNum })
      .select(
        "_id invoiceId invoiceNumber invoiceYear invoiceType invoiceDate total issued",
      )
      .sort({ invoiceDate: -1 })
      .lean();

    return {
      success: true,
      exists: invoices.length > 0,
      invoice: invoices[0] || null, // ← compatibilità col vecchio codice
      invoices, // ← array completo
    };
  } catch (error) {
    console.error("Errore check existing invoice:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Errore nella verifica fattura",
      data: error.message,
    });
  }
});
