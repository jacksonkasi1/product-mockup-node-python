// src/routes/index.ts
import { Router } from "express";
import mockupRoutes from "./mockup";

export const routes = Router();
routes.use("/mockup", mockupRoutes);
