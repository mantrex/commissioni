// server/api/orders/index.post.js
import Order from "~~/server/models/Order";

const COMM_NUM_LENGTH = 8;

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);


    // Genera/normalizza numero commissione
    let commNum = body.commNum;
    if (!commNum) {
      commNum = await generateCommNum();
    } else {
      // Normalizza a 8 cifre anche se arriva già dal frontend
      commNum = normalizeCommNum(commNum);
    }

    // Verifica unicità (doppia sicurezza lato server)
    const existing = await Order.findOne({ commNum }).lean();
    if (existing) {
      throw createError({
        statusCode: 409,
        message: `La commissione ${commNum} esiste già`,
      });
    }

    // Prepara dati ordine
    const orderData = {
      commNum,
      date: body.orderData?.date || new Date(),
      dueDate: body.orderData?.dueDate || null,
      clientId: body.client._id || null,
      agentId: body.orderData?.agentId || null,
      status: body.orderData?.status || "APERTA",
      shipments: (body.shipments || []).filter((s) => s.date || s.courier),
      notes: (body.notes || []).filter((n) => n.text),
      items: (body.items || []).map((item) => ({
        productId: item.productId || null,
        code: item.code || "",
        description: item.description || "",
        quantity: item.quantity || 0,
        ready: item.ready || false,
        invoiced: item.invoiced || 0,
        ordered: item.ordered || false,
        note: item.note || "",
      })),
      ca: body.financial?.ca || 0,
      rd: body.financial?.rd || 0,
      ric: body.financial?.ric || 0,
      balance: body.financial?.balance || 0,
      pay: body.financial?.pay || 0,
    };

    const order = await Order.create(orderData);

    // Populate l'ordine prima di restituirlo
    const populatedOrder = await Order.findById(order._id)
      .populate(
        "clientId",
        "firstname lastname company address cap city region state tel fax email piva vip",
      )
      .populate("agentId", "firstname lastname")
      .populate("items.productId", "code name details")
      .lean();

    return {
      success: true,
      order: populatedOrder,
      message: "Ordine creato con successo",
    };
  } catch (error) {
    console.error("Errore API create order:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      message: "Errore nella creazione dell'ordine",
      data: error.message,
    });
  }
});

/**
 * Normalizza un numero commissione a COMM_NUM_LENGTH cifre
 */
function normalizeCommNum(val) {
  const n = parseInt(val);
  if (isNaN(n) || n <= 0) return String(val);
  return String(n).padStart(COMM_NUM_LENGTH, "0");
}

/**
 * Genera il prossimo numero commissione progressivo (8 cifre)
 * Cerca il massimo numerico tra tutti i commNum esistenti
 */
async function generateCommNum() {
  const orders = await Order.find({}, { commNum: 1 }).lean();

  let maxNum = 0;
  for (const o of orders) {
    const n = parseInt(o.commNum);
    if (!isNaN(n) && n > maxNum) maxNum = n;
  }

  return String(maxNum + 1).padStart(COMM_NUM_LENGTH, "0");
}
