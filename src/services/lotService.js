import { GOOGLE_API_KEY, SPREADSHEET_ID, SUPERVISORS_SPREADSHEET_ID, ISSUES_SPREADSHEET_ID, RAWPACK_SPREADSHEET_ID, APPS_SCRIPT_URL, STITCHING_APPS_SCRIPT_URL, STITCHING_SPREADSHEET_ID, COMPLETED_LOTS_SPREADSHEET_ID, COMPLETED_LOTS_APPS_SCRIPT_URL } from '../credentials';



// Normalization functions
export const normalizeText = (text) => {
  if (!text || text === 'N/A') return text;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\b(?:rl|polo|polo t shirt|t shirt|tshirt)\b/gi, (match) => {
      const lower = match.toLowerCase();
      if (lower === 'rl') return 'rl';
      if (lower === 'polo' || lower === 'polo t shirt' || lower === 't shirt' || lower === 'tshirt') return 'polo';
      return match;
    });
};

export const normalizeBrand = (brand) => {
  if (!brand || brand === 'N/A') return brand;
  const normalized = normalizeText(brand);
  const brandMappings = {
    'rl': 'RL',
    'ralph lauren': 'RL',
    'polo ralph lauren': 'RL',
    'tommy hilfiger': 'Tommy Hilfiger',
    'th': 'Tommy Hilfiger',
    'calvin klein': 'Calvin Klein',
    'ck': 'Calvin Klein',
    'nike': 'Nike',
    'adidas': 'Adidas',
    'puma': 'Puma',
    'levis': 'Levis',
    'lee': 'Lee',
    'wrangler': 'Wrangler',
  };
  return brandMappings[normalized] || brand.charAt(0).toUpperCase() + brand.slice(1);
};

export const normalizeStyle = (style) => {
  if (!style || style === 'N/A') return style;
  const normalized = normalizeText(style);
  const styleMappings = {
    'polo': 'Polo',
    'tshirt': 'T-Shirt',
    't shirt': 'T-Shirt',
    'polo t shirt': 'Polo T-Shirt',
    'shirt': 'Shirt',
    'formal shirt': 'Formal Shirt',
    'casual shirt': 'Casual Shirt',
    'jeans': 'Jeans',
    'trousers': 'Trousers',
    'pants': 'Pants',
    'shorts': 'Shorts',
    'jacket': 'Jacket',
    'hoodie': 'Hoodie',
    'sweatshirt': 'Sweatshirt',
    'sweater': 'Sweater',
  };
  return styleMappings[normalized] || style.charAt(0).toUpperCase() + style.slice(1);
};

export const normalizeSeason = (season) => {
  if (!season || season === 'N/A') return season;
  const normalized = normalizeText(season);
  const seasonMappings = {
    'ss24': 'SS24',
    'spring summer 24': 'SS24',
    'spring/summer 2024': 'SS24',
    'fw24': 'FW24',
    'fall winter 24': 'FW24',
    'fall/winter 2024': 'FW24',
    'aw24': 'AW24',
    'autumn winter 24': 'AW24',
    'autumn/winter 2024': 'AW24',
    'ss23': 'SS23',
    'fw23': 'FW23',
    'aw23': 'AW23',
    'ss22': 'SS22',
    'fw22': 'FW22',
    'aw22': 'AW22',
  };
  return seasonMappings[normalized] || season.toUpperCase();
};

export const getDirectImageUrl = (url) => {
  if (!url) return '';
  const trimmed = url.toString().trim();
  if (!trimmed) return '';

  if (!trimmed.includes('drive.google.com')) {
    return trimmed;
  }

  let fileId = '';
  const dMatch = trimmed.match(/id=([^&]+)/);
  if (dMatch && dMatch[1]) {
    fileId = dMatch[1];
  } else {
    const fileMatch = trimmed.match(/\/file\/d\/([^/]+)/);
    if (fileMatch && fileMatch[1]) {
      fileId = fileMatch[1];
    }
  }

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
};

export const parseDate = (dateString) => {
  if (!dateString || dateString === '-') return null;
  try {
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day > 0 && day <= 31 && month >= 0 && month < 12 && year > 1900) {
          return new Date(year, month, day);
        }
      }
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    return null;
  } catch {
    return null;
  }
};

export const calculatePendingDays = (completedDate) => {
  if (!completedDate || completedDate === '-') return 0;
  try {
    const completed = parseDate(completedDate);
    if (!completed) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    completed.setHours(0, 0, 0, 0);
    const diffTime = today - completed;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  } catch {
    return 0;
  }
};

export const parseCompletedStatus = (statusData) => {
  if (!statusData) return { displayDate: '-', rawStatus: null };
  try {
    if (typeof statusData === 'object') {
      return {
        displayDate: extractDateFromTimestamp(statusData.timestamp),
        rawStatus: statusData
      };
    }
    const parsed = JSON.parse(statusData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const status = parsed[0];
      return {
        displayDate: extractDateFromTimestamp(status.timestamp),
        rawStatus: status
      };
    }
  } catch {
    // raw string
  }
  return { displayDate: statusData || '-', rawStatus: null };
};

export const extractDateFromTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return timestamp;
  }
};

export const getStatus = (directStitching, challanHistory) => {
  const directStitchingLower = directStitching ? directStitching.toString().toLowerCase().trim() : '';
  if (directStitchingLower === 'yes' || directStitchingLower === 'y') {
    return 'Direct';
  }

  if (!challanHistory || challanHistory === 'N/A' || challanHistory.trim() === '') {
    return 'Pending';
  }

  try {
    const challans = JSON.parse(challanHistory);
    if (!Array.isArray(challans) || challans.length === 0) {
      return 'Pending';
    }
    const latestChallan = challans[0];
    if (latestChallan.embCompleted) {
      return 'Embroidery Working';
    }
    if (latestChallan.number && latestChallan.number.includes('PRINT')) {
      return 'Printing Working';
    }
    if (latestChallan.number && latestChallan.number.includes('EMB')) {
      return 'Embroidery Working';
    }
    return 'Pending';
  } catch (error) {
    return 'Pending';
  }
};

