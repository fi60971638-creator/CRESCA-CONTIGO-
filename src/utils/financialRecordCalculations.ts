import {
  BalanceSheetRecord,
  IncomeStatementRecord,
  CashFlowRecord,
  ObligationRecord,
  FinancialItem,
  SupportDocumentRecord,
  ClientType
} from '../types/financialRecord';

export const FINANCIAL_FORMULAS_EXPLANATION = {
  balanceSheet: {
    title: 'Balance General (Estado de Situación Financiera)',
    formula: 'Activo Total = Pasivo Total + Patrimonio',
    activos: 'Activo Total = Activo Corriente + Activo No Corriente',
    pasivos: 'Pasivo Total = Pasivo Corriente + Pasivo No Corriente',
    patrimonio: 'Patrimonio = Activo Total – Pasivo Total',
    description: 'Refleja la situación patrimonial del cliente en la fecha de corte. Compara bienes y derechos contra deudas exigibles.'
  },
  incomeStatement: {
    title: 'Estado de Ganancias y Pérdidas (P&L)',
    grossProfit: 'Utilidad Bruta = Ventas Netas – Costo de Ventas',
    operatingResult: 'Resultado Operativo = Utilidad Bruta – Gastos Operativos',
    netProfit: 'Utilidad Neta = Resultado Operativo + Otros Ingresos – Gastos Financieros – Impuestos',
    description: 'Determina si la actividad económica genera excedente neto suficiente para afrontar compromisos y reinversión.'
  },
  cashFlow: {
    title: 'Flujo de Caja',
    formula: 'Saldo Final = Saldo Inicial + Total Entradas de Efectivo – Total Salidas de Efectivo',
    netFlow: 'Flujo Neto del Período = Entradas Efectivas – Salidas Efectivas',
    description: 'Control de liquidez monetaria real. Detecta desfases temporales de cobranza o pagos.'
  },
  paymentCapacity: {
    title: 'Capacidad de Pago y Excedente',
    natural: 'Flujo Disponible = Total Ingresos Familiares – Total Gastos Familiares – Cuotas de Deudas Actuales',
    negocio: 'Flujo Disponible = Resultado Operativo – Retiros Familiares del Titular – Cuotas Financieras Actuales',
    surplus: 'Excedente Libre Post-Cuota = Flujo Disponible – Cuota Mensual Evaluada',
    description: 'Mide la holgura en soles (S/) que tiene el solicitante para asumir un nuevo compromiso crediticio sin sobreendeudarse.'
  },
  ratios: {
    liquidity: 'Liquidez Corriente = Activo Corriente / Pasivo Corriente (Objetivo: ≥ 1.20x)',
    indebtedness: 'Endeudamiento Patrimonial = (Total Pasivo / Total Activo) × 100 (Objetivo: ≤ 60%)',
    debtCoverage: 'RCI (Ratio Cobertura de Deuda) = Flujo Disponible / Total Cuotas (Objetivo: ≥ 1.30x)',
    financialBurden: 'Carga Financiera Mensual = (Total Cuotas / Total Ingresos) × 100 (Objetivo: ≤ 35%)'
  }
};

