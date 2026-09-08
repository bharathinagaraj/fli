/**
 * One-off utility: validates every candidate Unsplash photo ID in
 * productImages.js and writes validatedImageIds.json containing only IDs
 * that resolve successfully. Also tops up any category with fewer than 3
 * valid IDs from the validated generic pool.
 *
 * Run:  node src/backend/scripts/validateProductImages.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const https = require("https");

const {
  CATEGORY_IMAGE_IDS,
  GENERIC_IMAGE_IDS,
} = require("../utils/productImages");

const OUTPUT = path.join(__dirname, "..", "utils", "validatedImageIds.json");

const CDN = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=100&q=10`;

function checkUrl(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(false));
  });
}

async function validateBatch(ids, concurrency = 12) {
  const valid = new Set();
  const invalid = [];
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < ids.length) {
      const idx = i++;
      const id = ids[idx];
      const ok = await checkUrl(CDN(id));
      if (ok) valid.add(id);
      else invalid.push(id);
    }
  });
  await Promise.all(workers);
  return { valid: [...valid], invalid };
}

(async () => {
  const allIds = [...new Set(Object.values(CATEGORY_IMAGE_IDS).flat().concat(GENERIC_IMAGE_IDS))];
  console.log(`Checking ${allIds.length} unique image IDs...`);

  const { valid: validIds, invalid } = await validateBatch(allIds);
  console.log(`✅ ${validIds.length} valid, ❌ ${invalid.length} invalid`);

  const validSet = new Set(validIds);
  const categoryIds = {};
  for (const [cat, ids] of Object.entries(CATEGORY_IMAGE_IDS)) {
    categoryIds[cat] = ids.filter((id) => validSet.has(id));
  }

  // Top up short categories from the valid generic pool so every category
  // has at least 4 working images.
  const genericValid = (GENERIC_IMAGE_IDS.filter((id) => validSet.has(id))).concat(validIds);
  let topped = 0;
  for (const cat of Object.keys(categoryIds)) {
    const target = 4;
    while (categoryIds[cat].length < target && genericValid.length) {
      const id = genericValid[(hash(cat) + categoryIds[cat].length) % genericValid.length];
      if (!categoryIds[cat].includes(id)) categoryIds[cat].push(id);
      else break;
      topped++;
    }
  }

  const payload = { checkedAt: new Date().toISOString(), categoryIds, genericIds: genericValid.slice(0, 8) };
  fs.writeFileSync(OUTPUT, JSON.stringify(payload, null, 2));
  console.log(`\nWrote ${OUTPUT}`);
  for (const [cat, ids] of Object.entries(categoryIds)) {
    console.log(`  ${cat.padEnd(22)} ${ids.length} valid images`);
  }
})();

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return Math.abs(h >>> 0);
}