const normalizeKey = (s = '') => {
  return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

const findHeaderRowIndex = (windowValues, expectedSizesNorm) => {
  const hasSizeToken = (rowSet) => expectedSizesNorm.some((sz) => rowSet.has(sz));
  for (let i = 0; i < windowValues.length; i++) {
    const row = windowValues[i] || [];
    const set = new Set(row.map((c) => normalizeKey(c)));
    const hasShadeHeader = set.has('color') || set.has('shade') || set.has('shades');
    if (hasShadeHeader && hasSizeToken(set)) return i;
  }
  for (let i = 0; i < windowValues.length; i++) {
    const row = windowValues[i] || [];
    const set = new Set(row.map((c) => normalizeKey(c)));
    let matches = 0;
    expectedSizesNorm.forEach((sz) => {
      if (set.has(sz)) matches++;
    });
    if (matches >= 2) return i;
  }
  return 0;
};

export const computePendingShades = (windowValues, sizes = [], shades = []) => {
  if (!windowValues || windowValues.length === 0) {
    return new Set(shades.map(normalizeKey));
  }

  const normalizedSizes = Array.from(new Set((sizes || []).map((s) => normalizeKey(s)).filter(Boolean)));
  const headerRowIdx = findHeaderRowIndex(windowValues, normalizedSizes);
  const header = windowValues[headerRowIdx] || [];

  const hIdx = {};
  header.forEach((h, i) => {
    const k = normalizeKey(h);
    if (k && !(k in hIdx)) hIdx[k] = i;
  });

  const shadeColIndex = hIdx['color'] ?? hIdx['shade'] ?? hIdx['shades'] ?? 0;
  const nonSizeColumns = new Set([
    'color', 'shade', 'shades', 'cuttingtable', 'cutting', 'table',
    'total', 'totalpcs', 'totals', 'grandtotal', 'sum', 'lot', 'style',
    'fabric', 'garment', 'partyname', 'brand', 'section', 'season',
  ]);

  let sizeColIndices = [];
  header.forEach((h, i) => {
    const normalizedHeader = normalizeKey(h);
    if (normalizedHeader && !nonSizeColumns.has(normalizedHeader)) {
      sizeColIndices.push(i);
    }
  });

  if (sizeColIndices.length === 0) {
    normalizedSizes.forEach((ns) => {
      if (ns in hIdx) sizeColIndices.push(hIdx[ns]);
    });
    if (sizeColIndices.length === 0) {
      const ct = hIdx['cuttingtable'];
      if (ct != null && ct >= 0) {
        const guessStart = ct + 1;
        const guessed = [];
        for (let k = 0; k < normalizedSizes.length; k++) guessed.push(guessStart + k);
        sizeColIndices = Array.from(new Set(guessed.filter((g) => g < header.length)));
      }
    }
  }

  if (sizeColIndices.length === 0) {
    return new Set(shades.map(normalizeKey));
  }

  const shadeStats = new Map();
  for (let r = headerRowIdx + 1; r < windowValues.length; r++) {
    const row = windowValues[r] || [];
    const rawShade = String(row[shadeColIndex] || '').trim();
    const shadeKey = normalizeKey(rawShade);
    if (!shadeKey || shadeKey === 'total' || shadeKey === 'totals' || shadeKey === 'grandtotal') {
      continue;
    }

    let hasPositiveData = false;
    let hasAnyData = false;

    sizeColIndices.forEach((c) => {
      const raw = row[c];
      if (raw != null && raw !== '') {
        hasAnyData = true;
        const n = parseFloat(String(raw).replace(/,/g, ''));
        if (!isNaN(n) && n > 0) {
          hasPositiveData = true;
        }
      }
    });

    if (hasAnyData) {
      if (hasPositiveData) {
        shadeStats.set(shadeKey, 'found-with-data');
      } else if (!shadeStats.has(shadeKey)) {
        shadeStats.set(shadeKey, 'found-all-zero');
      }
    } else if (!shadeStats.has(shadeKey)) {
      shadeStats.set(shadeKey, 'found-no-data');
    }
  }

  const pendingShadeKeys = new Set();
  const expectedShadeKeys = (shades || []).map((sh) => normalizeKey(sh));
  expectedShadeKeys.forEach((shadeKey) => {
    const status = shadeStats.get(shadeKey);
    if (!status || status === 'found-no-data') {
      pendingShadeKeys.add(shadeKey);
    }
  });

  return pendingShadeKeys;
};

export const sliceCuttingMatrix = (bigValues, startRow, numRows) => {
  if (!Array.isArray(bigValues) || bigValues.length === 0) return [];
  if (!(startRow > 0 && numRows > 0)) return [];
  const r0 = Math.max(0, startRow - 1);
  const r1 = Math.min(bigValues.length - 1, r0 + numRows - 1);
  return bigValues.slice(r0, r1 + 1);
};

export const getTotalPcsFromMatrix = (matrix) => {
  if (!matrix || !Array.isArray(matrix)) return 'N/A';
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    if (row && row[0] && row[0].toString().toLowerCase().includes('total')) {
      const totalPcs = row[row.length - 1];
      return totalPcs || 'N/A';
    }
  }
  return 'N/A';
};

