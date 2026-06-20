import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Star, Volume2, VolumeX, Music } from "lucide-react";

interface WizardCompanionProps {
  username: string;
  lang: string;
  step: "lang" | "wizard-select" | "auth" | "stats" | "ritual-1" | "ritual-2" | "ritual-3" | "warning" | "app";
  activeGoal?: string;
  wizardGender: "male" | "female";
  customWizardUrl?: string; // Lets user overwrite with custom action GIF animations
  userTitle?: "master" | "mistress" | "noble seeker";
}

const STEP_GUIDES: Record<string, Record<string, string>> = {
  lang: {
    en: "Hark! I am Strodie thy magical guide! Choose thy preferred alignment translation so our study spells resonate smoothly, master/mistress.",
    hi: "प्रणाम! मैं स्ट्रोडी हूँ, आपका मार्गदर्शक! अपनी पसंद की भाषा चुनें ताकि हमारी विद्या साधना के मंत्र सुचारू रूप से कार्य करें, स्वामी/स्वामिनी।",
    es: "¡Escucha! ¡Soy Strodie tu guía mágico! Elige tu idioma para que nuestros hechizos de estudio resuenen sin problemas, señor/señora.",
    fr: "Oyez ! Je suis Strodie ton guide magique ! Choisis ta traduction d'alignement préférée afin que nos sorts d'étude résonnent harmonieusement, maître/maîtresse.",
    de: "Hört, Hört! Ich bin Strodie, dein magischer Begleiter! Wähle deine bevorzugte Sprache, damit unsere Studienzauber harmonisch wirken, Meister/Meisterin.",
    zh: "听着！我是你的魔法向导 斯特罗迪！请选择你首选的语言，好让我们的学习法术顺利共鸣，阁下。",
    ja: "聞け！私は魔法のガイド、ストロディである！学習の呪文がスムーズに響くよう、お好みの配置言語をお選びください、マスター/ミストレス。",
    ru: "Внемлите! Я Строди, ваш магический проводник! Выберите предпочтительный язык выравнивания, чтобы наши учебные заклинания резонировали гармонично, господин/госпожа.",
    ar: "اسمع! أنا سترودي مرشدك السحري! اختر لغة المحاذاة المفضلة لديك حتى تتناغم تعاويذ الدراسة بسلاسة، سيدي/سيدتي."
  },
  "wizard-select": {
    en: "Welcome, noble seeker! Select thy spiritual guide to accompany thy studies, or provide a sacred custom art scroll of thine own, master/mistress.",
    hi: "स्वागत है, महान साधक! अपनी पढ़ाई में साथ देने के लिए अपने आध्यात्मिक मार्गदर्शक का चयन करें, स्वामी/स्वामिनी।",
    es: "¡Bienvenido, noble buscador! Elige tu guía espiritual para acompañar tus estudios, o proporciona un pergamino de arte personalizado, señor/señora.",
    fr: "Bienvenue, noble chercheur ! Sélectionne ton guide spirituel pour t'accompagner, ou propose un parchemin d'art sacré personnalisé, maître/maîtresse.",
    de: "Willkommen, edler Suchender! Wähle deinen spirituellen Begleiter oder lade dein eigenes animiertes Kunstwerk hoch, Meister/Meisterin.",
    zh: "欢迎，高贵的探索者！选择您的精神指引以伴随您的学习，或提供您自己神圣的定制画卷，阁下。",
    ja: "ようこそ、高貴な探求者よ！学習に同行するソウルガイドを選ぶか、ご自身のカスタムスクロールを提出してください、マスター/ミストレス。",
    ru: "Добро пожаловать, благородный искатель! Выберите своего духовного проводника или предоставьте собственный свиток искусства, господин/госпожа.",
    ar: "أهلاً بك أيها الباحث النبيل! اختر مرشدك الروحي لمرافقة دراستك، أو قدم لفافة فنية خاصة بك، سيدي/سيدتي."
  },
  auth: {
    en: "Introduce thy legendary identity! Write thy username or invoke dynamic access with Google or Microsoft to secure multiple alchemical roles.",
    hi: "अपनी महान पहचान बताएं! अपना नाम दर्ज करें या गूगल/माइक्रोसॉफ्ट से सीधे प्रवेश कर विभिन्न विद्या स्वरूप धारण करें।",
    es: "¡Introduce tu identidad legendaria! Escribe tu nombre de usuario o invoca el acceso dinámico con Google o Microsoft para asegurar múltiples roles alquímicos.",
    fr: "Présente ton identité légendaire ! Saisis ton nom ou utilise l'accès dynamique pour sécuriser tes rôles alchimiques.",
    de: "Trage deine legendäre Identität ein! Wähle einen Namen oder nutze den dynamischen Zugang über Google/Microsoft zur alchemistischen Sicherung.",
    zh: "昭告你传奇的身份！输入用户名或启用 Google/Microsoft 登录以确保多种炼金术角色。",
    ja: "伝説のソウルネームを紹介してください！名前を入力するか、Google/Microsoftでログインして錬金術の役割を確保します。",
    ru: "Откройте свое легендарное имя! Напишите имя пользователя или воспользуйтесь Google/Microsoft для активации нескольких алхимических ролей.",
    ar: "سجل هويتك الأسطورية! اكتب اسم روحك أو استخدم الوصول الديناميكي مع Google أو Microsoft لتأمين أدوار خيميائية متعددة."
  },
  stats: {
    en: "Form thy daily Chronos hours! Balance weekday focus against weekend alignment to fuel the ritual, master/mistress.",
    hi: "अपनी दैनिक साधना का समय निर्धारित करें! सप्ताह और छुट्टी के समय को संतुलित कर दिव्य शक्ति संचित करें, स्वामी/स्वामिनी।",
    es: "¡Forma tus horas cronos diarias! Equilibra el enfoque de los días laborables con la alineación del fin de semana para alimentar el ritual, señor/señora.",
    fr: "Forme tes heures de Chronos quotidiennes ! Équilibre le focus de la semaine avec le week-end pour alimenter le rituel, maître/maîtresse.",
    de: "Bestimme deine tägliche Chronos-Zeit! Finde die Balance zwischen Werktagen und Wochenenden, um das Ritual zu nähren, Meister/Meisterin.",
    zh: "建立您每日的克罗诺斯时间！平衡工作日与周末学习，以为专注仪式注入源源不断的精魂，阁下。",
    ja: "毎日のクロノス時間を形成します！平日のフォーカスと週末の時間をバランスよく調整して儀式に力を注ぎましょう、マスター/ミストレス。",
    ru: "Настройте профиль Хроноса! Сбалансируйте учебу в будние и выходные дни, чтобы наполнить силой священный ритуал, господин/госпожа.",
    ar: "شكل ساعات كرونوس اليومية الخاصة بك! وازن بين تركيز أيام الأسبوع وعطلة نهاية الأسبوع لتغذية هذا الطقس المقدس، سيدي/سيدتي."
  },
  "ritual-1": {
    en: "Name thy supreme study Grimoire and choose thy ultimate focus objective so we can monitor thy alignment, master/mistress!",
    hi: "अपनी मुख्य विद्या साधना का नामकरण करें और अपनी साधना का परम लक्ष्य चुनें ताकि हम आप पर नज़र रख सकें, स्वामी/स्वामिनी!",
    es: "¡Nombra tu supremo Grimorio de estudio y elige tu objetivo de enfoque para que podamos monitorear tu alíneación, señor/señora!",
    fr: "Nomme ton suprême Grimoire et choisis ton objectif de concentration ultime pour que nous puissions suivre ton alignement, maître/maîtresse !",
    de: "Benenne dein Studien-Grimoire und bestimme deinen Fokus, damit wir deine Ausrichtung überwachen können, Meister/Meisterin!",
    zh: "命名你的终极魔法书，契约专注目标，好让我们时刻守护。",
    ja: "至高のグリモワールの名前を決め、確固たるフォーカス対象を誓ってください。進捗をしっかり見守ります！",
    ru: "Дайте имя вашему Гримуару и выберите цель, чтобы мы могли бережно контролировать ваше усердие, господин/госпожа!",
    ar: "قم بتسمية مخطوطة دراستك العظمى واختر هدف تركيزك المطلق لنتمكن من مراقبة محاذاتك ومثابرتك، سيدي/سيدتي!"
  },
  "ritual-2": {
    en: "Determine thy chapters! How many segments of this holy book shall we transmute in thy study sesh?",
    hi: "अध्यायों की संख्या निर्धारित करें! इस ग्रंथ के कितने हिस्सों को सिद्ध करना है?",
    es: "¡Determina tus capítulos! ¿Cuántos segmentos de este libro sagrado transmutaremos en tu sesión de estudio?",
    fr: "Détermine tes chapitres ! Combien de segments de ce livre sacré transmuterons-nous dans ta session d'étude ?",
    de: "Bestimme deine Kapitel! Wie viele Abschnitte dieses heiligen Buches wollen wir heute im Studium transmutieren?",
    zh: "决定你要研读的篇章数目！我们要在这场神圣仪式中精炼和转化多少章节？",
    ja: "進めるチャプター数を選択してください！学習セッションにてこの聖書の何セグメントを変換しますか？",
    ru: "Укажите главы! Сколько разделов этой священной книги мы превратим в чистый фокус на нашей сессии?",
    ar: "حدد الفصول والفقرات! كم عدد أجزاء هذا الكتاب المقدس التي سنقوم بتحويلها in جلستك الدراسية؟"
  },
  "ritual-3": {
    en: "Mark the holy calendar alignment! Select study days or specific stellar dates for maximum focus coefficient, master/mistress.",
    hi: "पवित्र कैलेंडर साधना तिथियां चुनें! अधिकतम ऊर्जा गुणांक के लिए विशेष तारीखें अंकित करें, स्वामी/स्वामिनी।",
    es: "¡Marca la alineación del calendario sagrado! Selecciona días de estudio o fechas estelares específicas para el máximo coeficiente de enfoque, señor/señora.",
    fr: "Marque l'alignement du calendrier sacré ! Sélectionne des jours d'étude ou des dates stellaires pour un focus maximal, maître/maîtresse.",
    de: "Nutze den heiligen Kalender! Wähle deine Studientage oder spezifische Sternendaten für die beste Energie, Meister/Meisterin.",
    zh: "在神圣历法上标记星象纪元！选择您的学习日或星座特异日，以释放最强专注威能，阁下。",
    ja: "聖なるカレンダーでアライメントを記録しましょう！最高の効果を得るため学習日や星の日付を選択します、マスター/ミストレス。",
    ru: "Отметьте дни на звездном календаре! Выберите дни обучения или даты для получения максимальной энергии, господин/госпожа.",
    ar: "حدد محاذاة التقويم المقدس! اختر أيام دراسة أو تواريخ كوكبية محددة لتحصل على أقصى معامل تركيز دراسي، سيدي/سيدتي."
  },
  warning: {
    en: "Hark! Thy study energy of hours is lower than 3 hours per chapter! Cast premium recommended hours or safely readjust dates anyway, master/mistress.",
    hi: "सावधान! आपकी ऊर्जा प्रति अध्याय 3 घंटे से कम है! साधना बढ़ाएं या तिथियां बदलें, स्वामी/स्वामिनी।",
    es: "¡Escucha! ¡Tu energía de horas de estudio es inferior a 3 horas por capítulo! Lanza horas recomendadas o reajusta las fechas de todos modos, señor/señora.",
    fr: "Attention ! Ton énergie d'heures d'étude est inférieure à 3 heures par chapitre ! Augmente les heures ou réajuste les dates, maître/maîtresse.",
    de: "Halt! Deine Studienzeit liegt unter 3 Stunden pro Kapitel! Erhöhe die Stunden oder passe deine Termine an, Meister/Meisterin.",
    zh: "注意！检测到每个章节对应的学习时间不足3小时！请增加练习时间，或谨慎地退回调准日期，阁下。",
    ja: "警告！チャプターあたりの学習エネルギーが3時間未満です！推奨時間にするか、安全に日付を調整してください、マスター/ミストレス。",
    ru: "Внимание! Вашего учебного времени меньше 3 часов на главу! Увеличьте часы или скорректируйте даты, господин/госпожа.",
    ar: "اسمع! طاقة ساعات دراستك أقل من 3 ساعات لكل فصل! قم بزيادة الساعات أو إعادة ضبط التواريخ بأمان، سيدي/سيدتي."
  },
  app: {
    en: "Now I sit in the corner safely. See me whenever thou want to hear supreme focus advice! I am here, master/mistress.",
    hi: "अब मैं सुरक्षित रूप से कोने में विराजमान हूँ। ध्यान तथा परामर्श के लिए मुझे कभी भी स्पर्श करें! मैं सदैव तत्पर हूँ, स्वामी/स्वामिनी।",
    es: "Ahora me siento en la esquina de forma segura. ¡Mírame cuando quieras escuchar consejos de enfoque supremo! Estoy aquí, señor/señora.",
    fr: "Maintenant, je m'installe sereinement dans le coin. Touche-moi quand tu le souhaites pour entendre de précieux conseils de concentration, maître/maîtresse.",
    de: "Ich wache nun sicher im Hintergrund über dich. Tippe mich an, wann immer du weisen Rat suchst! Ich bin hier, Meister/Meisterin.",
    zh: "现在我已安稳坐在角落里守护你。当需要至高而专注的建议时，随时轻轻呼唤我！我一直都在，阁下。",
    ja: "それでは、画面の端で安全に佇んでいます。学習相談やスペルアドバイスが必要な時は、いつでもお声がけを。私はここにいます、マスター/ミストレス。",
    ru: "Теперь я оберегаю вас из тихой гавани. Нажмите на меня в любой момент для получения ценного мудрого напутствия! Я всегда рядом, господин/госпожа.",
    ar: "الآن أجلس in الزاوية بأمان وسلام. انقر علي متى أردت سماع نصائح التركيز السحرية العظمى! أنا هنا دائمًا، سيدي/سيدتي."
  }
};

