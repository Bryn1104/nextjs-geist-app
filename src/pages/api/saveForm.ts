import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const formData = req.body;

    if (!formData) {
      res.status(400).json({ error: 'No form data provided' });
      return;
    }

    // Define the directory to save files
    const saveDir = path.resolve(process.cwd(), 'saved_forms');

    // Ensure directory exists
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    // Create a filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `form-submission-${timestamp}.json`;

    // Write the form data as JSON file
    const filePath = path.join(saveDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(formData, null, 2));

    res.status(200).json({ message: 'Form data saved successfully', filePath });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Failed to save form data' });
  }
}