// Fetch real supervisors live from Google Sheets API (StitchingSupervisors sheet)
export const fetchSupervisors = async () => {
  if (!GOOGLE_API_KEY || !SUPERVISORS_SPREADSHEET_ID) {
    return { error: 'MISSING_CREDENTIALS', supervisors: [] };
  }

  try {
    const sheetName = 'StitchingSupervisors';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SUPERVISORS_SPREADSHEET_ID}/values/${encodeURIComponent(sheetName)}!A:G?key=${GOOGLE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { error: 'API_ERROR', supervisors: [] };
    }
    const data = await res.json();
    const rows = data.values || [];
    if (rows.length < 2) return { error: null, supervisors: [] };

    const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase());
    const idIdx = headers.indexOf('id');
    const nameIdx = headers.indexOf('name');
    const deptIdx = headers.indexOf('department');
    const shiftIdx = headers.indexOf('shift');
    const posIdx = headers.indexOf('position');

    const supervisors = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i] || [];
      const name = nameIdx !== -1 && r[nameIdx] ? r[nameIdx].toString().trim() : '';
      if (name) {
        supervisors.push({
          id: idIdx !== -1 && r[idIdx] ? r[idIdx].toString().trim() : `sup_${i}`,
          name: name,
          department: deptIdx !== -1 && r[deptIdx] ? r[deptIdx].toString().trim() : 'Stitching',
          shift: shiftIdx !== -1 && r[shiftIdx] ? r[shiftIdx].toString().trim() : '',
          position: posIdx !== -1 && r[posIdx] ? r[posIdx].toString().trim() : 'Supervisor',
        });
      }
    }

    return { error: null, supervisors };
  } catch (err) {
    return { error: 'NETWORK_ERROR', supervisors: [] };
  }
};

