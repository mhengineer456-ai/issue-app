const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const MAIN_SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';
const ISSUES_SPREADSHEET_ID = '1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM';
const RAWPACK_SPREADSHEET_ID = '1xD8Uy1lUgvNTQ2RGRBI4ZjOrozbinUPRq2_UfIplP98';

const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/Index!A:AG?key=${API_KEY}`;
const issuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${ISSUES_SPREADSHEET_ID}/values/Issues!A:R?key=${API_KEY}`;
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
    const [indexData, issuesData, rawpackData] = await Promise.all([
      fetchJson(indexUrl),
      fetchJson(issuesUrl),
      fetchJson(rawpackUrl)
    ]);

    const indexRows = indexData.values || [];
    const issuesRows = issuesData.values || [];
    const rawpackRows = rawpackData.values || [];

    console.log(`RAWPACK Total Rows: ${rawpackRows.length}`);

    // Find Header row in RAWPACK (row containing 'lot' and 'packing person')
    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(rawpackRows.length, 5); i++) {
      const rowStr = (rawpackRows[i] || []).join(' ').toLowerCase();
      if (rowStr.includes('lot') && (rowStr.includes('packing person') || rowStr.includes('pcs') || rowStr.includes('item'))) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx === -1) headerRowIdx = 1; // Default to row 2 (index 1)

    console.log(`Header Row Index in RAWPACK: ${headerRowIdx} (1-indexed: ${headerRowIdx + 1})`);
    const rpHeaders = (rawpackRows[headerRowIdx] || []).map(h => (h || '').toString().trim().toLowerCase());
    console.log('RAWPACK Headers:', rpHeaders);

    const lotColIdx = rpHeaders.findIndex(h => h.includes('lot no') || h.includes('lot'));
    const personColIdx = rpHeaders.findIndex(h => h.includes('packing person') || h.includes('person'));

    console.log(`Lot Col Index: ${lotColIdx}, Packing Person Col Index: ${personColIdx}`);

    // Set of excluded lots from RAWPACK where PACKING PERSON is present
    const rawpackAssignedLots = new Set();
    const rawpackUnassignedLots = [];

    for (let r = headerRowIdx + 1; r < rawpackRows.length; r++) {
      const row = rawpackRows[r] || [];
      const lotVal = lotColIdx !== -1 ? row[lotColIdx] : null;
      const personVal = personColIdx !== -1 ? row[personColIdx] : null;

      const lotNo = lotVal ? String(lotVal).trim() : '';
      const personName = personVal ? String(personVal).trim() : '';

      if (lotNo && lotNo !== '-' && lotNo !== '0') {
        if (personName && personName !== '-' && personName !== '0' && personName !== '#N/A') {
          rawpackAssignedLots.add(lotNo);
        } else {
          rawpackUnassignedLots.push(lotNo);
        }
      }
    }

    console.log(`RAWPACK Lots WITH Packing Person Assigned (Excluded): ${rawpackAssignedLots.size}`);
    console.log(`RAWPACK Lots WITHOUT Packing Person (Retained): ${rawpackUnassignedLots.length}`);
    console.log('Sample Unassigned Lots in RAWPACK:', rawpackUnassignedLots.slice(0, 5));

    // Issues Lot Set
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

    // Now calculate net Available Packing Lots
    const indexHeaders = indexRows[0].map(h => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const lotIdx = indexHeaders.findIndex(h => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
    const completedStatusIdx = indexHeaders.findIndex(h => h.includes('completedstatus'));

    const availablePackingLots = [];

    for (let i = 1; i < indexRows.length; i++) {
      const row = indexRows[i] || [];
      const lotNo = lotIdx !== -1 ? String(row[lotIdx] || '').trim() : '';
      const completedStatus = completedStatusIdx !== -1 ? String(row[completedStatusIdx] || '').trim() : '';

      if (lotNo && completedStatus !== '' && completedStatus !== '-') {
        // Exclude if in Issues sheet OR in RAWPACK sheet with a Packing Person assigned
        const inIssues = issuesLotSet.has(lotNo);
        const inRawpackAssigned = rawpackAssignedLots.has(lotNo);

        if (!inIssues && !inRawpackAssigned) {
          availablePackingLots.push(lotNo);
        }
      }
    }

    console.log(`\nTOTAL AVAILABLE PACKING LOTS READY FOR ALLOTMENT: ${availablePackingLots.length}`);
    console.log('Sample 10 Available Packing Lots:', availablePackingLots.slice(0, 10));

  } catch(err) {
    console.error(err);
  }
}

run();
