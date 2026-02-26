const fs = require('fs');
const path = require('path');

const booksPath = path.join(__dirname, '../content/publish/data/books.json');

if (!fs.existsSync(booksPath)) {
  console.error('books.json not found. Run csv-to-json-books.js first.');
  process.exit(1);
}

const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

if (!apiKey) {
  console.error('GOOGLE_BOOKS_API_KEY not found in .env');
  console.error('Create a .env file with: GOOGLE_BOOKS_API_KEY=your_api_key');
  process.exit(1);
}

const books = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));

async function enrichBook(book) {
  if (book.isbn && !book.cover && !book.description) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items && data.items[0]) {
        const volumeInfo = data.items[0].volumeInfo;
        
        if (volumeInfo.imageLinks?.thumbnail) {
          book.cover = volumeInfo.imageLinks.thumbnail.replace('http:', 'https:');
        }
        
        if (volumeInfo.description && !book.description) {
          book.description = volumeInfo.description;
        }
        
        if (!book.pages && volumeInfo.pageCount) {
          book.pages = volumeInfo.pageCount;
        }
        
        console.log(`Enriched: ${book.title}`);
      }
    } catch (error) {
      console.error(`Error enriching ${book.title}:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return book;
}

async function main() {
  console.log(`Enriching ${books.length} books with Google Books API...`);
  
  const enriched = await Promise.all(books.map(enrichBook));
  
  fs.writeFileSync(booksPath, JSON.stringify(enriched, null, 2));
  console.log('Done! books.json updated.');
}

main();
