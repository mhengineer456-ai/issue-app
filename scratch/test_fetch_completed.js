const apiKey = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const sheetId = '1Ydzo9F22FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';
const sheetName = 'Completed Lots';

async function testFetch() {
  const range = `${encodeURIComponent(sheetName)}!A:M`;
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  console.log('Testing Fetch URL:', apiUrl);
  try {
    const res = await fetch(apiUrl);
    console.log('HTTP Status:', res.status);
    const data = await res.json();
    console.log('Fetched rows:', (data.values || []).length);
    console.log('First 2 rows:', data.values ? data.values.slice(0, 2) : 'No values');
  } catch (err) {
    console.error('Error:', err);
  }
}

testFetch();
