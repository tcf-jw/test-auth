import type { ParsedData, Row } from "./data";

// Fake, illustrative data only — NEVER put real protected data here. This is
// bundled into the public build and served to anyone who opens ?demo=1.

function toSheet(name: string, columns: string[], values: unknown[][]) {
  const rows: Row[] = values.map((vals) => {
    const row: Row = {};
    columns.forEach((c, i) => (row[c] = vals[i] ?? null));
    return row;
  });
  return { name, columns, rows };
}

const BOM_COLS = [
  "Part Number",
  "Description",
  "Supplier",
  "Qty",
  "Unit Cost",
  "Lead Time (days)",
  "Last Updated",
];

const SUPPLIER_COLS = ["Supplier", "Region", "Contact", "Rating", "On-Time %"];

export const DEMO_DATA: ParsedData = {
  kind: "xlsx",
  sheets: [
    toSheet("BOM", BOM_COLS, [
      ["TC-1001", "Blade assembly, 12in", "Acme Tooling", 4, 38.5, 21, "2026-01-14"],
      ["TC-1002", "Drive belt, type B", "Belted Co", 8, 6.25, 7, "2026-02-03"],
      ["TC-1003", "Bearing, sealed 6203", "RollRight", 16, 2.1, 14, "2026-02-18"],
      ["TC-1004", "Motor mount bracket", "FabWorks", 2, 19.9, 30, "2026-01-29"],
      ["TC-1005", "Control board v3", "Circuitry Ltd", 1, 142.0, 45, "2026-03-09"],
      ["TC-1006", "Power cable, 2m IEC", "Acme Tooling", 6, 4.75, 5, "2026-02-22"],
      ["TC-1007", "Safety guard, clear", "FabWorks", 3, 27.4, 18, "2026-03-15"],
      ["TC-1008", "Fastener kit M5", "BoltBarn", 40, 0.18, 3, "2026-01-07"],
      ["TC-1009", "Cooling fan 80mm", "Circuitry Ltd", 5, 9.6, 12, "2026-02-11"],
      ["TC-1010", "Rubber foot, set of 4", "BoltBarn", 12, 1.95, 6, "2026-03-01"],
    ]),
    toSheet("Supplier Map", SUPPLIER_COLS, [
      ["Acme Tooling", "AU-VIC", "orders@acme.example", "A", 0.97],
      ["Belted Co", "AU-NSW", "sales@belted.example", "B", 0.91],
      ["RollRight", "NZ", "hello@rollright.example", "A", 0.95],
      ["FabWorks", "AU-QLD", "quote@fabworks.example", "B", 0.88],
      ["Circuitry Ltd", "SG", "support@circuitry.example", "A", 0.99],
      ["BoltBarn", "AU-VIC", "team@boltbarn.example", "C", 0.82],
    ]),
  ],
};
