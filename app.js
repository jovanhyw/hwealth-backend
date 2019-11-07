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

const authRoutes = require('./routes/auth.route');
const accountRoutes = require('./routes/account.route');
const profileRoutes = require('./routes/profile.route');
const stepsRecordRoutes = require('./routes/stepsrecord.route');
const caloriesRecordRoutes = require('./routes/caloriesrecord.route');
const captchaRoutes = require('./routes/captcha.route');
const twoFactorRoutes = require('./routes/twofactor.route');
const adminRoutes = require('./routes/admin.route');
const conversationRoutes = require('./routes/conversation.route');
const messageRoutes = require('./routes/message.route');

const verifyToken = require('./services/auth.service').verifyToken;
const checkAdminRole = require('./services/auth.service').checkAdminRole;

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

const allowedOrigins = [
  'https://hwealth.netlify.com',
  'https://dev--hwealth.netlify.com',
  'https://hwealth-admin.netlify.com',
  'https://dev--hwealth-admin.netlify.com'
];

// max body limit 10kb to prevent DOS. can up if needed.
app.use(express.json({ limit: '10kb' }));
app.use(
  helmet({
    // we set hsts in nginx instead
    hsts: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self", '*.bootstrapcdn.com'],
        scriptSrc: [
          "'self'",
          '*.jquery.com',
          '*.cloudflare.com',
          '*.bootstrapcdn.com'
        ]
      }
    },
    referrerPolicy: {
      policy: 'same-origin'
    },
    featurePolicy: {
      features: {
        camera: ["'none"],
        geolocation: ["'none'"],
        microphone: ["'none'"],
        speaker: ["'none'"],
        vibrate: ["'none'"]
      }
    }
  })
);
// app.use(
//   cors({
//     origin: function(origin, callback) {
//       // allow requests with no origin
//       // (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         var msg =
//           'The CORS policy for this site does not ' +
//           'allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     }
//   })
// );
app.use(cors()); // remove this and use cors above for prod
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
app.use('/api/two-factor', twoFactorRoutes);
app.use('/api/admin', verifyToken, checkAdminRole, adminRoutes);
app.use('/api/conversation', verifyToken, conversationRoutes);
app.use('/api/message', verifyToken, messageRoutes);

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});