import express from "express";
import cors from "cors";
import dotnet from "dotenv";

dotnet.config();
const domain = process.env.domain;
const app = express();
app.use(express.json());
app.use(cors());
app.use((req, resp, next) => {
  resp.removeHeader("Content-Security-Policy");

  next();
});

export default app;
