const apiKey = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const spreadsheetId = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

async function testFiltration() {
  const range = 'Index!A:Z';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const rows = data.values || [];

    const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const lotIdx = headers.findIndex((h) => h.includes('lotnumber') || h.includes('lotno') || h === 'lot');
    const compStatusIdx = headers.findIndex((h) => h.includes('completedstatus') || h.includes('completestatus') || h === 'status');

    console.log('Lot Number Header Index:', lotIdx);
    console.log('Completed Status Header Index:', compStatusIdx);

    const completedSet = new Set();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const lotNo = row[lotIdx] ? row[lotIdx].toString().trim() : '';
      const compStatusVal = compStatusIdx !== -1 && row[compStatusIdx] ? row[compStatusIdx].toString().trim() : '';

      if (lotNo && compStatusVal) {
        const lowerVal = compStatusVal.toLowerCase();
        if (
          lowerVal.includes('complete') ||
          lowerVal.includes('approved') ||
          lowerVal.includes('submitted') ||
          lowerVal.includes('done') ||
          lowerVal.includes('finish')
        ) {
          completedSet.add(lotNo);
        }
      }
    }

    console.log('Completed Lot Numbers in Index Sheet:', Array.from(completedSet));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testFiltration();
