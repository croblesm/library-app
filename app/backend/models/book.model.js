const { DataTypes } = require('sequelize');

async function initBookModel(sequelize) {
    const Book = sequelize.define('Book', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        pages: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isUrlOrEmpty(value) {
                    if (value && value.trim() !== '') {
                        // Only validate as URL if the value is not empty
                        if (!/^https?:\/\/.+/i.test(value)) {
                            throw new Error('Must be a valid URL starting with http:// or https://');
                        }
                    }
                }
            }
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'books',
        timestamps: false
    });

    // Define associations (will be called after all models are initialized)
    Book.associate = function(models) {
        // Many-to-Many relationship with Author through BooksAuthors
        Book.belongsToMany(models.Author, {
            through: models.BooksAuthors,
            foreignKey: 'book_id',
            otherKey: 'author_id',
            as: 'authors'
        });
    };

    return Book;
}

module.exports = initBookModel;