// Central model initializer for Sequelize
const initAuthorModel = require('./author.model');
const initBookModel = require('./book.model');
const initBooksAuthorsModel = require('./books_authors.model');

async function initModels(sequelize) {
    // Initialize all models with the same sequelize instance
    const Author = await initAuthorModel(sequelize);
    const Book = await initBookModel(sequelize);
    const BooksAuthors = await initBooksAuthorsModel(sequelize);

    // Create models object for associations
    const models = {
        Author,
        Book,
        BooksAuthors
    };

    // Set up associations for all models that have them
    Object.keys(models).forEach(modelName => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });

    return models;
}

module.exports = initModels;
