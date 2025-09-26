// pages/payment.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Product {
  _id: string;
  name: string;
  price: number;
  qty: number;
}

export default function PaymentPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [payment, setPayment] = useState<string>("card");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Hitung subtotal, tax, shipping, dan total
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 0),
    0
  );
  const shipping = 12000; // contoh fixed shipping
  const taxRate = 0.11; // 11% pajak
  const tax = subtotal * taxRate;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Header */}
      <header className="bg-white shadow p-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-black font-medium hover:text-blue-600"
        >
          &lt; Back
        </button>
        <h1 className="font-bold text-lg">Secure Checkout</h1>
        <div className="w-12" />
      </header>

      {/* ✅ Body */}
      <div className="flex-1 p-4 space-y-6">
        {/* Shipping Address */}
        <div>
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Street Address"
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="City"
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Postal Code"
              className="w-full border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-4 rounded-lg shadow space-y-2">
          <h2 className="font-semibold mb-2">Order Summary</h2>
          <div className="flex justify-between">
            <span>Item(s)</span>
            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Rp {shipping.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (11%)</span>
            <span>Rp {tax.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* ✅ Confirm Button */}
      <div className="p-4 bg-white border-t">
        <button
          onClick={async () => {
            if (cart.length === 0) {
              alert("Keranjang kosong");
              return;
            }

            const resp = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                items: cart.map((i) => ({
                  product: i._id,
                  qty: i.qty || 1,
                  price: i.price,
                })),
                totalPrice: total,
                email: "test@example.com",
              }),
            });

            const data = await resp.json();
            console.log("👉 Response dari backend:", data);

            if (data.invoiceUrl) {
              window.location.href = data.invoiceUrl;
            } else {
              alert("Gagal membuat invoice: " + (data.error || "Unknown error"));
            }
          }}
          disabled={total <= 0}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          Confirm & Pay
        </button>
      </div>
    </div>
  );
}
