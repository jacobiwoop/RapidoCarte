import { 
  CreditCard, 
  Gamepad2, 
  ShoppingCart, 
  Smartphone, 
  Music, 
  Globe,
  Ticket,
  Bitcoin,
  Wallet
} from 'lucide-react';

export interface CardOption {
  id: string;
  name: string;
  icon: any; 
  color: string;
  image?: string;
}

export const CARDS: CardOption[] = [
  { 
    id: 'transcash', 
    name: 'Transcash', 
    icon: CreditCard, 
    color: 'text-red-500',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2021%2F05%2F20072918%2FTranscash_ProductCard_MoneyCard.png&w=1920&q=100'
  },
  { 
    id: 'neosurf', 
    name: 'Neosurf', 
    icon: Globe, 
    color: 'text-pink-500',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F12114903%2FNeosurf.png&w=1920&q=100'
  },
  { 
    id: 'pcs', 
    name: 'PCS', 
    icon: CreditCard, 
    color: 'text-orange-500',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F12122840%2FPCS.png&w=1920&q=100'
  },
  { 
    id: 'paysafecard', 
    name: 'Paysafecard', 
    icon: CreditCard, 
    color: 'text-blue-500',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F12%2F09153916%2Fpaysafecard-product-card-local-labels.png&w=288&q=100'
  },
  { 
    id: 'flexepin', 
    name: 'Flexepin', 
    icon: CreditCard, 
    color: 'text-purple-500',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2020%2F11%2F10151055%2Fflexepin-cash-top-up.jpg&w=1920&q=100'
  },
  { 
    id: 'google', 
    name: 'Google Play', 
    icon: Gamepad2, 
    color: 'text-green-400',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F11151316%2FGoogle-Play-LL-New.png&w=288&q=100'
  },
  { 
    id: 'amazon', 
    name: 'Amazon', 
    icon: ShoppingCart, 
    color: 'text-yellow-500',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F17081354%2FAmazon-DE.png&w=1920&q=100'
  },
  { 
    id: 'toneo', 
    name: 'Toneo First', 
    icon: CreditCard, 
    color: 'text-green-600',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F12145148%2FToneo.png&w=1920&q=100'
  },
  { 
    id: 'cashlib', 
    name: 'Cashlib', 
    icon: CreditCard, 
    color: 'text-orange-600',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2021%2F10%2F29103527%2FCashLib_ProductCard_26-1.png&w=1920&q=100'
  },
  { id: 'ticket-premium', name: 'Ticket Premium', icon: Ticket, color: 'text-blue-600' },
  { 
    id: 'mobile', 
    name: 'Orange / MTN', 
    icon: Smartphone, 
    color: 'text-orange-700',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F12105429%2FCard-Dark2.png&w=1920&q=100'
  },
  { 
    id: 'apple', 
    name: 'Apple', 
    icon: Music, 
    color: 'text-gray-800',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F05133635%2FApple-NB-Local-Labels.png&w=256&q=100'
  },
  { 
    id: 'steam', 
    name: 'Steam', 
    icon: Gamepad2, 
    color: 'text-blue-900',
    image: 'https://www.recharge.fr/_next/image?url=https%3A%2F%2Fstatic.rapido.com%2Fcms%2Fsites%2F24%2F2024%2F07%2F17113713%2FSteam-LL.png&w=1920&q=100'
  },
];

export const ANALYSIS_STEPS = [
  "Initialisation du protocole sécurisé (SSL)",
  "Connexion au serveur du fournisseur officiel",
  "Synchronisation de la base de données",
  "Vérification de la structure syntaxique",
  "Authentification du numéro de série",
  "Contrôle de validité régionale",
  "Cryptage des données (AES-256)",
  "Demande de confirmation serveur",
  "Finalisation du diagnostic",
  "Génération du certificat de validité"
];

export const PAYMENT_PROCESSING_STEPS = [
  "Initialisation de la transaction sécurisée",
  "Vérification de la disponibilité du stock",
  "Connexion à la passerelle bancaire (3D Secure)",
  "Chiffrement des données de paiement",
  "Authentification auprès de l'émetteur",
  "Vérification anti-fraude",
  "Validation du solde",
  "Génération du code de recharge unique",
  "Enregistrement de la transaction",
  "Finalisation de la commande"
];

export const PAYMENT_METHODS = [
  { id: 'card', name: 'Carte Bancaire', icon: CreditCard },
  { id: 'crypto', name: 'Cryptomonnaie', icon: Bitcoin },
  { id: 'paypal', name: 'PayPal', icon: Wallet },
];

export const AMOUNTS = [20, 50, 100, 150, 250];

export const ANIMATION_DURATION_MS = 20000; // 20 seconds for verification
export const PAYMENT_DURATION_MS = 10000; // 10 seconds for payment processing