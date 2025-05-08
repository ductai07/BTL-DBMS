# Cinema Management System - Frontend

This is the frontend for the Cinema Management System, built with React, Tailwind CSS, and Vite.

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Configure the backend API URL:
   - By default, the app connects to `http://localhost:3000`
   - If your backend is running on a different URL, update the API URLs in the components

3. Start the development server:
```bash
npm run dev
```

The development server will start at http://localhost:5173

## Features

- **Showtime Management**: Add, edit, and delete movie showtimes
- **Movie Management**: Manage movie catalog
- **Room Management**: Manage cinema rooms
- **Ticket Sales**: Process ticket sales
- **Dashboard**: View statistics and reports

## Main Components

- **Showtime Management**:
  - `src/pages/Showtime.jsx`: Main showtime management page
  - `src/component/AddShowTimeModal.jsx`: Modal for adding/editing showtimes
  - `src/component/TabelShowTime.jsx`: Table for displaying showtimes

- **Movie Management**:
  - `src/pages/Movies.jsx`: Movie management interface
  - `src/component/AddMovieModal.jsx`: Modal for adding/editing movies

- **Room Management**:
  - `src/pages/Rooms.jsx`: Room management interface
  - `src/component/AddRoom.jsx`: Modal for adding/editing rooms

## Building for Production

To build the application for production:

```bash
npm run build
```

The build output will be in the `dist` directory, which can be deployed to any static hosting service.

## Connecting to Backend

The application expects a backend server running with the following endpoints:
- Movie data: `http://localhost:3000/movie`
- Room data: `http://localhost:3000/room`
- Showtime data: `http://localhost:3000/showtime`

Ensure the backend server is running before starting the frontend application.

## Troubleshooting

If you encounter issues with API connections:
1. Check that the backend server is running
2. Verify the URLs in the fetch requests
3. Check the browser console for any error messages
4. Ensure CORS is properly configured on the backend
