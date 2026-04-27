const serviceCharges = {
    pressure: 500,
    puncture: 5000,
    valves: 5000
};

function formatCurrency(amount) {
    return amount.toLocaleString('en-UG');
}

function calculateServiceTotals(selectedServices) {
    return {
        pressure: selectedServices.includes('pressure') ? serviceCharges.pressure : 0,
        puncture: selectedServices.includes('puncture') ? serviceCharges.puncture : 0,
        valves: selectedServices.includes('valves') ? serviceCharges.valves : 0
    };
}

function renderResult(values) {
    const resultSection = document.getElementById('result');
    const tyrePriceEl = document.getElementById('tyrePrice');
    const servicesTotalEl = document.getElementById('servicesTotal');
    const grandTotalEl = document.getElementById('grandTotal');
    const pressureTotalEl = document.getElementById('pressureTotalDisplay');
    const punctureTotalEl = document.getElementById('punctureTotalDisplay');
    const valvesTotalEl = document.getElementById('valvesTotalDisplay');
    const grandServiceTotalEl = document.getElementById('grandServiceTotal');

    if (!resultSection) return;

    resultSection.style.display = 'block';
    tyrePriceEl.textContent = `Tyre Price: UGX ${formatCurrency(values.tyrePrice)}`;
    servicesTotalEl.textContent = `Services Total: UGX ${formatCurrency(values.servicesTotal)}`;
    grandTotalEl.querySelector('strong').textContent = `Grand Total: UGX ${formatCurrency(values.grandTotal)}`;
    pressureTotalEl.textContent = `Total Pressure Check: UGX ${formatCurrency(values.totals.pressure)}`;
    punctureTotalEl.textContent = `Total Puncture Fixing: UGX ${formatCurrency(values.totals.puncture)}`;
    valvesTotalEl.textContent = `Total Valves Replacement: UGX ${formatCurrency(values.totals.valves)}`;
    grandServiceTotalEl.querySelector('strong').textContent = `Grand Service Total: UGX ${formatCurrency(values.grandServiceTotal)}`;
}

function getSelectedServices() {
    return Array.from(document.querySelectorAll('input[name="services"]:checked')).map(
        input => input.value
    );
}

function getTyreDetails() {
    const tyreSize = document.getElementById('tyreSize')?.value || '';
    const tyreModel = document.getElementById('tyreModel')?.value || '';
    return { tyreSize, tyreModel };
}

function handleCalculateCharges() {
    const { tyreSize, tyreModel } = getTyreDetails();
    const selectedServices = getSelectedServices();

    if (!tyreSize || !tyreModel) {
        alert('Please select tyre size and model before calculating charges.');
        return;
    }

    if (!selectedServices.length) {
        alert('Please select at least one service to calculate charges.');
        return;
    }

    const totals = calculateServiceTotals(selectedServices);
    const servicesTotal = totals.pressure + totals.puncture + totals.valves;
    const tyrePrice = 0;
    const grandTotal = servicesTotal + tyrePrice;

    renderResult({
        tyrePrice,
        servicesTotal,
        grandTotal,
        totals,
        grandServiceTotal: servicesTotal
    });
}

const calculateBtn = document.getElementById('calculateBtn');
if (calculateBtn) {
    calculateBtn.addEventListener('click', handleCalculateCharges);
}
