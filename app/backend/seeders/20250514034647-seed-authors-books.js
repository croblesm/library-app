'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert authors (29 total)
    await queryInterface.bulkInsert('authors', [
      { first_name: 'Isaac', middle_name: 'Yudovick', last_name: 'Asimov', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Isaac.Asimov01.jpg/330px-Isaac.Asimov01.jpg' },
      { first_name: 'Arthur', middle_name: 'Charles', last_name: 'Clarke', image_url: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Arthur_C._Clarke_1965_%28cropped%29.jpg' },
      { first_name: 'Philip', middle_name: 'Kindred', last_name: 'Dick', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Philip_K_Dick_in_early_1960s_Arthur_Knight_%283x4_cropped%29.jpg/330px-Philip_K_Dick_in_early_1960s_Arthur_Knight_%283x4_cropped%29.jpg' },
      { first_name: 'Herbert', middle_name: 'George', last_name: 'Wells', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/H.G._Wells_by_Beresford.jpg/330px-H.G._Wells_by_Beresford.jpg' },
      { first_name: 'Jules', middle_name: 'Gabriel', last_name: 'Verne', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Jules_Verne_by_%C3%89tienne_Carjat.jpg/330px-Jules_Verne_by_%C3%89tienne_Carjat.jpg' },
      { first_name: 'Frank', middle_name: 'Patrick', last_name: 'Herbert', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Frank_Herbert_1984_%28square%29.jpg/330px-Frank_Herbert_1984_%28square%29.jpg' },
      { first_name: 'John', middle_name: 'Ronald Reuel', last_name: 'Tolkien', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/J._R._R._Tolkien%2C_ca._1925.jpg/330px-J._R._R._Tolkien%2C_ca._1925.jpg' },
      { first_name: 'Orson', middle_name: 'Scott', last_name: 'Card', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Orson_Scott_Card_at_BYU_Symposium_20080216_closeup.jpg/330px-Orson_Scott_Card_at_BYU_Symposium_20080216_closeup.jpg' },
      { first_name: 'Robert', middle_name: 'Anson', last_name: 'Heinlein', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Robert_A._Heinlein_%28Doubleday_photo%29.jpg/330px-Robert_A._Heinlein_%28Doubleday_photo%29.jpg' },
      { first_name: 'Ernest', middle_name: 'Thomas', last_name: 'Cline', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/NBF2024-ernest-cline.jpg/330px-NBF2024-ernest-cline.jpg' },
      { first_name: 'Andy', middle_name: null, last_name: 'Weir', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Andy_Weir_by_Gage_Skidmore.jpg/330px-Andy_Weir_by_Gage_Skidmore.jpg' },
      { first_name: 'Michael', middle_name: 'John', last_name: 'Crichton', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/MichaelCrichton_2.jpg/330px-MichaelCrichton_2.jpg' },
      { first_name: 'Yuval', middle_name: 'Noah', last_name: 'Harari', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/MKr364751_Yuval_Noah_Harari_%28Frankfurter_Buchmesse_2024%29.jpg/330px-MKr364751_Yuval_Noah_Harari_%28Frankfurter_Buchmesse_2024%29.jpg' },
      { first_name: 'Ray', middle_name: 'Douglas', last_name: 'Bradbury', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Ray_Bradbury_%281975%29_-cropped-.jpg/330px-Ray_Bradbury_%281975%29_-cropped-.jpg' },
      { first_name: 'Ursula', middle_name: 'Kroeber', last_name: 'Le Guin', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Ursula_Le_Guin_%283551195631%29_-_Restoration.jpg/330px-Ursula_Le_Guin_%283551195631%29_-_Restoration.jpg' },
      { first_name: 'Kurt', middle_name: null, last_name: 'Vonnegut', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg/330px-Kurt_Vonnegut_by_Bernard_Gotfryd_%281965%29.jpg' },
      { first_name: 'George', middle_name: null, last_name: 'Orwell', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/George_Orwell_press_photo.jpg/330px-George_Orwell_press_photo.jpg' },
      { first_name: 'Aldous', middle_name: 'Leonard', last_name: 'Huxley', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Aldous_Huxley_psychical_researcher.png/330px-Aldous_Huxley_psychical_researcher.png' },
      { first_name: 'Douglas', middle_name: 'Noel', last_name: 'Adams', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Douglas_adams_portrait_cropped.jpg/330px-Douglas_adams_portrait_cropped.jpg' },
      { first_name: 'William', middle_name: 'Ford', last_name: 'Gibson', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/William_Gibson_60th_birthday_portrait_%283x4_cropped%29.jpg/330px-William_Gibson_60th_birthday_portrait_%283x4_cropped%29.jpg' },
      { first_name: 'Neal', middle_name: 'Town', last_name: 'Stephenson', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Neal_Stephenson_in_2019_A_021.jpg/330px-Neal_Stephenson_in_2019_A_021.jpg' },
      { first_name: 'Stanislaw', middle_name: null, last_name: 'Lem', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/St_Lem_resize.jpg/330px-St_Lem_resize.jpg' },
      { first_name: 'Margaret', middle_name: 'Eleanor', last_name: 'Atwood', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Margaret_Atwood_%283x4_cropped%29.jpg/330px-Margaret_Atwood_%283x4_cropped%29.jpg' },
      { first_name: 'Octavia', middle_name: 'Estelle', last_name: 'Butler', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Butler_signing.jpg/330px-Butler_signing.jpg' },
      { first_name: 'Brandon', middle_name: 'Waldo', last_name: 'Sanderson', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Brandon_Sanderson_-_Lucca_Comics_%26_Games_2016.jpg/330px-Brandon_Sanderson_-_Lucca_Comics_%26_Games_2016.jpg' },
      { first_name: 'Terry', middle_name: 'David John', last_name: 'Pratchett', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Terry_Pratchett_%283x4_cropped%29.jpg/330px-Terry_Pratchett_%283x4_cropped%29.jpg' },
      { first_name: 'Suzanne', middle_name: 'Marie', last_name: 'Collins', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Suzanne_Collins_David_Shankbone_2010.jpg/330px-Suzanne_Collins_David_Shankbone_2010.jpg' },
      { first_name: 'Cixin', middle_name: null, last_name: 'Liu', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Cixin_Liu_at_Worldcon_75%2C_Helsinki%2C_before_the_Hugo_Awards.jpg/330px-Cixin_Liu_at_Worldcon_75%2C_Helsinki%2C_before_the_Hugo_Awards.jpg' },
      { first_name: 'Patrick', middle_name: 'James', last_name: 'Rothfuss', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Patrick-rothfuss-2014-kyle-cassidy.jpg/330px-Patrick-rothfuss-2014-kyle-cassidy.jpg' }
    ], {});

    // Insert books (~200 total)
    await queryInterface.bulkInsert('books', [
      // Isaac Asimov (12 books)
      { title: 'Foundation', year: 1951, pages: 244, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553293354-L.jpg' },
      { title: 'Foundation and Empire', year: 1952, pages: 247, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553293370-L.jpg' },
      { title: 'Second Foundation', year: 1953, pages: 210, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553293362-L.jpg' },
      { title: 'Foundation\'s Edge', year: 1982, pages: 367, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553293389-L.jpg' },
      { title: 'Foundation and Earth', year: 1986, pages: 356, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553587579-L.jpg' },
      { title: 'Prelude to Foundation', year: 1988, pages: 403, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553278398-L.jpg' },
      { title: 'Forward the Foundation', year: 1993, pages: 417, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553565079-L.jpg' },
      { title: 'I, Robot', year: 1950, pages: 253, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553294385-L.jpg' },
      { title: 'The Caves of Steel', year: 1954, pages: 271, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553293400-L.jpg' },
      { title: 'The Naked Sun', year: 1957, pages: 240, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553293397-L.jpg' },
      { title: 'Nemesis', year: 1989, pages: 386, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553286285-L.jpg' },
      { title: 'The End of Eternity', year: 1955, pages: 191, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765319195-L.jpg' },

      // Arthur C. Clarke (8 books)
      { title: '2001: A Space Odyssey', year: 1968, pages: 221, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0451457994-L.jpg' },
      { title: '2010: Odyssey Two', year: 1982, pages: 291, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345413970-L.jpg' },
      { title: '2061: Odyssey Three', year: 1987, pages: 256, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345358791-L.jpg' },
      { title: '3001: The Final Odyssey', year: 1997, pages: 288, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345423496-L.jpg' },
      { title: 'Rendezvous with Rama', year: 1973, pages: 243, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553287893-L.jpg' },
      { title: 'Childhood\'s End', year: 1953, pages: 214, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345347951-L.jpg' },
      { title: 'The City and the Stars', year: 1956, pages: 256, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0451418263-L.jpg' },
      { title: 'The Fountains of Paradise', year: 1979, pages: 261, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0446677949-L.jpg' },

      // Philip K. Dick (10 books)
      { title: 'Do Androids Dream of Electric Sheep?', year: 1968, pages: 244, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345404475-L.jpg' },
      { title: 'Ubik', year: 1969, pages: 224, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0547572298-L.jpg' },
      { title: 'The Man in the High Castle', year: 1962, pages: 259, category: 'Alternate History', image_url: 'https://covers.openlibrary.org/b/isbn/0547572484-L.jpg' },
      { title: 'A Scanner Darkly', year: 1977, pages: 224, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0679736654-L.jpg' },
      { title: 'VALIS', year: 1981, pages: 271, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0547572417-L.jpg' },
      { title: 'The Three Stigmata of Palmer Eldritch', year: 1965, pages: 278, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0547572247-L.jpg' },
      { title: 'Flow My Tears, the Policeman Said', year: 1974, pages: 231, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0547572255-L.jpg' },
      { title: 'Martian Time-Slip', year: 1964, pages: 262, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0547572239-L.jpg' },
      { title: 'Time Out of Joint', year: 1959, pages: 256, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0547572530-L.jpg' },
      { title: 'The Penultimate Truth', year: 1964, pages: 224, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0547572506-L.jpg' },

      // H.G. Wells (6 books)
      { title: 'The Time Machine', year: 1895, pages: 118, category: 'Classic Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0486284719-L.jpg' },
      { title: 'The Island of Doctor Moreau', year: 1896, pages: 153, category: 'Classic Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0486290271-L.jpg' },
      { title: 'The Invisible Man', year: 1897, pages: 151, category: 'Classic Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0486270718-L.jpg' },
      { title: 'The War of the Worlds', year: 1898, pages: 192, category: 'Classic Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0486295060-L.jpg' },
      { title: 'The First Men in the Moon', year: 1901, pages: 224, category: 'Classic Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0486414183-L.jpg' },
      { title: 'When the Sleeper Wakes', year: 1910, pages: 240, category: 'Classic Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0486420698-L.jpg' },

      // Jules Verne (8 books)
      { title: 'Journey to the Center of the Earth', year: 1864, pages: 183, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/0486440885-L.jpg' },
      { title: 'Twenty Thousand Leagues Under the Sea', year: 1870, pages: 187, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/0199539278-L.jpg' },
      { title: 'Around the World in Eighty Days', year: 1873, pages: 167, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/0486411117-L.jpg' },
      { title: 'From the Earth to the Moon', year: 1865, pages: 186, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/0486450732-L.jpg' },
      { title: 'The Mysterious Island', year: 1875, pages: 493, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/0812966422-L.jpg' },
      { title: 'Five Weeks in a Balloon', year: 1863, pages: 256, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/1853262211-L.jpg' },
      { title: 'Michael Strogoff', year: 1876, pages: 352, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/1853261254-L.jpg' },
      { title: 'Robur the Conqueror', year: 1886, pages: 211, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/1974536343-L.jpg' },

      // Frank Herbert (8 books)
      { title: 'Dune', year: 1965, pages: 412, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0441172717-L.jpg' },
      { title: 'Dune Messiah', year: 1969, pages: 256, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0593098234-L.jpg' },
      { title: 'Children of Dune', year: 1976, pages: 444, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0593098242-L.jpg' },
      { title: 'God Emperor of Dune', year: 1981, pages: 454, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0593098250-L.jpg' },
      { title: 'Heretics of Dune', year: 1984, pages: 480, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0593098269-L.jpg' },
      { title: 'Chapterhouse: Dune', year: 1985, pages: 464, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0593098277-L.jpg' },
      { title: 'The White Plague', year: 1982, pages: 445, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765325721-L.jpg' },
      { title: 'The Dosadi Experiment', year: 1977, pages: 336, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765342537-L.jpg' },

      // J.R.R. Tolkien (7 books)
      { title: 'The Hobbit', year: 1937, pages: 310, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0547928227-L.jpg' },
      { title: 'The Fellowship of the Ring', year: 1954, pages: 423, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0547928210-L.jpg' },
      { title: 'The Two Towers', year: 1954, pages: 352, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0547928203-L.jpg' },
      { title: 'The Return of the King', year: 1955, pages: 416, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0547928197-L.jpg' },
      { title: 'The Silmarillion', year: 1977, pages: 365, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0618391118-L.jpg' },
      { title: 'Unfinished Tales', year: 1980, pages: 472, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0618154051-L.jpg' },
      { title: 'The Children of Hurin', year: 2007, pages: 313, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0618894640-L.jpg' },

      // Orson Scott Card (6 books)
      { title: 'Ender\'s Game', year: 1985, pages: 324, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0812550706-L.jpg' },
      { title: 'Speaker for the Dead', year: 1986, pages: 382, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0812550757-L.jpg' },
      { title: 'Xenocide', year: 1991, pages: 394, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0812509250-L.jpg' },
      { title: 'Children of the Mind', year: 1996, pages: 370, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0812522397-L.jpg' },
      { title: 'Ender\'s Shadow', year: 1999, pages: 469, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0812575717-L.jpg' },
      { title: 'Shadow of the Hegemon', year: 2001, pages: 451, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0812565959-L.jpg' },

      // Robert A. Heinlein (10 books)
      { title: 'Starship Troopers', year: 1959, pages: 263, category: 'Military Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0441783589-L.jpg' },
      { title: 'Stranger in a Strange Land', year: 1961, pages: 528, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0441790348-L.jpg' },
      { title: 'The Moon Is a Harsh Mistress', year: 1966, pages: 382, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0312863551-L.jpg' },
      { title: 'Time Enough for Love', year: 1973, pages: 605, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0441810764-L.jpg' },
      { title: 'Friday', year: 1982, pages: 368, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345309855-L.jpg' },
      { title: 'Job: A Comedy of Justice', year: 1984, pages: 376, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345316509-L.jpg' },
      { title: 'The Cat Who Walks Through Walls', year: 1985, pages: 388, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0441094996-L.jpg' },
      { title: 'Have Space Suit - Will Travel', year: 1958, pages: 276, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345324412-L.jpg' },
      { title: 'Citizen of the Galaxy', year: 1957, pages: 302, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0743305590-L.jpg' },
      { title: 'The Door into Summer', year: 1957, pages: 188, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345330129-L.jpg' },

      // Ernest Cline (2 books)
      { title: 'Ready Player One', year: 2011, pages: 374, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0307887448-L.jpg' },
      { title: 'Ready Player Two', year: 2020, pages: 366, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/1524761338-L.jpg' },

      // Andy Weir (3 books)
      { title: 'The Martian', year: 2011, pages: 369, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553418025-L.jpg' },
      { title: 'Artemis', year: 2017, pages: 305, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553448129-L.jpg' },
      { title: 'Project Hail Mary', year: 2021, pages: 476, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0593135202-L.jpg' },

      // Michael Crichton (10 books)
      { title: 'Jurassic Park', year: 1990, pages: 448, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0345538986-L.jpg' },
      { title: 'The Lost World', year: 1995, pages: 393, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0345402871-L.jpg' },
      { title: 'The Andromeda Strain', year: 1969, pages: 295, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0061703168-L.jpg' },
      { title: 'Sphere', year: 1987, pages: 385, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0061990558-L.jpg' },
      { title: 'Congo', year: 1980, pages: 348, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0060541830-L.jpg' },
      { title: 'Timeline', year: 1999, pages: 496, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0345468260-L.jpg' },
      { title: 'Prey', year: 2002, pages: 367, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0061703087-L.jpg' },
      { title: 'Next', year: 2006, pages: 431, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0060873167-L.jpg' },
      { title: 'Pirate Latitudes', year: 2009, pages: 312, category: 'Adventure', image_url: 'https://covers.openlibrary.org/b/isbn/0061929379-L.jpg' },
      { title: 'Micro', year: 2011, pages: 424, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0060873027-L.jpg' },

      // Yuval Noah Harari (3 books)
      { title: 'Sapiens: A Brief History of Humankind', year: 2011, pages: 443, category: 'Non-Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0062316095-L.jpg' },
      { title: 'Homo Deus: A Brief History of Tomorrow', year: 2015, pages: 449, category: 'Non-Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0062464310-L.jpg' },
      { title: '21 Lessons for the 21st Century', year: 2018, pages: 372, category: 'Non-Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0525512179-L.jpg' },

      // Ray Bradbury (10 books)
      { title: 'Fahrenheit 451', year: 1953, pages: 194, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/1451673310-L.jpg' },
      { title: 'The Martian Chronicles', year: 1950, pages: 222, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/1451678193-L.jpg' },
      { title: 'Something Wicked This Way Comes', year: 1962, pages: 293, category: 'Horror', image_url: 'https://covers.openlibrary.org/b/isbn/1451651740-L.jpg' },
      { title: 'The Illustrated Man', year: 1951, pages: 275, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/1451678185-L.jpg' },
      { title: 'Dandelion Wine', year: 1957, pages: 239, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0380977265-L.jpg' },
      { title: 'The October Country', year: 1955, pages: 276, category: 'Horror', image_url: 'https://covers.openlibrary.org/b/isbn/0345324889-L.jpg' },
      { title: 'Long After Midnight', year: 1976, pages: 279, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0553275135-L.jpg' },
      { title: 'Death Is a Lonely Business', year: 1985, pages: 279, category: 'Horror', image_url: 'https://covers.openlibrary.org/b/isbn/0380786745-L.jpg' },
      { title: 'A Graveyard for Lunatics', year: 1990, pages: 285, category: 'Horror', image_url: 'https://covers.openlibrary.org/b/isbn/0380812002-L.jpg' },
      { title: 'Green Shadows, White Whale', year: 1992, pages: 271, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0380789663-L.jpg' },

      // Ursula K. Le Guin (10 books)
      { title: 'A Wizard of Earthsea', year: 1968, pages: 183, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0547722028-L.jpg' },
      { title: 'The Tombs of Atuan', year: 1971, pages: 163, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0689845340-L.jpg' },
      { title: 'The Farthest Shore', year: 1972, pages: 197, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0689845346-L.jpg' },
      { title: 'The Left Hand of Darkness', year: 1969, pages: 304, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0441478123-L.jpg' },
      { title: 'The Dispossessed', year: 1974, pages: 387, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0061054887-L.jpg' },
      { title: 'The Lathe of Heaven', year: 1971, pages: 184, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/1416556966-L.jpg' },
      { title: 'The Word for World Is Forest', year: 1976, pages: 189, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765324644-L.jpg' },
      { title: 'Tehanu', year: 1990, pages: 226, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0689845359-L.jpg' },
      { title: 'The Other Wind', year: 2001, pages: 246, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0152048197-L.jpg' },
      { title: 'The Telling', year: 2000, pages: 264, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0441011233-L.jpg' },

      // Kurt Vonnegut (8 books)
      { title: 'Slaughterhouse-Five', year: 1969, pages: 275, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0385333846-L.jpg' },
      { title: 'Cat\'s Cradle', year: 1963, pages: 287, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/038533348X-L.jpg' },
      { title: 'Breakfast of Champions', year: 1973, pages: 303, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0385334206-L.jpg' },
      { title: 'The Sirens of Titan', year: 1959, pages: 326, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0385333498-L.jpg' },
      { title: 'Player Piano', year: 1952, pages: 341, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0385333781-L.jpg' },
      { title: 'God Bless You, Mr. Rosewater', year: 1965, pages: 218, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0385333471-L.jpg' },
      { title: 'Mother Night', year: 1962, pages: 268, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0385334141-L.jpg' },
      { title: 'Galapagos', year: 1985, pages: 324, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0385333870-L.jpg' },

      // George Orwell (5 books)
      { title: '1984', year: 1949, pages: 328, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0451524934-L.jpg' },
      { title: 'Animal Farm', year: 1945, pages: 141, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0451526341-L.jpg' },
      { title: 'Down and Out in Paris and London', year: 1933, pages: 228, category: 'Non-Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0156262241-L.jpg' },
      { title: 'Homage to Catalonia', year: 1938, pages: 232, category: 'Non-Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0156421178-L.jpg' },
      { title: 'Coming Up for Air', year: 1939, pages: 237, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0156196255-L.jpg' },

      // Aldous Huxley (4 books)
      { title: 'Brave New World', year: 1932, pages: 288, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0060850523-L.jpg' },
      { title: 'Brave New World Revisited', year: 1958, pages: 123, category: 'Non-Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0060898526-L.jpg' },
      { title: 'Island', year: 1962, pages: 354, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0061561797-L.jpg' },
      { title: 'Ape and Essence', year: 1948, pages: 152, category: 'Post-Apocalyptic', image_url: 'https://covers.openlibrary.org/b/isbn/1566630231-L.jpg' },

      // Douglas Adams (6 books)
      { title: 'The Hitchhiker\'s Guide to the Galaxy', year: 1979, pages: 193, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345391802-L.jpg' },
      { title: 'The Restaurant at the End of the Universe', year: 1980, pages: 208, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345391810-L.jpg' },
      { title: 'Life, the Universe and Everything', year: 1982, pages: 227, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345391829-L.jpg' },
      { title: 'So Long, and Thanks for All the Fish', year: 1984, pages: 204, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345391837-L.jpg' },
      { title: 'Mostly Harmless', year: 1992, pages: 230, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0345418778-L.jpg' },
      { title: 'Dirk Gently\'s Holistic Detective Agency', year: 1987, pages: 306, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0671746723-L.jpg' },

      // William Gibson (6 books)
      { title: 'Neuromancer', year: 1984, pages: 271, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0441569595-L.jpg' },
      { title: 'Count Zero', year: 1986, pages: 256, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0441117732-L.jpg' },
      { title: 'Mona Lisa Overdrive', year: 1988, pages: 308, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0553281747-L.jpg' },
      { title: 'Virtual Light', year: 1993, pages: 325, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0553566067-L.jpg' },
      { title: 'Pattern Recognition', year: 2003, pages: 367, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0425198685-L.jpg' },
      { title: 'The Peripheral', year: 2014, pages: 485, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0425276236-L.jpg' },

      // Neal Stephenson (6 books)
      { title: 'Snow Crash', year: 1992, pages: 440, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0553380958-L.jpg' },
      { title: 'The Diamond Age', year: 1995, pages: 455, category: 'Cyberpunk', image_url: 'https://covers.openlibrary.org/b/isbn/0553380966-L.jpg' },
      { title: 'Cryptonomicon', year: 1999, pages: 918, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0060512806-L.jpg' },
      { title: 'Anathem', year: 2008, pages: 937, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0061474096-L.jpg' },
      { title: 'Reamde', year: 2011, pages: 1044, category: 'Techno-Thriller', image_url: 'https://covers.openlibrary.org/b/isbn/0061977969-L.jpg' },
      { title: 'Seveneves', year: 2015, pages: 867, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0062190377-L.jpg' },

      // Stanislaw Lem (6 books)
      { title: 'Solaris', year: 1961, pages: 204, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0156027607-L.jpg' },
      { title: 'The Cyberiad', year: 1965, pages: 295, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0156027593-L.jpg' },
      { title: 'The Star Diaries', year: 1957, pages: 275, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0156849054-L.jpg' },
      { title: 'The Invincible', year: 1964, pages: 224, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0262538490-L.jpg' },
      { title: 'His Master\'s Voice', year: 1968, pages: 199, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0156402912-L.jpg' },
      { title: 'The Futurological Congress', year: 1971, pages: 149, category: 'Satire', image_url: 'https://covers.openlibrary.org/b/isbn/0156340402-L.jpg' },

      // Margaret Atwood (6 books)
      { title: 'The Handmaid\'s Tale', year: 1985, pages: 311, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/038549081X-L.jpg' },
      { title: 'The Testaments', year: 2019, pages: 422, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0385543786-L.jpg' },
      { title: 'Oryx and Crake', year: 2003, pages: 374, category: 'Post-Apocalyptic', image_url: 'https://covers.openlibrary.org/b/isbn/0385721676-L.jpg' },
      { title: 'The Year of the Flood', year: 2009, pages: 434, category: 'Post-Apocalyptic', image_url: 'https://covers.openlibrary.org/b/isbn/0307397971-L.jpg' },
      { title: 'MaddAddam', year: 2013, pages: 394, category: 'Post-Apocalyptic', image_url: 'https://covers.openlibrary.org/b/isbn/0307455475-L.jpg' },
      { title: 'The Blind Assassin', year: 2000, pages: 521, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0385720955-L.jpg' },

      // Octavia Butler (6 books)
      { title: 'Kindred', year: 1979, pages: 264, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0807083690-L.jpg' },
      { title: 'Parable of the Sower', year: 1993, pages: 345, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0446675504-L.jpg' },
      { title: 'Parable of the Talents', year: 1998, pages: 365, category: 'Dystopian Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0446675784-L.jpg' },
      { title: 'Dawn', year: 1987, pages: 248, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0446603775-L.jpg' },
      { title: 'Adulthood Rites', year: 1988, pages: 277, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0446603783-L.jpg' },
      { title: 'Imago', year: 1989, pages: 264, category: 'Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0446603638-L.jpg' },

      // Brandon Sanderson (8 books)
      { title: 'The Final Empire', year: 2006, pages: 541, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765350386-L.jpg' },
      { title: 'The Well of Ascension', year: 2007, pages: 590, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765356139-L.jpg' },
      { title: 'The Hero of Ages', year: 2008, pages: 572, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765356147-L.jpg' },
      { title: 'The Way of Kings', year: 2010, pages: 1007, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765365278-L.jpg' },
      { title: 'Words of Radiance', year: 2014, pages: 1087, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765365286-L.jpg' },
      { title: 'Oathbringer', year: 2017, pages: 1248, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765326361-L.jpg' },
      { title: 'Rhythm of War', year: 2020, pages: 1232, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765326388-L.jpg' },
      { title: 'Elantris', year: 2005, pages: 496, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0765350378-L.jpg' },

      // Terry Pratchett (10 books)
      { title: 'The Colour of Magic', year: 1983, pages: 288, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0062225677-L.jpg' },
      { title: 'The Light Fantastic', year: 1986, pages: 241, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0062225685-L.jpg' },
      { title: 'Equal Rites', year: 1987, pages: 228, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0062225693-L.jpg' },
      { title: 'Mort', year: 1987, pages: 243, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0062225707-L.jpg' },
      { title: 'Guards! Guards!', year: 1989, pages: 354, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0062225758-L.jpg' },
      { title: 'Small Gods', year: 1992, pages: 389, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0062237379-L.jpg' },
      { title: 'Going Postal', year: 2004, pages: 480, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0060502932-L.jpg' },
      { title: 'Night Watch', year: 2002, pages: 473, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0060013125-L.jpg' },
      { title: 'Reaper Man', year: 1991, pages: 252, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0061020628-L.jpg' },
      { title: 'Wyrd Sisters', year: 1988, pages: 265, category: 'Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0062225731-L.jpg' },

      // Suzanne Collins (4 books)
      { title: 'The Hunger Games', year: 2008, pages: 374, category: 'Young Adult', image_url: 'https://covers.openlibrary.org/b/isbn/0439023483-L.jpg' },
      { title: 'Catching Fire', year: 2009, pages: 391, category: 'Young Adult', image_url: 'https://covers.openlibrary.org/b/isbn/0439023491-L.jpg' },
      { title: 'Mockingjay', year: 2010, pages: 390, category: 'Young Adult', image_url: 'https://covers.openlibrary.org/b/isbn/0439023513-L.jpg' },
      { title: 'The Ballad of Songbirds and Snakes', year: 2020, pages: 517, category: 'Young Adult', image_url: 'https://covers.openlibrary.org/b/isbn/1338635174-L.jpg' },

      // Cixin Liu (4 books)
      { title: 'The Three-Body Problem', year: 2008, pages: 399, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765382032-L.jpg' },
      { title: 'The Dark Forest', year: 2008, pages: 512, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765386690-L.jpg' },
      { title: 'Death\'s End', year: 2010, pages: 604, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765386631-L.jpg' },
      { title: 'Ball Lightning', year: 2004, pages: 384, category: 'Hard Science Fiction', image_url: 'https://covers.openlibrary.org/b/isbn/0765394073-L.jpg' },

      // Patrick Rothfuss (2 books)
      { title: 'The Name of the Wind', year: 2007, pages: 662, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0756404746-L.jpg' },
      { title: 'The Wise Man\'s Fear', year: 2011, pages: 994, category: 'Epic Fantasy', image_url: 'https://covers.openlibrary.org/b/isbn/0756407915-L.jpg' }
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

    const findAuthor = (firstName, lastName) => authors.find(a => a.first_name === firstName && a.last_name === lastName).id;
    const findBook = (title) => books.find(b => b.title === title).id;
    const mapBooks = (firstName, lastName, bookTitles) =>
      bookTitles.map(title => ({ author_id: findAuthor(firstName, lastName), book_id: findBook(title) }));

    const booksAuthors = [
      // Isaac Asimov
      ...mapBooks('Isaac', 'Asimov', [
        'Foundation', 'Foundation and Empire', 'Second Foundation',
        'Foundation\'s Edge', 'Foundation and Earth', 'Prelude to Foundation',
        'Forward the Foundation', 'I, Robot', 'The Caves of Steel',
        'The Naked Sun', 'Nemesis', 'The End of Eternity'
      ]),

      // Arthur C. Clarke
      ...mapBooks('Arthur', 'Clarke', [
        '2001: A Space Odyssey', '2010: Odyssey Two', '2061: Odyssey Three',
        '3001: The Final Odyssey', 'Rendezvous with Rama', 'Childhood\'s End',
        'The City and the Stars', 'The Fountains of Paradise'
      ]),

      // Philip K. Dick
      ...mapBooks('Philip', 'Dick', [
        'Do Androids Dream of Electric Sheep?', 'Ubik', 'The Man in the High Castle',
        'A Scanner Darkly', 'VALIS', 'The Three Stigmata of Palmer Eldritch',
        'Flow My Tears, the Policeman Said', 'Martian Time-Slip',
        'Time Out of Joint', 'The Penultimate Truth'
      ]),

      // H.G. Wells
      ...mapBooks('Herbert', 'Wells', [
        'The Time Machine', 'The Island of Doctor Moreau', 'The Invisible Man',
        'The War of the Worlds', 'The First Men in the Moon', 'When the Sleeper Wakes'
      ]),

      // Jules Verne
      ...mapBooks('Jules', 'Verne', [
        'Journey to the Center of the Earth', 'Twenty Thousand Leagues Under the Sea',
        'Around the World in Eighty Days', 'From the Earth to the Moon',
        'The Mysterious Island', 'Five Weeks in a Balloon',
        'Michael Strogoff', 'Robur the Conqueror'
      ]),

      // Frank Herbert
      ...mapBooks('Frank', 'Herbert', [
        'Dune', 'Dune Messiah', 'Children of Dune', 'God Emperor of Dune',
        'Heretics of Dune', 'Chapterhouse: Dune', 'The White Plague',
        'The Dosadi Experiment'
      ]),

      // J.R.R. Tolkien
      ...mapBooks('John', 'Tolkien', [
        'The Hobbit', 'The Fellowship of the Ring', 'The Two Towers',
        'The Return of the King', 'The Silmarillion', 'Unfinished Tales',
        'The Children of Hurin'
      ]),

      // Orson Scott Card
      ...mapBooks('Orson', 'Card', [
        'Ender\'s Game', 'Speaker for the Dead', 'Xenocide',
        'Children of the Mind', 'Ender\'s Shadow', 'Shadow of the Hegemon'
      ]),

      // Robert A. Heinlein
      ...mapBooks('Robert', 'Heinlein', [
        'Starship Troopers', 'Stranger in a Strange Land', 'The Moon Is a Harsh Mistress',
        'Time Enough for Love', 'Friday', 'Job: A Comedy of Justice',
        'The Cat Who Walks Through Walls', 'Have Space Suit - Will Travel',
        'Citizen of the Galaxy', 'The Door into Summer'
      ]),

      // Ernest Cline
      ...mapBooks('Ernest', 'Cline', [
        'Ready Player One', 'Ready Player Two'
      ]),

      // Andy Weir
      ...mapBooks('Andy', 'Weir', [
        'The Martian', 'Artemis', 'Project Hail Mary'
      ]),

      // Michael Crichton
      ...mapBooks('Michael', 'Crichton', [
        'Jurassic Park', 'The Lost World', 'The Andromeda Strain',
        'Sphere', 'Congo', 'Timeline', 'Prey', 'Next',
        'Pirate Latitudes', 'Micro'
      ]),

      // Yuval Noah Harari
      ...mapBooks('Yuval', 'Harari', [
        'Sapiens: A Brief History of Humankind', 'Homo Deus: A Brief History of Tomorrow',
        '21 Lessons for the 21st Century'
      ]),

      // Ray Bradbury
      ...mapBooks('Ray', 'Bradbury', [
        'Fahrenheit 451', 'The Martian Chronicles', 'Something Wicked This Way Comes',
        'The Illustrated Man', 'Dandelion Wine', 'The October Country',
        'Long After Midnight', 'Death Is a Lonely Business',
        'A Graveyard for Lunatics', 'Green Shadows, White Whale'
      ]),

      // Ursula K. Le Guin
      ...mapBooks('Ursula', 'Le Guin', [
        'A Wizard of Earthsea', 'The Tombs of Atuan', 'The Farthest Shore',
        'The Left Hand of Darkness', 'The Dispossessed', 'The Lathe of Heaven',
        'The Word for World Is Forest', 'Tehanu', 'The Other Wind', 'The Telling'
      ]),

      // Kurt Vonnegut
      ...mapBooks('Kurt', 'Vonnegut', [
        'Slaughterhouse-Five', 'Cat\'s Cradle', 'Breakfast of Champions',
        'The Sirens of Titan', 'Player Piano', 'God Bless You, Mr. Rosewater',
        'Mother Night', 'Galapagos'
      ]),

      // George Orwell
      ...mapBooks('George', 'Orwell', [
        '1984', 'Animal Farm', 'Down and Out in Paris and London',
        'Homage to Catalonia', 'Coming Up for Air'
      ]),

      // Aldous Huxley
      ...mapBooks('Aldous', 'Huxley', [
        'Brave New World', 'Brave New World Revisited', 'Island', 'Ape and Essence'
      ]),

      // Douglas Adams
      ...mapBooks('Douglas', 'Adams', [
        'The Hitchhiker\'s Guide to the Galaxy', 'The Restaurant at the End of the Universe',
        'Life, the Universe and Everything', 'So Long, and Thanks for All the Fish',
        'Mostly Harmless', 'Dirk Gently\'s Holistic Detective Agency'
      ]),

      // William Gibson
      ...mapBooks('William', 'Gibson', [
        'Neuromancer', 'Count Zero', 'Mona Lisa Overdrive',
        'Virtual Light', 'Pattern Recognition', 'The Peripheral'
      ]),

      // Neal Stephenson
      ...mapBooks('Neal', 'Stephenson', [
        'Snow Crash', 'The Diamond Age', 'Cryptonomicon',
        'Anathem', 'Reamde', 'Seveneves'
      ]),

      // Stanislaw Lem
      ...mapBooks('Stanislaw', 'Lem', [
        'Solaris', 'The Cyberiad', 'The Star Diaries',
        'The Invincible', 'His Master\'s Voice', 'The Futurological Congress'
      ]),

      // Margaret Atwood
      ...mapBooks('Margaret', 'Atwood', [
        'The Handmaid\'s Tale', 'The Testaments', 'Oryx and Crake',
        'The Year of the Flood', 'MaddAddam', 'The Blind Assassin'
      ]),

      // Octavia Butler
      ...mapBooks('Octavia', 'Butler', [
        'Kindred', 'Parable of the Sower', 'Parable of the Talents',
        'Dawn', 'Adulthood Rites', 'Imago'
      ]),

      // Brandon Sanderson
      ...mapBooks('Brandon', 'Sanderson', [
        'The Final Empire', 'The Well of Ascension', 'The Hero of Ages',
        'The Way of Kings', 'Words of Radiance', 'Oathbringer',
        'Rhythm of War', 'Elantris'
      ]),

      // Terry Pratchett
      ...mapBooks('Terry', 'Pratchett', [
        'The Colour of Magic', 'The Light Fantastic', 'Equal Rites',
        'Mort', 'Guards! Guards!', 'Small Gods', 'Going Postal',
        'Night Watch', 'Reaper Man', 'Wyrd Sisters'
      ]),

      // Suzanne Collins
      ...mapBooks('Suzanne', 'Collins', [
        'The Hunger Games', 'Catching Fire', 'Mockingjay',
        'The Ballad of Songbirds and Snakes'
      ]),

      // Cixin Liu
      ...mapBooks('Cixin', 'Liu', [
        'The Three-Body Problem', 'The Dark Forest', 'Death\'s End', 'Ball Lightning'
      ]),

      // Patrick Rothfuss
      ...mapBooks('Patrick', 'Rothfuss', [
        'The Name of the Wind', 'The Wise Man\'s Fear'
      ])
    ];

    await queryInterface.bulkInsert('books_authors', booksAuthors, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books_authors', null, {});
    await queryInterface.bulkDelete('books', null, {});
    await queryInterface.bulkDelete('authors', null, {});
  }
};
