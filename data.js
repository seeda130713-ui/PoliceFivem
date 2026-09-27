/**
 * FiveM Police Department Portal — Data File
 * ---------------------------------------------------------------
 * This file holds the DEFAULT/SEED data only:
 *   - DEFAULT_USERS         : officer accounts used the first time the
 *                             portal loads (no saved data yet)
 *   - DEFAULT_INVESTIGATIONS: sample/starting case files
 *
 * The main app (FiveM_Police_Department_Portal.html) reads these two
 * arrays once, on first load, to seed its local storage. After that,
 * anything created or edited in the portal (new cases, new officers,
 * status changes, etc.) is saved in the browser's own storage, not
 * back into this file.
 *
 * WHY THIS FILE EXISTS SEPARATELY
 * If you want every officer/browser to start from the same case list
 * (for example, generating this file from your FiveM server's MySQL
 * database before the page loads), you only need to overwrite this
 * one file — the HTML/app logic file never needs to change.
 *
 * NOTE: Because this is a plain client-side file, editing it only
 * changes what NEW/empty browsers see on first load. It does not
 * push updates to browsers that already have saved data, and it
 * does not make live edits sync between officers in real time.
 * For real-time shared cases across everyone, this file should be
 * generated dynamically by a server (e.g. a FiveM NUI callback that
 * reads your MySQL database) rather than edited by hand.
 */

const DEFAULT_USERS = [
    {
        id: 'CID-99999',
        name: 'Col. John Miller',
        callsign: 'LSPD-01',
        username: 'johnmiller',
        password: 'adminpassword'
    }
];

const DEFAULT_INVESTIGATIONS = [
    {
        id: 'CR-100234',
        reportDate: '2026-06-06',
        leadDetective: 'Col. John Miller',
        assistingOfficers: 'Det. Sarah Connor',
        crimeType: 'ปล้นทรัพย์',
        crimeTypeOther: '',
        location: 'Fleeca Bank, Legion Square',
        incidentDateTime: '2026-06-05 22:10',
        victims: [
            { name: 'Fleeca Bank Corp.', contact: '-', role: 'เจ้าของทรัพย์สิน / สถานที่เกิดเหตุ', injury: 'ไม่มีผู้บาดเจ็บ ทรัพย์สินความเสียหายอยู่ระหว่างประเมิน' }
        ],
        suspects: [
            { name: 'Unknown male', description: 'สูงประมาณ 180ซม. สวมหมวกไหมพรม เสื้อฮู้ดสีดำ', contact: '-', locationSeen: 'หลบหนีไปทางตรอกด้านหลังธนาคาร' }
        ],
        witnesses: [
            { name: 'Bank teller', contact: '055-1234', statement: 'เห็นผู้ต้องสงสัยใช้อาวุธปืนข่มขู่ก่อนหลบหนี' }
        ],
        summary: 'ผู้ต้องสงสัยเข้ามาในธนาคารเวลาประมาณ 22:10 น. ใช้อาวุธปืนข่มขู่พนักงาน และหลบหนีไป',
        evidence: '1. ปลอกกระสุนบริเวณหน้าประตู\n2. ไฟล์กล้องวงจรปิด\n3. รอยเท้าบริเวณทางออกหลัง',
        actions: ['ตรวจสอบกล้องวงจรปิด (CCTV)', 'สอบปากคำพยานและผู้เกี่ยวข้อง'],
        investigationNotes: '06/06/2026 - ตรวจสอบกล้องวงจรปิดบริเวณจุดเกิดเหตุ พบภาพผู้ต้องสงสัย 1 ราย\n06/06/2026 - สอบปากคำพนักงานธนาคารเบื้องต้น',
        status: 'กำลังดำเนินการ (In Progress)',
        signature: 'Col. John Miller',
        position: 'Lead Detective'
    }
];
