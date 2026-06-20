import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  BookOpen, 
  Clock, 
  FileText, 
  Settings as SettingsIcon, 
  Users, 
  LogOut, 
  Plus, 
  Check, 
  Trash2, 
  ArrowLeft, 
  Send, 
  Lock, 
  Cpu, 
  MapPin, 
  Globe, 
  Flame, 
  AlertTriangle,
  GraduationCap,
  X,
  Crown,
  Gem,
  Compass,
  Wand2,
  Moon
} from "lucide-react";
import WizardCompanion from "./components/WizardCompanion";

// Types
interface Chapter {
  title: string;
  done: boolean;
}

interface Ritual {
  title: string;
  goal: string;
  chapters: number;
  start: string;
  end: string;
  studyDays?: number[]; // indices 0-6 (Sun-Sat)
  specificDates?: string[]; // strings "YYYY-MM-DD"
  hoursPerChapter: string;
  chapterList: Chapter[];
  mode: "weekdays" | "dates";
}

interface SoulProfile {
  username: string;
  numRituals: number;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ru", name: "Русский" },
  { code: "ar", name: "العربية" }
];

const LOCAL_I18N: Record<string, Record<string, string>> = {
  en: {
    langTitle: "Select Celestial Language",
    welcome: "Welcome to Strode",
    authTitle: "Access Your Soul Portal",
    username: "Soul Name / Identifier",
    passkey: "Alchemical Passkey",
    posess: "Awaken Inner Soul",
    signup: "Register New Soul Profile",
    chooseSoul: "Discovered Souls at Current Ingress",
    planetaryIp: "Planetary Ingress IP Coordinate",
    noDiscoveredSouls: "No other souls detected at this IP location yet.",
    possessedSuccess: "Your physical soul has successfully possessed",
    authError: "Passcode incorrect or your soul could not be summoned.",
    statsTitle: "Chronos Time Profile",
    weekPlaceholder: "Weekdays daily study hours",
    weekendPlaceholder: "Weekends daily study hours",
    weekSelect: "Select Weekend Days",
    next: "Proceed Forward",
    grimoire: "Grimoire",
    routine: "Routine",
    memos: "Memos",
    oracle: "Oracle",
    settings: "Settings",
    manage: "Manage Souls",
    back: "Back",
    banish: "Banish Session",
    activeTrans: "Active Transmutation",
    newRitual: "Launch New Study Ritual",
    sanctumTitle: "Study Chapter Sanctum",
    seal: "Seal in Eternity",
    logout: "Banish Session",
    storedGrim: "Stored Grimoires",
    focus: "Transmute Focus",
    banishRitual: "Banish",
    modify: "Reshape",
    energyWarning: "Planetary energy flow is deficient. Under 3 hours of focus per chapter is allocated. Wilt thou still proceed?",
    proceedAnyway: "Proceed Alchemically",
    readjustDates: "Readjust Chronos Dates",
    chapterPlaceholder: "Rename study objective...",
    chatPlaceholder: "Speak with the Grand Archmage Alchemist...",
    sealSuccess: "Sealed in your soul's grimoire files.",
    rankInitiate: "Acolyte Initiate",
    rankScholar: "Sage Apprentice",
    rankMaster: "Grand Alchemist",
    studyDaysLabel: "Study days for this objective:",
    datesLabel: "Active study dates:",
    festiveAbundant: "is abundant. Blessed focus is upon thy grimoires.",
    strodiaName: "Strodia (Sovereign Sorceress)",
    strodieName: "Strodie (Grand Summoner)",
    uploadTitle: "✨ Upload Art Scroll (GIF/PNG/JPG)",
    customArtLoaded: "Custom Art Loaded",
    removeArt: "Remove Art Scroll ✕",
    uploadDesc: "Upload any local image or animated GIF file direct from thine device. Underwise Strodia/Strodie defaults to their hand-drawn vectors.",
    titleLabel: "👑 My Honorable Addressing Title",
    titleMaster: "Master",
    titleMistress: "Mistress",
    titleSeeker: "Seeker",
    backToLang: "Change Alignment Language",
    customArtLabel: "🌌 Cosmic Art Scroll Overlay (Upload Animated GIF/Image)",
    onboardingDesc: "Select thy spiritual guide to supervise thy focus, or provide a sacred custom art scroll.",
    chooseCompanion: "CHOOSE THY COMPANION",
    alignProceed: "Align Companion & Proceed",
    webPortalLabel: "Study Sanctum Alignment Portal",
    initSeals: "Initializing Sacred Seals...",
    strodiaVoiceDesc: "Warm Human Voice",
    strodieVoiceDesc: "Hermetic Sage Voice",
    strodiaBrief: "A warm alchemical sorceress speaking beautiful, comforting study spells with sweet vocal cadence.",
    strodieBrief: "An ancient master tracker supervising thy rituals and grimoires with traditional focus formulas.",
    vesselSettings: "Vessel Settings",
    vesselSettingsDesc: "Configure language and Chronos structures.",
    preferredLang: "Preferred Alignment Translation",
    myCompanion: "My Spiritual Companion",
    myCompanionDesc: "Choose thy preferred wizard companion or supply thy own custom moving animation scroll.",
    adjustChronosTitle: "Adjust Time Profile (Chronos)",
    adjustChronosDesc: "Readjust daily weekday/weekend hours or weekend selections.",
    adjustChronosBtn: "Adjust Chronos Profile",
    manageSoulsDesc: "Possess a parallel soul identity or register a new one grouped on this IP address.",
    availableSouls: "Available Souls in Ingress",
    ritualsLabel: "Rituals",
    createdTime: "Created:",
    possessingLabel: "Possessing",
    possessBtn: "Possess",
    possessIdentity: "Possess Discovered Identity",
    targetIdentity: "Target Identity Name",
    registerAnew: "Register Anew",
    chooseActiveFocus: "Choose your active alchemical focus guide.",
    openSanctum: "🏰 Open Sanctum",
    noActiveGrimoires: "No Active Grimoires",
    noActiveGrimoiresDesc: "Create your initial study routine plan and track chapter milestones cleanly with alchemical guidance.",
    launchFirstRitual: "Launch First Ritual",
    returnToGrimoires: "Return to Grimoires",
    activeSanctumDesc: "Active sanctum for focus objectives",
    dailyCycleTitle: "Daily Cycle Routine",
    dailyCycleDesc: "Map your absolute day-to-day study rhythm parameters.",
    dailyCyclePlaceholder: "e.g. 05:00 - 07:00 Deep Spellwork (Math)\n14:00 - 16:00 Solitary Alchemical Practice (Chemistry)\n...",
    arcaneMemosTitle: "Arcane Memos",
    arcaneMemosDesc: "Record formulas, wisdom records, and focus plans.",
    arcaneMemosPlaceholder: "Enter Formulas or Wisdom Logs here...",
    oracleTitle: "Grand Archmage Oracle",
    oracleDesc: "Focused Study Advisor AI",
    oracleIntro: "Hark, study voyager! Ask of me.",
    oracleIntroDesc: "Speak of formulas, chapter strategies, or focus. I shall redirect thee strictly should you drift.",
    oracleLoading: "Consulting ancient focus tomes...",
    archmageSender: "Archmage Alchemist",
    keyVocation: "Key Vocation",
    completed: "Completed",
    deficientEnergyTitle: "Deficient Energy Warning",
    calculateEnergies: "Calculate Energies",
    changeStudyHours: "Change Study Hours",
    allocatedFocus: "Allocated Focus",
    recommendedFocus: "Recommended Focus",
    targetHoursNeeded: "Target Hours Needed",
    hoursChapter: "Hours / Chapter",
    hoursTotal: "Hours Total"
  },
  hi: {
    langTitle: "ब्रह्मांडीय भाषा चुनें",
    welcome: "स्ट्रोड में आपका स्वागत है",
    authTitle: "अपनी आत्मा पोर्टल तक पहुँचें",
    username: "आत्मा का नाम",
    passkey: "किमयागिरी पासकुंजी",
    posess: "आंतरिक आत्मा को जगाएं",
    signup: "नई आत्मा पंजीकृत करें",
    chooseSoul: "इस आईपी पते पर खोजी गई आत्माएं",
    planetaryIp: "ग्रहों की आईपी स्थिति",
    noDiscoveredSouls: "इस आईपी स्थान पर अभी तक कोई अन्य आत्मा नहीं पाई गई है।",
    possessedSuccess: "आपकी आत्मा ने सफलतापूर्वक प्रवेश पा लिया है",
    authError: "गलत पासकुंजी या आत्मा को बुलाया नहीं जा सका।",
    statsTitle: "समय प्रोफ़ाइल",
    weekPlaceholder: "कार्यदिवस दैनिक घंटे",
    weekendPlaceholder: "सप्ताहांत दैनिक घंटे",
    weekSelect: "सप्ताहांत के दिन चुनें",
    next: "आगे बढ़ें",
    grimoire: "ग्रिमॉयर (योजना)",
    routine: "दिनचर्या",
    memos: "मेमो",
    oracle: "ओरेकल (एआई)",
    settings: "सेटिंग्स",
    manage: "आत्माएं प्रबंधित करें",
    back: "पीछे",
    banish: "सत्र समाप्त करें",
    activeTrans: "सक्रिय अलकेमी",
    newRitual: "नई विद्या साधना शुरू करें",
    sanctumTitle: "अध्याय गर्भगृह",
    seal: "अनंतकाल के लिए सील करें",
    logout: "सत्र समाप्त करें",
    storedGrim: "संग्रहीत पुस्तकें",
    focus: "ध्यान केंद्रित करें",
    banishRitual: "हटाएं",
    modify: "बदलें",
    energyWarning: "ग्रहों की ऊर्जा का प्रवाह थोड़ा कमजोर है। प्रति अध्याय 3 घंटे से कम समय आवंटित है। क्या आप फिर भी आगे बढ़ना चाहेंगे?",
    proceedAnyway: "आगे बढ़ें",
    readjustDates: "तिथियां बदलें",
    chapterPlaceholder: "अध्याय का नाम बदलें...",
    chatPlaceholder: "ग्रैंड आर्केमेज से बात करें...",
    sealSuccess: "आत्मा की बहीखाता फ़ाइलों में दर्ज कर दिया गया है।",
    rankInitiate: "नौसिखिया शिष्य",
    rankScholar: "विद्वान प्रशिक्षु",
    rankMaster: "महान कीमियागर",
    studyDaysLabel: "अध्ययन के दिन:",
    datesLabel: "सक्रिय अध्ययन तिथियां:",
    festiveAbundant: "प्रचुर मात्रा में है। आपकी कीमिया साधनाएं धन्य हैं।",
    strodiaName: "स्ट्रोडिया (परम जादूगरनी)",
    strodieName: "स्ट्रोडी (महान आह्वाहनकर्ता)",
    uploadTitle: "✨ कला स्क्रॉल अपलोड करें (GIF/PNG/JPG)",
    customArtLoaded: "कस्टम कला लोड की गई",
    removeArt: "कला स्क्रॉल हटाएं ✕",
    uploadDesc: "अपने डिवाइस से सीधे कोई भी स्थानीय चित्र या एनिमेटेड GIF अपलोड करें। अन्यथा स्ट्रोडिया/स्ट्रोडी डिफ़ॉल्ट रूप से दिखाई देंगे।",
    titleLabel: "👑 मेरी सम्मानजनक उपाधि",
    titleMaster: "स्वामी",
    titleMistress: "स्वामिनी",
    titleSeeker: "साधक",
    backToLang: "भाषा बदलें",
    customArtLabel: "🌌 ब्रह्मांडीय कला स्क्रॉल अपलोड (GIF/PNG/JPG)",
    onboardingDesc: "अपनी पढ़ाई में सहयोग के लिए अपने आध्यात्मिक मार्गदर्शक का चयन करें, या एक पवित्र कला स्क्रॉल अपलोड करें।",
    chooseCompanion: "अपना मार्गदर्शक चुनें",
    alignProceed: "मार्गदर्शक संरेखित करें और आगे बढ़ें",
    webPortalLabel: "स्वाध्याय साधना संरेखण पोर्टल",
    initSeals: "पवित्र मंत्र विकसित हो रहे हैं...",
    strodiaVoiceDesc: "मधुर मानवीय स्वर",
    strodieVoiceDesc: "प्राचीन ऋषि का स्वर",
    strodiaBrief: "एक दयालु जादुई विदुषी जो आपकी शिक्षा को सुगम बनाने के लिए मधुर मंत्रों का पाठ करती हैं।",
    strodieBrief: "एक सिद्ध आचार्य जो आपके पठन-पाठन और धार्मिक ध्यान सूत्रों की निगरानी करते हैं।",
    vesselSettings: "वैसल सेटिंग्स",
    vesselSettingsDesc: "भाषा और क्रोनोस संरचनाओं को कॉन्फ़िगर करें।",
    preferredLang: "पसंदीदा संरेखण अनुवाद",
    myCompanion: "मेरा आध्यात्मिक साथी",
    myCompanionDesc: "अपने पसंदीदा जादुई साथी को चुनें या अपना खुद का कस्टम एनिमेटेड कला स्क्रॉल अपलोड करें।",
    adjustChronosTitle: "समय प्रोफ़ाइल समायोजित करें (क्रोनोस)",
    adjustChronosDesc: "दैनिक कार्यदिवस/सप्ताहांत के घंटे या सप्ताहांत के चयन को समायोजित करें।",
    adjustChronosBtn: "क्रोनोस प्रोफाइल बदलें",
    manageSoulsDesc: "इस आईपी पते पर समूहीकृत एक समान आत्मा पहचान धारण करें या एक नया पंजीकृत करें।",
    availableSouls: "प्रवेश द्वार में उपलब्ध आत्माएँ",
    ritualsLabel: "साधनाएं",
    createdTime: "बनाया गया:",
    possessingLabel: "प्रवेश कर रहे हैं",
    possessBtn: "प्रवेश करें",
    possessIdentity: "खोजी गई पहचान में प्रवेश करें",
    targetIdentity: "लक्षित पहचान नाम",
    registerAnew: "पुनः पंजीकृत करें",
    chooseActiveFocus: "अपना सक्रिय कीमिया ध्यान गाइड चुनें।",
    openSanctum: "🏰 गर्भगृह खोलें",
    noActiveGrimoires: "कोई सक्रिय साधना सूची नहीं",
    noActiveGrimoiresDesc: "कीमिया गाइड के साथ अपनी प्रारंभिक अध्ययन दिनचर्या योजना बनाएं और अध्याय के मील के पत्थर को ट्रैक करें।",
    launchFirstRitual: "पहला अनुष्ठान शुरू करें",
    returnToGrimoires: "साधना सूची पर लौटें",
    activeSanctumDesc: "ध्यान उद्देश्यों के लिए सक्रिय साधना भवन",
    dailyCycleTitle: "दैनिक चक्र दिनचर्या",
    dailyCycleDesc: "अपने पूर्ण दैनिक अध्ययन लय मापदंडों को रेखांकित करें।",
    dailyCyclePlaceholder: "उदा. 05:00 - 07:00 गहन साधना (गणित)\n14:00 - 16:00 एकांत अभ्यास (रसायन शास्त्र)\n...",
    arcaneMemosTitle: "गुप्त मेमो",
    arcaneMemosDesc: "सूत्र, ज्ञान रिकॉर्ड और ध्यान योजनाओं को सहेजें।",
    arcaneMemosPlaceholder: "यहाँ सूत्र या ज्ञान लॉग दर्ज करें...",
    oracleTitle: "महान महाजादूगर ओरेकल",
    oracleDesc: "सक्रिय अध्ययन सलाहकार एआई",
    oracleIntro: "सुनो, अध्ययन यात्री! मुझसे पूछें।",
    oracleIntroDesc: "सूत्रों, अध्याय रणनीतियों या ध्यान की बात करें। यदि आप भटकेंगे, तो मैं आपको वापस लाऊंगा।",
    oracleLoading: "प्राचीन ग्रंथों से परामर्श किया जा रहा है...",
    archmageSender: "महाजादूगर कीमियागर",
    keyVocation: "मुख्य व्यवसाय",
    completed: "पूरा किया गया",
    deficientEnergyTitle: "अपर्याप्त ऊर्जा चेतावनी",
    calculateEnergies: "ऊर्जा की गणना करें",
    changeStudyHours: "अध्ययन घंटे बदलें",
    allocatedFocus: "आवंटित ध्यान",
    recommendedFocus: "अनुशंसित ध्यान",
    targetHoursNeeded: "लक्षित कुल घंटे",
    hoursChapter: "घंटे / अध्याय",
    hoursTotal: "कुल घंटे"
  },
  es: {
    langTitle: "Seleccionar Idioma Celestial",
    welcome: "Bienvenido a Strode",
    authTitle: "Acceder a tu Portal del Alma",
    username: "Nombre del Alma / Identificador",
    passkey: "Clave Alquímica",
    posess: "Despertar Alma Interior",
    signup: "Registrar Nuevo Perfil del Alma",
    chooseSoul: "Almas Descubiertas en esta Entrada",
    planetaryIp: "Coordenada IP de Entrada Planetaria",
    noDiscoveredSouls: "No se han detectado otras almas en esta IP.",
    possessedSuccess: "Tu alma física ha poseído con éxito a",
    authError: "Clave incorrecta o tu alma no pudo ser invocada.",
    statsTitle: "Perfil de Tiempo de Cronos",
    weekPlaceholder: "Horas de estudio diarias en días laborables",
    weekendPlaceholder: "Horas de estudio diarias en fines de semana",
    weekSelect: "Seleccionar Días de Fin de Semana",
    next: "Proceder",
    grimoire: "Grimorio",
    routine: "Rutina",
    memos: "Notas",
    oracle: "Oráculo",
    settings: "Configuración",
    manage: "Gestionar Almas",
    back: "Atrás",
    banish: "Cerrar Sesión",
    activeTrans: "Transmutación Activa",
    newRitual: "Iniciar Nuevo Ritual de Estudio",
    sanctumTitle: "Sagrario del Capítulo",
    seal: "Sellar en la Eternidad",
    logout: "Cerrar Sesión",
    storedGrim: "Grimorios Guardados",
    focus: "Concentrarse",
    banishRitual: "Eliminar",
    modify: "Reformar",
    energyWarning: "El flujo de energía planetaria es deficiente. Se asignan menos de 3 horas de concentración por capítulo. ¿Procederás de todos modos?",
    proceedAnyway: "Proceder Alquímicamente",
    readjustDates: "Reajustar Fechas de Cronos",
    chapterPlaceholder: "Renombrar objetivo de estudio...",
    chatPlaceholder: "Hablar con el Gran Archimago Alquimista...",
    sealSuccess: "Sellado en los archivos del grimorio de tu alma.",
    rankInitiate: "Iniciado Acólito",
    rankScholar: "Aprendiz de Sabio",
    rankMaster: "Gran Alquimista",
    studyDaysLabel: "Días de estudio para este objetivo:",
    datesLabel: "Fechas de estudio activas:",
    festiveAbundant: "es abundante. El enfoque bendito está sobre tus grimorios.",
    strodiaName: "Strodia (Hechicera Soberana)",
    strodieName: "Strodie (Gran Invocador)",
    uploadTitle: "✨ Subir Pergamino de Arte (GIF/PNG/JPG)",
    customArtLoaded: "Arte Personalizado Cargado",
    removeArt: "Eliminar Pergamino de Arte ✕",
    uploadDesc: "Sube cualquier imagen local o archivo GIF animado desde tu dispositivo. De lo contrario, se usarán los vectores predeterminados de Strodia/Strodie.",
    titleLabel: "👑 Mi Título Honorífico",
    titleMaster: "Maestro",
    titleMistress: "Maestra",
    titleSeeker: "Buscador",
    backToLang: "Cambiar Idioma de Alineación",
    customArtLabel: "🌌 Superposición de Arte Cósmico (Subir GIF/Imagen Animados)",
    onboardingDesc: "Selecciona tu guía espiritual para supervisar tu enfoque, o proporciona un pergamino de arte personalizado sagrado.",
    chooseCompanion: "ELIGE TU COMPAÑERO",
    alignProceed: "Alinear Compañero y Proceder",
    webPortalLabel: "Portal de Alineación del Sanctum",
    initSeals: "Inicializando Sellos Sagrados...",
    strodiaVoiceDesc: "Voz Humana Cálida",
    strodieVoiceDesc: "Voz de Sabio Hermético",
    strodiaBrief: "Una hechicera alquímica que recita hermosos conjuros de estudio reconfortantes.",
    strodieBrief: "Un antiguo maestro que supervisa tus rituales y grimorios con fórmulas tradicionales.",
    vesselSettings: "Configuración de la Vasija",
    vesselSettingsDesc: "Configura el idioma y las estructuras de Chronos.",
    preferredLang: "Traducción de Alineación Preferida",
    myCompanion: "Mi Compañero Espiritual",
    myCompanionDesc: "Elige tu compañero mago preferido o proporciona tu propio pergamino de animación personalizado.",
    adjustChronosTitle: "Ajustar perfil de tiempo (Chronos)",
    adjustChronosDesc: "Reajustar horas diarias de días laborables/fines de semana o selecciones de fines de semana.",
    adjustChronosBtn: "Ajustar Perfil de Chronos",
    manageSoulsDesc: "Posee una identidad de alma paralela o registra una nueva agrupada en esta dirección IP.",
    availableSouls: "Almas Disponibles en Entrada",
    ritualsLabel: "Rituales",
    createdTime: "Creado:",
    possessingLabel: "Poseyendo",
    possessBtn: "Poseer",
    possessIdentity: "Poseer Identidad Descubierta",
    targetIdentity: "Nombre de la Identidad Objetivo",
    registerAnew: "Registrarse de Nuevo",
    chooseActiveFocus: "Elige tu guía de enfoque alquímico activo.",
    openSanctum: "🏰 Abrir Santuario",
    noActiveGrimoires: "Sin grimorios activos",
    noActiveGrimoiresDesc: "Crea tu plan inicial de rutina de estudio y sigue los hitos de los capítulos con guía alquímica.",
    launchFirstRitual: "Iniciar primer ritual",
    returnToGrimoires: "Volver a los grimorios",
    activeSanctumDesc: "Santuario activo para objetivos de enfoque",
    dailyCycleTitle: "Rutina del ciclo diario",
    dailyCycleDesc: "Traza tus parámetros absolutos de ritmo de estudio día a día.",
    dailyCyclePlaceholder: "p. ej. 05:00 - 07:00 Hechizo profundo (Matemáticas)\n14:00 - 16:00 Práctica alquímica solitaria (Química)\n...",
    arcaneMemosTitle: "Notas arcanas",
    arcaneMemosDesc: "Registra fórmulas, registros de sabiduría y planes de enfoque.",
    arcaneMemosPlaceholder: "Introduce fórmulas o sabidurías aquí...",
    oracleTitle: "Oráculo del Gran Archimago",
    oracleDesc: "IA asesora de estudio enfocado",
    oracleIntro: "¡Escucha, viajero del aprendizaje! Pregúntame.",
    oracleIntroDesc: "Habla de fórmulas, estrategias o de enfoque. Te reconduciré estrictamente si te desvías.",
    oracleLoading: "Consultando tomos antiguos de enfoque...",
    archmageSender: "Archimago alquimista",
    keyVocation: "Vocación clave",
    completed: "Completado",
    deficientEnergyTitle: "Advertencia de energía deficiente",
    calculateEnergies: "Calcular energías",
    changeStudyHours: "Cambiar horas de estudio",
    allocatedFocus: "Enfoque asignado",
    recommendedFocus: "Enfoque recomendado",
    targetHoursNeeded: "Horas objetivo necesarias",
    hoursChapter: "Horas / Capítulo",
    hoursTotal: "Horas totales"
  },
  fr: {
    langTitle: "Sélectionner la Langue Céleste",
    welcome: "Bienvenue à Strode",
    authTitle: "Accéder au Portail de l'Âme",
    username: "Nom de l'Âme / Identifiant",
    passkey: "Clé Alchimique",
    posess: "Éveiller l'Âme Intérieure",
    signup: "Enregistrer un Nouveau Profil d'Âme",
    chooseSoul: "Âmes Découvertes à cette Entrée",
    planetaryIp: "Coordonnée IP d'Entrée Planétaire",
    noDiscoveredSouls: "Aucune autre âme détectée à cette adresse IP.",
    possessedSuccess: "Votre âme physique a possédé avec succès",
    authError: "Code incorrect ou votre âme n'a pas pu être invoquée.",
    statsTitle: "Profil de Temps de Chronos",
    weekPlaceholder: "Heures d'étude quotidiennes en semaine",
    weekendPlaceholder: "Heures d'étude quotidiennes le week-end",
    weekSelect: "Sélectionner les Jours de Week-end",
    next: "Procéder",
    grimoire: "Grimoire",
    routine: "Routine",
    memos: "Notes",
    oracle: "Oracle",
    settings: "Paramètres",
    manage: "Gérer les Âmes",
    back: "Retour",
    banish: "Bannir la Session",
    activeTrans: "Transmutation Active",
    newRitual: "Lancer un Nouveau Rituel d'Étude",
    sanctumTitle: "Sanctuaire du Chapitre",
    seal: "Sceller dans l'Éternité",
    logout: "Bannir la Session",
    storedGrim: "Grimoires Stockés",
    focus: "Concentrer",
    banishRitual: "Bannir",
    modify: "Remodeler",
    energyWarning: "Le flux d'énergie planétaire est déficient. Moins de 3 heures de concentration par chapitre sont allouées. Voulez-vous quand même continuer ?",
    proceedAnyway: "Procéder Alchimiquement",
    readjustDates: "Réajuster les Dates de Chronos",
    chapterPlaceholder: "Renommer l'objectif d'étude...",
    chatPlaceholder: "Parler avec le Grand Archimage Alchimiste...",
    sealSuccess: "Scellé dans les fichiers de grimoire de votre âme.",
    rankInitiate: "Acolyte Initié",
    rankScholar: "Apprenti Sage",
    rankMaster: "Grand Alchimiste",
    studyDaysLabel: "Jours d'étude pour cet objectif :",
    datesLabel: "Dates d'étude actives :",
    festiveAbundant: "est abondant. La concentration bénie est sur vos grimoires.",
    strodiaName: "Strodia (Souveraine Sorcière)",
    strodieName: "Strodie (Grand Invocateur)",
    uploadTitle: "✨ Charger un Parchemin d'Art (GIF/PNG/JPG)",
    customArtLoaded: "Art Personnalisé Chargé",
    removeArt: "Supprimer le Parchemin d'Art ✕",
    uploadDesc: "Téléchargez n'importe quel fichier image ou GIF animé localement. Sinon, Strodia/Strodie utilise leurs vecteurs par défaut.",
    titleLabel: "👑 Mon Titre d'Adresse Honorable",
    titleMaster: "Maître",
    titleMistress: "Maîtresse",
    titleSeeker: "Chercheur",
    backToLang: "Changer de Langue d'Alignement",
    customArtLabel: "🌌 Parchemin d'Art Cosmique (Charger GIF/Image Animés)",
    onboardingDesc: "Sélectionnez votre guide spirituel pour superviser votre concentration, ou proposez un parchemin d'art sacré personnalisé.",
    chooseCompanion: "CHOISISSEZ VOTRE COMPAGNON",
    alignProceed: "Aligner le Compagnon et Procéder",
    webPortalLabel: "Portail d'Alignement du Sanctum",
    initSeals: "Initialisation des Sceaux Sacrés...",
    strodiaVoiceDesc: "Voix Humaine Chaleureuse",
    strodieVoiceDesc: "Voix de Sage Hermétique",
    strodiaBrief: "Une sorcière alchimique récitant de magnifiques sorts d'étude réconfortants.",
    strodieBrief: "Un ancien maître surveillant tes rituels et grimoires de concentration.",
    vesselSettings: "Paramètres du Vaisseau",
    vesselSettingsDesc: "Configure la langue et les structures de Chronos.",
    preferredLang: "Traduction d'Alignement Préférée",
    myCompanion: "Mon Compagnon Spirituel",
    myCompanionDesc: "Choisis ton compagnon magicien préféré ou propose ton propre parchemin d'animation personnalisé.",
    adjustChronosTitle: "Ajuster le profil temporel (Chronos)",
    adjustChronosDesc: "Réajuster les heures quotidiennes de la semaine et du week-end ou les sélections du week-end.",
    adjustChronosBtn: "Ajuster le Profil Chronos",
    manageSoulsDesc: "Possède une identité d'âme parallèle ou s'enregistrer à nouveau sur cette adresse IP.",
    availableSouls: "Âmes Disponibles dans l'Entrée",
    ritualsLabel: "Rituels",
    createdTime: "Créé le :",
    possessingLabel: "Possession",
    possessBtn: "Posséder",
    possessIdentity: "Posséder l'Identité Découverte",
    targetIdentity: "Nom de l'Identité Cible",
    registerAnew: "S'enregistrer à nouveau",
    chooseActiveFocus: "Choisis ton guide de concentration alchimique actif.",
    openSanctum: "🏰 Ouvrir le Sanctum",
    noActiveGrimoires: "Aucun grimoire actif",
    noActiveGrimoiresDesc: "Crée ton plan de routine d'étude initial et suis les étapes des chapitres avec un guide alchimique.",
    launchFirstRitual: "Lancer le premier rituel",
    returnToGrimoires: "Retour aux grimoires",
    activeSanctumDesc: "Sanctum actif pour les objectifs de concentration",
    dailyCycleTitle: "Routine du cycle quotidien",
    dailyCycleDesc: "Planifie tes paramètres absoluts de rythme d'étude au jour le jour.",
    dailyCyclePlaceholder: "ex. 05:00 - 07:00 Travail de sort profond (Maths)\n14:00 - 16:00 Pratique alchimique solitaire (Chimie)\n...",
    arcaneMemosTitle: "Mémos arcanes",
    arcaneMemosDesc: "Enregistre des formules, des leçons de sagesse et des plans de concentration.",
    arcaneMemosPlaceholder: "Saisis tes formules ou tes notes de sagesse ici...",
    oracleTitle: "Oracle du Grand Archimage",
    oracleDesc: "Conseiller d'étude IA",
    oracleIntro: "Écoute, voyageur de l'étude ! Demande-moi.",
    oracleIntroDesc: "Parle-moi de formules, de stratégies de chapitres ou de focus. Je te ramènerai si tu t'écartes.",
    oracleLoading: "Consultation des anciens tomes de focus...",
    archmageSender: "Alchimiste Archimage",
    keyVocation: "Vocation clé",
    completed: "Complété",
    deficientEnergyTitle: "Avertissement d'énergie insuffisante",
    calculateEnergies: "Calculer les énergies",
    changeStudyHours: "Modifier les heures d'étude",
    allocatedFocus: "Focus alloué",
    recommendedFocus: "Focus recommandé",
    targetHoursNeeded: "Heures cibles nécessaires",
    hoursChapter: "Heures / Chapitre",
    hoursTotal: "Total des heures"
  },
  de: {
    langTitle: "Himmlische Sprache wählen",
    welcome: "Willkommen bei Strode",
    authTitle: "Zugriff auf dein Seelenportal",
    username: "Seelenname / Identifikator",
    passkey: "Alchemistisches Passwort",
    posess: "Innere Seele erwecken",
    signup: "Neues Seelenprofil registrieren",
    chooseSoul: "Entdeckte Seelen an diesem Portal",
    planetaryIp: "Planare Ingress IP-Koordinate",
    noDiscoveredSouls: "An dieser IP wurden noch keine anderen Seelen entdeckt.",
    possessedSuccess: "Deine physische Seele hat erfolgreich Besitz ergriffen von",
    authError: "Falsches Passwort oder deine Seele konnte nicht gerufen werden.",
    statsTitle: "Chronos Zeitprofil",
    weekPlaceholder: "Tägliche Lernstunden an Werktagen",
    weekendPlaceholder: "Tägliche Lernstunden am Wochenende",
    weekSelect: "Wochenendtage auswählen",
    next: "Fortfahren",
    grimoire: "Grimoire",
    routine: "Routine",
    memos: "Memos",
    oracle: "Orakel",
    settings: "Einstellungen",
    manage: "Seelen verwalten",
    back: "Zurück",
    banish: "Sitzung beenden",
    activeTrans: "Aktive Transmutation",
    newRitual: "Neues Studienritual starten",
    sanctumTitle: "Kapitelsanktum",
    seal: "In Ewigkeit versiegeln",
    logout: "Sitzung beenden",
    storedGrim: "Gespeicherte Grimoires",
    focus: "Konzentrieren",
    banishRitual: "Verbannen",
    modify: "Überarbeiten",
    energyWarning: "Der planare Energiefluss ist unzureichend. Weniger als 3 Fokusstunden pro Kapitel zugeteilt. Möchtest du dennoch fortfahren?",
    proceedAnyway: "Alchemistisch fortfahren",
    readjustDates: "Chronos-Daten anpassen",
    chapterPlaceholder: "Studienziel umbenennen...",
    chatPlaceholder: "Sprich mit dem Hohen Erzmagier...",
    sealSuccess: "Im Grimoire deiner Seele versiegelt.",
    rankInitiate: "Akolythen-Initiand",
    rankScholar: "Weisenlehrling",
    rankMaster: "Großer Alchemist",
    studyDaysLabel: "Studientage für dieses Ziel:",
    datesLabel: "Aktive Studientermine:",
    festiveAbundant: "ist im Überfluss vorhanden. Gesegnete Konzentration liegt auf deinen Grimoires.",
    strodiaName: "Strodia (Souveräne Zauberin)",
    strodieName: "Strodie (Großer Beschwörer)",
    uploadTitle: "✨ Kunstrolle hochladen (GIF/PNG/JPG)",
    customArtLoaded: "Eigene Kunst geladen",
    removeArt: "Kunstrolle entfernen ✕",
    uploadDesc: "Lade ein lokales Bild oder eine GIF-Animation hoch. Andernfalls werden Strodia/Strodie als Standard-Vektoren angezeigt.",
    titleLabel: "👑 Mein ehrenhafter Titel",
    titleMaster: "Meister",
    titleMistress: "Meisterin",
    titleSeeker: "Suchender",
    backToLang: "Ausrichtungssprache ändern",
    customArtLabel: "🌌 Kosmische Kunstrolle (GIF/Bild hochladen)",
    onboardingDesc: "Wähle deinen spirituellen Begleiter, um deinen Fokus zu überwachen, oder lade ein eigenes Kunstwerk hoch.",
    chooseCompanion: "WÄHLE DEINEN BEGLEITER",
    alignProceed: "Begleiter ausrichten & weiter",
    webPortalLabel: "Sanctum-Ausrichtungsportal",
    initSeals: "Heilige Siegel werden initialisiert...",
    strodiaVoiceDesc: "Warme Menschliche Stimme",
    strodieVoiceDesc: "Hermetische Weisenstimme",
    strodiaBrief: "Eine alchemistische Hexe, die beruhigende Studienzauber spricht.",
    strodieBrief: "Ein alter Meister, der deine Rituale und Grimoires mit traditionellen Formeln überwacht.",
    vesselSettings: "Gefäß-Einstellungen",
    vesselSettingsDesc: "Sprache und Chronos-Strukturen konfigurieren.",
    preferredLang: "Bevorzugte Ausrichtungsübersetzung",
    myCompanion: "Mein spiritueller Begleiter",
    myCompanionDesc: "Wähle deinen bevorzugten Zauberbegleiter oder lade dein eigenes animiertes Kunstwerk hoch.",
    adjustChronosTitle: "Zeitprofil anpassen (Chronos)",
    adjustChronosDesc: "Tägliche Werktags-/Wochenendstunden oder Wochenendauswahl anpassen.",
    adjustChronosBtn: "Chronos-Profil anpassen",
    manageSoulsDesc: "Besitze eine parallele Seelenidentität oder registriere eine neue Seelenidentität auf dieser IP.",
    availableSouls: "Verfügbare Seelen im Portal",
    ritualsLabel: "Rituale",
    createdTime: "Erstellt:",
    possessingLabel: "Besitzend",
    possessBtn: "Besitzen",
    possessIdentity: "Entdeckte Identität besitzen",
    targetIdentity: "Name der Zielidentität",
    registerAnew: "Neu registrieren",
    chooseActiveFocus: "Wähle deinen aktiven alchemistischen Fokusführer.",
    openSanctum: "🏰 Heiligtum öffnen",
    noActiveGrimoires: "Keine aktiven Grimoires",
    noActiveGrimoiresDesc: "Erstelle deinen ersten Studienplan und verfolge Kapitel-Meilensteine mit alchemistischer Anleitung.",
    launchFirstRitual: "Erstes Ritual starten",
    returnToGrimoires: "Zurück zu den Grimoires",
    activeSanctumDesc: "Aktives Heiligtum für Fokusziele",
    dailyCycleTitle: "Täglicher Zyklus-Routine",
    dailyCycleDesc: "Plane deine absoluten täglichen Studienrhythmus-Parameter.",
    dailyCyclePlaceholder: "z.B. 05:00 - 07:00 Tiefes Zauberstudium (Mathe)\n14:00 - 16:00 Alchemistische Praxis (Chemie)\n...",
    arcaneMemosTitle: "Arkane Notizen",
    arcaneMemosDesc: "Halte Formeln, Weisheiten und Fokuspläne fest.",
    arcaneMemosPlaceholder: "Trage hier deine Formeln und Weisheiten ein...",
    oracleTitle: "Großes Erzmagier-Orakel",
    oracleDesc: "Fokussierter Studienberater-KI",
    oracleIntro: "Höre, Studienreisender! Frage mich.",
    oracleIntroDesc: "Sprich über Formeln, Kapitelstrategien oder Fokus. Ich werde dich streng zurückführen, solltest du abschweifen.",
    oracleLoading: "Konsultiere antike Fokus-Schriften...",
    archmageSender: "Erzmagier-Alchemist",
    keyVocation: "Schlüsselberufung",
    completed: "Abgeschlossen",
    deficientEnergyTitle: "Warnung vor unzureichender Energie",
    calculateEnergies: "Energien berechnen",
    changeStudyHours: "Studienstunden ändern",
    allocatedFocus: "Zugeordneter Fokus",
    recommendedFocus: "Empfohlener Fokus",
    targetHoursNeeded: "Zielstunden benötigt",
    hoursChapter: "Stunden / Kapitel",
    hoursTotal: "Stunden insgesamt"
  },
  zh: {
    langTitle: "选择天国语言",
    welcome: "欢迎来到 Strode",
    authTitle: "访问您的灵魂传送门",
    username: "灵魂之名 / 标识符",
    passkey: "炼金术密码",
    posess: "唤醒内在灵魂",
    signup: "注册新灵魂档案",
    chooseSoul: "在当前入口发现的的灵魂",
    planetaryIp: "行星入口 IP 坐标",
    noDiscoveredSouls: "在此 IP 位置尚未检测到其他灵魂。",
    possessedSuccess: "您的肉体灵魂已成功附身于",
    authError: "密码错误或无法召集您的灵魂。",
    statsTitle: "克罗诺斯时间档案",
    weekPlaceholder: "工作日每日学习时间",
    weekendPlaceholder: "周末每日学习时间",
    weekSelect: "选择周末日期",
    next: "继续前进",
    grimoire: "魔法书",
    routine: "常规",
    memos: "备忘录",
    oracle: "神谕",
    settings: "设置",
    manage: "管理灵魂",
    back: "返回",
    banish: "驱逐会话",
    activeTrans: "活跃幻化",
    newRitual: "启动新学习仪式",
    sanctumTitle: "章节圣殿",
    seal: "封存于永恒",
    logout: "驱逐会话",
    storedGrim: "存储的魔法书",
    focus: "变幻专注",
    banishRitual: "驱逐",
    modify: "重塑",
    energyWarning: "行星能量流动不足。每章专注时间少于 3 小时。您仍要继续吗？",
    proceedAnyway: "以炼金术方式继续",
    readjustDates: "重新调整克罗诺斯日期",
    chapterPlaceholder: "重命名学习目标...",
    chatPlaceholder: "与大法师炼金术士交谈...",
    sealSuccess: "已封存在您的灵魂魔法书档案中。",
    rankInitiate: "侍从侍僧",
    rankScholar: "贤者学徒",
    rankMaster: "大炼金术士",
    studyDaysLabel: "此目标的学习天数：",
    datesLabel: "活跃学习日期：",
    festiveAbundant: "非常充沛。神圣的专注目光正落在您的魔法书上。",
    strodiaName: "斯特罗迪亚 (女统治者魔法师)",
    strodieName: "斯特罗迪 (大召唤师)",
    uploadTitle: "✨ 上传艺术画卷 (GIF/PNG/JPG)",
    customArtLoaded: "自定义艺术画卷已加载",
    removeArt: "移除艺术画卷 ✕",
    uploadDesc: "从您的设备上传任何本地图像或动画 GIF 文件。否则，Strodia 和 Strodie 将默认使用手绘矢量图。",
    titleLabel: "👑 我的崇高尊称",
    titleMaster: "大师",
    titleMistress: "女主人",
    titleSeeker: "探索者",
    backToLang: "切换对齐语言",
    customArtLabel: "🌌 宇宙艺术画卷叠加 (上传动画 GIF/图像)",
    onboardingDesc: "选择您的精神指引以监控您的专注，或提供您自己神圣的定制画卷。",
    chooseCompanion: "选择您的伴侣",
    alignProceed: "对齐伴侣并继续",
    webPortalLabel: "圣殿对齐门户",
    initSeals: "正在初始化神圣封印...",
    strodiaVoiceDesc: "温暖温暖的人声",
    strodieVoiceDesc: "神秘贤者的声音",
    strodiaBrief: "一位温和的炼金女巫，说出生动怡人的学习法术。",
    strodieBrief: "一位古老的贤者，监督你的学习仪式并辅助你的注意力。",
    vesselSettings: "法核设置",
    vesselSettingsDesc: "配置语言与克罗诺斯结构。",
    preferredLang: "首选契约语言",
    myCompanion: "我的精神契约伙伴",
    myCompanionDesc: "选择您喜爱的法师伙伴，或提供您自己定制的动态画卷。",
    adjustChronosTitle: "调整时间配置 (克罗诺斯)",
    adjustChronosDesc: "重新调整每日工作日/周末专注时间或周末天数选择。",
    adjustChronosBtn: "调整克罗诺斯档案",
    manageSoulsDesc: "附身于平行灵魂身份，或在此IP地址下注册一个新的灵魂身份。",
    availableSouls: "可用的附身灵魂",
    ritualsLabel: "专注仪式",
    createdTime: "创建于:",
    possessingLabel: "附身中",
    possessBtn: "附身",
    possessIdentity: "附身于已被发现的身份",
    targetIdentity: "目标身份名称",
    registerAnew: "重新注册",
    chooseActiveFocus: "选择你当前活跃的炼金专注向导。",
    openSanctum: "🏰 开启密室",
    noActiveGrimoires: "无活跃的魔导书",
    noActiveGrimoiresDesc: "创建你最初的学习计划，在炼金向导的帮助下清晰地追踪章节里程碑。",
    launchFirstRitual: "启动首次仪式",
    returnToGrimoires: "返回魔导书",
    activeSanctumDesc: "用于集中目标的活跃神殿",
    dailyCycleTitle: "每日循环作息",
    dailyCycleDesc: "规划你绝对的每日学习节律参数。",
    dailyCyclePlaceholder: "例如：05:00 - 07:00 深度专注（数学）\n14:00 - 16:00 独立练金实践（化学）\n...",
    arcaneMemosTitle: "神秘备忘录",
    arcaneMemosDesc: "记录公式、智慧档案与专注计划。",
    arcaneMemosPlaceholder: "在此处输入公式或智慧记录……",
    oracleTitle: "大魔导师神谕",
    oracleDesc: "专注学习助手 AI",
    oracleIntro: "聆听，学习旅人！向我询问吧。",
    oracleIntroDesc: "谈论公式、章节策略或专注。若你偏离轨道，我将严格纠正你。",
    oracleLoading: "正在查阅古老的专注经典……",
    archmageSender: "大魔导炼金士",
    keyVocation: "核心契约",
    completed: "已完成",
    deficientEnergyTitle: "能量不足警告",
    calculateEnergies: "计算能量配比",
    changeStudyHours: "修改学习时长",
    allocatedFocus: "已分配的专注力",
    recommendedFocus: "推荐专注力",
    targetHoursNeeded: "需要的目标总时长",
    hoursChapter: "小时 / 章节",
    hoursTotal: "总计小时数"
  },
  ja: {
    langTitle: "天国の言語を選択",
    welcome: "Strodeへようこそ",
    authTitle: "ソウルポータルへのアクセス",
    username: "ソウル名 / 識別子",
    passkey: "錬金術のパスキー",
    posess: "内なる魂を目覚めさせる",
    signup: "新しい魂のプロフィールを登録",
    chooseSoul: "現在のアクセスで発見された魂",
    planetaryIp: "惑星侵入IP座標",
    noDiscoveredSouls: "このIPアドレスにはまだ他の魂が検出されていません。",
    possessedSuccess: "あなたの肉体の魂は正常に憑依しました：",
    authError: "パスコードが正しくないか、魂を召喚できませんでした。",
    statsTitle: "クロノス時間プロファイル",
    weekPlaceholder: "平日の毎日の学習時間",
    weekendPlaceholder: "週末の毎日の学習時間",
    weekSelect: "週末の曜日を選択",
    next: "進む",
    grimoire: "グリモワール",
    routine: "ルーティン",
    memos: "メモ",
    oracle: "オラクル",
    settings: "設定",
    manage: "ソウル管理",
    back: "戻る",
    banish: "セッション破棄",
    activeTrans: "アクティブな変容",
    newRitual: "新しい学習儀式を開始",
    sanctumTitle: "チャプター聖域",
    seal: "永遠に封印する",
    logout: "セッション破棄",
    storedGrim: "保管されたグリモワール",
    focus: "集中変調",
    banishRitual: "追放",
    modify: "再形成",
    energyWarning: "惑星のエネルギー流量が不足しています。各章の割り当てが3時間未満です。そのまま続行しますか？",
    proceedAnyway: "錬金術的に進む",
    readjustDates: "クロノスの日付を再調整",
    chapterPlaceholder: "学習目標を名前変更...",
    chatPlaceholder: "大魔導師の錬金術師と話す...",
    sealSuccess: "あなたの魂のしおりに封印されました。",
    rankInitiate: "アコライトの徒弟",
    rankScholar: "賢者の見習い",
    rankMaster: "グランド・アルケミスト",
    studyDaysLabel: "この目標の学習日数：",
    datesLabel: "実施する学習日：",
    festiveAbundant: "が満ちています。聖なる集中力があなたのグリモワールに注がれています。",
    strodiaName: "ストロディア (支配的な魔導師)",
    strodieName: "ストロディ (グランドサモナー)",
    uploadTitle: "✨ アートスクロールをアプロード (GIF/PNG/JPG)",
    customArtLoaded: "カスタムアートがロードされました",
    removeArt: "アートスクロールを削除 ✕",
    uploadDesc: "お使いのデバイスからローカル画像またはアニメーションGIFをアップロードします。それ以外の場合、ストロディア/ストロディはデフォルトのベクター図になります。",
    titleLabel: "👑 あなたへの尊称",
    titleMaster: "マスター",
    titleMistress: "ミストレス",
    titleSeeker: "探求者",
    backToLang: "配置言語を切り替え",
    customArtLabel: "🌌 宇宙アートオーバーレイ (アニメーションGIF/画像をアップロード)",
    onboardingDesc: "あなたの集中を監視する精神的ガイドを選択するか、神散なカスタムアートスクロールを提供してください。",
    chooseCompanion: "ガイドの選択",
    alignProceed: "ガイドを配置して進む",
    webPortalLabel: "放置聖域調整ポータル",
    initSeals: "聖なる封印を初期化中...",
    strodiaVoiceDesc: "温かい人間の声",
    strodieVoiceDesc: "神秘的な賢者の声",
    strodiaBrief: "心地よい学習呪文を唱える優しい女性の魔法使い。",
    strodieBrief: "伝統的な集中公式で皆様のグリモワールや学習を監督する賢者。",
    vesselSettings: "器の設定",
    vesselSettingsDesc: "言語とクロノス構造を構成します。",
    preferredLang: "優先アライメント翻訳",
    myCompanion: "私のスピリチュアルコンパニオン",
    myCompanionDesc: "お好みの魔法使いのコンパニオンを選ぶか、独自のカスタムアニメーションスクロールを提供してください。",
    adjustChronosTitle: "時間プロファイルを調整 (クロノス)",
    adjustChronosDesc: "毎日の平日/週末の時間、または週末の選択を再調整します。",
    adjustChronosBtn: "クロノスプロファイルを調整",
    manageSoulsDesc: "このIPアドレスに紐づくパラレルな魂に憑依するか、新しく登録します。",
    availableSouls: "利用可能な魂",
    ritualsLabel: "儀式",
    createdTime: "作成日:",
    possessingLabel: "憑依中",
    possessBtn: "憑依する",
    possessIdentity: "発見された魂に憑依する",
    targetIdentity: "対象の魂の名前",
    registerAnew: "新規登録",
    chooseActiveFocus: "アクティブなアルケミカル集中ガイドを選択してください。",
    openSanctum: "🏰 サンクタムを開く",
    noActiveGrimoires: "アクティブな魔導書はありません",
    noActiveGrimoiresDesc: "最初の学習計画を作成し、アルケミカルなガイダンス機能でチャプターの節目をきれいに記録しましょう。",
    launchFirstRitual: "最初の儀式を開始",
    returnToGrimoires: "魔導書一覧に戻る",
    activeSanctumDesc: "目標達成のためのアクティブなサンクタム",
    dailyCycleTitle: "日々のサイクルルーティン",
    dailyCycleDesc: "日々の学習リズムのパラメータを定義します。",
    dailyCyclePlaceholder: "例：05:00 - 07:00 集中呪文（数学）\n14:00 - 16:00 孤高の錬金術（化学）\n...",
    arcaneMemosTitle: "神秘のメモ",
    arcaneMemosDesc: "数式、知恵の記録、集中計画などを記録します。",
    arcaneMemosPlaceholder: "ここに公式や知恵の記録を入力してください...",
    oracleTitle: "大魔導師の神託",
    oracleDesc: "学習特化型アドバイザーAI",
    oracleIntro: "よお、学びの旅人よ！何でも聞いてくれ。",
    oracleIntroDesc: "数式、チャプター戦略、集中について話してください。逸れそうになったら厳しく引き戻します。",
    oracleLoading: "古代の集中魔導書を読み解いています...",
    archmageSender: "大魔導師の錬金術師",
    keyVocation: "コア天職",
    completed: "完了",
    deficientEnergyTitle: "不足エネルギー警告",
    calculateEnergies: "エネルギーを算出",
    changeStudyHours: "学習時間を変更",
    allocatedFocus: "割り当てられた集中時間",
    recommendedFocus: "推奨される集中時間",
    targetHoursNeeded: "目標とする総時間",
    hoursChapter: "時間 / 章",
    hoursTotal: "合計時間"
  },
  ru: {
    langTitle: "Выберите Небесный Язык",
    welcome: "Добро пожаловать в Strode",
    authTitle: "Доступ к Порталу Души",
    username: "Имя Души / Идентификатор",
    passkey: "Алхимический Пароль",
    posess: "Пробудить Внутреннюю Душу",
    signup: "Зарегистрировать Новый Профиль Души",
    chooseSoul: "Души, обнаруженные на этом входе",
    planetaryIp: "IP-Координаты Планетарного Входа",
    noDiscoveredSouls: "Других душ на этом IP не обнаружено.",
    possessedSuccess: "Ваша физическая душа успешно вселилась в",
    authError: "Неверный пароль, или вашу душу не удалось призвать.",
    statsTitle: "Хронос-Профиль Времени",
    weekPlaceholder: "Будние дни - часы учебы",
    weekendPlaceholder: "Выходные дни - часы учебы",
    weekSelect: "Выбрать Выходные Дни",
    next: "Продолжить",
    grimoire: "Гримуар",
    routine: "Рутина",
    memos: "Заметки",
    oracle: "Оракул",
    settings: "Настройки",
    manage: "Управление Душами",
    back: "Назад",
    banish: "Завершить Сессию",
    activeTrans: "Активная Трансмутация",
    newRitual: "Запустить Новый Ритуал Учебы",
    sanctumTitle: "Святилище Главы",
    seal: "Запечатать в Вечности",
    logout: "Завершить Сессию",
    storedGrim: "Сохраненные Гримуары",
    focus: "Трансмутировать Фокус",
    banishRitual: "Изгнать",
    modify: "Изменить",
    energyWarning: "Планетарный поток энергии дефицитен. На главу выделено менее 3 часов фокуса. Желаете продолжить?",
    proceedAnyway: "Продолжить Алхимически",
    readjustDates: "Скорректировать Даты Хроноса",
    chapterPlaceholder: "Переименовать цель обучения...",
    chatPlaceholder: "Поговорить с Великим Архимагом Алхимиком...",
    sealSuccess: "Запечатано в гримуарах вашей души.",
    rankInitiate: "Послушник Посвященный",
    rankScholar: "Ученик Мудреца",
    rankMaster: "Великий Алхимик",
    studyDaysLabel: "Дни учебы для этой цели:",
    datesLabel: "Активные даты обучения:",
    festiveAbundant: "в избытке. Благословенное внимание обращено на ваши гримуары.",
    strodiaName: "Стродия (Суверенная Волшебница)",
    strodieName: "Строди (Великий Призыватель)",
    uploadTitle: "✨ Загрузить свиток искусства (GIF/PNG/JPG)",
    customArtLoaded: "Пользовательское искусство загружено",
    removeArt: "Удалить свиток искусства ✕",
    uploadDesc: "Загрузите любое локальное изображение или анимированный GIF с устройства. Иначе Стродия/Строди будут отображаться по умолчанию.",
    titleLabel: "👑 Мое Почетное Обращение",
    titleMaster: "Мастер",
    titleMistress: "Госпожа",
    titleSeeker: "Искатель",
    backToLang: "Изменить Язык Выравнивания",
    customArtLabel: "🌌 Космический Свиток Искусства (Загрузить анимированный GIF/Рисунок)",
    onboardingDesc: "Выберите своего духовного проводника для контроля внимания или загрузите священный свиток искусства.",
    chooseCompanion: "ВЫБЕРИТЕ СВОЕГО СПУТНИКА",
    alignProceed: "Настроить Спутника и Продолжить",
    webPortalLabel: "Портал Настройки Святилища",
    initSeals: "Инициализация священных печатей...",
    strodiaVoiceDesc: "Теплый Человеческий Голос",
    strodieVoiceDesc: "Голос Герметического Мудреца",
    strodiaBrief: "Теплая алхимическая волшебница, нашептывающая красивые учебные заклинания.",
    strodieBrief: "Древний мастер, контролирующий ваши учебные ритуалы традиционными формулами.",
    vesselSettings: "Настройки Сосуда",
    vesselSettingsDesc: "Настройте язык и структуры Хроноса.",
    preferredLang: "Предпочтительный перевод выравнивания",
    myCompanion: "Мой духовный спутник",
    myCompanionDesc: "Выберите своего преданного спутника или предоставьте собственный свиток с анимацией.",
    adjustChronosTitle: "Настроить временной профиль (Хронос)",
    adjustChronosDesc: "Скорректируйте ежедневные часы в будни/выходные или выбранные выходные дни.",
    adjustChronosBtn: "Изменить профиль Хроноса",
    manageSoulsDesc: "Овладейте параллельной личностью или зарегистрируйте новую на этом IP-адресе.",
    availableSouls: "Доступные души в портале",
    ritualsLabel: "Ритуалы",
    createdTime: "Создан:",
    possessingLabel: "Овладение",
    possessBtn: "Овладеть",
    possessIdentity: "Овладеть обнаруженной личностью",
    targetIdentity: "Имя целевой личности",
    registerAnew: "Зарегистрировать заново",
    chooseActiveFocus: "Выберите своего активного алхимического наставника фокусировки.",
    openSanctum: "🏰 Открыть Санктум",
    noActiveGrimoires: "Нет активных гримуаров",
    noActiveGrimoiresDesc: "Создайте свой первоначальный план учебы и отслеживайте вехи глав с алхимическим руководством.",
    launchFirstRitual: "Запустить первый ритуал",
    returnToGrimoires: "Вернуться к гримуарам",
    activeSanctumDesc: "Активный санктум для целей фокусировки",
    dailyCycleTitle: "Ежедневная учебная рутина",
    dailyCycleDesc: "Настройте свои повседневные параметры ритма обучения.",
    dailyCyclePlaceholder: "например, 05:00 - 07:00 Глубокая фокусировка (Математика)\n14:00 - 16:00 Одиночная алхимия (Химия)\n...",
    arcaneMemosTitle: "Арканные заметки",
    arcaneMemosDesc: "Записывайте формулы, мудрые мысли и планы фокусировки.",
    arcaneMemosPlaceholder: "Введите формулы или заметки здесь...",
    oracleTitle: "Оракул Великого Архимага",
    oracleDesc: "ИИ-консультант по направленной учебе",
    oracleIntro: "Внемли, путник знаний! Спроси меня.",
    oracleIntroDesc: "Говори о формулах, стратегиях глав или фокусе. Я строго верну тебя, если начнешь отвлекаться.",
    oracleLoading: "Консультируюсь с древними томами фокусировки...",
    archmageSender: "Архимаг-алхимик",
    keyVocation: "Ключевое призвание",
    completed: "Завершено",
    deficientEnergyTitle: "Предупреждение о дефиците энергии",
    calculateEnergies: "Вычислить энергетику",
    changeStudyHours: "Изменить учебные часы",
    allocatedFocus: "Выделенный фокус",
    recommendedFocus: "Рекомендуемый фокус",
    targetHoursNeeded: "Необходимые целевые часы",
    hoursChapter: "Часов / Глава",
    hoursTotal: "Всего часов"
  },
  ar: {
    langTitle: "اختر اللغة السماوية",
    welcome: "مرحبًا بك في سترود",
    authTitle: "الوصول إلى بوابة روحك",
    username: "اسم الروح / المعرّف",
    passkey: "رمز المرور الخيميائي",
    posess: "إيقاظ الروح الداخلية",
    signup: "تسجيل ملف روح جديد",
    chooseSoul: "النفوس المكتشفة في هذا الإدخال",
    planetaryIp: "إحداثيات بروتوكول الإنترنت للدخول",
    noDiscoveredSouls: "لم يتم اكتشاف نفوس أخرى في هذا الموقع.",
    possessedSuccess: "تم السيطرة بنجاح بواسطة روحك على",
    authError: "الرمز غير صحيح أو لم نتمكن من استدعاء روحك.",
    statsTitle: "ملف وقت كرونوس",
    weekPlaceholder: "ساعات الدراسة اليومية في أيام الأسبوع",
    weekendPlaceholder: "ساعات الدراسة اليومية في عطلة نهاية الأسبوع",
    weekSelect: "اختر أيام عطلة نهاية الأسبوع",
    next: "المتابعة للأمام",
    grimoire: "مخطوطة السحر",
    routine: "الروتين",
    memos: "المذكرات",
    oracle: "العراف الأمين",
    settings: "الإعدادات",
    manage: "إدارة النفوس",
    back: "رجوع",
    banish: "إنهاء الجلسة",
    activeTrans: "التحول النشط",
    newRitual: "بدء طقس دراسي جديد",
    sanctumTitle: "محراب الفصل الدراسي",
    seal: "الختم في الأبدية",
    logout: "إنهاء الجلسة",
    storedGrim: "مخطوطات السحر المحفوظة",
    focus: "تحويل التركيز",
    banishRitual: "إلغاء",
    modify: "إعادة التشكيل",
    energyWarning: "تدفق الطاقة الكوكبية غير كافٍ. تم تخصيص أقل من 3 ساعات لكل فصل. هل ترغب في المتابعة على أي حال؟",
    proceedAnyway: "المتابعة خيميائيًا",
    readjustDates: "إعادة ضبط تواريخ كرونوس",
    chapterPlaceholder: "إعادة تسمية هدف الدراسة...",
    chatPlaceholder: "تحدث مع كبير السحرة الخيميائي...",
    sealSuccess: "تم الختم في ملفات مخطوطات روحك.",
    rankInitiate: "مبتدئ مخلص",
    rankScholar: "مساعد حكيم",
    rankMaster: "الخيميائي العظيم",
    studyDaysLabel: "أيام الدراسة لهذا الهدف:",
    datesLabel: "تواريخ الدراسة النشطة:",
    festiveAbundant: "غزير ومبارك. التركيز المبارك ينصب على مخطوطاتك.",
    strodiaName: "ستروديا (الساحرة الحاكمة)",
    strodieName: "سترودي (المستدعي العظيم)",
    uploadTitle: "✨ رفع لفافة فنية (GIF/PNG/JPG)",
    customArtLoaded: "تم تحميل الفن المخصص",
    removeArt: "إزالة اللفافة الفنية ✕",
    uploadDesc: "قم برفع أي صورة محلية أو ملف GIF متحرك من جهازك، وإلا سيتم عرض الأشكال الافتراضية لستروديا وسترودي.",
    titleLabel: "👑 لقب خطابي الموقر",
    titleMaster: "سيدي",
    titleMistress: "سيدتي",
    titleSeeker: "الباحث النبيل",
    backToLang: "تغيير لغة المحاذاة",
    customArtLabel: "🌌 لفافة الفن الكوني (رفع GIF أو صورة متحركة)",
    onboardingDesc: "اختر مرشدك الروحي لمراقبة تركيزك أو قم برفع لفافة فنية مخصصة ومقدسة.",
    chooseCompanion: "اختر رفيقك الروحي",
    alignProceed: "محاذاة الرفيق والمتابعة",
    webPortalLabel: "بوابة محاذاة المحراب",
    initSeals: "بدء تفعيل الأختام المقدسة...",
    strodiaVoiceDesc: "صوت بشري دافئ",
    strodieVoiceDesc: "صوت حكيم هرمسي",
    strodiaBrief: "ساحرة خيميائية ودودة تتلو تعاويذ دراسية جميلة ومريحة.",
    strodieBrief: "حكيم قديم يشرف على طقوسك ومخطوطاتك بصيغ التركيز التقليدية.",
    vesselSettings: "إعدادات الوعاء",
    vesselSettingsDesc: "تهيئة اللغة وهياكل كرونوس.",
    preferredLang: "ترجمة المحاذاة المفضلة",
    myCompanion: "مرافقي الروحي",
    myCompanionDesc: "اختر رفيقك الساحر المفضل أو قدم لفافة رسوم متحركة مخصصة لك.",
    adjustChronosTitle: "ضبط الملف الكوكبي للوقت (كرونوس)",
    adjustChronosDesc: "إعادة ضبط الساعات اليومية لأيام الأسبوع/عطلة نهاية الأسبوع أو خيارات نهاية الأسبوع.",
    adjustChronosBtn: "تعديل ملف كرونوس",
    manageSoulsDesc: "قم بالاستحواذ على هوية روح موازية أو تسجيل هوية جديدة مجمعة على عنوان IP هذا.",
    availableSouls: "النفوس المتاحة في المدخل",
    ritualsLabel: "الطقوس",
    createdTime: "تاريخ الإنشاء:",
    possessingLabel: "الاستحواذ",
    possessBtn: "استحواذ",
    possessIdentity: "الاستحواذ على الهوية المكتشفة",
    targetIdentity: "اسم الهوية المستهدفة",
    registerAnew: "سجل من جديد",
    chooseActiveFocus: "اختر دليل التركيز الخيميائي النشط الخاص بك.",
    openSanctum: "🏰 افتح المحراب",
    noActiveGrimoires: "لا توجد مخطوطات نشطة",
    noActiveGrimoiresDesc: "أنشئ خطتك الدراسية الروتينية الأولى وتتبع إنجازات الفصول بوضوح تام تحت إشراف الدليل الخيميائي.",
    launchFirstRitual: "بدء الطقس الدراسي الأول",
    returnToGrimoires: "العودة للمخطوطات",
    activeSanctumDesc: "محراب نشط لأهداف التركيز",
    dailyCycleTitle: "الروتين اليومي",
    dailyCycleDesc: "حدد ملامح وخطوات جدول دراستك اليومي.",
    dailyCyclePlaceholder: "مثال: 05:00 - 07:00 دراسة عميقة (رياضيات)\n14:00 - 16:00 تدريب خيميائي منفرد (كيمياء)\n...",
    arcaneMemosTitle: "المذكرات الغامضة",
    arcaneMemosDesc: "سجل الصيغ، ومذكرات الحكمة، وخطط التركيز الخاصة بك.",
    arcaneMemosPlaceholder: "أدخل الصيغ أو مذكرات الحكمة هنا...",
    oracleTitle: "عراف كبير السحرة العظيم",
    oracleDesc: "مستشار دراسي ذكي",
    oracleIntro: "أهلاً بك يا مسافر المعرفة! سلني ما تشاء.",
    oracleIntroDesc: "تكلم عن الصيغ، أو استراتيجيات الفصول، أو التركيز. وسأعيدك للمسار إذا انحرفت.",
    oracleLoading: "البحث في المجلدات القديمة للتركيز...",
    archmageSender: "الخيميائي كبير السحرة",
    keyVocation: "المهنة الأساسية",
    completed: "مكتمل",
    deficientEnergyTitle: "تحذير من ضعف تدفق الطاقة",
    calculateEnergies: "حساب تدفق الطاقة",
    changeStudyHours: "تعديل ساعات الدراسة",
    allocatedFocus: "التركيز المخصص",
    recommendedFocus: "التركيز الموصى به",
    targetHoursNeeded: "ساعات التركيز المستهدفة المطلوبة",
    hoursChapter: "ساعات / فصل",
    hoursTotal: "إجمالي الساعات"
  }
};

