import {
  IncomeData,
  CostOfSalesData,
  BusinessExpensesData,
  FamilyExpensesData,
  IncomeStatementData,
  BalanceSheetData,
  BalanceSheetDetail,
  CurrentAssetAccountItem,
  FixedAssetItem,
  EquityBreakdown,
  FinancialObligation,
  InventoryItem,
  InventoryMetadata,
  CashFlowData,
  PaymentCapacityData,
  FinancialRatiosData,
  CreditEvaluationDossier
} from '../types/evalua';

/**
 * Explicación formal de fórmulas financieras utilizadas en EVALÚA
 * Todos los cálculos son informativos para el análisis del evaluador humano;
 * EVALÚA no aprueba ni rechaza créditos de forma automática.
 */
export const FINANCIAL_FORMULAS = {
  grossProfit: 'Ventas Mensuales – Costo de Ventas = Utilidad Bruta',
  operatingResult: 'Utilidad Bruta – Gastos Operativos del Negocio = Resultado Operativo',
  resultBeforeObligations: 'Resultado Operativo + Otros Ingresos – Gastos Familiares = Resultado Antes de Obligaciones Financieras',
  availableResult: 'Resultado Antes de Obligaciones – Cuotas Financieras Existentes = Resultado Disponible',
  paymentCapacity: 'Ingresos Mensuales – Egresos Operativos y Familiares – Cuotas Existentes = Flujo Disponible',
  surplusAfterProposed: 'Flujo Disponible – Cuota Propuesta Mensual = Saldo / Excedente Remanente',
  equity: 'Total Activos – Total Pasivos = Patrimonio Neto',
  indebtedness: '(Total Pasivos / Total Activos) × 100 (% Endeudamiento sobre Activos)',
  financialBurden: '(Cuotas Financieras / Ingresos Mensuales) × 100 (% Carga Financiera Mensual)',
  debtCoverage: 'Flujo Disponible / Cuotas Financieras Mensuales (Veces de Cobertura)'
};

/**
 * Calcula la edad a partir de la fecha de nacimiento (YYYY-MM-DD)
 */
