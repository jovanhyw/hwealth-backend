const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Import routes
 */
const testRoutes = require('./routes/test.route');
const accountRoutes = require('./routes/account.route');
const authRoutes = require('./routes/auth.route');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Connection to database
 */
mongoose
  .connect(process.env.DB_CONN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

/**
 * Middlewares
 */

// max body limit 10kb to prevent DOS. can up if needed.
app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(cors()); // todo: stricter cors settings
app.use(xss());
app.use(mongoSanitize());

/**
 * Routes
 */
app.use('/api/test', testRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});
