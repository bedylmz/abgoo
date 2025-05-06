const mockCargoData = {
  "123": { status: "In Transit", location: "New York", expected: "2025-05-01" },
  "XYZ789": { status: "Delivered", location: "Istanbul", expected: "2025-04-22" },
  "QWE456": { status: "Processing", location: "Warehouse 4", expected: "2025-04-28" },
};

function searchCargo() {
  const input = document.getElementById("cargoIdInput");
  const id = input.value.trim().toUpperCase();
  const resultDiv = document.getElementById("result");

  if (mockCargoData[id]) {
    const cargo = mockCargoData[id];
    window.location.href = "https://www.google.com";
      //window.location.replace("https://example.com");
      /*
    resultDiv.className = "result";
    resultDiv.innerHTML = `
      <strong>Status:</strong> ${cargo.status}<br>
      <strong>Location:</strong> ${cargo.location}<br>
      <strong>Expected Delivery:</strong> ${cargo.expected}
    `;*/
  } else {
    resultDiv.className = "result error";
    resultDiv.innerHTML = "❌ Cargo ID not found.";
  }

  resultDiv.style.display = "block";
}