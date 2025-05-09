/**
 * API Configuration
 * This file contains all the API related constants
 */

// Base URL for API requests
export const API_BASE_URL = "http://localhost:3000";

// API endpoints
// Sửa lại các endpoint
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
  PRODUCT_ADD: `${API_BASE_URL}/product/add`,
  PRODUCT_EDIT: (id) => `${API_BASE_URL}/product/edit/${id}`,
  PRODUCT_DETAILS: (id) => `${API_BASE_URL}/product/detail/${id}`,
  PRODUCT_DELETE: (id) => `${API_BASE_URL}/product/delete/${id}`,
  
  // Promotions
  PROMOTIONS: `${API_BASE_URL}/discount`,
  PROMOTION_DETAILS: (id) => `${API_BASE_URL}/discount/detail/${id}`,
  PROMOTION_ADD: `${API_BASE_URL}/discount/add`,
  PROMOTION_EDIT: (id) => `${API_BASE_URL}/discount/edit/${id}`,
  PROMOTION_DELETE: (id) => `${API_BASE_URL}/discount/delete/${id}`,
  
  // Orders/Invoices
  ORDERS: `${API_BASE_URL}/invoice`,
  ORDER_DETAILS: (id) => `${API_BASE_URL}/invoice/detail/${id}`,
  ORDER_PAYMENT: (id) => `${API_BASE_URL}/invoice/payment/${id}`,
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