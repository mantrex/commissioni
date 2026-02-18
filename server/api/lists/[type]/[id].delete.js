// server/api/lists/[type]/[id].delete.js
// Soft delete: imposta selectable = false invece di eliminare davvero

const ALLOWED_TYPES = [
  "couriers",
  "payments",
  "shipments",
  "insurances",
  "statuses",
];

const MODEL_MAP = {
  couriers: () => import("~~/server/models/Courier"),
  payments: () => import("~~/server/models/Payment"),
  shipments: () => import("~~/server/models/Shipment"),
  insurances: () => import("~~/server/models/Insurance"),
  statuses: () => import("~~/server/models/Status"),
};

export default defineEventHandler(async (event) => {
  const type = getRouterParam(event, "type");
  const id = getRouterParam(event, "id");

  if (!ALLOWED_TYPES.includes(type)) {
    throw createError({
      statusCode: 400,
      message: `Tipo lista non valido: ${type}`,
    });
  }

  try {
    const modelModule = await MODEL_MAP[type]();
    const Model = modelModule.default;

    const item = await Model.findByIdAndUpdate(
      id,
      { selectable: false },
      { new: true },
    ).lean();

    if (!item) {
      throw createError({ statusCode: 404, message: "Elemento non trovato" });
    }

    return {
      success: true,
      item,
      message: "Elemento disattivato (soft delete)",
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error(`Errore DELETE lista ${type}:`, error);
    throw createError({
      statusCode: 500,
      message: `Errore nell'eliminazione dell'elemento`,
    });
  }
});
