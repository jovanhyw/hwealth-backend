const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

/**
 * Import routes
 */
const testRoutes = require('./routes/test.route');
const accountRoutes = require('./routes/account.route');

const app = express();

/**
 * Connection to database
 */
mongoose
  .connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

/**
 * Middlewares
 */
app.use(express.json());
app.use(cors());

/**
 * Routes
 */
app.use('/api/test', testRoutes);
app.use('/api/account', accountRoutes);

app.listen(3000, () => console.log('Express server started on port 3000'));
