// Dữ liệu mẫu cho các phim
export const mockMovies = [
  {
    id: 1,
    title: "Avengers: Endgame",
    director: "Anthony Russo, Joe Russo",
    duration: 181,
    genre: "Action, Adventure, Drama",
    releaseDate: "26/04/2023",
    status: "Now Showing",
    poster: "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg"
  },
  {
    id: 2,
    title: "Spider-Man: Across the Spider-Verse",
    director: "Joaquim Dos Santos",
    duration: 140,
    genre: "Animation, Action, Adventure",
    releaseDate: "02/06/2023",
    status: "Now Showing",
    poster: "https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZDMxLTlkZmEtMzU4MDQxYTMzMjU2XkEyXkFqcGdeQXVyMzQ0MzA0NTM@._V1_.jpg"
  },
  {
    id: 3,
    title: "The Super Mario Bros. Movie",
    director: "Aaron Horvath, Michael Jelenic",
    duration: 92,
    genre: "Animation, Adventure, Comedy",
    releaseDate: "05/04/2023",
    status: "Coming Soon",
    poster: "https://m.media-amazon.com/images/M/MV5BOTJhNzlmNzctNTU5Yy00N2YwLThhMjQtZDM0YjEzN2Y0ZjNhXkEyXkFqcGdeQXVyMTEwMTY3NDI@._V1_.jpg"
  },
  {
    id: 4,
    title: "John Wick: Chapter 4",
    director: "Chad Stahelski",
    duration: 169,
    genre: "Action, Crime, Thriller",
    releaseDate: "24/03/2023",
    status: "Now Showing",
    poster: "https://m.media-amazon.com/images/M/MV5BMDExZGMyOTMtMDgyYi00NGIwLWJhMTEtOTdkZGFjNmZiMTEwXkEyXkFqcGdeQXVyMjM4NTM5NDY@._V1_.jpg"
  },
  {
    id: 5,
    title: "Guardians of the Galaxy Vol. 3",
    director: "James Gunn",
    duration: 150,
    genre: "Action, Adventure, Comedy",
    releaseDate: "05/05/2023",
    status: "Coming Soon",
    poster: "https://m.media-amazon.com/images/M/MV5BMDgxOTdjMzYtZGQxMS00ZTAzLWI4Y2UtMTQzN2VlYjYyZWRiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg"
  }
];

