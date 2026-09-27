/**
 * database.js - Data Access Layer for LSPD Portal
 */

export const STORAGE_KEYS = {
    USERS: 'fivem_police_users',
    SESSION: 'fivem_police_session',
    FORMS: 'fivem_police_forms',
    INVESTIGATIONS: 'fivem_police_investigations'
};

export const Database = {
    // กำหนดค่าเริ่มต้นให้ LocalStorage หากยังไม่มีข้อมูล
    init() {
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
    },

    // ==================== USER & SESSION MANAGEMENT ====================

    getUsers() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    },

    registerUser(name, password) {
        const users = this.getUsers();
        if (users.some(u => u.name.toLowerCase() === name.trim().toLowerCase())) {
            return { success: false, message: 'This name is already registered in the system' };
        }

        const randomIdNum = Math.floor(10000 + Math.random() * 90000);
        const callsignNum = Math.floor(10 + Math.random() * 89);
        
        const newUser = {
            id: `CID-${randomIdNum}`,
            name: name.trim(),
            callsign: `LSPD-${callsignNum}`,
            password: password
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return { success: true, user: newUser };
    },

    loginUser(name, password) {
        const users = this.getUsers();
        const user = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase() && u.password === password);
        if (user) {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Invalid name or password!' };
    },

    getCurrentUser() {
        const session = localStorage.getItem(STORAGE_KEYS.SESSION);
        return session ? JSON.parse(session) : null;
    },

    logoutUser() {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    },

    // ==================== POLICE FORM / REPORT MANAGEMENT ====================

    getForms() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.FORMS)) || [];
    },

    createForm({ type, suspect, fine, details }) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: 'User not authenticated' };

        const forms = this.getForms();
        const randomIdNum = Math.floor(1000 + Math.random() * 9000);
        
        const newForm = {
            id: `REP-${randomIdNum}`,
            reporter: `${user.name} (${user.callsign})`,
            type,
            suspect: suspect.trim(),
            fine: Number(fine),
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            details: details.trim(),
            status: 'Processed'
        };

        forms.unshift(newForm);
        localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
        return { success: true, form: newForm };
    },

    deleteForm(id) {
        let forms = this.getForms();
        forms = forms.filter(f => f.id !== id);
        localStorage.setItem(STORAGE_KEYS.FORMS, JSON.stringify(forms));
        return { success: true };
    },

    // ==================== INVESTIGATION MANAGEMENT ====================

    getInvestigations() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS)) || [];
    },

    createInvestigation(data) {
        const investigations = this.getInvestigations();
        const randomIdNum = Math.floor(100000 + Math.random() * 900000);

        const newInvestigation = {
            id: `CR-${randomIdNum}`,
            ...data
        };

        investigations.unshift(newInvestigation);
        localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
        return { success: true, investigation: newInvestigation };
    },

    deleteInvestigation(id) {
        let investigations = this.getInvestigations();
        investigations = investigations.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
        return { success: true };
    }
};