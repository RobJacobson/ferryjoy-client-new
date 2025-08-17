# Scripts Directory

This directory contains utility scripts for the FerryJoy project.

## convert_to_csv.ts

A generic CSV converter that automatically detects and converts Unix timestamps to ISO format.

### Features

- **Generic**: Works with any JSON structure containing a `trips` array
- **Smart Timestamp Detection**: Automatically detects Unix timestamps using duck-typing
- **Automatic Column Discovery**: Dynamically finds all columns from the data
- **Flexible Output**: Supports custom output filenames

### Usage

```bash
# Basic usage - output to input_name.csv
bun run scripts/convert_to_csv.ts <input.json>

# Custom output filename
bun run scripts/convert_to_csv.ts <input.json> <output.csv>

# Examples
bun run scripts/convert_to_csv.ts data.json
bun run scripts/convert_to_csv.ts data.json results.csv
```

### Input Format

The script expects a JSON file with this structure:
```json
{
  "trips": [
    {
      "field1": "value1",
      "field2": 123,
      "timestamp": 1754634000000,
      ...
    }
  ]
}
```

### Output

- Automatically converts Unix timestamps to ISO format (e.g., `2025-08-08T06:20:00.000Z`)
- Creates a CSV with all discovered columns
- Columns are sorted alphabetically for consistency
- Handles all data types (strings, numbers, booleans, nulls)

### Timestamp Detection

The script uses intelligent heuristics to detect Unix timestamps:
- **Range**: 2001-2033 (reasonable bounds for ferry data)
- **Formats**: Supports seconds, milliseconds, and microseconds
- **Validation**: Checks for reasonable timestamp values

### Error Handling

- Validates input file existence
- Graceful handling of malformed JSON
- Clear error messages and usage instructions
