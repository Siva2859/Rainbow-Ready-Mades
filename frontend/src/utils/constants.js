// Verified Business Information for Rainbow Ready Mades

export const SHOP_INFO = {
  name: "Rainbow Ready Mades",
  tagline: "Quality Garments for the Entire Family",
  address: "12 Gandhi Road, Near Clock Tower",
  landmark: "Near Clock Tower, Opposite Central Bank",
  city: "Shop Local City",
  state: "Tamil Nadu",
  postalCode: "600001",
  country: "India",
  phone: "+919876543210",
  whatsapp: "+919876543210",
  email: "support@rainbowreadymades.local",
  hours: {
    weekdays: "10:00 AM to 09:00 PM (Mon - Sat)",
    sunday: "11:00 AM to 08:00 PM (Sun)"
  },
  delivery: {
    radiusKm: 10,
    policy: "Delivery is available within a 10 km range of the store."
  },
  returns: {
    windowDays: 10,
    policy: "Returns and exchanges are allowed within 10 days of purchase or delivery. Both exchanges and refunds are permitted; damaged or wrong products are eligible."
  }
};

export const PAYMENT_METHODS = [
  { id: "CASH_ON_DELIVERY", label: "Cash on Delivery (COD)", desc: "Pay cash when your order reaches your doorstep" },
  { id: "UPI", label: "UPI (Google Pay / PhonePe / Paytm)", desc: "Direct UPI payment to store merchant account" },
  { id: "PHONEPE", label: "PhonePe", desc: "Pay using PhonePe UPI or wallet" },
  { id: "GOOGLE_PAY", label: "Google Pay", desc: "Instant contactless GPay transfer" },
  { id: "CARD", label: "Credit / Debit Card", desc: "Visa, MasterCard, RuPay cards accepted at store counter or on delivery" },
  { id: "CASH", label: "Cash (Store Counter)", desc: "Pay in cash upon in-store pickup" }
];

export const ORDER_STATUS_LABELS = {
  PENDING: { label: "Order Placed", color: "bg-amber-100 text-amber-800 border-amber-300" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-300" },
  PREPARING: { label: "Preparing Garments", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  READY: { label: "Ready for Dispatch / Pickup", color: "bg-purple-100 text-purple-800 border-purple-300" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-sky-100 text-sky-800 border-sky-300" },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  CANCELLED: { label: "Cancelled", color: "bg-rose-100 text-rose-800 border-rose-300" }
};

export const RETURN_REASONS = [
  { value: "SIZE_FIT_ISSUE", label: "Size / Fit Issue (Requires size exchange)" },
  { value: "DAMAGED_ITEM", label: "Damaged / Defective garment" },
  { value: "WRONG_ITEM_DELIVERED", label: "Wrong item delivered" },
  { value: "COLOR_MISMATCH", label: "Color shade differs" },
  { value: "OTHER", label: "Other reason" }
];
