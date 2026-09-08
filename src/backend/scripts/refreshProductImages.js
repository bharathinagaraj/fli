/**
 * Refreshes every product's images with the current category-matched,
 * high-quality photo generator (getProductImages). Safe to re-run — it only
 * touches the `images` column and never deletes or re-creates products.
 *
 * Run:  node src/backend/scripts/refreshProductImages.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const { sequelize, Product, Category } = require("../models");
const { getProductImages } = require("../utils/productImages");

(async () => {
  try {
    await sequelize.authenticate();
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ["id", "slug"] }],
    });

    let updated = 0;
    for (const product of products) {
      const categorySlug = product.Category?.slug || "unknown";
      const images = getProductImages(product.name, product.slug, categorySlug);
      if (JSON.stringify(product.images) !== JSON.stringify(images)) {
        product.images = images;
        await product.save();
        updated += 1;
      }
    }

    console.log(`✅ Refreshed images for ${updated} of ${products.length} products.`);
    const sample = products.slice(0, 3);
    for (const p of sample) {
      console.log(`  ${p.name}: ${p.images?.[0]}`);
    }
  } catch (err) {
    console.error("❌ Failed:", err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
