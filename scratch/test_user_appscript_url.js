const USER_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz9ofgmid-74YQ61oRUN6d4crBlF5FfG5qjeXDg2bUoLoZ7eBWkRVx58t4UzfNODuuzfA/exec';

async function testUserAppsScript() {
  console.log('Testing User Provided Apps Script URL:', USER_SCRIPT_URL);
  
  // Test GET updatestatus
  const getUrl = `${USER_SCRIPT_URL}?action=updatestatus&type=completed&lot=61244&status=${encodeURIComponent('Complete Lot')}&remarks=${encodeURIComponent('Approval Test')}&supervisor=MONU`;
  console.log('GET URL:', getUrl);
  try {
    const res = await fetch(getUrl);
    console.log('HTTP Status Code:', res.status);
    const text = await res.text();
    console.log('Response:', text.slice(0, 300));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testUserAppsScript();
