const { DataTypes } = require('sequelize');

async function initAuthorModel(sequelize) {
    const Author = sequelize.define('Author', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'authors',
        timestamps: false
    });

    // Define associations (will be called after all models are initialized)
    Author.associate = function(models) {
        // Many-to-Many relationship with Book through BooksAuthors
        Author.belongsToMany(models.Book, {
            through: models.BooksAuthors,
            foreignKey: 'author_id',
            otherKey: 'book_id',
            as: 'books'
        });
    };

    return Author;
}

module.exports = initAuthorModel;