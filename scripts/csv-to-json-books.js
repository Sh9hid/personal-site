const fs = require('fs');
const path = require('path');

function csvToJson(csvPath, outputPath) {
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const lines = csv.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    console.error('CSV file must have a header and at least one data row');
    process.exit(1);
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  const books = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const book = {};
    
    headers.forEach((header, index) => {
      let value = values[index] || '';
      
      if (header === 'tags' || header === 'authors') {
        try {
          value = JSON.parse(value);
        } catch {
          value = value.split(';').map(s => s.trim());
        }
      } else if (header === 'year' || header === 'pages' || header === 'rating') {
        value = parseInt(value, 10) || null;
      }
      
      book[header] = value;
    });
    
    if (book.id && book.title) {
      books.push(book);
    }
  }
  
  if (!books.length) {
    console.error('No valid books found in CSV');
    process.exit(1);
  }
  
  const existingBooks = fs.existsSync(outputPath) 
    ? JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
    : [];
  
  const merged = [...existingBooks];
  
  books.forEach(book => {
    const existingIndex = merged.findIndex(b => b.id === book.id);
    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], ...book };
    } else {
      merged.push(book);
    }
  });
  
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`Successfully converted ${books.length} books to ${outputPath}`);
}

const csvPath = process.argv[2];
const outputPath = process.argv[3] || path.join(__dirname, '../content/publish/data/books.json');

if (!csvPath) {
  console.error('Usage: node csv-to-json-books.js <input.csv> [output.json]');
  process.exit(1);
}

csvToJson(csvPath, outputPath);
