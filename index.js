// Hospital Quick USSD Application Entry Point
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const ussdRoutes = require('./routes/ussdRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Import database connection
const db = require('./config/database');

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route definitions
app.use('/api/ussd', ussdRoutes);
app.use('/api/webhooks', webhookRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hospital Quick USSD Service is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Test database connection
  db.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection failed: ', err);
    } else {
      console.log('Database connected successfully');
      connection.release();
    }
  });
});

module.exports = app;