import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { contractRoutes } from './routes/contracts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/contracts', contractRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    dataDir: process.env.CONTRACTS_DATA_DIR || './data'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Contracts API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      contracts: '/api/contracts',
      dataInfo: '/api/contracts/info/data'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Contracts API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Contracts API: http://localhost:${PORT}/api/contracts`);
  console.log(`📁 Data directory: ${process.env.CONTRACTS_DATA_DIR || './data'}`);
}); 