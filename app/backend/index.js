const express = require('express');
const cors = require('cors');
const { getSequelize } = require('./config/db'); // Import async DB initializer
const path = require('path');
const initModels = require('./models/initModels');

const app = express();
app.use(cors());
app.use(express.json());

// Serve the welcome page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Import routes
const authorRoutes = require('./routes/Author');
const bookRoutes = require('./routes/Book');
const booksAuthorsRoutes = require('./routes/BooksAuthors');

// Use routes
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);
app.use('/books_authors', booksAuthorsRoutes);

const syncDatabase = async () => {
    try {
        const sequelize = await getSequelize();
        const models = await initModels(sequelize); // Register all models and get them back
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Use alter now that the schema has been created
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
        
        // Store models globally for use in routes
        global.models = models;
        
        return models;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

// Synchronize models with the database
syncDatabase().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
}).catch(() => {
    process.exit(1);
});