export function calculateAge(birthDateStr: string): number {
  if (!birthDateStr || typeof birthDateStr !== 'string') return 0;
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Calcula totales de ingresos mensuales (Negocio y Personal)
 * No descuenta costos ni gastos en este nivel.
 */
export function calculateIncomeTotals(
  monthlySales: number,
  otherBusinessIncome: number,
  salaryIncome: number,
  feesIncome: number,
  rentalIncome: number,
  otherPersonalIncome: number
): IncomeData {
  const safeSales = Math.max(0, Number(monthlySales) || 0);
  const safeOtherBiz = Math.max(0, Number(otherBusinessIncome) || 0);
  const safeSalary = Math.max(0, Number(salaryIncome) || 0);
  const safeFees = Math.max(0, Number(feesIncome) || 0);
  const safeRent = Math.max(0, Number(rentalIncome) || 0);
  const safeOtherPers = Math.max(0, Number(otherPersonalIncome) || 0);

  const totalBusinessIncome = safeSales + safeOtherBiz;
  const totalPersonalIncome = safeSalary + safeFees + safeRent + safeOtherPers;
  const totalMonthlyIncome = totalBusinessIncome + totalPersonalIncome;

  return {
    monthlySales: safeSales,
    otherBusinessIncome: safeOtherBiz,
    totalBusinessIncome,
    salaryIncome: safeSalary,
    feesIncome: safeFees,
    rentalIncome: safeRent,
    otherPersonalIncome: safeOtherPers,
    totalPersonalIncome,
    totalMonthlyIncome
  };
}

/**
 * Calcula el Costo de Ventas y la Utilidad Bruta
 * Fórmula: Utilidad Bruta = Ventas - Costo de Ventas
 */
export function calculateCostOfSales(
  monthlySales: number,
  merchandisePurchases: number,
  rawMaterials: number,
  freightCost: number,
  transportSalesCost: number,
  otherSalesCosts: number
): CostOfSalesData {
  const safeSales = Math.max(0, Number(monthlySales) || 0);
  const safePurchases = Math.max(0, Number(merchandisePurchases) || 0);
  const safeMaterials = Math.max(0, Number(rawMaterials) || 0);
  const safeFreight = Math.max(0, Number(freightCost) || 0);
  const safeTransport = Math.max(0, Number(transportSalesCost) || 0);
  const safeOther = Math.max(0, Number(otherSalesCosts) || 0);

  const totalCostOfSales = safePurchases + safeMaterials + safeFreight + safeTransport + safeOther;
  const grossProfit = safeSales - totalCostOfSales;

  return {
    merchandisePurchases: safePurchases,
    rawMaterials: safeMaterials,
    freightCost: safeFreight,
    transportSalesCost: safeTransport,
    otherSalesCosts: safeOther,
    totalCostOfSales,
    grossProfit
  };
}

/**
 * Calcula los Gastos Operativos del Negocio y el Resultado Operativo
 * Fórmula: Resultado Operativo = Utilidad Bruta - Gastos Operativos del Negocio
 */
export function calculateBusinessExpenses(
  grossProfit: number,
  rent: number,
  utilities: number,
  internetPhone: number,
  payroll: number,
  transportBusiness: number,
  maintenance: number,
  advertising: number,
  commissions: number,
  otherBusinessExpenses: number
): BusinessExpensesData {
  const safeRent = Math.max(0, Number(rent) || 0);
  const safeUtilities = Math.max(0, Number(utilities) || 0);
  const safeInternet = Math.max(0, Number(internetPhone) || 0);
  const safePayroll = Math.max(0, Number(payroll) || 0);
  const safeTransport = Math.max(0, Number(transportBusiness) || 0);
  const safeMaintenance = Math.max(0, Number(maintenance) || 0);
  const safeAdvertising = Math.max(0, Number(advertising) || 0);
  const safeCommissions = Math.max(0, Number(commissions) || 0);
  const safeOther = Math.max(0, Number(otherBusinessExpenses) || 0);

  const totalBusinessExpenses =
    safeRent +
    safeUtilities +
    safeInternet +
    safePayroll +
    safeTransport +
    safeMaintenance +
    safeAdvertising +
    safeCommissions +
    safeOther;

  const operatingResult = Number(grossProfit || 0) - totalBusinessExpenses;

  return {
    rent: safeRent,
    utilities: safeUtilities,
    internetPhone: safeInternet,
    payroll: safePayroll,
    transportBusiness: safeTransport,
    maintenance: safeMaintenance,
    advertising: safeAdvertising,
    commissions: safeCommissions,
    otherBusinessExpenses: safeOther,
    totalBusinessExpenses,
    operatingResult
  };
}

/**
 * Calcula los Gastos Familiares y Personales
 */
export function calculateFamilyExpenses(
  food: number,
  housing: number,
  education: number,
  health: number,
  transport: number,
  utilitiesFamily: number,
  communication: number,
  otherFamilyExpenses: number
): FamilyExpensesData {
  const safeFood = Math.max(0, Number(food) || 0);
  const safeHousing = Math.max(0, Number(housing) || 0);
  const safeEducation = Math.max(0, Number(education) || 0);
  const safeHealth = Math.max(0, Number(health) || 0);
  const safeTransport = Math.max(0, Number(transport) || 0);
  const safeUtilities = Math.max(0, Number(utilitiesFamily) || 0);
  const safeComm = Math.max(0, Number(communication) || 0);
  const safeOther = Math.max(0, Number(otherFamilyExpenses) || 0);

  const totalFamilyExpenses =
    safeFood +
    safeHousing +
    safeEducation +
    safeHealth +
    safeTransport +
    safeUtilities +
    safeComm +
    safeOther;

  return {
    food: safeFood,
    housing: safeHousing,
    education: safeEducation,
    health: safeHealth,
    transport: safeTransport,
    utilitiesFamily: safeUtilities,
    communication: safeComm,
    otherFamilyExpenses: safeOther,
    totalFamilyExpenses
  };
}

/**
 * Calcula el Estado de Resultados (P&L mensual)
 *
 * Flujo riguroso:
 *   (+) Ventas
 *   (-) Costo de ventas
 *   (=) Utilidad bruta
 *   (-) Gastos operativos del negocio
 *   (=) Resultado operativo
 *   (+) Otros ingresos (negocio no operacional + personal)
 *   (-) Otros gastos
 *   (-) Gastos familiares
 *   (=) Resultado antes de obligaciones financieras
 *   (-) Cuotas de créditos existentes
 *   (=) Resultado disponible
 */
export function calculateIncomeStatement(
  monthlySales: number,
  costOfSales: number,
  operatingExpenses: number,
  otherIncome: number,
  otherExpenses: number,
  familyExpenses: number,
  financialInstallments: number
): IncomeStatementData {
  const safeSales = Math.max(0, Number(monthlySales) || 0);
  const safeCost = Math.max(0, Number(costOfSales) || 0);
  const safeOperatingExpenses = Math.max(0, Number(operatingExpenses) || 0);
  const safeOtherIncome = Math.max(0, Number(otherIncome) || 0);
  const safeOtherExpenses = Math.max(0, Number(otherExpenses) || 0);
  const safeFamilyExpenses = Math.max(0, Number(familyExpenses) || 0);
  const safeFinancial = Math.max(0, Number(financialInstallments) || 0);

  const grossProfit = safeSales - safeCost;
  const operatingResult = grossProfit - safeOperatingExpenses;
  const resultBeforeFinancialObligations =
    operatingResult + safeOtherIncome - safeOtherExpenses - safeFamilyExpenses;
  const availableResult = resultBeforeFinancialObligations - safeFinancial;

  return {
    salesIncome: safeSales,
    costOfSales: safeCost,
    grossProfit,
    operatingExpenses: safeOperatingExpenses,
    operatingResult,
    otherIncome: safeOtherIncome,
    otherExpenses: safeOtherExpenses,
    resultBeforeFinancialObligations,
    financialInstallments: safeFinancial,
    availableResult
  };
}

/**
 * Calcula Balance General y Patrimonio Neto
 * Fórmula: Patrimonio Neto = Total Activos - Total Pasivos
 */
export function calculateBalanceSheet(
  cash: number,
  bankDeposits: number,
  inventoryValue: number,
  accountsReceivableValue: number,
  otherCurrentAssets: number,
  landValue: number,
  housingValue: number,
  commercialPremisesValue: number,
  vehiclesValue: number,
  machineryValue: number,
  equipmentValue: number,
  otherNonCurrentAssets: number,
  shortTermCredits: number,
  suppliersPayable: number,
  otherCurrentLiabilities: number,
  longTermCredits: number,
  otherNonCurrentLiabilities: number
): BalanceSheetData {
  const safeCash = Math.max(0, Number(cash) || 0);
  const safeBank = Math.max(0, Number(bankDeposits) || 0);
  const safeInv = Math.max(0, Number(inventoryValue) || 0);
  const safeRec = Math.max(0, Number(accountsReceivableValue) || 0);
  const safeOtherCA = Math.max(0, Number(otherCurrentAssets) || 0);

  const totalCurrentAssets = safeCash + safeBank + safeInv + safeRec + safeOtherCA;

  const safeLand = Math.max(0, Number(landValue) || 0);
  const safeHousing = Math.max(0, Number(housingValue) || 0);
  const safePremises = Math.max(0, Number(commercialPremisesValue) || 0);
  const safeVehicles = Math.max(0, Number(vehiclesValue) || 0);
  const safeMachinery = Math.max(0, Number(machineryValue) || 0);
  const safeEquipment = Math.max(0, Number(equipmentValue) || 0);
  const safeOtherNCA = Math.max(0, Number(otherNonCurrentAssets) || 0);

  const totalNonCurrentAssets =
    safeLand + safeHousing + safePremises + safeVehicles + safeMachinery + safeEquipment + safeOtherNCA;

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const safeShortCredits = Math.max(0, Number(shortTermCredits) || 0);
  const safeSuppliers = Math.max(0, Number(suppliersPayable) || 0);
  const safeOtherCL = Math.max(0, Number(otherCurrentLiabilities) || 0);

  const totalCurrentLiabilities = safeShortCredits + safeSuppliers + safeOtherCL;

  const safeLongCredits = Math.max(0, Number(longTermCredits) || 0);
  const safeOtherNCL = Math.max(0, Number(otherNonCurrentLiabilities) || 0);

  const totalNonCurrentLiabilities = safeLongCredits + safeOtherNCL;

  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const equity = totalAssets - totalLiabilities;

  return {
    cash: safeCash,
    bankDeposits: safeBank,
    inventoryValue: safeInv,
    accountsReceivableValue: safeRec,
    otherCurrentAssets: safeOtherCA,
    totalCurrentAssets,
    landValue: safeLand,
    housingValue: safeHousing,
    commercialPremisesValue: safePremises,
    vehiclesValue: safeVehicles,
    machineryValue: safeMachinery,
    equipmentValue: safeEquipment,
    otherNonCurrentAssets: safeOtherNCA,
    totalNonCurrentAssets,
    totalAssets,
    shortTermCredits: safeShortCredits,
    suppliersPayable: safeSuppliers,
    otherCurrentLiabilities: safeOtherCL,
    totalCurrentLiabilities,
    longTermCredits: safeLongCredits,
    otherNonCurrentLiabilities: safeOtherNCL,
    totalNonCurrentLiabilities,
    totalLiabilities,
    equity
  };
}

/**
 * Calcula la suma de cuotas mensuales de obligaciones financieras activas
 */
export function calculateTotalObligations(obligations: FinancialObligation[]): number {
  if (!Array.isArray(obligations) || obligations.length === 0) return 0;
  return obligations.reduce((acc, obl) => {
    if (obl && obl.status !== 'Cancelado') {
      return acc + Math.max(0, Number(obl.monthlyInstallment) || 0);
    }
    return acc;
  }, 0);
}

/**
 * Calcula Flujo de Caja mensual
 * Inflows - Outflows consistentes
 */
export function calculateCashFlow(
  salesFlow: number,
  salaryFlow: number,
  otherIncomeFlow: number,
  collectionsFlow: number,
  purchasesFlow: number,
  businessExpensesFlow: number,
  familyExpensesFlow: number,
  creditInstallmentsFlow: number,
  otherOutflow: number
): CashFlowData {
  const safeSales = Math.max(0, Number(salesFlow) || 0);
  const safeSalary = Math.max(0, Number(salaryFlow) || 0);
  const safeOtherInc = Math.max(0, Number(otherIncomeFlow) || 0);
  const safeCollections = Math.max(0, Number(collectionsFlow) || 0);

  const totalCashInflow = safeSales + safeSalary + safeOtherInc + safeCollections;

  const safePurchases = Math.max(0, Number(purchasesFlow) || 0);
  const safeBizExpenses = Math.max(0, Number(businessExpensesFlow) || 0);
  const safeFamilyExpenses = Math.max(0, Number(familyExpensesFlow) || 0);
  const safeInstallments = Math.max(0, Number(creditInstallmentsFlow) || 0);
  const safeOtherOut = Math.max(0, Number(otherOutflow) || 0);

  const totalCashOutflow =
    safePurchases + safeBizExpenses + safeFamilyExpenses + safeInstallments + safeOtherOut;

  const netCashFlow = totalCashInflow - totalCashOutflow;

  return {
    salesFlow: safeSales,
    salaryFlow: safeSalary,
    otherIncomeFlow: safeOtherInc,
    collectionsFlow: safeCollections,
    totalCashInflow,
    purchasesFlow: safePurchases,
    businessExpensesFlow: safeBizExpenses,
    familyExpensesFlow: safeFamilyExpenses,
    creditInstallmentsFlow: safeInstallments,
    otherOutflow: safeOtherOut,
    totalCashOutflow,
    netCashFlow,
    isPositive: netCashFlow >= 0
  };
}

/**
 * Calcula Capacidad de Pago mensual
 * Consistente con el Estado de Resultados:
 * Flujo disponible = Ingresos Totales Mensuales - Egresos Totales Operativos y Familiares - Cuotas Existentes
 * Saldo / Excedente post-cuota = Flujo Disponible - Cuota Propuesta
 */
export function calculatePaymentCapacity(
  monthlyIncome: number,
  monthlyExpenses: number,
  currentFinancialObligations: number,
  proposedInstallment: number
): PaymentCapacityData {
  const safeIncome = Math.max(0, Number(monthlyIncome) || 0);
  const safeExpenses = Math.max(0, Number(monthlyExpenses) || 0);
  const safeObligations = Math.max(0, Number(currentFinancialObligations) || 0);
  const safeProposed = Math.max(0, Number(proposedInstallment) || 0);

  const availableFlow = safeIncome - safeExpenses - safeObligations;
  const remainingSurplusAfterProposedInstallment = availableFlow - safeProposed;

  return {
    monthlyIncome: safeIncome,
    monthlyExpenses: safeExpenses,
    currentFinancialObligations: safeObligations,
    availableFlow,
    proposedInstallment: safeProposed,
    remainingSurplusAfterProposedInstallment
  };
}

/**
 * Calcula Ratios Financieros informativos
 * Controla división entre cero y valores no válidos.
 */
export function calculateFinancialRatios(
  totalAssets: number,
  totalLiabilities: number,
  monthlyIncome: number,
  financialInstallments: number,
  availableFlow: number
): FinancialRatiosData {
  const safeAssets = Math.max(0, Number(totalAssets) || 0);
  const safeLiabilities = Math.max(0, Number(totalLiabilities) || 0);
  const safeIncome = Math.max(0, Number(monthlyIncome) || 0);
  const safeInstallments = Math.max(0, Number(financialInstallments) || 0);
  const safeFlow = Number(availableFlow) || 0;

  // 1. Endeudamiento Patrimonial: (Pasivos / Activos) * 100
  const indebtednessRatio = safeAssets > 0 ? (safeLiabilities / safeAssets) * 100 : 0;

  // 2. Carga Financiera Mensual: (Cuotas Existentes / Ingresos Mensuales) * 100
  const financialBurdenRatio = safeIncome > 0 ? (safeInstallments / safeIncome) * 100 : 0;

  // 3. Cobertura de Deuda: Flujo Disponible / Cuotas Existentes
  const debtCoverageRatio = safeInstallments > 0 ? safeFlow / safeInstallments : safeFlow > 0 ? 0 : 0;

  return {
    indebtednessRatio: Number(indebtednessRatio.toFixed(2)),
    financialBurdenRatio: Number(financialBurdenRatio.toFixed(2)),
    debtCoverageRatio: Number(debtCoverageRatio.toFixed(2))
  };
}

/**
 * Categorías de inventario sugeridas según giro del negocio
 */
export function getSuggestedInventoryCategories(sector?: string, activityType?: string): string[] {
  const act = (activityType || '').toLowerCase();
  if (act.includes('restaur') || act.includes('comida') || act.includes('panad') || act.includes('jug') || act.includes('caf')) {
    return [
      'Insumos y suministros',
      'Materias primas',
      'Productos terminados',
      'Mercadería para la venta',
      'Otros inventarios'
    ];
  }
  if (sector === 'Producción / Manufactura') {
    return [
      'Materias primas',
      'Productos en proceso',
      'Productos terminados',
      'Insumos y suministros',
      'Mercadería para la venta',
      'Otros inventarios'
    ];
  }
  if (sector === 'Servicios') {
    return [
      'Insumos y suministros',
      'Mercadería para la venta',
      'Otros inventarios'
    ];
  }
  return [
    'Mercadería para la venta',
    'Insumos y suministros',
    'Productos terminados',
    'Materias primas',
    'Productos en proceso',
    'Otros inventarios'
  ];
}

/**
 * Calcula el valor total del inventario del negocio (Cantidad * Costo Unitario de Adquisición)
 */
export function calculateInventoryTotalValue(inventory: InventoryItem[]): number {
  if (!Array.isArray(inventory) || inventory.length === 0) return 0;
  return inventory.reduce((sum, item) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const cost = Math.max(0, Number(item.unitCost) || 0);
    return sum + qty * cost;
  }, 0);
}

