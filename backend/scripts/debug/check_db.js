const mongoose = require("mongoose");
const { Schema } = mongoose;

require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
if (!process.env.MONGO_URL) {
  console.error("Missing MONGO_URL environment variable");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URL);

const OrbitCardOrderSchema = new Schema({}, { strict: false });
const Order = mongoose.model("OrbitCardOrder", OrbitCardOrderSchema);

Order.find({ email: "guest@example.com" }).then((res) => {
  console.log(res);
  process.exit(0);
});
