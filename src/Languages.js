import { I18n } from "i18n-js";
import { useSelector } from "react-redux";
import { I18nManager } from "react-native";

const Translations = () => {
    const { lang } = useSelector((state) => state.user);

    const Languages = {
        ar: {
            greeting: "مرحباً",
            greetingDesc:
                "احنا بنسعى لتقليل التلوث اللي بتسببه المواد الغذائية المتبقية من المطاعم و الحد من إهدارها, ",
            greetingDescJoin: "إنضم لينا",
            greetingSignIn: "تسجيل الدخول",
            greetingSignUp: "إنشاء حساب",

            signinTitle: "أهلاً بيك تاني!",
            signinDesc: "يلا نسجل الدخول لحسابك",
            Email: "البريد الإلكتروني",
            Pass: "كلمة السر",
            signinBtn: "دخول",
            signinCreateAcc: "لسه معندكش حساب؟",
            signinForgotPass: "نسيت كلمة السر؟",
            Or: "أو",

            resetpassTitle: "إعادة تعيين كلمة السر",
            resetpassDesc:
                "Enter your email that you used to register, We'll send you an email with a link toreset your password.",
            resetpassDesc: "ادخل البريد الالكتروني للحساب الذي نسيت كلمة السر الخاصة به",
            resetpassEmail: "البريد الالكتروني",
            resetpassSend: "ارسل",

            signupTitle: "إنشاء حساب",
            signupDesc: "يلا نعمل حساب جديد.",
            signupRepass: "تأكيد كلمة السر",
            signupBtn: "إنشاء حساب",
            signupCreateAcc: "عندك حساب بالفعل؟",

            metadataTitle: "اختر نوع حسابك",
            metadataDesc: 'اختر من تلك الخيارات نوع حسابك اذا كان "حساب مستخدم" أو "حساب مطعم"',
            metadataNote: "تنويه: لن تتمكن من تغيير هذا الأختيار فيما بعد",
            metadataRest: "مطعم",
            metadataUser: "مستخدم",

            acctyperestTitle: "حساب مطعم",
            acctyperestLocation: "حدد موقع المطعم",
            acctyperestAddress: "عنوان المطعم ?",

            acctypeuserTitle: "حساب مستخدم",
            acctypeuserLocation: "حدد موقعك",
            acctypeuserAddress: "ادخل عنوانك ?",

            acctypeName: "اسم الحساب",
            acctypePhone: "رقم الهاتف",
            acctypeSendCode: "أرسل الكود",
            acctypeResend: "إعادة ارسال",
            acctypeCode: "كود التحقق",
            acctypeVcode: "تأكيد",
            acctypeSave: "حفظ",

            mapBtn: "تأكيد",

            homeTitle: "اكتشف",
            homeEmptyPosts: "المطاعم مغلقة الأن عد لاحقاً",
            homePickAt: "احصل عليها اليوم:",
            Now: "الأن",
            flheaderAvl: "متاح",
            flheaderRec: "الأقرب",
            flheaderNew: "منشورات حديدة",
            flheaderFav: "مفضلاتك",
            currlocationChoose: "اختر موقعك",
            currlocationCurrent: "الموقع الحالي",
            currlocationHome: "المنزل",

            notfTitle: "الإشعارات",
            notfDirections: "الاتجاهات",
            notfSubmit: "تأكيد الطلب",

            PostSendBtn: "اطلبه الأن",

            settTitle: "الإعدادات",
            settVersion: "إصدار التطبيق",
            settLightTheme: "فاتح",
            settDarkTheme: "غامق",

            profNameLb: "الإسم:",
            profPhoneLb: "الهاتف:",
            profEmailLb: "البريد الإلكتروني:",
            profAddressLb: "العنوان:",
            profUpdate: "تحديث",

            searchBar: "بحث",

            favsTitle: "المفضلة",

            postfoodImg: "صورة الطعام:",
            postTitle: "إنشاء منشور",
            postTypeFood: "ما نوع الطعام ؟",
            postFoodContains: "اوصف محتويات الطعام",
            postClosedTime: "متى يغلق المطعم ؟",
            postCreateBtn: "إنشاء",

            noconnectionTitle: "لا يوجد اتصال بالانترنت",
            noconnectionTrySteps: "جرب تلك الخطوات لمعاودة الاتصال:",
            noconnectionStep1: "تأكد من ان لمبة الانترنت في الراوتر مفعلة.",
            noconnectionStep2: "حاول الاتصال مجدداً بال WI-FI",
            noconnectionStep3: "للبيانات الخلوية حاول تفعيل وضع الطيران ثم اغلقه ثانية.",
        },
        en: {
            greeting: "Welcome",
            greetingDesc: "We provide support to reduce pollution and food waste,",
            greetingDescJoin: "Join Us",
            greetingSignIn: "Sign In",
            greetingSignUp: "Sign Up",

            signinTitle: "Welcome Back",
            signinDesc: "Lets login to your account",
            Email: "E-mail",
            Pass: "Password",
            signinBtn: "Login",
            signinCreateAcc: "Don't have an account?",
            signinForgotPass: "Forgot your password?",
            Or: "OR",

            resetpassTitle: "Password Reset",
            resetpassDesc:
                "Enter your email that you used to register, We'll send you an email with a link toreset your password.",
            resetpassEmail: "E-mail",
            resetpassSend: "Send",

            signupTitle: "Register",
            signupDesc: "Let us create an account for you.",
            signupRepass: "Confirm Password",
            signupBtn: "Create account",
            signupCreateAcc: "Already got an account?",

            metadataTitle: "Select your account type",
            metadataDesc:
                'Choose from these options your account type "user account" or "restaurant account."',
            metadataNote: "Note: You'll not be able to change this choice in the future.",
            metadataRest: "restaurant",
            metadataUser: "User",

            acctyperestTitle: "Restaurant Account",
            acctyperestLocation: "Select restaurant location",
            acctyperestAddress: "Restarunt address ?",

            acctypeuserTitle: "User Account",
            acctypeuserLocation: "Select your location",
            acctypeuserAddress: "Your address ?",

            acctypeName: "Account Name",
            acctypePhone: "Phone number",
            acctypeSendCode: "Send code",
            acctypeResend: "Resend code",
            acctypeCode: "Verification code",
            acctypeVcode: "Verify code",
            acctypeSave: "Save",

            mapBtn: "Confirm",

            homeTitle: "Explore",
            homeEmptyPosts: "Restaurants are closed now",
            homePickAt: "Pick up today:",
            Now: "Just now",
            flheaderAvl: "Available",
            flheaderRec: "Recommended",
            flheaderNew: "New Posts",
            flheaderFav: "Your Favorites",
            currlocationChoose: "Choose location",
            currlocationCurrent: "Current Location",
            currlocationHome: "Your Home",

            notfTitle: "Notifications",
            notfDirections: "Directions",
            notfSubmit: "Submit Order",

            PostSendBtn: "Pick Up Now",

            settTitle: "Settings",
            settVersion: "Version",
            settLightTheme: "Light",
            settDarkTheme: "Dark",

            profNameLb: "Name:",
            profPhoneLb: "Phone:",
            profEmailLb: "Email:",
            profAddressLb: "Address:",
            profUpdate: "Update",

            searchBar: "Search",

            favsTitle: "Favorites",

            postfoodImg: "Food Picture:",
            postTitle: "Create Post",
            postTypeFood: "what kind of food ?",
            postFoodContains: "What this food contain ?",
            postClosedTime: "Choose Closed Time",
            postCreateBtn: "Create",

            noconnectionTitle: "No Internet connection",
            noconnectionTrySteps: "Try these steps to get back online:",
            noconnectionStep1: "Check your internet light in router is on.",
            noconnectionStep2: "Reconnect to Wi-Fi.",
            noconnectionStep3: "Open Airplane mode and close it again.",
        },
    };

    const i18n = new I18n(Languages);

    i18n.defaultLocale = I18nManager.isRTL ? "ar" : "en";
    i18n.locale = lang;

    return i18n;
};
export default Translations;
