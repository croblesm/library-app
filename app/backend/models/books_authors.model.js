const { DataTypes } = require('sequelize');

async function initBooksAuthorsModel(sequelize) {
    const BooksAuthors = sequelize.define('BooksAuthors', {
        author_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'authors',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        book_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'books',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'books_authors',
        timestamps: false
    });

    // Define associations (will be called after all models are initialized)
    BooksAuthors.associate = function(models) {
        // BooksAuthors belongs to Author
        BooksAuthors.belongsTo(models.Author, {
            foreignKey: 'author_id',
            as: 'author'
        });
        
        // BooksAuthors belongs to Book
        BooksAuthors.belongsTo(models.Book, {
            foreignKey: 'book_id',
            as: 'book'
        });
    };

    return BooksAuthors;
}

module.exports = initBooksAuthorsModel;