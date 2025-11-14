const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const csvFile = process.argv[2];
if (!csvFile) {
  console.error('❌ Please provide a CSV file path');
  process.exit(1);
}

const jsonFile = csvFile.replace('.csv', '.json');
const results = [];

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (data) => {
    // Clean up empty values and trim whitespace
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      const trimmedKey = key.trim();
      const trimmedValue = typeof value === 'string' ? value.trim() : value;
      if (trimmedValue && trimmedValue !== '') {
        cleaned[trimmedKey] = trimmedValue;
      }
    }
    if (Object.keys(cleaned).length > 0) {
      results.push(cleaned);
    }
  })
  .on('end', () => {
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
    console.log(`✅ Converted ${csvFile} → ${jsonFile}`);
    console.log(`   Found ${results.length} records`);
  })
  .on('error', (error) => {
    console.error('❌ Error reading CSV:', error.message);
    process.exit(1);
  });
