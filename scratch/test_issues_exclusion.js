const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const MAIN_SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';
const ISSUES_SPREADSHEET_ID = '1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM';

const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/Index!A:AG?key=${API_KEY}`;
const issuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${ISSUES_SPREADSHEET_ID}/values/Issues!A:R?key=${API_KEY}`;

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
    const [indexData, issuesData] = await Promise.all([
      fetchJson(indexUrl),
      fetchJson(issuesUrl)
    ]);

    const indexRows = indexData.values || [];
    const issuesRows = issuesData.values || [];

    console.log(`Index Total Rows: ${indexRows.length}`);
    console.log(`Issues Total Rows: ${issuesRows.length}`);

    // Parse Issues Lot Numbers
    const issuesLotSet = new Set();
    if (issuesRows.length > 0) {
      const iHeaders = issuesRows[0].map(h => (h || '').toString().trim().toLowerCase());
      const iLotIdx = iHeaders.findIndex(h => h.includes('lot number') || h.includes('lot'));
      for (let r = 1; r < issuesRows.length; r++) {
        const lotVal = iLotIdx !== -1 ? issuesRows[r][iLotIdx] : null;
        if (lotVal && String(lotVal).trim()) {
          issuesLotSet.add(String(lotVal).trim());
        }
      }
    }

    console.log(`Unique Lots in Issues Sheet: ${issuesLotSet.size}`);

    // Filter Packing Lots from Index
    const indexHeaders = indexRows[0].map(h => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const lotIdx = indexHeaders.findIndex(h => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
    const completedStatusIdx = indexHeaders.findIndex(h => h.includes('completedstatus'));

    const beforeExclusion = [];
    const afterExclusion = [];

    for (let i = 1; i < indexRows.length; i++) {
      const row = indexRows[i] || [];
      const lotNo = lotIdx !== -1 ? String(row[lotIdx] || '').trim() : '';
      const completedStatus = completedStatusIdx !== -1 ? String(row[completedStatusIdx] || '').trim() : '';

      if (lotNo && completedStatus !== '' && completedStatus !== '-') {
        beforeExclusion.push(lotNo);
        if (!issuesLotSet.has(lotNo)) {
          afterExclusion.push(lotNo);
        }
      }
    }

    console.log(`\nIssued Lots in Index: ${beforeExclusion.length}`);
    console.log(`Available Packing Lots AFTER excluding Issues sheet: ${afterExclusion.length}`);
    console.log(`Excluded Lots Count: ${beforeExclusion.length - afterExclusion.length}`);

  } catch(err) {
    console.error(err);
  }
}

run();
