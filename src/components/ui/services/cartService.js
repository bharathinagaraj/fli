import api from "./api";

const cartService = {
  // GET /cart
  async getCart() {
    return api.get("/cart");
  },

  // POST /cart/items
  async addItem(productId, quantity = 1, variant = null) {
    return api.post("/cart/items", { productId, quantity, variant });
  },

  // PATCH /cart/items/:id   (id = cart item id)
  async updateItemQuantity(id, quantity) {
    return api.patch(`/cart/items/${id}`, { quantity });
  },

  // DELETE /cart/items/:id  (id = cart item id)
  async removeItem(id) {
    return api.delete(`/cart/items/${id}`);
  },

  // DELETE /cart
  async clearCart() {
    return api.delete("/cart");
  },

  // POST /cart/promo
  async applyPromoCode(code) {
    return api.post("/cart/promo", { code });
  },
};

export default cartService;
