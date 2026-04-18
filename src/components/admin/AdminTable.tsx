"use client";

import { useMemo, useState } from "react";
import { Download, Search, X } from "lucide-react";
import { ExportButton } from "@/components/admin/ExportButton";
import { generateFDReceipt } from "@/lib/generateReceipt";

export type AdminBookingRow = {
  _id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  transactionId: string;
  bankName: string;
  amount: number;
  tenor: string;
  interestRate: number;
  maturityAmount: number;
  createdAt: string;
};

function formatRupee(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function AdminTable({ bookings }: { bookings: AdminBookingRow[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const filteredBookings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return bookings;

    return bookings.filter((b) => {
      return (
        b.bankName.toLowerCase().includes(q) ||
        b.transactionId.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.userPhone.toLowerCase().includes(q)
      );
    });
  }, [bookings, searchTerm]);

  const selectedSet = useMemo(() => new Set(selectedTxIds), [selectedTxIds]);

  const exportRows = useMemo(() => {
    if (selectedTxIds.length > 0) {
      return bookings.filter((b) => selectedSet.has(b.transactionId));
    }
    return filteredBookings;
  }, [bookings, filteredBookings, selectedSet, selectedTxIds.length]);

  const allVisibleSelected =
    filteredBookings.length > 0 &&
    filteredBookings.every((b) => selectedSet.has(b.transactionId));

  function toggleRow(txId: string) {
    setSelectedTxIds((current) => {
      if (current.includes(txId)) return current.filter((id) => id !== txId);
      return [...current, txId];
    });
  }

  function toggleAllVisible() {
    setSelectedTxIds((current) => {
      const currentSet = new Set(current);
      const visibleIds = filteredBookings.map((b) => b.transactionId);
      const everySelected = visibleIds.every((id) => currentSet.has(id));
      if (everySelected) {
        visibleIds.forEach((id) => currentSet.delete(id));
      } else {
        visibleIds.forEach((id) => currentSet.add(id));
      }
      return Array.from(currentSet);
    });
  }

  const portfolio = useMemo(() => {
    if (!selectedUserId) return null;
    const rows = bookings.filter((b) => b.userId === selectedUserId);
    const totalInvested = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const userName = rows[0]?.userName ?? "Unknown User";
    const userPhone = rows[0]?.userPhone ?? "";
    return { rows, totalInvested, userName, userPhone };
  }, [bookings, selectedUserId]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by bank, transaction, name, phone..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div className="text-xs text-slate-500">
            {selectedTxIds.length > 0 ? `${selectedTxIds.length} selected` : `${filteredBookings.length} shown`}
          </div>
          <ExportButton data={exportRows as Array<Record<string, unknown>>} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  aria-label="Select all visible rows"
                />
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Transaction ID</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">User</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Bank</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Amount</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Tenor</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Date</th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  No matching bookings.
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(booking.transactionId)}
                      onChange={() => toggleRow(booking.transactionId)}
                      aria-label={`Select ${booking.transactionId}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-800 sm:text-sm">
                    {booking.transactionId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(booking.userId)}
                      className="text-left text-sm font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800"
                    >
                      {booking.userName}
                      <div className="text-xs font-medium text-slate-600 no-underline">
                        {booking.userPhone}
                      </div>
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{booking.bankName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{formatRupee(booking.amount)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{booking.tenor}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(booking.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        generateFDReceipt(
                          {
                            transactionId: booking.transactionId,
                            bankName: booking.bankName,
                            amount: booking.amount,
                            tenor: booking.tenor,
                            interestRate: booking.interestRate,
                            maturityAmount: booking.maturityAmount
                          },
                          {
                            name: booking.userName || "Customer",
                            phone: booking.userPhone || "N/A",
                            email: booking.userEmail || "N/A"
                          }
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {portfolio ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CRM Portfolio</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{portfolio.userName}</h3>
                <p className="mt-1 text-sm text-slate-600">{portfolio.userPhone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserId(null)}
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Total Invested</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {formatRupee(portfolio.totalInvested)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">Total FDs</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    {portfolio.rows.length.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Transaction</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Bank</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Amount</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Tenor</th>
                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.rows.map((r) => (
                        <tr
                          key={r._id}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-800 sm:text-sm">
                            {r.transactionId}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-800">{r.bankName}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-800">{formatRupee(r.amount)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-800">{r.tenor}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(r.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

