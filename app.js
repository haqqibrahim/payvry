require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;
const studentAuthRoutes = require('./Routes/Student/StudentAuthRoutes');
const vendorAuthRoutes = require('./Routes/Vendor/VendorAuthRoutes');
const studentTransactionRoutes = require("./Routes/Student/StudentTransactionRoutes");
const vendorTransactionRoutes = require("./Routes/Vendor/VendorTransactionRoutes");
const adminAuthRoutes = require('./Routes/Admin/AdminAuthRoutes');

const app = express();

// Set up MongoDB connection
const DB_URI = process.env.DB_URI;
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// parse requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

// Use the authentication routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Payvry" });
});
app.use("/student/api", studentAuthRoutes)
app.use("/student/api", studentTransactionRoutes)
app.use("/vendor/api",vendorAuthRoutes)
app.use("/vendor/api",vendorTransactionRoutes)
app.use("/admin/api",adminAuthRoutes)
// start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
