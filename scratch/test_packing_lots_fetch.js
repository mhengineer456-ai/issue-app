const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const MAIN_SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';
const RAWPACK_SPREADSHEET_ID = '1xD8Uy1lUgvNTQ2RGRBI4ZjOrozbinUPRq2_UfIplP98';

const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/Index!A:AG?key=${API_KEY}`;
const rawpackUrl = `https://sheets.googleapis.com/v4/spreadsheets/${RAWPACK_SPREADSHEET_ID}/values/RAWPACK!A:ZZ?key=${API_KEY}`;

const fetchJson = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch(e) {
        reject(e);
      }
    });
  }).on('error', reject);
});

async function run() {
  try {
    const [indexData, rawpackData] = await Promise.all([
      fetchJson(indexUrl),
      fetchJson(rawpackUrl).catch(() => ({ values: [] }))
    ]);

    const indexRows = indexData.values || [];
    const rawpackRows = rawpackData.values || [];

    const headers = indexRows[0].map(h => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    const lotIdx = headers.findIndex(h => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
    const completedStatusIdx = headers.findIndex(h => h.includes('completedstatus'));
    const fabricIdx = headers.findIndex(h => h.includes('fabric'));
    const brandIdx = headers.findIndex(h => h.includes('brand'));
    const partyNameIdx = headers.findIndex(h => h.includes('partyname'));

    // RAWPACK lot set
    const rawpackLots = new Set();
    if (rawpackRows.length > 1) {
      const rpHeaders = rawpackRows[0].map(h => (h || '').toString().trim().toLowerCase());
      const rpLotIdx = rpHeaders.findIndex(h => h.includes('lot'));
      for (let i = 1; i < rawpackRows.length; i++) {
        const lot = rpLotIdx !== -1 ? rawpackRows[i][rpLotIdx] : null;
        if (lot) rawpackLots.add(String(lot).trim());
      }
    }

    const readyForPacking = [];
    for (let i = 1; i < indexRows.length; i++) {
      const row = indexRows[i] || [];
      const lotNo = lotIdx !== -1 ? String(row[lotIdx] || '').trim() : '';
      const completedStatus = completedStatusIdx !== -1 ? String(row[completedStatusIdx] || '').trim() : '';

      if (lotNo && completedStatus && !rawpackLots.has(lotNo)) {
        readyForPacking.push({
          lot: lotNo,
          completedStatus,
          fabric: row[fabricIdx],
          brand: row[brandIdx],
          partyName: row[partyNameIdx]
        });
      }
    }

    console.log(`--- READY FOR PACKING LOTS ---`);
    console.log(`Found ${readyForPacking.length} lots ready for packing`);
    console.log('Sample 5 lots:');
    console.log(readyForPacking.slice(0, 5));
  } catch (err) {
    console.error(err);
  }
}

run();