export default function App() {
  // Locale State
  const [lang, setLang] = useState<string>("en");

  // Onboarding / Wizard Screen Control
  const [step, setStep] = useState<"lang" | "wizard-select" | "auth" | "stats" | "ritual-1" | "ritual-2" | "ritual-3" | "warning" | "app">("wizard-select");
  
  // Wizard Customizations
  const [wizardGender, setWizardGender] = useState<"male" | "female">(() => {
    return (localStorage.getItem("strode_wizard_gender") as "male" | "female") || "male";
  });
  const [userTitle, setUserTitle] = useState<"master" | "mistress" | "noble seeker">(() => {
    return (localStorage.getItem("strode_user_title") as "master" | "mistress" | "noble seeker") || "noble seeker";
  });
  const [customWizardUrl, setCustomWizardUrl] = useState<string>(() => {
    return localStorage.getItem("strode_custom_wizard_url") || "";
  });
  
  // Current active Session State
  const [appLoading, setAppLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const [currentUser, setCurrentUser] = useState<string>("");
  const [passcode, setPasscode] = useState<string>("");
  const [clientIp, setClientIp] = useState<string>("127.0.0.1");
  const [discoveredSouls, setDiscoveredSouls] = useState<SoulProfile[]>([]);
  
  // Soul State values
  const [plans, setPlans] = useState<Ritual[]>([]);
  const [routine, setRoutine] = useState<string>("");
  const [memos, setMemos] = useState<string>("");
  const [weekdayH, setWeekdayH] = useState<number>(4);
  const [weekendH, setWeekendH] = useState<number>(8);
  const [weekends, setWeekends] = useState<number[]>([0, 6]); // Sun, Sat
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Ritual Creator State
  const [wizardMode, setWizardMode] = useState<"weekdays" | "dates">("weekdays");
  const [wizTitle, setWizTitle] = useState<string>("");
  const [wizGoal, setWizGoal] = useState<string>("Olympiad");
  const [wizChapters, setWizChapters] = useState<number>(10);
  const [wizStart, setWizStart] = useState<string>("");
  const [wizEnd, setWizEnd] = useState<string>("");
  const [wizStudyDays, setWizStudyDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [wizSpecificDates, setWizSpecificDates] = useState<string[]>([]);
  const [calculatedHoursPerCh, setCalculatedHoursPerCh] = useState<string>("0");
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const [deletePlanIndex, setDeletePlanIndex] = useState<number | null>(null);
  const [showSocialChooser, setShowSocialChooser] = useState<"google" | "microsoft" | null>(null);
  const [linkedSubIds, setLinkedSubIds] = useState<string[]>(["acolyte.tome", "archmage.olympiad"]);

  // Application Tabs Control
  const [activeTab, setActiveTab] = useState<"plans" | "routine" | "memos" | "oracle" | "settings" | "accounts">("plans");
  const [showSanctumIndex, setShowSanctumIndex] = useState<number | null>(null);

  // Oracle AI Companion Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Planetary Festive energy state
  const [activeFestival, setActiveFestival] = useState<{ localName: string; description: string } | null>(null);

  // Helper dictionary lookup
  const t = (key: string) => {
    return LOCAL_I18N[lang]?.[key] || LOCAL_I18N["en"]?.[key] || key;
  };

  // Fetch discoverable souls on mount/reload
  const fetchSoulsOnIp = async () => {
    try {
      const res = await fetch("/api/souls");
      if (res.ok) {
        const data = await res.json();
        setClientIp(data.ip || "127.0.0.1");
        setDiscoveredSouls(data.souls || []);
      }
    } catch (err) {
      console.warn("Unable to fetch souls or local coordinates", err);
    }
  };

  // Fetch planetary holiday
  const lookupFestivalEnergy = async () => {
    try {
      const res = await fetch("/api/festivals?country=IN");
      if (res.ok) {
        const data = await res.json();
        const todayStr = new Date().toISOString().split("T")[0];
        const match = data.holidays?.find((h: any) => h.date === todayStr);
        if (match) {
          setActiveFestival({
            localName: match.localName,
            description: match.name || "A sacred holiday alignment."
          });
        }
      }
    } catch (e) {
      console.warn("Could not retrieve festival alignment", e);
    }
  };

  useEffect(() => {
    fetchSoulsOnIp();
    lookupFestivalEnergy();
    
    // Check local session
    const cachedSoulUser = localStorage.getItem("strode_user");
    const cachedSoulPass = localStorage.getItem("strode_passkey");
    const cachedLang = localStorage.getItem("strode_lang");
    if (cachedLang) setLang(cachedLang);

    if (cachedSoulUser && cachedSoulPass) {
      // Automatic possession of previously activated local session
      autoLogin(cachedSoulUser, cachedSoulPass);
    }
  }, []);

  // Post changes helper to synchronize server state
  const syncSoulState = async (updates: {
    plans?: Ritual[];
    routine?: string;
    memos?: string;
    weekdayH?: number;
    weekendH?: number;
    weekends?: number[];
    activeIndex?: number;
    lang?: string;
  }) => {
    if (!currentUser || !passcode) return;
    try {
      await fetch("/api/souls/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser,
          pass: passcode,
          state: updates
        })
      });
    } catch (e) {
      console.error("Planetary cloud sync connection interrupted", e);
    }
  };

  const autoLogin = async (user: string, pass: string) => {
    try {
      const res = await fetch("/api/souls/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, pass, action: "login" })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.username);
        setPasscode(pass);
        applyLoadedState(data.soul);
        setStep("app");
      }
    } catch (e) {
      console.error("Possession failed", e);
    }
  };

  const applyLoadedState = (soul: any) => {
    setPlans(soul.plans || []);
    setRoutine(soul.routine || "");
    setMemos(soul.memos || "");
    setWeekdayH(soul.weekdayH ?? 4);
    setWeekendH(soul.weekendH ?? 8);
    setWeekends(soul.weekends || [0, 6]);
    setActiveIndex(soul.activeIndex ?? 0);
    if (soul.lang) setLang(soul.lang);
  };

  const handleAuth = async (action: "login" | "signup", targetUser?: string) => {
    const nameToUse = targetUser || currentUser;
    if (!nameToUse.trim() || !passcode.trim()) {
      alert("Introduce thy identification name and passkey coordinates.");
      return;
    }

    try {
      const res = await fetch("/api/souls/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: nameToUse,
          pass: passcode,
          action
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || t("authError"));
        return;
      }

      setCurrentUser(data.username);
      localStorage.setItem("strode_user", data.username);
      localStorage.setItem("strode_passkey", passcode);

      if (action === "signup") {
        setStep("stats");
      } else {
        applyLoadedState(data.soul);
        if (!data.soul.weekdayH) {
          setStep("stats");
        } else {
          setStep("app");
        }
      }
      fetchSoulsOnIp();
    } catch (error) {
      alert(t("authError"));
    }
  };

  const handleSoulPossessionClick = (profile: SoulProfile) => {
    setCurrentUser(profile.username);
    // Focus the passcode input to make user input intuitive
    const input = document.getElementById("alchemical-pass-input");
    if (input) input.focus();
  };

  const handleLangSelect = (selectedLang: string) => {
    setLang(selectedLang);
    localStorage.setItem("strode_lang", selectedLang);
    setStep("auth");
  };

  const saveStatsProfile = async () => {
    setStep(plans.length === 0 ? "ritual-1" : "app");
    const updates = { weekdayH, weekendH, weekends, lang };
    await syncSoulState(updates);
  };

  // Launch Ritual Wizards
  const openRitualWizard = (index: number | null = null) => {
    if (index !== null) {
      const p = plans[index];
      setEditingPlanIndex(index);
      setWizTitle(p.title);
      setWizGoal(p.goal);
      setWizChapters(p.chapters);
      setWizStart(p.start);
      setWizEnd(p.end);
      setWizardMode(p.mode || "weekdays");
      setWizStudyDays(p.studyDays || [1, 2, 3, 4, 5]);
      setWizSpecificDates(p.specificDates || []);
    } else {
      setEditingPlanIndex(null);
      setWizTitle("");
      setWizGoal("Olympiad");
      setWizChapters(10);
      setWizStart(new Date().toISOString().split("T")[0]);
      
      // Default end date is 1 month from now
      const defaultEnd = new Date();
      defaultEnd.setMonth(defaultEnd.getMonth() + 1);
      setWizEnd(defaultEnd.toISOString().split("T")[0]);
      
      setWizardMode("weekdays");
      setWizStudyDays([1, 2, 3, 4, 5]);
      setWizSpecificDates([]);
    }
    setStep("ritual-1");
  };

  const validateRitualR1 = () => {
    if (!wizTitle.trim()) {
      alert("Name thy spiritual study plan.");
      return;
    }
    setStep("ritual-2");
  };

  const calculateHoursFocus = () => {
    if (!wizStart || !wizEnd) {
      alert("Determine both boundaries of thy Chronos spectrum.");
      return;
    }

    let totalHours = 0;
    const startObj = new Date(wizStart);
    const endObj = new Date(wizEnd);

    if (startObj > endObj) {
      alert("Start date must be situated before the end date.");
      return;
    }

    if (wizardMode === "weekdays") {
      for (let d = new Date(startObj); d <= endObj; d.setDate(d.getDate() + 1)) {
        const dayIdx = d.getDay();
        if (wizStudyDays.includes(dayIdx)) {
          totalHours += weekends.includes(dayIdx) ? weekendH : weekdayH;
        }
      }
    } else {
      // In specific dates mode, calculate and filter dates within range
      const activeDates = wizSpecificDates.filter(dStr => {
        const cur = new Date(dStr);
        return cur >= startObj && cur <= endObj;
      });
      activeDates.forEach(dStr => {
        const cur = new Date(dStr);
        totalHours += weekends.includes(cur.getDay()) ? weekendH : weekdayH;
      });
    }

    const value = (totalHours / wizChapters).toFixed(1);
    setCalculatedHoursPerCh(value);

    if (parseFloat(value) < 3.0) {
      setStep("warning");
    } else {
      executeCommitRitual(value);
    }
  };

  const executeCommitRitual = async (hoursVal: string = calculatedHoursPerCh) => {
    const finalChaptersList = Array.from({ length: wizChapters }, (_, i) => ({
      title: `Chapter ${i + 1}`,
      done: false
    }));

    const newRitual: Ritual = {
      title: wizTitle,
      goal: wizGoal,
      chapters: wizChapters,
      start: wizStart,
      end: wizEnd,
      mode: wizardMode,
      studyDays: wizStudyDays,
      specificDates: wizSpecificDates,
      hoursPerChapter: hoursVal,
      chapterList: finalChaptersList
    };

    let updatedPlans = [...plans];
    if (editingPlanIndex !== null) {
      // Carry over check statuses from previous if edits
      const oldPlan = plans[editingPlanIndex];
      const mergedList = finalChaptersList.map((ch, idx) => {
        if (oldPlan.chapterList[idx]) {
          return { ...ch, title: oldPlan.chapterList[idx].title, done: oldPlan.chapterList[idx].done };
        }
        return ch;
      });
      newRitual.chapterList = mergedList;
      updatedPlans[editingPlanIndex] = newRitual;
    } else {
      updatedPlans.push(newRitual);
    }

    setPlans(updatedPlans);
    const newActiveIndex = editingPlanIndex !== null ? activeIndex : updatedPlans.length - 1;
    setActiveIndex(newActiveIndex);
    setStep("app");
    
    await syncSoulState({
      plans: updatedPlans,
      activeIndex: newActiveIndex
    });
  };

  // Switch/Possess Active Plan Focus
  const changeActiveFocus = async (index: number) => {
    setActiveIndex(index);
    await syncSoulState({ activeIndex: index });
  };

  const banishRitualPlan = (index: number) => {
    setDeletePlanIndex(index);
  };

  const executeBanishmentSpell = async () => {
    if (deletePlanIndex === null) return;
    const index = deletePlanIndex;
    const updated = plans.filter((_, i) => i !== index);
    setPlans(updated);
    const nextActive = Math.max(0, index - 1);
    setActiveIndex(nextActive);
    setDeletePlanIndex(null);
    await syncSoulState({ plans: updated, activeIndex: nextActive });
  };

  // Rename and trigger check updates within Sanctum
  const toggleChapterStatus = async (planIdx: number, chIdx: number) => {
    const updated = [...plans];
    updated[planIdx].chapterList[chIdx].done = !updated[planIdx].chapterList[chIdx].done;
    setPlans(updated);
    await syncSoulState({ plans: updated });
  };

  const renameChapterTitle = async (planIdx: number, chIdx: number, name: string) => {
    const updated = [...plans];
    updated[planIdx].chapterList[chIdx].title = name;
    setPlans(updated);
    await syncSoulState({ plans: updated });
  };

  // Sync routine & memos
  const handleStaticSave = async (category: "routine" | "memos") => {
    if (category === "routine") {
      await syncSoulState({ routine });
    } else {
      await syncSoulState({ memos });
    }
    alert(t("sealSuccess"));
  };

  // Banish entire session logout
  const handleBanishSession = () => {
    localStorage.removeItem("strode_user");
    localStorage.removeItem("strode_passkey");
    setCurrentUser("");
    setPasscode("");
    setPlans([]);
    setRoutine("");
    setMemos("");
    setStep("wizard-select");
  };

  // Oracle Strict AI Chat Action
  const sendAlchemistBotOracleMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: chatInput,
      id: Math.random().toString()
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const activePlan = plans[activeIndex];
      const res = await fetch("/api/alchemist-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userProfile: {
            username: currentUser,
            lang: lang,
            activePlan: activePlan ? {
              title: activePlan.title,
              goal: activePlan.goal,
              chapters: activePlan.chapters
            } : null
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          role: "assistant",
          content: data.response,
          id: Math.random().toString()
        };
        setChatMessages([...updatedMessages, aiMsg]);
      } else {
        const data = await res.json();
        alert(data.error || "The Archmage's mystical focus link was severed.");
      }
    } catch (e) {
      console.error("AI oracle connection cut", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Autoscroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiLoading]);

  // Handle study specific date creation on dates mode
  const handleToggleSpecificDate = (dateStr: string) => {
    if (wizSpecificDates.includes(dateStr)) {
      setWizSpecificDates(wizSpecificDates.filter(d => d !== dateStr));
    } else {
      setWizSpecificDates([...wizSpecificDates, dateStr]);
    }
  };

  // Generate date fields for Dates study option
  const renderDatesWizardRange = () => {
    if (!wizStart || !wizEnd) return <p className="text-sm text-gray-500 italic">Configure start & end Chronos points first...</p>;
    const items = [];
    const curr = new Date(wizStart);
    const endLimit = new Date(wizEnd);
    let protection = 0;

    while (curr <= endLimit && protection < 60) {
      const dStr = curr.toISOString().split("T")[0];
      const formattedDate = curr.toLocaleDateString(lang, { weekday: 'short', month: 'short', day: 'numeric' });
      items.push(
        <label key={dStr} className="flex items-center gap-3 p-2 bg-purple-950/25 border border-purple-900/40 rounded hover:bg-purple-900/30 transition cursor-pointer">
          <input 
            type="checkbox" 
            checked={wizSpecificDates.length === 0 || wizSpecificDates.includes(dStr)}
            onChange={() => handleToggleSpecificDate(dStr)}
            className="w-4 h-4 rounded border-purple-500 text-gold-leaf focus:ring-mystic-purple"
          />
          <span className="text-sm text-gray-300 font-mono">{formattedDate}</span>
        </label>
      );
      curr.setDate(curr.getDate() + 1);
      protection++;
    }

    return (
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
        {items}
      </div>
    );
  };

  // Calculate ranks
  const calculateCurrentAlchemistRank = () => {
    if (plans.length === 0) return t("rankInitiate");
    let totalCh = 0;
    let completedCh = 0;
    plans.forEach(p => {
      totalCh += p.chapterList.length;
      completedCh += p.chapterList.filter(c => c.done).length;
    });

    if (completedCh === 0) return t("rankInitiate");
    const ratio = completedCh / totalCh;
    if (ratio > 0.7) return t("rankMaster");
    return t("rankScholar");
  };

  return (
    <div className={`min-h-screen bg-neutral-950 text-neutral-200 selection:bg-gold-leaf selection:text-neutral-900 relative overflow-hidden flex flex-col ${activeFestival ? "border-t-[6px] border-gold-leaf" : ""}`}>
      {/* Loading Cover Page */}
      <AnimatePresence>
        {appLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 bg-neutral-950 z-[9999] flex flex-col items-center justify-center p-6 text-center select-none"
          >
            {/* Glowing auroral portal frame background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-900/15 filter blur-3xl animate-pulse" />
            <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-amber-500/5 filter blur-3xl" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative max-w-sm w-full mx-auto"
            >
              {/* Outer spell spinner */}
              <div className="relative mx-auto w-28 h-28 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-900/60 animate-[spin_12s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-gold-leaf/30 animate-[spin_6s_linear_infinite_reverse]" />
                <motion.img 
                  src="/logo.png" 
                  alt="Strode Logo" 
                  className="w-16 h-16 object-contain z-10 filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback visual
                    (e.target as any).src = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120&auto=format&fit=crop";
                  }}
                />
              </div>

              <h2 className="font-magic text-xl text-white tracking-widest uppercase mb-1">
                Strode Alchemist
              </h2>
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold-leaf/60 to-transparent mx-auto mb-4" />
              <p className="text-[11px] text-gray-500 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-gold-leaf animate-ping" />
                Initializing Sacred Seals...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mystical Background Stars overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(40,0,70,0.45)_0%,rgba(5,5,10,1)_100%)] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-950/20 rounded-full blur-3xl pointer-events-none z-0 spin-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-950/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Dynamic Festivity Energy Banner Overlay */}
      {activeFestival && (
        <div className="bg-gradient-to-r from-yellow-600/20 via-gold-leaf/45 to-yellow-600/20 border-b border-gold-leaf/50 text-neutral-100 py-3.5 px-6 shadow-[0_4px_30px_rgba(211,175,55,0.15)] relative z-50 overflow-hidden shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-gold-leaf scroll-smooth animate-pulse" size={20} />
              <p className="text-sm font-magic tracking-wider uppercase">
                {lang === "hi" ? "✨ ब्रह्मांडीय उत्सव संयोग:" : "✨ Cosmic Festive Alignment:"} <span className="font-bold text-white underline decoration-gold-leaf">{activeFestival.localName}</span> {t("festiveAbundant")}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 font-mono text-xs text-yellow-300">
              <Flame size={14} className="animate-bounce" />
              <span>{activeFestival.description}</span>
            </div>
          </div>
        </div>
      )}

      {/* Screen 1: Language Picker */}
      {step === "lang" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border-2 border-purple-950/80 rounded-2xl p-8 max-w-md w-full shadow-[0_15px_50px_rgba(30,5,50,0.5)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-800 via-gold-leaf to-purple-800" />
            
            <button 
              onClick={() => setStep("wizard-select")}
              className="absolute top-4 left-4 text-[10px] font-mono text-purple-400 hover:text-white flex items-center gap-1 bg-purple-950/30 px-2 py-1 rounded border border-purple-900/50 cursor-pointer"
            >
              <ArrowLeft size={10} /> {t("back") || "Back"}
            </button>

            <Sparkles className="mx-auto text-gold-leaf mb-3 animate-spin-slow mt-4" size={44} />
            <div className="flex flex-col items-center justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(212,175,55,0.45)]"
                onError={(e) => { 
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='1.5'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3Cpath d='M12 8v8M8 12h8'/%3E%3C/svg%3E";
                }}
              />
              <span className="text-[10px] text-gold-leaf/80 tracking-widest uppercase font-mono mt-3">Study Sanctum Alignment Portal</span>
            </div>
            
            <h2 className="text-lg font-magic text-white mb-6 tracking-wide">{t("langTitle")}</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleLangSelect(l.code)}
                  className="p-3 bg-neutral-950/80 border border-purple-950 hover:border-gold-leaf/60 rounded-xl transition text-sm text-neutral-300 hover:text-white"
                >
                  {l.name}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen 1.5: Choose Your Wizard Companion */}
      {step === "wizard-select" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900/90 border-2 border-purple-950/80 rounded-2xl p-8 max-w-lg w-full shadow-[0_15px_50px_rgba(30,5,50,0.5)] text-center relative overflow-hidden animate-fade-in"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-800 via-gold-leaf to-purple-800" />
            
            <h2 className="text-xl font-magic text-white mb-1 tracking-wider mt-2">{t("chooseCompanion")}</h2>
            <p className="text-[11px] text-gray-400 mb-6">{t("onboardingDesc")}</p>

            <div className="grid grid-cols-2 gap-4 mb-5 text-left">
              {/* Option A: Strodia (Female) */}
              <div 
                onClick={() => {
                  setWizardGender("female");
                  localStorage.setItem("strode_wizard_gender", "female");
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col items-center gap-2.5 bg-neutral-950/90 ${
                  wizardGender === "female" 
                    ? "border-pink-500 bg-pink-950/20 shadow-[0_0_15px_rgba(236,72,153,0.18)]" 
                    : "border-purple-950/60 hover:border-purple-900/50"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-pink-900/10 border border-pink-500/25 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.1)] select-none">
                  <Moon className="w-6 h-6 text-pink-400 animate-[pulse_3s_infinite]" />
                </div>
                <div className="text-center">
                  <h4 className="font-magic text-xs text-pink-400 uppercase tracking-widest font-bold">{t("strodiaName").replace(/\s*\(.*\)/, "")}</h4>
                  <span className="text-[9px] text-gray-500 font-mono">{t("strodiaVoiceDesc")}</span>
                </div>
                <p className="text-[9px] text-gray-400 text-center leading-relaxed font-sans mt-1">
                  {t("strodiaBrief")}
                </p>
              </div>

              {/* Option B: Strodie (Male) */}
              <div 
                onClick={() => {
                  setWizardGender("male");
                  localStorage.setItem("strode_wizard_gender", "male");
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col items-center gap-2.5 bg-neutral-950/90 ${
                  wizardGender === "male" 
                    ? "border-gold-leaf bg-amber-950/15 shadow-[0_0_15px_rgba(212,175,55,0.18)]" 
                    : "border-purple-950/60 hover:border-purple-900/50"
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-yellow-900/5 border border-gold-leaf/20 flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.08)] select-none">
                  <Wand2 className="w-6 h-6 text-gold-leaf animate-pulse" />
                </div>
                <div className="text-center">
                  <h4 className="font-magic text-xs text-gold-leaf uppercase tracking-widest font-bold">{t("strodieName").replace(/\s*\(.*\)/, "")}</h4>
                  <span className="text-[9px] text-gray-500 font-mono">{t("strodieVoiceDesc")}</span>
                </div>
                <p className="text-[9px] text-gray-400 text-center leading-relaxed font-sans mt-1">
                  {t("strodieBrief")}
                </p>
              </div>
            </div>

            {/* Select Thy Honorable Address Title */}
            <div className="bg-neutral-950/70 p-3 rounded-xl border border-purple-950/50 text-left mb-4">
              <label className="flex items-center gap-1.5 text-[8.5px] text-purple-400 font-mono uppercase font-bold tracking-widest mb-2">
                <Crown className="w-3.5 h-3.5 text-purple-400" />
                <span>{t("titleLabel")}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserTitle("master");
                    localStorage.setItem("strode_user_title", "master");
                  }}
                  className={`py-2 px-1 border rounded-lg flex flex-col items-center justify-center gap-1.5 text-[10px] font-magic uppercase tracking-wider transition cursor-pointer ${
                    userTitle === "master"
                      ? "bg-purple-950/40 border-gold-leaf text-gold-leaf"
                      : "bg-neutral-900 border-purple-950/40 text-gray-400 hover:text-white hover:border-purple-800"
                  }`}
                >
                  <Crown className="w-4 h-4 text-gold-leaf shrink-0" />
                  <span>{t("titleMaster")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserTitle("mistress");
                    localStorage.setItem("strode_user_title", "mistress");
                  }}
                  className={`py-2 px-1 border rounded-lg flex flex-col items-center justify-center gap-1.5 text-[10px] font-magic uppercase tracking-wider transition cursor-pointer ${
                    userTitle === "mistress"
                      ? "bg-purple-950/40 border-pink-500 text-pink-400"
                      : "bg-neutral-900 border-purple-950/40 text-gray-400 hover:text-white hover:border-purple-800"
                  }`}
                >
                  <Gem className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>{t("titleMistress")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserTitle("noble seeker");
                    localStorage.setItem("strode_user_title", "noble seeker");
                  }}
                  className={`py-2 px-1 border rounded-lg flex flex-col items-center justify-center gap-1.5 text-[8.5px] font-magic uppercase tracking-wider transition cursor-pointer ${
                    userTitle === "noble seeker"
                      ? "bg-purple-950/40 border-purple-400 text-purple-300"
                      : "bg-neutral-900 border-purple-950/40 text-gray-400 hover:text-white hover:border-purple-800"
                  }`}
                >
                  <Compass className="w-4 h-4 text-purple-300 shrink-0 animate-[spin_10s_linear_infinite]" />
                  <span className="leading-none text-center">{t("titleSeeker")}</span>
                </button>
              </div>
            </div>

            {/* Custom Animation Override scroll in onboarding */}
            <div className="bg-neutral-950/70 p-3 rounded-xl border border-purple-950/50 text-left mb-6 space-y-2">
              <label className="flex items-center gap-1.5 text-[8.5px] text-purple-400 font-mono uppercase font-bold tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{t("customArtLabel")}</span>
              </label>
              
              {customWizardUrl ? (
                <div className="flex items-center gap-3 bg-neutral-900/60 p-2 rounded-lg border border-purple-900/40">
                  <img
                    src={customWizardUrl}
                    alt="Custom preview"
                    className="w-10 h-10 rounded-md object-cover border border-purple-850"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <p className="text-[9px] text-gray-300 font-mono">{t("customArtLoaded")}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomWizardUrl("");
                        localStorage.removeItem("strode_custom_wizard_url");
                      }}
                      className="mt-1 text-[8.5px] text-red-400 hover:text-red-300 uppercase font-magic tracking-wider cursor-pointer transition underline"
                    >
                      {t("removeArt")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-purple-900/60 bg-neutral-900/40 hover:bg-neutral-950 hover:border-purple-500/50 text-[10px] font-magic text-purple-300 hover:text-white cursor-pointer transition">
                    <span>{t("uploadTitle")}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            if (base64) {
                              setCustomWizardUrl(base64);
                              localStorage.setItem("strode_custom_wizard_url", base64);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}

              <p className="text-[8.5px] text-gray-500 font-sans leading-relaxed">
                {t("uploadDesc")}
              </p>
            </div>

            <button
              onClick={() => setStep("auth")}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-mystic-purple text-white font-magic text-xs tracking-widest hover:brightness-110 active:scale-[0.99] transition uppercase"
            >
              {t("alignProceed")}
            </button>
          </motion.div>
        </div>
      )}

      {/* Screen 2: Authenticate and IP Grouped Choose Souls Option */}
      {step === "auth" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900/90 border-2 border-purple-950/80 rounded-3xl p-8 max-w-2xl w-full shadow-[0_20px_60px_rgba(30,5,50,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-800 via-gold-leaf to-purple-800" />
            
            <button 
              onClick={() => setStep("wizard-select")}
              className="absolute top-4 left-4 text-xs font-mono text-purple-400 hover:text-white flex items-center gap-1 bg-purple-950/30 px-2.5 py-1 rounded-md border border-purple-900/50"
            >
              <ArrowLeft size={12} /> {t("back")}
            </button>

            <div className="text-center mb-8 pt-4 flex flex-col items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-16 h-16 object-contain mb-2 filter drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                onError={(e) => { 
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='1.5'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3Cpath d='M12 8v8M8 12h8'/%3E%3C/svg%3E";
                }}
              />
              <h1 className="text-2xl font-magic tracking-widest text-white">Identity Possession Sanctum</h1>
              <p className="text-xs font-sans text-gray-400 mt-1">Acquire thy student credentials or choose a stored local seal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Form Panel */}
              <div className="space-y-4">
                <div className="bg-neutral-950/60 p-4 border border-purple-950/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-gold-leaf">
                    <Globe size={15} />
                    <span className="font-mono text-xs font-bold tracking-wider">{t("planetaryIp")}</span>
                  </div>
                  <p className="font-mono text-white/50 text-xs tracking-widest uppercase">•••••••• PROTECTED</p>
                </div>

                <div>
                  <label className="block text-xs font-sans text-purple-300 uppercase tracking-wider mb-1.5">{t("username")}</label>
                  <input
                    type="text"
                    value={currentUser}
                    onChange={(e) => setCurrentUser(e.target.value)}
                    placeholder="e.g. Alchemist07"
                    className="w-full bg-neutral-950/90 border border-purple-950/70 text-white rounded-lg px-4 py-2.5 font-sans focus:outline-none focus:border-gold-leaf"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans text-purple-300 uppercase tracking-wider mb-1.5">{t("passkey")}</label>
                  <input
                    id="alchemical-pass-input"
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-neutral-950/90 border border-purple-950/70 text-white rounded-lg px-4 py-2.5 font-sans focus:outline-none focus:border-gold-leaf"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => handleAuth("login")}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-mystic-purple text-white font-magic text-sm tracking-widest hover:brightness-110 active:scale-[0.99] transition shadow-[0_4px_15px_rgba(128,0,255,0.2)] flex items-center justify-center gap-2"
                  >
                    <Lock size={14} /> {t("posess")}
                  </button>
                  <button
                    onClick={() => handleAuth("signup")}
                    className="w-full py-2.5 rounded-lg border border-purple-900 bg-neutral-950 font-magic text-neutral-300 text-xs tracking-widest hover:bg-purple-950/20 active:scale-[0.99] transition animate-pulse"
                  >
                    {t("signup")}
                  </button>

                  <div className="pt-3 border-t border-purple-950 flex flex-col gap-2 mt-2">
                    <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-gold-leaf/75 text-center my-0.5">— OR FAST SOCIAL ALIGN —</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSocialChooser("google")}
                        className="py-2 rounded-lg border border-purple-900/40 bg-neutral-950 hover:bg-purple-900/10 text-white font-mono text-[9px] font-bold tracking-wider transition flex items-center justify-center gap-1.5"
                      >
                        <span className="text-xs">🌐</span> Google Auth
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSocialChooser("microsoft")}
                        className="py-2 rounded-lg border border-purple-900/40 bg-neutral-950 hover:bg-purple-900/10 text-white font-mono text-[9px] font-bold tracking-wider transition flex items-center justify-center gap-1.5"
                      >
                        <span className="text-xs">❖</span> Microsoft Auth
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right discovered souls panel (IP list) */}
              <div className="bg-neutral-950/50 rounded-2xl p-5 border border-purple-950 self-stretch flex flex-col max-h-[380px]">
                <h3 className="text-xs font-magic tracking-wider text-gold-leaf mb-3 flex items-center gap-1.5">
                  <Users size={14} />
                  {t("chooseSoul")}
                </h3>
                
                {discoveredSouls.length === 0 ? (
                  <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                    <p className="text-xs text-gray-500 italic">{t("noDiscoveredSouls")}</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {discoveredSouls.map((profile) => (
                      <div
                        key={profile.username}
                        onClick={() => handleSoulPossessionClick(profile)}
                        className={`p-3 bg-neutral-900/60 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                          currentUser.toLowerCase() === profile.username.toLowerCase() 
                            ? "border-gold-leaf bg-purple-950/25" 
                            : "border-purple-950/40 hover:border-purple-900/80 hover:bg-purple-950/15"
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-magic text-sm text-neutral-200 uppercase tracking-wider">{profile.username}</span>
                          <span className="text-[10px] text-gray-500 font-sans">
                            {lang === "hi" ? "साधनाएं:" : "Rituals:"} {profile.numRituals} • Created: {new Date(profile.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-gold-leaf tracking-wider uppercase font-sans border border-gold-leaf/25 bg-gold-leaf/5 px-2 py-0.5 rounded-full">
                          {lang === "hi" ? "ग्रहण करें" : "Possess"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-purple-950/50 text-[10px] text-gray-400 leading-snug">
                  ✨ Strode aggregates souls created from the same IP, allowing student pods or local computers to fast-switch profile interfaces dynamically.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen 3: Chronos Settings Profile */}
      {step === "stats" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border-2 border-purple-950/80 rounded-2xl p-8 max-w-md w-full shadow-[0_15px_50px_rgba(30,5,50,0.5)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-magic tracking-wider text-white flex items-center gap-2">
                <Clock className="text-gold-leaf" size={20} />
                {t("statsTitle")}
              </h2>
              <div className="flex items-center gap-2.5">
                <span className="font-magic uppercase text-[10px] tracking-wider text-purple-400">Chronos</span>
                {currentUser && (
                  <button
                    onClick={() => setStep("app")}
                    className="p-1 px-1.5 rounded-md bg-neutral-950/80 border border-purple-950 hover:text-white text-gray-400 font-magic text-[10px] uppercase transition cursor-pointer flex items-center gap-1"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-1.5">{t("weekPlaceholder")}</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={weekdayH}
                  onChange={(e) => setWeekdayH(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 font-mono focus:outline-none focus:border-gold-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-1.5">{t("weekendPlaceholder")}</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={weekendH}
                  onChange={(e) => setWeekendH(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 font-mono focus:outline-none focus:border-gold-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-2">{t("weekSelect")}</label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950/80 p-3 rounded-xl border border-purple-950/60">
                  {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, idx) => (
                    <label key={dayName} className="flex items-center gap-2 cursor-pointer text-xs p-1 rounded hover:bg-purple-950/30">
                      <input
                        type="checkbox"
                        checked={weekends.includes(idx)}
                        onChange={() => {
                          if (weekends.includes(idx)) {
                            setWeekends(weekends.filter(w => w !== idx));
                          } else {
                            setWeekends([...weekends, idx]);
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-purple-500 text-gold-leaf focus:ring-mystic-purple"
                      />
                      <span className="text-gray-300">{dayName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={saveStatsProfile}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-mystic-purple text-white font-magic text-sm tracking-widest hover:brightness-110 active:scale-[0.99] transition mt-6"
              >
                {t("next")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen 4: Ritual Creator Step 1 - Name / Category */}
      {step === "ritual-1" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border-2 border-purple-950/80 rounded-2xl p-8 max-w-md w-full shadow-[0_15px_50px_rgba(30,5,50,0.5)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-magic text-white flex items-center gap-2">
                <Sparkles className="text-gold-leaf" size={18} />
                Ritual Objective
              </h2>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-gold-leaf/75">Step 1 of 3</span>
                {plans.length > 0 && (
                  <button
                    onClick={() => setStep("app")}
                    className="p-1 rounded bg-neutral-950 border border-purple-950/60 hover:text-white text-gray-400 transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-1.5">Mundane Ritual Name</label>
                <input
                  type="text"
                  placeholder="e.g. Olympiad Chemistry preparation"
                  value={wizTitle}
                  onChange={(e) => setWizTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 font-sans focus:outline-none focus:border-gold-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-1.5">Vocation Goal</label>
                <select
                  value={wizGoal}
                  onChange={(e) => setWizGoal(e.target.value)}
                  className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-3 py-2 font-sans focus:outline-none focus:border-gold-leaf"
                >
                  <option value="Olympiad">Olympiad Alchemy</option>
                  <option value="School">Secondary School Vocation</option>
                  <option value="University">High Level University</option>
                  <option value="Personal">Personal Wisdom / Hermetic</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                {plans.length > 0 && (
                  <button
                    onClick={() => setStep("app")}
                    className="flex-1 py-2.5 rounded-lg border border-purple-950 text-xs font-magic text-gray-400 hover:text-white"
                  >
                    Banish Wizard
                  </button>
                )}
                <button
                  onClick={validateRitualR1}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-mystic-purple text-white font-magic text-sm tracking-widest hover:brightness-110 transition"
                >
                  {t("next")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen 5: Ritual Creator Step 2 - Parameters */}
      {step === "ritual-2" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border-2 border-purple-950/80 rounded-2xl p-8 max-w-md w-full shadow-[0_15px_50px_rgba(30,5,50,0.5)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-magic text-white flex items-center gap-2">
                <Clock className="text-gold-leaf" size={18} />
                Chronos Target
              </h2>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-gold-leaf/75">Step 2 of 3</span>
                {plans.length > 0 && (
                  <button
                    onClick={() => setStep("app")}
                    className="p-1 rounded bg-neutral-950 border border-purple-950/60 hover:text-white text-gray-400 transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-1.5">Vessel Chapters / Sections</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={wizChapters}
                  onChange={(e) => setWizChapters(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 font-mono focus:outline-none focus:border-gold-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-1.5">Planetary Spell Start Date</label>
                <input
                  type="date"
                  value={wizStart}
                  onChange={(e) => setWizStart(e.target.value)}
                  className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 font-mono focus:outline-none focus:border-gold-leaf"
                />
              </div>

              <div>
                <label className="block text-xs font-sans text-purple-300 uppercase tracking-widest mb-1.5">Planetary Spell End Date</label>
                <input
                  type="date"
                  value={wizEnd}
                  onChange={(e) => setWizEnd(e.target.value)}
                  className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 font-mono focus:outline-none focus:border-gold-leaf"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setStep("ritual-1")}
                  className="py-2 px-4 rounded-lg bg-neutral-950 border border-purple-950 text-xs font-magic text-gray-400 hover:text-white"
                >
                  {t("back")}
                </button>
                <button
                  onClick={() => setStep("ritual-3")}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-mystic-purple text-white font-magic text-sm tracking-widest hover:brightness-110 transition"
                >
                  {t("next")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen 6: Ritual Creator Step 3 - Active Date / Scheduling Choice */}
      {step === "ritual-3" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900/90 border-2 border-purple-950/80 rounded-2xl p-8 max-w-lg w-full shadow-[0_15px_50px_rgba(30,5,50,0.5)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-magic text-white flex items-center gap-2">
                <Sparkles className="text-gold-leaf" size={18} />
                Schedule Alchemy
              </h2>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs text-gold-leaf/75">Step 3 of 3</span>
                {plans.length > 0 && (
                  <button
                    onClick={() => setStep("app")}
                    className="p-1 rounded bg-neutral-950 border border-purple-950/60 hover:text-white text-gray-400 transition cursor-pointer"
                    title="Dismiss"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex bg-neutral-950 p-1 border border-purple-950/60 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setWizardMode("weekdays")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium font-magic transition ${wizardMode === "weekdays" ? "bg-purple-900 text-white" : "text-gray-400 hover:text-white"}`}
              >
                By System Weekdays
              </button>
              <button
                type="button"
                onClick={() => setWizardMode("dates")}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium font-magic transition ${wizardMode === "dates" ? "bg-purple-900 text-white" : "text-gray-400 hover:text-white"}`}
              >
                By Specific Dates
              </button>
            </div>

            <div className="space-y-4">
              {wizardMode === "weekdays" ? (
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-300 font-sans mb-2">{t("studyDaysLabel")}</p>
                  <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded-lg border border-purple-950/50 max-h-40 overflow-y-auto">
                    {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, idx) => (
                      <label key={dayName} className="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wizStudyDays.includes(idx)}
                          onChange={() => {
                            if (wizStudyDays.includes(idx)) {
                              setWizStudyDays(wizStudyDays.filter(f => f !== idx));
                            } else {
                              setWizStudyDays([...wizStudyDays, idx]);
                            }
                          }}
                          className="w-4 h-4 rounded border-purple-500 text-gold-leaf focus:ring-mystic-purple"
                        />
                        <span>{dayName}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs uppercase tracking-widest text-purple-300 font-sans mb-2">{t("datesLabel")}</p>
                  {renderDatesWizardRange()}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("ritual-2")}
                  className="py-2 px-4 rounded-lg bg-neutral-950 border border-purple-950 text-xs font-magic text-gray-400 hover:text-white"
                >
                  {t("back")}
                </button>
                <button
                  type="button"
                  onClick={calculateHoursFocus}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-mystic-purple text-white font-magic text-sm tracking-widest hover:brightness-110 transition shadow-[0_0_15px_rgba(128,0,255,0.25)]"
                >
                  {t("calculateEnergies")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Screen 7: Critical Low Energy Flow Warning */}
      {step === "warning" && (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border-2 border-red-900/60 rounded-2xl p-8 max-w-md w-full shadow-[0_15px_50px_rgba(200,10,10,0.15)] text-center"
          >
            <AlertTriangle className="mx-auto text-red-500 mb-4 animate-bounce" size={48} />
            <h2 className="text-xl font-magic tracking-wider text-red-400 mb-3 uppercase">{t("deficientEnergyTitle")}</h2>
            
            <div className="text-sm font-sans text-gray-300 leading-relaxed mb-6 space-y-4">
              <p>{t("energyWarning")}</p>
              
              <div className="bg-neutral-950 p-4 border border-purple-950 rounded-xl space-y-2 text-left">
                <div className="flex justify-between font-mono text-xs text-gray-400">
                  <span>{t("allocatedFocus")}:</span>
                  <span className="font-bold text-red-400">{calculatedHoursPerCh} {t("hoursChapter")}</span>
                </div>
                <div className="flex justify-between font-mono text-xs text-gray-400">
                  <span>{t("recommendedFocus")}:</span>
                  <span className="font-bold text-green-400">3.0+ {t("hoursChapter")}</span>
                </div>
                <div className="border-t border-purple-950/45 pt-1.5 flex justify-between font-mono text-xs text-gold-leaf">
                  <span>{t("targetHoursNeeded")}:</span>
                  <span className="font-bold">{wizChapters * 3} {t("hoursTotal")}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => executeCommitRitual()}
                className="w-full py-2 bg-gradient-to-r from-red-800 to-red-950 border border-red-700 hover:brightness-110 rounded-lg text-white font-magic text-xs tracking-widest transition"
              >
                {t("proceedAnyway")}
              </button>
              
              <button
                onClick={() => setStep("stats")}
                className="w-full py-2 bg-purple-950 hover:bg-purple-900 border border-purple-800 rounded-lg text-xs text-white font-magic tracking-wider transition"
              >
                {t("changeStudyHours")}
              </button>

              <button
                onClick={() => setStep("ritual-2")}
                className="w-full py-2 bg-neutral-950 border border-purple-950 rounded-lg text-xs text-gray-300 hover:text-white font-magic tracking-wider transition"
              >
                {t("readjustDates")}
              </button>

              <button
                onClick={() => setStep("ritual-3")}
                className="w-full py-2 bg-neutral-950 border border-purple-950 rounded-lg text-xs text-gray-400 hover:text-white font-magic tracking-wider transition"
              >
                Back To Schedule
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Workspace Frame Application */}
      {step === "app" && (
        <div className="flex-1 flex flex-col md:flex-row relative z-10 h-full max-h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-full md:w-72 bg-neutral-950/98 border-r border-purple-950/60 p-5 flex flex-col shrink-0 overflow-y-auto">
            {/* Header branding */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-neutral-900 border border-gold-leaf/40 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain" 
                  onError={(e) => { 
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d4af37' stroke-width='2'%3E%3Cpath d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/%3E%3C/svg%3E";
                  }} 
                />
              </div>
              <div className="text-left font-mono">
                <span className="text-xs uppercase tracking-widest text-gold-leaf/90 block font-bold font-magic">STUDY SANCTUM</span>
                <span className="text-[9px] text-purple-400 font-bold tracking-wider block uppercase">ALCHEMICAL FLOW</span>
              </div>
            </div>

            {/* Profile Avatar Widget */}
            <div className="bg-neutral-900/60 p-3.5 border border-purple-950 rounded-xl mb-6 flex items-center gap-3 relative">
              <div className="w-9 h-9 bg-purple-950 border border-purple-900 rounded-lg flex items-center justify-center text-purple-300">
                <GraduationCap size={16} />
              </div>
              <div className="text-left overflow-hidden">
                <span className="font-magic text-xs block text-white uppercase tracking-wider truncate mb-0.5">{currentUser}</span>
                <span className="text-[9px] block text-gold-leaf/80 tracking-widest uppercase font-sans">
                  🛡️ {calculateCurrentAlchemistRank()}
                </span>
              </div>
            </div>

            {/* Navigation options */}
            <nav className="flex-1 space-y-1">
              <button
                onClick={() => { setActiveTab("plans"); setShowSanctumIndex(null); }}
                className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 font-magic text-xs tracking-wider transition ${
                  activeTab === "plans" && showSanctumIndex === null
                    ? "bg-purple-950/70 border border-gold-leaf/30 text-white" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-neutral-900/50"
                }`}
              >
                <BookOpen size={14} className="text-gold-leaf" />
                {t("grimoire")}
              </button>

              <button
                onClick={() => { setActiveTab("routine"); setShowSanctumIndex(null); }}
                className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 font-magic text-xs tracking-wider transition ${
                  activeTab === "routine" 
                    ? "bg-purple-950/70 border border-gold-leaf/30 text-white" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-neutral-900/50"
                }`}
              >
                <Clock size={14} className="text-gold-leaf" />
                {t("routine")}
              </button>

              <button
                onClick={() => { setActiveTab("memos"); setShowSanctumIndex(null); }}
                className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 font-magic text-xs tracking-wider transition ${
                  activeTab === "memos" 
                    ? "bg-purple-950/70 border border-gold-leaf/30 text-white" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-neutral-900/50"
                }`}
              >
                <FileText size={14} className="text-gold-leaf" />
                {t("memos")}
              </button>

              <button
                onClick={() => { setActiveTab("oracle"); setShowSanctumIndex(null); }}
                className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 font-magic text-xs tracking-wider transition relative ${
                  activeTab === "oracle" 
                    ? "bg-purple-950/70 border border-gold-leaf/30 text-white" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-neutral-900/50"
                }`}
              >
                <Sparkles size={14} className="text-gold-leaf" />
                <span>{t("oracle")}</span>
                <span className="absolute right-3 bg-red-950 border border-red-700 text-[8px] tracking-wider uppercase font-sans text-red-200 px-1.5 py-0.5 rounded-full animate-pulse">
                  Focus AI
                </span>
              </button>

              <button
                onClick={() => { setActiveTab("settings"); setShowSanctumIndex(null); }}
                className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 font-magic text-xs tracking-wider transition ${
                  activeTab === "settings" 
                    ? "bg-purple-950/70 border border-gold-leaf/30 text-white" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-neutral-900/50"
                }`}
              >
                <SettingsIcon size={14} className="text-gold-leaf" />
                {t("settings")}
              </button>

              <button
                onClick={() => { setActiveTab("accounts"); setShowSanctumIndex(null); }}
                className={`w-full text-left py-2.5 px-4 rounded-xl flex items-center gap-3 font-magic text-xs tracking-wider transition ${
                  activeTab === "accounts" 
                    ? "bg-purple-950/70 border border-gold-leaf/30 text-white" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-neutral-900/50"
                }`}
              >
                <Users size={14} className="text-gold-leaf" />
                {t("manage")}
              </button>
            </nav>

            {/* Logout panel */}
            <div className="pt-4 border-t border-purple-950/50 mt-auto">
              <button
                onClick={handleBanishSession}
                className="w-full py-2 bg-purple-950/30 hover:bg-red-950/40 hover:text-red-300 border border-purple-950 hover:border-red-900/60 rounded-xl text-xs font-magic tracking-widest text-gray-400 transition flex items-center justify-center gap-2"
              >
                <LogOut size={12} />
                {t("banish")}
              </button>
            </div>
          </aside>

          {/* Main workspace arena */}
          <main className="flex-1 bg-neutral-950/40 p-6 md:p-8 overflow-y-auto flex flex-col relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,5,40,0.15)_0%,rgba(0,0,0,0)_100%)] pointer-events-none" />

            <AnimatePresence mode="wait">
              {/* Active Tab: Tab-Grimoires */}
              {activeTab === "plans" && showSanctumIndex === null && (
                <motion.div
                  key="plans"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 flex-1 flex flex-col"
                >
                  {/* Headline */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                      <h2 className="text-2xl font-magic text-white tracking-widest">{t("activeTrans")}</h2>
                      <p className="text-xs text-gray-400">{t("chooseActiveFocus")}</p>
                    </div>
                    <button
                      onClick={() => openRitualWizard(null)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-mystic-purple hover:brightness-110 active:scale-[0.98] transition text-white text-xs font-magic tracking-widest flex items-center gap-2 shadow-[0_4px_15px_rgba(128,0,255,0.2)]"
                    >
                      <Plus size={14} />
                      {t("newRitual")}
                    </button>
                  </div>

                  {/* Active Highlight Plan */}
                  {plans.length > 0 && plans[activeIndex] ? (
                    <div className="bg-neutral-900/90 border border-gold-leaf/40 rounded-2xl p-6 shadow-[0_10px_35px_rgba(212,175,55,0.04)] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-leaf/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="text-left">
                          <span className="text-[10px] tracking-widest uppercase font-mono text-gold-leaf bg-gold-leaf/10 border border-gold-leaf/25 px-2.5 py-0.5 rounded-full">
                            ✨ {plans[activeIndex].goal} {t("keyVocation")}
                          </span>
                          <h3 className="text-xl font-magic text-white mt-1.5">{plans[activeIndex].title}</h3>
                          <p className="text-xs text-gray-400 font-mono mt-1">
                            {new Date(plans[activeIndex].start).toLocaleDateString()} — {new Date(plans[activeIndex].end).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right sm:text-right">
                          <span className="text-xs text-purple-300 block font-mono">{plans[activeIndex].hoursPerChapter} {t("hoursChapter")}</span>
                          <span className="text-[10px] text-gray-500 font-mono block mt-1">
                            {plans[activeIndex].chapterList.filter(c => c.done).length} / {plans[activeIndex].chapters} {t("completed")}
                          </span>
                        </div>
                      </div>

                      {/* Micro progress bar */}
                      <div className="w-full bg-neutral-950 border border-purple-950 h-2.5 rounded-full overflow-hidden mb-5">
                        <div 
                          className="bg-gradient-to-r from-mystic-purple to-gold-leaf h-full"
                          style={{ width: `${(plans[activeIndex].chapterList.filter(c => c.done).length / plans[activeIndex].chapters) * 100}%` }}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSanctumIndex(activeIndex)}
                          className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-lg text-xs font-magic tracking-wider font-bold transition flex items-center gap-1.5"
                        >
                          {t("openSanctum")}
                        </button>
                        <button
                          onClick={() => openRitualWizard(activeIndex)}
                          className="px-3 py-2 bg-neutral-950 border border-purple-900 hover:border-gold-leaf/60 text-gray-300 rounded-lg text-xs transition"
                        >
                          {t("modify")}
                        </button>
                        <button
                          type="button"
                          onClick={() => banishRitualPlan(activeIndex)}
                          className="px-3 py-2 bg-neutral-950 border border-red-900/45 hover:bg-red-950/20 hover:border-red-600/60 text-red-400 hover:text-red-300 rounded-lg text-xs transition flex items-center gap-1.5 ml-auto"
                        >
                          <Trash2 size={13} />
                          {t("banishRitual")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 border border-dashed border-purple-950/80 bg-neutral-900/20 rounded-2xl flex flex-col justify-center items-center text-center p-8">
                      <BookOpen size={48} className="text-purple-900 mb-4 animate-pulse" />
                      <h3 className="text-lg font-magic text-purple-300 mb-1">{t("noActiveGrimoires")}</h3>
                      <p className="text-xs text-gray-500 max-w-sm mb-6">{t("noActiveGrimoiresDesc")}</p>
                      <button
                        onClick={() => openRitualWizard(null)}
                        className="px-4 py-2 rounded-lg bg-purple-900 hover:bg-purple-800 text-white text-xs font-magic tracking-wider"
                      >
                        {t("launchFirstRitual")}
                      </button>
                    </div>
                  )}

                  {/* List of Stored Grimoires */}
                  {plans.length > 1 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-magic text-gold-leaf tracking-wider uppercase border-b border-purple-950 pb-1.5 text-left">{t("storedGrim")}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {plans.map((p, idx) => {
                          if (idx === activeIndex) return null;
                          const completed = p.chapterList.filter(c => c.done).length;
                          return (
                            <div key={idx} className="bg-neutral-900/75 border border-purple-950/60 rounded-xl p-4 flex items-center justify-between gap-4">
                              <div className="text-left overflow-hidden">
                                <h5 className="font-magic text-neutral-200 text-sm truncate uppercase tracking-wider">{p.title}</h5>
                                <span className="text-[10px] text-gray-500 font-mono block">
                                  {completed} / {p.chapters} Ch • {p.hoursPerChapter}h/ch
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => changeActiveFocus(idx)}
                                  className="px-2.5 py-1.5 rounded bg-purple-950 hover:bg-purple-900 text-[10px] text-purple-300 font-magic uppercase tracking-wider transition"
                                >
                                  {t("focus")}
                                </button>
                                <button
                                  onClick={() => banishRitualPlan(idx)}
                                  className="p-1.5 rounded hover:bg-red-950/35 text-gray-500 hover:text-red-400 transition"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Active Tab Sanctum: Detailed checklist and editing */}
              {showSanctumIndex !== null && plans[showSanctumIndex] && (
                <motion.div
                  key="sanctum"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 flex-1 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setShowSanctumIndex(null)}
                      className="p-1.5 rounded-lg border border-purple-950 bg-neutral-950 text-gray-400 hover:text-white transition"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <span className="font-mono text-xs text-purple-400 tracking-wider">{t("returnToGrimoires")}</span>
                  </div>

                  <div className="text-left">
                    <h2 className="text-2xl font-magic tracking-widest text-white uppercase">{plans[showSanctumIndex].title}</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{t("activeSanctumDesc")}</p>
                  </div>

                  <div className="bg-neutral-900/60 border border-purple-950 rounded-2xl p-4 md:p-6 flex-1 overflow-y-auto space-y-3.5">
                    {plans[showSanctumIndex].chapterList.map((ch, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-xl border flex items-center gap-3 transition ${
                          ch.done 
                            ? "bg-purple-950/20 border-purple-900" 
                            : "bg-neutral-950 border-purple-950/70"
                        }`}
                      >
                        <button
                          onClick={() => toggleChapterStatus(showSanctumIndex!, idx)}
                          className={`w-5.5 h-5.5 rounded flex items-center justify-center border transition ${
                            ch.done 
                              ? "bg-gold-leaf border-gold-leaf text-neutral-950" 
                              : "border-purple-800 hover:border-gold-leaf"
                          }`}
                        >
                          {ch.done && <Check size={14} strokeWidth={3} />}
                        </button>
                        <input
                          type="text"
                          value={ch.title}
                          placeholder={t("chapterPlaceholder")}
                          onChange={(e) => renameChapterTitle(showSanctumIndex!, idx, e.target.value)}
                          className="bg-transparent text-sm text-neutral-200 border-b border-transparent focus:border-purple-850 focus:outline-none flex-1 font-mono py-0.5"
                        />
                        <span className="text-[10px] text-gray-500 font-mono">
                          {idx + 1} / {plans[showSanctumIndex!].chapters}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Active Tab: Daily Routine Cycles */}
              {activeTab === "routine" && (
                <motion.div
                  key="routine"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 flex flex-col text-left"
                >
                  <div>
                    <h2 className="text-2xl font-magic text-white tracking-widest">{t("dailyCycleTitle")}</h2>
                    <p className="text-xs text-gray-400">{t("dailyCycleDesc")}</p>
                  </div>

                  <textarea
                    value={routine}
                    onChange={(e) => setRoutine(e.target.value)}
                    placeholder={t("dailyCyclePlaceholder")}
                    className="w-full flex-1 min-h-[300px] md:min-h-[420px] bg-neutral-950/90 border border-purple-950 font-mono text-sm p-5 rounded-2xl focus:outline-none focus:border-gold-leaf text-neutral-200 leading-relaxed"
                  />

                  <div>
                    <button
                      onClick={() => handleStaticSave("routine")}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-mystic-purple text-white text-xs font-magic tracking-widest hover:brightness-110 active:scale-[0.98] transition"
                    >
                      {t("seal")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Active Tab: Arcane Memos */}
              {activeTab === "memos" && (
                <motion.div
                  key="memos"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 flex-1 flex flex-col text-left"
                >
                  <div>
                    <h2 className="text-2xl font-magic text-white tracking-widest">{t("arcaneMemosTitle")}</h2>
                    <p className="text-xs text-gray-400">{t("arcaneMemosDesc")}</p>
                  </div>

                  <textarea
                    value={memos}
                    onChange={(e) => setMemos(e.target.value)}
                    placeholder={t("arcaneMemosPlaceholder")}
                    className="w-full flex-1 min-h-[300px] md:min-h-[420px] bg-neutral-950/90 border border-purple-950 font-mono text-sm p-5 rounded-2xl focus:outline-none focus:border-gold-leaf text-neutral-200 leading-relaxed"
                  />

                  <div>
                    <button
                      onClick={() => handleStaticSave("memos")}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-mystic-purple text-white text-xs font-magic tracking-widest hover:brightness-110 active:scale-[0.98] transition"
                    >
                      {t("seal")}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Active Tab: Arcane Oracle AI Chat (Strict and Focused) */}
              {activeTab === "oracle" && (
                <motion.div
                  key="oracle"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col text-left space-y-4 max-h-[calc(100vh-100px)] overflow-hidden"
                >
                  <div>
                    <h2 className="text-2xl font-magic text-white tracking-widest">{t("oracleTitle")}</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{t("oracleDesc")}</p>
                  </div>

                  <div className="flex-1 bg-neutral-950/80 border border-purple-950 rounded-2xl p-4 flex flex-col overflow-hidden relative">
                    {/* Chat log body */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 my-2 scrollbar-thin">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-3">
                          <div className="w-12 h-12 bg-mystic-purple/20 border border-purple-700 rounded-full flex items-center justify-center text-gold-leaf">
                            <Sparkles className="animate-spin-slow" size={22} />
                          </div>
                          <div>
                            <p className="font-magic text-sm text-neutral-200">"{t("oracleIntro")}"</p>
                            <p className="text-[11px] text-gray-500 max-w-xs mt-1">{t("oracleIntroDesc")}</p>
                          </div>
                        </div>
                      ) : (
                        chatMessages.map((m) => (
                          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div 
                              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed text-sm ${
                                m.role === "user"
                                  ? "bg-purple-950/70 border border-purple-900/60 rounded-tr-none text-neutral-100"
                                  : "bg-neutral-900 border border-gold-leaf/20 rounded-tl-none text-neutral-200 font-mono"
                              }`}
                            >
                              <div className="text-[10px] uppercase font-magic tracking-widest mb-1 opacity-60">
                                {m.role === "user" ? currentUser : t("archmageSender")}
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                            </div>
                          </div>
                        ))
                      )}

                      {isAiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-neutral-900 border border-gold-leaf/20 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-500 italic flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gold-leaf rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-gold-leaf rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-gold-leaf rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span>{t("oracleLoading")}</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    {/* Chat field input footer */}
                    <div className="flex gap-2.5 pt-3 border-t border-purple-950/60 mt-auto">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendAlchemistBotOracleMessage()}
                        placeholder={t("chatPlaceholder")}
                        className="flex-1 bg-neutral-950 border border-purple-950/80 hover:border-purple-900 rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-gold-leaf"
                      />
                      <button
                        onClick={sendAlchemistBotOracleMessage}
                        className="p-3 rounded-xl bg-gradient-to-r from-purple-800 to-mystic-purple text-white hover:brightness-110 active:scale-[0.98] transition shadow-[0_0_10px_rgba(128,0,255,0.2)]"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Active Tab: Workstation settings */}
              {activeTab === "settings" && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 flex-1 flex flex-col text-left"
                >
                  <div>
                    <h2 className="text-2xl font-magic text-white tracking-widest">{t("vesselSettings")}</h2>
                    <p className="text-xs text-gray-400">{t("vesselSettingsDesc")}</p>
                  </div>

                  <div className="bg-neutral-900/60 border border-purple-950 rounded-2xl p-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-magic uppercase tracking-widest text-gold-leaf mb-2">{t("preferredLang")}</h4>
                      <select
                        value={lang}
                        onChange={(e) => {
                          setLang(e.target.value);
                          localStorage.setItem("strode_lang", e.target.value);
                          syncSoulState({ lang: e.target.value });
                        }}
                        className="bg-neutral-950 border border-purple-950 text-white rounded-lg px-3 py-2 w-full md:w-64 max-w-xs focus:outline-none focus:border-gold-leaf"
                      >
                        {LANGUAGES.map(l => (
                          <option key={l.code} value={l.code}>{l.name}</option>
                        ))}
                      </select>
                    </div>
 
                    <div className="pt-4 border-t border-purple-950/50">
                      <h4 className="text-xs font-magic uppercase tracking-widest text-gold-leaf mb-2">{t("myCompanion")}</h4>
                      <p className="text-xs text-gray-400 mb-3">{t("myCompanionDesc")}</p>
                      
                      <div className="flex gap-4 mb-4">
                        <button
                          onClick={() => {
                            setWizardGender("female");
                            localStorage.setItem("strode_wizard_gender", "female");
                          }}
                          className={`flex-1 py-2 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-magic uppercase tracking-wider transition ${
                            wizardGender === "female"
                              ? "bg-pink-950/20 border-pink-500 text-pink-400 animate-[pulse_4s_infinite]"
                              : "bg-neutral-950 border-purple-950 text-gray-400 hover:text-white"
                          }`}
                        >
                          <Moon className="w-3.5 h-3.5 text-pink-400 shrink-0" /> {t("strodiaName")}
                        </button>
                        <button
                          onClick={() => {
                            setWizardGender("male");
                            localStorage.setItem("strode_wizard_gender", "male");
                          }}
                          className={`flex-1 py-2 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-magic uppercase tracking-wider transition ${
                            wizardGender === "male"
                              ? "bg-amber-950/10 border-gold-leaf text-gold-leaf"
                              : "bg-neutral-950 border-purple-950 text-gray-400 hover:text-white"
                          }`}
                        >
                          <Wand2 className="w-3.5 h-3.5 text-gold-leaf shrink-0 animate-pulse" /> {t("strodieName")}
                        </button>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <label className="block text-[10px] text-purple-400 font-mono uppercase tracking-widest font-bold">
                          {t("customArtLabel")}
                        </label>
                        
                        {customWizardUrl ? (
                          <div className="flex items-center gap-3 bg-neutral-900/60 p-2 rounded-lg border border-purple-900/40">
                            <img
                              src={customWizardUrl}
                              alt="Custom preview"
                              className="w-10 h-10 rounded-md object-cover border border-purple-850"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1">
                              <p className="text-[9px] text-gray-300 font-mono">{t("customArtLoaded")}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomWizardUrl("");
                                  localStorage.removeItem("strode_custom_wizard_url");
                                }}
                                className="mt-0.5 text-[8.5px] text-red-400 hover:text-red-300 uppercase font-magic tracking-wider cursor-pointer transition underline"
                              >
                                {t("removeArt")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative pt-0.5">
                            <label className="flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg border border-dashed border-purple-900/60 bg-neutral-900/40 hover:bg-neutral-950 hover:border-purple-500/50 text-[10px] font-magic text-purple-300 hover:text-white cursor-pointer transition">
                              <span>{t("uploadTitle")}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      const base64 = event.target?.result as string;
                                      if (base64) {
                                        setCustomWizardUrl(base64);
                                        localStorage.setItem("strode_custom_wizard_url", base64);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}

                        <p className="text-[9px] text-gray-500 leading-normal">
                          {t("uploadDesc")}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-purple-950/30">
                        <label className="block text-[10px] text-purple-400 font-mono uppercase tracking-widest font-bold mb-2">
                          {t("titleLabel")}
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setUserTitle("master");
                              localStorage.setItem("strode_user_title", "master");
                            }}
                            className={`flex-1 py-1.5 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-magic uppercase tracking-wider transition cursor-pointer ${
                              userTitle === "master"
                                ? "bg-purple-950/20 border-gold-leaf text-gold-leaf"
                                : "bg-neutral-950 border-purple-950 text-gray-400 hover:text-white"
                            }`}
                          >
                            <Crown className="w-3.5 h-3.5 text-gold-leaf shrink-0" /> {t("titleMaster")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserTitle("mistress");
                              localStorage.setItem("strode_user_title", "mistress");
                            }}
                            className={`flex-1 py-1.5 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-magic uppercase tracking-wider transition cursor-pointer ${
                              userTitle === "mistress"
                                ? "bg-pink-950/10 border-pink-500 text-pink-400"
                                : "bg-neutral-950 border-purple-950 text-gray-400 hover:text-white"
                            }`}
                          >
                            <Gem className="w-3.5 h-3.5 text-pink-400 shrink-0" /> {t("titleMistress")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserTitle("noble seeker");
                              localStorage.setItem("strode_user_title", "noble seeker");
                            }}
                            className={`flex-1 py-1.5 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-magic uppercase tracking-wider transition cursor-pointer ${
                              userTitle === "noble seeker"
                                ? "bg-purple-950/20 border-purple-400 text-purple-300"
                                : "bg-neutral-950 border-purple-950 text-gray-400 hover:text-white"
                            }`}
                          >
                            <Compass className="w-3.5 h-3.5 text-purple-300 shrink-0 animate-[spin_10s_linear_infinite]" /> {t("titleSeeker")}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-950/50">
                      <h4 className="text-xs font-magic uppercase tracking-widest text-gold-leaf mb-2">{t("adjustChronosTitle")}</h4>
                      <p className="text-xs text-gray-400 mb-4">{t("adjustChronosDesc")}</p>
                      <button
                        onClick={() => setStep("stats")}
                        className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-lg text-xs font-magic tracking-wider uppercase transition"
                      >
                        {t("adjustChronosBtn")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Active Tab: Choose Soul (Accounts profile Management) */}
              {activeTab === "accounts" && (
                <motion.div
                  key="accounts"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 flex-1 flex flex-col text-left"
                >
                  <div>
                    <h2 className="text-2xl font-magic text-white tracking-widest">{t("manage")}</h2>
                    <p className="text-xs text-gray-400">{t("manageSoulsDesc")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Discovered souls card list grouped by same IP */}
                    <div className="bg-neutral-900/60 border border-purple-950 rounded-2xl p-6 flex flex-col max-h-[450px]">
                      <h3 className="text-xs font-magic tracking-wider text-gold-leaf mb-3 flex items-center gap-1.5 border-b border-purple-950/50 pb-2">
                        <Users size={14} />
                        {t("availableSouls")}: <span className="font-mono text-purple-400 uppercase tracking-widest">•••••••• Private</span>
                      </h3>

                      {discoveredSouls.length === 0 ? (
                        <p className="text-xs text-neutral-500 italic p-4 text-center">{t("noDiscoveredSouls")}</p>
                      ) : (
                        <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
                          {discoveredSouls.map((profile) => (
                            <div
                              key={profile.username}
                              onClick={() => {
                                setCurrentUser(profile.username);
                                const input = document.getElementById("reauth-pass-input");
                                if (input) input.focus();
                              }}
                              className={`p-3 bg-neutral-950/80 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                                currentUser.toLowerCase() === profile.username.toLowerCase()
                                  ? "border-gold-leaf bg-purple-950/25"
                                  : "border-purple-950/40 hover:border-purple-900/80 hover:bg-purple-950/15"
                              }`}
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-magic text-sm text-neutral-200 uppercase tracking-wider">{profile.username}</span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  {t("ritualsLabel")}: {profile.numRituals} • {t("createdTime")} {new Date(profile.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-[10px] text-gold-leaf tracking-wider uppercase font-sans border border-gold-leaf/25 bg-gold-leaf/5 px-2.5 py-1 rounded-full shrink-0">
                                {currentUser.toLowerCase() === profile.username.toLowerCase() ? t("possessingLabel") : t("possessBtn")}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Possession Authenticator helper */}
                    <div className="bg-neutral-900/60 border border-purple-950 rounded-2xl p-6 space-y-4">
                      <h3 className="text-xs font-magic tracking-wider text-gold-leaf border-b border-purple-950/50 pb-2 uppercase">{t("possessIdentity")}</h3>
                      <div>
                        <label className="block text-[10px] font-sans text-purple-300 uppercase tracking-widest mb-1">{t("targetIdentity")}</label>
                        <input
                          type="text"
                          value={currentUser}
                          onChange={(e) => setCurrentUser(e.target.value)}
                          className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-sans text-purple-300 uppercase tracking-widest mb-1">{t("passkey")}</label>
                        <input
                          id="reauth-pass-input"
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-neutral-950 border border-purple-950 text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => handleAuth("login")}
                          className="flex-1 py-2 bg-gradient-to-r from-purple-800 to-mystic-purple hover:brightness-110 text-white text-xs font-magic tracking-wider uppercase rounded-lg transition"
                        >
                          {t("possessBtn")}
                        </button>
                        <button
                          onClick={() => handleAuth("signup")}
                          className="flex-1 py-2 bg-neutral-950 border border-purple-900 hover:bg-neutral-900 text-gray-300 text-xs font-magic tracking-wider uppercase rounded-lg transition"
                        >
                          {t("registerAnew")}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
      {step !== "wizard-select" && (
        <WizardCompanion 
          username={currentUser || "Alchemist"} 
          lang={lang} 
          step={step}
          activeGoal={plans[activeIndex]?.goal} 
          wizardGender={wizardGender}
          customWizardUrl={customWizardUrl}
          userTitle={userTitle}
        />
      )}

      {/* Dynamic Royal Banish Confirmation Modal bypasses iframe confirm blocking */}
      <AnimatePresence>
        {deletePlanIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border-2 border-red-900/60 rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(220,38,38,0.25)] text-center relative"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-800 to-red-650" />
              <div className="text-4xl mb-3 animate-pulse">🌋</div>
              <h3 className="text-sm font-magic text-red-400 uppercase tracking-widest mb-1.5 font-bold">Banishment Spell ritual</h3>
              <p className="text-[11px] text-gray-300 font-sans leading-relaxed mb-5">
                Noble pupil, dost thou wish to permanently banish this study Grimoire? Once dissolved, thy milestones and records cannot be retrieved by any earthly spell.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={executeBanishmentSpell}
                  className="flex-1 py-1.5 bg-red-950 hover:bg-red-900 border border-red-700 hover:border-red-500 text-white rounded-lg text-[10px] font-magic uppercase tracking-wider transition"
                >
                  Yes, Banish Ritual
                </button>
                <button
                  onClick={() => setDeletePlanIndex(null)}
                  className="flex-1 py-1.5 bg-neutral-950 hover:bg-neutral-900 border border-purple-950 text-gray-400 rounded-lg text-[10px] font-magic uppercase tracking-wider transition"
                >
                  Cancel Spell
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Provider Identity chooser (Supports Multiple Active IDs per account) */}
      <AnimatePresence>
        {showSocialChooser !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-purple-950 rounded-3xl p-5 max-w-sm w-full shadow-[0_20px_50px_rgba(30,5,50,0.6)] text-left relative"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-800 to-gold-leaf" />
              
              <div className="flex items-center justify-between border-b border-purple-950 pb-2 mb-3">
                <h3 className="text-xs font-magic text-gold-leaf uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <span>{showSocialChooser === "google" ? "Google Soul Alignment" : "Microsoft Azure Alignment"}</span>
                </h3>
                <button 
                  onClick={() => setShowSocialChooser(null)}
                  className="text-gray-500 hover:text-white p-0.5 rounded transition"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-[10px] text-gray-400 mb-3.5 leading-relaxed font-sans">
                {showSocialChooser === "google" 
                  ? "Select from thy pre-registered Google Study credentials to possess instantly:"
                  : "Azure client detected several active directory pupil IDs. Choose to possess:"}
              </p>

              <div className="space-y-2 mb-4">
                {(showSocialChooser === "google" 
                  ? [
                      { email: "sorcerer.prime@gmail.com", user: "sorcerer.prime", rank: "🧙‍♂️ Master" },
                      { email: "acolyte.studious@gmail.com", user: "acolyte.studious", rank: "🌱 Apprentice" },
                      { email: "nebula.weaver@gmail.com", user: "nebula.weaver", rank: "✨ Scholar" }
                    ]
                  : [
                      { email: "vortex.magus@outlook.com", user: "vortex.magus", rank: "⚔️ Grand Mage" },
                      { email: "scholar.focus@student.edu", user: "scholar.focus", rank: "📖 Researcher" }
                    ]
                ).map((social) => (
                  <div
                    key={social.email}
                    onClick={() => {
                      setCurrentUser(social.user);
                      setPasscode("SocialOAuthSeal_Secure_2026");
                      handleAuth("login", social.user);
                      setShowSocialChooser(null);
                    }}
                    className="p-2.5 bg-neutral-950 hover:bg-purple-950/20 border border-purple-950 hover:border-gold-leaf/40 rounded-xl flex items-center justify-between cursor-pointer transition group"
                  >
                    <div className="text-left font-mono">
                      <span className="text-[10px] text-white block group-hover:text-gold-leaf tracking-wide font-bold">{social.email}</span>
                      <span className="text-[8px] text-purple-400 uppercase tracking-widest block font-bold">{social.rank}</span>
                    </div>
                    <div className="text-[8px] text-gold-leaf bg-gold-leaf/5 border border-gold-leaf/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-magic font-bold">
                      Possess
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Social Mail addition */}
              <div className="bg-neutral-950 p-2.5 border border-purple-950 rounded-xl space-y-1.5 text-left">
                <label className="block text-[8px] text-purple-400 font-mono uppercase tracking-widest font-bold">Or link custom {showSocialChooser} email:</label>
                <div className="flex gap-1.5">
                  <input
                    id="custom-oauth-email"
                    type="text"
                    placeholder={`e.g. customized_acolyte@${showSocialChooser === "google" ? "gmail.com" : "outlook.com"}`}
                    className="flex-1 bg-neutral-900 border border-purple-950 text-white rounded-lg px-2.5 py-1 text-[10px] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value;
                        if (val && val.includes("@")) {
                          const usernameExtract = val.split("@")[0].trim();
                          setCurrentUser(usernameExtract);
                          setPasscode("SocialOAuthSeal_Secure_2026");
                          handleAuth("signup", usernameExtract);
                          setShowSocialChooser(null);
                        }
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById("custom-oauth-email") as HTMLInputElement;
                      if (input && input.value && input.value.includes("@")) {
                        const usernameExtract = input.value.split("@")[0].trim();
                        setCurrentUser(usernameExtract);
                        setPasscode("SocialOAuthSeal_Secure_2026");
                        handleAuth("signup", usernameExtract);
                        setShowSocialChooser(null);
                      }
                    }}
                    className="px-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-lg text-[9px] font-magic uppercase tracking-wider"
                  >
                    Possess
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
