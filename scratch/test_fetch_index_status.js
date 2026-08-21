const apiKey = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const spreadsheetId = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

async function testIndexStatus() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Index!A1:Z100?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log('Error HTTP:', res.status);
      return;
    }
    const data = await res.json();
    const rows = data.values || [];
    console.log('Headers (Row 1):', rows[0]);
    if (rows.length > 1) {
      console.log('First Data Row (Row 2):', rows[1]);
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testIndexStatus();
