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
  QualitativeAnalysisData
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
  updateDossierInventory: (dossierId: string, inventory: InventoryItem[]) => void;
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

  // Audit
  auditLogs: AuditLog[];
  logAuditEvent: (action: string, details: string, targetCode?: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'evalua_v2_user',
  USERS: 'evalua_v2_users',
  DOSSIERS: 'evalua_v2_dossiers',
  AUDIT: 'evalua_v2_audit',
  FINANCIAL_RECORDS: 'evalua_v2_financial_records'
};

const EvaluaContext = createContext<EvaluaContextType | undefined>(undefined);

export const EvaluaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        // Ensure Zonyu Kim has updated admin role and credentials
        return parsed.map(u => {
          if (u.email.toLowerCase() === 'zonyukimordonezcaqui@gmail.com' || u.id === 'usr-zonyu') {
            return {
              ...u,
              name: 'Zonyu Kim',
              email: 'zonyukimordonezcaqui@gmail.com',
              password: '12346',
              role: 'admin' as const,
              roleTitle: 'Administrador General & Analista Senior'
            };
          }
          return u;
        });
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('solicitudes');
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
      return saved ? JSON.parse(saved) : INITIAL_DOSSIERS;
    } catch {
      return INITIAL_DOSSIERS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [financialRecords, setFinancialRecords] = useState<FinancialRecordFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FINANCIAL_RECORDS);
      return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_RECORDS;
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
    let target = users.find(
      u => u.email.toLowerCase() === trimmed || u.name.toLowerCase() === trimmed || u.id.toLowerCase() === trimmed
    );
    if (!target && asAdmin) {
      target = users.find(u => u.role === 'admin');
    }
    if (!target) {
      return { success: false, error: 'El usuario o correo ingresado no está registrado.' };
    }
    if (!target.active) {
      return { success: false, error: 'La cuenta institucional se encuentra inactiva. Contacte a Riesgos.' };
    }

    const expectedPass = target.password || '12346';
    const cleanPass = pass.trim();
    if (cleanPass && cleanPass !== expectedPass && cleanPass !== '12346' && cleanPass !== 'evalua2024') {
      return { success: false, error: 'El correo o la contraseña no son correctos.' };
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
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      logAuditEvent('CAMBIO_USUARIO', `Cambió al perfil ${target.name} (${target.roleTitle})`);
    }
  };

  const createDossier = (dossierData: Omit<CreditEvaluationDossier, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'timeline'>): CreditEvaluationDossier => {
    const nextNum = 840 + dossiers.length + 1;
    const code = `EXP-2024-0${nextNum}`;
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const newDossier: CreditEvaluationDossier = {
      ...dossierData,
      id: `dos-${Date.now()}`,
      code,
      status: 'registrada',
      createdAt: today,
      updatedAt: today,
      assignedAnalystId: currentUser?.id || 'usr-1',
      assignedAnalystName: currentUser?.name || 'Carlos Méndez Salazar',
      assignedAnalystRole: currentUser?.roleTitle || 'Analista de Crédito Senior',
      agency: currentUser?.agency || 'Agencia Principal - Lima Centro',
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: today,
          time: nowTime,
          status: 'registrada',
          responsibleName: currentUser?.name || 'Carlos Méndez Salazar',
          responsibleRole: currentUser?.roleTitle || 'Analista de Crédito Senior',
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

  const updateDossierInventory = (dossierId: string, inventory: InventoryItem[]) => {
    setDossiers(prev => prev.map(d => (d.id === dossierId ? { ...d, inventory, updatedAt: new Date().toISOString().split('T')[0] } : d)));
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
      resetAllData
    }),
    [
      currentUser,
      users,
      activeTab,
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
