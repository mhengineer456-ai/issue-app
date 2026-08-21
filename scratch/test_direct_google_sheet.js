const GOOGLE_API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
// Exact ID copied from Chrome URL bar in screenshot
const ID_FROM_URL = '1Ydzo9F2FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';

async function testDirectFetch() {
  console.log('Testing ID:', ID_FROM_URL);
  
  // Try different sheet name variations
  const sheetNames = ['Completed Lots', "'Completed Lots'", 'Sheet1', 'Kaaj Button Issuance'];

  for (const name of sheetNames) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${ID_FROM_URL}/values/${encodeURIComponent(name)}?key=${GOOGLE_API_KEY}`;
    console.log(`\nFetching tab "${name}":`, url);
    try {
      const res = await fetch(url);
      console.log('Response Status:', res.status);
      const data = await res.json();
      if (res.ok) {
        console.log(`🎉 SUCCESS FOR TAB "${name}"!`);
        console.log('Total Rows:', data.values?.length);
        console.log('Headers:', data.values?.[0]);
        console.log('Row 1:', data.values?.[1]);
        return;
      } else {
        console.log('Error:', data.error?.message);
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
    }
  }
}

testDirectFetch();
