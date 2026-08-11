const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const MAIN_SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${MAIN_SPREADSHEET_ID}/values/Index!A:AG?key=${API_KEY}`;

https.get(indexUrl, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      const rows = json.values || [];
      console.log('Headers:', rows[0]);
      
      const partyCounts = {};

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || [];
        for (let col = 0; col < row.length; col++) {
          const val = String(row[col] || '').trim();
          if (
            val.toLowerCase().includes('jain') ||
            val.toLowerCase().includes('dushyant') ||
            val.toLowerCase().includes('hosiery')
          ) {
            console.log(`Found matching text "${val}" at Row ${i + 1}, Col ${col} (${rows[0][col]})`);
            partyCounts[val] = (partyCounts[val] || 0) + 1;
          }
        }
      }

      console.log('\nMatching Party Values Summary:', partyCounts);

    } catch(e) {
      console.error(e);
    }
  });
});
