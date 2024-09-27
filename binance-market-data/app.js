const coins = ['ethusdt', 'bnbusdt', 'dotusdt'];
let historicalData = {}; // Object to store historical data for each coin
let ws;
let chart; // Declare the chart variable in the appropriate scope

// Initialize the chart
function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: [],
            datasets: [{
                label: 'Candlestick Data',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                }
            }
        }
    });
}

// Function to connect to the WebSocket
function connectWebSocket(coin, interval) {
    if (ws) {
        ws.close();
    }

    const socketUrl = `wss://stream.binance.com:9443/ws/${coin}@kline_${interval}`;
    ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const candlestickData = {
            time: data.k.t,
            open: data.k.o,
            high: data.k.h,
            low: data.k.l,
            close: data.k.c
        };

        // Store historical data for the current coin
        if (!historicalData[coin]) {
            historicalData[coin] = [];
        }
        historicalData[coin].push(candlestickData);

        // Update the chart only if it's initialized
        if (chart) {
            chart.data.labels.push(new Date(candlestickData.time));
            chart.data.datasets[0].data.push(candlestickData.close);
            chart.update();
        }
    };
}

// Event listener for coin selection change
document.getElementById('coin-select').addEventListener('change', function(event) {
    const selectedCoin = event.target.value;

    // If historical data exists, use it; otherwise, start fresh
    if (historicalData[selectedCoin]) {
        chart.data.labels = historicalData[selectedCoin].map(data => new Date(data.time));
        chart.data.datasets[0].data = historicalData[selectedCoin].map(data => data.close);
    } else {
        // If no historical data, reset chart
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
    }
    
    chart.update(); 
    connectWebSocket(selectedCoin, '1m');
});

// Initialize the chart and connect to the default coin
initializeChart();
connectWebSocket(coins[0], '1m'); 
