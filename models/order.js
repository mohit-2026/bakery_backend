const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   orderNumber: { type: Number },

//   customerName: { type: String },
//   phone: { type: String },

//   variety: { type: String },   // Sponge / Chocolate / Fresh Cream / Eggless
//   flavor: { type: String },
//   weight: { type: Number },
//   shape: { type: String },

//   deliveryDate: { type: String },
//   deliveryTime: { type: String },

//   advance: { type: Number },
//   price: { type: Number },

//   status: {
//     type: String,
//     enum: ["pending", "approved", "completed"],
//     default: "pending"
//   },

//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   }
// }, { timestamps: true });
// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   serialNo: {
//     type: Number,
//     unique: true
//   },

//   flavor: String,
//   shape: String,
//   weight: Number,
//   advance: Number,

//   status: {
//     type: String,
//     default: "pending"
//   },

//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   }

// }, { timestamps: true });

const orderSchema = new mongoose.Schema({
  serialNo: Number,
  cakeType: String,
  flavor: String,
  shape: String,
  weight: Number,
  advance: Number,
  date: String,
  time: String,
  message:String,
  status: { type: String, default: "pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);


// module.exports = mongoose.model("Order", OrderSchema);