export function calculateBalanceSheetTotals(bs: BalanceSheetRecord) {
  const cashAndBanks = Number(bs.cashAndBanks) || 0;
  const accountsReceivable = Number(bs.accountsReceivable) || 0;
  const inventory = Number(bs.inventory) || 0;
  const otherCurrentAssets = Number(bs.otherCurrentAssets) || 0;
  const totalCurrentAssets = cashAndBanks + accountsReceivable + inventory + otherCurrentAssets;

  const propertyAndBuildings = Number(bs.propertyAndBuildings) || 0;
  const machineryAndEquipment = Number(bs.machineryAndEquipment) || 0;
  const vehicles = Number(bs.vehicles) || 0;
  const furnitureAndFixtures = Number(bs.furnitureAndFixtures) || 0;
  const otherNonCurrentAssets = Number(bs.otherNonCurrentAssets) || 0;
  const accumulatedDepreciation = Number(bs.accumulatedDepreciation) || 0;
  const totalNonCurrentAssets = Math.max(
    0,
    propertyAndBuildings + machineryAndEquipment + vehicles + furnitureAndFixtures + otherNonCurrentAssets - accumulatedDepreciation
  );

  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const suppliersPayable = Number(bs.suppliersPayable) || 0;
  const shortTermBankDebt = Number(bs.shortTermBankDebt) || 0;
  const taxesPayable = Number(bs.taxesPayable) || 0;
  const otherCurrentLiabilities = Number(bs.otherCurrentLiabilities) || 0;
  const totalCurrentLiabilities = suppliersPayable + shortTermBankDebt + taxesPayable + otherCurrentLiabilities;

  const longTermBankDebt = Number(bs.longTermBankDebt) || 0;
  const mortgages = Number(bs.mortgages) || 0;
  const otherNonCurrentLiabilities = Number(bs.otherNonCurrentLiabilities) || 0;
  const totalNonCurrentLiabilities = longTermBankDebt + mortgages + otherNonCurrentLiabilities;

  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const calculatedEquity = totalAssets - totalLiabilities;
  const declaredCapital = Number(bs.capital) || 0;
  const declaredRetainedEarnings = Number(bs.retainedEarnings) || 0;
  const totalDeclaredEquity = declaredCapital + declaredRetainedEarnings;

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + calculatedEquity)) < 0.05;

  return {
    totalCurrentAssets,
    totalNonCurrentAssets,
    totalAssets,
    totalCurrentLiabilities,
    totalNonCurrentLiabilities,
    totalLiabilities,
    calculatedEquity,
    totalDeclaredEquity,
    isBalanced
  };
}

export function calculateIncomeStatementTotals(is: IncomeStatementRecord) {
  const salesOrIncome = Math.max(0, Number(is.salesOrIncome) || 0);
  const salesReturns = Math.max(0, Number(is.salesReturns) || 0);
  const netSales = Math.max(0, salesOrIncome - salesReturns);

  const cogsMerchandise = Math.max(0, Number(is.cogsMerchandise) || 0);
  const cogsLabor = Math.max(0, Number(is.cogsLabor) || 0);
  const cogsFreightAndOther = Math.max(0, Number(is.cogsFreightAndOther) || 0);
  const totalCostOfSales = cogsMerchandise + cogsLabor + cogsFreightAndOther;

  const grossProfit = netSales - totalCostOfSales;
  const grossMarginPct = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

  const operatingRent = Math.max(0, Number(is.operatingRent) || 0);
  const operatingPayroll = Math.max(0, Number(is.operatingPayroll) || 0);
  const operatingServices = Math.max(0, Number(is.operatingServices) || 0);
  const operatingTransport = Math.max(0, Number(is.operatingTransport) || 0);
  const operatingMaintenance = Math.max(0, Number(is.operatingMaintenance) || 0);
  const operatingSalesAndMarketing = Math.max(0, Number(is.operatingSalesAndMarketing) || 0);
  const operatingTaxesAndLicenses = Math.max(0, Number(is.operatingTaxesAndLicenses) || 0);
  const otherOperatingExpenses = Math.max(0, Number(is.otherOperatingExpenses) || 0);

  const totalOperatingExpenses =
    operatingRent +
    operatingPayroll +
    operatingServices +
    operatingTransport +
    operatingMaintenance +
    operatingSalesAndMarketing +
    operatingTaxesAndLicenses +
    otherOperatingExpenses;

  const operatingResult = grossProfit - totalOperatingExpenses;
  const operatingMarginPct = netSales > 0 ? (operatingResult / netSales) * 100 : 0;

  const otherNonOpIncome = Math.max(0, Number(is.otherNonOpIncome) || 0);
  const financialExpenses = Math.max(0, Number(is.financialExpenses) || 0);
  const taxesIR = Math.max(0, Number(is.taxesIR) || 0);

  const netProfit = operatingResult + otherNonOpIncome - financialExpenses - taxesIR;
  const netMarginPct = netSales > 0 ? (netProfit / netSales) * 100 : 0;

  return {
    netSales,
    totalCostOfSales,
    grossProfit,
    grossMarginPct,
    totalOperatingExpenses,
    operatingResult,
    operatingMarginPct,
    netProfit,
    netMarginPct
  };
}

