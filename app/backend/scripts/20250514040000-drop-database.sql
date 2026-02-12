-- Drop the "Library" database by killing all connections first
-- Uses while loop instead of cursor, does not use single user mode

DECLARE @SPID INT

-- Kill all connections to the Library database using a while loop
WHILE EXISTS (SELECT 1 FROM sys.dm_exec_sessions 
              WHERE database_id = DB_ID('Library') AND session_id > 50)
BEGIN
    -- Get the first SPID connected to the database
    SELECT TOP 1 @SPID = session_id 
    FROM sys.dm_exec_sessions
    WHERE database_id = DB_ID('Library') AND session_id > 50
    ORDER BY session_id
    
    IF @SPID IS NOT NULL
    BEGIN
        PRINT 'Killing connection: ' + CAST(@SPID AS VARCHAR(10))
        EXEC('KILL ' + @SPID)
        WAITFOR DELAY '00:00:00.5'  -- Brief delay between kills
    END
END

-- Drop the database
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'Library')
BEGIN
    DROP DATABASE [Library]
    PRINT 'Database [Library] has been dropped.'
END
ELSE
BEGIN
    PRINT 'Database [Library] does not exist.'
END