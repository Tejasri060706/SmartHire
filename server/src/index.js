import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import candidateRoutes from './routes/candidate.js';
import testRoutes from './routes/tests.js';
import recruiterRoutes from './routes/recruiter.js';
import applicationRoutes from './routes/applications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve dirname for static assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({ origin: '*' })); // Allow all for demo purposes
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Base status route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Smart Hire Backend Running' });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', candidateRoutes);

// Catch-all route handler for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
