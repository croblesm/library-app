const express = require('express');
const router = express.Router();

// Associate a book with an author
router.post('/', async (req, res) => {
    try {
        const { book_id, author_id } = req.body;
        const { BooksAuthors } = global.models;
        const association = await BooksAuthors.create({ book_id, author_id });
        res.status(201).json(association);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all book-author associations
router.get('/', async (req, res) => {
    try {
        const { BooksAuthors, Book, Author } = global.models;
        const associations = await BooksAuthors.findAll({
            include: [
                {
                    model: Book,
                    as: 'book'
                },
                {
                    model: Author,
                    as: 'author'
                }
            ]
        });
        res.json(associations);
    } catch (error) {
        console.error('Error fetching associations:', error);
        res.status(500).json({ error: 'Failed to fetch associations', details: error.message });
    }
});

// Delete a book-author association by book_id and author_id
router.delete('/', async (req, res) => {
    try {
        const { book_id, author_id } = req.body;
        const { BooksAuthors } = global.models;
        const deleted = await BooksAuthors.destroy({ where: { book_id, author_id } });
        if (deleted) {
            res.status(200).json({ deleted });
        } else {
            res.status(404).json({ error: 'Association not found' });
        }
    } catch (error) {
        console.error('Error deleting book-author association:', error, error.stack);
        res.status(500).json({ error: 'Failed to delete association', details: error.message, stack: error.stack });
    }
});

module.exports = router;