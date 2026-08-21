const REAL_SPREADSHEET_ID = '1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';
const GID = '321609697';

async function testDirectExportCsv() {
  const exportUrl = `https://docs.google.com/spreadsheets/d/${REAL_SPREADSHEET_ID}/export?format=csv&gid=${GID}`;
  console.log('Fetching Direct Export CSV URL:', exportUrl);
  try {
    const res = await fetch(exportUrl);
    console.log('HTTP Response Status:', res.status);
    const text = await res.text();
    console.log('Response Content-Type:', res.headers.get('content-type'));
    console.log('First 500 characters of response:\n', text.slice(0, 500));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testDirectExportCsv();
