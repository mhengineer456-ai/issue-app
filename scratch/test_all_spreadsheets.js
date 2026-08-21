const GOOGLE_API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const idsToTry = [
  { name: 'COMPLETED_LOTS_SPREADSHEET_ID', id: '1Ydzo9F2FUsU_VTQdUfz12uQ_l4E_B0fhp0w4H0DYA' },
  { name: 'SPREADSHEET_ID', id: '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA' },
  { name: 'ISSUES_SPREADSHEET_ID', id: '1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM' },
  { name: 'RAWPACK_SPREADSHEET_ID', id: '1xD8Uy1lUgvNTQ2RGRBI4ZjOrozbinUPRq2_UfIplP98' },
  { name: 'STITCHING_SPREADSHEET_ID', id: '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA' },
];

async function testAllSpreadsheetsForCompletedLots() {
  for (const item of idsToTry) {
    console.log(`\n=== Trying ${item.name} (${item.id}) ===`);
    const sheetName = 'Completed Lots';
    
    // 1. Google Sheets API v4
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${item.id}/values/${encodeURIComponent(sheetName)}!A:M?key=${GOOGLE_API_KEY}`;
    try {
      const res = await fetch(apiUrl);
      console.log('API Status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('API SUCCESS! Rows:', data.values?.length);
        if (data.values?.length > 1) {
          console.log('Headers:', data.values[0]);
          console.log('Sample Row 1:', data.values[1]);
        }
        return;
      }
    } catch (e) {
      console.log('API Fetch Error:', e.message);
    }

    // 2. CSV GVIZ Endpoint
    const csvUrl = `https://docs.google.com/spreadsheets/d/${item.id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    try {
      const res = await fetch(csvUrl);
      console.log('CSV Status:', res.status);
      if (res.ok) {
        const text = await res.text();
        if (!text.includes('<!DOCTYPE html>')) {
          console.log('CSV SUCCESS! Sample text:', text.slice(0, 200));
          return;
        }
      }
    } catch (e) {
      console.log('CSV Fetch Error:', e.message);
    }
  }
}

testAllSpreadsheetsForCompletedLots();
