const STITCHING_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxg2O3h_pFaqfypG0dFCyNkCkD69IAG957VzS5Zc7bGyMQ022WfVVlglA0CtrgqZ0N8/exec';

async function testAppsScriptGet() {
  const url = `${STITCHING_APPS_SCRIPT_URL}?action=getCompletedLots&sheetName=${encodeURIComponent('Completed Lots')}`;
  console.log('Fetching Apps Script URL:', url);
  try {
    const res = await fetch(url);
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    console.log('JSON ok:', json.ok);
    console.log('JSON error:', json.error);
    if (json.values) {
      console.log('Total Rows:', json.values.length);
      console.log('Header Row:', json.values[0]);
      if (json.values.length > 1) {
        console.log('Row 1:', json.values[1]);
        console.log('Row 2:', json.values[2]);
        console.log('Row 3:', json.values[3]);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAppsScriptGet();
