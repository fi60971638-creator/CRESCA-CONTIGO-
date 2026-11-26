import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  User,
  CreditEvaluationDossier,
  ApplicationStatus,
  TimelineEvent,
  AuditLog,
  DocumentControlItem,
  FinancialObligation,
  InventoryItem,
  AccountReceivableItem,
  AccountPayableItem,
  PersonalReference,
  VisitVerificationData,
  QualitativeAnalysisData,
  InventoryMetadata,
  InventoryValuationSnapshot,
  BalanceSheetDetail,
  BalanceSheetSnapshot
} from '../types/evalua';
import {
  FinancialRecordFile,
  FinancialItem,
  ObligationRecord,
  SupportDocumentRecord
} from '../types/financialRecord';
import {
  INITIAL_USERS,
  INITIAL_DOSSIERS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { INITIAL_FINANCIAL_RECORDS } from '../data/initialFinancialRecords';
import {
  calculateInventoryTotalValue,
  hydrateBalanceSheetDetail,
  flattenDetailToBalanceSheetData,
  hydrateBalanceObligations,
  calculateTotalObligations,
  calculateIncomeStatement,
  calculateCashFlow,
  calculatePaymentCapacity,
  calculateFinancialRatios,
  computeHierarchicalBalanceSummary
} from '../utils/financialCalculations';

interface EvaluaContextType {
  // Auth & Roles
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User | null) => void;
  login: (email: string, pass: string, asAdmin?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  switchUserRole: (userId: string) => void;

  // Navigation & UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeNavKey: string;
  activeSubSection: string | null;
  navigateTo: (tab: string, navKey?: string, subSection?: string | null) => void;
  selectedDossierId: string | null;
  setSelectedDossierId: (id: string | null) => void;
  modalInitialTab: string;
  setModalInitialTab: (tab: string) => void;
  openDossierWithTab: (id: string, tab: string) => void;
  isNewDossierModalOpen: boolean;
  setIsNewDossierModalOpen: (open: boolean) => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;

  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Dossiers
  dossiers: CreditEvaluationDossier[];
  createDossier: (dossier: Omit<CreditEvaluationDossier, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'timeline'>) => CreditEvaluationDossier;
  updateDossier: (id: string, updates: Partial<CreditEvaluationDossier>) => void;
  deleteDossier: (id: string) => void;
  updateDossierStatus: (id: string, status: ApplicationStatus, observation: string, nextAction?: string) => void;

  // Sub-modules updates
  updateDossierDocuments: (dossierId: string, documents: DocumentControlItem[]) => void;
  toggleDocStatus: (dossierId: string, docId: string, newStatus: DocumentControlItem['status']) => void;
  updateDossierObligations: (dossierId: string, obligations: FinancialObligation[]) => void;
  updateDossierInventory: (dossierId: string, inventory: InventoryItem[], inventoryMeta?: InventoryMetadata) => void;
  saveInventoryValuation: (
    dossierId: string,
    inventory: InventoryItem[],
    inventoryMeta: InventoryMetadata,
    saveToHistory?: boolean
  ) => void;
  saveHierarchicalBalance: (
    dossierId: string,
    detail: BalanceSheetDetail,
    obligations: FinancialObligation[],
    saveSnapshot?: boolean
  ) => void;
  updateDossierReceivables: (dossierId: string, receivables: AccountReceivableItem[]) => void;
  updateDossierPayables: (dossierId: string, payables: AccountPayableItem[]) => void;
  updateDossierReferences: (dossierId: string, references: PersonalReference[]) => void;
  updateDossierVisit: (dossierId: string, visit: VisitVerificationData) => void;
  updateDossierQualitative: (dossierId: string, qualitative: QualitativeAnalysisData) => void;
  addTimelineEvent: (dossierId: string, event: Omit<TimelineEvent, 'id'>) => void;

  // Financial Client Records Module (Registro y Análisis de Información Financiera)
  financialRecords: FinancialRecordFile[];
  selectedFinancialRecordId: string | null;
  setSelectedFinancialRecordId: (id: string | null) => void;
  createFinancialRecord: (record: Omit<FinancialRecordFile, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'auditTrail'>) => FinancialRecordFile;
  updateFinancialRecord: (id: string, updates: Partial<FinancialRecordFile>, changeTabName?: string, changeDetails?: string) => void;
  deleteFinancialRecord: (id: string) => void;
  addFinancialItem: (recordId: string, item: Omit<FinancialItem, 'id'>) => void;
  updateFinancialItem: (recordId: string, itemId: string, updates: Partial<FinancialItem>) => void;
  deleteFinancialItem: (recordId: string, itemId: string) => void;
  addObligation: (recordId: string, obligation: Omit<ObligationRecord, 'id'>) => void;
  updateObligation: (recordId: string, obligationId: string, updates: Partial<ObligationRecord>) => void;
  deleteObligation: (recordId: string, obligationId: string) => void;
  addSupportDocument: (recordId: string, doc: Omit<SupportDocumentRecord, 'id' | 'uploadedAt'>) => void;
  updateSupportDocument: (recordId: string, docId: string, updates: Partial<SupportDocumentRecord>) => void;
  deleteSupportDocument: (recordId: string, docId: string) => void;
  addAuditHistoryEntry: (recordId: string, action: string, changedTab: string, details: string) => void;

  // Admin users management
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserActive: (id: string) => void;

  // Audit & Backup Data Management
  auditLogs: AuditLog[];
  logAuditEvent: (action: string, details: string, targetCode?: string) => void;
  resetAllData: () => void;
  exportBackupData: () => void;
  importBackupData: (jsonString: string) => { success: boolean; error?: string };
}

const STORAGE_KEYS = {
  CURRENT_USER: 'evalua_v2_user',
  USERS: 'evalua_v2_users',
  DOSSIERS: 'evalua_v2_dossiers',
  AUDIT: 'evalua_v2_audit',
  FINANCIAL_RECORDS: 'evalua_v2_financial_records'
};

const LEGACY_USER_EMAILS = new Set([
  'carlos.mendez@evalua.pe',
  'elena.ramos@evalua.pe',
  'patricia.valdivia@evalua.pe',
  'jorge.morales@evalua.pe'
]);

const LEGACY_USER_IDS = new Set([
  'usr-1',
  'usr-2',
  'usr-3',
  'usr-4',
  'usr-zonyu'
]);

const LEGACY_USER_NAMES = new Set([
  'Carlos Méndez Salazar',
  'Elena Ramos Quispe',
  'Dra. Patricia Valdivia',
  'Jorge Luis Morales',
  'Zonyu Kim'
]);

const isLegacyUser = (u?: Partial<User> | null): boolean => {
  if (!u) return false;
  if (u.id && LEGACY_USER_IDS.has(u.id)) return true;
  if (u.email && LEGACY_USER_EMAILS.has(u.email.toLowerCase())) return true;
  if (u.name && LEGACY_USER_NAMES.has(u.name)) return true;
  return false;
};

const EvaluaContext = createContext<EvaluaContextType | undefined>(undefined);

export const EvaluaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const primaryAdmin = INITIAL_USERS[0];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((u: User) => !isLegacyUser(u));
          const updated = filtered.map((u: User) =>
            u.id === primaryAdmin.id || u.email.toLowerCase() === 'admin@evalua.pe'
              ? { ...u, email: primaryAdmin.email, password: primaryAdmin.password }
              : u
          );
          if (updated.length === 0) {
            return INITIAL_USERS;
          }
          const hasPrimary = updated.some(
            (u: User) => u.id === primaryAdmin.id || u.email.toLowerCase() === primaryAdmin.email.toLowerCase()
          );
          if (!hasPrimary) {
            return [primaryAdmin, ...updated];
          }
          return updated;
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (isLegacyUser(parsed)) return null;
      return parsed;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTabState] = useState<string>('panel_principal');
  const [activeNavKey, setActiveNavKey] = useState<string>('panel_principal');
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    setActiveNavKey(tab);
    setActiveSubSection(null);
  };

  const navigateTo = (tab: string, navKey?: string, subSection?: string | null) => {
    setActiveTabState(tab);
    setActiveNavKey(navKey || tab);
    setActiveSubSection(subSection ?? null);
  };

  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<string>('solicitante');
  const [isNewDossierModalOpen, setIsNewDossierModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const openDossierWithTab = (id: string, tab: string) => {
    setModalInitialTab(tab);
    setSelectedDossierId(id);
  };

  const [dossiers, setDossiers] = useState<CreditEvaluationDossier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOSSIERS);
      if (!saved) return INITIAL_DOSSIERS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_DOSSIERS;
      return parsed.map((d: CreditEvaluationDossier) => {
        const useAdminFallback = d.assignedAnalystId === 'usr-1' || d.assignedAnalystName === 'Carlos Méndez Salazar';
        const hasLegacyAnalyst =
          LEGACY_USER_IDS.has(d.assignedAnalystId) || LEGACY_USER_NAMES.has(d.assignedAnalystName);
        return {
          ...d,
          assignedAnalystId: hasLegacyAnalyst
            ? useAdminFallback
              ? 'usr-admin-hco'
              : 'usr-analista-hco'
            : d.assignedAnalystId,
          assignedAnalystName: hasLegacyAnalyst
            ? useAdminFallback
              ? 'Asesor Principal - Huánuco'
              : 'Analista de Riesgos Huánuco'
            : d.assignedAnalystName,
          assignedAnalystRole: hasLegacyAnalyst
            ? useAdminFallback
              ? 'Asesor de Negocios & Administrador'
              : 'Analista de Crédito y Riesgos'
            : d.assignedAnalystRole,
          visitVerification:
            d.visitVerification && LEGACY_USER_NAMES.has(d.visitVerification.verifiedBy)
              ? {
                  ...d.visitVerification,
                  verifiedBy:
                    d.visitVerification.verifiedBy === 'Carlos Méndez Salazar'
                      ? 'Asesor Principal - Huánuco'
                      : 'Analista de Riesgos Huánuco'
                }
              : d.visitVerification,
          timeline: Array.isArray(d.timeline)
            ? d.timeline.map(ev =>
                LEGACY_USER_NAMES.has(ev.responsibleName)
                  ? {
                      ...ev,
                      responsibleName:
                        ev.responsibleName === 'Carlos Méndez Salazar'
                          ? 'Asesor Principal - Huánuco'
                          : 'Analista de Riesgos Huánuco',
                      responsibleRole:
                        ev.responsibleName === 'Carlos Méndez Salazar'
                          ? 'Asesor de Negocios & Administrador'
                          : 'Analista de Crédito y Riesgos'
                    }
                  : ev
              )
            : d.timeline
        };
      });
    } catch {
      return INITIAL_DOSSIERS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      if (!saved) return INITIAL_AUDIT_LOGS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_AUDIT_LOGS;
      return parsed.map((log: AuditLog) => {
        if (!LEGACY_USER_IDS.has(log.userId) && !LEGACY_USER_NAMES.has(log.userName)) {
          return log;
        }
        const isPrimary = log.userId === 'usr-1' || log.userName === 'Carlos Méndez Salazar' || log.userName === 'Zonyu Kim';
        return {
          ...log,
          userId: isPrimary ? 'usr-admin-hco' : 'usr-analista-hco',
          userName: isPrimary ? 'Asesor Principal - Huánuco' : 'Analista de Riesgos Huánuco'
        };
      });
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [financialRecords, setFinancialRecords] = useState<FinancialRecordFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FINANCIAL_RECORDS);
      if (!saved) return INITIAL_FINANCIAL_RECORDS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_FINANCIAL_RECORDS;
      return parsed.map((r: FinancialRecordFile) => {
        const hasLegacy = LEGACY_USER_IDS.has(r.advisorId) || LEGACY_USER_NAMES.has(r.advisorName);
        const isPrimary = r.advisorId === 'usr-1' || r.advisorId === 'usr-zonyu' || r.advisorName === 'Carlos Méndez Salazar' || r.advisorName === 'Zonyu Kim';
        return {
          ...r,
          advisorId: hasLegacy ? (isPrimary ? 'usr-admin-hco' : 'usr-analista-hco') : r.advisorId,
          advisorName: hasLegacy ? (isPrimary ? 'Asesor Principal - Huánuco' : 'Analista de Riesgos Huánuco') : r.advisorName,
          auditTrail: Array.isArray(r.auditTrail)
            ? r.auditTrail.map(a =>
                LEGACY_USER_NAMES.has(a.advisorName)
                  ? {
                      ...a,
                      advisorName:
                        a.advisorName === 'Elena Ramos Quispe'
                          ? 'Analista de Riesgos Huánuco'
                          : 'Asesor Principal - Huánuco'
                    }
                  : a
              )
            : r.auditTrail
        };
      });
    } catch {
      return INITIAL_FINANCIAL_RECORDS;
    }
  });

  const [selectedFinancialRecordId, setSelectedFinancialRecordId] = useState<string | null>(
    INITIAL_FINANCIAL_RECORDS[0]?.id || null
  );

  // Storage Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(dossiers));
  }, [dossiers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_RECORDS, JSON.stringify(financialRecords));
  }, [financialRecords]);

  const logAuditEvent = (action: string, details: string, targetCode?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      userId: currentUser?.id || 'sistema',
      userName: currentUser?.name || 'Sistema EVALÚA',
      action,
      details,
      targetCode
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const login = (emailOrUser: string, pass: string, asAdmin?: boolean) => {
    const trimmed = emailOrUser.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!trimmed) {
      return { success: false, error: 'Por favor, ingrese su correo o usuario institucional.' };
    }

    if (!cleanPass) {
      return { success: false, error: 'Por favor, ingrese su contraseña de acceso.' };
    }

    let target = users.find(
      u => u.email.toLowerCase() === trimmed || u.name.toLowerCase() === trimmed || u.id.toLowerCase() === trimmed
    );
    if (!target && asAdmin) {
      target = users.find(u => u.role === 'admin');
    }
    if (!target) {
      return { success: false, error: 'Credenciales inválidas. Verifique el usuario institucional ingresado.' };
    }
    if (!target.active) {
      return { success: false, error: 'La cuenta institucional se encuentra inactiva. Contacte a Riesgos y Seguridad.' };
    }

    // Validación estricta de contraseña sin contraseñas maestras ni puertas traseras
    if (cleanPass !== target.password) {
      return { success: false, error: 'Contraseña incorrecta. Verifique sus datos de acceso.' };
    }

    setCurrentUser(target);
    logAuditEvent('INICIO_SESION', `Usuario ${target.name} (${target.roleTitle}) accedió al sistema.`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent('CIERRE_SESION', `Usuario ${currentUser.name} cerró sesión.`);
    }
    setCurrentUser(null);
  };

  const switchUserRole = (userId: string) => {
    // Restricción: solo un administrador autenticado puede alternar perfil
    if (currentUser?.role !== 'admin') {
      logAuditEvent('SEGURIDAD', 'Intento no autorizado de alternar perfil de usuario.');
      return;
    }
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      logAuditEvent('CAMBIO_USUARIO', `Administrador alternó al perfil ${target.name} (${target.roleTitle})`);
    }
  };

  const exportBackupData = () => {
    const backup = {
      app: 'EVALÚA',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      disclaimer: 'Copia de seguridad local para prototipo de evaluación crediticia.',
      users,
      dossiers,
      financialRecords,
      auditLogs
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evalua_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAuditEvent('EXPORTACION_RESPALDO', 'Descarga de copia de seguridad integral en formato JSON.');
  };

  const importBackupData = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.dossiers && !data.financialRecords) {
        return { success: false, error: 'El archivo seleccionado no corresponde a un formato de respaldo válido de EVALÚA.' };
      }
      if (Array.isArray(data.dossiers)) setDossiers(data.dossiers);
      if (Array.isArray(data.financialRecords)) setFinancialRecords(data.financialRecords);
      if (Array.isArray(data.users)) setUsers(data.users);
      if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      logAuditEvent('IMPORTACION_RESPALDO', 'Restauración exitosa de expedientes desde archivo de copia de seguridad.');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: 'Error al interpretar el archivo JSON de respaldo.' };
    }
  };

  const createDossier = (dossierData: Omit<CreditEvaluationDossier, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'timeline'>): CreditEvaluationDossier => {
    const nextNum = 100 + dossiers.length + 1;
    const code = `EXP-2026-0${nextNum}`;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const newDossier: CreditEvaluationDossier = {
      ...dossierData,
      id: `dos-${Date.now()}`,
      code,
      status: 'registrada',
      createdAt: today,
      updatedAt: today,
      assignedAnalystId: currentUser?.id || 'usr-admin-hco',
      assignedAnalystName: currentUser?.name || 'Asesor Principal - Huánuco',
      assignedAnalystRole: currentUser?.roleTitle || 'Asesor de Negocios & Administrador',
      agency: currentUser?.agency || 'Agencia Principal - Huánuco',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: today,
          time: nowTime,
          status: 'registrada',
          responsibleName: currentUser?.name || 'Asesor Principal - Huánuco',
          responsibleRole: currentUser?.roleTitle || 'Asesor de Negocios & Administrador',
          observation: 'Ingreso y estructuración inicial del expediente crediticio en la plataforma EVALÚA.',
          nextAction: 'Coordinar visita de verificación presencial'
        }
      ]
    };

    setDossiers(prev => [newDossier, ...prev]);
    logAuditEvent('CREACION_EXPEDIENTE', `Creó expediente ${code} para ${dossierData.personal.fullName} por S/ ${dossierData.terms.requestedAmount.toLocaleString()}`, code);
    return newDossier;
  };

  const updateDossier = (id: string, updates: Partial<CreditEvaluationDossier>) => {
    setDossiers(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : d))
    );
    const target = dossiers.find(d => d.id === id);
    logAuditEvent('ACTUALIZACION_EXPEDIENTE', `Actualizó información del expediente ${target?.code || id}`, target?.code);
  };

  const deleteDossier = (id: string) => {
    const target = dossiers.find(d => d.id === id);
    setDossiers(prev => prev.filter(d => d.id !== id));
    logAuditEvent('ELIMINACION_EXPEDIENTE', `Eliminó expediente ${target?.code || id}`, target?.code);
  };

  const updateDossierStatus = (id: string, status: ApplicationStatus, observation: string, nextAction?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    setDossiers(prev =>
      prev.map(d => {
        if (d.id === id) {
          const newEvent: TimelineEvent = {
            id: `tl-${Date.now()}`,
            date: today,
            time: nowTime,
            status,
            responsibleName: currentUser?.name || 'Analista de Crédito',
            responsibleRole: currentUser?.roleTitle || 'Analista',
            observation,
            nextAction
          };
          return {
            ...d,
            status,
            updatedAt: today,
            timeline: [newEvent, ...d.timeline]
          };
        }
        return d;
      })
    );

    const target = dossiers.find(d => d.id === id);
    logAuditEvent('CAMBIO_ESTADO', `Actualizó estado de ${target?.code || id} a [${status.toUpperCase()}]`, target?.code);
  };

  const updateDossierDocuments = (dossierId: string, documents: DocumentControlItem[]) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, documents, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  };

  const toggleDocStatus = (dossierId: string, docId: string, newStatus: DocumentControlItem['status']) => {
    setDossiers(prev =>
      prev.map(d => {
        if (d.id === dossierId) {
          const updatedDocs = d.documents.map(doc => (doc.id === docId ? { ...doc, status: newStatus } : doc));
          return { ...d, documents: updatedDocs, updatedAt: new Date().toISOString().split('T')[0] };
        }
        return d;
      })
    );
  };

  const updateDossierObligations = (dossierId: string, obligations: FinancialObligation[]) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, obligations, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  };

  const updateDossierInventory = (
    dossierId: string,
    inventory: InventoryItem[],
    inventoryMeta?: InventoryMetadata
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setDossiers(prev =>
      prev.map(d => {
        if (d.id !== dossierId) return d;
        const normalizedInventory = inventory.map(item => {
          const qty = Math.max(0, Number(item.quantity) || 0);
          const cost = Math.max(0, Number(item.unitCost) || 0);
          return {
            ...item,
            quantity: qty,
            unitCost: cost,
            totalCostValue: Number((qty * cost).toFixed(2))
          };
        });
        const newInventoryTotal = calculateInventoryTotalValue(normalizedInventory);
        const nextMeta = inventoryMeta || d.inventoryMeta;
        const baseDetail = hydrateBalanceSheetDetail({
          ...d,
          inventory: normalizedInventory,
          inventoryMeta: nextMeta
        });
        const syncedCurrentAssets = baseDetail.currentAssets.map(ca =>
          ca.isInventoryLinked || ca.category === 'Inventarios'
            ? {
                ...ca,
                amount: newInventoryTotal,
                recordedDate: nextMeta?.inventoryDate || today,
                verificationStatus: nextMeta?.verificationStatus || ca.verificationStatus
              }
            : ca
        );
        const nextDetail: BalanceSheetDetail = {
          ...baseDetail,
          currentAssets: syncedCurrentAssets
        };
        const syncedObligations = hydrateBalanceObligations(d);
        const syncedFlatBalance = flattenDetailToBalanceSheetData(
          nextDetail.currentAssets,
          nextDetail.nonCurrentAssets,
          syncedObligations
        );
        const ratios = calculateFinancialRatios(
          syncedFlatBalance.totalAssets,
          syncedFlatBalance.totalLiabilities,
          d.income.totalMonthlyIncome,
          d.paymentCapacity.currentFinancialObligations,
          d.paymentCapacity.availableFlow
        );
        return {
          ...d,
          inventory: normalizedInventory,
          inventoryMeta: nextMeta,
          balanceSheetDetail: nextDetail,
          balanceSheet: syncedFlatBalance,
          ratios,
          updatedAt: today
        };
      })
    );
  };

  const saveInventoryValuation = (
    dossierId: string,
    inventory: InventoryItem[],
    inventoryMeta: InventoryMetadata,
    saveToHistory = false
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleString('sv-SE').replace('T', ' ');
    const target = dossiers.find(d => d.id === dossierId);

    updateDossierInventory(dossierId, inventory, inventoryMeta);

    const totalValue = calculateInventoryTotalValue(inventory);
    const totalUnits = inventory.reduce((s, i) => s + Math.max(0, Number(i.quantity) || 0), 0);

    if (saveToHistory) {
      const snapshot: InventoryValuationSnapshot = {
        id: `inv-snap-${Date.now()}`,
        inventoryDate: inventoryMeta.inventoryDate || today,
        savedAt: nowTime,
        savedBy: currentUser?.name || 'Analista',
        responsibleName: inventoryMeta.responsibleName,
        location: inventoryMeta.location,
        verificationStatus: inventoryMeta.verificationStatus,
        declaredTotalValue: inventoryMeta.declaredTotalValue,
        totalItems: inventory.length,
        totalUnits,
        totalValue,
        items: inventory,
        generalObservations: inventoryMeta.generalObservations
      };

      setDossiers(prev =>
        prev.map(d =>
          d.id === dossierId
            ? {
                ...d,
                inventorySnapshots: [snapshot, ...(d.inventorySnapshots || [])],
                updatedAt: today
              }
            : d
        )
      );
      logAuditEvent(
        'VALORIZACION_INVENTARIO',
        `Guardó valoración histórica de inventario (${inventory.length} ítems · S/ ${totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })})`,
        target?.code
      );
    } else {
      logAuditEvent(
        'ACTUALIZACION_INVENTARIO',
        `Actualizó inventario valorizado en S/ ${totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })} (sincronizado con Balance General)`,
        target?.code
      );
    }
  };

  const saveHierarchicalBalance = (
    dossierId: string,
    detail: BalanceSheetDetail,
    obligations: FinancialObligation[],
    saveSnapshot = false
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleString('sv-SE').replace('T', ' ');
    const target = dossiers.find(d => d.id === dossierId);

    setDossiers(prev =>
      prev.map(d => {
        if (d.id !== dossierId) return d;
        const inventoryTotal = calculateInventoryTotalValue(d.inventory);
        const syncedCurrentAssets = detail.currentAssets.map(ca =>
          ca.isInventoryLinked || ca.category === 'Inventarios'
            ? { ...ca, amount: inventoryTotal }
            : ca
        );
        const nextDetail: BalanceSheetDetail = {
          ...detail,
          lastSavedAt: nowTime,
          currentAssets: syncedCurrentAssets
        };

        const flatBalance = flattenDetailToBalanceSheetData(
          nextDetail.currentAssets,
          nextDetail.nonCurrentAssets,
          obligations
        );
        const totalMonthlyInstallments = calculateTotalObligations(obligations);
        const totalOperatingAndFamily =
          d.costOfSales.totalCostOfSales +
          d.businessExpenses.totalBusinessExpenses +
          d.familyExpenses.totalFamilyExpenses;

        const incomeStatement = calculateIncomeStatement(
          d.income.monthlySales,
          d.costOfSales.totalCostOfSales,
          d.businessExpenses.totalBusinessExpenses,
          d.income.otherBusinessIncome + d.income.totalPersonalIncome,
          0,
          d.familyExpenses.totalFamilyExpenses,
          totalMonthlyInstallments
        );

        const cashFlow = calculateCashFlow(
          d.income.monthlySales,
          d.income.salaryIncome,
          d.income.otherBusinessIncome + d.income.feesIncome + d.income.rentalIncome + d.income.otherPersonalIncome,
          0,
          d.costOfSales.totalCostOfSales,
          d.businessExpenses.totalBusinessExpenses,
          d.familyExpenses.totalFamilyExpenses,
          totalMonthlyInstallments,
          0
        );

        const paymentCapacity = calculatePaymentCapacity(
          d.income.totalMonthlyIncome,
          totalOperatingAndFamily,
          totalMonthlyInstallments,
          d.terms.proposedInstallment
        );

        const ratios = calculateFinancialRatios(
          flatBalance.totalAssets,
          flatBalance.totalLiabilities,
          d.income.totalMonthlyIncome,
          totalMonthlyInstallments,
          paymentCapacity.availableFlow
        );

        const summary = computeHierarchicalBalanceSummary(
          nextDetail.currentAssets,
          nextDetail.nonCurrentAssets,
          obligations,
          nextDetail.equityBreakdown
        );

        let nextSnapshots = d.balanceSnapshots || [];
        if (saveSnapshot) {
          const snapshot: BalanceSheetSnapshot = {
            id: `bs-snap-${Date.now()}`,
            balanceDate: nextDetail.balanceDate || today,
            evaluationPeriod: nextDetail.evaluationPeriod || today.slice(0, 7),
            currency: 'S/',
            savedAt: nowTime,
            savedBy: currentUser?.name || 'Analista',
            isDraft: Boolean(nextDetail.isDraft),
            inventoryValueAtSnapshot: inventoryTotal,
            totalCurrentAssets: summary.totalCurrentAssets,
            totalNonCurrentAssets: summary.totalNonCurrentAssets,
            totalAssets: summary.totalAssets,
            totalCurrentLiabilities: summary.totalCurrentLiabilities,
            totalNonCurrentLiabilities: summary.totalNonCurrentLiabilities,
            totalLiabilities: summary.totalLiabilities,
            totalDeclaredEquity: summary.declaredEquity,
            computedEquity: summary.computedEquity,
            difference: summary.difference,
            currentAssets: nextDetail.currentAssets,
            nonCurrentAssets: nextDetail.nonCurrentAssets,
            obligations,
            equityBreakdown: nextDetail.equityBreakdown,
            observations: nextDetail.observations
          };
          nextSnapshots = [snapshot, ...nextSnapshots];
        }

        return {
          ...d,
          balanceSheetDetail: nextDetail,
          balanceSnapshots: nextSnapshots,
          balanceSheet: flatBalance,
          obligations,
          incomeStatement,
          cashFlow,
          paymentCapacity,
          ratios,
          updatedAt: today
        };
      })
    );

    logAuditEvent(
      saveSnapshot ? 'CIERRE_PERIODO_BALANCE' : 'ACTUALIZACION_BALANCE',
      `${saveSnapshot ? 'Guardó período de Balance General' : 'Actualizó Balance General'} (${detail.evaluationPeriod || today.slice(0, 7)})`,
      target?.code
    );
  };

  const updateDossierReceivables = (dossierId: string, accountsReceivable: AccountReceivableItem[]) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, accountsReceivable, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  };

  const updateDossierPayables = (dossierId: string, accountsPayable: AccountPayableItem[]) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, accountsPayable, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  };

  const updateDossierReferences = (dossierId: string, references: PersonalReference[]) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, references, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  };

  const updateDossierVisit = (dossierId: string, visitVerification: VisitVerificationData) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, visitVerification, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  };

  const updateDossierQualitative = (dossierId: string, qualitative: QualitativeAnalysisData) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, qualitative, updatedAt: new Date().toISOString().split('T')[0] } : d)));
  };

  const addTimelineEvent = (dossierId: string, event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}`
    };
    setDossiers(prev =>
      prev.map(d => (d.id === dossierId ? { ...d, timeline: [newEvent, ...d.timeline], updatedAt: new Date().toISOString().split('T')[0] } : d))
    );
  };

  // User Administration
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    logAuditEvent('CREACION_USUARIO', `Creó usuario ${newUser.name} (${newUser.roleTitle})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    logAuditEvent('ACTUALIZACION_USUARIO', `Actualizó usuario ID: ${id}`);
  };

  const toggleUserActive = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const next = !u.active;
          logAuditEvent('ESTADO_USUARIO', `${next ? 'Activó' : 'Desactivó'} cuenta de ${u.name}`);
          return { ...u, active: next };
        }
        return u;
      })
    );
  };

  // Financial Records Methods
  const addAuditHistoryEntry = (recordId: string, action: string, changedTab: string, details: string) => {
    const newEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      advisorName: currentUser?.name || 'Asesor Financiero',
      action,
      changedTab,
      details
    };
    setFinancialRecords(prev =>
      prev.map(r => (r.id === recordId ? { ...r, auditTrail: [newEntry, ...r.auditTrail], updatedAt: new Date().toISOString() } : r))
    );
  };

  const createFinancialRecord = (
    recordData: Omit<FinancialRecordFile, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'auditTrail'>
  ): FinancialRecordFile => {
    const id = `rec-fin-${Date.now()}`;
    const code = `EXP-FIN-${new Date().getFullYear()}-${String(financialRecords.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const initialAudit = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
      advisorName: currentUser?.name || 'Asesor Financiero',
      action: 'Apertura de Expediente Financiero',
      changedTab: 'Datos generales',
      details: `Registro del cliente ${recordData.general.nameOrBusinessName} (${recordData.general.clientType.toUpperCase()})`
    };

    const newRecord: FinancialRecordFile = {
      ...recordData,
      id,
      code,
      createdAt: now,
      updatedAt: now,
      auditTrail: [initialAudit]
    };

    setFinancialRecords(prev => [newRecord, ...prev]);
    setSelectedFinancialRecordId(id);
    logAuditEvent('CREACION_EXPEDIENTE_FIN', `Aperturó expediente financiero ${code}`, code);
    return newRecord;
  };

  const updateFinancialRecord = (
    id: string,
    updates: Partial<FinancialRecordFile>,
    changeTabName?: string,
    changeDetails?: string
  ) => {
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updatedRecord = { ...r, ...updates, updatedAt: new Date().toISOString() };
        if (changeTabName && changeDetails) {
          const newEntry = {
            id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            timestamp: new Date().toLocaleString('sv-SE').replace('T', ' '),
            advisorName: currentUser?.name || 'Asesor Financiero',
            action: 'Actualización de Datos',
            changedTab: changeTabName,
            details: changeDetails
          };
          updatedRecord.auditTrail = [newEntry, ...updatedRecord.auditTrail];
        }
        return updatedRecord;
      })
    );
  };

  const deleteFinancialRecord = (id: string) => {
    const target = financialRecords.find(r => r.id === id);
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
    if (selectedFinancialRecordId === id) {
      const remaining = financialRecords.filter(r => r.id !== id);
      setSelectedFinancialRecordId(remaining[0]?.id || null);
    }
    logAuditEvent('ELIMINACION_EXPEDIENTE_FIN', `Eliminó expediente financiero ${target?.code || id}`);
  };

  const addFinancialItem = (recordId: string, itemData: Omit<FinancialItem, 'id'>) => {
    const newItem: FinancialItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          incomeExpenseItems: [...r.incomeExpenseItems, newItem],
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditHistoryEntry(recordId, 'Partida Agregada', 'Ingresos y Gastos', `Registró "${newItem.concept}" (S/ ${newItem.declaredAmount.toLocaleString()})`);
  };

  const updateFinancialItem = (recordId: string, itemId: string, updates: Partial<FinancialItem>) => {
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          incomeExpenseItems: r.incomeExpenseItems.map(item => (item.id === itemId ? { ...item, ...updates } : item)),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteFinancialItem = (recordId: string, itemId: string) => {
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          incomeExpenseItems: r.incomeExpenseItems.filter(item => item.id !== itemId),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addObligation = (recordId: string, obligationData: Omit<ObligationRecord, 'id'>) => {
    const newOb: ObligationRecord = {
      ...obligationData,
      id: `ob-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          obligations: [...r.obligations, newOb],
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditHistoryEntry(recordId, 'Obligación Registrada', 'Créditos y Deudas', `Nueva obligación con ${newOb.entityName} por S/ ${newOb.currentBalance.toLocaleString()}`);
  };

  const updateObligation = (recordId: string, obligationId: string, updates: Partial<ObligationRecord>) => {
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          obligations: r.obligations.map(ob => (ob.id === obligationId ? { ...ob, ...updates } : ob)),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteObligation = (recordId: string, obligationId: string) => {
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          obligations: r.obligations.filter(ob => ob.id !== obligationId),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const addSupportDocument = (recordId: string, docData: Omit<SupportDocumentRecord, 'id' | 'uploadedAt'>) => {
    const newDoc: SupportDocumentRecord = {
      ...docData,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          supportDocuments: [newDoc, ...r.supportDocuments],
          updatedAt: new Date().toISOString()
        };
      })
    );
    addAuditHistoryEntry(recordId, 'Documento Adjuntado', 'Documentos de Sustento', `Adjuntó documento "${newDoc.title}" (${newDoc.status})`);
  };

  const updateSupportDocument = (recordId: string, docId: string, updates: Partial<SupportDocumentRecord>) => {
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          supportDocuments: r.supportDocuments.map(doc => (doc.id === docId ? { ...doc, ...updates } : doc)),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const deleteSupportDocument = (recordId: string, docId: string) => {
    setFinancialRecords(prev =>
      prev.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          supportDocuments: r.supportDocuments.filter(doc => doc.id !== docId),
          updatedAt: new Date().toISOString()
        };
      })
    );
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setDossiers(INITIAL_DOSSIERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFinancialRecords(INITIAL_FINANCIAL_RECORDS);
    setSelectedFinancialRecordId(INITIAL_FINANCIAL_RECORDS[0]?.id || null);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.DOSSIERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.FINANCIAL_RECORDS);
    logAuditEvent('REINICIO_SISTEMA', 'Se restauraron los datos iniciales de demostración de EVALÚA.');
  };

  const value = useMemo(
    () => ({
      currentUser,
      users,
      setCurrentUser,
      login,
      logout,
      switchUserRole,
      activeTab,
      setActiveTab,
      activeNavKey,
      activeSubSection,
      navigateTo,
      selectedDossierId,
      setSelectedDossierId,
      modalInitialTab,
      setModalInitialTab,
      openDossierWithTab,
      isNewDossierModalOpen,
      setIsNewDossierModalOpen,
      isPrintModalOpen,
      setIsPrintModalOpen,
      globalSearchQuery,
      setGlobalSearchQuery,
      dossiers,
      createDossier,
      updateDossier,
      deleteDossier,
      updateDossierStatus,
      updateDossierDocuments,
      toggleDocStatus,
      updateDossierObligations,
      updateDossierInventory,
      saveInventoryValuation,
      saveHierarchicalBalance,
      updateDossierReceivables,
      updateDossierPayables,
      updateDossierReferences,
      updateDossierVisit,
      updateDossierQualitative,
      addTimelineEvent,
      financialRecords,
      selectedFinancialRecordId,
      setSelectedFinancialRecordId,
      createFinancialRecord,
      updateFinancialRecord,
      deleteFinancialRecord,
      addFinancialItem,
      updateFinancialItem,
      deleteFinancialItem,
      addObligation,
      updateObligation,
      deleteObligation,
      addSupportDocument,
      updateSupportDocument,
      deleteSupportDocument,
      addAuditHistoryEntry,
      addUser,
      updateUser,
      toggleUserActive,
      auditLogs,
      logAuditEvent,
      resetAllData,
      exportBackupData,
      importBackupData
    }),
    [
      currentUser,
      users,
      activeTab,
      activeNavKey,
      activeSubSection,
      selectedDossierId,
      modalInitialTab,
      isNewDossierModalOpen,
      isPrintModalOpen,
      globalSearchQuery,
      dossiers,
      auditLogs,
      financialRecords,
      selectedFinancialRecordId
    ]
  );

  return <EvaluaContext.Provider value={value}>{children}</EvaluaContext.Provider>;
};

export const useEvalua = (): EvaluaContextType => {
  const context = useContext(EvaluaContext);
  if (!context) {
    throw new Error('useEvalua must be used within an EvaluaProvider');
  }
  return context;
};
