export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

  try {
    const records = [];
    let offset;

    do {
      const url = new URL(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      );
      if (offset) url.searchParams.set("offset", offset);

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
      });

      if (!response.ok) {
        throw new Error(`Airtable responded ${response.status}`);
      }

      const data = await response.json();
      records.push(...data.records);
      offset = data.offset;
    } while (offset);

    const prayers = records.map((record) => ({
      id: record.id,
      timestamp: record.createdTime,
      mass: record.fields.mass ?? 0,
      adoration: record.fields.adoration ?? 0,
      rosary: record.fields.rosary ?? 0,
      fasting: record.fields.fasting ?? 0,
    }));

    return res.status(200).json({ prayers });
  } catch (err) {
    console.error("Failed to fetch prayers:", err);
    return res.status(500).json({ error: "Failed to fetch prayers" });
  }
}
