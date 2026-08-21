const SHEELAGURU_GARMENT_TYPES = [
  'WINDCHEATER',
  'JACKET',
  'TRACK SUIT',
  'TRACKSUIT',
  'TRACKSUIT + LOWER',
  'TS - UPPER',
  'TS - LOWER',
  'S/L JACKET',
  'SL JACKET',
];

const isLotAllowedForUser = (user, lot) => {
  if (!user) return true;
  const operator = (typeof user === 'string' ? user : user.operatorId || user.name || '').toUpperCase().trim();

  if (operator === 'SHEELAGURU') {
    if (!lot) return false;
    const garment = (lot['Garment Type'] || lot.garmentType || lot.garment || '').toString().toUpperCase().trim();
    if (!garment) return false;

    return SHEELAGURU_GARMENT_TYPES.some((allowed) => {
      const cleanAllowed = allowed.toUpperCase().trim();
      return (
        garment === cleanAllowed ||
        garment.includes(cleanAllowed) ||
        cleanAllowed.includes(garment)
      );
    });
  }

  return true;
};

console.log('--- Allowed Garment Types for SHEELAGURU ---');
console.log(SHEELAGURU_GARMENT_TYPES);

const testLots = [
  { 'Lot Number': '101', 'Garment Type': 'WINDCHEATER' },
  { 'Lot Number': '102', 'Garment Type': 'JACKET' },
  { 'Lot Number': '103', 'Garment Type': 'LOWER' },
  { 'Lot Number': '104', 'Garment Type': 'TS - UPPER' },
  { 'Lot Number': '105', 'Garment Type': 'SWEATSHIRT' },
  { 'Lot Number': '106', 'Garment Type': 'S/L JACKET' },
  { 'Lot Number': '107', 'Garment Type': 'TRACKSUIT + LOWER' },
];

console.log('\n--- 1. Testing Logged In User: PINTU ---');
const pintuUser = { operatorId: 'PINTU' };
const pintuFiltered = testLots.filter((lot) => isLotAllowedForUser(pintuUser, lot));
console.log('PINTU Visible Lots Count:', pintuFiltered.length, 'of', testLots.length);
console.log('PINTU Lots:', pintuFiltered.map((l) => `${l['Lot Number']} (${l['Garment Type']})`));

console.log('\n--- 2. Testing Logged In User: SHEELAGURU ---');
const sheelaUser = { operatorId: 'SHEELAGURU' };
const sheelaFiltered = testLots.filter((lot) => isLotAllowedForUser(sheelaUser, lot));
console.log('SHEELAGURU Visible Lots Count:', sheelaFiltered.length, 'of', testLots.length);
console.log('SHEELAGURU Lots:', sheelaFiltered.map((l) => `${l['Lot Number']} (${l['Garment Type']})`));
