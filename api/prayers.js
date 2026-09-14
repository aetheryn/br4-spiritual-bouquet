import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_PRAYERS_PER_SUBMISSION = 20;
const CATEGORY_FIELDS = ["mass", "adoration", "rosary", "fasting"];

async function checkRateLimit(ip) {
  const key = `ratelimit:${ip}`;
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }
  return count <= RATE_LIMIT_MAX_REQUESTS;
}

function validatePayload(body) {
  const fields = {};
  let total = 0;

  for (const field of CATEGORY_FIELDS) {
    const value = body[field];
    if (value === undefined) {
      fields[field] = 0;
      continue;
    }
    if (!Number.isInteger(value) || value < 0) {
      return { error: `${field} must be a non-negative integer` };
    }
    fields[field] = value;
    total += value;
  }

  if (total === 0) {
    return { error: "Submission must include at least one prayer" };
  }
  if (total > MAX_PRAYERS_PER_SUBMISSION) {
    return {
      error: `Submission exceeds the maximum of ${MAX_PRAYERS_PER_SUBMISSION} prayers`,
    };
  }

  return { fields };
}

async function handleGet(req, res) {
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

async function handlePost(req, res) {
  if (req.body?.website) {
    return res.status(200).json({ ok: true });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const withinLimit = await checkRateLimit(ip);
  if (!withinLimit) {
    return res
      .status(429)
      .json({ error: "Too many submissions, please try again later" });
  }

  const { error, fields } = validatePayload(req.body ?? {});
  if (error) {
    return res.status(400).json({ error });
  }

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      },
    );

    if (!response.ok) {
      throw new Error(`Airtable responded ${response.status}`);
    }

    const record = await response.json();

    return res.status(201).json({
      id: record.id,
      timestamp: record.createdTime,
      ...fields,
    });
  } catch (err) {
    console.error("Failed to submit prayer:", err);
    return res.status(500).json({ error: "Failed to submit prayer" });
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "POST") return handlePost(req, res);
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
