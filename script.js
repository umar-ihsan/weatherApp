const apiKey = '5aa1f2f19c7cf152bf4b51d1ec281500';
const defaultCity = 'Islamabad';
const apiUrlBase = `https://api.openweathermap.org/data/2.5/forecast?units=metric&cnt=40&appid=${apiKey}`;
const itemsPerPage = 5;
let currentPage = 1;
let forecastData = [];
let lineChart, barChart, pieChart;

async function fetchWeatherData(city) {
    const apiUrl = `${apiUrlBase}&q=${city}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        forecastData = data.list;
        fillTable(forecastData);
        updatePagination();
        document.getElementById('city-name').textContent = city;
        document.getElementById('current-temp').textContent = `Current Temperature: ${forecastData[0].main.temp.toFixed(1)} °C`;

        // Prepare data for charts
        updateCharts(forecastData);

    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

function fillTable(forecast) {
    const tbody = document.getElementById('forecast-tbody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = forecast.slice(startIndex, endIndex);

    pageData.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const temperature = item.main.temp.toFixed(1);
        const conditions = item.weather[0].description;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${temperature} °C</td>
            <td>${conditions}</td>
        `;
        tbody.appendChild(row);
    });
}

function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(forecastData.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = 'page-button';
        pageButton.addEventListener('click', () => {
            currentPage = i;
            fillTable(forecastData);
            const buttons = document.querySelectorAll('.page-button');
            buttons.forEach(btn => btn.classList.remove('active'));
            pageButton.classList.add('active');
        });
        paginationContainer.appendChild(pageButton);
    }
}

function updateCharts(forecast) {
    const labels = forecast.map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = forecast.map(item => item.main.temp);
    const conditionsCounts = forecast.reduce((acc, item) => {
        acc[item.weather[0].description] = (acc[item.weather[0].description] || 0) + 1;
        return acc;
    }, {});

    clearCharts();
    createLineChart(labels, temperatures);
    createBarChart(labels, temperatures);
    createPieChart(conditionsCounts);
}

function clearCharts() {
    if (lineChart) {
        lineChart.destroy();
        lineChart = null;
    }
    if (barChart) {
        barChart.destroy();
        barChart = null;
    }
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
}

function createLineChart(labels, data) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature over Time (°C)',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createBarChart(labels, data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Weather Conditions',
                data: Object.values(data),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        }
    });
}

function sortDataByTemperature(ascending = true) {
    const sortedData = [...forecastData].sort((a, b) => {
        return ascending ? a.main.temp - b.main.temp : b.main.temp - a.main.temp;
    });
    fillTable(sortedData);
    updateCharts(sortedData);
}

function sortDataByDate(ascending = true) {
    const sortedData = [...forecastData].sort((a, b) => {
        return ascending ? a.dt - b.dt : b.dt - a.dt;
    });
    fillTable(sortedData);
    updateCharts(sortedData);
}

document.getElementById('get-weather').addEventListener('click', () => {
    const cityInput = document.getElementById('city-input').value;
    const city = cityInput ? cityInput : defaultCity; 
    fetchWeatherData(city);
});


document.getElementById('sort-temp-asc').addEventListener('click', () => sortDataByTemperature(true));
document.getElementById('sort-temp-desc').addEventListener('click', () => sortDataByTemperature(false));
document.getElementById('sort-date-asc').addEventListener('click', () => sortDataByDate(true));
document.getElementById('sort-date-desc').addEventListener('click', () => sortDataByDate(false));


fetchWeatherData(defaultCity);
