// server/api/invoices/index.post.js
import Invoice from "~~/server/models/Invoice";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.client || (!body.client.lastname && !body.client.company)) {
      throw createError({ statusCode: 400, message: "Dati cliente obbligatori" });
    }

    let invoiceId = body.invoiceId || body.invoiceData?.invoiceId;
    if (!invoiceId) {
      invoiceId = await generateInvoiceId();
    }

    console.log("Creazione fattura con ID:", invoiceId);

    const invoiceData = {
      invoiceId,
      invoiceType: body.invoiceType || "E",
      invoiceNumber: body.invoiceNumber || null,
      invoiceYear: body.invoiceYear || new Date().getFullYear(),
      invoiceDate: body.invoiceData?.invoiceDate || new Date(),
      orderId: body.invoiceData?.orderId || null,
      commNum: body.invoiceData?.commNum || null,
      client: {
        clientId: body.client.clientId || null,
        firstname: body.client.firstname || "",
        lastname: body.client.lastname || "",
        title: body.client.title || "",
        company: body.client.company || "",
        address: body.client.address || "",
        cap: body.client.cap || "",
        city: body.client.city || "",
        region: body.client.region || "",
        state: body.client.state || "",
        tel: body.client.tel || "",
        fax: body.client.fax || "",
        email: body.client.email || "",
        tels: (body.client.tels || []).filter(Boolean),
        faxes: (body.client.faxes || []).filter(Boolean),
        emails: (body.client.emails || []).filter(v => v && v.trim()),
        piva: body.client.piva || "",
      },
      receipts: (body.receipts || []).filter((r) => r.number),
      items: (body.items || []).map((item) => ({
        productId: item.productId || null,
        orderItemId: item.orderItemId || null,
        code: item.code || "",
        description: item.description || "",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
      })),
      taxable: body.financial?.taxable || 0,
      hasVat: body.financial?.hasVat ?? true,
      vatRate: body.financial?.vatRate || 22,
      vatAmount: body.financial?.vatAmount || 0,
      total: body.financial?.total || 0,
      deposit: body.financial?.deposit || 0,
      cod: body.financial?.cod || 0,
      payment: body.invoiceData?.payment || "",
      shipping: body.invoiceData?.shipping || "",
      insurance: body.invoiceData?.insurance || "",
      notes: body.invoiceData?.notes || "",
      issued: body.invoiceData?.issued || false,
      packing: body.packing || {},
      packages: body.packages || [],
      shippingLabel: body.shippingLabel || {},
    };

    const duplicate = await Invoice.findOne({
      invoiceType: invoiceData.invoiceType,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceYear: invoiceData.invoiceYear,
      deletedAt: null,
    }).lean();

    if (duplicate) {
      const last = await Invoice.findOne(
        { invoiceType: invoiceData.invoiceType, invoiceYear: invoiceData.invoiceYear },
        { invoiceNumber: 1 },
        { sort: { invoiceNumber: -1 } },
      ).lean();
      const nextNumber = (last?.invoiceNumber || 0) + 1;
      invoiceData.invoiceNumber = nextNumber;
      invoiceData.invoiceId = `${invoiceData.invoiceType}${String(nextNumber).padStart(3, "0")}/${invoiceData.invoiceYear}`;
      console.warn(`Duplicato rilevato, riassegnato a ${invoiceData.invoiceId}`);
    }

    const invoice = await Invoice.create(invoiceData);
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("orderId", "commNum")
      .populate("items.productId", "code name details")
      .lean();

    return { success: true, invoice: populatedInvoice, message: "Fattura creata con successo" };

  } catch (error) {
    console.error("Errore API create invoice:", error);
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, message: "Errore nella creazione della fattura", data: error.message });
  }
});

async function generateInvoiceId() {
  try {
    const allInvoices = await Invoice.find().select("invoiceId createdAt").sort({ createdAt: -1 }).lean();
    const numericIds = allInvoices.map((inv) => {
      const num = parseInt(inv.invoiceId, 10);
      return isNaN(num) ? 0 : num;
    });
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return String(maxId + 1);
  } catch {
    return String(Date.now());
  }
}