import api from "./api";

const addressService = {
  // GET /addresses
  async getAddresses() {
    return api.get("/addresses");
  },

  // POST /addresses
  async createAddress(address) {
    return api.post("/addresses", address);
  },

  // PUT /addresses/:id
  async updateAddress(id, address) {
    return api.put(`/addresses/${id}`, address);
  },

  // DELETE /addresses/:id
  async deleteAddress(id) {
    return api.delete(`/addresses/${id}`);
  },

  // PATCH /addresses/:id/default
  async setDefault(id) {
    return api.patch(`/addresses/${id}/default`);
  },
};

export default addressService;