/**
 * Hidrata los ítems de inventario con códigos, categorías y unidades si provienen de versión anterior
 */
export function hydrateInventoryItems(dossier: CreditEvaluationDossier): InventoryItem[] {
  const suggested = getSuggestedInventoryCategories(dossier.business.sector, dossier.business.activityType);
  const defaultCategory = suggested[0] || 'Mercadería para la venta';
  return (dossier.inventory || []).map((item, idx) => {
    const qty = Math.max(0, Number(item.quantity) || 0);
    const unitCost = Math.max(0, Number(item.unitCost) || 0);
    return {
      ...item,
      code: item.code || `INV-${String(idx + 1).padStart(3, '0')}`,
      category: item.category || defaultCategory,
      description: item.description ?? item.observations ?? '',
      unit: item.unit || 'Unidad',
      quantity: qty,
      unitCost,
      totalCostValue: Number((qty * unitCost).toFixed(2)),
      status: item.status || 'Verificado por el analista',
      attachments: item.attachments || []
    };
  });
}

/**
 * Hidrata los metadatos del módulo independiente de inventario
 */
export function hydrateInventoryMeta(dossier: CreditEvaluationDossier): InventoryMetadata {
  if (dossier.inventoryMeta) {
    return dossier.inventoryMeta;
  }
  return {
    inventoryDate: dossier.visitVerification?.visitDate || dossier.updatedAt || new Date().toISOString().split('T')[0],
    responsibleName: dossier.visitVerification?.verifiedBy || dossier.assignedAnalystName || 'Analista asignado',
    location: dossier.business.businessAddress || 'Local principal del negocio',
    generalObservations: dossier.visitVerification?.informationVerified || 'Inventario físico contrastado durante visita de campo.',
    verificationStatus: 'Verificado por el analista',
    declaredTotalValue: undefined,
    customCategories: getSuggestedInventoryCategories(dossier.business.sector, dossier.business.activityType),
    observationsLog: []
  };
}

