import api from "./api";

const productService = {
  // GET /products?category=&search=&minPrice=&maxPrice=&brands=&minRating=&page=&limit=&sort=&order=
  async getProducts(filters = {}) {
    return api.get("/products", filters);
  },

  // GET /products/:id
  async getProductById(id) {
    return api.get(`/products/${id}`);
  },

  // GET /products/featured
  async getFeaturedProducts() {
    return api.get("/products/featured");
  },

  // GET /categories
  async getCategories() {
    return api.get("/categories");
  },

  // GET /products/:id/reviews
  async getProductReviews(id) {
    return api.get(`/products/${id}/reviews`);
  },

  // POST /products/:id/reviews (auth)
  async addReview(id, { rating, comment }) {
    return api.post(`/products/${id}/reviews`, { rating, comment });
  },

  // GET /products/status (admin) — runs a check and returns the report
  async getProductStatus() {
    return api.get("/products/status");
  },

  // POST /products (admin) — images auto-generated when not provided
  async createProduct(data) {
    return api.post("/products", data);
  },

  // PUT /products/:id (admin)
  async updateProduct(id, data) {
    return api.put(`/products/${id}`, data);
  },

  // DELETE /products/:id (admin) — soft delete
  async deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },
};

export default productService;
