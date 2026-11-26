import React, { useState, useEffect, useMemo } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  BalanceObservationItem,
  BalanceSheetDetail,
  BalanceSheetSnapshot,
  CreditEvaluationDossier,
  CurrentAssetAccountItem,
  CurrentAssetCategory,
  EquityAccountItem,
  FinancialObligation,
  FixedAssetCategory,
  FixedAssetItem,
  IncomeStatementData,
  LiabilitySubCategory,
  VerificationBadgeStatus
} from '../types/evalua';
import {
  calculateInventoryTotalValue,
  computeHierarchicalBalanceSummary,
  hydrateBalanceObligations,
  hydrateBalanceSheetDetail,
  hydrateInventoryMeta
} from '../utils/financialCalculations';
import {
  Scale,
  Plus,
  Edit2,
  Trash2,
  Save,
  Printer,
  FileSpreadsheet,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Link2,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  MessageSquarePlus,
  RotateCcw,
  FileCheck2
} from 'lucide-react';

interface BalanceGeneralModuleProps {
  dossier: CreditEvaluationDossier;
  liveIncomeStatement: IncomeStatementData;
  activeSubSection: string | null;
  onNavigateToInventory: () => void;
  onBackStep?: () => void;
  onNextStep?: () => void;
}

const CURRENT_ASSET_CATEGORIES: CurrentAssetCategory[] = [
  'Caja',
  'Bancos',
  'Cuentas por cobrar',
  'Anticipos a proveedores',
  'Otros activos corrientes'
];

const FIXED_ASSET_CATEGORIES: FixedAssetCategory[] = [
  'Terrenos',
  'Edificaciones',
  'Maquinaria y equipos',
  'Muebles y enseres',
  'Vehículos',
  'Equipos informáticos',
  'Otros activos fijos'
];

const SHORT_TERM_SUBCATS: LiabilitySubCategory[] = [
  'Préstamos de corto plazo',
  'Deudas con proveedores',
  'Cuentas por pagar',
  'Otras obligaciones de corto plazo'
];

const LONG_TERM_SUBCATS: LiabilitySubCategory[] = [
  'Préstamos de largo plazo',
  'Financiamiento de activos',
  'Otras obligaciones de largo plazo'
];

const getVerificationBadge = (status: VerificationBadgeStatus) => {
  switch (status) {
    case 'Verificado por el analista':
      return { label: 'Verificado', cls: 'bg-[#ECFDF5] text-[#028448] border-[#A7F3D0]' };
    case 'Declarado por el solicitante':
      return { label: 'Declarado', cls: 'bg-[#F0F5FA] text-[#004481] border-[#B8D0E6]' };
    case 'Observado':
      return { label: 'Observado', cls: 'bg-[#FEF2F2] text-[#C81E1E] border-[#FECACA]' };
    default:
      return { label: 'Pendiente', cls: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]' };
  }
};

