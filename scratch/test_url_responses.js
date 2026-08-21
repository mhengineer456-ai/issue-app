const url1 = 'https://script.google.com/macros/s/AKfycbyFdp043WFv-UY8Xs5BcZy9EK86XFdfKyyJi2vNgfLJo62rCuXfEZeIDJUJDLJyHNVXfQ/exec';
const url2 = 'https://script.google.com/macros/s/AKfycbz9ofgmid-74YQ61oRUN6d4crBlF5FfG5qjeXDg2bUoLoZ7eBWkRVx58t4UzfNODuuzfA/exec';

async function testBothUrls() {
  console.log('--- Testing URL 1 (AKfycbyFdp...) ---');
  try {
    const res1 = await fetch(`${url1}?action=ping`);
    console.log('URL 1 ping status:', res1.status);
    const text1 = await res1.text();
    console.log('URL 1 ping response:', text1);
  } catch (e) {
    console.error('URL 1 error:', e.message);
  }

  console.log('--- Testing URL 2 (AKfycbz9of...) ---');
  try {
    const res2 = await fetch(`${url2}?action=ping`);
    console.log('URL 2 ping status:', res2.status);
    const text2 = await res2.text();
    console.log('URL 2 ping response:', text2);
  } catch (e) {
    console.error('URL 2 error:', e.message);
  }
}

testBothUrls();
