const oneRouter = require('./one.router');

module.exports = (app) => {
    const apiVersion = '/api/v1';
    app.use(`${apiVersion}/one`, oneRouter);
}