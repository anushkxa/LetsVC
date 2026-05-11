import express from "express";
import { createServer } from "node:http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import { connectToSocket } from "./src/controllers/socketManager.js";
import userRoutes from "./src/routes/users_routes.js";

dotenv.config();

const app = express();
const server = createServer(app);

const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
const url = process.env.MONGO_URL;

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ Working: "yess" });
});

mongoose.connect(url)
  .then(() => {
    console.log("DB connected");

    server.listen(app.get("port"), () => {
      console.log(`Server running on port ${app.get("port")}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });