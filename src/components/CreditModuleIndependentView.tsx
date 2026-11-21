import React, { useState, useEffect } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  User,
  Briefcase,
  CreditCard,
  TrendingUp,
  BarChart3,
  Scale,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Printer,
  FolderOpen,
  Plus,
  Trash2,
  Upload,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Eye
} from 'lucide-react';
import {
  ApplicationStatus,
  BusinessSector,
  CreditDestination,
  DocumentControlItem,
  DocumentType,
  DocumentVerificationStatus,
  FinancialObligation,
  FormalityType,
  InventoryItem,
  MaritalStatus,
  PaymentFrequency
} from '../types/evalua';
import {
  calculateAge,
  calculateBalanceSheet,
  calculateBusinessExpenses,
  calculateCashFlow,
  calculateCostOfSales,
  calculateFamilyExpenses,
  calculateFinancialRatios,
  calculateIncomeStatement,
  calculateIncomeTotals,
  calculatePaymentCapacity,
  calculateTotalObligations
} from '../utils/financialCalculations';

interface CreditModuleIndependentViewProps {
  moduleId:
    | 'solicitante'
    | 'negocio'
    | 'credito'
    | 'ingresos_gastos'
    | 'balance'
    | 'capacidad'
    | 'inventario_documentos'
    | 'conclusion';
}

const MODULE_META = [
  { id: 'solicitante', step: 1, short: 'Solicitante', title: '1. Datos del Solicitante', subtitle: 'Información personal, identidad y contacto del titular', icon: User, accent: 'text-[#1D63ED]', bg: 'bg-[#EFF6FF]', border: 'border-blue-200' },
  { id: 'negocio', step: 2, short: 'Negocio', title: '2. Negocio y Visita de Campo', subtitle: 'Actividad económica, formalidad y verificación presencial', icon: Briefcase, accent: 'text-[#16A34A]', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'credito', step: 3, short: 'Crédito', title: '3. Información Crediticia', subtitle: 'Condiciones solicitadas, plazo, destino y cuota referencial', icon: CreditCard, accent: 'text-[#8B5CF6]', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'ingresos_gastos', step: 4, short: 'Ingresos', title: '4. Ingresos, Costos y Gastos', subtitle: 'Cálculo automático de ingresos netos, costos y gastos familiares', icon: TrendingUp, accent: 'text-[#F59E0B]', bg: 'bg-amber-50', border: 'border-amber-200' },
  { id: 'balance', step: 5, short: 'Balance', title: '5. Estados Financieros y Balance General', subtitle: 'Balance general, patrimonio, garantías y estado de ganancias y pérdidas', icon: BarChart3, accent: 'text-[#0EA5E9]', bg: 'bg-sky-50', border: 'border-sky-200' },
  { id: 'capacidad', step: 6, short: 'Capacidad', title: '6. Capacidad de Pago y Obligaciones', subtitle: 'Flujo disponible, deudas vigentes, excedente post-cuota y ratios', icon: Scale, accent: 'text-[#16A34A]', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'inventario_documentos', step: 7, short: 'Documentos', title: '7. Inventario y Documentos de Sustento', subtitle: 'Inventario valorizado y carga de documentos recibidos y pendientes', icon: ClipboardList, accent: 'text-[#8B5CF6]', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'conclusion', step: 8, short: 'Conclusión', title: '8. Conclusión y Seguimiento', subtitle: 'Síntesis cualitativa, estado de solicitud e impresión PDF', icon: CheckCircle2, accent: 'text-[#F59E0B]', bg: 'bg-amber-50', border: 'border-amber-200' }
] as const;

