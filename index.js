const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const crypto = require('crypto');

// 1. إنشاء حافظة كوكيز لإدارة الجلسات تلقائياً (CookieJar)
const jar = new CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

// 2. إعداد الترويسات (Headers) المطابقة للتطبيق الأصلي
const BASE_URL = "https://104.21.30.103"; // أو النطاق المباشر للموقع
const DEVICE_ID = crypto.randomUUID();    // إنشاء معرف جهاز عشوائي بتنسيق UUID

const COMMON_HEADERS = {
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 14; BlueStacks Build/UD1A.230803.022)",
    "X-Requested-With": "com.drama.mp4",
    "Accept": "application/json",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive"
};

async function runApiPipeline() {
    try {
        console.log("1. جاري تنفيذ الطلب التمهيدي لحل حماية Cloudflare واستلام الكوكيز...");

        // الخطوة 1: طلب تمهيدي لشاشة البداية (مثل تهيئة الواجهة أو الأقسام)
        const initResponse = await client.get(`${BASE_URL}/api/v2/home.php`, {
            params: { app_version: 15 },
            headers: COMMON_HEADERS
        });

        console.log("✔ تم اجتياز الطلب التمهيدي بنجاح! كود الاستجابة:", initResponse.status);

        // طباعة الكوكيز التي أرجعها السيرفر وتم حفظها للجلسة
        const cookies = await jar.getCookies(BASE_URL);
        console.log("✔ الكوكيز المستلمة من السيرفر:", cookies.map(c => c.key + '=' + c.value).join('; '));

        console.log("\n2. جاري طلب البيانات المباشرة (مثل قائمة المسلسلات أو القنوات)...");

        // الخطوة 2: طلب رابط الميديا أو الـ API المباشر مع الترويسات والمعرف
        const apiResponse = await client.get(`${BASE_URL}/api/series/`, {
            params: {
                page: 1,
                limit: 20,
                device_id: DEVICE_ID
            },
            headers: COMMON_HEADERS
        });

        console.log("✔ تم جلب البيانات بنجاح وبدون حظر!");
        console.log("البيانات المرجعة (Sample):", JSON.stringify(apiResponse.data).substring(0, 300) + "...");

    } catch (error) {
        if (error.response) {
            console.error("❌ فشل الطلب - كود الاستجابة:", error.response.status);
            console.error("محتوى الرفض:", error.response.data);
        } else {
            console.error("❌ حدث خطأ في الاتصال:", error.message);
        }
    }
}

// تشغيل السكربت
runApiPipeline();
