import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import passport from 'passport';
import './services/passport.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/index.js';
import { initializeSocket } from './services/socket.js';
import { ollamaService } from './services/index.js';

const app = express();
const server = createServer(app);

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB connection failed. Running in demo mode.');
    console.warn('Data will not persist. Install MongoDB or use a cloud instance.');
  }

  try {
    initializeSocket(server);
  } catch (error) {
    console.warn('Socket.IO initialization failed:', error);
  }

  try {
    const ollamaHealthy = await ollamaService.checkHealth();
    if (ollamaHealthy) {
      console.log('Ollama service is available');
    } else {
      console.warn('Ollama service is not available. AI features will use fallback responses.');
    }
  } catch {
    console.warn('Ollama service check failed. AI features will use fallback responses.');
  }

  server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
};

startServer();

export { app, server };
