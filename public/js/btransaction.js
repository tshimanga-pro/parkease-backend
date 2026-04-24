    
        const STORAGE_KEY = "parkEaseBatteryTransactions";

        let hireTotal = 0;
        let saleTotal = 0;

        const batteryPrices = {
            hire: {
                "12V Car": 5000, // per day
                "24V Truck": 10000,
                "12V Motorcycle": 3000
            },
            sale: {
                "12V Car": 150000,
                "24V Truck": 300000,
                "12V Motorcycle": 50000
            }
        };

        function getBatteryTransactions() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch {
                return [];
            }
        }

        function saveBatteryTransactions(transactions) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        }

        function addBatteryTransaction(transaction) {
            const transactions = getBatteryTransactions();
            transactions.push(transaction);
            saveBatteryTransactions(transactions);
        }

        function renderActivityList() {
            const activityList = document.getElementById('activityList');
            activityList.innerHTML = '';

            getBatteryTransactions().forEach((transaction) => {
                const li = document.createElement('li');
                li.textContent = `${transaction.batteryType} - ${transaction.serviceType.charAt(0).toUpperCase() + transaction.serviceType.slice(1)} ${transaction.serviceType === 'hire' ? `for ${transaction.days} day(s)` : ''} - Total: UGX ${Number(transaction.price).toLocaleString()}`;
                activityList.appendChild(li);
            });
        }

        function updateTotals() {
            const overallTotal = hireTotal + saleTotal;
            document.getElementById('hireTotalDisplay').textContent = `Total Hire: UGX ${hireTotal.toLocaleString()}`;
            document.getElementById('saleTotalDisplay').textContent = `Total Sale: UGX ${saleTotal.toLocaleString()}`;
            document.getElementById('overallTotalDisplay').textContent = `Overall Total: UGX ${overallTotal.toLocaleString()}`;
        }

        function loadTotals() {
            hireTotal = 0;
            saleTotal = 0;

            getBatteryTransactions().forEach((transaction) => {
                if (transaction.serviceType === 'hire') {
                    hireTotal += Number(transaction.price) || 0;
                } else {
                    saleTotal += Number(transaction.price) || 0;
                }
            });

            updateTotals();
        }

        document.getElementById('serviceType').addEventListener('change', function() {
            const serviceType = this.value;
            const daysGroup = document.getElementById('daysGroup');
            if (serviceType === 'hire') {
                daysGroup.style.display = 'block';
            } else {
                daysGroup.style.display = 'none';
            }
        });

        document.getElementById('calculateBtn').addEventListener('click', function() {
            const type = document.getElementById('batteryType').value;
            const service = document.getElementById('serviceType').value;
            const days = parseInt(document.getElementById('days').value) || 1;

            if (!type || !service) {
                alert('Please select battery type and service type.');
                return;
            }

            let price = batteryPrices[service][type];
            if (service === 'hire') {
                price *= days;
            }

            document.getElementById('batteryPrice').textContent = `Battery ${service.charAt(0).toUpperCase() + service.slice(1)} Price: UGX ${price.toLocaleString()}`;
            document.getElementById('grandTotal').textContent = `Grand Total: UGX ${price.toLocaleString()}`;
            document.getElementById('result').style.display = 'block';

            const transaction = {
                batteryType: type,
                serviceType: service,
                days: service === 'hire' ? days : 0,
                price,
                createdAt: new Date().toISOString(),
            };
            addBatteryTransaction(transaction);

            if (service === 'hire') {
                hireTotal += price;
            } else {
                saleTotal += price;
            }
            updateTotals();

            const activityList = document.getElementById('activityList');
            const li = document.createElement('li');
            li.textContent = `${type} - ${service.charAt(0).toUpperCase() + service.slice(1)} ${service === 'hire' ? `for ${days} day(s)` : ''} - Total: UGX ${price.toLocaleString()}`;
            activityList.appendChild(li);
        });

        loadTotals();
        renderActivityList();
    