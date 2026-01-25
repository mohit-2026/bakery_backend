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

  const res = await fetch("http://localhost:5000/api/orders/list", {
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

  const res = await fetch("http://localhost:5000/api/orders", {
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
    table.innerHTML += `
      <tr>
        <td>${o.serialNo}</td>
        <td>${o.flavor}</td>
        <td>${o.weight} kg</td>
        <td>${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>
          ${
            o.status === "pending"
              ? `<button class="approve" onclick="approveOrder('${o._id}')">Approve</button>`
              : `<button class="print" onclick="printOrder('${o._id}')">Print</button>`
          }
        </td>
      </tr>
    `;
  });
}



async function approveOrder(orderId) {
  if (!confirm("Approve this order?")) return;

  const token = localStorage.getItem("token");

  const res = await fetch(
    `http://localhost:5000/api/orders/${orderId}/status`,
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

function takeNewOrder() {
  window.location.href = "dashboard.html";
}
function printOrder(id) {
  const token = localStorage.getItem("token");
  window.open(
    `http://localhost:5000/api/orders/${id}/print?token=${token}`,
    "_blank"
  );
}

loadOrders();
