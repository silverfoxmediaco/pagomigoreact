// src/context/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionary
const translations = {
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    sendRequest: 'Send/Request',
    billPay: 'Bill Pay',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    
    // Home page
    heroTitle: 'Send money with intelligence, security and speed.',
    heroSubtitle: 'The only Digital Wallet You Need.',
    sendRequestCTA: 'Send/Request Payment',
    joinNowCTA: 'Join Now',
    joinMessage: 'Join now to start sending and receiving money.',
    shopAnywhere: 'Shop Anywhere Using Pagomigo!',
    pay: 'Pay',
    Easier: 'Easier',
    // Features
    sendMoney: 'Send Money',
    sendMoneyDesc: 'Send money to friends and family instantly, no matter where they are.',
    requestMoney: 'Request Money',
    requestMoneyDesc: 'Request money from anyone, anywhere, with just a few taps.',
    payBills: 'Pay Bills',
    payBillsDesc: 'Pay your bills directly from your Pagomigo wallet, hassle-free.',
    features: 'Features',
    
    // Debit card section
    debitCardTitle: 'Use Your Pagomigo Debit Card Anywhere',
    debitCardDesc: 'Shop online or in-store, pay bills, and access your money instantly with your Pagomigo debit card. Your card is accepted wherever Mastercard or Visa is accepted.',
    instantAccess: 'Instant Access',
    instantAccessDesc: 'Use your card to make purchases or withdraw cash from ATMs across the U.S.',
    touchlessPayments: 'Touchless Payments',
    touchlessPaymentsDesc: 'Scan a QR code or tap your phone to pay securely using NFC technology.',
    billPayFeature: 'Bill Pay',
    billPayFeatureDesc: 'Pay utility bills, rent, and more directly from your Pagomigo wallet.',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    myProfile: 'My Profile',
    editProfile: 'Edit Profile',
    accountBalance: 'Account Balance',
    kycStatus: 'KYC Status',
    accountCreated: 'Account Created',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    verified: 'Verified',
    unverified: 'Unverified',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    
    // Money Mover
    availableBalance: 'Available Balance',
    bankTransfer: 'Bank Transfer',
    recipientPhone: 'Recipient Phone',
    countryCode: 'Country Code (e.g., MX)',
    amountUSD: 'Amount in USD',
    send: 'Send',
    sending: 'Sending...',
    usernameOrPhone: 'Username or Phone',
    reasonNote: 'Reason / Note',
    request: 'Request',
    requesting: 'Requesting...',
    
    // Bill Pay
    billPayTitle: 'Bill Pay',
    utilities: 'Utilities',
    utilitiesDesc: 'Pay your utilities with ease.',
    payElectricity: 'Pay Electricity',
    payWater: 'Pay Water',
    payInternet: 'Pay Internet',
    payGas: 'Pay Gas',
    rentMortgage: 'Rent / Mortgage',
    rentMortgageDesc: 'Pay your rent or mortgage securely and on time.',
    payMortgage: 'Pay Mortgage',
    payRent: 'Pay Rent',
    carTruckLoan: 'Car / Truck Loan',
    automotiveDesc: 'Manage your automotive loans & Insurance with ease.',
    payAutoLoan: 'Pay Auto Loan',
    payBikeLoan: 'Pay Bike Loan',
    payInsurance: 'Pay Insurance',
    processing: 'Processing...',
    
    // Fees Page
    feesTitle: 'Pagomigo Fees & Pricing',
    feesSubtitle: 'Transparent pricing designed around Trust.',
    accountCardServices: 'Account & Card Services',
    accountManagement: 'Account Management',
    openingAccount: 'Opening a Pagomigo account',
    monthlyMaintenance: 'Monthly maintenance fee',
    noMonthlyFees: '$0 (No monthly fees)',
    accountClosure: 'Account closure',
    debitCardServices: 'Debit Card Services',
    cardIssuance: 'Card issuance (first card)',
    replacementCard: 'Replacement card',
    expeditedDelivery: 'Expedited card delivery',
    cardActivation: 'Card activation',
    moneyTransfers: 'Money Transfers',
    domesticTransfers: 'Domestic Transfers (Within US)',
    pagoToPago: 'Pagomigo to Pagomigo',
    bankTransfers: 'Bank account transfers (standard)',
    instantTransfers: 'Instant transfers',
    perTransaction: 'per transaction',
    internationalTransfers: 'International Transfers',
    toMexico: 'To Mexico',
    standardProcessing: 'Standard processing',
    fixedFee: 'fixed fee',
    expressDelivery: 'Express delivery (under 30 minutes)',
    additional: 'Additional',
    toCentralAmerica: 'To Central America',
    toSouthAmerica: 'To South America',
    transferLimits: 'Transfer Limits',
    dailyLimit: 'Daily limit',
    monthlyLimit: 'Monthly limit',
    singleTransaction: 'Single transaction (no verification)',
    atmCashServices: 'ATM & Cash Services',
    atmWithdrawals: 'ATM Withdrawals',
    inNetworkAtms: 'In-network ATMs',
    upToFourPerMonth: '(up to 4 per month)',
    outOfNetworkAtms: 'Out-of-network ATMs',
    internationalAtm: 'International ATM usage',
    foreignBankFees: '+ foreign bank fees',
    cashServices: 'Cash Services',
    cashDeposits: 'Cash deposits at partner locations',
    upTo500Month: '(up to $500/month, then $1.99)',
    mobileCheckDeposits: 'Mobile check deposits',
    physicalCheckDeposits: 'Physical check deposits',
    perCheck: 'per check',
    currencyExchange: 'Currency Exchange',
    usdToMxn: 'USD to Mexican Peso',
    marketRateSpread: 'Market rate + 2.0% spread',
    allOtherCurrencies: 'All other currencies',
    marketRateSpreadOther: 'Market rate + 2.5% spread',
    paymentMethods: 'Payment Methods',
    bankAccountFunding: 'Bank account funding',
    debitCardFunding: 'Debit card funding',
    creditCardFunding: 'Credit card funding',
    fixedFeesByCurrency: 'Fixed Fees by Currency (International Transfers)',
    waysToSave: 'Ways to Save Money',
    freeServicesToMaximize: 'Free Services to Maximize',
    sendToOtherUsers: 'Send money to other Pagomigo users',
    useInNetworkAtms: 'Use in-network ATMs for cash withdrawals',
    fundFromBank: 'Fund transfers from your bank account, not cards',
    useMobileDeposit: 'Use mobile check deposit instead of physical deposits',
    scheduleBillPayments: 'Schedule bill payments in advance (not same-day)',
    moneySavingTips: 'Money-Saving Tips',
    bundleTransfers: 'Bundle international transfers to reduce per-transaction fees',
    monitorRates: 'Monitor exchange rates for optimal transfer timing',
    useStandardProcessing: 'Use standard processing instead of express when possible',
    freeDepositsUnder500: 'Take advantage of free cash deposits under $500/month',
    useQrPayments: 'Use QR code payments instead of card swipes',
    feeScheduleNotes: 'Fee Schedule Notes',
    feesSubjectToChange: 'All fees are subject to change with 30 days written notice',
    exchangeRatesUpdated: 'Exchange rates are updated in real-time during business hours',
    sameDayServices: 'Same-day services available Monday-Friday 8 AM - 8 PM EST',
    competitiveAdvantage: 'Competitive Advantage',
    lowerFeesToMexico: 'Lower fees to Mexico vs traditional remittance (3-6% + $5-15)',
    fasterDelivery: 'Faster delivery times (30 minutes vs 1-3 days)',
    noMonthlyMaintenanceFees: 'No monthly maintenance fees',
    multiLanguageSupport: 'Multi-language customer support',
    questionsAboutFees: 'For questions about fees:',
    contactSupport: 'Contact customer support at',
    transparencyNote: 'Pagomigo is committed to transparent pricing with no hidden fees. All costs are clearly displayed before you complete any transaction.',
    free: 'FREE',
    
    // Common
    notProvided: 'Not provided',
    unknown: 'Unknown',
    loading: 'Loading...',
    error: 'Error'
  },
  es: {
    // Navigation
    home: 'Inicio',
    dashboard: 'Panel',
    sendRequest: 'Enviar/Solicitar',
    billPay: 'Pagar Facturas',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    
    // Home page
    heroTitle: 'Envía dinero con inteligencia, seguridad y velocidad.',
    heroSubtitle: 'La única Billetera Digital que Necesitas.',
    sendRequestCTA: 'Enviar/Solicitar Pago',
    joinNowCTA: 'Únete Ahora',
    joinMessage: 'Únete ahora para empezar a enviar y recibir dinero.',
    shopAnywhere: '¡Compra en Cualquier Lugar Usando Pagomigo!',
    pay: 'Pagar',
    Easier: 'Más Fácil',
    
    // Features
    sendMoney: 'Enviar Dinero',
    sendMoneyDesc: 'Envía dinero a amigos y familiares al instante, sin importar dónde se encuentren.',
    requestMoney: 'Solicitar Dinero',
    requestMoneyDesc: 'Solicita dinero a cualquier persona, en cualquier lugar, con solo unos toques.',
    payBills: 'Pagar Facturas',
    payBillsDesc: 'Paga tus facturas directamente desde tu billetera Pagomigo, sin complicaciones.',
    features: 'Características',
    
    // Debit card section
    debitCardTitle: 'Usa tu Tarjeta de Débito Pagomigo en Cualquier Lugar',
    debitCardDesc: 'Compra en línea o en tienda, paga facturas y accede a tu dinero al instante con tu tarjeta de débito Pagomigo. Tu tarjeta es aceptada donde sea que se acepte Mastercard o Visa.',
    instantAccess: 'Acceso Instantáneo',
    instantAccessDesc: 'Usa tu tarjeta para hacer compras o retirar efectivo de cajeros automáticos en todo EE.UU.',
    touchlessPayments: 'Pagos Sin Contacto',
    touchlessPaymentsDesc: 'Escanea un código QR o toca tu teléfono para pagar de forma segura usando tecnología NFC.',
    billPayFeature: 'Pagar Facturas',
    billPayFeatureDesc: 'Paga facturas de servicios públicos, renta y más directamente desde tu billetera Pagomigo.',
    
    // Dashboard
    welcomeBack: 'Bienvenido de vuelta',
    myProfile: 'Mi Perfil',
    editProfile: 'Editar Perfil',
    accountBalance: 'Saldo de Cuenta',
    kycStatus: 'Estado KYC',
    accountCreated: 'Cuenta Creada',
    phone: 'Teléfono',
    email: 'Correo',
    address: 'Dirección',
    verified: 'Verificado',
    unverified: 'No Verificado',
    completed: 'Completado',
    pending: 'Pendiente',
    failed: 'Falló',
    
    // Money Mover
    availableBalance: 'Saldo Disponible',
    bankTransfer: 'Transferencia Bancaria',
    recipientPhone: 'Teléfono del Destinatario',
    countryCode: 'Código de País (ej. MX)',
    amountUSD: 'Cantidad en USD',
    send: 'Enviar',
    sending: 'Enviando...',
    usernameOrPhone: 'Usuario o Teléfono',
    reasonNote: 'Razón / Nota',
    request: 'Solicitar',
    requesting: 'Solicitando...',
    
    // Bill Pay
    billPayTitle: 'Pagar Facturas',
    utilities: 'Servicios Públicos',
    utilitiesDesc: 'Paga tus servicios públicos con facilidad.',
    payElectricity: 'Pagar Electricidad',
    payWater: 'Pagar Agua',
    payInternet: 'Pagar Internet',
    payGas: 'Pagar Gas',
    rentMortgage: 'Renta / Hipoteca',
    rentMortgageDesc: 'Paga tu renta o hipoteca de forma segura y a tiempo.',
    payMortgage: 'Pagar Hipoteca',
    payRent: 'Pagar Renta',
    carTruckLoan: 'Préstamo de Auto / Camión',
    automotiveDesc: 'Administra tus préstamos automotrices y seguros con facilidad.',
    payAutoLoan: 'Pagar Préstamo Auto',
    payBikeLoan: 'Pagar Préstamo Moto',
    payInsurance: 'Pagar Seguro',
    processing: 'Procesando...',
    
    // Fees Page
    feesTitle: 'Tarifas y Precios de Pagomigo',
    feesSubtitle: 'Precios transparentes diseñados en torno a la Confianza.',
    accountCardServices: 'Servicios de Cuenta y Tarjeta',
    accountManagement: 'Gestión de Cuenta',
    openingAccount: 'Abrir una cuenta Pagomigo',
    monthlyMaintenance: 'Tarifa de mantenimiento mensual',
    noMonthlyFees: '$0 (Sin tarifas mensuales)',
    accountClosure: 'Cierre de cuenta',
    debitCardServices: 'Servicios de Tarjeta de Débito',
    cardIssuance: 'Emisión de tarjeta (primera tarjeta)',
    replacementCard: 'Tarjeta de reemplazo',
    expeditedDelivery: 'Entrega acelerada de tarjeta',
    cardActivation: 'Activación de tarjeta',
    moneyTransfers: 'Transferencias de Dinero',
    domesticTransfers: 'Transferencias Domésticas (Dentro de EE.UU.)',
    pagoToPago: 'Pagomigo a Pagomigo',
    bankTransfers: 'Transferencias de cuenta bancaria (estándar)',
    instantTransfers: 'Transferencias instantáneas',
    perTransaction: 'por transacción',
    internationalTransfers: 'Transferencias Internacionales',
    toMexico: 'A México',
    standardProcessing: 'Procesamiento estándar',
    fixedFee: 'tarifa fija',
    expressDelivery: 'Entrega express (menos de 30 minutos)',
    additional: 'Adicional',
    toCentralAmerica: 'A Centroamérica',
    toSouthAmerica: 'A Sudamérica',
    transferLimits: 'Límites de Transferencia',
    dailyLimit: 'Límite diario',
    monthlyLimit: 'Límite mensual',
    singleTransaction: 'Transacción única (sin verificación)',
    atmCashServices: 'Servicios de Cajero y Efectivo',
    atmWithdrawals: 'Retiros de Cajero',
    inNetworkAtms: 'Cajeros de la red',
    upToFourPerMonth: '(hasta 4 por mes)',
    outOfNetworkAtms: 'Cajeros fuera de la red',
    internationalAtm: 'Uso de cajero internacional',
    foreignBankFees: '+ tarifas del banco extranjero',
    cashServices: 'Servicios de Efectivo',
    cashDeposits: 'Depósitos en efectivo en ubicaciones asociadas',
    upTo500Month: '(hasta $500/mes, luego $1.99)',
    mobileCheckDeposits: 'Depósitos de cheques móviles',
    physicalCheckDeposits: 'Depósitos de cheques físicos',
    perCheck: 'por cheque',
    currencyExchange: 'Cambio de Moneda',
    usdToMxn: 'USD a Peso Mexicano',
    marketRateSpread: 'Tasa de mercado + 2.0% diferencial',
    allOtherCurrencies: 'Todas las demás monedas',
    marketRateSpreadOther: 'Tasa de mercado + 2.5% diferencial',
    paymentMethods: 'Métodos de Pago',
    bankAccountFunding: 'Financiamiento con cuenta bancaria',
    debitCardFunding: 'Financiamiento con tarjeta de débito',
    creditCardFunding: 'Financiamiento con tarjeta de crédito',
    fixedFeesByCurrency: 'Tarifas Fijas por Moneda (Transferencias Internacionales)',
    waysToSave: 'Formas de Ahorrar Dinero',
    freeServicesToMaximize: 'Servicios Gratuitos para Maximizar',
    sendToOtherUsers: 'Enviar dinero a otros usuarios de Pagomigo',
    useInNetworkAtms: 'Usar cajeros de la red para retiros de efectivo',
    fundFromBank: 'Financiar transferencias desde tu cuenta bancaria, no tarjetas',
    useMobileDeposit: 'Usar depósito móvil de cheques en lugar de depósitos físicos',
    scheduleBillPayments: 'Programar pagos de facturas con anticipación (no el mismo día)',
    moneySavingTips: 'Consejos para Ahorrar Dinero',
    bundleTransfers: 'Agrupar transferencias internacionales para reducir tarifas por transacción',
    monitorRates: 'Monitorear tipos de cambio para el momento óptimo de transferencia',
    useStandardProcessing: 'Usar procesamiento estándar en lugar de express cuando sea posible',
    freeDepositsUnder500: 'Aprovechar depósitos gratuitos de efectivo bajo $500/mes',
    useQrPayments: 'Usar pagos con código QR en lugar de deslizar tarjetas',
    feeScheduleNotes: 'Notas del Programa de Tarifas',
    feesSubjectToChange: 'Todas las tarifas están sujetas a cambios con 30 días de aviso por escrito',
    exchangeRatesUpdated: 'Los tipos de cambio se actualizan en tiempo real durante las horas de oficina',
    sameDayServices: 'Servicios del mismo día disponibles lunes-viernes 8 AM - 8 PM EST',
    competitiveAdvantage: 'Ventaja Competitiva',
    lowerFeesToMexico: 'Tarifas más bajas a México vs remesas tradicionales (3-6% + $5-15)',
    fasterDelivery: 'Tiempos de entrega más rápidos (30 minutos vs 1-3 días)',
    noMonthlyMaintenanceFees: 'Sin tarifas de mantenimiento mensuales',
    multiLanguageSupport: 'Soporte al cliente multiidioma',
    questionsAboutFees: 'Para preguntas sobre tarifas:',
    contactSupport: 'Contacta soporte al cliente en',
    transparencyNote: 'Pagomigo se compromete con precios transparentes sin tarifas ocultas. Todos los costos se muestran claramente antes de completar cualquier transacción.',
    free: 'GRATIS',
    
    // Common
    notProvided: 'No proporcionado',
    unknown: 'Desconocido',
    loading: 'Cargando...',
    error: 'Error'
  }
};

export const LanguageProvider = ({ children }) => {
  // Try to get saved language from localStorage, default to Spanish
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('pagomigo-language');
    return savedLanguage || 'es';
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pagomigo-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isEnglish: language === 'en',
    isSpanish: language === 'es'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};