export const CreditModuleIndependentView: React.FC<CreditModuleIndependentViewProps> = ({ moduleId }) => {
  const {
    dossiers,
    selectedDossierId,
    setSelectedDossierId,
    setActiveTab,
    setIsPrintModalOpen,
    openDossierWithTab,
    updateDossier,
    updateDossierStatus,
    updateDossierDocuments,
    updateDossierObligations,
    updateDossierInventory,
    updateDossierVisit,
    updateDossierQualitative,
    currentUser
  } = useEvalua();

  const activeDossier = dossiers.find((d) => d.id === selectedDossierId) || dossiers[0];
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Step 1 state (Personal)
  const [personalForm, setPersonalForm] = useState({
    firstNames: '',
    paternalSurname: '',
    maternalSurname: '',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
    birthDate: '',
    maritalStatus: 'Soltero(a)' as MaritalStatus,
    dependentsCount: 0,
    homeAddress: '',
    district: '',
    province: '',
    department: '',
    phone: '',
    email: ''
  });

  // Step 2 state (Business & Visit)
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    activityType: '',
    sector: 'Comercio' as BusinessSector,
    businessAddress: '',
    operatingTimeYears: 0,
    operatingTimeMonths: 0,
    businessType: 'Propio' as 'Propio' | 'Alquilado' | 'Familiar' | 'Puesto de Mercado' | 'Ambulatorio' | 'Otro',
    employeesCount: 0,
    formality: 'Formal (RUC 10 / 20)' as FormalityType,
    activityDescription: ''
  });
  const [visitForm, setVisitForm] = useState({
    visitDate: '',
    addressVisited: '',
    personContacted: '',
    informationVerified: '',
    observations: ''
  });

  // Step 3 state (Credit Terms)
  const [termsForm, setTermsForm] = useState({
    creditProduct: 'Microcrédito Capital de Trabajo',
    requestedAmount: 0,
    termMonths: 12,
    paymentFrequency: 'Mensual' as PaymentFrequency,
    estimatedPaymentDate: '',
    destination: 'Capital de trabajo' as CreditDestination,
    destinationDescription: '',
    proposedInstallment: 0
  });

  // Step 4 state (Income, Cost of Sales, Business Expenses, Family Expenses)
  const [econForm, setEconForm] = useState({
    monthlySales: 0,
    otherBusinessIncome: 0,
    salaryIncome: 0,
    feesIncome: 0,
    rentalIncome: 0,
    otherPersonalIncome: 0,
    merchandisePurchases: 0,
    rawMaterials: 0,
    freightCost: 0,
    transportSalesCost: 0,
    otherSalesCosts: 0,
    rent: 0,
    utilities: 0,
    internetPhone: 0,
    payroll: 0,
    transportBusiness: 0,
    maintenance: 0,
    advertising: 0,
    commissions: 0,
    otherBusinessExpenses: 0,
    food: 0,
    housing: 0,
    education: 0,
    health: 0,
    transport: 0,
    utilitiesFamily: 0,
    communication: 0,
    otherFamilyExpenses: 0
  });

  // Step 5 state (Balance Sheet, Equity & Guarantees)
  const [balanceForm, setBalanceForm] = useState({
    cash: 0,
    bankDeposits: 0,
    inventoryValue: 0,
    accountsReceivableValue: 0,
    otherCurrentAssets: 0,
    landValue: 0,
    housingValue: 0,
    commercialPremisesValue: 0,
    vehiclesValue: 0,
    machineryValue: 0,
    equipmentValue: 0,
    otherNonCurrentAssets: 0,
    shortTermCredits: 0,
    suppliersPayable: 0,
    otherCurrentLiabilities: 0,
    longTermCredits: 0,
    otherNonCurrentLiabilities: 0
  });

  // Step 6 state (New Obligation)
  const [newObligation, setNewObligation] = useState({
    entityName: '',
    creditType: 'Microempresa',
    originalAmount: 0,
    currentBalance: 0,
    monthlyInstallment: 0,
    totalInstallments: 12,
    paidInstallments: 0,
    status: 'Al día' as FinancialObligation['status']
  });

  // Step 7 state (New Inventory & New Document)
  const [newInv, setNewInv] = useState({
    productName: '',
    quantity: 1,
    unitCost: 0,
    sellingPrice: 0
  });
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentControlItem['documentType']>('Documentación del negocio');

  // Step 8 state (Qualitative & Status)
  const [qualForm, setQualForm] = useState({
    activityExperience: '',
    businessStability: '',
    businessOrganization: '',
    referencesSummary: '',
    visitSummary: '',
    analystComments: '',
    analystConclusion: '',
    finalObservations: ''
  });
  const [nextStatus, setNextStatus] = useState<ApplicationStatus>('en_evaluacion');
  const [statusObs, setStatusObs] = useState('');

  // Sync forms when activeDossier changes
  useEffect(() => {
    if (!activeDossier) return;
    setPersonalForm({
      firstNames: activeDossier.personal.firstNames,
      paternalSurname: activeDossier.personal.paternalSurname,
      maternalSurname: activeDossier.personal.maternalSurname,
      documentType: activeDossier.personal.documentType,
      documentNumber: activeDossier.personal.documentNumber,
      birthDate: activeDossier.personal.birthDate,
      maritalStatus: activeDossier.personal.maritalStatus,
      dependentsCount: activeDossier.personal.dependentsCount,
      homeAddress: activeDossier.personal.homeAddress,
      district: activeDossier.personal.district,
      province: activeDossier.personal.province,
      department: activeDossier.personal.department,
      phone: activeDossier.personal.phone,
      email: activeDossier.personal.email
    });
    setBusinessForm({ ...activeDossier.business });
    setVisitForm({
      visitDate: activeDossier.visitVerification?.visitDate || new Date().toISOString().split('T')[0],
      addressVisited: activeDossier.visitVerification?.addressVisited || activeDossier.business.businessAddress,
      personContacted: activeDossier.visitVerification?.personContacted || activeDossier.personal.fullName,
      informationVerified: activeDossier.visitVerification?.informationVerified || '',
      observations: activeDossier.visitVerification?.observations || ''
    });
    setTermsForm({ ...activeDossier.terms });
    setEconForm({
      monthlySales: activeDossier.income.monthlySales,
      otherBusinessIncome: activeDossier.income.otherBusinessIncome,
      salaryIncome: activeDossier.income.salaryIncome,
      feesIncome: activeDossier.income.feesIncome,
      rentalIncome: activeDossier.income.rentalIncome,
      otherPersonalIncome: activeDossier.income.otherPersonalIncome,
      merchandisePurchases: activeDossier.costOfSales.merchandisePurchases,
      rawMaterials: activeDossier.costOfSales.rawMaterials,
      freightCost: activeDossier.costOfSales.freightCost,
      transportSalesCost: activeDossier.costOfSales.transportSalesCost,
      otherSalesCosts: activeDossier.costOfSales.otherSalesCosts,
      rent: activeDossier.businessExpenses.rent,
      utilities: activeDossier.businessExpenses.utilities,
      internetPhone: activeDossier.businessExpenses.internetPhone,
      payroll: activeDossier.businessExpenses.payroll,
      transportBusiness: activeDossier.businessExpenses.transportBusiness,
      maintenance: activeDossier.businessExpenses.maintenance,
      advertising: activeDossier.businessExpenses.advertising,
      commissions: activeDossier.businessExpenses.commissions,
      otherBusinessExpenses: activeDossier.businessExpenses.otherBusinessExpenses,
      food: activeDossier.familyExpenses.food,
      housing: activeDossier.familyExpenses.housing,
      education: activeDossier.familyExpenses.education,
      health: activeDossier.familyExpenses.health,
      transport: activeDossier.familyExpenses.transport,
      utilitiesFamily: activeDossier.familyExpenses.utilitiesFamily,
      communication: activeDossier.familyExpenses.communication,
      otherFamilyExpenses: activeDossier.familyExpenses.otherFamilyExpenses
    });
    setBalanceForm({
      cash: activeDossier.balanceSheet.cash,
      bankDeposits: activeDossier.balanceSheet.bankDeposits,
      inventoryValue: activeDossier.balanceSheet.inventoryValue,
      accountsReceivableValue: activeDossier.balanceSheet.accountsReceivableValue,
      otherCurrentAssets: activeDossier.balanceSheet.otherCurrentAssets,
      landValue: activeDossier.balanceSheet.landValue,
      housingValue: activeDossier.balanceSheet.housingValue,
      commercialPremisesValue: activeDossier.balanceSheet.commercialPremisesValue,
      vehiclesValue: activeDossier.balanceSheet.vehiclesValue,
      machineryValue: activeDossier.balanceSheet.machineryValue,
      equipmentValue: activeDossier.balanceSheet.equipmentValue,
      otherNonCurrentAssets: activeDossier.balanceSheet.otherNonCurrentAssets,
      shortTermCredits: activeDossier.balanceSheet.shortTermCredits,
      suppliersPayable: activeDossier.balanceSheet.suppliersPayable,
      otherCurrentLiabilities: activeDossier.balanceSheet.otherCurrentLiabilities,
      longTermCredits: activeDossier.balanceSheet.longTermCredits,
      otherNonCurrentLiabilities: activeDossier.balanceSheet.otherNonCurrentLiabilities
    });
    setQualForm({ ...activeDossier.qualitative });
    setNextStatus(activeDossier.status);
  }, [activeDossier?.id]);

  if (!activeDossier) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 max-w-4xl mx-auto mt-8">
        <FolderOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#0B2545]">No hay expedientes disponibles</h3>
        <p className="text-xs text-slate-500 mt-1">
          Cree un nuevo expediente desde el menú lateral para completar sus formularios.
        </p>
      </div>
    );
  }

  const currentMetaIndex = MODULE_META.findIndex((m) => m.id === moduleId);
  const currentMeta = MODULE_META[currentMetaIndex] || MODULE_META[0];
  const prevMeta = currentMetaIndex > 0 ? MODULE_META[currentMetaIndex - 1] : null;
  const nextMeta = currentMetaIndex < MODULE_META.length - 1 ? MODULE_META[currentMetaIndex + 1] : null;
  const Icon = currentMeta.icon;

  const notifySaved = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(null), 3000);
  };

  // Live recalculation helper for Steps 3, 4, 5, 6
  const recalculateFinancialBundle = (
    customEcon = econForm,
    customBal = balanceForm,
    customInstallment = termsForm.proposedInstallment,
    customObligations = activeDossier.obligations
  ) => {
    const income = calculateIncomeTotals(
      customEcon.monthlySales,
      customEcon.otherBusinessIncome,
      customEcon.salaryIncome,
      customEcon.feesIncome,
      customEcon.rentalIncome,
      customEcon.otherPersonalIncome
    );
    const costOfSales = calculateCostOfSales(
      customEcon.monthlySales,
      customEcon.merchandisePurchases,
      customEcon.rawMaterials,
      customEcon.freightCost,
      customEcon.transportSalesCost,
      customEcon.otherSalesCosts
    );
    const businessExpenses = calculateBusinessExpenses(
      costOfSales.grossProfit,
      customEcon.rent,
      customEcon.utilities,
      customEcon.internetPhone,
      customEcon.payroll,
      customEcon.transportBusiness,
      customEcon.maintenance,
      customEcon.advertising,
      customEcon.commissions,
      customEcon.otherBusinessExpenses
    );
    const familyExpenses = calculateFamilyExpenses(
      customEcon.food,
      customEcon.housing,
      customEcon.education,
      customEcon.health,
      customEcon.transport,
      customEcon.utilitiesFamily,
      customEcon.communication,
      customEcon.otherFamilyExpenses
    );
    const totalOblig = calculateTotalObligations(customObligations);
    const otherIncomeTotal = customEcon.otherBusinessIncome + income.totalPersonalIncome;
    const incomeStatement = calculateIncomeStatement(
      income.monthlySales,
      costOfSales.totalCostOfSales,
      businessExpenses.totalBusinessExpenses,
      otherIncomeTotal,
      0,
      familyExpenses.totalFamilyExpenses,
      totalOblig
    );
    const balanceSheet = calculateBalanceSheet(
      customBal.cash,
      customBal.bankDeposits,
      customBal.inventoryValue,
      customBal.accountsReceivableValue,
      customBal.otherCurrentAssets,
      customBal.landValue,
      customBal.housingValue,
      customBal.commercialPremisesValue,
      customBal.vehiclesValue,
      customBal.machineryValue,
      customBal.equipmentValue,
      customBal.otherNonCurrentAssets,
      customBal.shortTermCredits,
      customBal.suppliersPayable,
      customBal.otherCurrentLiabilities,
      customBal.longTermCredits,
      customBal.otherNonCurrentLiabilities
    );
    const cashFlow = calculateCashFlow(
      income.monthlySales,
      income.salaryIncome,
      customEcon.otherBusinessIncome + income.feesIncome + income.rentalIncome + income.otherPersonalIncome,
      0,
      costOfSales.totalCostOfSales,
      businessExpenses.totalBusinessExpenses,
      familyExpenses.totalFamilyExpenses,
      totalOblig,
      0
    );
    const totalExpensesAndCosts =
      costOfSales.totalCostOfSales +
      businessExpenses.totalBusinessExpenses +
      familyExpenses.totalFamilyExpenses;
    const paymentCapacity = calculatePaymentCapacity(
      income.totalMonthlyIncome,
      totalExpensesAndCosts,
      totalOblig,
      customInstallment
    );
    const ratios = calculateFinancialRatios(
      balanceSheet.totalAssets,
      balanceSheet.totalLiabilities,
      income.totalMonthlyIncome,
      totalOblig,
      paymentCapacity.availableFlow
    );

    return {
      income,
      costOfSales,
      businessExpenses,
      familyExpenses,
      incomeStatement,
      balanceSheet,
      cashFlow,
      paymentCapacity,
      ratios
    };
  };

  // Live preview objects for Steps 4 & 5
  const liveBundle = recalculateFinancialBundle();

  const handleSaveStep1 = (goNext = false) => {
    const fullName = `${personalForm.firstNames} ${personalForm.paternalSurname} ${personalForm.maternalSurname}`.trim();
    updateDossier(activeDossier.id, {
      personal: {
        ...personalForm,
        fullName: fullName || activeDossier.personal.fullName,
        age: calculateAge(personalForm.birthDate) || activeDossier.personal.age
      }
    });
    notifySaved('Datos del solicitante guardados.');
    if (goNext && nextMeta) setActiveTab(nextMeta.id);
  };

  const handleSaveStep2 = (goNext = false) => {
    updateDossier(activeDossier.id, { business: { ...businessForm } });
    updateDossierVisit(activeDossier.id, {
      ...visitForm,
      verifiedBy: currentUser?.name || 'Asesor asignado'
    });
    notifySaved('Información del negocio y visita de campo guardadas.');
    if (goNext && nextMeta) setActiveTab(nextMeta.id);
  };

  const handleSaveStep3 = (goNext = false) => {
    const bundle = recalculateFinancialBundle(econForm, balanceForm, termsForm.proposedInstallment);
    updateDossier(activeDossier.id, {
      terms: { ...termsForm },
      paymentCapacity: bundle.paymentCapacity,
      ratios: bundle.ratios
    });
    notifySaved('Condiciones crediticias actualizadas y capacidad recalculada.');
    if (goNext && nextMeta) setActiveTab(nextMeta.id);
  };

  const handleSaveStep4 = (goNext = false) => {
    const bundle = recalculateFinancialBundle(econForm, balanceForm, termsForm.proposedInstallment);
    updateDossier(activeDossier.id, bundle);
    notifySaved('Ingresos, costos, gastos y Estado de Ganancias y Pérdidas guardados.');
    if (goNext && nextMeta) setActiveTab(nextMeta.id);
  };

  const handleSaveStep5 = (goNext = false) => {
    const bundle = recalculateFinancialBundle(econForm, balanceForm, termsForm.proposedInstallment);
    updateDossier(activeDossier.id, {
      balanceSheet: bundle.balanceSheet,
      ratios: bundle.ratios
    });
    notifySaved('Balance general, patrimonio y garantías guardados.');
    if (goNext && nextMeta) setActiveTab(nextMeta.id);
  };

  const handleAddObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObligation.entityName.trim()) return;
    const item: FinancialObligation = {
      id: `obl-${Date.now()}`,
      entityName: newObligation.entityName.trim(),
      creditType: newObligation.creditType,
      originalAmount: Number(newObligation.originalAmount) || 0,
      currentBalance: Number(newObligation.currentBalance) || 0,
      monthlyInstallment: Number(newObligation.monthlyInstallment) || 0,
      totalInstallments: Number(newObligation.totalInstallments) || 12,
      paidInstallments: Number(newObligation.paidInstallments) || 0,
      pendingInstallments: Math.max(
        0,
        (Number(newObligation.totalInstallments) || 12) - (Number(newObligation.paidInstallments) || 0)
      ),
      dueDate: new Date().toISOString().split('T')[0],
      status: newObligation.status
    };
    const nextObligations = [...activeDossier.obligations, item];
    const bundle = recalculateFinancialBundle(econForm, balanceForm, termsForm.proposedInstallment, nextObligations);
    updateDossierObligations(activeDossier.id, nextObligations);
    updateDossier(activeDossier.id, {
      incomeStatement: bundle.incomeStatement,
      cashFlow: bundle.cashFlow,
      paymentCapacity: bundle.paymentCapacity,
      ratios: bundle.ratios
    });
    setNewObligation({
      entityName: '',
      creditType: 'Microempresa',
      originalAmount: 0,
      currentBalance: 0,
      monthlyInstallment: 0,
      totalInstallments: 12,
      paidInstallments: 0,
      status: 'Al día'
    });
    notifySaved('Obligación financiera registrada y capacidad de pago recalculada.');
  };

  const handleDeleteObligation = (id: string) => {
    const nextObligations = activeDossier.obligations.filter((o) => o.id !== id);
    const bundle = recalculateFinancialBundle(econForm, balanceForm, termsForm.proposedInstallment, nextObligations);
    updateDossierObligations(activeDossier.id, nextObligations);
    updateDossier(activeDossier.id, {
      incomeStatement: bundle.incomeStatement,
      cashFlow: bundle.cashFlow,
      paymentCapacity: bundle.paymentCapacity,
      ratios: bundle.ratios
    });
    notifySaved('Obligación eliminada.');
  };

  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.productName.trim()) return;
    const item: InventoryItem = {
      id: `inv-${Date.now()}`,
      productName: newInv.productName.trim(),
      quantity: Number(newInv.quantity) || 1,
      unitCost: Number(newInv.unitCost) || 0,
      totalCostValue: (Number(newInv.quantity) || 1) * (Number(newInv.unitCost) || 0),
      sellingPrice: Number(newInv.sellingPrice) || 0
    };
    updateDossierInventory(activeDossier.id, [...activeDossier.inventory, item]);
    setNewInv({ productName: '', quantity: 1, unitCost: 0, sellingPrice: 0 });
    notifySaved('Artículo agregado al inventario valorizado.');
  };

  const handleDeleteInventory = (id: string) => {
    updateDossierInventory(
      activeDossier.id,
      activeDossier.inventory.filter((i) => i.id !== id)
    );
  };

  const handleAttachFileToDoc = (docId: string, file: File | undefined) => {
    if (!file) return;
    const sizeStr =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    const updated = activeDossier.documents.map((doc) =>
      doc.id === docId
        ? {
            ...doc,
            fileName: file.name,
            fileSize: sizeStr,
            uploadedAt: new Date().toISOString().split('T')[0],
            status: 'Recibido' as DocumentVerificationStatus
          }
        : doc
    );
    updateDossierDocuments(activeDossier.id, updated);
    notifySaved(`Archivo "${file.name}" adjuntado como Recibido.`);
  };

  const handleChangeDocStatus = (docId: string, status: DocumentVerificationStatus) => {
    const updated = activeDossier.documents.map((doc) =>
      doc.id === docId ? { ...doc, status } : doc
    );
    updateDossierDocuments(activeDossier.id, updated);
  };

  const handleAddNewDocumentReq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const item: DocumentControlItem = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      documentType: newDocType,
      status: 'Pendiente'
    };
    updateDossierDocuments(activeDossier.id, [...activeDossier.documents, item]);
    setNewDocName('');
    notifySaved('Nuevo requisito documental agregado.');
  };

  const handleSaveStep8 = () => {
    updateDossierQualitative(activeDossier.id, { ...qualForm });
    updateDossierStatus(
      activeDossier.id,
      nextStatus,
      statusObs.trim() || `Actualización de análisis cualitativo y estado del expediente a ${nextStatus}.`
    );
    setStatusObs('');
    notifySaved('Conclusión técnica y estado del expediente guardados.');
  };

  const docsVerifiedOrReceived = activeDossier.documents.filter(
    (d) => d.status === 'Verificado' || d.status === 'Recibido'
  ).length;
  const docsPendingCount = activeDossier.documents.filter(
    (d) => d.status === 'Pendiente' || d.status === 'Observado'
  ).length;

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-[#1D63ED]/15 transition-all';
  const numInputClass =
    'w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 text-right tabular-nums focus:outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-[#1D63ED]/15 transition-all';
  const labelClass = 'block text-[11px] font-semibold text-slate-600 mb-1';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Progress & Selector Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl ${currentMeta.bg} ${currentMeta.border} border flex items-center justify-center shrink-0 ${currentMeta.accent}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#1D63ED]">Paso {currentMeta.step} de 8</span>
                <span className="text-slate-300">·</span>
                <span className="font-mono font-bold text-slate-600">{activeDossier.code}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
                {currentMeta.title}
              </h1>
              <p className="text-xs text-slate-500">{currentMeta.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeDossier.id}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2545] focus:outline-none focus:border-[#1D63ED] cursor-pointer max-w-xs"
            >
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} · {d.personal.fullName}
                </option>
              ))}
            </select>

            <button
              onClick={() => openDossierWithTab(activeDossier.id, moduleId)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span>Ficha 360°</span>
            </button>

            <button
              onClick={() => {
                setSelectedDossierId(activeDossier.id);
                setIsPrintModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir PDF</span>
            </button>
          </div>
        </div>

        {/* Interactive 8-Step Progress Indicator */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {MODULE_META.map((m) => {
            const isCurrent = m.id === moduleId;
            const isPast = m.step < currentMeta.step;
            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`px-2 py-2 rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer border ${
                  isCurrent
                    ? 'bg-[#1D63ED] text-white border-[#1D63ED] shadow-xs'
                    : isPast
                    ? 'bg-[#EFF6FF] text-[#1D63ED] border-blue-200/80 hover:bg-blue-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100'
                }`}
              >
                <span className="block font-mono text-[10px] opacity-80">0{m.step}</span>
                <span className="truncate block">{m.short}</span>
              </button>
            );
          })}
        </div>

        {savedMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      {/* STEP 1: SOLICITANTE */}
      {moduleId === 'solicitante' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <h2 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-3">
            Datos personales y de contacto del solicitante
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Nombres *</label>
              <input
                type="text"
                value={personalForm.firstNames}
                onChange={(e) => setPersonalForm({ ...personalForm, firstNames: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Apellido paterno *</label>
              <input
                type="text"
                value={personalForm.paternalSurname}
                onChange={(e) => setPersonalForm({ ...personalForm, paternalSurname: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Apellido materno</label>
              <input
                type="text"
                value={personalForm.maternalSurname}
                onChange={(e) => setPersonalForm({ ...personalForm, maternalSurname: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tipo de documento</label>
              <select
                value={personalForm.documentType}
                onChange={(e) => setPersonalForm({ ...personalForm, documentType: e.target.value as DocumentType })}
                className={inputClass}
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Número de documento</label>
              <input
                type="text"
                value={personalForm.documentNumber}
                onChange={(e) => setPersonalForm({ ...personalForm, documentNumber: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className={labelClass}>Fecha de nacimiento</label>
              <input
                type="date"
                value={personalForm.birthDate}
                onChange={(e) => setPersonalForm({ ...personalForm, birthDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Estado civil</label>
              <select
                value={personalForm.maritalStatus}
                onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value as MaritalStatus })}
                className={inputClass}
              >
                <option value="Soltero(a)">Soltero(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Conviviente">Conviviente</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viudo(a)">Viudo(a)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Dependientes directos</label>
              <input
                type="number"
                min={0}
                value={personalForm.dependentsCount}
                onChange={(e) => setPersonalForm({ ...personalForm, dependentsCount: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono / Celular</label>
              <input
                type="text"
                value={personalForm.phone}
                onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Correo electrónico</label>
              <input
                type="email"
                value={personalForm.email}
                onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Dirección domiciliaria</label>
              <input
                type="text"
                value={personalForm.homeAddress}
                onChange={(e) => setPersonalForm({ ...personalForm, homeAddress: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Distrito</label>
              <input
                type="text"
                value={personalForm.district}
                onChange={(e) => setPersonalForm({ ...personalForm, district: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Provincia</label>
              <input
                type="text"
                value={personalForm.province}
                onChange={(e) => setPersonalForm({ ...personalForm, province: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Departamento</label>
              <input
                type="text"
                value={personalForm.department}
                onChange={(e) => setPersonalForm({ ...personalForm, department: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => handleSaveStep1(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span>Guardar cambios</span>
            </button>
            <button
              onClick={() => handleSaveStep1(true)}
              className="px-5 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Guardar y continuar a Negocio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: NEGOCIO Y VISITA DE CAMPO */}
      {moduleId === 'negocio' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
            <h2 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-3">
              Información comercial y actividad económica
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Nombre comercial / Negocio *</label>
                <input
                  type="text"
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Giro o actividad principal</label>
                <input
                  type="text"
                  value={businessForm.activityType}
                  onChange={(e) => setBusinessForm({ ...businessForm, activityType: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Sector económico</label>
                <select
                  value={businessForm.sector}
                  onChange={(e) => setBusinessForm({ ...businessForm, sector: e.target.value as BusinessSector })}
                  className={inputClass}
                >
                  <option value="Comercio">Comercio</option>
                  <option value="Producción / Manufactura">Producción / Manufactura</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Agropecuario">Agropecuario</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Construcción">Construcción</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Dirección del establecimiento</label>
                <input
                  type="text"
                  value={businessForm.businessAddress}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessAddress: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Régimen / Formalidad</label>
                <select
                  value={businessForm.formality}
                  onChange={(e) => setBusinessForm({ ...businessForm, formality: e.target.value as FormalityType })}
                  className={inputClass}
                >
                  <option value="Formal (RUC 10 / 20)">Formal (RUC 10 / 20)</option>
                  <option value="RUS (Régimen Único Simplificado)">RUS (Régimen Único Simplificado)</option>
                  <option value="Régimen Especial">Régimen Especial</option>
                  <option value="Régimen Mype Tributario">Régimen Mype Tributario</option>
                  <option value="Informal / En proceso">Informal / En proceso</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Años de funcionamiento</label>
                <input
                  type="number"
                  min={0}
                  value={businessForm.operatingTimeYears}
                  onChange={(e) => setBusinessForm({ ...businessForm, operatingTimeYears: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Condición del local</label>
                <select
                  value={businessForm.businessType}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessType: e.target.value as any })}
                  className={inputClass}
                >
                  <option value="Propio">Propio</option>
                  <option value="Alquilado">Alquilado</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Puesto de Mercado">Puesto de Mercado</option>
                  <option value="Ambulatorio">Ambulatorio</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Trabajadores</label>
                <input
                  type="number"
                  min={0}
                  value={businessForm.employeesCount}
                  onChange={(e) => setBusinessForm({ ...businessForm, employeesCount: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Descripción operativa del negocio</label>
                <textarea
                  rows={2}
                  value={businessForm.activityDescription}
                  onChange={(e) => setBusinessForm({ ...businessForm, activityDescription: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-3">
              Verificación y visita de campo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Fecha de visita</label>
                <input
                  type="date"
                  value={visitForm.visitDate}
                  onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Dirección visitada</label>
                <input
                  type="text"
                  value={visitForm.addressVisited}
                  onChange={(e) => setVisitForm({ ...visitForm, addressVisited: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Persona entrevistada</label>
                <input
                  type="text"
                  value={visitForm.personContacted}
                  onChange={(e) => setVisitForm({ ...visitForm, personContacted: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Información contrastada en la visita</label>
                <textarea
                  rows={2}
                  value={visitForm.informationVerified}
                  onChange={(e) => setVisitForm({ ...visitForm, informationVerified: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Observaciones de campo</label>
                <textarea
                  rows={2}
                  value={visitForm.observations}
                  onChange={(e) => setVisitForm({ ...visitForm, observations: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {prevMeta && (
                  <button
                    onClick={() => setActiveTab(prevMeta.id)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Regresar</span>
                  </button>
                )}
                <button
                  onClick={() => handleSaveStep2(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#1D63ED]" />
                  <span>Guardar cambios</span>
                </button>
              </div>
              <button
                onClick={() => handleSaveStep2(true)}
                className="px-5 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Guardar y continuar a Crédito</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CRÉDITO */}
      {moduleId === 'credito' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <h2 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-3">
            Condiciones de la solicitud crediticia (en S/)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Producto crediticio</label>
              <input
                type="text"
                value={termsForm.creditProduct}
                onChange={(e) => setTermsForm({ ...termsForm, creditProduct: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Monto solicitado (S/)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={termsForm.requestedAmount}
                onChange={(e) => setTermsForm({ ...termsForm, requestedAmount: Number(e.target.value) })}
                className={numInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Plazo (meses)</label>
              <input
                type="number"
                min={1}
                value={termsForm.termMonths}
                onChange={(e) => setTermsForm({ ...termsForm, termMonths: Number(e.target.value) })}
                className={numInputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Frecuencia de pago</label>
              <select
                value={termsForm.paymentFrequency}
                onChange={(e) => setTermsForm({ ...termsForm, paymentFrequency: e.target.value as PaymentFrequency })}
                className={inputClass}
              >
                <option value="Mensual">Mensual</option>
                <option value="Quincenal">Quincenal</option>
                <option value="Semanal">Semanal</option>
                <option value="Al vencimiento">Al vencimiento</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Destino del crédito</label>
              <select
                value={termsForm.destination}
                onChange={(e) => setTermsForm({ ...termsForm, destination: e.target.value as CreditDestination })}
                className={inputClass}
              >
                <option value="Capital de trabajo">Capital de trabajo</option>
                <option value="Compra de mercadería">Compra de mercadería</option>
                <option value="Compra de activos">Compra de activos</option>
                <option value="Ampliación del negocio">Ampliación del negocio</option>
                <option value="Consolidación de deudas">Consolidación de deudas</option>
                <option value="Consumo">Consumo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Cuota mensual estimada (S/)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={termsForm.proposedInstallment}
                onChange={(e) => setTermsForm({ ...termsForm, proposedInstallment: Number(e.target.value) })}
                className={numInputClass}
              />
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass}>Detalle del destino / plan de inversión</label>
              <textarea
                rows={2}
                value={termsForm.destinationDescription}
                onChange={(e) => setTermsForm({ ...termsForm, destinationDescription: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {prevMeta && (
                <button
                  onClick={() => setActiveTab(prevMeta.id)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Regresar</span>
                </button>
              )}
              <button
                onClick={() => handleSaveStep3(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>Guardar cambios</span>
              </button>
            </div>
            <button
              onClick={() => handleSaveStep3(true)}
              className="px-5 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Guardar y continuar a Ingresos y gastos</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: INGRESOS Y GASTOS */}
      {moduleId === 'ingresos_gastos' && (
        <div className="space-y-5">
          {/* Live Summary Banner */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Total ingresos mensuales</span>
              <strong className="text-xl font-extrabold text-[#1D63ED] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.income.totalMonthlyIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Utilidad bruta comercial</span>
              <strong className="text-xl font-extrabold text-[#16A34A] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.costOfSales.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Gastos negocio + familia</span>
              <strong className="text-xl font-extrabold text-[#F59E0B] font-mono tabular-nums mt-0.5 block">
                S/ {(liveBundle.businessExpenses.totalBusinessExpenses + liveBundle.familyExpenses.totalFamilyExpenses).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Resultado antes de cuotas</span>
              <strong className="text-xl font-extrabold text-[#0B2545] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.incomeStatement.resultBeforeFinancialObligations.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ingresos & Costo de Ventas */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5">
                Ingresos mensuales (S/)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Ventas mensuales negocio</label>
                  <input type="number" min={0} value={econForm.monthlySales} onChange={(e) => setEconForm({ ...econForm, monthlySales: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Otros ingresos negocio</label>
                  <input type="number" min={0} value={econForm.otherBusinessIncome} onChange={(e) => setEconForm({ ...econForm, otherBusinessIncome: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Sueldo dependiente</label>
                  <input type="number" min={0} value={econForm.salaryIncome} onChange={(e) => setEconForm({ ...econForm, salaryIncome: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Honorarios / Alquileres / Otros</label>
                  <input type="number" min={0} value={econForm.feesIncome} onChange={(e) => setEconForm({ ...econForm, feesIncome: Number(e.target.value) })} className={numInputClass} />
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5 pt-2">
                Costo de ventas mensual (S/)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Compra de mercadería</label>
                  <input type="number" min={0} value={econForm.merchandisePurchases} onChange={(e) => setEconForm({ ...econForm, merchandisePurchases: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Materia prima / insumos</label>
                  <input type="number" min={0} value={econForm.rawMaterials} onChange={(e) => setEconForm({ ...econForm, rawMaterials: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fletes y transporte</label>
                  <input type="number" min={0} value={econForm.freightCost} onChange={(e) => setEconForm({ ...econForm, freightCost: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Otros costos directos</label>
                  <input type="number" min={0} value={econForm.otherSalesCosts} onChange={(e) => setEconForm({ ...econForm, otherSalesCosts: Number(e.target.value) })} className={numInputClass} />
                </div>
              </div>
            </div>

            {/* Gastos Negocio y Familia */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5">
                Gastos operativos del negocio (S/)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Alquiler local</label>
                  <input type="number" min={0} value={econForm.rent} onChange={(e) => setEconForm({ ...econForm, rent: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Luz / Agua</label>
                  <input type="number" min={0} value={econForm.utilities} onChange={(e) => setEconForm({ ...econForm, utilities: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Personal / Planilla</label>
                  <input type="number" min={0} value={econForm.payroll} onChange={(e) => setEconForm({ ...econForm, payroll: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Internet / Teléfono</label>
                  <input type="number" min={0} value={econForm.internetPhone} onChange={(e) => setEconForm({ ...econForm, internetPhone: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Movilidad negocio</label>
                  <input type="number" min={0} value={econForm.transportBusiness} onChange={(e) => setEconForm({ ...econForm, transportBusiness: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Otros gastos negocio</label>
                  <input type="number" min={0} value={econForm.otherBusinessExpenses} onChange={(e) => setEconForm({ ...econForm, otherBusinessExpenses: Number(e.target.value) })} className={numInputClass} />
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5 pt-2">
                Gastos familiares mensuales (S/)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Alimentación</label>
                  <input type="number" min={0} value={econForm.food} onChange={(e) => setEconForm({ ...econForm, food: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vivienda</label>
                  <input type="number" min={0} value={econForm.housing} onChange={(e) => setEconForm({ ...econForm, housing: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Educación</label>
                  <input type="number" min={0} value={econForm.education} onChange={(e) => setEconForm({ ...econForm, education: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Salud</label>
                  <input type="number" min={0} value={econForm.health} onChange={(e) => setEconForm({ ...econForm, health: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Servicios básicos</label>
                  <input type="number" min={0} value={econForm.utilitiesFamily} onChange={(e) => setEconForm({ ...econForm, utilitiesFamily: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Transporte / Otros</label>
                  <input type="number" min={0} value={econForm.transport} onChange={(e) => setEconForm({ ...econForm, transport: Number(e.target.value) })} className={numInputClass} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {prevMeta && (
                <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Regresar</span>
                </button>
              )}
              <button onClick={() => handleSaveStep4(false)} className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                <Save className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>Guardar y recalcular</span>
              </button>
            </div>
            <button onClick={() => handleSaveStep4(true)} className="px-5 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
              <span>Guardar y continuar a Balance General</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ESTADOS FINANCIEROS Y BALANCE GENERAL */}
      {moduleId === 'balance' && (
        <div className="space-y-5">
          {/* Balance KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Activos</span>
              <strong className="text-2xl font-extrabold text-[#1D63ED] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.balanceSheet.totalAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Pasivos</span>
              <strong className="text-2xl font-extrabold text-[#F59E0B] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.balanceSheet.totalLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Patrimonio Neto (Activos - Pasivos)</span>
              <strong className="text-2xl font-extrabold text-[#16A34A] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.balanceSheet.equity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Editable Balance Sheet & Patrimony / Guarantees */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5">
                Activos, Patrimonio y Garantías (S/)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Efectivo en caja</label>
                  <input type="number" min={0} value={balanceForm.cash} onChange={(e) => setBalanceForm({ ...balanceForm, cash: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bancos / Ahorros</label>
                  <input type="number" min={0} value={balanceForm.bankDeposits} onChange={(e) => setBalanceForm({ ...balanceForm, bankDeposits: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Inventarios / Mercadería</label>
                  <input type="number" min={0} value={balanceForm.inventoryValue} onChange={(e) => setBalanceForm({ ...balanceForm, inventoryValue: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cuentas por cobrar</label>
                  <input type="number" min={0} value={balanceForm.accountsReceivableValue} onChange={(e) => setBalanceForm({ ...balanceForm, accountsReceivableValue: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Inmuebles / Vivienda (Garantía)</label>
                  <input type="number" min={0} value={balanceForm.housingValue} onChange={(e) => setBalanceForm({ ...balanceForm, housingValue: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Terrenos / Local comercial</label>
                  <input type="number" min={0} value={balanceForm.commercialPremisesValue} onChange={(e) => setBalanceForm({ ...balanceForm, commercialPremisesValue: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Maquinaria y equipos</label>
                  <input type="number" min={0} value={balanceForm.machineryValue} onChange={(e) => setBalanceForm({ ...balanceForm, machineryValue: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vehículos / Otros bienes</label>
                  <input type="number" min={0} value={balanceForm.vehiclesValue} onChange={(e) => setBalanceForm({ ...balanceForm, vehiclesValue: Number(e.target.value) })} className={numInputClass} />
                </div>
              </div>

              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5 pt-2">
                Pasivos y Obligaciones (S/)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Deudas financieras corto plazo</label>
                  <input type="number" min={0} value={balanceForm.shortTermCredits} onChange={(e) => setBalanceForm({ ...balanceForm, shortTermCredits: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cuentas por pagar proveedores</label>
                  <input type="number" min={0} value={balanceForm.suppliersPayable} onChange={(e) => setBalanceForm({ ...balanceForm, suppliersPayable: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Deudas largo plazo</label>
                  <input type="number" min={0} value={balanceForm.longTermCredits} onChange={(e) => setBalanceForm({ ...balanceForm, longTermCredits: Number(e.target.value) })} className={numInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Otros pasivos</label>
                  <input type="number" min={0} value={balanceForm.otherCurrentLiabilities} onChange={(e) => setBalanceForm({ ...balanceForm, otherCurrentLiabilities: Number(e.target.value) })} className={numInputClass} />
                </div>
              </div>
            </div>

            {/* Generated Income Statement (Estado de Ganancias y Pérdidas) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5">
                Estado de Ganancias y Pérdidas (Mensual calculado)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="font-semibold text-slate-700">(+) Ventas mensuales</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">S/ {liveBundle.incomeStatement.salesIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600">(-) Costo de ventas</span>
                  <span className="font-mono font-semibold text-rose-600 tabular-nums">- S/ {liveBundle.incomeStatement.costOfSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-2.5 flex justify-between bg-slate-50 px-2 rounded-lg">
                  <span className="font-bold text-[#0B2545]">(=) Utilidad bruta</span>
                  <span className="font-mono font-bold text-[#1D63ED] tabular-nums">S/ {liveBundle.incomeStatement.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600">(-) Gastos operativos del negocio</span>
                  <span className="font-mono font-semibold text-rose-600 tabular-nums">- S/ {liveBundle.incomeStatement.operatingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-2.5 flex justify-between bg-slate-50 px-2 rounded-lg">
                  <span className="font-bold text-[#0B2545]">(=) Resultado operativo</span>
                  <span className="font-mono font-bold text-[#0B2545] tabular-nums">S/ {liveBundle.incomeStatement.operatingResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600">(+) Otros ingresos personales / negocio</span>
                  <span className="font-mono font-semibold text-emerald-600 tabular-nums">+ S/ {liveBundle.incomeStatement.otherIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600">(-) Gastos familiares</span>
                  <span className="font-mono font-semibold text-rose-600 tabular-nums">- S/ {liveBundle.familyExpenses.totalFamilyExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-600">(-) Cuotas de créditos existentes</span>
                  <span className="font-mono font-semibold text-amber-600 tabular-nums">- S/ {liveBundle.incomeStatement.financialInstallments.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="py-3 flex justify-between bg-[#EFF6FF] px-3 rounded-xl mt-2">
                  <span className="font-extrabold text-[#0B2545]">(=) Excedente disponible mensual</span>
                  <span className={`font-mono text-sm font-extrabold tabular-nums ${liveBundle.incomeStatement.availableResult >= 0 ? 'text-[#16A34A]' : 'text-rose-600'}`}>
                    S/ {liveBundle.incomeStatement.availableResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {prevMeta && (
                <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Regresar</span>
                </button>
              )}
              <button onClick={() => handleSaveStep5(false)} className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                <Save className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span>Guardar balance</span>
              </button>
            </div>
            <button onClick={() => handleSaveStep5(true)} className="px-5 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
              <span>Guardar y continuar a Capacidad de Pago</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CAPACIDAD DE PAGO Y OBLIGACIONES */}
      {moduleId === 'capacidad' && (
        <div className="space-y-5">
          {/* Payment Capacity Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Flujo disponible mensual</span>
              <strong className="text-xl font-extrabold text-[#1D63ED] font-mono tabular-nums mt-0.5 block">
                S/ {activeDossier.paymentCapacity.availableFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Cuota propuesta</span>
              <strong className="text-xl font-extrabold text-[#8B5CF6] font-mono tabular-nums mt-0.5 block">
                S/ {activeDossier.paymentCapacity.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Excedente post-cuota</span>
              <strong className={`text-xl font-extrabold font-mono tabular-nums mt-0.5 block ${activeDossier.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-[#16A34A]' : 'text-rose-600'}`}>
                S/ {activeDossier.paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Endeudamiento s/ activos</span>
              <strong className="text-xl font-extrabold text-[#0B2545] font-mono tabular-nums mt-0.5 block">
                {activeDossier.ratios.indebtednessRatio.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Add Obligation Form */}
          <form onSubmit={handleAddObligation} className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0B2545] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#1D63ED]" />
              <span>Registrar deuda u obligación financiera vigente</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2">
                <label className={labelClass}>Entidad financiera / Acreedor *</label>
                <input
                  type="text"
                  required
                  value={newObligation.entityName}
                  onChange={(e) => setNewObligation({ ...newObligation, entityName: e.target.value })}
                  placeholder="Ej. Caja Huancayo / BCP / MiBanco"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Saldo actual (S/)</label>
                <input
                  type="number"
                  min={0}
                  value={newObligation.currentBalance}
                  onChange={(e) => setNewObligation({ ...newObligation, currentBalance: Number(e.target.value) })}
                  className={numInputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Cuota mensual (S/)</label>
                <input
                  type="number"
                  min={0}
                  value={newObligation.monthlyInstallment}
                  onChange={(e) => setNewObligation({ ...newObligation, monthlyInstallment: Number(e.target.value) })}
                  className={numInputClass}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  + Agregar deuda
                </button>
              </div>
            </div>
          </form>

          {/* Existing Obligations Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B2545]">
                Obligaciones registradas ({activeDossier.obligations.length})
              </h3>
              <span className="text-xs font-mono font-bold text-slate-600 tabular-nums">
                Total cuotas mensuales: S/ {activeDossier.paymentCapacity.currentFinancialObligations.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 pl-4">Entidad</th>
                    <th className="py-3 px-3">Tipo crédito</th>
                    <th className="py-3 px-3 text-right">Saldo actual</th>
                    <th className="py-3 px-3 text-right">Cuota mensual</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 pr-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeDossier.obligations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        Sin obligaciones financieras externas registradas.
                      </td>
                    </tr>
                  ) : (
                    activeDossier.obligations.map((ob) => (
                      <tr key={ob.id} className="hover:bg-slate-50">
                        <td className="py-3 pl-4 font-bold text-slate-900">{ob.entityName}</td>
                        <td className="py-3 px-3 text-slate-600">{ob.creditType}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">S/ {ob.currentBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#1D63ED] tabular-nums">S/ {ob.monthlyInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{ob.status}</span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <button
                            onClick={() => handleDeleteObligation(ob.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-3">
            {prevMeta && (
              <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
                <span>Regresar</span>
              </button>
            )}
            {nextMeta && (
              <button onClick={() => setActiveTab(nextMeta.id)} className="px-5 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                <span>Continuar a Inventario y Documentos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 7: INVENTARIO Y DOCUMENTOS */}
      {moduleId === 'inventario_documentos' && (
        <div className="space-y-5">
          {/* Document Summary Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Documentos recibidos / verificados</span>
              <strong className="text-2xl font-extrabold text-[#16A34A] font-mono tabular-nums mt-0.5 block">
                {docsVerifiedOrReceived} de {activeDossier.documents.length}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Documentos pendientes / observados</span>
              <strong className="text-2xl font-extrabold text-[#F59E0B] font-mono tabular-nums mt-0.5 block">
                {docsPendingCount}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 block">Valor inventario detallado</span>
              <strong className="text-2xl font-extrabold text-[#1D63ED] font-mono tabular-nums mt-0.5 block">
                S/ {activeDossier.inventory.reduce((s, i) => s + i.totalCostValue, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Documents Checklist & Upload */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5">
                Documentos de sustento del expediente
              </h3>

              <form onSubmit={handleAddNewDocumentReq} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="Agregar nuevo requisito documental..."
                  className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                />
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <option value="DNI">DNI</option>
                  <option value="Sustento de ingresos">Sustento de ingresos</option>
                  <option value="Documentación del negocio">Documentación del negocio</option>
                  <option value="Documentación patrimonial">Documentación patrimonial</option>
                  <option value="Otros documentos">Otros documentos</option>
                </select>
                <button type="submit" className="px-3.5 py-2 rounded-xl bg-[#1D63ED] text-white text-xs font-bold cursor-pointer">
                  + Agregar
                </button>
              </form>

              <div className="divide-y divide-slate-100">
                {activeDossier.documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="w-4 h-4 text-[#1D63ED] shrink-0" />
                        <span className="font-bold text-slate-900 truncate">{doc.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2">
                        <span>{doc.documentType}</span>
                        {doc.fileName && (
                          <span className="font-mono text-[#1D63ED]">· {doc.fileName} ({doc.fileSize})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Adjuntar</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleAttachFileToDoc(doc.id, e.target.files?.[0])}
                        />
                      </label>

                      <select
                        value={doc.status}
                        onChange={(e) => handleChangeDocStatus(doc.id, e.target.value as DocumentVerificationStatus)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${
                          doc.status === 'Verificado'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : doc.status === 'Recibido'
                            ? 'bg-[#EFF6FF] text-[#1D63ED] border-blue-200'
                            : doc.status === 'Observado'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Recibido">Recibido</option>
                        <option value="Observado">Observado</option>
                        <option value="Verificado">Verificado</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Valuation */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-2.5">
                Inventario de mercaderías
              </h3>

              <form onSubmit={handleAddInventory} className="space-y-2.5 text-xs">
                <input
                  type="text"
                  required
                  value={newInv.productName}
                  onChange={(e) => setNewInv({ ...newInv, productName: e.target.value })}
                  placeholder="Nombre del producto o línea"
                  className={inputClass}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={labelClass}>Cant.</label>
                    <input type="number" min={1} value={newInv.quantity} onChange={(e) => setNewInv({ ...newInv, quantity: Number(e.target.value) })} className={numInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Costo U.</label>
                    <input type="number" min={0} value={newInv.unitCost} onChange={(e) => setNewInv({ ...newInv, unitCost: Number(e.target.value) })} className={numInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>P. Venta</label>
                    <input type="number" min={0} value={newInv.sellingPrice} onChange={(e) => setNewInv({ ...newInv, sellingPrice: Number(e.target.value) })} className={numInputClass} />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 rounded-xl bg-[#8B5CF6] hover:bg-purple-700 text-white font-bold cursor-pointer">
                  + Agregar al inventario
                </button>
              </form>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {activeDossier.inventory.map((inv) => (
                  <div key={inv.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{inv.productName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {inv.quantity} unid. × S/ {inv.unitCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0B2545] tabular-nums">
                        S/ {inv.totalCostValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => handleDeleteInventory(inv.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-3">
            {prevMeta && (
              <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
                <span>Regresar</span>
              </button>
            )}
            {nextMeta && (
              <button onClick={() => setActiveTab(nextMeta.id)} className="px-5 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
                <span>Continuar a Conclusión</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 8: CONCLUSIÓN Y ESTADO DE SOLICITUD */}
      {moduleId === 'conclusion' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
            <h2 className="text-sm font-bold text-[#0B2545] border-b border-slate-100 pb-3">
              Conclusión técnica del analista y estado del expediente
            </h2>

            <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-blue-200/80 flex items-start gap-2.5 text-xs text-[#0B2545]">
              <ShieldCheck className="w-4 h-4 text-[#1D63ED] shrink-0 mt-0.5" />
              <span>
                <strong>Nota de alcance:</strong> Las conclusiones registradas constituyen un informe técnico de organización de datos e indicadores para apoyo de la entidad financiera. EVALÚA no aprueba ni rechaza créditos.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Experiencia y estabilidad del solicitante</label>
                <textarea
                  rows={2}
                  value={qualForm.activityExperience}
                  onChange={(e) => setQualForm({ ...qualForm, activityExperience: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Organización comercial y control</label>
                <textarea
                  rows={2}
                  value={qualForm.businessOrganization}
                  onChange={(e) => setQualForm({ ...qualForm, businessOrganization: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Comentarios técnicos del analista</label>
                <textarea
                  rows={3}
                  value={qualForm.analystComments}
                  onChange={(e) => setQualForm({ ...qualForm, analystComments: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Síntesis final y observaciones para comité</label>
                <textarea
                  rows={3}
                  value={qualForm.analystConclusion}
                  onChange={(e) => setQualForm({ ...qualForm, analystConclusion: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Estado de la solicitud</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ApplicationStatus)}
                  className={inputClass}
                >
                  <option value="registrada">Registrada</option>
                  <option value="en_evaluacion">En evaluación</option>
                  <option value="documentacion_pendiente">Documentación pendiente</option>
                  <option value="en_verificacion">En verificación</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Nota de seguimiento (bitácora)</label>
                <input
                  type="text"
                  value={statusObs}
                  onChange={(e) => setStatusObs(e.target.value)}
                  placeholder="Motivo del cambio o siguiente paso..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {prevMeta && (
                  <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Regresar</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedDossierId(activeDossier.id);
                    setIsPrintModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#1D63ED]" />
                  <span>Imprimir / Exportar PDF</span>
                </button>
              </div>

              <button
                onClick={handleSaveStep8}
                className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar conclusión y estado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
