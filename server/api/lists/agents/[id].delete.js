// server/api/lists/agents/[id].delete.js
// Soft delete: imposta deleted = true
import Agent from "~~/server/models/Agent";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  try {
    const agent = await Agent.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true },
    ).lean();

    if (!agent)
      throw createError({ statusCode: 404, message: "Agente non trovato" });

    return {
      success: true,
      item: agent,
      message: "Agente disattivato (soft delete)",
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.error("Errore DELETE agente:", error);
    throw createError({
      statusCode: 500,
      message: "Errore nella disattivazione dell'agente",
    });
  }
});
