// server/api/orders/[id].put.js
import Order from "~~/server/models/Order";
import Client from "~~/server/models/Client";

export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, "id");

  console.log("🔵 ========== API PUT /api/orders/" + orderId + " ==========");

  try {
    const body = await readBody(event);

    console.log("📥 Body ricevuto:", JSON.stringify(body, null, 2));
    console.log("📦 body.items:", body.items);
    console.log("📊 body.items.length:", body.items?.length);

    const order = await Order.findById(orderId);

    if (!order) {
      throw createError({
        statusCode: 404,
        message: "Ordine non trovato",
      });
    }

    if (body.commNum && body.commNum !== order.commNum) {
      const n = parseInt(body.commNum);
      const normalized = isNaN(n) ? body.commNum : String(n).padStart(8, "0");
      const regex = new RegExp(`^0*${n}$`);
      const existing = await Order.findOne({
        commNum: { $regex: regex },
        _id: { $ne: orderId },
        deletedAt: null,
      }).lean();
      if (existing) {
        throw createError({
          statusCode: 409,
          message: `La commissione ${normalized} esiste già`,
        });
      }
      order.commNum = normalized;
    }

    console.log("📋 Ordine PRIMA delle modifiche:");
    console.log("  - items.length:", order.items.length);
    if (order.items.length > 0) {
      console.log("  - items[0]:", JSON.stringify(order.items[0], null, 2));
    }

    // Aggiorna campi dati ordine
    if (body.orderData) {
      console.log("✏️ Aggiorno orderData");
      order.date = body.orderData.date || order.date;
      order.dueDate = body.orderData.dueDate;
      order.agentId = body.orderData.agentId;
      order.status = body.orderData.status ?? order.status;
    }

    // Aggiorna cliente
    if (body.client && body.client._id) {
      console.log("✏️ Aggiorno cliente:", body.client._id);
      order.clientId = body.client._id;

      await Client.findByIdAndUpdate(body.client._id, {
        vip: body.client.vip ?? false,
      });
    }

    // Aggiorna spedizioni (filtra righe vuote)
    if (body.shipments) {
      console.log("✏️ Aggiorno shipments:", body.shipments.length, "totali");
      order.shipments = body.shipments.filter((s) => s.date || s.courier);
      console.log("   Salvate:", order.shipments.length);
    }

    // Aggiorna note (filtra righe vuote)
    if (body.notes) {
      console.log("✏️ Aggiorno notes:", body.notes.length, "totali");
      order.notes = body.notes.filter((n) => n.text);
      console.log("   Salvate:", order.notes.length);
    }

    // ✅ Aggiorna articoli
    if (body.items) {
      console.log("✏️ Aggiorno items:", body.items.length, "totali");
      order.items = body.items.map((item, idx) => {
        const mapped = {
          productId: item.productId || null,
          code: item.code || "",
          description: item.description || "",
          quantity: item.quantity || 0,
          ready: item.ready || false,
          invoiced: item.invoiced || 0,
          ordered: item.ordered || false,
          note: item.note || "",
        };
        console.log(`   Item[${idx}]:`, JSON.stringify(mapped, null, 2));
        return mapped;
      });
    }

    // Aggiorna dati finanziari
    if (body.financial) {
      console.log("✏️ Aggiorno financial");
      order.ca = body.financial.ca || 0;
      order.rd = body.financial.rd || 0;
      order.ric = body.financial.ric || 0;
      order.balance = body.financial.balance || 0;
      order.pay = body.financial.pay || 0;
    }

    console.log("💾 Salvo ordine nel database...");
    await order.save();
    console.log("✅ Ordine salvato con successo");

    // ✅ POPULATE l'ordine prima di restituirlo
    const populatedOrder = await Order.findById(orderId)
      .populate(
        "clientId",
        "firstname lastname company address cap city region state tel fax email piva vip",
      )
      .populate("agentId", "firstname lastname")
      .populate("items.productId", "code name details") // ✅ POPULATE items.productId
      .lean();

    console.log("📋 Ordine DOPO populate:");
    console.log("  - items.length:", populatedOrder.items.length);
    if (populatedOrder.items.length > 0) {
      console.log(
        "  - items[0]:",
        JSON.stringify(populatedOrder.items[0], null, 2),
      );
    }

    console.log("🔵 ========== FINE API PUT ==========");

    return {
      success: true,
      order: populatedOrder, // ✅ Restituisci l'ordine popolato
      message: "Ordine aggiornato con successo",
    };
  } catch (error) {
    console.error("❌ ERRORE API update order:", error);
    console.error("Stack:", error.stack);

    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      message: "Errore nell'aggiornamento dell'ordine",
      data: error.message,
    });
  }
});
