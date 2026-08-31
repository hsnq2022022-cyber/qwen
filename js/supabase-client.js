/* ═══════════════════════════════════════════════════════════
   إدارة ســوشـــيــــال — تهيئة اتصال Supabase
   ─────────────────────────────────────────────────────────
   هذا الملف مسؤول عن:
   1. تخزين بيانات الاتصال (URL + anon key)
   2. تصدير getSupabaseConfig() ليقرأها main.js
   3. أدوات التشخيص: diagnoseSupabase() و checkSupabaseRLS()
   4. التحقق من صحة الاتصال عند تحميل الصفحة
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ╔══════════════════════════════════════════════════════════╗
     ║  🔑 بيانات اتصال Supabase الفعلية (حقيقية)              ║
     ║  المشروع: mlbofdtmxjxjnjdwivqo                          ║
     ║  المصدر: Supabase Dashboard → Settings → API            ║
     ╚══════════════════════════════════════════════════════════╝ */

  const SUPABASE_URL = 'https://mlbofdtmxjxjnjdwivqo.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYm9mZHRteGp4am5qZHdpdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTI0MTcsImV4cCI6MjEwMjU2ODQxN30.EJ49q1zSEvlRnus0tHIKK4bdpVp_XRgORB5Iif2v-XY';

  /* ═══════════════════════════════════════════════════════════
     دالة جلب الإعدادات الفعّالة
     ─────────────────────────────────────────────────────────
     الأولوية: localStorage (إذا تم التعديل من صفحة #/setup)
     ثم: إعدادات هذا الملف (الحالية)
     ثم: null (لا اتصال)
  ═══════════════════════════════════════════════════════════ */
  function getEffectiveConfig() {
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem('aown_cfg'));
    } catch (e) {
      console.warn('[Supabase] فشل قراءة aown_cfg من localStorage');
    }

    // إذا كان هناك إعداد محفوظ من صفحة الخلفية، وله أولوية
    if (stored && stored.url && stored.key) {
      return {
        url: stored.url,
        key: stored.key,
        source: 'localStorage'
      };
    }

    // وإلا نستخدم إعدادات هذا الملف (الحقيقية)
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      return {
        url: SUPABASE_URL,
        key: SUPABASE_ANON_KEY,
        source: 'file'
      };
    }

    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     🔍 دالة التشخيص الشاملة
     ─────────────────────────────────────────────────────────
     شغّلها من Console:  window.diagnoseSupabase()
     لتعرف بالضبط ما المشكلة عند فشل الاتصال.
  ═══════════════════════════════════════════════════════════ */
  function diagnoseConnection() {
    const report = {
      supabaseLibraryLoaded: typeof window.supabase !== 'undefined',
      configFileHasCredentials: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
      configFileURL: SUPABASE_URL || '(فارغ)',
      configFileKeyLength: SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.length : 0,
      localStorageConfig: null,
      effectiveConfig: null,
      issues: []
    };

    try {
      report.localStorageConfig = JSON.parse(localStorage.getItem('aown_cfg'));
    } catch (e) {}

    report.effectiveConfig = getEffectiveConfig();

    // فحص 1: مكتبة Supabase من CDN
    if (!report.supabaseLibraryLoaded) {
      report.issues.push(
        '❌ مكتبة Supabase لم تُحمّل من CDN — تحقق من اتصال الإنترنت أو حجب المتصفح لـ jsdelivr.net'
      );
    }

    // فحص 2: وجود إعدادات اتصال
    if (!report.effectiveConfig) {
      report.issues.push(
        '❌ لا توجد إعدادات اتصال — أضف URL و anon key في ملف js/supabase-client.js أو من صفحة #/setup'
      );
    } else {
      // فحص 3: صيغة URL
      if (!/^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(report.effectiveConfig.url)) {
        report.issues.push(
          '❌ صيغة الرابط غير صحيحة — يجب أن يكون: https://xxxx.supabase.co'
        );
      }

      // فحص 4: طول مفتاح anon
      if (!report.effectiveConfig.key || report.effectiveConfig.key.length < 100) {
        report.issues.push(
          '❌ مفتاح anon key قصير جدًا أو غير صالح — يجب أن يبدأ بـ eyJ... ويكون طوله ~200 حرف'
        );
      }

      // فحص 5: JWT صالح (التحقق من انتهاء الصلاحية)
      try {
        const payload = JSON.parse(atob(report.effectiveConfig.key.split('.')[1]));
        const expMs = payload.exp * 1000;
        const now = Date.now();
        const daysLeft = Math.floor((expMs - now) / 86400000);
        report.jwtExpiry = new Date(expMs).toLocaleDateString('ar-SA');
        report.jwtDaysLeft = daysLeft;
        if (daysLeft < 0) {
          report.issues.push('❌ مفتاح anon key منتهي الصلاحية — أعد توليده من Supabase Dashboard');
        } else if (daysLeft < 30) {
          report.issues.push(`⚠️ المفتاح ينتهي خلال ${daysLeft} يومًا — فكّر في تجديده قريبًا`);
        }
      } catch (e) {
        report.issues.push('❌ مفتاح anon ليس بصيغة JWT صالحة');
      }
    }

    // عرض التقرير
    console.group('%c🔍 [Supabase Diagnostics Report]', 'color:#0ABAB5;font-weight:bold;font-size:14px');
    console.log('%c📋 التقرير الكامل:', 'font-weight:bold;color:#4fdcd7');
    console.table(report);

    if (report.issues.length > 0) {
      console.log('%c⚠️ المشاكل المكتشفة:', 'font-weight:bold;color:#f59e0b');
      report.issues.forEach(function (issue, i) {
        console.warn((i + 1) + '. ' + issue);
      });
    } else {
      console.log('%c✅ جميع الفحوصات ناجحة — الاتصال جاهز', 'color:#10b981;font-weight:bold');
      console.log(`🔗 URL: ${report.effectiveConfig.url}`);
      console.log(`🔑 Anon Key: ${report.effectiveConfig.key.substring(0, 30)}...`);
      console.log(`⏰ انتهاء صلاحية JWT: ${report.jwtExpiry} (باقي ${report.jwtDaysLeft} يومًا)`);
    }
    console.groupEnd();

    return report;
  }

  /* ═══════════════════════════════════════════════════════════
     🛡️ فحص سياسات Row Level Security (RLS)
     ─────────────────────────────────────────────────────────
     شغّلها من Console بعد تحميل الصفحة:
     const c = window.supabase.createClient(URL, KEY);
     window.checkSupabaseRLS(c);
  ═══════════════════════════════════════════════════════════ */
  function checkRLSPolicies(client) {
    if (!client) {
      console.warn('❌ لا يوجد عميل Supabase — أنشئه أولًا');
      return;
    }

    const tables = [
      'workspaces',
      'agents',
      'widgets',
      'knowledge_docs',
      'knowledge_chunks',
      'contacts',
      'conversations',
      'invoices'
    ];

    console.group('%c🛡️ [RLS Policy Check]', 'color:#f59e0b;font-weight:bold;font-size:14px');
    console.log(`🔎 فحص ${tables.length} جدول...`);

    let completed = 0;
    const results = [];

    tables.forEach(function (table) {
      client
        .from(table)
        .select('id', { count: 'exact', head: true })
        .then(function (res) {
          const status = res.error ? '❌' : '✅';
          const msg = res.error ? res.error.message : `${res.count || 0} سجل`;
          console.log(`${status} ${table}: ${msg}`);
          results.push({ table, ok: !res.error, count: res.count || 0, error: res.error?.message });
          completed++;
          if (completed === tables.length) {
            const failed = results.filter(r => !r.ok);
            if (failed.length > 0) {
              console.log('%c❌ الجداول التي فشلت (تحقق من RLS):', 'color:#ef4444');
              console.table(failed);
              console.log('💡 شغّل مخطط SQL من صفحة #/setup (تبويب «٢. ترحيل قاعدة البيانات»)');
            } else {
              console.log('%c✅ جميع الجداول تعمل بشكل صحيح', 'color:#10b981;font-weight:bold');
            }
            console.groupEnd();
          }
        })
        .catch(function (err) {
          console.error(`❌ ${table}:`, err.message);
          completed++;
          if (completed === tables.length) console.groupEnd();
        });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     🧪 اختبار فعلي للاتصال (اختياري)
     ─────────────────────────────────────────────────────────
     يُنشئ عميل Supabase ويحاول قراءة جدول workspaces
  ═══════════════════════════════════════════════════════════ */
  async function testConnection() {
    const cfg = getEffectiveConfig();
    if (!cfg) {
      console.error('❌ لا توجد إعدادات اتصال');
      return;
    }
    if (typeof window.supabase === 'undefined') {
      console.error('❌ مكتبة Supabase غير محمّلة');
      return;
    }

    console.log('%c🧪 بدء اختبار الاتصال...', 'color:#0ABAB5;font-weight:bold');
    console.log(`🔗 URL: ${cfg.url}`);

    try {
      const client = window.supabase.createClient(cfg.url, cfg.key);

      // اختبار 1: قراءة workspaces
      const { data: ws, error: wsErr } = await client
        .from('workspaces')
        .select('id, name, plan')
        .limit(1);

      if (wsErr) {
        console.error('❌ فشل قراءة workspaces:', wsErr.message);
        if (/policy|permission/i.test(wsErr.message)) {
          console.log('💡 السبب: سياسات RLS غير مفعّلة — شغّل SQL من #/setup');
        }
      } else {
        console.log('✅ workspaces:', ws);
      }

      // اختبار 2: قراءة agents
      const { data: agents, error: agErr } = await client
        .from('agents')
        .select('id, data->>name')
        .limit(3);

      if (agErr) {
        console.error('❌ فشل قراءة agents:', agErr.message);
      } else {
        console.log('✅ agents:', agents);
      }

      // اختبار 3: RPC call (match_kb_chunks_agent)
      try {
        const { data: rpc, error: rpcErr } = await client.rpc('match_kb_chunks_agent', {
          ws: '00000000-0000-0000-0000-000000000000',
          ag: 'test',
          q: Array(768).fill(0),
          match_count: 1
        });
        if (rpcErr && !/could not|does not exist/i.test(rpcErr.message)) {
          console.warn('⚠️ RPC:', rpcErr.message);
        } else {
          console.log('✅ RPC match_kb_chunks_agent يعمل');
        }
      } catch (e) {
        console.warn('⚠️ RPC غير متاح:', e.message);
      }

      console.log('%c✅ اكتمل الاختبار', 'color:#10b981;font-weight:bold');
    } catch (err) {
      console.error('❌ خطأ غير متوقع:', err);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     📤 تصدير الدوال عالميًا ليستخدمها main.js
  ═══════════════════════════════════════════════════════════ */
  window.SUPABASE_DEFAULT_CONFIG = {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY
  };

  window.getSupabaseConfig = getEffectiveConfig;
  window.diagnoseSupabase = diagnoseConnection;
  window.checkSupabaseRLS = checkRLSPolicies;
  window.testSupabaseConnection = testConnection;

  /* ═══════════════════════════════════════════════════════════
     🚀 تشغيل تلقائي عند التحميل
  ═══════════════════════════════════════════════════════════ */
  function boot() {
    console.group('%c🔌 [Supabase Client Init]', 'color:#0ABAB5;font-weight:bold');

    const cfg = getEffectiveConfig();

    if (!cfg) {
      console.warn('⚠️ لا توجد إعدادات اتصال — التطبيق سيعمل بالوضع المحلي');
    } else {
      console.log(`✅ الإعدادات جاهزة من: ${cfg.source}`);
      console.log(`🔗 URL: ${cfg.url}`);
      console.log(`🔑 Anon Key: ${cfg.key.substring(0, 30)}...`);
    }

    if (typeof window.supabase === 'undefined') {
      console.warn('⚠️ مكتبة Supabase لم تُحمّل بعد من CDN — انتظر...');
    } else {
      console.log('✅ مكتبة Supabase محمّلة من CDN');
    }

    console.log('%c💡 أوامر مفيدة:', 'color:#f59e0b;font-weight:bold');
    console.log('  window.diagnoseSupabase()     // تشخيص شامل');
    console.log('  window.testSupabaseConnection() // اختبار فعلي');
    console.log('  window.checkSupabaseRLS(client) // فحص RLS');
    console.groupEnd();
  }

  // تشغيل بعد تحميل مكتبة Supabase (CDN)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    // إذا كان الـ DOM جاهزًا، انتظر تحميل مكتبة Supabase
    const checkLib = setInterval(function () {
      if (typeof window.supabase !== 'undefined') {
        clearInterval(checkLib);
        boot();
      }
    }, 100);
    // timeout بعد 5 ثوانٍ
    setTimeout(function () {
      clearInterval(checkLib);
      if (typeof window.supabase === 'undefined') {
        console.warn('⏰ انقضت مهلة انتظار مكتبة Supabase — قد يكون السبب حجب CDN');
        boot();
      }
    }, 5000);
  }

})();