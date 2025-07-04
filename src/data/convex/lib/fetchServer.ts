import { wsfApiReviver } from "../../fetchWsf/utils";

const WSF_BASE_URL = "https://www.wsdot.wa.gov/ferries/api/vessels/rest";
const API_KEY = process.env.WSDOT_ACCESS_TOKEN ?? "";

export async function fetchWsfServer<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | undefined> {
  // Add API key as query parameter
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${WSF_BASE_URL}${endpoint}${separator}apiaccesscode=${API_KEY}`;

  try {
    console.log(`Fetching from WSF API: ${url.replace(API_KEY, "[REDACTED]")}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const data = JSON.parse(text, wsfApiReviver) as T;
    return data;
  } catch (error) {
    console.error("Error fetching from WSF API:", error);
    throw error;
  }
}
