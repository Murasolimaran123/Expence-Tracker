(function() {
    "use strict";

    /** State */
    var STORAGE_KEY = "expense-tracker:data:v1";
    var THEME_KEY = "expense-tracker:theme";
    var BUDGET_KEY = "expense-tracker:budgets:v1";
    var USER_DATA_KEY = "expense-tracker:user-data:v1";
    var SETTINGS_KEY = "expense-tracker:settings:v1";
    var QUOTATIONS_KEY = "expense-tracker:quotations:v1";
    var INCOME_KEY = "expense-tracker:income:v1";
    var INVESTMENTS_KEY = "expense-tracker:investments:v1";
    var SAVINGS_GOALS_KEY = "expense-tracker:savings-goals:v1";
    var CUSTOM_CATEGORIES_KEY = "expense-tracker:custom-categories:v1";
    var GROUPS_KEY = "expense-tracker:groups:v1";
    var state = {
        expenses: [],
        filters: {
            search: "",
            category: "",
            fromDate: "",
            toDate: "",
            sortBy: "date-desc"
        },
        editingId: null
    };

    /** DOM */
    var el = function(id) { return document.getElementById(id); };
    var expenseForm = el("expenseForm");
    var expenseId = el("expenseId");
    var title = el("title");
    var amount = el("amount");
    var category = el("category");
    var date = el("date");
    var payment = el("payment");
    var notes = el("notes");
    var submitBtn = el("submitBtn");
    var cancelEditBtn = el("cancelEditBtn");
    var resetFormBtn = el("resetFormBtn");

    var search = el("search");
    var filterCategory = el("filterCategory");
    var fromDate = el("fromDate");
    var toDate = el("toDate");
    var sortBy = el("sortBy");
    var applyFiltersBtn = el("applyFiltersBtn");
    var clearFiltersBtn = el("clearFiltersBtn");

    var exportExcelBtn = el("exportExcelBtn");
    var exportPdfBtn = el("exportPdfBtn");
    var importInput = el("importInput");
    var clearAllBtn = el("clearAllBtn");

    var totalAmount = el("totalAmount");
    var monthAmount = el("monthAmount");
    var recordCount = el("recordCount");
    var expenseTbody = el("expenseTbody");
    var emptyState = el("emptyState");
    var yearSummary = el("yearSummary");
    var monthSummary = el("monthSummary");
    var viewTotal = el("viewTotal");

    // Export modal elements
    var exportModal = document.getElementById('exportModal');
    var closeExportModal = document.getElementById('closeExportModal');
    var exportConfirmBtn = document.getElementById('exportConfirmBtn');
    var exportCancelBtn = document.getElementById('exportCancelBtn');
    var exportYear = document.getElementById('exportYear');
    var exportMonth = document.getElementById('exportMonth');
    var exportFrom = document.getElementById('exportFrom');
    var exportTo = document.getElementById('exportTo');
    var exportRangeRadios = function(){ return Array.prototype.slice.call(document.querySelectorAll('input[name="exportRange"]')); };
    var pendingExportType = null; // 'excel' | 'pdf'

    var themeToggle = el("themeToggle");
    var clockEl = document.getElementById('clock');
    var notifyBtn = document.getElementById('notifyBtn');
    var toastEl = document.getElementById('toast');
    var installBtn = document.getElementById('installBtn');
    var deferredPrompt = null;
    // Notif modal elements
    var notifModal = document.getElementById('notifModal');
    var closeNotifModal = document.getElementById('closeNotifModal');
    var notifSaveBtn = document.getElementById('notifSaveBtn');
    var notifCancelBtn = document.getElementById('notifCancelBtn');
    var notifDaily = document.getElementById('notifDaily');
    var notifMonthly = document.getElementById('notifMonthly');
    var notifYearly = document.getElementById('notifYearly');
    var notifError = document.getElementById('notifError');
    // Budget modal elements
    var budgetBtn = document.getElementById('budgetBtn');
    var budgetModal = document.getElementById('budgetModal');
    var closeBudgetModal = document.getElementById('closeBudgetModal');
    var budgetSaveBtn = document.getElementById('budgetSaveBtn');
    var budgetCancelBtn = document.getElementById('budgetCancelBtn');
    var budgetCategoryGrid = document.getElementById('budgetCategoryGrid');
    var budgetProgressList = document.getElementById('budgetProgressList');
    var totalBudgetAmount = document.getElementById('totalBudgetAmount');
    var totalSpentAmount = document.getElementById('totalSpentAmount');
    var remainingAmount = document.getElementById('remainingAmount');
    // Profile modal elements
    var profileBtn = document.getElementById('profileBtn');
    var profileModal = document.getElementById('profileModal');
    var closeProfileModal = document.getElementById('closeProfileModal');
    var profileCloseBtn = document.getElementById('profileCloseBtn');
    var profileThemeToggle = document.getElementById('profileThemeToggle');
    var profileNotifyBtn = document.getElementById('profileNotifyBtn');
    // User info elements
    var profilePhotoImg = document.getElementById('profilePhotoImg');
    var profilePhotoInput = document.getElementById('profilePhotoInput');
    var profileFullName = document.getElementById('profileFullName');
    var userFullName = document.getElementById('userFullName');
    var userEmail = document.getElementById('userEmail');
    var userPhone = document.getElementById('userPhone');
    var userDOB = document.getElementById('userDOB');
    var userGender = document.getElementById('userGender');
    var userAge = document.getElementById('userAge');
    var profileDisplayName = document.getElementById('profileDisplayName');
    var profileDisplayEmail = document.getElementById('profileDisplayEmail');
    var profileDisplayPhone = document.getElementById('profileDisplayPhone');
    var profileDisplayGender = document.getElementById('profileDisplayGender');
    var profileDisplayAge = document.getElementById('profileDisplayAge');
    var profileDisplayDateJoined = document.getElementById('profileDisplayDateJoined');
    var profileDisplayLastLogin = document.getElementById('profileDisplayLastLogin');
    var editUserInfoBtn = document.getElementById('editUserInfoBtn');
    var saveUserInfoBtn = document.getElementById('saveUserInfoBtn');
    var addUserInfoBtn = document.getElementById('addUserInfoBtn');
    var cancelUserInfoBtn = document.getElementById('cancelUserInfoBtn');
    var emailError = document.getElementById('emailError');
    var phoneError = document.getElementById('phoneError');
    var currencyType = document.getElementById('currencyType');
    var monthlyBudgetLimit = document.getElementById('monthlyBudgetLimit');
    var savingsGoal = document.getElementById('savingsGoal');
    var monthlyBudgetDisplay = document.getElementById('monthlyBudgetDisplay');
    var monthlyBudgetRemaining = document.getElementById('monthlyBudgetRemaining');
    // Quotation elements
    var quotationBtn = document.getElementById('quotationBtn');
    var quotationModal = document.getElementById('quotationModal');
    var closeQuotationModal = document.getElementById('closeQuotationModal');
    var quotationCloseBtn = document.getElementById('quotationCloseBtn');
    var quotationTabs = document.querySelectorAll('.quotation-tab');
    var quotationListTab = document.getElementById('quotationListTab');
    var quotationCreateTab = document.getElementById('quotationCreateTab');
    var quotationSearchTab = document.getElementById('quotationSearchTab');
    var createNewQuoteBtn = document.getElementById('createNewQuoteBtn');
    var quotationList = document.getElementById('quotationList');
    var quoteSearchInput = document.getElementById('quoteSearchInput');
    var quoteEditId = document.getElementById('quoteEditId');
    var quoteId = document.getElementById('quoteId');
    var regenerateQuoteIdBtn = document.getElementById('regenerateQuoteIdBtn');
    var quoteDate = document.getElementById('quoteDate');
    var quoteClientName = document.getElementById('quoteClientName');
    var quoteEmail = document.getElementById('quoteEmail');
    var quotePhone = document.getElementById('quotePhone');
    var quoteAddress = document.getElementById('quoteAddress');
    var quoteItemsList = document.getElementById('quoteItemsList');
    var addQuoteItemBtn = document.getElementById('addQuoteItemBtn');
    var quoteSubtotal = document.getElementById('quoteSubtotal');
    var quoteTax = document.getElementById('quoteTax');
    var quoteDiscount = document.getElementById('quoteDiscount');
    var quoteTotal = document.getElementById('quoteTotal');
    var quotePaymentMethod = document.getElementById('quotePaymentMethod');
    var quoteValidityDate = document.getElementById('quoteValidityDate');
    var quoteStatus = document.getElementById('quoteStatus');
    var quoteNotes = document.getElementById('quoteNotes');
    var saveQuoteBtn = document.getElementById('saveQuoteBtn');
    var previewQuoteBtn = document.getElementById('previewQuoteBtn');
    var downloadQuotePdfBtn = document.getElementById('downloadQuotePdfBtn');
    var sendQuoteEmailBtn = document.getElementById('sendQuoteEmailBtn');
    var deleteQuoteBtn = document.getElementById('deleteQuoteBtn');
    var clearQuoteFormBtn = document.getElementById('clearQuoteFormBtn');
    var quoteSearchFrom = document.getElementById('quoteSearchFrom');
    var quoteSearchTo = document.getElementById('quoteSearchTo');
    var quoteSearchClient = document.getElementById('quoteSearchClient');
    var applyQuoteSearchBtn = document.getElementById('applyQuoteSearchBtn');
    var clearQuoteSearchBtn = document.getElementById('clearQuoteSearchBtn');
    var quoteSearchResults = document.getElementById('quoteSearchResults');
    
    // Dashboard elements
    var dashboardBtn = document.getElementById('dashboardBtn');
    var dashboardModal = document.getElementById('dashboardModal');
    var closeDashboardModal = document.getElementById('closeDashboardModal');
    var dashboardCloseBtn = document.getElementById('dashboardCloseBtn');
    var todayExpense = document.getElementById('todayExpense');
    var balanceLeft = document.getElementById('balanceLeft');
    var monthExpense = document.getElementById('monthExpense');
    var totalIncomeWidget = document.getElementById('totalIncome');
    
    // Income elements
    var incomeBtn = document.getElementById('incomeBtn');
    var incomeModal = document.getElementById('incomeModal');
    var closeIncomeModal = document.getElementById('closeIncomeModal');
    var incomeCloseBtn = document.getElementById('incomeCloseBtn');
    var incomeSource = document.getElementById('incomeSource');
    var incomeAmount = document.getElementById('incomeAmount');
    var incomeDate = document.getElementById('incomeDate');
    var incomeType = document.getElementById('incomeType');
    var incomeNotes = document.getElementById('incomeNotes');
    var addIncomeBtn = document.getElementById('addIncomeBtn');
    var updateIncomeBtn = document.getElementById('updateIncomeBtn');
    var cancelIncomeBtn = document.getElementById('cancelIncomeBtn');
    var incomeList = document.getElementById('incomeList');
    var totalIncomeDisplay = document.getElementById('totalIncomeDisplay');
    var monthlyBudgetDisplayIncome = document.getElementById('monthlyBudgetDisplayIncome');
    var availableForBudget = document.getElementById('availableForBudget');
    
    // Investment & Savings elements
    var investmentModal = document.getElementById('investmentModal');
    var closeInvestmentModal = document.getElementById('closeInvestmentModal');
    var investmentCloseBtn = document.getElementById('investmentCloseBtn');
    var savingsGoalName = document.getElementById('savingsGoalName');
    var savingsTargetAmount = document.getElementById('savingsTargetAmount');
    var savingsCurrentAmount = document.getElementById('savingsCurrentAmount');
    var savingsTargetDate = document.getElementById('savingsTargetDate');
    var addSavingsGoalBtn = document.getElementById('addSavingsGoalBtn');
    var updateSavingsGoalBtn = document.getElementById('updateSavingsGoalBtn');
    var cancelSavingsGoalBtn = document.getElementById('cancelSavingsGoalBtn');
    var savingsGoalsList = document.getElementById('savingsGoalsList');
    var investmentName = document.getElementById('investmentName');
    var investmentInitial = document.getElementById('investmentInitial');
    var investmentCurrent = document.getElementById('investmentCurrent');
    var investmentReturn = document.getElementById('investmentReturn');
    var addInvestmentBtn = document.getElementById('addInvestmentBtn');
    var updateInvestmentBtn = document.getElementById('updateInvestmentBtn');
    var cancelInvestmentBtn = document.getElementById('cancelInvestmentBtn');
    var investmentsList = document.getElementById('investmentsList');
    
    // Category customization elements
    var categoryModal = document.getElementById('categoryModal');
    var closeCategoryModal = document.getElementById('closeCategoryModal');
    var categoryCloseBtn = document.getElementById('categoryCloseBtn');
    var customCategoryName = document.getElementById('customCategoryName');
    var customCategoryIcon = document.getElementById('customCategoryIcon');
    var customCategoryColor = document.getElementById('customCategoryColor');
    var customCategoryBudget = document.getElementById('customCategoryBudget');
    var addCustomCategoryBtn = document.getElementById('addCustomCategoryBtn');
    var updateCustomCategoryBtn = document.getElementById('updateCustomCategoryBtn');
    var cancelCustomCategoryBtn = document.getElementById('cancelCustomCategoryBtn');
    var customCategoriesList = document.getElementById('customCategoriesList');
    
    // Group expenses elements
    var groupExpenseModal = document.getElementById('groupExpenseModal');
    var closeGroupExpenseModal = document.getElementById('closeGroupExpenseModal');
    var groupExpenseCloseBtn = document.getElementById('groupExpenseCloseBtn');
    var groupName = document.getElementById('groupName');
    var groupMemberName = document.getElementById('groupMemberName');
    var addGroupMemberBtn = document.getElementById('addGroupMemberBtn');
    var groupMembersList = document.getElementById('groupMembersList');
    var createGroupBtn = document.getElementById('createGroupBtn');
    var groupsList = document.getElementById('groupsList');
    
    // Modal open buttons
    var openInvestmentModalBtn = document.getElementById('openInvestmentModalBtn');
    var openCategoryModalBtn = document.getElementById('openCategoryModalBtn');
    var openGroupExpenseModalBtn = document.getElementById('openGroupExpenseModalBtn');
    
    // Chart instances
    var categoryPieChart = null;
    var trendsLineChart = null;
    var topCategoriesBarChart = null;
    var incomeVsExpenseChart = null;

    /** Utils */
    function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
    function toNumber(n) { return Number(parseFloat(n || 0).toFixed(2)); }
    function parseDate(d) { return new Date(d + "T00:00:00"); }
    function formatCurrency(n) {
        var settings = loadSettings();
        var currency = settings.currency || 'USD';
        var amount = toNumber(n);
        try {
            return amount.toLocaleString(undefined, { style: 'currency', currency: currency });
        } catch (_) {
            var symbols = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };
            return (symbols[currency] || currency) + ' ' + amount.toLocaleString();
        }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.expenses));
    }

    function load() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try { return JSON.parse(raw) || []; } catch (_) { return []; }
    }

    function setTheme(theme) {
        if (theme === "light") document.documentElement.classList.add("light");
        else document.documentElement.classList.remove("light");
        localStorage.setItem(THEME_KEY, theme);
        var icon = theme === "light" ? "🌞" : "🌙";
        if (themeToggle) themeToggle.textContent = icon;
        if (profileThemeToggle) profileThemeToggle.textContent = icon;
    }

    function toggleTheme() {
        var isLight = document.documentElement.classList.contains("light");
        setTheme(isLight ? "dark" : "light");
    }

    function updateClock() {
        if (!clockEl) return;
        try {
            var now = new Date();
            var dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
            var timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            clockEl.textContent = '| '+ dateStr + ' | ' + timeStr +' |';
        } catch (_) {
            clockEl.textContent = new Date().toISOString();
        }
    }

    /** Rendering */
    function render() {
        var filtered = applyFilters(state.expenses, state.filters);
        var sorted = applySorting(filtered, state.filters.sortBy);

        expenseTbody.innerHTML = "";
        if (sorted.length === 0) {
            emptyState.classList.remove("hidden");
        } else {
            emptyState.classList.add("hidden");
        }

        sorted.forEach(function(exp) {
            var tr = document.createElement("tr");
            tr.innerHTML = [
                '<td>' + escapeHtml(exp.title) + '</td>',
                '<td><span class="pill">' + escapeHtml(exp.category) + '</span></td>',
                '<td class="num">' + formatCurrency(exp.amount) + '</td>',
                '<td>' + escapeHtml(exp.date) + '</td>',
                '<td>' + escapeHtml(exp.payment) + '</td>',
                '<td>' + escapeHtml(exp.notes || "") + '</td>',
                '<td class="actions-col">' +
                    '<div class="row-actions">' +
                        '<button class="btn btn-outline" data-action="edit" data-id="' + exp.id + '">Edit</button>' +
                        '<button class="btn btn-danger" data-action="delete" data-id="' + exp.id + '">Delete</button>' +
                    '</div>' +
                '</td>'
            ].join("");
            expenseTbody.appendChild(tr);
        });

        // Total for the currently shown rows
        if (viewTotal) {
            var sumShown = sorted.reduce(function(s, e) { return s + toNumber(e.amount); }, 0);
            viewTotal.textContent = formatCurrency(sumShown);
        }

        var totals = computeTotals(state.expenses);
        totalAmount.textContent = formatCurrency(totals.totalAll);
        monthAmount.textContent = formatCurrency(totals.totalThisMonth);
        recordCount.textContent = String(state.expenses.length);

        // Year-wise and Month-per-Year summaries (based on all expenses)
        renderYearSummary(state.expenses);
        renderMonthSummary(state.expenses);
        
        // Update monthly budget display
        updateMonthlyBudgetDisplay();
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function applyFilters(list, filters) {
        return list.filter(function(exp) {
            if (filters.search) {
                var s = filters.search.toLowerCase();
                var hay = (exp.title + " " + (exp.notes || "")).toLowerCase();
                if (hay.indexOf(s) === -1) return false;
            }
            if (filters.category && exp.category !== filters.category) return false;
            if (filters.fromDate && parseDate(exp.date) < parseDate(filters.fromDate)) return false;
            if (filters.toDate && parseDate(exp.date) > parseDate(filters.toDate)) return false;
            return true;
        });
    }

    function applySorting(list, sortBy) {
        var arr = list.slice();
        if (sortBy === "date-desc") arr.sort(function(a,b){ return parseDate(b.date) - parseDate(a.date); });
        else if (sortBy === "date-asc") arr.sort(function(a,b){ return parseDate(a.date) - parseDate(b.date); });
        else if (sortBy === "amount-desc") arr.sort(function(a,b){ return b.amount - a.amount; });
        else if (sortBy === "amount-asc") arr.sort(function(a,b){ return a.amount - b.amount; });
        return arr;
    }

    function computeTotals(list) {
        var sum = 0;
        var monthSum = 0;
        var now = new Date();
        var y = now.getFullYear();
        var m = now.getMonth();
        list.forEach(function(exp) {
            sum += toNumber(exp.amount);
            var d = parseDate(exp.date);
            if (d.getFullYear() === y && d.getMonth() === m) {
                monthSum += toNumber(exp.amount);
            }
        });
        return { totalAll: toNumber(sum), totalThisMonth: toNumber(monthSum) };
    }

    function computeYearlyTotals(list) {
        var byYear = {};
        list.forEach(function(exp){
            var d = parseDate(exp.date);
            var y = d.getFullYear();
            byYear[y] = (byYear[y] || 0) + toNumber(exp.amount);
        });
        var items = Object.keys(byYear).map(function(y){
            return { year: Number(y), amount: toNumber(byYear[y]) };
        });
        // Sort by amount DESC, tie-break by year DESC
        items.sort(function(a,b){ if (b.amount !== a.amount) return b.amount - a.amount; return b.year - a.year; });
        return items;
    }

    function renderYearSummary(list) {
        if (!yearSummary) return;
        var items = computeYearlyTotals(list);
        yearSummary.innerHTML = "";
        if (items.length === 0) return;
        items.forEach(function(item){
            var div = document.createElement('div');
            div.className = 'year-card';
            div.innerHTML = '<span class="year">' + item.year + '</span>' +
                            '<span class="amount">' + escapeHtml(formatCurrency(item.amount)) + '</span>';
            yearSummary.appendChild(div);
        });
    }

    function monthIndexToShortName(idx) {
        return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][idx] || '';
    }

    function computeMonthlyTotalsByYear(list) {
        var byYearMonth = {};
        list.forEach(function(exp){
            var d = parseDate(exp.date);
            var y = d.getFullYear();
            var m = d.getMonth();
            var key = y + '-' + m;
            byYearMonth[key] = (byYearMonth[key] || 0) + toNumber(exp.amount);
        });
        var byYear = {};
        Object.keys(byYearMonth).forEach(function(key){
            var parts = key.split('-');
            var y = Number(parts[0]);
            var m = Number(parts[1]);
            if (!byYear[y]) byYear[y] = [];
            byYear[y].push({ month: m, label: monthIndexToShortName(m), amount: toNumber(byYearMonth[key]) });
        });
        // Build result: sort months by amount DESC; then order years by sum DESC
        var result = Object.keys(byYear).map(function(y){
            var months = byYear[y].slice();
            months.sort(function(a,b){ if (b.amount !== a.amount) return b.amount - a.amount; return a.month - b.month; });
            var total = months.reduce(function(s,x){ return s + x.amount; }, 0);
            return { year: Number(y), total: toNumber(total), months: months };
        });
        result.sort(function(a,b){ if (b.total !== a.total) return b.total - a.total; return b.year - a.year; });
        return result;
    }

    function renderMonthSummary(list) {
        if (!monthSummary) return;
        var items = computeMonthlyTotalsByYear(list);
        monthSummary.innerHTML = '';
        if (items.length === 0) return;
        items.forEach(function(entry){
            var wrap = document.createElement('div');
            wrap.className = 'month-year-card';
            var header = document.createElement('div');
            header.className = 'month-year-header';
            header.innerHTML = '<span class="year">' + entry.year + '</span>' +
                               '<span class="amount">' + escapeHtml(formatCurrency(entry.total)) + '</span>';
            var listDiv = document.createElement('div');
            listDiv.className = 'month-list';
            entry.months.forEach(function(m){
                var item = document.createElement('div');
                item.className = 'month-item';
                item.innerHTML = '<span class="label">' + m.label + '</span>' +
                                 '<span class="amount">' + escapeHtml(formatCurrency(m.amount)) + '</span>';
                listDiv.appendChild(item);
            });
            wrap.appendChild(header);
            wrap.appendChild(listDiv);
            monthSummary.appendChild(wrap);
        });
    }

    /** Actions */
    function addExpense(data) {
        var exp = {
            id: uid(),
            title: data.title.trim(),
            amount: toNumber(data.amount),
            category: data.category,
            date: data.date,
            payment: data.payment,
            notes: data.notes ? data.notes.trim() : ""
        };
        state.expenses.push(exp);
        save();
        render();
    }

    function updateExpense(id, updates) {
        var idx = state.expenses.findIndex(function(e) { return e.id === id; });
        if (idx === -1) return;
        var current = state.expenses[idx];
        state.expenses[idx] = Object.assign({}, current, updates);
        save();
        render();
    }

    function deleteExpense(id) {
        state.expenses = state.expenses.filter(function(e) { return e.id !== id; });
        save();
        render();
    }

    function clearAll() {
        if (!confirm("Delete all expenses? This cannot be undone.")) return;
        state.expenses = [];
        save();
        render();
    }

    /** Validation */
    function clearErrors() {
        ["title","amount","category","date","payment"].forEach(function(name){
            var err = document.querySelector('[data-error-for="' + name + '"]');
            if (err) err.textContent = "";
        });
    }

    function setError(name, message) {
        var err = document.querySelector('[data-error-for="' + name + '"]');
        if (err) err.textContent = message || "";
    }

    function validateForm() {
        clearErrors();
        var valid = true;
        if (!title.value.trim()) { setError("title", "Required"); valid = false; }
        var amt = parseFloat(amount.value);
        if (!(amt >= 0)) { setError("amount", "Enter a valid amount"); valid = false; }
        if (!category.value) { setError("category", "Required"); valid = false; }
        if (!date.value) { setError("date", "Required"); valid = false; }
        if (!payment.value) { setError("payment", "Required"); valid = false; }
        return valid;
    }

    function readForm() {
        return {
            id: expenseId.value || null,
            title: title.value,
            amount: amount.value,
            category: category.value,
            date: date.value,
            payment: payment.value,
            notes: notes.value
        };
    }

    function resetForm(preserveDate) {
        expenseId.value = "";
        title.value = "";
        amount.value = "";
        category.value = "";
        if (!preserveDate) date.value = "";
        payment.value = "";
        notes.value = "";
        state.editingId = null;
        submitBtn.textContent = "Add Expense";
        cancelEditBtn.hidden = true;
        clearErrors();
    }

    function startEdit(exp) {
        expenseId.value = exp.id;
        title.value = exp.title;
        amount.value = String(exp.amount);
        category.value = exp.category;
        date.value = exp.date;
        payment.value = exp.payment;
        notes.value = exp.notes || "";
        state.editingId = exp.id;
        submitBtn.textContent = "Update Expense";
        cancelEditBtn.hidden = false;
        title.focus();
    }

    /** Filters & Sorting Inputs */
    function syncFilterInputsToState() {
        state.filters.search = search.value.trim();
        state.filters.category = filterCategory.value;
        state.filters.fromDate = fromDate.value;
        state.filters.toDate = toDate.value;
        state.filters.sortBy = sortBy.value;
    }

    function clearFilters() {
        search.value = "";
        filterCategory.value = "";
        fromDate.value = "";
        toDate.value = "";
        sortBy.value = "date-desc";
        syncFilterInputsToState();
        render();
    }

    /** Export / Import */
    function getCurrentView() {
        var filtered = applyFilters(state.expenses, state.filters);
        return applySorting(filtered, state.filters.sortBy);
    }

    function exportExcelCSV() {
        var rows = getExportRows();
        var headers = ["Title","Category","Amount","Date","Payment","Notes"];
        function esc(v){
            var s = String(v == null ? "" : v);
            if (s.includes('"') || s.includes(',') || s.includes('\n')) {
                return '"' + s.replace(/"/g,'""') + '"';
            }
            return s;
        }
        var lines = [];
        lines.push(headers.join(','));
        rows.forEach(function(r){
            lines.push([
                esc(r.title),
                esc(r.category),
                esc(toNumber(r.amount)),
                esc(r.date),
                esc(r.payment),
                esc(r.notes || "")
            ].join(','));
        });
        var csv = lines.join('\n');
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv';
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 0);
    }

    function exportPDF() {
        var rows = getExportRows();
        var totals = computeTotals(state.expenses);
        var html = '' +
            '<!DOCTYPE html><html><head><meta charset="utf-8">' +
            '<title>Expenses</title>' +
            '<style>' +
            'body{font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#111}' +
            'h1{font-size:18px;margin:0 0 12px 0}' +
            'table{width:100%;border-collapse:collapse;font-size:12px}' +
            'th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}' +
            'th{background:#f3f4f6}' +
            '.num{text-align:right}' +
            '.summary{margin:12px 0 16px 0;font-weight:600}' +
            '@media print{@page{size:auto;margin:12mm}}' +
            '</style></head><body>' +
            '<h1>Expenses</h1>' +
            '<div class="summary">Total: ' + escapeHtml(toNumber(totals.totalAll)) + ' | Records: ' + rows.length + '</div>' +
            '<table><thead><tr>' +
            '<th>Title</th><th>Category</th><th>Amount</th><th>Date</th><th>Payment</th><th>Notes</th>' +
            '</tr></thead><tbody>';
        rows.forEach(function(r){
            html += '<tr>' +
                '<td>' + escapeHtml(r.title) + '</td>' +
                '<td>' + escapeHtml(r.category) + '</td>' +
                '<td class="num">' + escapeHtml(String(toNumber(r.amount))) + '</td>' +
                '<td>' + escapeHtml(r.date) + '</td>' +
                '<td>' + escapeHtml(r.payment) + '</td>' +
                '<td>' + escapeHtml(r.notes || '') + '</td>' +
            '</tr>';
        });
        html += '</tbody></table>' +
            '</body></html>';
        var w = window.open('', '_blank');
        if (!w) { alert('Popup blocked. Please allow popups to export PDF.'); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
    }

    function openExportModal(type) {
        pendingExportType = type; // 'excel' or 'pdf'
        exportModal.classList.remove('hidden');
        // Default to All
        exportRangeRadios().forEach(function(r){ r.checked = r.value === 'all'; });
        exportYear.value = '';
        exportMonth.value = '';
        exportFrom.value = '';
        exportTo.value = '';
    }

    function closeExport() {
        exportModal.classList.add('hidden');
        pendingExportType = null;
    }

    function getExportRows() {
        // Build date bounds based on selection
        var selected = exportRangeRadios().find(function(r){ return r.checked; });
        var mode = selected ? selected.value : 'all';
        var from = null, to = null; // inclusive bounds
        if (mode === 'year') {
            var y = parseInt(exportYear.value, 10);
            if (!y) { alert('Please enter a valid year.'); return []; }
            from = new Date(y, 0, 1);
            to = new Date(y, 11, 31);
        } else if (mode === 'month') {
            var ym = parseInt(exportYear.value, 10);
            var m = exportMonth.value === '' ? NaN : parseInt(exportMonth.value, 10);
            if (!ym || !(m >= 0 && m <= 11)) { alert('Please select year and month.'); return []; }
            from = new Date(ym, m, 1);
            to = new Date(ym, m + 1, 0);
        } else if (mode === 'custom') {
            if (!exportFrom.value || !exportTo.value) { alert('Please select From and To dates.'); return []; }
            from = new Date(exportFrom.value + 'T00:00:00');
            to = new Date(exportTo.value + 'T23:59:59');
            if (to < from) { alert('To date must be after From date.'); return []; }
        }

        var base = state.expenses.slice();
        var filtered = base.filter(function(e){
            if (!from && !to) return true; // all
            var d = parseDate(e.date);
            if (from && d < from) return false;
            if (to && d > to) return false;
            return true;
        });
        // Apply current sort selection
        return applySorting(filtered, state.filters.sortBy);
    }

    function importData(file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var parsed = JSON.parse(String(e.target.result));
                if (!Array.isArray(parsed)) throw new Error("Invalid file");
                var cleaned = parsed.map(function(x){
                    return {
                        id: x.id || uid(),
                        title: String(x.title || "Untitled"),
                        amount: toNumber(x.amount || 0),
                        category: String(x.category || "Other"),
                        date: String(x.date || new Date().toISOString().slice(0,10)),
                        payment: String(x.payment || "Cash"),
                        notes: x.notes ? String(x.notes) : ""
                    };
                });
                state.expenses = cleaned;
                save();
                render();
            } catch (err) {
                alert("Failed to import: " + err.message);
            }
        };
        reader.readAsText(file);
    }

    /** Budget Management */
    var CATEGORIES = ['Food', 'Transport', 'Groceries', 'Entertainment', 'Health', 'Bills', 'Shopping', 'Other'];
    
    function loadBudgets() {
        try {
            var raw = localStorage.getItem(BUDGET_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (_) { return {}; }
    }
    
    function saveBudgets(budgets) {
        try {
            localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
        } catch (_) {}
    }
    
    function getCategorySpending(category, year, month) {
        var sum = 0;
        state.expenses.forEach(function(exp) {
            var d = parseDate(exp.date);
            if (exp.category === category && d.getFullYear() === year && d.getMonth() === month) {
                sum += toNumber(exp.amount);
            }
        });
        return toNumber(sum);
    }
    
    function getCurrentMonthSpending() {
        var now = new Date();
        var y = now.getFullYear();
        var m = now.getMonth();
        var sum = 0;
        state.expenses.forEach(function(exp) {
            var d = parseDate(exp.date);
            if (d.getFullYear() === y && d.getMonth() === m) {
                sum += toNumber(exp.amount);
            }
        });
        return toNumber(sum);
    }
    
    function renderBudgetUI() {
        if (!budgetCategoryGrid || !budgetProgressList) return;
        var budgets = loadBudgets();
        var now = new Date();
        var currentYear = now.getFullYear();
        var currentMonth = now.getMonth();
        
        // Render category budget inputs
        budgetCategoryGrid.innerHTML = '';
        CATEGORIES.forEach(function(cat) {
            var div = document.createElement('div');
            div.className = 'budget-category-item';
            var inputId = 'budget-' + cat.toLowerCase().replace(/\s+/g, '-');
            var input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.step = '0.01';
            input.id = inputId;
            input.value = budgets[cat] || '';
            input.placeholder = '0.00';
            var label = document.createElement('label');
            label.htmlFor = inputId;
            label.textContent = cat;
            div.appendChild(label);
            div.appendChild(input);
            budgetCategoryGrid.appendChild(div);
        });
        
        // Render progress bars
        budgetProgressList.innerHTML = '';
        var totalBudget = 0;
        CATEGORIES.forEach(function(cat) {
            var budget = toNumber(budgets[cat] || 0);
            if (budget > 0) {
                totalBudget += budget;
                var spent = getCategorySpending(cat, currentYear, currentMonth);
                var percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
                var item = document.createElement('div');
                item.className = 'budget-progress-item';
                var header = document.createElement('div');
                header.className = 'budget-progress-header';
                header.innerHTML = '<span>' + escapeHtml(cat) + '</span><span>' + escapeHtml(formatCurrency(spent)) + ' / ' + escapeHtml(formatCurrency(budget)) + '</span>';
                var barWrapper = document.createElement('div');
                barWrapper.className = 'budget-progress-bar';
                var fill = document.createElement('div');
                fill.className = 'budget-progress-fill';
                if (percent >= 100) fill.classList.add('danger');
                else if (percent >= 80) fill.classList.add('warning');
                fill.style.width = Math.min(100, percent) + '%';
                barWrapper.appendChild(fill);
                item.appendChild(header);
                item.appendChild(barWrapper);
                budgetProgressList.appendChild(item);
            }
        });
        
        // Update summary
        if (totalBudgetAmount) totalBudgetAmount.textContent = formatCurrency(totalBudget);
        var totalSpent = getCurrentMonthSpending();
        if (totalSpentAmount) totalSpentAmount.textContent = formatCurrency(totalSpent);
        var remaining = toNumber(totalBudget - totalSpent);
        if (remainingAmount) {
            remainingAmount.textContent = formatCurrency(remaining);
            remainingAmount.style.color = remaining < 0 ? 'var(--danger)' : (remaining < totalBudget * 0.1 ? '#f59e0b' : 'var(--text)');
        }
    }
    
    function openBudgetModal() {
        if (!budgetModal) return;
        renderBudgetUI();
        budgetModal.classList.remove('hidden');
    }
    
    function closeBudget() {
        if (budgetModal) budgetModal.classList.add('hidden');
    }
    
    function saveBudgetSettings() {
        var budgets = {};
        CATEGORIES.forEach(function(cat) {
            var inputId = 'budget-' + cat.toLowerCase().replace(/\s+/g, '-');
            var input = document.getElementById(inputId);
            if (input && input.value) {
                var val = parseFloat(input.value);
                if (val > 0) budgets[cat] = toNumber(val);
            }
        });
        saveBudgets(budgets);
        renderBudgetUI();
    }

    /** User Data Management */
    function loadUserData() {
        try {
            var raw = localStorage.getItem(USER_DATA_KEY);
            if (!raw) {
                // Initialize with default values
                var defaultData = {
                    fullName: '',
                    email: '',
                    phone: '',
                    dob: '',
                    gender: '',
                    dateJoined: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    profilePhoto: null
                };
                saveUserData(defaultData);
                return defaultData;
            }
            return JSON.parse(raw);
        } catch (_) {
            return {
                fullName: '',
                email: '',
                phone: '',
                dob: '',
                gender: '',
                dateJoined: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                profilePhoto: null
            };
        }
    }
    
    function saveUserData(userData) {
        try {
            userData.lastLogin = new Date().toISOString();
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        } catch (_) {}
    }
    
    function loadSettings() {
        try {
            var raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) {
                var defaults = {
                    currency: 'USD',
                    monthlyBudgetLimit: 0,
                    savingsGoal: 0
                };
                saveSettings(defaults);
                return defaults;
            }
            return JSON.parse(raw);
        } catch (_) {
            return { currency: 'USD', monthlyBudgetLimit: 0, savingsGoal: 0 };
        }
    }
    
    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (_) {}
    }
    
    function calculateAge(dob) {
        if (!dob) return null;
        var birth = new Date(dob);
        var today = new Date();
        var age = today.getFullYear() - birth.getFullYear();
        var monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    
    function validateEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        var re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
    
    function updateProfilePhoto(file) {
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            var userData = loadUserData();
            userData.profilePhoto = e.target.result;
            saveUserData(userData);
            if (profilePhotoImg) {
                profilePhotoImg.src = e.target.result;
            }
            // Update profile icon in nav bar
            updateProfileIcon();
            // Refresh user info display
            renderUserInfo();
        };
        reader.readAsDataURL(file);
    }
    
    function updateProfileIcon() {
        var userData = loadUserData();
        if (profileBtn) {
            if (userData.profilePhoto) {
                // Update button to show photo
                profileBtn.innerHTML = '<img src="' + userData.profilePhoto + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
            } else {
                // Keep default emoji
                profileBtn.innerHTML = '👤';
            }
        }
    }
    
    function renderUserInfo() {
        var userData = loadUserData();
        var settings = loadSettings();
        
        // Update profile name input
        if (profileFullName) profileFullName.value = userData.fullName || '';
        
        // Update user info inputs
        if (userFullName) userFullName.value = userData.fullName || '';
        if (userEmail) userEmail.value = userData.email || '';
        if (userPhone) userPhone.value = userData.phone || '';
        if (userDOB) userDOB.value = userData.dob || '';
        if (userGender) userGender.value = userData.gender || '';
        
        // Calculate and display age
        var age = calculateAge(userData.dob);
        var ageText = age !== null ? age + ' years' : '-';
        if (userAge) userAge.textContent = 'Age: ' + ageText;
        
        // Update profile display (right side)
        if (profileDisplayName) profileDisplayName.textContent = userData.fullName || '-';
        if (profileDisplayEmail) profileDisplayEmail.textContent = userData.email || '-';
        if (profileDisplayPhone) profileDisplayPhone.textContent = userData.phone || '-';
        if (profileDisplayGender) profileDisplayGender.textContent = userData.gender || '-';
        if (profileDisplayAge) profileDisplayAge.textContent = ageText;
        
        // Date joined
        if (profileDisplayDateJoined) {
            if (userData.dateJoined) {
                var joined = new Date(userData.dateJoined);
                profileDisplayDateJoined.textContent = joined.toLocaleDateString() + ' ' + joined.toLocaleTimeString();
            } else {
                var now = new Date();
                profileDisplayDateJoined.textContent = now.toLocaleDateString();
            }
        }
        
        // Last login
        if (profileDisplayLastLogin) {
            if (userData.lastLogin) {
                var login = new Date(userData.lastLogin);
                profileDisplayLastLogin.textContent = login.toLocaleDateString() + ' ' + login.toLocaleTimeString();
            } else {
                profileDisplayLastLogin.textContent = '-';
            }
        }
        
        // Profile photo
        if (userData.profilePhoto && profilePhotoImg) {
            profilePhotoImg.src = userData.profilePhoto;
        }
        
        // Settings
        if (currencyType) currencyType.value = settings.currency || 'USD';
        if (monthlyBudgetLimit) monthlyBudgetLimit.value = settings.monthlyBudgetLimit || '';
        if (savingsGoal) savingsGoal.value = settings.savingsGoal || '';
        
        // Update monthly budget in summary
        updateMonthlyBudgetDisplay();
    }
    
    function updateMonthlyBudgetDisplay() {
        var settings = loadSettings();
        var budget = toNumber(settings.monthlyBudgetLimit || 0);
        var now = new Date();
        var currentMonth = now.getMonth();
        var currentYear = now.getFullYear();
        var spent = 0;
        state.expenses.forEach(function(exp) {
            var d = parseDate(exp.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                spent += toNumber(exp.amount);
            }
        });
        var remaining = toNumber(budget - spent);
        
        if (monthlyBudgetDisplay) {
            monthlyBudgetDisplay.textContent = budget > 0 ? formatCurrency(budget) : '-';
        }
        if (monthlyBudgetRemaining) {
            monthlyBudgetRemaining.textContent = budget > 0 ? formatCurrency(remaining) : '-';
            if (budget > 0) {
                monthlyBudgetRemaining.style.color = remaining < 0 ? 'var(--danger)' : (remaining < budget * 0.1 ? '#f59e0b' : 'var(--text)');
            }
        }
    }

    /** Quotation Management */
    var quoteItems = [];
    
    function loadQuotations() {
        try {
            var raw = localStorage.getItem(QUOTATIONS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) {
            return [];
        }
    }
    
    function saveQuotations(quotations) {
        try {
            localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations));
        } catch (_) {}
    }
    
    function generateQuoteId() {
        var now = new Date();
        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var quotes = loadQuotations();
        var prefix = 'Q-' + year + '-' + month + '-';
        var maxNum = 0;
        quotes.forEach(function(q) {
            if (q.quoteId && q.quoteId.startsWith(prefix)) {
                var numPart = q.quoteId.substring(prefix.length);
                var num = parseInt(numPart, 10);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        });
        var nextNum = maxNum + 1;
        return prefix + String(nextNum).padStart(3, '0');
    }
    
    function calculateQuoteTotals() {
        var subtotal = 0;
        quoteItems.forEach(function(item) {
            var qty = toNumber(item.quantity || 0);
            var price = toNumber(item.unitPrice || 0);
            subtotal += qty * price;
        });
        subtotal = toNumber(subtotal);
        
        var taxPercent = toNumber(quoteTax ? quoteTax.value : 0);
        var discountPercent = toNumber(quoteDiscount ? quoteDiscount.value : 0);
        
        var taxAmount = toNumber(subtotal * (taxPercent / 100));
        var discountAmount = toNumber(subtotal * (discountPercent / 100));
        var total = toNumber(subtotal + taxAmount - discountAmount);
        
        if (quoteSubtotal) quoteSubtotal.value = formatCurrency(subtotal);
        if (quoteTotal) quoteTotal.value = formatCurrency(total);
        
        return { subtotal: subtotal, tax: taxAmount, discount: discountAmount, total: total };
    }
    
    function addQuoteItem() {
        var item = {
            id: uid(),
            name: '',
            quantity: 1,
            unitPrice: 0,
            total: 0
        };
        quoteItems.push(item);
        renderQuoteItems();
    }
    
    function removeQuoteItem(itemId) {
        quoteItems = quoteItems.filter(function(item) { return item.id !== itemId; });
        renderQuoteItems();
        calculateQuoteTotals();
    }
    
    function renderQuoteItems() {
        if (!quoteItemsList) return;
        quoteItemsList.innerHTML = '';
        
        if (quoteItems.length === 0) {
            quoteItemsList.innerHTML = '<div style="padding: 12px; color: var(--muted); text-align: center;">No items added yet</div>';
            return;
        }
        
        quoteItems.forEach(function(item) {
            var div = document.createElement('div');
            div.className = 'quote-item';
            div.innerHTML = 
                '<input type="text" class="quote-item-name" placeholder="Item Name" value="' + escapeHtml(item.name) + '">' +
                '<input type="number" class="quote-item-qty" placeholder="Qty" min="0" step="0.01" value="' + item.quantity + '">' +
                '<input type="number" class="quote-item-price" placeholder="Unit Price" min="0" step="0.01" value="' + item.unitPrice + '">' +
                '<input type="text" class="quote-item-total" placeholder="Total" readonly value="' + formatCurrency(toNumber(item.quantity) * toNumber(item.unitPrice)) + '">' +
                '<button class="btn btn-danger" data-action="remove-item" data-id="' + item.id + '">✕</button>';
            quoteItemsList.appendChild(div);
        });
        
        // Add event listeners
        quoteItemsList.querySelectorAll('.quote-item-name').forEach(function(input, idx) {
            input.addEventListener('input', function() {
                quoteItems[idx].name = this.value;
            });
        });
        
        quoteItemsList.querySelectorAll('.quote-item-qty').forEach(function(input, idx) {
            input.addEventListener('input', function() {
                var qty = toNumber(this.value || 0);
                quoteItems[idx].quantity = qty;
                var price = toNumber(quoteItems[idx].unitPrice || 0);
                var total = qty * price;
                var totalInput = this.parentElement.querySelector('.quote-item-total');
                if (totalInput) totalInput.value = formatCurrency(total);
                calculateQuoteTotals();
            });
        });
        
        quoteItemsList.querySelectorAll('.quote-item-price').forEach(function(input, idx) {
            input.addEventListener('input', function() {
                var price = toNumber(this.value || 0);
                quoteItems[idx].unitPrice = price;
                var qty = toNumber(quoteItems[idx].quantity || 0);
                var total = qty * price;
                var totalInput = this.parentElement.querySelector('.quote-item-total');
                if (totalInput) totalInput.value = formatCurrency(total);
                calculateQuoteTotals();
            });
        });
        
        quoteItemsList.querySelectorAll('[data-action="remove-item"]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                removeQuoteItem(this.getAttribute('data-id'));
            });
        });
    }
    
    function clearQuoteForm() {
        quoteEditId.value = '';
        quoteItems = [];
        if (quoteId) {
            quoteId.value = generateQuoteId();
            quoteId.setAttribute('readonly', 'readonly');
        }
        if (quoteDate) {
            var today = new Date();
            quoteDate.value = today.toISOString().slice(0, 10);
        }
        if (quoteClientName) quoteClientName.value = '';
        if (quoteEmail) quoteEmail.value = '';
        if (quotePhone) quotePhone.value = '';
        if (quoteAddress) quoteAddress.value = '';
        if (quoteTax) quoteTax.value = '0';
        if (quoteDiscount) quoteDiscount.value = '0';
        if (quotePaymentMethod) quotePaymentMethod.value = 'Cash';
        if (quoteValidityDate) quoteValidityDate.value = '';
        if (quoteStatus) quoteStatus.value = 'Pending';
        if (quoteNotes) quoteNotes.value = '';
        renderQuoteItems();
        calculateQuoteTotals();
        if (deleteQuoteBtn) deleteQuoteBtn.hidden = true;
    }
    
    function saveQuotation() {
        if (!quoteId || !quoteId.value.trim()) {
            alert('Please enter Quotation ID');
            return;
        }
        if (quoteItems.length === 0) {
            alert('Please add at least one item');
            return;
        }
        
        var totals = calculateQuoteTotals();
        var quotation = {
            id: quoteEditId.value || uid(),
            quoteId: quoteId.value.trim(),
            date: quoteDate ? quoteDate.value : new Date().toISOString().slice(0, 10),
            clientName: quoteClientName ? quoteClientName.value.trim() : '',
            email: quoteEmail ? quoteEmail.value.trim() : '',
            phone: quotePhone ? quotePhone.value.trim() : '',
            address: quoteAddress ? quoteAddress.value.trim() : '',
            items: quoteItems.map(function(item) {
                return {
                    name: item.name,
                    quantity: toNumber(item.quantity),
                    unitPrice: toNumber(item.unitPrice),
                    total: toNumber(item.quantity * item.unitPrice)
                };
            }),
            subtotal: totals.subtotal,
            taxPercent: toNumber(quoteTax ? quoteTax.value : 0),
            taxAmount: totals.tax,
            discountPercent: toNumber(quoteDiscount ? quoteDiscount.value : 0),
            discountAmount: totals.discount,
            total: totals.total,
            paymentMethod: quotePaymentMethod ? quotePaymentMethod.value : 'Cash',
            validityDate: quoteValidityDate ? quoteValidityDate.value : '',
            status: quoteStatus ? quoteStatus.value : 'Pending',
            notes: quoteNotes ? quoteNotes.value.trim() : '',
            createdAt: quoteEditId.value ? (function() {
                var quotes = loadQuotations();
                var existing = quotes.find(function(q) { return q.id === quoteEditId.value; });
                return existing ? existing.createdAt : new Date().toISOString();
            })() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        var quotations = loadQuotations();
        if (quoteEditId.value) {
            var idx = quotations.findIndex(function(q) { return q.id === quoteEditId.value; });
            if (idx !== -1) quotations[idx] = quotation;
        } else {
            quotations.push(quotation);
        }
        saveQuotations(quotations);
        renderQuotationList();
        alert('Quotation saved successfully!');
        switchQuotationTab('list');
    }
    
    function deleteQuotation(id) {
        if (!confirm('Delete this quotation?')) return;
        var quotations = loadQuotations();
        quotations = quotations.filter(function(q) { return q.id !== id; });
        saveQuotations(quotations);
        renderQuotationList();
        clearQuoteForm();
        switchQuotationTab('list');
    }
    
    function editQuotation(id) {
        var quotations = loadQuotations();
        var quote = quotations.find(function(q) { return q.id === id; });
        if (!quote) return;
        
        quoteEditId.value = quote.id;
        if (quoteId) {
            quoteId.value = quote.quoteId;
            quoteId.removeAttribute('readonly');
        }
        if (quoteDate) quoteDate.value = quote.date;
        if (quoteClientName) quoteClientName.value = quote.clientName;
        if (quoteEmail) quoteEmail.value = quote.email;
        if (quotePhone) quotePhone.value = quote.phone;
        if (quoteAddress) quoteAddress.value = quote.address;
        quoteItems = quote.items.map(function(item) {
            return {
                id: uid(),
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice
            };
        });
        if (quoteTax) quoteTax.value = quote.taxPercent;
        if (quoteDiscount) quoteDiscount.value = quote.discountPercent;
        if (quotePaymentMethod) quotePaymentMethod.value = quote.paymentMethod;
        if (quoteValidityDate) quoteValidityDate.value = quote.validityDate;
        if (quoteStatus) quoteStatus.value = quote.status;
        if (quoteNotes) quoteNotes.value = quote.notes;
        if (deleteQuoteBtn) deleteQuoteBtn.hidden = false;
        
        renderQuoteItems();
        calculateQuoteTotals();
        switchQuotationTab('create');
    }
    
    function renderQuotationList(filtered, container) {
        var quotes = filtered || loadQuotations();
        var targetContainer = container || quotationList;
        if (!targetContainer) return;
        
        targetContainer.innerHTML = '';
        if (quotes.length === 0) {
            targetContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">No quotations found</div>';
            return;
        }
        
        quotes.sort(function(a, b) {
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        });
        
        quotes.forEach(function(quote) {
            var div = document.createElement('div');
            div.className = 'quotation-card';
            div.innerHTML = 
                '<div class="quote-card-header">' +
                    '<span class="quote-card-id">' + escapeHtml(quote.quoteId) + '</span>' +
                    '<span class="quote-card-status ' + escapeHtml(quote.status) + '">' + escapeHtml(quote.status) + '</span>' +
                '</div>' +
                '<div class="quote-card-info">' +
                    '<div><strong>Client:</strong> ' + escapeHtml(quote.clientName || '-') + '</div>' +
                    '<div><strong>Date:</strong> ' + escapeHtml(quote.date) + '</div>' +
                    '<div><strong>Total:</strong> ' + escapeHtml(formatCurrency(quote.total)) + '</div>' +
                    '<div><strong>Payment:</strong> ' + escapeHtml(quote.paymentMethod) + '</div>' +
                '</div>' +
                '<div class="quote-card-actions">' +
                    '<button class="btn btn-outline" data-action="view" data-id="' + quote.id + '">👁️ View</button>' +
                    '<button class="btn btn-outline" data-action="edit" data-id="' + quote.id + '">✏️ Edit</button>' +
                    '<button class="btn btn-outline" data-action="pdf" data-id="' + quote.id + '">📄 PDF</button>' +
                    '<button class="btn btn-danger" data-action="delete" data-id="' + quote.id + '">🗑️ Delete</button>' +
                '</div>';
            targetContainer.appendChild(div);
        });
        
        targetContainer.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var id = this.getAttribute('data-id');
                var action = this.getAttribute('data-action');
                if (action === 'view' || action === 'edit') {
                    editQuotation(id);
                    if (action === 'view') {
                        setTimeout(function() { previewQuotation(id); }, 100);
                    }
                } else if (action === 'pdf') {
                    generateQuotePDF(id);
                } else if (action === 'delete') {
                    deleteQuotation(id);
                }
            });
        });
    }
    
    function switchQuotationTab(tabName) {
        quotationTabs.forEach(function(tab) {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        if (quotationListTab) quotationListTab.classList.toggle('active', tabName === 'list');
        if (quotationCreateTab) quotationCreateTab.classList.toggle('active', tabName === 'create');
        if (quotationSearchTab) quotationSearchTab.classList.toggle('active', tabName === 'search');
        
        if (tabName === 'list') {
            renderQuotationList();
        } else if (tabName === 'create' && quoteId && !quoteEditId.value) {
            // Auto-generate ID when switching to create tab for new quotation
            quoteId.value = generateQuoteId();
            quoteId.setAttribute('readonly', 'readonly');
        }
    }
    
    function previewQuotation(id) {
        var quotations = loadQuotations();
        var quote = quotations.find(function(q) { return q.id === id; });
        if (!quote) return;
        
        var html = generateQuoteHTML(quote);
        var w = window.open('', '_blank');
        if (!w) { alert('Popup blocked'); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
    }
    
    function generateQuotePDF(id) {
        var quotations = loadQuotations();
        var quote = quotations.find(function(q) { return q.id === id; });
        if (!quote) return;
        
        var html = generateQuoteHTML(quote);
        var w = window.open('', '_blank');
        if (!w) { alert('Popup blocked'); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(function() { w.print(); }, 500);
    }
    
    function generateQuoteHTML(quote) {
        var userData = loadUserData();
        var settings = loadSettings();
        var currency = settings.currency || 'USD';
        
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Quotation ' + escapeHtml(quote.quoteId) + '</title>' +
            '<style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#111}' +
            'h1{color:#2563eb;border-bottom:2px solid #2563eb;padding-bottom:10px}' +
            '.header{display:flex;justify-content:space-between;margin-bottom:30px}' +
            '.client-info{background:#f3f4f6;padding:15px;border-radius:8px;margin-bottom:20px}' +
            'table{width:100%;border-collapse:collapse;margin:20px 0}' +
            'th,td{border:1px solid #ddd;padding:10px;text-align:left}' +
            'th{background:#2563eb;color:white}' +
            '.text-right{text-align:right}' +
            '.total-section{margin-top:20px;border-top:2px solid #2563eb;padding-top:15px}' +
            '.total-row{display:flex;justify-content:space-between;padding:5px 0}' +
            '.final-total{font-size:20px;font-weight:700;color:#2563eb}' +
            '.footer{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#666}' +
            '@media print{@page{size:A4;margin:15mm}}' +
            '</style></head><body>' +
            '<div class="header">' +
                '<div><h1>QUOTATION</h1><p><strong>ID:</strong> ' + escapeHtml(quote.quoteId) + '</p></div>' +
                '<div><p><strong>Date:</strong> ' + escapeHtml(quote.date) + '</p>' +
                '<p><strong>Status:</strong> ' + escapeHtml(quote.status) + '</p></div>' +
            '</div>' +
            '<div class="client-info">' +
                '<h3>Bill To:</h3>' +
                '<p><strong>' + escapeHtml(quote.clientName) + '</strong></p>' +
                (quote.email ? '<p>Email: ' + escapeHtml(quote.email) + '</p>' : '') +
                (quote.phone ? '<p>Phone: ' + escapeHtml(quote.phone) + '</p>' : '') +
                (quote.address ? '<p>' + escapeHtml(quote.address.replace(/\n/g, '<br>')) + '</p>' : '') +
            '</div>' +
            '<table><thead><tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>' +
            quote.items.map(function(item) {
                return '<tr><td>' + escapeHtml(item.name) + '</td><td>' + escapeHtml(item.quantity) + 
                       '</td><td>' + formatCurrency(item.unitPrice) + '</td><td>' + formatCurrency(item.total) + '</td></tr>';
            }).join('') +
            '</tbody></table>' +
            '<div class="total-section">' +
                '<div class="total-row"><span>Subtotal:</span><span>' + formatCurrency(quote.subtotal) + '</span></div>' +
                (quote.taxPercent > 0 ? '<div class="total-row"><span>Tax (' + quote.taxPercent + '%):</span><span>' + formatCurrency(quote.taxAmount) + '</span></div>' : '') +
                (quote.discountPercent > 0 ? '<div class="total-row"><span>Discount (' + quote.discountPercent + '%):</span><span>-' + formatCurrency(quote.discountAmount) + '</span></div>' : '') +
                '<div class="total-row final-total"><span>Total Amount:</span><span>' + formatCurrency(quote.total) + '</span></div>' +
            '</div>' +
            (quote.paymentMethod ? '<p><strong>Payment Method:</strong> ' + escapeHtml(quote.paymentMethod) + '</p>' : '') +
            (quote.validityDate ? '<p><strong>Valid Until:</strong> ' + escapeHtml(quote.validityDate) + '</p>' : '') +
            (quote.notes ? '<div class="footer"><p><strong>Notes:</strong></p><p>' + escapeHtml(quote.notes.replace(/\n/g, '<br>')) + '</p></div>' : '') +
            '</body></html>';
    }
    
    function openQuotation() {
        if (!quotationModal) return;
        clearQuoteForm();
        renderQuotationList();
        quotationModal.classList.remove('hidden');
    }
    
    function closeQuotation() {
        if (quotationModal) quotationModal.classList.add('hidden');
    }

    /** Profile Management */
    function getStorageSize() {
        try {
            var total = 0;
            for (var key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return (total / 1024).toFixed(2) + ' KB';
        } catch (_) {
            return 'Unknown';
        }
    }
    
    function getUniqueCategories() {
        var cats = {};
        state.expenses.forEach(function(exp) {
            if (exp.category) cats[exp.category] = true;
        });
        return Object.keys(cats).length;
    }
    
    function getCategoryTotals() {
        var totals = {};
        state.expenses.forEach(function(exp) {
            if (exp.category) {
                totals[exp.category] = (totals[exp.category] || 0) + toNumber(exp.amount);
            }
        });
        return totals;
    }
    
    function getFirstExpenseDate() {
        if (state.expenses.length === 0) return '-';
        var dates = state.expenses.map(function(e) { return parseDate(e.date); });
        dates.sort(function(a, b) { return a - b; });
        return dates[0].toLocaleDateString();
    }
    
    function getNotificationStatus() {
        try {
            var raw = localStorage.getItem('expense-tracker:notif-prefs:v1');
            if (!raw) return 'None';
            var prefs = JSON.parse(raw);
            var enabled = [];
            if (prefs.daily) enabled.push('Daily');
            if (prefs.monthly) enabled.push('Monthly');
            if (prefs.yearly) enabled.push('Yearly');
            return enabled.length > 0 ? enabled.join(', ') : 'None';
        } catch (_) {
            return 'None';
        }
    }
    
    function renderProfile() {
        if (!profileModal) return;
        
        // Render user information first
        renderUserInfo();
        
        var totals = computeTotals(state.expenses);
        var totalExpenses = state.expenses.length;
        var avgExpense = totalExpenses > 0 ? toNumber(totals.totalAll / totalExpenses) : 0;
        var categoriesUsed = getUniqueCategories();
        var categoryTotals = getCategoryTotals();
        
        // Update statistics
        var el = document.getElementById('profileTotalExpenses');
        if (el) el.textContent = totalExpenses;
        el = document.getElementById('profileTotalAmount');
        if (el) el.textContent = formatCurrency(totals.totalAll);
        el = document.getElementById('profileThisMonth');
        if (el) el.textContent = formatCurrency(totals.totalThisMonth);
        el = document.getElementById('profileCategories');
        if (el) el.textContent = categoriesUsed;
        el = document.getElementById('profileAverage');
        if (el) el.textContent = formatCurrency(avgExpense);
        el = document.getElementById('profileFirstDate');
        if (el) el.textContent = getFirstExpenseDate();
        
        // Update storage info
        el = document.getElementById('profileStorageUsed');
        if (el) el.textContent = getStorageSize();
        el = document.getElementById('profileLastUpdated');
        if (el) {
            var lastExp = state.expenses.length > 0 ? state.expenses[state.expenses.length - 1] : null;
            if (lastExp) {
                var d = parseDate(lastExp.date);
                el.textContent = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
            } else {
                el.textContent = 'Never';
            }
        }
        el = document.getElementById('profileTheme');
        if (el) {
            var isLight = document.documentElement.classList.contains('light');
            el.textContent = isLight ? 'Light' : 'Dark';
        }
        // Update profile theme toggle icon
        if (profileThemeToggle) {
            var isLight = document.documentElement.classList.contains('light');
            profileThemeToggle.textContent = isLight ? '🌞' : '🌙';
        }
        el = document.getElementById('profileNotifications');
        if (el) el.textContent = getNotificationStatus();
        
        // Category breakdown
        var breakdownEl = document.getElementById('profileCategoryBreakdown');
        if (breakdownEl) {
            breakdownEl.innerHTML = '';
            var sorted = Object.keys(categoryTotals).sort(function(a, b) {
                return categoryTotals[b] - categoryTotals[a];
            });
            sorted.forEach(function(cat) {
                var div = document.createElement('div');
                div.className = 'category-item';
                div.innerHTML = '<span class="category-name">' + escapeHtml(cat) + '</span>' +
                                '<span class="category-amount">' + escapeHtml(formatCurrency(categoryTotals[cat])) + '</span>';
                breakdownEl.appendChild(div);
            });
            if (sorted.length === 0) {
                breakdownEl.innerHTML = '<div style="color: var(--muted); padding: 12px;">No categories yet</div>';
            }
        }
        
        // Top 3 categories
        var topEl = document.getElementById('profileTopCategories');
        if (topEl) {
            topEl.innerHTML = '';
            var sorted = Object.keys(categoryTotals).sort(function(a, b) {
                return categoryTotals[b] - categoryTotals[a];
            }).slice(0, 3);
            sorted.forEach(function(cat, idx) {
                var div = document.createElement('div');
                div.className = 'category-item';
                div.innerHTML = '<span class="category-name">' + (idx + 1) + '. ' + escapeHtml(cat) + '</span>' +
                                '<span class="category-amount">' + escapeHtml(formatCurrency(categoryTotals[cat])) + '</span>';
                topEl.appendChild(div);
            });
            if (sorted.length === 0) {
                topEl.innerHTML = '<div style="color: var(--muted); padding: 12px;">No categories yet</div>';
            }
        }
    }
    
    function openProfile() {
        if (!profileModal) return;
        // Update last login time
        var userData = loadUserData();
        userData.lastLogin = new Date().toISOString();
        saveUserData(userData);
        renderProfile();
        profileModal.classList.remove('hidden');
    }
    
    function closeProfile() {
        if (profileModal) profileModal.classList.add('hidden');
    }

    /** Wire up events */
    expenseForm.addEventListener("submit", function(e) {
        e.preventDefault();
        if (!validateForm()) return;
        var data = readForm();
        if (state.editingId) {
            updateExpense(state.editingId, {
                title: data.title.trim(),
                amount: toNumber(data.amount),
                category: data.category,
                date: data.date,
                payment: data.payment,
                notes: data.notes.trim()
            });
            resetForm(true);
        } else {
            addExpense(data);
            resetForm(true);
        }
    });

    cancelEditBtn.addEventListener("click", function(){ resetForm(true); });
    resetFormBtn.addEventListener("click", function(){ resetForm(false); });

    applyFiltersBtn.addEventListener("click", function(){ syncFilterInputsToState(); render(); });
    clearFiltersBtn.addEventListener("click", function(){ clearFilters(); });

    [search, filterCategory, fromDate, toDate, sortBy].forEach(function(input){
        input.addEventListener("change", function(){ syncFilterInputsToState(); render(); });
        input.addEventListener("keyup", function(){ syncFilterInputsToState(); render(); });
    });

    exportExcelBtn.addEventListener("click", function(){ openExportModal('excel'); });
    exportPdfBtn.addEventListener("click", function(){ openExportModal('pdf'); });
    closeExportModal.addEventListener('click', closeExport);
    exportCancelBtn.addEventListener('click', function(e){ e.preventDefault(); closeExport(); });
    exportConfirmBtn.addEventListener('click', function(){
        if (pendingExportType === 'excel') exportExcelCSV();
        else if (pendingExportType === 'pdf') exportPDF();
        // If there was an input validation error getExportRows returns [], don't close.
        else return;
        closeExport();
    });
    importInput.addEventListener("change", function(){ if (this.files && this.files[0]) importData(this.files[0]); this.value = ""; });
    clearAllBtn.addEventListener("click", clearAll);

    expenseTbody.addEventListener("click", function(e){
        var btn = e.target.closest("button");
        if (!btn) return;
        var id = btn.getAttribute("data-id");
        var action = btn.getAttribute("data-action");
        if (action === "edit") {
            var exp = state.expenses.find(function(x){ return x.id === id; });
            if (exp) startEdit(exp);
        } else if (action === "delete") {
            if (confirm("Delete this expense?")) deleteExpense(id);
        }
    });

    // Theme toggle (if exists in header, otherwise handled in profile)
    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
    
    // Notification handlers
    if (notifCancelBtn) notifCancelBtn.addEventListener('click', function(e){ e.preventDefault(); closeNotif(); });
    if (closeNotifModal) closeNotifModal.addEventListener('click', closeNotif);
    if (notifSaveBtn) notifSaveBtn.addEventListener('click', saveNotifPrefs);
    
    // Budget event handlers
    if (budgetBtn) budgetBtn.addEventListener('click', openBudgetModal);
    if (closeBudgetModal) closeBudgetModal.addEventListener('click', closeBudget);
    if (budgetCancelBtn) budgetCancelBtn.addEventListener('click', function(e){ e.preventDefault(); closeBudget(); });
    if (budgetSaveBtn) budgetSaveBtn.addEventListener('click', function(e){ e.preventDefault(); saveBudgetSettings(); });
    
    // Profile event handlers
    if (profileBtn) profileBtn.addEventListener('click', openProfile);
    if (closeProfileModal) closeProfileModal.addEventListener('click', closeProfile);
    if (profileCloseBtn) profileCloseBtn.addEventListener('click', closeProfile);
    // Profile modal settings
    if (profileThemeToggle) profileThemeToggle.addEventListener('click', function(){
        toggleTheme();
        // Update profile display after theme change
        setTimeout(function(){
            var isLight = document.documentElement.classList.contains('light');
            var themeEl = document.getElementById('profileTheme');
            if (themeEl) themeEl.textContent = isLight ? 'Light' : 'Dark';
        }, 100);
    });
    if (profileNotifyBtn) profileNotifyBtn.addEventListener('click', function(){
        closeProfile();
        setTimeout(function(){ openNotifModal(); }, 200);
    });
    
    // User info event handlers
    // Keep name fields in sync
    if (profileFullName) profileFullName.addEventListener('input', function(){
        if (userFullName) userFullName.value = this.value;
    });
    if (userFullName) userFullName.addEventListener('input', function(){
        if (profileFullName) profileFullName.value = this.value;
    });
    
    if (profilePhotoInput) profilePhotoInput.addEventListener('change', function(e){
        if (e.target.files && e.target.files[0]) {
            updateProfilePhoto(e.target.files[0]);
        }
    });
    
    // User Information Edit/Save/Add handlers
    var isEditingUserInfo = false;
    var originalUserData = null;
    
    function enableUserInfoEditing() {
        isEditingUserInfo = true;
        if (userFullName) userFullName.removeAttribute('readonly');
        if (userEmail) userEmail.removeAttribute('readonly');
        if (userPhone) userPhone.removeAttribute('readonly');
        if (userDOB) userDOB.removeAttribute('readonly');
        if (userGender) userGender.removeAttribute('disabled');
        
        if (editUserInfoBtn) editUserInfoBtn.hidden = true;
        if (addUserInfoBtn) addUserInfoBtn.hidden = true;
        if (saveUserInfoBtn) saveUserInfoBtn.hidden = false;
        if (cancelUserInfoBtn) cancelUserInfoBtn.hidden = false;
    }
    
    function disableUserInfoEditing() {
        isEditingUserInfo = false;
        if (userFullName) userFullName.setAttribute('readonly', 'readonly');
        if (userEmail) userEmail.setAttribute('readonly', 'readonly');
        if (userPhone) userPhone.setAttribute('readonly', 'readonly');
        if (userDOB) userDOB.setAttribute('readonly', 'readonly');
        if (userGender) userGender.setAttribute('disabled', 'disabled');
        
        if (editUserInfoBtn) editUserInfoBtn.hidden = false;
        if (addUserInfoBtn) addUserInfoBtn.hidden = false;
        if (saveUserInfoBtn) saveUserInfoBtn.hidden = true;
        if (cancelUserInfoBtn) cancelUserInfoBtn.hidden = true;
        
        // Clear errors
        if (emailError) emailError.textContent = '';
        if (phoneError) phoneError.textContent = '';
    }
    
    if (editUserInfoBtn) editUserInfoBtn.addEventListener('click', function(){
        var userData = loadUserData();
        originalUserData = JSON.parse(JSON.stringify(userData)); // Deep copy
        enableUserInfoEditing();
    });
    
    if (addUserInfoBtn) addUserInfoBtn.addEventListener('click', function(){
        var userData = loadUserData();
        originalUserData = JSON.parse(JSON.stringify(userData)); // Deep copy
        enableUserInfoEditing();
        // Clear fields for new entry
        if (userFullName) userFullName.value = '';
        if (userEmail) userEmail.value = '';
        if (userPhone) userPhone.value = '';
        if (userDOB) userDOB.value = '';
        if (userGender) userGender.value = '';
    });
    
    if (saveUserInfoBtn) saveUserInfoBtn.addEventListener('click', function(){
        var userData = loadUserData();
        var isValid = true;
        
        // Validate and save
        if (userFullName && userFullName.value) {
            userData.fullName = userFullName.value.trim();
            if (profileFullName) profileFullName.value = userData.fullName;
        }
        
        if (userEmail && userEmail.value) {
            if (!validateEmail(userEmail.value)) {
                if (emailError) emailError.textContent = 'Invalid email format';
                isValid = false;
            } else {
                userData.email = userEmail.value.trim();
                if (emailError) emailError.textContent = '';
            }
        }
        
        if (userPhone && userPhone.value) {
            if (!validatePhone(userPhone.value)) {
                if (phoneError) phoneError.textContent = 'Invalid phone format';
                isValid = false;
            } else {
                userData.phone = userPhone.value.trim();
                if (phoneError) phoneError.textContent = '';
            }
        }
        
        if (userDOB) userData.dob = userDOB.value;
        if (userGender) userData.gender = userGender.value;
        
        // Set date joined if not set
        if (!userData.dateJoined) {
            userData.dateJoined = new Date().toISOString();
        }
        
        // Update last login
        userData.lastLogin = new Date().toISOString();
        
        if (isValid) {
            saveUserData(userData);
            disableUserInfoEditing();
            renderUserInfo(); // Refresh display
            updateProfileIcon();
            showToast('User information saved successfully');
        }
    });
    
    if (cancelUserInfoBtn) cancelUserInfoBtn.addEventListener('click', function(){
        if (originalUserData) {
            // Restore original values
            if (userFullName) userFullName.value = originalUserData.fullName || '';
            if (userEmail) userEmail.value = originalUserData.email || '';
            if (userPhone) userPhone.value = originalUserData.phone || '';
            if (userDOB) userDOB.value = originalUserData.dob || '';
            if (userGender) userGender.value = originalUserData.gender || '';
        }
        disableUserInfoEditing();
    });
    
    // Auto-update age on DOB change
    if (userDOB) {
        userDOB.addEventListener('change', function() {
            var age = calculateAge(this.value);
            var ageText = age !== null ? age + ' years' : '-';
            if (userAge) userAge.textContent = 'Age: ' + ageText;
            if (profileDisplayAge) profileDisplayAge.textContent = ageText;
        });
    }
    
    // Update profile name when changed
    if (profileFullName) {
        profileFullName.addEventListener('input', function() {
            var userData = loadUserData();
            userData.fullName = this.value.trim();
            saveUserData(userData);
            if (userFullName) userFullName.value = userData.fullName;
            if (profileDisplayName) profileDisplayName.textContent = userData.fullName || '-';
            updateProfileIcon();
        });
    }
    
    // Settings change handlers
    if (currencyType) currencyType.addEventListener('change', function(){
        var settings = loadSettings();
        settings.currency = this.value;
        saveSettings(settings);
        render(); // Re-render to update currency
        if (profileModal && !profileModal.classList.contains('hidden')) {
            renderProfile(); // Re-render profile
        }
    });
    
    if (monthlyBudgetLimit) monthlyBudgetLimit.addEventListener('change', function(){
        var settings = loadSettings();
        settings.monthlyBudgetLimit = toNumber(this.value || 0);
        saveSettings(settings);
        updateMonthlyBudgetDisplay();
    });
    
    if (savingsGoal) savingsGoal.addEventListener('change', function(){
        var settings = loadSettings();
        settings.savingsGoal = toNumber(this.value || 0);
        saveSettings(settings);
    });
    
    // Quotation event handlers
    if (quotationBtn) quotationBtn.addEventListener('click', openQuotation);
    if (closeQuotationModal) closeQuotationModal.addEventListener('click', closeQuotation);
    if (quotationCloseBtn) quotationCloseBtn.addEventListener('click', closeQuotation);
    
    // Tab switching
    if (quotationTabs) {
        quotationTabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                switchQuotationTab(this.getAttribute('data-tab'));
            });
        });
    }
    
    if (createNewQuoteBtn) createNewQuoteBtn.addEventListener('click', function(){
        clearQuoteForm();
        switchQuotationTab('create');
    });
    
    // Quote form handlers
    if (regenerateQuoteIdBtn) regenerateQuoteIdBtn.addEventListener('click', function(){
        if (quoteId && !quoteEditId.value) {
            quoteId.value = generateQuoteId();
        }
    });
    if (addQuoteItemBtn) addQuoteItemBtn.addEventListener('click', addQuoteItem);
    if (saveQuoteBtn) saveQuoteBtn.addEventListener('click', saveQuotation);
    if (clearQuoteFormBtn) clearQuoteFormBtn.addEventListener('click', clearQuoteForm);
    if (previewQuoteBtn) previewQuoteBtn.addEventListener('click', function(){
        if (!quoteEditId || !quoteEditId.value) {
            alert('Please save the quotation first');
            return;
        }
        previewQuotation(quoteEditId.value);
    });
    if (downloadQuotePdfBtn) downloadQuotePdfBtn.addEventListener('click', function(){
        if (!quoteEditId || !quoteEditId.value) {
            alert('Please save the quotation first');
            return;
        }
        generateQuotePDF(quoteEditId.value);
    });
    if (sendQuoteEmailBtn) sendQuoteEmailBtn.addEventListener('click', function(){
        if (!quoteEditId || !quoteEditId.value) {
            alert('Please save the quotation first');
            return;
        }
        var quotations = loadQuotations();
        var quote = quotations.find(function(q) { return q.id === quoteEditId.value; });
        if (!quote || !quote.email) {
            alert('Please add client email address');
            return;
        }
        var subject = encodeURIComponent('Quotation ' + quote.quoteId);
        var body = encodeURIComponent('Please find attached quotation ' + quote.quoteId);
        window.location.href = 'mailto:' + quote.email + '?subject=' + subject + '&body=' + body;
    });
    if (deleteQuoteBtn) deleteQuoteBtn.addEventListener('click', function(){
        if (quoteEditId && quoteEditId.value) {
            deleteQuotation(quoteEditId.value);
        }
    });
    
    // Tax and discount recalculate
    if (quoteTax) quoteTax.addEventListener('input', calculateQuoteTotals);
    if (quoteDiscount) quoteDiscount.addEventListener('input', calculateQuoteTotals);
    
    // Search functionality
    if (quoteSearchInput) quoteSearchInput.addEventListener('input', function(){
        var search = this.value.toLowerCase();
        if (!search) {
            renderQuotationList();
            return;
        }
        var quotes = loadQuotations();
        var filtered = quotes.filter(function(q) {
            return (q.quoteId && q.quoteId.toLowerCase().includes(search)) ||
                   (q.clientName && q.clientName.toLowerCase().includes(search)) ||
                   (q.date && q.date.includes(search));
        });
        renderQuotationList(filtered);
    });
    
    if (applyQuoteSearchBtn) applyQuoteSearchBtn.addEventListener('click', function(){
        var from = quoteSearchFrom ? quoteSearchFrom.value : '';
        var to = quoteSearchTo ? quoteSearchTo.value : '';
        var client = quoteSearchClient ? quoteSearchClient.value.toLowerCase() : '';
        var quotes = loadQuotations();
        var filtered = quotes.filter(function(q) {
            if (from && q.date < from) return false;
            if (to && q.date > to) return false;
            if (client && (!q.clientName || !q.clientName.toLowerCase().includes(client))) return false;
            return true;
        });
        renderQuotationList(filtered, quoteSearchResults);
    });
    
    if (clearQuoteSearchBtn) clearQuoteSearchBtn.addEventListener('click', function(){
        if (quoteSearchFrom) quoteSearchFrom.value = '';
        if (quoteSearchTo) quoteSearchTo.value = '';
        if (quoteSearchClient) quoteSearchClient.value = '';
        if (quoteSearchResults) quoteSearchResults.innerHTML = '';
    });

    /** New Features Implementation */
    
    // Income Management
    function loadIncomes() {
        try {
            var raw = localStorage.getItem(INCOME_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
    }
    
    function saveIncomes(incomes) {
        try {
            localStorage.setItem(INCOME_KEY, JSON.stringify(incomes));
        } catch (_) {}
    }
    
    function renderIncomeList() {
        if (!incomeList) return;
        var incomes = loadIncomes();
        incomeList.innerHTML = '';
        if (incomes.length === 0) {
            incomeList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">No income records yet</div>';
            return;
        }
        incomes.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        incomes.forEach(function(inc) {
            var div = document.createElement('div');
            div.className = 'income-item';
            div.innerHTML = 
                '<div class="income-item-info">' +
                    '<div class="income-item-source">' + escapeHtml(inc.source) + ' (' + escapeHtml(inc.type) + ')</div>' +
                    '<div class="income-item-details">' + escapeHtml(inc.date) + (inc.notes ? ' • ' + escapeHtml(inc.notes) : '') + '</div>' +
                '</div>' +
                '<div class="income-item-amount">' + formatCurrency(inc.amount) + '</div>' +
                '<div style="display: flex; gap: 8px;">' +
                    '<button class="btn btn-outline btn-small" data-action="edit" data-id="' + inc.id + '">✏️</button>' +
                    '<button class="btn btn-danger btn-small" data-action="delete" data-id="' + inc.id + '">🗑️</button>' +
                '</div>';
            incomeList.appendChild(div);
        });
        incomeList.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                var action = this.getAttribute('data-action');
                if (action === 'edit') editIncome(id);
                else if (action === 'delete') deleteIncome(id);
            });
        });
        updateIncomeTotals();
    }
    
    function addIncome() {
        if (!incomeSource || !incomeAmount || !incomeDate) return;
        var source = incomeSource.value.trim();
        var amount = toNumber(incomeAmount.value);
        var date = incomeDate.value;
        if (!source || !amount || !date) {
            showToast('Please fill all required fields');
            return;
        }
        var incomes = loadIncomes();
        incomes.push({
            id: uid(),
            source: source,
            amount: amount,
            date: date,
            type: incomeType ? incomeType.value : 'Other',
            notes: incomeNotes ? incomeNotes.value.trim() : '',
            createdAt: new Date().toISOString()
        });
        saveIncomes(incomes);
        clearIncomeForm();
        renderIncomeList();
        showToast('Income added successfully');
    }
    
    function editIncome(id) {
        var incomes = loadIncomes();
        var income = incomes.find(function(i) { return i.id === id; });
        if (!income) return;
        if (incomeSource) incomeSource.value = income.source;
        if (incomeAmount) incomeAmount.value = income.amount;
        if (incomeDate) incomeDate.value = income.date;
        if (incomeType) incomeType.value = income.type;
        if (incomeNotes) incomeNotes.value = income.notes || '';
        if (addIncomeBtn) addIncomeBtn.hidden = true;
        if (updateIncomeBtn) {
            updateIncomeBtn.hidden = false;
            updateIncomeBtn.setAttribute('data-id', id);
        }
        if (cancelIncomeBtn) cancelIncomeBtn.hidden = false;
    }
    
    function updateIncome() {
        if (!updateIncomeBtn) return;
        var id = updateIncomeBtn.getAttribute('data-id');
        if (!id) return;
        var incomes = loadIncomes();
        var idx = incomes.findIndex(function(i) { return i.id === id; });
        if (idx === -1) return;
        incomes[idx].source = incomeSource.value.trim();
        incomes[idx].amount = toNumber(incomeAmount.value);
        incomes[idx].date = incomeDate.value;
        incomes[idx].type = incomeType ? incomeType.value : 'Other';
        incomes[idx].notes = incomeNotes ? incomeNotes.value.trim() : '';
        incomes[idx].updatedAt = new Date().toISOString();
        saveIncomes(incomes);
        clearIncomeForm();
        renderIncomeList();
        showToast('Income updated successfully');
    }
    
    function deleteIncome(id) {
        if (!confirm('Delete this income record?')) return;
        var incomes = loadIncomes();
        incomes = incomes.filter(function(i) { return i.id !== id; });
        saveIncomes(incomes);
        renderIncomeList();
    }
    
    function clearIncomeForm() {
        if (incomeSource) incomeSource.value = '';
        if (incomeAmount) incomeAmount.value = '';
        if (incomeDate) {
            var today = new Date();
            incomeDate.value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        }
        if (incomeType) incomeType.value = 'Salary';
        if (incomeNotes) incomeNotes.value = '';
        if (addIncomeBtn) addIncomeBtn.hidden = false;
        if (updateIncomeBtn) updateIncomeBtn.hidden = true;
        if (cancelIncomeBtn) cancelIncomeBtn.hidden = true;
    }
    
    function updateIncomeTotals() {
        var incomes = loadIncomes();
        var now = new Date();
        var currentMonth = now.getMonth();
        var currentYear = now.getFullYear();
        var total = 0;
        var monthlyTotal = 0;
        incomes.forEach(function(inc) {
            total += inc.amount;
            var d = new Date(inc.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                monthlyTotal += inc.amount;
            }
        });
        if (totalIncomeDisplay) totalIncomeDisplay.textContent = formatCurrency(total);
        if (totalIncomeWidget) totalIncomeWidget.textContent = formatCurrency(total);
        var settings = loadSettings();
        var budget = toNumber(settings.monthlyBudgetLimit || 0);
        if (monthlyBudgetDisplayIncome) monthlyBudgetDisplayIncome.textContent = formatCurrency(budget);
        if (availableForBudget) {
            var available = total - budget;
            availableForBudget.textContent = formatCurrency(available);
            availableForBudget.style.color = available < 0 ? 'var(--danger)' : 'var(--text)';
        }
    }
    
    // Savings Goals
    function loadSavingsGoals() {
        try {
            var raw = localStorage.getItem(SAVINGS_GOALS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
    }
    
    function saveSavingsGoals(goals) {
        try {
            localStorage.setItem(SAVINGS_GOALS_KEY, JSON.stringify(goals));
        } catch (_) {}
    }
    
    function renderSavingsGoals() {
        if (!savingsGoalsList) return;
        var goals = loadSavingsGoals();
        savingsGoalsList.innerHTML = '';
        if (goals.length === 0) {
            savingsGoalsList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">No savings goals yet</div>';
            return;
        }
        goals.forEach(function(goal) {
            var div = document.createElement('div');
            div.className = 'savings-goal-item';
            var progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount * 100) : 0;
            div.innerHTML = 
                '<div class="goal-header">' +
                    '<span class="goal-name">' + escapeHtml(goal.name) + '</span>' +
                    '<div style="display: flex; gap: 8px;">' +
                        '<button class="btn btn-outline btn-small" data-action="edit" data-id="' + goal.id + '">✏️</button>' +
                        '<button class="btn btn-danger btn-small" data-action="delete" data-id="' + goal.id + '">🗑️</button>' +
                    '</div>' +
                '</div>' +
                '<div class="goal-progress">' +
                    '<div class="progress-bar">' +
                        '<div class="progress-fill" style="width: ' + Math.min(progress, 100) + '%"></div>' +
                    '</div>' +
                    '<div class="progress-text">' +
                        '<span>' + formatCurrency(goal.currentAmount) + ' / ' + formatCurrency(goal.targetAmount) + '</span>' +
                        '<span>' + progress.toFixed(1) + '%</span>' +
                    '</div>' +
                    (goal.targetDate ? '<div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Target: ' + goal.targetDate + '</div>' : '') +
                '</div>';
            savingsGoalsList.appendChild(div);
        });
        savingsGoalsList.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                var action = this.getAttribute('data-action');
                if (action === 'edit') editSavingsGoal(id);
                else if (action === 'delete') deleteSavingsGoal(id);
            });
        });
    }
    
    function addSavingsGoal() {
        if (!savingsGoalName || !savingsTargetAmount) return;
        var name = savingsGoalName.value.trim();
        var target = toNumber(savingsTargetAmount.value);
        if (!name || !target) {
            showToast('Please fill all required fields');
            return;
        }
        var goals = loadSavingsGoals();
        goals.push({
            id: uid(),
            name: name,
            targetAmount: target,
            currentAmount: toNumber(savingsCurrentAmount ? savingsCurrentAmount.value : 0),
            targetDate: savingsTargetDate ? savingsTargetDate.value : '',
            createdAt: new Date().toISOString()
        });
        saveSavingsGoals(goals);
        clearSavingsGoalForm();
        renderSavingsGoals();
        showToast('Savings goal added successfully');
    }
    
    function editSavingsGoal(id) {
        var goals = loadSavingsGoals();
        var goal = goals.find(function(g) { return g.id === id; });
        if (!goal) return;
        if (savingsGoalName) savingsGoalName.value = goal.name;
        if (savingsTargetAmount) savingsTargetAmount.value = goal.targetAmount;
        if (savingsCurrentAmount) savingsCurrentAmount.value = goal.currentAmount;
        if (savingsTargetDate) savingsTargetDate.value = goal.targetDate || '';
        if (addSavingsGoalBtn) addSavingsGoalBtn.hidden = true;
        if (updateSavingsGoalBtn) {
            updateSavingsGoalBtn.hidden = false;
            updateSavingsGoalBtn.setAttribute('data-id', id);
        }
        if (cancelSavingsGoalBtn) cancelSavingsGoalBtn.hidden = false;
    }
    
    function updateSavingsGoal() {
        if (!updateSavingsGoalBtn) return;
        var id = updateSavingsGoalBtn.getAttribute('data-id');
        if (!id) return;
        var goals = loadSavingsGoals();
        var idx = goals.findIndex(function(g) { return g.id === id; });
        if (idx === -1) return;
        goals[idx].name = savingsGoalName.value.trim();
        goals[idx].targetAmount = toNumber(savingsTargetAmount.value);
        goals[idx].currentAmount = toNumber(savingsCurrentAmount ? savingsCurrentAmount.value : 0);
        goals[idx].targetDate = savingsTargetDate ? savingsTargetDate.value : '';
        goals[idx].updatedAt = new Date().toISOString();
        saveSavingsGoals(goals);
        clearSavingsGoalForm();
        renderSavingsGoals();
        showToast('Savings goal updated successfully');
    }
    
    function deleteSavingsGoal(id) {
        if (!confirm('Delete this savings goal?')) return;
        var goals = loadSavingsGoals();
        goals = goals.filter(function(g) { return g.id !== id; });
        saveSavingsGoals(goals);
        renderSavingsGoals();
    }
    
    function clearSavingsGoalForm() {
        if (savingsGoalName) savingsGoalName.value = '';
        if (savingsTargetAmount) savingsTargetAmount.value = '';
        if (savingsCurrentAmount) savingsCurrentAmount.value = '';
        if (savingsTargetDate) savingsTargetDate.value = '';
        if (addSavingsGoalBtn) addSavingsGoalBtn.hidden = false;
        if (updateSavingsGoalBtn) updateSavingsGoalBtn.hidden = true;
        if (cancelSavingsGoalBtn) cancelSavingsGoalBtn.hidden = true;
    }
    
    // Investments
    function loadInvestments() {
        try {
            var raw = localStorage.getItem(INVESTMENTS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
    }
    
    function saveInvestments(investments) {
        try {
            localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investments));
        } catch (_) {}
    }
    
    function renderInvestments() {
        if (!investmentsList) return;
        var investments = loadInvestments();
        investmentsList.innerHTML = '';
        if (investments.length === 0) {
            investmentsList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">No investments yet</div>';
            return;
        }
        investments.forEach(function(inv) {
            var div = document.createElement('div');
            div.className = 'investment-item';
            var returnPercent = inv.initialAmount > 0 ? ((inv.currentValue - inv.initialAmount) / inv.initialAmount * 100) : 0;
            div.innerHTML = 
                '<div class="goal-header">' +
                    '<span class="goal-name">' + escapeHtml(inv.name) + '</span>' +
                    '<div style="display: flex; gap: 8px;">' +
                        '<button class="btn btn-outline btn-small" data-action="edit" data-id="' + inv.id + '">✏️</button>' +
                        '<button class="btn btn-danger btn-small" data-action="delete" data-id="' + inv.id + '">🗑️</button>' +
                    '</div>' +
                '</div>' +
                '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px;">' +
                    '<div><small style="color: var(--muted);">Initial</small><div>' + formatCurrency(inv.initialAmount) + '</div></div>' +
                    '<div><small style="color: var(--muted);">Current</small><div>' + formatCurrency(inv.currentValue) + '</div></div>' +
                    '<div><small style="color: var(--muted);">Return</small><div style="color: ' + (returnPercent >= 0 ? 'var(--primary)' : 'var(--danger)') + ';">' + returnPercent.toFixed(2) + '%</div></div>' +
                '</div>';
            investmentsList.appendChild(div);
        });
        investmentsList.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                var action = this.getAttribute('data-action');
                if (action === 'edit') editInvestment(id);
                else if (action === 'delete') deleteInvestment(id);
            });
        });
    }
    
    function addInvestment() {
        if (!investmentName || !investmentInitial || !investmentCurrent) return;
        var name = investmentName.value.trim();
        var initial = toNumber(investmentInitial.value);
        var current = toNumber(investmentCurrent.value);
        if (!name || !initial || !current) {
            showToast('Please fill all required fields');
            return;
        }
        var investments = loadInvestments();
        investments.push({
            id: uid(),
            name: name,
            initialAmount: initial,
            currentValue: current,
            createdAt: new Date().toISOString()
        });
        saveInvestments(investments);
        clearInvestmentForm();
        renderInvestments();
        showToast('Investment added successfully');
    }
    
    function editInvestment(id) {
        var investments = loadInvestments();
        var inv = investments.find(function(i) { return i.id === id; });
        if (!inv) return;
        if (investmentName) investmentName.value = inv.name;
        if (investmentInitial) investmentInitial.value = inv.initialAmount;
        if (investmentCurrent) investmentCurrent.value = inv.currentValue;
        updateInvestmentReturn();
        if (addInvestmentBtn) addInvestmentBtn.hidden = true;
        if (updateInvestmentBtn) {
            updateInvestmentBtn.hidden = false;
            updateInvestmentBtn.setAttribute('data-id', id);
        }
        if (cancelInvestmentBtn) cancelInvestmentBtn.hidden = false;
    }
    
    function updateInvestment() {
        if (!updateInvestmentBtn) return;
        var id = updateInvestmentBtn.getAttribute('data-id');
        if (!id) return;
        var investments = loadInvestments();
        var idx = investments.findIndex(function(i) { return i.id === id; });
        if (idx === -1) return;
        investments[idx].name = investmentName.value.trim();
        investments[idx].initialAmount = toNumber(investmentInitial.value);
        investments[idx].currentValue = toNumber(investmentCurrent.value);
        investments[idx].updatedAt = new Date().toISOString();
        saveInvestments(investments);
        clearInvestmentForm();
        renderInvestments();
        showToast('Investment updated successfully');
    }
    
    function deleteInvestment(id) {
        if (!confirm('Delete this investment?')) return;
        var investments = loadInvestments();
        investments = investments.filter(function(i) { return i.id !== id; });
        saveInvestments(investments);
        renderInvestments();
    }
    
    function clearInvestmentForm() {
        if (investmentName) investmentName.value = '';
        if (investmentInitial) investmentInitial.value = '';
        if (investmentCurrent) investmentCurrent.value = '';
        if (investmentReturn) investmentReturn.value = '';
        if (addInvestmentBtn) addInvestmentBtn.hidden = false;
        if (updateInvestmentBtn) updateInvestmentBtn.hidden = true;
        if (cancelInvestmentBtn) cancelInvestmentBtn.hidden = true;
    }
    
    function updateInvestmentReturn() {
        if (!investmentInitial || !investmentCurrent || !investmentReturn) return;
        var initial = toNumber(investmentInitial.value);
        var current = toNumber(investmentCurrent.value);
        if (initial > 0) {
            var returnPercent = ((current - initial) / initial * 100);
            investmentReturn.value = returnPercent.toFixed(2) + '%';
        } else {
            investmentReturn.value = '';
        }
    }
    
    // Dashboard Charts
    function renderDashboard() {
        if (!dashboardModal) return;
        updateDashboardWidgets();
        renderDashboardCharts();
    }
    
    function updateDashboardWidgets() {
        var now = new Date();
        var today = now.toDateString();
        var currentMonth = now.getMonth();
        var currentYear = now.getFullYear();
        var todayTotal = 0;
        var monthTotal = 0;
        state.expenses.forEach(function(exp) {
            var d = parseDate(exp.date);
            if (d.toDateString() === today) todayTotal += toNumber(exp.amount);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                monthTotal += toNumber(exp.amount);
            }
        });
        if (todayExpense) todayExpense.textContent = formatCurrency(todayTotal);
        if (monthExpense) monthExpense.textContent = formatCurrency(monthTotal);
        var incomes = loadIncomes();
        var incomeTotal = 0;
        incomes.forEach(function(inc) {
            var d = new Date(inc.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                incomeTotal += inc.amount;
            }
        });
        if (totalIncomeWidget) totalIncomeWidget.textContent = formatCurrency(incomeTotal);
        var settings = loadSettings();
        var budget = toNumber(settings.monthlyBudgetLimit || 0);
        if (balanceLeft) {
            var balance = budget - monthTotal;
            balanceLeft.textContent = formatCurrency(balance);
            balanceLeft.style.color = balance < 0 ? 'var(--danger)' : (balance < budget * 0.1 ? '#f59e0b' : 'var(--text)');
        }
    }
    
    function renderDashboardCharts() {
        if (typeof Chart === 'undefined') return;
        
        // Category Pie Chart
        var categoryData = {};
        var now = new Date();
        var currentMonth = now.getMonth();
        var currentYear = now.getFullYear();
        state.expenses.forEach(function(exp) {
            var d = parseDate(exp.date);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                categoryData[exp.category] = (categoryData[exp.category] || 0) + toNumber(exp.amount);
            }
        });
        var pieCtx = document.getElementById('categoryPieChart');
        if (pieCtx) {
            if (categoryPieChart) categoryPieChart.destroy();
            categoryPieChart = new Chart(pieCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(categoryData),
                    datasets: [{
                        data: Object.values(categoryData),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
        
        // Trends Line Chart (Last 6 months)
        var monthData = {};
        for (var i = 5; i >= 0; i--) {
            var date = new Date();
            date.setMonth(date.getMonth() - i);
            var key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
            monthData[key] = 0;
        }
        state.expenses.forEach(function(exp) {
            var d = parseDate(exp.date);
            var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            if (monthData.hasOwnProperty(key)) {
                monthData[key] += toNumber(exp.amount);
            }
        });
        var lineCtx = document.getElementById('trendsLineChart');
        if (lineCtx) {
            if (trendsLineChart) trendsLineChart.destroy();
            trendsLineChart = new Chart(lineCtx, {
                type: 'line',
                data: {
                    labels: Object.keys(monthData),
                    datasets: [{
                        label: 'Spending',
                        data: Object.values(monthData),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
        
        // Top 5 Categories Bar Chart
        var allCategoryData = {};
        state.expenses.forEach(function(exp) {
            allCategoryData[exp.category] = (allCategoryData[exp.category] || 0) + toNumber(exp.amount);
        });
        var sortedCategories = Object.keys(allCategoryData).sort(function(a, b) {
            return allCategoryData[b] - allCategoryData[a];
        }).slice(0, 5);
        var barCtx = document.getElementById('topCategoriesBarChart');
        if (barCtx) {
            if (topCategoriesBarChart) topCategoriesBarChart.destroy();
            topCategoriesBarChart = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: sortedCategories,
                    datasets: [{
                        label: 'Total Spending',
                        data: sortedCategories.map(function(cat) { return allCategoryData[cat]; }),
                        backgroundColor: '#3b82f6'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
        
        // Income vs Expense Chart
        var incomeData = {};
        var expenseData = {};
        for (var j = 5; j >= 0; j--) {
            var date2 = new Date();
            date2.setMonth(date2.getMonth() - j);
            var key2 = date2.getFullYear() + '-' + String(date2.getMonth() + 1).padStart(2, '0');
            incomeData[key2] = 0;
            expenseData[key2] = 0;
        }
        state.expenses.forEach(function(exp) {
            var d = parseDate(exp.date);
            var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            if (expenseData.hasOwnProperty(key)) {
                expenseData[key] += toNumber(exp.amount);
            }
        });
        var incomes = loadIncomes();
        incomes.forEach(function(inc) {
            var d = new Date(inc.date);
            var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
            if (incomeData.hasOwnProperty(key)) {
                incomeData[key] += inc.amount;
            }
        });
        var compareCtx = document.getElementById('incomeVsExpenseChart');
        if (compareCtx) {
            if (incomeVsExpenseChart) incomeVsExpenseChart.destroy();
            incomeVsExpenseChart = new Chart(compareCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(incomeData),
                    datasets: [{
                        label: 'Income',
                        data: Object.values(incomeData),
                        backgroundColor: '#10b981'
                    }, {
                        label: 'Expense',
                        data: Object.values(expenseData),
                        backgroundColor: '#ef4444'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true
                }
            });
        }
    }
    
    // Category Customization
    function loadCustomCategories() {
        try {
            var raw = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
    }
    
    function saveCustomCategories(categories) {
        try {
            localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
        } catch (_) {}
    }
    
    function renderCustomCategories() {
        if (!customCategoriesList) return;
        var categories = loadCustomCategories();
        customCategoriesList.innerHTML = '';
        if (categories.length === 0) {
            customCategoriesList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">No custom categories yet</div>';
            return;
        }
        categories.forEach(function(cat) {
            var div = document.createElement('div');
            div.className = 'custom-category-item';
            div.style.borderLeft = '4px solid ' + cat.color;
            div.innerHTML = 
                '<div class="category-icon-display">' + (cat.icon || '📁') + '</div>' +
                '<div class="category-name-display">' + escapeHtml(cat.name) + '</div>' +
                '<div class="category-budget-display">Budget: ' + formatCurrency(cat.budgetLimit || 0) + '</div>' +
                '<div style="display: flex; gap: 8px; margin-top: 8px;">' +
                    '<button class="btn btn-outline btn-small" data-action="edit" data-id="' + cat.id + '">✏️</button>' +
                    '<button class="btn btn-danger btn-small" data-action="delete" data-id="' + cat.id + '">🗑️</button>' +
                '</div>';
            customCategoriesList.appendChild(div);
        });
        customCategoriesList.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                var action = this.getAttribute('data-action');
                if (action === 'edit') editCustomCategory(id);
                else if (action === 'delete') deleteCustomCategory(id);
            });
        });
    }
    
    function addCustomCategory() {
        if (!customCategoryName) return;
        var name = customCategoryName.value.trim();
        if (!name) {
            showToast('Please enter category name');
            return;
        }
        var categories = loadCustomCategories();
        categories.push({
            id: uid(),
            name: name,
            icon: customCategoryIcon ? customCategoryIcon.value.trim() : '📁',
            color: customCategoryColor ? customCategoryColor.value : '#3b82f6',
            budgetLimit: toNumber(customCategoryBudget ? customCategoryBudget.value : 0),
            createdAt: new Date().toISOString()
        });
        saveCustomCategories(categories);
        clearCustomCategoryForm();
        renderCustomCategories();
        updateCategorySelect();
        showToast('Category added successfully');
    }
    
    function editCustomCategory(id) {
        var categories = loadCustomCategories();
        var cat = categories.find(function(c) { return c.id === id; });
        if (!cat) return;
        if (customCategoryName) customCategoryName.value = cat.name;
        if (customCategoryIcon) customCategoryIcon.value = cat.icon || '';
        if (customCategoryColor) customCategoryColor.value = cat.color || '#3b82f6';
        if (customCategoryBudget) customCategoryBudget.value = cat.budgetLimit || '';
        if (addCustomCategoryBtn) addCustomCategoryBtn.hidden = true;
        if (updateCustomCategoryBtn) {
            updateCustomCategoryBtn.hidden = false;
            updateCustomCategoryBtn.setAttribute('data-id', id);
        }
        if (cancelCustomCategoryBtn) cancelCustomCategoryBtn.hidden = false;
    }
    
    function updateCustomCategory() {
        if (!updateCustomCategoryBtn) return;
        var id = updateCustomCategoryBtn.getAttribute('data-id');
        if (!id) return;
        var categories = loadCustomCategories();
        var idx = categories.findIndex(function(c) { return c.id === id; });
        if (idx === -1) return;
        categories[idx].name = customCategoryName.value.trim();
        categories[idx].icon = customCategoryIcon ? customCategoryIcon.value.trim() : '📁';
        categories[idx].color = customCategoryColor ? customCategoryColor.value : '#3b82f6';
        categories[idx].budgetLimit = toNumber(customCategoryBudget ? customCategoryBudget.value : 0);
        categories[idx].updatedAt = new Date().toISOString();
        saveCustomCategories(categories);
        clearCustomCategoryForm();
        renderCustomCategories();
        updateCategorySelect();
        showToast('Category updated successfully');
    }
    
    function deleteCustomCategory(id) {
        if (!confirm('Delete this category?')) return;
        var categories = loadCustomCategories();
        categories = categories.filter(function(c) { return c.id !== id; });
        saveCustomCategories(categories);
        renderCustomCategories();
        updateCategorySelect();
    }
    
    function clearCustomCategoryForm() {
        if (customCategoryName) customCategoryName.value = '';
        if (customCategoryIcon) customCategoryIcon.value = '';
        if (customCategoryColor) customCategoryColor.value = '#3b82f6';
        if (customCategoryBudget) customCategoryBudget.value = '';
        if (addCustomCategoryBtn) addCustomCategoryBtn.hidden = false;
        if (updateCustomCategoryBtn) updateCustomCategoryBtn.hidden = true;
        if (cancelCustomCategoryBtn) cancelCustomCategoryBtn.hidden = true;
    }
    
    function updateCategorySelect() {
        var select = document.getElementById('category');
        if (!select) return;
        var customCats = loadCustomCategories();
        var currentValue = select.value;
        var defaultOptions = ['Food', 'Transport', 'Groceries', 'Entertainment', 'Health', 'Bills', 'Shopping', 'Other'];
        var existingOptions = Array.from(select.options).map(function(opt) { return opt.value; });
        customCats.forEach(function(cat) {
            if (!existingOptions.includes(cat.name)) {
                var option = document.createElement('option');
                option.value = cat.name;
                option.textContent = (cat.icon || '📁') + ' ' + cat.name;
                select.appendChild(option);
            }
        });
        if (currentValue) select.value = currentValue;
    }
    
    // Group Expenses
    var currentGroupMembers = [];
    
    function loadGroups() {
        try {
            var raw = localStorage.getItem(GROUPS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (_) { return []; }
    }
    
    function saveGroups(groups) {
        try {
            localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
        } catch (_) {}
    }
    
    function renderGroups() {
        if (!groupsList) return;
        var groups = loadGroups();
        groupsList.innerHTML = '';
        if (groups.length === 0) {
            groupsList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--muted);">No groups yet</div>';
            return;
        }
        groups.forEach(function(group) {
            var div = document.createElement('div');
            div.className = 'group-item';
            div.innerHTML = 
                '<div class="group-item-header">' +
                    '<span class="group-item-name">' + escapeHtml(group.name) + '</span>' +
                    '<button class="btn btn-danger btn-small" data-action="delete" data-id="' + group.id + '">🗑️</button>' +
                '</div>' +
                '<div class="group-item-members">Members: ' + group.members.join(', ') + '</div>' +
                '<div class="group-item-expenses">Total Expenses: ' + formatCurrency(group.totalExpenses || 0) + '</div>';
            groupsList.appendChild(div);
        });
        groupsList.querySelectorAll('[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var id = this.getAttribute('data-id');
                deleteGroup(id);
            });
        });
    }
    
    function addGroupMember() {
        if (!groupMemberName) return;
        var name = groupMemberName.value.trim();
        if (!name) return;
        if (currentGroupMembers.includes(name)) {
            showToast('Member already added');
            return;
        }
        currentGroupMembers.push(name);
        groupMemberName.value = '';
        renderGroupMembers();
    }
    
    function renderGroupMembers() {
        if (!groupMembersList) return;
        groupMembersList.innerHTML = '';
        currentGroupMembers.forEach(function(member) {
            var tag = document.createElement('div');
            tag.className = 'group-member-tag';
            tag.innerHTML = '<span>' + escapeHtml(member) + '</span><button onclick="removeGroupMember(\'' + member + '\')">×</button>';
            groupMembersList.appendChild(tag);
        });
    }
    
    window.removeGroupMember = function(member) {
        currentGroupMembers = currentGroupMembers.filter(function(m) { return m !== member; });
        renderGroupMembers();
    };
    
    function createGroup() {
        if (!groupName) return;
        var name = groupName.value.trim();
        if (!name) {
            showToast('Please enter group name');
            return;
        }
        if (currentGroupMembers.length === 0) {
            showToast('Please add at least one member');
            return;
        }
        var groups = loadGroups();
        groups.push({
            id: uid(),
            name: name,
            members: currentGroupMembers.slice(),
            totalExpenses: 0,
            expenses: [],
            createdAt: new Date().toISOString()
        });
        saveGroups(groups);
        groupName.value = '';
        currentGroupMembers = [];
        renderGroupMembers();
        renderGroups();
        showToast('Group created successfully');
    }
    
    function deleteGroup(id) {
        if (!confirm('Delete this group?')) return;
        var groups = loadGroups();
        groups = groups.filter(function(g) { return g.id !== id; });
        saveGroups(groups);
        renderGroups();
    }
    
    // Event Handlers
    if (dashboardBtn) dashboardBtn.addEventListener('click', function() {
        if (dashboardModal) {
            renderDashboard();
            dashboardModal.classList.remove('hidden');
        }
    });
    
    if (closeDashboardModal) closeDashboardModal.addEventListener('click', function() {
        if (dashboardModal) dashboardModal.classList.add('hidden');
    });
    
    if (dashboardCloseBtn) dashboardCloseBtn.addEventListener('click', function() {
        if (dashboardModal) dashboardModal.classList.add('hidden');
    });
    
    if (incomeBtn) incomeBtn.addEventListener('click', function() {
        if (incomeModal) {
            renderIncomeList();
            updateIncomeTotals();
            clearIncomeForm();
            incomeModal.classList.remove('hidden');
        }
    });
    
    if (closeIncomeModal) closeIncomeModal.addEventListener('click', function() {
        if (incomeModal) incomeModal.classList.add('hidden');
    });
    
    if (incomeCloseBtn) incomeCloseBtn.addEventListener('click', function() {
        if (incomeModal) incomeModal.classList.add('hidden');
    });
    
    if (addIncomeBtn) addIncomeBtn.addEventListener('click', addIncome);
    if (updateIncomeBtn) updateIncomeBtn.addEventListener('click', updateIncome);
    if (cancelIncomeBtn) cancelIncomeBtn.addEventListener('click', clearIncomeForm);
    
    if (investmentCloseBtn) investmentCloseBtn.addEventListener('click', function() {
        if (investmentModal) investmentModal.classList.add('hidden');
    });
    
    if (closeInvestmentModal) closeInvestmentModal.addEventListener('click', function() {
        if (investmentModal) investmentModal.classList.add('hidden');
    });
    
    if (addSavingsGoalBtn) addSavingsGoalBtn.addEventListener('click', addSavingsGoal);
    if (updateSavingsGoalBtn) updateSavingsGoalBtn.addEventListener('click', updateSavingsGoal);
    if (cancelSavingsGoalBtn) cancelSavingsGoalBtn.addEventListener('click', clearSavingsGoalForm);
    
    if (addInvestmentBtn) addInvestmentBtn.addEventListener('click', addInvestment);
    if (updateInvestmentBtn) updateInvestmentBtn.addEventListener('click', updateInvestment);
    if (cancelInvestmentBtn) cancelInvestmentBtn.addEventListener('click', clearInvestmentForm);
    
    if (investmentInitial && investmentCurrent) {
        investmentInitial.addEventListener('input', updateInvestmentReturn);
        investmentCurrent.addEventListener('input', updateInvestmentReturn);
    }
    
    if (categoryCloseBtn) categoryCloseBtn.addEventListener('click', function() {
        if (categoryModal) categoryModal.classList.add('hidden');
    });
    
    if (closeCategoryModal) closeCategoryModal.addEventListener('click', function() {
        if (categoryModal) categoryModal.classList.add('hidden');
    });
    
    if (addCustomCategoryBtn) addCustomCategoryBtn.addEventListener('click', addCustomCategory);
    if (updateCustomCategoryBtn) updateCustomCategoryBtn.addEventListener('click', updateCustomCategory);
    if (cancelCustomCategoryBtn) cancelCustomCategoryBtn.addEventListener('click', clearCustomCategoryForm);
    
    if (groupExpenseCloseBtn) groupExpenseCloseBtn.addEventListener('click', function() {
        if (groupExpenseModal) groupExpenseModal.classList.add('hidden');
    });
    
    if (closeGroupExpenseModal) closeGroupExpenseModal.addEventListener('click', function() {
        if (groupExpenseModal) groupExpenseModal.classList.add('hidden');
    });
    
    if (addGroupMemberBtn) addGroupMemberBtn.addEventListener('click', addGroupMember);
    if (createGroupBtn) createGroupBtn.addEventListener('click', createGroup);
    
    // Open modals from profile
    if (openInvestmentModalBtn) openInvestmentModalBtn.addEventListener('click', function() {
        if (investmentModal) {
            renderSavingsGoals();
            renderInvestments();
            investmentModal.classList.remove('hidden');
        }
    });
    
    if (openCategoryModalBtn) openCategoryModalBtn.addEventListener('click', function() {
        if (categoryModal) {
            renderCustomCategories();
            categoryModal.classList.remove('hidden');
        }
    });
    
    if (openGroupExpenseModalBtn) openGroupExpenseModalBtn.addEventListener('click', function() {
        if (groupExpenseModal) {
            renderGroups();
            currentGroupMembers = [];
            renderGroupMembers();
            groupExpenseModal.classList.remove('hidden');
        }
    });
    
    // Initialize category select on load
    if (category) {
        category.addEventListener('focus', function() {
            updateCategorySelect();
        });
    }

    /** Init */
    function init() {
        try {
            var theme = localStorage.getItem(THEME_KEY) || "dark";
            setTheme(theme);
        } catch (_) {}

        state.expenses = load();
        // Expose for notification helper
        try { window.state = state; } catch (_) {}
        
        // Initialize user data (set dateJoined if first time)
        var userData = loadUserData();
        if (!userData.dateJoined) {
            userData.dateJoined = new Date().toISOString();
            saveUserData(userData);
        }
        updateProfileIcon();
        
        syncFilterInputsToState();
        render();

        // Start clock
        updateClock();
        setInterval(updateClock, 1000);

        // Start notification scheduler
        startNotificationScheduler();

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(function(){});
        }
    }

    init();

    // Install prompt handling
    window.addEventListener('beforeinstallprompt', function(e){
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) installBtn.hidden = false;
    });
    if (installBtn) {
        installBtn.addEventListener('click', function(){
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choice){
                if (choice.outcome === 'accepted') {
                    installBtn.hidden = true;
                }
                deferredPrompt = null;
            });
        });
    }
    window.addEventListener('appinstalled', function(){ if (installBtn) installBtn.hidden = true; });
    
    // Notification settings modal controls
    var NOTIF_PREFS_KEY = 'expense-tracker:notif-prefs:v1';
    function openNotifModal(){
        var modal = document.getElementById('notifModal');
        if (!modal) return;
        var raw = null, prefs = { daily:false, monthly:false, yearly:false };
        try { raw = localStorage.getItem(NOTIF_PREFS_KEY); if (raw) prefs = Object.assign(prefs, JSON.parse(raw)); } catch(_){ }
        var d = document.getElementById('notifDaily');
        var m = document.getElementById('notifMonthly');
        var y = document.getElementById('notifYearly');
        var err = document.getElementById('notifError');
        if (d) d.checked = !!prefs.daily;
        if (m) m.checked = !!prefs.monthly;
        if (y) y.checked = !!prefs.yearly;
        if (err) err.textContent = '';
        modal.classList.remove('hidden');
    }
    function closeNotif(){ var modal = document.getElementById('notifModal'); if (modal) modal.classList.add('hidden'); }
    function saveNotifPrefs(){
        var d = document.getElementById('notifDaily');
        var m = document.getElementById('notifMonthly');
        var y = document.getElementById('notifYearly');
        var prefs = { daily: !!(d&&d.checked), monthly: !!(m&&m.checked), yearly: !!(y&&y.checked) };
        try { localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs)); } catch(_){ }
        if (prefs.daily || prefs.monthly || prefs.yearly) { if (window.requestNotificationPermission) window.requestNotificationPermission(); }
        closeNotif();
    }
})();

