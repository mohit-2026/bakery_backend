const express = require("express");
const Order = require("../models/order");
const auth = require("../middleware/auth");

const router = express.Router();

// Create Order (Owner/Staff enters order)
const Counter = require("../models/counter");

router.post("/", auth(["owner", "staff"]), async (req, res) => {
  try {
    // 🔹 get next serial number atomically
    const counter = await Counter.findOneAndUpdate(
      { name: "order" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const order = new Order({
      ...req.body,
      serialNo: counter.seq,
      createdBy: req.user.id
    });
    // console.log(order);
    
    await order.save();
    res.json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Get All Orders
router.post("/list", auth(["owner", "staff"]), async (req, res) => {
  try {
    const {
      status = "pending",
      serialNo,
      skip = 0,
      limit = 10
    } = req.body;

    const query = {
      createdBy: req.user.id
    };

    if (status) {
      query.status = status;
    }

    if (serialNo) {
      query.serialNo = serialNo;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});


// Get Single Order
router.get("/:id", auth(["owner", "staff"]), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("createdBy", "name role");
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Order Status
  router.put("/:id/status", auth(["owner"]), async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });
// Print Order Bill
// router.get("/:id/print", auth(["owner", "staff"]), async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id).populate("createdBy", "name");
//     if (!order) return res.status(404).send("Order not found");

//     const html = `
// <html>
// <head>
//   <title>Cake Order</title>
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       width: 350px;
//       margin: auto;
//       border: 1px solid #000;
//       padding: 10px;
//     }
//     h2, h4 {
//       text-align: center;
//       margin: 2px 0;
//     }
//     .row {
//       display: flex;
//       margin: 6px 0;
//     }
//     .label {
//       width: 140px;
//       font-weight: bold;
//     }
//     .value {
//       flex: 1;
//       border-bottom: 1px dotted #000;
//     }
//     .footer {
//       margin-top: 10px;
//       font-size: 12px;
//     }
//   </style>
// </head>
// <body onload="window.print()">

//   <h2>Sri Krishna Cake Palace</h2>
//   <h4>MFRS. OF BAKERY ITEMS, SWEETS & CHATS</h4>
//   <p style="text-align:center; font-size:12px;">
//     Sri Krishna Complex, Bhuvaneshwari Nagar,<br/>
//     Hesaraghatta Main Road, T.Dasarahalli, Bangalore - 57
//   </p>

//   <div class="row">
//     <div class="label">SL.No:</div>
//     <div class="value">${order.orderNumber}</div>
//     <div class="label">Date:</div>
//     <div class="value">${new Date(order.createdAt).toLocaleDateString()}</div>
//   </div>

//   <div class="row"><div class="label">Variety:</div><div class="value">${order.variety || ""}</div></div>
//   <div class="row"><div class="label">Flavour:</div><div class="value">${order.flavor || ""}</div></div>
//   <div class="row"><div class="label">Required Weight:</div><div class="value">${order.weight || ""} kg</div></div>
//   <div class="row"><div class="label">Delivery Date:</div><div class="value">${order.deliveryDate || ""}</div></div>
//   <div class="row"><div class="label">Timings:</div><div class="value">${order.deliveryTime || ""}</div></div>
//   <div class="row"><div class="label">Advance:</div><div class="value">₹${order.advance || "0"}</div></div>
//   <div class="row"><div class="label">Shape:</div><div class="value">${order.shape || ""}</div></div>

//   <div class="footer">
//     <p>1. 50% Advance should be paid.</p>
//     <p>2. Cake should be taken within 12 hours of delivery date. Otherwise advance is not refundable.</p>
//     <p>3. This order slip must be produced at the time of delivery.</p>
//   </div>

// </body>
// </html>
// `;


//     res.send(html);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
router.get("/:id/print", auth(["owner", "staff"]), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send("Order not found");

    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Cake Order</title>
<style>
  body {
    font-family: Arial, sans-serif;
    width: 80mm;            /* Thermal paper width */
    margin: 0 auto;
    padding: 6px;
    font-size: 12px;
  }

  h3 {
    font-size: 15px;
    margin: 4px 0;
    font-weight: bold;
  }

  h4 {
    font-size: 13px;
    margin: 4px 0;
    font-weight: bold;
  }

  hr {
    border: none;
    border-top: 1px dashed #000;
    margin: 6px 0;
  }

  .row {
    display: flex;
    margin: 4px 0;
  }

  .label {
    width: 45%;
    font-weight: bold;
  }

  .value {
    width: 55%;
    text-align: left;
  }

  .footer {
    margin-top: 10px;
    font-size: 11px;
    line-height: 1.4;
  }

  .center {
    text-align: center;
  }

  @media print {
    @page {
      size: 80mm auto;
      margin: 0;
    }
  }
</style>
</head>

<body onload="window.print()">

${renderReceipt(order)}
<hr/>
${renderReceipt(order)}

</body>
</html>
`);
  } catch (e) {
    console.error(e);
    res.status(500).send("Server error");
  }
});

function renderReceipt(order) {
  return `
  <div style="text-align:center;">
      <h3 style="margin:4px 0;">SRI KRISHNA CAKE PALACE</h3>

      <div style="font-size:12px; line-height:1.4;">
        Sri Krishna Complex, Hesaraghatta Road,<br/>
        T-Dasarahalli, Bengaluru - 57
      </div>

      <div style="font-size:12px; margin-top:4px;">
        Ph: 9845242323 &nbsp; | &nbsp; GSTIN: 29AFTPN7326N1ZF
      </div>

      <hr style="margin:8px 0;">

      <h4 style="margin:4px 0;">CAKE ORDER FORM</h4>
    </div>
  <div class="row"><div class="label">SL No</div><div class="value">${order.serialNo}</div></div>
  <div class="row"><div class="label">Cake</div><div class="value">${order.cakeType}</div></div>
  <div class="row"><div class="label">Flavor</div><div class="value">${order.flavor}</div></div>
  <div class="row"><div class="label">Shape</div><div class="value">${order.shape}</div></div>
  <div class="row"><div class="label">Weight</div><div class="value">${order.weight} kg</div></div>
  ${
      order.eggType === "eggless"
        ? `<div class="row"><div class="label">Egg Type</div><div class="value">Eggless</div></div>`
        : ``
    }
  <div class="row"><div class="label">Advance</div><div class="value">₹${order.advance}</div></div>
  <div class="row"><div class="label">Delivery-Date</div><div class="value">${order.date}</div></div>
  <div class="row"><div class="label">Delivery-Time</div><div class="value">${order.time}</div></div>
  <div class="row"><div class="label">Delivery-Message</div><div class="value">${order.message ? order.message : ""}</div></div>
  <div class="footer">
  <hr>

  <p>1. Minimum 50% advance should be paid.</p>
  <p>2. Cake must be collected within 12 hours of delivery time.</p>
  <p>3. Advance amount is non-refundable.</p>
  <p>4. This order slip must be produced at the time of delivery.</p>

  <p class="center" style="margin-top:6px;">
    Thank you for choosing<br/>
    <b>SRI KRISHNA CAKE PALACE</b>
  </p>
</div>
  `;
}



module.exports = router;
