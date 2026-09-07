import { SCHEDULED_LANGUAGES } from "./languages";

export interface TranslationsMap {
    [key: string]: string;
}

export interface LanguageDictionary {
    [langCode: string]: TranslationsMap;
}

export const TRANSLATIONS: LanguageDictionary = {
    // English baseline
    en: {
        "nav.dashboard": "Dashboard",
        "nav.projects": "Projects",
        "nav.review_queue": "Review Queue",
        "nav.evidence": "Evidence & Investigation",
        "nav.reports": "Reports & Data",
        "nav.sign_out": "Sign Out",
        "nav.audit_officer": "Audit Officer",

        "dash.title": "Public Works Risk & Performance Overview",
        "dash.desc": "Executive intelligence surface monitoring scheme-wide allocation patterns, multi-detector anomaly distributions, and institutional audit priorities.",
        "dash.total_works": "Total Works Monitored",
        "dash.investigation_cases": "Active Audit Priority Cases",
        "dash.high_risk": "High Priority Cases",
        "dash.medium_risk": "Medium Priority Cases",

        "projects.title": "Projects Explorer",
        "projects.desc": "Search, filter, and inspect monitored public works across all parliamentary constituencies and open individual case files for investigation.",

        "review.title": "Review Queue",
        "review.desc": "Ranked human-review workload. Manage prioritized public works cases requiring official desk review, verify anomaly triggers, and inspect evidence reports.",

        "evidence.title": "Evidence & Investigation",
        "evidence.desc": "Consolidated evidence repository and deep case investigation workspace for verifying project anomalies and rate findings.",

        "reports.title": "Reports & Data",
        "reports.desc": "Manage formal investigation dossiers, inspect verification briefs, ingest datasets, and track oversight submissions.",

        "reports.tab_reports": "Reports",
        "reports.tab_data_issues": "Data & Issues",
        "reports.tab_submissions": "Submissions",
        "reports.data_intake": "Data Intake",
        "reports.report_issue": "Report an Issue",
        "reports.report_data_issue": "Report Data Issue",
        "reports.give_feedback": "Give Feedback",

        "common.search": "Search...",
        "common.filter": "Filter",
        "common.reset": "Reset",
        "common.view_case": "View Case",
        "common.view_details": "View Details",
        "common.view_document": "View Document",
        "common.confirm": "Confirm",
        "common.cancel": "Cancel",
        "common.submit": "Submit",
        "common.language": "Language",
        "common.search_language": "Search language...",
        "common.status": "Status",
        "common.action": "Action",
        "common.state": "State",
        "common.mp_name": "MP Name",
        "common.project_id": "Project ID",
        "common.risk_tier": "Risk Priority Tier",
        "dash.risk_overview": "Risk Overview",
        "common.explore_all": "Explore All",
        "common.sanctioned_amount": "Sanctioned Amount",
        "common.sanctioned": "Sanctioned",
        "common.unsanctioned": "Unsanctioned",
        "common.low": "LOW",
        "common.medium": "MEDIUM",
        "common.high": "HIGH",
    },

    // Hindi (हिन्दी)
    hi: {
        "nav.dashboard": "डैशबोर्ड",
        "nav.projects": "परियोजनाएं",
        "nav.review_queue": "समीक्षा कतार",
        "nav.evidence": "साक्ष्य एवं जांच",
        "nav.reports": "रिपोर्ट एवं डेटा",
        "nav.sign_out": "साइन आउट",
        "nav.audit_officer": "लेखा परीक्षा अधिकारी",

        "dash.title": "सार्वजनिक कार्य जोखिम एवं प्रदर्शन अवलोकन",
        "dash.desc": "योजना-वार आवंटन पैटर्न, बहु-डिटेक्टर विसंगति वितरण, और संस्थागत ऑडिट प्राथमिकताओं की निगरानी के लिए डैशबोर्ड।",
        "dash.total_works": "कुल कार्य निगरानी में",
        "dash.investigation_cases": "सक्रिय ऑडिट प्राथमिकता मामले",
        "dash.high_risk": "उच्च प्राथमिकता वाले मामले",
        "dash.medium_risk": "मध्यम प्राथमिकता वाले मामले",

        "projects.title": "परियोजना एक्सप्लोरर",
        "projects.desc": "सभी संसदीय निर्वाचन क्षेत्रों में सार्वजनिक कार्यों की खोज, फ़िल्टर और निरीक्षण करें तथा जांच के लिए मामले खोलें।",

        "review.title": "समीक्षा कतार",
        "review.desc": "रैंक-आधारित मानव समीक्षा कार्यभार। आधिकारिक समीक्षा की आवश्यकता वाले प्राथमिकता वाले मामलों का प्रबंधन करें।",

        "evidence.title": "साक्ष्य एवं जांच",
        "evidence.desc": "परियोजना विसंगतियों और दर निष्कर्षों की पुष्टि के लिए एकीकृत साक्ष्य भंडार और गहन जांच कार्यक्षेत्र।",

        "reports.title": "रिपोर्ट एवं डेटा",
        "reports.desc": "औपचारिक जांच डोजियर प्रबंधित करें, सत्यापन संक्षिप्त विवरण का निरीक्षण करें, डेटासेट इनजेस्ट करें और सबमिशन ट्रैक करें।",

        "reports.tab_reports": "रिपोर्ट्स",
        "reports.tab_data_issues": "डेटा एवं मुद्दे",
        "reports.tab_submissions": "सबमिशन",
        "reports.data_intake": "डेटा इनटेक",
        "reports.report_issue": "समस्या रिपोर्ट करें",
        "reports.report_data_issue": "डेटा समस्या रिपोर्ट करें",
        "reports.give_feedback": "प्रतिक्रिया दें",

        "common.search": "खोजें...",
        "common.filter": "फ़िल्टर",
        "common.reset": "रीसेट",
        "common.view_case": "मामला देखें",
        "common.view_details": "विवरण देखें",
        "common.view_document": "दस्तावेज़ देखें",
        "common.confirm": "पुष्टि करें",
        "common.cancel": "रद्द करें",
        "common.submit": "सबमिट करें",
        "common.language": "भाषा",
        "common.search_language": "भाषा खोजें...",
        "common.status": "स्थिति",
        "common.action": "कार्रवाई",
        "common.state": "राज्य",
        "common.mp_name": "सांसद का नाम",
        "common.project_id": "परियोजना आईडी",
        "common.risk_tier": "जोखिम प्राथमिकता स्तर",
        "common.sanctioned_amount": "स्वीकृत राशि",
        "common.sanctioned": "स्वीकृत",
        "common.unsanctioned": "अस्वीकृत",
        "common.low": "कम",
        "common.medium": "मध्यम",
        "common.high": "उच्च",
    },

    // Bengali (বাংলা)
    bn: {
        "nav.dashboard": "ড্যাশবোর্ড",
        "nav.projects": "প্রকল্পসমূহ",
        "nav.review_queue": "পর্যালোচনা সারি",
        "nav.evidence": "প্রমাণ ও তদন্ত",
        "nav.reports": "রিপোর্ট ও ডেটা",
        "nav.sign_out": "সাইন আউট",
        "nav.audit_officer": "অডিট অফিসার",

        "dash.title": "পাবলিক ওয়ার্কস ঝুঁকি ও পারফরম্যান্স ওভারভিউ",
        "dash.desc": "সমস্ত সংসদীয় এলাকার প্রকল্প বরাদ্দের প্যাটার্ন ও অডিট অগ্রাধিকার পর্যবেক্ষণের জন্য ইন্টেলিজেন্স ড্যাশবোর্ড।",

        "projects.title": "প্রকল্প এক্সপ্লোরার",
        "projects.desc": "সমস্ত সংসদীয় নির্বাচনী এলাকার প্রকল্পসমূহ খুঁজুন, ফিল্টার করুন এবং বিস্তারিত তদন্ত করুন।",

        "review.title": "পর্যালোচনা সারি",
        "review.desc": "অফিসিয়াল পর্যালোচনার জন্য অগ্রাধিকারভিত্তিক মামলা পরিচালনা করুন।",

        "evidence.title": "প্রমাণ ও তদন্ত",
        "evidence.desc": "প্রকল্পের অসঙ্গতি ও তথ্য যাচাইয়ের জন্য সমন্বিত প্রমাণ ভাণ্ডার।",

        "reports.title": "রিপোর্ট ও ডেটা",
        "reports.desc": "আনুষ্ঠানিক তদন্ত রিপোর্ট পরিচালনা করুন এবং ডেটা ইনজেশন ট্র্যাক করুন।",

        "reports.tab_reports": "রিপোর্টসমূহ",
        "reports.tab_data_issues": "ডেটা ও সমস্যা",
        "reports.tab_submissions": "জমাদানসমূহ",

        "common.search": "অনুসন্ধান করুন...",
        "common.filter": "ফিল্টার",
        "common.reset": "রিসেট",
        "common.view_case": "মামলা দেখুন",
        "common.view_details": "বিস্তারিত দেখুন",
        "common.view_document": "নথি দেখুন",
        "common.language": "ভাষা",
        "common.search_language": "ভাষা অনুসন্ধান করুন...",
        "common.status": "অবস্থা",
        "common.action": "পদক্ষেপ",
        "common.low": "কম",
        "common.medium": "মাঝারি",
        "common.high": "উচ্চ",
    },

    // Tamil (தமிழ்)
    ta: {
        "nav.dashboard": "டாஷ்போர்டு",
        "nav.projects": "திட்டங்கள்",
        "nav.review_queue": "மதிப்பாய்வு வரிசை",
        "nav.evidence": "சான்றுகள் மற்றும் விசாரணை",
        "nav.reports": "அறிக்கைகள் மற்றும் தரவு",
        "nav.sign_out": "வெளியேறு",
        "nav.audit_officer": "தணிக்கை அதிகாரி",

        "dash.title": "பொதுப்பணி ஆபத்து மற்றும் செயல்திறன் கண்ணோட்டம்",
        "dash.desc": "நாடாளுமன்ற தொகுதி திட்ட ஒதுக்கீடுகள் மற்றும் தணிக்கை முன்னுரிமைகளை கண்காணிக்கும் இடைமுகம்.",

        "projects.title": "திட்டங்கள் உலாவி",
        "projects.desc": "அனைத்து நாடாளுமன்ற தொகுதிகளின் திட்டங்களை தேட, வடிகட்ட மற்றும் ஆய்வு செய்ய.",

        "review.title": "மதிப்பாய்வு வரிசை",
        "review.desc": "அதிகாரப்பூர்வ தணிக்கை தேவைப்படும் முன்னுரிமை வழக்குகள்.",

        "evidence.title": "சான்றுகள் மற்றும் விசாரணை",
        "evidence.desc": "திட்ட முரண்பாடுகளை சரிபார்க்க ஒருங்கிணைக்கப்பட்ட சான்று களஞ்சியம்.",

        "reports.title": "அறிக்கைகள் மற்றும் தரவு",
        "reports.desc": "முறையான விசாரணை ஆவணங்கள் மற்றும் தரவு சமர்ப்பிப்புகளை நிர்வகிக்கவும்.",

        "common.search": "தேடுக...",
        "common.filter": "வடிகட்டி",
        "common.reset": "மீட்டமை",
        "common.view_case": "வழக்கைப் பார்",
        "common.view_details": "விவரங்களைப் பார்",
        "common.language": "மொழி",
        "common.search_language": "மொழியைத் தேடுக...",
        "common.status": "நிலை",
        "common.low": "குறைந்த",
        "common.medium": "நடுத்தர",
        "common.high": "உயர்",
    },

    // Marathi (मराठी)
    mr: {
        "nav.dashboard": "डॅशबोर्ड",
        "nav.projects": "प्रकल्प",
        "nav.review_queue": "पुनरावलोकन रांग",
        "nav.evidence": "पुरावे आणि तपास",
        "nav.reports": "अहवाल आणि डेटा",
        "nav.sign_out": "साइन आउट",
        "nav.audit_officer": "लेखापरीक्षण अधिकारी",

        "dash.title": "सार्वजनिक कामे धोका आणि कार्यप्रदर्शन विहंगावलोकन",
        "dash.desc": "योजनानिहाय वाटप पद्धती आणि ऑडिट प्राधान्यांचे निरीक्षण करण्यासाठी इंटेलिजन्स डॅशबोर्ड.",

        "projects.title": "प्रकल्प एक्सप्लोरर",
        "projects.desc": "सर्व संसदीय मतदारसंघांमधील सार्वजनिक कामांची शोधाशोध, फिल्टर आणि पाहणी करा.",

        "review.title": "पुनरावलोकन रांग",
        "review.desc": "अधिकृत पुनरावलोकनाची आवश्यकता असलेल्या प्राधान्य प्रकरणांचे व्यवस्थापन करा.",

        "evidence.title": "पुरावे आणि तपास",
        "evidence.desc": "प्रकल्प विसंगतींची पडताळणी करण्यासाठी एकत्रित पुरावे भंडार.",

        "reports.title": "अहवाल आणि डेटा",
        "reports.desc": "अधिकृत तपास अहवाल व्यवस्थापित करा आणि डेटा इनजेशन ट्रॅक करा.",

        "common.search": "शोधा...",
        "common.filter": "फिल्टर",
        "common.reset": "रीसेट करा",
        "common.view_case": "प्रकरण पहा",
        "common.view_details": "तपशील पहा",
        "common.language": "भाषा",
        "common.search_language": "भाषा शोधा...",
        "common.status": "स्थिती",
        "common.low": "कमी",
        "common.medium": "मध्यम",
        "common.high": "उच्च",
    },

    // Telugu (తెలుగు)
    te: {
        "nav.dashboard": "డాష్‌బోర్డ్",
        "nav.projects": "ప్రాజెక్ట్‌లు",
        "nav.review_queue": "సమీక్ష వరుస",
        "nav.evidence": "ఆధారాలు & విచారణ",
        "nav.reports": "నివేదికలు & డేటా",
        "nav.sign_out": "సైన్ అవుట్",
        "nav.audit_officer": "ఆడిట్ అధికారి",

        "dash.title": "పబ్లిక్ వర్క్స్ రిస్క్ & పెర్ఫార్మెన్స్ అవలోకనం",
        "dash.desc": "పార్లమెంటరీ నియోజకవర్గాల నిధుల కేటాయింపులు మరియు ఆడిట్ ప్రాధాన్యతల పర్యవేక్షణ.",

        "projects.title": "ప్రాజెక్ట్‌ల ఎక్స్‌ప్లోరర్",
        "projects.desc": "అన్ని నియోజకవర్గాల ప్రాజెక్ట్‌లను శోధించండి, ఫిల్టర్ చేయండి మరియు పరిశీలించండి.",

        "review.title": "సమీక్ష వరుస",
        "review.desc": "అధికారిక సమీక్ష అవసరమైన ప్రాధాన్యత కేసులు.",

        "evidence.title": "ఆధారాలు & విచారణ",
        "evidence.desc": "ప్రాజెక్ట్ లోపాలను సరిచూసేందుకు సమగ్ర ఆధారాల నిల్వ.",

        "reports.title": "నివేదికలు & డేటా",
        "reports.desc": "అధికారిక విచారణ నివేదికలను నిర్వహించండి.",

        "common.search": "వెతకండి...",
        "common.filter": "ఫిల్టర్",
        "common.reset": "రీసెట్",
        "common.view_case": "కేసు చూడండి",
        "common.view_details": "వివరాలు చూడండి",
        "common.language": "భాష",
        "common.search_language": "భాషను వెతకండి...",
        "common.status": "స్థితి",
        "common.low": "తక్కువ",
        "common.medium": "మధ్యస్థం",
        "common.high": "అధికం",
    },

    // Gujarati (ગુજરાતી)
    gu: {
        "nav.dashboard": "ડૅશબોર્ડ",
        "nav.projects": "પ્રોજેક્ટ્સ",
        "nav.review_queue": "સમીક્ષા કતાર",
        "nav.evidence": "પુરાવા અને તપાસ",
        "nav.reports": "અહેવાલો અને ડેટા",
        "nav.sign_out": "સાઇન આઉટ",
        "nav.audit_officer": "ઓડિટ અધિકારી",

        "dash.title": "જાહેર કામોના જોખમ અને કામગીરીનું વિહંગાવલોકન",
        "dash.desc": "યોજના-વાર ફાળવણી પેટર્ન અને ઓડિટ પ્રાથમિકતાઓની દેખરેખ રાખવા માટેનું પોર્ટલ.",

        "projects.title": "પ્રોજેક્ટ એક્સપ્લોરર",
        "projects.desc": "તમામ સંસદીય મતવિસ્તારોમાં જાહેર કામો શોધો, ફિલ્ટર કરો અને નિરીક્ષણ કરો.",

        "review.title": "સમીક્ષા કતાર",
        "review.desc": "સત્તાવાર સમીક્ષાની જરૂર હોય તેવા પ્રાથમિકતા ધરાવતા કેસોનું સંચાલન કરો.",

        "evidence.title": "પુરાવા અને તપાસ",
        "evidence.desc": "પ્રોજેક્ટ વિસંગતતાઓની ચકાસણી માટે સંકલિત પુરાવા ભંડાર.",

        "reports.title": "અહેવાલો અને ડેટા",
        "reports.desc": "અધિકૃત તપાસ અહેવાલોનું સંચાલન કરો.",

        "common.search": "શોધો...",
        "common.filter": "ફિલ્ટર",
        "common.reset": "રીસેટ",
        "common.view_case": "કેસ જુઓ",
        "common.view_details": "વિગતો જુઓ",
        "common.language": "ભાષા",
        "common.search_language": "ભાષા શોધો...",
        "common.status": "સ્થિતિ",
        "common.low": "ઓછું",
        "common.medium": "મધ્યમ",
        "common.high": "ઉચ્ચ",
    },

    // Urdu (اردو)
    ur: {
        "nav.dashboard": "ڈیش بورڈ",
        "nav.projects": "منصوبے",
        "nav.review_queue": "جائزہ کی قطار",
        "nav.evidence": "شواہد اور تحقیقات",
        "nav.reports": "رپورٹس اور ڈیٹا",
        "nav.sign_out": "سائن آؤٹ",
        "nav.audit_officer": "آڈٹ آفیسر",

        "dash.title": "عوامی کاموں کے خطرے اور کارکردگی کا جائزہ",
        "dash.desc": "اسکیم کے تحت فنڈز کی تقسیم اور آڈٹ کی ترجیحات کی نگرانی کا پورٹل۔",

        "projects.title": "پروجیکٹ ایکسپلورر",
        "projects.desc": "تمام پارلیمانی حلقوں میں عوامی کاموں کو تلاش کریں، فلٹر کریں اور معائنہ کریں۔",

        "review.title": "جائزہ کی قطار",
        "review.desc": "سرکاری جائزے کے محتاج ترجیحی مقدمات کا انتظام کریں۔",

        "evidence.title": "شواہد اور تحقیقات",
        "evidence.desc": "منصوبے کی بے ضابطگیوں کی تصدیق کے لیے شواہد کا ذخیرہ۔",

        "reports.title": "رپورٹس اور ڈیٹا",
        "reports.desc": "رسمی تحقیقاتی دستاویزات کا انتظام کریں۔",

        "common.search": "تلاش کریں...",
        "common.filter": "فلٹر",
        "common.reset": "ری سیٹ",
        "common.view_case": "کیس دیکھیں",
        "common.view_details": "تفصیلات دیکھیں",
        "common.language": "زبان",
        "common.search_language": "زبان تلاش کریں...",
        "common.status": "حالت",
        "common.low": "کم",
        "common.medium": "درمیانہ",
        "common.high": "زیادہ",
    },

    // Kannada (ಕನ್ನಡ)
    kn: {
        "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        "nav.projects": "ಯೋಜನೆಗಳು",
        "nav.review_queue": "ಪರಿಶೀಲನಾ ಸಾಲು",
        "nav.evidence": "ಸಾಕ್ಷ್ಯಾಧಾರ ಮತ್ತು ತನಿಖೆ",
        "nav.reports": "ವರದಿಗಳು ಮತ್ತು ಡೇಟಾ",
        "nav.sign_out": "ಸೈನ್ ಔಟ್",
        "nav.audit_officer": "ಲೆಕ್ಕಪರಿಶೋಧನಾ ಅಧಿಕಾರಿ",

        "dash.title": "ಸಾರ್ವಜನಿಕ ಕಾಮಗಾರಿಗಳ ಅಪಾಯ ಮತ್ತು ಕಾರ್ಯಕ್ಷಮತೆಯ ಅವಲೋಕನ",
        "dash.desc": "ಸಂಸದೀಯ ಕ್ಷೇತ್ರಗಳ ಯೋಜನೆ ಹಂಚಿಕೆ ಮತ್ತು ಲೆಕ್ಕಪರಿಶೋಧನೆ ಆದ್ಯತೆಗಳ ಉಸ್ತುವಾರಿ.",

        "projects.title": "ಯೋಜನೆಗಳ ಎಕ್ಸ್‌ಪ್ಲೋರರ್",
        "projects.desc": "ಸಾರ್ವಜನಿಕ ಕಾಮಗಾರಿಗಳನ್ನು ಹುಡುಕಿ, ಫಿಲ್ಟರ್ ಮಾಡಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ.",

        "review.title": "ಪರಿಶೀಲನಾ ಸಾಲು",
        "review.desc": "ಅಧಿಕೃತ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿರುವ ಆದ್ಯತೆಯ ಪ್ರಕರಣಗಳು.",

        "evidence.title": "ಸಾಕ್ಷ್ಯಾಧಾರ ಮತ್ತು ತನಿಖೆ",
        "evidence.desc": "ಯೋಜನಾ ವ್ಯತ್ಯಾಸಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಸಮಗ್ರ ಸಾಕ್ಷ್ಯ ಸಂಗ್ರಹ.",

        "reports.title": "ವರದಿಗಳು ಮತ್ತು ಡೇಟಾ",
        "reports.desc": "ಅಧಿಕೃತ ತನಿಖಾ ವರದಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",

        "common.search": "ಹುಡುಕಿ...",
        "common.filter": "ಫಿಲ್ಟರ್",
        "common.reset": "ರೀಸೆಟ್",
        "common.view_case": "ಪ್ರಕರಣ ವೀಕ್ಷಿಸಿ",
        "common.view_details": "ವಿವರ ವೀಕ್ಷಿಸಿ",
        "common.language": "ಭಾಷೆ",
        "common.search_language": "ಭಾಷೆ ಹುಡುಕಿ...",
        "common.status": "ಸ್ಥಿತಿ",
        "common.low": "ಕಡಿಮೆ",
        "common.medium": "ಮಧ್ಯಮ",
        "common.high": "ಹೆಚ್ಚು",
    },

    // Malayalam (മലയാളം)
    ml: {
        "nav.dashboard": "ഡാഷ്‌ബോർഡ്",
        "nav.projects": "പദ്ധതികൾ",
        "nav.review_queue": "പരിശോധനാ നിര",
        "nav.evidence": "തെളിവുകളും അന്വേഷണവും",
        "nav.reports": "റിപ്പോർട്ടുകളും ഡാറ്റയും",
        "nav.sign_out": "സൈൻ ഔട്ട്",
        "nav.audit_officer": "ഓഡിറ്റ് ഓഫീസർ",

        "dash.title": "പൊതുമരാമത്ത് അപകടസാധ്യതയും പ്രകടന അവലോകനവും",
        "dash.desc": "പാർലമെന്ററി മണ്ഡലങ്ങളിലെ ഫണ്ട് വിനിയോഗവും ഓഡിറ്റ് മുൻഗണനകളും നിരീക്ഷിക്കുന്ന ഡാഷ്‌ബോർഡ്.",

        "projects.title": "പ്രോജക്ട് എക്സ്പ്ലോറർ",
        "projects.desc": "പൊതുമരാമത്ത് പ്രവർത്തികൾ തിരയുക, ഫിൽട്ടർ ചെയ്യുക, പരിശോധിക്കുക.",

        "review.title": "പരിശോധനാ നിര",
        "review.desc": "ഔദ്യോഗിക പരിശോധന ആവശ്യമായ മുൻഗണനാ കേസുകൾ കൈകാര്യം ചെയ്യുക.",

        "evidence.title": "തെളിവുകളും അന്വേഷണവും",
        "evidence.desc": "പദ്ധതിയിലെ അപാകതകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്താനുള്ള തെളിവ് ശേഖരം.",

        "reports.title": "റിപ്പോർട്ടുകളും ഡാറ്റയും",
        "reports.desc": "ഔദ്യോഗിക അന്വേഷണ റിപ്പോർട്ടുകൾ കൈകാര്യം ചെയ്യുക.",

        "common.search": "തിരയുക...",
        "common.filter": "ഫിൽട്ടർ",
        "common.reset": "റീസെറ്റ്",
        "common.view_case": "കേസ് കാണുക",
        "common.view_details": "വിശദാംശങ്ങൾ കാണുക",
        "common.language": "ഭാഷ",
        "common.search_language": "ഭാഷ തിരയുക...",
        "common.status": "സ്ഥിതി",
        "common.low": "കുറഞ്ഞ",
        "common.medium": "ഇടത്തരം",
        "common.high": "ഉയർന്ന",
    },

    // Odia (ଓଡ଼ିଆ)
    or: {
        "nav.dashboard": "ଡ୍ୟାସବୋର୍ଡ",
        "nav.projects": "ପ୍ରକଳ୍ପସମୂହ",
        "nav.review_queue": "ସମୀକ୍ଷା ଧାଡ଼ି",
        "nav.evidence": "ପ୍ରମାଣ ଓ ତଦନ୍ତ",
        "nav.reports": "ରିପୋର୍ଟ ଓ ଡାଟା",
        "nav.sign_out": "ସାଇନ୍ ଆଉଟ୍",
        "nav.audit_officer": "ଅଡିଟ୍ ଅଫିସର",

        "dash.title": "ସରକାରୀ କାର୍ଯ୍ୟର ବିପଦ ଓ ପ୍ରଦର୍ଶନ ସମୀକ୍ଷା",
        "dash.desc": "ସଂସଦୀୟ କ୍ଷେତ୍ରର ପ୍ରକଳ୍ପ ଆବଣ୍ଟନ ଏବଂ ଅଡିଟ୍ ପ୍ରାଥମିକତା ନିରୀକ୍ଷଣ ପୋର୍ଟାଲ।",

        "projects.title": "ପ୍ରକଳ୍ପ ଏକ୍ସପ୍ଲୋରର",
        "projects.desc": "ସମସ୍ତ ପ୍ରକଳ୍ପ ଖୋଜନ୍ତୁ, ଫିଲ୍ଟର କରନ୍ତୁ ଏବଂ ଯାଞ୍ଚ କରନ୍ତୁ।",

        "review.title": "ସମୀକ୍ଷା ଧାଡ଼ି",
        "review.desc": "ସରକାରୀ ଯାଞ୍ଚ ଆବଶ୍ୟକ କରୁଥିବା ପ୍ରାଥମିକ ମାମଲା ପରିଚାଳନା କରନ୍ତୁ।",

        "evidence.title": "ପ୍ରମାଣ ଓ ତଦନ୍ତ",
        "evidence.desc": "ପ୍ରକଳ୍ପ ଅସଙ୍ଗତିର ସତ୍ୟାସତ୍ୟ ଯାଞ୍ଚ ପାଇଁ ପ୍ରମାଣ ଭଣ୍ଡାର।",

        "reports.title": "ରିପୋର୍ଟ ଓ ଡାଟା",
        "reports.desc": "ଆନୁଷ୍ଠାନିକ ତଦନ୍ତ ରିପୋର୍ଟ ପରିଚାଳନା କରନ୍ତୁ।",

        "common.search": "ଖୋଜନ୍ତୁ...",
        "common.filter": "ଫିଲ୍ଟର",
        "common.reset": "ରିସେଟ୍",
        "common.view_case": "ମାମଲା ଦେଖନ୍ତୁ",
        "common.view_details": "ବିବରଣୀ ଦେଖନ୍ତୁ",
        "common.language": "ଭାଷା",
        "common.search_language": "ଭାଷା ଖୋଜନ୍ତୁ...",
        "common.status": "ସ୍ଥିତି",
        "common.low": "କମ୍",
        "common.medium": "ମଧ୍ୟମ",
        "common.high": "ଉଚ୍ଚ",
    },

    // Punjabi (ਪੰਜਾਬੀ)
    pa: {
        "nav.dashboard": "ਡੈਸ਼ਬੋਰਡ",
        "nav.projects": "ਪ੍ਰੋਜੈਕਟ",
        "nav.review_queue": "ਸਮੀਖਿਆ ਕਤਾਰ",
        "nav.evidence": "ਸਬੂਤ ਅਤੇ ਜਾਂਚ",
        "nav.reports": "ਰਿਪੋਰਟਾਂ ਅਤੇ ਡਾਟਾ",
        "nav.sign_out": "ਸਾਈਨ ਆਊਟ",
        "nav.audit_officer": "ਆਡਿਟ ਅਫਸਰ",

        "dash.title": "ਜਨਤਕ ਕੰਮਾਂ ਦੇ ਜੋਖਮ ਅਤੇ ਕਾਰਗੁਜ਼ਾਰੀ ਦਾ ਜਾਇਜ਼ਾ",
        "dash.desc": "ਸੰਸਦੀ ਹਲਕਿਆਂ ਦੇ ਵਿਕਾਸ ਕਾਰਜਾਂ ਅਤੇ ਆਡਿਟ ਤਰਜੀਹਾਂ ਦੀ ਨਿਗਰਾਨੀ।",

        "projects.title": "ਪ੍ਰੋਜੈਕਟ ਐਕਸਪਲੋਰਰ",
        "projects.desc": "ਸਾਰੇ ਪ੍ਰੋਜੈਕਟਾਂ ਦੀ ਖੋਜ ਕਰੋ, ਫਿਲਟਰ ਕਰੋ ਅਤੇ ਸਮੀਖਿਆ ਕਰੋ।",

        "review.title": "ਸਮੀਖਿਆ ਕਤਾਰ",
        "review.desc": "ਸਰਕਾਰੀ ਸਮੀਖਿਆ ਦੀ ਲੋੜ ਵਾਲੇ ਤਰਜੀਹੀ ਕੇਸਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।",

        "evidence.title": "ਸਬੂਤ ਅਤੇ ਜਾਂਚ",
        "evidence.desc": "ਪ੍ਰੋਜੈਕਟ ਦੀਆਂ ਗੜਬੜੀਆਂ ਦੀ ਪੁਸ਼ਟੀ ਲਈ ਸਬੂਤਾਂ ਦਾ ਭੰਡਾਰ।",

        "reports.title": "ਰਿਪੋਰਟਾਂ ਅਤੇ ਡਾਟਾ",
        "reports.desc": "ਰਸਮੀ ਜਾਂਚ ਰਿਪੋਰਟਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।",

        "common.search": "ਖੋਜੋ...",
        "common.filter": "ਫਿਲਟਰ",
        "common.reset": "ਰੀਸੈਟ",
        "common.view_case": "ਕੇਸ ਵੇਖੋ",
        "common.view_details": "ਵੇਰਵੇ ਵੇਖੋ",
        "common.language": "ਭਾਸ਼ਾ",
        "common.search_language": "ਭਾਸ਼ਾ ਖੋਜੋ...",
        "common.status": "ਸਥਿਤੀ",
        "common.low": "ਘੱਟ",
        "common.medium": "ਦਰਮਿਆਨਾ",
        "common.high": "ਉੱਚ",
    },

    // Sanskrit (संस्कृतम्)
    sa: {
        "nav.dashboard": "मुख्यपट्टः",
        "nav.projects": "प्रकल्पाः",
        "nav.review_queue": "समीक्षाश्रेणी",
        "nav.evidence": "साक्ष्यं अन्वेषणं च",
        "nav.reports": "विवरणानि दत्तनिवेशः च",
        "nav.sign_out": "निर्गमः",
        "nav.audit_officer": "अङ्केक्षकः अधिकारी",

        "dash.title": "सार्वजनिककार्येषु सङ्कटस्य प्रदर्शनस्य च विहङ्गावलोकनम्",
        "dash.desc": "संसदीयक्षेत्रेषु धनआवण्टनपद्धतीनां निरीक्षणार्थं मुख्यपट्टः।",

        "projects.title": "प्रकल्प-अन्वेषकः",
        "projects.desc": "सर्वेषां सर्वकारीयकार्याणां अन्वेषणं, शोधनं, निरीक्षणं च कुर्वन्तु।",

        "review.title": "समीक्षाश्रेणी",
        "review.desc": "अधिकाधिकप्राथमिकतायुक्तानां प्रकरणानां समीक्षां कुर्वन्तु।",

        "evidence.title": "साक्ष्यं अन्वेषणं च",
        "evidence.desc": "प्रकल्पविसङ्गतीनां प्रमाणीकरणार्थं एकीकृतसाक्ष्यसङ्ग्रहः।",

        "reports.title": "विवरणानि दत्तनिवेशः च",
        "reports.desc": "औपचारिकान्वेषणविवरणानां प्रबन्धनं कुर्वन्तु।",

        "common.search": "अन्विष्यताम्...",
        "common.filter": "शोधनम्",
        "common.reset": "पुनःस्थापनम्",
        "common.view_case": "प्रकरणं पश्यतु",
        "common.view_details": "विवरणं पश्यतु",
        "common.language": "भाषा",
        "common.search_language": "भाषाम् अन्विष्यताम्...",
        "common.status": "स्थितिः",
        "common.low": "न्यूनम्",
        "common.medium": "मध्यमम्",
        "common.high": "उच्चम्",
    },
};

// Helper for dynamic translation lookup with fallback
export function getTranslation(langCode: string, key: string, fallback: string): string {
    const enDict = TRANSLATIONS.en || {};
    if (langCode === "en" || !TRANSLATIONS[langCode]) {
        return enDict[key] || fallback;
    }
    const targetDict = TRANSLATIONS[langCode] || {};
    return targetDict[key] || enDict[key] || fallback;
}
