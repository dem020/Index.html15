let cart = [];
let salesHistory = JSON.parse(localStorage.getItem("sales")) || [];

function addToCart(productName, price) {
  cart.push({ name: productName, price: price });
  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");
  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} — ${item.price} ₽`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.style.fontSize = "14px";
    removeBtn.style.background = "#ff5252";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "4px";
    removeBtn.onclick = () => {
      cart.splice(index, 1);
      updateCart();
    };

    li.appendChild(removeBtn);
    cartItems.appendChild(li);
    total += item.price;
  });

  totalEl.textContent = total;
}

function checkout(paymentMethod) {
  if (cart.length === 0) {
    alert("Добавьте товары в чек!");
    return;
  }

  const method = paymentMethod === 'cash' ? 'наличными' : 'картой';
  const sale = {
    date: new Date().toLocaleString(),
    items: [...cart],
    total: cart.reduce((sum, item) => sum + item.price, 0),
    payment: method
  };

  salesHistory.push(sale);
  localStorage.setItem("sales", JSON.stringify(salesHistory));
  updateSalesHistory();

  alert(`✅ Оплачено ${method}. Спасибо за покупку в "Вкус СССР"!`);

  printReceipt();
  clearCart();
}

function clearCart() {
  cart = [];
  updateCart();
}

function printReceipt() {
  let receipt = "===== ЧЕК =====\n";
  receipt += "Магазин: Вкус СССР\n";
  receipt += "==================\n";

  let total = 0;
  cart.forEach(item => {
    receipt += `${item.name} — ${item.price} ₽\n`;
    total += item.price;
  });

  receipt += "------------------\n";
  receipt += `Итого: ${total} ₽\n`;
  receipt += "==================\n";
  receipt += "Спасибо за покупку!\n";

  alert(receipt);
}

async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let text = "ЧЕК - Магазин 'Вкус СССР'\n\n";
  let total = 0;

  cart.forEach(item => {
    text += `${item.name}: ${item.price} ₽\n`;
    total += item.price;
  });

  text += `\nИтого: ${total} ₽\n`;
  text += `Дата: ${new Date().toLocaleString()}`;

  doc.text(text, 10, 10);
  doc.save("chek.pdf");
}

function updateSalesHistory() {
  const historyList = document.getElementById("sales-history");
  historyList.innerHTML = "";

  salesHistory.slice().reverse().forEach(sale => {
    const li = document.createElement("li");
    li.textContent = `${sale.date} | ${sale.total} ₽ | ${sale.payment}`;
    historyList.appendChild(li);
  });
}

// Сканер
window.onload = () => {
  const html5QrCode = new Html5Qrcode("qr-reader");

  const config = { fps: 10, qrbox: 250 };
  html5QrCode.start({ facingMode: "environment" }, config, (decodedText) => {
    handleScannedCode(decodedText);
    html5QrCode.stop().then(() => {
      document.getElementById("scan-result").textContent = "";
    });
  }).catch(err => {
    console.error("Ошибка сканера", err);
  });
};

function handleScannedCode(code) {
  // Предположим, что код соответствует ID товара
  const products = {
    "1001": { name: "Газировка", price: 35 },
    "1002": { name: "Сухарики", price: 25 },
    "1003": { name: "Мороженое", price: 40 },
    "1004": { name: "Хлеб", price: 20 },
    "1005": { name: "Селедка", price: 60 }
  };

  if (products[code]) {
    addToCart(products[code].name, products[code].price);
    document.getElementById("scan-result").textContent = `Добавлено: ${products[code].name}`;
  } else {
    document.getElementById("scan-result").textContent = `Товар не найден: ${code}`;
  }
}
