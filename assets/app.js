/* ============================================================
   منظومة المدارس — تطبيق الويب المحلي
   البيانات مضمّنة في data/db.js (مستخرجة من DataBase.mdb)
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- Helpers ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad2 = n => String(n).padStart(2, '0');

  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  }

  function debounce(fn, ms) {
    let t;
    return function () {
      const a = arguments, c = this;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(c, a), ms || 200);
    };
  }

  function todayStr() {
    const d = new Date();
    return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  function timeStr() {
    const d = new Date();
    const h = d.getHours(), ampm = h < 12 ? 'ص' : 'م', h12 = h % 12 || 12;
    return pad2(h12) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) + ' ' + ampm;
  }
  function dateAr() {
    const d = new Date();
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
  }

  /* ---------------- Icons ---------------- */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    school: '<path d="M3 21h18"/><path d="M5 21V8l7-4 7 4v13"/><path d="M9 21v-5h6v5"/><path d="M9 11h.01M15 11h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.6.66 1.02 1.28 1.02H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
    filter: '<path d="M3 4h18l-7 8v6l-4 2v-8Z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v4M12 9v10M17 5v14"/>',
    id: '<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M6 16c0-1.3 1-2 2-2s2 .7 2 2"/><path d="M14 9h5M14 13h5M14 17h3"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
  };
  function ic(name, cls) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="ico ' + (cls || '') + '">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------------- Data store ---------------- */
  const DB = window.DB || { manifest: {}, tables: {} };
  const MAN = DB.manifest || {};
  const RAW = DB.tables || {};
  const LS_KEY = 'madrasa.overlay.v1';

  let overlay = {};
  try { overlay = JSON.parse(localStorage.getItem(LS_KEY) || '{}') || {}; } catch (e) { overlay = {}; }
  let MODELS = {};

  function saveOverlay() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(overlay)); } catch (e) { /* تجاهل */ }
  }

  function model(t) {
    if (MODELS[t]) return MODELS[t];
    const cols = (MAN[t] && MAN[t].columns) ? MAN[t].columns.slice() : [];
    const base = RAW[t] || [];
    const ov = overlay[t] || {};
    const up = ov.up || {};
    const del = new Set(ov.del || []);
    const add = ov.add || [];
    const rows = [];
    base.forEach(function (r, i) {
      if (del.has(i)) return;
      rows.push({ cells: up[i] ? up[i].slice() : r.slice(), orig: i });
    });
    add.forEach(function (r) { rows.push({ cells: r.slice(), orig: -1 }); });
    MODELS[t] = { cols: cols, rows: rows };
    return MODELS[t];
  }

  function commit(t) {
    const m = model(t);
    const base = RAW[t] || [];
    const ov = { up: {}, del: [], add: [] };
    const present = new Set();
    m.rows.forEach(function (r) {
      if (r.orig >= 0) {
        present.add(r.orig);
        if (JSON.stringify(r.cells) !== JSON.stringify(base[r.orig])) ov.up[r.orig] = r.cells.slice();
      } else {
        ov.add.push(r.cells.slice());
      }
    });
    base.forEach(function (_, i) { if (!present.has(i)) ov.del.push(i); });
    overlay[t] = ov;
    saveOverlay();
    MODELS[t] = null;
    if (S.user) {
      const el = document.getElementById('status-records');
      if (el) el.textContent = 'السجلات: ' + model('empolye').rows.length + ' موظف · ' + model('SCHOOLS').rows.length + ' مدرسة';
    }
  }

  function resetAll() {
    overlay = {};
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* تجاهل */ }
    MODELS = {};
  }

  /* ---------------- Labels ---------------- */
  const TITLES = {
    empolye: 'بيانات الموظفين',
    NESAB: 'الكادر التعليمي (الأنصبة)',
    work_end: 'انتهاء الخدمة',
    emp_del: 'الموظفون المحذوفون',
    SCHOOLS: 'المدارس',
    Descunt: 'خصم الغياب',
    TAMAM_ARC: 'كشف التمام الشهري',
    repot: 'تقارير الكفاءة',
    oldrepot: 'تقارير الكفاءة القديمة',
    repot_archiv: 'أرشيف التقارير',
    Proced: 'الإجراءات الإدارية',
    ivi_del: 'الإجازات',
    ivicathon_w: 'تغطية العجز',
    ivi_stop: 'إيقاف الإجازة',
    tranz: 'النقل والحركة',
    adm: 'المستخدمون',
    users: 'مشغلو المنظومة',
    LOGIN: 'سجل الدخول',
    BIAN: 'بيانات المدرسة الأساسية',
    ch: 'إعدادات المنظومة',
    bonus: 'المكافآت',
    b_bonus: 'المكافآت (أرشيف)',
    t2: 'جدول مساعد'
  };

  const LABELS = {
    'المعرف': 'م',
    NUM: 'م', SEQ: 'رقم المنظومة', record: 'الرقم الوطني',
    NAME: 'الاسم', NAME1: 'الاسم الأول', NAME2: 'اسم الأب', NAME3: 'اسم الجد', NAME4: 'العائلة', NAME5: 'الاسم الخامس',
    name: 'الاسم', MOTHER: 'اسم الأم', SEX: 'الجنس', flag: 'الجنسية',
    birthday: 'تاريخ الميلاد', birth: 'مكان الميلاد', subfamily: 'فصيلة الدم',
    clubbable: 'الحالة الاجتماعية', NO_bull: 'عدد الأبناء', NO_female: 'عدد البنات', worship: 'الديانة',
    qualified: 'المؤهل العلمي', assignation: 'التخصص', D_qualified: 'تاريخ المؤهل', side: 'الجهة المانحة',
    bank: 'المصرف', subbank: 'الفرع', no_acc: 'رقم الحساب',
    handbook: 'رقم الكتيب', paper: 'ورقة العائلة', ID_card: 'رقم البطاقة الشخصية', Loc_card: 'مكان إصدارها',
    legality: 'رقم البطاقة الضمانية', Loc_legality: 'مكان إصدارها', retirement: 'رقم التقاعد',
    professional: 'الحرفة', trade: 'عدد الحصص', no_emp: 'الوضع الوظيفي', no_salry: 'الراتب',
    Tel: 'الهاتف', house: 'المنزل', street: 'الشارع', maark: 'العلامة', district: 'المنطقة', mail: 'البريد',
    designation: 'نوع التعيين', no_designation: 'رقم قرار التعيين', D_designation: 'تاريخ التعيين',
    D_bailiff: 'تاريخ المباشرة', no_class: 'رقم الدرجة', class_now: 'الدرجة الحالية', D_class: 'تاريخ الدرجة',
    postion: 'الوظيفة', Case_Pos: 'الوضع الوظيفي', class_hour: 'الفترة',
    raise: 'العلاوة', M_raise: 'شهر العلاوة', work_End: 'نهاية الخدمة', B_work: 'سبب الإنهاء',
    D_work: 'المادة المسندة', Nota_work: 'ملاحظات العمل', school: 'المدرسة',
    distance: 'المسافة', offic: 'الجهة', Note1: 'ملاحظات', Note: 'ملاحظات', data1: 'تاريخ المباشرة',
    STATE: 'المرحلة', SFOF: 'الصفوف', YEAR: 'العام الدراسي',
    d_chang: 'تاريخ الإدخال', h_chang: 'الساعة', MANJ: 'مشغل المنظومة',
    tot_h: 'الحضور', tot_d: 'الغياب', beet: 'عدد أيام الشهر', MUN_EDIT: 'الشهر', YEAR_EDIT: 'السنة',
    sch: 'المدرسة', Udate: 'رمز المدرسة', C: 'الحالة', okw: 'ملاحظة',
    manager: 'مدير المدرسة', u_date: 'التاريخ', U_CHANG: 'مشغل التحديث', M_DATE: 'تاريخ التعديل',
    User: 'المستخدم', PassWord: 'الرقم السري', Control: 'الصلاحية',
    pas: 'الرقم السري', DATE_ADD: 'تاريخ الإضافة',
    ADMIN: 'المستخدم', date_enter: 'التاريخ', time_enter: 'الساعة',
    SCHOOL: 'المدرسة', MANGE: 'مدير المدرسة', ADM: 'الأمين الإداري', P_M: 'الفترة', state: 'المرحلة', update: 'التحديث',
    ID: 'الرقم', Procedur: 'الإجراء', pers: 'الشخص', hold: 'الحيازة', attanch: 'المرفق', att: 'المرفقات',
    stobd: 'الاستبعاد', tsl: 'التسلسل', d_chan: 'تاريخ التغيير', h_huo: 'الساعة',
    d_mon: 'الشهر', y_yar: 'السنة', d_dy: 'تاريخ اليوم', d_td: 'من تاريخ', as_td: 'الأساس',
    d_stp: 'تاريخ الإيقاف', res_stp: 'سبب الإيقاف', forrr: 'تاريخ الإجازة', forr: 'الإجازة',
    Length: 'المدة', d_for: 'تاريخ الانتهاء', b_dat: 'تاريخ البدء', d_ks: 'تاريخ الخصم',
    mont: 'الشهر', ks_length: 'مدة الخصم', descuo: 'الخصم', j_w: 'تاريخ الإجازة',
    as_w: 'الأساس', start: 'البداية', end_j: 'النهاية', st_ww: 'بداية العمل', end_ww: 'نهاية العمل',
    ajz_w: 'العجز', m_w: 'الشهر', y_w: 'السنة', not: 'ملاحظة', k_j: 'نوع', cc1: 'خيار',
    st_dat: 'تاريخ الإيقاف', st_asary: 'الأساس', stp_d: 'تاريخ التوقف', d_stp: 'تاريخ الإيقاف',
    stp_res: 'السبب', stp_m: 'الشهر', stp_c: 'الجهة', y_s: 'السنة', nott: 'ملاحظة',
    d_mov: 'تاريخ النقل', as_mov: 'الأساس', school_mov: 'المدرسة المنقول إليها', pos_mov: 'الوظيفة',
    astratijy: 'استراتيجي', sch_mov: 'المدرسة', asn_mov: 'التخصص', Procedure: 'الإجراء',
    in_mov: 'داخل', m_mov: 'الشهر', y_mov: 'السنة',
    rep1: 'درجة أداء الواجب', rep2: 'درجة كمية العمل', rep3: 'درجة جودة العمل',
    rep4: 'درجة الحرص', rep5: 'المجموع', rep6: 'التقدير', rep7: 'درجة الكفاءة المعدلة',
    'تاريخ العلاوة': 'تاريخ العلاوة', 'اشاري العلاوة': 'الرقم الإشاري',
    t7: 'بداية التقرير', t8: 'نهاية التقرير', bon_ch: 'حالة المكافأة',
    mang: 'المدير', mang_up: 'اعتماد المدير', designation1: 'تعيين 1',
    d1: 'اليوم 1', d2: 'اليوم 2', d3: 'اليوم 3', d4: 'اليوم 4', d5: 'اليوم 5', d6: 'اليوم 6',
    d7: 'اليوم 7', d8: 'اليوم 8', d9: 'اليوم 9', d10: 'اليوم 10', d11: 'اليوم 11', d12: 'اليوم 12',
    d13: 'اليوم 13', d14: 'اليوم 14', d15: 'اليوم 15', d16: 'اليوم 16', d17: 'اليوم 17', d18: 'اليوم 18',
    d19: 'اليوم 19', d20: 'اليوم 20', d21: 'اليوم 21', d22: 'اليوم 22', d23: 'اليوم 23', d24: 'اليوم 24',
    d25: 'اليوم 25', d26: 'اليوم 26', d27: 'اليوم 27', d28: 'اليوم 28', d29: 'اليوم 29', d30: 'اليوم 30', d31: 'اليوم 31'
  };

  const SPECIAL_LABELS = {
    empolye: { D_work: 'تاريخ/بيان الحذف', B_work: 'سبب الحذف' },
    work_end: { D_work: 'تاريخ الحذف', B_work: 'سبب الحذف' },
    emp_del: { D_work: 'تاريخ الحذف', B_work: 'سبب الحذف' },
    NESAB: { D_work: 'المادة المسندة', B_work: 'ملاحظة' },
    SCHOOLS: { C: 'الحالة', Udate: 'الرمز' },
    BIAN: { P_M: 'الفترة', state: 'المرحلة' },
    t2: { d_des: 'تاريخ الخصم', s_slr: 'الراتب', mun: 'الشهر', yaer: 'السنة' },
    users: { MANJ: 'المشغل' }
  };

  function colLabel(t, c) {
    if (c === '__name') return 'الاسم الرباعي';
    if (SPECIAL_LABELS[t] && SPECIAL_LABELS[t][c]) return SPECIAL_LABELS[t][c];
    if (LABELS[c]) return LABELS[c];
    if (/^C\d+$/.test(c)) return 'خيار ' + c.slice(1);
    if (/^sfh?\d+$/.test(c)) return 'بيان ' + c.slice(2);
    if (/^h\d+$/.test(c)) return 'حصة ' + c.slice(1);
    return c;
  }

  function tableTitle(t) {
    if (TITLES[t]) return TITLES[t];
    if (t.indexOf('~TMPCLP') === 0) return 'جدول مؤقت ' + t.replace('~TMPCLP', '');
    return t;
  }

  const NAME_KEYS = ['NAME1', 'NAME2', 'NAME3', 'NAME4', 'NAME5'];

  function fullName(t, cells) {
    const m = model(t);
    if (m.cols.indexOf('NAME1') >= 0) {
      const p = [];
      NAME_KEYS.forEach(function (k) {
        const i = m.cols.indexOf(k);
        if (i >= 0 && cells[i]) p.push(String(cells[i]).replace(/\r\n?/g, ' ').trim());
      });
      if (p.length) return p.join(' ');
    }
    let i = m.cols.indexOf('NAME');
    if (i < 0) i = m.cols.indexOf('name');
    return i >= 0 && cells[i] ? String(cells[i]).replace(/\r\n?/g, ' ').trim() : '';
  }

  function cellText(t, cells, key) {
    if (key === '__name') return fullName(t, cells);
    const i = model(t).cols.indexOf(key);
    if (i < 0) return '';
    const v = cells[i];
    if (v == null) return '';
    if (typeof v === 'boolean') return v ? 'نعم' : 'لا';
    return String(v).replace(/\r\n?/g, '\n').trim();
  }

  /* ---------------- Modal / toast ---------------- */
  let escHandler = null;

  function openModal(html, size) {
    const root = $('#modal-root');
    root.innerHTML = '<div class="overlay"><div class="modal ' + (size || '') + '">' + html + '</div></div>';
    const ov = root.firstElementChild;
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) closeModal(); });
    escHandler = function (e) { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', escHandler);
    return ov;
  }
  function closeModal() {
    $('#modal-root').innerHTML = '';
    if (escHandler) { document.removeEventListener('keydown', escHandler); escHandler = null; }
  }

  function toast(msg, kind) {
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = 'toast' + (kind === 'err' ? ' err' : kind === 'warn' ? ' warn' : '');
    el.innerHTML = ic(kind === 'err' || kind === 'warn' ? 'alert' : 'check') + '<span>' + esc(msg) + '</span>';
    root.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      setTimeout(function () { el.remove(); }, 260);
    }, 3200);
  }

  function confirmBox(title, msg, okLabel, danger) {
    return new Promise(function (resolve) {
      const html =
        '<div class="modal-head"><h3>' + esc(title) + '</h3><div class="spacer"></div>' +
        '<button class="modal-close" data-x="1">' + ic('close') + '</button></div>' +
        '<div class="modal-body"><div class="callout ' + (danger ? 'danger' : 'warn') + '">' + ic('alert') +
        '<div>' + esc(msg) + '</div></div></div>' +
        '<div class="modal-foot"><div class="spacer"></div>' +
        '<button class="btn btn-outline" data-x="1">إلغاء</button>' +
        '<button class="btn ' + (danger ? 'btn-danger' : 'btn-primary') + '" data-ok="1">' + esc(okLabel || 'موافق') + '</button></div>';
      const ov = openModal(html, 'sm');
      ov.addEventListener('click', function (e) {
        const t = e.target.closest('[data-ok],[data-x]');
        if (!t) return;
        const ok = t.hasAttribute('data-ok');
        closeModal();
        resolve(ok);
      });
    });
  }

  /* ---------------- Auth ---------------- */
  const S = { user: null, vs: null, printFn: null };

  function accounts() {
    const out = [];
    if (MAN['adm']) {
      const m = model('adm'), iu = m.cols.indexOf('User'), ip = m.cols.indexOf('PassWord');
      m.rows.forEach(function (r) {
        const u = iu >= 0 ? r.cells[iu] : null;
        if (u != null && String(u).trim()) out.push({ name: String(u).trim(), pass: String(ip >= 0 ? (r.cells[ip] == null ? '' : r.cells[ip]) : ''), src: 'adm' });
      });
    }
    if (MAN['users']) {
      const m = model('users'), iu = m.cols.indexOf('name'), ip = m.cols.indexOf('pas');
      m.rows.forEach(function (r) {
        const u = iu >= 0 ? r.cells[iu] : null;
        if (u != null && String(u).trim()) out.push({ name: String(u).trim(), pass: String(ip >= 0 ? (r.cells[ip] == null ? '' : r.cells[ip]) : ''), src: 'users' });
      });
    }
    return out;
  }

  function logLogin(name) {
    try {
      const m = model('LOGIN'), c = m.cols;
      const row = new Array(c.length).fill(null);
      const set = function (k, v) { const i = c.indexOf(k); if (i >= 0) row[i] = v; };
      set('ADMIN', name); set('date_enter', todayStr()); set('time_enter', timeStr());
      m.rows.push({ cells: row, orig: -1 });
      commit('LOGIN');
    } catch (e) { /* لا يعطل الدخول */ }
  }

  function login(user, pass) {
    const list = accounts();
    const found = list.filter(function (a) { return a.name === user && a.pass === pass; });
    if (!found.length) return null;
    return found[0];
  }

  function enterApp(user, silent) {
    S.user = user;
    try { sessionStorage.setItem('madrasa.user', user); } catch (e) { /* */ }
    const ls = $('#login-screen');
    if (ls) ls.style.display = 'none';
    const app = $('#app');
    app.hidden = false;
    $('#user-name').textContent = user;
    $('#user-avatar').textContent = user.charAt(0);
    buildNav();
    if (!location.hash) location.hash = '#/dashboard';
    route();
    if (!silent) logLogin(user);
  }

  function logout() {
    S.user = null;
    try { sessionStorage.removeItem('madrasa.user'); } catch (e) { /* */ }
    $('#app').hidden = true;
    $('#login-screen').style.display = 'flex';
    $('#login-pass').value = '';
    $('#login-error').classList.remove('show');
    location.hash = '';
  }

  /* ---------------- Navigation ---------------- */
  const NAV = [
    { id: 'dashboard', label: 'لوحة المعلومات', icon: 'home' },
    {
      label: 'الموظفون', icon: 'users', items: [
        { id: 'empolye', label: 'بيانات الموظفين', table: 'empolye' },
        { id: 'NESAB', label: 'الكادر التعليمي', table: 'NESAB' },
        { id: 'work_end', label: 'انتهاء الخدمة', table: 'work_end' },
        { id: 'emp_del', label: 'الموظفون المحذوفون', table: 'emp_del' }
      ]
    },
    { id: 'schools', label: 'المدارس', icon: 'school' },
    {
      label: 'الغياب والخصومات', icon: 'calendar', items: [
        { id: 'Descunt', label: 'خصم الغياب', table: 'Descunt' },
        { id: 'TAMAM_ARC', label: 'كشف التمام الشهري', table: 'TAMAM_ARC' }
      ]
    },
    {
      label: 'الإجازات والحركة', icon: 'clock', items: [
        { id: 'ivi_del', label: 'الإجازات', table: 'ivi_del' },
        { id: 'ivicathon_w', label: 'تغطية العجز', table: 'ivicathon_w' },
        { id: 'ivi_stop', label: 'إيقاف الإجازة', table: 'ivi_stop' },
        { id: 'tranz', label: 'النقل والحركة', table: 'tranz' }
      ]
    },
    { id: 'reports', label: 'التقارير والطباعة', icon: 'print' },
    {
      label: 'النظام', icon: 'settings', items: [
        { id: 'adm', label: 'المستخدمون', table: 'adm' },
        { id: 'users', label: 'المشغلون', table: 'users' },
        { id: 'LOGIN', label: 'سجل الدخول', table: 'LOGIN' },
        { id: 'BIAN', label: 'بيانات المدرسة', table: 'BIAN' },
        { id: 'ch', label: 'إعدادات المنظومة', table: 'ch' },
        { id: 'all', label: 'كل الجداول', icon: 'grid' }
      ]
    }
  ];

  function countOf(t) {
    return MAN[t] ? model(t).rows.length : 0;
  }

  function buildNav() {
    const nav = $('#nav');
    let html = '';
    NAV.forEach(function (g) {
      if (g.items) {
        html += '<div class="nav-group"><div class="nav-title">' + ic(g.icon) + '<span>' + esc(g.label) + '</span></div>';
        g.items.forEach(function (it) {
          const key = it.table || it.id;
          const href = it.id === 'all' ? '#/all' : '#/t/' + encodeURIComponent(key);
          html += '<a class="nav-item" href="' + href + '" data-nav="' + esc(it.id) + '">' + ic(it.icon || 'file') +
            '<span>' + esc(it.label) + '</span>' +
            (it.table && MAN[it.table] ? '<span class="nav-badge">' + countOf(it.table) + '</span>' : '') + '</a>';
        });
        html += '</div>';
      } else {
        const href = g.id === 'dashboard' ? '#/dashboard' : g.id === 'schools' ? '#/schools' : g.id === 'reports' ? '#/reports' : '#/dashboard';
        html += '<a class="nav-item" href="' + href + '" data-nav="' + esc(g.id) + '">' + ic(g.icon) +
          '<span>' + esc(g.label) + '</span>' +
          (g.id === 'schools' && MAN['SCHOOLS'] ? '<span class="nav-badge">' + countOf('SCHOOLS') + '</span>' : '') + '</a>';
      }
    });
    nav.innerHTML = html;
    markActive();
  }

  function markActive() {
    const h = location.hash || '#/dashboard';
    $$('.nav-item').forEach(function (a) {
      const href = a.getAttribute('href');
      a.classList.toggle('active', href === h);
    });
  }

  function setTitle(title, sub) {
    $('#page-title').textContent = title;
    $('#page-sub').textContent = sub || '';
    document.title = title + ' — منظومة المدارس';
  }

  /* ---------------- Router ---------------- */
  function navigate(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function route() {
    if (!S.user) return;
    const raw = (location.hash || '#/dashboard').replace(/^#\/?/, '');
    const parts = raw.split('/').filter(Boolean);
    const first = parts[0] || 'dashboard';
    S.printFn = null;
    const app = $('#app');
    if (app) app.classList.remove('nav-open');
    markActive();
    if (first === 't' && parts[1]) return renderTablePage(decodeURIComponent(parts[1]));
    if (first === 'schools') return renderSchools();
    if (first === 'reports') return renderReports();
    if (first === 'report' && parts[1]) return renderReport(parts[1]);
    if (first === 'all') return renderAllTables();
    return renderDashboard();
  }

  /* ---------------- Dashboard ---------------- */
  function renderDashboard() {
    setTitle('لوحة المعلومات', 'نظرة عامة على المنظومة');
    S.vs = null;
    const emp = countOf('empolye'), sch = countOf('SCHOOLS'), nes = countOf('NESAB'),
      des = countOf('Descunt'), rep = countOf('repot'), log = countOf('LOGIN');

    const stats = [
      { label: 'الموظفون', val: emp, icon: 'users', c: '#0e6e5c', bg: '#e6f4f0', href: '#/t/empolye' },
      { label: 'المدارس', val: sch, icon: 'school', c: '#175cd3', bg: '#eff8ff', href: '#/schools' },
      { label: 'الكادر التعليمي', val: nes, icon: 'book', c: '#b54708', bg: '#fffaeb', href: '#/t/NESAB' },
      { label: 'سجلات الخصم', val: des, icon: 'calendar', c: '#6941c6', bg: '#f4f3ff', href: '#/t/Descunt' },
      { label: 'تقارير الكفاءة', val: rep, icon: 'file', c: '#067647', bg: '#ecfdf3', href: '#/t/repot' },
      { label: 'سجل الدخول', val: log, icon: 'clock', c: '#475467', bg: '#f2f4f7', href: '#/t/LOGIN' }
    ];

    let statsHtml = '';
    stats.forEach(function (s) {
      statsHtml += '<a class="stat" href="' + s.href + '" style="--c:' + s.c + ';--cb:' + s.bg + '">' +
        '<div class="stat-ico">' + ic(s.icon) + '</div><div><b>' + s.val + '</b><span>' + esc(s.label) + '</span></div></a>';
    });

    // توزيع الموظفين على المدارس
    const by = {};
    model('empolye').rows.forEach(function (r) {
      const s = cellText('empolye', r.cells, 'school') || 'غير محدد';
      by[s] = (by[s] || 0) + 1;
    });
    const top = Object.keys(by).map(function (k) { return { k: k, v: by[k] }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 8);
    const max = top.length ? top[0].v : 1;
    let bars = '';
    top.forEach(function (x) {
      bars += '<div class="bar-row"><span class="name" title="' + esc(x.k) + '">' + esc(x.k) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + Math.round(x.v / max * 100) + '%"></span></span>' +
        '<span class="val">' + x.v + '</span></div>';
    });
    if (!bars) bars = '<div class="tbl-empty">لا توجد بيانات</div>';

    // أحدث سجلات الكادر
    const recent = model('NESAB').rows.map(function (r) {
      return { r: r, d: parseDate(cellText('NESAB', r.cells, 'd_chang')) };
    }).sort(function (a, b) { return (b.d || 0) - (a.d || 0); }).slice(0, 6);

    let recentHtml = '';
    if (!recent.length) {
      recentHtml = '<div class="tbl-empty">لا توجد سجلات</div>';
    } else {
      recentHtml = '<div class="table-scroll" style="max-height:none"><table class="data"><thead><tr>' +
        '<th>الاسم</th><th>المدرسة</th><th>المادة</th><th>التاريخ</th></tr></thead><tbody>';
      recent.forEach(function (x) {
        recentHtml += '<tr><td>' + esc(cellText('NESAB', x.r.cells, 'NAME')) + '</td>' +
          '<td>' + esc(cellText('NESAB', x.r.cells, 'school')) + '</td>' +
          '<td>' + esc(cellText('NESAB', x.r.cells, 'D_work')) + '</td>' +
          '<td class="num">' + esc(cellText('NESAB', x.r.cells, 'd_chang')) + '</td></tr>';
      });
      recentHtml += '</tbody></table></div>';
    }

    $('#view').innerHTML =
      '<div class="section-title"><h2>أهلاً، ' + esc(S.user) + '</h2><div class="desc">' + esc(dateAr()) + '</div></div>' +
      '<div class="grid stats" style="margin-bottom:16px">' + statsHtml + '</div>' +
      '<div class="two-col">' +
        '<div class="card"><div class="card-head"><h3>توزيع الموظفين على المدارس</h3><div class="spacer"></div>' +
          '<a class="btn btn-sm btn-outline" href="#/t/empolye">كل الموظفين</a></div>' +
          '<div class="card-body"><div class="bars">' + bars + '</div></div></div>' +
        '<div class="card"><div class="card-head"><h3>إجراءات سريعة</h3></div><div class="card-body"><div class="quick">' +
          '<a href="#/t/empolye" data-quick-add="empolye">' + ic('plus') + 'إضافة موظف</a>' +
          '<a href="#/t/Descunt">' + ic('calendar') + 'خصم الغياب</a>' +
          '<a href="#/report/tamam">' + ic('print') + 'كشف التمام</a>' +
          '<a href="#/schools">' + ic('school') + 'المدارس</a>' +
          '<a href="#/report/kafaa">' + ic('file') + 'تقرير كفاءة</a>' +
          '<a href="#/t/NESAB">' + ic('book') + 'الأنصبة</a>' +
        '</div></div></div>' +
      '</div>' +
      '<div class="card" style="margin-top:16px"><div class="card-head"><h3>أحدث سجلات الكادر التعليمي</h3>' +
        '<div class="spacer"></div><a class="btn btn-sm btn-outline" href="#/t/NESAB">عرض الكل</a></div>' + recentHtml + '</div>';

    $('#status-records').textContent = 'السجلات: ' + emp + ' موظف · ' + sch + ' مدرسة';
    S.printFn = function () { printTableGeneric('empolye', 'بيانات الموظفين'); };
  }

  function parseDate(v) {
    if (!v) return 0;
    const s = String(v).trim();
    let m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
    const d = Date.parse(s);
    return isNaN(d) ? 0 : d;
  }

  /* ---------------- Table pages ---------------- */
  let pendingQuery = '';
  let pendingFilter = null;

  const TCFG = {
    empolye: {
      sub: 'السجلات الشخصية والوظيفية لجميع الموظفين',
      cols: ['NUM', 'SEQ', '__name', 'record', 'qualified', 'assignation', 'postion', 'school', 'designation', 'class_now'],
      filters: ['school', 'qualified', 'assignation', 'postion', 'designation']
    },
    NESAB: {
      sub: 'توزيع المواد والأنصبة على الكادر التعليمي',
      cols: ['SEQ', 'record', 'NAME', 'qualified', 'assignation', 'postion', 'D_work', 'trade', 'school', 'class_hour', 'designation', 'class_now', 'SFOF', 'YEAR'],
      filters: ['school', 'assignation', 'postion', 'class_hour', 'designation']
    },
    work_end: {
      sub: 'الموظفون المنتهية خدمتهم',
      cols: ['NUM', 'SEQ', '__name', 'record', 'school', 'postion', 'B_work', 'M_raise', 'D_work'],
      filters: ['school', 'B_work', 'M_raise']
    },
    emp_del: {
      sub: 'سجل الموظفين المحذوفين',
      cols: ['NUM', 'SEQ', '__name', 'record', 'school', 'postion', 'B_work'],
      filters: ['school']
    },
    Descunt: {
      sub: 'خصومات الغياب الشهرية لكل موظف',
      cols: ['NUM', 'SEQ', '__name', 'record', 'postion', 'school', 'tot_h', 'tot_d', 'MUN_EDIT', 'YEAR_EDIT', 'Nota_work'],
      filters: ['MUN_EDIT', 'YEAR_EDIT', 'school']
    },
    TAMAM_ARC: {
      sub: 'أرشيف كشوف التمام الشهرية',
      cols: ['NUM', 'SEQ', '__name', 'record', 'postion', 'school', 'tot_h', 'tot_d', 'MUN_EDIT', 'YEAR_EDIT'],
      filters: ['MUN_EDIT', 'YEAR_EDIT', 'school']
    },
    repot: {
      sub: 'تقارير كفاءة الموظفين',
      cols: ['SEQ', 'NAME', 'qualified', 'assignation', 'school', 'rep1', 'rep2', 'rep3', 'rep4', 'rep5', 'rep6', 'd_td', 'as_td'],
      filters: ['school', 'rep6']
    },
    oldrepot: {
      sub: 'تقارير الكفاءة للسنتين السابقتين',
      cols: ['SEQ', 'NAME', 'qualified', 'assignation', 'school', 'rep5', 'rep6', 't8'],
      filters: ['school', 'rep6']
    },
    repot_archiv: { sub: 'أرشيف تقارير الكفاءة', cols: ['SEQ', 'NAME', 'school', 'rep5', 'rep6'], filters: ['school'] },
    Proced: {
      sub: 'الإجراءات الإدارية (مغادرة، مباشرة، إجازة…)',
      cols: ['ID', 'NAME', 'school', 'Procedur', 'd_td', 'forrr', 'mont', 'y_yar'],
      filters: ['school', 'Procedur', 'mont', 'y_yar']
    },
    ivi_del: {
      sub: 'إجازات الوضع والمرضية',
      cols: ['SEQ', 'name', 'qualified', 'assignation', 'school', 'j_w', 'start', 'end_j', 'ajz_w', 'm_w', 'y_w'],
      filters: ['school', 'm_w', 'y_w', 'ajz_w']
    },
    ivicathon_w: {
      sub: 'تغطية العجز',
      cols: ['SEQ', 'name', 'qualified', 'assignation', 'school', 'j_w', 'start', 'end_j', 'm_w', 'y_w'],
      filters: ['school', 'm_w', 'y_w']
    },
    ivi_stop: {
      sub: 'إيقاف الإجازات',
      cols: ['SEQ', 'name', 'qualified', 'school', 'st_dat', 'stp_d', 'stp_res', 'stp_m', 'y_s'],
      filters: ['school', 'stp_m', 'y_s']
    },
    tranz: {
      sub: 'حركة النقل بين المدارس',
      cols: ['SEQ', 'name', 'qualified', 'school', 'school_mov', 'Procedure', 'd_mov', 'm_mov', 'y_mov'],
      filters: ['school', 'Procedure', 'm_mov', 'y_mov']
    },
    SCHOOLS: { sub: 'قائمة المدارس التابعة للمراقبة', cols: ['المعرف', 'sch', 'Udate', 'manager', 'C', 'u_date'], filters: ['C'] },
    adm: { sub: 'حسابات الدخول إلى المنظومة', cols: ['User', 'PassWord', 'Control'], filters: ['Control'] },
    users: { sub: 'مشغلو المنظومة', cols: ['name', 'pas', 'DATE_ADD', 'MANJ'] },
    LOGIN: { sub: 'سجل عمليات الدخول', cols: ['ADMIN', 'date_enter', 'time_enter'], filters: ['date_enter'] },
    BIAN: { sub: 'بيانات المدرسة والقيادة', cols: ['SCHOOL', 'MANGE', 'ADM', 'P_M', 'state'] },
    ch: { sub: 'اسم المنظومة ورمز التفعيل', cols: ['sch', 'Udate', 'C', 'okw'] },
    bonus: { sub: 'بيانات المكافآت', cols: ['SEQ', '__name', 'school', 'tot', 'bon_ch'], filters: ['school'] },
    b_bonus: { sub: 'أرشيف المكافآت', cols: ['SEQ', '__name', 'school', 'bon_ch'], filters: ['school'] },
    t2: { sub: 'جدول مساعد', cols: ['SEQ', 'NAME', 'class_now', 'Absence', 'mun', 'yaer'] }
  };

  function defaultCols(t) {
    const cols = model(t).cols;
    const out = [];
    if (cols.indexOf('NAME1') >= 0 || cols.indexOf('NAME') >= 0 || cols.indexOf('name') >= 0) out.push('__name');
    const skip = { NAME1: 1, NAME2: 1, NAME3: 1, NAME4: 1, NAME5: 1, NAME: 1, name: 1 };
    for (let i = 0; i < cols.length && out.length < 9; i++) {
      const c = cols[i];
      if (skip[c]) continue;
      if (c === 'المعرف' && out.indexOf('المعرف') >= 0) continue;
      out.push(c);
    }
    return out.length ? out : cols.slice(0, 8);
  }

  function displayCols(t) {
    if (S.vs && S.vs.all) return model(t).cols;
    const cfg = TCFG[t];
    return (cfg && cfg.cols) ? cfg.cols : defaultCols(t);
  }

  function sortVal(t, cells, key) {
    if (key === '__name') return fullName(t, cells);
    const i = model(t).cols.indexOf(key);
    const v = i >= 0 ? cells[i] : '';
    if (v == null) return '';
    if (typeof v === 'boolean') return v ? 1 : 0;
    return String(v);
  }

  function toNum(s) {
    if (s == null) return null;
    const t = String(s).trim().replace(/,/g, '');
    if (!t) return null;
    if (!/^-?\d+(\.\d+)?$/.test(t)) return null;
    return parseFloat(t);
  }

  function cmpVals(a, b) {
    if (a === b) return 0;
    const na = toNum(a), nb = toNum(b);
    if (na !== null && nb !== null) return na - nb;
    const da = parseDate(a), db = parseDate(b);
    if (da && db) return da - db;
    return String(a).localeCompare(String(b), 'ar');
  }

  function filterRows(t) {
    const m = model(t), vs = S.vs;
    let rows = m.rows.map(function (r, idx) { return { idx: idx, cells: r.cells }; });

    const q = (vs.q || '').trim();
    if (q) {
      const nq = norm(q);
      if (!m._search) {
        m._search = m.rows.map(function (r) {
          const parts = m.cols.map(function (c, i) { return r.cells[i] == null ? '' : String(r.cells[i]); });
          parts.push(fullName(t, r.cells));
          return norm(parts.join(' '));
        });
      }
      rows = rows.filter(function (r) { return m._search[r.idx].indexOf(nq) >= 0; });
    }

    Object.keys(vs.f || {}).forEach(function (k) {
      const v = vs.f[k];
      if (v === '' || v == null) return;
      rows = rows.filter(function (r) { return cellText(t, r.cells, k) === v; });
    });

    if (vs.sort) {
      const key = vs.sort, dir = vs.dir;
      rows.sort(function (a, b) { return cmpVals(sortVal(t, a.cells, key), sortVal(t, b.cells, key)) * dir; });
    }
    return rows;
  }

  function pagerHtml(page, pages) {
    let h = '<div class="pager">';
    h += '<button data-act="page" data-page="1" ' + (page === 1 ? 'disabled' : '') + '>الأولى</button>';
    h += '<button data-act="page" data-page="' + (page - 1) + '" ' + (page === 1 ? 'disabled' : '') + '>›</button>';
    const from = Math.max(1, page - 2), to = Math.min(pages, from + 4);
    for (let p = from; p <= to; p++) {
      h += '<button data-act="page" data-page="' + p + '" class="' + (p === page ? 'active' : '') + '">' + p + '</button>';
    }
    h += '<button data-act="page" data-page="' + (page + 1) + '" ' + (page === pages ? 'disabled' : '') + '>‹</button>';
    h += '<button data-act="page" data-page="' + pages + '" ' + (page === pages ? 'disabled' : '') + '>الأخيرة</button>';
    h += '</div>';
    return h;
  }

  function paintTable(t) {
    const host = $('#table-host');
    if (!host) return;
    const m = model(t), vs = S.vs;
    $$('[data-filter]').forEach(function (sel) {
      const c = sel.getAttribute('data-filter');
      sel.value = vs.f[c] || '';
    });
    const all = filterRows(t);
    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / vs.per));
    if (vs.page > pages) vs.page = pages;
    if (vs.page < 1) vs.page = 1;
    const start = (vs.page - 1) * vs.per;
    const pageRows = all.slice(start, start + vs.per);
    const cols = displayCols(t);

    let head = '<tr>';
    cols.forEach(function (c) {
      const arrow = vs.sort === c ? '<span class="arrow">' + (vs.dir > 0 ? '▲' : '▼') + '</span>' : '';
      head += '<th class="sortable" data-act="sort" data-sort="' + esc(c) + '">' + esc(colLabel(t, c)) + arrow + '</th>';
    });
    head += '<th style="width:104px">إجراءات</th></tr>';

    let body = '';
    if (!pageRows.length) {
      body = '<tr><td colspan="' + (cols.length + 1) + '"><div class="tbl-empty">' + ic('search') +
        '<div>لا توجد سجلات مطابقة' + ((vs.q || Object.keys(vs.f).length) ? ' لبحثك' : '') + '</div></div></td></tr>';
    } else {
      pageRows.forEach(function (r) {
        body += '<tr data-idx="' + r.idx + '">';
        cols.forEach(function (c) {
          const val = cellText(t, r.cells, c);
          const cls = (c === '__name') ? ' class="wrap"' : (/^(\d+|\d+\.\d+)$/.test(val) ? ' class="num"' : '');
          const inner = c === '__name' ? '<b>' + esc(val) + '</b>' : esc(val);
          body += '<td' + cls + ' title="' + esc(val) + '">' + inner + '</td>';
        });
        body += '<td><div class="row-actions">' +
          '<button class="btn btn-sm btn-outline" data-act="view" data-idx="' + r.idx + '" title="عرض">' + ic('eye') + '</button>' +
          '<button class="btn btn-sm btn-outline" data-act="edit" data-idx="' + r.idx + '" title="تعديل">' + ic('edit') + '</button>' +
          '<button class="btn btn-sm btn-danger-soft" data-act="del" data-idx="' + r.idx + '" title="حذف">' + ic('trash') + '</button>' +
          '</div></td></tr>';
      });
    }

    host.innerHTML = '<div class="table-wrap"><div class="table-scroll"><table class="data"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
      '<div class="tbl-foot"><span>عرض ' + (total ? (start + 1) : 0) + '–' + Math.min(start + vs.per, total) + ' من ' + total + ' سجل</span>' +
      '<span class="spacer"></span>' +
      '<label style="display:flex;align-items:center;gap:6px">لكل صفحة' +
      '<select id="tbl-per" class="select" style="width:auto;padding:5px 9px">' +
      [25, 50, 100, 200].map(function (n) { return '<option value="' + n + '" ' + (n === vs.per ? 'selected' : '') + '>' + n + '</option>'; }).join('') +
      '</select></label>' + pagerHtml(vs.page, pages) + '</div></div>';

    const per = $('#tbl-per');
    if (per) per.addEventListener('change', function () { vs.per = +this.value; vs.page = 1; paintTable(t); });

    const sum = $('#tbl-summary');
    if (sum) {
      if (t === 'Descunt' || t === 'TAMAM_ARC') {
        let h = 0, d = 0;
        all.forEach(function (r) {
          const a = toNum(cellText(t, r.cells, 'tot_h')); if (a) h += a;
          const b = toNum(cellText(t, r.cells, 'tot_d')); if (b) d += b;
        });
        sum.innerHTML = '<div class="callout ok" style="margin-bottom:12px">' + ic('chart') +
          '<div><b>ملخص المعروض:</b> عدد السجلات ' + total + ' · مجموع الحضور ' + h + ' · مجموع الغياب ' + d + '</div></div>';
      } else {
        sum.innerHTML = '';
      }
    }
  }

  function renderTablePage(t) {
    if (!MAN[t]) {
      setTitle('جدول غير موجود', '');
      $('#view').innerHTML = '<div class="empty-state">' + ic('alert') + '<h3>الجدول غير موجود</h3><p>لا يوجد جدول بهذا الاسم في قاعدة البيانات.</p></div>';
      return;
    }
    const cfg = TCFG[t] || {};
    setTitle(tableTitle(t), cfg.sub || ((MAN[t].columns.length) + ' حقل · ' + countOf(t) + ' سجل'));
    S.vs = { q: pendingQuery || '', sort: null, dir: 1, page: 1, per: 50, f: pendingFilter || {}, all: false };
    pendingQuery = '';
    pendingFilter = null;

    const filterCols = (cfg.filters || []).filter(function (c) { return model(t).cols.indexOf(c) >= 0; });
    let filtersHtml = '';
    filterCols.forEach(function (c) {
      const vals = {};
      model(t).rows.forEach(function (r) {
        const v = cellText(t, r.cells, c);
        if (v !== '') vals[v] = 1;
      });
      const keys = Object.keys(vals).sort(function (a, b) { return a.localeCompare(b, 'ar'); }).slice(0, 80);
      if (S.vs.f[c] && keys.indexOf(S.vs.f[c]) < 0) keys.unshift(S.vs.f[c]);
      filtersHtml += '<select class="select" data-filter="' + esc(c) + '"><option value="">' + esc(colLabel(t, c)) + ': الكل</option>' +
        keys.map(function (k) { return '<option value="' + esc(k) + '">' + esc(k) + '</option>'; }).join('') + '</select>';
    });

    const isWide = MAN[t].columns.length > 14;

    $('#view').innerHTML =
      '<div class="section-title"><h2>' + esc(tableTitle(t)) + '</h2>' +
        '<div class="desc">' + esc(cfg.sub || '') + '</div></div>' +
      '<div class="toolbar">' +
        '<div class="search-box">' + ic('search') + '<input id="tbl-search" type="search" placeholder="بحث في جميع الحقول…" value="' + esc(S.vs.q) + '"></div>' +
        filtersHtml +
        '<button class="btn btn-outline" data-act="allcols">' + ic('grid') + (isWide ? 'كل الأعمدة' : 'الأعمدة') + '</button>' +
        '<div class="spacer"></div>' +
        '<button class="btn btn-outline" data-act="csv">' + ic('download') + 'تصدير CSV</button>' +
        '<button class="btn btn-outline" data-act="print">' + ic('print') + 'طباعة</button>' +
        '<button class="btn btn-primary" data-act="add">' + ic('plus') + 'إضافة جديد</button>' +
      '</div>' +
      '<div id="tbl-summary"></div>' +
      '<div id="table-host"></div>' +
      '<div class="callout" style="margin-top:14px">' + ic('alert') +
        '<div>ملاحظة: التعديلات تُحفظ محليًا في هذا المتصفح وتظهر فورًا. استخدم «كل الجداول ← استعادة البيانات الأصلية» للرجوع إلى نسخة قاعدة البيانات.</div></div>';

    const q = $('#tbl-search');
    q.addEventListener('input', debounce(function (e) { S.vs.q = e.target.value; S.vs.page = 1; paintTable(t); }, 180));

    $$('[data-filter]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        S.vs.f[this.getAttribute('data-filter')] = this.value;
        S.vs.page = 1;
        paintTable(t);
      });
    });

    paintTable(t);
    S.printFn = function () { printTableGeneric(t); };
  }

  /* ---------------- Forms ---------------- */
  const GROUP_DEFS = [
    { title: 'البيانات الشخصية', cols: ['NUM', 'SEQ', 'المعرف', 'NAME1', 'NAME2', 'NAME3', 'NAME4', 'NAME5', 'NAME', 'name', 'MOTHER', 'SEX', 'flag', 'birthday', 'birth', 'subfamily', 'clubbable', 'NO_bull', 'NO_female', 'worship'] },
    { title: 'المؤهل والتخصص', cols: ['qualified', 'assignation', 'D_qualified', 'side', 'professional'] },
    { title: 'البيانات الوظيفية', cols: ['record', 'postion', 'Case_Pos', 'designation', 'no_designation', 'D_designation', 'D_bailiff', 'no_class', 'class_now', 'D_class', 'class_hour', 'trade', 'no_emp', 'no_salry', 'raise', 'M_raise', 'school', 'D_work', 'B_work', 'work_End', 'Nota_work', 'data1', 'distance', 'offic', 'STATE', 'SFOF', 'YEAR', 'MANJ', 'd_chang', 'h_chang', 'd_td', 'as_td', 'Procedur', 'mont', 'y_yar', 'j_w', 'as_w', 'start', 'end_j', 'ajz_w', 'm_w', 'y_w'] },
    { title: 'المصرف والاتصال', cols: ['bank', 'subbank', 'no_acc', 'Tel', 'house', 'street', 'maark', 'district', 'mail', 'handbook', 'paper', 'ID_card', 'Loc_card', 'legality', 'Loc_legality', 'retirement'] },
    { title: 'درجات الكفاءة', cols: ['rep1', 'rep2', 'rep3', 'rep4', 'rep5', 'rep6', 'rep7'] },
    { title: 'بيانات أخرى', cols: ['sch', 'Udate', 'C', 'okw', 'manager', 'u_date', 'U_CHANG', 'M_DATE', 'User', 'PassWord', 'Control', 'pas', 'DATE_ADD', 'ADMIN', 'date_enter', 'time_enter', 'SCHOOL', 'MANGE', 'ADM', 'P_M', 'state', 'update', 'ID', 'tot_h', 'tot_d', 'beet', 'MUN_EDIT', 'YEAR_EDIT'] }
  ];

  const REQUIRED = {
    empolye: { NAME1: 'الرجاء ادراج الاسم اولاً', record: 'الرجاء ادراج الرقم الوطني اولاً', school: 'الرجاء ادراج المدرسة اولاً', postion: 'الرجاء ادراج الوظيفة اولاً', designation: 'الرجاء ادراج نوع التعيين اولاً' },
    NESAB: { NAME: 'الرجاء ادراج الاسم اولاً', record: 'الرجاء ادراج الرقم الوطني اولاً', school: 'الرجاء ادراج المدرسة اولاً', postion: 'الرجاء ادراج الوظيفة اولاً', assignation: 'الرجاء ادراج التخصص اولاً', D_work: 'الرجاء ادراج المادة اولاً', trade: 'الرجاء ادراج عدد الحصص اولاً' },
    SCHOOLS: { sch: 'الرجاء ادراج المدرسة اولاً' },
    users: { name: 'الرجاء ادراج الاسم اولاً', pas: 'الرجاء ادراج الرقم السري اولاً' },
    adm: { User: 'الرجاء ادراج الاسم اولاً', PassWord: 'الرجاء ادراج الرقم السري اولاً' },
    repot: { NAME: 'الرجاء ادراج الاسم اولاً', school: 'الرجاء ادراج المدرسة اولاً' }
  };

  const BOOL_COLS = { a_c: 1, k_j: 1, cc1: 1, bon_ch: 1, okw: 1, C1: 1, C2: 1, C3: 1, C4: 1 };

  function groupsFor(t) {
    const cols = model(t).cols;
    const used = {};
    const groups = [];
    GROUP_DEFS.forEach(function (g) {
      const list = g.cols.filter(function (c) { return cols.indexOf(c) >= 0 && !used[c]; });
      list.forEach(function (c) { used[c] = 1; });
      if (list.length) groups.push({ title: g.title, cols: list });
    });
    const days = cols.filter(function (c) { return /^d\d+$/.test(c) && !used[c]; });
    if (days.length) {
      days.forEach(function (c) { used[c] = 1; });
      groups.push({ title: 'أيام الشهر', cols: days, day: true });
    }
    const rest = cols.filter(function (c) { return !used[c]; });
    if (rest.length) groups.push({ title: 'حقول إضافية', cols: rest });
    return groups;
  }

  function fieldHTML(t, col, idx, cells) {
    const v = cells[idx];
    const val = v == null ? '' : String(v);
    const lab = colLabel(t, col);
    const req = (REQUIRED[t] && REQUIRED[t][col]) ? ' <span class="req">*</span>' : '';
    if (BOOL_COLS[col] || typeof v === 'boolean') {
      return '<div class="field"><label>' + esc(lab) + req + '</label>' +
        '<select class="select" data-col="' + idx + '" data-bool="1">' +
        '<option value="">—</option>' +
        '<option value="true" ' + (v === true || val === 'true' ? 'selected' : '') + '>نعم</option>' +
        '<option value="false" ' + (v === false || val === 'false' ? 'selected' : '') + '>لا</option>' +
        '</select></div>';
    }
    if (col === 'Note1' || col === 'Note' || col === 'not' || col === 'nott') {
      return '<div class="field full"><label>' + esc(lab) + req + '</label><textarea class="textarea" rows="2" data-col="' + idx + '">' + esc(val) + '</textarea></div>';
    }
    return '<div class="field"><label>' + esc(lab) + req + '</label>' +
      '<input class="input" data-col="' + idx + '" value="' + esc(val) + '" ' +
      (col === 'birthday' || col === 'D_designation' || col === 'D_bailiff' ? 'placeholder="dd/mm/yyyy"' : '') + '></div>';
  }

  function openForm(t, idx) {
    const m = model(t);
    let cells;
    if (idx == null) {
      cells = new Array(m.cols.length).fill(null);
      m.cols.forEach(function (c, i) {
        if (c === 'YEAR') cells[i] = String(new Date().getFullYear());
        if (c === 'YEAR_EDIT') cells[i] = String(new Date().getFullYear());
        if (c === 'MUN_EDIT') cells[i] = '';
        if (c === 'd_chang') cells[i] = todayStr();
        if (c === 'h_chang') cells[i] = timeStr();
        if (c === 'MANJ') cells[i] = S.user;
        if (BOOL_COLS[c]) cells[i] = false;
      });
    } else {
      cells = m.rows[idx].cells.slice();
    }
    const groups = groupsFor(t);
    let body = '<div class="form-grid">';
    groups.forEach(function (g) {
      if (g.day) {
        body += '<div class="form-section"><h4>' + ic('calendar') + esc(g.title) + '</h4><div class="day-grid">';
        g.cols.forEach(function (c) {
          const i = m.cols.indexOf(c);
          body += '<div class="day-cell"><label>' + esc(c.replace('d', '')) + '</label>' +
            '<input data-col="' + i + '" value="' + esc(cells[i] == null ? '' : cells[i]) + '"></div>';
        });
        body += '</div></div>';
      } else {
        body += '<div class="form-section"><h4>' + ic('file') + esc(g.title) + '</h4><div class="form-grid">';
        g.cols.forEach(function (c) {
          const i = m.cols.indexOf(c);
          body += fieldHTML(t, c, i, cells);
        });
        body += '</div></div>';
      }
    });
    body += '</div>';

    const title = (idx == null ? 'إضافة سجل جديد — ' : 'تعديل السجل — ') + tableTitle(t);
    const ov = openModal(
      '<div class="modal-head"><h3>' + esc(title) + '</h3><div class="spacer"></div>' +
      '<button class="modal-close" data-x="1">' + ic('close') + '</button></div>' +
      '<div class="modal-body">' + body + '</div>' +
      '<div class="modal-foot"><span class="hint">الحقول المعلّمة بـ <span class="req">*</span> إلزامية</span><div class="spacer"></div>' +
      '<button class="btn btn-outline" data-x="1">إلغاء</button>' +
      '<button class="btn btn-primary" data-save="1">' + ic('save') + 'حفظ</button></div>', 'lg');

    ov.addEventListener('click', function (e) {
      if (e.target.closest('[data-x]')) { closeModal(); return; }
      if (!e.target.closest('[data-save]')) return;

      const newCells = cells.slice();
      $$('[data-col]', ov).forEach(function (inp) {
        const i = +inp.getAttribute('data-col');
        let v;
        if (inp.getAttribute('data-bool') === '1') {
          v = inp.value === 'true' ? true : inp.value === 'false' ? false : null;
        } else {
          v = inp.value;
        }
        newCells[i] = v;
      });

      const req = REQUIRED[t] || {};
      const keys = Object.keys(req);
      for (let k = 0; k < keys.length; k++) {
        const c = keys[k], i = m.cols.indexOf(c);
        const v = i >= 0 ? newCells[i] : null;
        if (v == null || String(v).trim() === '') {
          toast(req[c], 'err');
          return;
        }
      }

      if (idx == null) {
        model(t).rows.push({ cells: newCells, orig: -1 });
        commit(t);
        toast('تمت حفظ البيانات بنجاح');
      } else {
        model(t).rows[idx].cells = newCells;
        commit(t);
        toast('تم تعديل البيانات بنجاح');
      }
      closeModal();
      if ($('#table-host')) paintTable(t);
      else route();
      buildNav();
    });
  }

  function openDetail(t, idx) {
    const m = model(t), cells = m.rows[idx].cells;
    const groups = groupsFor(t);
    const title = fullName(t, cells) || cellText(t, cells, 'sch') || ('سجل رقم ' + (idx + 1));

    let body = '<div class="detail-grid">';
    groups.forEach(function (g) {
      let has = false;
      let inner = '';
      g.cols.forEach(function (c) {
        const val = cellText(t, cells, c);
        if (val === '') return;
        has = true;
        inner += '<div class="detail-item"><label>' + esc(colLabel(t, c)) + '</label><div>' + esc(val) + '</div></div>';
      });
      if (has) body += '<div class="detail-sec">' + esc(g.title) + '</div>' + inner;
    });
    body += '</div>';

    const ov = openModal(
      '<div class="modal-head"><div><h3>' + esc(title) + '</h3><div class="sub">' + esc(tableTitle(t)) + '</div></div>' +
      '<div class="spacer"></div><button class="modal-close" data-x="1">' + ic('close') + '</button></div>' +
      '<div class="modal-body">' + body + '</div>' +
      '<div class="modal-foot"><button class="btn btn-outline" data-x="1">إغلاق</button><div class="spacer"></div>' +
      '<button class="btn btn-outline" data-print-profile="1">' + ic('print') + 'طباعة البيانات</button>' +
      '<button class="btn btn-primary" data-edit="1">' + ic('edit') + 'تعديل</button></div>', 'lg');

    ov.addEventListener('click', function (e) {
      if (e.target.closest('[data-x]')) { closeModal(); return; }
      if (e.target.closest('[data-print-profile]')) {
        closeModal();
        printProfile(t, cells);
        return;
      }
      if (e.target.closest('[data-edit]')) {
        closeModal();
        openForm(t, idx);
      }
    });
  }

  /* ---------------- Export / print ---------------- */
  function download(name, text, mime) {
    const blob = new Blob(['\uFEFF' + text], { type: (mime || 'text/csv') + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function csvCell(v) {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function exportCSV(t) {
    const rows = filterRows(t);
    const cols = displayCols(t);
    let out = cols.map(function (c) { return csvCell(colLabel(t, c)); }).join(',') + '\r\n';
    rows.forEach(function (r) {
      out += cols.map(function (c) { return csvCell(cellText(t, r.cells, c)); }).join(',') + '\r\n';
    });
    download(tableTitle(t) + '.csv', out);
    toast('تم تصدير ' + rows.length + ' سجل إلى ملف CSV');
  }

  function paperHead(title, sub) {
    return '<div class="p-head"><div class="ministry">وزارة التربية والتعليم</div>' +
      '<div class="dept">مراقبة التربية والتعليم — سلوق</div>' +
      '<h2>' + esc(title) + '</h2>' + (sub ? '<div class="dept">' + esc(sub) + '</div>' : '') + '</div>';
  }

  function printHTML(html) {
    $('#print-area').innerHTML = html;
    setTimeout(function () { window.print(); }, 80);
  }

  function printTableGeneric(t) {
    const allRows = S.vs ? filterRows(t) : model(t).rows.map(function (r, i) { return { idx: i, cells: r.cells }; });
    const rows = allRows.slice(0, 800);
    const cols = (S.vs && S.vs.all) ? model(t).cols : ((TCFG[t] && TCFG[t].cols) ? TCFG[t].cols : defaultCols(t));
    const cfg = TCFG[t] || {};
    let html = '<div class="paper">' + paperHead(tableTitle(t), cfg.sub || '') +
      '<div class="p-meta"><span>عدد السجلات: ' + rows.length + '</span><span>تاريخ الطباعة: ' + todayStr() + '</span></div>' +
      '<table><thead><tr><th>م</th>' + cols.map(function (c) { return '<th>' + esc(colLabel(t, c)) + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      html += '<tr><td>' + (i + 1) + '</td>' + cols.map(function (c) { return '<td>' + esc(cellText(t, r.cells, c)) + '</td>'; }).join('') + '</tr>';
    });
    if (!rows.length) html += '<tr><td colspan="' + (cols.length + 1) + '" style="text-align:center;padding:18px">لا توجد سجلات مطابقة للطباعة</td></tr>';
    html += '</tbody></table><div class="p-sign"><div>مشغل المنظومة<br>' + esc(S.user || '') + '</div><div>التوقيع<br><br></div><div>الختم<br><br></div></div></div>';
    printHTML(html);
  }

  function printProfile(t, cells) {
    const name = fullName(t, cells) || cellText(t, cells, 'NAME') || '';
    const rows = [
      ['الاسم رباعي', name],
      ['الرقم الوطني', cellText(t, cells, 'record')],
      ['رقم المنظومة', cellText(t, cells, 'SEQ')],
      ['المؤهل العلمي', cellText(t, cells, 'qualified')],
      ['التخصص', cellText(t, cells, 'assignation')],
      ['الوظيفة', cellText(t, cells, 'postion')],
      ['المدرسة', cellText(t, cells, 'school')],
      ['نوع التعيين', cellText(t, cells, 'designation')],
      ['تاريخ التعيين', cellText(t, cells, 'D_designation')],
      ['الدرجة', cellText(t, cells, 'class_now')],
      ['تاريخ الميلاد', cellText(t, cells, 'birthday')],
      ['مكان الميلاد', cellText(t, cells, 'birth')],
      ['الجنس', cellText(t, cells, 'SEX')],
      ['الجنسية', cellText(t, cells, 'flag')],
      ['الحالة الاجتماعية', cellText(t, cells, 'clubbable')],
      ['اسم الأم', cellText(t, cells, 'MOTHER')],
      ['المصرف', cellText(t, cells, 'bank')],
      ['الفرع', cellText(t, cells, 'subbank')],
      ['رقم الحساب', cellText(t, cells, 'no_acc')],
      ['الهاتف', cellText(t, cells, 'Tel')]
    ];
    let html = '<div class="paper">' +
      paperHead('بيانات الموظف', 'البيانات الشخصية والوظيفية لموظفي قطاع التربية والتعليم — سلوق') +
      '<div class="p-fields">';
    rows.forEach(function (r) {
      if (!r[1]) return;
      html += '<div class="p-field"><label>' + esc(r[0]) + '</label><span>' + esc(r[1]) + '</span></div>';
    });
    html += '</div><div class="p-sign"><div>مشغل المنظومة<br>' + esc(S.user || '') + '</div><div>مدير المدرسة<br><br></div><div>الختم<br><br></div></div></div>';
    printHTML(html);
  }

  /* ---------------- Schools ---------------- */
  function renderSchools() {
    setTitle('المدارس', 'المدارس التابعة لمراقبة التربية والتعليم — سلوق');
    S.vs = null;
    const counts = {};
    model('empolye').rows.forEach(function (r) {
      const s = cellText('empolye', r.cells, 'school');
      if (s) counts[s] = (counts[s] || 0) + 1;
    });
    const managers = {};
    if (MAN['BIAN']) {
      model('BIAN').rows.forEach(function (r) {
        const s = cellText('BIAN', r.cells, 'SCHOOL');
        if (s) managers[s] = cellText('BIAN', r.cells, 'MANGE');
      });
    }
    let cards = '';
    model('SCHOOLS').rows.forEach(function (r) {
      const name = cellText('SCHOOLS', r.cells, 'sch');
      const code = cellText('SCHOOLS', r.cells, 'Udate');
      const c = counts[name] || 0;
      const mgr = managers[name] || cellText('SCHOOLS', r.cells, 'manager');
      cards += '<div class="school-card" data-school="' + esc(name) + '">' +
        '<b>' + esc(name) + '</b>' +
        '<div style="font-size:11.5px;color:var(--muted)">' + (mgr ? 'المدير: ' + esc(mgr) : 'لم يُحدد المدير') + '</div>' +
        '<div class="meta"><span>عدد الموظفين</span><span class="count">' + c + '</span></div>' +
        '<div class="meta"><span>رمز المدرسة</span><span>' + esc(code) + '</span></div>' +
        '</div>';
    });
    if (!cards) cards = '<div class="empty-state">' + ic('school') + '<h3>لا توجد مدارس</h3></div>';

    $('#view').innerHTML =
      '<div class="section-title"><h2>المدارس</h2><div class="desc">' + model('SCHOOLS').rows.length + ' مدرسة</div>' +
      '<div class="spacer" style="flex:1"></div>' +
      '<button class="btn btn-primary" data-act="add" data-table="SCHOOLS">' + ic('plus') + 'إضافة مدرسة</button></div>' +
      '<div class="school-grid">' + cards + '</div>' +
      '<div class="card" style="margin-top:18px"><div class="card-head"><h3>بيانات المدرسة والقيادة</h3>' +
      '<div class="spacer"></div><a class="btn btn-sm btn-outline" href="#/t/BIAN">تعديل</a></div>' +
      '<div class="card-body">' + (model('BIAN').rows.length ?
        '<dl class="kv">' + model('BIAN').cols.map(function (c, i) {
          const v = model('BIAN').rows[0].cells[i];
          return v ? '<dt>' + esc(colLabel('BIAN', c)) + '</dt><dd>' + esc(v) + '</dd>' : '';
        }).join('') + '</dl>' : '<div class="hint">لا توجد بيانات</div>') + '</div></div>';

    S.printFn = function () { printTableGeneric('SCHOOLS'); };
  }

  function filterEmployeesBy(school) {
    pendingFilter = { school: school };
    if (location.hash === '#/t/empolye') {
      S.vs.f = { school: school };
      S.vs.page = 1;
      paintTable('empolye');
    } else {
      navigate('#/t/empolye');
    }
  }

  /* ---------------- Reports ---------------- */
  const REPORTS = [
    { id: 'kafaa', title: 'تقرير كفاءة الموظف', desc: 'تقرير الكفاءة السنوي بأقسامه الثلاثة', icon: 'file' },
    { id: 'tamam', title: 'كشف التمام الشهري', desc: 'حضور وغياب الموظفين خلال شهر', icon: 'calendar' },
    { id: 'ijazat', title: 'كشف إجازات الوضع', desc: 'إجازات الموظفين وتغطية العجز', icon: 'clock' },
    { id: 'profile', title: 'بيانات الموظف', desc: 'بيان بالبيانات الشخصية والوظيفية', icon: 'id' },
    { id: 'takleef', title: 'مذكرة تكليف بتدريس مادة', desc: 'مذكرة تكليف المعلم بالمادة والحصص', icon: 'book' }
  ];

  function distinct(t, c) {
    const o = {};
    model(t).rows.forEach(function (r) {
      const v = cellText(t, r.cells, c);
      if (v !== '') o[v] = 1;
    });
    return Object.keys(o).sort(function (a, b) { return a.localeCompare(b, 'ar'); });
  }

  function empList() {
    return model('empolye').rows.map(function (r) {
      const seq = cellText('empolye', r.cells, 'SEQ');
      return { seq: seq, name: fullName('empolye', r.cells), cells: r.cells };
    }).filter(function (x) { return x.seq; })
      .sort(function (a, b) { return a.name.localeCompare(b.name, 'ar'); });
  }

  function renderReports() {
    setTitle('التقارير والطباعة', 'نماذج التقارير الرسمية المعتمدة');
    let cards = '';
    REPORTS.forEach(function (r) {
      cards += '<a class="school-card" href="#/report/' + r.id + '">' +
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<span class="stat-ico" style="width:36px;height:36px;border-radius:10px">' + ic(r.icon) + '</span>' +
        '<b style="margin:0">' + esc(r.title) + '</b></div>' +
        '<div style="font-size:12px;color:var(--muted);line-height:1.7">' + esc(r.desc) + '</div>' +
        '<div class="meta"><span>فتح النموذج</span><span class="count">←</span></div></a>';
    });
    $('#view').innerHTML =
      '<div class="section-title"><h2>التقارير والطباعة</h2><div class="desc">اختر النموذج ثم حدّد البيانات واطبع</div></div>' +
      '<div class="school-grid">' + cards + '</div>' +
      '<div class="callout" style="margin-top:18px">' + ic('alert') +
      '<div>جميع التقارير تُطبع على ورق A4، وتحتوي ترويسة وزارة التربية والتعليم ومراقبة التعليم — سلوق.</div></div>';

    S.printFn = function () {
      let h = '<div class="paper">' + paperHead('قائمة التقارير المتاحة', '') +
        '<table><thead><tr><th style="width:40px">م</th><th>التقرير</th><th>الوصف</th></tr></thead><tbody>';
      REPORTS.forEach(function (r, i) {
        h += '<tr><td>' + (i + 1) + '</td><td>' + esc(r.title) + '</td><td>' + esc(r.desc) + '</td></tr>';
      });
      h += '</tbody></table></div>';
      printHTML(h);
    };
  }

  function reportShell(controls, previewTitle) {
    $('#view').innerHTML =
      '<div class="section-title"><a class="btn btn-outline" href="#/reports">' + ic('arrow') + 'رجوع</a>' +
      '<h2 style="margin:0 10px">' + esc(previewTitle) + '</h2></div>' +
      '<div class="report-layout">' +
      '<div class="card"><div class="card-head"><h3>خيارات التقرير</h3></div><div class="card-body">' + controls +
      '<button class="btn btn-primary btn-block" data-act="print-report" style="margin-top:16px">' + ic('print') + 'طباعة التقرير</button>' +
      '<div class="hint" style="margin-top:10px">يمكنك الطباعة أو الحفظ بصيغة PDF من نافذة الطباعة.</div></div></div>' +
      '<div class="report-preview" id="rep-preview"></div></div>';

    S.printFn = function () {
      const prev = $('#rep-preview');
      if (prev && prev.innerHTML) printHTML(prev.innerHTML);
    };
  }

  function setPreview(html) {
    const el = $('#rep-preview');
    if (el) el.innerHTML = html;
  }

  function pField(label, val) {
    if (val == null || val === '') val = '—';
    return '<div class="p-field"><label>' + esc(label) + '</label><span>' + esc(val) + '</span></div>';
  }

  function findRow(t, col, val) {
    const m = model(t);
    const i = m.cols.indexOf(col);
    if (i < 0) return null;
    const want = String(val == null ? '' : val).replace(/\r\n?/g, '\n').trim();
    for (let k = m.rows.length - 1; k >= 0; k--) {
      const cur = String(m.rows[k].cells[i] == null ? '' : m.rows[k].cells[i]).replace(/\r\n?/g, '\n').trim();
      if (cur === want) return m.rows[k].cells;
    }
    return null;
  }

  function kafaaPaper(seq) {
    const emp = findRow('empolye', 'SEQ', seq) || [];
    const rep = findRow('repot', 'SEQ', seq) || [];
    const g = function (t, cells, c) { return cells.length ? cellText(t, cells, c) : ''; };
    const name = g('empolye', emp, '__name') || g('repot', rep, 'NAME');
    const grades = [
      ['أداء الواجب', g('repot', rep, 'rep1'), '40'],
      ['كمية العمل', g('repot', rep, 'rep2'), '20'],
      ['جودة العمل', g('repot', rep, 'rep3'), '10'],
      ['الحرص على استخدام أجهزة وأدوات العمل', g('repot', rep, 'rep4'), '10'],
      ['المجموع', g('repot', rep, 'rep5'), '80'],
      ['التقدير العام', g('repot', rep, 'rep6'), '—'],
      ['درجة الكفاءة المعدلة', g('repot', rep, 'rep7'), '—']
    ];
    let rows = '';
    grades.forEach(function (x) {
      rows += '<tr><td>' + esc(x[0]) + '</td><td style="text-align:center;width:110px">' + esc(x[1] || '') + '</td>' +
        '<td style="text-align:center;width:110px">' + esc(x[2]) + '</td></tr>';
    });
    return '<div class="paper">' + paperHead('تقرير كفاءة الموظف', 'للمدة من ' + (g('repot', rep, 'd_td') || '..........') + ' إلى ' + (g('repot', rep, 'as_td') || '..........')) +
      '<div class="p-meta"><span>الرقم الوطني: ' + esc(g('empolye', emp, 'record')) + '</span><span>الرقم الإشاري: ' + esc(g('empolye', emp, 'SEQ')) + '</span></div>' +
      '<div class="p-sec">القسم الأول / معلومات عامة</div>' +
      '<div class="p-fields">' +
      pField('الاسم واللقب', name) +
      pField('الرقم الوطني', g('empolye', emp, 'record')) +
      pField('المؤهل العلمي', g('empolye', emp, 'qualified')) +
      pField('التخصص', g('empolye', emp, 'assignation')) +
      pField('تاريخ الحصول عليه', g('empolye', emp, 'D_qualified')) +
      pField('الوظيفة الحالية', g('empolye', emp, 'postion')) +
      pField('الدرجة', g('empolye', emp, 'class_now')) +
      pField('تاريخ الحصول على الدرجة', g('empolye', emp, 'D_class')) +
      pField('مكان العمل الحالي', g('empolye', emp, 'school')) +
      pField('الجنسية', g('empolye', emp, 'flag')) +
      '</div>' +
      '<div class="p-sec">القسم الثاني: كفاءة الأداء والصفات الشخصية</div>' +
      '<table class="kaf-table"><thead><tr><th>البند</th><th>الدرجة</th><th>الدرجة القصوى</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<div class="p-sec">القسم الثالث: إبداء الرئيس رأيه صراحة في مرؤوسه</div>' +
      '<div class="check-line">' +
      '<span class="box"></span>التوصية بمنحة مكافأة أو علاوة استثنائية وفقاً للقوانين واللوائح<br>' +
      '<span class="box"></span>ترشيحه للترقية إلى وظيفة من درجة أعلى<br>' +
      '<span class="box"></span>حاجته إلى التدريب في مجالات محددة<br>' +
      '<span class="box"></span>التوصية بنقله إلى وظيفة أخرى تتناسب مع قدراته وإمكانياته' +
      '</div>' +
      '<div class="p-sign"><div>اسم الرئيس المباشر<br><br>' + esc(g('empolye', emp, 'school')) + '</div>' +
      '<div>التوقيع<br><br></div><div>التاريخ<br><br>' + todayStr() + '</div></div>' +
      '<div style="margin-top:26px;font-size:12px">يعتمد / مدير مدرسة ................................</div></div>';
  }

  function tamamPaper(school, month, year, src) {
    const t = src;
    const rows = model(t).rows.filter(function (r) {
      const s = cellText(t, r.cells, 'school');
      const m = cellText(t, r.cells, 'MUN_EDIT');
      const y = cellText(t, r.cells, 'YEAR_EDIT');
      return (!school || s === school) && (!month || m === month) && (!year || y === year);
    });
    let html = '<div class="paper">' + paperHead('كشف التمام الشهري', 'عن شهر ' + (month || '..........') + ' لسنة ' + (year || '..........') + ' — مدرسة ' + (school || '..........')) +
      '<table><thead><tr><th style="width:38px">م</th><th>الاسم رباعي</th><th style="width:80px">حضور</th><th style="width:80px">غياب</th><th style="width:150px">ملاحظة</th></tr></thead><tbody>';
    if (!rows.length) {
      html += '<tr><td colspan="5" style="text-align:center;padding:20px">لا توجد بيانات مطابقة</td></tr>';
    }
    rows.forEach(function (r, i) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + esc(fullName(t, r.cells)) + '</td>' +
        '<td style="text-align:center">' + esc(cellText(t, r.cells, 'tot_h')) + '</td>' +
        '<td style="text-align:center">' + esc(cellText(t, r.cells, 'tot_d')) + '</td>' +
        '<td>' + esc(cellText(t, r.cells, 'Nota_work')) + '</td></tr>';
    });
    html += '</tbody></table>' +
      '<div class="p-note">* عدد أيام الشهر: ' + (rows.length ? esc(cellText(t, rows[0].cells, 'beet')) : '..........') + '</div>' +
      '<div class="p-sign"><div>مدير المدرسة<br><br>يعتمد</div><div>الأمين الإداري<br><br></div><div>مراقبة التعليم<br><br></div></div></div>';
    return html;
  }

  function ijazatPaper(school) {
    const rows = model('ivi_del').rows.filter(function (r) {
      return !school || cellText('ivi_del', r.cells, 'school') === school;
    });
    let html = '<div class="paper">' + paperHead('كشف إجازات الوضع', school ? 'مدرسة ' + school : 'جميع المدارس') +
      '<table><thead><tr><th>م</th><th>الاسم</th><th>المؤهل</th><th>التخصص</th><th>بداية الإجازة</th><th>نهايتها</th><th>العجز</th></tr></thead><tbody>';
    if (!rows.length) html += '<tr><td colspan="7" style="text-align:center;padding:20px">لا توجد إجازات مسجلة</td></tr>';
    rows.forEach(function (r, i) {
      html += '<tr><td>' + (i + 1) + '</td><td>' + esc(cellText('ivi_del', r.cells, 'name')) + '</td>' +
        '<td>' + esc(cellText('ivi_del', r.cells, 'qualified')) + '</td>' +
        '<td>' + esc(cellText('ivi_del', r.cells, 'assignation')) + '</td>' +
        '<td>' + esc(cellText('ivi_del', r.cells, 'j_w')) + '</td>' +
        '<td>' + esc(cellText('ivi_del', r.cells, 'end_j')) + '</td>' +
        '<td>' + esc(cellText('ivi_del', r.cells, 'ajz_w')) + '</td></tr>';
    });
    html += '</tbody></table><div class="p-sign"><div>مدير المدرسة<br><br>يعتمد</div><div>الأمين الإداري<br><br></div><div>مراقبة التعليم<br><br></div></div></div>';
    return html;
  }

  function profilePaperHTML(cells) {
    const t = 'empolye';
    const rows = [
      ['الاسم رباعي', fullName(t, cells)],
      ['الرقم الوطني', cellText(t, cells, 'record')],
      ['رقم المنظومة', cellText(t, cells, 'SEQ')],
      ['تاريخ الميلاد', cellText(t, cells, 'birthday')],
      ['مكان الميلاد', cellText(t, cells, 'birth')],
      ['الجنس', cellText(t, cells, 'SEX')],
      ['الجنسية', cellText(t, cells, 'flag')],
      ['الحالة الاجتماعية', cellText(t, cells, 'clubbable')],
      ['اسم الأم', cellText(t, cells, 'MOTHER')],
      ['المؤهل العلمي', cellText(t, cells, 'qualified')],
      ['التخصص', cellText(t, cells, 'assignation')],
      ['تاريخ المؤهل', cellText(t, cells, 'D_qualified')],
      ['الجهة المانحة', cellText(t, cells, 'side')],
      ['الوظيفة الحالية', cellText(t, cells, 'postion')],
      ['نوع التعيين', cellText(t, cells, 'designation')],
      ['تاريخ التعيين', cellText(t, cells, 'D_designation')],
      ['الدرجة', cellText(t, cells, 'class_now')],
      ['تاريخ الدرجة', cellText(t, cells, 'D_class')],
      ['المدرسة', cellText(t, cells, 'school')],
      ['الفترة', cellText(t, cells, 'class_hour')],
      ['الرقم الوطني', cellText(t, cells, 'record')],
      ['المصرف', cellText(t, cells, 'bank')],
      ['الفرع', cellText(t, cells, 'subbank')],
      ['رقم الحساب', cellText(t, cells, 'no_acc')],
      ['الهاتف', cellText(t, cells, 'Tel')],
      ['العنوان', cellText(t, cells, 'house') || cellText(t, cells, 'street')]
    ];
    let html = '<div class="paper">' + paperHead('بيانات الموظف', 'البيانات الشخصية والوظيفية لموظفي قطاع التربية والتعليم — سلوق') + '<div class="p-fields">';
    rows.forEach(function (r) {
      if (!r[1]) return;
      html += pField(r[0], r[1]);
    });
    html += '</div><div class="p-sign"><div>مشغل المنظومة<br>' + esc(S.user || '') + '</div><div>مدير المدرسة<br><br></div><div>الختم<br><br></div></div></div>';
    return html;
  }

  function takleefPaper(seq) {
    const r = findRow('NESAB', 'SEQ', seq);
    const g = function (c) { return r ? cellText('NESAB', r, c) : ''; };
    return '<div class="paper">' + paperHead('مذكرة تكليف بتدريس مادة', '') +
      '<div style="font-size:13px;line-height:2.2">' +
      '<div>السيد المحترم / مدير مدرسة ' + esc(g('school')) + '</div>' +
      '<div style="margin-top:14px">تحية طيبة وبعد،</div>' +
      '<div style="margin-top:14px">بالإشارة إلى الموضوع أعلاه، تفيدكم إدارة المدرسة بأن المعلمـ/ـة:</div>' +
      '<div style="margin:12px 0;font-weight:700;font-size:15px;text-align:center">' + esc(g('NAME')) + '</div>' +
      '<table><tbody>' +
      '<tr><th style="width:180px">الرقم الوطني</th><td>' + esc(g('record')) + '</td></tr>' +
      '<tr><th>المؤهل العلمي</th><td>' + esc(g('qualified')) + '</td></tr>' +
      '<tr><th>التخصص</th><td>' + esc(g('assignation')) + '</td></tr>' +
      '<tr><th>المادة المكلف بها</th><td>' + esc(g('D_work')) + '</td></tr>' +
      '<tr><th>عدد الحصص</th><td>' + esc(g('trade')) + '</td></tr>' +
      '<tr><th>الصفوف</th><td>' + esc(g('SFOF')) + '</td></tr>' +
      '<tr><th>الفترة</th><td>' + esc(g('class_hour')) + '</td></tr>' +
      '<tr><th>العام الدراسي</th><td>' + esc(g('YEAR')) + '</td></tr>' +
      '</tbody></table>' +
      '<div style="margin-top:18px">مكلف بتدريس المادة أعلاه اعتباراً من تاريخه، ولملفه المعني بالحفظ.</div>' +
      '<div style="margin-top:26px">وتفضلوا بقبول فائق الاحترام،،،</div>' +
      '<div class="p-sign"><div>مشغل المنظومة<br>' + esc(S.user || '') + '</div><div>مدير المدرسة<br><br>يعتمد</div><div>التاريخ<br>' + todayStr() + '</div></div>' +
      '</div></div>';
  }

  function renderReport(id) {
    const meta = REPORTS.filter(function (r) { return r.id === id; })[0];
    if (!meta) return renderReports();

    if (id === 'kafaa') {
      const list = empList();
      let opts = list.map(function (e) {
        return '<option value="' + esc(e.seq) + '">' + esc(e.name) + ' — ' + esc(e.seq) + '</option>';
      }).join('');
      setTitle(meta.title, meta.desc);
      reportShell('<div class="field"><label>الموظف</label><select class="select" id="rep-emp">' + opts + '</select></div>',
        meta.title);
      const upd = function () {
        const v = $('#rep-emp').value;
        setPreview(v ? kafaaPaper(v) : '<div class="empty-state">' + ic('alert') + '<h3>اختر موظفاً</h3></div>');
      };
      $('#rep-emp').addEventListener('change', upd);
      upd();
      return;
    }

    if (id === 'tamam') {
      const schools = distinct('TAMAM_ARC', 'school');
      const months = distinct('TAMAM_ARC', 'MUN_EDIT');
      const years = distinct('TAMAM_ARC', 'YEAR_EDIT');
      setTitle(meta.title, meta.desc);
      reportShell(
        '<div class="field"><label>المدرسة</label><select class="select" id="rep-school"><option value="">كل المدارس</option>' +
        schools.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>الشهر</label><select class="select" id="rep-month">' +
        months.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label>السنة</label><select class="select" id="rep-year">' +
        years.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('') + '</select></div>',
        meta.title);
      const upd = function () {
        setPreview(tamamPaper($('#rep-school').value, $('#rep-month').value, $('#rep-year').value, 'TAMAM_ARC'));
      };
      ['#rep-school', '#rep-month', '#rep-year'].forEach(function (s) { $(s).addEventListener('change', upd); });
      upd();
      return;
    }

    if (id === 'ijazat') {
      const schools = distinct('ivi_del', 'school');
      setTitle(meta.title, meta.desc);
      reportShell('<div class="field"><label>المدرسة</label><select class="select" id="rep-school"><option value="">كل المدارس</option>' +
        schools.map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('') + '</select></div>', meta.title);
      const upd = function () { setPreview(ijazatPaper($('#rep-school').value)); };
      $('#rep-school').addEventListener('change', upd);
      upd();
      return;
    }

    if (id === 'profile') {
      const list = empList();
      setTitle(meta.title, meta.desc);
      reportShell('<div class="field"><label>الموظف</label><select class="select" id="rep-emp">' +
        list.map(function (e) { return '<option value="' + esc(e.seq) + '">' + esc(e.name) + '</option>'; }).join('') + '</select></div>', meta.title);
      const upd = function () {
        const seq = $('#rep-emp').value;
        const row = findRow('empolye', 'SEQ', seq);
        setPreview(row ? profilePaperHTML(row) : '<div class="empty-state">' + ic('alert') + '<h3>اختر موظفاً</h3></div>');
      };
      $('#rep-emp').addEventListener('change', upd);
      upd();
      return;
    }

    if (id === 'takleef') {
      const list = model('NESAB').rows.map(function (r) {
        return { seq: cellText('NESAB', r.cells, 'SEQ'), name: cellText('NESAB', r.cells, 'NAME') };
      }).filter(function (x) { return x.seq; });
      setTitle(meta.title, meta.desc);
      reportShell('<div class="field"><label>المعلم</label><select class="select" id="rep-emp">' +
        list.map(function (e) { return '<option value="' + esc(e.seq) + '">' + esc(e.name) + '</option>'; }).join('') + '</select></div>', meta.title);
      const upd = function () { setPreview(takleefPaper($('#rep-emp').value)); };
      $('#rep-emp').addEventListener('change', upd);
      upd();
    }
  }

  /* ---------------- All tables / settings ---------------- */
  function renderAllTables() {
    setTitle('كل الجداول', 'استعراض جميع جداول قاعدة البيانات');
    const names = Object.keys(MAN).sort(function (a, b) { return tableTitle(a).localeCompare(tableTitle(b), 'ar'); });
    let rows = '';
    names.forEach(function (n) {
      rows += '<tr><td>' + esc(tableTitle(n)) + '</td><td class="num" style="direction:ltr">' + esc(n) + '</td>' +
        '<td class="num">' + (MAN[n].columns.length) + '</td><td class="num">' + countOf(n) + '</td>' +
        '<td><a class="btn btn-sm btn-outline" href="#/t/' + encodeURIComponent(n) + '">فتح</a></td></tr>';
    });
    const total = names.reduce(function (s, n) { return s + countOf(n); }, 0);
    $('#view').innerHTML =
      '<div class="section-title"><h2>كل الجداول</h2><div class="desc">' + names.length + ' جدول · ' + total + ' سجل</div></div>' +
      '<div class="table-wrap"><div class="table-scroll" style="max-height:none"><table class="data"><thead><tr>' +
      '<th>الجدول</th><th>الاسم في القاعدة</th><th>الحقول</th><th>السجلات</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="card" style="margin-top:18px"><div class="card-head"><h3>إدارة البيانات</h3></div><div class="card-body">' +
      '<div class="callout warn">' + ic('alert') + '<div>التعديلات تُحفظ في ذاكرة المتصفح فقط. عند استعادة البيانات الأصلية ستُحذف كل الإضافات والتعديلات المحلية.</div></div>' +
      '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">' +
      '<button class="btn btn-outline" data-act="export-all">' + ic('download') + 'تصدير جدول إلى CSV</button>' +
      '<button class="btn btn-danger-soft" data-act="reset-data">' + ic('refresh') + 'استعادة البيانات الأصلية</button>' +
      '</div></div></div>' +
      '<div class="card" style="margin-top:16px"><div class="card-head"><h3>معلومات المنظومة</h3></div><div class="card-body"><dl class="kv">' +
      '<dt>المصدر</dt><dd>DataBase.mdb</dd>' +
      '<dt>عدد الجداول</dt><dd>' + names.length + '</dd>' +
      '<dt>إجمالي السجلات</dt><dd>' + total + '</dd>' +
      '<dt>التطبيق</dt><dd>منظومة المدارس — نسخة الويب المحلية</dd>' +
      '<dt>المستخدم الحالي</dt><dd>' + esc(S.user) + '</dd>' +
      '</dl></div></div>';

    S.printFn = function () {
      let h = '<div class="paper">' + paperHead('جداول قاعدة البيانات', '') +
        '<table><thead><tr><th style="width:40px">م</th><th>الجدول</th><th>الاسم</th><th>الحقول</th><th>السجلات</th></tr></thead><tbody>';
      names.forEach(function (n, i) {
        h += '<tr><td>' + (i + 1) + '</td><td>' + esc(tableTitle(n)) + '</td><td>' + esc(n) + '</td><td>' + MAN[n].columns.length + '</td><td>' + countOf(n) + '</td></tr>';
      });
      h += '</tbody></table></div>';
      printHTML(h);
    };
  }

  /* ---------------- Events ---------------- */
  function currentTable() {
    const p = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    return p[0] === 't' && p[1] ? decodeURIComponent(p[1]) : null;
  }

  function onViewClick(e) {
    const qa = e.target.closest('[data-quick-add]');
    if (qa) {
      e.preventDefault();
      const tb = qa.getAttribute('data-quick-add');
      navigate('#/t/' + tb);
      setTimeout(function () { openForm(tb, null); }, 150);
      return;
    }

    const schoolCard = e.target.closest('[data-school]');
    if (schoolCard) {
      filterEmployeesBy(schoolCard.getAttribute('data-school'));
      return;
    }

    const rep = e.target.closest('[data-report]');
    if (rep) { navigate('#/report/' + rep.getAttribute('data-report')); return; }

    const t = e.target.closest('[data-act]');
    if (!t) return;
    const act = t.getAttribute('data-act');
    const table = currentTable();

    if (act === 'print-report') {
      const prev = $('#rep-preview');
      if (prev) printHTML(prev.innerHTML);
      return;
    }
    if (act === 'reset-data') {
      confirmBox('استعادة البيانات الأصلية', 'سيتم حذف جميع التعديلات والإضافات المحلية والرجوع إلى نسخة قاعدة البيانات الأصلية. هل أنت متأكد؟', 'استعادة', true)
        .then(function (ok) {
          if (!ok) return;
          resetAll();
          toast('تمت استعادة البيانات الأصلية');
          route();
          buildNav();
        });
      return;
    }
    if (act === 'export-all') {
      const names = Object.keys(MAN);
      let out = '';
      names.forEach(function (n) {
        out += '### ' + tableTitle(n) + '\r\n';
        const cols = model(n).cols;
        out += cols.map(function (c) { return csvCell(colLabel(n, c)); }).join(',') + '\r\n';
        model(n).rows.forEach(function (r) {
          out += cols.map(function (c, i) { return csvCell(r.cells[i]); }).join(',') + '\r\n';
        });
        out += '\r\n';
      });
      download('قاعدة_بيانات_المنظومة.csv', out);
      toast('تم تصدير جميع الجداول');
      return;
    }
    if (!table && act !== 'allcols') {
      if (act === 'add') {
        const tb = t.getAttribute('data-table');
        if (tb) openForm(tb, null);
      }
      return;
    }

    if (act === 'add') { openForm(table, null); return; }
    if (act === 'csv') { exportCSV(table); return; }
    if (act === 'print') { if (S.printFn) S.printFn(); else printTableGeneric(table); return; }
    if (act === 'allcols') { S.vs.all = !S.vs.all; paintTable(table); return; }
    if (act === 'sort') {
      const key = t.getAttribute('data-sort');
      if (S.vs.sort === key) S.vs.dir = -S.vs.dir;
      else { S.vs.sort = key; S.vs.dir = 1; }
      S.vs.page = 1;
      paintTable(table);
      return;
    }
    if (act === 'page') {
      S.vs.page = parseInt(t.getAttribute('data-page'), 10) || 1;
      paintTable(table);
      return;
    }
    if (act === 'view') { openDetail(table, +t.getAttribute('data-idx')); return; }
    if (act === 'edit') { openForm(table, +t.getAttribute('data-idx')); return; }
    if (act === 'del') {
      const idx = +t.getAttribute('data-idx');
      const isEmp = table === 'empolye';
      const msg = isEmp ? 'آنت الان تحاول حذف موظف هل انت متاكد من الحذف' : 'هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن الحذف.';
      confirmBox('تأكيد الحذف', msg, 'حذف', true).then(function (ok) {
        if (!ok) return;
        model(table).rows.splice(idx, 1);
        commit(table);
        toast(isEmp ? 'تم حذف الموظف بنجاح' : 'تم حذف السجل بنجاح');
        paintTable(table);
        buildNav();
      });
    }
  }

  function init() {
    $('#status-date').textContent = dateAr();

    $('#login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const err = $('#login-error');
      const u = $('#login-user').value.trim();
      const p = $('#login-pass').value;
      const show = function (m) { err.textContent = m; err.classList.add('show'); };
      err.classList.remove('show');
      if (!u) { show('الرجاء ادراج الاسم اولاً'); $('#login-user').focus(); return; }
      if (!p) { show('الرجاء كلمة المرور اولاً'); $('#login-pass').focus(); return; }
      if (!accounts().length) { show('لا توجد حسابات في قاعدة البيانات'); return; }
      const acc = login(u, p);
      if (!acc) { show('رمز المرور خطاء'); $('#login-pass').select(); return; }
      enterApp(acc.name, false);
    });

    $('#pass-toggle').addEventListener('click', function () {
      const inp = $('#login-pass');
      const isPass = inp.type === 'password';
      inp.type = isPass ? 'text' : 'password';
      this.innerHTML = isPass
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-2.1 3.1"/><path d="M6.6 6.6A17 17 0 0 0 2 11s3.5 7 10 7a10 10 0 0 0 4.1-.8"/><path d="M2 2l20 20"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });

    $('#btn-logout').addEventListener('click', function () {
      confirmBox('تسجيل الخروج', 'هل تريد الخروج من المنظومة؟', 'خروج', false).then(function (ok) {
        if (ok) { logout(); toast('تم تسجيل الخروج'); }
      });
    });

    $('#hamburger').addEventListener('click', function () { $('#app').classList.toggle('nav-open'); });

    $('#app').addEventListener('click', function (e) {
      if (this.classList.contains('nav-open') && !e.target.closest('#sidebar') && !e.target.closest('#hamburger')) {
        this.classList.remove('nav-open');
      }
    });

    $('#btn-print').addEventListener('click', function () {
      if (S.printFn) S.printFn();
      else window.print();
    });

    $('#global-search').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      const q = this.value.trim();
      if (!q) return;
      this.value = '';
      if (currentTable() === 'empolye' && S.vs) {
        S.vs.q = q; S.vs.page = 1; paintTable('empolye');
      } else {
        pendingQuery = q;
        navigate('#/t/empolye');
      }
      toast('نتائج البحث عن: ' + q);
    });

    document.getElementById('view').addEventListener('click', onViewClick);
    window.addEventListener('hashchange', route);

    let saved = null;
    try { saved = sessionStorage.getItem('madrasa.user'); } catch (e) { saved = null; }
    if (!window.DB || !Object.keys(MAN).length) {
      $('#login-error').textContent = 'تعذّر تحميل قاعدة البيانات (data/db.js)';
      $('#login-error').classList.add('show');
      return;
    }
    if (saved) enterApp(saved, true);
  }

  // واجهة تطوير بسيطة (للتوسعة لاحقًا)
  window.Madrasa = { state: S, model: model, reset: resetAll };

  init();

})();
