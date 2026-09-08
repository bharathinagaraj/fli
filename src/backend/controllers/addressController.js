const { Address } = require("../models");

// GET /api/addresses
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { customerId: req.user.id },
      order: [["isDefault", "DESC"], ["createdAt", "DESC"]],
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/addresses
exports.createAddress = async (req, res) => {
  try {
    const data = { ...req.body, customerId: req.user.id };

    if (data.isDefault) {
      await Address.update({ isDefault: false }, { where: { customerId: req.user.id } });
    }

    const address = await Address.create(data);
    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/addresses/:id
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!address) return res.status(404).json({ message: "Address not found." });

    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { customerId: req.user.id } });
    }

    await address.update(req.body);
    res.json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/addresses/:id
exports.deleteAddress = async (req, res) => {
  try {
    const deleted = await Address.destroy({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!deleted) return res.status(404).json({ message: "Address not found." });

    res.json({ message: "Address deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/addresses/:id/default
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, customerId: req.user.id },
    });
    if (!address) return res.status(404).json({ message: "Address not found." });

    await Address.update({ isDefault: false }, { where: { customerId: req.user.id } });
    await address.update({ isDefault: true });

    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};