import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  CreditEvaluationDossier,
  InventoryItem,
  InventoryMetadata,
  InventoryValuationSnapshot,
  VerificationBadgeStatus
} from '../types/evalua';
import {
  calculateInventoryTotalValue,
  getSuggestedInventoryCategories,
  hydrateInventoryItems,
  hydrateInventoryMeta
} from '../utils/financialCalculations';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Upload,
  Download,
  Printer,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Paperclip,
  MessageSquarePlus,
  ArrowUpDown,
  Save,
  ArrowRight,
  X,
  FileSpreadsheet,
  Tag
} from 'lucide-react';

interface InventoryModuleProps {
  dossier: CreditEvaluationDossier;
  onNavigateToBalance?: () => void;
}

const DEFAULT_UNITS = ['Unidad', 'Saco 50kg', 'Caja', 'Paquete', 'Kg', 'Litro', 'Docena', 'Metro', 'Lote'];

const STATUS_BADGE_MAP: Record<
  VerificationBadgeStatus,
  { text: string; colorClass: string; icon: React.ComponentType<{ className?: string }> }
> = {
  'Verificado por el analista': {
    text: 'Verificado',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2
  },
  'Declarado por el solicitante': {
    text: 'Declarado',
    colorClass: 'bg-blue-50 text-[#1D63ED] border-blue-200',
    icon: Clock
  },
  'Pendiente de verificación': {
    text: 'Pendiente',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock
  },
  Observado: {
    text: 'Observado',
    colorClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: AlertTriangle
  }
};

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  dossier,
  onNavigateToBalance
}) => {
  const {
    currentUser,
    updateDossierInventory,
    saveInventoryValuation,
    setIsPrintModalOpen
  } = useEvalua();

  const [items, setItems] = useState<InventoryItem[]>(() => hydrateInventoryItems(dossier));
  const [meta, setMeta] = useState<InventoryMetadata>(() => hydrateInventoryMeta(dossier));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Todas');
  const [sortBy, setSortBy] = useState<'default' | 'qty_desc' | 'qty_asc' | 'val_desc' | 'val_asc'>('default');

  // Modals & Interactive States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<InventoryValuationSnapshot | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showObsModal, setShowObsModal] = useState(false);
  const [newObsNote, setNewObsNote] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when switching dossier
  useEffect(() => {
    setItems(hydrateInventoryItems(dossier));
    setMeta(hydrateInventoryMeta(dossier));
    setSelectedCategoryFilter('Todas');
    setSearchQuery('');
  }, [dossier.id]);

  // Product Form State
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUnit, setFormUnit] = useState('Unidad');
  const [formQty, setFormQty] = useState<number>(1);
  const [formUnitCost, setFormUnitCost] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<VerificationBadgeStatus>('Verificado por el analista');
  const [formObs, setFormObs] = useState('');
  const [formAttachments, setFormAttachments] = useState<NonNullable<InventoryItem['attachments']>>([]);

  const availableCategories = useMemo(() => {
    const suggested = getSuggestedInventoryCategories(dossier.business.sector, dossier.business.activityType);
    const custom = meta.customCategories || [];
    const fromItems = items.map((i) => i.category).filter(Boolean) as string[];
    return Array.from(new Set([...suggested, ...custom, ...fromItems]));
  }, [dossier.business.sector, dossier.business.activityType, meta.customCategories, items]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Live totals
  const totalValue = useMemo(() => calculateInventoryTotalValue(items), [items]);
  const totalUnits = useMemo(
    () => items.reduce((s, item) => s + Math.max(0, Number(item.quantity) || 0), 0),
    [items]
  );
  const unverifiedCount = useMemo(
    () => items.filter((i) => i.status === 'Pendiente de verificación' || i.status === 'Observado').length,
    [items]
  );
  const activeCategoriesCount = useMemo(
    () => new Set(items.map((i) => i.category || 'Otros inventarios')).size,
    [items]
  );

  const declaredDiff = useMemo(() => {
    if (meta.declaredTotalValue === undefined || meta.declaredTotalValue === null || meta.declaredTotalValue <= 0) {
      return 0;
    }
    return Number((totalValue - meta.declaredTotalValue).toFixed(2));
  }, [totalValue, meta.declaredTotalValue]);

  const hasDeclaredMismatch =
    meta.declaredTotalValue !== undefined &&
    meta.declaredTotalValue > 0 &&
    Math.abs(declaredDiff) > 0.01;

  // Category distribution chart data
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { category: string; value: number; count: number; units: number }>();
    items.forEach((item) => {
      const cat = item.category || 'Otros inventarios';
      const val = Math.max(0, item.quantity) * Math.max(0, item.unitCost);
      const curr = map.get(cat) || { category: cat, value: 0, count: 0, units: 0 };
      curr.value += val;
      curr.count += 1;
      curr.units += Math.max(0, item.quantity);
      map.set(cat, curr);
    });
    const palette = ['#1D63ED', '#16A34A', '#F59E0B', '#8B5CF6', '#0EA5E9', '#64748B'];
    return Array.from(map.values())
      .sort((a, b) => b.value - a.value)
      .map((entry, idx) => ({
        ...entry,
        percent: totalValue > 0 ? (entry.value / totalValue) * 100 : 0,
        color: palette[idx % palette.length]
      }));
  }, [items, totalValue]);

  // Filtered and sorted products
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesCategory =
        selectedCategoryFilter === 'Todas' || (item.category || 'Otros inventarios') === selectedCategoryFilter;
      const matchesSearch =
        !q ||
        item.productName.toLowerCase().includes(q) ||
        (item.code || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    const sorted = [...filtered];
    if (sortBy === 'qty_desc') sorted.sort((a, b) => b.quantity - a.quantity);
    else if (sortBy === 'qty_asc') sorted.sort((a, b) => a.quantity - b.quantity);
    else if (sortBy === 'val_desc') sorted.sort((a, b) => b.quantity * b.unitCost - a.quantity * a.unitCost);
    else if (sortBy === 'val_asc') sorted.sort((a, b) => a.quantity * a.unitCost - b.quantity * b.unitCost);
    return sorted;
  }, [items, searchQuery, selectedCategoryFilter, sortBy]);

  // Persist changes immediately to context so Balance General updates automatically
  const commitItemsAndMeta = (nextItems: InventoryItem[], nextMeta: InventoryMetadata = meta) => {
    setItems(nextItems);
    setMeta(nextMeta);
    updateDossierInventory(dossier.id, nextItems, nextMeta);
  };

  const openAddProductModal = () => {
    setEditingItem(null);
    setFormCode(`INV-${String(items.length + 1).padStart(3, '0')}`);
    setFormName('');
    setFormCategory(availableCategories[0] || 'Mercadería para la venta');
    setFormDesc('');
    setFormUnit('Unidad');
    setFormQty(1);
    setFormUnitCost(0);
    setFormStatus(meta.verificationStatus || 'Verificado por el analista');
    setFormObs('');
    setFormAttachments([]);
    setProductModalOpen(true);
  };

  const openEditProductModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormCode(item.code || '');
    setFormName(item.productName);
    setFormCategory(item.category || availableCategories[0] || 'Mercadería para la venta');
    setFormDesc(item.description || '');
    setFormUnit(item.unit || 'Unidad');
    setFormQty(item.quantity);
    setFormUnitCost(item.unitCost);
    setFormStatus(item.status || 'Verificado por el analista');
    setFormObs(item.observations || '');
    setFormAttachments(item.attachments || []);
    setProductModalOpen(true);
  };

  const handleSaveProductModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      notify('El nombre del producto es obligatorio.', 'error');
      return;
    }
    if (formQty < 0 || formUnitCost < 0 || Number.isNaN(formQty) || Number.isNaN(formUnitCost)) {
      notify('No se permiten cantidades ni costos unitarios negativos.', 'error');
      return;
    }

    const safeQty = Math.max(0, Number(formQty));
    const safeCost = Math.max(0, Number(formUnitCost));
    const totalCostValue = Number((safeQty * safeCost).toFixed(2));

    if (editingItem) {
      const next = items.map((it) =>
        it.id === editingItem.id
          ? {
              ...it,
              code: formCode.trim() || it.code,
              productName: formName.trim(),
              category: formCategory,
              description: formDesc.trim(),
              unit: formUnit,
              quantity: safeQty,
              unitCost: safeCost,
              totalCostValue,
              status: formStatus,
              observations: formObs.trim() || undefined,
              attachments: formAttachments
            }
          : it
      );
      commitItemsAndMeta(next);
      notify(`Producto "${formName.trim()}" actualizado y sincronizado con Balance General.`);
    } else {
      const newItem: InventoryItem = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        code: formCode.trim() || `INV-${String(items.length + 1).padStart(3, '0')}`,
        productName: formName.trim(),
        category: formCategory,
        description: formDesc.trim(),
        unit: formUnit,
        quantity: safeQty,
        unitCost: safeCost,
        totalCostValue,
        sellingPrice: 0,
        status: formStatus,
        observations: formObs.trim() || undefined,
        attachments: formAttachments
      };
      commitItemsAndMeta([...items, newItem]);
      notify(`Producto "${newItem.productName}" agregado y reflejado en Activo Corriente.`);
    }
    setProductModalOpen(false);
  };

  const handleInlineNumberChange = (itemId: string, field: 'quantity' | 'unitCost', rawValue: string) => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed) || parsed < 0) return;
    const next = items.map((item) => {
      if (item.id !== itemId) return item;
      const qty = field === 'quantity' ? parsed : item.quantity;
      const cost = field === 'unitCost' ? parsed : item.unitCost;
      return {
        ...item,
        [field]: parsed,
        totalCostValue: Number((qty * cost).toFixed(2))
      };
    });
    commitItemsAndMeta(next);
  };

  const handleInlineStatusChange = (itemId: string, status: VerificationBadgeStatus) => {
    const next = items.map((item) => (item.id === itemId ? { ...item, status } : item));
    commitItemsAndMeta(next);
  };

  const handleDuplicateItem = (item: InventoryItem) => {
    const copy: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      code: `${item.code || 'INV'}-C`,
      productName: `${item.productName} (Copia)`
    };
    commitItemsAndMeta([...items, copy]);
    notify(`Se duplicó "${item.productName}".`);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    const target = items.find((i) => i.id === deleteConfirmId);
    const next = items.filter((i) => i.id !== deleteConfirmId);
    commitItemsAndMeta(next);
    setDeleteConfirmId(null);
    notify(`Producto "${target?.productName || ''}" eliminado del inventario.`);
  };

  const handleAttachFileToForm = (file: File | undefined) => {
    if (!file) return;
    const sizeStr =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    setFormAttachments((prev) => [
      ...prev,
      {
        id: `att-${Date.now()}`,
        fileName: file.name,
        fileSize: sizeStr,
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    ]);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    const updatedMeta: InventoryMetadata = {
      ...meta,
      customCategories: Array.from(new Set([...(meta.customCategories || []), trimmed]))
    };
    commitItemsAndMeta(items, updatedMeta);
    setNewCategoryName('');
    setShowAddCategoryModal(false);
    notify(`Categoría "${trimmed}" agregada al inventario.`);
  };

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsNote.trim()) return;
    const entry = {
      id: `obs-inv-${Date.now()}`,
      date: new Date().toLocaleString('sv-SE').replace('T', ' '),
      author: currentUser?.name || 'Analista',
      note: newObsNote.trim()
    };
    const updatedMeta: InventoryMetadata = {
      ...meta,
      observationsLog: [entry, ...(meta.observationsLog || [])]
    };
    commitItemsAndMeta(items, updatedMeta);
    setNewObsNote('');
    setShowObsModal(false);
    notify('Observación registrada en el inventario.');
  };

  const handleSaveValuation = (saveToHistory: boolean) => {
    saveInventoryValuation(dossier.id, items, meta, saveToHistory);
    notify(
      saveToHistory
        ? 'Valoración guardada en historial sin alterar balances de períodos anteriores.'
        : 'Inventario guardado y sincronizado con Balance General.'
    );
  };

  const handleExportExcelCSV = () => {
    const headers = [
      'Código',
      'Producto',
      'Categoría',
      'Descripción',
      'Unidad',
      'Cantidad Disponible',
      'Costo Unitario Adquisición (S/)',
      'Valor Total (S/)',
      'Estado'
    ];
    const rows = items.map((i) => [
      `"${i.code || ''}"`,
      `"${i.productName.replace(/"/g, '""')}"`,
      `"${i.category || ''}"`,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      `"${i.unit || 'Unidad'}"`,
      i.quantity,
      i.unitCost.toFixed(2),
      (i.quantity * i.unitCost).toFixed(2),
      `"${i.status || 'Verificado por el analista'}"`
    ]);
    rows.push(['', '', '', '', '', '', '"TOTAL INVENTARIO (S/)"', totalValue.toFixed(2), '']);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${dossier.code}_${meta.inventoryDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Inventario exportado en formato compatible con Excel (.csv).');
  };

  const handleDownloadTemplateCSV = () => {
    const sample = [
      'Código,Producto,Categoría,Descripción,Unidad,Cantidad,CostoUnitario',
      'INV-010,Arroz Extra 50kg,Mercadería para la venta,Arroz costeño saco,Saco 50kg,10,145.00',
      'INV-011,Aceite Vegetal 1L,Mercadería para la venta,Botella 1 litro,Unidad,40,7.80'
    ].join('\n');
    const blob = new Blob(['\uFEFF' + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_importacion_inventario_evalua.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        notify('El archivo no contiene filas de productos válidas.', 'error');
        return;
      }
      const sep = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
      const imported: InventoryItem[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(sep).map((c) => c.replace(/^"|"$/g, '').trim());
        if (cols.length < 2 || !cols[1]) continue;
        const qty = Math.max(0, Number(cols[5]) || 0);
        const cost = Math.max(0, Number(cols[6]) || 0);
        if (cols[1].toUpperCase().includes('TOTAL INVENTARIO')) continue;
        imported.push({
          id: `inv-imp-${Date.now()}-${i}`,
          code: cols[0] || `INV-${String(items.length + imported.length + 1).padStart(3, '0')}`,
          productName: cols[1],
          category: cols[2] || availableCategories[0] || 'Mercadería para la venta',
          description: cols[3] || '',
          unit: cols[4] || 'Unidad',
          quantity: qty,
          unitCost: cost,
          totalCostValue: Number((qty * cost).toFixed(2)),
          sellingPrice: 0,
          status: 'Declarado por el solicitante',
          attachments: []
        });
      }
      if (imported.length === 0) {
        notify('No se pudieron leer productos válidos del archivo CSV/Excel.', 'error');
        return;
      }
      commitItemsAndMeta([...items, ...imported]);
      notify(`Se importaron ${imported.length} productos y se actualizó el Balance General.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestoreSnapshot = (snap: InventoryValuationSnapshot) => {
    const restoredMeta: InventoryMetadata = {
      ...meta,
      inventoryDate: snap.inventoryDate,
      responsibleName: snap.responsibleName,
      location: snap.location,
      verificationStatus: snap.verificationStatus,
      declaredTotalValue: snap.declaredTotalValue,
      generalObservations: snap.generalObservations || meta.generalObservations
    };
    commitItemsAndMeta(snap.items, restoredMeta);
    setShowHistoryModal(false);
    setSelectedSnapshot(null);
    notify(`Se cargó la valoración histórica del ${snap.inventoryDate}.`);
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-[#1D63ED]/15 transition-all';

  return (
    <div className="space-y-5">
      {/* Live Integration & Feedback Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-[#1D63ED] inline-flex items-center gap-1.5">
              <Boxes className="w-4 h-4" />
              Módulo Independiente de Inventario
            </span>
            <span aria-hidden="true">·</span>
            <span>Solo bienes del negocio (excluye bienes personales)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-[#0B2545]">{dossier.code}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0B2545] tracking-tight">
            Inventario Valorizado y Control de Existencias
          </h2>
          <p className="text-xs text-slate-500">
            Valorizado a <strong>costo de adquisición</strong>. Alimenta automáticamente la cuenta{' '}
            <strong className="text-[#1D63ED]">Inventarios</strong> en Activo Corriente del Balance General.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveValuation(false)}
            className="px-3.5 py-2 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={() => handleSaveValuation(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            <span>Guardar valoración</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Ver historial ({(dossier.inventorySnapshots || []).length})</span>
          </button>
          {onNavigateToBalance && (
            <button
              type="button"
              onClick={onNavigateToBalance}
              className="px-3 py-2 rounded-xl border border-blue-200 bg-[#EFF6FF] hover:bg-blue-100 text-[#1D63ED] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ver en Balance General</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 ${
            feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Discrepancy Alert: Declarado vs Verificado */}
      {hasDeclaredMismatch && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-900">
                Diferencia detectada entre inventario declarado y valorización detallada
              </strong>
              <span>
                Declarado por el solicitante:{' '}
                <strong className="font-mono tabular-nums">
                  S/ {Number(meta.declaredTotalValue).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>{' '}
                · Valorizado detallado:{' '}
                <strong className="font-mono tabular-nums">
                  S/ {totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>{' '}
                · Diferencia:{' '}
                <strong className="font-mono tabular-nums">
                  {declaredDiff >= 0 ? '+' : ''}S/ {declaredDiff.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-rose-700 shrink-0">
            El Balance General usa el detalle calculado
          </span>
        </div>
      )}

      {/* E. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90">
          <span className="text-[11px] font-semibold text-slate-500 block">Productos registrados</span>
          <strong className="text-2xl font-extrabold text-[#0B2545] font-mono tabular-nums mt-1 block">
            {items.length}
          </strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90">
          <span className="text-[11px] font-semibold text-slate-500 block">Total de unidades</span>
          <strong className="text-2xl font-extrabold text-[#0B2545] font-mono tabular-nums mt-1 block">
            {totalUnits.toLocaleString('es-PE')}
          </strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-[#EFF6FF]/40">
          <span className="text-[11px] font-bold text-[#1D63ED] block">Valor total inventario</span>
          <strong className="text-2xl font-extrabold text-[#1D63ED] font-mono tabular-nums mt-1 block">
            S/ {totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90">
          <span className="text-[11px] font-semibold text-slate-500 block">Categorías activas</span>
          <strong className="text-2xl font-extrabold text-purple-600 font-mono tabular-nums mt-1 block">
            {activeCategoriesCount}
          </strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 col-span-2 md:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Sin verificar / Obs.</span>
          <strong
            className={`text-2xl font-extrabold font-mono tabular-nums mt-1 block ${
              unverifiedCount > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {unverifiedCount}
          </strong>
        </div>
      </div>

      {/* A. Datos Generales del Inventario + E. Gráfico por Categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-[#0B2545]">A. Datos generales del inventario</h3>
            <span className="text-xs text-slate-500">
              {dossier.business.businessName} · {dossier.business.sector}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fecha de inventario</label>
              <input
                type="date"
                value={meta.inventoryDate}
                onChange={(e) => commitItemsAndMeta(items, { ...meta, inventoryDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Responsable del registro</label>
              <input
                type="text"
                value={meta.responsibleName}
                onChange={(e) => commitItemsAndMeta(items, { ...meta, responsibleName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Estado general</label>
              <select
                value={meta.verificationStatus}
                onChange={(e) =>
                  commitItemsAndMeta(items, {
                    ...meta,
                    verificationStatus: e.target.value as VerificationBadgeStatus
                  })
                }
                className={inputClass}
              >
                <option value="Verificado por el analista">Verificado por el analista</option>
                <option value="Declarado por el solicitante">Declarado por el solicitante</option>
                <option value="Pendiente de verificación">Pendiente de verificación</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ubicación del inventario</label>
              <input
                type="text"
                value={meta.location}
                onChange={(e) => commitItemsAndMeta(items, { ...meta, location: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Monto declarado solicitante (S/)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Opcional para contraste"
                value={meta.declaredTotalValue ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : Math.max(0, Number(e.target.value));
                  commitItemsAndMeta(items, { ...meta, declaredTotalValue: val });
                }}
                className={`${inputClass} text-right font-mono font-bold tabular-nums`}
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Observaciones generales</label>
              <textarea
                rows={2}
                value={meta.generalObservations}
                onChange={(e) => commitItemsAndMeta(items, { ...meta, generalObservations: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {(meta.observationsLog || []).length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 block">Bitácora de observaciones</span>
              <div className="max-h-28 overflow-y-auto space-y-1.5">
                {meta.observationsLog!.map((o) => (
                  <div key={o.id} className="text-xs bg-slate-50 rounded-lg px-3 py-1.5 flex items-start justify-between gap-2">
                    <span className="text-slate-700">{o.note}</span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {o.author} · {o.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowObsModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span>+ Agregar observación</span>
            </button>
          </div>
        </div>

        {/* Distribution Chart by Category */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-[#0B2545]">Distribución por categoría</h3>
            <button
              type="button"
              onClick={() => setShowAddCategoryModal(true)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Tag className="w-3 h-3" />
              <span>+ Agregar categoría</span>
            </button>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">
              Registre productos para visualizar la distribución valorizada por categoría.
            </p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate pr-2">
                      {cat.category} ({cat.count})
                    </span>
                    <span className="font-mono font-bold text-[#0B2545] tabular-nums shrink-0">
                      S/ {cat.value.toLocaleString('es-PE', { minimumFractionDigits: 2 })} · {cat.percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(3, cat.percent)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* B & D. Editable Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
        {/* Toolbar: Search, Filter, Sort, Import/Export/Print */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código o nombre..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoría"
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1D63ED] cursor-pointer"
            >
              <option value="Todas">Todas las categorías</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Ordenar productos"
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1D63ED] cursor-pointer"
              >
                <option value="default">Orden original</option>
                <option value="val_desc">Mayor valor total</option>
                <option value="val_asc">Menor valor total</option>
                <option value="qty_desc">Mayor cantidad</option>
                <option value="qty_asc">Menor cantidad</option>
              </select>
            </div>
          </div>

          {/* Excel / PDF / Print Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleImportCSV}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              title="Importar productos desde archivo CSV generado en Excel"
            >
              <Upload className="w-3.5 h-3.5 text-[#1D63ED]" />
              <span>Importar Excel</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadTemplateCSV}
              className="px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-semibold cursor-pointer"
              title="Descargar plantilla CSV para Excel"
            >
              Plantilla
            </button>
            <button
              type="button"
              onClick={handleExportExcelCSV}
              className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exportar PDF / Imprimir</span>
            </button>
          </div>
        </div>

        {/* 10-Column Inventory Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
                <th className="py-3 pl-3.5 pr-2 whitespace-nowrap">Código</th>
                <th className="py-3 px-2 min-w-[160px]">Producto</th>
                <th className="py-3 px-2 whitespace-nowrap">Categoría</th>
                <th className="py-3 px-2 min-w-[140px]">Descripción</th>
                <th className="py-3 px-2 whitespace-nowrap">Unidad</th>
                <th className="py-3 px-2 text-right whitespace-nowrap">Cantidad</th>
                <th className="py-3 px-2 text-right whitespace-nowrap">Costo Unit. (S/)</th>
                <th className="py-3 px-2 text-right whitespace-nowrap">Valor Total (S/)</th>
                <th className="py-3 px-2 whitespace-nowrap">Estado</th>
                <th className="py-3 pl-2 pr-3.5 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    No se encontraron productos en el inventario con los filtros actuales.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => {
                  const rowTotal = Math.max(0, item.quantity) * Math.max(0, item.unitCost);
                  const statusMeta = STATUS_BADGE_MAP[item.status || 'Verificado por el analista'];
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/25 transition-colors">
                      <td className="py-2.5 pl-3.5 pr-2 font-mono font-bold text-[#1D63ED] whitespace-nowrap">
                        {item.code || '—'}
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="font-bold text-[#0B2545]">{item.productName}</div>
                        {(item.attachments?.length || 0) > 0 && (
                          <span className="text-[10px] text-slate-500 inline-flex items-center gap-1 mt-0.5">
                            <Paperclip className="w-3 h-3" /> {item.attachments!.length} adjunto(s)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">
                        {item.category || 'Mercadería para la venta'}
                      </td>
                      <td className="py-2.5 px-2 text-slate-500 max-w-[200px] truncate" title={item.description || item.observations || ''}>
                        {item.description || item.observations || '—'}
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">{item.unit || 'Unidad'}</td>
                      <td className="py-2.5 px-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step="1"
                          aria-label={`Cantidad de ${item.productName}`}
                          value={item.quantity}
                          onChange={(e) => handleInlineNumberChange(item.id, 'quantity', e.target.value)}
                          className="w-20 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-right font-mono font-bold text-slate-900 tabular-nums focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          aria-label={`Costo unitario de ${item.productName}`}
                          value={item.unitCost}
                          onChange={(e) => handleInlineNumberChange(item.id, 'unitCost', e.target.value)}
                          className="w-24 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-right font-mono font-bold text-slate-900 tabular-nums focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-extrabold text-[#0B2545] tabular-nums whitespace-nowrap">
                        S/ {rowTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-2">
                        <select
                          value={item.status || 'Verificado por el analista'}
                          onChange={(e) =>
                            handleInlineStatusChange(item.id, e.target.value as VerificationBadgeStatus)
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${statusMeta.colorClass}`}
                        >
                          <option value="Verificado por el analista">Verificado</option>
                          <option value="Declarado por el solicitante">Declarado</option>
                          <option value="Pendiente de verificación">Pendiente</option>
                          <option value="Observado">Observado</option>
                        </select>
                      </td>
                      <td className="py-2.5 pl-2 pr-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1D63ED] hover:bg-blue-50 cursor-pointer"
                            title="Editar producto / adjuntos / observaciones"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 cursor-pointer"
                            title="Duplicar producto"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-[#EFF6FF]/70 border-t border-blue-200/80 font-bold text-[#0B2545]">
                <td colSpan={5} className="py-3 pl-3.5 text-xs">
                  Total general del inventario ({visibleItems.length} ítems mostrados)
                </td>
                <td className="py-3 px-2 text-right font-mono tabular-nums">
                  {visibleItems.reduce((s, i) => s + i.quantity, 0).toLocaleString('es-PE')}
                </td>
                <td className="py-3 px-2 text-right text-[11px] text-slate-500">Costo adquisición</td>
                <td className="py-3 px-2 text-right font-mono text-sm font-extrabold text-[#1D63ED] tabular-nums whitespace-nowrap">
                  S/ {visibleItems.reduce((s, i) => s + i.quantity * i.unitCost, 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </td>
                <td colSpan={2} className="py-3 pr-3.5 text-right text-[11px] text-emerald-700">
                  Sincronizado con Balance
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mandatory Bottom Add Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openAddProductModal}
              className="px-4 py-2 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar producto</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddCategoryModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              <span>+ Agregar categoría</span>
            </button>
            <button
              type="button"
              onClick={() => setShowObsModal(true)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Agregar observación</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-500">
            Fórmula: <span className="font-mono font-semibold">Valor total = Cantidad × Costo unitario de adquisición</span>
          </span>
        </div>
      </div>

      {/* MODAL: Add / Edit Product */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0B2545]">
                  {editingItem ? 'Editar producto del inventario' : 'Registrar nuevo producto en inventario'}
                </h3>
                <p className="text-xs text-slate-500">
                  Ingrese el costo unitario de adquisición (no el precio de venta al público).
                </p>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código del producto</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="INV-001"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nombre del producto *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Arroz Superior saco 50 kg"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={inputClass}
                  >
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidad de medida</label>
                  <select value={formUnit} onChange={(e) => setFormUnit(e.target.value)} className={inputClass}>
                    {DEFAULT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VerificationBadgeStatus)}
                    className={inputClass}
                  >
                    <option value="Verificado por el analista">Verificado por el analista</option>
                    <option value="Declarado por el solicitante">Declarado por el solicitante</option>
                    <option value="Pendiente de verificación">Pendiente de verificación</option>
                    <option value="Observado">Observado</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cantidad disponible *</label>
                  <input
                    type="number"
                    min={0}
                    step="1"
                    required
                    value={formQty}
                    onChange={(e) => setFormQty(Math.max(0, Number(e.target.value)))}
                    className={`${inputClass} text-right font-mono font-bold tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Costo unitario adquisición (S/) *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    required
                    value={formUnitCost}
                    onChange={(e) => setFormUnitCost(Math.max(0, Number(e.target.value)))}
                    className={`${inputClass} text-right font-mono font-bold tabular-nums`}
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-blue-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-[#1D63ED] uppercase">Valor Total Calculado</span>
                  <strong className="text-base font-extrabold text-[#0B2545] font-mono tabular-nums">
                    S/ {(Math.max(0, formQty) * Math.max(0, formUnitCost)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Detalle, marca, presentación o condición..."
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Observaciones</label>
                  <textarea
                    rows={2}
                    value={formObs}
                    onChange={(e) => setFormObs(e.target.value)}
                    placeholder="Notas de verificación en campo..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Fotografías o comprobantes adjuntos</span>
                  <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[#1D63ED] font-bold inline-flex items-center gap-1.5 cursor-pointer">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Adjuntar archivo</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleAttachFileToForm(e.target.files?.[0])}
                    />
                  </label>
                </div>
                {formAttachments.length === 0 ? (
                  <p className="text-[11px] text-slate-400">Sin archivos adjuntos para este producto.</p>
                ) : (
                  <div className="space-y-1">
                    {formAttachments.map((att) => (
                      <div key={att.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-mono text-[11px] text-slate-700 truncate">
                          {att.fileName} ({att.fileSize})
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white font-bold cursor-pointer"
                >
                  {editingItem ? 'Guardar cambios' : 'Agregar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-[#0B2545]">¿Eliminar producto del inventario?</h4>
            <p className="text-xs text-slate-600">
              Esta acción retirará el producto y actualizará automáticamente la cuenta <strong>Inventarios</strong> en el Balance General.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Confirmar eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Category */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddCategory}
            className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-[#0B2545]">Agregar categoría de inventario</h4>
              <button type="button" onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre de categoría *</label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ej. Bebidas y lácteos / Repuestos"
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddCategoryModal(false)} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl font-bold bg-[#1D63ED] text-white cursor-pointer">
                Agregar categoría
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add Observation */}
      {showObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddObservation}
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-[#0B2545]">Registrar observación de inventario</h4>
              <button type="button" onClick={() => setShowObsModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={3}
              required
              value={newObsNote}
              onChange={(e) => setNewObsNote(e.target.value)}
              placeholder="Ej. Se verificó mercadería en almacén trasero y vitrinas refrigeradas..."
              className={inputClass}
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowObsModal(false)} className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 rounded-xl font-bold bg-[#1D63ED] text-white cursor-pointer">
                Guardar observación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Inventory History Snapshots */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0B2545]">
                  Historial de valorizaciones de inventario
                </h3>
                <p className="text-xs text-slate-500">
                  Registros históricos preservados sin modificar balances de períodos anteriores
                </p>
              </div>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedSnapshot(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 text-xs">
              {(dossier.inventorySnapshots || []).length === 0 ? (
                <div className="py-10 text-center text-slate-500 space-y-2">
                  <p>No hay valorizaciones guardadas en el historial todavía.</p>
                  <p className="text-[11px]">
                    Use el botón <strong>"Guardar valoración"</strong> para registrar un corte histórico en fecha.
                  </p>
                </div>
              ) : (
                (dossier.inventorySnapshots || []).map((snap) => (
                  <div
                    key={snap.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong className="text-sm text-[#0B2545]">
                          Inventario al {snap.inventoryDate}
                        </strong>
                        <span className="text-[11px] text-slate-500 block">
                          Guardado por {snap.savedBy} · {snap.savedAt} · {snap.verificationStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        <strong className="text-base font-extrabold text-[#1D63ED] font-mono tabular-nums block">
                          S/ {snap.totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {snap.totalItems} productos · {snap.totalUnits} unidades
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                      <button
                        type="button"
                        onClick={() => setSelectedSnapshot(selectedSnapshot?.id === snap.id ? null : snap)}
                        className="text-[#1D63ED] font-bold hover:underline cursor-pointer"
                      >
                        {selectedSnapshot?.id === snap.id ? 'Ocultar detalle' : 'Ver detalle de productos'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestoreSnapshot(snap)}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
                      >
                        Cargar como inventario actual
                      </button>
                    </div>

                    {selectedSnapshot?.id === snap.id && (
                      <div className="pt-2 border-t border-slate-200/70 space-y-1">
                        {snap.items.map((it) => (
                          <div key={it.id} className="flex justify-between text-[11px] text-slate-600">
                            <span>
                              {it.productName} ({it.quantity} × S/ {it.unitCost.toFixed(2)})
                            </span>
                            <span className="font-mono font-bold tabular-nums">
                              S/ {(it.quantity * it.unitCost).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
