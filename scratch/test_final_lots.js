const apiKey = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const compSheetId = '1Ydzo9F22FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';
const indexSheetId = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

async function testFinalLots() {
  console.log('--- 1. Fetching Completed Lots Sheet ---');
  const compUrl = `https://sheets.googleapis.com/v4/spreadsheets/${compSheetId}/values/Completed%20Lots!A:M?key=${apiKey}`;
  const compRes = await fetch(compUrl);
  const compData = await compRes.json();
  const compRows = compData.values || [];

  const rawLots = compRows.slice(1).map((r) => ({
    lotNumber: r[3] ? r[3].toString().trim() : '',
    party: r[4] ? r[4].toString().trim() : '',
    brand: r[5] ? r[5].toString().trim() : '',
  })).filter((l) => !!l.lotNumber);

  console.log('Total Raw Lots in Completed Lots Sheet Tab:', rawLots.length);

  console.log('--- 2. Fetching Index Sheet Completed Status Set ---');
  const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${indexSheetId}/values/Index!A:Z?key=${apiKey}`;
  const indexRes = await fetch(indexUrl);
  const indexData = await indexRes.json();
  const indexRows = indexData.values || [];

  const headers = indexRows[0].map((h) => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  const lotIdx = headers.findIndex((h) => h.includes('lotnumber') || h.includes('lotno') || h === 'lot');
  const compStatusIdx = headers.findIndex((h) => h.includes('completedstatus') || h.includes('completestatus') || h === 'status');

  const completedSet = new Set();
  for (let i = 1; i < indexRows.length; i++) {
    const row = indexRows[i] || [];
    const lotNo = row[lotIdx] ? row[lotIdx].toString().trim() : '';
    const compStatusVal = compStatusIdx !== -1 && row[compStatusIdx] ? row[compStatusIdx].toString().trim() : '';

    if (lotNo && compStatusVal) {
      const lowerVal = compStatusVal.toLowerCase();
      if (
        lowerVal.includes('complete') ||
        lowerVal.includes('approved') ||
        lowerVal.includes('submitted')
      ) {
        completedSet.add(lotNo.toLowerCase());
      }
    }
  }

  console.log('--- 3. Applying Filtration (Index Completed Status Column V) ---');
  const visibleLots = rawLots.filter((lot) => !completedSet.has(lot.lotNumber.toLowerCase()));

  console.log('Visible Lots in UI (Pending Index Approval):', visibleLots);
}

testFinalLots();
