let allOrders = [];
let currentStatus = "pending";
let orders = [];
let skip = 0;
const limit = 10;

fetchOrders(true);

async function fetchOrders(reset = false) {
  const token = localStorage.getItem("token");
  const serialNo = document.getElementById("searchSerial").value;

  if (reset) {
    skip = 0;
    orders = [];
  }

  const res = await fetch("https://krishna-cake-backend.onrender.com/api/orders/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      status: currentStatus,
      serialNo: serialNo || undefined,
      skip,
      limit
    })
  });

  const data = await res.json();

  orders = orders.concat(data);
  renderOrders();

  // Increase skip for next load
  skip += data.length;

  // Hide load more if less than limit
  document.getElementById("loadMoreBtn").style.display =
    data.length < limit ? "none" : "block";
}

async function loadOrders() {
  const token = localStorage.getItem("token");

  const res = await fetch("https://krishna-cake-backend.onrender.com/api/orders", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  allOrders = await res.json();
  renderOrders();
}

function setStatus(status) {
  currentStatus = status;
  document.getElementById("tab-pending").classList.remove("active");
  document.getElementById("tab-approved").classList.remove("active");
  document.getElementById("tab-" + status).classList.add("active");

  fetchOrders(true);
}


function renderOrders() {
  const table = document.getElementById("ordersTable");
  table.innerHTML = "";

  orders.forEach(o => {
  let actions = "";

  if (o.status === "pending") {
    actions = `
      <button class="print" onclick="printOrder('${o._id}')">Print</button>
      <button class="cancel" onclick="cancelOrder('${o._id}')">Cancel</button>
    `;
  } 
  else if (o.status === "approved") {
    actions = `
      <button class="print" onclick="printOrder('${o._id}')">Print</button>
    `;
  } 
  else if (o.status === "cancelled") {
    actions = `<span style="color:red;">Cancelled</span>`;
  }

  table.innerHTML += `
    <tr>
      <td>${o.serialNo}</td>
      <td>${o.cakeType || "-"}</td>
      <td>${o.eggType || "-"}</td>
      <td>${o.flavor || "-"}</td>
      <td>${o.shape || "-"}</td>
      <td>${o.weight} kg</td>
      <td>₹${o.advance || 0}</td>
      <td>${o.status}</td>
      <td>${new Date(o.createdAt).toLocaleDateString()}</td>
      <td>${actions}</td>
    </tr>
  `;
});
}



async function approveOrder(orderId) {
  if (!confirm("Approve this order?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch(
    `https://krishna-cake-backend.onrender.com/api/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ status: "approved" })
    }
  );

  if (!res.ok) {
    alert("Failed to approve order");
    return;
  }

  // Refresh list after approval
  fetchOrders(true);
}

async function cancelOrder(orderId) {
  if (!confirm("cancel this order?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch(
    `https://krishna-cake-backend.onrender.com/api/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ status: "cancelled" })
    }
  );

  if (!res.ok) {
    alert("Failed to approve order");
    return;
  }

  // Refresh list after approval
  fetchOrders(true);
}

function takeNewOrder() {
  window.location.href = "dashboard.html";
}
function printOrder(id) {
  const token = localStorage.getItem("token");
  window.open(
    `https://krishna-cake-backend.onrender.com/api/orders/${id}/print?token=${token}`,
    "_blank"
  );
}

loadOrders();
