const { Op } = require("sequelize");
const { Product, Category, Review, Customer } = require("../models");
const { runProductStatusCheck } = require("../services/productStatusService");
const { getProductImages } = require("../utils/productImages");

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const isRealUrl = (u) =>
  typeof u === "string" && u.startsWith("http") && !u.includes("undefined");

async function getCategorySlug(categoryId) {
  if (!categoryId) return null;
  const cat = await Category.findByPk(categoryId);
  return cat?.slug || null;
}

// Returns a category-matched, impressive image set when the admin does not
// supply (valid) images — so a newly created product never shows blank.
async function ensureImages(payload) {
  const images = Array.isArray(payload.images) ? payload.images : [];
  if (images.some(isRealUrl)) return payload;

  const categorySlug = await getCategorySlug(payload.categoryId);
  const name = payload.name || "Product";
  return {
    ...payload,
    slug: payload.slug || slugify(name),
    images: getProductImages(name, payload.slug || slugify(name), categorySlug || "generic"),
  };
}

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      brands,
      minRating,
      page = 1,
      limit = 12,
      sort = "createdAt",
      order = "DESC",
    } = req.query;

    const where = { isActive: true };

    if (category) {
      const cat = await Category.findOne({
        where: { [Op.or]: [{ slug: category }, { id: category }] },
      });
      if (cat) {
        const childIds = await Category.findAll({
          where: { parentId: cat.id },
          attributes: ["id"],
        });
        const ids = [cat.id, ...childIds.map((c) => c.id)];
        where.categoryId = { [Op.in]: ids };
      }
    }
    if (search) {
      const cats = await Category.findAll({
        where: { name: { [Op.like]: `%${search}%` } },
        attributes: ["id"],
      });
      const catIds = cats.map((c) => c.id);
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        ...(catIds.length ? [{ categoryId: { [Op.in]: catIds } }] : []),
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }
    if (brands) {
      const brandList = Array.isArray(brands) ? brands : brands.split(",");
      where.brand = { [Op.in]: brandList };
    }
    if (minRating) where.rating = { [Op.gte]: minRating };

    const offset = (page - 1) * limit;

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ["id", "name", "slug"] }],
      limit: Number(limit),
      offset: Number(offset),
      order: [[sort, order]],
      distinct: true,
    });

    res.json({
      items: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/featured
exports.getFeaturedProducts = async (_req, res) => {
  try {
    const products = await Product.findAll({
      where: { isActive: true },
      order: [["rating", "DESC"]],
      limit: 8,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/status (admin only)
// Scans all products, auto-fixes data-integrity issues and returns a status report.
exports.getProductStatus = async (_req, res) => {
  try {
    const report = await runProductStatusCheck({ persistFixes: true });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }],
    });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id/reviews
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.id },
      include: [{ model: Customer, attributes: ["id", "name", "avatar"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products (admin only)
// Auto-generates a category-matched image set when no valid images are given,
// so every admin-created product ships with a real, impressive photo.
exports.createProduct = async (req, res) => {
  try {
    const payload = await ensureImages(req.body);
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/products/:id (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const payload = await ensureImages({ ...req.body, images: req.body.images ?? product.images });
    await product.update(payload);
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/products/:id (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    await product.update({ isActive: false }); // soft delete
    res.json({ message: "Product removed." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};