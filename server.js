import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';

import authenticateToken from './middleware/authenticateToken.js';
import userRoutes from './routes/userRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, 
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// // Serve static files from the 'public' folder
// app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to database.');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.stack);
  });

// Basic route
app.use('/api', authRoutes);
app.use('/api/user', userRoutes); 

app.use(authenticateToken); // Apply the authentication middleware globally
// app.use(appendUserToResponse);

//app.use('/api/dashboard', dashboardRoutes);
//app.use('/api/roles', rolesRoutes);


app.get('/', (req, res) => res.send('Hello World from the server!'));
// app.get('/api/apitokencheck', (req, res) => res.send('Token is available!'));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
