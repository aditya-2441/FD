"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type BankRecord = {
  _id?: string;
  name: string;
  interestRate: number;
};

export default function AdminBankSettingsPage() {
  const [banks, setBanks] = useState<BankRecord[]>([]);
  const [name, setName] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const sortedBanks = useMemo(() => {
    return [...banks].sort((a, b) => a.name.localeCompare(b.name));
  }, [banks]);

  useEffect(() => {
    let mounted = true;

    async function loadBanks() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch("/api/admin/banks");
        const data = (await res.json()) as
          | { success: true; banks: BankRecord[] }
          | { success: false; error: string };

        if (!res.ok || !("success" in data) || data.success === false) {
          throw new Error("success" in data && data.success === false ? data.error : "Failed to load banks");
        }

        if (mounted) {
          setBanks(Array.isArray(data.banks) ? data.banks : []);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Failed to load banks");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBanks();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleAddBank(event: FormEvent) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const parsedRate = Number(interestRate);

    if (!trimmedName) {
      setError("Please enter a bank name.");
      return;
    }
    if (!Number.isFinite(parsedRate)) {
      setError("Please enter a valid interest rate.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, interestRate: parsedRate }),
      });

      const data = (await res.json()) as
        | { success: true; bank: BankRecord }
        | { success: false; error: string };

      if (!res.ok || !("success" in data) || data.success === false) {
        throw new Error("success" in data && data.success === false ? data.error : "Failed to add bank");
      }

      setBanks((current) => [data.bank, ...current]);
      setName("");
      setInterestRate("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add bank");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            Bank Interest Rate Configuration
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add or review the banks and interest rates used by the AI.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleAddBank} className="grid gap-4 sm:grid-cols-3 sm:items-end">
            <div className="sm:col-span-1">
              <label htmlFor="bankName" className="mb-2 block text-sm font-medium text-slate-700">
                Bank Name
              </label>
              <input
                id="bankName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., HDFC"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="interestRate" className="mb-2 block text-sm font-medium text-slate-700">
                Interest Rate (%)
              </label>
              <input
                id="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g., 7.1"
                inputMode="decimal"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Adding..." : "Add Bank"}
              </button>
            </div>
          </form>

          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Configured Banks</h2>
          <p className="text-xs text-slate-500">
            {isLoading ? "Loading..." : `${sortedBanks.length} bank(s)`}
          </p>
        </div>

        {sortedBanks.length === 0 && !isLoading ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
            No banks configured yet. Add one above to get started.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedBanks.map((bank) => (
              <div
                key={bank._id ?? bank.name}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">{bank.name}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Interest Rate:{" "}
                  <span className="font-semibold text-slate-900">{bank.interestRate}%</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

