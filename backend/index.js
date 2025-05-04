const express = require('express');
const app = express();
const port = 3000;
sequelize = require('./config/database');
const router = require('./router/index.router');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

router(app);
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});