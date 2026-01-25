/* -------------------------
   GLOBAL ORDER STATE
-------------------------- */
const screen = {1:"screen-cake-type",2:"screen-flavor",3:"screen-details",4:"screen-review"};
let screenCount = 0;
const order = {
  category: "",
  cakeType: "",
  shape: "",
  flavor: "",
  weight: "",
  date: "",
  time: "",
  advance: "",
  message: ""
};

// if (localStorage.getItem("printed") === "yes") {
//   document.getElementById("edit-btn").disabled = true;
//   document.getElementById("print-btn").disabled = true;
// }
/* -------------------------
   SCREEN HANDLER
-------------------------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

/* -------------------------
   CATEGORY
-------------------------- */
function selectCategory(category) {
  console.log(category);
  
  order.category = category;
  showScreen("screen-cake-type");
  screenCount ++
}

/* -------------------------
   CAKE TYPE
-------------------------- */
function selectCakeType(type) {
  order.cakeType = type;
console.log("type",type)
  loadFlavors(type);
  showScreen("screen-flavor");
  screenCount ++
}

function back(){
  screenCount --
  showScreen(screen[screenCount])
}

/* -------------------------
   FLAVORS (DYNAMIC)
-------------------------- */
const flavorMap = {
  "Fresh Cream Cake": [
    "Pineapple", "Butterscotch", "Vanilla",
    "Black Forest", "Blackcurrant", "Blueberry","Pista","Full Choclate"
  ],
  "Chocolate Cake": [
    "Dark Chocolate", "Choco Truffle", "Chocolate Almond"
  ],
  "Sponge Cake": [
    "Vanilla", "Butterscotch", "Pineapple","Pista"
  ]
};

function loadFlavors(type) {
  const container = document.getElementById("flavor-buttons");
  container.innerHTML = "";

  const flavors = flavorMap[type] || [];

  flavors.forEach(flavor => {
    const btn = document.createElement("button");
    btn.textContent = flavor;
    btn.onclick = () => selectFlavor(flavor);
    container.appendChild(btn);
  });
}

function selectFlavor(flavor) {
  order.flavor = flavor;
  showScreen("screen-details");
  screenCount ++
}

/* -------------------------
   DETAILS
-------------------------- */
function goToReview() {
  order.shape = document.getElementById("shape").value;
  const weightText = document.getElementById("weight").value;
  order.weight = parseFloat(weightText);
  order.date = document.getElementById("deliveryDate").value;
  order.time = document.getElementById("deliveryTime").value;
  order.advance = document.getElementById("advance").value;
  order.message = document.getElementById("message").value;

  renderReview();
  showScreen("screen-review");
}

/* -------------------------
   REVIEW
-------------------------- */
function renderReview() {
  const div = document.getElementById("review-summary");

  div.innerHTML = `
    <div class="review-box">
      <p><strong>Cake:</strong> ${order.cakeType}</p>
      <p><strong>Flavor:</strong> ${order.flavor}</p>
      <p><strong>Shape:</strong> ${order.shape}</p>
      <p><strong>Weight:</strong> ${order.weight}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Time:</strong> ${order.time}</p>
      <p><strong>Advance:</strong> ₹${order.advance}</p>
      <p><strong>Message:</strong> ${order.message || "-"}</p>
    </div>
  `;
}

/* -------------------------
   SAVE & PRINT
-------------------------- */
// function saveAndPrint() {
//   // Later: send to backend using fetch()
//   console.log("Saving order:", order);

//   window.print(); // prints once (printer can be set to 2 copies)
// }

/* -------------------------
   BACK BUTTON
-------------------------- */
function goBack() {
  showScreen("screen-details");
}
order.eggType = "";

// After cake category
// function selectCategory(category) {
//   order.category = category;
//   showScreen("screen-egg");
// }

// function selectEggType(type) {
//   order.eggType = type;
//   loadFlavors(type);
//   showScreen("screen-flavor");
// }

// Flavors based on Egg / Eggless
// function loadFlavors(type) {
//   const container = document.getElementById("flavor-buttons");
//   container.innerHTML = "";

//   const flavors = type === "Egg"
//     ? ["Black Forest", "Truffle", "Chocolate", "Red Velvet"]
//     : ["Vanilla", "Butterscotch", "Pineapple"];

//   flavors.forEach(flavor => {
//     const btn = document.createElement("button");
//     btn.textContent = flavor;
//     btn.onclick = () => selectFlavor(flavor);
//     container.appendChild(btn);
//   });
// }
// function saveAndPrint() {
//   document.getElementById("print-area").style.display = "block";
//   window.print(); // Printer setting → copies = 2
// }
async function saveAndPrint() {
  try {
    document.getElementById("edit-btn").disabled = true;
  document.getElementById("print-btn").disabled = true;
    const token = localStorage.getItem("token");
    console.log("order",order);
    
    const response = await fetch("http://localhost:5000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(order)
    });

    const data = await response.json();
    console.log("data",data);
    

    if (!response.ok) {
      alert(data.message || "Order failed");
      return;
    }
    printOrder(data._id)
    localStorage.setItem("printed", "yes");
    // document.getElementById("print-area").style.display = "block";
    // window.print();

  } catch (err) {
    console.error("Save failed:", err);
    alert("Something went wrong");
     document.getElementById("editBtn").disabled = false;
    document.getElementById("printBtn").disabled = false;
  }
}

function printOrder(id) {
  const token = localStorage.getItem("token");
  window.open(
    `http://localhost:5000/api/orders/${id}/print?token=${token}`,
    "_blank"
  );
}

// function loadOrders() {
//   showScreen("screen-history")
//   fetch("http://localhost:5000/api/orders", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": "Bearer " + localStorage.getItem("token")
//     },
//     body: JSON.stringify({ fetch: true })
//   })
//   .then(res => res.json())
//   .then(data => {
//     console.log("ORDERS:", data);

//     const table = document.getElementById("order-table");
//     if (!table) {
//       console.error("order-table element not found");
//       return;
//     }

//     table.innerHTML = "";

//     if (!Array.isArray(data) || data.length === 0) {
//       table.innerHTML = `
//         <tr>
//           <td colspan="5">No orders found</td>
//         </tr>
//       `;
//       return;
//     }

//     data.forEach((o, index) => {
//       console.log(o,index);
      
//       const row = document.createElement("tr");
//       row.innerHTML = `
//         <td>${index + 1}</td>
//         <td>${o.category || "Cake"}</td>
//         <td>${o.flavor || "-"}</td>
//         <td>${new Date(o.createdAt).toLocaleString()}</td>
//         <td>
//           <button onclick="printOrder('${o._id}')">Print</button>
//         </td>
//       `;
//       table.appendChild(row);
//     });
    
//   })
//   .catch(err => {
//     console.error("Load orders failed:", err);
//   });
// }
function loadOrders() {
  window.location.href = "orders.html";
}
function takeNewOrder(){
 window.location.reload
}

function printOrder(orderId) {
  window.open(
    `http://localhost:5000/api/orders/${orderId}/print?token=${localStorage.getItem("token")}`,
    "_blank"
  );
}





