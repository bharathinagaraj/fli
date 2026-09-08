import api from "./api";

const orderService = {
  // GET /orders
  async getOrders(status = "All") {
    return api.get("/orders", status !== "All" ? { status } : undefined);
  },

  // GET /orders/my/summary — how many products this customer bought
  async getMySummary() {
    return api.get("/orders/my/summary");
  },

  // GET /orders/:id
  async getOrderById(id) {
    return api.get(`/orders/${id}`);
  },

  // POST /orders  (checkout) — needs an existing addressId
  async placeOrder({ addressId, paymentMethod, paymentDetails = null }) {
    if (!addressId) {
      throw new Error("Shipping address is required.");
    }
    return api.post("/orders", { addressId, paymentMethod, paymentDetails });
  },

  // POST /orders/:id/cancel
  async cancelOrder(id) {
    return api.post(`/orders/${id}/cancel`);
  },

  // POST /orders/:id/return  (customer return / exchange request)
  async returnItem({ orderId, itemId, reason, issueType, returnType }) {
    return api.post(`/orders/${orderId}/return`, { itemId, reason, issueType, returnType });
  },
};

export default orderService;