// Fetch real lots directly from Google Sheets API (Department-aware: Stitching vs Packing)
export const fetchAvailableLots = async (department = 'Stitching') => {
  if (!GOOGLE_API_KEY || !SPREADSHEET_ID || GOOGLE_API_KEY.trim() === '' || SPREADSHEET_ID.trim() === '') {
    return {
      error: 'MISSING_CREDENTIALS',
      message: 'Please enter your GOOGLE_API_KEY and SPREADSHEET_ID in src/credentials.js to load live data.',
      lots: [],
    };
  }

  const isPackingDept = department && department.toLowerCase().trim() === 'packing';

  try {
    const range = 'Index!A:AG';
    const cuttingRange = 'Cutting!A:Z';
    const issuesRange = 'Issues!A:R';
    const rawpackRange = 'RAWPACK!A:ZZ';

    const stitchingIssuesRange = 'Stitching Issues!A:Z';

    const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}`;
    // Do NOT fetch Cutting sheet for Packing department!
    const cuttingUrl = !isPackingDept
      ? `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${cuttingRange}?key=${GOOGLE_API_KEY}`
      : null;
    const issuesUrl = isPackingDept && ISSUES_SPREADSHEET_ID
      ? `https://sheets.googleapis.com/v4/spreadsheets/${ISSUES_SPREADSHEET_ID}/values/${encodeURIComponent(issuesRange)}?key=${GOOGLE_API_KEY}`
      : null;
    const rawpackUrl = isPackingDept && RAWPACK_SPREADSHEET_ID
      ? `https://sheets.googleapis.com/v4/spreadsheets/${RAWPACK_SPREADSHEET_ID}/values/${encodeURIComponent(rawpackRange)}?key=${GOOGLE_API_KEY}`
      : null;
    const stitchingIssuesUrl = !isPackingDept && STITCHING_SPREADSHEET_ID
      ? `https://sheets.googleapis.com/v4/spreadsheets/${STITCHING_SPREADSHEET_ID}/values/${encodeURIComponent(stitchingIssuesRange)}?key=${GOOGLE_API_KEY}`
      : null;

    const [indexRes, cuttingRes, issuesRes, rawpackRes, stitchingIssuesRes] = await Promise.all([
      fetch(indexUrl),
      cuttingUrl ? fetch(cuttingUrl).catch(() => null) : Promise.resolve(null),
      issuesUrl ? fetch(issuesUrl).catch(() => null) : Promise.resolve(null),
      rawpackUrl ? fetch(rawpackUrl).catch(() => null) : Promise.resolve(null),
      stitchingIssuesUrl ? fetch(stitchingIssuesUrl).catch(() => null) : Promise.resolve(null),
    ]);

    if (!indexRes.ok) {
      const errText = await indexRes.text();
      return {
        error: 'API_ERROR',
        message: `Failed to fetch Index sheet (${indexRes.status}). Check API Key & Sheet Sharing permissions.`,
        lots: [],
      };
    }

    const indexData = await indexRes.json();
    const cuttingData = cuttingRes && cuttingRes.ok ? await cuttingRes.json() : { values: [] };
    const issuesData = issuesRes && issuesRes.ok ? await issuesRes.json() : { values: [] };
    const rawpackData = rawpackRes && rawpackRes.ok ? await rawpackRes.json() : { values: [] };
    const stitchingIssuesData = stitchingIssuesRes && stitchingIssuesRes.ok ? await stitchingIssuesRes.json() : { values: [] };

    const indexRows = indexData.values || [];
    const cuttingRows = cuttingData.values || [];
    const issuesRows = issuesData.values || [];
    const rawpackRows = rawpackData.values || [];
    const stitchingIssuesRows = stitchingIssuesData.values || [];

    // 1. Parse Issues Sheet Lot Numbers for Exclusion (Packing)
    const issuesLotSet = new Set();
    if (isPackingDept && issuesRows.length > 0) {
      const iHeaders = issuesRows[0].map((h) => (h || '').toString().trim().toLowerCase());
      const iLotIdx = iHeaders.findIndex((h) => h.includes('lot number') || h.includes('lot'));
      for (let r = 1; r < issuesRows.length; r++) {
        const lotVal = iLotIdx !== -1 ? issuesRows[r][iLotIdx] : null;
        if (lotVal && String(lotVal).trim()) {
          issuesLotSet.add(String(lotVal).trim());
        }
      }
    }

    // 1b. Parse Stitching Issues Sheet Lot Numbers for Exclusion (Stitching)
    const stitchingIssuesLotSet = new Set();
    if (!isPackingDept && stitchingIssuesRows.length > 0) {
      const sHeaders = stitchingIssuesRows[0].map((h) => (h || '').toString().trim().toLowerCase());
      const sLotIdx = sHeaders.findIndex((h) => h.includes('lot number') || h.includes('lot'));
      for (let r = 1; r < stitchingIssuesRows.length; r++) {
        const lotVal = sLotIdx !== -1 ? stitchingIssuesRows[r][sLotIdx] : null;
        if (lotVal && String(lotVal).trim()) {
          stitchingIssuesLotSet.add(String(lotVal).trim());
        }
      }
    }

    // 2. Parse RAWPACK Sheet Lot Numbers for Exclusion ONLY IF PACKING PERSON IS ASSIGNED!
    const rawpackAssignedLotSet = new Set();
    if (isPackingDept && rawpackRows.length > 0) {
      let headerRowIdx = -1;
      for (let i = 0; i < Math.min(rawpackRows.length, 5); i++) {
        const rowStr = (rawpackRows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('lot') && (rowStr.includes('packing person') || rowStr.includes('pcs') || rowStr.includes('item'))) {
          headerRowIdx = i;
          break;
        }
      }
      if (headerRowIdx === -1) headerRowIdx = 1; // Default to row 2

      const rpHeaders = (rawpackRows[headerRowIdx] || []).map((h) => (h || '').toString().trim().toLowerCase());
      const lotColIdx = rpHeaders.findIndex((h) => h.includes('lot no') || h.includes('lot'));
      const personColIdx = rpHeaders.findIndex((h) => h.includes('packing person') || h.includes('person'));

      for (let r = headerRowIdx + 1; r < rawpackRows.length; r++) {
        const row = rawpackRows[r] || [];
        const lotVal = lotColIdx !== -1 ? row[lotColIdx] : null;
        const personVal = personColIdx !== -1 ? row[personColIdx] : null;

        const lotNo = lotVal ? String(lotVal).trim() : '';
        const personName = personVal ? String(personVal).trim() : '';

        // Exclude ONLY if PACKING PERSON is filled with a valid name!
        if (lotNo && lotNo !== '-' && lotNo !== '0') {
          if (personName && personName !== '-' && personName !== '0' && personName !== '#N/A') {
            rawpackAssignedLotSet.add(lotNo);
          }
        }
      }
    }

    if (indexRows.length < 2) {
      return { error: null, lots: [] };
    }

    const headers = indexRows[0].map((h) => (h || '').toString().trim());
    const headerIndices = {};
    headers.forEach((h, i) => {
      if (h) headerIndices[normalizeKey(h)] = i;
    });

    const supervisorIndex = headerIndices['supervisor'] ?? -1;
    const lotNumIndex = headerIndices['lotnumber'] ?? headerIndices['lotno'] ?? headerIndices['lot'];
    const completedStatusIndex = headerIndices['completedstatus'] ?? -1;
    const partyNameIndex = headerIndices['partyname'] ?? headerIndices['party'] ?? -1;

    if (supervisorIndex === -1 && !isPackingDept) {
      return {
        error: 'SCHEMA_ERROR',
        message: 'Supervisor column not found in Index sheet.',
        lots: [],
      };
    }

    const availableLots = [];

    for (let i = 1; i < indexRows.length; i++) {
      const row = indexRows[i] || [];
      const lotNo = lotNumIndex != null && row[lotNumIndex] ? row[lotNumIndex].toString().trim() : '';

      if (!lotNo) continue;

      const supervisorVal = supervisorIndex !== -1 && row[supervisorIndex] ? row[supervisorIndex].toString().trim() : '';
      const rawPartyName = partyNameIndex !== -1 && row[partyNameIndex] ? row[partyNameIndex].toString().trim() : '';

      // Check Supervisor & Party Name for DUSHYANT / JAINHOSIERY
      const partyNorm = rawPartyName.toLowerCase().replace(/\s+/g, '');
      const supervisorNorm = supervisorVal.toLowerCase().replace(/\s+/g, '');

      const isExcludedPartyOrSupervisor =
        partyNorm.includes('dushyant') ||
        partyNorm.includes('jainhosiery') ||
        supervisorNorm.includes('dushyant') ||
        supervisorNorm.includes('jainhosiery');

      if (isExcludedPartyOrSupervisor) {
        continue; // EXCLUDE lots where Supervisor or Party Name is Dushyant or Jainhosiery
      }

      const completedStatusVal = completedStatusIndex !== -1 ? row[completedStatusIndex] : '';

      let isTargetLot = false;

      if (isPackingDept) {
        // FOR PACKING:
        // 1. MUST have a Stitching Supervisor assigned (Supervisor column not empty / N/A)
        // 2. Must NOT be present in Issues sheet
        // 3. Must NOT be present in RAWPACK sheet with a PACKING PERSON assigned!
        const hasStitchingSupervisor = supervisorVal !== '' && supervisorVal !== 'N/A' && supervisorVal !== '-';
        const isNotInIssuesSheet = !issuesLotSet.has(lotNo);
        const isNotInRawpackAssigned = !rawpackAssignedLotSet.has(lotNo);

        isTargetLot = hasStitchingSupervisor && isNotInIssuesSheet && isNotInRawpackAssigned;
      } else {
        // FOR STITCHING: Fetch Index sheet lots where Supervisor is empty (unassigned) AND not already issued in Stitching Issues sheet
        const isSupervisorEmpty = !supervisorVal || supervisorVal.toString().trim() === '';
        const isNotInStitchingIssues = !stitchingIssuesLotSet.has(lotNo);
        isTargetLot = isSupervisorEmpty && isNotInStitchingIssues;
      }

      if (isTargetLot) {
        const fabric = row[headerIndices['fabric']] || 'N/A';
        const garmentType = row[headerIndices['garmenttype']] || row[headerIndices['garment']] || 'N/A';
        const style = row[headerIndices['style']] || 'N/A';
        const brand = normalizeBrand(row[headerIndices['brand']] || 'N/A');
        const season = normalizeSeason(row[headerIndices['season']] || 'N/A');
        const directStitching = row[headerIndices['directstitching']] || row[headerIndices['direct']] || 'No';

        // Fetch Quantity directly from Index sheet column "Cutting Qty"
        let totalPcs =
          row[headerIndices['cuttingqty']] ||
          row[headerIndices['totalpcs']] ||
          row[headerIndices['total']] ||
          '0';

        const rawImage = row[headerIndices['imageurl']] || row[headerIndices['image']] || '';
        const image = getDirectImageUrl(rawImage);
        const challanHistory = row[headerIndices['challanhistory']] || '';

        let status = 'Issued Ready';
        if (isPackingDept) {
          status = 'Ready for Packing';
        } else {
          status = getStatus(directStitching, challanHistory);
        }

        const startRow = parseInt(row[headerIndices['startrow']] || '0', 10);
        const numRows = parseInt(row[headerIndices['numrows']] || '0', 10);

        const sizesStr = row[headerIndices['sizes']] || '';
        const shadesStr = row[headerIndices['shades']] || '';
        const sizes = sizesStr.split(',').map((s) => s.trim()).filter(Boolean);
        const shades = shadesStr.split(',').map((s) => s.trim()).filter(Boolean);

        let pendingColors = [];
        let hasColorPending = false;

        // ONLY compute pending shades and matrix total if NOT Packing department!
        if (!isPackingDept && shades.length > 0 && startRow > 0 && numRows > 0 && cuttingRows.length > 0) {
          const window = sliceCuttingMatrix(cuttingRows, startRow, numRows);
          const pendingKeys = computePendingShades(window, sizes, shades);
          if (pendingKeys.size > 0) {
            const shadeKeyToOrig = new Map();
            shades.forEach((sh) => shadeKeyToOrig.set(normalizeKey(sh), sh));
            pendingColors = Array.from(pendingKeys).map((k) => shadeKeyToOrig.get(k) || k);
            hasColorPending = true;
          }

          if (totalPcs === '0' || totalPcs === 'N/A') {
            const matrixTotal = getTotalPcsFromMatrix(window);
            if (matrixTotal !== 'N/A') totalPcs = matrixTotal;
          }
        }

        const priority = row[headerIndices['prioirty']] || row[headerIndices['priority']] || row[headerIndices['special']] || '';
        const isRepeatedLot = priority.toString().toLowerCase().includes('repeated');

        const parsedCompleted = parseCompletedStatus(completedStatusVal);
        const pendingDays = calculatePendingDays(parsedCompleted.displayDate);

        availableLots.push({
          'Lot Number': lotNo,
          Fabric: fabric,
          'Garment Type': garmentType,
          Style: normalizeStyle(style),
          Brand: brand,
          Season: season,
          'Direct Stitching': directStitching,
          'Total Pcs': totalPcs,
          Image: image,
          status,
          hasColorPending,
          pendingColors,
          pendingColorsText: pendingColors.join(', '),
          isRepeatedLot,
          priority: priority.toString().trim(),
          completedStatusDisplay: parsedCompleted.displayDate,
          pendingDays,
          stitchingSupervisor: supervisorVal || 'N/A',
          partyName: rawPartyName || 'N/A',
        });
      }
    }

    return { error: null, lots: availableLots };
  } catch (err) {
    return {
      error: 'NETWORK_ERROR',
      message: err.message || 'Error connecting to Google Sheets API.',
      lots: [],
    };
  }
};

