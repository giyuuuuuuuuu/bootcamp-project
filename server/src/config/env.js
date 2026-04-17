require("dotenv").config();

const isVercelRuntime = process.env.VERCEL === "1";

if (!isVercelRuntime && !process.env.PORT) {
  throw new Error("El puerto no está definido");
}

module.exports = {
  port: process.env.PORT || 3000,
};
