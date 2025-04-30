import { useState, useRef } from 'react';
import { uploadUserData } from '../api/user';
import { browserPoseidonHasher } from '../utils/BrowserDataFileHasher';
import { toast } from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

export default function UserDashboard() {
  const [dataFile, setDataFile] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/json') {
      toast.error('Please upload a valid JSON file.');
      return;
    }

    setProcessing(true);
    setProcessedData(null);

    try {
      const fileText = await file.text();
      const jsonData = JSON.parse(fileText);

      const hashed = await browserPoseidonHasher(jsonData);
      setProcessedData(hashed);
      setDataFile(file);
      toast.success('File processed successfully!');
    } catch (err) {
      toast.error('Error processing file.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !fileType.trim() || !processedData) {
      toast.error('Please complete all fields before submitting.');
      return;
    }
  
    try {
      await uploadUserData({ title, type: fileType, digest: processedData });
      toast.success('Data submitted successfully!');
  
      // Smooth reset without page reload
      setDataFile(null);
      setProcessedData(null);
      setTitle('');
      setFileType('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';  // <-- CLEAR the file input!
      }
      
    } catch (err) {
      toast.error('Failed to submit data.');
      console.error(err);
    }
  };
  

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-3xl mt-12 space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-800">User Dashboard</h2>

      <div className="flex flex-col gap-6">

        {/* Title Input */}
        <div className="flex flex-col">
          <label className="text-lg font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your data..."
            className="border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* File Type Input */}
        <div className="flex flex-col">
        <label className="text-lg font-semibold text-gray-700 mb-2">Type of File</label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none bg-white"
        >
          <option value="">Select a file type</option>
          <option value="Medical Record">JSON</option>
          <option value="Invoice">PDF</option>
          <option value="Research Data">JPG</option>
          <option value="Legal Document">Text</option>
          <option value="Identity Proof">Binary</option>
          <option value="Other">Other</option>
        </select>
      </div>

        {/* File Upload Button */}
        <div className="flex flex-col items-center gap-4">

          {!dataFile ? (
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Upload Data Digest
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{dataFile.name}</span>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition"
                disabled={processing}
              >
                Submit Hash
              </button>
            </div>
          )}

          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="text-blue-500 font-medium text-center animate-pulse">
            Processing file...
          </div>
        )}

        {/* Digest Preview */}
        {processedData && (
          <div className="bg-gray-100 p-4 rounded-xl text-gray-700 text-sm break-words">
            <p className="font-semibold mb-2">Digest Preview:</p>
            <p>{JSON.stringify(processedData).slice(0, 100)}...</p>
          </div>
        )}
      </div>
    </div>
  );
}
