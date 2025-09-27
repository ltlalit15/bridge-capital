import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

import { dbConnect } from "./Config/dbConnect.js";
import routes from "./app.js";

const PORT = 3000;

const app = express();

dbConnect();

app.use(cors({
  origin: ["https://bizcapitalsa.com", "http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

}));

// ✅ Handle preflight requests
app.options("*", cors());

// app.use(cors({origin:["https://bizcapitalsa.com","http://localhost:5173"]}));
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use(routes);

app.listen(PORT, () => {
    console.log(`✅ Loan Server is running on port ${PORT}`);
});
