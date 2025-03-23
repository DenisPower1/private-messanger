import express from 'express';
import cors from 'cors';
import dotnet from 'dotenv';

dotnet.config();
const app = express();
app.use(express.json());
app.use(cors());

export default app;
