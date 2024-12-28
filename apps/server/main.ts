// main.ts (root)
import serverless from "serverless-http";
import express from "express";
import cors from "cors";
import { routes } from "@/routes";

const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

app.get("/", (req, res) => {
  res.send("Express Server⚡");
});

app.use("/api", routes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.type === "entity.too.large") {
    res.status(413).json({ success: false, message: "File size too large. Maximum size is 30MB" });
  } else {
    next(err);
  }
});

export const handler = serverless(app);
