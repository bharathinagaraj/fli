const { Category, Product } = require("../models");

// GET /api/categories
exports.getCategories = async (_req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parentId: null },
      include: [{ model: Category, as: "subcategories" }],
      order: [["name", "ASC"]],
    });

    const withCounts = await Promise.all(
      categories.map(async (category) => {
        const subcategories = await Promise.all(
          (category.subcategories || []).map(async (subcategory) => ({
            ...subcategory.toJSON(),
            productCount: await Product.count({ where: { categoryId: subcategory.id, isActive: true } }),
          }))
        );

        return {
          ...category.toJSON(),
          subcategories,
          productCount: await Product.count({ where: { categoryId: category.id, isActive: true } }),
        };
      })
    );

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Category, as: "subcategories" }],
    });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/categories/:id/products
exports.getCategoryProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { categoryId: req.params.id, isActive: true },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/categories (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, image, parentId } = req.body;
    const category = await Category.create({ name, slug, image, parentId });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/categories/:id (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });

    await category.update(req.body);
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/categories/:id (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });

    await category.destroy();
    res.json({ message: "Category deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};