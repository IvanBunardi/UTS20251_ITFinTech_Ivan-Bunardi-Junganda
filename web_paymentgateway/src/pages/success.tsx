// pages/success.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SuccessPage() {
  const router = useRouter();
  const { invoice_id, external_id, status } = router.query;

  useEffect(() => {
    if (status === "PAID") {
      console.log("Invoice berhasil dibayar:", invoice_id);
      // Bisa juga panggil API untuk update database
    }
  }, [status, invoice_id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Logo centang */}
      <div className="bg-green-100 rounded-full p-6 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Teks sukses */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Pembayaran Berhasil!
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Terima kasih, pembayaran Anda telah diterima.
      </p>

      {/* Tombol kembali ke homepage */}
      <button
        onClick={() => router.push("/")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Kembali ke Homepage
      </button>
    </div>
  );
}
