const express = require('express');
const router = express.Router();
const controller = require('../controller/ticket.controller');
const sequelize = require('../config/database');

// Get all tickets with filtering and pagination
router.get('/', controller.index);

// Get tickets by showtime
router.get('/showtime/:showtimeId', controller.getTicketsByShowtime);

// Get simple list of tickets without complex joins
router.get('/simple', async (req, res) => {
    try {
        // For pagination
        const { Page, Limit } = req.query;
        let page = Page ? parseInt(Page) : 1;
        let limit = Limit ? parseInt(Limit) : 10;
        let offset = (page - 1) * limit;
        
        // Super simple query - only fetch essential fields
        const query = `
            SELECT 
                id, 
                bookingDate, 
                price, 
                qrCode, 
                showtime_id, 
                seat_id, 
                invoice_id
            FROM Ticket
            ORDER BY id ASC
            OFFSET ${offset} ROWS
            FETCH NEXT ${limit} ROWS ONLY
        `;
        
        // Count total records for pagination
        const countQuery = `SELECT COUNT(*) as total FROM Ticket`;
        
        // Execute the queries
        const [tickets, countResult] = await Promise.all([
            sequelize.query(query, { type: sequelize.QueryTypes.SELECT }),
            sequelize.query(countQuery, { type: sequelize.QueryTypes.SELECT })
        ]);
        
        // Get the total count
        const count = countResult[0].total;
        const totalPages = Math.ceil(count / limit);
        
        // Return the raw data
        res.status(200).json({
            data: tickets,
            pagination: {
                total: count,
                totalPages,
                currentPage: page,
                pageSize: limit,
                hasNext: page < totalPages,
                hasPrevious: page > 1
            }
        });
    } catch (error) {
        console.error("Simple ticket fetch error:", error);
        res.status(500).json({
            message: 'Error retrieving tickets',
            error: error.message
        });
    }
});

// Get ticket details
router.get('/:id', controller.detail);

// Add a new ticket
router.post('/add', controller.add);

// Update a ticket
router.patch('/edit/:id', controller.edit);

// Delete a ticket
router.delete('/delete/:id', controller.delete);

module.exports = router;