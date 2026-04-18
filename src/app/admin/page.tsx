import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";

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
  const bookings = await Booking.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          Blostem System Admin - Investment Overview
        </h1>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 sm:p-6">
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
