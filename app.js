const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const csrf = require('csurf')


// Route middlewares
const csrfProtection = csrf({
  cookie: true
});

/**
 * Import routes
 */
const testRoutes = require('./routes/test.route');

const authRoutes = require('./routes/auth.route');
const accountRoutes = require('./routes/account.route');
const profileRoutes = require('./routes/profile.route');
const stepsRecordRoutes = require('./routes/stepsrecord.route');
const caloriesRecordRoutes = require('./routes/caloriesrecord.route');
const captchaRoutes = require('./routes/captcha.route');
const tfaRoutes = require('./routes/tfa.route');

const verifyToken = require('./services/auth.service').verifyToken;

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
// Parse cookies
// We need this because "cookies" is true in csrfProtection
app.use(cookieParser());

// max body limit 10kb to prevent DOS. can up if needed.
app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(cors()); // todo: stricter cors settings
app.use(xss());
app.use(mongoSanitize());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({
      error: true,
      message: 'Invalid JSON Body.'
    });
  }
  return next();
});

/**
 * Routes
 */
app.use('/api/test', testRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/profile', verifyToken, profileRoutes);
app.use('/api/steps-record', verifyToken, stepsRecordRoutes);
app.use('/api/calories-record', verifyToken, caloriesRecordRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/tfa', tfaRoutes);

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});
