const CinemaRouter = require('./cinema.router');
const MovieRouter = require('./movie.router');
const RoomRouter = require('./room.router'); 

module.exports = (app) => {
    const apiVersion = '/api/v1';
    app.use(`${apiVersion}/cinema`, CinemaRouter);
    app.use(`${apiVersion}/movie`, MovieRouter);
    app.use(`${apiVersion}/room`, RoomRouter);
}