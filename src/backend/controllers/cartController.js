const { Cart, CartItem, Product } = require("../models");

async function getOrCreateCart(customerId) {
  let cart = await Cart.findOne({ where: { customerId } });
  if (!cart) cart = await Cart.create({ customerId });
  return cart;
}

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product }],
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart/items
exports.addItem = async (req, res) => {
  try {
    const { productId, quantity = 1, variant = null } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found." });
    if (product.stockQuantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available." });
    }

    const cart = await getOrCreateCart(req.user.id);

    const [item, created] = await CartItem.findOrCreate({
      where: { cartId: cart.id, productId, variant },
      defaults: { quantity, priceAtAdd: product.price },
    });

    if (!created) {
      item.quantity += quantity;
      await item.save();
    }

    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product }],
    });
    res.status(201).json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/cart/items/:id
exports.updateItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1." });
    }

    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found." });

    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/items/:id
exports.removeItem = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Cart item not found." });

    await item.destroy();
    res.json({ message: "Item removed from cart." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ message: "Cart cleared." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart/promo
exports.applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    const VALID_CODES = { SAVE10: 0.1, WELCOME: 0.05 };
    const discount = VALID_CODES[code?.toUpperCase()];

    if (!discount) {
      return res.status(400).json({ message: "Invalid promo code." });
    }
    res.json({ code, discount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};