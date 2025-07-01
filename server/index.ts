// Main server entry point (Express)
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// import path from 'path'; // If serving static files from backend

// Import routes
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import reservationRoutes from './routes/reservationRoutes';
import userRoutes from './routes/userRoutes';
import galleryRoutes from './routes/galleryRoutes';
import settingsRoutes from './routes/settingsRoutes';
import categoryRoutes from './routes/categoryRoutes';
import dishRoutes from './routes/dishRoutes';
import galleryAlbumRoutes from './routes/galleryAlbumRoutes';
import galleryImageRoutes from './routes/galleryImageRoutes'; // Import gallery image routes

// Import middleware
import errorHandler, { NotFoundError } from './middleware/errorHandler';
// import { protect } from './middleware/authMiddleware'; // Example if you want to protect all routes by default

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5001; // Backend server port

// Middleware
app.use(cors()); // Enable CORS for all routes (configure origins in production)
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- API Routes ---
app.get('/api', (req: Request, res: Response) => {
  res.send('Dounie Cuisine Pro API Running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/gallery-albums', galleryAlbumRoutes);
app.use('/api/gallery-images', galleryImageRoutes); // Use gallery image routes

// --- Database Connection (Example with SQLite, actual connection will be more involved) ---
// import sqlite3 from 'sqlite3';
// const dbPath = path.resolve(__dirname, '../database.sqlite');
// const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
//   if (err) {
//     console.error('Error connecting to SQLite database:', err.message);
//   } else {
//     console.log('Connected to the SQLite database.');
//     // Initialize schema if needed, e.g., db.exec(SCHEMA_SQL_STATEMENTS);
//   }
// });

// --- Frontend Static Serve (If Vite builds into a folder like 'dist/client') ---
// This setup assumes you might serve the frontend build from Express in production.
// For development, Vite's dev server handles this.
// const __dirname = path.resolve(); // To get current directory
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '/client/dist'))); // Adjust path to your frontend build
//   app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html')) // Adjust path
//   );
// } else {
//   app.get('/', (req, res) => {
//     res.send('API is running in development mode...');
//   });
// }


// --- Error Handling ---
// Handle 404 errors for API routes not found
app.all('/api/*', (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Cannot find ${req.originalUrl} on this server`));
});

// Global error handler (must be last)
app.use(errorHandler);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process (optional, but good for critical errors)
  // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error(`Uncaught Exception: ${err.message}`);
  // process.exit(1); // Forcing exit after uncaught exception
});
