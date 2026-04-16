import type { CreateFDRequest, CreateFDResponse, FDRatesResponse } from "@/types/api";

export async function getMockFDRates(): Promise<FDRatesResponse> {
  const response = await fetch("/api/mock-blostem", { method: "GET" });
  if (!response.ok) {
    throw new Error("Unable to fetch FD rates right now.");
  }

  return (await response.json()) as FDRatesResponse;
}

export async function createMockFD(payload: CreateFDRequest): Promise<CreateFDResponse> {
  const response = await fetch("/api/mock-blostem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to create FD booking right now.");
  }

  return (await response.json()) as CreateFDResponse;
}
