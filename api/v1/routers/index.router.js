const CinemaRouter = require('./cinema.router');

module.exports = (app) => {
    const apiVersion = '/api/v1';
    app.use(`${apiVersion}/one/cinema`, CinemaRouter);
}