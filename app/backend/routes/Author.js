const express = require('express');
const router = express.Router();

// Create a new author
router.post('/', async (req, res) => {
    try {
        const { first_name, middle_name, last_name, image_url } = req.body;
        const { Author } = global.models;
        const newAuthor = await Author.create({ first_name, middle_name, last_name, image_url });
        res.status(201).json(newAuthor);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all authors
router.get('/', async (req, res) => {
    try {
        const { Author, Book } = global.models;
        const authors = await Author.findAll({
            include: [{
                model: Book,
                as: 'books',
                through: { attributes: [] }
            }]
        });
        res.json(authors);
    } catch (error) {
        console.error('Error fetching authors:', error);
        res.status(500).json({ error: 'Failed to fetch authors', details: error.message });
    }
});

// Delete an author by ID
router.delete('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        id = parseInt(id, 10); // Ensure ID is a number
        const { Author, BooksAuthors } = global.models;
        
        // Check if author exists
        const author = await Author.findByPk(id);
        if (!author) {
            return res.status(404).json({ error: 'Author not found' });
        }
        // Remove all associations in books_authors first
        const assocDeleted = await BooksAuthors.destroy({ where: { author_id: id } });
        console.log(`Deleted ${assocDeleted} associations for author_id ${id}`);
        // Now delete the author
        const deleted = await Author.destroy({ where: { id } });
        if (deleted) {
            res.status(200).json({ deleted });
        } else {
            res.status(404).json({ error: 'Author not found after association delete' });
        }
    } catch (error) {
        console.error('Error deleting author:', error, error.stack);
        res.status(500).json({ error: 'Failed to delete author', details: error.message, stack: error.stack });
    }
});

module.exports = router;