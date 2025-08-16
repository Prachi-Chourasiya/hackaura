// DOM Elements
const sections = {
    dashboard: document.getElementById('dashboard'),
    transactions: document.getElementById('transactions'),
    goals: document.getElementById('goals'),
    reports: document.getElementById('reports')
};

const navLinks = {
    dashboard: document.getElementById('dashboard-link'),
    transactions: document.getElementById('transactions-link'),
    goals: document.getElementById('goals-link'),
    reports: document.getElementById('reports-link')
};

// Sample Data
let transactions = [
    { id: 1, type: 'income', amount: 25000, category: 'salary', date: '2025-08-01', description: 'Monthly Salary' },
    { id: 2, type: 'expense', amount: 5000, category: 'food', date: '2025-08-02', description: 'Groceries' },
    { id: 3, type: 'expense', amount: 500, category: 'housing', date: '2025-08-05', description: 'Electricity Bill' },
    { id: 4, type: 'expense', amount: 400, category: 'transportation', date: '2025-08-07', description: 'Bus Pass' },
    { id: 5, type: 'expense', amount: 500, category: 'entertainment', date: '2025-08-10', description: 'Movie Tickets' },
    { id: 6, type: 'income', amount: 15000, category: 'freelance', date: '2025-08-15', description: 'Web Design Project' },
    { id: 7, type: 'expense', amount: 1000, category: 'shopping', date: '2025-08-14', description: 'New Shoes' }
];

let categories = {
    income: ['salary', 'freelance', 'investment', 'gift', 'other'],
    expense: ['food', 'housing', 'transportation', 'entertainment', 'shopping', 'health', 'education', 'other']
};

let goals = [
    { id: 1, name: 'Emergency Fund', target: 500000, current: 55500, deadline: '2025-12-31' }
];
// Indian Currency Formatter
function formatINR(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}


// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    // Set Indian date format (DD/MM/YYYY)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    document.getElementById('goal-deadline').value = today;

    // Set default currency symbol
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = '₹';
    });
    // Load dashboard by default
    showSection('dashboard');

    // Setup navigation
    setupNavigation();

    // Initialize charts
    initCharts();

    // Load transactions
    loadTransactions();

    // Load recent transactions
    loadRecentTransactions();

    // Setup form submissions
    setupForms();

    // Setup filters
    setupFilters();

    // Load goals
    loadGoals();

    // Check for budget alerts
    checkBudgetAlerts();
});

// Navigation
function setupNavigation() {
    for (const [sectionName, link] of Object.entries(navLinks)) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(sectionName);
        });
    }
}

function showSection(sectionName) {
    // Hide all sections
    for (const section of Object.values(sections)) {
        section.classList.remove('active-section');
    }

    // Remove active class from all nav links
    for (const link of Object.values(navLinks)) {
        link.classList.remove('active');
    }

    // Show the selected section
    sections[sectionName].classList.add('active-section');
    navLinks[sectionName].classList.add('active');
}