// Save Packing Allotment to Google Sheets via Google Apps Script
export const savePackingAllotment = async ({ lot, supervisor, authorizedBy }) => {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL')) {
    console.warn('APPS_SCRIPT_URL is not set in src/credentials.js');
    return { ok: false, error: 'APPS_SCRIPT_URL not configured' };
  }

  const payload = {
    action: 'allotToPacking',
    lotNumber: lot['Lot Number'] || '',
    garmentType: lot['Garment Type'] || '',
    fabric: lot.Fabric || '',
    style: lot.Style || '',
    packingSupervisor: supervisor?.name || '',
    packingDate: new Date().toISOString().split('T')[0],
    totalPcs: lot['Total Pcs'] || 0,
    wipPacking: 0,
    packingComplete: '',
    totalManpower: 0,
    stitchingIssueDate: '',
    stitchingSupervisor: '',
    brand: '',
    season: '',
    directStitching: '',

    normalization: '',
    specialRemarks: lot.priority || '',
    pintuIssueDate: new Date().toISOString().split('T')[0],
    lotIssuedByPintuToWhom: supervisor?.name || '',

    authorizedBy: authorizedBy || '',
    poDownloaded: 'PENDING',
  };


  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (err) {
    // Fallback: try GET query parameters if POST fails due to network/CORS
    try {
      const queryParams = new URLSearchParams(payload).toString();
      const response = await fetch(`${APPS_SCRIPT_URL}?${queryParams}`);
      const result = await response.json();
      return result;
    } catch (fallbackErr) {
      return { ok: false, error: fallbackErr.toString() };
    }
  }
};

