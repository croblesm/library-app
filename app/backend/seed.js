const { getSequelize } = require('./config/db');
const initModels = require('./models/initModels');

async function seedDatabase() {
    try {
        const sequelize = await getSequelize();
        const models = await initModels(sequelize);
        
        console.log('Starting database seeding...');
        
        // Insert authors
        const authors = await models.Author.bulkCreate([
            { first_name: 'Isaac', middle_name: 'Yudovick', last_name: 'Asimov' },
            { first_name: 'Arthur', middle_name: 'Charles', last_name: 'Clarke' },
            { first_name: 'Herbert', middle_name: 'George', last_name: 'Wells' },
            { first_name: 'Jules', middle_name: 'Gabriel', last_name: 'Verne' },
            { first_name: 'Philip', middle_name: 'Kindred', last_name: 'Dick' }
        ]);
        console.log('Authors created:', authors.length);

        // Insert books
        const books = await models.Book.bulkCreate([
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
        ]);
        console.log('Books created:', books.length);

        // Create associations
        const associations = [
            // Isaac Asimov's books
            { author_id: 1, book_id: 1 }, { author_id: 1, book_id: 2 }, { author_id: 1, book_id: 3 },
            { author_id: 1, book_id: 4 }, { author_id: 1, book_id: 5 }, { author_id: 1, book_id: 6 },
            { author_id: 1, book_id: 7 }, { author_id: 1, book_id: 8 },
            
            // Arthur C. Clarke's books
            { author_id: 2, book_id: 9 }, { author_id: 2, book_id: 10 }, { author_id: 2, book_id: 11 }, { author_id: 2, book_id: 12 },
            
            // H.G. Wells' books
            { author_id: 3, book_id: 13 }, { author_id: 3, book_id: 14 }, { author_id: 3, book_id: 15 }, { author_id: 3, book_id: 16 },
            
            // Jules Verne's books
            { author_id: 4, book_id: 17 }, { author_id: 4, book_id: 18 }, { author_id: 4, book_id: 19 }, { author_id: 4, book_id: 20 },
            
            // Philip K. Dick's books
            { author_id: 5, book_id: 21 }, { author_id: 5, book_id: 22 }, { author_id: 5, book_id: 23 }, { author_id: 5, book_id: 24 }
        ];

        await models.BooksAuthors.bulkCreate(associations);
        console.log('Book-Author associations created:', associations.length);

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
