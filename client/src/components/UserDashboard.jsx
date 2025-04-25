import { useState } from 'react';
import { uploadUserData } from '../api/user'; // API to send the processed data
import { browserPoseidonHasher } from '../utils/BrowserDataFileHasher';

export default function UserDashboard() {
  const [dataFile, setDataFile] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/json') {
      alert('Please upload a valid JSON file.');
      return;
    }

    setProcessing(true);
    setProcessedData(null);

    try {
      const fileText = await file.text();
      const jsonData = JSON.parse(fileText);

      const hashed = await browserPoseidonHasher(jsonData);
      setProcessedData(hashed);
    } catch (err) {
      alert('Error processing file.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await uploadUserData(processedData);
      alert('Data submitted successfully!');
      console.log(response.data);
    } catch (err) {
      alert('Failed to submit data.');
      console.error(err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-xl rounded-2xl space-y-6 mt-10">
      <h2 className="text-2xl font-bold text-center">User Dashboard</h2>

      <div>
        <label className="block mb-2 font-semibold">Upload Data File (JSON)</label>
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      {processing && (
        <div className="text-blue-600 font-semibold">Processing file...</div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={!processedData || processing}
      >
        Submit
      </button>
    </div>
  );
}
