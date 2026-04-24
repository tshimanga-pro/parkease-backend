let serviceTotals = {
    pressure: 0,
    puncture: 0,
    valves: 0
};

const serviceCharges = {
    pressure: 500,
    puncture: 5000,
    valves: 5000
};

const serviceNames = {
    pressure: 'Pressure Check',
    puncture: 'Puncture Fixing',
    valves: 'Valves Replacement'
};

function loadServiceTotals() {
    serviceTotals = { pressure: 0, puncture: 0, valves: 0 };

    const transactions = getSavedTransactions();

    transactions.forEach(txn => {
        txn.services.forEach(service => {
            if (serviceTotals.hasOwnProperty(service.code)) {
                serviceTotals[service.code] += service.charge;
            }
        });
    });

    return {
        ...serviceTotals,
        grandTotal:
            serviceTotals.pressure +
            serviceTotals.puncture +
            serviceTotals.valves
    };
}
function calculateTyreTransaction({ tyreSize, tyreModel, services }) {
    if (!tyreSize || !tyreModel) {
        throw new Error('Tyre size and model are required');
    }

    if (!services || !services.length) {
        throw new Error('At least one service must be selected');
    }

    const validServices = services.filter(s => serviceCharges[s]);

    if (!validServices.length) {
        throw new Error('Invalid services selected');
    }

    const servicesTotal = validServices.reduce((sum, service) => {
        return sum + serviceCharges[service];
    }, 0);

    const transaction = {
        id: `txn-${Date.now()}`,
        date: new Date().toISOString(),
        tyreSize,
        tyreModel,
        services: validServices.map(service => ({
            code: service,
            label: serviceNames[service],
            charge: serviceCharges[service]
        })),
        servicesTotal,
        grandTotal: servicesTotal
    };

    const transactions = getSavedTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);

    return {
        transaction,
        totals: loadServiceTotals()
    };
}