const EXTRA_WISDOM_SPELLS: Record<string, string>[] = [
  {
    en: "Focus tightly on thy Grimoires! Study is the ultimate magic of our cosmos, master/mistress.",
    hi: "अपने मंत्र-ग्रंथों पर पूरा ध्यान लगाएं! अध्ययन ही ब्रह्मांड का परम जादू है, स्वामी/स्वामिनी।",
    es: "¡Concéntrate bien en tus Grimorios! El estudio es la magia definitiva de nuestro cosmos, señor/señora.",
    fr: "Concentre-toi bien sur tes Grimoires ! L'étude est la magie ultime de notre cosmos, maître/maîtresse.",
    de: "Konzentriere dich auf deine Grimoires! Lernen ist die wahre Magie unseres Kosmos, Meister/Meisterin.",
    zh: "专注你的终极魔法书！在这个无尽宇宙中，研读便是无上而绝对的真理魔道，阁下。",
    ja: "グリモワールにしっかりフォーカスを！学習こそが宇宙究極の魔法なのです、マスター/ミストレス。",
    ru: "Сконцентрируйтесь на ваших Гримуарах! Учеба — это величайшая магия в космосе, господин/госпожа.",
    ar: "ركز بشدة على مخطوطاتك! الدراسة هي السحر المطلق لكوننا، سيدي/سيدتي."
  },
  {
    en: "Cast away distraction scroll blocks! They drain thy premium spiritual focus energy.",
    hi: "ध्यान भटकाने वाले मायाजाल से दूर रहें! ये हमारी ध्यान ऊर्जा समाप्त करते हैं।",
    es: "¡Desecha los bloques de distracción! Agotan tu energía de enfoque espiritual premium.",
    fr: "Chasse les distractions ! Elles épuisent ton énergie spirituelle de concentration.",
    de: "Vertreibe alle Ablenkungen! Sie rauben dir deine wertvolle spirituelle Fokusenergie.",
    zh: "吸纳心智，摒弃干扰！它们正在损耗你最宝贵的专注法力。",
    ja: "雑念のスクロールを排除しましょう！貴重な精神的集中エネルギーが消費されてしまいます。",
    ru: "Откиньте прочь все отвлекающие свитки! Они крадут вашу драгоценную духовную энергию.",
    ar: "تخلص من حواجز التشتيت! إنها تستنزف طاقة تركيزك الروحي الممتاز."
  },
  {
    en: "Every chapter completed builds thy Alchemist status. Read on, noble pupil!",
    hi: "प्रत्येक पूर्ण अध्याय आपके रैंक को बढ़ाता है। पढ़ते रहो, मेरे प्रिय शिष्य!",
    es: "Cada capítulo completado aumenta tu rango de Alquimista. ¡Sigue leyendo, noble alumno!",
    fr: "Chaque chapitre terminé renforce ton statut d'Alchimiste. Continue à lire, noble élève !",
    de: "Jedes abgeschlossene Kapitel erhöht deinen Alchemisten-Rang. Lies weiter, edler Schüler!",
    zh: "每一个被攻破的独立章节，都将铸就你炼金贤者的巅峰王座。继续研读吧，高贵的弟子！",
    ja: "チャプターを完了するたび、錬金術師の階級が上がります。読み進めましょう、気高き徒弟よ！",
    ru: "Каждая пройденная глава повышает ваш алхимический ранг. Продолжайте чтение, благородный ученик!",
    ar: "كل فصل تكتمله يعزز رتبتك كخيميائي. استمر في القراءة، أيها التلميذ النبيل!"
  }
];