// Save Stitching Allotment to Google Sheets via Google Apps Script
export const saveStitchingAllotment = async ({ lot, supervisor, authorizedBy }) => {
  const targetScriptUrl = STITCHING_APPS_SCRIPT_URL || APPS_SCRIPT_URL;

  if (!targetScriptUrl || targetScriptUrl.includes('YOUR_STITCHING_APPS_SCRIPT_WEB_APP_URL') || targetScriptUrl.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL')) {
    console.warn('STITCHING_APPS_SCRIPT_URL is not set in src/credentials.js');
    return { ok: false, error: 'STITCHING_APPS_SCRIPT_URL not configured' };
  }

  const payload = {
    action: 'allotToStitching',
    sheetName: 'Stitching Issues',
    lotNumber: lot['Lot Number'] || '',
    garmentType: lot['Garment Type'] || '',
    fabric: lot.Fabric || '',
    style: lot.Style || '',
    brand: lot.Brand || '',
    season: lot.Season || '',
    directStitching: lot['Direct Stitching'] || '',
    stitchingSupervisor: supervisor?.name || '',
    stitchingIssueDate: new Date().toISOString().split('T')[0],
    totalPcs: lot['Total Pcs'] || 0,
    partyName: lot.partyName || '',
    specialRemarks: lot.priority || '',
    authorizedBy: authorizedBy || '',
  };

  try {
    const response = await fetch(targetScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (err) {
    // Fallback: try GET query parameters if POST fails due to network/CORS
    try {
      const queryParams = new URLSearchParams(payload).toString();
      const response = await fetch(`${targetScriptUrl}?${queryParams}`);
      const result = await response.json();
      return result;
    } catch (fallbackErr) {
      return { ok: false, error: fallbackErr.toString() };
    }
  }
};

export const parseCompletedLotRows = (rows) => {
  if (!rows || !Array.isArray(rows) || rows.length < 2) return [];
  const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));

  const recordIdIdx = headers.findIndex((h) => h.includes('recordid') || h.includes('id'));
  const timestampIdx = headers.findIndex((h) => h.includes('timestamp') || h.includes('date') || h.includes('time'));
  const supervisorIdx = headers.findIndex((h) => h.includes('supervisor'));
  const lotIdx = headers.findIndex((h) => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
  const partyIdx = headers.findIndex((h) => h.includes('party') || h.includes('partyname'));
  const brandIdx = headers.findIndex((h) => h.includes('brand'));
  const fabricIdx = headers.findIndex((h) => h.includes('fabric') || h.includes('material'));
  const garmentIdx = headers.findIndex((h) => h.includes('garment') || h.includes('type'));
  const styleIdx = headers.findIndex((h) => h.includes('style'));
  const qtyIdx = headers.findIndex((h) => h.includes('pcs') || h.includes('qty') || h.includes('quantity'));
  const imageIdx = headers.findIndex((h) => h.includes('image') || h.includes('url') || h.includes('photo'));
  const statusIdx = headers.findIndex((h) => h.includes('status') || h.includes('operation'));
  const remarksIdx = headers.findIndex((h) => h.includes('remarks') || h.includes('notes') || h.includes('remark'));

  const lots = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const lotNumber = lotIdx !== -1 && r[lotIdx] ? r[lotIdx].toString().trim() : '';
    if (!lotNumber) continue;

    const rawImg = imageIdx !== -1 && r[imageIdx] ? r[imageIdx].toString().trim() : '';
    const directImg = getDirectImageUrl(rawImg);

    lots.push({
      id: recordIdIdx !== -1 && r[recordIdIdx] ? r[recordIdIdx].toString().trim() : `comp_${i}`,
      recordId: recordIdIdx !== -1 && r[recordIdIdx] ? r[recordIdIdx].toString().trim() : `comp_${i}`,
      timestamp: timestampIdx !== -1 && r[timestampIdx] ? r[timestampIdx].toString().trim() : '',
      supervisor: supervisorIdx !== -1 && r[supervisorIdx] ? r[supervisorIdx].toString().trim() : 'N/A',
      lotNumber: lotNumber,
      partyName: partyIdx !== -1 && r[partyIdx] ? r[partyIdx].toString().trim() : 'N/A',
      brand: brandIdx !== -1 && r[brandIdx] ? r[brandIdx].toString().trim() : 'N/A',
      fabric: fabricIdx !== -1 && r[fabricIdx] ? r[fabricIdx].toString().trim() : 'N/A',
      garmentType: garmentIdx !== -1 && r[garmentIdx] ? r[garmentIdx].toString().trim() : 'N/A',
      style: styleIdx !== -1 && r[styleIdx] ? r[styleIdx].toString().trim() : 'N/A',
      pcsQty: qtyIdx !== -1 && r[qtyIdx] ? parseInt(r[qtyIdx].toString().replace(/,/g, ''), 10) || 0 : 0,
      image: directImg,
      status: statusIdx !== -1 && r[statusIdx] ? r[statusIdx].toString().trim() : 'Complete Lot',
      remarks: remarksIdx !== -1 && r[remarksIdx] ? r[remarksIdx].toString().trim() : '',
    });
  }
  return lots;
};

