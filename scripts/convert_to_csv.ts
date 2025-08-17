#!/usr/bin/env bun
/** biome-ignore-all lint/suspicious/noExplicitAny: Nope */
/** biome-ignore-all lint/style/useTemplate: Nope */

interface GenericRecord {
  [key: string]: any;
}

interface ApiResponse {
  trips: GenericRecord[];
}

// Duck-typing function to detect if a number is a Unix timestamp
function isUnixTimestamp(value: any): boolean {
  if (typeof value !== "number") return false;

  // Unix timestamps are typically:
  // - Seconds since epoch: 10 digits (e.g., 1640995200)
  // - Milliseconds since epoch: 13 digits (e.g., 1640995200000)
  // - Microseconds since epoch: 16 digits (e.g., 1640995200000000)
  const digits = Math.floor(Math.log10(Math.abs(value))) + 1;

  // Valid Unix timestamp ranges (reasonable bounds for ferry data)
  const minTimestamp = 1000000000; // ~2001
  const maxTimestamp = 2000000000000; // ~2033

  return (
    value >= minTimestamp &&
    value <= maxTimestamp &&
    (digits === 10 || digits === 13 || digits === 16)
  );
}

// Convert Unix timestamp to human-readable Pacific timezone string
function convertTimestamp(value: any): string {
  if (!isUnixTimestamp(value)) return String(value);

  try {
    // Handle both seconds and milliseconds
    const timestamp = value > 1000000000000 ? value : value * 1000;
    const date = new Date(timestamp);

    // Convert to Pacific timezone
    const pacificTime = date.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Format as YYYY-MM-DD hh:mm:ss
    const [datePart, timePart] = pacificTime.split(", ");
    const [month, day, year] = datePart.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${timePart}`;
  } catch {
    return String(value);
  }
}

// Convert any value to CSV-safe string
function toCsvValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value.toString();
  if (typeof value === "number") {
    if (isUnixTimestamp(value)) {
      return convertTimestamp(value);
    }
    return value.toString();
  }
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

async function convertJsonToCsv(
  inputFile: string,
  outputFile?: string
): Promise<void> {
  const rawData = Bun.file(inputFile);
  if (!(await rawData.exists())) {
    console.error(`Error: Input file '${inputFile}' not found`);
    process.exit(1);
  }

  const data: ApiResponse = JSON.parse(await rawData.text());

  // Extract trips
  const trips = data.trips || [];

  if (trips.length === 0) {
    console.log("No trips found in the data");
    return;
  }

  // Dynamically get all unique column names from all records
  const allColumns = new Set<string>();
  trips.forEach((trip) => {
    Object.keys(trip).forEach((key) => allColumns.add(key));
  });

  // Convert to array and sort for consistent ordering
  const headers = Array.from(allColumns).sort();

  console.log(`Found ${headers.length} columns:`, headers);

  // Create CSV content
  let csvContent = headers.join(",") + "\n";

  for (const trip of trips) {
    const row = headers.map((header) => {
      const value = trip[header];
      return toCsvValue(value);
    });

    csvContent += row.join(",") + "\n";
  }

  // Determine output filename
  const csvFile = outputFile || inputFile.replace(/\.json$/, ".csv");

  // Write to CSV file
  await Bun.write(csvFile, csvContent);

  console.log(`Converted ${trips.length} trips to CSV`);
  console.log(`File saved as: ${csvFile}`);
  console.log(`Columns: ${headers.length}`);
  console.log(`Rows: ${trips.length + 1} (including header)`);
}

// Parse command line arguments
function parseArgs(): { inputFile: string; outputFile?: string } {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: bun run convert_to_csv.ts <input.json> [output.csv]");
    console.log("");
    console.log("Arguments:");
    console.log("  input.json    Input JSON file path");
    console.log(
      "  output.csv    Output CSV file path (optional, defaults to input name with .csv extension)"
    );
    console.log("");
    console.log("Examples:");
    console.log("  bun run convert_to_csv.ts data.json");
    console.log("  bun run convert_to_csv.ts data.json output.csv");
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];

  return { inputFile, outputFile };
}

// Main execution
async function main(): Promise<void> {
  try {
    const { inputFile, outputFile } = parseArgs();
    await convertJsonToCsv(inputFile, outputFile);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the conversion
main();
