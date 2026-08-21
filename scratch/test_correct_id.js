const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const CORRECT_ID = '1Ydzo9F22FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';

async function testCorrectSpreadsheetId() {
  console.log('Testing CORRECT Spreadsheet ID:', CORRECT_ID);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CORRECT_ID}/values/Completed%20Lots!A:M?key=${API_KEY}`;
  console.log('Fetching URL:', url);
  try {
    const res = await fetch(url);
    console.log('HTTP Status Code:', res.status);
    const data = await res.json();
    if (res.ok) {
      console.log('🎉🎉🎉 BINGO! BINGO! BINGO! SUCCESSFUL FETCH WITH CORRECT ID!');
      console.log('Total Rows:', data.values?.length);
      console.log('Headers:', data.values?.[0]);
      console.log('Row 1:', data.values?.[1]);
      console.log('Row 2:', data.values?.[2]);
      console.log('Row 3:', data.values?.[3]);
    } else {
      console.log('Error:', data);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testCorrectSpreadsheetId();
