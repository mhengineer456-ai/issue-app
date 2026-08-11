// ============================================================
// GOOGLE SHEETS API CREDENTIALS
// Loaded dynamically from .env (via process.env.EXPO_PUBLIC_*)
// ============================================================

export const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
  'AIzaSyAomDFBkOySlIxKWSKGHe6ATv9gvaBr7uk';

export const SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_SPREADSHEET_ID ||
  '1Hj3JeJEKB43aYYWv8gk2UhdU6BWuEQfCg5pBlTdBMNA';

export const SUPERVISORS_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_SUPERVISORS_SPREADSHEET_ID ||
  '1iBDfsxA9XEC9nhQE-ALBYlyGRZWOaCYvWsnGfYYbr1I';

export const ISSUES_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_ISSUES_SPREADSHEET_ID ||
  '1uo14nKO_yHu4AJ2rOgaJajuprcinj6xw1AUMFJ6_zYM';

export const RAWPACK_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_RAWPACK_SPREADSHEET_ID ||
  '1xD8Uy1lUgvNTQ2RGRBI4ZjOrozbinUPRq2_UfIplP98';

export const APPS_SCRIPT_URL =
  process.env.EXPO_PUBLIC_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwSSO_E4yCfc-_HPDcUOgiZfU1CzIqHLDHMl2R79DTVBDMe-bnJB0H7mygohuM2E62EFw/exec';

// Separate Apps Script Web App URL dedicated to Stitching Issues
export const STITCHING_APPS_SCRIPT_URL =
  process.env.EXPO_PUBLIC_STITCHING_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxg2O3h_pFaqfypG0dFCyNkCkD69IAG957VzS5Zc7bGyMQ022WfVVlglA0CtrgqZ0N8/exec';

// Spreadsheet ID for Stitching Issues Sheet
export const STITCHING_SPREADSHEET_ID =
  process.env.EXPO_PUBLIC_STITCHING_SPREADSHEET_ID ||
  '1oxWP8aWRih1e98SYOV1qu4XlpDIF2NZdtxisX01ZtuA';
