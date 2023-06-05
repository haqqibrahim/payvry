require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const UserAuthRoutes = require("./Routes/User/UserAuthRoutes");
const vendorAuthRoutes = require("./Routes/Vendor/VendorAuthRoutes");
const userTransactionRoutes = require("./Routes/User/UserTransactionRoutes");
const vendorTransactionRoutes = require("./Routes/Vendor/VendorTransactionRoutes");
const UserAIRoutes = require("./Routes/User/UserAIRoutes")
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.json());

// Set up MongoDB connection
if (port != 5000) {
  const DB_URI = process.env.DB_URI;
  mongoose
    .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected in producion"))
    .catch((err) => console.log(err));
} else {
  const DB_URI = process.env.DB_URI_DEVELOPMENT;
  mongoose
    .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected in development"))
    .catch((err) => console.log(err));
}

// Use the authentication routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Payvry" });
});

app.use("/user/api", UserAuthRoutes);
app.use("/user/api", userTransactionRoutes);
app.use("/vendor/api", vendorAuthRoutes);
app.use("/vendor/api", vendorTransactionRoutes);
app.use("/ultramsgwebhook", UserAIRoutes);

// start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
