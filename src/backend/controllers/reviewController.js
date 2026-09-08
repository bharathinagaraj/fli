const { Review, Product, OrderItem, Order, Customer } = require("../models");

// GET /api/products/:productId/reviews  (also usable standalone)
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [{ model: Customer, attributes: ["id", "name", "avatar"] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products/:productId/reviews
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const existing = await Review.findOne({
      where: { productId, customerId: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ message: "You've already reviewed this product." });
    }

    // Verify purchase (optional but nice touch)
    const purchased = await OrderItem.findOne({
      where: { productId },
      include: [{ model: Order, where: { customerId: req.user.id, status: "Delivered" } }],
    });

    const review = await Review.create({
      productId,
      customerId: req.user.id,
      rating,
      comment,
      isVerifiedPurchase: !!purchased,
    });

    // Recalculate product's aggregate rating
    const allReviews = await Review.findAll({ where: { productId } });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.update(
      { rating: avgRating.toFixed(1), reviewCount: allReviews.length },
      { where: { id: productId } }
    );

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!review) return res.status(404).json({ message: "Review not found." });

    await review.update(req.body);
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!review) return res.status(404).json({ message: "Review not found." });

    const productId = review.productId;
    await review.destroy();

    const remaining = await Review.findAll({ where: { productId } });
    const avgRating = remaining.length
      ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
      : 0;

    await Product.update(
      { rating: avgRating.toFixed(1), reviewCount: remaining.length },
      { where: { id: productId } }
    );

    res.json({ message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};