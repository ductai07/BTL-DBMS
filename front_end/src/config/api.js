/**
 * API Configuration
 * This file contains all the API related constants
 */

// Base URL for API requests
export const API_BASE_URL = "http://localhost:3000";

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // Movies
  MOVIES: `${API_BASE_URL}/movie`,
  MOVIE_DETAILS: (id) => `${API_BASE_URL}/movie/${id}`,
  
  // Cinemas
  CINEMAS: `${API_BASE_URL}/cinema`,
  CINEMA_DETAILS: (id) => `${API_BASE_URL}/cinema/${id}`,
  
  // Rooms
  ROOMS: `${API_BASE_URL}/room`,
  ROOM_DETAILS: (id) => `${API_BASE_URL}/room/${id}`,
  
  // Showtimes
  SHOWTIMES: `${API_BASE_URL}/showtime`,
  SHOWTIME_DETAILS: (id) => `${API_BASE_URL}/showtime/${id}`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/product`,
  PRODUCT_DETAILS: (id) => `${API_BASE_URL}/product/${id}`,
  
  // Promotions
  PROMOTIONS: `${API_BASE_URL}/discount`,
  PROMOTION_DETAILS: (id) => `${API_BASE_URL}/discount/${id}`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/order`,
  ORDER_DETAILS: (id) => `${API_BASE_URL}/order/${id}`,
};

// API request timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper function to build API request options
export const buildRequestOptions = (method = 'GET', body = null, headers = {}) => {
  return {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };
}; 