# Backend Cinema Management System

This is the backend for the Cinema Management System, providing APIs for showtimes, movies, and more.

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Configure the database:
   - Update the database connection details in `config/database.js` if needed
   - Default connection is to a local SQL Server instance

3. Apply SQL updates:
   - Run the SQL script in `sql_updates.sql` on your database
   - You can use SQL Server Management Studio (SSMS) or run:
```bash
sqlcmd -S localhost -U sa -P your_password -d QL -i sql_updates.sql
```

4. Start the server:
```bash
npm start
```

The server will start on http://localhost:3000

## API Endpoints

### Showtimes
- `GET /showtime` - Get all showtimes with filtering and pagination
- `GET /showtime/simple` - Simple list of showtimes (fallback API)
- `GET /showtime/detail/:id` - Get showtime details
- `POST /showtime/add` - Add a new showtime
- `PATCH /showtime/edit/:id` - Edit showtime
- `DELETE /showtime/delete/:id` - Delete showtime
- `GET /showtime/dates` - Get available dates

### Movies
- `GET /movie` - Get all movies
- `GET /movie/:id` - Get movie details
- `POST /movie/add` - Add new movie
- `PATCH /movie/edit/:id` - Edit movie
- `DELETE /movie/delete/:id` - Delete movie

### Rooms
- `GET /room` - Get all rooms
- `GET /room/:id` - Get room details
- `POST /room/add` - Add new room
- `PATCH /room/edit/:id` - Edit room
- `DELETE /room/delete/:id` - Delete room

## Database Tables

The system uses the following main tables:
- `Movie` - Movie information
- `Cinema` - Cinema locations
- `Room` - Theater rooms in cinemas
- `ShowTime` - Scheduled movie showtimes
- `Ticket` - Ticket sales
- `Seat` - Seat information for rooms

## Troubleshooting

If you encounter issues with the SQL Server connection:
1. Verify SQL Server is running
2. Check the connection settings in `config/database.js`
3. Ensure the user has adequate permissions 