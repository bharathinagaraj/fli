const { Op } = require("sequelize");
const {
  sequelize,
  Order,
  OrderItem,
  CartItem,
  Cart,
  Product,
  Address,
  Return,
  Customer,
} = require("../models");

// GET /api/orders/admin/all  (admin only)
exports.getAdminOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status && status !== "All") where.status = status;

    const orders = await Order.findAll({
      where,
      include: [
        { model: OrderItem },
        { model: Customer, attributes: ["id", "name", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders
exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { customerId: req.user.id };
    if (status && status !== "All") where.status = status;

    const orders = await Order.findAll({
      where,
      include: [{ model: OrderItem }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/my/summary  — how many products the logged-in customer bought
exports.getMySummary = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id, status: { [Op.ne]: "Cancelled" } },
      include: [{ model: OrderItem }],
      order: [["createdAt", "DESC"]],
    });

    let totalOrders = 0;
    let totalItemsBought = 0;
    let totalSpent = 0;
    let lastPurchaseAt = null;
    const productMap = {};

    for (const order of orders) {
      totalOrders += 1;
      totalSpent += Number(order.total || 0);
      const placedAt = new Date(order.createdAt);
      if (!lastPurchaseAt || placedAt > lastPurchaseAt) lastPurchaseAt = placedAt;

      for (const item of order.OrderItems || []) {
        const qty = Number(item.quantity || 0);
        totalItemsBought += qty;
        if (!productMap[item.name]) {
          productMap[item.name] = {
            name: item.name,
            image: item.image,
            variant: item.variant,
            quantity: 0,
            revenue: 0,
          };
        }
        productMap[item.name].quantity += qty;
        productMap[item.name].revenue += Number(item.price || 0) * qty;
      }
    }

    res.json({
      totalOrders,
      totalItemsBought,
      totalSpent: Number(totalSpent.toFixed(2)),
      lastPurchaseAt,
      productsBought: Object.values(productMap).sort((a, b) => b.quantity - a.quantity),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, customerId: req.user.id },
      include: [
        { model: OrderItem, include: [{ model: Product }] },
        { model: Return },
      ],
    });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders  (checkout)
exports.placeOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { addressId, paymentMethod, paymentDetails } = req.body;

    const cart = await Cart.findOne({ where: { customerId: req.user.id }, transaction: t });
    const cartItems = await CartItem.findAll({
      where: { cartId: cart?.id },
      include: [{ model: Product }],
      transaction: t,
    });

    if (!cartItems.length) {
      await t.rollback();
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const address = await Address.findOne({
      where: { id: addressId, customerId: req.user.id },
      transaction: t,
    });
    if (!address) {
      await t.rollback();
      return res.status(400).json({ message: "Shipping address not found." });
    }

    // Verify stock and compute totals
    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.priceAtAdd) * i.quantity, 0);
    const shippingCost = subtotal > 500 ? 0 : 50;
    const total = subtotal + shippingCost;

    for (const item of cartItems) {
      if (item.Product.stockQuantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `${item.Product.name} is out of stock.` });
      }
    }

    const isCod = String(paymentMethod || "").toLowerCase().includes("cash");

    const order = await Order.create(
      {
        customerId: req.user.id,
        subtotal,
        shippingCost,
        total,
        shippingAddress: address.toJSON(),
        paymentMethod,
        paymentDetails: paymentDetails || null,
        // UPI / card are captured at checkout; COD stays pending until delivery.
        paymentStatus: isCod ? "pending" : "paid",
      },
      { transaction: t }
    );

    for (const item of cartItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          name: item.Product.name,
          image: item.Product.images?.[0],
          variant: item.variant,
          price: item.priceAtAdd,
          quantity: item.quantity,
        },
        { transaction: t }
      );

      await item.Product.decrement("stockQuantity", { by: item.quantity, transaction: t });
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem }] });
    res.status(201).json(fullOrder);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ message: `Order already ${order.status.toLowerCase()}.` });
    }

    await order.update({ status: "Cancelled", cancelledAt: new Date() });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/orders/:id/return
// Customer-side return / exchange request. Damaged or wrong-item issues are
// auto-approved; a refund marks the order payment as refunded, an exchange
// ships a replacement of the same product.
exports.requestReturn = async (req, res) => {
  try {
    const { itemId, reason, issueType, returnType } = req.body;

    const order = await Order.findOne({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.status !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Returns are available for delivered orders only." });
    }

    const item = await OrderItem.findOne({
      where: { id: itemId, orderId: order.id },
    });
    if (!item) return res.status(404).json({ message: "Item not found in this order." });

    const existing = await Return.findOne({
      where: { itemId, status: { [Op.ne]: "Rejected" } },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "A return request already exists for this item." });
    }

    const autoApprove = ["damaged", "wrong_item"].includes(issueType);
    const refundAmount = Number(item.price) * item.quantity;

    const returnReq = await Return.create({
      orderId: order.id,
      customerId: req.user.id,
      itemId: item.id,
      productId: item.productId,
      reason,
      issueType,
      returnType,
      status: autoApprove ? "Approved" : "Requested",
      refundAmount: returnType === "refund" ? refundAmount : null,
    });

    if (autoApprove && returnType === "refund") {
      await order.update({ paymentStatus: "refunded" });
    }

    res.status(201).json(returnReq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const updates = { status };
    if (status === "Shipped") updates.shippedAt = new Date();
    if (status === "Delivered") updates.deliveredAt = new Date();

    await order.update(updates);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};