// Charts
function initCharts() {
    // Monthly Spending Chart
    const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);

    transactions.forEach(t => {
        const monthIdx = new Date(t.date).getMonth();
        if (t.type === 'income') {
            monthlyIncome[monthIdx] += t.amount;
        } else if (t.type === 'expense') {
            monthlyExpenses[monthIdx] += t.amount;
        }
    });
    const monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Income',
                data: monthlyIncome,
                backgroundColor: 'rgba(40, 96, 14, 0.98)',
                borderColor: 'rgba(122, 209, 139, 1)',
                borderWidth: 1
            }, {
                label: 'Expenses',
                data: monthlyExpenses,
                backgroundColor: 'rgba(220, 53, 69, 0.7)',
                borderColor: 'rgba(206, 136, 142, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Category Chart
    const categoryCtx = document.getElementById('category-chart').getContext('2d');
    const categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Shopping', 'Health', 'Other'],
            datasets: [{
                data: [5000, 500, 400, 500, 1000, 0, 800],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#8AC24A'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });

    // Store charts for later updates
    window.moneyMinderCharts = {
        monthly: monthlyChart,
        category: categoryChart,
        report: null
    };
}

// Transactions
function loadTransactions() {
    const tbody = document.getElementById('all-transactions-body');
    tbody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement('tr');

        // Indian Rupee formatting
        const amountCell = document.createElement('td');
        const formattedAmount = formatINR(transaction.amount);
        amountCell.textContent = transaction.type === 'income'
            ? '+' + formattedAmount
            : '-' + formattedAmount;

        amountCell.style.color = transaction.type === 'income' ? 'white' : 'red';


        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || 'No description'}</td>
            <td>${capitalizeFirstLetter(transaction.category)}</td>
            <td>${capitalizeFirstLetter(transaction.type)}</td>
        `;

        row.appendChild(amountCell);

        // Add actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="edit-btn" data-id="${transaction.id}">Edit</button>
            <button class="delete-btn" data-id="${transaction.id}">Delete</button>
        `;
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editTransaction(e.target.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteTransaction(e.target.dataset.id));
    });
}

