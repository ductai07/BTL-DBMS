const express= require('express');
const app=express();
const port=3000;

// Thêm middleware để xử lý JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const RouterV1=require('./api/v1/routers/index.router');



RouterV1(app);
app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})