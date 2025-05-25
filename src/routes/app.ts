import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type', 'token', 'userId', 'skip', 'limit'],
  }),
);

export default app;