function loadRecentTransactions() {
    const tbody = document.getElementById('recent-transactions-body');
    tbody.innerHTML = '';

    // Get 5 most recent transactions
    const recentTransactions = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentTransactions.forEach(transaction => {
        const row = document.createElement('tr');

        // Format amount with color based on type
        const amountCell = document.createElement('td');
        const formattedAmount = formatINR(transaction.amount);
        if (transaction.type === 'income') {
            amountCell.textContent = '+' + formattedAmount;
            amountCell.style.color = 'white';
        } else {
            amountCell.textContent = '-' + formattedAmount;
            amountCell.style.color = 'red';
        }

        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || 'No description'}</td>
            <td>${capitalizeFirstLetter(transaction.category)}</td>
        `;

        row.appendChild(amountCell);
        tbody.appendChild(row);
    });
}

function editTransaction(id) {
    const transaction = transactions.find(t => t.id === parseInt(id));
    if (!transaction) return;

    // Fill the form with transaction data
    document.getElementById('transaction-type').value = transaction.type;
    document.getElementById('transaction-amount').value = transaction.amount;
    document.getElementById('transaction-category').value = transaction.category;
    document.getElementById('transaction-date').value = transaction.date;
    document.getElementById('transaction-description').value = transaction.description || '';

    // Change button text
    const form = document.getElementById('transaction-form');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Transaction';

    // Store the ID in the form dataset
    form.dataset.editingId = id;

    // Scroll to form
    showSection('transactions');
    document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth' });
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== parseInt(id));
        loadTransactions();
        loadRecentTransactions();
        updateSummaryCards();
        updateCharts();
        showAlert('Transaction deleted successfully', 'success');
    }
}

// Forms
function setupForms() {
    // Transaction Form
    const transactionForm = document.getElementById('transaction-form');
    transactionForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const type = document.getElementById('transaction-type').value;
        const amount = parseFloat(document.getElementById('transaction-amount').value);
        const category = document.getElementById('transaction-category').value;
        const date = document.getElementById('transaction-date').value;
        const description = document.getElementById('transaction-description').value;

        // Check if we're editing or adding new
        const editingId = this.dataset.editingId;

        if (editingId) {
            // Update existing transaction
            const index = transactions.findIndex(t => t.id === parseInt(editingId));
            if (index !== -1) {
                transactions[index] = {
                    id: parseInt(editingId),
                    type,
                    amount,
                    category,
                    date,
                    description
                };

                showAlert('Transaction updated successfully', 'success');
            }
        } else {
            // Add new transaction
            const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
            transactions.push({
                id: newId,
                type,
                amount,
                category,
                date,
                description
            });

            showAlert('Transaction added successfully', 'success');

            // Check if this expense exceeds budget
            if (type === 'expense') {
                checkCategoryBudget(category, amount);
            }
        }

        // Reset form
        this.reset();
        document.getElementById('transaction-date').valueAsDate = new Date();
        delete this.dataset.editingId;

        // Update button text
        const submitButton = this.querySelector('button[type="submit"]');
        submitButton.textContent = 'Add Transaction';

        // Refresh UI
        loadTransactions();
        loadRecentTransactions();
        updateSummaryCards();
        updateCharts();
    });

    // Goal Form
    const goalForm = document.getElementById('goal-form');
    goalForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('goal-name').value;
        const target = parseFloat(document.getElementById('goal-target').value);
        const deadline = document.getElementById('goal-deadline').value;

        const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
        goals.push({
            id: newId,
            name,
            target,
            current: 0,
            deadline
        });

        // Reset form
        this.reset();
        document.getElementById('goal-deadline').valueAsDate = new Date();

        // Refresh UI
        loadGoals();
        showAlert('Savings goal added successfully', 'success');
    });
}

// Filters
function setupFilters() {
    // Populate category dropdown in transaction form
    const categorySelect = document.getElementById('transaction-category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';

    // Add income categories
    const incomeGroup = document.createElement('optgroup');
    incomeGroup.label = 'Income Categories';
    categories.income.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = capitalizeFirstLetter(category);
        incomeGroup.appendChild(option);
    });
    categorySelect.appendChild(incomeGroup);

    // Add expense categories
    const expenseGroup = document.createElement('optgroup');
    expenseGroup.label = 'Expense Categories';
    categories.expense.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = capitalizeFirstLetter(category);
        expenseGroup.appendChild(option);
    });
    categorySelect.appendChild(expenseGroup);

    // Setup filter event listeners
    document.getElementById('filter-month').addEventListener('change', filterTransactions);
    document.getElementById('filter-category').addEventListener('change', filterTransactions);
    document.getElementById('filter-type').addEventListener('change', filterTransactions);

    // Generate month options for filter
    const monthFilter = document.getElementById('filter-month');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthFilter.appendChild(option);
    });

    // Generate category options for filter
    const categoryFilter = document.getElementById('filter-category');
    const allCategories = [...categories.income, ...categories.expense];

    allCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = capitalizeFirstLetter(category);
        categoryFilter.appendChild(option);
    });
}

function filterTransactions() {
    const month = document.getElementById('filter-month').value;
    const category = document.getElementById('filter-category').value;
    const type = document.getElementById('filter-type').value;

    let filtered = [...transactions];

    if (month !== 'all') {
        filtered = filtered.filter(t => {
            const date = new Date(t.date);
            return (date.getMonth() + 1) === parseInt(month);
        });
    }

    if (category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
    }

    if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
    }

    // Update transactions table
    const tbody = document.getElementById('all-transactions-body');
    tbody.innerHTML = '';

    filtered.forEach(transaction => {
        const row = document.createElement('tr');

        // Format amount with color based on type
        const amountCell = document.createElement('td');
        const formattedAmount = formatINR(transaction.amount);
        if (transaction.type === 'income') {
            amountCell.textContent = '+' + formattedAmount;
            amountCell.style.color = 'white';
        } else {
            amountCell.textContent = '-' + formattedAmount;
            amountCell.style.color = 'red';
        }

        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description || 'No description'}</td>
            <td>${capitalizeFirstLetter(transaction.category)}</td>
            <td>${capitalizeFirstLetter(transaction.type)}</td>
        `;

        row.appendChild(amountCell);

        // Add actions
        const actionsCell = document.createElement('td');
        actionsCell.innerHTML = `
            <button class="edit-btn" data-id="${transaction.id}">Edit</button>
            <button class="delete-btn" data-id="${transaction.id}">Delete</button>
        `;
        row.appendChild(actionsCell);

        tbody.appendChild(row);
    });

    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editTransaction(e.target.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteTransaction(e.target.dataset.id));
    });
}

