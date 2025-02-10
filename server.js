import express from "express";
import dotenv from "dotenv";
import uploadRoute from "./src/app/api/upload/route.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/upload", uploadRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`));