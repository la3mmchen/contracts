import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { contractRoutes } from './routes/contracts';
import { paperlessRoutes } from './routes/paperless';
import { authRoutes } from './routes/auth';
import { requireAuth } from './middleware/requireAuth';
import { isAuthEnabled } from './services/authService';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: when cookie-based auth is used the browser must send credentials, which
// requires an explicit (non-wildcard) origin. APP_ORIGIN can be a comma-separated
// list of allowed origins. Falls back to reflecting the request origin.
const allowedOrigins = (process.env.APP_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser / same-origin requests (no Origin header).
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Auth routes are public (login/logout/status).
app.use('/api/auth', authRoutes);

// Protected API Routes
app.use('/api/contracts', requireAuth, contractRoutes);
app.use('/api/paperless', requireAuth, paperlessRoutes);

// Health check - intentionally public (used for demo-mode detection and
// container healthchecks).
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    dataDir: process.env.CONTRACTS_DATA_DIR || './data',
    authEnabled: isAuthEnabled(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Contracts API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      contracts: '/api/contracts',
      dataInfo: '/api/contracts/info/data',
      paperless: '/api/paperless',
      paperlessStatus: '/api/paperless/status',
      paperlessDocuments: '/api/paperless/documents/:contractId'
    }
  });
});

app.listen(PORT, () => {
  // Server started successfully
});
