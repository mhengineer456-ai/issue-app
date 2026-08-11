const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Index!A:AG?key=${API_KEY}`;

https.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const rows = json.values || [];
      const headers = rows[0];
      const supervisorIdx = headers.findIndex(h => h && h.toLowerCase().trim() === 'supervisor');
      const lotIdx = headers.findIndex(h => h && h.toLowerCase().includes('lot'));
      const fabricIdx = headers.findIndex(h => h && h.toLowerCase().trim() === 'fabric');
      const brandIdx = headers.findIndex(h => h && h.toLowerCase().trim() === 'brand');
      const cuttingQtyIdx = headers.findIndex(h => h && h.toLowerCase().trim() === 'cutting qty');

      const available = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const sup = row[supervisorIdx];
        const lotNo = row[lotIdx];
        if (lotNo && (!sup || sup.trim() === '')) {
          available.push({
            lot: lotNo,
            fabric: row[fabricIdx],
            brand: row[brandIdx],
            qty: row[cuttingQtyIdx]
          });
        }
      }

      console.log(`Available Lots (Supervisor Empty): ${available.length} out of ${rows.length - 1} total lots`);
      console.log('First 5 available lots:');
      console.log(available.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  });
});
