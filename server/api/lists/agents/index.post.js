// server/api/lists/agents/index.post.js
import Agent from "~~/server/models/Agent";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.lastname?.trim() && !body.firstname?.trim()) {
      throw createError({
        statusCode: 422,
        message: "Almeno cognome o nome sono obbligatori",
      });
    }

    const agent = await Agent.create({
      firstname: body.firstname?.trim() || "",
      lastname: body.lastname?.trim() || "",
    });

    return { success: true, item: agent };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Errore POST agente:", error);
    throw createError({
      statusCode: 500,
      message: "Errore nella creazione dell'agente",
    });
  }
});
