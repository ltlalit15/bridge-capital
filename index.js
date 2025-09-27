// import express from "express";
// import dotenv from "dotenv";
// dotenv.config();

// import bodyParser from "body-parser";
// import cookieParser from "cookie-parser";
// import morgan from "morgan";
// import cors from "cors";

// import { dbConnect } from "./Config/dbConnect.js";
// import routes from "./app.js";

// // const PORT = 3000;

// const PORT = process.env.PORT || 8180;

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



// app.use(cors({
//   origin: [
//     "https://bizcapitalsa.com",
//     "http://localhost:5173"
//   ],
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// }));

// // ✅ Respond to preflight requests
// app.options("*", cors());

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

const PORT = process.env.PORT || 8180;
const app = express();

// Connect to DB
dbConnect();

// ==============================
// ✅ CORS Setup
// ==============================
const allowedOrigins = [
  "https://bizcapitalsa.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
}));

// ==============================
// ✅ Middleware
// ==============================
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ==============================
// ✅ Routes
// ==============================
app.use("/api", routes);

// ==============================
// ✅ Start Server
// ==============================
app.listen(PORT, () => {
  console.log(`✅ Loan Server is running on port ${PORT}`);
});
