import * as XLSX from "xlsx";
import * as path from "path";

async function readExcel() {
  const workbook = XLSX.readFile(path.join(process.cwd(), "..", "KARTU INVENTARIS RUANGAN 2026.xlsx"));

  console.log("=== Excel File Structure ===\n");
  console.log("Sheet names:", workbook.SheetNames);
  console.log("\nTotal sheets:", workbook.SheetNames.length);

  console.log("\n=== Sheet Details ===\n");

  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Sheet ${index + 1}: ${sheetName}`);
    console.log("=".repeat(60));

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`\nTotal rows: ${data.length}`);

    if (data.length > 0) {
      console.log("\nFirst 5 rows:");
      data.slice(0, 5).forEach((row, idx) => {
        console.log(`Row ${idx + 1}:`, row);
      });
    }
  });
}

readExcel().catch(console.error);
