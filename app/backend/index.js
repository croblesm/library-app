const express = require('express');
const cors = require('cors');  // Import the cors package
const sql = require('./db');

const app = express();
app.use(cors());  // Enable CORS for all routes
app.use(express.json());

// CRUD operations for authors
app.post('/authors', (req, res) => {
    const { first_name, middle_name, last_name } = req.body;
    const query = `INSERT INTO dbo.authors (first_name, middle_name, last_name) VALUES ('${first_name}', '${middle_name}', '${last_name}')`;

    sql.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(201).send('Author created');
    });
});

app.get('/authors', (req, res) => {
    const query = 'SELECT * FROM dbo.authors';

    sql.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).json(result.recordset);
    });
});

app.delete('/authors/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM dbo.authors WHERE id=${id}`;

    sql.query(query, (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('Author deleted');
    });
});

// CRUD operations for books
app.post('/books', (req, res) => {
    const { title, year, pages } = req.body;
    const query = `INSERT INTO dbo.books (title, year, pages) VALUES ('${title}', ${year}, ${pages})`;

    sql.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(201).send('Book created');
    });
});

app.get('/books', (req, res) => {
    const query = `
        SELECT b.id, b.title, b.year, b.pages, 
               STRING_AGG(a.first_name + ' ' + a.last_name, ', ') AS authors
        FROM dbo.books b
        LEFT JOIN dbo.books_authors ba ON b.id = ba.book_id
        LEFT JOIN dbo.authors a ON ba.author_id = a.id
        GROUP BY b.id, b.title, b.year, b.pages
    `;

    sql.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).json(result.recordset);
    });
});

app.put('/books/:id', (req, res) => {
    const { id } = req.params;
    const { title, year, pages } = req.body;
    const query = `UPDATE dbo.books SET title='${title}', year=${year}, pages=${pages} WHERE id=${id}`;

    sql.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send('Book updated');
    });
});

app.delete('/books/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM dbo.books WHERE id=${id}`;

    sql.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(200).send('Book deleted');
    });
});

// Associating a Book with an Author
app.post('/books_authors', (req, res) => {
    const { book_id, author_id } = req.body;
    const query = `INSERT INTO dbo.books_authors (book_id, author_id) VALUES (${book_id}, ${author_id})`;

    sql.query(query, (err, result) => {
        if (err) res.status(500).send(err);
        res.status(201).send('Association created');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
