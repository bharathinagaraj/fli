/**
 * Standardized success response.
 * Usage: sendSuccess(res, 200, "Login successful", { user, token })
 */
function sendSuccess(res, statusCode = 200, message = "Success", data = null) {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
}

/**
 * Standardized error response.
 * Usage: sendError(res, 404, "Product not found")
 */
function sendError(res, statusCode = 500, message = "Something went wrong", errors = null) {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Standardized paginated list response.
 * Usage: sendPaginated(res, products, { page, limit, total })
 */
function sendPaginated(res, items, { page, limit, total }) {
  return res.status(200).json({
    success: true,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };