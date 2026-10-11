
const { neon } = require("@neondatabase/serverless");

const allowedOrigin = "https://northwise.neocities.org";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(405).json({
      error: "Use POST to record a visit."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const sql = neon(process.env.DATABASE_URL);
    await sql`INSERT INTO nw_visits DEFAULT VALUES`;

    const result = await sql`
      SELECT COUNT(*)::int AS total FROM nw_visits
    `;

    return res.status(200).json({
      success: true,
      total: result[0].total
    });
  } catch (error) {
    console.error("Visit API error:", error.message);
    return res.status(500).json({ error: "Could not record visit" });
  }
};
