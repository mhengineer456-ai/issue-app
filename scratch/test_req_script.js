const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSSO_E4yCfc-_HPDcUOgiZfU1CzIqHLDHMl2R79DTVBDMe-bnJB0H7mygohuM2E62EFw/exec';

async function testRequirementsAppsScript() {
  const url = `${APPS_SCRIPT_URL}?action=getCompletedLots`;
  console.log('Fetching Requirements Apps Script URL:', url);
  try {
    const res = await fetch(url);
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    console.log('Response JSON keys:', Object.keys(json));
    console.log('Status:', json.status);
    if (json.completedRecords) {
      console.log('Total completedRecords:', json.completedRecords.length);
      console.log('Sample completedRecord 1:', json.completedRecords[0]);
    }
    if (json.values) {
      console.log('Total raw values rows:', json.values.length);
      console.log('Row 0:', json.values[0]);
      console.log('Row 1:', json.values[1]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testRequirementsAppsScript();
