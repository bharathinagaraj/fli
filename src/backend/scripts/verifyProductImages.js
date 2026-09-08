require("dotenv").config({ path: "src/backend/.env" });
const mysql = require("mysql2/promise");
const https = require("https");

function checkUrl(url, timeoutMs = 12000) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(false));
  });
}

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [rows] = await c.query("SELECT name, images FROM products");
  let bad = [];
  for (const r of rows) {
    if (!Array.isArray(r.images) || r.images.length === 0) bad.push(r.name + " -> no images");
    r.images.forEach((u) => {
      if (String(u).includes("undefined") || !u.startsWith("http")) bad.push(r.name + " -> " + u);
    });
  }
  console.log("products checked:", rows.length, "| problems:", bad.length);
  bad.forEach((b) => console.log("  !", b));

  // Sample 40 distinct image URLs and verify they load
  const sample = [];
  const seen = new Set();
  for (const r of rows) {
    for (const u of r.images) {
      if (!seen.has(u)) {
        seen.add(u);
        sample.push(u);
      }
    }
  }
  const pick = [];
  for (let i = 0; i < sample.length; i += Math.max(1, Math.floor(sample.length / 40))) pick.push(sample[i]);
  let ok = 0, fail = 0, fails = [];
  for (const u of pick) {
    const good = await checkUrl(u);
    if (good) ok++;
    else { fail++; fails.push(u); }
  }
  console.log(`sampled ${pick.length} URLs -> ${ok} ok, ${fail} fail`);
  fails.forEach((f) => console.log("  FAIL", f));
  await c.end();
})().catch((e) => {
  console.log("ERR", e.message);
  process.exit(1);
});