const COMPANION_I18N: Record<string, Record<string, string>> = {
  en: {
    strodiaTheGuide: "Strodia The Guide",
    strodieTheGuide: "Strodie The Guide",
    okMoveAbove: "OK, Move Above ⇧",
    okMoveSide: "OK, Move Side ➔",
    unveilCenter: "Unveil Center 🎯",
    spellcastLevel: "SPELLCAST LEVEL XII",
    companionActive: "Companion Active",
    hideScroll: "Hide Scroll",
    muteVoice: "Mute Spell Voice",
    unmuteVoice: "Unmute Spell Voice",
    toggleBgm: "Toggle Lavish continuous BGM",
    strodia: "Strodia",
    strodie: "Strodie",
    master: "master",
    mistress: "mistress",
    seeker: "noble seeker"
  },
  hi: {
    strodiaTheGuide: "सहायक स्ट्रोडिया",
    strodieTheGuide: "सहायक स्ट्रोडी",
    okMoveAbove: "ऊपर भेजें ⇧",
    okMoveSide: "बगल में भेजें ➔",
    unveilCenter: "केंद्र में लाएं 🎯",
    spellcastLevel: "मंत्र जप स्तर XII",
    companionActive: "साथी सक्रिय है",
    hideScroll: "संदेश छिपाएं",
    muteVoice: "आवाज बंद करें",
    unmuteVoice: "आवाज चालू करें",
    toggleBgm: "संगीत चालू/बंद करें",
    strodia: "स्ट्रोडिया",
    strodie: "स्ट्रोडी",
    master: "स्वामी",
    mistress: "स्वामिनी",
    seeker: "महान साधक"
  },
  es: {
    strodiaTheGuide: "Strodia La Guía",
    strodieTheGuide: "Strodie El Guía",
    okMoveAbove: "Mover Arriba ⇧",
    okMoveSide: "Mover Al Lado ➔",
    unveilCenter: "Mostrar Centro 🎯",
    spellcastLevel: "Nivel de Conjuro XII",
    companionActive: "Compañero Activo",
    hideScroll: "Ocultar Mensaje",
    muteVoice: "Silenciar Voz",
    unmuteVoice: "Activar Voz",
    toggleBgm: "Alternar Música",
    strodia: "Strodia",
    strodie: "Strodie",
    master: "maestro",
    mistress: "maestra",
    seeker: "noble buscador"
  },
  fr: {
    strodiaTheGuide: "Strodia La Guide",
    strodieTheGuide: "Strodie Le Guide",
    okMoveAbove: "Déplacer En Haut ⇧",
    okMoveSide: "Déplacer Sur Le Côté ➔",
    unveilCenter: "Dévoiler Le Centre 🎯",
    spellcastLevel: "Niveau de Sort XII",
    companionActive: "Compagnon Actif",
    hideScroll: "Masquer Le Message",
    muteVoice: "Couper La Voix",
    unmuteVoice: "Activer La Voix",
    toggleBgm: "Basculer La Musique",
    strodia: "Strodia",
    strodie: "Strodie",
    master: "maître",
    mistress: "maîtresse",
    seeker: "noble chercheur"
  },
  de: {
    strodiaTheGuide: "Strodia Die Begleiterin",
    strodieTheGuide: "Strodie Der Begleiter",
    okMoveAbove: "Nach Oben Verschieben ⇧",
    okMoveSide: "Zur Seite Verschieben ➔",
    unveilCenter: "Mitte Enthüllen 🎯",
    spellcastLevel: "Zauberstufe XII",
    companionActive: "Begleiter Aktiv",
    hideScroll: "Nachricht Ausblenden",
    muteVoice: "Stimme Stumm",
    unmuteVoice: "Stimme Laut",
    toggleBgm: "Musik Ein/Aus",
    strodia: "Strodia",
    strodie: "Strodie",
    master: "Meister",
    mistress: "Meisterin",
    seeker: "edler Suchender"
  },
  zh: {
    strodiaTheGuide: "向导 斯特罗迪亚",
    strodieTheGuide: "向导 斯特罗迪",
    okMoveAbove: "移动到上方 ⇧",
    okMoveSide: "移动到侧边 ➔",
    unveilCenter: "显示中心 🎯",
    spellcastLevel: "法力等级 XII",
    companionActive: "守护神活跃中",
    hideScroll: "隐藏卷轴",
    muteVoice: "静音语音",
    unmuteVoice: "开启语音",
    toggleBgm: "开启/关闭背景音乐",
    strodia: "斯特罗迪亚",
    strodie: "斯特罗迪",
    master: "大师",
    mistress: "女主人",
    seeker: "高贵的探索者"
  },
  ja: {
    strodiaTheGuide: "ガイド・ストロディア",
    strodieTheGuide: "ガイド・ストロディ",
    okMoveAbove: "上に移動 ⇧",
    okMoveSide: "横に移動 ➔",
    unveilCenter: "中央を表示 🎯",
    spellcastLevel: "スペルキャストレベル XII",
    companionActive: "コンパニオン・アクティブ",
    hideScroll: "スクロールを非表示",
    muteVoice: "音声を消音",
    unmuteVoice: "音声を再生",
    toggleBgm: "BGM切り替え",
    strodia: "ストロディア",
    strodie: "ストロディ",
    master: "マスター",
    mistress: "ミストレス",
    seeker: "高貴な探求者"
  },
  ru: {
    strodiaTheGuide: "Стродия Проводник",
    strodieTheGuide: "Строди Проводник",
    okMoveAbove: "Переместить Вверх ⇧",
    okMoveSide: "Переместить Вбок ➔",
    unveilCenter: "Показать Центр 🎯",
    spellcastLevel: "Уровень Заклинания XII",
    companionActive: "Спутник Активен",
    hideScroll: "Скрыть Сообщение",
    muteVoice: "Выключить Голос",
    unmuteVoice: "Включить Голос",
    toggleBgm: "Переключить Музыку",
    strodia: "Стродия",
    strodie: "Строди",
    master: "мастер",
    mistress: "госпожа",
    seeker: "благородный искатель"
  },
  ar: {
    strodiaTheGuide: "ستروديا المرشدة",
    strodieTheGuide: "سترودي المرشد",
    okMoveAbove: "نقل لأعلى ⇧",
    okMoveSide: "نقل للجانب ➔",
    unveilCenter: "كشف المركز 🎯",
    spellcastLevel: "مستوى التعويذة XII",
    companionActive: "المرافق نشط",
    hideScroll: "إخفاء اللفافة",
    muteVoice: "كتم الصوت",
    unmuteVoice: "تشغيل الصوت",
    toggleBgm: "تبديل الموسيقى",
    strodia: "ستروديا",
    strodie: "سترودي",
    master: "سيدي",
    mistress: "سيدتي",
    seeker: "الباحث النبيل"
  }
};