/**
 * Hidrata el detalle jerárquico del Balance General a partir de un expediente existente
 */
export function hydrateBalanceSheetDetail(dossier: CreditEvaluationDossier): BalanceSheetDetail {
  const inventoryTotal = calculateInventoryTotalValue(dossier.inventory || []);
  const bs = dossier.balanceSheet;
  const fallbackDate = dossier.updatedAt || new Date().toISOString().split('T')[0];

  if (dossier.balanceSheetDetail) {
    // Asegura que la cuenta Inventarios refleje siempre el valor vivo del módulo de Inventario
    const hasLinkedInventory = dossier.balanceSheetDetail.currentAssets.some((a) => a.isInventoryLinked || a.category === 'Inventarios');
    const syncedAssets: CurrentAssetAccountItem[] = hasLinkedInventory
      ? dossier.balanceSheetDetail.currentAssets.map((a) =>
          a.isInventoryLinked || a.category === 'Inventarios'
            ? {
                ...a,
                amount: inventoryTotal,
                verificationStatus: dossier.inventoryMeta?.verificationStatus || a.verificationStatus
              }
            : a
        )
      : [
          ...dossier.balanceSheetDetail.currentAssets,
          {
            id: 'ca-inventarios',
            category: 'Inventarios',
            name: 'Inventarios de mercadería e insumos',
            description: 'Valorización automática vinculada al módulo de Inventario',
            amount: inventoryTotal,
            recordedDate: fallbackDate,
            supportDocument: 'Registro valorizado de inventario',
            verificationStatus: dossier.inventoryMeta?.verificationStatus || 'Verificado por el analista',
            isInventoryLinked: true
          }
        ];

    return {
      ...dossier.balanceSheetDetail,
      currentAssets: syncedAssets
    };
  }

  const currentAssets: CurrentAssetAccountItem[] = [
    {
      id: 'ca-caja',
      category: 'Caja',
      name: 'Caja (Efectivo disponible)',
      description: 'Dinero en efectivo en caja del negocio',
      amount: Math.max(0, bs.cash || 0),
      recordedDate: fallbackDate,
      supportDocument: 'Arqueo de caja en visita',
      verificationStatus: 'Verificado por el analista',
      observations: 'Efectivo operativo diario'
    },
    {
      id: 'ca-bancos',
      category: 'Bancos',
      name: 'Bancos (Cuentas bancarias)',
      description: 'Saldos disponibles en cuentas de ahorro/corriente del negocio',
      amount: Math.max(0, bs.bankDeposits || 0),
      recordedDate: fallbackDate,
      supportDocument: 'Estado de cuenta / App bancaria',
      verificationStatus: 'Verificado por el analista'
    },
    {
      id: 'ca-cxc',
      category: 'Cuentas por cobrar',
      name: 'Cuentas por cobrar comerciales',
      description: 'Créditos otorgados a clientes pendientes de cobro',
      amount: Math.max(0, bs.accountsReceivableValue || 0),
      recordedDate: fallbackDate,
      supportDocument: 'Cuaderno de cuentas por cobrar',
      verificationStatus: 'Declarado por el solicitante'
    },
    {
      id: 'ca-inventarios',
      category: 'Inventarios',
      name: 'Inventarios',
      description: 'Mercadería, insumos y productos disponibles (conectado al módulo Inventario)',
      amount: inventoryTotal > 0 ? inventoryTotal : Math.max(0, bs.inventoryValue || 0),
      recordedDate: fallbackDate,
      supportDocument: 'Módulo de Inventario Valorizado',
      verificationStatus: dossier.inventoryMeta?.verificationStatus || 'Verificado por el analista',
      isInventoryLinked: true,
      observations: 'Importe sincronizado automáticamente desde el inventario del negocio'
    },
    {
      id: 'ca-anticipos',
      category: 'Anticipos a proveedores',
      name: 'Anticipos a proveedores',
      description: 'Adelantos entregados a proveedores por compras en tránsito',
      amount: 0,
      recordedDate: fallbackDate,
      supportDocument: 'Comprobantes de adelanto',
      verificationStatus: 'Pendiente de verificación'
    },
    {
      id: 'ca-otros',
      category: 'Otros activos corrientes',
      name: 'Otros activos corrientes',
      description: 'Otros activos realizables en el corto plazo',
      amount: Math.max(0, bs.otherCurrentAssets || 0),
      recordedDate: fallbackDate,
      supportDocument: 'Sustento documental',
      verificationStatus: 'Declarado por el solicitante'
    }
  ];

  const nonCurrentAssets: FixedAssetItem[] = [];
  if (bs.landValue > 0) {
    nonCurrentAssets.push({
      id: 'nca-terrenos',
      category: 'Terrenos',
      name: 'Terrenos del negocio',
      description: 'Terreno registrado en evaluación patrimonial',
      acquisitionDate: fallbackDate,
      estimatedValue: bs.landValue,
      location: dossier.business.businessAddress,
      supportDocument: 'Título / Constancia de posesión',
      verificationStatus: 'Verificado por el analista'
    });
  }
  if (bs.housingValue > 0 || bs.commercialPremisesValue > 0) {
    nonCurrentAssets.push({
      id: 'nca-edificaciones',
      category: 'Edificaciones',
      name: 'Edificaciones y local comercial',
      description: 'Inmueble / Local donde opera el negocio',
      acquisitionDate: fallbackDate,
      estimatedValue: (bs.housingValue || 0) + (bs.commercialPremisesValue || 0),
      location: dossier.business.businessAddress,
      supportDocument: 'Partida registral / Autoavalúo',
      verificationStatus: 'Verificado por el analista'
    });
  }
  if (bs.machineryValue > 0) {
    nonCurrentAssets.push({
      id: 'nca-maquinaria',
      category: 'Maquinaria y equipos',
      name: 'Maquinaria y equipos operativos',
      description: 'Equipos productivos o refrigeración comercial',
      acquisitionDate: fallbackDate,
      estimatedValue: bs.machineryValue,
      location: dossier.business.businessAddress,
      supportDocument: 'Verificación física en visita',
      verificationStatus: 'Verificado por el analista'
    });
  }
  if (bs.vehiclesValue > 0) {
    nonCurrentAssets.push({
      id: 'nca-vehiculos',
      category: 'Vehículos',
      name: 'Vehículos de trabajo',
      description: 'Unidad de reparto / transporte comercial',
      acquisitionDate: fallbackDate,
      estimatedValue: bs.vehiclesValue,
      location: dossier.business.businessAddress,
      supportDocument: 'Tarjeta de propiedad',
      verificationStatus: 'Verificado por el analista'
    });
  }
  if (bs.equipmentValue > 0) {
    nonCurrentAssets.push({
      id: 'nca-equipos',
      category: 'Equipos informáticos',
      name: 'Equipos informáticos y punto de venta',
      description: 'Computadora, POS, impresora o balanza electrónica',
      acquisitionDate: fallbackDate,
      estimatedValue: bs.equipmentValue,
      location: dossier.business.businessAddress,
      supportDocument: 'Verificación física',
      verificationStatus: 'Verificado por el analista'
    });
  }
  if (bs.otherNonCurrentAssets > 0) {
    nonCurrentAssets.push({
      id: 'nca-otros',
      category: 'Otros activos fijos',
      name: 'Otros activos fijos',
      description: 'Bienes muebles y enseres complementarios',
      acquisitionDate: fallbackDate,
      estimatedValue: bs.otherNonCurrentAssets,
      location: dossier.business.businessAddress,
      supportDocument: 'Declaración patrimonial',
      verificationStatus: 'Declarado por el solicitante'
    });
  }

  // Asegurar al menos una estructura base si todo estaba en 0
  const totalAssetsCalc = currentAssets.reduce((s, a) => s + a.amount, 0) + nonCurrentAssets.reduce((s, a) => s + a.estimatedValue, 0);
  const totalLiabCalc = bs.totalLiabilities || 0;
  const computedEquity = totalAssetsCalc - totalLiabCalc;
  const periodResult = Math.max(0, dossier.incomeStatement?.availableResult || 0);
  const contributedCapital = Math.max(0, computedEquity - periodResult);

  const equityBreakdown: EquityBreakdown = {
    contributedCapital,
    retainedEarnings: 0,
    periodResult,
    otherEquityAccounts: []
  };

  return {
    balanceDate: fallbackDate,
    evaluationPeriod: fallbackDate.slice(0, 7),
    currency: 'S/',
    isDraft: false,
    lastSavedAt: dossier.updatedAt,
    currentAssets,
    nonCurrentAssets,
    equityBreakdown,
    observations: []
  };
}

