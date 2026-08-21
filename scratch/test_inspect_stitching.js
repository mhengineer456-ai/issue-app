const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const STITCHING_ID = '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA';

async function inspectStitchingSpreadsheet() {
  const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${STITCHING_ID}?key=${API_KEY}`;
  try {
    const res = await fetch(metaUrl);
    const data = await res.json();
    console.log('Title:', data.properties?.title);
    const sheets = (data.sheets || []).map(s => s.properties?.title);
    console.log('Sheets:', sheets);

    for (const sheetName of sheets) {
      console.log(`\n--- Content of tab "${sheetName}" ---`);
      const valUrl = `https://sheets.googleapis.com/v4/spreadsheets/${STITCHING_ID}/values/${encodeURIComponent(sheetName)}!A:M?key=${API_KEY}`;
      const valRes = await fetch(valUrl);
      const valData = await valRes.json();
      console.log('Rows count:', valData.values?.length || 0);
      if (valData.values && valData.values.length > 0) {
        console.log('Headers:', valData.values[0]);
        console.log('Sample Row 1:', valData.values[1]);
        if (valData.values.length > 2) console.log('Sample Row 2:', valData.values[2]);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

inspectStitchingSpreadsheet();