export const parseCsvToRows = (csvText) => {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.split(/\r?\n/);
  const rows = [];
  for (let line of lines) {
    if (!line.trim()) continue;
    // Simple CSV parser handling quoted strings
    const cells = [];
    let currentCell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell.replace(/^"|"$/g, '').trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.replace(/^"|"$/g, '').trim());
    rows.push(cells);
  }
  return rows;
};

export const parseCompletionAuditRows = (rows) => {
  if (!rows || !Array.isArray(rows) || rows.length < 2) return [];
  const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));

  const lotIdx = headers.findIndex((h) => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
  const timestampIdx = headers.findIndex((h) => h.includes('timestamp') || h.includes('date') || h.includes('time'));
  const compDateIdx = headers.findIndex((h) => h.includes('completiondate') || h.includes('compdate'));
  const supervisorIdx = headers.findIndex((h) => h.includes('supervisor'));
  const remarksIdx = headers.findIndex((h) => h.includes('remarks') || h.includes('notes') || h.includes('action'));

  const lots = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const lotNumber = lotIdx !== -1 && r[lotIdx] ? r[lotIdx].toString().trim() : '';
    if (!lotNumber) continue;

    lots.push({
      id: `audit_${i}`,
      recordId: `audit_${i}`,
      timestamp: compDateIdx !== -1 && r[compDateIdx] ? r[compDateIdx].toString().trim() : (timestampIdx !== -1 && r[timestampIdx] ? r[timestampIdx].toString().trim() : ''),
      supervisor: supervisorIdx !== -1 && r[supervisorIdx] ? r[supervisorIdx].toString().trim() : 'Dashboard User',
      lotNumber: lotNumber,
      partyName: 'N/A',
      brand: 'N/A',
      fabric: 'N/A',
      garmentType: 'N/A',
      style: 'N/A',
      pcsQty: 0,
      image: '',
      status: 'Completed',
      remarks: remarksIdx !== -1 && r[remarksIdx] ? r[remarksIdx].toString().trim() : 'Lot marked as complete',
    });
  }
  return lots;
};

// Fetch Lot Number -> Image URL lookup map from Master Index sheet
export const fetchIndexImageMap = async () => {
  try {
    const range = 'Index!A:M';
    const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;
    const res = await fetch(indexUrl);
    if (!res.ok) return {};

    const data = await res.json();
    const rows = data.values || [];
    if (rows.length <= 1) return {};

    const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const lotIdx = headers.findIndex((h) => h.includes('lotnumber') || h.includes('lotno') || h.includes('lot'));
    const imgIdx = headers.findIndex((h) => h.includes('image') || h.includes('img') || h.includes('url') || h.includes('photo'));

    if (lotIdx === -1 || imgIdx === -1) return {};

    const map = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const lotNo = row[lotIdx] ? row[lotIdx].toString().trim() : '';
      const img = row[imgIdx] ? row[imgIdx].toString().trim() : '';
      if (lotNo && img) {
        map[lotNo.toLowerCase()] = getDirectImageUrl(img);
      }
    }
    return map;
  } catch (e) {
    console.warn('Error fetching Index image map:', e.message);
    return {};
  }
};

// Fetch Completed Lots ONLY from the "Completed Lots" sheet tab (REQUIREMENTS / COMPLETED_LOTS_SPREADSHEET_ID)
export const fetchCompletedLots = async (customApiKey = null) => {
  const apiKey = customApiKey || GOOGLE_API_KEY || 'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';
  const targetSpreadsheetId = COMPLETED_LOTS_SPREADSHEET_ID || '1Ydzo9F22FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA';
  const idVariants = [
    targetSpreadsheetId,
    '1Ydzo9F22FUsU-VTQdUfz12uQ-_l4E_B0fhp0w4H0DYA',
    SPREADSHEET_ID || '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA',
  ];

  const sheetName = 'Completed Lots';
  let fetchedLots = [];

  // 1. Primary Direct Google Sheets API v4 Fetch
  for (const sheetId of idVariants) {
    if (!sheetId) continue;
    const range = `${encodeURIComponent(sheetName)}!A:M`;
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length >= 2) {
          fetchedLots = parseCompletedLotRows(rows);
          if (fetchedLots.length > 0) break;
        }
      }
    } catch (e) {
      console.warn('Google Sheets API direct fetch error:', e.message);
    }
  }

  // 2. Apps Script Web App Fallback if Sheets API returned no rows
  if (fetchedLots.length === 0) {
    const scriptUrls = [COMPLETED_LOTS_APPS_SCRIPT_URL, APPS_SCRIPT_URL, STITCHING_APPS_SCRIPT_URL];
    for (const scriptUrl of scriptUrls) {
      if (!scriptUrl || scriptUrl.includes('YOUR_')) continue;
      try {
        const targetUrl = `${scriptUrl}?action=getCompletedLots&sheetName=${encodeURIComponent(sheetName)}`;
        const res = await fetch(targetUrl);
        if (res.ok) {
          const json = await res.json();
          if (json.completedRecords && Array.isArray(json.completedRecords) && json.completedRecords.length > 0) {
            fetchedLots = json.completedRecords.map((item, idx) => ({
              id: item.id || `comp_${idx}`,
              recordId: item.id || `comp_${idx}`,
              timestamp: item.timestamp || '',
              supervisor: item.supervisor || 'N/A',
              lotNumber: item.lotNumber || item.lot || '',
              partyName: item.party || item.partyName || 'N/A',
              brand: item.brand || 'N/A',
              fabric: item.fabric || item.material || 'N/A',
              garmentType: item.garment || item.garmentType || 'N/A',
              style: item.style || 'N/A',
              pcsQty: parseInt(item.pcs, 10) || 0,
              image: getDirectImageUrl(item.imageUrl || item.image || ''),
              status: item.status || 'Completed',
              remarks: item.remarks || '',
            })).filter((l) => !!l.lotNumber);

            if (fetchedLots.length > 0) break;
          }

          if (json.ok && Array.isArray(json.values) && json.values.length >= 2) {
            fetchedLots = parseCompletedLotRows(json.values);
            if (fetchedLots.length > 0) break;
          }
        }
      } catch (e) {
        console.warn('Apps Script Web App fetch error:', e.message);
      }
    }
  }

  if (fetchedLots.length === 0) {
    return {
      error: 'SHEET_DIRECT_FETCH_FAILED',
      message: 'Unable to fetch completed lots from Completed Lots sheet tab.',
      lots: [],
    };
  }

  // 3. Enrich missing images from Master Index sheet (Index!A:M -> Image Url)
  try {
    const imageMap = await fetchIndexImageMap();
    if (imageMap && Object.keys(imageMap).length > 0) {
      fetchedLots.forEach((lot) => {
        if (!lot.image && lot.lotNumber) {
          const key = lot.lotNumber.toString().trim().toLowerCase();
          if (imageMap[key]) {
            lot.image = imageMap[key];
          }
        }
      });
    }
  } catch (e) {
    console.warn('Error enriching completed lots with Index images:', e.message);
  }

  // 4. Filter out ONLY lots whose Completed Status in Master Index sheet (Column V) ALREADY has "Complete Lot" / "Approved"
  try {
    const completedIndexLotSet = await fetchCompletedIndexLotNumbers();
    fetchedLots = fetchedLots.filter((lot) => {
      if (!lot || !lot.lotNumber) return false;
      const lotKey = lot.lotNumber.toString().trim().toLowerCase();

      // If Column V (Completed Status) in Index sheet ALREADY has "Complete Lot" / "Approved" -> HIDE FROM UI!
      if (completedIndexLotSet.has(lotKey)) {
        return false;
      }

      // Otherwise, keep in UI so user can click Approval Submission!
      return true;
    });
  } catch (e) {
    console.warn('Error filtering completed lots by Index status:', e.message);
  }

  return { error: null, lots: fetchedLots };
};

