const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSSO_E4yCfc-_HPDcUOgiZfU1CzIqHLDHMl2R79DTVBDMe-bnJB0H7mygohuM2E62EFw/exec';
const STITCHING_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxg2O3h_pFaqfypG0dFCyNkCkD69IAG957VzS5Zc7bGyMQ022WfVVlglA0CtrgqZ0N8/exec';

async function testScriptActions() {
  const actions = [
    { name: 'APPS_SCRIPT read Completed Lots', url: `${APPS_SCRIPT_URL}?action=read&sheetName=Completed%20Lots` },
    { name: 'APPS_SCRIPT getCompletedLots', url: `${APPS_SCRIPT_URL}?action=getCompletedLots` },
    { name: 'APPS_SCRIPT getData', url: `${APPS_SCRIPT_URL}?action=getData&sheetName=Completed%20Lots` },
    { name: 'STITCHING_APPS_SCRIPT read', url: `${STITCHING_APPS_SCRIPT_URL}?action=read&sheetName=Completed%20Lots` },
    { name: 'STITCHING_APPS_SCRIPT getData', url: `${STITCHING_APPS_SCRIPT_URL}?action=getData&sheetName=Completed%20Lots` },
  ];

  for (const item of actions) {
    console.log(`\n--- Testing ${item.name} ---`);
    try {
      const res = await fetch(item.url);
      const data = await res.json();
      console.log('Status:', res.status);
      console.log('Keys:', Object.keys(data));
      console.log('Sample:', JSON.stringify(data).slice(0, 300));
    } catch (err) {
      console.log('Error:', err.message);
    }
  }
}

testScriptActions();