export const BalanceGeneralModule: React.FC<BalanceGeneralModuleProps> = ({
  dossier,
  liveIncomeStatement,
  activeSubSection,
  onNavigateToInventory,
  onBackStep,
  onNextStep
}) => {
  const {
    currentUser,
    saveHierarchicalBalance,
    setIsPrintModalOpen,
    auditLogs
  } = useEvalua();

  const [detail, setDetail] = useState<BalanceSheetDetail>(() => hydrateBalanceSheetDetail(dossier));
  const [obligations, setObligations] = useState<FinancialObligation[]>(() => hydrateBalanceObligations(dossier));

  // Consulting historical period (read-only view until closed)
  const [viewingSnapshot, setViewingSnapshot] = useState<BalanceSheetSnapshot | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Modals state
  const [caModalOpen, setCaModalOpen] = useState(false);
  const [editingCA, setEditingCA] = useState<CurrentAssetAccountItem | null>(null);
  const [ncaModalOpen, setNcaModalOpen] = useState(false);
  const [editingNCA, setEditingNCA] = useState<FixedAssetItem | null>(null);
  const [obModalOpen, setObModalOpen] = useState(false);
  const [editingOb, setEditingOb] = useState<FinancialObligation | null>(null);
  const [eqModalOpen, setEqModalOpen] = useState(false);
  const [obsModalOpen, setObsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    kind: 'ca' | 'nca' | 'ob' | 'eq';
    id: string;
    label: string;
  } | null>(null);

  // Current Asset form state
  const [caCategory, setCaCategory] = useState<CurrentAssetCategory>('Otros activos corrientes');
  const [caName, setCaName] = useState('');
  const [caDesc, setCaDesc] = useState('');
  const [caAmount, setCaAmount] = useState<number>(0);
  const [caDate, setCaDate] = useState(new Date().toISOString().split('T')[0]);
  const [caDoc, setCaDoc] = useState('');
  const [caStatus, setCaStatus] = useState<VerificationBadgeStatus>('Declarado por el solicitante');
  const [caObs, setCaObs] = useState('');
  const [caDuplicateWarn, setCaDuplicateWarn] = useState(false);

  // Non-Current Asset form state
  const [ncaCategory, setNcaCategory] = useState<FixedAssetCategory>('Maquinaria y equipos');
  const [ncaName, setNcaName] = useState('');
  const [ncaDesc, setNcaDesc] = useState('');
  const [ncaDate, setNcaDate] = useState(new Date().toISOString().split('T')[0]);
  const [ncaValue, setNcaValue] = useState<number>(0);
  const [ncaLocation, setNcaLocation] = useState(dossier.business.businessAddress);
  const [ncaDoc, setNcaDoc] = useState('');
  const [ncaStatus, setNcaStatus] = useState<VerificationBadgeStatus>('Verificado por el analista');
  const [ncaObs, setNcaObs] = useState('');

  // Obligation form state
  const [obTermType, setObTermType] = useState<'corriente' | 'no_corriente'>('corriente');
  const [obSubCat, setObSubCat] = useState<LiabilitySubCategory>('Préstamos de corto plazo');
  const [obEntity, setObEntity] = useState('');
  const [obBalance, setObBalance] = useState<number>(0);
  const [obInstallment, setObInstallment] = useState<number>(0);
  const [obPendingCount, setObPendingCount] = useState<number>(6);
  const [obDueDate, setObDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [obObs, setObObs] = useState('');

  // Equity Custom Account state
  const [eqName, setEqName] = useState('');
  const [eqAmount, setEqAmount] = useState<number>(0);
  const [eqObs, setEqObs] = useState('');

  // Observation state
  const [obsSection, setObsSection] = useState('Balance General');
  const [obsNote, setObsNote] = useState('');

  // Hydrate when switching dossier or when inventory changes externally
  const liveInventoryTotal = useMemo(
    () => calculateInventoryTotalValue(dossier.inventory || []),
    [dossier.inventory]
  );
  const inventoryMeta = useMemo(() => hydrateInventoryMeta(dossier), [dossier]);

  useEffect(() => {
    setDetail(hydrateBalanceSheetDetail(dossier));
    setObligations(hydrateBalanceObligations(dossier));
    setViewingSnapshot(null);
  }, [dossier.id, liveInventoryTotal]);

  const activeCurrentAssets = viewingSnapshot ? viewingSnapshot.currentAssets : detail.currentAssets;
  const activeNonCurrentAssets = viewingSnapshot ? viewingSnapshot.nonCurrentAssets : detail.nonCurrentAssets;
  const activeObligations = viewingSnapshot ? viewingSnapshot.obligations : obligations;
  const activeEquity = viewingSnapshot ? viewingSnapshot.equityBreakdown : detail.equityBreakdown;
  const activeObservations = viewingSnapshot ? viewingSnapshot.observations : detail.observations;

  const summary = useMemo(
    () =>
      computeHierarchicalBalanceSummary(
        activeCurrentAssets,
        activeNonCurrentAssets,
        activeObligations,
        activeEquity
      ),
    [activeCurrentAssets, activeNonCurrentAssets, activeObligations, activeEquity]
  );

  const inventoryMismatch =
    inventoryMeta.declaredTotalValue !== undefined &&
    inventoryMeta.declaredTotalValue > 0 &&
    Math.abs(liveInventoryTotal - inventoryMeta.declaredTotalValue) > 0.01;

  const notify = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const sectionFocusClass = (sectionId: string) =>
    activeSubSection === sectionId ? 'border-[#004481] ring-2 ring-[#004481]/15' : 'border-[#E2E6EC]';

  // Handlers for Current Assets
  const openAddCurrentAssetModal = () => {
    setEditingCA(null);
    setCaCategory('Otros activos corrientes');
    setCaName('');
    setCaDesc('');
    setCaAmount(0);
    setCaDate(detail.balanceDate || new Date().toISOString().split('T')[0]);
    setCaDoc('');
    setCaStatus('Declarado por el solicitante');
    setCaObs('');
    setCaDuplicateWarn(false);
    setCaModalOpen(true);
  };

  const openEditCurrentAssetModal = (item: CurrentAssetAccountItem) => {
    setEditingCA(item);
    setCaCategory(item.category);
    setCaName(item.name);
    setCaDesc(item.description);
    setCaAmount(item.amount);
    setCaDate(item.recordedDate);
    setCaDoc(item.supportDocument || '');
    setCaStatus(item.verificationStatus);
    setCaObs(item.observations || '');
    setCaDuplicateWarn(false);
    setCaModalOpen(true);
  };

  const handleSaveCurrentAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (caAmount < 0 || Number.isNaN(caAmount)) {
      notify('No se permiten valores monetarios negativos.', 'error');
      return;
    }
    const lowerName = caName.toLowerCase();
    const looksLikeInventoryDup =
      !editingCA &&
      (lowerName.includes('inventario') || lowerName.includes('mercader')) &&
      !caDuplicateWarn;
    if (looksLikeInventoryDup) {
      setCaDuplicateWarn(true);
      return;
    }

    if (editingCA) {
      setDetail((prev) => ({
        ...prev,
        currentAssets: prev.currentAssets.map((ca) =>
          ca.id === editingCA.id
            ? {
                ...ca,
                name: caName.trim() || ca.name,
                description: caDesc.trim(),
                amount: ca.isInventoryLinked ? ca.amount : Math.max(0, Number(caAmount)),
                recordedDate: caDate,
                supportDocument: caDoc.trim(),
                verificationStatus: caStatus,
                observations: caObs.trim() || undefined
              }
            : ca
        )
      }));
      notify(`Cuenta "${caName.trim() || editingCA.name}" actualizada.`);
    } else {
      const newCA: CurrentAssetAccountItem = {
        id: `ca-custom-${Date.now()}`,
        category: caCategory,
        name: caName.trim() || caCategory,
        description: caDesc.trim(),
        amount: Math.max(0, Number(caAmount)),
        recordedDate: caDate,
        supportDocument: caDoc.trim(),
        verificationStatus: caStatus,
        observations: caObs.trim() || undefined,
        isCustom: true
      };
      setDetail((prev) => ({ ...prev, currentAssets: [...prev.currentAssets, newCA] }));
      notify(`Cuenta "${newCA.name}" agregada al Activo Corriente.`);
    }
    setCaModalOpen(false);
  };

  const handleInlineCAValue = (id: string, val: string) => {
    const num = Number(val);
    if (Number.isNaN(num) || num < 0) return;
    setDetail((prev) => ({
      ...prev,
      currentAssets: prev.currentAssets.map((ca) =>
        ca.id === id && !ca.isInventoryLinked ? { ...ca, amount: num } : ca
      )
    }));
  };

  // Handlers for Fixed Assets
  const openAddFixedAssetModal = (defaultCat: FixedAssetCategory = 'Maquinaria y equipos') => {
    setEditingNCA(null);
    setNcaCategory(defaultCat);
    setNcaName('');
    setNcaDesc('');
    setNcaDate(detail.balanceDate || new Date().toISOString().split('T')[0]);
    setNcaValue(0);
    setNcaLocation(dossier.business.businessAddress);
    setNcaDoc('');
    setNcaStatus('Verificado por el analista');
    setNcaObs('');
    setNcaModalOpen(true);
  };

  const openEditFixedAssetModal = (item: FixedAssetItem) => {
    setEditingNCA(item);
    setNcaCategory(item.category);
    setNcaName(item.name);
    setNcaDesc(item.description);
    setNcaDate(item.acquisitionDate);
    setNcaValue(item.estimatedValue);
    setNcaLocation(item.location);
    setNcaDoc(item.supportDocument);
    setNcaStatus(item.verificationStatus);
    setNcaObs(item.observations || '');
    setNcaModalOpen(true);
  };

  const handleSaveFixedAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (ncaValue < 0 || Number.isNaN(ncaValue)) {
      notify('No se permiten valores estimados negativos.', 'error');
      return;
    }
    if (editingNCA) {
      setDetail((prev) => ({
        ...prev,
        nonCurrentAssets: prev.nonCurrentAssets.map((a) =>
          a.id === editingNCA.id
            ? {
                ...a,
                category: ncaCategory,
                name: ncaName.trim() || ncaCategory,
                description: ncaDesc.trim(),
                acquisitionDate: ncaDate,
                estimatedValue: Math.max(0, Number(ncaValue)),
                location: ncaLocation.trim(),
                supportDocument: ncaDoc.trim(),
                verificationStatus: ncaStatus,
                observations: ncaObs.trim() || undefined
              }
            : a
        )
      }));
      notify(`Activo "${ncaName.trim() || editingNCA.name}" actualizado.`);
    } else {
      const newNCA: FixedAssetItem = {
        id: `nca-${Date.now()}`,
        category: ncaCategory,
        name: ncaName.trim() || ncaCategory,
        description: ncaDesc.trim(),
        acquisitionDate: ncaDate,
        estimatedValue: Math.max(0, Number(ncaValue)),
        location: ncaLocation.trim(),
        supportDocument: ncaDoc.trim() || 'Verificación física',
        verificationStatus: ncaStatus,
        observations: ncaObs.trim() || undefined,
        isCustom: true
      };
      setDetail((prev) => ({ ...prev, nonCurrentAssets: [...prev.nonCurrentAssets, newNCA] }));
      notify(`Activo "${newNCA.name}" agregado al Activo No Corriente.`);
    }
    setNcaModalOpen(false);
  };

  // Handlers for Liabilities
  const openAddObligationModal = (term: 'corriente' | 'no_corriente') => {
    setEditingOb(null);
    setObTermType(term);
    setObSubCat(term === 'corriente' ? 'Préstamos de corto plazo' : 'Préstamos de largo plazo');
    setObEntity('');
    setObBalance(0);
    setObInstallment(0);
    setObPendingCount(term === 'corriente' ? 6 : 24);
    setObDueDate(new Date().toISOString().split('T')[0]);
    setObObs('');
    setObModalOpen(true);
  };

  const openEditObligationModal = (ob: FinancialObligation) => {
    setEditingOb(ob);
    const term = ob.termType || ((ob.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente');
    setObTermType(term);
    setObSubCat(ob.subCategory || (term === 'corriente' ? 'Préstamos de corto plazo' : 'Préstamos de largo plazo'));
    setObEntity(ob.entityName);
    setObBalance(ob.currentBalance);
    setObInstallment(ob.monthlyInstallment);
    setObPendingCount(ob.pendingInstallments);
    setObDueDate(ob.dueDate);
    setObObs(ob.observations || '');
    setObModalOpen(true);
  };

  const handleSaveObligationModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obEntity.trim()) return;
    if (obBalance < 0 || obInstallment < 0 || obPendingCount < 0) {
      notify('Los montos y cuotas no pueden ser negativos.', 'error');
      return;
    }
    if (editingOb) {
      setObligations((prev) =>
        prev.map((o) =>
          o.id === editingOb.id
            ? {
                ...o,
                entityName: obEntity.trim(),
                termType: obTermType,
                subCategory: obSubCat,
                creditType: obSubCat,
                currentBalance: Math.max(0, Number(obBalance)),
                monthlyInstallment: Math.max(0, Number(obInstallment)),
                pendingInstallments: Math.max(0, Number(obPendingCount)),
                dueDate: obDueDate,
                observations: obObs.trim() || undefined
              }
            : o
        )
      );
      notify(`Obligación con "${obEntity.trim()}" actualizada.`);
    } else {
      const newOb: FinancialObligation = {
        id: `obl-bs-${Date.now()}`,
        entityName: obEntity.trim(),
        creditType: obSubCat,
        termType: obTermType,
        subCategory: obSubCat,
        originalAmount: Math.max(0, Number(obBalance)),
        currentBalance: Math.max(0, Number(obBalance)),
        monthlyInstallment: Math.max(0, Number(obInstallment)),
        totalInstallments: Math.max(1, Number(obPendingCount)),
        paidInstallments: 0,
        pendingInstallments: Math.max(0, Number(obPendingCount)),
        dueDate: obDueDate,
        status: 'Al día',
        observations: obObs.trim() || undefined
      };
      setObligations((prev) => [...prev, newOb]);
      notify(`Obligación agregada al ${obTermType === 'corriente' ? 'Pasivo Corriente' : 'Pasivo No Corriente'}.`);
    }
    setObModalOpen(false);
  };

  // Handler for Custom Equity Account
  const handleAddEquityAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) return;
    const item: EquityAccountItem = {
      id: `eq-${Date.now()}`,
      name: eqName.trim(),
      amount: Number(eqAmount) || 0,
      observations: eqObs.trim() || undefined
    };
    setDetail((prev) => ({
      ...prev,
      equityBreakdown: {
        ...prev.equityBreakdown,
        otherEquityAccounts: [...prev.equityBreakdown.otherEquityAccounts, item]
      }
    }));
    setEqName('');
    setEqAmount(0);
    setEqObs('');
    setEqModalOpen(false);
    notify(`Cuenta patrimonial "${item.name}" agregada.`);
  };

  // Handler for Observations
  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsNote.trim()) return;
    const item: BalanceObservationItem = {
      id: `bobs-${Date.now()}`,
      date: new Date().toLocaleString('sv-SE').replace('T', ' '),
      author: currentUser?.name || 'Analista',
      section: obsSection,
      note: obsNote.trim()
    };
    setDetail((prev) => ({ ...prev, observations: [item, ...prev.observations] }));
    setObsNote('');
    setObsModalOpen(false);
    notify('Observación registrada en el Balance General.');
  };

  // Confirm Deletion
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === 'ca') {
      setDetail((prev) => ({
        ...prev,
        currentAssets: prev.currentAssets.filter((a) => a.id !== deleteTarget.id)
      }));
    } else if (deleteTarget.kind === 'nca') {
      setDetail((prev) => ({
        ...prev,
        nonCurrentAssets: prev.nonCurrentAssets.filter((a) => a.id !== deleteTarget.id)
      }));
    } else if (deleteTarget.kind === 'ob') {
      setObligations((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    } else if (deleteTarget.kind === 'eq') {
      setDetail((prev) => ({
        ...prev,
        equityBreakdown: {
          ...prev.equityBreakdown,
          otherEquityAccounts: prev.equityBreakdown.otherEquityAccounts.filter((e) => e.id !== deleteTarget.id)
        }
      }));
    }
    notify(`"${deleteTarget.label}" eliminado del Balance General.`);
    setDeleteTarget(null);
  };

  // Global Save Actions
  const handleSave = (opts: { isDraft?: boolean; saveSnapshot?: boolean; goNext?: boolean } = {}) => {
    const updatedDetail: BalanceSheetDetail = {
      ...detail,
      isDraft: Boolean(opts.isDraft)
    };
    setDetail(updatedDetail);
    saveHierarchicalBalance(dossier.id, updatedDetail, obligations, Boolean(opts.saveSnapshot));
    if (opts.goNext && onNextStep) {
      onNextStep();
    } else if (opts.isDraft) {
      notify('Borrador guardado correctamente (permite continuar editando luego).');
    } else if (opts.saveSnapshot) {
      notify('Período de Balance General guardado en el historial.');
    } else {
      notify('Balance General guardado y actualizado en el expediente.');
    }
  };

  const handleCancelChanges = () => {
    setDetail(hydrateBalanceSheetDetail(dossier));
    setObligations(hydrateBalanceObligations(dossier));
    setViewingSnapshot(null);
    notify('Cambios no guardados descartados.');
  };

  const handleExportExcel = () => {
    const rows: string[][] = [
      ['EVALÚA PERÚ - BALANCE GENERAL', dossier.code],
      ['Negocio', dossier.business.businessName],
      ['Solicitante', dossier.personal.fullName],
      ['Documento', `${dossier.personal.documentType} ${dossier.personal.documentNumber}`],
      ['Fecha Balance', detail.balanceDate, 'Período', detail.evaluationPeriod],
      [],
      ['SECCIÓN', 'CATEGORÍA / CUENTA', 'DESCRIPCIÓN', 'VALOR (S/)', 'ESTADO']
    ];
    activeCurrentAssets.forEach((a) =>
      rows.push(['ACTIVO CORRIENTE', a.category, a.name, a.amount.toFixed(2), a.verificationStatus])
    );
    rows.push(['SUBTOTAL ACTIVO CORRIENTE', '', '', summary.totalCurrentAssets.toFixed(2), '']);
    activeNonCurrentAssets.forEach((a) =>
      rows.push(['ACTIVO NO CORRIENTE', a.category, a.name, a.estimatedValue.toFixed(2), a.verificationStatus])
    );
    rows.push(['SUBTOTAL ACTIVO NO CORRIENTE', '', '', summary.totalNonCurrentAssets.toFixed(2), '']);
    rows.push(['TOTAL ACTIVO', '', '', summary.totalAssets.toFixed(2), '']);
    rows.push([]);
    activeObligations.forEach((o) =>
      rows.push([
        o.termType === 'no_corriente' ? 'PASIVO NO CORRIENTE' : 'PASIVO CORRIENTE',
        o.subCategory || o.creditType,
        `${o.entityName} (Cuota S/ ${o.monthlyInstallment.toFixed(2)})`,
        o.currentBalance.toFixed(2),
        o.status
      ])
    );
    rows.push(['TOTAL PASIVO', '', '', summary.totalLiabilities.toFixed(2), '']);
    rows.push(['PATRIMONIO (CUENTAS)', 'Capital + Resultados', '', summary.declaredEquity.toFixed(2), '']);
    rows.push(['TOTAL PASIVO + PATRIMONIO', '', '', summary.totalLiabilitiesAndEquity.toFixed(2), '']);
    rows.push(['DIFERENCIA CONTABLE', '', '', summary.difference.toFixed(2), summary.hasDiscrepancy ? 'DESCUADRE' : 'CUADRADO']);

    const csv = '\uFEFF' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance_general_${dossier.code}_${detail.evaluationPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Balance General exportado para Excel (.csv).');
  };

  const currentLiabilitiesList = activeObligations.filter(
    (o) => (o.termType || ((o.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente')) === 'corriente' && o.status !== 'Cancelado'
  );
  const nonCurrentLiabilitiesList = activeObligations.filter(
    (o) => (o.termType || ((o.pendingInstallments || 0) <= 12 ? 'corriente' : 'no_corriente')) === 'no_corriente' && o.status !== 'Cancelado'
  );

  const inputClass =
    'w-full px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-medium text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/15 transition-colors';
  const numInputClass =
    'w-full px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-mono font-semibold text-[#121212] text-right tabular-nums focus:outline-none focus:bg-white focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/15 transition-colors';

  return (
    <div className="space-y-5">
      {/* Consulting Historical Period Banner */}
      {viewingSnapshot && (
        <div className="p-4 rounded-md bg-[#FFFBEB] border border-[#FDE68A] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#B45309]">
            <Clock className="w-4 h-4 text-[#B45309] shrink-0" />
            <span>
              Consultando período guardado: <strong>{viewingSnapshot.evaluationPeriod}</strong> ({viewingSnapshot.balanceDate}) · Guardado el {viewingSnapshot.savedAt} por {viewingSnapshot.savedBy} (Solo lectura).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setViewingSnapshot(null)}
            className="px-3.5 py-1.5 rounded-md bg-white border border-[#FDE68A] text-[#B45309] font-semibold hover:bg-[#FEF3C7] cursor-pointer"
          >
            Volver al período actual editable
          </button>
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-md border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.type === 'error'
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#C81E1E]'
              : feedback.type === 'warning'
              ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
              : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#028448]'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* A. INFORMACIÓN GENERAL DEL BALANCE */}
      <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E2E6EC] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#F0F5FA] border border-[#B8D0E6] text-[#004481] flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#121212]">
                A. Información General del Balance General
              </h2>
              <p className="text-xs text-[#5B6573]">
                Estado de situación financiera expresado en Soles (S/) · Expediente {dossier.code}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(dossier.balanceSnapshots || []).length > 0 && (
              <select
                value={viewingSnapshot?.id || 'current'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'current') setViewingSnapshot(null);
                  else {
                    const found = (dossier.balanceSnapshots || []).find((s) => s.id === val) || null;
                    setViewingSnapshot(found);
                  }
                }}
                aria-label="Consultar período anterior"
                className="px-3 py-1.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-semibold text-[#121212] cursor-pointer"
              >
                <option value="current">Período actual ({detail.evaluationPeriod})</option>
                {(dossier.balanceSnapshots || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    Histórico: {s.evaluationPeriod} ({s.balanceDate})
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              className="px-3 py-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#004481]" />
              <span>Ver historial</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC]">
            <span className="text-[11px] text-[#5B6573] block">Razón social / Negocio</span>
            <strong className="text-[#121212] font-semibold block truncate">{dossier.business.businessName}</strong>
          </div>
          <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC]">
            <span className="text-[11px] text-[#5B6573] block">Solicitante</span>
            <strong className="text-[#121212] font-semibold block truncate">{dossier.personal.fullName}</strong>
          </div>
          <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC]">
            <span className="text-[11px] text-[#5B6573] block">Documento (DNI / RUC)</span>
            <strong className="text-[#121212] font-mono font-semibold block">
              {dossier.personal.documentType} {dossier.personal.documentNumber}
            </strong>
          </div>
          <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC]">
            <span className="text-[11px] text-[#5B6573] block">Actividad económica</span>
            <strong className="text-[#121212] font-semibold block truncate">{dossier.business.activityType}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div>
            <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Fecha de elaboración</label>
            <input
              type="date"
              disabled={Boolean(viewingSnapshot)}
              value={viewingSnapshot ? viewingSnapshot.balanceDate : detail.balanceDate}
              onChange={(e) => setDetail((prev) => ({ ...prev, balanceDate: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Período de evaluación</label>
            <input
              type="month"
              disabled={Boolean(viewingSnapshot)}
              value={viewingSnapshot ? viewingSnapshot.evaluationPeriod : detail.evaluationPeriod}
              onChange={(e) => setDetail((prev) => ({ ...prev, evaluationPeriod: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Moneda del estado</label>
            <input type="text" readOnly value="Soles Peruanos (S/)" className={`${inputClass} text-[#4A5568]`} />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              disabled={Boolean(viewingSnapshot)}
              onClick={() => handleSave({ saveSnapshot: true })}
              className="w-full py-2 px-3 rounded-md bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#028448] text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Registrar cierre del período</span>
            </button>
          </div>
        </div>
      </div>

      {/* E. ACCOUNTING EQUATION SUMMARY & DISCREPANCY ALERT */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#F0F5FA] p-4 rounded-lg border border-[#B8D0E6]">
          <span className="text-[11px] font-semibold text-[#004481] block">TOTAL ACTIVO</span>
          <strong className="text-xl sm:text-2xl font-semibold text-[#004481] font-mono tabular-nums mt-0.5 block">
            S/ {summary.totalAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </strong>
          <span className="text-[11px] text-[#4A5568] mt-1 block tabular-nums">
            Corr: S/ {summary.totalCurrentAssets.toLocaleString('es-PE')} · No Corr: S/ {summary.totalNonCurrentAssets.toLocaleString('es-PE')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
          <span className="text-[11px] font-semibold text-[#5B6573] block">TOTAL PASIVO</span>
          <strong className="text-xl sm:text-2xl font-semibold text-[#B45309] font-mono tabular-nums mt-0.5 block">
            S/ {summary.totalLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </strong>
          <span className="text-[11px] text-[#5B6573] mt-1 block tabular-nums">
            Corr: S/ {summary.totalCurrentLiabilities.toLocaleString('es-PE')} · No Corr: S/ {summary.totalNonCurrentLiabilities.toLocaleString('es-PE')}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
          <span className="text-[11px] font-semibold text-[#028448] block">PATRIMONIO (ACTIVO - PASIVO)</span>
          <strong className="text-xl sm:text-2xl font-semibold text-[#028448] font-mono tabular-nums mt-0.5 block">
            S/ {summary.computedEquity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </strong>
          <span className="text-[11px] text-[#5B6573] mt-1 block tabular-nums">
            Cuentas declaradas: S/ {summary.declaredEquity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-[#E2E6EC]">
          <span className="text-[11px] font-semibold text-[#121212] block">TOTAL PASIVO + PATRIMONIO</span>
          <strong className="text-xl sm:text-2xl font-semibold text-[#121212] font-mono tabular-nums mt-0.5 block">
            S/ {summary.totalLiabilitiesAndEquity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </strong>
          <span className="text-[11px] text-[#5B6573] mt-1 block">
            Pasivo + Cuentas de Patrimonio
          </span>
        </div>

        <div
          className={`p-4 rounded-lg border col-span-2 lg:col-span-1 ${
            summary.hasDiscrepancy
              ? 'bg-[#FEF2F2] border-[#FECACA]'
              : 'bg-[#ECFDF5] border-[#A7F3D0]'
          }`}
        >
          <span className={`text-[11px] font-semibold block ${summary.hasDiscrepancy ? 'text-[#C81E1E]' : 'text-[#028448]'}`}>
            DIFERENCIA CONTABLE
          </span>
          <strong
            className={`text-xl sm:text-2xl font-semibold font-mono tabular-nums mt-0.5 block ${
              summary.hasDiscrepancy ? 'text-[#C81E1E]' : 'text-[#028448]'
            }`}
          >
            S/ {summary.difference.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </strong>
          <span className={`text-[11px] font-medium mt-1 block ${summary.hasDiscrepancy ? 'text-[#C81E1E]' : 'text-[#028448]'}`}>
            {summary.hasDiscrepancy ? 'Descuadre sin alterar cifras' : 'Ecuación cuadrada'}
          </span>
        </div>
      </div>

      {summary.hasDiscrepancy && (
        <div className="p-4 rounded-md bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#C81E1E]">
          <AlertTriangle className="w-4 h-4 text-[#C81E1E] shrink-0 mt-0.5" />
          <div>
            <strong className="block text-[#C81E1E]">
              Alerta contable: existe una diferencia de S/ {summary.difference.toLocaleString('es-PE', { minimumFractionDigits: 2 })} entre Total Activo y Total Pasivo + Patrimonio.
            </strong>
            <span>
              Revise las cuentas de Activo, Pasivo o Patrimonio registradas. Por integridad financiera, EVALÚA no modifica ni inventa cifras automáticamente para forzar que el balance cuadre.
            </span>
          </div>
        </div>
      )}

      {/* HIERARCHICAL STATEMENT GRID: ACTIVO (LEFT) & PASIVO + PATRIMONIO (RIGHT) */}
      <div id="ef-balance" className="grid grid-cols-1 xl:grid-cols-2 gap-5 scroll-mt-20">
        {/* LEFT COLUMN: B. ACTIVO */}
        <div id="pat-bienes" className={`space-y-5 scroll-mt-20`}>
          {/* B.1 ACTIVO CORRIENTE */}
          <div className={`bg-white rounded-lg border p-5 space-y-4 ${sectionFocusClass('ef-balance')}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6EC] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#004481] uppercase tracking-wide">
                  B.1 Activo Corriente
                </h3>
                <p className="text-[11px] text-[#5B6573]">
                  Caja, bancos, cuentas por cobrar, inventarios sincronizados y otros activos líquidos
                </p>
              </div>
              <strong className="text-base font-semibold text-[#004481] font-mono tabular-nums">
                S/ {summary.totalCurrentAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>

            {inventoryMismatch && (
              <div className="p-3 rounded-md bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#B45309] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <span>
                  En Inventario existe diferencia entre lo declarado (S/{' '}
                  <strong className="font-mono">{Number(inventoryMeta.declaredTotalValue).toFixed(2)}</strong>) y lo
                  valorizado en detalle (S/ <strong className="font-mono">{liveInventoryTotal.toFixed(2)}</strong>).
                </span>
              </div>
            )}

            <div className="divide-y divide-[#E2E6EC]">
              {activeCurrentAssets.map((acc) => {
                const badge = getVerificationBadge(acc.verificationStatus);
                return (
                  <div key={acc.id} className="py-3 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-xs text-[#121212]">{acc.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.cls}`}>
                            {badge.label}
                          </span>
                          {acc.isInventoryLinked && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F5FA] text-[#004481] border border-[#B8D0E6] inline-flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              Sincronizado con Inventario
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#5B6573] mt-0.5">
                          {acc.description || acc.category} · Doc: {acc.supportDocument || 'Sin documento'} · {acc.recordedDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {acc.isInventoryLinked ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-md bg-[#F0F5FA] border border-[#B8D0E6] font-mono font-semibold text-xs text-[#004481] tabular-nums">
                              S/ {acc.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                              type="button"
                              onClick={onNavigateToInventory}
                              className="px-2.5 py-1.5 rounded-md bg-white border border-[#CBD5E1] hover:bg-[#F7F8FA] text-[#004481] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Editar inventario</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="relative w-32">
                              <span className="text-[11px] font-semibold text-[#5B6573] absolute left-2.5 top-1/2 -translate-y-1/2">
                                S/
                              </span>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                disabled={Boolean(viewingSnapshot)}
                                value={acc.amount}
                                onChange={(e) => handleInlineCAValue(acc.id, e.target.value)}
                                className="w-full pl-7 pr-2.5 py-1.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-right font-mono font-semibold text-xs text-[#121212] tabular-nums focus:outline-none focus:bg-white focus:border-[#004481]"
                              />
                            </div>
                            {!viewingSnapshot && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditCurrentAssetModal(acc)}
                                  className="p-1.5 rounded-md text-[#5B6573] hover:text-[#004481] hover:bg-[#F0F5FA] cursor-pointer"
                                  title="Editar detalle y documento sustentatorio"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {acc.isCustom && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget({ kind: 'ca', id: acc.id, label: acc.name })
                                    }
                                    className="p-1.5 rounded-md text-[#5B6573] hover:text-[#C81E1E] hover:bg-[#FEF2F2] cursor-pointer"
                                    title="Eliminar cuenta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {acc.observations && (
                      <p className="text-[11px] text-[#5B6573] italic">Obs.: {acc.observations}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {!viewingSnapshot && (
              <div className="pt-2 border-t border-[#E2E6EC]">
                <button
                  type="button"
                  onClick={openAddCurrentAssetModal}
                  className="px-3.5 py-2 rounded-md border border-[#B8D0E6] bg-[#F0F5FA] hover:bg-[#E1ECF7] text-[#004481] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar nueva cuenta</span>
                </button>
              </div>
            )}
          </div>

          {/* B.2 ACTIVO NO CORRIENTE */}
          <div className={`bg-white rounded-lg border p-5 space-y-4 ${sectionFocusClass('pat-bienes')}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6EC] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#004481] uppercase tracking-wide">
                  B.2 Activo No Corriente (Activos Fijos)
                </h3>
                <p className="text-[11px] text-[#5B6573]">
                  Terrenos, edificaciones, maquinaria, muebles, vehículos y equipos informáticos
                </p>
              </div>
              <strong className="text-base font-semibold text-[#004481] font-mono tabular-nums">
                S/ {summary.totalNonCurrentAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>

            {activeNonCurrentAssets.length === 0 ? (
              <p className="text-xs text-[#5B6573] py-5 text-center">
                No hay bienes fijos registrados en el Activo No Corriente.
              </p>
            ) : (
              <div className="divide-y divide-[#E2E6EC]">
                {activeNonCurrentAssets.map((asset) => {
                  const badge = getVerificationBadge(asset.verificationStatus);
                  return (
                    <div key={asset.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-xs text-[#121212]">{asset.name}</span>
                          <span className="text-[11px] text-[#5B6573]">({asset.category})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5B6573] mt-0.5">
                          {asset.description} · Ubicación: {asset.location || 'Local principal'} · Adq: {asset.acquisitionDate} · Doc: {asset.supportDocument}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-semibold text-xs text-[#121212] tabular-nums">
                          S/ {asset.estimatedValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                        {!viewingSnapshot && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditFixedAssetModal(asset)}
                              className="p-1.5 rounded-md text-[#5B6573] hover:text-[#004481] hover:bg-[#F0F5FA] cursor-pointer"
                              title="Editar bien"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({ kind: 'nca', id: asset.id, label: asset.name })
                              }
                              className="p-1.5 rounded-md text-[#5B6573] hover:text-[#C81E1E] hover:bg-[#FEF2F2] cursor-pointer"
                              title="Eliminar bien"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!viewingSnapshot && (
              <div className="pt-2 border-t border-[#E2E6EC] flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openAddFixedAssetModal('Maquinaria y equipos')}
                  className="px-3.5 py-2 rounded-md border border-[#B8D0E6] bg-[#F0F5FA] hover:bg-[#E1ECF7] text-[#004481] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar otro activo</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAddFixedAssetModal('Muebles y enseres')}
                  className="px-3.5 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1464A5]" />
                  <span>+ Agregar otro bien</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: C. PASIVO & D. PATRIMONIO */}
        <div className="space-y-5">
          {/* C.1 PASIVO CORRIENTE */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6EC] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#B45309] uppercase tracking-wide">
                  C.1 Pasivo Corriente (Corto Plazo)
                </h3>
                <p className="text-[11px] text-[#5B6573]">
                  Suma de <strong>saldos pendientes</strong> (la cuota mensual solo es referencial y no se suma al saldo)
                </p>
              </div>
              <strong className="text-base font-semibold text-[#B45309] font-mono tabular-nums">
                S/ {summary.totalCurrentLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>

            {currentLiabilitiesList.length === 0 ? (
              <p className="text-xs text-[#5B6573] py-4 text-center">Sin obligaciones de corto plazo registradas.</p>
            ) : (
              <div className="divide-y divide-[#E2E6EC]">
                {currentLiabilitiesList.map((ob) => (
                  <div key={ob.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs text-[#121212]">{ob.entityName}</span>
                        <span className="text-[11px] text-[#5B6573]">· {ob.subCategory || ob.creditType}</span>
                      </div>
                      <p className="text-[11px] text-[#5B6573] mt-0.5 tabular-nums">
                        Cuota mensual: <strong>S/ {ob.monthlyInstallment.toFixed(2)}</strong> · {ob.pendingInstallments} cuota(s) pend. · Vence: {ob.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#5B6573] block">Saldo pendiente</span>
                        <span className="font-mono font-semibold text-xs text-[#B45309] tabular-nums">
                          S/ {ob.currentBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {!viewingSnapshot && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditObligationModal(ob)}
                            className="p-1.5 rounded-md text-[#5B6573] hover:text-[#004481] hover:bg-[#F0F5FA] cursor-pointer"
                            title="Editar obligación"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: 'ob', id: ob.id, label: ob.entityName })}
                            className="p-1.5 rounded-md text-[#5B6573] hover:text-[#C81E1E] hover:bg-[#FEF2F2] cursor-pointer"
                            title="Eliminar obligación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!viewingSnapshot && (
              <div className="pt-2 border-t border-[#E2E6EC]">
                <button
                  type="button"
                  onClick={() => openAddObligationModal('corriente')}
                  className="px-3.5 py-2 rounded-md border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar otra obligación</span>
                </button>
              </div>
            )}
          </div>

          {/* C.2 PASIVO NO CORRIENTE */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6EC] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#B45309] uppercase tracking-wide">
                  C.2 Pasivo No Corriente (Largo Plazo)
                </h3>
                <p className="text-[11px] text-[#5B6573]">
                  Préstamos de largo plazo, financiamiento de activos y otras obligaciones &gt; 12 meses
                </p>
              </div>
              <strong className="text-base font-semibold text-[#B45309] font-mono tabular-nums">
                S/ {summary.totalNonCurrentLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>

            {nonCurrentLiabilitiesList.length === 0 ? (
              <p className="text-xs text-[#5B6573] py-4 text-center">Sin obligaciones de largo plazo registradas.</p>
            ) : (
              <div className="divide-y divide-[#E2E6EC]">
                {nonCurrentLiabilitiesList.map((ob) => (
                  <div key={ob.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-xs text-[#121212]">{ob.entityName}</span>
                        <span className="text-[11px] text-[#5B6573]">· {ob.subCategory || ob.creditType}</span>
                      </div>
                      <p className="text-[11px] text-[#5B6573] mt-0.5 tabular-nums">
                        Cuota mensual: <strong>S/ {ob.monthlyInstallment.toFixed(2)}</strong> · {ob.pendingInstallments} cuota(s) pend. · Vence: {ob.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#5B6573] block">Saldo pendiente</span>
                        <span className="font-mono font-semibold text-xs text-[#B45309] tabular-nums">
                          S/ {ob.currentBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {!viewingSnapshot && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditObligationModal(ob)}
                            className="p-1.5 rounded-md text-[#5B6573] hover:text-[#004481] hover:bg-[#F0F5FA] cursor-pointer"
                            title="Editar obligación"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ kind: 'ob', id: ob.id, label: ob.entityName })}
                            className="p-1.5 rounded-md text-[#5B6573] hover:text-[#C81E1E] hover:bg-[#FEF2F2] cursor-pointer"
                            title="Eliminar obligación"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!viewingSnapshot && (
              <div className="pt-2 border-t border-[#E2E6EC]">
                <button
                  type="button"
                  onClick={() => openAddObligationModal('no_corriente')}
                  className="px-3.5 py-2 rounded-md border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar otra obligación</span>
                </button>
              </div>
            )}
          </div>

          {/* D. PATRIMONIO */}
          <div id="ef-patrimonio" className={`bg-white rounded-lg border p-5 space-y-4 scroll-mt-20 ${sectionFocusClass('ef-patrimonio')}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E6EC] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#028448] uppercase tracking-wide">
                  D. Patrimonio Neto
                </h3>
                <p className="text-[11px] text-[#5B6573]">
                  Capital aportado, resultados acumulados, resultado del ejercicio y otras cuentas
                </p>
              </div>
              <strong className="text-base font-semibold text-[#028448] font-mono tabular-nums">
                S/ {summary.declaredEquity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Capital aportado (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={Boolean(viewingSnapshot)}
                  value={activeEquity.contributedCapital}
                  onChange={(e) =>
                    setDetail((prev) => ({
                      ...prev,
                      equityBreakdown: { ...prev.equityBreakdown, contributedCapital: Number(e.target.value) || 0 }
                    }))
                  }
                  className={numInputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Resultados acumulados (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={Boolean(viewingSnapshot)}
                  value={activeEquity.retainedEarnings}
                  onChange={(e) =>
                    setDetail((prev) => ({
                      ...prev,
                      equityBreakdown: { ...prev.equityBreakdown, retainedEarnings: Number(e.target.value) || 0 }
                    }))
                  }
                  className={numInputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Resultado del ejercicio (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  disabled={Boolean(viewingSnapshot)}
                  value={activeEquity.periodResult}
                  onChange={(e) =>
                    setDetail((prev) => ({
                      ...prev,
                      equityBreakdown: { ...prev.equityBreakdown, periodResult: Number(e.target.value) || 0 }
                    }))
                  }
                  className={numInputClass}
                />
              </div>
            </div>

            {activeEquity.otherEquityAccounts.length > 0 && (
              <div className="divide-y divide-[#E2E6EC] border-t border-[#E2E6EC] pt-2">
                {activeEquity.otherEquityAccounts.map((eq) => (
                  <div key={eq.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#121212]">{eq.name}</span>
                      {eq.observations && <span className="text-[11px] text-[#5B6573] block">{eq.observations}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#028448] tabular-nums">
                        S/ {eq.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      {!viewingSnapshot && (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ kind: 'eq', id: eq.id, label: eq.name })}
                          className="p-1 text-[#5B6573] hover:text-[#C81E1E] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!viewingSnapshot && (
              <div className="pt-2 border-t border-[#E2E6EC]">
                <button
                  type="button"
                  onClick={() => setEqModalOpen(true)}
                  className="px-3.5 py-2 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#028448] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar nueva cuenta</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ESTADO DE GANANCIAS Y PÉRDIDAS (MENSUAL) + OBSERVACIONES DEL BALANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div
          id="ef-resultados"
          className={`lg:col-span-6 bg-white rounded-lg border p-5 space-y-3 scroll-mt-20 ${sectionFocusClass('ef-resultados')}`}
        >
          <h3 className="text-sm font-semibold text-[#121212] border-b border-[#E2E6EC] pb-2.5">
            Estado de Ganancias y Pérdidas (Mensual calculado)
          </h3>
          <div className="divide-y divide-[#E2E6EC] text-xs">
            <div className="py-2 flex justify-between">
              <span className="font-semibold text-[#4A5568]">(+) Ventas mensuales</span>
              <span className="font-mono font-semibold text-[#121212] tabular-nums">
                S/ {liveIncomeStatement.salesIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#4A5568]">(-) Costo de ventas</span>
              <span className="font-mono font-semibold text-[#C81E1E] tabular-nums">
                - S/ {liveIncomeStatement.costOfSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="py-2 flex justify-between bg-[#F7F8FA] px-2 rounded-md">
              <span className="font-semibold text-[#121212]">(=) Utilidad bruta</span>
              <span className="font-mono font-semibold text-[#004481] tabular-nums">
                S/ {liveIncomeStatement.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#4A5568]">(-) Gastos operativos del negocio</span>
              <span className="font-mono font-semibold text-[#C81E1E] tabular-nums">
                - S/ {liveIncomeStatement.operatingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="py-2 flex justify-between bg-[#F7F8FA] px-2 rounded-md">
              <span className="font-semibold text-[#121212]">(=) Resultado operativo</span>
              <span className="font-mono font-semibold text-[#121212] tabular-nums">
                S/ {liveIncomeStatement.operatingResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-[#4A5568]">(-) Cuotas de créditos existentes</span>
              <span className="font-mono font-semibold text-[#B45309] tabular-nums">
                - S/ {liveIncomeStatement.financialInstallments.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="py-2.5 flex justify-between bg-[#F0F5FA] border border-[#B8D0E6] px-3 rounded-md mt-2">
              <span className="font-semibold text-[#121212]">(=) Excedente disponible mensual</span>
              <span
                className={`font-mono text-sm font-semibold tabular-nums ${
                  liveIncomeStatement.availableResult >= 0 ? 'text-[#028448]' : 'text-[#C81E1E]'
                }`}
              >
                S/ {liveIncomeStatement.availableResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* OBSERVACIONES DEL BALANCE */}
        <div className="lg:col-span-6 bg-white rounded-lg border border-[#E2E6EC] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E6EC] pb-2.5">
            <h3 className="text-sm font-semibold text-[#121212]">Observaciones del Balance General</h3>
            {!viewingSnapshot && (
              <button
                type="button"
                onClick={() => setObsModalOpen(true)}
                className="px-3 py-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#004481]" />
                <span>+ Agregar observación</span>
              </button>
            )}
          </div>

          {activeObservations.length === 0 ? (
            <p className="text-xs text-[#5B6573] py-6 text-center">
              Sin observaciones registradas para este balance. Use &quot;+ Agregar observación&quot; para anotar hallazgos contables o verificaciones pendientes.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeObservations.map((o) => (
                <div key={o.id} className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#5B6573]">
                    <span className="font-semibold text-[#004481]">{o.section}</span>
                    <span className="font-mono">{o.author} · {o.date}</span>
                  </div>
                  <p className="text-[#4A5568]">{o.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white rounded-lg border border-[#E2E6EC] p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {onBackStep && (
            <button
              type="button"
              onClick={onBackStep}
              className="px-3.5 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Regresar</span>
            </button>
          )}
          {!viewingSnapshot && (
            <>
              <button
                type="button"
                onClick={handleCancelChanges}
                className="px-3.5 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#4A5568] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={() => handleSave({ isDraft: true })}
                className="px-3.5 py-2 rounded-md border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] text-xs font-semibold cursor-pointer"
              >
                Guardar borrador
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#004481]" />
            <span>Imprimir / Exportar PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-md border border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#028448] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!viewingSnapshot && (
            <>
              <button
                type="button"
                onClick={() => handleSave({ isDraft: false })}
                className="px-4 py-2 rounded-md border border-[#B8D0E6] bg-[#F0F5FA] hover:bg-[#E1ECF7] text-[#004481] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>
              {onNextStep && (
                <button
                  type="button"
                  onClick={() => handleSave({ isDraft: false, goNext: true })}
                  className="px-5 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Guardar y continuar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL: Add / Edit Current Asset Account */}
      {caModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#072146]/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg border border-[#E2E6EC] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-[#E2E6EC] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#121212]">
                {editingCA ? 'Editar cuenta de Activo Corriente' : 'Agregar cuenta a Activo Corriente'}
              </h3>
              <button onClick={() => setCaModalOpen(false)} className="text-[#5B6573] hover:text-[#121212] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCurrentAsset} className="p-5 space-y-3 text-xs">
              {caDuplicateWarn && (
                <div className="p-3 rounded-md bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] space-y-1">
                  <strong className="block">Advertencia de posible duplicación</strong>
                  <span>
                    La cuenta <strong>Inventarios</strong> ya se alimenta automáticamente desde el módulo de Inventario. Si realmente es otro concepto distinto, vuelva a pulsar Guardar para confirmar.
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Categoría</label>
                  <select
                    value={caCategory}
                    disabled={Boolean(editingCA && !editingCA.isCustom)}
                    onChange={(e) => setCaCategory(e.target.value as CurrentAssetCategory)}
                    className={inputClass}
                  >
                    {CURRENT_ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Nombre de cuenta *</label>
                  <input
                    type="text"
                    required
                    value={caName}
                    onChange={(e) => setCaName(e.target.value)}
                    placeholder="Ej. Cuenta Yape Negocio / Caja Chica"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Valor monetario (S/) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={caAmount}
                    onChange={(e) => setCaAmount(Math.max(0, Number(e.target.value)))}
                    className={numInputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Fecha de registro</label>
                  <input type="date" value={caDate} onChange={(e) => setCaDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Documento sustentatorio</label>
                  <input
                    type="text"
                    value={caDoc}
                    onChange={(e) => setCaDoc(e.target.value)}
                    placeholder="Ej. Voucher, estado de cuenta"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Estado de verificación</label>
                  <select
                    value={caStatus}
                    onChange={(e) => setCaStatus(e.target.value as VerificationBadgeStatus)}
                    className={inputClass}
                  >
                    <option value="Verificado por el analista">Verificado por el analista</option>
                    <option value="Declarado por el solicitante">Declarado por el solicitante</option>
                    <option value="Pendiente de verificación">Pendiente de verificación</option>
                    <option value="Observado">Observado</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Descripción</label>
                  <input type="text" value={caDesc} onChange={(e) => setCaDesc(e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Observaciones</label>
                  <textarea rows={2} value={caObs} onChange={(e) => setCaObs(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E6EC]">
                <button type="button" onClick={() => setCaModalOpen(false)} className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white font-semibold text-[#4A5568] hover:bg-[#F7F8FA] cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-md font-semibold bg-[#004481] hover:bg-[#072146] text-white cursor-pointer">
                  {caDuplicateWarn ? 'Confirmar y guardar' : 'Guardar cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Fixed Asset */}
      {ncaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#072146]/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg border border-[#E2E6EC] shadow-lg overflow-hidden">
            <div className="p-5 border-b border-[#E2E6EC] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#121212]">
                {editingNCA ? 'Editar activo fijo' : 'Agregar bien al Activo No Corriente'}
              </h3>
              <button onClick={() => setNcaModalOpen(false)} className="text-[#5B6573] hover:text-[#121212] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveFixedAsset} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Categoría</label>
                  <select
                    value={ncaCategory}
                    onChange={(e) => setNcaCategory(e.target.value as FixedAssetCategory)}
                    className={inputClass}
                  >
                    {FIXED_ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Nombre del bien / activo *</label>
                  <input
                    type="text"
                    required
                    value={ncaName}
                    onChange={(e) => setNcaName(e.target.value)}
                    placeholder="Ej. Congeladora horizontal 420L"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Valor estimado (S/) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={ncaValue}
                    onChange={(e) => setNcaValue(Math.max(0, Number(e.target.value)))}
                    className={numInputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Fecha de adquisición</label>
                  <input type="date" value={ncaDate} onChange={(e) => setNcaDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Ubicación</label>
                  <input type="text" value={ncaLocation} onChange={(e) => setNcaLocation(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Documento sustentatorio</label>
                  <input
                    type="text"
                    value={ncaDoc}
                    onChange={(e) => setNcaDoc(e.target.value)}
                    placeholder="Boleta, tarjeta propiedad, título..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Estado de verificación</label>
                  <select
                    value={ncaStatus}
                    onChange={(e) => setNcaStatus(e.target.value as VerificationBadgeStatus)}
                    className={inputClass}
                  >
                    <option value="Verificado por el analista">Verificado por el analista</option>
                    <option value="Declarado por el solicitante">Declarado por el solicitante</option>
                    <option value="Pendiente de verificación">Pendiente de verificación</option>
                    <option value="Observado">Observado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#5B6573] mb-1">Descripción</label>
                  <input type="text" value={ncaDesc} onChange={(e) => setNcaDesc(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E6EC]">
                <button type="button" onClick={() => setNcaModalOpen(false)} className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white font-semibold text-[#4A5568] hover:bg-[#F7F8FA] cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-md font-semibold bg-[#004481] hover:bg-[#072146] text-white cursor-pointer">
                  Guardar activo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add / Edit Obligation */}
      {obModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0B2545]">
                {editingOb ? 'Editar obligación financiera' : `Agregar obligación (${obTermType === 'corriente' ? 'Pasivo Corriente' : 'Pasivo No Corriente'})`}
              </h3>
              <button onClick={() => setObModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveObligationModal} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Entidad acreedora *</label>
                  <input
                    type="text"
                    required
                    value={obEntity}
                    onChange={(e) => setObEntity(e.target.value)}
                    placeholder="Ej. Caja Huancayo / Proveedor"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de obligación</label>
                  <select
                    value={obSubCat}
                    onChange={(e) => setObSubCat(e.target.value as LiabilitySubCategory)}
                    className={inputClass}
                  >
                    {(obTermType === 'corriente' ? SHORT_TERM_SUBCATS : LONG_TERM_SUBCATS).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Saldo pendiente total (S/) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={obBalance}
                    onChange={(e) => setObBalance(Math.max(0, Number(e.target.value)))}
                    className={numInputClass}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuota mensual (S/)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={obInstallment}
                    onChange={(e) => setObInstallment(Math.max(0, Number(e.target.value)))}
                    className={numInputClass}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuotas pendientes</label>
                  <input
                    type="number"
                    min={0}
                    value={obPendingCount}
                    onChange={(e) => setObPendingCount(Math.max(0, Number(e.target.value)))}
                    className={numInputClass}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fecha de vencimiento</label>
                  <input type="date" value={obDueDate} onChange={(e) => setObDueDate(e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Observaciones</label>
                  <textarea rows={2} value={obObs} onChange={(e) => setObObs(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setObModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold bg-[#1D63ED] text-white cursor-pointer">
                  Guardar obligación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Custom Equity Account */}
      {eqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddEquityAccount}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-[#0B2545]">Agregar cuenta de Patrimonio</h4>
              <button type="button" onClick={() => setEqModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre de cuenta patrimonial *</label>
              <input
                type="text"
                required
                value={eqName}
                onChange={(e) => setEqName(e.target.value)}
                placeholder="Ej. Reservas legales / Aporte adicional"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Importe (S/)</label>
              <input
                type="number"
                step="0.01"
                value={eqAmount}
                onChange={(e) => setEqAmount(Number(e.target.value) || 0)}
                className={numInputClass}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Observaciones</label>
              <input type="text" value={eqObs} onChange={(e) => setEqObs(e.target.value)} className={inputClass} />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEqModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl font-bold bg-[#16A34A] text-white cursor-pointer">
                Agregar cuenta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add Observation */}
      {obsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddObservation}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-[#0B2545]">Agregar observación al Balance General</h4>
              <button type="button" onClick={() => setObsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sección relacionada</label>
              <select value={obsSection} onChange={(e) => setObsSection(e.target.value)} className={inputClass}>
                <option value="Balance General">Balance General</option>
                <option value="Activo Corriente">Activo Corriente</option>
                <option value="Activo No Corriente">Activo No Corriente</option>
                <option value="Pasivo Corriente">Pasivo Corriente</option>
                <option value="Pasivo No Corriente">Pasivo No Corriente</option>
                <option value="Patrimonio">Patrimonio</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nota técnica *</label>
              <textarea
                rows={3}
                required
                value={obsNote}
                onChange={(e) => setObsNote(e.target.value)}
                placeholder="Detalle de contraste patrimonial, comprobantes pendientes..."
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setObsModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl font-bold bg-[#1D63ED] text-white cursor-pointer">
                Guardar observación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-[#0B2545]">Confirmar eliminación</h4>
            <p className="text-xs text-slate-600">
              ¿Desea eliminar <strong>{deleteTarget.label}</strong> del Balance General? Los totales se recalcularán automáticamente.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Balance History & Audit Log */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0B2545]">
                  Historial de Balances y Modificaciones
                </h3>
                <p className="text-xs text-slate-500">
                  Períodos guardados y bitácora de actualizaciones para {dossier.code}
                </p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-[#0B2545] mb-2">Períodos de Balance General guardados</h4>
                {(dossier.balanceSnapshots || []).length === 0 ? (
                  <p className="text-slate-500 py-4 bg-slate-50 rounded-xl text-center">
                    No hay cierres de período registrados todavía. Use "Registrar cierre del período" para conservar un historial.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(dossier.balanceSnapshots || []).map((s) => (
                      <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <strong className="text-[#0B2545]">Período {s.evaluationPeriod} ({s.balanceDate})</strong>
                          <span className="text-[11px] text-slate-500 block">
                            Por {s.savedBy} · {s.savedAt} · Inventario al corte: S/ {s.inventoryValueAtSnapshot.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-[#1D63ED] block tabular-nums">
                            Activo: S/ {s.totalAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setViewingSnapshot(s);
                              setHistoryModalOpen(false);
                            }}
                            className="text-[11px] font-bold text-[#1D63ED] hover:underline cursor-pointer"
                          >
                            Consultar período
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="font-bold text-[#0B2545] mb-2">Registro reciente de modificaciones</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {auditLogs
                    .filter((l) => !l.targetCode || l.targetCode === dossier.code)
                    .slice(0, 12)
                    .map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 flex items-center justify-between gap-2">
                        <span className="text-slate-700">{log.details}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
