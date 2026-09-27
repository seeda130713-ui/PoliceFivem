        /**
         * FiveM Police Portal State & Logic Manager
         */
        const STORAGE_KEYS = {
            USERS: 'fivem_police_users',
            SESSION: 'fivem_police_session',
            FORMS: 'fivem_police_forms',
            INVESTIGATIONS: 'fivem_police_investigations'
        };

        // Initial Mock Data if empty
        function initializeStorage() {
            if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
                const defaultUsers = [
                    {
                        id: 'CID-99999',
                        name: 'Col. John Miller',
                        callsign: 'LSPD-01',
                        username: 'johnmiller',
                        password: 'adminpassword'
                    }
                ];
                localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
            }

            if (!localStorage.getItem(STORAGE_KEYS.FORMS)) {
                const defaultForms = [
                    {
                        id: 'REP-1001',
                        reporter: 'Col. John Miller (LSPD-01)',
                        type: 'Reckless Driving / Resisting Arrest',
                        suspect: 'Tony Stark',
                        fine: 15000,
                        date: '2026-06-06 14:30',
                        details: 'Suspect drove at high speed through a red light near Legion Square and attempted to evade arrest.',
                        status: 'Processed'
                    }
                ];
                localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(defaultForms));
            }

            if (!localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS)) {
                const defaultInvestigations = [
                    {
                        id: 'CR-100234',
                        reportDate: '2026-06-06',
                        leadDetective: 'Col. John Miller (LSPD-01)',
                        assistingOfficers: 'Det. Sarah Connor (LSPD-14)',
                        crimeType: 'Robbery',
                        crimeTypeOther: '',
                        location: 'Fleeca Bank, Legion Square',
                        incidentDateTime: '2026-06-05 22:10',
                        victimName: 'Fleeca Bank Corp.',
                        victimStatus: 'Safe',
                        suspectName: 'Unknown male, ski mask',
                        suspectVehicle: 'Grey Sultan, plate obscured',
                        witnessName: 'Bank teller on duty',
                        witnessContact: 'On file with HR',
                        summary: 'Suspect entered the bank at approximately 22:10, brandished a firearm, and demanded cash from the teller before fleeing on foot toward the parking structure.',
                        evidence: 'Shell casing recovered near entrance\nCCTV footage exported from bank system\nPartial shoe print near rear exit',
                        actions: ['cctv', 'witness'],
                        status: 'Active'
                    }
                ];
                localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(defaultInvestigations));
            }
        }

        // Notification Helper
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const bgCol = type === 'success' ? 'bg-emerald-600 border-emerald-500' : 
                          type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-amber-600 border-amber-500';
            
            toast.className = `pointer-events-auto px-4 py-3 rounded-xl border text-white shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-[-20px] opacity-0 ${bgCol}`;
            
            const icon = type === 'success' ? 'fa-circle-check' : type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info';
            toast.innerHTML = `<i class="fa-solid ${icon} text-lg"></i><span class="text-sm font-medium">${message}</span>`;
            
            container.appendChild(toast);
            
            // Fade in
            setTimeout(() => {
                toast.classList.remove('translate-y-[-20px]', 'opacity-0');
            }, 10);

            // Fade out
            setTimeout(() => {
                toast.classList.add('translate-y-[-20px]', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        // Session Management
        function getCurrentUser() {
            const session = localStorage.getItem(STORAGE_KEYS.SESSION);
            return session ? JSON.parse(session) : null;
        }

        function setCurrentUser(user) {
            if (user) {
                localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
            } else {
                localStorage.removeItem(STORAGE_KEYS.SESSION);
            }
            renderApp();
        }

        function renderAuthView() {
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-police-dark to-black relative overflow-hidden">
                    <!-- Background Police Badge Overlay -->
                    <div class="absolute -right-20 -bottom-20 opacity-5 pointer-events-none text-police-gold text-[30rem]">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>

                    <div class="w-full max-w-md bg-police-card/80 backdrop-blur-xl border border-police-border rounded-2xl shadow-2xl overflow-hidden relative z-10">
                        <!-- Header Banner -->
                        <div class="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 text-center border-b border-police-border relative">
                            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-police-gold/10 border border-police-gold/30 text-police-gold text-3xl mb-3 shadow-inner">
                                <i class="fa-solid fa-shield-halved"></i>
                            </div>
                            <h1 class="text-2xl font-bold tracking-wider text-white">LSPD PORTAL</h1>
                            <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">Los Santos Police Department</p>
                        </div>

                        <!-- Tab Switcher -->
                        <div class="grid grid-cols-2 bg-gray-900/50 p-1.5 border-b border-police-border text-sm font-medium">
                            <button id="tab-login" onclick="switchAuthTab('login')" class="py-2.5 rounded-xl transition-all text-center bg-indigo-600 text-white shadow-md">
                                Login
                            </button>
                            <button id="tab-register" onclick="switchAuthTab('register')" class="py-2.5 rounded-xl transition-all text-center text-gray-400 hover:text-white">
                                Register Officer
                            </button>
                        </div>

                        <!-- Forms Container -->
                        <div class="p-6">
                            <!-- Login Form -->
                            <form id="form-login" onsubmit="handleLogin(event)" class="space-y-4">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Name & Surname</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                                            <i class="fa-solid fa-user"></i>
                                        </span>
                                        <input type="text" id="login-name" required placeholder="Enter your full name" 
                                            class="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-200 placeholder-gray-600 transition-all">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                                            <i class="fa-solid fa-lock"></i>
                                        </span>
                                        <input type="password" id="login-password" required placeholder="••••••••" 
                                            class="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-200 placeholder-gray-600 transition-all">
                                    </div>
                                </div>
                                <button type="submit" class="w-full mt-2 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-right-to-bracket"></i> Log In to Database
                                </button>
                            </form>

                            <!-- Register Form (Simplified to Name and Password) -->
                            <form id="form-register" onsubmit="handleRegister(event)" class="space-y-4 hidden">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Name & Surname</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                                            <i class="fa-solid fa-user-shield"></i>
                                        </span>
                                        <input type="text" id="reg-name" required placeholder="e.g. Officer John Wick" 
                                            class="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-gray-200 placeholder-gray-600">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
                                    <div class="relative">
                                        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                                            <i class="fa-solid fa-lock"></i>
                                        </span>
                                        <input type="password" id="reg-password" required placeholder="••••••••" 
                                            class="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-gray-200 placeholder-gray-600">
                                    </div>
                                </div>
                                <button type="submit" class="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2">
                                    <i class="fa-solid fa-user-plus"></i> Register New Officer
                                </button>
                            </form>
                        </div>
                        
                        <div class="px-6 py-4 bg-gray-900/40 border-t border-police-border text-center text-xs text-gray-500">
                            FiveM Roleplay Secure Database System v2.5
                        </div>
                    </div>
                </div>
            `;
        }

        function switchAuthTab(tab) {
            const btnLogin = document.getElementById('tab-login');
            const btnRegister = document.getElementById('tab-register');
            const formLogin = document.getElementById('form-login');
            const formRegister = document.getElementById('form-register');

            if (tab === 'login') {
                btnLogin.className = "py-2.5 rounded-xl transition-all text-center bg-indigo-600 text-white shadow-md";
                btnRegister.className = "py-2.5 rounded-xl transition-all text-center text-gray-400 hover:text-white";
                formLogin.classList.remove('hidden');
                formRegister.classList.add('hidden');
            } else {
                btnRegister.className = "py-2.5 rounded-xl transition-all text-center bg-emerald-600 text-white shadow-md";
                btnLogin.className = "py-2.5 rounded-xl transition-all text-center text-gray-400 hover:text-white";
                formRegister.classList.remove('hidden');
                formLogin.classList.add('hidden');
            }
        }

        function handleLogin(e) {
            e.preventDefault();
            const nameInput = document.getElementById('login-name').value.trim();
            const password = document.getElementById('login-password').value;

            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
            const foundUser = users.find(u => u.name.toLowerCase() === nameInput.toLowerCase() && u.password === password);

            if (foundUser) {
                setCurrentUser(foundUser);
                showToast(`Welcome back, ${foundUser.name}`, 'success');
            } else {
                showToast('Invalid name or password!', 'error');
            }
        }

        function handleRegister(e) {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const password = document.getElementById('reg-password').value;

            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
            
            if (users.some(u => u.name.toLowerCase() === name.toLowerCase())) {
                showToast('This name is already registered in the system', 'error');
                return;
            }

            const randomIdNum = Math.floor(10000 + Math.random() * 90000);
            const callsignNum = Math.floor(10 + Math.random() * 89);
            
            const newUser = {
                id: `CID-${randomIdNum}`,
                name: name,
                callsign: `LSPD-${callsignNum}`,
                password: password
            };

            users.push(newUser);
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

            showToast('Registration successful! Please log in with your name and password.', 'success');
            switchAuthTab('login');
            document.getElementById('form-register').reset();
        }

        let activeTab = 'form-list';

        function renderDashboardView() {
            const user = getCurrentUser();
            if (!user) {
                renderAuthView();
                return;
            }

            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="min-h-screen flex flex-col bg-police-dark">
                    <!-- Top Navigation Bar -->
                    <header class="bg-gray-900/90 backdrop-blur-md border-b border-police-border sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
                        <!-- Left Navigation Buttons -->
                        <div class="flex items-center gap-3">
                            <div class="flex items-center gap-2.5 mr-4 pr-4 border-r border-gray-800">
                                <div class="w-10 h-10 rounded-xl bg-police-gold/10 border border-police-gold/30 text-police-gold flex items-center justify-center text-lg font-bold shadow-inner">
                                    <i class="fa-solid fa-shield-halved"></i>
                                </div>
                                <div class="hidden sm:block">
                                    <span class="font-bold text-sm tracking-wide block text-white leading-none">LSPD</span>
                                    <span class="text-[10px] text-gray-400 tracking-wider font-semibold">DEPARTMENT</span>
                                </div>
                            </div>

                            <button onclick="setActiveTab('law-codes')" id="nav-btn-law" class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'law-codes' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}">
                                <i class="fa-solid fa-scale-balanced"></i>
                                <span>Law Codes</span>
                            </button>

                            <button onclick="setActiveTab('investigation-list')" id="nav-btn-investigations" class="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${(activeTab === 'investigation-list' || activeTab === 'create-investigation') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}">
                                <i class="fa-solid fa-magnifying-glass-chart"></i>
                                <span>Investigations</span>
                            </button>
                        </div>

                        <!-- Right Profile Badge & Logout -->
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-3 bg-gray-800/50 border border-gray-700/60 rounded-xl px-3.5 py-1.5">
                                <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                    <i class="fa-solid fa-user-shield"></i>
                                </div>
                                <div class="text-left">
                                    <div class="text-xs font-bold text-gray-200">${escapeHtml(user.name)}</div>
                                    <div class="text-[10px] text-police-gold font-mono font-semibold">${escapeHtml(user.callsign)} | ${escapeHtml(user.id)}</div>
                                </div>
                            </div>

                            <button onclick="handleLogout()" title="Log Out" class="relative w-11 h-11 rounded-full bg-gradient-to-b from-gray-700 via-gray-800 to-black border border-black/60 flex items-center justify-center transition-all duration-150 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-2px_3px_rgba(0,0,0,0.6),0_1px_2px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-2px_3px_rgba(0,0,0,0.6),0_0_14px_rgba(244,63,94,0.55)] active:scale-95 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                                <span class="absolute inset-0.5 rounded-full border border-white/5"></span>
                                <i class="fa-solid fa-power-off text-[13px] text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.7)]"></i>
                            </button>
                        </div>
                    </header>

                    <!-- Main Dynamic Content Area -->
                    <main class="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                        <div id="tab-content">
                            <!-- Injected dynamically -->
                        </div>
                    </main>
                </div>
            `;

            renderTabContent();
        }

        function setActiveTab(tab) {
            activeTab = tab;
            renderDashboardView();
        }

        function handleLogout() {
            setCurrentUser(null);
            showToast('Logged out successfully', 'info');
        }

        function renderTabContent() {
            const container = document.getElementById('tab-content');
            if (activeTab === 'investigation-list') {
                container.innerHTML = getInvestigationListHTML();
                initInvestigationListEvents();
            } else if (activeTab === 'create-investigation') {
                container.innerHTML = getCreateInvestigationHTML();
            } else if (activeTab === 'law-codes') {
                container.innerHTML = getLawCodesHTML();
                initLawCodesEvents();
            } else if (activeTab === 'create-form') {
                container.innerHTML = getCreateFormHTML();
            } else {
                container.innerHTML = getFormListHTML();
                initFormListEvents();
            }
        }

        function getFormListHTML() {
            return `
                <div class="space-y-6">
                    <!-- Page Banner Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-police-card border border-police-border p-6 rounded-2xl shadow-xl">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-clipboard-list text-indigo-500"></i> Incident Reports & Arrest Records
                            </h2>
                            <p class="text-xs text-gray-400 mt-1">Manage and review case history recorded in the Los Santos Police Department database</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="relative flex-1 md:w-64">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <i class="fa-solid fa-magnifying-glass text-xs"></i>
                                </span>
                                <input type="text" id="search-input" onkeyup="filterFormsList()" placeholder="Search suspect name, case type..." 
                                    class="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500">
                            </div>
                            <button onclick="setActiveTab('create-form')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all whitespace-nowrap flex items-center gap-1.5">
                                <i class="fa-solid fa-plus"></i> Create New Form
                            </button>
                        </div>
                    </div>

                    <!-- Forms Table Card -->
                    <div class="bg-police-card border border-police-border rounded-2xl shadow-xl overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-900/80 border-b border-police-border text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                        <th class="py-3.5 px-4">Case ID / Date</th>
                                        <th class="py-3.5 px-4">Case Type</th>
                                        <th class="py-3.5 px-4">Suspect</th>
                                        <th class="py-3.5 px-4">Fine ($)</th>
                                        <th class="py-3.5 px-4">Reporting Officer</th>
                                        <th class="py-3.5 px-4">Status</th>
                                        <th class="py-3.5 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="forms-table-body" class="divide-y divide-gray-800 text-sm">
                                    <!-- Populated by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- View Detail Modal -->
                <div id="detail-modal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-4">
                    <div class="bg-police-card border border-police-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all">
                        <div class="bg-gray-900 px-6 py-4 border-b border-police-border flex items-center justify-between">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-file-shield text-indigo-500"></i> Case Details <span id="modal-form-id" class="text-indigo-400 font-mono text-xs"></span>
                            </h3>
                            <button onclick="closeDetailModal()" class="text-gray-400 hover:text-white">
                                <i class="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div class="p-6 space-y-4 text-sm" id="modal-body-content">
                            <!-- Filled dynamically -->
                        </div>
                        <div class="px-6 py-4 bg-gray-900/60 border-t border-police-border flex justify-end">
                            <button onclick="closeDetailModal()" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function initFormListEvents() {
            renderFormsTable();
        }

        function getStoredForms() {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS)) || [];
        }

        function renderFormsTable(filterText = '') {
            const tbody = document.getElementById('forms-table-body');
            if (!tbody) return;

            const forms = getStoredForms();
            const filtered = forms.filter(f => 
                f.type.toLowerCase().includes(filterText.toLowerCase()) ||
                f.suspect.toLowerCase().includes(filterText.toLowerCase()) ||
                f.id.toLowerCase().includes(filterText.toLowerCase()) ||
                f.reporter.toLowerCase().includes(filterText.toLowerCase())
            );

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="py-12 text-center text-gray-500">
                            <i class="fa-solid fa-folder-open text-3xl mb-2 block opacity-40"></i>
                            No forms found in the system
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = filtered.map(f => `
                <tr class="hover:bg-gray-800/40 transition-all">
                    <td class="py-4 px-4 font-mono text-xs">
                        <span class="text-indigo-400 font-bold block">${escapeHtml(f.id)}</span>
                        <span class="text-gray-500 text-[11px]">${escapeHtml(f.date)}</span>
                    </td>
                    <td class="py-4 px-4 font-medium text-gray-200 max-w-xs truncate">${escapeHtml(f.type)}</td>
                    <td class="py-4 px-4 font-semibold text-police-gold">${escapeHtml(f.suspect)}</td>
                    <td class="py-4 px-4 font-mono text-emerald-400 font-semibold">$${Number(f.fine).toLocaleString()}</td>
                    <td class="py-4 px-4 text-gray-400 text-xs">${escapeHtml(f.reporter)}</td>
                    <td class="py-4 px-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <i class="fa-solid fa-check mr-1 text-[10px]"></i> ${escapeHtml(f.status)}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="viewFormDetail('${f.id}')" title="View Details" class="w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition-all text-sm">
                                👁️
                            </button>
                            <button onclick="deleteForm('${f.id}')" title="Delete Form" class="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-all text-sm">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function filterFormsList() {
            const query = document.getElementById('search-input').value;
            renderFormsTable(query);
        }

        function viewFormDetail(id) {
            const forms = getStoredForms();
            const form = forms.find(f => f.id === id);
            if (!form) return;

            document.getElementById('modal-form-id').innerText = `(${form.id})`;
            document.getElementById('modal-body-content').innerHTML = `
                <div class="grid grid-cols-2 gap-4 pb-3 border-b border-police-border">
                    <div>
                        <span class="text-xs text-gray-500 block">Date Recorded</span>
                        <span class="font-mono text-gray-300">${escapeHtml(form.date)}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 block">Case Status</span>
                        <span class="text-emerald-400 font-semibold">${escapeHtml(form.status)}</span>
                    </div>
                </div>
                <div>
                    <span class="text-xs text-gray-500 block mb-1">Offense Type / Charge</span>
                    <p class="font-semibold text-white bg-gray-900/60 p-2.5 rounded-xl border border-gray-800">${escapeHtml(form.type)}</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <span class="text-xs text-gray-500 block">Suspect Name</span>
                        <span class="font-bold text-police-gold">${escapeHtml(form.suspect)}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500 block">Total Fine</span>
                        <span class="font-mono font-bold text-emerald-400">$${Number(form.fine).toLocaleString()}</span>
                    </div>
                </div>
                <div>
                    <span class="text-xs text-gray-500 block mb-1">Incident Details / Circumstances</span>
                    <p class="text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-xs leading-relaxed min-h-[80px]">${escapeHtml(form.details)}</p>
                </div>
                <div>
                    <span class="text-xs text-gray-500 block">Responsible Officer</span>
                    <span class="text-indigo-400 font-medium">${escapeHtml(form.reporter)}</span>
                </div>
            `;

            const modal = document.getElementById('detail-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeDetailModal() {
            const modal = document.getElementById('detail-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        function deleteForm(id) {
            if (!confirm('Are you sure you want to delete this case report?')) return;
            let forms = getStoredForms();
            forms = forms.filter(f => f.id !== id);
            localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
            renderFormsTable();
            showToast('Form deleted successfully', 'success');
        }

        function getCreateFormHTML() {
            const user = getCurrentUser();
            return `
                <div class="max-w-3xl mx-auto space-y-6">
                    <!-- Page Banner -->
                    <div class="bg-police-card border border-police-border p-6 rounded-2xl shadow-xl flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-file-pen text-indigo-500"></i> Create New Incident Report / Arrest Record
                            </h2>
                            <p class="text-xs text-gray-400 mt-1">Record traffic violations or crimes within the Los Santos area</p>
                        </div>
                        <button onclick="setActiveTab('form-list')" class="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-all">
                            Back
                        </button>
                    </div>

                    <!-- Creation Form -->
                    <form onsubmit="handleCreateForm(event)" class="bg-police-card border border-police-border rounded-2xl shadow-xl p-6 lg:p-8 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Incident Type</label>
                                <select id="form-type" required class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200">
                                    <option value="" disabled selected>-- Select Offense Type --</option>
                                    <option value="Reckless Driving / Running a Red Light">Reckless Driving / Running a Red Light</option>
                                    <option value="Resisting Law Enforcement">Resisting Law Enforcement</option>
                                    <option value="Unauthorized Possession of a Firearm">Unauthorized Possession of a Firearm</option>
                                    <option value="Assault on Officer / Civilian">Assault on Officer / Civilian</option>
                                    <option value="Theft / Robbery">Theft / Robbery</option>
                                    <option value="Drug Trafficking / Illegal Substances">Drug Trafficking / Illegal Substances</option>
                                    <option value="Other (specify in details)">Other (specify in details)</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Suspect Name</label>
                                <input type="text" id="form-suspect" required placeholder="Full name or alias of the suspect" 
                                    class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Total Fine ($)</label>
                                <div class="relative">
                                    <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-emerald-400 font-bold">$</span>
                                    <input type="number" id="form-fine" required min="0" placeholder="0" 
                                        class="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reporting Officer</label>
                                <input type="text" disabled value="${escapeHtml(user.name)} (${escapeHtml(user.callsign)})" 
                                    class="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-400 cursor-not-allowed">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Incident Details & Evidence</label>
                            <textarea id="form-details" required rows="4" placeholder="Describe the incident, date/time/location, or vehicle plate number..." 
                                class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600"></textarea>
                        </div>

                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-police-border">
                            <button type="button" onclick="setActiveTab('form-list')" class="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm rounded-xl transition-all">
                                Cancel
                            </button>
                            <button type="submit" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
                                <i class="fa-solid fa-paper-plane"></i> Save and Submit Form
                            </button>
                        </div>
                    </form>
                </div>
            `;
        }

        function handleCreateForm(e) {
            e.preventDefault();
            const user = getCurrentUser();
            const type = document.getElementById('form-type').value;
            const suspect = document.getElementById('form-suspect').value.trim();
            const fine = document.getElementById('form-fine').value;
            const details = document.getElementById('form-details').value.trim();

            const forms = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS)) || [];
            
            const randomIdNum = Math.floor(1000 + Math.random() * 9000);
            const newForm = {
                id: `REP-${randomIdNum}`,
                reporter: `${user.name} (${user.callsign})`,
                type,
                suspect,
                fine: Number(fine),
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                details,
                status: 'Processed'
            };

            forms.unshift(newForm);
            localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));

            showToast('Case report saved successfully!', 'success');
            activeTab = 'form-list';
            renderDashboardView();
        }


        // ============ LAW CODES (PENAL CODE) MODULE ============
const LAW_CHAPTERS = [{"n":"01","t":"General Provisions & Parties Involved","tth":"หลักทั่วไปและผู้เกี่ยวข้อง","rows":[["§1.02","พยายามกระทำความผิด","—","—","Infraction"],["§1.03","สมคบกระทำความผิด","—","—","Infraction"],["§1.04","ผู้สนับสนุน","—","—","Infraction"],["§1.05","ผู้ช่วยเหลือภายหลัง","—","—","Infraction"],["§1.06","ชักชวนให้ก่ออาชญากรรม","—","—","Infraction"],["§1.07","ปกปิดความผิด","—","—","Infraction"],["§1.08","ทำลายหลักฐาน","—","—","Infraction"],["§1.09","สร้างหลักฐานเท็จ","—","—","Infraction"],["§1.10","ให้ถ้อยคำเท็จ","—","—","Infraction"]]},{"n":"02","t":"Life & Bodily Harm","tth":"ชีวิตและร่างกาย","rows":[["§2.01","ทำร้ายร่างกาย","4 นาที","$2,000","Infraction"],["§2.02","ทำร้ายร่างกายร้ายแรง","10 นาที","$5,000","Misdemeanor"],["§2.03","ทำร้ายด้วยอาวุธ","15 นาที","$10,000","Serious Misdemeanor"],["§2.04","ทำร้ายเจ้าหน้าที่","12 นาที","$7,500","Misdemeanor"],["§2.05","ทำร้ายเจ้าหน้าที่ด้วยอาวุธ","22 นาที","$17,500","Felony"],["§2.06","ทำร้าย EMS/Fire","15 นาที","$10,000","Serious Misdemeanor"],["§2.07","ข่มขู่","5 นาที","$2,500","Misdemeanor"],["§2.08","ขู่ฆ่า","12 นาที","$7,500","Misdemeanor"],["§2.09","หน่วงเหนี่ยว/กักขัง","10 นาที","$7,500","Misdemeanor"],["§2.10","ลักพาตัว","30 นาที","$25,000","Felony"],["§2.11","ลักพาตัวโดยมีอาวุธ","40 นาที","$37,500","Serious Felony"],["§2.12","จับตัวประกัน","40 นาที","$37,500","Serious Felony"],["§2.13","จับเจ้าหน้าที่เป็นตัวประกัน","50 นาที","$50,000","Serious Felony"],["§2.14","ทรมาน","40 นาที","$37,500","Serious Felony"],["§2.15","ทำให้พิการ/เสียอวัยวะ","35 นาที","$30,000","Felony"],["§2.16","ทำร้ายโดยประมาท","8 นาที","$3,750","Misdemeanor"],["§2.17","ทำให้ผู้อื่นถึงแก่ความตายโดยประมาท","25 นาที","$20,000","Felony"],["§2.18","ฆ่าคนโดยไม่เจตนา","30 นาที","$25,000","Felony"],["§2.19","ฆ่าคน","40 นาที","$37,500","Serious Felony"],["§2.20","ฆ่าโดยไตร่ตรองไว้ก่อน","50 นาที","$50,000","Serious Felony"],["§2.21","พยายามฆ่า","30 นาที","$25,000","Felony"],["§2.22","พยายามฆ่าเจ้าหน้าที่","40 นาที","$37,500","Serious Felony"],["§2.23","ฆ่าเจ้าหน้าที่ขณะปฏิบัติหน้าที่","60 นาที","$75,000","Major Felony"],["§2.24","ฆ่าเจ้าหน้าที่รัฐบาลกลาง","60 นาที","$75,000","Major Felony"],["§2.25","ฆ่าหลายราย","75 นาที","$100,000","Major Felony"]]},{"n":"03","t":"Liberty & Harassment","tth":"เสรีภาพและการคุกคาม","rows":[["§3.01","ข่มขู่","5 นาที","$2,500","Misdemeanor"],["§3.02","สะกดรอย","8 นาที","$3,750","Misdemeanor"],["§3.03","สะกดรอยร้ายแรง","12 นาที","$7,500","Misdemeanor"],["§3.04","คุกคามซ้ำ","5 นาที","$2,500","Misdemeanor"],["§3.05","บังคับขู่เข็ญ","10 นาที","$7,500","Misdemeanor"],["§3.06","บังคับให้ก่ออาชญากรรม","15 นาที","$12,500","Serious Misdemeanor"],["§3.07","กักขังโดยมิชอบ","10 นาที","$7,500","Misdemeanor"],["§3.08","เคลื่อนย้ายบุคคลโดยมิชอบ","12 นาที","$10,000","Misdemeanor"],["§3.09","ค้ามนุษย์","50 นาที","$75,000","Serious Felony"],["§3.10","แรงงานบังคับ","35 นาที","$37,500","Felony"]]},{"n":"04","t":"Sexual Offenses","tth":"ความผิดทางเพศ","rows":[["§4.01","คุกคามทางเพศ","15 นาที","$12,500","Serious Misdemeanor"],["§4.02","ล่วงละเมิดทางเพศโดยใช้กำลัง","30 นาที","$25,000","Felony"],["§4.03","ล่วงละเมิดทางเพศโดยมีอาวุธ","40 นาที","$37,500","Serious Felony"],["§4.04","คุกคามทางเพศ","8 นาที","$5,000","Misdemeanor"],["§4.05","บังคับทางเพศ","20 นาที","$15,000","Felony"],["§4.06","ค้ามนุษย์เพื่อการแสวงประโยชน์ทางเพศ","50 นาที","$75,000","Serious Felony"]]},{"n":"05","t":"Property","tth":"ทรัพย์สิน","rows":[["§5.01","ลักทรัพย์","2 นาที","$1,250","Infraction"],["§5.02","ลักทรัพย์มูลค่าสูง","8 นาที","$5,000","Misdemeanor"],["§5.03","ลักของในร้าน","2 นาที","$1,250","Infraction"],["§5.04","ชิงทรัพย์","12 นาที","$10,000","Misdemeanor"],["§5.05","ชิงทรัพย์โดยมีอาวุธ","22 นาที","$17,500","Felony"],["§5.06","ปล้นธนาคาร","30 นาที","$25,000","Felony"],["§5.07","ปล้นธนาคารโดยมีอาวุธ","40 นาที","$37,500","Serious Felony"],["§5.08","ปล้นร้านค้า","12 นาที","$7,500","Misdemeanor"],["§5.09","ปล้นร้านอัญมณี","20 นาที","$15,000","Felony"],["§5.10","บุกรุกที่พักอาศัย","12 นาที","$7,500","Misdemeanor"],["§5.11","บุกรุกธุรกิจ","10 นาที","$7,500","Misdemeanor"],["§5.12","บุกรุกรถ","8 นาที","$5,000","Misdemeanor"],["§5.13","บุกรุกพื้นที่หวงห้าม","5 นาที","$3,750","Misdemeanor"],["§5.14","บุกรุกสถานีตำรวจ","15 นาที","$12,500","Serious Misdemeanor"],["§5.15","บุกรุกเรือนจำ","20 นาที","$20,000","Felony"],["§5.16","บุกรุกเขตหวงห้ามสนามบิน","25 นาที","$25,000","Felony"],["§5.17","ทำลายทรัพย์สิน","5 นาที","$2,500","Misdemeanor"],["§5.18","ทำลายทรัพย์สินรัฐ","12 นาที","$10,000","Misdemeanor"],["§5.19","ทำลายทรัพย์สินตำรวจ","18 นาที","$15,000","Serious Misdemeanor"],["§5.20","ทำลายทรัพย์สิน Fire/EMS","15 นาที","$12,500","Serious Misdemeanor"],["§5.21","พ่นสี/กราฟฟิตี","2 นาที","$1,250","Infraction"],["§5.22","ทำลายทรัพย์สินสาธารณะ","10 นาที","$7,500","Misdemeanor"],["§5.23","ทำลายโครงสร้างพื้นฐานสำคัญ","30 นาที","$37,500","Felony"]]},{"n":"06","t":"Vehicles & Stolen Vehicles","tth":"ยานพาหนะและรถที่ได้มาโดยมิชอบ","rows":[["§6.01","โจรกรรมยานพาหนะ","12 นาที","$10,000","Misdemeanor"],["§6.02","โจรกรรมยานพาหนะร้ายแรง","20 นาที","$15,000","Felony"],["§6.03","จี้รถ","25 นาที","$20,000","Felony"],["§6.04","จี้รถโดยมีอาวุธ","35 นาที","$30,000","Felony"],["§6.05","พยายามขโมยรถ","8 นาที","$5,000","Misdemeanor"],["§6.06","ครอบครองรถโจรกรรม","12 นาที","$10,000","Misdemeanor"],["§6.07","ครอบครองชิ้นส่วนโจรกรรม","8 นาที","$5,000","Misdemeanor"],["§6.08","ดัดแปลง VIN","10 นาที","$7,500","Misdemeanor"],["§6.09","อู่รับรถโจรกรรม","25 นาที","$25,000","Felony"],["§6.10","ขายรถโจรกรรม","15 นาที","$12,500","Serious Misdemeanor"],["§6.11","ขโมยเครื่องยนต์","10 นาที","$7,500","Misdemeanor"],["§6.12","โจรกรรม Catalytic Converter","8 นาที","$5,000","Misdemeanor"],["§6.13","ใช้รถก่ออาชญากรรม","เพิ่มโทษ","ยึดรถได้","Infraction"],["§6.14","ใช้รถหลบหนี","เพิ่มโทษ","ยึดรถได้","Infraction"]]},{"n":"07","t":"Firearms & Dangerous Weapons","tth":"อาวุธปืนและวัตถุอันตราย","rows":[["§7.01","ครอบครองปืนไม่มีใบอนุญาต","10 นาที","$7,500","Misdemeanor"],["§7.02","พกอาวุธไม่มีใบอนุญาต","10 นาที","$7,500","Misdemeanor"],["§7.03","ซ่อนอาวุธผิดกฎหมาย","12 นาที","$10,000","Misdemeanor"],["§7.04","ชักอาวุธข่มขู่","10 นาที","$7,500","Misdemeanor"],["§7.05","เล็งปืนใส่บุคคล","12 นาที","$10,000","Misdemeanor"],["§7.06","ยิงในที่สาธารณะ","10 นาที","$7,500","Misdemeanor"],["§7.07","ยิงโดยประมาท","15 นาที","$12,500","Serious Misdemeanor"],["§7.08","Drive-by Shooting","25 นาที","$25,000","Felony"],["§7.09","ยิงรถที่มีคน","30 นาที","$30,000","Felony"],["§7.10","ยิงอาคารที่มีคน","30 นาที","$30,000","Felony"],["§7.11","ยิงตำรวจ","35 นาที","$37,500","Felony"],["§7.12","ยิง Fire/EMS","30 นาที","$30,000","Felony"],["§7.13","ครอบครองปืนโจรกรรม","15 นาที","$12,500","Serious Misdemeanor"],["§7.14","ขายปืนผิดกฎหมาย","20 นาที","$20,000","Felony"],["§7.15","ค้าอาวุธ","30 นาที","$37,500","Felony"],["§7.16","ผลิตอาวุธผิดกฎหมาย","25 นาที","$25,000","Felony"],["§7.17","ครอบครองอาวุธดัดแปลง","15 นาที","$12,500","Serious Misdemeanor"],["§7.18","ลบเลขประจำอาวุธ","15 นาที","$12,500","Serious Misdemeanor"],["§7.19","ครอบครองวัตถุระเบิด","30 นาที","$37,500","Felony"],["§7.20","ใช้วัตถุระเบิด","45 นาที","$50,000","Serious Felony"],["§7.21","ขู่วางระเบิด","25 นาที","$25,000","Felony"],["§7.22","ครอบครองอุปกรณ์ตำรวจโดยมิชอบ","10 นาที","$7,500","Misdemeanor"],["§7.23","บัตรตำรวจปลอม","12 นาที","$10,000","Misdemeanor"],["§7.24","เครื่องแบบตำรวจปลอม","10 นาที","$7,500","Misdemeanor"],["§7.25","แอบอ้างเป็นตำรวจ","15 นาที","$12,500","Serious Misdemeanor"]]},{"n":"08","t":"Narcotics","tth":"ยาเสพติด","rows":[["§8.01","ครอบครองยาเสพติด","2 นาที","$1,500","Infraction"],["§8.02","ครอบครองปริมาณสูง","8 นาที","$5,000","Misdemeanor"],["§8.03","ครอบครองเพื่อจำหน่าย","10 นาที","$7,500","Misdemeanor"],["§8.04","จำหน่ายยาเสพติด","12 นาที","$10,000","Misdemeanor"],["§8.05","แจกจ่ายยาเสพติด","15 นาที","$12,500","Serious Misdemeanor"],["§8.06","ค้ายาเสพติด","25 นาที","$25,000","Felony"],["§8.07","ค้ายารายใหญ่","38 นาที","$50,000","Felony"],["§8.08","ผลิตยาเสพติด","20 นาที","$20,000","Felony"],["§8.09","ห้องแล็บยา","30 นาที","$30,000","Felony"],["§8.10","ขนส่งยา","15 นาที","$12,500","Serious Misdemeanor"],["§8.11","นำเข้ายา","25 นาที","$25,000","Felony"],["§8.12","ส่งออกยา","25 นาที","$25,000","Felony"],["§8.13","ทรัพย์สินจากยา","15 นาที","$15,000 + ริบ","Serious Misdemeanor"],["§8.14","ฟอกเงินจากยา","30 นาที","$37,500","Felony"],["§8.15","ขายยาในเขตโรงเรียน","เพิ่ม 10 นาที","+$10,000","Misdemeanor"],["§8.16","ขายยาโดยมีอาวุธ","เพิ่ม 15 นาที","—","Serious Misdemeanor"]]},{"n":"09","t":"Traffic","tth":"จราจร","rows":[["§9.01","ขับรถเร็วเกินกำหนด","—","$375","Infraction"],["§9.02","ขับเร็วรุนแรง","—","$1,000","Infraction"],["§9.03","ขับรถโดยประมาท","5 นาที","$2,500","Misdemeanor"],["§9.04","ขับรถอันตราย","8 นาที","$3,750","Misdemeanor"],["§9.05","แข่งรถบนถนน","10 นาที","$7,500 + พักใบขับขี่ 30 วัน RP","Misdemeanor"],["§9.06","แสดงความเร็ว","5 นาที","$3,750","Misdemeanor"],["§9.07","Burnout","—","$1,500","Infraction"],["§9.08","ฝ่าไฟแดง","—","$500","Infraction"],["§9.09","ฝ่าป้ายหยุด","—","$375","Infraction"],["§9.10","ไม่ให้ทาง","—","$375","Infraction"],["§9.11","ขับสวนทาง","—","$750","Infraction"],["§9.12","กลับรถผิดกฎหมาย","—","$375","Infraction"],["§9.13","เปลี่ยนเลนไม่ปลอดภัย","—","$375","Infraction"],["§9.14","ขับจี้ท้าย","—","$375","Infraction"],["§9.15","ใช้โทรศัพท์ขณะขับ","—","$500","Infraction"],["§9.16","ขับบนทางเท้า","—","$750","Infraction"],["§9.17","ขับในเขตคนเดินเท้า","—","$1,000","Infraction"],["§9.18","จอดในที่ห้ามจอด","—","$250","Infraction"],["§9.19","กีดขวางช่องฉุกเฉิน","—","$1,250","Infraction"],["§9.20","จอดขวางหัวดับเพลิง","—","$1,000","Infraction"],["§9.21","จอดช่องคนพิการ","—","$750","Infraction"],["§9.22","จอดกีดขวางแยก","—","$375","Infraction"],["§9.23","ป้ายทะเบียนปลอม","8 นาที","$5,000","Misdemeanor"],["§9.24","ไม่มีป้ายทะเบียน","—","$750","Infraction"],["§9.25","ป้ายทะเบียนไม่ตรงรถ","5 นาที","$3,750","Infraction"],["§9.26","ไม่มีทะเบียนรถ","—","$1,000","Infraction"],["§9.27","ไม่มีใบขับขี่","5 นาที","$2,500","Misdemeanor"],["§9.28","ใบขับขี่ถูกพัก","8 นาที","$3,750","Misdemeanor"],["§9.29","ใบขับขี่ถูกเพิกถอน","10 นาที","$5,000","Misdemeanor"]]},{"n":"10","t":"Driving Under the Influence","tth":"เมาแล้วขับ","rows":[["§10.01","DUI","8 นาที","$5,000","Misdemeanor"],["§10.02","DUI ซ้ำ","15 นาที","$10,000","Serious Misdemeanor"],["§10.03","DUI ทำให้บาดเจ็บ","15 นาที","$12,500","Serious Misdemeanor"],["§10.04","DUI ทำให้เสียชีวิต","35 นาที","$37,500","Felony"],["§10.05","ขับรถขณะได้รับอิทธิพลยา","10 นาที","$7,500","Misdemeanor"],["§10.06","ปฏิเสธการตรวจ","—","$2,500","Infraction"],["§10.07","จัดคนขับแทนเพื่อหลบ DUI","5 นาที","$3,750","Misdemeanor"]]},{"n":"11","t":"Evading Officers","tth":"หลบหนีเจ้าหน้าที่","rows":[["§11.01","ไม่หยุดตามคำสั่ง","5 นาที","$2,500","Misdemeanor"],["§11.02","หลบหนีด้วยเท้า","4 นาที","$2,000","Infraction"],["§11.03","หลบหนีด้วยรถ","10 นาที","$7,500","Misdemeanor"],["§11.04","หลบหนีด้วยมอเตอร์ไซค์","10 นาที","$7,500","Misdemeanor"],["§11.05","หลบหนีโดยประมาทร้ายแรง","15 นาที","$12,500","Serious Misdemeanor"],["§11.06","หลบหนีในเขตคนเดิน","18 นาที","$15,000","Serious Misdemeanor"],["§11.07","หลบหนีทำให้บาดเจ็บ","22 นาที","$20,000","Felony"],["§11.08","หลบหนีทำให้เสียชีวิต","35 นาที","$37,500","Felony"],["§11.09","หลบหนีซ้ำ","เพิ่ม 10 นาที","—","Misdemeanor"]]},{"n":"12","t":"Police & Officers","tth":"ตำรวจและเจ้าหน้าที่","rows":[["§12.01","ขัดขืนการจับกุม","5 นาที","$2,500","Misdemeanor"],["§12.02","ขัดขวางเจ้าหน้าที่","5 นาที","$2,500","Misdemeanor"],["§12.03","แทรกแซงการปฏิบัติหน้าที่","8 นาที","$5,000","Misdemeanor"],["§12.04","ช่วยผู้ต้องหาหลบหนี","12 นาที","$10,000","Misdemeanor"],["§12.05","ช่วยนักโทษหลบหนี","20 นาที","$17,500","Felony"],["§12.06","หลบหนีการควบคุม","15 นาที","$12,500","Serious Misdemeanor"],["§12.07","แหกคุก","25 นาที","$25,000","Felony"],["§12.08","แอบอ้างเป็นเจ้าหน้าที่","15 นาที","$12,500","Serious Misdemeanor"],["§12.09","บัตรราชการปลอม","12 นาที","$10,000","Misdemeanor"],["§12.10","เอกสารราชการปลอม","15 นาที","$12,500","Serious Misdemeanor"],["§12.11","ติดสินบนเจ้าหน้าที่","15 นาที","$15,000","Serious Misdemeanor"],["§12.12","รับสินบน","25 นาที","$25,000","Felony"],["§12.13","ทุจริตในหน้าที่","25 นาที","$25,000","Felony"],["§12.14","ใช้อำนาจโดยมิชอบ","20 นาที","$20,000","Felony"],["§12.15","ลักทรัพย์ของรัฐ","20 นาที","$20,000","Felony"],["§12.16","ทำลายทรัพย์สินรัฐ","15 นาที","$12,500","Serious Misdemeanor"],["§12.17","แทรกแซงการสอบสวน","12 นาที","$10,000","Misdemeanor"],["§12.18","แทรกแซงพยาน","15 นาที","$12,500","Serious Misdemeanor"],["§12.19","ข่มขู่พยาน","20 นาที","$17,500","Felony"],["§12.20","ให้การเท็จ","15 นาที","$12,500","Serious Misdemeanor"],["§12.21","สร้างหลักฐานปลอม","20 นาที","$20,000","Felony"]]},{"n":"13","t":"Court","tth":"ศาล","rows":[["§13.01","ไม่มาตามหมายศาล","5 นาที","$2,500","Misdemeanor"],["§13.02","ฝ่าฝืนคำสั่งศาล","8 นาที","$5,000","Misdemeanor"],["§13.03","ละเมิดอำนาจศาล","5 นาที","$2,500","Misdemeanor"],["§13.04","ปลอมเอกสารศาล","15 นาที","$12,500","Serious Misdemeanor"],["§13.05","ข่มขู่พยาน","20 นาที","$17,500","Felony"],["§13.06","ข่มขู่เจ้าหน้าที่ศาล","20 นาที","$17,500","Felony"],["§13.07","แทรกแซงคดี","20 นาที","$20,000","Felony"],["§13.08","สร้างพยานหลักฐานศาลปลอม","25 นาที","$25,000","Felony"],["§13.09","แอบอ้างเป็นทนาย/อัยการ/ผู้พิพากษา","15 นาที","$12,500","Serious Misdemeanor"],["§13.10","ฝ่าฝืนคำสั่งห้ามติดต่อ","8 นาที","$5,000","Misdemeanor"]]},{"n":"14","t":"Public Order","tth":"ความสงบเรียบร้อย","rows":[["§14.01","ก่อความวุ่นวาย","2 นาที","$1,250","Infraction"],["§14.02","ทะเลาะวิวาทในที่สาธารณะ","4 นาที","$2,000","Infraction"],["§14.03","รวมกลุ่มก่อความไม่สงบ","5 นาที","$2,500","Misdemeanor"],["§14.04","จลาจล","15 นาที","$12,500","Serious Misdemeanor"],["§14.05","ยุยงจลาจล","12 นาที","$10,000","Misdemeanor"],["§14.06","กีดขวางทางสาธารณะ","—","$500","Infraction"],["§14.07","ก่อเสียงรบกวน","—","$500","Infraction"],["§14.08","ก่อเหตุรำคาญ","—","$750","Infraction"],["§14.09","เข้าเขตหวงห้าม","—","$1,500","Infraction"],["§14.10","ไม่ยอมออกจากพื้นที่","5 นาที","$2,500","Misdemeanor"],["§14.11","กีดขวางที่เกิดเหตุ","8 นาที","$5,000","Misdemeanor"],["§14.12","เข้า Crime Scene โดยไม่ได้รับอนุญาต","8 นาที","$5,000","Misdemeanor"],["§14.13","ทำลาย Crime Scene","12 นาที","$10,000","Misdemeanor"]]},{"n":"15","t":"Fire & Explosives","tth":"เพลิงไหม้และวัตถุระเบิด","rows":[["§15.01","วางเพลิง","20 นาที","$17,500","Felony"],["§15.02","วางเพลิงร้ายแรง","35 นาที","$37,500","Felony"],["§15.03","พยายามวางเพลิง","12 นาที","$10,000","Misdemeanor"],["§15.04","ครอบครองระเบิด","30 นาที","$37,500","Felony"],["§15.05","ใช้ระเบิด","45 นาที","$50,000","Serious Felony"],["§15.06","ขู่วางระเบิด","25 นาที","$25,000","Felony"],["§15.07","แจ้งเหตุระเบิดเท็จ","15 นาที","$12,500","Serious Misdemeanor"],["§15.08","ก่อเพลิงโดยประมาท","10 นาที","$7,500","Misdemeanor"],["§15.09","ทำลายระบบสาธารณูปโภค","30 นาที","$37,500","Felony"],["§15.10","ทำให้คนจำนวนมากตกอยู่ในอันตราย","40 นาที","$50,000","Serious Felony"]]},{"n":"16","t":"Organized Crime","tth":"องค์กรอาชญากรรม","rows":[["§16.01","จัดตั้งองค์กรอาชญากรรม","20 นาที","$20,000","Felony"],["§16.02","สมาชิกองค์กรอาชญากรรม","10 นาที","$7,500","Misdemeanor"],["§16.03","ผู้นำองค์กรอาชญากรรม","40 นาที","$50,000","Serious Felony"],["§16.04","รับสมัครสมาชิก","10 นาที","$7,500","Misdemeanor"],["§16.05","ควบคุมพื้นที่","20 นาที","$20,000","Felony"],["§16.06","ฟอกเงินองค์กร","30 นาที","$37,500","Felony"],["§16.07","ค้ายาเป็นองค์กร","35 นาที","$50,000","Felony"],["§16.08","ค้าอาวุธเป็นองค์กร","35 นาที","$50,000","Felony"],["§16.09","ปล้นร่วมกัน","25 นาที","$25,000","Felony"],["§16.10","กรรโชกเป็นองค์กร","25 นาที","$25,000","Felony"],["§16.11","จ้างมือปืน","35 นาที","$37,500","Felony"],["§16.12","ฆ่าโดยการจ้างวาน","45 นาที","$50,000","Serious Felony"]]},{"n":"17","t":"Fraud & Financial Crime","tth":"ฉ้อโกงและการเงิน","rows":[["§17.01","ฉ้อโกง","8 นาที","$5,000","Misdemeanor"],["§17.02","ฉ้อโกงทางการเงิน","12 นาที","$10,000","Misdemeanor"],["§17.03","ขโมยข้อมูลตัวตน","12 นาที","$10,000","Misdemeanor"],["§17.04","บัตรประชาชนปลอม","10 นาที","$7,500","Misdemeanor"],["§17.05","ใบอนุญาตปลอม","10 นาที","$7,500","Misdemeanor"],["§17.06","เอกสารปลอม","10 นาที","$7,500","Misdemeanor"],["§17.07","เงินปลอม","15 นาที","$15,000","Serious Misdemeanor"],["§17.08","ฟอกเงิน","25 นาที","$25,000","Felony"],["§17.09","ฟอกเงินระดับองค์กร","40 นาที","$50,000","Serious Felony"],["§17.10","ฉ้อโกงประกัน","10 นาที","$7,500","Misdemeanor"],["§17.11","ฉ้อโกงธนาคาร","20 นาที","$20,000","Felony"],["§17.12","ฉ้อโกงดิจิทัล","15 นาที","$12,500","Serious Misdemeanor"]]},{"n":"18","t":"Cyber Crime","tth":"อาชญากรรมไซเบอร์","rows":[["§18.01","เข้าถึงระบบโดยไม่ได้รับอนุญาต","10 นาที","$7,500","Misdemeanor"],["§18.02","Hacking","15 นาที","$12,500","Serious Misdemeanor"],["§18.03","เจาะระบบตำรวจ","25 นาที","$25,000","Felony"],["§18.04","เจาะระบบรัฐบาล","25 นาที","$25,000","Felony"],["§18.05","เจาะระบบธนาคาร","30 นาที","$37,500","Felony"],["§18.06","ขโมยข้อมูล","12 นาที","$10,000","Misdemeanor"],["§18.07","ขโมยข้อมูลตำรวจ","25 นาที","$25,000","Felony"],["§18.08","แก้ไขข้อมูล MDT","20 นาที","$20,000","Felony"],["§18.09","ลบหลักฐานดิจิทัล","20 นาที","$20,000","Felony"],["§18.10","Ransomware","30 นาที","$37,500","Felony"],["§18.11","ใช้ข้อมูลส่วนบุคคลโดยมิชอบ","12 นาที","$10,000","Misdemeanor"]]},{"n":"19","t":"Business & Licensing","tth":"ธุรกิจและใบอนุญาต","rows":[["§19.01","ประกอบธุรกิจไม่มีใบอนุญาต","—","$2,500","Infraction"],["§19.02","ใบอนุญาตธุรกิจปลอม","10 นาที","$7,500","Misdemeanor"],["§19.03","ใบอนุญาตหมดอายุ","—","$1,250","Infraction"],["§19.04","ฝ่าฝืนเงื่อนไขใบอนุญาต","—","$2,500","Infraction"],["§19.05","เปิดกิจการที่ถูกสั่งปิด","10 นาที","$7,500","Misdemeanor"],["§19.06","ขายสินค้าโดยไม่มีใบอนุญาต","—","$2,500","Infraction"],["§19.07","ประกอบธุรกิจต้องห้าม","15 นาที","$12,500","Serious Misdemeanor"],["§19.08","ขายอาวุธไม่มีใบอนุญาต","20 นาที","$20,000","Misdemeanor"],["§19.09","ขายยาไม่มีใบอนุญาต","20 นาที","$20,000","Misdemeanor"],["§19.10","ธุรกิจบังหน้าอาชญากรรม","25 นาที","$25,000 + เพิกถอนใบอนุญาต","Felony"]]},{"n":"20","t":"Public Transport","tth":"ขนส่งสาธารณะ","rows":[["§20.01","แท็กซี่ไม่มีใบอนุญาต","—","$2,500","Infraction"],["§20.02","ใบอนุญาตแท็กซี่ปลอม","10 นาที","$7,500","Misdemeanor"],["§20.03","ฝ่าฝืนกฎแท็กซี่","—","$1,500","Infraction"],["§20.04","เรียกเก็บค่าโดยสารเกิน","—","$2,500","Infraction"],["§20.05","ขนส่งสาธารณะไม่มีใบอนุญาต","—","$2,500","Infraction"],["§20.06","ใช้รถฉุกเฉินโดยมิชอบ","15 นาที","$12,500","Serious Misdemeanor"],["§20.07","แอบอ้างเป็น EMS","20 นาที","$20,000","Felony"]]},{"n":"21","t":"Airport & Port","tth":"สนามบินและท่าเรือ","rows":[["§21.01","บุกรุกสนามบิน","15 นาที","$12,500","Serious Misdemeanor"],["§21.02","เข้าเขตสนามบินหวงห้าม","25 นาที","$25,000","Felony"],["§21.03","รบกวนเที่ยวบิน","35 นาที","$37,500","Felony"],["§21.04","อาวุธในเขตหวงห้าม","25 นาที","$25,000","Felony"],["§21.05","ระเบิดสนามบิน","50 นาที","$75,000","Serious Felony"],["§21.06","บุกรุกท่าเรือ","15 นาที","$12,500","Serious Misdemeanor"],["§21.07","ลักลอบขนของท่าเรือ","25 นาที","$25,000","Felony"],["§21.08","ลักลอบขนอาวุธ","40 นาที","$50,000","Serious Felony"],["§21.09","ลักลอบขนยา","35 นาที","$50,000","Felony"]]},{"n":"22","t":"Drones & Technology","tth":"โดรนและเทคโนโลยี","rows":[["§22.01","ใช้โดรนผิดกฎหมาย","—","$2,500","Infraction"],["§22.02","ใช้โดรนในพื้นที่หวงห้าม","10 นาที","$7,500","Misdemeanor"],["§22.03","โดรนในเขตสนามบิน","25 นาที","$25,000","Felony"],["§22.04","ใช้โดรนสอดแนม","12 นาที","$10,000","Misdemeanor"],["§22.05","ใช้โดรนก่ออาชญากรรม","20 นาที","$20,000","Felony"],["§22.06","โจมตีด้วยโดรน","35 นาที","$37,500","Felony"]]},{"n":"23","t":"Emergency Services","tth":"บริการฉุกเฉิน","rows":[["§23.01","แจ้งเหตุเท็จ","2 นาที","$1,500","Infraction"],["§23.02","ใช้สายฉุกเฉินในทางมิชอบ","—","$1,250","Infraction"],["§23.03","แจ้งเหตุยิงเท็จ","5 นาที","$3,750","Misdemeanor"],["§23.04","แจ้งเหตุระเบิดเท็จ","15 นาที","$12,500","Serious Misdemeanor"],["§23.05","แจ้งเหตุไฟไหม้เท็จ","8 นาที","$5,000","Misdemeanor"],["§23.06","ขัดขวาง EMS","8 นาที","$5,000","Misdemeanor"],["§23.07","ขัดขวาง Fire","8 นาที","$5,000","Misdemeanor"],["§23.08","ขัดขวางตำรวจ","8 นาที","$5,000","Misdemeanor"]]},{"n":"24","t":"Animals & Environment","tth":"สัตว์และสิ่งแวดล้อม","rows":[["§24.01","ทารุณกรรมสัตว์","5 นาที","$2,500","Misdemeanor"],["§24.02","ปล่อยสัตว์อันตรายโดยประมาท","5 นาที","$3,750","Misdemeanor"],["§24.03","จัดให้มีการต่อสู้สัตว์","12 นาที","$10,000","Misdemeanor"],["§24.04","ค้าสัตว์ผิดกฎหมาย","15 นาที","$12,500","Serious Misdemeanor"],["§24.05","ทิ้งของเสียอันตราย","15 นาที","$15,000","Serious Misdemeanor"],["§24.06","ทิ้งขยะผิดกฎหมาย","—","$1,500","Infraction"],["§24.07","ปล่อยสารพิษ","25 นาที","$25,000","Felony"],["§24.08","ทำลายทรัพยากรสาธารณะ","10 นาที","$7,500","Misdemeanor"]]},{"n":"25","t":"Additional Penalties & Forfeiture","tth":"โทษเพิ่มเติมและการริบทรัพย์","rows":[["§25.01","ยึดอาวุธ","เพิ่มเติม","ยึดอาวุธ","Infraction"],["§25.02","ยึดยาเสพติด","เพิ่มเติม","ยึดของกลาง","Infraction"],["§25.03","ริบทรัพย์จากอาชญากรรม","ศาลพิจารณา","ริบทรัพย์","Infraction"],["§25.04","ยึดรถที่ใช้ก่อคดีร้ายแรง","เพิ่มเติม","ยึดรถ","Infraction"],["§25.05","ริบรถ","ตามศาล","ริบรถ","Infraction"],["§25.06","ริบทรัพย์สิน","ตามศาล","ริบทรัพย์","Infraction"],["§25.07","พักใบอนุญาต","7–30 วัน RP","พักใบอนุญาต","Misdemeanor"],["§25.08","เพิกถอนใบอนุญาต","30–90 วัน RP","เพิกถอน","Misdemeanor"],["§25.09","พักใบอนุญาตอาวุธ","ตามคำสั่ง","พักสิทธิ","Infraction"],["§25.10","เพิกถอนใบอนุญาตอาวุธ","ตามคำสั่ง","เพิกถอน","Infraction"],["§25.11","พักใบอนุญาตธุรกิจ","ตามคำสั่ง","พักกิจการ","Infraction"],["§25.12","เพิกถอนใบอนุญาตธุรกิจ","ตามคำสั่ง","เพิกถอน","Infraction"],["§25.13","ชดใช้ผู้เสียหาย","เพิ่มเติม","Restitution","Infraction"],["§25.14","บริการสาธารณะ","ตามคำสั่ง","Community Service","Infraction"],["§25.15","คุมประพฤติ","ตามคำสั่ง","Probation","Infraction"],["§25.16","เขตห้ามเข้า","ตามคำสั่ง","Exclusion Zone","Infraction"],["§25.17","คำสั่งห้ามติดต่อ","ตามคำสั่ง","No-Contact Order","Infraction"],["§25.18","ประวัติอาชญากรรม","ตามสถานะคดี","Criminal Record","Infraction"]]},{"n":"26","t":"Aggravating Factors","tth":"เหตุเพิ่มโทษ","rows":[["§26.01","ใช้อาวุธ","เพิ่ม 10 นาที","+$10,000","Misdemeanor"],["§26.02","มีการยิง","เพิ่ม 15 นาที","+$15,000","Serious Misdemeanor"],["§26.03","ทำให้บาดเจ็บ","เพิ่ม 8 นาที","+$5,000","Misdemeanor"],["§26.04","บาดเจ็บสาหัส","เพิ่ม 12 นาที","+$10,000","Misdemeanor"],["§26.05","มีผู้เสียชีวิต","เพิ่ม 25 นาที","+$25,000","Felony"],["§26.06","ผู้เสียหายเป็นเจ้าหน้าที่","เพิ่ม 12 นาที","+$12,500","Misdemeanor"],["§26.07","ผู้เสียหายเป็น Fire/EMS","เพิ่ม 12 นาที","+$12,500","Misdemeanor"],["§26.08","ใช้รถเป็นอาวุธ","เพิ่ม 15 นาที","+$12,500","Serious Misdemeanor"],["§26.09","ร่วมกันหลายคน","เพิ่ม 8 นาที","+$7,500","Misdemeanor"],["§26.10","เกี่ยวข้องกับแก๊ง","เพิ่ม 10 นาที","+$10,000","Misdemeanor"],["§26.11","เกี่ยวข้องกับองค์กรอาชญากรรม","เพิ่ม 15 นาที","+$15,000","Serious Misdemeanor"],["§26.12","กระทำผิดซ้ำ","เพิ่ม 25%","เพิ่ม 25%","Felony"],["§26.13","ผู้กระทำผิดซ้ำเป็นนิสัย","เพิ่ม 50%","เพิ่ม 50%","Serious Felony"],["§26.14","เกิดในสถานที่ราชการ","เพิ่ม 8 นาที","—","Misdemeanor"],["§26.15","เกิดในโรงพยาบาล","เพิ่ม 8 นาที","—","Misdemeanor"],["§26.16","เกิดในสนามบิน","เพิ่ม 12 นาที","—","Misdemeanor"],["§26.17","เกิดในโรงเรียน","เพิ่ม 12 นาที","—","Misdemeanor"]]},{"n":"27","t":"Incarceration System","tth":"ระบบจำคุก","rows":[["§27.01","อัตราเวลาจำคุก","1 เดือน = 1 นาทีจริง","—","Infraction"],["§27.02","เพดานการลงโทษโดยเจ้าหน้าที่","Citation $250–10k / Misdemeanor ≤30 / Felony ≤60 / Serious ≤90","ตามประเภท","Special Crime"]]},{"n":"28","t":"Sentencing Consolidation","tth":"การรวมโทษ","rows":[["§28.01","หลายข้อหาในเหตุเดียว","ตามแต่ละข้อหา","ตามแต่ละข้อหา","Infraction"],["§28.02","ลงโทษพร้อมกัน Concurrent","ใช้เวลาสูงสุดเป็นหลัก","ตามแต่ละข้อหา","Infraction"],["§28.03","ลงโทษต่อเนื่อง Consecutive","รวมเวลาทั้งหมด","รวมค่าปรับ","Infraction"],["§28.04","คดีร้ายแรงส่งศาล","ศาลกำหนด","ศาลกำหนด","Infraction"]]},{"n":"29","t":"Evidence","tth":"หลักฐาน","rows":[["§29.01","พยานบุคคล","—","—","Infraction"],["§29.02","CCTV/Bodycam/Dashcam","—","—","Infraction"],["§29.03","หลักฐานดิจิทัล","—","—","Infraction"],["§29.04","อาวุธ","—","ยึด/บันทึก","Infraction"],["§29.05","ยาเสพติด","—","ยึด/บันทึก","Infraction"],["§29.06","เงิน","—","ยึด/คืน/ริบ","Infraction"],["§29.07","ยานพาหนะ","—","ยึด/Impound","Infraction"],["§29.08","Chain of Custody","—","บันทึกผู้รับ-ส่ง","Infraction"]]},{"n":"30","t":"Warrants & Court Authority","tth":"หมายและอำนาจศาล","rows":[["§30.01","หมายจับ","ตามหมาย","—","Infraction"],["§30.02","หมายค้น","ตามหมาย","—","Infraction"],["§30.03","หมายยึด","ตามหมาย","—","Infraction"],["§30.04","หมายเรียก","ตามหมาย","—","Infraction"],["§30.05","หมายจับผู้ไม่มาศาล","ตามหมาย","—","Infraction"],["§30.06","ค้นฉุกเฉิน","ฉุกเฉิน","—","Infraction"]]},{"n":"31","t":"Licensing","tth":"ใบอนุญาต","rows":[["§31.01","ใบขับขี่","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.02","ใบอนุญาตอาวุธ","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.03","ใบอนุญาตธุรกิจ","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.04","ใบอนุญาตแท็กซี่","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.05","ใบอนุญาตรถลาก/รถยก","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.06","ใบอนุญาตรักษาความปลอดภัย","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.07","ใบอนุญาตนักสืบ","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.08","ใบอนุญาตการแพทย์","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.09","ใบอนุญาตการบิน","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"],["§31.10","ใบอนุญาตรถพาณิชย์","ตามใบอนุญาต","พัก/เพิกถอน","Infraction"]]},{"n":"32","t":"Officer Use of Force","tth":"การใช้กำลังของเจ้าหน้าที่","rows":[["§32.01","การใช้กำลังตามสมควร","ตามนโยบาย","—","Infraction"],["§32.02","Less-Lethal","ตามนโยบาย","—","Infraction"],["§32.03","Deadly Force","ตามนโยบาย","—","Infraction"],["§32.04","การช่วยเหลือทางการแพทย์","—","—","Infraction"],["§32.05","ใช้กำลังเกินกว่าเหตุ","สอบสวน","วินัย/โทษตามผลสอบ","Infraction"]]},{"n":"33","t":"Internal Officer Misconduct","tth":"ความผิดภายในของเจ้าหน้าที่","rows":[["§33.01","ทุจริตในหน้าที่","25 นาที","$25,000 + ปลด","Felony"],["§33.02","รับ/ให้สินบน","25 นาที","$25,000 + ปลด","Felony"],["§33.03","ขายข้อมูลคดี","20 นาที","$20,000 + ปลด","Felony"],["§33.04","เปิดเผยของกลาง","20 นาที","$20,000 + ปลด","Felony"],["§33.05","ขโมยของกลาง","30 นาที","$30,000 + ปลด","Felony"],["§33.06","ปลอมรายงาน","15 นาที","$12,500 + พักงาน","Serious Misdemeanor"],["§33.07","สร้างหลักฐานเท็จ","25 นาที","$25,000 + ปลด","Felony"],["§33.08","ใช้อำนาจโดยมิชอบ","20 นาที","$20,000 + พัก/ปลด","Felony"],["§33.09","ใช้ MDT โดยมิชอบ","15 นาที","$12,500","Serious Misdemeanor"],["§33.10","เปิดเผยข้อมูลลับ","15 นาที","$12,500","Serious Misdemeanor"],["§33.11","ช่วยผู้ต้องหาหลบหนี","25 นาที","$25,000 + ปลด","Felony"],["§33.12","ทำลายหลักฐาน","30 นาที","$30,000 + ปลด","Felony"],["§33.13","ข่มขู่พยาน","20 นาที","$20,000 + ปลด","Felony"],["§33.14","แทรกแซงคดี","20 นาที","$20,000","Felony"],["§33.15","อ้างคำสั่งผู้บังคับบัญชาเท็จ","15 นาที","$12,500","Serious Misdemeanor"]]},{"n":"34","t":"Administrative Penalties","tth":"โทษทางปกครอง","rows":[["§34.01","คำเตือน","0","คำเตือน","Infraction"],["§34.02","ใบสั่ง","0","$125–$1,250","Infraction"],["§34.03","ค่าปรับหนัก","0","$1,250–$5,000","Infraction"],["§34.04","พักใบอนุญาต","7–30 วัน RP","พักใบอนุญาต","Misdemeanor"],["§34.05","เพิกถอนใบอนุญาต","30–90 วัน RP","เพิกถอน","Misdemeanor"],["§34.06","ยึดรถชั่วคราว","24 ชม.–7 วัน RP","Impound","Felony"],["§34.07","ริบทรัพย์","ตามศาล","ริบ","Infraction"],["§34.08","จำคุก","ตามข้อหา","ตามข้อหา","Infraction"]]},{"n":"35","t":"Severity Levels","tth":"ระดับความรุนแรง","rows":[["§35.01","Civil","1 นาที","$125–$1,250","Infraction"],["§35.02","Infraction","0–2 นาที","$250–$2,500","Infraction"],["§35.03","Misdemeanor","5–10 นาที","$1,250–$7,500","Misdemeanor"],["§35.04","Serious Misdemeanor","15–15 นาที","$2,500–$12,500","Serious Misdemeanor"],["§35.05","Felony","20–30 นาที","$5,000–$37,500","Felony"],["§35.06","Serious Felony","40–45 นาที","$12,500–$50,000","Serious Felony"],["§35.07","Major Felony","60–60 นาที","$25,000–$100,000","Major Felony"],["§35.08","Special Crime","120+ นาที","ศาลกำหนด","Special Crime"]]},{"n":"36","t":"Required MDT Information","tth":"ข้อมูลที่ต้องลง MDT","rows":[["§36.01","เลขคดี","—","บังคับ","Infraction"],["§36.02","เลขจับกุม","—","บังคับ","Infraction"],["§36.03","ข้อมูลผู้ต้องหา","—","บังคับ","Infraction"],["§36.04","ข้อหาและมาตรา","—","บังคับ","Infraction"],["§36.05","ค่าปรับและจำคุก","—","บังคับ","Infraction"],["§36.06","ของกลาง","—","บังคับ","Infraction"],["§36.07","เจ้าหน้าที่ผู้จับกุม","—","บังคับ","Infraction"],["§36.08","หลักฐาน","—","บังคับ","Infraction"],["§36.09","พยาน","—","บังคับ","Infraction"],["§36.10","สถานะคดี OPEN/CLOSED/COURT/WARRANT","—","บังคับ","Infraction"],["§36.11","หมายเหตุ","—","บังคับ","Infraction"]]},{"n":"37","t":"Loophole Closure Provisions","tth":"บทปิดช่องโหว่","rows":[["§37.01","หลายข้อหา","ตามแต่ละข้อหา","ตามแต่ละข้อหา","Infraction"],["§37.02","ความผิดเป็นอิสระ","ตามแต่ละข้อหา","ตามแต่ละข้อหา","Infraction"],["§37.03","ความผิดระหว่างก่อเหตุ","เพิ่มตามข้อหา","เพิ่มตามข้อหา","Infraction"],["§37.04","เหตุเพิ่มโทษอาวุธ","เพิ่มโทษ","เพิ่มค่าปรับ","Infraction"],["§37.05","บทบาทผู้ร่วมกระทำ","ตามบทบาท","ตามบทบาท","Infraction"],["§37.06","ช่วยหลังเกิดเหตุ","ตามข้อหา","ตามข้อหา","Infraction"],["§37.07","หลบหนี","เพิ่มตาม §11/§12","เพิ่มตามข้อหา","Misdemeanor"],["§37.08","ทำลายหลักฐาน","เพิ่มตามมาตรา","เพิ่มตามข้อหา","Infraction"],["§37.09","ให้ข้อมูลเท็จ","เพิ่มตามมาตรา","เพิ่มตามข้อหา","Infraction"],["§37.10","ยึดยานพาหนะ","ตามศาล","ยึด/ริบ","Infraction"],["§37.11","รถเป็นอาวุธ","เพิ่ม 15 นาที","+$12,500","Serious Misdemeanor"],["§37.12","ผู้กระทำผิดซ้ำ","+25%/+50%","+25%/+50%","Felony"],["§37.13","องค์กรอาชญากรรม","เพิ่มตาม §26","เพิ่มตาม §26","Felony"],["§37.14","เหยื่อเป็นเจ้าหน้าที่","เพิ่ม 12 นาที","+$12,500","Misdemeanor"],["§37.15","มีผู้เสียชีวิต","เพิ่ม 25 นาที","+$25,000","Felony"],["§37.16","หลายผู้เสียหาย","ตามคดี","ตามคดี","Infraction"],["§37.17","พื้นที่หวงห้าม","ตามพื้นที่","ตามพื้นที่","Infraction"]]}];

        const LEVEL_STYLES = {
            'Infraction':            { badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',   bar: 'bg-slate-500' },
            'Misdemeanor':           { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',   bar: 'bg-amber-500' },
            'Serious Misdemeanor':   { badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', bar: 'bg-orange-500' },
            'Felony':                { badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',      bar: 'bg-rose-500' },
            'Serious Felony':        { badge: 'bg-red-600/20 text-red-300 border-red-600/40',         bar: 'bg-red-600' },
            'Major Felony':          { badge: 'bg-red-800/30 text-red-200 border-red-700/50',         bar: 'bg-red-800' },
            'Special Crime':         { badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30', bar: 'bg-violet-500' }
        };

        function levelStyle(level) {
            return LEVEL_STYLES[level] || { badge: 'bg-gray-500/15 text-gray-300 border-gray-500/30', bar: 'bg-gray-500' };
        }

        function getLawCodesHTML() {
            return `
                <div class="space-y-6">
                    <!-- Page Banner Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-police-card border border-police-border p-6 rounded-2xl shadow-xl">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-scale-balanced text-indigo-500"></i> Los Santos Penal Code
                            </h2>
                            <p class="text-xs text-gray-400 mt-1">Full statute reference &mdash; ${LAW_CHAPTERS.reduce((a,c) => a + c.rows.length, 0)} sections across ${LAW_CHAPTERS.length} chapters. Colors indicate charge severity.</p>
                        </div>
                        <div class="relative flex-1 md:w-80">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                <i class="fa-solid fa-magnifying-glass text-xs"></i>
                            </span>
                            <input type="text" id="law-search-input" oninput="filterLawCodes()" placeholder="Search statute code or offense..."
                                class="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500">
                        </div>
                    </div>

                    <!-- Legend -->
                    <div class="flex flex-wrap gap-2 bg-police-card border border-police-border p-4 rounded-2xl shadow-xl">
                        ${Object.keys(LEVEL_STYLES).map(lvl => `
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${levelStyle(lvl).badge}">
                                <span class="w-1.5 h-1.5 rounded-full ${levelStyle(lvl).bar}"></span> ${lvl}
                            </span>
                        `).join('')}
                    </div>

                    <!-- Chapters -->
                    <div id="law-chapters-container" class="space-y-3"></div>
                </div>
            `;
        }

        function initLawCodesEvents() {
            renderLawChapters();
        }

        function renderLawChapters(filterText = '') {
            const container = document.getElementById('law-chapters-container');
            if (!container) return;
            const q = filterText.trim().toLowerCase();

            const html = LAW_CHAPTERS.map(chapter => {
                const rows = q
                    ? chapter.rows.filter(r =>
                        r[0].toLowerCase().includes(q) ||
                        r[1].toLowerCase().includes(q) ||
                        r[4].toLowerCase().includes(q))
                    : chapter.rows;

                if (rows.length === 0) return '';

                const rowsHtml = rows.map(r => {
                    const [code, offense, jail, fine, level] = r;
                    const style = levelStyle(level);
                    return `
                        <div class="relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl bg-gray-900/40 hover:bg-gray-900/70 border border-gray-800/80 transition-all overflow-hidden">
                            <span class="absolute left-0 top-0 bottom-0 w-1 ${style.bar}"></span>
                            <span class="font-mono text-[11px] text-indigo-400 font-bold w-16 shrink-0">${escapeHtml(code)}</span>
                            <span class="flex-1 text-xs text-gray-200 font-medium min-w-[140px]">${escapeHtml(offense)}</span>
                            <span class="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-400 w-28 shrink-0">
                                <i class="fa-regular fa-clock text-[10px] text-gray-500"></i> ${escapeHtml(jail)}
                            </span>
                            <span class="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono w-36 shrink-0 truncate" title="${escapeHtml(fine)}">
                                <i class="fa-solid fa-sack-dollar text-[10px] text-emerald-600"></i> ${escapeHtml(fine)}
                            </span>
                            <span class="inline-flex items-center justify-center px-2 py-1 rounded-full text-[10px] font-semibold border ${style.badge} shrink-0 whitespace-nowrap">
                                ${escapeHtml(level)}
                            </span>
                        </div>
                    `;
                }).join('');

                return `
                    <details class="group bg-police-card border border-police-border rounded-2xl shadow-xl overflow-hidden" ${q ? 'open' : ''}>
                        <summary class="cursor-pointer list-none px-5 py-4 flex items-center justify-between hover:bg-gray-900/40 transition-all">
                            <div class="flex items-center gap-3">
                                <span class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-[11px] font-bold shrink-0">${chapter.n}</span>
                                <div>
                                    <span class="text-sm font-semibold text-white block leading-tight">${escapeHtml(chapter.t)}</span>
                                    <span class="text-[10px] text-gray-500">${chapter.rows.length} section${chapter.rows.length > 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <i class="fa-solid fa-chevron-down text-gray-500 text-xs transition-transform group-open:rotate-180"></i>
                        </summary>
                        <div class="px-5 pb-5 pt-1 space-y-1.5 border-t border-police-border">
                            ${rowsHtml}
                        </div>
                    </details>
                `;
            }).join('');

            container.innerHTML = html || `
                <div class="bg-police-card border border-police-border rounded-2xl p-12 text-center text-gray-500">
                    <i class="fa-solid fa-magnifying-glass text-3xl mb-2 block opacity-40"></i>
                    No matching statutes found.
                </div>
            `;
        }

        function filterLawCodes() {
            const query = document.getElementById('law-search-input').value;
            renderLawChapters(query);
        }


        // ============ INVESTIGATIVE REPORT MODULE ============

        const CRIME_TYPES = ['Murder', 'Narcotics', 'Robbery', 'Organized Crime', 'Other'];
        const VICTIM_STATUSES = ['Injured', 'Deceased', 'Safe'];
        const CASE_STATUSES = ['Active / Ongoing', 'Pending Evidence', 'Closed / Forwarded to DA'];
        const ACTION_STEPS = [
            { id: 'cctv', label: 'Reviewed CCTV footage' },
            { id: 'witness', label: 'Interviewed witnesses & involved parties' },
            { id: 'forensics', label: 'Coordinated with Forensics' },
            { id: 'suspect', label: 'Tracked / pursued suspect(s)' }
        ];

        function getStoredInvestigations() {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS)) || [];
        }

        function investigationStatusStyle(status) {
            if (status === 'Active / Ongoing' || status === 'Active') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            if (status === 'Pending Evidence') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        }

        function getInvestigationListHTML() {
            return `
                <div class="space-y-6">
                    <!-- Page Banner Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-police-card border border-police-border p-6 rounded-2xl shadow-xl">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-magnifying-glass-chart text-indigo-500"></i> Investigative Reports
                            </h2>
                            <p class="text-xs text-gray-400 mt-1">Detective case files &mdash; murder, narcotics, robbery, and organized crime investigations.</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="relative flex-1 md:w-64">
                                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    <i class="fa-solid fa-magnifying-glass text-xs"></i>
                                </span>
                                <input type="text" id="inv-search-input" onkeyup="filterInvestigationsList()" placeholder="Search case ID, suspect, detective..."
                                    class="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500">
                            </div>
                            <button onclick="setActiveTab('create-investigation')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all whitespace-nowrap flex items-center gap-1.5">
                                <i class="fa-solid fa-plus"></i> New Report
                            </button>
                        </div>
                    </div>

                    <!-- Investigations Table Card -->
                    <div class="bg-police-card border border-police-border rounded-2xl shadow-xl overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-gray-900/80 border-b border-police-border text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                                        <th class="py-3.5 px-4">Case ID / Date</th>
                                        <th class="py-3.5 px-4">Crime Type</th>
                                        <th class="py-3.5 px-4">Location</th>
                                        <th class="py-3.5 px-4">Lead Detective</th>
                                        <th class="py-3.5 px-4">Status</th>
                                        <th class="py-3.5 px-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="investigations-table-body" class="divide-y divide-gray-800 text-sm">
                                    <!-- Populated by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- View Detail Modal -->
                <div id="inv-detail-modal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-4 overflow-y-auto">
                    <div class="bg-police-card border border-police-border w-full max-w-2xl my-8 rounded-2xl shadow-2xl overflow-hidden transform transition-all">
                        <div class="bg-gray-900 px-6 py-4 border-b border-police-border flex items-center justify-between sticky top-0 z-10">
                            <h3 class="font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-file-shield text-indigo-500"></i> Investigative Report <span id="inv-modal-case-id" class="text-indigo-400 font-mono text-xs"></span>
                            </h3>
                            <button onclick="closeInvestigationDetailModal()" class="text-gray-400 hover:text-white">
                                <i class="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>
                        <div class="p-6 space-y-5 text-sm max-h-[70vh] overflow-y-auto" id="inv-modal-body-content">
                            <!-- Filled dynamically -->
                        </div>
                        <div class="px-6 py-4 bg-gray-900/60 border-t border-police-border flex justify-end">
                            <button onclick="closeInvestigationDetailModal()" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function initInvestigationListEvents() {
            renderInvestigationsTable();
        }

        function renderInvestigationsTable(filterText = '') {
            const tbody = document.getElementById('investigations-table-body');
            if (!tbody) return;

            const q = filterText.toLowerCase();
            const investigations = getStoredInvestigations();
            const filtered = investigations.filter(i =>
                i.id.toLowerCase().includes(q) ||
                (i.suspectName || '').toLowerCase().includes(q) ||
                (i.leadDetective || '').toLowerCase().includes(q) ||
                (i.crimeType || '').toLowerCase().includes(q) ||
                (i.location || '').toLowerCase().includes(q)
            );

            if (filtered.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="py-12 text-center text-gray-500">
                            <i class="fa-solid fa-folder-open text-3xl mb-2 block opacity-40"></i>
                            No investigative reports found.
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = filtered.map(inv => `
                <tr class="hover:bg-gray-800/40 transition-all">
                    <td class="py-4 px-4 font-mono text-xs">
                        <span class="text-indigo-400 font-bold block">${escapeHtml(inv.id)}</span>
                        <span class="text-gray-500 text-[11px]">${escapeHtml(inv.reportDate || '')}</span>
                    </td>
                    <td class="py-4 px-4 font-medium text-gray-200">${escapeHtml(inv.crimeType === 'Other' ? (inv.crimeTypeOther || 'Other') : inv.crimeType)}</td>
                    <td class="py-4 px-4 text-gray-300 max-w-xs truncate">${escapeHtml(inv.location)}</td>
                    <td class="py-4 px-4 text-gray-400 text-xs">${escapeHtml(inv.leadDetective)}</td>
                    <td class="py-4 px-4">
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${investigationStatusStyle(inv.status)}">
                            <i class="fa-solid fa-circle mr-1 text-[6px]"></i> ${escapeHtml(inv.status)}
                        </span>
                    </td>
                    <td class="py-4 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="viewInvestigationDetail('${inv.id}')" title="View Details" class="w-8 h-8 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition-all">
                                <i class="fa-solid fa-eye text-xs"></i>
                            </button>
                            <button onclick="deleteInvestigation('${inv.id}')" title="Delete Report" class="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-all">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function filterInvestigationsList() {
            const query = document.getElementById('inv-search-input').value;
            renderInvestigationsTable(query);
        }

        function invField(label, value) {
            return `
                <div>
                    <span class="text-xs text-gray-500 block mb-0.5">${label}</span>
                    <span class="text-gray-200 font-medium">${escapeHtml(value && value.trim() ? value : '&mdash;')}</span>
                </div>
            `;
        }

        function viewInvestigationDetail(id) {
            const investigations = getStoredInvestigations();
            const inv = investigations.find(i => i.id === id);
            if (!inv) return;

            document.getElementById('inv-modal-case-id').innerText = `(${inv.id})`;

            const actionsHtml = ACTION_STEPS.map(step => `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${ (inv.actions || []).includes(step.id) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-gray-800/50 text-gray-500 border-gray-700/60 line-through' }">
                    <i class="fa-solid ${ (inv.actions || []).includes(step.id) ? 'fa-check' : 'fa-xmark' } text-[10px]"></i> ${step.label}
                </span>
            `).join('');

            document.getElementById('inv-modal-body-content').innerHTML = `
                <div>
                    <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 pb-1 border-b border-police-border">1. General Information</h4>
                    <div class="grid grid-cols-2 gap-3">
                        ${invField('Report Date', inv.reportDate)}
                        ${invField('Case ID', inv.id)}
                        ${invField('Lead Detective', inv.leadDetective)}
                        ${invField('Assisting Officers', inv.assistingOfficers)}
                        ${invField('Crime Type', inv.crimeType === 'Other' ? (inv.crimeTypeOther || 'Other') : inv.crimeType)}
                        ${invField('Incident Date/Time', inv.incidentDateTime)}
                    </div>
                    <div class="mt-3">${invField('Location', inv.location)}</div>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 pb-1 border-b border-police-border">2. Involved Parties</h4>
                    <div class="grid grid-cols-2 gap-3">
                        ${invField('Victim Name', inv.victimName)}
                        ${invField('Victim Status', inv.victimStatus)}
                        ${invField('Suspect Name / Alias', inv.suspectName)}
                        ${invField('Suspect Vehicle', inv.suspectVehicle)}
                        ${invField('Witness Name', inv.witnessName)}
                        ${invField('Witness Contact', inv.witnessContact)}
                    </div>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 pb-1 border-b border-police-border">3. Investigative Details</h4>
                    <span class="text-xs text-gray-500 block mb-1">Case Summary</span>
                    <p class="text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-xs leading-relaxed min-h-[60px] whitespace-pre-wrap">${escapeHtml(inv.summary)}</p>
                    <span class="text-xs text-gray-500 block mt-3 mb-1">Evidence Collected</span>
                    <p class="text-gray-300 bg-gray-900/60 p-3 rounded-xl border border-gray-800 text-xs leading-relaxed min-h-[50px] whitespace-pre-wrap">${escapeHtml(inv.evidence)}</p>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 pb-1 border-b border-police-border">4. Actions &amp; Conclusion</h4>
                    <div class="flex flex-wrap gap-2 mb-3">${actionsHtml}</div>
                    <span class="text-xs text-gray-500 block mb-1">Case Status</span>
                    <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${investigationStatusStyle(inv.status)}">${escapeHtml(inv.status)}</span>
                </div>
            `;

            const modal = document.getElementById('inv-detail-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeInvestigationDetailModal() {
            const modal = document.getElementById('inv-detail-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        function deleteInvestigation(id) {
            if (!confirm('Are you sure you want to delete this investigative report?')) return;
            let investigations = getStoredInvestigations();
            investigations = investigations.filter(i => i.id !== id);
            localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
            renderInvestigationsTable();
            showToast('Investigative report deleted', 'success');
        }

        function getCreateInvestigationHTML() {
            const user = getCurrentUser();
            const today = new Date().toISOString().substring(0, 10);

            const crimeTypeRadios = CRIME_TYPES.map((t, i) => `
                <label class="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-300 cursor-pointer hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10 has-[:checked]:text-white">
                    <input type="radio" name="inv-crime-type" value="${t}" ${i === 0 ? 'checked' : ''} class="accent-indigo-500">
                    ${t}
                </label>
            `).join('');

            const victimStatusRadios = VICTIM_STATUSES.map((s, i) => `
                <label class="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-300 cursor-pointer hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10 has-[:checked]:text-white">
                    <input type="radio" name="inv-victim-status" value="${s}" ${i === 2 ? 'checked' : ''} class="accent-indigo-500">
                    ${s}
                </label>
            `).join('');

            const caseStatusRadios = CASE_STATUSES.map((s, i) => `
                <label class="flex items-center gap-2 px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-300 cursor-pointer hover:border-indigo-500 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-500/10 has-[:checked]:text-white">
                    <input type="radio" name="inv-case-status" value="${s}" ${i === 0 ? 'checked' : ''} class="accent-indigo-500">
                    ${s}
                </label>
            `).join('');

            const actionChecks = ACTION_STEPS.map(step => `
                <label class="flex items-center gap-2 px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-300 cursor-pointer hover:border-indigo-500 transition-all has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-500/10 has-[:checked]:text-white">
                    <input type="checkbox" name="inv-action" value="${step.id}" class="accent-emerald-500">
                    ${step.label}
                </label>
            `).join('');

            return `
                <div class="max-w-4xl mx-auto space-y-6">
                    <!-- Page Banner -->
                    <div class="bg-police-card border border-police-border p-6 rounded-2xl shadow-xl flex items-center justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-magnifying-glass-chart text-indigo-500"></i> New Investigative Report
                            </h2>
                            <p class="text-xs text-gray-400 mt-1">Los Santos Sheriff's Department &mdash; Detective Case File</p>
                        </div>
                        <button onclick="setActiveTab('investigation-list')" class="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded-xl transition-all">
                            Back
                        </button>
                    </div>

                    <form onsubmit="handleCreateInvestigation(event)" class="space-y-6">

                        <!-- Section 1: General Information -->
                        <div class="bg-police-card border border-police-border rounded-2xl shadow-xl p-6 lg:p-8 space-y-5">
                            <h3 class="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                <span class="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[11px]">1</span>
                                General Information
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Report Date</label>
                                    <input type="date" id="inv-report-date" required value="${today}"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lead Detective</label>
                                    <input type="text" id="inv-lead-detective" required value="${escapeHtml(user.name)} (${escapeHtml(user.callsign)})"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Assisting Officers</label>
                                    <input type="text" id="inv-assisting-officers" placeholder="e.g. Det. Sarah Connor (LSPD-14)"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Incident Date / Time</label>
                                    <input type="text" id="inv-incident-datetime" required placeholder="e.g. 2026-06-05 22:10"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Crime Type</label>
                                <div class="flex flex-wrap gap-2">${crimeTypeRadios}</div>
                                <input type="text" id="inv-crime-type-other" placeholder="If 'Other', specify here..."
                                    class="w-full mt-2.5 px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                                <input type="text" id="inv-location" required placeholder="Street / district / landmark"
                                    class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                            </div>
                        </div>

                        <!-- Section 2: Involved Parties -->
                        <div class="bg-police-card border border-police-border rounded-2xl shadow-xl p-6 lg:p-8 space-y-5">
                            <h3 class="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                <span class="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[11px]">2</span>
                                Involved Parties
                            </h3>

                            <div class="space-y-3">
                                <p class="text-xs font-semibold text-gray-300">Victim(s)</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="text" id="inv-victim-name" placeholder="Victim full name"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                    <div class="flex flex-wrap gap-2">${victimStatusRadios}</div>
                                </div>
                            </div>

                            <div class="space-y-3 pt-2 border-t border-police-border">
                                <p class="text-xs font-semibold text-gray-300 pt-3">Suspect(s)</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="text" id="inv-suspect-name" placeholder="Suspect full name / alias"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                    <input type="text" id="inv-suspect-vehicle" placeholder="Vehicle used (model / color / plate)"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                </div>
                            </div>

                            <div class="space-y-3 pt-2 border-t border-police-border">
                                <p class="text-xs font-semibold text-gray-300 pt-3">Witness(es)</p>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input type="text" id="inv-witness-name" placeholder="Witness full name"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                    <input type="text" id="inv-witness-contact" placeholder="Contact information"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                </div>
                            </div>
                        </div>

                        <!-- Section 3: Investigative Details -->
                        <div class="bg-police-card border border-police-border rounded-2xl shadow-xl p-6 lg:p-8 space-y-5">
                            <h3 class="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                <span class="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[11px]">3</span>
                                Investigative Details
                            </h3>
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Case Summary</label>
                                <textarea id="inv-summary" required rows="4" placeholder="Narrative summary of the incident..."
                                    class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600"></textarea>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Evidence Collected</label>
                                <textarea id="inv-evidence" rows="3" placeholder="One item per line..."
                                    class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600"></textarea>
                            </div>
                        </div>

                        <!-- Section 4: Actions & Conclusion -->
                        <div class="bg-police-card border border-police-border rounded-2xl shadow-xl p-6 lg:p-8 space-y-5">
                            <h3 class="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                <span class="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[11px]">4</span>
                                Actions &amp; Conclusion
                            </h3>
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Investigative Steps Completed</label>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${actionChecks}</div>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Case Status</label>
                                <div class="flex flex-wrap gap-2">${caseStatusRadios}</div>
                            </div>
                        </div>

                        <!-- Signature / Submit -->
                        <div class="bg-police-card border border-police-border rounded-2xl shadow-xl p-6 lg:p-8 space-y-5">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Reporting Officer Signature</label>
                                    <input type="text" disabled value="${escapeHtml(user.name)}"
                                        class="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-gray-400 cursor-not-allowed">
                                </div>
                                <div>
                                    <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Position</label>
                                    <input type="text" id="inv-position" placeholder="e.g. Detective, LSSD" value="${escapeHtml(user.callsign)}"
                                        class="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-gray-200 placeholder-gray-600">
                                </div>
                            </div>
                            <div class="flex items-center justify-end gap-3 pt-4 border-t border-police-border">
                                <button type="button" onclick="setActiveTab('investigation-list')" class="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-sm rounded-xl transition-all">
                                    Cancel
                                </button>
                                <button type="submit" class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
                                    <i class="fa-solid fa-paper-plane"></i> Submit Investigative Report
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            `;
        }

        function handleCreateInvestigation(e) {
            e.preventDefault();
            const user = getCurrentUser();

            const crimeType = document.querySelector('input[name="inv-crime-type"]:checked').value;
            const victimStatus = document.querySelector('input[name="inv-victim-status"]:checked').value;
            const caseStatus = document.querySelector('input[name="inv-case-status"]:checked').value;
            const actions = Array.from(document.querySelectorAll('input[name="inv-action"]:checked')).map(el => el.value);

            const investigations = getStoredInvestigations();
            const randomIdNum = Math.floor(100000 + Math.random() * 900000);

            const newInvestigation = {
                id: `CR-${randomIdNum}`,
                reportDate: document.getElementById('inv-report-date').value,
                leadDetective: document.getElementById('inv-lead-detective').value.trim(),
                assistingOfficers: document.getElementById('inv-assisting-officers').value.trim(),
                crimeType,
                crimeTypeOther: document.getElementById('inv-crime-type-other').value.trim(),
                location: document.getElementById('inv-location').value.trim(),
                incidentDateTime: document.getElementById('inv-incident-datetime').value.trim(),
                victimName: document.getElementById('inv-victim-name').value.trim(),
                victimStatus,
                suspectName: document.getElementById('inv-suspect-name').value.trim(),
                suspectVehicle: document.getElementById('inv-suspect-vehicle').value.trim(),
                witnessName: document.getElementById('inv-witness-name').value.trim(),
                witnessContact: document.getElementById('inv-witness-contact').value.trim(),
                summary: document.getElementById('inv-summary').value.trim(),
                evidence: document.getElementById('inv-evidence').value.trim(),
                actions,
                status: caseStatus
            };

            investigations.unshift(newInvestigation);
            localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));

            showToast('Investigative report submitted successfully!', 'success');
            activeTab = 'investigation-list';
            renderDashboardView();
        }

        // Utility helper to prevent XSS in dynamic templates
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(0, '0'); // placeholder sanitize check
        }

        // App Root Router
        function renderApp() {
            initializeStorage();
            const user = getCurrentUser();
            if (user) {
                renderDashboardView();
            } else {
                renderAuthView();
            }
        }

        // Start Application on Load
        window.onload = function() {
            renderApp();
        };
