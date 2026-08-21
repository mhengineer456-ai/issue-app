const USER_API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';

const SPREADSHEETS = [
  { title: 'REQUIREMENTS', id: '1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA' },
  { title: 'REQUIREMENTS (alt_id)', id: '1Ydzo9F2FUsU_VTQdUfz12uQ_l4E_B0fhp0w4H0DYA' },
  { title: 'STITCHING (LOT ISSUED BY PINTU)', id: '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA' },
  { title: 'MAIN INDEX (CUTTING MATRIX)', id: '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA' },
  { title: 'PACKING ISSUES', id: '1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM' },
  { title: 'RAWPACK', id: '1xD8Uy1lUgvNTQ2RGRBI4ZjOrozbinUPRq2_UfIplP98' }
];

async function testUserKeyOnAll() {
  console.log('Testing User API Key:', USER_API_KEY);
  for (const item of SPREADSHEETS) {
    console.log(`\n==================================================`);
    console.log(`Checking ${item.title} (ID: ${item.id})`);
    
    // First fetch metadata to list tabs
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${item.id}?key=${USER_API_KEY}`;
    try {
      const res = await fetch(metaUrl);
      console.log('Metadata HTTP Status:', res.status);
      if (!res.ok) {
        const errText = await res.text();
        console.log('API Error:', errText.slice(0, 150));
        continue;
      }
      const meta = await res.json();
      const sheetTitles = (meta.sheets || []).map(s => s.properties?.title);
      console.log('🎉 200 OK! Available Sheet Tabs:', sheetTitles);

      for (const tabName of sheetTitles) {
        const valUrl = `https://sheets.googleapis.com/v4/spreadsheets/${item.id}/values/${encodeURIComponent(tabName)}!A:M?key=${USER_API_KEY}`;
        const valRes = await fetch(valUrl);
        if (valRes.ok) {
          const valData = await valRes.json();
          console.log(`  -> Tab "${tabName}": ${valData.values?.length || 0} rows found`);
          if (valData.values && valData.values.length > 0) {
            console.log(`     Headers:`, valData.values[0]);
            if (valData.values.length > 1) console.log(`     Row 1:`, valData.values[1]);
          }
        }
      }
    } catch (e) {
      console.error('Fetch error:', e.message);
    }
  }
}

testUserKeyOnAll();
