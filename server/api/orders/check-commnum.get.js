// server/api/orders/check-commnum.get.js
// Verifica se un numero commissione esiste già, indipendentemente dal formato
// Confronta per valore numerico: "781", "00781", "00000781" sono equivalenti
import Order from "~~/server/models/Order";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { commNum } = query;

  if (!commNum) {
    throw createError({ statusCode: 400, message: "commNum è obbligatorio" });
  }

  const n = parseInt(commNum);
  if (isNaN(n) || n <= 0) {
    throw createError({
      statusCode: 400,
      message: "commNum deve essere un numero valido",
    });
  }

  try {
    // Cerca tutti gli ordini e confronta per valore numerico
    // Usiamo $where oppure una regex che matcha tutte le varianti con zeri
    // Soluzione più semplice e performante: regex che matcha il numero con qualsiasi numero di zeri davanti
    const regex = new RegExp(`^0*${n}$`);
    const existing = await Order.findOne({
      commNum: { $regex: regex },
      deletedAt: null,
    })
      .select("commNum")
      .lean();

    return {
      success: true,
      exists: !!existing,
      commNum: existing?.commNum || null,
    };
  } catch (error) {
    console.error("Errore check-commnum:", error);
    throw createError({ statusCode: 500, message: "Errore nella verifica" });
  }
});