// Goals
function loadGoals() {
    const goalsContainer = document.querySelector('.goals-list');
    goalsContainer.innerHTML = '';

    goals.forEach(goal => {
        const progress = (goal.current / goal.target) * 100;

        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.innerHTML = `
            <h3>${goal.name}</h3>
            <p>Target: ${formatINR(goal.target)}</p>
            <p>Saved: ${formatINR(goal.current)}</p>
            <progress value="${progress}" max="100"></progress>
            <p>Deadline: ${formatDate(goal.deadline, true)}</p>
            <button class="edit-goal" data-id="${goal.id}">Edit</button>
            <button class="delete-goal" data-id="${goal.id}">Delete</button>
        `;

        goalsContainer.appendChild(goalCard);
    });

    // Add event listeners to goal buttons
    document.querySelectorAll('.edit-goal').forEach(btn => {
        btn.addEventListener('click', (e) => editGoal(e.target.dataset.id));
    });

    document.querySelectorAll('.delete-goal').forEach(btn => {
        btn.addEventListener('click', (e) => deleteGoal(e.target.dataset.id));
    });

    // Update savings goal in dashboard
    updateSummaryCards();
}

function editGoal(id) {
    const goal = goals.find(g => g.id === parseInt(id));
    if (!goal) return;

    // Fill the form with goal data
    document.getElementById('goal-name').value = goal.name;
    document.getElementById('goal-target').value = goal.target;
    document.getElementById('goal-deadline').value = goal.deadline;

    // Change button text
    const form = document.getElementById('goal-form');
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update Goal';

    // Store the ID in the form dataset
    form.dataset.editingId = id;

    // Scroll to form
    showSection('goals');
    document.getElementById('goal-form').scrollIntoView({ behavior: 'smooth' });
}

function deleteGoal(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
        goals = goals.filter(g => g.id !== parseInt(id));
        loadGoals();
        showAlert('Goal deleted successfully', 'success');
    }
}

// Summary Cards
function updateSummaryCards() {
    // Calculate totals
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Update with Indian Rupee
    document.getElementById('current-balance').textContent = formatINR(balance);
    document.getElementById('total-income').textContent = formatINR(totalIncome);
    document.getElementById('total-expenses').textContent = formatINR(totalExpenses);

    // Update savings goal progress
    const emergencyGoal = goals.find(g => g.name === 'Emergency Fund');
    if (emergencyGoal) {
        emergencyGoal.current = balance;
        const progress = (balance / emergencyGoal.target) * 100;
        document.getElementById('savings-progress').value = progress;
        document.getElementById('savings-goal').textContent = formatINR(emergencyGoal.target);

    }
}

// Charts Update
function updateCharts() {
    // Update monthly chart data (simplified - in a real app you'd aggregate by month)
    const monthlyChart = window.moneyMinderCharts.monthly;
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);

    transactions.forEach(t => {
        const monthIdx = new Date(t.date).getMonth();
        if (t.type === 'income') {
            monthlyIncome[monthIdx] += t.amount;
        } else if (t.type === 'expense') {
            monthlyExpenses[monthIdx] += t.amount;
        }
    });

    monthlyChart.data.datasets[0].data = monthlyIncome;
    monthlyChart.data.datasets[1].data = monthlyExpenses;
    monthlyChart.update();

    // Update category chart (simplified - in a real app you'd aggregate by category)
    const categoryChart = window.moneyMinderCharts.category;
    const categoryData = categories.expense.map(cat => {
        return transactions
            .filter(t => t.type === 'expense' && t.category === cat)
            .reduce((sum, t) => sum + t.amount, 0);
    });

    categoryChart.data.datasets[0].data = categoryData;
    categoryChart.update();
}

// Budget Alerts
function checkBudgetAlerts() {
    // Simple budget check - in a real app you'd have user-defined budgets per category
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses > totalIncome * 0.7) {
        showAlert('Warning: Your expenses are exceeding 70% of your income!', 'warning');
    }
}

