const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const companyRoutes = require('./routes/companies');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/companies', companyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ message: 'Companies API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});