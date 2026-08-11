const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const MAIN_SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/Index!A:AG?key=${API_KEY}`;

https.get(indexUrl, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const rows = json.values || [];
      const headers = rows[0].map(h => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
      
      const lotIdx = headers.findIndex(h => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
      const completedStatusIdx = headers.findIndex(h => h.includes('completedstatus'));
      const fabricIdx = headers.findIndex(h => h.includes('fabric'));
      const brandIdx = headers.findIndex(h => h.includes('brand'));
      const cuttingQtyIdx = headers.findIndex(h => h.includes('cuttingqty') || h.includes('totalpcs'));
      const dateOfIssueIdx = headers.findIndex(h => h.includes('dateofissue'));
      const supervisorIdx = headers.findIndex(h => h.includes('supervisor'));

      const packingIssuedLots = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        const lotNo = lotIdx !== -1 ? String(row[lotIdx] || '').trim() : '';
        const completedStatus = completedStatusIdx !== -1 ? String(row[completedStatusIdx] || '').trim() : '';

        if (lotNo && completedStatus !== '' && completedStatus !== '-') {
          packingIssuedLots.push({
            lotNumber: lotNo,
            completedStatus: completedStatus,
            fabric: row[fabricIdx] || 'N/A',
            brand: row[brandIdx] || 'N/A',
            cuttingQty: row[cuttingQtyIdx] || '0',
            dateOfIssue: row[dateOfIssueIdx] || '',
            supervisor: row[supervisorIdx] || ''
          });
        }
      }

      console.log(`--- PACKING ISSUED LOTS FROM INDEX SHEET ---`);
      console.log(`Total Issued Packing Lots: ${packingIssuedLots.length}`);
      console.log('Sample 5 packing lots:');
      console.log(packingIssuedLots.slice(0, 5));
    } catch(e) {
      console.error(e);
    }
  });
});
