// server/api/lists/agents/index.get.js
import Agent from "~~/server/models/Agent";

export default defineEventHandler(async (event) => {
  try {
    const agents = await Agent.find()
      .select("firstname lastname deleted")
      .sort({ lastname: 1, firstname: 1 })
      .lean();

    return { success: true, items: agents };
  } catch (error) {
    console.error("Errore GET agenti:", error);
    throw createError({
      statusCode: 500,
      message: "Errore nel recupero degli agenti",
    });
  }
});
