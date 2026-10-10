const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const pageRoutes = require("./routes/pageRoutes");
const { startCheckJob } = require("./jobs/checkJob");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/pages", pageRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Website Change Detector API",
    status: "running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  startCheckJob();
});