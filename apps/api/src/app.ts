import express from "express";

import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { resolveCurrentUser } from "./middlewares/resolve-current-user";
import { router } from "./routes";

export const app = express();

app.use(express.json());
app.use(resolveCurrentUser);
app.use("/api", router);
app.use(notFoundHandler);
app.use(errorHandler);
