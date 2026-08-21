const newUrl = 'https://script.google.com/macros/s/AKfycbyFdp043WFv-UY8Xs5BcZy9EK86XFdfKyyJi2vNgfLJo62rCuXfEZeIDJUJDLJyHNVXfQ/exec';

async function testNewUrl() {
  const lotNumber = '61244';
  const status = 'Approved / Completed';
  const remarks = 'Approval Submitted via Pintu';
  const supervisor = 'MONU';

  const query1 = `${newUrl}?action=recordCompletedLot&lotNumber=${encodeURIComponent(lotNumber)}&status=${encodeURIComponent(status)}&remarks=${encodeURIComponent(remarks)}&supervisor=${encodeURIComponent(supervisor)}`;
  console.log('Testing NEW Web App URL:', query1);

  try {
    const res = await fetch(query1);
    console.log('HTTP Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.slice(0, 300));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testNewUrl();
