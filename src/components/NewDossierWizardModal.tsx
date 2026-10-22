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
  Building2,
  Calendar,
  CheckCircle2,
  HelpCircle,
  ShieldCheck
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

  // PASO 1: Datos generales del solicitante - Inicialmente vacíos
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

  // PASO 5: Balance General (Situación Patrimonial)
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

  // PASO 6: Obligaciones Financieras (vacías por defecto)
  const [obligations, setObligations] = useState<FinancialObligation[]>([]);

  // PASO 7: Inventarios, Cuentas, Referencias & Docs
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [receivablesList, setReceivablesList] = useState<AccountReceivableItem[]>([]);
  const [payablesList, setPayablesList] = useState<AccountPayableItem[]>([]);
  const [referencesList, setReferencesList] = useState<PersonalReference[]>([]);

  const [visitVerification, setVisitVerification] = useState<VisitVerificationData>({
    visitDate: new Date().toISOString().split('T')[0],
    addressVisited: '',
    personContacted: '',
    informationVerified: '',
    observations: '',
    verifiedBy: currentUser?.name || 'Analista de Crédito'
  });

  const [documentsList, setDocumentsList] = useState<DocumentControlItem[]>(STANDARD_DOCUMENTS_TEMPLATE);

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

  // Función opcional para cargar datos de prueba demostrativos con 1 clic
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
    setEmail('alberto.gomez@gmail.com');

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
    setEstimatedPaymentDate('2024-11-15');
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
        dueDate: '2024-11-20',
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

  // Calculos en vivo automáticos
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

  // Total egresos mensuales operativos y familiares (Costo + Gastos Negocio + Gastos Familiares)
  // Sin doble descuento de obligaciones
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

  // Validación estricta por paso
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

  // Add obligation
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

  // Add Inventory item
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

  // Final Submit
  const handleSaveAndFinish = () => {
    // Validar pasos críticos antes de guardar
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
      assignedAnalystName: currentUser?.name || 'Carlos Méndez Salazar',
      assignedAnalystRole: currentUser?.roleTitle || 'Analista de Crédito Senior',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registro de Solicitud y Expediente Crediticio</h3>
              <p className="text-xs text-slate-400">
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Llenar con datos ficticios para pruebas"
            >
              <span>🧪 Cargar datos de prueba (Demo)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar Ribbon */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-xs">
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
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                step === s.n
                  ? 'bg-blue-600 text-white shadow-sm'
                  : step > s.n
                  ? 'text-emerald-400 bg-slate-900'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s.l}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* PASO 1: Datos generales del solicitante */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <User className="w-4 h-4" />
                <span>Paso 1: Datos Generales del Solicitante</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={firstNames}
                    onChange={(e) => setFirstNames(e.target.value)}
                    placeholder="Ej. Juan"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Apellido Paterno *</label>
                  <input
                    type="text"
                    required
                    value={paternalSurname}
                    onChange={(e) => setPaternalSurname(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Apellido Materno</label>
                  <input
                    type="text"
                    value={maternalSurname}
                    onChange={(e) => setMaternalSurname(e.target.value)}
                    placeholder="Ej. López"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Tipo de Documento</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="DNI">DNI (Documento Nacional)</option>
                    <option value="CE">Carné de Extranjería (CE)</option>
                    <option value="RUC">RUC 10</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Número de DNI / Doc *</label>
                  <input
                    type="text"
                    required
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="41892015"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Edad Calculada</label>
                  <input
                    type="text"
                    disabled
                    value={`${age} años`}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Estado Civil</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Conviviente">Conviviente</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Número de Dependientes</label>
                  <input
                    type="number"
                    min="0"
                    value={dependentsCount}
                    onChange={(e) => setDependentsCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="984-512-309"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1">Dirección Domiciliaria</label>
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="Av. Las Palmeras 450"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Distrito</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Los Olivos"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Lima"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Actividad económica o negocio */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Briefcase className="w-4 h-4" />
                <span>Paso 2: Actividad Económica o Negocio</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Nombre del Negocio *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Bodega Don Juan"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tipo de Actividad</label>
                  <input
                    type="text"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    placeholder="Ej. Abarrotes, Bodega, Taller"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Sector Económico</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as BusinessSector)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
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
                  <label className="block text-slate-300 mb-1">Dirección del Negocio</label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Misma dirección o local comercial"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tiempo de Funcionamiento (Años)</label>
                  <input
                    type="number"
                    min="0"
                    value={operatingTimeYears}
                    onChange={(e) => setOperatingTimeYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tipo de Local</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
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
                  <label className="block text-slate-300 mb-1">Formalidad del Negocio</label>
                  <select
                    value={formality}
                    onChange={(e) => setFormality(e.target.value as FormalityType)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="RUS (Régimen Único Simplificado)">RUS (Régimen Único Simplificado)</option>
                    <option value="Formal (RUC 10 / 20)">Formal (RUC 10 / 20 General)</option>
                    <option value="Régimen Especial">Régimen Especial de Renta</option>
                    <option value="Régimen Mype Tributario">Régimen Mype Tributario</option>
                    <option value="Informal / En proceso">Informal / En proceso de formalización</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Número de Trabajadores</label>
                  <input
                    type="number"
                    min="0"
                    value={employeesCount}
                    onChange={(e) => setEmployeesCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-300 mb-1">Descripción de la Actividad</label>
                <textarea
                  rows={2}
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  placeholder="Detalle los principales productos o servicios..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                />
              </div>
            </div>
          )}

          {/* PASO 3: Solicitud de crédito */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <DollarSign className="w-4 h-4" />
                <span>Paso 3: Solicitud de Crédito</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Producto Crediticio</label>
                  <input
                    type="text"
                    value={creditProduct}
                    onChange={(e) => setCreditProduct(e.target.value)}
                    placeholder="Microcrédito Capital de Trabajo"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Monto Solicitado (S/) *</label>
                  <input
                    type="number"
                    min="100"
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Plazo Solicitado (Meses) *</label>
                  <input
                    type="number"
                    min="1"
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Frecuencia de Pago</label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value as PaymentFrequency)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Mensual">Mensual</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Al vencimiento">Al vencimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Fecha Estimada de Pago</label>
                  <input
                    type="date"
                    value={estimatedPaymentDate}
                    onChange={(e) => setEstimatedPaymentDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Cuota Mensual Propuesta (S/)</label>
                  <input
                    type="number"
                    value={proposedInstallment}
                    onChange={(e) => setProposedInstallment(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Destino del Crédito</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as CreditDestination)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
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
                  <label className="block text-slate-300 mb-1">Descripción del Destino del Crédito</label>
                  <input
                    type="text"
                    value={destinationDescription}
                    onChange={(e) => setDestinationDescription(e.target.value)}
                    placeholder="Detalle el uso de los fondos..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: Ingresos, Costos y Gastos */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span>Paso 4: Ingresos, Costo de Ventas y Gastos</span>
              </div>

              {/* Ingresos */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200">1. Ingresos Mensuales</h4>
                  <span className="text-xs font-bold text-emerald-400">
                    Total: S/ {incomeTotals.totalMonthlyIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Ventas Mensuales Negocio</label>
                    <input
                      type="number"
                      value={monthlySales}
                      onChange={(e) => setMonthlySales(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Otros Ingresos Negocio</label>
                    <input
                      type="number"
                      value={otherBusinessIncome}
                      onChange={(e) => setOtherBusinessIncome(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Sueldo / Planilla</label>
                    <input
                      type="number"
                      value={salaryIncome}
                      onChange={(e) => setSalaryIncome(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Honorarios / Alquileres / Otros</label>
                    <input
                      type="number"
                      value={feesIncome + rentalIncome + otherPersonalIncome}
                      onChange={(e) => setFeesIncome(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Costo de Ventas */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-slate-200">2. Costo de Ventas (Ventas - Costos = Utilidad Bruta)</h4>
                  <span className="text-xs font-bold text-blue-400">
                    Utilidad Bruta: S/ {costOfSalesTotals.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Compra de Mercadería</label>
                    <input
                      type="number"
                      value={merchandisePurchases}
                      onChange={(e) => setMerchandisePurchases(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Materia Prima</label>
                    <input
                      type="number"
                      value={rawMaterials}
                      onChange={(e) => setRawMaterials(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Flete & Transporte</label>
                    <input
                      type="number"
                      value={freightCost + transportSalesCost}
                      onChange={(e) => setFreightCost(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Otros Costos</label>
                    <input
                      type="number"
                      value={otherSalesCosts}
                      onChange={(e) => setOtherSalesCosts(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Gastos del Negocio & Familiares */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-slate-200">3. Gastos del Negocio</span>
                    <span className="font-bold text-rose-400">S/ {businessExpensesTotals.totalBusinessExpenses.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Alquiler local</label>
                      <input type="number" value={rent} onChange={e=>setRent(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Servicios & Internet</label>
                      <input type="number" value={utilities + internetPhone} onChange={e=>setUtilities(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Personal / Sueldos</label>
                      <input type="number" value={payroll} onChange={e=>setPayroll(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Transporte & Otros</label>
                      <input type="number" value={transportBusiness + otherBusinessExpenses} onChange={e=>setTransportBusiness(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                  </div>
                  <div className="pt-2 text-[11px] text-blue-300 font-semibold">
                    Resultado Operativo: S/ {businessExpensesTotals.operatingResult.toFixed(2)}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-slate-200">4. Gastos Familiares</span>
                    <span className="font-bold text-rose-400">S/ {familyExpensesTotals.totalFamilyExpenses.toFixed(2)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Alimentación</label>
                      <input type="number" value={food} onChange={e=>setFood(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Educación & Salud</label>
                      <input type="number" value={education + health} onChange={e=>setEducation(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Transporte Familiar</label>
                      <input type="number" value={transportFamily} onChange={e=>setTransportFamily(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Servicios & Comunicación</label>
                      <input type="number" value={utilitiesFamily + communication} onChange={e=>setUtilitiesFamily(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 5: Estado de Resultados & Balance General */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Building2 className="w-4 h-4" />
                <span>Paso 5: Balance General / Situación Patrimonial</span>
              </div>

              {/* Balance Summary Header */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-blue-500/30 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Activos</span>
                  <div className="text-lg font-black text-emerald-400">S/ {balanceSheet.totalAssets.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Pasivos</span>
                  <div className="text-lg font-black text-rose-400">S/ {balanceSheet.totalLiabilities.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-300">Patrimonio Neto</span>
                  <div className="text-lg font-black text-blue-400">S/ {balanceSheet.equity.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Activos */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">Activos Corrientes y No Corrientes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Efectivo / Bancos</label>
                      <input type="number" value={cash + bankDeposits} onChange={e=>setCash(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Inventarios (S/)</label>
                      <input type="number" value={inventoryValue} onChange={e=>setInventoryValue(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Cuentas por Cobrar</label>
                      <input type="number" value={accountsReceivableValue} onChange={e=>setAccountsReceivableValue(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Inmueble / Vivienda</label>
                      <input type="number" value={housingValue} onChange={e=>setHousingValue(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Vehículos</label>
                      <input type="number" value={vehiclesValue} onChange={e=>setVehiclesValue(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Maquinaria & Equipos</label>
                      <input type="number" value={machineryValue + equipmentValue} onChange={e=>setMachineryValue(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                  </div>
                </div>

                {/* Pasivos */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-200 border-b border-slate-800 pb-1">Pasivos Corrientes y No Corrientes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Deudas Corto Plazo</label>
                      <input type="number" value={shortTermCredits} onChange={e=>setShortTermCredits(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Proveedores x Pagar</label>
                      <input type="number" value={suppliersPayable} onChange={e=>setSuppliersPayable(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400">Deudas a Largo Plazo</label>
                      <input type="number" value={longTermCredits} onChange={e=>setLongTermCredits(Number(e.target.value))} className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 6: Obligaciones, Flujo de Caja & Capacidad de Pago */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <CreditCard className="w-4 h-4" />
                  <span>Paso 6: Obligaciones Financieras & Capacidad de Pago</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddObligation}
                  className="px-3 py-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Deuda</span>
                </button>
              </div>

              {/* Obligaciones Table */}
              <div className="space-y-2">
                {obligations.map((obl) => (
                  <div key={obl.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block">Entidad Financiera</label>
                      <input
                        type="text"
                        value={obl.entityName}
                        onChange={(e) => handleObligationField(obl.id, 'entityName', e.target.value)}
                        placeholder="Ej. Caja Huancayo"
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Saldo (S/)</label>
                      <input
                        type="number"
                        value={obl.currentBalance}
                        onChange={(e) => handleObligationField(obl.id, 'currentBalance', Number(e.target.value))}
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Cuota Mensual (S/)</label>
                      <input
                        type="number"
                        value={obl.monthlyInstallment}
                        onChange={(e) => handleObligationField(obl.id, 'monthlyInstallment', Number(e.target.value))}
                        className="w-full p-1.5 rounded bg-slate-900 border border-slate-800 text-white font-bold text-rose-400"
                      />
                    </div>
                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveObligation(obl.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Capacidad de Pago Box (Requirement 16) */}
              <div className="p-4 bg-gradient-to-r from-blue-950/60 to-slate-900 rounded-xl border border-blue-500/30 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cálculo de Capacidad de Pago
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Ingresos</span>
                    <strong className="text-emerald-400">S/ {paymentCapacity.monthlyIncome.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Gastos Totales</span>
                    <strong className="text-rose-400">S/ {paymentCapacity.monthlyExpenses.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Cuotas Actuales</span>
                    <strong className="text-rose-400">S/ {paymentCapacity.currentFinancialObligations.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-blue-300 text-[10px] block">Disponible</span>
                    <strong className="text-blue-400">S/ {paymentCapacity.availableFlow.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Cuota Propuesta</span>
                    <strong className="text-white">S/ {paymentCapacity.proposedInstallment.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded border border-blue-500/40">
                    <span className="text-emerald-300 text-[10px] block font-bold">Saldo Post-Cuota</span>
                    <strong className={paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400'}>
                      S/ {paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString()}
                    </strong>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">
                  * Información disponible para evaluación del analista.
                </p>
              </div>

              {/* Indicadores Financieros (Requirement 17) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Endeudamiento</span>
                  <span className="text-base font-black text-white">{financialRatios.indebtednessRatio.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-400 mt-1">Fórmula: Pasivos / Activos × 100</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Carga Financiera</span>
                  <span className="text-base font-black text-white">{financialRatios.financialBurdenRatio.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-400 mt-1">Fórmula: Cuotas / Ingresos × 100</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cobertura de Obligaciones</span>
                  <span className="text-base font-black text-emerald-400">{financialRatios.debtCoverageRatio.toFixed(2)}x</span>
                  <p className="text-[10px] text-slate-400 mt-1">Fórmula: Flujo disponible / Cuotas</p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 7: Inventarios, Cuentas, Referencias & Documentos */}
          {step === 7 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <Package className="w-4 h-4" />
                  <span>Paso 7: Inventario, Cuentas, Referencias & Documentación</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddInventory}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
                >
                  + Agregar Producto
                </button>
              </div>

              {/* Inventario */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between font-bold text-slate-200">
                  <span>Inventario de Mercadería</span>
                  <span className="text-emerald-400">Valor Total: S/ {totalInventoryCalculated.toLocaleString()}</span>
                </div>
                {inventoryList.map((inv) => (
                  <div key={inv.id} className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={inv.productName}
                      onChange={(e) => handleInventoryField(inv.id, 'productName', e.target.value)}
                      placeholder="Producto"
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                    <input
                      type="number"
                      value={inv.quantity}
                      onChange={(e) => handleInventoryField(inv.id, 'quantity', Number(e.target.value))}
                      placeholder="Cant"
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                    <input
                      type="number"
                      value={inv.unitCost}
                      onChange={(e) => handleInventoryField(inv.id, 'unitCost', Number(e.target.value))}
                      placeholder="Costo U."
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                    />
                    <div className="p-1.5 bg-slate-900 rounded text-right font-mono text-emerald-400">
                      S/ {inv.totalCostValue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Verificación de Visita */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200">Verificación de Visita de Campo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="date"
                    value={visitVerification.visitDate}
                    onChange={(e) => setVisitVerification({ ...visitVerification, visitDate: e.target.value })}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                  <input
                    type="text"
                    value={visitVerification.personContacted}
                    onChange={(e) => setVisitVerification({ ...visitVerification, personContacted: e.target.value })}
                    placeholder="Persona contactada"
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                  <input
                    type="text"
                    value={visitVerification.informationVerified}
                    onChange={(e) => setVisitVerification({ ...visitVerification, informationVerified: e.target.value })}
                    placeholder="Información verificada en campo"
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 8: Análisis Cualitativo & Conclusión */}
          {step === 8 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <FileCheck2 className="w-4 h-4" />
                <span>Paso 8: Análisis Cualitativo y Conclusión del Analista</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 mb-1">Experiencia en la actividad y estabilidad del negocio</label>
                  <textarea
                    rows={2}
                    value={qualitative.activityExperience}
                    onChange={(e) => setQualitative({ ...qualitative, activityExperience: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Comentarios del Analista</label>
                  <textarea
                    rows={2}
                    value={qualitative.analystComments}
                    onChange={(e) => setQualitative({ ...qualitative, analystComments: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  />
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/30 space-y-2">
                  <label className="block font-bold text-white uppercase tracking-wider">
                    Conclusión del Analista *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={qualitative.analystConclusion}
                    onChange={(e) => setQualitative({ ...qualitative, analystConclusion: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    * EVALÚA no genera decisiones automáticas de aprobación o rechazo. Registre su conclusión manual.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold ${
              step === 1 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white'
            }`}
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
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
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Guardar y continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndFinish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
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
