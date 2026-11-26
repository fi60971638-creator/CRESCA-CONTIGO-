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
import { BalanceGeneralModule } from './BalanceGeneralModule';
import { InventoryModule } from './InventoryModule';
import {
  ApplicationStatus,
  BusinessSector,
  CreditDestination,
  DocumentControlItem,
  DocumentType,
  DocumentVerificationStatus,
  FinancialObligation,
  FormalityType,
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
  { id: 'solicitante', step: 1, short: 'Solicitante', title: '1. Datos del Solicitante', subtitle: 'Información personal, identidad y contacto del titular', icon: User },
  { id: 'negocio', step: 2, short: 'Negocio', title: '2. Negocio y Visita de Campo', subtitle: 'Actividad económica, formalidad y verificación presencial', icon: Briefcase },
  { id: 'credito', step: 3, short: 'Crédito', title: '3. Información Crediticia', subtitle: 'Condiciones solicitadas, plazo, destino y cuota referencial', icon: CreditCard },
  { id: 'ingresos_gastos', step: 4, short: 'Ingresos', title: '4. Ingresos, Costos y Gastos', subtitle: 'Cálculo automático de ingresos netos, costos y gastos familiares', icon: TrendingUp },
  { id: 'balance', step: 5, short: 'Balance', title: '5. Estados Financieros y Balance General', subtitle: 'Balance general, patrimonio, garantías y estado de ganancias y pérdidas', icon: BarChart3 },
  { id: 'capacidad', step: 6, short: 'Capacidad', title: '6. Capacidad de Pago y Obligaciones', subtitle: 'Flujo disponible, deudas vigentes, excedente post-cuota y ratios', icon: Scale },
  { id: 'inventario_documentos', step: 7, short: 'Documentos', title: '7. Inventario y Documentos de Sustento', subtitle: 'Inventario valorizado y carga de documentos recibidos y pendientes', icon: ClipboardList },
  { id: 'conclusion', step: 8, short: 'Conclusión', title: '8. Conclusión y Seguimiento', subtitle: 'Síntesis cualitativa, estado de solicitud e impresión PDF', icon: CheckCircle2 }
] as const;

