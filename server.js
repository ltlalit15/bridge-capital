import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

import { dbConnect } from "./Config/dbConnect.js";
import routes from "./app.js";

const PORT = 7000;

const app = express();

dbConnect();

app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(routes);

app.listen(PORT, () => {
    console.log(`✅ Loan Server is running on port ${PORT}`);
});
//