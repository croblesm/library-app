'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Read the SQL script
      const sqlScript = fs.readFileSync(
        path.join(__dirname, '../../scripts/20250514040000-create-stored-procedure.sql'), 
        'utf8'
      );
      
      // Execute the SQL script
      await queryInterface.sequelize.query(sqlScript);
      console.log('Stored procedure created successfully!');
    } catch (error) {
      console.error('Error creating stored procedure:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop the stored procedure if needed
      await queryInterface.sequelize.query('DROP PROCEDURE IF EXISTS [dbo].[GetBooksWithAuthors]');
      console.log('Stored procedure dropped successfully!');
    } catch (error) {
      console.error('Error dropping stored procedure:', error);
      throw error;
    }
  }
};