// Fetch set of Lot Numbers that ALREADY have "Complete Lot" or "Approved" status in the Master Index sheet
export const fetchCompletedIndexLotNumbers = async () => {
  try {
    const range = 'Index!A:Z';
    const indexUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;
    const res = await fetch(indexUrl);
    if (!res.ok) return new Set();

    const data = await res.json();
    const rows = data.values || [];
    if (rows.length <= 1) return new Set();

    const headers = rows[0].map((h) => (h || '').toString().trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    const lotIdx = headers.findIndex((h) => h.includes('lotnumber') || h.includes('lotno') || h === 'lot');
    const compStatusIdx = headers.findIndex((h) => h.includes('completedstatus') || h.includes('completestatus') || h === 'status');

    if (lotIdx === -1) return new Set();

    const completedSet = new Set();
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const lotNo = row[lotIdx] ? row[lotIdx].toString().trim() : '';
      const compStatusVal = compStatusIdx !== -1 && row[compStatusIdx] ? row[compStatusIdx].toString().trim() : '';

      if (lotNo && compStatusVal) {
        const lowerVal = compStatusVal.toLowerCase();
        if (
          lowerVal.includes('complete') ||
          lowerVal.includes('approved') ||
          lowerVal.includes('submitted')
        ) {
          completedSet.add(lotNo.toLowerCase());
        }
      }
    }
    return completedSet;
  } catch (e) {
    console.warn('Error fetching completed Index lot numbers:', e.message);
    return new Set();
  }
};

// Single-URL Approval Submission: Hits ONLY Master Index Sheet Web App
export const submitLotApproval = async ({
  lotNumber,
  supervisor = 'MONU',
  remarks = 'Approval Submitted via Pintu',
  status = 'Complete Lot',
}) => {
  const indexScriptUrl = COMPLETED_LOTS_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbz9ofgmid-74YQ61oRUN6d4crBlF5FfG5qjeXDg2bUoLoZ7eBWkRVx58t4UzfNODuuzfA/exec';

  const cleanLot = lotNumber ? lotNumber.toString().trim() : '';
  const cleanSup = supervisor ? supervisor.toString().trim() : 'MONU';
  const cleanRemarks = remarks || 'Approval Submitted via Pintu';
  const cleanStatus = status || 'Complete Lot';

  const indexQuery = `${indexScriptUrl}?action=updatestatus&type=completed&lot=${encodeURIComponent(cleanLot)}&lotNumber=${encodeURIComponent(cleanLot)}&status=${encodeURIComponent(cleanStatus)}&remarks=${encodeURIComponent(cleanRemarks)}&supervisor=${encodeURIComponent(cleanSup)}`;

  // 1. Send via Image ping for instant execution in web browser
  if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
    try {
      const img = new Image();
      img.src = indexQuery;
    } catch (e) {}
  }

  // 2. Send via fetch with mode: 'no-cors'
  try {
    await fetch(indexQuery, { mode: 'no-cors' }).catch(() => {});
  } catch (e) {}

  return { ok: true, status: 'success', message: 'Approval recorded in Master Index sheet!' };
};

// Allowed Garment Types scoping for SHEELAGURU
export const SHEELAGURU_GARMENT_TYPES = [
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

export const isLotAllowedForUser = (user, lot) => {
  if (!user) return true;
  const operator = (typeof user === 'string' ? user : user.operatorId || user.name || '').toUpperCase().trim();

  // If logged in as SHEELAGURU -> filter strictly by assigned Garment Types
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

  // PINTU or any other user sees ALL data
  return true;
};
