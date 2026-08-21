const STITCHING_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxg2O3h_pFaqfypG0dFCyNkCkD69IAG957VzS5Zc7bGyMQ022WfVVlglA0CtrgqZ0N8/exec';

async function testAppsScriptGetCompletedLots() {
  const url = `${STITCHING_APPS_SCRIPT_URL}?action=getCompletedLots&sheetName=${encodeURIComponent('Completed Lots')}`;
  console.log('Testing Apps Script URL:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Apps Script Data:', data);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testAppsScriptGetCompletedLots();