export function calculateCashFlowTotals(cf: CashFlowRecord) {
  const initialBalance = Number(cf.initialBalance) || 0;

  const cashSales = Math.max(0, Number(cf.cashSales) || 0);
  const creditCollections = Math.max(0, Number(cf.creditCollections) || 0);
  const salaryOrIndependentIncome = Math.max(0, Number(cf.salaryOrIndependentIncome) || 0);
  const otherInflows = Math.max(0, Number(cf.otherInflows) || 0);
  const totalInflows = cashSales + creditCollections + salaryOrIndependentIncome + otherInflows;

  const supplierPayments = Math.max(0, Number(cf.supplierPayments) || 0);
  const operatingExpensesPayments = Math.max(0, Number(cf.operatingExpensesPayments) || 0);
  const payrollPayments = Math.max(0, Number(cf.payrollPayments) || 0);
  const debtInstallmentsPayments = Math.max(0, Number(cf.debtInstallmentsPayments) || 0);
  const familyExpensesOrPersonalDraws = Math.max(0, Number(cf.familyExpensesOrPersonalDraws) || 0);
  const taxPayments = Math.max(0, Number(cf.taxPayments) || 0);
  const otherOutflows = Math.max(0, Number(cf.otherOutflows) || 0);

  const totalOutflows =
    supplierPayments +
    operatingExpensesPayments +
    payrollPayments +
    debtInstallmentsPayments +
    familyExpensesOrPersonalDraws +
    taxPayments +
    otherOutflows;

  const netCashFlow = totalInflows - totalOutflows;
  const finalCashBalance = initialBalance + netCashFlow;

  return {
    initialBalance,
    totalInflows,
    totalOutflows,
    netCashFlow,
    finalCashBalance
  };
}

export function calculateObligationsTotals(obligations: ObligationRecord[]) {
  const activeObligations = obligations.filter((o) => o.status !== 'cancelado');
  const totalBalance = activeObligations.reduce((acc, o) => acc + (Number(o.currentBalance) || 0), 0);
  const totalMonthlyInstallment = activeObligations.reduce((acc, o) => acc + (Number(o.monthlyInstallment) || 0), 0);
  const totalOriginalAmount = activeObligations.reduce((acc, o) => acc + (Number(o.originalAmount) || 0), 0);
  const verifiedCount = activeObligations.filter((o) => o.isVerifiedWithSBS).length;

  return {
    totalBalance,
    totalMonthlyInstallment,
    totalOriginalAmount,
    activeCount: activeObligations.length,
    verifiedCount
  };
}

export function calculatePaymentCapacity(
  clientType: ClientType,
  incomeExpenseItems: FinancialItem[],
  isTotals: ReturnType<typeof calculateIncomeStatementTotals>,
  obligationsTotalMonthly: number,
  familyDrawsFromCashflow: number,
  proposedInstallment: number
) {
  let netMonthlyBase = 0;
  let deductions = 0;

  if (clientType === 'natural') {
    const personalIncome = incomeExpenseItems
      .filter((i) => i.category === 'ingreso_personal')
      .reduce((acc, curr) => acc + (Number(curr.declaredAmount) || 0), 0);

    const personalExpenses = incomeExpenseItems
      .filter((i) => i.category === 'gasto_personal')
      .reduce((acc, curr) => acc + (Number(curr.declaredAmount) || 0), 0);

    netMonthlyBase = personalIncome;
    deductions = personalExpenses;
  } else {
    // Negocio o Empresa
    netMonthlyBase = Math.max(0, isTotals.operatingResult);
    deductions = familyDrawsFromCashflow;
  }

  const availableCashFlow = netMonthlyBase - deductions - obligationsTotalMonthly;
  const safeProposed = Math.max(0, Number(proposedInstallment) || 0);
  const surplusAfterProposed = availableCashFlow - safeProposed;

  return {
    netMonthlyBase,
    deductions,
    obligationsMonthly: obligationsTotalMonthly,
    availableCashFlow,
    proposedInstallment: safeProposed,
    surplusAfterProposed,
    isSurplusPositive: surplusAfterProposed >= 0
  };
}

