// server/api/lists/[type]/[id].put.js

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
    const body = await readBody(event);

    if (!body.label || !body.label.trim()) {
      throw createError({
        statusCode: 422,
        message: "Il campo label è obbligatorio",
      });
    }

    const modelModule = await MODEL_MAP[type]();
    const Model = modelModule.default;

    const item = await Model.findByIdAndUpdate(
      id,
      {
        label: body.label.trim(),
        selectable: body.selectable !== false,
      },
      { new: true },
    ).lean();

    if (!item) {
      throw createError({ statusCode: 404, message: "Elemento non trovato" });
    }

    return { success: true, item };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error(`Errore PUT lista ${type}:`, error);
    throw createError({
      statusCode: 500,
      message: `Errore nell'aggiornamento dell'elemento`,
    });
  }
});
