function saveJsonData(data, path = '../data/', fileName = 'output.json') {
  const fs = require('fs');
  const pathLib = require('path');
  const fullPath = pathLib.join(pathLib.resolve(__dirname, path), fileName);
  
  try {
    // Create directory if it doesn't exist
    const dir = pathLib.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(fullPath, jsonString);
    console.log(`Data successfully saved to ${fullPath}`);
  } catch (error) {
    console.error('Error saving JSON data:', error);
    throw error; // Re-throw to allow caller to handle
  }
}

module.exports = {saveJsonData}
