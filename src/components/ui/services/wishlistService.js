import api from "./api";

const wishlistService = {
  // GET /wishlist
  async getWishlist() {
    return api.get("/wishlist");
  },

  // POST /wishlist
  async addItem(productId) {
    return api.post("/wishlist", { productId });
  },

  // DELETE /wishlist/:productId
  async removeItem(productId) {
    return api.delete(`/wishlist/${productId}`);
  },

  // DELETE /wishlist
  async clearWishlist() {
    return api.delete("/wishlist");
  },
};

export default wishlistService;
