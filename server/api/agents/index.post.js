import Agent from "~~/server/models/Agent";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.lastname && !body.firstname) {
      throw createError({
        statusCode: 400,
        message: "Cognome o Nome obbligatori",
      });
    }

    const existing = await Agent.findOne({
      firstname: (body.firstname || "").trim(),
      lastname: (body.lastname || "").trim(),
      deleted: { $ne: true },
    });
    if (existing) {
      throw createError({
        statusCode: 409,
        message: "Esiste già un agente con questo nome e cognome",
      });
    }

    const agent = await Agent.create({
      firstname: body.firstname?.trim() || "",
      lastname: body.lastname?.trim() || "",
    });

    return { success: true, agent, message: "Agente creato con successo" };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Errore API create agent:", error);
    throw createError({
      statusCode: 500,
      message: "Errore nella creazione dell'agente",
      data: error.message,
    });
  }
});
