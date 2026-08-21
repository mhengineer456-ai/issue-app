const reqScriptUrl = 'https://script.google.com/macros/s/AKfycbxXOPPzEoriBPLzBjcuFmmNNZHPkgiIwHfAq3elDnwAgm8fDAAc0QbFNMfC7WOk4QTTmA/exec';

async function testUpdateCompletedSheet() {
  const lotNumber = '61244';
  const status = 'Approved / Completed';
  const remarks = 'Approval Submitted via Pintu';
  const supervisor = 'MONU';

  const queryUrl = `${reqScriptUrl}?action=recordCompletedLot&lotNumber=${encodeURIComponent(lotNumber)}&status=${encodeURIComponent(status)}&remarks=${encodeURIComponent(remarks)}&supervisor=${encodeURIComponent(supervisor)}`;
  console.log('Sending GET request to Requirements Web App:', queryUrl);

  try {
    const res = await fetch(queryUrl);
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    console.log('Response JSON:', json);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testUpdateCompletedSheet();
