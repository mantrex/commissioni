// server/api/lists/[type]/index.get.js
// Restituisce TUTTI gli elementi di una lista (inclusi i "cancellati" = selectable:false)

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

  if (!ALLOWED_TYPES.includes(type)) {
    throw createError({
      statusCode: 400,
      message: `Tipo lista non valido: ${type}`,
    });
  }

  try {
    const modelModule = await MODEL_MAP[type]();
    const Model = modelModule.default;

    const items = await Model.find()
      .select("code label selectable")
      .sort({ label: 1 })
      .lean();

    return { success: true, items };
  } catch (error) {
    console.error(`Errore GET lista ${type}:`, error);
    throw createError({
      statusCode: 500,
      message: `Errore nel recupero della lista ${type}`,
    });
  }
});
