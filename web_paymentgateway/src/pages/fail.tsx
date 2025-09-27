import { useRouter } from "next/router";

export default function FailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-red-100 rounded-full p-6 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-24 w-24 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        Pembayaran Gagal
      </h1>
      <p className="text-gray-600 mb-6 text-center">
        Maaf, pembayaran Anda tidak berhasil. Silakan coba lagi.
      </p>

      <button
        onClick={() => router.push("/checkout")}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Kembali ke Checkout
      </button>
    </div>
  );
}
