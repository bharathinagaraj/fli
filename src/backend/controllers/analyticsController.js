const { Op } = require("sequelize");
const { sequelize, LoginLog, GuestVisit, SignupLog, Customer, Order, OrderItem, Product, Category } = require("../models");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfWeek = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/analytics/overview  (admin)
exports.getOverview = async (_req, res) => {
  try {
    const today = startOfToday();
    const week = startOfWeek();

    const [totalLogins, todayLogins, uniqueLoginUsers, uniqueLoginUsersToday, totalSignups, todaySignups] =
      await Promise.all([
        LoginLog.count(),
        LoginLog.count({ where: { loginAt: { [Op.gte]: today } } }),
        LoginLog.count({ distinct: true, col: "customerId" }),
        LoginLog.count({ distinct: true, col: "customerId", where: { loginAt: { [Op.gte]: today } } }),
        SignupLog.count(),
        SignupLog.count({ where: { signedUpAt: { [Op.gte]: today } } }),
      ]);

    const [totalGuests, todayGuests, uniqueGuestSessions, uniqueGuestSessionsToday] =
      await Promise.all([
        GuestVisit.count(),
        GuestVisit.count({ where: { visitedAt: { [Op.gte]: today } } }),
        GuestVisit.count({ distinct: true, col: "sessionId" }),
        GuestVisit.count({ distinct: true, col: "sessionId", where: { visitedAt: { [Op.gte]: today } } }),
      ]);

    const [totalCustomers, totalOrders, revenue, totalCategories, totalProducts, activeProducts, inactiveProducts] = await Promise.all([
      Customer.count(),
      Order.count({ where: { status: { [Op.ne]: "Cancelled" } } }),
      Order.sum("total", { where: { status: { [Op.ne]: "Cancelled" } } }),
      Category.count(),
      Product.count(),
      Product.count({ where: { isActive: true } }),
      Product.count({ where: { isActive: false } }),
    ]);

    const loginLastWeek = await LoginLog.count({ where: { loginAt: { [Op.gte]: week } } });
    const guestLastWeek = await GuestVisit.count({ where: { visitedAt: { [Op.gte]: week } } });

    res.json({
      logins: {
        total: totalLogins,
        today: todayLogins,
        thisWeek: loginLastWeek,
        uniqueUsers: uniqueLoginUsers,
        uniqueUsersToday: uniqueLoginUsersToday,
      },
      guests: {
        total: totalGuests,
        today: todayGuests,
        thisWeek: guestLastWeek,
        uniqueSessions: uniqueGuestSessions,
        uniqueSessionsToday: uniqueGuestSessionsToday,
      },
      signups: {
        total: totalSignups,
        today: todaySignups,
      },
      store: { totalCustomers, totalOrders, revenue: Number(revenue) || 0 },
      catalog: {
        totalCategories,
        totalProducts,
        activeProducts,
        inactiveProducts,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/signups  (admin)  ?from=&to=&limit=
exports.getSignupLogs = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from || to) where.signedUpAt = {};
    if (from) where.signedUpAt[Op.gte] = new Date(from);
    if (to) where.signedUpAt[Op.lte] = new Date(to);

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const logs = await SignupLog.findAll({
      where,
      include: [{ model: Customer, attributes: ["id", "name", "email"] }],
      order: [["signedUpAt", "DESC"]],
      limit,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/logins  (admin)  ?from=&to=&limit=
exports.getLoginLogs = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from || to) where.loginAt = {};
    if (from) where.loginAt[Op.gte] = new Date(from);
    if (to) where.loginAt[Op.lte] = new Date(to);

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const logs = await LoginLog.findAll({
      where,
      include: [{ model: Customer, attributes: ["id", "name", "email"] }],
      order: [["loginAt", "DESC"]],
      limit,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/guests  (admin)  ?from=&to=&limit=
exports.getGuestVisits = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from || to) where.visitedAt = {};
    if (from) where.visitedAt[Op.gte] = new Date(from);
    if (to) where.visitedAt[Op.lte] = new Date(to);

    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const visits = await GuestVisit.findAll({
      where,
      order: [["visitedAt", "DESC"]],
      limit,
    });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/guests/summary  (admin)
exports.getGuestActivity = async (req, res) => {
  try {
    const { from, to, limit = 100 } = req.query;
    const where = {};
    if (from || to) where.visitedAt = {};
    if (from) where.visitedAt[Op.gte] = new Date(from);
    if (to) where.visitedAt[Op.lte] = new Date(to);

    const visits = await GuestVisit.findAll({
      where,
      attributes: ["id", "sessionId", "ip", "userAgent", "page", "visitedAt"],
      order: [["visitedAt", "DESC"]],
      limit: Math.min(parseInt(limit, 10) || 100, 500),
    });

    const result = visits.map((visit) => ({
      ...visit.toJSON(),
      canPurchase: false,
      purchaseCount: 0,
      status: "guest-only-visit",
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/catalog/summary  (admin)
exports.getCatalogSummary = async (_req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ["id", "name", "slug", "image", "parentId"],
      order: [["name", "ASC"]],
    });

    const categoryDetails = await Promise.all(
      categories.map(async (category) => ({
        ...category.toJSON(),
        productCount: await Product.count({ where: { categoryId: category.id, isActive: true } }),
      }))
    );

    const totalProducts = await Product.count();
    const activeProducts = await Product.count({ where: { isActive: true } });
    const inactiveProducts = await Product.count({ where: { isActive: false } });

    res.json({
      totalCategories: categoryDetails.length,
      totalProducts,
      activeProducts,
      inactiveProducts,
      categories: categoryDetails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/sales  (admin)  — products bought by time/year
exports.getSales = async (_req, res) => {
  try {
    const orders = await Order.findAll({
      where: { status: { [Op.ne]: "Cancelled" } },
      attributes: ["id", "orderNumber", "total", "createdAt", "status"],
      include: [
        {
          model: OrderItem,
          attributes: ["productId", "name", "price", "quantity"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const byYear = {};
    const productMap = {};
    let totalItemsSold = 0;
    let totalRevenue = 0;

    for (const order of orders) {
      const year = new Date(order.createdAt).getFullYear();
      if (!byYear[year]) byYear[year] = { year, orders: 0, itemsSold: 0, revenue: 0 };

      byYear[year].orders += 1;
      byYear[year].revenue += Number(order.total || 0);
      totalRevenue += Number(order.total || 0);

      for (const item of order.OrderItems || []) {
        const qty = Number(item.quantity || 0);
        const amount = Number(item.price || 0) * qty;
        byYear[year].itemsSold += qty;
        totalItemsSold += qty;

        if (!productMap[item.name]) {
          productMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productMap[item.name].quantity += qty;
        productMap[item.name].revenue += amount;
      }
    }

    const years = Object.values(byYear).sort((a, b) => a.year - b.year);
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json({
      totalItemsSold,
      totalOrders: orders.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      byYear: years.map((y) => ({
        ...y,
        revenue: Number(y.revenue.toFixed(2)),
      })),
      topProducts: topProducts.map((p) => ({
        ...p,
        revenue: Number(p.revenue.toFixed(2)),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/logins/count  (admin)
exports.getLoginCount = async (_req, res) => {
  try {
    const today = startOfToday();
    const [total, todayCount, uniqueCustomers] = await Promise.all([
      LoginLog.count(),
      LoginLog.count({ where: { loginAt: { [Op.gte]: today } } }),
      LoginLog.count({ distinct: true, col: "customerId" }),
    ]);
    res.json({ total, today: todayCount, uniqueCustomers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/guests/count  (admin)
exports.getGuestCount = async (_req, res) => {
  try {
    const today = startOfToday();
    const [total, todayCount, uniqueSessions] = await Promise.all([
      GuestVisit.count(),
      GuestVisit.count({ where: { visitedAt: { [Op.gte]: today } } }),
      GuestVisit.count({ distinct: true, col: "sessionId" }),
    ]);
    res.json({ total, today: todayCount, uniqueSessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/customers/:id/summary  (admin)
exports.getCustomerPurchaseSummary = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "phone", "isActive", "createdAt"],
    });
    if (!customer) return res.status(404).json({ message: "Customer not found." });

    const orders = await Order.findAll({
      where: { customerId: customer.id },
      include: [{ model: OrderItem, include: [{ model: Product, attributes: ["id", "name", "price", "images"] }] }],
      order: [["createdAt", "DESC"]],
    });

    const purchasedProducts = [];
    let totalItemsBought = 0;
    let totalSpent = 0;

    for (const order of orders) {
      totalSpent += Number(order.total || 0);
      for (const item of order.OrderItems || []) {
        totalItemsBought += Number(item.quantity || 0);
        purchasedProducts.push({
          orderNumber: order.orderNumber,
          productId: item.productId,
          productName: item.name || item.Product?.name || "Unknown",
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
          total: Number(item.price || 0) * Number(item.quantity || 0),
          status: order.status,
          purchasedAt: order.createdAt,
        });
      }
    }

    res.json({
      customer,
      ordersCount: orders.length,
      totalItemsBought,
      totalSpent: Number(totalSpent.toFixed(2)),
      purchasedProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/customers  (admin)  — every customer with their purchase summary
exports.getCustomers = async (_req, res) => {
  try {
    const customers = await Customer.findAll({
      attributes: ["id", "name", "email", "phone", "isActive", "createdAt"],
      include: [
        {
          model: Order,
          attributes: ["id", "orderNumber", "total", "status", "createdAt"],
          include: [{ model: OrderItem, attributes: ["productId", "name", "price", "quantity"] }],
        },
        {
          model: LoginLog,
          attributes: ["id", "loginAt"],
          order: [["loginAt", "DESC"]],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const result = customers.map((c) => {
      const orders = c.Orders || [];
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
            productMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
          }
          productMap[item.name].quantity += qty;
          productMap[item.name].revenue += Number(item.price || 0) * qty;
        }
      }

      const loginLogs = c.LoginLogs || [];
      const lastLoginAt = loginLogs[0]?.loginAt || null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isActive: c.isActive,
        signedUpAt: c.createdAt,
        loginCount: loginLogs.length,
        lastLoginAt,
        totalOrders,
        totalItemsBought,
        totalSpent: Number(totalSpent.toFixed(2)),
        lastPurchaseAt,
        productsBought: Object.values(productMap).sort((a, b) => b.quantity - a.quantity),
        orders: orders.map((o) => ({
          orderNumber: o.orderNumber,
          status: o.status,
          total: Number(o.total || 0),
          createdAt: o.createdAt,
        })),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/analytics/daily  (admin)  ?days=30  — per-day login/guest/order series
exports.getDaily = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const signupRows = await SignupLog.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("signed_up_at")), "day"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { signedUpAt: { [Op.gte]: since } },
      group: [sequelize.fn("DATE", sequelize.col("signed_up_at"))],
      raw: true,
    });
    const loginRows = await LoginLog.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("login_at")), "day"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { loginAt: { [Op.gte]: since } },
      group: [sequelize.fn("DATE", sequelize.col("login_at"))],
      raw: true,
    });
    const guestRows = await GuestVisit.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("visited_at")), "day"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { visitedAt: { [Op.gte]: since } },
      group: [sequelize.fn("DATE", sequelize.col("visited_at"))],
      raw: true,
    });
    const orderRows = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("created_at")), "day"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { createdAt: { [Op.gte]: since }, status: { [Op.ne]: "Cancelled" } },
      group: [sequelize.fn("DATE", sequelize.col("created_at"))],
      raw: true,
    });

    const toMap = (rows) =>
      rows.reduce((acc, r) => {
        const key = new Date(r.day).toISOString().slice(0, 10);
        acc[key] = Number(r.count);
        return acc;
      }, {});

    const signups = toMap(signupRows);
    const logins = toMap(loginRows);
    const guests = toMap(guestRows);
    const orders = toMap(orderRows);

    const series = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      series.push({ date: key, signups: signups[key] || 0, logins: logins[key] || 0, guests: guests[key] || 0, orders: orders[key] || 0 });
    }

    res.json(series);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
