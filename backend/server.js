require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const appealRoutes = require('./src/routes/appeals');
const documentRoutes = require('./src/routes/documents');
const analyticsRoutes = require('./src/routes/analytics');
const appointmentRoutes = require('./src/routes/appointments');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => res.json({ message: 'Justice System API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
