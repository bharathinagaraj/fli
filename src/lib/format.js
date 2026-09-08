// Indian Rupee (Flipkart-style) price formatting.
export function formatPrice(value) {
  const num = Number(value || 0);
  return "₹" + num.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// Small compact price for tight spots, e.g. ₹1,999
export const formatINR = formatPrice;

export default formatPrice;
