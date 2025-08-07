-- This script creates a stored procedure that retrieves all books along with their authors.
CREATE PROCEDURE [dbo].[GetBooksWithAuthors]
AS
BEGIN
    SELECT
        b.*,
        (
            SELECT STRING_AGG(a.first_name + ' ' + COALESCE(a.middle_name + ' ', '') + a.last_name, ', ')
            FROM books_authors ba
            INNER JOIN authors a ON ba.author_id = a.id
            WHERE ba.book_id = b.id
        ) AS Authors
    FROM books b;
END;