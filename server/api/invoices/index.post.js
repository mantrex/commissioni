import Invoice from "~~/server/models/Invoice";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validazioni
    if (!body.client || (!body.client.lastname && !body.client.company)) {
      throw createError({
        statusCode: 400,
        message: "Dati cliente obbligatori",
      });
    }

    if (!body.items || body.items.length === 0) {
      throw createError({
        statusCode: 400,
        message: "Almeno un articolo è obbligatorio",
      });
    }

    // Genera ID fattura se non presente
    let invoiceId = body.invoiceId || body.invoiceData?.invoiceId;
    if (!invoiceId) {
      invoiceId = await generateInvoiceId();
    }

    console.log("📄 Creazione fattura con ID:", invoiceId);

    // Prepara dati fattura
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

    const invoice = await Invoice.create(invoiceData);

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("orderId", "commNum")
      .populate("items.productId", "code name details")
      .lean();

    return {
      success: true,
      invoice: populatedInvoice,
      message: "Fattura creata con successo",
    };
  } catch (error) {
    console.error("Errore API create invoice:", error);

    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      message: "Errore nella creazione della fattura",
      data: error.message,
    });
  }
});

// ✅ Genera ID fattura progressivo - GESTISCE ID LEGACY ALFANUMERICI
async function generateInvoiceId() {
  try {
    // Trova tutte le fatture e filtra solo quelle con ID numerici
    const allInvoices = await Invoice.find()
      .select("invoiceId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    console.log("🔍 Fatture totali nel DB:", allInvoices.length);

    // Filtra solo gli ID numerici validi e trova il massimo
    const numericIds = allInvoices
      .map((inv) => {
        const num = parseInt(inv.invoiceId, 10);
        return isNaN(num) ? null : num;
      })
      .filter((num) => num !== null);

    console.log("🔢 ID numerici trovati:", numericIds);

    if (numericIds.length === 0) {
      // Nessun ID numerico trovato, inizia da 1
      console.log("✨ Prima fattura numerica - genero 00001");
      return "00001";
    }

    // Trova il massimo tra gli ID numerici
    const maxNum = Math.max(...numericIds);
    const newNum = maxNum + 1;
    const newId = String(newNum).padStart(5, "0");

    console.log(`✅ Massimo ID numerico: ${maxNum}, nuovo ID: ${newId}`);

    return newId;
  } catch (error) {
    console.error("❌ Errore in generateInvoiceId:", error);
    // In caso di errore, usa timestamp come fallback
    const fallbackId = String(Date.now()).slice(-5);
    console.log("⚠️ Usando ID fallback:", fallbackId);
    return fallbackId;
  }
}