function checkCategoryBudget(category, amount) {
    // Simple category budget check
    const categoryExpenses = transactions
        .filter(t => t.type === 'expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0);

    if (categoryExpenses > 200) { // Arbitrary threshold
        showAlert('You have spent a lot in this week. Please control your expenses.', 'warning');
    }
}

// Reports
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const reportPeriod = document.getElementById('report-period').value;

    // In a real app, this would fetch and process data based on the report type and period
    const reportCtx = document.getElementById('report-chart').getContext('2d');

    // Destroy previous report chart if it exists
    if (window.moneyMinderCharts.report) {
        window.moneyMinderCharts.report.destroy();
    }

    let newChart;

    if (reportType === 'monthly') {
        newChart = new Chart(reportCtx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expenses', 'Savings'],
                datasets: [{
                    label: 'Amount ($)',
                    data: [
                        transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                        transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                        transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) -
                        transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                    ],
                    backgroundColor: [
                        'rgba(23, 129, 48, 0.7)',
                        'rgba(196, 41, 57, 0.72)',
                        'rgba(20, 120, 136, 0.92)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(132, 223, 237, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else if (reportType === 'category') {
        const reportCategoryLabels = ['Food', 'Housing', 'Transportation', 'Entertainment', 'Shopping'];
        const reportCategoryData = reportCategoryLabels.map(label =>
            transactions
                .filter(t => t.type === 'expense' && t.category === label.toLowerCase())
                .reduce((sum, t) => sum + t.amount, 0)
        );
        newChart = new Chart(reportCtx, {
            type: 'pie',
            data: {
                labels: reportCategoryLabels,
                datasets: [{
                    data: reportCategoryData,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,

            }
        });
    } else { // yearly
        const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort();
        const yearlyIncome = years.map(year =>
            transactions.filter(t => t.type === 'income' && new Date(t.date).getFullYear() === year)
                .reduce((sum, t) => sum + t.amount, 0)
        );
        const yearlyExpenses = years.map(year =>
            transactions.filter(t => t.type === 'expense' && new Date(t.date).getFullYear() === year)
                .reduce((sum, t) => sum + t.amount, 0)
        );
        newChart = new Chart(reportCtx, {
            type: 'line',
            data: {
                labels: ['2025', '2026', '2027', '2028', '2029'],
                datasets: [{
                    label: 'Income',
                    data: yearlyIncome,
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(5, 76, 22, 1)',
                    borderWidth: 2,
                    fill: true
                }, {
                    label: 'Expenses',
                    data: 'Expenses',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(152, 22, 41, 1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    window.moneyMinderCharts.report = newChart;

    // Update report data text
    const reportData = document.getElementById('report-data');
    reportData.innerHTML = `
        <h3>${capitalizeFirstLetter(reportType)} Report</h3>
        <p>Period: ${reportPeriod || 'Current Month'}</p>
        <p>Generated on: ${formatDate(new Date().toISOString())}</p>
    `;
}

// Alert System
function showAlert(message, type = 'info') {
    const alert = document.getElementById('alert-notification');
    const alertMessage = document.getElementById('alert-message');

    alertMessage.textContent = message;

    // Set color based on type
    alert.style.backgroundColor = {
        'success': 'var(--success-color)',
        'danger': 'var(--danger-color)',
        'warning': 'var(--warning-color)',
        'info': 'var(--info-color)'
    }[type];

    // Show alert
    alert.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.classList.add('hidden');
    }, 5000);
}

// Close alert when X is clicked
document.getElementById('close-alert').addEventListener('click', () => {
    document.getElementById('alert-notification').classList.add('hidden');
});

// Helper Functions
function formatDate(dateString, yearOnly = false) {
    const date = new Date(dateString);
    if (yearOnly) {
        return date.toLocaleDateString('en-US', { year: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize report generation button
document.getElementById('generate-report').addEventListener('click', generateReport);