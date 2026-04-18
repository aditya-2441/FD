"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, IndianRupee, Mail, Phone, Wallet } from "lucide-react";
import { generateFDReceipt } from "@/lib/generateReceipt";

type BookingRecord = {
  transactionId: string;
  bankName: string;
  amount: number;
  tenor: string;
  interestRate: number;
  maturityAmount: number;
  createdAt?: string;
};

function formatRupee(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function ProfilePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    const storedUserPhone = localStorage.getItem("userPhone");
    const storedUserEmail = localStorage.getItem("userEmail");

    if (!userId) {
      router.replace("/login");
      return;
    }

    setUserName(storedUserName);
    setUserPhone(storedUserPhone);
    setUserEmail(storedUserEmail);

    const loadBookings = async () => {
      try {
        const res = await fetch(`/api/user/bookings?userId=${encodeURIComponent(userId)}`);
        if (!res.ok) {
          throw new Error("Failed to load bookings");
        }
        const data = (await res.json()) as BookingRecord[];
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, [router]);

  const totalInvested = bookings.reduce((sum, b) => sum + Number(b.amount), 0);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </button>

          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            My Portfolio
          </h1>
          <div className="w-[130px]" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-slate-900">{userName || "Guest"}</div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{userPhone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{userEmail || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 text-blue-900 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <IndianRupee className="w-4 h-4" />
                Total Invested
              </div>
              <div className="mt-2 text-xl font-bold">
                ₹{Number(totalInvested || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-emerald-50 text-emerald-900 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wallet className="w-4 h-4" />
                Active FDs
              </div>
              <div className="mt-2 text-xl font-bold">{bookings.length.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading your portfolio...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
                No bookings found yet.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.transactionId}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Bank
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {booking.bankName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Amount</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatRupee(Number(booking.amount) || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Tenor</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {booking.tenor}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Interest Rate</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {booking.interestRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Maturity</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatRupee(Number(booking.maturityAmount) || 0)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      generateFDReceipt(booking as unknown as any, {
                        name: userName || "Customer",
                        phone: userPhone || "N/A",
                        email: userEmail || "N/A",
                      })
                    }
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                  >
                    Download Receipt
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}

