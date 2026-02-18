// server/api/lists/[type]/index.post.js

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
    const body = await readBody(event);

    if (!body.label || !body.label.trim()) {
      throw createError({
        statusCode: 422,
        message: "Il campo label è obbligatorio",
      });
    }

    if (!body.code || !body.code.trim()) {
      throw createError({
        statusCode: 422,
        message: "Il campo code è obbligatorio",
      });
    }

    const modelModule = await MODEL_MAP[type]();
    const Model = modelModule.default;

    // Verifica duplicati
    const existing = await Model.findOne({
      code: body.code.trim().toUpperCase(),
    });
    if (existing) {
      throw createError({
        statusCode: 409,
        message: `Esiste già un elemento con codice ${body.code}`,
      });
    }

    const item = await Model.create({
      code: body.code.trim().toUpperCase(),
      label: body.label.trim(),
      selectable: body.selectable !== false,
    });

    return { success: true, item };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error(`Errore POST lista ${type}:`, error);
    throw createError({
      statusCode: 500,
      message: `Errore nella creazione dell'elemento`,
    });
  }
});
