import Invoice from "~~/server/models/Invoice";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const type = query.type || "E";
  const year = parseInt(query.year) || new Date().getFullYear();

  const last = await Invoice.findOne(
    { invoiceType: type, invoiceYear: year,deletedAt:null },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } },
  );

  const nextNumber = last ? last.invoiceNumber + 1 : 1;

  return { nextNumber, type, year };
});
