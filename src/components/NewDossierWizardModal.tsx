import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  X,
  User,
  Briefcase,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CreditCard,
  Package,
  FileCheck2,
  AlertCircle,
  Plus,
  Trash2,
  Building2
} from 'lucide-react';
import {
  DocumentType,
  MaritalStatus,
  BusinessSector,
  FormalityType,
  CreditDestination,
  PaymentFrequency,
  FinancialObligation,
  InventoryItem,
  AccountReceivableItem,
  AccountPayableItem,
  PersonalReference,
  DocumentControlItem,
  VisitVerificationData,
  QualitativeAnalysisData
} from '../types/evalua';
import {
  calculateAge,
  calculateIncomeTotals,
  calculateCostOfSales,
  calculateBusinessExpenses,
  calculateFamilyExpenses,
  calculateIncomeStatement,
  calculateBalanceSheet,
  calculateTotalObligations,
  calculateCashFlow,
  calculatePaymentCapacity,
  calculateFinancialRatios
} from '../utils/financialCalculations';
import { STANDARD_DOCUMENTS_TEMPLATE } from '../data/initialData';

interface NewDossierWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDossierWizardModal: React.FC<NewDossierWizardModalProps> = ({
  isOpen,
  onClose
}) => {
  const { createDossier, setSelectedDossierId, currentUser } = useEvalua();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // PASO 1: Datos generales del solicitante
  const [firstNames, setFirstNames] = useState('');
  const [paternalSurname, setPaternalSurname] = useState('');
  const [maternalSurname, setMaternalSurname] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('Soltero(a)');
  const [dependentsCount, setDependentsCount] = useState<number>(0);
  const [homeAddress, setHomeAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // PASO 2: Actividad económica o negocio
  const [businessName, setBusinessName] = useState('');
  const [activityType, setActivityType] = useState('');
  const [sector, setSector] = useState<BusinessSector>('Comercio');
  const [businessAddress, setBusinessAddress] = useState('');
  const [operatingTimeYears, setOperatingTimeYears] = useState<number>(0);
  const [operatingTimeMonths, setOperatingTimeMonths] = useState<number>(0);
  const [businessType, setBusinessType] = useState<any>('Propio');
  const [employeesCount, setEmployeesCount] = useState<number>(0);
  const [formality, setFormality] = useState<FormalityType>('Formal (RUC 10 / 20)');
  const [activityDescription, setActivityDescription] = useState('');

  // PASO 3: Solicitud de crédito
  const [creditProduct, setCreditProduct] = useState('Microcrédito Capital de Trabajo');
  const [requestedAmount, setRequestedAmount] = useState<number>(0);
  const [termMonths, setTermMonths] = useState<number>(12);
  const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>('Mensual');
  const [estimatedPaymentDate, setEstimatedPaymentDate] = useState('');
  const [destination, setDestination] = useState<CreditDestination>('Capital de trabajo');
  const [destinationDescription, setDestinationDescription] = useState('');
  const [proposedInstallment, setProposedInstallment] = useState<number>(0);

  // PASO 4: Ingresos
  const [monthlySales, setMonthlySales] = useState<number>(0);
  const [otherBusinessIncome, setOtherBusinessIncome] = useState<number>(0);
  const [salaryIncome, setSalaryIncome] = useState<number>(0);
  const [feesIncome, setFeesIncome] = useState<number>(0);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  const [otherPersonalIncome, setOtherPersonalIncome] = useState<number>(0);

  // Costo de ventas
  const [merchandisePurchases, setMerchandisePurchases] = useState<number>(0);
  const [rawMaterials, setRawMaterials] = useState<number>(0);
  const [freightCost, setFreightCost] = useState<number>(0);
  const [transportSalesCost, setTransportSalesCost] = useState<number>(0);
  const [otherSalesCosts, setOtherSalesCosts] = useState<number>(0);

  // Gastos del negocio
  const [rent, setRent] = useState<number>(0);
  const [utilities, setUtilities] = useState<number>(0);
  const [internetPhone, setInternetPhone] = useState<number>(0);
  const [payroll, setPayroll] = useState<number>(0);
  const [transportBusiness, setTransportBusiness] = useState<number>(0);
  const [maintenance, setMaintenance] = useState<number>(0);
  const [advertising, setAdvertising] = useState<number>(0);
  const [commissions, setCommissions] = useState<number>(0);
  const [otherBusinessExpenses, setOtherBusinessExpenses] = useState<number>(0);

  // Gastos familiares
  const [food, setFood] = useState<number>(0);
  const [housing, setHousing] = useState<number>(0);
  const [education, setEducation] = useState<number>(0);
  const [health, setHealth] = useState<number>(0);
  const [transportFamily, setTransportFamily] = useState<number>(0);
  const [utilitiesFamily, setUtilitiesFamily] = useState<number>(0);
  const [communication, setCommunication] = useState<number>(0);
  const [otherFamilyExpenses, setOtherFamilyExpenses] = useState<number>(0);

  // PASO 5: Balance General
  const [cash, setCash] = useState<number>(0);
  const [bankDeposits, setBankDeposits] = useState<number>(0);
  const [inventoryValue, setInventoryValue] = useState<number>(0);
  const [accountsReceivableValue, setAccountsReceivableValue] = useState<number>(0);
  const [otherCurrentAssets, setOtherCurrentAssets] = useState<number>(0);
  const [landValue, setLandValue] = useState<number>(0);
  const [housingValue, setHousingValue] = useState<number>(0);
  const [commercialPremisesValue, setCommercialPremisesValue] = useState<number>(0);
  const [vehiclesValue, setVehiclesValue] = useState<number>(0);
  const [machineryValue, setMachineryValue] = useState<number>(0);
  const [equipmentValue, setEquipmentValue] = useState<number>(0);
  const [otherNonCurrentAssets, setOtherNonCurrentAssets] = useState<number>(0);
  const [shortTermCredits, setShortTermCredits] = useState<number>(0);
  const [suppliersPayable, setSuppliersPayable] = useState<number>(0);
  const [otherCurrentLiabilities, setOtherCurrentLiabilities] = useState<number>(0);
  const [longTermCredits, setLongTermCredits] = useState<number>(0);
  const [otherNonCurrentLiabilities, setOtherNonCurrentLiabilities] = useState<number>(0);

  // PASO 6: Obligaciones Financieras
  const [obligations, setObligations] = useState<FinancialObligation[]>([]);

  // PASO 7: Inventarios, Cuentas, Referencias & Docs
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [receivablesList] = useState<AccountReceivableItem[]>([]);
  const [payablesList] = useState<AccountPayableItem[]>([]);
  const [referencesList] = useState<PersonalReference[]>([]);

  const [visitVerification, setVisitVerification] = useState<VisitVerificationData>({
    visitDate: new Date().toISOString().split('T')[0],
    addressVisited: '',
    personContacted: '',
    informationVerified: '',
    observations: '',
    verifiedBy: currentUser?.name || 'Analista de Crédito'
  });

  const [documentsList] = useState<DocumentControlItem[]>(STANDARD_DOCUMENTS_TEMPLATE);

  // PASO 8: Análisis Cualitativo & Conclusión
  const [qualitative, setQualitative] = useState<QualitativeAnalysisData>({
    activityExperience: '',
    businessStability: '',
    businessOrganization: '',
    referencesSummary: '',
    visitSummary: '',
    analystComments: '',
    analystConclusion: '',
    finalObservations: ''
  });

  const handleLoadDemoData = () => {
    setFirstNames('Alberto');
    setPaternalSurname('Gómez');
    setMaternalSurname('Ríos');
    setDocumentType('DNI');
    setDocumentNumber('45892134');
    setBirthDate('1987-05-18');
    setMaritalStatus('Casado(a)');
    setDependentsCount(2);
    setHomeAddress('Av. Próceres de la Independencia 1420');
    setDistrict('San Juan de Lurigancho');
    setProvince('Lima');
    setDepartment('Lima');
    setPhone('987-654-321');
    setEmail('alberto.gomez@ejemplo.pe');

    setBusinessName('Bazar y Librería "San Alberto"');
    setActivityType('Comercio de Artículos de Librería y Papelería');
    setSector('Comercio');
    setBusinessAddress('Av. Próceres de la Independencia 1420 (Local propio)');
    setOperatingTimeYears(5);
    setOperatingTimeMonths(2);
    setBusinessType('Propio');
    setEmployeesCount(1);
    setFormality('RUS (Régimen Único Simplificado)');
    setActivityDescription('Venta de útiles escolares, oficina, impresiones y servicios conexos.');

    setCreditProduct('Microcrédito Capital de Trabajo');
    setRequestedAmount(8000);
    setTermMonths(12);
    setPaymentFrequency('Mensual');
    setEstimatedPaymentDate('2026-12-15');
    setDestination('Compra de mercadería');
    setDestinationDescription('Abastecimiento de útiles y papelería para campaña escolar.');
    setProposedInstallment(750);

    setMonthlySales(6500);
    setOtherBusinessIncome(0);
    setSalaryIncome(0);
    setMerchandisePurchases(2200);
    setFreightCost(150);
    setRent(0);
    setUtilities(180);
    setInternetPhone(90);
    setOtherBusinessExpenses(80);
    setFood(1100);
    setEducation(300);
    setHealth(120);
    setTransportFamily(150);
    setUtilitiesFamily(140);
    setCommunication(80);

    setCash(1500);
    setBankDeposits(900);
    setInventoryValue(14000);
    setAccountsReceivableValue(800);
    setHousingValue(55000);
    setMachineryValue(4500);
    setEquipmentValue(2500);
    setShortTermCredits(450);
    setSuppliersPayable(1200);

    setObligations([
      {
        id: `obl-demo-1`,
        entityName: 'Caja Piura',
        creditType: 'Microempresa',
        originalAmount: 5000,
        currentBalance: 1800,
        monthlyInstallment: 450,
        totalInstallments: 12,
        paidInstallments: 8,
        pendingInstallments: 4,
        dueDate: '2026-12-20',
        status: 'Al día',
        observations: 'Puntual'
      }
    ]);

    setInventoryList([
      { id: 'inv-d1', productName: 'Cuadernos A4 cuadriculados (caja x 50)', quantity: 10, unitCost: 120, totalCostValue: 1200, sellingPrice: 175, observations: 'Stanford' },
      { id: 'inv-d2', productName: 'Papel bond 75g millares', quantity: 30, unitCost: 18, totalCostValue: 540, sellingPrice: 26, observations: 'Atlas' }
    ]);

    setQualitative({
      activityExperience: 'Más de 7 años en el rubro comercial de librerías.',
      businessStability: 'Local comercial en vivienda familiar con 5 años continuos.',
      businessOrganization: 'Maneja cuaderno de ventas e inventario al día.',
      referencesSummary: 'Referencias comerciales y de vecinos favorables.',
      visitSummary: 'Visita de verificación técnica realizada conforme.',
      analystComments: 'Flujo comercial adecuado y capacidad de pago demostrada.',
      analystConclusion: 'Expediente estructurado con información completa para sustento en comité de créditos.',
      finalObservations: 'Se adjuntan boletas de compras e inventario valorizado.'
    });

    setError(null);
  };

  if (!isOpen) return null;

  const age = calculateAge(birthDate);
  const incomeTotals = calculateIncomeTotals(monthlySales, otherBusinessIncome, salaryIncome, feesIncome, rentalIncome, otherPersonalIncome);
  const costOfSalesTotals = calculateCostOfSales(monthlySales, merchandisePurchases, rawMaterials, freightCost, transportSalesCost, otherSalesCosts);
  const businessExpensesTotals = calculateBusinessExpenses(
    costOfSalesTotals.grossProfit,
    rent,
    utilities,
    internetPhone,
    payroll,
    transportBusiness,
    maintenance,
    advertising,
    commissions,
    otherBusinessExpenses
  );
  const familyExpensesTotals = calculateFamilyExpenses(food, housing, education, health, transportFamily, utilitiesFamily, communication, otherFamilyExpenses);
  const totalFinancialObligations = calculateTotalObligations(obligations);

  const incomeStatement = calculateIncomeStatement(
    monthlySales,
    costOfSalesTotals.totalCostOfSales,
    businessExpensesTotals.totalBusinessExpenses,
    incomeTotals.otherBusinessIncome + incomeTotals.totalPersonalIncome,
    0,
    familyExpensesTotals.totalFamilyExpenses,
    totalFinancialObligations
  );

  const balanceSheet = calculateBalanceSheet(
    cash, bankDeposits, inventoryValue, accountsReceivableValue, otherCurrentAssets,
    landValue, housingValue, commercialPremisesValue, vehiclesValue, machineryValue, equipmentValue, otherNonCurrentAssets,
    shortTermCredits, suppliersPayable, otherCurrentLiabilities,
    longTermCredits, otherNonCurrentLiabilities
  );

  const cashFlow = calculateCashFlow(
    monthlySales, salaryIncome, otherBusinessIncome + rentalIncome + otherPersonalIncome, accountsReceivableValue,
    costOfSalesTotals.totalCostOfSales, businessExpensesTotals.totalBusinessExpenses, familyExpensesTotals.totalFamilyExpenses, totalFinancialObligations, 0
  );

  const totalMonthlyOutflows =
    costOfSalesTotals.totalCostOfSales +
    businessExpensesTotals.totalBusinessExpenses +
    familyExpensesTotals.totalFamilyExpenses;

  const paymentCapacity = calculatePaymentCapacity(
    incomeTotals.totalMonthlyIncome,
    totalMonthlyOutflows,
    totalFinancialObligations,
    proposedInstallment
  );

  const financialRatios = calculateFinancialRatios(
    balanceSheet.totalAssets,
    balanceSheet.totalLiabilities,
    incomeTotals.totalMonthlyIncome,
    totalFinancialObligations,
    paymentCapacity.availableFlow
  );

  const validateStep = (s: number): boolean => {
    setError(null);
    if (s === 1) {
      if (!firstNames.trim() || !paternalSurname.trim()) {
        setError('Complete los nombres y apellido paterno del solicitante.');
        return false;
      }
      if (!documentNumber.trim()) {
        setError('Ingrese el número de documento de identidad del solicitante.');
        return false;
      }
      if (documentType === 'DNI' && !/^\d{8}$/.test(documentNumber.trim())) {
        setError('El DNI debe tener exactamente 8 dígitos numéricos.');
        return false;
      }
      if (documentType === 'RUC' && !/^\d{11}$/.test(documentNumber.trim())) {
        setError('El RUC debe tener exactamente 11 dígitos numéricos.');
        return false;
      }
      if (!birthDate) {
        setError('Seleccione la fecha de nacimiento del solicitante.');
        return false;
      }
      if (age < 18) {
        setError('El solicitante debe ser mayor de edad (mínimo 18 años).');
        return false;
      }
      if (!phone.trim()) {
        setError('Ingrese un número de teléfono móvil de contacto.');
        return false;
      }
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (cleanPhone.length < 9) {
        setError('El número telefónico debe tener al menos 9 dígitos.');
        return false;
      }
      if (!homeAddress.trim()) {
        setError('Ingrese la dirección domiciliaria del solicitante.');
        return false;
      }
    } else if (s === 2) {
      if (!businessName.trim()) {
        setError('Ingrese el nombre comercial o razón social del negocio.');
        return false;
      }
      if (!activityType.trim()) {
        setError('Indique el tipo de actividad económica o rubro comercial.');
        return false;
      }
      if (!businessAddress.trim()) {
        setError('Ingrese la dirección de funcionamiento del negocio.');
        return false;
      }
    } else if (s === 3) {
      if (Number(requestedAmount) <= 0) {
        setError('El monto de crédito solicitado debe ser mayor a S/ 0.');
        return false;
      }
      if (Number(termMonths) <= 0) {
        setError('El plazo solicitado debe ser al menos de 1 mes.');
        return false;
      }
      if (Number(proposedInstallment) <= 0) {
        setError('La cuota propuesta estimada debe ser mayor a S/ 0.');
        return false;
      }
      if (!destinationDescription.trim()) {
        setError('Detalle el destino específico del crédito solicitado.');
        return false;
      }
    } else if (s === 4) {
      if (incomeTotals.totalMonthlyIncome <= 0) {
        setError('Debe registrar al menos una fuente de ingresos mensuales (Ventas mayores a S/ 0).');
        return false;
      }
    } else if (s === 8) {
      if (!qualitative.analystConclusion.trim()) {
        setError('Debe registrar la conclusión u opinión técnica del analista para culminar el expediente.');
        return false;
      }
    }
    return true;
  };

  const handleAddObligation = () => {
    const newObl: FinancialObligation = {
      id: `obl-${Date.now()}`,
      entityName: '',
      creditType: 'Microempresa',
      originalAmount: 0,
      currentBalance: 0,
      monthlyInstallment: 0,
      totalInstallments: 12,
      paidInstallments: 0,
      pendingInstallments: 12,
      dueDate: new Date().toISOString().split('T')[0],
      status: 'Al día'
    };
    setObligations([...obligations, newObl]);
  };

  const handleRemoveObligation = (id: string) => {
    setObligations(obligations.filter(o => o.id !== id));
  };

  const handleObligationField = (id: string, field: keyof FinancialObligation, val: any) => {
    setObligations(obligations.map(o => (o.id === id ? { ...o, [field]: val } : o)));
  };

  const handleAddInventory = () => {
    const newInv: InventoryItem = {
      id: `inv-${Date.now()}`,
      productName: '',
      quantity: 1,
      unitCost: 0,
      totalCostValue: 0,
      sellingPrice: 0
    };
    setInventoryList([...inventoryList, newInv]);
  };

  const handleInventoryField = (id: string, field: keyof InventoryItem, val: any) => {
    setInventoryList(inventoryList.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitCost') {
          updated.totalCostValue = Number(updated.quantity || 0) * Number(updated.unitCost || 0);
        }
        return updated;
      }
      return item;
    }));
  };

  const totalInventoryCalculated = inventoryList.reduce((acc, i) => acc + i.totalCostValue, 0);

  const handleSaveAndFinish = () => {
    for (const stepNum of [1, 2, 3, 4, 8]) {
      if (!validateStep(stepNum)) {
        setStep(stepNum);
        return;
      }
    }

    const fullName = `${firstNames} ${paternalSurname} ${maternalSurname}`.trim();

    const created = createDossier({
      status: 'registrada',
      assignedAnalystId: currentUser?.id || 'usr-1',
      assignedAnalystName: currentUser?.name || 'Asesor Financiero',
      assignedAnalystRole: currentUser?.roleTitle || 'Analista de Crédito',
      agency: currentUser?.agency || 'Agencia Principal - Lima Centro',

      personal: {
        firstNames,
        paternalSurname,
        maternalSurname,
        fullName,
        documentType,
        documentNumber,
        birthDate,
        age,
        maritalStatus,
        dependentsCount: Number(dependentsCount),
        homeAddress,
        district,
        province,
        department,
        phone,
        email
      },

      business: {
        businessName: businessName || `${fullName} (Negocio)`,
        activityType,
        sector,
        businessAddress: businessAddress || homeAddress,
        operatingTimeYears: Number(operatingTimeYears),
        operatingTimeMonths: Number(operatingTimeMonths),
        businessType,
        employeesCount: Number(employeesCount),
        formality,
        activityDescription
      },

      terms: {
        creditProduct,
        requestedAmount: Number(requestedAmount),
        termMonths: Number(termMonths),
        paymentFrequency,
        estimatedPaymentDate,
        destination,
        destinationDescription,
        proposedInstallment: Number(proposedInstallment)
      },

      income: incomeTotals,
      costOfSales: costOfSalesTotals,
      businessExpenses: businessExpensesTotals,
      familyExpenses: familyExpensesTotals,
      incomeStatement,
      balanceSheet,
      obligations,
      cashFlow,
      paymentCapacity,
      ratios: financialRatios,

      inventory: inventoryList,
      accountsReceivable: receivablesList,
      accountsPayable: payablesList,

      references: referencesList,
      visitVerification,
      documents: documentsList,
      qualitative
    });

    onClose();
    setSelectedDossierId(created.id);
  };

  const inputClass =
    'w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-blue-500/15';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D63ED] flex items-center justify-center border border-blue-200/70">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0B2545]">Registro de Nuevo Expediente Crediticio</h3>
              <p className="text-xs text-slate-500">
                Paso {step} de 8: {step === 1 && 'Datos Generales del Solicitante'}
                {step === 2 && 'Actividad Económica o Negocio'}
                {step === 3 && 'Condiciones de la Solicitud de Crédito'}
                {step === 4 && 'Ingresos, Costo de Ventas y Gastos Operativos / Familiares'}
                {step === 5 && 'Estado de Resultados & Balance General'}
                {step === 6 && 'Obligaciones, Flujo de Caja & Capacidad de Pago'}
                {step === 7 && 'Inventario, Cuentas, Referencias & Documentos'}
                {step === 8 && 'Análisis Cualitativo & Conclusión del Analista'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemoData}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#1D63ED] text-[11px] font-bold border border-blue-200 transition-colors cursor-pointer"
              title="Llenar con datos referenciales de prueba"
            >
              <span>Cargar datos de ejemplo</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:text-[#0B2545] hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar Ribbon */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { n: 1, l: '1. Solicitante' },
            { n: 2, l: '2. Negocio' },
            { n: 3, l: '3. Crédito' },
            { n: 4, l: '4. Ingresos & Gastos' },
            { n: 5, l: '5. EEFF & Balance' },
            { n: 6, l: '6. Capacidad Pago' },
            { n: 7, l: '7. Inventario & Docs' },
            { n: 8, l: '8. Conclusión' }
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => {
                if (s.n <= step || validateStep(step)) {
                  setStep(s.n);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                step === s.n
                  ? 'bg-[#1D63ED] text-white shadow-xs'
                  : step > s.n
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/70'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {s.l}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#F6F9FC]">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* PASO 1 */}
          {step === 1 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                <User className="w-4 h-4" />
                <span>Paso 1: Datos Generales del Solicitante</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombres *</label>
                  <input type="text" required value={firstNames} onChange={(e) => setFirstNames(e.target.value)} placeholder="Ej. Juan" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellido Paterno *</label>
                  <input type="text" required value={paternalSurname} onChange={(e) => setPaternalSurname(e.target.value)} placeholder="Ej. Pérez" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellido Materno</label>
                  <input type="text" value={maternalSurname} onChange={(e) => setMaternalSurname(e.target.value)} placeholder="Ej. López" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Documento</label>
                  <select value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType)} className={inputClass}>
                    <option value="DNI">DNI (Documento Nacional)</option>
                    <option value="CE">Carné de Extranjería (CE)</option>
                    <option value="RUC">RUC 10 / 20</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de DNI / Doc *</label>
                  <input type="text" required value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="41892015" className={`${inputClass} font-mono`} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de Nacimiento *</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Edad Calculada</label>
                  <input type="text" disabled value={`${age} años`} className="w-full p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[#1D63ED] font-bold text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado Civil</label>
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)} className={inputClass}>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Conviviente">Conviviente</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Dependientes</label>
                  <input type="number" min="0" value={dependentsCount} onChange={(e) => setDependentsCount(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil *</label>
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="984-512-309" className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dirección Domiciliaria *</label>
                  <input type="text" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} placeholder="Av. Las Palmeras 450" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Distrito</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Los Olivos" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Departamento</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Lima" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                <Briefcase className="w-4 h-4" />
                <span>Paso 2: Actividad Económica o Negocio</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre del Negocio *</label>
                  <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ej. Bodega Don Juan" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Actividad *</label>
                  <input type="text" value={activityType} onChange={(e) => setActivityType(e.target.value)} placeholder="Ej. Abarrotes, Bodega, Taller" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sector Económico</label>
                  <select value={sector} onChange={(e) => setSector(e.target.value as BusinessSector)} className={inputClass}>
                    <option value="Comercio">Comercio</option>
                    <option value="Producción / Manufactura">Producción / Manufactura</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Agropecuario">Agropecuario</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Construcción">Construcción</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Dirección del Negocio *</label>
                  <input type="text" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Misma dirección o local comercial" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Antigüedad (Años)</label>
                  <input type="number" min="0" value={operatingTimeYears} onChange={(e) => setOperatingTimeYears(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Local</label>
                  <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className={inputClass}>
                    <option value="Propio">Propio</option>
                    <option value="Alquilado">Alquilado</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Puesto de Mercado">Puesto de Mercado</option>
                    <option value="Ambulatorio">Ambulatorio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Formalidad del Negocio</label>
                  <select value={formality} onChange={(e) => setFormality(e.target.value as FormalityType)} className={inputClass}>
                    <option value="RUS (Régimen Único Simplificado)">RUS (Régimen Único Simplificado)</option>
                    <option value="Formal (RUC 10 / 20)">Formal (RUC 10 / 20 General)</option>
                    <option value="Régimen Especial">Régimen Especial de Renta</option>
                    <option value="Régimen Mype Tributario">Régimen Mype Tributario</option>
                    <option value="Informal / En proceso">Informal / En proceso de formalización</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Número de Trabajadores</label>
                  <input type="number" min="0" value={employeesCount} onChange={(e) => setEmployeesCount(Number(e.target.value))} className={inputClass} />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-slate-700 mb-1">Descripción de la Actividad</label>
                <textarea rows={2} value={activityDescription} onChange={(e) => setActivityDescription(e.target.value)} placeholder="Detalle los principales productos o servicios..." className={inputClass} />
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                <DollarSign className="w-4 h-4" />
                <span>Paso 3: Solicitud de Crédito</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Producto Crediticio</label>
                  <input type="text" value={creditProduct} onChange={(e) => setCreditProduct(e.target.value)} placeholder="Microcrédito Capital de Trabajo" className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monto Solicitado (S/) *</label>
                  <input type="number" min="100" value={requestedAmount} onChange={(e) => setRequestedAmount(Number(e.target.value))} className={`${inputClass} font-bold font-mono`} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plazo Solicitado (Meses) *</label>
                  <input type="number" min="1" value={termMonths} onChange={(e) => setTermMonths(Number(e.target.value))} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frecuencia de Pago</label>
                  <select value={paymentFrequency} onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)} className={inputClass}>
                    <option value="Mensual">Mensual</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Al vencimiento">Al vencimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha Estimada de Pago</label>
                  <input type="date" value={estimatedPaymentDate} onChange={(e) => setEstimatedPaymentDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuota Mensual Propuesta (S/) *</label>
                  <input type="number" value={proposedInstallment} onChange={(e) => setProposedInstallment(Number(e.target.value))} className={`${inputClass} font-bold font-mono`} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destino del Crédito</label>
                  <select value={destination} onChange={(e) => setDestination(e.target.value as CreditDestination)} className={inputClass}>
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
                  <label className="block font-bold text-slate-700 mb-1">Descripción del Destino *</label>
                  <input type="text" value={destinationDescription} onChange={(e) => setDestinationDescription(e.target.value)} placeholder="Detalle el uso de los fondos..." className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* PASO 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                <TrendingUp className="w-4 h-4" />
                <span>Paso 4: Ingresos, Costo de Ventas y Gastos</span>
              </div>

              {/* Ingresos */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-[#0B2545]">1. Ingresos Mensuales</h4>
                  <span className="text-xs font-extrabold text-emerald-600 font-mono tabular-nums">
                    Total: S/ {incomeTotals.totalMonthlyIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Ventas Mensuales Negocio *</label>
                    <input type="number" value={monthlySales} onChange={(e) => setMonthlySales(Number(e.target.value))} className={`${inputClass} font-bold font-mono`} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Otros Ingresos Negocio</label>
                    <input type="number" value={otherBusinessIncome} onChange={(e) => setOtherBusinessIncome(Number(e.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Sueldo / Planilla</label>
                    <input type="number" value={salaryIncome} onChange={(e) => setSalaryIncome(Number(e.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Honorarios / Alquileres / Otros</label>
                    <input type="number" value={feesIncome + rentalIncome + otherPersonalIncome} onChange={(e) => setFeesIncome(Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Costo de Ventas */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-[#0B2545]">2. Costo de Ventas (Ventas - Costos = Utilidad Bruta)</h4>
                  <span className="text-xs font-extrabold text-[#1D63ED] font-mono tabular-nums">
                    Utilidad Bruta: S/ {costOfSalesTotals.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Compra de Mercadería</label>
                    <input type="number" value={merchandisePurchases} onChange={(e) => setMerchandisePurchases(Number(e.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Materia Prima</label>
                    <input type="number" value={rawMaterials} onChange={(e) => setRawMaterials(Number(e.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Flete & Transporte</label>
                    <input type="number" value={freightCost + transportSalesCost} onChange={(e) => setFreightCost(Number(e.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Otros Costos</label>
                    <input type="number" value={otherSalesCosts} onChange={(e) => setOtherSalesCosts(Number(e.target.value))} className={inputClass} />
                  </div>
                </div>
              </div>

              {/* Gastos del Negocio & Familiares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-extrabold text-[#0B2545]">3. Gastos del Negocio</span>
                    <span className="font-bold text-rose-600 font-mono tabular-nums">S/ {businessExpensesTotals.totalBusinessExpenses.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Alquiler local</label>
                      <input type="number" value={rent} onChange={e => setRent(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Servicios & Internet</label>
                      <input type="number" value={utilities + internetPhone} onChange={e => setUtilities(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Personal / Sueldos</label>
                      <input type="number" value={payroll} onChange={e => setPayroll(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Transporte & Otros</label>
                      <input type="number" value={transportBusiness + otherBusinessExpenses} onChange={e => setTransportBusiness(Number(e.target.value))} className={inputClass} />
                    </div>
                  </div>
                  <div className="pt-1 text-[11px] text-[#1D63ED] font-bold font-mono">
                    Resultado Operativo: S/ {businessExpensesTotals.operatingResult.toFixed(2)}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-extrabold text-[#0B2545]">4. Gastos Familiares</span>
                    <span className="font-bold text-rose-600 font-mono tabular-nums">S/ {familyExpensesTotals.totalFamilyExpenses.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Alimentación</label>
                      <input type="number" value={food} onChange={e => setFood(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Educación & Salud</label>
                      <input type="number" value={education + health} onChange={e => setEducation(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Transporte Familiar</label>
                      <input type="number" value={transportFamily} onChange={e => setTransportFamily(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Servicios & Comunicación</label>
                      <input type="number" value={utilitiesFamily + communication} onChange={e => setUtilitiesFamily(Number(e.target.value))} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                <Building2 className="w-4 h-4" />
                <span>Paso 5: Balance General / Situación Patrimonial</span>
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">Total Activos</span>
                  <div className="text-lg font-black text-emerald-700 font-mono tabular-nums">S/ {balanceSheet.totalAssets.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700">Total Pasivos</span>
                  <div className="text-lg font-black text-rose-700 font-mono tabular-nums">S/ {balanceSheet.totalLiabilities.toLocaleString()}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[10px] uppercase font-bold text-[#1D63ED]">Patrimonio Neto</span>
                  <div className="text-lg font-black text-[#1D63ED] font-mono tabular-nums">S/ {balanceSheet.equity.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <h4 className="font-extrabold text-[#0B2545] border-b border-slate-100 pb-1.5">Activos Corrientes y No Corrientes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Efectivo / Bancos</label>
                      <input type="number" value={cash + bankDeposits} onChange={e => setCash(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Inventarios (S/)</label>
                      <input type="number" value={inventoryValue} onChange={e => setInventoryValue(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Cuentas por Cobrar</label>
                      <input type="number" value={accountsReceivableValue} onChange={e => setAccountsReceivableValue(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Inmueble / Vivienda</label>
                      <input type="number" value={housingValue} onChange={e => setHousingValue(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Vehículos</label>
                      <input type="number" value={vehiclesValue} onChange={e => setVehiclesValue(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Maquinaria & Equipos</label>
                      <input type="number" value={machineryValue + equipmentValue} onChange={e => setMachineryValue(Number(e.target.value))} className={inputClass} />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  <h4 className="font-extrabold text-[#0B2545] border-b border-slate-100 pb-1.5">Pasivos Corrientes y No Corrientes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Deudas Corto Plazo</label>
                      <input type="number" value={shortTermCredits} onChange={e => setShortTermCredits(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600">Proveedores x Pagar</label>
                      <input type="number" value={suppliersPayable} onChange={e => setSuppliersPayable(Number(e.target.value))} className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600">Deudas a Largo Plazo</label>
                      <input type="number" value={longTermCredits} onChange={e => setLongTermCredits(Number(e.target.value))} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 6 */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                  <CreditCard className="w-4 h-4" />
                  <span>Paso 6: Obligaciones Financieras & Capacidad de Pago</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddObligation}
                  className="px-3 py-1.5 bg-blue-50 text-[#1D63ED] hover:bg-[#1D63ED] hover:text-white border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Deuda</span>
                </button>
              </div>

              <div className="space-y-2">
                {obligations.map((obl) => (
                  <div key={obl.id} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Entidad Financiera</label>
                      <input
                        type="text"
                        value={obl.entityName}
                        onChange={(e) => handleObligationField(obl.id, 'entityName', e.target.value)}
                        placeholder="Ej. Caja Huancayo"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Saldo (S/)</label>
                      <input
                        type="number"
                        value={obl.currentBalance}
                        onChange={(e) => handleObligationField(obl.id, 'currentBalance', Number(e.target.value))}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Cuota Mensual (S/)</label>
                      <input
                        type="number"
                        value={obl.monthlyInstallment}
                        onChange={(e) => handleObligationField(obl.id, 'monthlyInstallment', Number(e.target.value))}
                        className={`${inputClass} font-bold text-rose-600`}
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveObligation(obl.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-extrabold text-[#0B2545] uppercase tracking-wider">
                  Cálculo de Capacidad de Pago
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block">Ingresos</span>
                    <strong className="text-emerald-600 font-mono">S/ {paymentCapacity.monthlyIncome.toLocaleString()}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block">Gastos Totales</span>
                    <strong className="text-rose-600 font-mono">S/ {paymentCapacity.monthlyExpenses.toLocaleString()}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block">Cuotas Actuales</span>
                    <strong className="text-rose-600 font-mono">S/ {paymentCapacity.currentFinancialObligations.toLocaleString()}</strong>
                  </div>
                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200">
                    <span className="text-[#1D63ED] text-[10px] font-bold block">Disponible</span>
                    <strong className="text-[#1D63ED] font-mono">S/ {paymentCapacity.availableFlow.toLocaleString()}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 text-[10px] font-bold block">Cuota Propuesta</span>
                    <strong className="text-[#0B2545] font-mono">S/ {paymentCapacity.proposedInstallment.toLocaleString()}</strong>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-emerald-700 text-[10px] block font-bold">Saldo Post-Cuota</span>
                    <strong className={`font-mono font-black ${paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      S/ {paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Endeudamiento</span>
                  <span className="text-base font-black text-[#0B2545] font-mono">{financialRatios.indebtednessRatio.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-500 mt-1">Fórmula: Pasivos / Activos × 100</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Carga Financiera</span>
                  <span className="text-base font-black text-[#0B2545] font-mono">{financialRatios.financialBurdenRatio.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-500 mt-1">Fórmula: Cuotas / Ingresos × 100</p>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cobertura de Obligaciones</span>
                  <span className="text-base font-black text-emerald-600 font-mono">{financialRatios.debtCoverageRatio.toFixed(2)}x</span>
                  <p className="text-[10px] text-slate-500 mt-1">Fórmula: Flujo disponible / Cuotas</p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 7 */}
          {step === 7 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                  <Package className="w-4 h-4" />
                  <span>Paso 7: Inventario, Cuentas, Referencias & Documentación</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddInventory}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-[#1D63ED] text-[#1D63ED] hover:text-white border border-blue-200 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                >
                  + Agregar Producto
                </button>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex justify-between font-bold text-[#0B2545]">
                  <span>Inventario de Mercadería</span>
                  <span className="text-emerald-600 font-mono">Valor Total: S/ {totalInventoryCalculated.toLocaleString()}</span>
                </div>
                {inventoryList.map((inv) => (
                  <div key={inv.id} className="grid grid-cols-4 gap-2 items-center">
                    <input
                      type="text"
                      value={inv.productName}
                      onChange={(e) => handleInventoryField(inv.id, 'productName', e.target.value)}
                      placeholder="Producto"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      value={inv.quantity}
                      onChange={(e) => handleInventoryField(inv.id, 'quantity', Number(e.target.value))}
                      placeholder="Cant"
                      className={inputClass}
                    />
                    <input
                      type="number"
                      value={inv.unitCost}
                      onChange={(e) => handleInventoryField(inv.id, 'unitCost', Number(e.target.value))}
                      placeholder="Costo U."
                      className={inputClass}
                    />
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-right font-mono font-bold text-emerald-700">
                      S/ {inv.totalCostValue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <h4 className="font-extrabold text-[#0B2545]">Verificación de Visita de Campo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={visitVerification.visitDate}
                    onChange={(e) => setVisitVerification({ ...visitVerification, visitDate: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={visitVerification.personContacted}
                    onChange={(e) => setVisitVerification({ ...visitVerification, personContacted: e.target.value })}
                    placeholder="Persona contactada"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={visitVerification.informationVerified}
                    onChange={(e) => setVisitVerification({ ...visitVerification, informationVerified: e.target.value })}
                    placeholder="Información verificada en campo"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 8 */}
          {step === 8 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1D63ED]">
                <FileCheck2 className="w-4 h-4" />
                <span>Paso 8: Análisis Cualitativo y Conclusión del Analista</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experiencia en la actividad y estabilidad del negocio</label>
                  <textarea
                    rows={2}
                    value={qualitative.activityExperience}
                    onChange={(e) => setQualitative({ ...qualitative, activityExperience: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Comentarios del Analista</label>
                  <textarea
                    rows={2}
                    value={qualitative.analystComments}
                    onChange={(e) => setQualitative({ ...qualitative, analystComments: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                  <label className="block font-extrabold text-[#0B2545] uppercase tracking-wider">
                    Conclusión del Analista *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={qualitative.analystConclusion}
                    onChange={(e) => setQualitative({ ...qualitative, analystConclusion: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs outline-none focus:border-[#1D63ED]"
                  />
                  <p className="text-[11px] text-slate-600 italic">
                    * EVALÚA no genera decisiones automáticas de aprobación o rechazo. Registre su conclusión técnica manual.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancelar
            </button>

            {step < 8 ? (
              <button
                type="button"
                onClick={() => {
                  if (validateStep(step)) {
                    setStep(step + 1);
                  }
                }}
                className="px-5 py-2.5 bg-[#1D63ED] hover:bg-[#1552CC] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Guardar y continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndFinish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Crear Expediente de Evaluación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
