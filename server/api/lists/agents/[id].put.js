// server/api/lists/agents/[id].put.js
import Agent from "~~/server/models/Agent";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  try {
    const body = await readBody(event);

    if (!body.lastname?.trim() && !body.firstname?.trim()) {
      throw createError({
        statusCode: 422,
        message: "Almeno cognome o nome sono obbligatori",
      });
    }

    const agent = await Agent.findByIdAndUpdate(
      id,
      {
        firstname: body.firstname?.trim() || "",
        lastname: body.lastname?.trim() || "",
        deleted: body.deleted || false,
      },
      { new: true },
    ).lean();

    if (!agent)
      throw createError({ statusCode: 404, message: "Agente non trovato" });

    return { success: true, item: agent };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Errore PUT agente:", error);
    throw createError({
      statusCode: 500,
      message: "Errore nell'aggiornamento dell'agente",
    });
  }
});