// Dữ liệu mẫu cho các sản phẩm
export const mockProducts = [
  {
    id: 1,
    name: "Popcorn (Large)",
    price: 70000,
    category: "Food",
    status: "Available",
    image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 2,
    name: "Coca-Cola (500ml)",
    price: 30000,
    category: "Beverage",
    status: "Available",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: 3,
    name: "Nachos with Cheese",
    price: 55000,
    category: "Food",
    status: "Available",
    image: "https://plus.unsplash.com/premium_photo-1664391623509-6576910bb2f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
  },
  {
    id: 4,
    name: "Ice Cream (Chocolate)",
    price: 40000,
    category: "Dessert",
    status: "Available",
    image: "https://images.unsplash.com/photo-1563894455-edda21d12ecd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
  },
  {
    id: 5,
    name: "Hot Dog Combo",
    price: 85000,
    category: "Food",
    status: "Out of Stock",
    image: "https://images.unsplash.com/photo-1619740455993-9d62f0fb7b1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  }
];

// Dữ liệu mẫu cho các suất chiếu
export const mockShowtimes = [
  {
    id: 1,
    movieId: 1,
    movieTitle: "Avengers: Endgame",
    roomId: 1,
    roomName: "Cinema 1",
    startTime: "2023-10-10T09:30:00",
    endTime: "2023-10-10T12:31:00",
    price: 90000,
    status: "Available"
  },
  {
    id: 2,
    movieId: 1,
    movieTitle: "Avengers: Endgame",
    roomId: 2,
    roomName: "Cinema 2",
    startTime: "2023-10-10T13:00:00",
    endTime: "2023-10-10T16:01:00",
    price: 100000,
    status: "Available"
  },
  {
    id: 3,
    movieId: 2,
    movieTitle: "Spider-Man: Across the Spider-Verse",
    roomId: 3,
    roomName: "Cinema 3",
    startTime: "2023-10-10T14:15:00",
    endTime: "2023-10-10T16:35:00",
    price: 90000,
    status: "Available"
  },
  {
    id: 4,
    movieId: 4,
    movieTitle: "John Wick: Chapter 4",
    roomId: 1,
    roomName: "Cinema 1",
    startTime: "2023-10-10T17:00:00",
    endTime: "2023-10-10T19:49:00",
    price: 120000,
    status: "Almost Full"
  },
  {
    id: 5,
    movieId: 3,
    movieTitle: "The Super Mario Bros. Movie",
    roomId: 4,
    roomName: "Cinema 4",
    startTime: "2023-10-11T10:00:00",
    endTime: "2023-10-11T11:32:00",
    price: 85000,
    status: "Coming Soon"
  }
];

// Dữ liệu mẫu cho các phòng chiếu
export const mockRooms = [
  {
    id: 1,
    name: "Cinema 1",
    capacity: 120,
    status: "Active",
    type: "2D"
  },
  {
    id: 2,
    name: "Cinema 2",
    capacity: 100,
    status: "Active",
    type: "3D"
  },
  {
    id: 3,
    name: "Cinema 3",
    capacity: 80,
    status: "Active",
    type: "2D"
  },
  {
    id: 4,
    name: "Cinema 4",
    capacity: 150,
    status: "Maintenance",
    type: "IMAX"
  },
  {
    id: 5,
    name: "Cinema 5",
    capacity: 60,
    status: "Active",
    type: "4DX"
  }
];

// Dữ liệu mẫu cho các vé
export const mockTickets = [
  {
    id: 1,
    showtimeId: 1,
    movieTitle: "Avengers: Endgame",
    roomName: "Cinema 1",
    seatNumber: "A1",
    price: 90000,
    status: "Sold",
    customerName: "Nguyễn Văn A",
    purchaseDate: "2023-10-08T15:30:00"
  },
  {
    id: 2,
    showtimeId: 1,
    movieTitle: "Avengers: Endgame",
    roomName: "Cinema 1",
    seatNumber: "A2",
    price: 90000,
    status: "Sold",
    customerName: "Nguyễn Văn A",
    purchaseDate: "2023-10-08T15:30:00"
  },
  {
    id: 3,
    showtimeId: 2,
    movieTitle: "Avengers: Endgame",
    roomName: "Cinema 2",
    seatNumber: "B5",
    price: 100000,
    status: "Reserved",
    customerName: "Trần Thị B",
    purchaseDate: "2023-10-09T10:15:00"
  },
  {
    id: 4,
    showtimeId: 3,
    movieTitle: "Spider-Man: Across the Spider-Verse",
    roomName: "Cinema 3",
    seatNumber: "C8",
    price: 90000,
    status: "Available",
    customerName: null,
    purchaseDate: null
  },
  {
    id: 5,
    showtimeId: 4,
    movieTitle: "John Wick: Chapter 4",
    roomName: "Cinema 1",
    seatNumber: "D10",
    price: 120000,
    status: "Sold",
    customerName: "Lê Văn C",
    purchaseDate: "2023-10-09T18:45:00"
  }
];

// Dữ liệu mẫu cho các khuyến mãi
export const mockPromotions = [
  {
    id: 1,
    name: "Ưu đãi sinh nhật",
    code: "BIRTHDAY23",
    discountPercent: 15,
    startDate: "2023-10-01",
    endDate: "2023-12-31",
    status: "Active",
    description: "Giảm 15% cho khách hàng đặt vé trong tháng sinh nhật"
  },
  {
    id: 2,
    name: "Khuyến mãi thứ 3 hàng tuần",
    code: "TUESDAY50",
    discountPercent: 50,
    startDate: "2023-10-01",
    endDate: "2023-10-31",
    status: "Active",
    description: "Giảm 50% cho tất cả các vé vào thứ 3 hàng tuần"
  },
  {
    id: 3,
    name: "Combo popcorn và nước",
    code: "COMBO25",
    discountPercent: 25,
    startDate: "2023-09-15",
    endDate: "2023-11-15",
    status: "Active",
    description: "Giảm 25% khi mua combo bắp và nước"
  },
  {
    id: 4,
    name: "Ưu đãi học sinh sinh viên",
    code: "STUDENT30",
    discountPercent: 30,
    startDate: "2023-09-01",
    endDate: "2023-12-31",
    status: "Active",
    description: "Giảm 30% cho học sinh sinh viên vào các ngày trong tuần"
  },
  {
    id: 5,
    name: "Khuyến mãi tháng 10",
    code: "OCT2023",
    discountPercent: 20,
    startDate: "2023-10-01",
    endDate: "2023-10-31",
    status: "Active",
    description: "Giảm 20% cho tất cả đơn hàng trong tháng 10"
  }
];

// Dữ liệu mẫu cho các hoá đơn
export const mockOrders = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    orderDate: "2023-10-08T15:30:00",
    total: 210000,
    status: "Completed",
    items: [
      { type: "Ticket", name: "Avengers: Endgame - A1", price: 90000 },
      { type: "Ticket", name: "Avengers: Endgame - A2", price: 90000 },
      { type: "Product", name: "Popcorn (Large)", price: 70000 }
    ]
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    orderDate: "2023-10-09T10:15:00",
    total: 130000,
    status: "Completed",
    items: [
      { type: "Ticket", name: "Avengers: Endgame - B5", price: 100000 },
      { type: "Product", name: "Coca-Cola (500ml)", price: 30000 }
    ]
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    orderDate: "2023-10-09T18:45:00",
    total: 210000,
    status: "Completed",
    items: [
      { type: "Ticket", name: "John Wick: Chapter 4 - D10", price: 120000 },
      { type: "Product", name: "Nachos with Cheese", price: 55000 },
      { type: "Product", name: "Coca-Cola (500ml)", price: 30000 }
    ]
  },
  {
    id: 4,
    customerName: "Phạm Thị D",
    orderDate: "2023-10-10T09:20:00",
    total: 125000,
    status: "Pending",
    items: [
      { type: "Ticket", name: "Spider-Man: Across the Spider-Verse - C8", price: 90000 },
      { type: "Product", name: "Ice Cream (Chocolate)", price: 40000 }
    ]
  },
  {
    id: 5,
    customerName: "Hoàng Văn E",
    orderDate: "2023-10-10T14:10:00",
    total: 90000,
    status: "Cancelled",
    items: [
      { type: "Ticket", name: "Spider-Man: Across the Spider-Verse - D5", price: 90000 }
    ]
  }
];