/**
 * Hidrata obligaciones con clasificación de Pasivo Corriente / No Corriente
 * (incluyendo cuentas por pagar a proveedores si no están aún como obligación)
 */
export function hydrateBalanceObligations(dossier: CreditEvaluationDossier): FinancialObligation[] {
  const existing = (dossier.obligations || []).map((ob) => {
    if (ob.termType && ob.subCategory) return ob;
    const isShort = (ob.pendingInstallments || 0) <= 12;
    return {
      ...ob,
      termType: ob.termType || (isShort ? 'corriente' : 'no_corriente'),
      subCategory: ob.subCategory || (isShort ? 'Préstamos de corto plazo' : 'Préstamos de largo plazo')
    };
  });

  // Si existen proveedores pendientes en balanceSheet.suppliersPayable pero no hay obligación registrada de proveedores, agregarla de forma limpia
  const hasSupplierOb = existing.some((o) => o.subCategory === 'Deudas con proveedores');
  if (!hasSupplierOb && (dossier.balanceSheet?.suppliersPayable || 0) > 0) {
    const supplierName = dossier.accountsPayable?.[0]?.supplierName || 'Proveedores comerciales';
    existing.push({
      id: `obl-prov-${dossier.id}`,
      entityName: supplierName,
      creditType: 'Crédito comercial proveedores',
      termType: 'corriente',
      subCategory: 'Deudas con proveedores',
      originalAmount: dossier.balanceSheet.suppliersPayable,
      currentBalance: dossier.balanceSheet.suppliersPayable,
      monthlyInstallment: 0,
      totalInstallments: 1,
      paidInstallments: 0,
      pendingInstallments: 1,
      dueDate: dossier.accountsPayable?.[0]?.dueDate || dossier.updatedAt,
      status: 'Pendiente',
      observations: dossier.accountsPayable?.[0]?.concept || 'Saldo pendiente con proveedores'
    });
  }

  return existing;
}

