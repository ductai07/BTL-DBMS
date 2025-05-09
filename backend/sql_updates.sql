-- Ensure the Discount table exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Discount')
BEGIN
    CREATE TABLE [Discount] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [name] NVARCHAR(100) NULL,
        [type] NVARCHAR(50) NULL,
        [description] NTEXT NULL,
        [quantity] INT NULL,
        [discountValue] DECIMAL(10, 2) NULL,
        [startDate] DATE NULL,
        [endDate] DATE NULL,
        [code] NVARCHAR(50) NULL,
        [minPurchase] DECIMAL(10, 2) NULL DEFAULT 0,
        [maxDiscount] DECIMAL(10, 2) NULL DEFAULT 0,
        [applyTo] NVARCHAR(50) NULL DEFAULT 'All',
        [usageCount] INT NULL DEFAULT 0,
        [status] NVARCHAR(20) NULL DEFAULT 'Active'
    );
    PRINT 'Created Discount table';
END
ELSE
BEGIN
    PRINT 'Discount table already exists';
END

-- Ensure the ShowTime table exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ShowTime')
BEGIN
    CREATE TABLE [ShowTime] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [startTime] TIME NULL,
        [endTime] TIME NULL,
        [showDate] DATE NULL,
        [room_id] INT NULL,
        [movie_id] INT NULL,
        [price] DECIMAL(10, 2) NULL DEFAULT 0,
        [status] NVARCHAR(50) NULL DEFAULT N'Sắp chiếu'
    );
    PRINT 'Created ShowTime table';
END
ELSE
BEGIN
    PRINT 'ShowTime table already exists';
END

-- Check if 'price' column exists in ShowTime table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ShowTime' AND COLUMN_NAME = 'price')
BEGIN
    -- Add price column if it doesn't exist
    ALTER TABLE ShowTime ADD price DECIMAL(10, 2) NULL DEFAULT 0;
    PRINT 'Added price column to ShowTime table';
END
ELSE
BEGIN
    PRINT 'Price column already exists in ShowTime table';
END

-- Check if 'status' column exists in ShowTime table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ShowTime' AND COLUMN_NAME = 'status')
BEGIN
    ALTER TABLE ShowTime ADD status NVARCHAR(50) NULL DEFAULT N'Sắp chiếu';
    PRINT 'Added status column to ShowTime table';
END
ELSE
BEGIN
    PRINT 'Status column already exists in ShowTime table';
END

-- Update null status values
UPDATE ShowTime SET status = N'Sắp chiếu' WHERE status IS NULL;

-- Fix character encoding for status column
UPDATE ShowTime 
SET status = N'Sắp chiếu' 
WHERE status = 'Sắp chiếu' OR status IS NULL;

-- Update existing records if they have null values
UPDATE ShowTime SET price = 80000 WHERE price IS NULL;
UPDATE ShowTime SET status = N'Sắp chiếu' WHERE status IS NULL;

-- Ensure there's at least one showtime for testing
IF NOT EXISTS (SELECT TOP 1 * FROM ShowTime)
BEGIN
    -- Find a movie and room to link
    DECLARE @movie_id INT
    DECLARE @room_id INT
    
    SELECT TOP 1 @movie_id = id FROM Movie
    SELECT TOP 1 @room_id = id FROM Room
    
    IF @movie_id IS NOT NULL AND @room_id IS NOT NULL
    BEGIN
        INSERT INTO ShowTime (startTime, endTime, showDate, room_id, movie_id, price, status)
        VALUES 
        ('14:00', '16:00', GETDATE(), @room_id, @movie_id, 80000, N'Đang chiếu'),
        ('19:00', '21:00', GETDATE(), @room_id, @movie_id, 100000, N'Đang chiếu'),
        ('10:00', '12:00', DATEADD(day, 1, GETDATE()), @room_id, @movie_id, 70000, N'Sắp chiếu');
        
        PRINT 'Inserted sample showtimes';
    END
END

-- Display the updated table structure
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_NAME = 'ShowTime'
ORDER BY 
    ORDINAL_POSITION;

-- Updates for the Discount table
-- Check if each column exists before adding it

-- Add code column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Discount' AND COLUMN_NAME = 'code')
BEGIN
    ALTER TABLE Discount ADD code NVARCHAR(50) NULL;
    PRINT 'Added code column to Discount table';
END
ELSE
BEGIN
    PRINT 'Code column already exists in Discount table';
END

-- Add minPurchase column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Discount' AND COLUMN_NAME = 'minPurchase')
BEGIN
    ALTER TABLE Discount ADD minPurchase DECIMAL(10, 2) NULL DEFAULT 0;
    PRINT 'Added minPurchase column to Discount table';
END
ELSE
BEGIN
    PRINT 'minPurchase column already exists in Discount table';
END

-- Add maxDiscount column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Discount' AND COLUMN_NAME = 'maxDiscount')
BEGIN
    ALTER TABLE Discount ADD maxDiscount DECIMAL(10, 2) NULL DEFAULT 0;
    PRINT 'Added maxDiscount column to Discount table';
END
ELSE
BEGIN
    PRINT 'maxDiscount column already exists in Discount table';
END

-- Add applyTo column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Discount' AND COLUMN_NAME = 'applyTo')
BEGIN
    ALTER TABLE Discount ADD applyTo NVARCHAR(50) NULL DEFAULT 'All';
    PRINT 'Added applyTo column to Discount table';
END
ELSE
BEGIN
    PRINT 'applyTo column already exists in Discount table';
END

-- Add usageCount column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Discount' AND COLUMN_NAME = 'usageCount')
BEGIN
    ALTER TABLE Discount ADD usageCount INT NULL DEFAULT 0;
    PRINT 'Added usageCount column to Discount table';
END
ELSE
BEGIN
    PRINT 'usageCount column already exists in Discount table';
END

-- Add status column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Discount' AND COLUMN_NAME = 'status')
BEGIN
    ALTER TABLE Discount ADD status NVARCHAR(20) NULL DEFAULT 'Active';
    PRINT 'Added status column to Discount table';
END
ELSE
BEGIN
    PRINT 'status column already exists in Discount table';
END

-- Generate codes for discounts that don't have them
UPDATE Discount 
SET code = 'PROMO' + CAST(id AS NVARCHAR(10))
WHERE code IS NULL;

-- Ensure there's at least one discount for testing
IF NOT EXISTS (SELECT TOP 1 * FROM Discount)
BEGIN
    INSERT INTO Discount (name, type, description, quantity, discountValue, startDate, endDate, code, minPurchase, maxDiscount, applyTo, usageCount, status)
    VALUES 
    (N'Summer Sale 25%', 'percentage', N'25% off for all purchases during summer', 100, 25, '2023-06-01', '2024-08-31', 'SUMMER25', 100000, 50000, 'All', 0, 'Active'),
    (N'New Customer Welcome', 'fixed', N'50,000 VND off for new customers', 50, 50000, '2023-01-01', '2024-12-31', 'WELCOME50K', 200000, 50000, 'Tickets', 0, 'Active'),
    (N'Weekend Discount', 'percentage', N'10% off on weekend tickets', 200, 10, '2023-03-01', '2024-12-31', 'WEEKEND10', 0, 30000, 'Tickets', 0, 'Active');
    
    PRINT 'Inserted sample discounts';
END

-- Display the updated Discount table structure
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM 
    INFORMATION_SCHEMA.COLUMNS 
WHERE 
    TABLE_NAME = 'Discount'
ORDER BY 
    ORDINAL_POSITION;