import {
  IncomeData,
  CostOfSalesData,
  BusinessExpensesData,
  FamilyExpensesData,
  IncomeStatementData,
  BalanceSheetData,
  FinancialObligation,
  CashFlowData,
  PaymentCapacityData,
  FinancialRatiosData
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