// Notification helpers
(function(){
    var NOTIF_META_KEY = 'expense-tracker:notif-meta:v1';
    var NOTIF_PREFS_KEY = 'expense-tracker:notif-prefs:v1';

    function readNotifMeta() {
        try {
            var raw = localStorage.getItem(NOTIF_META_KEY);
            return raw ? JSON.parse(raw) : { lastDaily: '', lastMonthly: '' };
        } catch (_) { return { lastDaily: '', lastMonthly: '' }; }
    }

    function writeNotifMeta(meta) {
        try { localStorage.setItem(NOTIF_META_KEY, JSON.stringify(meta)); } catch (_) {}
    }

    function showToast(message) {
        var el = document.getElementById('toast');
        if (!el) { alert(message); return; }
        el.textContent = message;
        el.classList.remove('hidden');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function(){ el.classList.add('hidden'); }, 4500);
    }

    function showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try { new Notification(title, { body: body }); return; } catch (_) {}
        }
        showToast(title + ': ' + body);
    }

    function requestNotificationPermission() {
        if (!('Notification' in window)) { showToast('Notifications not supported.'); return; }
        if (Notification.permission === 'granted') { showToast('Notifications are enabled.'); return; }
        if (Notification.permission === 'denied') { showToast('Notifications are blocked.'); return; }
        Notification.requestPermission().then(function(result){
            showToast('Notifications: ' + result);
        });
    }

    function ymd(d) { var yyyy=d.getFullYear(), mm=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); return yyyy+'-'+mm+'-'+dd; }
    function ymKey(d) { var yyyy=d.getFullYear(), mm=String(d.getMonth()+1).padStart(2,'0'); return yyyy+'-'+mm; }
    function isLastDayOfMonth(d) { var next=new Date(d.getFullYear(), d.getMonth(), d.getDate()+1); return next.getDate()===1; }
    function isLastDayOfYear(d) { return d.getMonth()===11 && d.getDate()===31; }
    function toNumber(n){ return Number(parseFloat(n||0).toFixed(2)); }
    function parseDate(d){ return new Date(d + 'T00:00:00'); }

    function totalForDate(list, d) {
        var key = ymd(d), sum = 0;
        list.forEach(function(e){ if (e.date === key) sum += toNumber(e.amount); });
        return toNumber(sum);
    }
    function totalForMonth(list, y, m) {
        var sum = 0;
        list.forEach(function(e){ var dt=parseDate(e.date); if (dt.getFullYear()===y && dt.getMonth()===m) sum += toNumber(e.amount); });
        return toNumber(sum);
    }

    function formatCurrency(n){ try { return Number(n).toLocaleString(undefined,{style:'currency',currency:(Intl.NumberFormat().resolvedOptions().currency||'USD')}); } catch(_){ return 'USD '+Number(n).toLocaleString(); } }

    function readPrefs(){
        try { var raw = localStorage.getItem(NOTIF_PREFS_KEY); if (!raw) return { daily:false, monthly:false, yearly:false }; return Object.assign({daily:false, monthly:false, yearly:false}, JSON.parse(raw)); } catch(_) { return { daily:false, monthly:false, yearly:false }; }
    }
    function writePrefs(p){ try { localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(p)); } catch(_){} }

    function maybeShowDailyAndMonthly() {
        try {
            var now = new Date();
            var hour = now.getHours();
            var meta = readNotifMeta();
            var prefs = readPrefs();
            var expenses = (window && window.state && Array.isArray(window.state.expenses)) ? window.state.expenses : [];

            if (hour >= 21) {
                var todayKey = ymd(now);
                if (prefs.daily && meta.lastDaily !== todayKey) {
                    var dailyTotal = totalForDate(expenses, now);
                    showNotification("Today's total", formatCurrency(dailyTotal));
                    meta.lastDaily = todayKey;
                    writeNotifMeta(meta);
                }
                if (prefs.monthly && isLastDayOfMonth(now)) {
                    var monthKey = ymKey(now);
                    if (meta.lastMonthly !== monthKey) {
                        var mTotal = totalForMonth(expenses, now.getFullYear(), now.getMonth());
                        showNotification("This month's total", formatCurrency(mTotal));
                        meta.lastMonthly = monthKey;
                        writeNotifMeta(meta);
                    }
                }
                if (prefs.yearly && isLastDayOfYear(now)) {
                    var year = now.getFullYear();
                    if (meta.lastYearly !== String(year)) {
                        var ySum = 0; expenses.forEach(function(e){ var d=parseDate(e.date); if (d.getFullYear()===year) ySum+=toNumber(e.amount); });
                        showNotification("This year's total", formatCurrency(ySum));
                        meta.lastYearly = String(year);
                        writeNotifMeta(meta);
                    }
                }
            }
        } catch (_) {}
    }

    function startNotificationScheduler() {
        maybeShowDailyAndMonthly();
        setInterval(maybeShowDailyAndMonthly, 60000);
    }

    // expose minimal APIs to main scope
    window.requestNotificationPermission = requestNotificationPermission;
    window.startNotificationScheduler = startNotificationScheduler;
    window._notifReadPrefs = readPrefs;
    window._notifWritePrefs = writePrefs;
})();


