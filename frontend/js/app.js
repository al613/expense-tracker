const API_URL = "http://localhost:3000/api/expenses";

let allExpenses = [];
let editModal;

document.addEventListener("DOMContentLoaded", () => {
  editModal = new bootstrap.Modal(document.getElementById("editModal"));
  
  fetchExpenses();

  document.getElementById("add-expense-form").addEventListener("submit", handleAddExpense);
  document.getElementById("edit-expense-form").addEventListener("submit", handleEditExpense);
  document.getElementById("filter-category").addEventListener("change", handleFilter);
});

function showAlert(message, type = "danger") {
  const alertContainer = document.getElementById("alert-container");
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;
}

async function fetchExpenses() {
  const spinner = document.getElementById("spinner");
  try {
    spinner.classList.remove("d-none");
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to load expenses");
    
    allExpenses = await res.json();
    renderExpenses(allExpenses);
  } catch (err) {
    showAlert(err.message);
  } finally {
    spinner.classList.add("d-none");
  }
}

function renderExpenses(expenses) {
  const tbody = document.getElementById("expenses-table-body");
  tbody.innerHTML = "";

  if (expenses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-muted">No expenses found</td></tr>`;
    updateSummary([]);
    return;
  }

  expenses.forEach(exp => {
    const formattedDate = new Date(exp.date).toISOString().split("T")[0];
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${exp.title}</td>
      <td class="fw-bold">$${parseFloat(exp.amount).toFixed(2)}</td>
      <td><span class="badge bg-secondary">${exp.category}</span></td>
      <td>${formattedDate}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${exp.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${exp.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateSummary(expenses);
}

function updateSummary(expenses) {
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const totalCount = expenses.length;
  const highest = expenses.length > 0 ? Math.max(...expenses.map(e => parseFloat(e.amount))) : 0;

  document.getElementById("total-amount").textContent = `$${totalAmount.toFixed(2)}`;
  document.getElementById("total-count").textContent = totalCount;
  document.getElementById("highest-expense").textContent = `$${highest.toFixed(2)}`;
}

async function handleAddExpense(e) {
  e.preventDefault();
  
  const title = document.getElementById("title").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add expense");
    }

    document.getElementById("add-expense-form").reset();
    showAlert("Expense added successfully!", "success");
    fetchExpenses();
  } catch (err) {
    showAlert(err.message);
  }
}

function openEditModal(id) {
  const expense = allExpenses.find(e => e.id === id);
  if (!expense) return;

  const formattedDate = new Date(expense.date).toISOString().split("T")[0];

  document.getElementById("edit-id").value = expense.id;
  document.getElementById("edit-title").value = expense.title;
  document.getElementById("edit-amount").value = expense.amount;
  document.getElementById("edit-category").value = expense.category;
  document.getElementById("edit-date").value = formattedDate;

  editModal.show();
}

async function handleEditExpense(e) {
  e.preventDefault();

  const id = document.getElementById("edit-id").value;
  const title = document.getElementById("edit-title").value;
  const amount = document.getElementById("edit-amount").value;
  const category = document.getElementById("edit-category").value;
  const date = document.getElementById("edit-date").value;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update expense");
    }

    editModal.hide();
    showAlert("Expense updated successfully!", "success");
    fetchExpenses();
  } catch (err) {
    showAlert(err.message);
  }
}

async function deleteExpense(id) {
  if (!confirm("Are you sure you want to delete this expense?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete expense");
    }

    showAlert("Expense deleted successfully!", "success");
    fetchExpenses();
  } catch (err) {
    showAlert(err.message);
  }
}

function handleFilter(e) {
  const selectedCategory = e.target.value;
  if (selectedCategory === "All") {
    renderExpenses(allExpenses);
  } else {
    const filtered = allExpenses.filter(e => e.category === selectedCategory);
    renderExpenses(filtered);
  }
}