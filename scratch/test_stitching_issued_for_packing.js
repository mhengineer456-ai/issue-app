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

    // Issues set
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

    // RAWPACK set with Packing Person
    const rawpackAssignedLotSet = new Set();
    if (rawpackRows.length > 0) {
      let headerRowIdx = -1;
      for (let i = 0; i < Math.min(rawpackRows.length, 5); i++) {
        const rowStr = (rawpackRows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('lot') && (rowStr.includes('packing person') || rowStr.includes('pcs') || rowStr.includes('item'))) {
          headerRowIdx = i;
          break;
        }
      }
      if (headerRowIdx === -1) headerRowIdx = 1;

      const rpHeaders = (rawpackRows[headerRowIdx] || []).map(h => (h || '').toString().trim().toLowerCase());
      const lotColIdx = rpHeaders.findIndex(h => h.includes('lot no') || h.includes('lot'));
      const personColIdx = rpHeaders.findIndex(h => h.includes('packing person') || h.includes('person'));

      for (let r = headerRowIdx + 1; r < rawpackRows.length; r++) {
        const row = rawpackRows[r] || [];
        const lotNo = lotColIdx !== -1 && row[lotColIdx] ? String(row[lotColIdx]).trim() : '';
        const personName = personColIdx !== -1 && row[personColIdx] ? String(row[personColIdx]).trim() : '';

        if (lotNo && lotNo !== '-' && lotNo !== '0') {
          if (personName && personName !== '-' && personName !== '0' && personName !== '#N/A') {
            rawpackAssignedLotSet.add(lotNo);
          }
        }
      }
    }

    // Index headers
    const indexHeaders = indexRows[0].map(h => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const lotIdx = indexHeaders.findIndex(h => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
    const supervisorIdx = indexHeaders.findIndex(h => h.includes('supervisor'));
    const partyIdx = indexHeaders.findIndex(h => h.includes('partyname') || h.includes('party'));

    const availablePackingLotsWithStitchingPerson = [];
    const excludedNoStitchingPerson = [];

    for (let i = 1; i < indexRows.length; i++) {
      const row = indexRows[i] || [];
      const lotNo = lotIdx !== -1 ? String(row[lotIdx] || '').trim() : '';
      const supervisorVal = supervisorIdx !== -1 ? String(row[supervisorIdx] || '').trim() : '';
      const partyVal = partyIdx !== -1 ? String(row[partyIdx] || '').trim() : '';

      if (!lotNo) continue;

      // RULE: MUST HAVE STITCHING SUPERVISOR ASSIGNED!
      const hasStitchingSupervisor = supervisorVal !== '' && supervisorVal !== '-' && supervisorVal !== 'N/A';
      if (!hasStitchingSupervisor) {
        excludedNoStitchingPerson.push(lotNo);
        continue;
      }

      // Party / Supervisor Exclusion (Dushyant / Jainhosiery)
      const supNorm = supervisorVal.toLowerCase().replace(/\s+/g, '');
      const partyNorm = partyVal.toLowerCase().replace(/\s+/g, '');
      if (
        supNorm.includes('dushyant') ||
        supNorm.includes('jainhosiery') ||
        partyNorm.includes('dushyant') ||
        partyNorm.includes('jainhosiery')
      ) {
        continue;
      }

      // Exclusions: Issues sheet & RAWPACK assigned
      const inIssues = issuesLotSet.has(lotNo);
      const inRawpackAssigned = rawpackAssignedLotSet.has(lotNo);

      if (!inIssues && !inRawpackAssigned) {
        availablePackingLotsWithStitchingPerson.push({ lotNo, supervisorVal, partyVal });
      }
    }

    console.log(`Lots Excluded because NO Stitching Supervisor assigned: ${excludedNoStitchingPerson.length}`);
    console.log(`\nFINAL Available Packing Lots (Stitching Person Assigned): ${availablePackingLotsWithStitchingPerson.length}`);
    console.log('Sample 10:', availablePackingLotsWithStitchingPerson.slice(0, 10));

  } catch(err) {
    console.error(err);
  }
}

run();
