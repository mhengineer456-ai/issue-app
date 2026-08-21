const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSSO_E4yCfc-_HPDcUOgiZfU1CzIqHLDHMl2R79DTVBDMe-bnJB0H7mygohuM2E62EFw/exec';
const STITCHING_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxg2O3h_pFaqfypG0dFCyNkCkD69IAG957VzS5Zc7bGyMQ022WfVVlglA0CtrgqZ0N8/exec';

async function testAppsScripts() {
  console.log('Testing Packing Apps Script...');
  try {
    const res1 = await fetch(`${APPS_SCRIPT_URL}?action=getCompletedLots`);
    console.log('Packing Apps Script status:', res1.status);
    const json1 = await res1.json();
    console.log('Packing Apps Script response:', json1);
  } catch (e) {
    console.error('Packing Apps Script error:', e.message);
  }

  console.log('\nTesting Stitching Apps Script...');
  try {
    const res2 = await fetch(`${STITCHING_APPS_SCRIPT_URL}?action=getCompletedLots`);
    console.log('Stitching Apps Script status:', res2.status);
    const json2 = await res2.json();
    console.log('Stitching Apps Script response:', json2);
  } catch (e) {
    console.error('Stitching Apps Script error:', e.message);
  }
}

testAppsScripts();
