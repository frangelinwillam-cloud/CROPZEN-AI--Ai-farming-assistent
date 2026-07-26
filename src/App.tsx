import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic, MicOff, Volume2, VolumeX, Sun, Moon, Leaf, Droplets, Wind,
  Thermometer, ChevronRight, Star, AlertTriangle, TrendingUp, Download,
  Camera, Upload, MessageSquare, MapPin, RefreshCw, Play, Pause,
  RotateCcw, CheckCircle, Clock, Zap, BarChart3, Sprout, CloudRain,
  Home, Search, User, Settings, X, Send, ArrowLeft, ChevronDown,
  Shield, DollarSign, Globe, Phone, FileText, Wheat
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen =
  | "splash" | "language" | "location" | "login" | "dashboard" | "voice"
  | "processing" | "recommendation" | "explanation" | "weather"
  | "fertilizer" | "profit" | "disease" | "chat" | "schemes" | "profile" | "farmdetails";

type Language = {
  code: string; name: string; native: string; flag: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGUAGES: Language[] = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    greeting: "Good Morning, Farmer!",
    tagline: "Cropzen",
    sub: "Break the language barrier with AI",
    getStarted: "Get Started",
    guestMode: "Continue as Guest",
    cropRec: "Crop Recommendation",
    disease: "Disease Detection",
    weather: "Weather",
    profit: "Profit Estimator",
    fertilizer: "Fertilizer Guide",
    schemes: "Gov. Schemes",
    aiChat: "AI Chat",
    voice: "Voice Assistant",
    listening: "Listening...",
    tapMic: "Tap microphone to speak",
    askExample: "\"What crop should I grow?\"",
  },
  hi: {
    greeting: "शुभ प्रभात, किसान!",
    tagline: "AI कृषि सहायक",
    sub: "AI से भाषा की बाधा तोड़ें",
    getStarted: "शुरू करें",
    guestMode: "अतिथि के रूप में जारी रखें",
    cropRec: "फसल अनुशंसा",
    disease: "रोग पहचान",
    weather: "मौसम",
    profit: "लाभ अनुमानक",
    fertilizer: "उर्वरक गाइड",
    schemes: "सरकारी योजनाएं",
    aiChat: "AI चैट",
    voice: "वॉइस असिस्टेंट",
    listening: "सुन रहा हूं...",
    tapMic: "बोलने के लिए माइक्रोफोन दबाएं",
    askExample: "\"मुझे कौन सी फसल उगानी चाहिए?\"",
  },
  ta: {
    greeting: "காலை வணக்கம், விவசாயி!",
    tagline: "AI விவசாய உதவியாளர்",
    sub: "AI மூலம் மொழி தடையை உடையுங்கள்",
    getStarted: "தொடங்குங்கள்",
    guestMode: "விருந்தினராக தொடரவும்",
    cropRec: "பயிர் பரிந்துரை",
    disease: "நோய் கண்டறிதல்",
    weather: "வானிலை",
    profit: "லாப மதிப்பீடு",
    fertilizer: "உர வழிகாட்டி",
    schemes: "அரசு திட்டங்கள்",
    aiChat: "AI அரட்டை",
    voice: "குரல் உதவியாளர்",
    listening: "கேட்கிறேன்...",
    tapMic: "பேச மைக்கை தொடவும்",
    askExample: "\"நான் எந்த பயிரை வளர்க்க வேண்டும்?\"",
  },
  te: {
    greeting: "శుభోదయం, రైతు!",
    tagline: "AI వ్యవసాయ సహాయకుడు",
    sub: "AI తో భాషా అడ్డంకిని తొలగించండి",
    getStarted: "ప్రారంభించండి",
    guestMode: "అతిథిగా కొనసాగండి",
    cropRec: "పంట సిఫారసు",
    disease: "వ్యాధి గుర్తింపు",
    weather: "వాతావరణం",
    profit: "లాభ అంచనా",
    fertilizer: "ఎరువు గైడ్",
    schemes: "ప్రభుత్వ పథకాలు",
    aiChat: "AI చాట్",
    voice: "వాయిస్ అసిస్టెంట్",
    listening: "వింటున్నాను...",
    tapMic: "మాట్లాడటానికి మైక్ నొక్కండి",
    askExample: "\"నేను ఏ పంట వేయాలి?\"",
  },
};

function t(lang: string, key: string): string {
  return (TRANSLATIONS[lang] || TRANSLATIONS["en"])[key] || TRANSLATIONS["en"][key] || key;
}

