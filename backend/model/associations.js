const Cinema = require('./cinema.model');
const Room = require('./room.model');
const Seat = require('./seat.model');
const Movie = require('./movie.model');
const ShowTime = require('./showtime.model');
const Customer = require('./customer.model');
const Employee = require('./employee.model');
const Discount = require('./discount.model');
const Product = require('./product.model');
const Invoice = require('./invoice.model');
const Ticket = require('./ticket.model');
const ProductUsage = require('./productusage.model');

// Cinema associations
Cinema.hasMany(Room, {
  foreignKey: 'cinema_id',
  onDelete: 'CASCADE'
});

// Room associations
Room.belongsTo(Cinema, {
  foreignKey: 'cinema_id'
});
Room.hasMany(Seat, {
  foreignKey: 'room_id',
  onDelete: 'CASCADE'
});
Room.hasMany(ShowTime, {
  foreignKey: 'room_id',
  onDelete: 'CASCADE'
});

// Seat associations
Seat.belongsTo(Room, {
  foreignKey: 'room_id'
});
Seat.hasMany(Ticket, {
  foreignKey: 'seat_id'
});

// Movie associations
Movie.hasMany(ShowTime, {
  foreignKey: 'movie_id',
  onDelete: 'CASCADE'
});

// ShowTime associations
ShowTime.belongsTo(Room, {
  foreignKey: 'room_id'
});
ShowTime.belongsTo(Movie, {
  foreignKey: 'movie_id'
});
ShowTime.hasMany(Ticket, {
  foreignKey: 'showtime_id'
});

// Customer associations
Customer.hasMany(Invoice, {
  foreignKey: 'customer_id'
});

// Employee associations
Employee.hasMany(Invoice, {
  foreignKey: 'employee_id'
});

// Discount associations
Discount.hasMany(Invoice, {
  foreignKey: 'discount_id'
});

// Product associations
Product.hasMany(ProductUsage, {
  foreignKey: 'product_id'
});

// Invoice associations
Invoice.belongsTo(Customer, {
  foreignKey: 'customer_id'
});
Invoice.belongsTo(Discount, {
  foreignKey: 'discount_id'
});
Invoice.belongsTo(Employee, {
  foreignKey: 'employee_id'
});
Invoice.hasMany(Ticket, {
  foreignKey: 'invoice_id',
  onDelete: 'CASCADE'
});
Invoice.hasMany(ProductUsage, {
  foreignKey: 'invoice_id',
  onDelete: 'CASCADE'
});

// Ticket associations
Ticket.belongsTo(ShowTime, {
  foreignKey: 'showtime_id'
});
Ticket.belongsTo(Seat, {
  foreignKey: 'seat_id'
});
Ticket.belongsTo(Invoice, {
  foreignKey: 'invoice_id'
});

// ProductUsage associations
ProductUsage.belongsTo(Product, {
  foreignKey: 'product_id'
});
ProductUsage.belongsTo(Invoice, {
  foreignKey: 'invoice_id'
});

module.exports = {
  Cinema,
  Room,
  Seat,
  Movie,
  ShowTime,
  Customer,
  Employee,
  Discount,
  Product,
  Invoice,
  Ticket,
  ProductUsage
};