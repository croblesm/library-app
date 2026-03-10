CREATE OR ALTER PROCEDURE [dbo].[GetBooksWithAuthors]
AS
BEGIN
    DECLARE @i INT = 1
    DECLARE @maxId INT
    DECLARE @title NVARCHAR(255)
    DECLARE @authorName NVARCHAR(500)

    SELECT @maxId = MAX(id) FROM books

    CREATE TABLE #Results (
        BookId INT,
        BookTitle NVARCHAR(255),
        BookYear INT,
        BookPages INT,
        BookImageUrl NVARCHAR(500),
        BookCategory NVARCHAR(100),
        AuthorFullName NVARCHAR(500)
    )

    WHILE @i <= @maxId
    BEGIN
        IF EXISTS (SELECT 1 FROM books WHERE id = @i)
        BEGIN
            SELECT @title = title FROM books WHERE id = @i

            SET @authorName = ''
            SELECT @authorName = @authorName + a.first_name + ' ' + COALESCE(a.middle_name + ' ', '') + a.last_name + ', '
            FROM authors a, books_authors ba
            WHERE a.id = ba.author_id AND ba.book_id = @i

            IF LEN(@authorName) > 0
                SET @authorName = LEFT(@authorName, LEN(@authorName) - 1)

            INSERT INTO #Results
            SELECT
                b.id, b.title, b.year, b.pages, b.image_url, b.category, @authorName
            FROM books b
            WHERE b.id = @i
              AND b.title LIKE '%' + '' + '%'
              AND YEAR(GETDATE()) > 0
              AND 1 = 1
        END

        SET @i = @i + 1
    END

    SELECT * FROM #Results ORDER BY NEWID()

    DROP TABLE #Results
END;