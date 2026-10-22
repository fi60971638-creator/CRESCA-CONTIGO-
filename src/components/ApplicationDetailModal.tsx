import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  CreditEvaluationDossier,
  ApplicationStatus,
  DocumentVerificationStatus,
  DocumentControlItem
} from '../types/evalua';
import {
  X,
  Printer,
  FileSpreadsheet,
  User,
  Briefcase,
  TrendingUp,
  CreditCard,
  Building2,
  Package,
  FolderLock,
  MessageSquareText,
  Clock,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  ChevronRight,
  ArrowRight,
  Edit3,
  AlertTriangle,
  Wallet,
  ClipboardCheck
} from 'lucide-react';
import { ScoreRing } from './ui/ScoreRing';

interface ApplicationDetailModalProps {
  dossierId: string | null;
  initialTab?: string;
  onClose: () => void;
  onOpenPrint: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  dossierId,
  initialTab = 'resumen',
  onClose,
  onOpenPrint
}) => {
  const {
    dossiers,
    updateDossier,
    deleteDossier,
    updateDossierStatus,
    toggleDocStatus,
    addTimelineEvent,
    currentUser
  } = useEvalua();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sync activeTab when initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, dossierId]);

  // Timeline event form
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventStatus, setNewEventStatus] = useState<ApplicationStatus>('en_evaluacion');
  const [newEventObs, setNewEventObs] = useState('');
  const [newEventNext, setNewEventNext] = useState('');

  // Delete confirm modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editHomeAddress, setEditHomeAddress] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editActivityType, setEditActivityType] = useState('');
  const [editBusinessAddress, setEditBusinessAddress] = useState('');
  const [editRequestedAmount, setEditRequestedAmount] = useState<number>(0);
  const [editTermMonths, setEditTermMonths] = useState<number>(0);
  const [editProposedInstallment, setEditProposedInstallment] = useState<number>(0);
  const [editDestinationDesc, setEditDestinationDesc] = useState('');

  const dossier = dossiers.find((d) => d.id === dossierId);

  // Initialize edit fields when opening edit modal
  const handleOpenEdit = () => {
    if (!dossier) return;
    setEditPhone(dossier.personal.phone);
    setEditHomeAddress(dossier.personal.homeAddress);
    setEditDistrict(dossier.personal.district);
    setEditBusinessName(dossier.business.businessName);
    setEditActivityType(dossier.business.activityType);
    setEditBusinessAddress(dossier.business.businessAddress);
    setEditRequestedAmount(dossier.terms.requestedAmount);
    setEditTermMonths(dossier.terms.termMonths);
    setEditProposedInstallment(dossier.terms.proposedInstallment);
    setEditDestinationDesc(dossier.terms.destinationDescription);
    setShowEditModal(true);
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossier) return;

    updateDossier(dossier.id, {
      personal: {
        ...dossier.personal,
        phone: editPhone,
        homeAddress: editHomeAddress,
        district: editDistrict
      },
      business: {
        ...dossier.business,
        businessName: editBusinessName,
        activityType: editActivityType,
        businessAddress: editBusinessAddress
      },
      terms: {
        ...dossier.terms,
        requestedAmount: Number(editRequestedAmount),
        termMonths: Number(editTermMonths),
        proposedInstallment: Number(editProposedInstallment),
        destinationDescription: editDestinationDesc
      }
    });

    addTimelineEvent(dossier.id, {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      status: dossier.status,
      responsibleName: currentUser?.name || 'Analista',
      responsibleRole: currentUser?.roleTitle || 'Analista',
      observation: 'Actualización formal de datos generales y condiciones de crédito.'
    });

    setShowEditModal(false);
  };

  const handleDeleteDossierConfirm = () => {
    if (!dossier) return;
    deleteDossier(dossier.id);
    setShowDeleteConfirm(false);
    onClose();
  };
  if (!dossier) return null;

  const handleAddTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventObs.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    addTimelineEvent(dossier.id, {
      date: today,
      time: nowTime,
      status: newEventStatus,
      responsibleName: currentUser?.name || 'Analista',
      responsibleRole: currentUser?.roleTitle || 'Analista',
      observation: newEventObs.trim(),
      nextAction: newEventNext.trim() || undefined
    });

    updateDossierStatus(dossier.id, newEventStatus, newEventObs.trim(), newEventNext.trim());

    setShowAddEvent(false);
    setNewEventObs('');
    setNewEventNext('');
  };

  const p = dossier.personal;
  const b = dossier.business;
  const t = dossier.terms;
  const inc = dossier.income;
  const cos = dossier.costOfSales;
  const be = dossier.businessExpenses;
  const fe = dossier.familyExpenses;
  const is = dossier.incomeStatement;
  const bs = dossier.balanceSheet;
  const cf = dossier.cashFlow;
  const pc = dossier.paymentCapacity;
  const r = dossier.ratios;
  const q = dossier.qualitative;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
              EXP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight font-mono">
                  {dossier.code}
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {dossier.createdAt}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-0.5">
                {p.fullName} • <span className="text-slate-400 font-normal">DNI {p.documentNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Edit Button */}
            <button
              onClick={handleOpenEdit}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Editar datos y condiciones del expediente"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Editar</span>
            </button>

            {/* Print Button */}
            <button
              onClick={onOpenPrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              title="Imprimir expediente formal para comité"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Imprimir Expediente</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-colors cursor-pointer"
              title="Eliminar expediente"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Exact 1-8 Credit Evaluation Dossier Structure) */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 flex items-center gap-1 overflow-x-auto text-xs py-1">
          {[
            { id: 'solicitante', label: '1. Solicitante', icon: User },
            { id: 'negocio', label: '2. Negocio', icon: Briefcase },
            { id: 'credito', label: '3. Crédito', icon: CreditCard },
            { id: 'ingresos_gastos', label: '4. Ingresos y gastos', icon: TrendingUp },
            { id: 'balance', label: '5. Estados financieros y balance', icon: Building2 },
            { id: 'capacidad', label: '6. Capacidad de pago', icon: Wallet },
            { id: 'inventario_documentos', label: `7. Inventario y documentos (${dossier.documents.filter(d=>d.status==='Verificado').length}/${dossier.documents.length})`, icon: Package },
            { id: 'conclusion', label: '8. Conclusión', icon: ClipboardCheck },
            { id: 'seguimiento', label: `Seguimiento (${dossier.timeline.length})`, icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive =
              activeTab === tab.id ||
              (tab.id === 'solicitante' && activeTab === 'resumen') ||
              (tab.id === 'ingresos_gastos' && activeTab === 'resultados') ||
              (tab.id === 'inventario_documentos' && (activeTab === 'inventario' || activeTab === 'documentos')) ||
              (tab.id === 'conclusion' && activeTab === 'cualitativo');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 font-semibold transition-all whitespace-nowrap border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: SOLICITANTE */}
          {(activeTab === 'solicitante' || activeTab === 'resumen') && (
            <div className="space-y-5">
              {/* Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Monto Solicitado</span>
                  <div className="text-xl font-black text-white mt-0.5">
                    S/ {t.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">{t.termMonths} meses ({t.paymentFrequency})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Cuota Propuesta</span>
                  <div className="text-xl font-black text-blue-400 mt-0.5">
                    S/ {t.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">Pago estimado mensual</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Saldo Post-Cuota</span>
                  <div className={`text-xl font-black mt-0.5 ${pc.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    S/ {pc.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-slate-400">Excedente neto disponible</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Analista Asignado</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5 truncate">
                    {dossier.assignedAnalystName}
                  </div>
                  <span className="text-[11px] text-slate-400 truncate">{dossier.agency}</span>
                </div>
              </div>

              {/* Score Indicator & Ficha Solicitante */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="md:col-span-4 flex flex-col items-center justify-center p-3 text-center border-b md:border-b-0 md:border-r border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Score Crediticio Evaluado
                  </span>
                  <ScoreRing
                    score={
                      pc.remainingSurplusAfterProposedInstallment >= 1500
                        ? 765
                        : pc.remainingSurplusAfterProposedInstallment >= 500
                        ? 743
                        : pc.remainingSurplusAfterProposedInstallment >= 0
                        ? 675
                        : 520
                    }
                    minScore={300}
                    maxScore={850}
                    size="md"
                    showBadge={true}
                    badgePosition="left"
                    animate={false}
                  />
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">
                    {pc.remainingSurplusAfterProposedInstallment >= 0 ? 'Capacidad de pago confirmada' : 'Riesgo por excedente negativo'}
                  </p>
                </div>
                <div className="md:col-span-8 space-y-3 text-xs">
                  <h3 className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Datos Generales del Titular</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><span className="text-slate-400 block text-[11px]">Nombres y Apellidos:</span><strong className="text-white text-sm">{p.fullName}</strong></div>
                    <div><span className="text-slate-400 block text-[11px]">DNI / Documento:</span><strong className="text-white font-mono">{p.documentType} {p.documentNumber}</strong></div>
                    <div><span className="text-slate-400 block text-[11px]">Edad / Nacimiento:</span><strong className="text-white">{p.age} años ({p.birthDate})</strong></div>
                    <div><span className="text-slate-400 block text-[11px]">Estado Civil:</span><strong className="text-white">{p.maritalStatus} ({p.dependentsCount} dependientes)</strong></div>
                    <div><span className="text-slate-400 block text-[11px]">Teléfono:</span><strong className="text-white">{p.phone}</strong></div>
                    <div><span className="text-slate-400 block text-[11px]">Ubicación:</span><strong className="text-white">{p.district}, {p.province}</strong></div>
                    <div className="sm:col-span-2"><span className="text-slate-400 block text-[11px]">Dirección Domiciliaria:</span><strong className="text-white">{p.homeAddress}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVIDAD ECONÓMICA */}
          {activeTab === 'negocio' && (
            <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>Información del Negocio y Actividad Económica</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><span className="text-slate-400 block">Nombre Comercial:</span><strong className="text-white text-sm">{b.businessName}</strong></div>
                <div><span className="text-slate-400 block">Tipo de Actividad:</span><strong className="text-white">{b.activityType}</strong></div>
                <div><span className="text-slate-400 block">Sector:</span><strong className="text-white">{b.sector}</strong></div>
                <div><span className="text-slate-400 block">Tiempo de Funcionamiento:</span><strong className="text-white">{b.operatingTimeYears} años y {b.operatingTimeMonths} meses</strong></div>
                <div><span className="text-slate-400 block">Tipo de Local:</span><strong className="text-white">{b.businessType}</strong></div>
                <div><span className="text-slate-400 block">Formalidad:</span><strong className="text-white">{b.formality}</strong></div>
                <div className="sm:col-span-2"><span className="text-slate-400 block">Dirección del Negocio:</span><strong className="text-white">{b.businessAddress}</strong></div>
                <div><span className="text-slate-400 block">N° Trabajadores:</span><strong className="text-white">{b.employeesCount} personas</strong></div>
                <div className="sm:col-span-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block mb-1">Descripción de la Actividad:</span>
                  <p className="text-slate-200">{b.activityDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONDICIONES DE CRÉDITO */}
          {activeTab === 'credito' && (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/50 rounded-xl border border-blue-500/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      <span>Condiciones de la Propuesta de Crédito</span>
                    </h3>
                    <p className="text-slate-400 text-xs">Estructuración técnica del financiamiento solicitado</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Tipo: Microempresa / Capital de Trabajo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monto Solicitado</span>
                    <strong className="text-lg text-white font-mono">S/ {t.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Moneda: Nuevos Soles (PEN)</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Plazo de Pago</span>
                    <strong className="text-lg text-white">{t.termMonths} meses</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Frecuencia: {t.paymentFrequency}</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuota Mensual Estimada</span>
                    <strong className="text-lg text-blue-400 font-mono">S/ {t.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Capital + Interés + Seguros</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasa Referencial (TEA)</span>
                    <strong className="text-lg text-emerald-400">28.50%</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">TEM: 2.11% aprox.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Destino del Crédito:</span>
                    <p className="text-slate-200">{t.destinationDescription || t.destination || 'Capital de trabajo, reposición de mercadería e inventario'}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Garantía / Aval:</span>
                    <p className="text-slate-200">Garantía personal y bienes comerciales afectos al negocio</p>
                  </div>
                </div>
              </div>

              {/* Cronograma referencial estimado */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Cronograma Referencial de Cuotas (Primeros 6 periodos)
                  </h4>
                  <span className="text-[10px] text-slate-400">Sistema Francés • Cuotas Constantes</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                        <th className="py-2 px-2">N° Cuota</th>
                        <th className="py-2 px-2">Saldo Capital</th>
                        <th className="py-2 px-2">Amortización</th>
                        <th className="py-2 px-2">Interés</th>
                        <th className="py-2 px-2 text-right">Cuota Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {[1, 2, 3, 4, 5, 6].map((num) => {
                        const monthlyRate = 0.0211;
                        const installment = t.proposedInstallment;
                        const approxInterest = (t.requestedAmount - (num - 1) * (installment * 0.7)) * monthlyRate;
                        const approxPrincipal = installment - Math.max(approxInterest, 20);
                        const balance = Math.max(0, t.requestedAmount - num * approxPrincipal);
                        return (
                          <tr key={num} className="hover:bg-slate-900/40">
                            <td className="py-2 px-2 font-mono text-slate-300">Cuota {num}</td>
                            <td className="py-2 px-2 text-slate-400 font-mono">S/ {balance.toFixed(2)}</td>
                            <td className="py-2 px-2 text-emerald-400 font-mono">S/ {approxPrincipal.toFixed(2)}</td>
                            <td className="py-2 px-2 text-rose-400 font-mono">S/ {Math.max(approxInterest, 20).toFixed(2)}</td>
                            <td className="py-2 px-2 text-right font-bold text-white font-mono">S/ {installment.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INGRESOS Y GASTOS (ESTADO DE RESULTADOS) */}
          {(activeTab === 'ingresos_gastos' || activeTab === 'resultados') && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/30">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                  Estado de Resultados (P&L Mensual Calculado)
                </h3>
                <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                  <div className="flex justify-between py-1.5 font-bold text-slate-200">
                    <span>(+) Ventas / Ingresos del Negocio</span>
                    <span className="text-emerald-400">S/ {is.salesIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span>(-) Costo de Ventas (Mercadería, Fletes, Insumos)</span>
                    <span className="text-rose-400">S/ {is.costOfSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold bg-slate-900/60 px-2 rounded text-blue-300">
                    <span>(=) Utilidad Bruta</span>
                    <span>S/ {is.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span>(-) Gastos Operativos del Negocio (Alquiler, Servicios, Personal)</span>
                    <span className="text-rose-400">S/ {is.operatingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold bg-slate-900/60 px-2 rounded text-blue-300">
                    <span>(=) Resultado Operativo</span>
                    <span>S/ {is.operatingResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span>(-) Gastos Familiares y Personales</span>
                    <span className="text-rose-400">S/ {fe.totalFamilyExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-slate-200">
                    <span>(=) Resultado Antes de Obligaciones Financieras</span>
                    <span>S/ {is.resultBeforeFinancialObligations.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-slate-300">
                    <span>(-) Cuotas de Créditos Existentes</span>
                    <span className="text-rose-400">S/ {is.financialInstallments.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-2 font-black bg-blue-600/15 border border-blue-500/30 px-3 rounded-lg text-sm">
                    <span className="text-white">(=) Resultado Disponible</span>
                    <span className={is.availableResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      S/ {is.availableResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                  <span className="font-semibold text-slate-300 block">Fórmula de Resultado Disponible:</span>
                  <p className="italic">Ventas – Costo de Ventas – Gastos Operativos – Gastos Familiares – Cuotas = Resultado Disponible</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BALANCE GENERAL */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-blue-500/30 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Activos</span>
                  <div className="text-xl font-black text-emerald-400">S/ {bs.totalAssets.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Pasivos</span>
                  <div className="text-xl font-black text-rose-400">S/ {bs.totalLiabilities.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-300">Patrimonio Neto</span>
                  <div className="text-xl font-black text-blue-400">S/ {bs.equity.toLocaleString()}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-1">
                    <span>Activos</span>
                    <span className="text-emerald-400">S/ {bs.totalAssets.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between"><span>Efectivo y Bancos:</span><span>S/ {(bs.cash + bs.bankDeposits).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Inventarios:</span><span>S/ {bs.inventoryValue.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Cuentas por Cobrar:</span><span>S/ {bs.accountsReceivableValue.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Inmueble / Vivienda:</span><span>S/ {bs.housingValue.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Vehículos:</span><span>S/ {bs.vehiclesValue.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Maquinaria & Equipos:</span><span>S/ {(bs.machineryValue + bs.equipmentValue).toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-1">
                    <span>Pasivos</span>
                    <span className="text-rose-400">S/ {bs.totalLiabilities.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between"><span>Deudas Corto Plazo:</span><span>S/ {bs.shortTermCredits.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Proveedores x Pagar:</span><span>S/ {bs.suppliersPayable.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Deudas Largo Plazo:</span><span>S/ {bs.longTermCredits.toFixed(2)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CAPACIDAD DE PAGO & RATIOS */}
          {activeTab === 'capacidad' && (
            <div className="space-y-5">
              {/* Capacidad de pago box */}
              <div className="p-5 bg-gradient-to-r from-blue-950/60 to-slate-900 rounded-xl border border-blue-500/30 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Evaluación de Capacidad de Pago
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Ingresos</span>
                    <strong className="text-emerald-400">S/ {pc.monthlyIncome.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Egresos Totales</span>
                    <strong className="text-rose-400">S/ {pc.monthlyExpenses.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Cuotas Actuales</span>
                    <strong className="text-rose-400">S/ {pc.currentFinancialObligations.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-blue-300 text-[10px] block">Disponible</span>
                    <strong className="text-blue-400">S/ {pc.availableFlow.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded">
                    <span className="text-slate-400 text-[10px] block">Cuota Propuesta</span>
                    <strong className="text-white">S/ {pc.proposedInstallment.toLocaleString()}</strong>
                  </div>
                  <div className="p-2 bg-slate-950/70 rounded border border-blue-500/40">
                    <span className="text-emerald-300 text-[10px] block font-bold">Saldo Post-Cuota</span>
                    <strong className={pc.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400'}>
                      S/ {pc.remainingSurplusAfterProposedInstallment.toLocaleString()}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center italic">
                  * Información disponible para evaluación del analista.
                </p>
              </div>

              {/* Indicadores Financieros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Endeudamiento</span>
                  <span className="text-xl font-black text-white">{r.indebtednessRatio.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-400 mt-1">Fórmula: Pasivos / Activos × 100</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Carga Financiera</span>
                  <span className="text-xl font-black text-white">{r.financialBurdenRatio.toFixed(1)}%</span>
                  <p className="text-[10px] text-slate-400 mt-1">Fórmula: Cuotas / Ingresos × 100</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Cobertura de Obligaciones</span>
                  <span className="text-xl font-black text-emerald-400">{r.debtCoverageRatio.toFixed(2)}x</span>
                  <p className="text-[10px] text-slate-400 mt-1">Fórmula: Flujo disponible / Cuotas</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: INVENTARIO Y DOCUMENTOS */}
          {(activeTab === 'inventario_documentos' || activeTab === 'inventario' || activeTab === 'documentos') && (
            <div className="space-y-5 text-xs">
              {/* Inventario valorizado */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span>Inventario de Mercadería Registrado</span>
                  </h4>
                  <span className="text-emerald-400 font-bold font-mono text-sm">
                    Total: S/ {dossier.inventory.reduce((sum, i) => sum + i.totalCostValue, 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {dossier.inventory.map((item) => (
                    <div key={item.id} className="p-2.5 bg-slate-900/80 rounded-lg flex justify-between items-center border border-slate-800/80">
                      <div>
                        <strong className="text-slate-200 block">{item.productName}</strong>
                        <span className="text-[10px] text-slate-400">{item.quantity} unidades × S/ {item.unitCost.toFixed(2)} (costo unitario)</span>
                      </div>
                      <strong className="text-emerald-400 font-mono text-sm">S/ {item.totalCostValue.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documentos de sustento digital */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                    <FolderLock className="w-4 h-4 text-blue-400" />
                    <span>Documentación y Sustento Digital</span>
                  </h4>
                  <span className="text-xs text-blue-300 font-bold">
                    {dossier.documents.filter(d => d.status === 'Verificado').length} de {dossier.documents.length} Verificados
                  </span>
                </div>
                <div className="space-y-2">
                  {dossier.documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-200 block">{doc.name}</span>
                          <span className="text-[10px] text-slate-400">{doc.documentType}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleDocStatus(dossier.id, doc.id, doc.status === 'Verificado' ? 'Pendiente' : 'Verificado')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                          doc.status === 'Verificado' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {doc.status}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: ANÁLISIS & CONCLUSIÓN */}
          {(activeTab === 'conclusion' || activeTab === 'cualitativo') && (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-teal-400" />
                    <span>Dictamen y Conclusión del Expediente Crediticio</span>
                  </h4>
                </div>
                <div><strong className="text-slate-300 block mb-1">Experiencia y Estabilidad Comercial:</strong><p className="text-slate-200">{q.activityExperience}</p></div>
                <div><strong className="text-slate-300 block mb-1">Comentarios y Observaciones del Analista:</strong><p className="text-slate-200">{q.analystComments}</p></div>
                <div className="p-4 bg-gradient-to-r from-blue-950/60 to-slate-900 rounded-xl border border-blue-500/40 mt-3">
                  <strong className="text-white block mb-1.5 uppercase tracking-wide font-black">Conclusión y Dictamen Final:</strong>
                  <p className="text-blue-100 leading-relaxed font-medium">{q.analystConclusion}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SEGUIMIENTO & TIMELINE */}
          {activeTab === 'seguimiento' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-white uppercase tracking-wider">Línea de Tiempo del Expediente</h4>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Evento de Seguimiento</span>
                </button>
              </div>

              <div className="space-y-3">
                {dossier.timeline.map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>{ev.date} {ev.time} • <strong>{ev.responsibleName}</strong> ({ev.responsibleRole})</span>
                      <span className="uppercase font-bold text-blue-400">{ev.status}</span>
                    </div>
                    <p className="text-slate-200 text-xs">{ev.observation}</p>
                    {ev.nextAction && (
                      <p className="text-emerald-400 text-[11px]">Próxima acción: {ev.nextAction}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Add Event */}
        {showAddEvent && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">Agregar Evento a la Línea de Tiempo</h4>
              <form onSubmit={handleAddTimelineSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">Estado</label>
                  <select
                    value={newEventStatus}
                    onChange={(e) => setNewEventStatus(e.target.value as ApplicationStatus)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="registrada">Registrada</option>
                    <option value="en_evaluacion">En evaluación</option>
                    <option value="documentacion_pendiente">Documentación pendiente</option>
                    <option value="en_verificacion">En verificación</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Observación *</label>
                  <textarea
                    rows={3}
                    required
                    value={newEventObs}
                    onChange={(e) => setNewEventObs(e.target.value)}
                    placeholder="Detalle de la gestión realizada..."
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Próxima Acción</label>
                  <input
                    type="text"
                    value={newEventNext}
                    onChange={(e) => setNewEventNext(e.target.value)}
                    placeholder="Ej. Recojo de contrato de alquiler"
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddEvent(false)} className="px-3 py-1.5 text-slate-400">Cancelar</button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Editar Datos del Expediente ({dossier.code})</h3>
                </div>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditSubmit} className="space-y-4 text-xs">
                {/* Datos de contacto */}
                <div className="space-y-2">
                  <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">1. Contacto & Domicilio</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-300 block mb-1">Teléfono</label>
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Distrito</label>
                      <input
                        type="text"
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-300 block mb-1">Dirección Domiciliaria</label>
                      <input
                        type="text"
                        value={editHomeAddress}
                        onChange={(e) => setEditHomeAddress(e.target.value)}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Negocio */}
                <div className="space-y-2">
                  <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">2. Actividad Económica</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-slate-300 block mb-1">Nombre Comercial</label>
                      <input
                        type="text"
                        required
                        value={editBusinessName}
                        onChange={(e) => setEditBusinessName(e.target.value)}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-300 block mb-1">Actividad o Giro</label>
                      <input
                        type="text"
                        required
                        value={editActivityType}
                        onChange={(e) => setEditActivityType(e.target.value)}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-slate-300 block mb-1">Dirección del Negocio</label>
                      <input
                        type="text"
                        value={editBusinessAddress}
                        onChange={(e) => setEditBusinessAddress(e.target.value)}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Crédito */}
                <div className="space-y-2">
                  <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">3. Condiciones del Crédito</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-slate-300 block mb-1">Monto (S/)</label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={editRequestedAmount}
                        onChange={(e) => setEditRequestedAmount(Number(e.target.value))}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Plazo (meses)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editTermMonths}
                        onChange={(e) => setEditTermMonths(Number(e.target.value))}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Cuota (S/)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editProposedInstallment}
                        onChange={(e) => setEditProposedInstallment(Number(e.target.value))}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white font-bold text-blue-400"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-slate-300 block mb-1">Destino del Crédito</label>
                      <input
                        type="text"
                        value={editDestinationDesc}
                        onChange={(e) => setEditDestinationDesc(e.target.value)}
                        className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sub-modal: Confirmación de Eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">¿Confirmar eliminación?</h3>
                  <p className="text-xs text-slate-400">Acción destructiva permanente</p>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                ¿Está seguro de que desea eliminar permanentemente el expediente{' '}
                <strong className="text-white font-mono">{dossier.code}</strong> de{' '}
                <strong className="text-white">{p.fullName}</strong>? Todos los datos asociados serán removidos.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteDossierConfirm}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer"
                >
                  Eliminar Expediente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