export interface HierarchicalBalanceSummary {
  totalCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  totalCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  computedEquity: number; // Activo - Pasivo
  declaredEquity: number; // Suma de cuentas de patrimonio
  totalLiabilitiesAndEquity: number; // Total Pasivo + Total Patrimonio (cuentas)
  difference: number; // Total Activo - (Total Pasivo + Total Patrimonio)
  hasDiscrepancy: boolean;
}

/**
 * Calcula todos los totales del Balance General jerárquico sin forzar ni inventar cifras.
 */
export function computeHierarchicalBalanceSummary(
  currentAssets: CurrentAssetAccountItem[],
  nonCurrentAssets: FixedAssetItem[],
  obligations: FinancialObligation[],
  equityBreakdown: EquityBreakdown
): HierarchicalBalanceSummary {
  const totalCurrentAssets = currentAssets.reduce((sum, item) => sum + Math.max(0, Number(item.amount) || 0), 0);
  const totalNonCurrentAssets = nonCurrentAssets.reduce((sum, item) => sum + Math.max(0, Number(item.estimatedValue) || 0), 0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const activeObligations = obligations.filter((o) => o.status !== 'Cancelado');
  const totalCurrentLiabilities = activeObligations
    .filter((o) => (o.termType || ((o.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente')) === 'corriente')
    .reduce((sum, o) => sum + Math.max(0, Number(o.currentBalance) || 0), 0);

  const totalNonCurrentLiabilities = activeObligations
    .filter((o) => (o.termType || ((o.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente')) === 'no_corriente')
    .reduce((sum, o) => sum + Math.max(0, Number(o.currentBalance) || 0), 0);

  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  const computedEquity = totalAssets - totalLiabilities;

  const otherEqSum = (equityBreakdown.otherEquityAccounts || []).reduce(
    (sum, acc) => sum + (Number(acc.amount) || 0),
    0
  );
  const declaredEquity =
    (Number(equityBreakdown.contributedCapital) || 0) +
    (Number(equityBreakdown.retainedEarnings) || 0) +
    (Number(equityBreakdown.periodResult) || 0) +
    otherEqSum;

  const totalLiabilitiesAndEquity = totalLiabilities + declaredEquity;
  const difference = Number((totalAssets - totalLiabilitiesAndEquity).toFixed(2));
  const hasDiscrepancy = Math.abs(difference) > 0.01;

  return {
    totalCurrentAssets,
    totalNonCurrentAssets,
    totalAssets,
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
    totalLiabilities,
    computedEquity,
    declaredEquity,
    totalLiabilitiesAndEquity,
    difference,
    hasDiscrepancy
  };
}

/**
 * Convierte el detalle jerárquico al objeto plano BalanceSheetData para mantener compatibilidad total en reportes y resúmenes
 */
export function flattenDetailToBalanceSheetData(
  currentAssets: CurrentAssetAccountItem[],
  nonCurrentAssets: FixedAssetItem[],
  obligations: FinancialObligation[]
): BalanceSheetData {
  const sumCA = (cat: CurrentAssetAccountItem['category']) =>
    currentAssets.filter((a) => a.category === cat).reduce((s, a) => s + Math.max(0, Number(a.amount) || 0), 0);
  const sumNCA = (cat: FixedAssetItem['category']) =>
    nonCurrentAssets.filter((a) => a.category === cat).reduce((s, a) => s + Math.max(0, Number(a.estimatedValue) || 0), 0);

  const cash = sumCA('Caja');
  const bankDeposits = sumCA('Bancos');
  const inventoryValue = sumCA('Inventarios');
  const accountsReceivableValue = sumCA('Cuentas por cobrar');
  const otherCurrentAssets = sumCA('Anticipos a proveedores') + sumCA('Otros activos corrientes');
  const totalCurrentAssets = cash + bankDeposits + inventoryValue + accountsReceivableValue + otherCurrentAssets;

  const landValue = sumNCA('Terrenos');
  const commercialPremisesValue = sumNCA('Edificaciones');
  const housingValue = 0;
  const machineryValue = sumNCA('Maquinaria y equipos');
  const vehiclesValue = sumNCA('Vehículos');
  const equipmentValue = sumNCA('Equipos informáticos');
  const otherNonCurrentAssets = sumNCA('Muebles y enseres') + sumNCA('Otros activos fijos');
  const totalNonCurrentAssets =
    landValue + commercialPremisesValue + housingValue + machineryValue + vehiclesValue + equipmentValue + otherNonCurrentAssets;

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const activeObs = obligations.filter((o) => o.status !== 'Cancelado');
  const shortTermCredits = activeObs
    .filter((o) => o.termType === 'corriente' && o.subCategory === 'Préstamos de corto plazo')
    .reduce((s, o) => s + Math.max(0, Number(o.currentBalance) || 0), 0);
  const suppliersPayable = activeObs
    .filter((o) => o.termType === 'corriente' && o.subCategory === 'Deudas con proveedores')
    .reduce((s, o) => s + Math.max(0, Number(o.currentBalance) || 0), 0);
  const otherCurrentLiabilities = activeObs
    .filter(
      (o) =>
        (o.termType || ((o.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente')) === 'corriente' &&
        o.subCategory !== 'Préstamos de corto plazo' &&
        o.subCategory !== 'Deudas con proveedores'
    )
    .reduce((s, o) => s + Math.max(0, Number(o.currentBalance) || 0), 0);
  const totalCurrentLiabilities = shortTermCredits + suppliersPayable + otherCurrentLiabilities;

  const longTermCredits = activeObs
    .filter(
      (o) =>
        (o.termType || ((o.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente')) === 'no_corriente' &&
        o.subCategory === 'Préstamos de largo plazo'
    )
    .reduce((s, o) => s + Math.max(0, Number(o.currentBalance) || 0), 0);
  const otherNonCurrentLiabilities = activeObs
    .filter(
      (o) =>
        (o.termType || ((o.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente')) === 'no_corriente' &&
        o.subCategory !== 'Préstamos de largo plazo'
    )
    .reduce((s, o) => s + Math.max(0, Number(o.currentBalance) || 0), 0);
  const totalNonCurrentLiabilities = longTermCredits + otherNonCurrentLiabilities;

  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;
  const equity = totalAssets - totalLiabilities;

  return {
    cash,
    bankDeposits,
    inventoryValue,
    accountsReceivableValue,
    otherCurrentAssets,
    totalCurrentAssets,
    landValue,
    housingValue,
    commercialPremisesValue,
    vehiclesValue,
    machineryValue,
    equipmentValue,
    otherNonCurrentAssets,
    totalNonCurrentAssets,
    totalAssets,
    shortTermCredits,
    suppliersPayable,
    otherCurrentLiabilities,
    totalCurrentLiabilities,
    longTermCredits,
    otherNonCurrentLiabilities,
    totalNonCurrentLiabilities,
    totalLiabilities,
    equity
  };
}

