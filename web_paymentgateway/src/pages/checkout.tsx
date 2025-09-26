import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const c = localStorage.getItem("cart");
    if (c) setCart(JSON.parse(c));
  }, []);

  const updateQty = (id: string, delta: number) => {
    const updated = cart
      .map((item) =>
        item._id === id
          ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) }
          : item
      )
      .filter((item) => item.qty > 0);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.qty || 0),
    0
  );
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

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
        <h1 className="font-bold text-lg">Checkout</h1>
        <div className="w-12" /> {/* kosong biar teks di tengah */}
      </header>

      {/* ✅ List cart items */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        {cart.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-15 h-15 bg-gray-200 rounded overflow-hidden relative">
                {item.imageUrl ? (
                    <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <span className="text-gray-400 text-xs flex items-center justify-center w-full h-full">
                    No Img
                    </span>
                )}
                </div>
              <div>
                <p className="font-semibold">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => updateQty(item._id, -1)}
                  >
                    −
                  </button>
                  <span>{item.qty}</span>
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => updateQty(item._id, +1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <p className="font-semibold">
              Rp {(item.price * item.qty).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>

      {/* ✅ Ringkasan */}
      <div className="bg-white p-4 rounded-t-lg shadow space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (11%)</span>
          <span>Rp {tax.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between font-bold border-t pt-2">
          <span>Total</span>
          <span>Rp {total.toLocaleString("id-ID")}</span>
        </div>

        <button
          onClick={() => router.push("/payment")}
          className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Continue to Payment →
        </button>
      </div>
    </div>
  );
}
