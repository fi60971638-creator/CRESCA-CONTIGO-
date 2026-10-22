export type ClientType = 'natural' | 'negocio' | 'empresa';

export interface FinancialClientGeneral {
  clientType: ClientType;
  documentType: 'DNI' | 'RUC' | 'CE' | 'PASAPORTE';
  documentNumber: string;
  nameOrBusinessName: string;
  tradeName?: string;
  legalRepresentative?: string;
  representativeDni?: string;
  birthOrEstablishmentDate: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  province: string;
  department: string;
  economicSector: string;
  economicActivity: string;
  taxRegime: string;
  operatingTimeYears: number;
  cutoffDate: string;
  advisorNotes: string;
}

export interface FinancialItem {
  id: string;
  category: 'ingreso_personal' | 'gasto_personal' | 'ingreso_negocio' | 'costo_negocio' | 'gasto_operativo';
  concept: string;
  declaredAmount: number;
  verifiedAmount: number;
  isVerified: boolean;
  supportDocName?: string;
  docStatus?: 'pendiente' | 'recibido' | 'revisado';
  notes?: string;
}

export interface BalanceSheetRecord {
  // Activo Corriente
  cashAndBanks: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;

  // Activo No Corriente
  propertyAndBuildings: number;
  machineryAndEquipment: number;
  vehicles: number;
  furnitureAndFixtures: number;
  otherNonCurrentAssets: number;
  accumulatedDepreciation: number;

  // Pasivo Corriente
  suppliersPayable: number;
  shortTermBankDebt: number;
  taxesPayable: number;
  otherCurrentLiabilities: number;

  // Pasivo No Corriente
  longTermBankDebt: number;
  mortgages: number;
  otherNonCurrentLiabilities: number;

  // Patrimonio
  capital: number;
  retainedEarnings: number;
}

export interface IncomeStatementRecord {
  salesOrIncome: number;
  salesReturns: number;
  cogsMerchandise: number;
  cogsLabor: number;
  cogsFreightAndOther: number;

  // Gastos Operativos
  operatingRent: number;
  operatingPayroll: number;
  operatingServices: number;
  operatingTransport: number;
  operatingMaintenance: number;
  operatingSalesAndMarketing: number;
  operatingTaxesAndLicenses: number;
  otherOperatingExpenses: number;

  // Otros
  otherNonOpIncome: number;
  financialExpenses: number;
  taxesIR: number;
}

export interface CashFlowRecord {
  initialBalance: number;
  // Entradas
  cashSales: number;
  creditCollections: number;
  salaryOrIndependentIncome: number;
  otherInflows: number;
  // Salidas
  supplierPayments: number;
  operatingExpensesPayments: number;
  payrollPayments: number;
  debtInstallmentsPayments: number;
  familyExpensesOrPersonalDraws: number;
  taxPayments: number;
  otherOutflows: number;
}

export interface ObligationRecord {
  id: string;
  entityName: string;
  obligationType: string;
  originalAmount: number;
  currentBalance: number;
  monthlyInstallment: number;
  annualRatePct: number;
  remainingInstallments: number;
  dueDate: string;
  status: 'al_dia' | 'con_atraso' | 'refinanciado' | 'cancelado';
  isVerifiedWithSBS: boolean;
  supportDoc?: string;
  notes?: string;
}

export interface SupportDocumentRecord {
  id: string;
  title: string;
  documentType:
    | 'boleta_factura'
    | 'recibo_honorarios'
    | 'declaracion_sunat'
    | 'boleta_pago'
    | 'estado_cuenta'
    | 'recibo_servicios'
    | 'titulo_propiedad'
    | 'reporte_sbs'
    | 'contrato'
    | 'otro';
  relatedSection: 'ingresos' | 'costos' | 'gastos' | 'balance' | 'obligaciones' | 'general';
  relatedItemConcept: string;
  status: 'pendiente' | 'recibido' | 'revisado';
  declaredAmount: number;
  verifiedAmount: number;
  isBacked: boolean;
  fileName?: string;
  fileData?: string;
  fileSize?: string;
  uploadedAt: string;
  notes?: string;
}

export interface AuditHistoryEntry {
  id: string;
  timestamp: string;
  advisorName: string;
  action: string;
  changedTab: string;
  details: string;
}

export interface FinancialRecordFile {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  advisorId: string;
  advisorName: string;
  agency: string;
  status: 'en_proceso' | 'completo' | 'auditado';

  general: FinancialClientGeneral;
  incomeExpenseItems: FinancialItem[];
  balanceSheet: BalanceSheetRecord;
  incomeStatement: IncomeStatementRecord;
  cashFlow: CashFlowRecord;
  obligations: ObligationRecord[];
  supportDocuments: SupportDocumentRecord[];

  evaluationParams: {
    proposedInstallment: number;
    stressTestDropPct: number;
    advisorAppraisalNotes: string;
  };

  auditTrail: AuditHistoryEntry[];
  advisorReportNotes: string;
}