export const CreditModuleIndependentView: React.FC<CreditModuleIndependentViewProps> = ({ moduleId }) => {
  const {
    dossiers,
    selectedDossierId,
    setSelectedDossierId,
    setActiveTab,
    navigateTo,
    setIsPrintModalOpen,
    openDossierWithTab,
    updateDossier,
    updateDossierStatus,
    updateDossierDocuments,
    updateDossierObligations,
    updateDossierVisit,
    updateDossierQualitative,
    currentUser,
    activeSubSection
  } = useEvalua();

  const activeDossier = dossiers.find((d) => d.id === selectedDossierId) || dossiers[0];
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [step7Tab, setStep7Tab] = useState<'inventario' | 'documentos'>(
    activeSubSection === 'doc-control' ? 'documentos' : 'inventario'
  );

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

  // Step 7 state (New Document)
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
    setQualForm({ ...activeDossier.qualitative });
    setNextStatus(activeDossier.status);
  }, [activeDossier?.id]);

  useEffect(() => {
    if (activeSubSection === 'doc-control') {
      setStep7Tab('documentos');
    } else if (activeSubSection === 'pat-inventario') {
      setStep7Tab('inventario');
    }
    if (!activeSubSection) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(activeSubSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 90);
    return () => clearTimeout(timer);
  }, [activeSubSection, moduleId]);

  const sectionFocusClass = (sectionId: string) =>
    activeSubSection === sectionId
      ? 'border-[#004481] ring-1 ring-[#004481]/20'
      : 'border-[#E2E6EC]';

  if (!activeDossier) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border border-[#E2E6EC] text-[#5B6573] max-w-4xl mx-auto mt-8">
        <FolderOpen className="w-12 h-12 text-[#6B7280] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#121212]">No hay expedientes disponibles</h3>
        <p className="text-xs text-[#5B6573] mt-1">
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
    customBal = activeDossier.balanceSheet,
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
    const bundle = recalculateFinancialBundle(econForm, activeDossier.balanceSheet, termsForm.proposedInstallment);
    updateDossier(activeDossier.id, {
      terms: { ...termsForm },
      paymentCapacity: bundle.paymentCapacity,
      ratios: bundle.ratios
    });
    updateDossierQualitative(activeDossier.id, { ...qualForm });
    notifySaved('Condiciones crediticias y garantías actualizadas.');
    if (goNext && nextMeta) setActiveTab(nextMeta.id);
  };

  const handleSaveStep4 = (goNext = false) => {
    const bundle = recalculateFinancialBundle(econForm, activeDossier.balanceSheet, termsForm.proposedInstallment);
    updateDossier(activeDossier.id, bundle);
    notifySaved('Ingresos, costos, gastos y Estado de Ganancias y Pérdidas guardados.');
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
    const bundle = recalculateFinancialBundle(econForm, activeDossier.balanceSheet, termsForm.proposedInstallment, nextObligations);
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
    const bundle = recalculateFinancialBundle(econForm, activeDossier.balanceSheet, termsForm.proposedInstallment, nextObligations);
    updateDossierObligations(activeDossier.id, nextObligations);
    updateDossier(activeDossier.id, {
      incomeStatement: bundle.incomeStatement,
      cashFlow: bundle.cashFlow,
      paymentCapacity: bundle.paymentCapacity,
      ratios: bundle.ratios
    });
    notifySaved('Obligación eliminada.');
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
    'w-full px-3.5 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-medium text-[#121212] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#004481] transition-colors';
  const numInputClass =
    'w-full px-3.5 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-mono font-bold text-[#121212] text-right tabular-nums focus:outline-none focus:bg-white focus:border-[#004481] transition-colors';
  const labelClass = 'block text-[11px] font-semibold text-[#374151] mb-1.5';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Progress & Selector Header */}
      <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] flex items-center justify-center shrink-0 text-[#004481]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#004481]">Paso {currentMeta.step} de 8</span>
                <span className="text-[#CBD5E1]">·</span>
                <span className="font-mono font-bold text-[#5B6573]">{activeDossier.code}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
                {currentMeta.title}
              </h1>
              <p className="text-xs text-[#5B6573]">{currentMeta.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeDossier.id}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-semibold text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481] cursor-pointer max-w-xs"
            >
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} · {d.personal.fullName}
                </option>
              ))}
            </select>

            <button
              onClick={() => openDossierWithTab(activeDossier.id, moduleId)}
              className="px-3 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#004481]" />
              <span>Ficha 360°</span>
            </button>

            <button
              onClick={() => {
                setSelectedDossierId(activeDossier.id);
                setIsPrintModalOpen(true);
              }}
              className="px-3 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#5B6573]" />
              <span>Imprimir PDF</span>
            </button>
          </div>
        </div>

        {/* Interactive 8-Step Progress Indicator */}
        <div className="pt-3 border-t border-[#E2E6EC] grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {MODULE_META.map((m) => {
            const isCurrent = m.id === moduleId;
            const isPast = m.step < currentMeta.step;
            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`px-2 py-2 rounded-md text-[11px] font-semibold transition-colors text-center cursor-pointer border ${
                  isCurrent
                    ? 'bg-[#004481] text-white border-[#004481]'
                    : isPast
                    ? 'bg-[#F0F5FA] text-[#004481] border-[#B8D0E6] hover:bg-[#E4EEF8]'
                    : 'bg-[#F7F8FA] text-[#374151] border-[#E2E6EC] hover:bg-white'
                }`}
              >
                <span className="block font-mono text-[10px] opacity-80">0{m.step}</span>
                <span className="truncate block">{m.short}</span>
              </button>
            );
          })}
        </div>

        {savedMessage && (
          <div className="p-3 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#028448] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}
      </div>

      {/* STEP 1: SOLICITANTE */}
      {moduleId === 'solicitante' && (
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-6 space-y-5">
          <div className="border-b border-[#E2E6EC] pb-3">
            <h2 className="text-sm font-bold text-[#121212]">
              Datos personales y de contacto del solicitante
            </h2>
            <p className="text-[11px] text-[#1464A5] mt-0.5">
              Verifique que los nombres y el documento de identidad coincidan exactamente con el DNI o ficha RENIEC.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Nombres *</label>
              <input
                type="text"
                value={personalForm.firstNames}
                onChange={(e) => setPersonalForm({ ...personalForm, firstNames: e.target.value })}
                className={`${inputClass} ${!personalForm.firstNames.trim() ? 'border-[#C81E1E] focus:border-[#C81E1E]' : ''}`}
              />
              {!personalForm.firstNames.trim() && (
                <p className="text-[11px] text-[#C81E1E] mt-1 font-medium">Ingrese los nombres del solicitante.</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Apellido paterno *</label>
              <input
                type="text"
                value={personalForm.paternalSurname}
                onChange={(e) => setPersonalForm({ ...personalForm, paternalSurname: e.target.value })}
                className={`${inputClass} ${!personalForm.paternalSurname.trim() ? 'border-[#C81E1E] focus:border-[#C81E1E]' : ''}`}
              />
              {!personalForm.paternalSurname.trim() && (
                <p className="text-[11px] text-[#C81E1E] mt-1 font-medium">Ingrese el apellido paterno.</p>
              )}
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
              <label className={labelClass}>Número de documento *</label>
              <input
                type="text"
                value={personalForm.documentNumber}
                onChange={(e) => setPersonalForm({ ...personalForm, documentNumber: e.target.value })}
                className={`${inputClass} font-mono ${
                  personalForm.documentType === 'DNI' && personalForm.documentNumber.trim().length > 0 && personalForm.documentNumber.trim().length !== 8
                    ? 'border-[#C81E1E] focus:border-[#C81E1E]'
                    : ''
                }`}
              />
              {personalForm.documentType === 'DNI' && personalForm.documentNumber.trim().length > 0 && personalForm.documentNumber.trim().length !== 8 ? (
                <p className="text-[11px] text-[#C81E1E] mt-1 font-medium">El DNI debe tener exactamente 8 dígitos.</p>
              ) : (
                <p className="text-[11px] text-[#1464A5] mt-1">8 dígitos para DNI o 11 dígitos para RUC.</p>
              )}
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

          <div className="pt-4 border-t border-[#E2E6EC] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => handleSaveStep1(false)}
              className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-[#004481]" />
              <span>Guardar cambios</span>
            </button>
            <button
              onClick={() => handleSaveStep1(true)}
              className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
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
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E6EC] pb-3">
              <h2 className="text-sm font-semibold text-[#121212]">
                Información comercial y actividad económica
              </h2>
              <span className="text-xs text-[#1464A5] font-medium">
                Los datos de formalidad y sector permiten contextualizar el riesgo operativo.
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Nombre comercial / Negocio *</label>
                <input
                  type="text"
                  value={businessForm.businessName}
                  onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
                  className={`${inputClass} ${!businessForm.businessName.trim() ? 'border-[#C81E1E] bg-[#FEF2F2]/40' : ''}`}
                />
                {!businessForm.businessName.trim() && (
                  <p className="mt-1 text-[11px] font-medium text-[#C81E1E]">
                    Ingresa el nombre comercial o razón del negocio.
                  </p>
                )}
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

          <div className="bg-white rounded-lg border border-[#E2E6EC] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-[#121212] border-b border-[#E2E6EC] pb-3">
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

            <div className="pt-4 border-t border-[#E2E6EC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {prevMeta && (
                  <button
                    onClick={() => setActiveTab(prevMeta.id)}
                    className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Regresar</span>
                  </button>
                )}
                <button
                  onClick={() => handleSaveStep2(false)}
                  className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#004481]" />
                  <span>Guardar cambios</span>
                </button>
              </div>
              <button
                onClick={() => handleSaveStep2(true)}
                className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
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
        <div className="bg-white rounded-lg border border-[#E2E6EC] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E6EC] pb-3">
            <h2 className="text-sm font-semibold text-[#121212]">
              Condiciones de la solicitud crediticia (en S/)
            </h2>
            <span className="text-xs text-[#1464A5] font-medium">
              La cuota mensual estimada impacta directamente en el indicador de cobertura de deuda.
            </span>
          </div>
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
              <label className={labelClass}>Monto solicitado (S/) *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={termsForm.requestedAmount}
                onChange={(e) => setTermsForm({ ...termsForm, requestedAmount: Number(e.target.value) })}
                className={`${numInputClass} ${termsForm.requestedAmount <= 0 ? 'border-[#C81E1E] bg-[#FEF2F2]/40' : ''}`}
              />
              {termsForm.requestedAmount <= 0 && (
                <p className="mt-1 text-[11px] font-medium text-[#C81E1E]">
                  El monto solicitado debe ser mayor a S/ 0.00.
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Plazo (meses) *</label>
              <input
                type="number"
                min={1}
                value={termsForm.termMonths}
                onChange={(e) => setTermsForm({ ...termsForm, termMonths: Number(e.target.value) })}
                className={`${numInputClass} ${termsForm.termMonths < 1 ? 'border-[#C81E1E] bg-[#FEF2F2]/40' : ''}`}
              />
              {termsForm.termMonths < 1 && (
                <p className="mt-1 text-[11px] font-medium text-[#C81E1E]">
                  El plazo mínimo debe ser de 1 mes.
                </p>
              )}
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

            {/* Garantías y avales */}
            <div
              id="pat-garantias"
              className={`sm:col-span-3 scroll-mt-20 p-4 rounded-md border bg-[#F7F8FA] space-y-3 transition-colors ${sectionFocusClass('pat-garantias')}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-[#121212] uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#004481]" />
                  <span>Garantías, avales y respaldo patrimonial</span>
                </h3>
                <span className="text-[11px] font-mono font-semibold text-[#004481] tabular-nums">
                  Patrimonio neto: S/ {liveBundle.balanceSheet.equity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Respaldo y estabilidad comercial / garantía</label>
                  <input
                    type="text"
                    value={qualForm.businessStability}
                    onChange={(e) => setQualForm({ ...qualForm, businessStability: e.target.value })}
                    placeholder="Ej. Aval solidario / Garantía mobiliaria / Inmueble propio"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Detalle de garantías y avales declarados</label>
                  <input
                    type="text"
                    value={qualForm.finalObservations}
                    onChange={(e) => setQualForm({ ...qualForm, finalObservations: e.target.value })}
                    placeholder="Descripción de bienes en garantía o fiadores..."
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E6EC] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {prevMeta && (
                <button
                  onClick={() => setActiveTab(prevMeta.id)}
                  className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Regresar</span>
                </button>
              )}
              <button
                onClick={() => handleSaveStep3(false)}
                className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#004481]" />
                <span>Guardar cambios</span>
              </button>
            </div>
            <button
              onClick={() => handleSaveStep3(true)}
              className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
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
            <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
              <span className="text-[11px] font-medium text-[#5B6573] block">Total ingresos mensuales</span>
              <strong className="text-xl font-semibold text-[#004481] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.income.totalMonthlyIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
              <span className="text-[11px] font-medium text-[#5B6573] block">Utilidad bruta comercial</span>
              <strong className="text-xl font-semibold text-[#028448] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.costOfSales.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
              <span className="text-[11px] font-medium text-[#5B6573] block">Gastos negocio + familia</span>
              <strong className="text-xl font-semibold text-[#B45309] font-mono tabular-nums mt-0.5 block">
                S/ {(liveBundle.businessExpenses.totalBusinessExpenses + liveBundle.familyExpenses.totalFamilyExpenses).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
              <span className="text-[11px] font-medium text-[#5B6573] block">Resultado antes de cuotas</span>
              <strong className="text-xl font-semibold text-[#121212] font-mono tabular-nums mt-0.5 block">
                S/ {liveBundle.incomeStatement.resultBeforeFinancialObligations.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ingresos & Costo de Ventas */}
            <div
              id="econ-ingresos"
              className={`bg-white rounded-lg border p-5 space-y-4 scroll-mt-20 transition-colors ${sectionFocusClass('econ-ingresos')}`}
            >
              <div className="border-b border-[#E2E6EC] pb-2.5 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#121212]">
                  Ingresos mensuales (S/)
                </h3>
                <span className="text-[11px] text-[#1464A5] font-medium">
                  Registra ventas promedio verificadas
                </span>
              </div>
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

              <h3 className="text-sm font-semibold text-[#121212] border-b border-[#E2E6EC] pb-2.5 pt-2">
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
            <div
              id="econ-gastos"
              className={`bg-white rounded-lg border p-5 space-y-4 scroll-mt-20 transition-colors ${sectionFocusClass('econ-gastos')}`}
            >
              <div className="border-b border-[#E2E6EC] pb-2.5 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#121212]">
                  Gastos operativos del negocio (S/)
                </h3>
                <span className="text-[11px] text-[#1464A5] font-medium">
                  Separa gastos comerciales de los familiares
                </span>
              </div>
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

              <h3 className="text-sm font-semibold text-[#121212] border-b border-[#E2E6EC] pb-2.5 pt-2">
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

          <div className="bg-white rounded-lg border border-[#E2E6EC] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {prevMeta && (
                <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Regresar</span>
                </button>
              )}
              <button onClick={() => handleSaveStep4(false)} className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                <Save className="w-3.5 h-3.5 text-[#004481]" />
                <span>Guardar y recalcular</span>
              </button>
            </div>
            <button onClick={() => handleSaveStep4(true)} className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
              <span>Guardar y continuar a Balance General</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ESTADOS FINANCIEROS Y BALANCE GENERAL */}
      {moduleId === 'balance' && (
        <BalanceGeneralModule
          dossier={activeDossier}
          liveIncomeStatement={liveBundle.incomeStatement}
          activeSubSection={activeSubSection}
          onNavigateToInventory={() =>
            navigateTo('inventario_documentos', 'pat_inventario', 'pat-inventario')
          }
          onBackStep={prevMeta ? () => setActiveTab(prevMeta.id) : undefined}
          onNextStep={nextMeta ? () => setActiveTab(nextMeta.id) : undefined}
        />
      )}

      {/* STEP 6: CAPACIDAD DE PAGO Y OBLIGACIONES */}
      {moduleId === 'capacidad' && (
        <div className="space-y-5">
          {/* Negative Surplus Red Alert */}
          {activeDossier.paymentCapacity.remainingSurplusAfterProposedInstallment < 0 && (
            <div className="p-3.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#C81E1E] text-xs font-medium flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Alerta de capacidad de pago:</strong> El excedente mensual post-cuota es negativo (
                S/ {activeDossier.paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                ). Revisa el monto de cuota propuesta, gastos registrados o deudas vigentes.
              </span>
            </div>
          )}

          {/* Payment Capacity Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              id="cap-ingresos"
              className={`bg-white p-4 rounded-lg border scroll-mt-20 transition-colors ${sectionFocusClass('cap-ingresos')}`}
            >
              <span className="text-[11px] font-medium text-[#5B6573] block">Ingresos / Flujo disponible mensual</span>
              <strong className="text-xl font-semibold text-[#004481] font-mono tabular-nums mt-0.5 block">
                S/ {activeDossier.paymentCapacity.availableFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div
              id="cap-cuotas"
              className={`bg-white p-4 rounded-lg border scroll-mt-20 transition-colors ${sectionFocusClass('cap-cuotas')}`}
            >
              <span className="text-[11px] font-medium text-[#5B6573] block">Cuota propuesta + Deudas vigentes</span>
              <strong className="text-xl font-semibold text-[#1464A5] font-mono tabular-nums mt-0.5 block">
                S/ {(activeDossier.paymentCapacity.proposedInstallment + activeDossier.paymentCapacity.currentFinancialObligations).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div
              id="cap-excedente"
              className={`bg-white p-4 rounded-lg border scroll-mt-20 transition-colors ${sectionFocusClass('cap-excedente')}`}
            >
              <span className="text-[11px] font-medium text-[#5B6573] block">Excedente mensual post-cuota</span>
              <strong className={`text-xl font-semibold font-mono tabular-nums mt-0.5 block ${activeDossier.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-[#028448]' : 'text-[#C81E1E]'}`}>
                S/ {activeDossier.paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
              <span className="text-[11px] font-medium text-[#5B6573] block">Endeudamiento s/ activos</span>
              <strong className="text-xl font-semibold text-[#121212] font-mono tabular-nums mt-0.5 block">
                {activeDossier.ratios.indebtednessRatio.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Flujo de Caja e Indicadores de Capacidad de Pago */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div
              id="ef-flujo"
              className={`bg-white rounded-lg border p-5 space-y-3 scroll-mt-20 transition-colors ${sectionFocusClass('ef-flujo')}`}
            >
              <h3 className="text-sm font-semibold text-[#121212] border-b border-[#E2E6EC] pb-2.5">
                Flujo de Caja Mensual (Entradas vs Salidas)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E2E6EC]">
                  <span className="text-[#4A5568]">(+) Total entradas de efectivo</span>
                  <span className="font-mono font-semibold text-[#028448] tabular-nums">
                    S/ {activeDossier.cashFlow.totalCashInflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E2E6EC]">
                  <span className="text-[#4A5568]">(-) Total salidas operativas, familiares y cuotas</span>
                  <span className="font-mono font-semibold text-[#C81E1E] tabular-nums">
                    - S/ {activeDossier.cashFlow.totalCashOutflow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 px-3 rounded-md bg-[#F0F5FA] border border-[#B8D0E6]">
                  <span className="font-semibold text-[#121212]">(=) Flujo neto mensual</span>
                  <span className={`font-mono font-semibold tabular-nums ${activeDossier.cashFlow.netCashFlow >= 0 ? 'text-[#004481]' : 'text-[#C81E1E]'}`}>
                    S/ {activeDossier.cashFlow.netCashFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div
              id="cap-indicadores"
              className={`bg-white rounded-lg border p-5 space-y-3 scroll-mt-20 transition-colors ${sectionFocusClass('cap-indicadores')}`}
            >
              <h3 className="text-sm font-semibold text-[#121212] border-b border-[#E2E6EC] pb-2.5">
                Indicadores de Capacidad de Pago y Solvencia
              </h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC]">
                  <span className="text-[11px] text-[#5B6573] block">Carga financiera</span>
                  <strong className="text-base font-semibold text-[#004481] font-mono tabular-nums mt-0.5 block">
                    {activeDossier.ratios.financialBurdenRatio.toFixed(1)}%
                  </strong>
                </div>
                <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC]">
                  <span className="text-[11px] text-[#5B6573] block">Cobertura de deuda</span>
                  <strong className="text-base font-semibold text-[#028448] font-mono tabular-nums mt-0.5 block">
                    {activeDossier.ratios.debtCoverageRatio.toFixed(2)}x
                  </strong>
                </div>
                <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC]">
                  <span className="text-[11px] text-[#5B6573] block">Endeudamiento</span>
                  <strong className="text-base font-semibold text-[#121212] font-mono tabular-nums mt-0.5 block">
                    {activeDossier.ratios.indebtednessRatio.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Add Obligation Form */}
          <form
            id="econ-obligaciones"
            onSubmit={handleAddObligation}
            className={`bg-white rounded-lg border p-5 space-y-4 scroll-mt-20 transition-colors ${sectionFocusClass('econ-obligaciones')}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#121212] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#004481]" />
                <span>Registrar deuda u obligación financiera vigente</span>
              </h3>
              <span className="text-[11px] text-[#1464A5] font-medium">
                Las cuotas registradas se descuentan automáticamente del flujo disponible.
              </span>
            </div>
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
                  className="w-full py-2 px-4 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  + Agregar deuda
                </button>
              </div>
            </div>
          </form>

          {/* Existing Obligations Table */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
            <div className="p-4 border-b border-[#E2E6EC] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#121212]">
                Obligaciones registradas ({activeDossier.obligations.length})
              </h3>
              <span className="text-xs font-mono font-semibold text-[#4A5568] tabular-nums">
                Total cuotas mensuales: S/ {activeDossier.paymentCapacity.currentFinancialObligations.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F7F8FA] border-b border-[#E2E6EC] text-[#5B6573] font-semibold">
                    <th className="py-3 pl-4">Entidad</th>
                    <th className="py-3 px-3">Tipo crédito</th>
                    <th className="py-3 px-3 text-right">Saldo actual</th>
                    <th className="py-3 px-3 text-right">Cuota mensual</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 pr-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6EC]">
                  {activeDossier.obligations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[#5B6573]">
                        Sin obligaciones financieras externas registradas.
                      </td>
                    </tr>
                  ) : (
                    activeDossier.obligations.map((ob) => (
                      <tr key={ob.id} className="hover:bg-[#F7F8FA]">
                        <td className="py-3 pl-4 font-semibold text-[#121212]">{ob.entityName}</td>
                        <td className="py-3 px-3 text-[#4A5568]">{ob.creditType}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">S/ {ob.currentBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#004481] tabular-nums">S/ {ob.monthlyInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#028448] border border-[#A7F3D0]">{ob.status}</span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <button
                            onClick={() => handleDeleteObligation(ob.id)}
                            className="p-1.5 rounded-md text-[#5B6573] hover:text-[#C81E1E] hover:bg-[#FEF2F2] cursor-pointer"
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

          <div className="bg-white rounded-lg border border-[#E2E6EC] p-4 flex flex-wrap items-center justify-between gap-3">
            {prevMeta && (
              <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
                <span>Regresar</span>
              </button>
            )}
            {nextMeta && (
              <button onClick={() => setActiveTab(nextMeta.id)} className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
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
          {/* Clean Module Switcher (Inventario del Negocio | Documentos de Sustento) */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStep7Tab('inventario')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 ${
                  step7Tab === 'inventario'
                    ? 'bg-[#004481] text-white'
                    : 'text-[#4A5568] hover:bg-[#F7F8FA] hover:text-[#121212]'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Inventario del negocio ({activeDossier.inventory.length})</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] tabular-nums ${
                    step7Tab === 'inventario'
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F0F5FA] text-[#004481]'
                  }`}
                >
                  S/ {activeDossier.inventory.reduce((s, i) => s + i.totalCostValue, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStep7Tab('documentos')}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 ${
                  step7Tab === 'documentos'
                    ? 'bg-[#004481] text-white'
                    : 'text-[#4A5568] hover:bg-[#F7F8FA] hover:text-[#121212]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Control de documentos ({docsVerifiedOrReceived}/{activeDossier.documents.length})</span>
                {docsPendingCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] tabular-nums ${
                      step7Tab === 'documentos'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                    }`}
                  >
                    {docsPendingCount} pend.
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('balance', 'ef_balance', 'ef-balance')}
              className="px-3 py-1.5 rounded-md bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#028448] border border-[#A7F3D0] text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Conectado con Balance General</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {step7Tab === 'inventario' ? (
            <div id="pat-inventario" className="scroll-mt-20">
              <InventoryModule
                dossier={activeDossier}
                onNavigateToBalance={() => navigateTo('balance', 'ef_balance', 'ef-balance')}
              />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Document Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
                  <span className="text-[11px] font-medium text-[#5B6573] block">Documentos recibidos / verificados</span>
                  <strong className="text-2xl font-semibold text-[#028448] font-mono tabular-nums mt-0.5 block">
                    {docsVerifiedOrReceived} de {activeDossier.documents.length}
                  </strong>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
                  <span className="text-[11px] font-medium text-[#5B6573] block">Documentos pendientes / observados</span>
                  <strong className="text-2xl font-semibold text-[#B45309] font-mono tabular-nums mt-0.5 block">
                    {docsPendingCount}
                  </strong>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
                  <span className="text-[11px] font-medium text-[#5B6573] block">Valor inventario conectado</span>
                  <strong className="text-2xl font-semibold text-[#004481] font-mono tabular-nums mt-0.5 block">
                    S/ {activeDossier.inventory.reduce((s, i) => s + i.totalCostValue, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* Documents Checklist & Upload */}
              <div
                id="doc-control"
                className={`bg-white rounded-lg border p-5 space-y-4 scroll-mt-20 transition-colors ${sectionFocusClass('doc-control')}`}
              >
                <div className="border-b border-[#E2E6EC] pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[#121212]">
                    Documentos de sustento del expediente
                  </h3>
                  <span className="text-[11px] text-[#1464A5] font-medium">
                    Adjuntar un archivo actualiza automáticamente su estado a Recibido.
                  </span>
                </div>

                <form onSubmit={handleAddNewDocumentReq} className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="Agregar nuevo requisito documental..."
                    className="flex-1 min-w-[200px] px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/15"
                  />
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                  >
                    <option value="DNI">DNI</option>
                    <option value="Sustento de ingresos">Sustento de ingresos</option>
                    <option value="Documentación del negocio">Documentación del negocio</option>
                    <option value="Documentación patrimonial">Documentación patrimonial</option>
                    <option value="Otros documentos">Otros documentos</option>
                  </select>
                  <button type="submit" className="px-3.5 py-2 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold cursor-pointer">
                    + Agregar
                  </button>
                </form>

                <div className="divide-y divide-[#E2E6EC]">
                  {activeDossier.documents.map((doc) => (
                    <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="w-4 h-4 text-[#004481] shrink-0" />
                          <span className="font-semibold text-[#121212] truncate">{doc.name}</span>
                        </div>
                        <div className="text-[11px] text-[#5B6573] mt-0.5 flex flex-wrap gap-2">
                          <span>{doc.documentType}</span>
                          {doc.fileName && (
                            <span className="font-mono text-[#1464A5]">· {doc.fileName} ({doc.fileSize})</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#F7F8FA] hover:bg-[#ECEFF3] border border-[#CBD5E1] text-[#121212] text-[11px] font-semibold cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#004481]" />
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
                          className={`px-2.5 py-1.5 rounded text-[11px] font-semibold border cursor-pointer ${
                            doc.status === 'Verificado'
                              ? 'bg-[#ECFDF5] text-[#028448] border-[#A7F3D0]'
                              : doc.status === 'Recibido'
                              ? 'bg-[#F0F5FA] text-[#004481] border-[#B8D0E6]'
                              : doc.status === 'Observado'
                              ? 'bg-[#FEF2F2] text-[#C81E1E] border-[#FECACA]'
                              : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
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
            </div>
          )}

          <div className="bg-white rounded-lg border border-[#E2E6EC] p-4 flex flex-wrap items-center justify-between gap-3">
            {prevMeta && (
              <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
                <span>Regresar</span>
              </button>
            )}
            {nextMeta && (
              <button onClick={() => setActiveTab(nextMeta.id)} className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
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
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-6 space-y-5">
            <h2 className="text-sm font-semibold text-[#121212] border-b border-[#E2E6EC] pb-3">
              Conclusión técnica del analista y estado del expediente
            </h2>

            <div className="p-3.5 rounded-md bg-[#F0F5FA] border border-[#B8D0E6] flex items-start gap-2.5 text-xs text-[#1464A5]">
              <ShieldCheck className="w-4 h-4 text-[#004481] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#004481]">Nota de alcance:</strong> Las conclusiones registradas constituyen un informe técnico de organización de datos e indicadores para apoyo de la entidad financiera. EVALÚA no aprueba ni rechaza créditos.
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
              <div id="ef-notas" className="sm:col-span-2 scroll-mt-20">
                <label className={labelClass}>Comentarios técnicos del analista</label>
                <textarea
                  rows={3}
                  value={qualForm.analystComments}
                  onChange={(e) => setQualForm({ ...qualForm, analystComments: e.target.value })}
                  className={`${inputClass} ${activeSubSection === 'ef-notas' ? 'border-[#004481] ring-2 ring-[#004481]/15' : ''}`}
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
              <div id="obs-estado" className="scroll-mt-20">
                <label className={labelClass}>Estado de la solicitud</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as ApplicationStatus)}
                  className={`${inputClass} ${activeSubSection === 'obs-estado' ? 'border-[#004481] ring-2 ring-[#004481]/15' : ''}`}
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

            <div className="pt-4 border-t border-[#E2E6EC] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {prevMeta && (
                  <button onClick={() => setActiveTab(prevMeta.id)} className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Regresar</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedDossierId(activeDossier.id);
                    setIsPrintModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#004481]" />
                  <span>Imprimir / Exportar PDF</span>
                </button>
              </div>

              <button
                onClick={handleSaveStep8}
                className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
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
