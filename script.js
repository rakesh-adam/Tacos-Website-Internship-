const orderState = {
  items: [],
  total: 0
};
document.addEventListener('DOMContentLoaded', () => {
  loadOrderFromStorage();
  initializeEventListeners();
  displayOrder();
});

function updateQuantity(item, change) {
  const qtyInput = document.getElementById(`${item}-qty`);
  const newQty = Math.max(1, parseInt(qtyInput.value) + change);
  qtyInput.value = newQty;
  
  if (item === 'crispy') updateCrispyPrice();
  if (item === 'soft') updateSoftPrice();
}

function updateCrispyPrice() {
  const qty = parseInt(document.getElementById('crispy-qty').value);
  const price = 1.50;
  const total = (qty * price).toFixed(2);
  document.getElementById('crispy-total').textContent = total;
}

function updateSoftPrice() {
  const qty = parseInt(document.getElementById('soft-qty').value);
  const price = 2.00;
  const total = (qty * price).toFixed(2);
  document.getElementById('soft-total').textContent = total;
}
function addToOrder(itemName, itemId) {
  const qtyInput = document.getElementById(`${itemId}-qty`);
  const qty = parseInt(qtyInput.value);
  
  let price;
  if (itemId === 'crispy') price = 1.50;
  if (itemId === 'soft') price = 2.00;
  
  const itemTotal = (qty * price).toFixed(2);
  
  const orderItem = {
    id: Date.now(),
    name: itemName,
    quantity: qty,
    price: price,
    total: itemTotal
  };
  
  orderState.items.push(orderItem);
  calculateTotal();
  displayOrder();
  saveOrderToStorage();
  
  showNotification(`Added ${qty} ${itemName} Taco(s) to order!`);
  
  qtyInput.value = 1;
  if (itemId === 'crispy') updateCrispyPrice();
  if (itemId === 'soft') updateSoftPrice();
}

function calculateTotal() {
  orderState.total = orderState.items.reduce((sum, item) => {
    return sum + parseFloat(item.total);
  }, 0);
}

function displayOrder() {
  const orderList = document.getElementById('order-list');
  const grandTotal = document.getElementById('grand-total');
  
  if (!orderList) return; 
  
  if (orderState.items.length === 0) {
    orderList.innerHTML = '<p class="empty-order">No items added yet</p>';
    if (grandTotal) grandTotal.textContent = '0.00';
    return;
  }
  
  let html = '<table class="order-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th><th>Action</th></tr></thead><tbody>';
  
  orderState.items.forEach(item => {
    html += `
      <tr>
        <td>${item.name} Tacos</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${item.total}</td>
        <td><button type="button" class="remove-btn" onclick="removeFromOrder(${item.id})">Remove</button></td>
      </tr>
    `;
  });
  
  html += '</tbody></table>';
  orderList.innerHTML = html;
  
  if (grandTotal) grandTotal.textContent = orderState.total.toFixed(2);
}

function removeFromOrder(itemId) {
  orderState.items = orderState.items.filter(item => item.id !== itemId);
  calculateTotal();
  displayOrder();
  saveOrderToStorage();
  showNotification('Item removed from order');
}

function clearOrder() {
  if (orderState.items.length === 0) {
    showNotification('Order is already empty!');
    return;
  }
  
  if (confirm('Are you sure you want to clear your entire order?')) {
    orderState.items = [];
    orderState.total = 0;
    displayOrder();
    saveOrderToStorage();
    showNotification('Order cleared');
  }
}

function checkout() {
  if (orderState.items.length === 0) {
    showNotification('Please add items to your order first!');
    return;
  }
  
  const orderSummary = orderState.items
    .map(item => `${item.quantity}x ${item.name} Tacos`)
    .join(', ');
  
  alert(`Order Summary:\n${orderSummary}\n\nTotal: $${orderState.total.toFixed(2)}\n\nThank you for your order!`);
  
  orderState.items = [];
  orderState.total = 0;
  displayOrder();
  saveOrderToStorage();
}

function saveOrderToStorage() {
  localStorage.setItem('tacoOrder', JSON.stringify(orderState));
}

function loadOrderFromStorage() {
  const saved = localStorage.getItem('tacoOrder');
  if (saved) {
    const data = JSON.parse(saved);
    orderState.items = data.items || [];
    orderState.total = data.total || 0;
  }
}

function showNotification(message) {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function validateContactForm(form) {
  const name = form.querySelector('[name="name"]');
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="phone"]');
  const message = form.querySelector('[name="message"]');
  
  let isValid = true;
  
  document.querySelectorAll('.error').forEach(el => el.remove());
  
  if (!name.value.trim()) {
    showError(name, 'Name is required');
    isValid = false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value)) {
    showError(email, 'Valid email is required');
    isValid = false;
  }
  const phoneRegex = /^\d{10,}$/;
  if (phone && phone.value.trim() && !phoneRegex.test(phone.value.replace(/\D/g, ''))) {
    showError(phone, 'Valid phone number is required');
    isValid = false;
  }
  
  if (!message || !message.value.trim()) {
    showError(message, 'Message is required');
    isValid = false;
  }
  
  return isValid;
}

function showError(input, message) {
  const error = document.createElement('span');
  error.className = 'error';
  error.textContent = message;
  error.style.color = 'red';
  error.style.fontSize = '0.9em';
  error.style.display = 'block';
  error.style.marginTop = '5px';
  input.parentNode.insertBefore(error, input.nextSibling);
}

function initializeEventListeners() {
  const contactForm = document.querySelector('form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      if (!validateContactForm(contactForm)) {
        e.preventDefault();
        showNotification('Please fix the errors in the form');
      } else {
        showNotification('Form submitted successfully!');
      }
    });
  }
}
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterMenuItems(category) {
  const items = document.querySelectorAll('.menu-item');
  items.forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function formatCurrency(amount) {
  return '$' + parseFloat(amount).toFixed(2);
}


function printOrder() {
  if (orderState.items.length === 0) {
    showNotification('No items to print');
    return;
  }
  
  const printWindow = window.open('', '', 'width=400,height=600');
  const orderHTML = `
    <html>
      <head>
        <title>Order Receipt - Little Taco Shop</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #ff6b35; color: white; }
          .total { text-align: right; font-weight: bold; margin-top: 20px; font-size: 18px; }
        </style>
      </head>
      <body>
        <h2>Little Taco Shop</h2>
        <h3>Order Receipt</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderState.items.map(item => `
              <tr>
                <td>${item.name} Tacos</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Grand Total: $${orderState.total.toFixed(2)}</div>
        <p style="text-align: center; margin-top: 30px;">Thank you for your order!</p>
      </body>
    </html>
  `;
  
  printWindow.document.write(orderHTML);
  printWindow.document.close();
  printWindow.print();
}
