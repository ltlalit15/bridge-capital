// import express from "express";
// import dotenv from "dotenv";
// dotenv.config();

// import bodyParser from "body-parser";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
// import cors from "cors";

// import { dbConnect } from "./Config/dbConnect.js";
// import routes from "./app.js";

// const PORT = 3000;

// const app = express();

// dbConnect();

// // app.use(cors({
// //   origin: ["https://bizcapitalsa.com", "http://localhost:5173"],
// //   credentials: true,
// //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
// //   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
// // }));

// // // Must be before routes
// // app.options("*", cors({
// //   origin: ["https://bizcapitalsa.com", "http://localhost:5173"],
// //   credentials: true
// // }));

// // // ✅ Handle preflight requests
// // app.options("*", cors());

// // app.use(cors({origin:["https://bizcapitalsa.com","http://localhost:5173"]}));
// app.use(morgan("dev"));
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// app.use(cookieParser());

// app.use(routes);

// app.listen(PORT, () => {
//     console.log(`✅ Loan Server is running on port ${PORT}`);
// });


import express from "express";
import dotenv from "dotenv";
dotenv.config();

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";

import { dbConnect } from "./Config/dbConnect.js";
import routes from "./app.js";

const PORT = process.env.PORT || 3000;
const app = express();

dbConnect();

// ✅ CORS setup (must be before routes)
const allowedOrigins = [
  "https://bizcapitalsa.com",
  "http://localhost:5173"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // 👈 preflight handled here
  }
  next();
});

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ✅ API routes
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`✅ Loan Server is running on port ${PORT}`);
});
