export type UserRole = 'admin' | 'analyst' | 'advisor' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  roleTitle: string;
  agency: string;
  phone: string;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type DocumentType = 'DNI' | 'CE' | 'RUC' | 'PASAPORTE';
export type MaritalStatus = 'Soltero(a)' | 'Casado(a)' | 'Conviviente' | 'Divorciado(a)' | 'Viudo(a)';
export type FormalityType = 'Formal (RUC 10 / 20)' | 'Informal / En proceso' | 'RUS (Régimen Único Simplificado)' | 'Régimen Especial' | 'Régimen Mype Tributario';
export type BusinessSector = 'Comercio' | 'Producción / Manufactura' | 'Servicios' | 'Agropecuario' | 'Transporte' | 'Construcción' | 'Otro';
export type CreditDestination =
  | 'Capital de trabajo'
  | 'Compra de mercadería'
  | 'Compra de activos'
  | 'Ampliación del negocio'
  | 'Consolidación de deudas'
  | 'Consumo'
  | 'Otro';

export type PaymentFrequency = 'Mensual' | 'Quincenal' | 'Semanal' | 'Al vencimiento';

export interface ApplicantPersonalData {
  firstNames: string;
  paternalSurname: string;
  maternalSurname: string;
  fullName: string;
  documentType: DocumentType;
  documentNumber: string;
  birthDate: string;
  age: number;
  maritalStatus: MaritalStatus;
  dependentsCount: number;
  homeAddress: string;
  district: string;
  province: string;
  department: string;
  phone: string;
  email: string;
}

export interface BusinessActivityData {
  businessName: string;
  activityType: string;
  sector: BusinessSector;
  businessAddress: string;
  operatingTimeYears: number;
  operatingTimeMonths: number;
  businessType: 'Propio' | 'Alquilado' | 'Familiar' | 'Puesto de Mercado' | 'Ambulatorio' | 'Otro';
  employeesCount: number;
  formality: FormalityType;
  activityDescription: string;
}

export interface CreditTermsData {
  creditProduct: string; // Microcrédito, Crédito Comercial, Crédito Pyme, Consumo
  requestedAmount: number;
  termMonths: number;
  paymentFrequency: PaymentFrequency;
  estimatedPaymentDate: string;
  destination: CreditDestination;
  destinationDescription: string;
  proposedInstallment: number;
}

// 8. Ingresos
export interface IncomeData {
  // Negocio
  monthlySales: number;
  otherBusinessIncome: number;
  totalBusinessIncome: number; // monthlySales + otherBusinessIncome

  // Personales
  salaryIncome: number;
  feesIncome: number; // Honorarios
  rentalIncome: number; // Alquileres
  otherPersonalIncome: number;
  totalPersonalIncome: number;

  totalMonthlyIncome: number; // totalBusinessIncome + totalPersonalIncome
}

// 9. Costo de ventas
export interface CostOfSalesData {
  merchandisePurchases: number;
  rawMaterials: number;
  freightCost: number;
  transportSalesCost: number;
  otherSalesCosts: number;
  totalCostOfSales: number; // Suma
  grossProfit: number; // monthlySales - totalCostOfSales
}

// 10. Gastos del negocio
export interface BusinessExpensesData {
  rent: number;
  utilities: number; // Luz, agua
  internetPhone: number;
  payroll: number; // Personal
  transportBusiness: number;
  maintenance: number;
  advertising: number;
  commissions: number;
  otherBusinessExpenses: number;
  totalBusinessExpenses: number;
  operatingResult: number; // grossProfit - totalBusinessExpenses
}

// 11. Gastos familiares
export interface FamilyExpensesData {
  food: number;
  housing: number;
  education: number;
  health: number;
  transport: number;
  utilitiesFamily: number;
  communication: number;
  otherFamilyExpenses: number;
  totalFamilyExpenses: number;
}

// 12. Estado de Resultados Calculado
export interface IncomeStatementData {
  salesIncome: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingResult: number;
  otherIncome: number;
  otherExpenses: number;
  resultBeforeFinancialObligations: number;
  financialInstallments: number;
  availableResult: number;
}

// 13. Balance General / Situación Patrimonial
export interface BalanceSheetData {
  // Activos Corrientes
  cash: number;
  bankDeposits: number;
  inventoryValue: number;
  accountsReceivableValue: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;

  // Activos No Corrientes
  landValue: number;
  housingValue: number;
  commercialPremisesValue: number;
  vehiclesValue: number;
  machineryValue: number;
  equipmentValue: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;

  totalAssets: number;

  // Pasivos Corrientes
  shortTermCredits: number;
  suppliersPayable: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;

  // Pasivos No Corrientes
  longTermCredits: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;

  totalLiabilities: number;

  equity: number; // totalAssets - totalLiabilities
}

// 14. Obligaciones Financieras
export type DebtStatus = 'Al día' | 'Pendiente' | 'Vencido' | 'Cancelado';

export interface FinancialObligation {
  id: string;
  entityName: string;
  creditType: string;
  originalAmount: number;
  currentBalance: number;
  monthlyInstallment: number;
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  dueDate: string;
  status: DebtStatus;
  observations?: string;
}

// 15. Flujo de Caja
export interface CashFlowData {
  // Ingresos
  salesFlow: number;
  salaryFlow: number;
  otherIncomeFlow: number;
  collectionsFlow: number;
  totalCashInflow: number;