export function calculateFinancialRatios(
  bsTotals: ReturnType<typeof calculateBalanceSheetTotals>,
  isTotals: ReturnType<typeof calculateIncomeStatementTotals>,
  paymentCapacity: ReturnType<typeof calculatePaymentCapacity>,
  obligationsMonthly: number
) {
  const currentRatio =
    bsTotals.totalCurrentLiabilities > 0
      ? bsTotals.totalCurrentAssets / bsTotals.totalCurrentLiabilities
      : bsTotals.totalCurrentAssets > 0
      ? 9.99
      : 0;

  const indebtednessRatio =
    bsTotals.totalAssets > 0 ? (bsTotals.totalLiabilities / bsTotals.totalAssets) * 100 : 0;

  const debtToEquityRatio =
    bsTotals.calculatedEquity > 0 ? (bsTotals.totalLiabilities / bsTotals.calculatedEquity) * 100 : 0;

  const totalMonthlyCommitment = obligationsMonthly + paymentCapacity.proposedInstallment;
  const debtCoverageRCI =
    totalMonthlyCommitment > 0 ? paymentCapacity.availableCashFlow / totalMonthlyCommitment : 0;

  const financialBurdenPct =
    paymentCapacity.netMonthlyBase > 0
      ? (totalMonthlyCommitment / paymentCapacity.netMonthlyBase) * 100
      : 0;

  return {
    currentRatio: Number(currentRatio.toFixed(2)),
    indebtednessRatio: Number(indebtednessRatio.toFixed(1)),
    debtToEquityRatio: Number(debtToEquityRatio.toFixed(1)),
    debtCoverageRCI: Number(debtCoverageRCI.toFixed(2)),
    financialBurdenPct: Number(financialBurdenPct.toFixed(1)),
    grossMarginPct: Number(isTotals.grossMarginPct.toFixed(1)),
    operatingMarginPct: Number(isTotals.operatingMarginPct.toFixed(1)),
    netMarginPct: Number(isTotals.netMarginPct.toFixed(1))
  };
}

export function calculateVerificationMetrics(
  items: FinancialItem[],
  documents: SupportDocumentRecord[]
) {
  const totalDeclaredFromItems = items.reduce((acc, i) => acc + (Number(i.declaredAmount) || 0), 0);
  const totalVerifiedFromItems = items
    .filter((i) => i.isVerified)
    .reduce((acc, i) => acc + (Number(i.verifiedAmount) || Number(i.declaredAmount) || 0), 0);

  const pendingDocsCount = documents.filter((d) => d.status === 'pendiente').length;
  const receivedDocsCount = documents.filter((d) => d.status === 'recibido').length;
  const reviewedDocsCount = documents.filter((d) => d.status === 'revisado').length;

  const unverifiedItems = items.filter((i) => Number(i.declaredAmount) > 0 && !i.isVerified);

  const verificationPercentage =
    totalDeclaredFromItems > 0
      ? Math.min(100, (totalVerifiedFromItems / totalDeclaredFromItems) * 100)
      : documents.length > 0
      ? (reviewedDocsCount / documents.length) * 100
      : 0;

  return {
    totalDeclared: totalDeclaredFromItems,
    totalVerified: totalVerifiedFromItems,
    unverifiedItems,
    pendingDocsCount,
    receivedDocsCount,
    reviewedDocsCount,
    verificationPercentage: Number(verificationPercentage.toFixed(1)),
    hasUnverifiedAlert: unverifiedItems.length > 0 || pendingDocsCount > 0
  };
}
