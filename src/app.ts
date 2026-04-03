import express from "express";

import { errorHandler } from "./middlewares/error-handler";
import { router } from "./routes";

export const app = express();

app.use(express.json());
app.use("/api", router);
app.use(errorHandler);
