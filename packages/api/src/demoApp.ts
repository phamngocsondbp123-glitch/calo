import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import demoRouter from './mock/demo.routes.js';
import { errorHandler } from './utils/http.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use('/api', demoRouter);
app.use(errorHandler);

export default app;
