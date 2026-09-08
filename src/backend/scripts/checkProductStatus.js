// Manual one-shot product status check.
// Usage: node src/backend/scripts/checkProductStatus.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { sequelize } = require("../config/database");
require("../models");
const { runProductStatusCheck } = require("../services/productStatusService");

(async () => {
  await sequelize.authenticate();
  const report = await runProductStatusCheck({ persistFixes: true });
  console.log(`Products: ${report.total}`);
  console.log(`Status   : ${JSON.stringify(report.counts)}`);
  console.log(`Advanced : ${report.statusUpdated}`);
  console.log(`Auto-fixed: ${report.autoFixed}`);
  if (report.problems.length) {
    console.log("Problems:");
    for (const p of report.problems) {
      console.log(`  - ${p.name} [${p.status}] ${p.reason}`);
    }
  } else {
    console.log("Problems: none");
  }
  await sequelize.close();
  process.exit(0);
})().catch((err) => {
  console.error("Check failed:", err.message);
  process.exit(1);
});
