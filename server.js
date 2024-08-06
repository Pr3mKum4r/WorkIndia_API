const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const userRouter = require('./routes/userRoute.js');
const bookingRouter = require('./routes/bookingRoute.js');
const db = require('./db.js');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/dining-place', bookingRouter);
app.use('/api', userRouter);

const PORT = 5000;

app.listen(PORT, ()=>{console.log(`Server started at port ${PORT}`)});