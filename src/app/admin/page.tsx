import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { AIInsights } from "@/components/admin/AIInsights";
import User from "@/models/User";
import Link from "next/link";
import { AdminTable } from "@/components/admin/AdminTable";

function formatRupee(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function AdminPage() {
  await connectToDatabase();
  const rawBookings = await Booking.find().sort({ createdAt: -1 }).lean();
  const rawUsers = await User.find().lean();

  const userByUid = new Map<string, { name: string; phone: string; email: string }>(
    rawUsers.map((u) => [
      String((u as { uid?: string }).uid ?? ""),
      {
        name: String((u as { name?: string }).name ?? ""),
        phone: String((u as { phone?: string }).phone ?? ""),
        email: String((u as { email?: string }).email ?? ""),
      },
    ])
  );

  const enrichedBookings = rawBookings.map((booking) => {
    const userId = String((booking as { userId?: string }).userId ?? "");
    const user = userByUid.get(userId);
    return {
      _id: String(booking._id),
      userId,
      userName: user?.name || "Unknown",
      userPhone: user?.phone || "—",
      userEmail: user?.email || "—",
      transactionId: booking.transactionId as string,
      bankName: booking.bankName as string,
      amount: booking.amount as number,
      tenor: booking.tenor as string,
      interestRate: booking.interestRate as number,
      maturityAmount: booking.maturityAmount as number,
      createdAt: booking.createdAt
        ? new Date(booking.createdAt as unknown as string | number | Date).toISOString()
        : "",
    };
  });

  const totalAUM = enrichedBookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
  const totalBookings = enrichedBookings.length;
  const topBankTotals = enrichedBookings.reduce<Record<string, number>>((acc, booking) => {
    const name = booking.bankName || "Unknown";
    acc[name] = (acc[name] ?? 0) + (Number(booking.amount) || 0);
    return acc;
  }, {});
  const topBank =
    Object.entries(topBankTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Blostem System Admin - Investment Overview
            </h1>
            <Link
              href="/admin/settings"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Bank Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total AUM</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {formatRupee(totalAUM)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Total Bookings</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {totalBookings.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-600">Top Bank (by AUM)</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {topBank}
            </p>
          </div>
        </div>

        <AIInsights />

        <AdminTable bookings={enrichedBookings} />
      </main>
    </div>
  );
}
