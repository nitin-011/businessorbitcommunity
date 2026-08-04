const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.connect(
  "mongodb+srv://jimfleax:jimfleax@local.f18dsim.mongodb.net/business_orbit?appName=Local",
);

const OrbitCardOrderSchema = new Schema({}, { strict: false });
const Order = mongoose.model("OrbitCardOrder", OrbitCardOrderSchema);

Order.find({ email: "guest@example.com" }).then((res) => {
  console.log(res);
  process.exit(0);
});
