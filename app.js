(function() {
    "use strict";

    /** State */
    var STORAGE_KEY = "expense-tracker:data:v1";
    var THEME_KEY = "expense-tracker:theme";
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

    /** Utils */
    function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
    function toNumber(n) { return Number(parseFloat(n || 0).toFixed(2)); }
    function parseDate(d) { return new Date(d + "T00:00:00"); }
    function formatCurrency(n) { return toNumber(n).toLocaleString(undefined, { style: "currency", currency: guessCurrency() }); }
    function guessCurrency() {
        try { return Intl.NumberFormat().resolvedOptions().currency || "USD"; } catch (_) { return "USD"; }
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
        themeToggle.textContent = theme === "light" ? "🌞" : "🌙";
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

    themeToggle.addEventListener("click", toggleTheme);
    if (notifyBtn) {
        notifyBtn.addEventListener('click', function(){
            openNotifModal();
        });
    }
    if (notifCancelBtn) notifCancelBtn.addEventListener('click', function(e){ e.preventDefault(); closeNotif(); });
    if (closeNotifModal) closeNotifModal.addEventListener('click', closeNotif);
    if (notifSaveBtn) notifSaveBtn.addEventListener('click', saveNotifPrefs);

    /** Init */
    function init() {
        try {
            var theme = localStorage.getItem(THEME_KEY) || "dark";
            setTheme(theme);
        } catch (_) {}

        state.expenses = load();
        // Expose for notification helper
        try { window.state = state; } catch (_) {}
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


