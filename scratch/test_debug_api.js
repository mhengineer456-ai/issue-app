const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const SHEET_ID = '1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';

async function testFetch() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Completed%20Lots!A:M?key=${API_KEY}`;
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    console.log('Status Code:', res.status);
    const text = await res.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testFetch();
