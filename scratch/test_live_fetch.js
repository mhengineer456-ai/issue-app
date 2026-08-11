const https = require('https');

const API_KEY = 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
const SPREADSHEET_ID = '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Index!A:AG?key=${API_KEY}`;

https.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      if (json.values && json.values.length > 0) {
        console.log('--- HEADERS IN INDEX SHEET ---');
        console.log(json.values[0]);
        console.log('\n--- SAMPLE ROW 1 ---');
        console.log(json.values[1]);
        console.log(`\nTotal rows: ${json.values.length}`);
      } else {
        console.log('Response:', json);
      }
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', (e) => console.error(e));
