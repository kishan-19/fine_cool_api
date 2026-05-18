require("dotenv").config();
const app = require("./app");
const { connectDB, sequelize } = require("./src/config/db");
const { getLocalIPAddress } = require("./src/utils/get-local-ip.js");
require("./src/models");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  if (process.env.NODE_ENV === "development") {
    await sequelize.sync({ alter: false });
    console.log("DB Synced (Dev Mode)");
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://${getLocalIPAddress()}:${PORT}`);
  });
};

startServer();