export default function WizardCompanion({ username, lang, step, activeGoal, wizardGender, customWizardUrl, userTitle = "noble seeker" }: WizardCompanionProps) {
  const [speech, setSpeech] = useState<string>("");
  const [showBubble, setShowBubble] = useState(true);
  const [wizardCoords, setWizardCoords] = useState({ x: 100, y: 150, isFixed: false });
  const [accentColor, setAccentColor] = useState("#d4af37");
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [sparkId, setSparkId] = useState(0);

  // Docking mechanism for the companion to handle user request
  const [dockState, setDockState] = useState<"center" | "above" | "side">("center");

  // Dynamic speech text helper based on selected title
  const formatSpeech = (text: string) => {
    let replaced = text;
    
    // Dynamically translate/substitute wizard name based on gender and active selected language
    const nameKey = wizardGender === "female" ? "strodia" : "strodie";
    const translatedName = COMPANION_I18N[lang]?.[nameKey] || COMPANION_I18N["en"]?.[nameKey] || (wizardGender === "female" ? "Strodia" : "Strodie");
    
    replaced = replaced.split("Strodie").join(translatedName);
    replaced = replaced.split("Strodia").join(translatedName);
    replaced = replaced.split("स्ट्रोडी").join(translatedName);
    replaced = replaced.split("स्ट्रोडिया").join(translatedName);

    // Resolve localized title for master, mistress, noble seeker
    const titleKey = userTitle === "master" ? "master" : userTitle === "mistress" ? "mistress" : "seeker";
    const currentTitle = COMPANION_I18N[lang]?.[titleKey] || COMPANION_I18N["en"]?.[titleKey] || userTitle;

    replaced = replaced.replace(/master\/mistress/g, currentTitle);
    replaced = replaced.replace(/स्वामी\/स्वामिनी/g, currentTitle);
    replaced = replaced.replace(/señor\/señora/g, currentTitle);
    replaced = replaced.replace(/maître\/maîtresse/g, currentTitle);
    replaced = replaced.replace(/Meister\/Meisterin/g, currentTitle);
    replaced = replaced.replace(/阁下/g, currentTitle);
    replaced = replaced.replace(/マスター\/ミストレス/g, currentTitle);
    replaced = replaced.replace(/господин\/госпожа/g, currentTitle);
    replaced = replaced.replace(/سيدي\/سيدتي/g, currentTitle);

    return replaced;
  };

  // Sound and voice configuration
  const [isMuted, setIsMuted] = useState(true);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmIntervalRef = useRef<any>(null);
  const activeSourcesRef = useRef<any[]>([]);

  // Auto trigger speech text-to-speech voice
  const speakVoice = (text: string) => {
    if (lang !== "en") return; // ONLY speak English, silent for others as requested
    if (isMuted) return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 200));
      
      // Fetch browser speech synthesis voices to find high quality continuous speech voices
      const voices = window.speechSynthesis.getVoices();
      
      const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en"));
      
      let chosenVoice = null;
      if (wizardGender === "female") {
        // Humanized female voice adjustment
        chosenVoice = langVoices.find(v => 
          v.name.toLowerCase().includes("female") || 
          v.name.toLowerCase().includes("zira") || 
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("hazel") ||
          v.name.toLowerCase().includes("karen") ||
          v.name.toLowerCase().includes("google")
        );
        if (!chosenVoice && langVoices.length > 0) {
          chosenVoice = langVoices[0];
        }
        if (!chosenVoice) {
          chosenVoice = voices.find(v => 
            v.name.toLowerCase().includes("female") || 
            v.name.toLowerCase().includes("zira") || 
            v.name.toLowerCase().includes("samantha")
          );
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        } else {
          utterance.lang = "en-US";
        }
        
        utterance.rate = 0.92; // Beautiful, calm cadence
        utterance.pitch = 1.15; // Warm wizardess tone
      } else {
        // Traditional focused male wizard voice
        chosenVoice = langVoices.find(v => 
          (v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("female")) || 
          v.name.toLowerCase().includes("david") || 
          v.name.toLowerCase().includes("google us english male") ||
          v.name.toLowerCase().includes("george")
        );
        if (!chosenVoice && langVoices.length > 0) {
          chosenVoice = langVoices[0];
        }
        if (!chosenVoice) {
          chosenVoice = voices.find(v => 
            (v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("female")) || 
            v.name.toLowerCase().includes("david")
          );
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
          utterance.lang = chosenVoice.lang;
        } else {
          utterance.lang = "en-US";
        }

        utterance.rate = 0.95;
        utterance.pitch = 0.85; // Deep old wiseman majestic pitch
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  };

  // Setup Lavish Web Audio BGM Synthesizer (continuous premium calm chord wave)
  const startBgmSynthesizer = () => {
    if (isBgmPlaying) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      setIsBgmPlaying(true);

      // Warm Lavish Continuous Pad waves (Fades in beautifully)
      // C3 (130.81Hz), G3 (196.00Hz), C4 (261.63Hz), E4 (329.63Hz) - Beautiful majestic open C Major triad
      const pitches = [130.81, 196.00, 261.63, 329.63];
      
      pitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = idx === 0 ? "triangle" : "sine"; // Triangle for warm low bass cushion, sine for airy harmonics
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Lavish slower swells for ultimate calm
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        const maxVol = idx === 0 ? 0.015 : 0.01; // gentle low level
        gainNode.gain.linearRampToValueAtTime(maxVol, ctx.currentTime + 5.0 + idx);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        activeSourcesRef.current.push({ osc, gainNode });
      });

      // Calmer, dreamy arpeggio bells that cascade on top of the drone waves
      const bellNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      bgmIntervalRef.current = setInterval(() => {
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Calm bell sound frequency selection
        const freq = bellNotes[Math.floor(Math.random() * bellNotes.length)];
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Dreamy slow release delay
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.15); // soft chime amplitude
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5); // extra long echo tail for "lavish continuous" feel
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 4.8);
      }, 4500); // peaceful spacing

    } catch (err) {
      console.warn("Audio synthesizer failed to start", err);
    }
  };

  const stopBgmSynthesizer = () => {
    if (bgmIntervalRef.current) {
      clearInterval(bgmIntervalRef.current);
      bgmIntervalRef.current = null;
    }
    
    // Fade out and stop continuous pads
    activeSourcesRef.current.forEach((src) => {
      try {
        if (audioCtxRef.current) {
          src.gainNode.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1.0);
          setTimeout(() => {
            try { src.osc.stop(); } catch(e){}
          }, 1100);
        } else {
          src.osc.stop();
        }
      } catch (e) {}
    });
    activeSourcesRef.current = [];

    setTimeout(() => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    }, 1200);
    
    setIsBgmPlaying(false);
  };

  const toggleBgm = () => {
    if (isBgmPlaying) {
      stopBgmSynthesizer();
    } else {
      setIsMuted(false);
      startBgmSynthesizer();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      window.speechSynthesis.cancel();
      stopBgmSynthesizer();
    } else {
      speakVoice(speech);
      startBgmSynthesizer();
    }
  };

  // Synchronize guidance text and positions
  useEffect(() => {
    const textDict = STEP_GUIDES[step];
    if (textDict) {
      const rawText = textDict[lang] || textDict.en;
      const selectedSpeech = formatSpeech(rawText);
      setSpeech(selectedSpeech);
      setShowBubble(true);
      // Reset dockState when step advances so companion starts in proper place
      setDockState("center");
      
      const timer = setTimeout(() => {
        speakVoice(selectedSpeech);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, lang, isMuted, wizardGender, userTitle]);

  // Adjust positional highlights dynamically based on step and dockState
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (dockState === "above") {
      setWizardCoords({ x: w / 2, y: 70, isFixed: true });
      return;
    } else if (dockState === "side") {
      setWizardCoords({ x: w - 95, y: 75, isFixed: true });
      return;
    }

    if (step === "lang") {
      setWizardCoords({ x: Math.min(w * 0.25, 340), y: Math.min(h * 0.45, 360), isFixed: true });
    } else if (step === "wizard-select") {
      setWizardCoords({ x: Math.min(w * 0.25, 340), y: Math.min(h * 0.48, 380), isFixed: true });
    } else if (step === "auth") {
      setWizardCoords({ x: Math.min(w * 0.28, 380), y: Math.min(h * 0.60, 500), isFixed: true });
    } else if (step === "stats") {
      setWizardCoords({ x: Math.min(w * 0.25, 340), y: Math.min(h * 0.40, 310), isFixed: true });
    } else if (step === "ritual-1") {
      setWizardCoords({ x: Math.min(w * 0.28, 380), y: Math.min(h * 0.35, 270), isFixed: true });
    } else if (step === "ritual-2") {
      setWizardCoords({ x: Math.min(w * 0.28, 380), y: Math.min(h * 0.38, 290), isFixed: true });
    } else if (step === "ritual-3") {
      setWizardCoords({ x: Math.min(w * 0.28, 380), y: Math.min(h * 0.40, 310), isFixed: true });
    } else if (step === "warning") {
      setWizardCoords({ x: Math.min(w * 0.25, 340), y: Math.min(h * 0.32, 250), isFixed: true });
    } else {
      setWizardCoords({ x: w - 90, y: h - 85, isFixed: false });
    }
  }, [step, dockState]);

  // Clean audio ref on unmount
  useEffect(() => {
    return () => {
      if (bgmIntervalRef.current) clearInterval(bgmIntervalRef.current);
    };
  }, []);

  const handleTouchStrodie = () => {
    const burstCount = 14;
    const colors = wizardGender === "female" ? ["#ec4899", "#fbcfe8", "#f472b6", "#a855f7", "#ffffff"] : ["#d4af37", "#f3e8ff", "#a855f7", "#cbd5e1", "#3b82f6"];
    const newSparks = Array.from({ length: burstCount }).map((_, i) => ({
      id: sparkId + i,
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160 - 20,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setSparks((prev) => [...prev, ...newSparks]);
    setSparkId((prev) => prev + burstCount);

    const randomIdx = Math.floor(Math.random() * EXTRA_WISDOM_SPELLS.length);
    const textDict = EXTRA_WISDOM_SPELLS[randomIdx];
    const pickedText = textDict[lang] || textDict.en;
    
    const formattedText = formatSpeech(pickedText);
    setSpeech(formattedText);
    setShowBubble(true);
    speakVoice(formattedText);

    setAccentColor(colors[Math.floor(Math.random() * colors.length)]);
    setTimeout(() => {
      setAccentColor(wizardGender === "female" ? "#f472b6" : "#d4af37");
    }, 1500);

    setTimeout(() => {
      setSparks((prev) => prev.slice(burstCount));
    }, 1200);
  };

  const isCornerMode = step === "app";
  const dict = COMPANION_I18N[lang] || COMPANION_I18N["en"];

  return (
    <>
      {!isCornerMode && dockState === "center" && (
        <div className="fixed inset-0 bg-neutral-950/45 pointer-events-none z-40 transition-all duration-700 animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.85)_82%)]" />
        </div>
      )}

      <div
        className="z-50 transition-all duration-1000 ease-in-out"
        style={
          isCornerMode
            ? { position: "fixed", bottom: "1.5rem", right: "1.5rem" }
            : {
                position: "fixed",
                left: `${wizardCoords.x}px`,
                top: `${wizardCoords.y}px`,
                transform: "translate(-50%, -50%)"
              }
        }
      >
        <div className="flex flex-col items-center pointer-events-none relative">
          
          {/* Speech Dialogue Bubble */}
          <AnimatePresence>
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`mb-4 max-w-xs bg-neutral-900/98 backdrop-blur-md text-white p-4 border-2 ${wizardGender === "female" ? "border-pink-500/45 shadow-[0_12px_40px_rgba(236,72,153,0.22)]" : "border-gold-leaf/45 shadow-[0_12px_40px_rgba(212,175,55,0.22)]"} rounded-3xl text-left relative pointer-events-auto cursor-default font-sans text-xs`}
              >
                {/* Audio and Voice Controllers */}
                <div className="absolute top-2.5 right-6.5 flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={toggleBgm}
                    type="button"
                    title={dict.toggleBgm}
                    className={`p-1 rounded-md transition ${isBgmPlaying ? "text-yellow-400 bg-yellow-400/10" : "text-gray-500 hover:text-white"}`}
                  >
                    <Music size={11} className={isBgmPlaying ? "animate-bounce" : ""} />
                  </button>
                  {lang === "en" && (
                    <button
                      onClick={toggleMute}
                      type="button"
                      title={isMuted ? dict.unmuteVoice : dict.muteVoice}
                      className={`p-1 rounded-md transition ${!isMuted ? "text-green-400 bg-green-400/10 animate-pulse" : "text-gray-500 hover:text-white"}`}
                    >
                      {isMuted ? <VolumeX size={11} /> : <Volume2 size={11} />}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowBubble(false)}
                  type="button"
                  className="absolute top-2.5 right-2 text-gray-500 hover:text-gold-leaf p-1 rounded transition pointer-events-auto cursor-pointer"
                  title={dict.hideScroll}
                >
                  <X size={11} />
                </button>

                <div className={`flex items-center gap-1 text-[10px] ${wizardGender === "female" ? "text-pink-400" : "text-gold-leaf"} font-mono uppercase tracking-widest mb-1.5 font-bold select-none`}>
                  <Star className="animate-spin text-yellow-300" size={10} />
                  <span>{wizardGender === "female" ? dict.strodiaTheGuide : dict.strodieTheGuide}</span>
                </div>

                <p className="text-gray-100 font-medium leading-relaxed font-mono text-[11px] mb-1.5 pr-8">
                  "{speech}"
                </p>

                {!isCornerMode && dockState === "center" && (
                  <div className="flex gap-2 mb-2 pb-1.5 border-b border-purple-950/40 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setDockState("above")}
                      className={`flex-1 py-1 px-2 rounded-lg bg-neutral-950 border border-purple-900/40 ${wizardGender === 'female' ? 'hover:border-pink-500/70 hover:bg-pink-950/10' : 'hover:border-gold-leaf/70 hover:bg-amber-950/20'} text-gray-300 hover:text-white text-[9px] font-magic uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-0.5`}
                    >
                      <span>{dict.okMoveAbove}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDockState("side")}
                      className={`flex-1 py-1 px-2 rounded-lg bg-neutral-950 border border-purple-900/40 ${wizardGender === 'female' ? 'hover:border-pink-500/70 hover:bg-pink-950/10' : 'hover:border-gold-leaf/70 hover:bg-amber-950/20'} text-gray-300 hover:text-white text-[9px] font-magic uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-0.5`}
                    >
                      <span>{dict.okMoveSide}</span>
                    </button>
                  </div>
                )}

                {!isCornerMode && dockState !== "center" && (
                  <div className="flex justify-end mb-2 pb-1 border-b border-purple-950/40 pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => setDockState("center")}
                      className="py-0.5 px-2 rounded-md bg-neutral-950 border border-purple-900/40 hover:border-purple-500 text-gray-400 hover:text-white text-[8.5px] font-magic uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                    >
                      <span>{dict.unveilCenter}</span>
                    </button>
                  </div>
                )}

                {/* Status indicator */}
                <div className="flex items-center justify-between text-[8px] text-purple-400 font-mono border-t border-purple-950/60 pt-1.5">
                  <span>{dict.spellcastLevel}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-green-400 animate-ping" />
                    {dict.companionActive}
                  </span>
                </div>

                {isCornerMode ? (
                  <>
                    <div className="absolute bottom-[-8px] right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-neutral-900" />
                    <div className={`absolute bottom-[-10px] right-[31px] w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] ${wizardGender === "female" ? "border-t-pink-500/45" : "border-t-gold-leaf/45"} z-[-1]`} />
                  </>
                ) : (
                  <>
                    <div className="absolute left-1/2 bottom-[-8px] -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-neutral-900" />
                    <div className={`absolute left-1/2 bottom-[-10px] -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] ${wizardGender === "female" ? "border-t-pink-500/45" : "border-t-gold-leaf/45"} z-[-1]`} />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Magical Particles & Sparks */}
          <div className="absolute pointer-events-none z-10 w-full h-full">
            <AnimatePresence>
              {sparks.map((s) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 0.2,
                    x: s.x,
                    y: s.y,
                    rotate: Math.random() > 0.5 ? 360 : -360
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute text-xs font-mono select-none"
                  style={{ color: s.color }}
                >
                  ✦
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* DRAGGABLE FAIRY TALE CHARACTER RENDERER */}
          <motion.div
            drag={isCornerMode}
            dragConstraints={{ left: -500, right: 0, top: -550, bottom: 0 }}
            dragElastic={0.15}
            onClick={handleTouchStrodie}
            animate={{
              y: [0, -12, 0, -8, 0],
              rotate: [0, 4, -3, 3, 0],
              scale: isCornerMode ? 0.95 : 1.15
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-20 h-22 relative pointer-events-auto cursor-pointer focus:outline-none group select-none transition-all duration-500 ${!isCornerMode && dockState !== "center" ? "opacity-45 hover:opacity-100 filter brightness-90 hover:brightness-100" : ""}`}
          >
            {/* Glowing fairy dust cloud */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${wizardGender === "female" ? "from-pink-800/25 to-pink-500/10" : "from-purple-800/25 to-pink-800/15"} filter blur-lg group-hover:scale-125 transition duration-500`} />

            {/* Custom User Override Animation URL Check */}
            {customWizardUrl ? (
              <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${wizardGender === "female" ? "border-pink-500" : "border-gold-leaf"} bg-neutral-950 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.45)] relative`}>
                <img 
                  src={customWizardUrl} 
                  alt="Custom Companion" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback back to placeholder svg if image fails
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='1.5'%3E%3Cpath d='M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z'/%3E%3Cpath d='M12 14c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            ) : wizardGender === "female" ? (
              // STRODIA - ALCHEMICAL FAIRY SORCERESS vector model
              <svg viewBox="0 0 120 130" className="w-full h-full drop-shadow-[0_4px_16px_rgba(236,72,153,0.55)]">
                <circle cx="60" cy="65" r="54" fill="none" stroke="#f472b6" strokeWidth="1" strokeDasharray="3,6" className="animate-spin-slow opacity-40" />
                
                {/* Dangling fairytale pink slippers */}
                <g>
                  <path
                    d="M 46 102 C 46 112, 38 114, 34 114 C 34 114, 48 118, 52 114"
                    fill="#9d174d"
                    stroke="#f472b6"
                    strokeWidth="1.5"
                    className="origin-top animate-bounce"
                    style={{ animationDelay: "0ms", animationDuration: "1.8s" }}
                  />
                  <path
                    d="M 74 102 C 74 112, 82 114, 86 114 C 86 114, 72 118, 68 114"
                    fill="#9d174d"
                    stroke="#f472b6"
                    strokeWidth="1.5"
                    className="origin-top animate-bounce"
                    style={{ animationDelay: "400ms", animationDuration: "1.8s" }}
                  />
                </g>

                {/* Lovely Hot Rose Alchemist Cape Gown */}
                <path
                  d="M 35 102 C 35 60, 85 60, 85 102 Z"
                  fill="url(#sorceressGrad)"
                  stroke="#f472b6"
                  strokeWidth="1.75"
                />

                <polygon points="60,78 63,85 70,86 65,91 66,98 60,94 54,98 55,91 50,86 57,85" fill="#fde047" className="animate-pulse" />

                {/* Gorgeous flowing golden hair locks */}
                <path
                  d="M 38 52 C 32 62, 30 78, 33 86 C 35 90, 39 88, 38 84 Q 38 68 44 54 Z"
                  fill="#fbbf24"
                  stroke="#d97706"
                  strokeWidth="0.75"
                />
                <path
                  d="M 82 52 C 88 62, 90 78, 87 86 C 85 90, 81 88, 82 84 Q 82 68 76 54 Z"
                  fill="#fbbf24"
                  stroke="#d97706"
                  strokeWidth="0.75"
                />

                {/* Cute nose & facial coordinates */}
                <circle cx="60" cy="54" r="5" fill="#fee2e2" stroke="#fda4af" strokeWidth="0.5" />
                <path d="M 58 58 Q 60 60 62 58" fill="none" stroke="#ec4899" strokeWidth="1" /> {/* Smile */}

                {/* Blinking eyes with luxurious magical eyelashes */}
                <g className="animate-pulse">
                  <circle cx="50" cy="46" r="3" fill="#1e1b4b" />
                  <path d="M 47 43 Q 50 41 53 44" fill="none" stroke="#100b2b" strokeWidth="1.2" />
                  <circle cx="50.7" cy="45.2" r="1" fill="#ffffff" />
                  
                  <circle cx="70" cy="46" r="3" fill="#1e1b4b" />
                  <path d="M 67 43 Q 70 41 73 44" fill="none" stroke="#100b2b" strokeWidth="1.2" />
                  <circle cx="70.7" cy="45.2" r="1" fill="#ffffff" />
                </g>

                {/* Left hand doing flow wave */}
                <path
                  d="M 30 84 C 22 84, 18 78, 20 74 C 22 70, 28 78, 32 80"
                  fill="#fbcfe8"
                  stroke="#f472b6"
                  strokeWidth="1"
                />

                {/* Right Arm & Magician Wand emitting pink stars */}
                <g className="origin-center">
                  <path d="M 85 84 Q 100 78 102 70" fill="none" stroke="#831843" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="102" cy="70" r="3.5" fill="#fbcfe8" />
                  
                  <line x1="94" y1="84" x2="114" y2="52" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon
                    points="114,46 116,51 121,52 117,55 118,60 114,57 110,60 111,55 107,52 112,51"
                    fill="#fce7f3"
                    className="animate-pulse"
                  />
                  <circle cx="114" cy="52" r="7.5" fill="#f472b6" className="animate-ping opacity-35" />
                </g>

                {/* Pointed pink sorceress witch hat */}
                <g>
                  <path
                    d="M 32 40 L 60 1 A 2 2 0 0 1 61 1 L 88 40 Z"
                    fill="url(#sorceressHatGrad)"
                    stroke="#f472b6"
                    strokeWidth="1.75"
                  />
                  <polygon points="60,-1 61.5,3 65,3.5 62,6 63,9.5 60,8 57,9.5 58,6 55,3.5 58.5,3" fill="#fce7f3" />
                  <circle cx="60" cy="2" r="6" fill="#f472b6" className="animate-ping opacity-40 pointer-events-none" />

                  <path d="M 32 38 Q 60 41 88 38" fill="none" stroke="#f472b6" strokeWidth="4" />
                  <rect x="53" y="35" width="14" height="6" fill="#ec4899" rx="1.5" stroke="#f472b6" strokeWidth="1" />
                </g>

                <defs>
                  <linearGradient id="sorceressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#831843" />
                    <stop offset="60%" stopColor="#9d174d" />
                    <stop offset="100%" stopColor="#be185d" />
                  </linearGradient>
                  <linearGradient id="sorceressHatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#500724" />
                    <stop offset="60%" stopColor="#701a75" />
                    <stop offset="100%" stopColor="#9d174d" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              // STRODIE - MAGICAL SUMMONER WIZARD (DEFAULT MALE)
              <svg viewBox="0 0 120 130" className="w-full h-full drop-shadow-[0_4px_16px_rgba(212,175,55,0.45)]">
                <circle cx="60" cy="65" r="54" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="3,6" className="animate-spin-slow opacity-40" />

                {/* Dangling boots with toggle bounce */}
                <g>
                  <path
                    d="M 46 102 C 46 112, 38 114, 34 114 C 34 114, 48 118, 52 114"
                    fill="#581c87"
                    stroke="#d4af37"
                    strokeWidth="1.5"
                    className="origin-top animate-bounce"
                    style={{ animationDelay: "0ms", animationDuration: "1.8s" }}
                  />
                  <path
                    d="M 74 102 C 74 112, 82 114, 86 114 C 86 114, 72 118, 68 114"
                    fill="#581c87"
                    stroke="#d4af37"
                    strokeWidth="1.5"
                    className="origin-top animate-bounce"
                    style={{ animationDelay: "400ms", animationDuration: "1.8s" }}
                  />
                </g>

                {/* Main Alchemist Blue Robe Cloak */}
                <path
                  d="M 35 102 C 35 60, 85 60, 85 102 Z"
                  fill="url(#cloakGrad)"
                  stroke="#d4af37"
                  strokeWidth="1.75"
                />

                <polygon points="60,78 63,85 70,86 65,91 66,98 60,94 54,98 55,91 50,86 57,85" fill="#fde047" className="animate-pulse" />

                {/* Fluffy white wizard beard */}
                <path
                  d="M 44 56 C 44 80, 76 80, 76 56 Z"
                  fill="#f3f4f6"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <path d="M 48 58 Q 60 74 72 58" fill="none" stroke="#e2e8f0" strokeWidth="1" />

                <circle cx="60" cy="54" r="5" fill="#fbcfe8" stroke="#ec4899" strokeWidth="0.5" />

                {/* Pair of blinking wise eyes */}
                <g className="animate-pulse">
                  <circle cx="50" cy="46" r="3" fill="#1e1b4b" />
                  <circle cx="50.7" cy="45.2" r="1" fill="#ffffff" />
                  <circle cx="70" cy="46" r="3" fill="#1e1b4b" />
                  <circle cx="70.7" cy="45.2" r="1" fill="#ffffff" />
                </g>

                {/* Left hand details */}
                <path
                  d="M 30 84 C 22 84, 18 78, 20 74 C 22 70, 28 78, 32 80"
                  fill="#fbcfe8"
                  stroke="#d4af37"
                  strokeWidth="1"
                />

                {/* Right Arm & Hermetic Staff */}
                <g className="origin-center">
                  <path d="M 85 84 Q 100 78 102 70" fill="none" stroke="#701a75" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="102" cy="70" r="3.5" fill="#fbcfe8" />
                  
                  <line x1="94" y1="84" x2="114" y2="52" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon
                    points="114,46 116,51 121,52 117,55 118,60 114,57 110,60 111,55 107,52 112,51"
                    fill="#fde047"
                    className="animate-pulse"
                  />
                  <circle cx="114" cy="52" r="7.5" fill="#fde047" className="animate-ping opacity-35" />
                </g>

                {/* Pointed deep purple wizard hat */}
                <g>
                  <path
                    d="M 32 40 L 60 1 A 2 2 0 0 1 61 1 L 88 40 Z"
                    fill="url(#hatGrad)"
                    stroke="#d4af37"
                    strokeWidth="1.75"
                  />
                  <polygon points="60,-1 61.5,3 65,3.5 62,6 63,9.5 60,8 57,9.5 58,6 55,3.5 58.5,3" fill="#fde047" />
                  <circle cx="60" cy="2" r="6" fill="#fde047" className="animate-ping opacity-40 pointer-events-none" />

                  <path d="M 32 38 Q 60 41 88 38" fill="none" stroke="#d4af37" strokeWidth="4" />
                  <rect x="53" y="35" width="14" height="6" fill="#9333ea" rx="1.5" stroke="#d4af37" strokeWidth="1" />
                </g>

                <defs>
                  <linearGradient id="cloakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2e1065" />
                    <stop offset="60%" stopColor="#4c1d95" />
                    <stop offset="100%" stopColor="#701a75" />
                  </linearGradient>
                  <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b0764" />
                    <stop offset="60%" stopColor="#581c87" />
                    <stop offset="100%" stopColor="#6b21a8" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            <div className={`absolute top-2 right-1.5 flex h-3.5 w-3.5`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${wizardGender === "female" ? "bg-pink-400" : "bg-yellow-400"} opacity-60`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${wizardGender === "female" ? "bg-pink-300 border-pink-500" : "bg-yellow-300 border-yellow-500"} border flex items-center justify-center text-[7px] text-purple-950 font-bold select-none`}>
                ✦
              </span>
            </div>

            <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 bg-neutral-950/90 border ${wizardGender === "female" ? "border-pink-500/50 text-pink-400" : "border-gold-leaf/40 text-gold-leaf"} font-mono text-[8.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow`}>
              {wizardGender === "female" ? "STRODIA" : "STRODIE"}
            </span>
          </motion.div>

        </div>
      </div>
    </>
  );
}
