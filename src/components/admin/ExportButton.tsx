"use client";

import { Download } from "lucide-react";

type ExportButtonProps = {
  data: Array<Record<string, unknown>>;
};

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function escapeCsv(value: string): string {
  const needsQuotes = /[",\n\r]/.test(value);
  const escaped = value.replaceAll('"', '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function jsonToCsv(rows: Array<Record<string, unknown>>): string {
  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>())
  );

  const headerLine = headers.map(escapeCsv).join(",");
  const lines = rows.map((row) =>
    headers.map((key) => escapeCsv(toCsvValue(row[key]))).join(",")
  );

  return [headerLine, ...lines].join("\n");
}

export function ExportButton({ data }: ExportButtonProps) {
  function handleExport() {
    const csv = jsonToCsv(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "blostem-investments.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}