  // Egresos
  purchasesFlow: number;
  businessExpensesFlow: number;
  familyExpensesFlow: number;
  creditInstallmentsFlow: number;
  otherOutflow: number;
  totalCashOutflow: number;

  netCashFlow: number; // totalCashInflow - totalCashOutflow
  isPositive: boolean;
}

// 16. Capacidad de Pago
export interface PaymentCapacityData {
  monthlyIncome: number;
  monthlyExpenses: number; // Familiares + Negocio
  currentFinancialObligations: number;
  availableFlow: number; // monthlyIncome - monthlyExpenses - currentFinancialObligations
  proposedInstallment: number;
  remainingSurplusAfterProposedInstallment: number; // availableFlow - proposedInstallment
}

// 17. Indicadores Financieros
export interface FinancialRatiosData {
  indebtednessRatio: number; // (Total Pasivos / Total Activos) * 100
  financialBurdenRatio: number; // (Cuotas Financieras / Ingresos Mensuales) * 100
  debtCoverageRatio: number; // Flujo Disponible / Cuotas Financieras
}

// 18. Inventario
export interface InventoryItem {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCostValue: number; // quantity * unitCost
  sellingPrice: number;
  observations?: string;
}

// 19. Cuentas por Cobrar
export type AccountReceivableStatus = 'Pendiente' | 'Cobrado' | 'Vencido';

export interface AccountReceivableItem {
  id: string;
  clientName: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: AccountReceivableStatus;
  observations?: string;
}

// 20. Cuentas por Pagar
export type AccountPayableStatus = 'Pendiente' | 'Pagado' | 'Vencido';

export interface AccountPayableItem {
  id: string;
  supplierName: string;
  concept: string;
  amount: number;
  dueDate: string;
  status: AccountPayableStatus;
  observations?: string;
}

// 21. Referencias y Verificaciones
export interface PersonalReference {
  id: string;
  referenceType: 'Comercial' | 'Proveedor' | 'Cliente' | 'Familiar' | 'Vecinal' | 'Laboral';
  name: string;
  phone: string;
  relationship: string;
  contactDate: string;
  verificationResult: 'Favorable' | 'Con observaciones' | 'No contesta' | 'Pendiente';
  observations?: string;
}

export interface VisitVerificationData {
  visitDate: string;
  addressVisited: string;
  personContacted: string;
  informationVerified: string;
  observations: string;
  verifiedBy: string;
}

// 22. Documentación
export type DocumentVerificationStatus = 'Pendiente' | 'Recibido' | 'Observado' | 'Verificado';

export interface DocumentControlItem {
  id: string;
  name: string;
  documentType: 'DNI' | 'Sustento de ingresos' | 'Documentación del negocio' | 'Documentación patrimonial' | 'Otros documentos';
  status: DocumentVerificationStatus;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  observations?: string;
}

// 23 & 25. Análisis Cualitativo & Conclusión del Analista
export interface QualitativeAnalysisData {
  activityExperience: string;
  businessStability: string;
  businessOrganization: string;
  referencesSummary: string;
  visitSummary: string;
  analystComments: string;
  analystConclusion: string;
  finalObservations: string;
}

// 26. Seguimiento
export type ApplicationStatus =
  | 'registrada'
  | 'en_evaluacion'
  | 'documentacion_pendiente'
  | 'en_verificacion'
  | 'finalizada';

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  status: ApplicationStatus;
  responsibleName: string;
  responsibleRole: string;
  observation: string;
  nextAction?: string;
}

export interface FollowUpItem {
  id: string;
  applicationId: string;
  applicantName: string;
  applicationCode: string;
  status: ApplicationStatus;
  responsibleName: string;
  observation: string;
  nextAction: string;
  date: string;
  priority: 'alta' | 'media' | 'baja';
  completed: boolean;
}

// Expediente Completo de Evaluación Crediticia
export interface CreditEvaluationDossier {
  id: string;
  code: string; // EXP-2024-001
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  assignedAnalystId: string;
  assignedAnalystName: string;
  assignedAnalystRole: string;
  agency: string;

  // 1-3. Personal, Business, Credit Terms
  personal: ApplicantPersonalData;
  business: BusinessActivityData;
  terms: CreditTermsData;

  // 8-11. Economic data
  income: IncomeData;
  costOfSales: CostOfSalesData;
  businessExpenses: BusinessExpensesData;
  familyExpenses: FamilyExpensesData;

  // 12-13. Financial Statements
  incomeStatement: IncomeStatementData;
  balanceSheet: BalanceSheetData;

  // 14. Obligations
  obligations: FinancialObligation[];

  // 15-17. Cash Flow, Capacity, Ratios
  cashFlow: CashFlowData;
  paymentCapacity: PaymentCapacityData;
  ratios: FinancialRatiosData;

  // 18-20. Detail Tables
  inventory: InventoryItem[];
  accountsReceivable: AccountReceivableItem[];
  accountsPayable: AccountPayableItem[];

  // 21-22. References, Visit & Docs
  references: PersonalReference[];
  visitVerification: VisitVerificationData;
  documents: DocumentControlItem[];

  // 23 & 25. Qualitative Analysis & Analyst Conclusion
  qualitative: QualitativeAnalysisData;

  // 26. Timeline
  timeline: TimelineEvent[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  targetCode?: string;
  ipAddress?: string;
}