// ─── Voice Hook ────────────────────────────────────────────────────────────────
function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);

  const startListening = useCallback((lang = "en-IN") => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.lang = lang;
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join("");
      setTranscript(t);
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    r.start();
    recognitionRef.current = r;
    setIsListening(true);
    setTranscript("");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, lang = "en-IN") => {
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.9;
    utter.pitch = 1;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  }, []);

  const stopSpeaking = useCallback(() => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  const replay = useCallback((text: string, lang = "en-IN") => {
    stopSpeaking();
    setTimeout(() => speak(text, lang), 100);
  }, [speak, stopSpeaking]);

  return { isListening, transcript, isSpeaking, startListening, stopListening, speak, stopSpeaking, replay, setTranscript };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function DarkToggle({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <button
      onClick={() => setDark(!dark)}
      style={{
        background: dark ? "var(--light-green)" : "var(--mint)",
        border: "1px solid var(--border)",
        borderRadius: "50%",
        width: 40, height: 40,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: "var(--forest)", transition: "all 0.2s"
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "50%", width: 40, height: 40,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: "var(--text)", transition: "all 0.2s"
    }}>
      <ArrowLeft size={18} />
    </button>
  );
}

// ─── Screen: Splash ────────────────────────────────────────────────────────────
function SplashScreen({ lang, dark, setDark, onGetStarted, onGuest, onLangPick }: {
  lang: string; dark: boolean; setDark: (v: boolean) => void;
  onGetStarted: () => void; onGuest: () => void; onLangPick: () => void;
}) {
  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", padding: "0 24px", background: "linear-gradient(160deg, var(--bg) 60%, var(--light-green) 100%)" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: 480, paddingTop: 20 }}>
        <button onClick={onLangPick} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "var(--text)", fontSize: 13, fontWeight: 600 }}>
          <Globe size={14} style={{ color: "var(--forest)" }} />
          {LANGUAGES.find(l => l.code === lang)?.flag} {LANGUAGES.find(l => l.code === lang)?.native}
        </button>
        <DarkToggle dark={dark} setDark={setDark} />
      </div>

      {/* Hero illustration */}
      <div className="animate-float" style={{ marginTop: 40, marginBottom: 8 }}>
        <div style={{ width: 180, height: 180, borderRadius: "50%", background: "linear-gradient(135deg, #e8f5e9, #c8e6c9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 40px rgba(26,107,60,0.2)" }}>
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="70" r="20" fill="#a5d6a7" />
            <rect x="47" y="30" width="6" height="42" rx="3" fill="#2e7d32" />
            <path d="M50 50 Q30 35 28 20 Q42 18 50 35" fill="#4caf50" />
            <path d="M50 45 Q70 30 72 15 Q58 13 50 30" fill="#66bb6a" />
            <path d="M50 42 Q55 25 70 22 Q70 38 50 42" fill="#81c784" />
            <ellipse cx="50" cy="88" rx="25" ry="8" fill="#a5d6a7" opacity="0.5" />
          </svg>
        </div>
      </div>

      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--forest)", textAlign: "center", margin: "8px 0 4px", letterSpacing: -0.5 }}>
        {t(lang, "tagline")}
      </h1>
      <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: 16, marginBottom: 48, lineHeight: 1.5 }}>
        {t(lang, "sub")}
      </p>

      {/* Feature pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 40 }}>
        {["🌾 Crop AI", "🎙 Voice First", "🌍 10 Languages", "🔬 Disease Detect", "💰 Profit Predict"].map(f => (
          <span key={f} className="tag badge-green" style={{ fontSize: 13 }}>{f}</span>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 12 }}>
        <button className="btn-primary" style={{ width: "100%", fontSize: 18, padding: 16 }} onClick={onGetStarted}>
          <Sprout size={20} /> {t(lang, "getStarted")}
        </button>
        <button className="btn-outline" style={{ width: "100%" }} onClick={onGuest}>
          {t(lang, "guestMode")}
        </button>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 32, textAlign: "center" }}>
        Powered by AI · Designed for every farmer
      </p>
    </div>
  );
}

// ─── Screen: Language ─────────────────────────────────────────────────────────
function LanguageScreen({ selected, onSelect, onBack }: {
  selected: string; onSelect: (c: string) => void; onBack: () => void;
}) {
  return (
    <div className="screen" style={{ padding: "24px 20px", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <BackBtn onClick={onBack} />
        <div>
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 800, margin: 0, color: "var(--text)" }}>Choose Language</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>Select your preferred language</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => onSelect(l.code)} style={{
            background: selected === l.code ? "var(--forest)" : "var(--card)",
            color: selected === l.code ? "white" : "var(--text)",
            border: `2px solid ${selected === l.code ? "var(--forest)" : "var(--border)"}`,
            borderRadius: 14, padding: "16px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
            fontFamily: "'Inter', sans-serif"
          }}>
            <span style={{ fontSize: 28 }}>{l.flag}</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{l.native}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{l.name}</div>
            </div>
          </button>
        ))}
      </div>

      <button className="btn-primary" style={{ width: "100%", marginTop: 24 }} onClick={onBack}>
        <CheckCircle size={18} /> Confirm Language
      </button>
    </div>
  );
}

// ─── Screen: Dashboard ────────────────────────────────────────────────────────
function DashboardScreen({ lang, dark, setDark, onNav }: {
  lang: string; dark: boolean; setDark: (v: boolean) => void;
  onNav: (s: Screen) => void;
}) {
  const quickCards = [
    { id: "recommendation", icon: "🌾", label: t(lang, "cropRec"), color: "#e8f5e9", accent: "#1a6b3c" },
    { id: "disease", icon: "🔬", label: t(lang, "disease"), color: "#fce4ec", accent: "#c62828" },
    { id: "weather", icon: "⛅", label: t(lang, "weather"), color: "#e3f2fd", accent: "#1565c0" },
    { id: "profit", icon: "💰", label: t(lang, "profit"), color: "#fff8e1", accent: "#c77700" },
    { id: "fertilizer", icon: "🧪", label: t(lang, "fertilizer"), color: "#f3e5f5", accent: "#6a1b9a" },
    { id: "schemes", icon: "🏛", label: t(lang, "schemes"), color: "#e0f7fa", accent: "#006064" },
    { id: "chat", icon: "🤖", label: t(lang, "aiChat"), color: "#e8eaf6", accent: "#283593" },
    { id: "voice", icon: "🎙", label: t(lang, "voice"), color: "#f1f8e9", accent: "#33691e" },
  ] as const;

  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, var(--forest) 0%, var(--forest-light) 100%)", padding: "28px 20px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", top: 40, right: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: 480, margin: "0 auto" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 2px" }}>👋 {t(lang, "greeting")}</p>
            <h1 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 26, fontWeight: 900, color: "white", margin: "0 0 4px" }}>
              {t(lang, "tagline")}
            </h1>
            <span className="tag" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 11 }}>
              ✅ AI Online
            </span>
          </div>
          <DarkToggle dark={dark} setDark={setDark} />
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
        {/* Weather card */}
        <div className="card" style={{ marginTop: -44, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}
          onClick={() => onNav("weather")} role="button" style2={{ cursor: "pointer" }}>
          <div style={{ fontSize: 40 }}>⛅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 28, fontWeight: 800, color: "var(--forest)", lineHeight: 1 }}>28°C</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 2 }}>Partly Cloudy · Coimbatore</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Droplets size={12} style={{ color: "#1565c0" }} /> 72% humidity
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <CloudRain size={12} style={{ color: "#0288d1" }} /> 12mm rain
              </span>
            </div>
          </div>
        </div>

        {/* Today's recommendation */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 20, background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)", border: "1px solid #c8e6c9", cursor: "pointer" }}
          onClick={() => onNav("recommendation")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--forest)", textTransform: "uppercase", letterSpacing: 0.5 }}>Today's Top Pick</span>
            <span className="tag badge-green">🤖 AI Recommended</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 48 }}>🌾</div>
            <div>
              <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 900, margin: "0 0 2px", color: "var(--forest)" }}>Rice (Samba)</h3>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>95% confidence · High yield season</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            <div style={{ flex: 1, background: "white", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Expected Yield</div>
              <div style={{ fontWeight: 700, color: "var(--forest)", fontSize: 15 }}>6.2 t/ha</div>
            </div>
            <div style={{ flex: 1, background: "white", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Est. Profit</div>
              <div style={{ fontWeight: 700, color: "#c77700", fontSize: 15 }}>₹45,000</div>
            </div>
            <div style={{ flex: 1, background: "white", borderRadius: 10, padding: "8px 12px" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Risk</div>
              <div style={{ fontWeight: 700, color: "#2e7d32", fontSize: 15 }}>Low 🟢</div>
            </div>
          </div>
        </div>

        {/* Quick actions grid */}
        <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 16, fontWeight: 800, margin: "0 0 12px", color: "var(--text)" }}>
          Quick Actions
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {quickCards.map(card => (
            <button key={card.id} onClick={() => onNav(card.id as Screen)} style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14,
              padding: "16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 10
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = card.color; (e.currentTarget as HTMLElement).style.borderColor = card.accent; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--card)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
              <span style={{ fontSize: 28 }}>{card.icon}</span>
              <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{card.label}</span>
            </button>
          ))}
        </div>

        {/* Voice CTA */}
        <button className="btn-primary" style={{ width: "100%", fontSize: 16 }} onClick={() => onNav("voice")}>
          <Mic size={20} /> Ask AI with Voice
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Voice ─────────────────────────────────────────────────────────────
function VoiceScreen({ lang, onBack, onResult }: {
  lang: string; onBack: () => void; onResult: (text: string) => void;
}) {
  const langMap: Record<string, string> = {
    en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN",
    kn: "kn-IN", ml: "ml-IN", mr: "mr-IN", bn: "bn-IN", gu: "gu-IN", pa: "pa-IN"
  };
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoice();

  const handleMic = () => {
    if (isListening) {
      stopListening();
      if (transcript) onResult(transcript);
    } else {
      startListening(langMap[lang] || "en-IN");
    }
  };

  return (
    <div className="screen" style={{ padding: "24px 20px", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", marginBottom: 40 }}>
        <BackBtn onClick={onBack} />
        <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 800, margin: 0, color: "var(--text)" }}>Voice Assistant</h2>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 15, textAlign: "center", marginBottom: 48 }}>
        {isListening ? t(lang, "listening") : t(lang, "tapMic")}
      </p>

      {/* Mic button with pulse rings */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
        {isListening && (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                position: "absolute", borderRadius: "50%", border: "2px solid var(--forest)",
                width: 80 + i * 40, height: 80 + i * 40,
                animation: `pulse-ring 1.5s ease-out ${i * 0.4}s infinite`, opacity: 0.3
              }} />
            ))}
          </>
        )}
        <button onClick={handleMic} style={{
          width: 100, height: 100, borderRadius: "50%", border: "none",
          background: isListening ? "#c62828" : "var(--forest)",
          color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(26,107,60,0.4)", transition: "all 0.2s",
          position: "relative", zIndex: 1
        }}>
          {isListening ? <MicOff size={40} /> : <Mic size={40} />}
        </button>
      </div>

      {/* Wave bars */}
      {isListening && (
        <div style={{ display: "flex", gap: 4, alignItems: "center", height: 50, marginBottom: 24 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="wave-bar" style={{
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.6 + Math.random() * 0.4}s`,
              background: "var(--forest)"
            }} />
          ))}
        </div>
      )}

      {/* Transcript */}
      {transcript && (
        <div className="card" style={{ padding: 16, width: "100%", marginBottom: 24 }}>
          <p style={{ color: "var(--text-muted)", fontSize: 11, margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>You said:</p>
          <p style={{ fontSize: 16, margin: 0, color: "var(--text)", fontWeight: 500 }}>"{transcript}"</p>
        </div>
      )}

      <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center", opacity: 0.7 }}>
        {t(lang, "askExample")}
      </p>

      {transcript && (
        <button className="btn-primary" style={{ marginTop: 24, width: "100%" }} onClick={() => onResult(transcript)}>
          <Zap size={18} /> Analyze with AI
        </button>
      )}

      {/* Quick phrases */}
      <div style={{ width: "100%", marginTop: 32 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, fontWeight: 600 }}>Try saying:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["What crop should I grow this season?", "Is my soil good for wheat?", "How much fertilizer do I need?"].map(phrase => (
            <button key={phrase} onClick={() => { setTranscript(phrase); }} style={{
              background: "var(--light-green)", border: "1px solid var(--border)", borderRadius: 10,
              padding: "10px 14px", cursor: "pointer", textAlign: "left", color: "var(--text)", fontSize: 13
            }}>
              💬 {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Processing ────────────────────────────────────────────────────────
function ProcessingScreen({ onDone }: { onDone: () => void }) {
  const steps = [
    { label: "Analyzing soil parameters...", icon: "🌱" },
    { label: "Checking weather conditions...", icon: "⛅" },
    { label: "Running AI model (XGBoost)...", icon: "🤖" },
    { label: "Comparing 50+ crop varieties...", icon: "🌾" },
    { label: "Generating detailed report...", icon: "📊" },
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < steps.length) {
      const t = setTimeout(() => setStep(s => s + 1), 700);
      return () => clearTimeout(t);
    } else {
      setTimeout(onDone, 500);
    }
  }, [step]);

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      {/* Spinner */}
      <div style={{ position: "relative", width: 100, height: 100, marginBottom: 32 }}>
        <div className="animate-spin-slow" style={{ width: 100, height: 100, borderRadius: "50%", border: "4px solid var(--light-green)", borderTopColor: "var(--forest)", position: "absolute" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🤖</div>
      </div>

      <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 24, fontWeight: 900, color: "var(--forest)", marginBottom: 8 }}>AI is Analyzing...</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Using Machine Learning + Weather Data</p>

      <div style={{ width: "100%", maxWidth: 380 }}>
        {steps.map((s, i) => (
          <div key={i} className="animate-fadeInUp" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
            opacity: i <= step ? 1 : 0.2, transition: "opacity 0.5s ease"
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: i < step ? "var(--forest)" : i === step ? "var(--gold)" : "var(--light-green)",
              fontSize: 14, transition: "background 0.5s"
            }}>
              {i < step ? "✓" : s.icon}
            </div>
            <span style={{ fontSize: 14, color: i <= step ? "var(--text)" : "var(--text-muted)", fontWeight: i === step ? 600 : 400 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="progress-bar-track" style={{ width: "100%", maxWidth: 380, marginTop: 24 }}>
        <div className="progress-bar-fill" style={{ width: `${(step / steps.length) * 100}%` }} />
      </div>
      <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>{Math.round((step / steps.length) * 100)}% complete</p>
    </div>
  );
}

// ─── Screen: Recommendation ────────────────────────────────────────────────────
function RecommendationScreen({ lang, onBack, onChat, speak, stopSpeaking, isSpeaking, replay }: {
  lang: string; onBack: () => void; onChat: () => void;
  speak: (t: string, l?: string) => void; stopSpeaking: () => void;
  isSpeaking: boolean; replay: (t: string, l?: string) => void;
}) {
  const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN" };
  const [isPlaying, setIsPlaying] = useState(false);

  const recommendation = `Rice variety Samba is recommended for your farm. With 95% confidence, AI predicts 6.2 tonnes per hectare yield. Expected profit is Rupees 45,000. Water requirement is high. Growing duration is 130 to 140 days. Best planting date is July 15th.`;

  const handleListen = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      speak(recommendation, langMap[lang] || "en-IN");
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    replay(recommendation, langMap[lang] || "en-IN");
    setIsPlaying(true);
  };

  useEffect(() => { if (!isSpeaking) setIsPlaying(false); }, [isSpeaking]);

  const metrics = [
    { label: "Confidence", value: "95%", icon: "🎯", color: "#1a6b3c" },
    { label: "Expected Yield", value: "6.2 t/ha", icon: "📦", color: "#1a6b3c" },
    { label: "Expected Profit", value: "₹45,000", icon: "💰", color: "#c77700" },
    { label: "Risk Level", value: "Low 🟢", icon: "🛡", color: "#1a6b3c" },
    { label: "Market Demand", value: "High", icon: "📈", color: "#1565c0" },
    { label: "Water Need", value: "High", icon: "💧", color: "#0288d1" },
    { label: "Growth Duration", value: "135 days", icon: "📅", color: "#6a1b9a" },
    { label: "Plant Date", value: "Jul 15", icon: "🌱", color: "#2e7d32" },
    { label: "Harvest Date", value: "Nov 28", icon: "🌾", color: "#e65100" },
    { label: "Fertilizer", value: "NPK 20-20-0", icon: "🧪", color: "#6a1b9a" },
  ];

  return (
    <div className="screen" style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, var(--forest), var(--forest-light))", padding: "24px 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto", marginBottom: 20 }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>AI Recommendation</h2>
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 72 }}>🌾</div>
          <div>
            <h1 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 36, fontWeight: 900, color: "white", margin: "0 0 4px" }}>Rice</h1>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "0 0 8px", fontSize: 15 }}>Variety: Samba · Kharif Season</p>
            <span className="tag" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 12 }}>
              🎯 95% AI Confidence
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
        {/* Voice controls */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 12px", fontWeight: 700, textTransform: "uppercase" }}>
            🔊 Listen to Recommendation
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleListen}>
              {isSpeaking ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Listen</>}
            </button>
            <button className="btn-outline" style={{ padding: "12px 16px" }} onClick={handleReplay}>
              <RotateCcw size={16} />
            </button>
            <button className="btn-outline" style={{ padding: "12px 16px" }} onClick={stopSpeaking}>
              <VolumeX size={16} />
            </button>
          </div>
          {isSpeaking && (
            <div style={{ display: "flex", gap: 3, alignItems: "center", height: 24, marginTop: 10 }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.06}s`, background: "var(--forest)" }} />
              ))}
            </div>
          )}
        </div>

        {/* Metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {metrics.map(m => (
            <div key={m.label} className="card" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{m.icon} {m.label}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 16, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Suitability bars */}
        <div className="card" style={{ padding: "16px 20px", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 12px" }}>Suitability Score</h3>
          {[
            { label: "Soil Nutrients", val: 92 },
            { label: "Weather Match", val: 88 },
            { label: "Market Demand", val: 95 },
            { label: "Water Availability", val: 78 },
          ].map(b => (
            <div key={b.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4, color: "var(--text)" }}>
                <span>{b.label}</span><span style={{ fontWeight: 700, color: "var(--forest)" }}>{b.val}%</span>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${b.val}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn-primary" style={{ width: "100%" }} onClick={onChat}>
            <MessageSquare size={18} /> Ask AI About This Crop
          </button>
          <button className="btn-outline" style={{ width: "100%" }}>
            <Download size={18} /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Weather ────────────────────────────────────────────────────────────
function WeatherScreen({ onBack }: { onBack: () => void }) {
  const forecast = [
    { day: "Mon", icon: "⛅", high: 30, low: 24, rain: 10 },
    { day: "Tue", icon: "🌧", high: 28, low: 23, rain: 60 },
    { day: "Wed", icon: "🌦", high: 29, low: 24, rain: 35 },
    { day: "Thu", icon: "☀️", high: 33, low: 26, rain: 5 },
    { day: "Fri", icon: "☀️", high: 34, low: 27, rain: 2 },
    { day: "Sat", icon: "⛅", high: 31, low: 25, rain: 15 },
    { day: "Sun", icon: "🌧", high: 27, low: 22, rain: 70 },
  ];
  const rainfallData = forecast.map(d => ({ day: d.day, rain: d.rain }));

  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, #1565c0, #1976d2)", padding: "24px 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto 20px" }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>Weather</h2>
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 72 }}>⛅</div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 64, fontWeight: 900, color: "white", lineHeight: 1 }}>28°</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>Partly Cloudy · Coimbatore, TN</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
            {[["💧", "72%", "Humidity"], ["🌬", "12km/h", "Wind"], ["🌧", "12mm", "Rainfall"]].map(([icon, val, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{icon}</div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{val}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        {/* 7-day forecast */}
        <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, margin: "0 0 12px" }}>7-Day Forecast</h3>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
          {forecast.map(d => (
            <div key={d.day} className="card" style={{ minWidth: 72, padding: "12px 8px", textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{d.day}</div>
              <div style={{ fontSize: 24, margin: "4px 0" }}>{d.icon}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 15 }}>{d.high}°</div>
              <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{d.low}°</div>
              <div style={{ color: "#1565c0", fontSize: 11, marginTop: 2 }}>{d.rain}%</div>
            </div>
          ))}
        </div>

        {/* Rainfall chart */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px" }}>Rainfall Probability (%)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={rainfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="rain" fill="#1976d2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert */}
        <div style={{ background: "#fff3e0", border: "1px solid #ffcc02", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={18} style={{ color: "#e65100", flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 700, color: "#e65100", fontSize: 13 }}>Heavy Rain Alert - Tuesday</div>
            <div style={{ color: "#bf360c", fontSize: 12, marginTop: 2 }}>60% chance of heavy rainfall. Consider delaying irrigation. Protect harvested crops.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Fertilizer ────────────────────────────────────────────────────────
function FertilizerScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, #6a1b9a, #9c27b0)", padding: "24px 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto 12px" }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>Fertilizer Guide</h2>
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 48 }}>🧪</span>
          <div>
            <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 900, color: "white", margin: "0 0 2px" }}>NPK 20-20-0</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: 0, fontSize: 13 }}>Recommended for Rice · Kharif Season</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        {/* NPK breakdown */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, margin: "0 0 12px" }}>Nutrient Requirements</h3>
          {[
            { label: "Nitrogen (N)", val: 80, unit: "kg/ha", color: "#2e7d32", note: "Primary growth nutrient" },
            { label: "Phosphorus (P)", val: 40, unit: "kg/ha", color: "#1565c0", note: "Root development" },
            { label: "Potassium (K)", val: 40, unit: "kg/ha", color: "#c77700", note: "Disease resistance" },
          ].map(n => (
            <div key={n.label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                <div>
                  <span style={{ fontWeight: 700, color: n.color }}>{n.label}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 6 }}>— {n.note}</span>
                </div>
                <span style={{ fontWeight: 700, color: n.color }}>{n.val} {n.unit}</span>
              </div>
              <div className="progress-bar-track">
                <div style={{ height: "100%", width: `${(n.val / 120) * 100}%`, background: n.color, borderRadius: 4, transition: "width 0.8s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Application schedule */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, margin: "0 0 12px" }}>Application Schedule</h3>
          {[
            { stage: "Basal (Before Transplanting)", dose: "DAP 100 kg/ha", timing: "Day 0" },
            { stage: "Tillering Stage", dose: "Urea 75 kg/ha", timing: "Day 21" },
            { stage: "Panicle Initiation", dose: "Urea 50 kg/ha + MOP 40 kg/ha", timing: "Day 55" },
            { stage: "Flowering Stage", dose: "Foliar micronutrient spray", timing: "Day 85" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--light-green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 12, color: "var(--forest)" }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{s.stage}</div>
                <div style={{ color: "var(--forest)", fontSize: 13, fontWeight: 600 }}>{s.dose}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>⏰ {s.timing}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Organic alternatives */}
        <div className="card" style={{ padding: 16, background: "var(--light-green)", border: "1px solid var(--mint)" }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, margin: "0 0 10px", color: "var(--forest)" }}>🌿 Organic Alternatives</h3>
          {["Vermicompost: 5 t/ha (replaces 50% chemical N)", "Green manure (Dhaincha): 8 t/ha", "Bio-fertilizers: Azospirillum + PSB"].map(a => (
            <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13 }}>
              <CheckCircle size={14} style={{ color: "var(--forest)", flexShrink: 0 }} />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Profit ────────────────────────────────────────────────────────────
function ProfitScreen({ onBack }: { onBack: () => void }) {
  const monthlyData = [
    { month: "Jul", cost: 8000, revenue: 0 },
    { month: "Aug", cost: 5000, revenue: 0 },
    { month: "Sep", cost: 4000, revenue: 0 },
    { month: "Oct", cost: 3000, revenue: 0 },
    { month: "Nov", cost: 2000, revenue: 72000 },
  ];

  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, #c77700, #f5a623)", padding: "24px 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto 16px" }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>Profit Estimator</h2>
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 48, fontWeight: 900, color: "white", lineHeight: 1 }}>₹45,000</div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 4 }}>Estimated Net Profit · Rice 1 ha</div>
          <span className="tag" style={{ background: "rgba(255,255,255,0.25)", color: "white", marginTop: 8, display: "inline-flex" }}>
            📈 +18% vs last season
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Revenue", value: "₹72,000", icon: "💰", color: "#2e7d32" },
            { label: "Total Cost", value: "₹27,000", icon: "💸", color: "#c62828" },
            { label: "Net Profit", value: "₹45,000", icon: "📈", color: "#c77700" },
            { label: "ROI", value: "167%", icon: "🎯", color: "#1565c0" },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: "14px" }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.icon} {c.label}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 20, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Revenue vs Cost chart */}
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px" }}>Revenue vs Cost Timeline</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#2e7d32" fill="#e8f5e9" strokeWidth={2} />
              <Area type="monotone" dataKey="cost" stroke="#c62828" fill="#fdecea" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost breakdown */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px" }}>Cost Breakdown</h3>
          {[
            { item: "Seeds", cost: 3500, pct: 13 },
            { item: "Fertilizers", cost: 6800, pct: 25 },
            { item: "Labor", cost: 8200, pct: 30 },
            { item: "Irrigation", cost: 4500, pct: 17 },
            { item: "Pesticides", cost: 2200, pct: 8 },
            { item: "Misc", cost: 1800, pct: 7 },
          ].map(c => (
            <div key={c.item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 12, width: 80, color: "var(--text)", fontWeight: 500 }}>{c.item}</span>
              <div style={{ flex: 1, height: 8, background: "var(--light-green)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${c.pct}%`, background: "var(--forest)", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)", width: 50, textAlign: "right" }}>₹{c.cost.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Disease Detection ────────────────────────────────────────────────
function DiseaseScreen({ onBack }: { onBack: () => void }) {
  const [analyzed, setAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 2000);
  };

  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, #c62828, #e53935)", padding: "24px 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>Disease Detection</h2>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        {!analyzed ? (
          <>
            <div style={{ background: "var(--light-green)", border: "2px dashed var(--forest)", borderRadius: 16, padding: 32, textAlign: "center", marginBottom: 16 }}>
              {analyzing ? (
                <div>
                  <div className="animate-spin-slow" style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid var(--light-green)", borderTopColor: "var(--forest)", margin: "0 auto 12px" }} />
                  <p style={{ color: "var(--forest)", fontWeight: 600 }}>Analyzing leaf image...</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🍃</div>
                  <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--forest)", margin: "0 0 4px" }}>Upload Leaf Image</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 20px" }}>Take a photo or upload from gallery for instant AI disease detection</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleAnalyze}>
                      <Camera size={16} /> Camera
                    </button>
                    <button className="btn-outline" style={{ flex: 1 }} onClick={handleAnalyze}>
                      <Upload size={16} /> Gallery
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{ padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 10px" }}>Detectable Diseases:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {["Blast", "Brown Spot", "Leaf Blight", "False Smut", "Sheath Rot", "Tungro Virus", "White Tip"].map(d => (
                  <span key={d} className="tag badge-green">{d}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card" style={{ padding: 16, border: "2px solid #c62828", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 48 }}>🍂</div>
                <div>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 900, margin: "0 0 4px", color: "#c62828" }}>Rice Blast</h3>
                  <span className="tag badge-red">⚠ 87% Confidence</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
                Magnaporthe oryzae fungal infection detected. Affects leaves, nodes, and panicles. Immediate treatment recommended.
              </p>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 12 }}>
              <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, margin: "0 0 10px" }}>💊 Treatment Plan</h3>
              {["Spray Tricyclazole 75WP @ 0.6g/L water", "Remove infected leaves immediately", "Improve field drainage", "Avoid excess nitrogen application"].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "#c62828", fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: 16, background: "#e8f5e9", border: "1px solid #c8e6c9" }}>
              <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, color: "var(--forest)", margin: "0 0 8px" }}>🛡 Prevention</h3>
              {["Use resistant varieties (IR64, Swarna)", "Treat seeds with Carbendazim before planting", "Maintain proper plant spacing"].map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                  <CheckCircle size={14} style={{ color: "var(--forest)", flexShrink: 0, marginTop: 1 }} />
                  <span>{p}</span>
                </div>
              ))}
            </div>

            <button className="btn-outline" style={{ width: "100%", marginTop: 12 }} onClick={() => setAnalyzed(false)}>
              <RefreshCw size={16} /> Scan Another Leaf
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Screen: Chat ──────────────────────────────────────────────────────────────
function ChatScreen({ lang, onBack, voice }: {
  lang: string; onBack: () => void;
  voice: ReturnType<typeof useVoice>;
}) {
  type Msg = { role: "user" | "ai"; text: string };
  const langMap: Record<string, string> = { en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN" };
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Namaste! I am your Cropzen. Ask me anything about crops, soil, weather, or farming techniques. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const aiResponses: Record<string, string> = {
    default: "Based on current weather and soil conditions, Rice is optimal for your region this season. The AI model analyzed temperature (28°C), humidity (72%), and rainfall patterns to make this recommendation.",
    profit: "For 1 hectare of Rice, expected revenue is ₹72,000. Total input cost is ₹27,000, giving you a net profit of ₹45,000. That's a 167% ROI — excellent for Kharif season.",
    fertilizer: "For Rice, apply NPK 20-20-0 at 80 kg N, 40 kg P, and 40 kg K per hectare. Split the nitrogen into 3 doses: at transplanting, 21 days, and 55 days after transplanting.",
    wheat: "Wheat is not recommended this season because the temperature (28°C) is too high. Wheat needs 15-20°C during grain filling. Rice, Maize, or Groundnut would be better choices.",
    irrigation: "Based on tomorrow's 60% rain forecast, I recommend skipping irrigation for the next 2 days. Rice at tillering stage needs 5cm standing water — check field levels on Wednesday.",
  };

  const getResponse = (msg: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes("profit") || lower.includes("money")) return aiResponses.profit;
    if (lower.includes("fertilizer") || lower.includes("npk")) return aiResponses.fertilizer;
    if (lower.includes("wheat")) return aiResponses.wheat;
    if (lower.includes("irrigat") || lower.includes("water")) return aiResponses.irrigation;
    return aiResponses.default;
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMsgs(m => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const response = getResponse(userMsg);
      setMsgs(m => [...m, { role: "ai", text: response }]);
      setTyping(false);
      voice.speak(response, langMap[lang] || "en-IN");
    }, 1200);
  };

  const handleVoiceMsg = () => {
    if (voice.isListening) {
      voice.stopListening();
      if (voice.transcript) {
        setInput(voice.transcript);
        voice.setTranscript("");
      }
    } else {
      voice.startListening(langMap[lang] || "en-IN");
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--forest)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackBtn onClick={onBack} />
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
        <div>
          <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, color: "white", fontSize: 15 }}>FarmAI Assistant</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#69f0ae" }} /> Online · Multilingual
          </div>
        </div>
        <button onClick={() => voice.stopSpeaking()} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "6px 10px", color: "white", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
          <VolumeX size={14} /> Mute
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            {m.role === "ai" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--light-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 4 }}>🤖</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "12px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "var(--forest)" : "var(--card)",
              color: m.role === "user" ? "white" : "var(--text)",
              border: m.role === "ai" ? "1px solid var(--border)" : "none",
              fontSize: 14, lineHeight: 1.5, boxShadow: "var(--shadow)"
            }}>
              {m.text}
              {m.role === "ai" && (
                <button onClick={() => voice.speak(m.text, langMap[lang] || "en-IN")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", color: "var(--forest)", cursor: "pointer", fontSize: 11, marginTop: 6, padding: 0, fontWeight: 600 }}>
                  <Volume2 size={12} /> Listen
                </button>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--light-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <div className="card" style={{ padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--forest)", animation: `wave 1s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Voice transcript preview */}
      {voice.isListening && voice.transcript && (
        <div style={{ padding: "8px 16px", background: "var(--light-green)", borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--forest)", fontStyle: "italic" }}>
          🎙 "{voice.transcript}"
        </div>
      )}

      {/* Quick prompts */}
      <div style={{ padding: "8px 16px", display: "flex", gap: 6, overflowX: "auto" }}>
        {["Which crop gives better profit?", "Why not wheat?", "How much fertilizer?", "Should I irrigate tomorrow?"].map(q => (
          <button key={q} onClick={() => setInput(q)} style={{
            background: "var(--light-green)", border: "1px solid var(--border)", borderRadius: 20, padding: "6px 12px",
            fontSize: 12, whiteSpace: "nowrap", cursor: "pointer", color: "var(--text)", flexShrink: 0, fontWeight: 500
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px 20px", background: "var(--card)", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
        <button onClick={handleVoiceMsg} style={{
          width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
          background: voice.isListening ? "#c62828" : "var(--light-green)",
          color: voice.isListening ? "white" : "var(--forest)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
        }}>
          {voice.isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about crops, soil, weather..."
          className="input-field" style={{ flex: 1 }}
        />
        <button onClick={send} style={{
          width: 44, height: 44, borderRadius: "50%", border: "none", flexShrink: 0,
          background: "var(--forest)", color: "white", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Government Schemes ────────────────────────────────────────────────
function SchemesScreen({ onBack }: { onBack: () => void }) {
  const schemes = [
    { name: "PM-KISAN", desc: "₹6,000/year income support in 3 equal installments to eligible farmers", category: "Income Support", status: "Active", icon: "🏛" },
    { name: "Pradhan Mantri Fasal Bima Yojana", desc: "Comprehensive crop insurance at subsidized premium rates for Kharif & Rabi", category: "Insurance", status: "Active", icon: "🛡" },
    { name: "KCC - Kisan Credit Card", desc: "Short-term credit for crop cultivation, post-harvest expenses up to ₹3 lakh", category: "Loan", status: "Active", icon: "💳" },
    { name: "Soil Health Card Scheme", desc: "Free soil testing and nutrient management recommendations every 2 years", category: "Subsidy", status: "Open", icon: "🧪" },
    { name: "PM Krishi Sinchai Yojana", desc: "Subsidy for micro-irrigation systems (drip & sprinkler) up to 55%", category: "Subsidy", status: "Open", icon: "💧" },
  ];

  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, #006064, #00838f)", padding: "24px 20px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>Government Schemes</h2>
        </div>
        <div style={{ maxWidth: 480, margin: "12px auto 0", display: "flex", gap: 8 }}>
          {["All", "Income", "Insurance", "Loan", "Subsidy"].map(cat => (
            <button key={cat} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 20, padding: "6px 12px", color: "white", cursor: "pointer", fontSize: 12 }}>{cat}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        <div style={{ background: "#e0f7fa", border: "1px solid #b2ebf2", borderRadius: 12, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10 }}>
          <MapPin size={16} style={{ color: "#006064", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 13, color: "#006064" }}>Showing schemes available in <strong>Tamil Nadu</strong> — based on your location</span>
        </div>

        {schemes.map((s, i) => (
          <div key={i} className="card" style={{ padding: "16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
                <div>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, fontWeight: 800, margin: "0 0 2px" }}>{s.name}</h3>
                  <span className="tag" style={{ background: "#e0f7fa", color: "#006064", fontSize: 10 }}>{s.category}</span>
                </div>
              </div>
              <span className={`tag ${s.status === "Active" ? "badge-green" : "badge-gold"}`} style={{ fontSize: 11, flexShrink: 0 }}>
                {s.status === "Active" ? "✅" : "📋"} {s.status}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px", lineHeight: 1.5 }}>{s.desc}</p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" style={{ flex: 1, fontSize: 13, padding: "10px" }}>
                <FileText size={14} /> Apply Now
              </button>
              <button className="btn-outline" style={{ flex: 1, fontSize: 13, padding: "10px" }}>
                Check Eligibility
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: Profile ────────────────────────────────────────────────────────────
function ProfileScreen({ lang, onBack, onLangPick, dark, setDark }: {
  lang: string; onBack: () => void; onLangPick: () => void;
  dark: boolean; setDark: (v: boolean) => void;
}) {
  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, var(--forest), var(--forest-light))", padding: "24px 20px 64px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>Profile</h2>
          <DarkToggle dark={dark} setDark={setDark} />
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>
        {/* Avatar card */}
        <div className="card" style={{ padding: 20, marginTop: -36, marginBottom: 16, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, var(--forest), var(--forest-light))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>👨‍🌾</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 18, fontWeight: 900, margin: "0 0 2px" }}>Ramesh Kumar</h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 6px" }}>📍 Coimbatore, Tamil Nadu</p>
            <div style={{ display: "flex", gap: 6 }}>
              <span className="tag badge-green">✅ Verified Farmer</span>
              <span className="tag badge-gold">⭐ 3 Seasons</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[["Farm Size", "2.5 ha", "🌾"], ["Crops Grown", "8", "🌱"], ["Profit Earned", "₹1.2L", "💰"]].map(([label, val, icon]) => (
            <div key={label} className="card" style={{ padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, color: "var(--forest)" }}>{val}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Settings list */}
        <div className="card" style={{ padding: "8px 0", marginBottom: 16 }}>
          {[
            { icon: <Globe size={18} />, label: "Language", value: LANGUAGES.find(l => l.code === lang)?.native, action: onLangPick },
            { icon: dark ? <Sun size={18} /> : <Moon size={18} />, label: "Dark Mode", value: dark ? "On" : "Off", action: () => setDark(!dark) },
            { icon: <Bell size={18} />, label: "Notifications", value: "Enabled" },
            { icon: <MapPin size={18} />, label: "Location", value: "Coimbatore, TN" },
            { icon: <Shield size={18} />, label: "Privacy & Security", value: "" },
            { icon: <Phone size={18} />, label: "Support", value: "1800-180-1551" },
          ].map((item, i) => (
            <button key={i} onClick={item.action} style={{
              width: "100%", background: "none", border: "none", padding: "14px 20px",
              display: "flex", alignItems: "center", gap: 14, cursor: item.action ? "pointer" : "default",
              borderBottom: i < 5 ? "1px solid var(--border)" : "none", color: "var(--text)"
            }}>
              <span style={{ color: "var(--forest)" }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: 14, textAlign: "left", fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{item.value}</span>
              {item.action && <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />}
            </button>
          ))}
        </div>

        <button className="btn-outline" style={{ width: "100%", borderColor: "#c62828", color: "#c62828" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Bell(props: { size: number }) {
  return <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}

// ─── Screen: Land Location ────────────────────────────────────────────────────
function LocationScreen({ lang, onBack, onContinue }: {
  lang: string; onBack: () => void; onContinue: (loc: LocationData) => void;
}) {
  const [locating, setLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [form, setForm] = useState({
    state: "", district: "", village: "", pincode: "", farmSize: "", unit: "hectares",
    lat: "", lon: ""
  });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const detectGPS = () => {
    setGpsStatus("loading");
    if (!navigator.geolocation) { setGpsStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          lat: pos.coords.latitude.toFixed(5),
          lon: pos.coords.longitude.toFixed(5),
          state: "Tamil Nadu",
          district: "Coimbatore",
          village: "Detected via GPS"
        }));
        setGpsStatus("done");
      },
      () => {
        setGpsStatus("error");
        setForm(f => ({ ...f, state: "Tamil Nadu", district: "Coimbatore", village: "Sulur" }));
      },
      { timeout: 6000 }
    );
  };

  const indianStates = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  const isValid = form.state && form.district && form.farmSize;

  return (
    <div className="screen" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, var(--forest), var(--forest-light))", padding: "24px 20px 40px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -40, right: -20, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          <BackBtn onClick={onBack} />
          <div>
            <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 22, fontWeight: 900, margin: 0, color: "white" }}>
              Where is your land?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "2px 0 0" }}>
              Help AI give accurate recommendations for your region
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 24px", flex: 1, marginTop: -16, width: "100%" }}>
        {/* GPS Card */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 15, margin: "0 0 2px", color: "var(--text)" }}>
                📡 Auto-Detect via GPS
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>Fastest way — tap to detect your exact location</p>
            </div>
            <button
              onClick={detectGPS}
              style={{
                background: gpsStatus === "done" ? "var(--forest)" : "var(--light-green)",
                border: `2px solid ${gpsStatus === "done" ? "var(--forest)" : "var(--border)"}`,
                borderRadius: 10, padding: "10px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                color: gpsStatus === "done" ? "white" : "var(--forest)",
                fontWeight: 700, fontSize: 13, flexShrink: 0, transition: "all 0.3s"
              }}
            >
              {gpsStatus === "loading" ? (
                <div className="animate-spin-slow" style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--light-green)", borderTopColor: "var(--forest)" }} />
              ) : gpsStatus === "done" ? (
                <><CheckCircle size={14} /> Located!</>
              ) : (
                <><MapPin size={14} /> Detect</>
              )}
            </button>
          </div>

          {gpsStatus === "done" && form.lat && (
            <div style={{ background: "var(--light-green)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "var(--forest)", display: "flex", gap: 6, alignItems: "center" }}>
              <MapPin size={12} />
              <span>📍 {form.lat}°N, {form.lon}°E · {form.district}, {form.state}</span>
            </div>
          )}
          {gpsStatus === "error" && (
            <div style={{ background: "#fff3e0", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#e65100" }}>
              ⚠ GPS unavailable — filled with sample data. You can edit below.
            </div>
          )}
        </div>

        {/* Manual form */}
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px", color: "var(--text)" }}>
            ✍ Enter Location Manually
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>State *</label>
              <select className="select-field" value={form.state} onChange={e => update("state", e.target.value)}>
                <option value="">— Select State —</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>District *</label>
                <input className="input-field" placeholder="e.g. Coimbatore" value={form.district} onChange={e => update("district", e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Pincode</label>
                <input className="input-field" placeholder="e.g. 641001" value={form.pincode} onChange={e => update("pincode", e.target.value)} type="number" maxLength={6} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Village / Town</label>
              <input className="input-field" placeholder="e.g. Sulur" value={form.village} onChange={e => update("village", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Farm size */}
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px", color: "var(--text)" }}>
            🌾 How big is your farm?
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, alignItems: "flex-end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Farm Size *</label>
              <input className="input-field" placeholder="e.g. 2.5" value={form.farmSize} onChange={e => update("farmSize", e.target.value)} type="number" step="0.1" min="0" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Unit</label>
              <select className="select-field" value={form.unit} onChange={e => update("unit", e.target.value)}>
                <option value="hectares">Hectares</option>
                <option value="acres">Acres</option>
                <option value="guntha">Guntha</option>
                <option value="bigha">Bigha</option>
              </select>
            </div>
          </div>
          {form.farmSize && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
              ≈ {form.unit === "acres" ? (parseFloat(form.farmSize) * 0.405).toFixed(2) + " ha" : form.unit === "hectares" ? (parseFloat(form.farmSize) * 2.47).toFixed(1) + " acres" : form.farmSize + " " + form.unit}
            </div>
          )}
        </div>

        {/* Why we need this */}
        <div style={{ background: "var(--gold-light)", border: "1px solid #ffe082", borderRadius: 12, padding: "12px 14px", marginBottom: 20, display: "flex", gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🤖</span>
          <p style={{ fontSize: 13, color: "#5d4037", margin: 0, lineHeight: 1.5 }}>
            AI uses your <strong>location</strong> to check local soil type, weather history, market prices, and government schemes specific to your region.
          </p>
        </div>

        <button
          className="btn-primary"
          style={{ width: "100%", fontSize: 17, padding: 16, opacity: isValid ? 1 : 0.5, cursor: isValid ? "pointer" : "not-allowed" }}
          onClick={() => isValid && onContinue(form as LocationData)}
          disabled={!isValid}
        >
          <Zap size={20} /> Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

type LocationData = {
  state: string; district: string; village: string;
  pincode: string; farmSize: string; unit: string; lat: string; lon: string;
};

// ─── Screen: Farm Details ─────────────────────────────────────────────────────
function FarmDetailsScreen({ onBack, onAnalyze }: { onBack: () => void; onAnalyze: () => void }) {
  const [form, setForm] = useState({ location: "Coimbatore, TN", size: "2.5", season: "Kharif", soil: "Clay Loam", n: "80", p: "40", k: "30", ph: "6.5", humidity: "72", temp: "28", rainfall: "1200" });

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="screen" style={{ paddingBottom: 80 }}>
      <div style={{ background: "linear-gradient(135deg, var(--forest), var(--forest-light))", padding: "24px 20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ fontFamily: "'Nunito',sans-serif", fontSize: 20, fontWeight: 800, margin: 0, color: "white" }}>Farm Details</h2>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px", color: "var(--forest)" }}>📍 Location & Farm</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Location / Village</label>
              <input className="input-field" value={form.location} onChange={e => update("location", e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Farm Size (ha)</label>
                <input className="input-field" value={form.size} onChange={e => update("size", e.target.value)} type="number" />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Season</label>
                <select className="select-field" value={form.season} onChange={e => update("season", e.target.value)}>
                  <option>Kharif</option><option>Rabi</option><option>Zaid</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>Soil Type</label>
              <select className="select-field" value={form.soil} onChange={e => update("soil", e.target.value)}>
                {["Clay", "Clay Loam", "Sandy Loam", "Sandy", "Loam", "Silty Clay", "Black Cotton Soil", "Red Laterite"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px", color: "var(--forest)" }}>🧪 Soil Nutrients</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["Nitrogen (N) kg/ha", "n"], ["Phosphorus (P) kg/ha", "p"], ["Potassium (K) kg/ha", "k"], ["Soil pH", "ph"]].map(([label, key]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                <input className="input-field" value={(form as any)[key]} onChange={e => update(key, e.target.value)} type="number" />
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 800, fontSize: 14, margin: "0 0 12px", color: "var(--forest)" }}>🌡 Climate Data</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[["Humidity %", "humidity"], ["Temp °C", "temp"], ["Rainfall mm", "rainfall"]].map(([label, key]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
                <input className="input-field" value={(form as any)[key]} onChange={e => update(key, e.target.value)} type="number" />
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary" style={{ width: "100%", fontSize: 18, padding: 16 }} onClick={onAnalyze}>
          <Zap size={20} /> Analyze Farm with AI
        </button>
      </div>
    </div>
  );
}

// ─── Bottom Navigation ─────────────────────────────────────────────────────────
function BottomNav({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const items = [
    { id: "dashboard" as Screen, icon: <Home size={22} />, label: "Home" },
    { id: "farmdetails" as Screen, icon: <Sprout size={22} />, label: "Farm" },
    { id: "voice" as Screen, icon: <Mic size={22} />, label: "Voice" },
    { id: "chat" as Screen, icon: <MessageSquare size={22} />, label: "Chat" },
    { id: "profile" as Screen, icon: <User size={22} />, label: "Profile" },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} className={active === item.id ? "active" : ""}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(false);
  const voice = useVoice();

  // Apply dark mode to root
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const mainScreens: Screen[] = ["dashboard", "farmdetails", "voice", "chat", "profile", "weather", "recommendation", "profit", "fertilizer", "disease", "schemes"];

  const handleLangSelect = (code: string) => {
    setLang(code);
    voice.speak(`Language set to ${LANGUAGES.find(l => l.code === code)?.name}. Welcome to Cropzen.`, code === "hi" ? "hi-IN" : code === "ta" ? "ta-IN" : "en-IN");
    setScreen("location");
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", position: "relative", background: "var(--bg)" }}>
      {screen === "splash" && (
        <SplashScreen lang={lang} dark={dark} setDark={setDark}
          onGetStarted={() => setScreen("language")}
          onGuest={() => setScreen("location")}
          onLangPick={() => setScreen("language")}
        />
      )}
      {screen === "location" && (
        <LocationScreen lang={lang} onBack={() => setScreen("splash")} onContinue={() => setScreen("dashboard")} />
      )}
      {screen === "language" && (
        <LanguageScreen selected={lang} onSelect={handleLangSelect} onBack={() => setScreen("splash")} />
      )}
      {screen === "dashboard" && (
        <>
          <DashboardScreen lang={lang} dark={dark} setDark={setDark} onNav={setScreen} />
          <BottomNav active="dashboard" onNav={setScreen} />
        </>
      )}
      {screen === "farmdetails" && (
        <>
          <FarmDetailsScreen onBack={() => setScreen("dashboard")} onAnalyze={() => setScreen("processing")} />
          <BottomNav active="farmdetails" onNav={setScreen} />
        </>
      )}
      {screen === "voice" && (
        <VoiceScreen lang={lang} onBack={() => setScreen("dashboard")} onResult={() => setScreen("processing")} />
      )}
      {screen === "processing" && (
        <ProcessingScreen onDone={() => setScreen("recommendation")} />
      )}
      {screen === "recommendation" && (
        <>
          <RecommendationScreen lang={lang} onBack={() => setScreen("dashboard")} onChat={() => setScreen("chat")}
            speak={voice.speak} stopSpeaking={voice.stopSpeaking} isSpeaking={voice.isSpeaking} replay={voice.replay}
          />
          <BottomNav active="recommendation" onNav={setScreen} />
        </>
      )}
      {screen === "weather" && (
        <>
          <WeatherScreen onBack={() => setScreen("dashboard")} />
          <BottomNav active="weather" onNav={setScreen} />
        </>
      )}
      {screen === "fertilizer" && (
        <>
          <FertilizerScreen onBack={() => setScreen("dashboard")} />
          <BottomNav active="fertilizer" onNav={setScreen} />
        </>
      )}
      {screen === "profit" && (
        <>
          <ProfitScreen onBack={() => setScreen("dashboard")} />
          <BottomNav active="profit" onNav={setScreen} />
        </>
      )}
      {screen === "disease" && (
        <>
          <DiseaseScreen onBack={() => setScreen("dashboard")} />
          <BottomNav active="disease" onNav={setScreen} />
        </>
      )}
      {screen === "chat" && (
        <ChatScreen lang={lang} onBack={() => setScreen("dashboard")} voice={voice} />
      )}
      {screen === "schemes" && (
        <>
          <SchemesScreen onBack={() => setScreen("dashboard")} />
          <BottomNav active="schemes" onNav={setScreen} />
        </>
      )}
      {screen === "profile" && (
        <>
          <ProfileScreen lang={lang} onBack={() => setScreen("dashboard")} onLangPick={() => setScreen("language")} dark={dark} setDark={setDark} />
          <BottomNav active="profile" onNav={setScreen} />
        </>
      )}
    </div>
  );
}
