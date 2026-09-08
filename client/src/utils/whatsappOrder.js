// Central WhatsApp order helper for M.BeautyBloom
// Keep the number in one place so it's easy to update.
export const WHATSAPP_NUMBER = '923214203402';

const money = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

/**
 * Build a nicely formatted WhatsApp order message.
 * @param {Object} params
 * @param {Array} params.items - [{ name, quantity, price, variant }]
 * @param {Object} params.customer - { name, phone, email, address, city }
 * @param {String} params.orderId - optional order id/reference already saved in DB
 * @param {Number} params.total - grand total
 * @param {String} params.notes - optional customer notes
 */
export function buildWhatsAppMessage({ items = [], customer = {}, orderId, total, notes }) {
  const lines = [];
  lines.push('🎁 *New Order — M.BeautyBloom*');
  if (orderId) lines.push(`🧾 Order Ref: *${orderId}*`);
  lines.push('');
  lines.push('*Items:*');
  items.forEach((it, i) => {
    const variant = it.variant ? ` (${it.variant})` : '';
    lines.push(`${i + 1}. ${it.name}${variant} x${it.quantity} — ${money(it.price * it.quantity)}`);
  });
  lines.push('');
  if (typeof total === 'number') lines.push(`💰 *Total: ${money(total)}*`);
  lines.push('');
  lines.push('*Customer Details:*');
  if (customer.name) lines.push(`👤 ${customer.name}`);
  if (customer.phone) lines.push(`📞 ${customer.phone}`);
  if (customer.email) lines.push(`✉️ ${customer.email}`);
  if (customer.address) lines.push(`📍 ${customer.address}${customer.city ? `, ${customer.city}` : ''}`);
  if (notes) {
    lines.push('');
    lines.push(`📝 Note: ${notes}`);
  }
  lines.push('');
  lines.push('Please confirm my order, JazakAllah Khair! 🌸');
  return lines.join('\n');
}

/**
 * Opens WhatsApp (app on mobile, web on desktop) with a prefilled order message.
 * Returns the URL used, in case the caller wants to also show a link/button fallback.
 */
export function sendOrderToWhatsApp(orderData) {
  const message = buildWhatsAppMessage(orderData);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return url;
}
