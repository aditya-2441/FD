import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { ExportButton } from "@/components/admin/ExportButton";
import { AIInsights } from "@/components/admin/AIInsights";

function formatRupee(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateBooked(date: Date | string | undefined): string {
  if (!date) {
    return "—";
  }
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminPage() {
  await connectToDatabase();
  const rawBookings = await Booking.find().sort({ createdAt: -1 }).lean();
  const bookings = rawBookings.map((booking) => ({
    _id: String(booking._id),
    transactionId: booking.transactionId as string,
    bankName: booking.bankName as string,
    amount: booking.amount as number,
    tenor: booking.tenor as string,
    interestRate: booking.interestRate as number,
    maturityAmount: booking.maturityAmount as number,
    createdAt: booking.createdAt ? new Date(booking.createdAt as unknown as string | number | Date).toISOString() : "",
  }));

  const totalAUM = bookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
  const totalBookings = bookings.length;
  const topBankTotals = bookings.reduce<Record<string, number>>((acc, booking) => {
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
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          Blostem System Admin - Investment Overview
        </h1>
          <ExportButton data={bookings} />
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

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    Transaction ID
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    Bank Name
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    Amount Invested
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    Tenor
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    Interest Rate
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    Maturity Amount
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                    Date Booked
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={String(booking._id)}
                      className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-800 sm:text-sm">
                        {booking.transactionId}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {booking.bankName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {formatRupee(booking.amount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {booking.tenor}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {typeof booking.interestRate === "number"
                          ? `${booking.interestRate}%`
                          : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {formatRupee(booking.maturityAmount)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {formatDateBooked(booking.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
