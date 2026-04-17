import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReceiptData = {
  transactionId: string;
  bankName: string;
  amount: number;
  tenor: string;
  interestRate: number;
  maturityAmount: number;
};

type ReceiptUser = {
  name: string;
  phone: string;
  email: string;
};

function parseTenorMonths(tenor: string): number {
  const normalized = tenor.trim().toLowerCase();
  const value = Number.parseInt(normalized, 10);

  if (Number.isNaN(value) || value <= 0) {
    return 12;
  }

  if (normalized.includes("month")) {
    return value;
  }

  if (normalized.includes("year")) {
    return value * 12;
  }

  return 12;
}

function computeMaturityDate(tenor: string) {
  const months = parseTenorMonths(tenor);
  const maturityDate = new Date();
  maturityDate.setMonth(maturityDate.getMonth() + months);
  return maturityDate.toLocaleDateString("en-IN");
}

export function generateFDReceipt(data: ReceiptData, user: ReceiptUser) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(20);
  doc.text(data.bankName.toUpperCase(), 14, 18);

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.text("FIXED DEPOSIT ADVICE", pageWidth - 14, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `Received from:\n${user.name}\nMobile: ${user.phone}\nEmail: ${user.email}`,
    14,
    30
  );

  doc.text(
    `Transaction ID: ${data.transactionId}\nDate of Deposit: ${new Date().toLocaleDateString("en-IN")}`,
    pageWidth - 14,
    30,
    { align: "right" }
  );

  autoTable(doc, {
    startY: 62,
    theme: "grid",
    body: [
      [
        "Principal Amount",
        `Rs. ${data.amount}`,
        "Rate of Interest",
        `${data.interestRate}% p.a.`,
      ],
      ["Period", data.tenor, "Maturity Date", computeMaturityDate(data.tenor)],
      ["Maturity Amount", `Rs. ${data.maturityAmount}`, "Status", "Confirmed"],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [203, 213, 225],
      lineWidth: 0.3,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      2: { fontStyle: "bold" },
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 140;
  const footerY = Math.max(finalY + 24, 230);

  doc.setDrawColor(148, 163, 184);
  doc.line(14, footerY, pageWidth - 14, footerY);
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(
    "This FD has been opened as per the terms and conditions of the Blostem Banking Scheme. No premature withdrawal permitted.",
    14,
    footerY + 10,
    { maxWidth: pageWidth - 28 }
  );

  doc.setFont("helvetica", "bold");
  doc.text("Authorized Signatory - Blostem", pageWidth - 14, footerY + 24, { align: "right" });

  doc.save("Blostem_FD_Advice.pdf");
}
