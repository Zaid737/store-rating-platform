const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const storeRoutes = require("./routes/stores");
const adminRoutes = require("./routes/admin");
const ownerRoutes = require("./routes/owner");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Store Rating API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/owner", ownerRoutes);

module.exports = app;