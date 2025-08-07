const express = require('express');
const router = express.Router();

// Create a new book
router.post('/', async (req, res) => {
    try {
        const { title, year, pages, authorId, image_url, category } = req.body;
        const { Book, BooksAuthors, Author } = global.models;

        // Create the book
        const newBook = await Book.create({ title, year, pages, image_url, category });

        // Associate the book with the author if authorId is provided and not empty
        if (authorId && authorId !== "") {
            await BooksAuthors.create({ book_id: newBook.id, author_id: parseInt(authorId, 10) });
        }

        // Fetch the book with its authors to return
        const bookWithAuthors = await Book.findByPk(newBook.id, {
            include: [{ 
                model: Author, 
                as: 'authors',
                through: { attributes: [] } 
            }]
        });

        res.status(201).json(bookWithAuthors);
    } catch (error) {
        console.error('Error creating book:', error, error.stack);
        res.status(500).json({ error: 'Failed to create book', details: error.message, stack: error.stack });
    }
});

// Get all books
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const { Book, Author } = global.models;
        const { Op } = require('sequelize');

        let whereClause = {};
        if (search) {
            whereClause = {
                [Op.or]: [
                    { title: { [Op.like]: `%${search}%` } },
                    { category: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const books = await Book.findAll({
            where: whereClause,
            include: [{
                model: Author,
                as: 'authors',
                through: { attributes: [] }
            }]
        });
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books', details: error.message });
    }
});

// Update a book by ID
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, year, pages, image_url, category } = req.body;
        const { Book, Author } = global.models;

        // Update the book
        await Book.update({ title, year, pages, image_url, category }, { where: { id } });

        const bookWithAuthors = await Book.findByPk(id, {
            include: [{ 
                model: Author, 
                as: 'authors',
                through: { attributes: [] } 
            }]
        });

        res.status(200).json(bookWithAuthors);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete a book by ID
router.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        id = parseInt(id, 10); // Ensure ID is a number
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({ error: 'Invalid book ID' });
        }
        const { Book, BooksAuthors } = global.models;

        // Check if book exists
        const book = await Book.findByPk(id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        // Remove all associations in books_authors first
        const assocDeleted = await BooksAuthors.destroy({ where: { book_id: id } });
        console.log(`Deleted ${assocDeleted} associations for book_id ${id}`);
        // Now delete the book
        const deleted = await Book.destroy({ where: { id } });
        if (deleted) {
            res.status(200).json({ deleted });
        } else {
            res.status(404).json({ error: 'Book not found after association delete' });
        }
    } catch (error) {
        console.error('Error deleting book:', error, error.stack);
        res.status(500).json({ error: 'Failed to delete book', details: error.message, stack: error.stack });
    }
});

module.exports = router;