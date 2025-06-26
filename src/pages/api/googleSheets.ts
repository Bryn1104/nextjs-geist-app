import { google } from 'googleapis';

const sheets = google.sheets('v4');

// Load credentials from environment variables or a secure location
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const SPREADSHEET_ID = '1CJ_A0ayJ9LbsDICk-tlYcT_zEVGl67t-u6q8wnWaj_c';
const SHEET_NAME = 'Sheet1'; // Change if your sheet name is different

if (!CLIENT_EMAIL || !PRIVATE_KEY) {
  throw new Error('Google service account credentials are not set in environment variables.');
}

const auth = new google.auth.JWT(
  CLIENT_EMAIL,
  undefined,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets']
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await auth.authorize();

    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      res.status(400).json({ error: 'Invalid data format' });
      return;
    }

    // Prepare values for appending
    const values = data.map(item => [
      item.requestor || '',
      item.customer || '',
      item.projectName || '',
      item.productName || '',
      item.type || '',
      item.targetBomCost || '',
      item.dateRequested || '',
      item.uom || '',
      item.articleCode || '',
      item.ltoRegular || '',
      item.monthlyVolume || '',
      item.monthlyRevenue || '',
      item.productStatus || '',
      item.shelfLife || '',
      item.packSize || '',
      item.details || ''
    ]);

    const response = await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    res.status(200).json({ message: 'Data appended successfully', response });
  } catch (error) {
    console.error('Error appending data to Google Sheets:', error);
    res.status(500).json({ error: 'Failed to append data to Google Sheets' });
  }
}
