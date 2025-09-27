import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl?: string;
  qty?: number;
}

export default function UserPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false); // 👈 state sidebar
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/product")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  function add(p: Product) {
    const c = [...cart];
    const idx = c.findIndex((x) => x._id === p._id);
    if (idx > -1) {
      c[idx].qty = (c[idx].qty || 1) + 1;
    } else {
      c.push({ ...p, qty: 1 });
    }
    setCart(c);
  }

  function goCheckout() {
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/checkout");
  }

  const categories = ["All", "Drinks", "Snacks", "Food", "Clothes", "Bundle"];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = filter === "All" || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <button onClick={() => setSidebarOpen(false)}>
            <span className="material-icons">☰</span>
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-3">
          <button
            className="text-left hover:text-blue-600"
            onClick={() => router.push("/")}
          >
            Log Out
          </button>
        </nav>
      </div>

      <header className="bg-white shadow p-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <button className="p-2" onClick={() => setSidebarOpen(true)}>
            <span className="material-icons">☰</span>
          </button>
          <h1 className="font-bold text-xl">Belanja</h1>
        </div>

        <div className="flex-1 mx-4">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <button
          className="relative p-2"
          onClick={goCheckout}
          disabled={cart.length === 0}
        >
            <span className="material-icons">🛒</span>
            {totalQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {totalQty}
            </span>
            )}
        </button>
      </header>

      <div className="flex gap-4 px-4 py-2 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              filter === c
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <main className="p-4 grid gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
          >
           <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden relative">
                {p.imageUrl ? (
                    <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <span className="text-gray-400 text-sm flex items-center justify-center w-full h-full">
                    No Img
                    </span>
                )}
                </div>

            <div className="flex-1">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-gray-500 text-sm">
                Rp {p.price.toLocaleString("id-ID")}
            </p>

            <p className="text-gray-400 text-xs">{p.description || "No description"}</p>
            </div>


            {cart.find((item) => item._id === p._id) ? (
            <div className="flex items-center gap-2">
                <button
                onClick={() => {
                    const c = [...cart];
                    const idx = c.findIndex((x) => x._id === p._id);
                    if (idx > -1 && c[idx].qty && c[idx].qty > 1) {
                    c[idx].qty!--;
                    } else {
                    c.splice(idx, 1); 
                    }
                    setCart(c);
                }}
                className="px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                -
                </button>
                <span>{cart.find((item) => item._id === p._id)?.qty}</span>
                <button
                onClick={() => {
                    const c = [...cart];
                    const idx = c.findIndex((x) => x._id === p._id);
                    if (idx > -1) {
                    c[idx].qty = (c[idx].qty || 1) + 1;
                    }
                    setCart(c);
                }}
                className="px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                +
                </button>
            </div>
            ) : (
            <button
                onClick={() => add(p)}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
                Add +
            </button>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
