'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert authors
    await queryInterface.bulkInsert('authors', [
      { first_name: 'Isaac', middle_name: 'Yudovick', last_name: 'Asimov' },
      { first_name: 'Arthur', middle_name: 'Charles', last_name: 'Clarke' },
      { first_name: 'Herbert', middle_name: 'George', last_name: 'Wells' },
      { first_name: 'Jules', middle_name: 'Gabriel', last_name: 'Verne' },
      { first_name: 'Philip', middle_name: 'Kindred', last_name: 'Dick' }
    ], {});

    // Insert books
    await queryInterface.bulkInsert('books', [
      { title: 'Prelude to Foundation', year: 1988, pages: 403, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553278398.01.L.jpg' },
      { title: 'Forward the Foundation', year: 1993, pages: 417, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553565079.01.L.jpg' },
      { title: 'Foundation', year: 1951, pages: 255, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553293354.01.L.jpg' },
      { title: 'Foundation and Empire', year: 1952, pages: 247, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553293370.01.L.jpg' },
      { title: 'Second Foundation', year: 1953, pages: 210, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553293362.01.L.jpg' },
      { title: 'Foundation\'s Edge', year: 1982, pages: 367, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553293389.01.L.jpg' },
      { title: 'Foundation and Earth', year: 1986, pages: 356, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553587757.01.L.jpg' },
      { title: 'Nemesis', year: 1989, pages: 386, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0553286281.01.L.jpg' },
      { title: '2001: A Space Odyssey', year: 1968, pages: 221, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0451457994.01.L.jpg' },
      { title: '2010: Odyssey Two', year: 1982, pages: 291, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0345303059.01.L.jpg' },
      { title: '2061: Odyssey Three', year: 1987, pages: 256, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0345358791.01.L.jpg' },
      { title: '3001: The Final Odyssey', year: 1997, pages: 288, category: 'Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0345423496.01.L.jpg' },
      { title: 'The Time Machine', year: 1895, pages: 118, category: 'Classic Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486284719.01.L.jpg' },
      { title: 'The Island of Doctor Moreau', year: 1896, pages: 153, category: 'Classic Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486290271.01.L.jpg' },
      { title: 'The Invisible Man', year: 1897, pages: 151, category: 'Classic Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486270718.01.L.jpg' },
      { title: 'The War of the Worlds', year: 1898, pages: 192, category: 'Classic Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486295060.01.L.jpg' },
      { title: 'Journey to the Center of the Earth', year: 1864, pages: 183, category: 'Adventure', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486440885.01.L.jpg' },
      { title: 'Twenty Thousand Leagues Under the Sea', year: 1870, pages: 187, category: 'Adventure', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486266931.01.L.jpg' },
      { title: 'Around the World in Eighty Days', year: 1873, pages: 167, category: 'Adventure', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486411117.01.L.jpg' },
      { title: 'From the Earth to the Moon', year: 1865, pages: 186, category: 'Adventure', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0486450732.01.L.jpg' },
      { title: 'Do Androids Dream of Electric Sheep?', year: 1968, pages: 244, category: 'Dystopian Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0345404475.01.L.jpg' },
      { title: 'Ubik', year: 1969, pages: 224, category: 'Dystopian Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0547572298.01.L.jpg' },
      { title: 'The Man in the High Castle', year: 1962, pages: 259, category: 'Alternate History', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0547572484.01.L.jpg' },
      { title: 'A Scanner Darkly', year: 1977, pages: 224, category: 'Dystopian Science Fiction', image_url: 'https://images-na.ssl-images-amazon.com/images/P/0547572166.01.L.jpg' }
    ], {});

    // Insert books_authors relationships
    const authors = await queryInterface.sequelize.query(
      'SELECT id, first_name, last_name FROM authors;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const books = await queryInterface.sequelize.query(
      'SELECT id, title FROM books;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const booksAuthors = [
      // Isaac Asimov's books
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Prelude to Foundation').id },
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Forward the Foundation').id },
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Foundation').id },
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Foundation and Empire').id },
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Second Foundation').id },
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Foundation\'s Edge').id },
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Foundation and Earth').id },
      { author_id: authors.find(a => a.first_name === 'Isaac' && a.last_name === 'Asimov').id, book_id: books.find(b => b.title === 'Nemesis').id },
      
      // Arthur C. Clarke's books
      { author_id: authors.find(a => a.first_name === 'Arthur' && a.last_name === 'Clarke').id, book_id: books.find(b => b.title === '2001: A Space Odyssey').id },
      { author_id: authors.find(a => a.first_name === 'Arthur' && a.last_name === 'Clarke').id, book_id: books.find(b => b.title === '2010: Odyssey Two').id },
      { author_id: authors.find(a => a.first_name === 'Arthur' && a.last_name === 'Clarke').id, book_id: books.find(b => b.title === '2061: Odyssey Three').id },
      { author_id: authors.find(a => a.first_name === 'Arthur' && a.last_name === 'Clarke').id, book_id: books.find(b => b.title === '3001: The Final Odyssey').id },
      
      // H.G. Wells' books
      { author_id: authors.find(a => a.first_name === 'Herbert' && a.last_name === 'Wells').id, book_id: books.find(b => b.title === 'The Time Machine').id },
      { author_id: authors.find(a => a.first_name === 'Herbert' && a.last_name === 'Wells').id, book_id: books.find(b => b.title === 'The Island of Doctor Moreau').id },
      { author_id: authors.find(a => a.first_name === 'Herbert' && a.last_name === 'Wells').id, book_id: books.find(b => b.title === 'The Invisible Man').id },
      { author_id: authors.find(a => a.first_name === 'Herbert' && a.last_name === 'Wells').id, book_id: books.find(b => b.title === 'The War of the Worlds').id },
      
      // Jules Verne's books
      { author_id: authors.find(a => a.first_name === 'Jules' && a.last_name === 'Verne').id, book_id: books.find(b => b.title === 'Journey to the Center of the Earth').id },
      { author_id: authors.find(a => a.first_name === 'Jules' && a.last_name === 'Verne').id, book_id: books.find(b => b.title === 'Twenty Thousand Leagues Under the Sea').id },
      { author_id: authors.find(a => a.first_name === 'Jules' && a.last_name === 'Verne').id, book_id: books.find(b => b.title === 'Around the World in Eighty Days').id },
      { author_id: authors.find(a => a.first_name === 'Jules' && a.last_name === 'Verne').id, book_id: books.find(b => b.title === 'From the Earth to the Moon').id },
      
      // Philip K. Dick's books
      { author_id: authors.find(a => a.first_name === 'Philip' && a.last_name === 'Dick').id, book_id: books.find(b => b.title === 'Do Androids Dream of Electric Sheep?').id },
      { author_id: authors.find(a => a.first_name === 'Philip' && a.last_name === 'Dick').id, book_id: books.find(b => b.title === 'Ubik').id },
      { author_id: authors.find(a => a.first_name === 'Philip' && a.last_name === 'Dick').id, book_id: books.find(b => b.title === 'The Man in the High Castle').id },
      { author_id: authors.find(a => a.first_name === 'Philip' && a.last_name === 'Dick').id, book_id: books.find(b => b.title === 'A Scanner Darkly').id }
    ];

    await queryInterface.bulkInsert('books_authors', booksAuthors, {});
  },

  async down(queryInterface, Sequelize) {
    // Delete all data
    await queryInterface.bulkDelete('books_authors', null, {});
    await queryInterface.bulkDelete('books', null, {});
    await queryInterface.bulkDelete('authors', null, {});
  }
};
