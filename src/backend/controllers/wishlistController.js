const { Wishlist, Product } = require("../models");

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { customerId: req.user.id },
      include: [{ model: Product }],
      order: [["createdAt", "DESC"]],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const [item, created] = await Wishlist.findOrCreate({
      where: { customerId: req.user.id, productId },
    });

    if (!created) {
      return res.status(409).json({ message: "Product is already in your wishlist." });
    }
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
  try {
    const deleted = await Wishlist.destroy({
      where: { customerId: req.user.id, productId: req.params.productId },
    });
    if (!deleted) return res.status(404).json({ message: "Item not found in wishlist." });

    res.json({ message: "Removed from wishlist." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/wishlist
exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({ where: { customerId: req.user.id } });
    res.json({ message: "Wishlist cleared." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};