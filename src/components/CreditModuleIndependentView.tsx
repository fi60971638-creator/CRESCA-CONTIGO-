import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  User,
  Briefcase,
  CreditCard,
  TrendingUp,
  Building2,
  Wallet,
  Package,
  ClipboardCheck,
  ChevronRight,
  ChevronLeft,
  Eye,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface CreditModuleIndependentViewProps {
  moduleId:
    | 'solicitante'
    | 'negocio'
    | 'credito'
    | 'ingresos_gastos'
    | 'balance'
    | 'capacidad'
    | 'inventario_documentos'
    | 'conclusion';
}

const MODULE_META = [
  { id: 'solicitante', step: 1, title: '1. Solicitante', subtitle: 'Datos personales, identificación, domicilio y perfil crediticio del titular', icon: User, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'negocio', step: 2, title: '2. Negocio', subtitle: 'Información comercial, giro económico, antigüedad, local y referencias', icon: Briefcase, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' },
  { id: 'credito', step: 3, title: '3. Crédito', subtitle: 'Condiciones solicitadas, destino, tasas de interés y cronograma referencial', icon: CreditCard, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  { id: 'ingresos_gastos', step: 4, title: '4. Ingresos y gastos', subtitle: 'Estado de resultados: ventas, costos de mercadería, gastos operativos y familiares', icon: TrendingUp, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'balance', step: 5, title: '5. Estados financieros y balance', subtitle: 'Balance general, activos corrientes y fijos, pasivos, patrimonio y solvencia', icon: Building2, color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' },
  { id: 'capacidad', step: 6, title: '6. Capacidad de pago', subtitle: 'Excedente post-cuota, índice de cobertura (RCI), endeudamiento y pruebas de estrés', icon: Wallet, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'inventario_documentos', step: 7, title: '7. Inventario y documentos', subtitle: 'Inventario valorizado de mercaderías y checklist de documentación digital', icon: Package, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { id: 'conclusion', step: 8, title: '8. Conclusión', subtitle: 'Dictamen crediticio, matriz cualitativa, fortalezas, riesgos y recomendación final', icon: ClipboardCheck, color: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/10' },
];

export const CreditModuleIndependentView: React.FC<CreditModuleIndependentViewProps> = ({ moduleId }) => {
  const {
    dossiers,
    selectedDossierId,
    setSelectedDossierId,
    setActiveTab,
    setIsPrintModalOpen,
    openDossierWithTab,
    updateDossierStatus
  } = useEvalua();

  // Selected dossier or fallback to first dossier
  const activeDossier = dossiers.find((d) => d.id === selectedDossierId) || dossiers[0];
  const [approvalNotes, setApprovalNotes] = useState('');

  if (!activeDossier) {
    return (
      <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 max-w-4xl mx-auto mt-8">
        <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No hay expedientes disponibles</h3>
        <p className="text-xs text-slate-400 mt-1">
          Cree una nueva solicitud crediticia para poder evaluar este módulo independiente.
        </p>
      </div>
    );
  }

  const currentMetaIndex = MODULE_META.findIndex((m) => m.id === moduleId);
  const currentMeta = MODULE_META[currentMetaIndex] || MODULE_META[0];
  const prevMeta = currentMetaIndex > 0 ? MODULE_META[currentMetaIndex - 1] : null;
  const nextMeta = currentMetaIndex < MODULE_META.length - 1 ? MODULE_META[currentMetaIndex + 1] : null;

  const Icon = currentMeta.icon;
  const p = activeDossier.personal;
  const b = activeDossier.business;
  const t = activeDossier.terms;
  const is = activeDossier.incomeStatement;
  const bs = activeDossier.balanceSheet;
  const pc = activeDossier.paymentCapacity;
  const q = activeDossier.qualitative;
  const r = activeDossier.ratios;
  const famExpenses = activeDossier.familyExpenses?.totalFamilyExpenses || 0;

  // Calculo de márgenes
  const grossMargin = is.salesIncome > 0 ? (is.grossProfit / is.salesIncome) * 100 : 0;
  const coverageRatio = t.proposedInstallment > 0 ? pc.availableFlow / t.proposedInstallment : 1.5;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        {/* Module Title & Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl ${currentMeta.bg} ${currentMeta.border} border flex items-center justify-center shrink-0 ${currentMeta.color} shadow-lg shadow-blue-500/5`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Módulo Independiente • Paso {currentMeta.step} de 8
                </span>
                <span className="text-[10px] font-semibold text-blue-400">
                  {activeDossier.code}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                {currentMeta.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {prevMeta && (
              <button
                onClick={() => setActiveTab(prevMeta.id)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title={`Ir a ${prevMeta.title}`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior:</span>
                <span>{prevMeta.step}</span>
              </button>
            )}

            {nextMeta && (
              <button
                onClick={() => setActiveTab(nextMeta.id)}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                title={`Ir a ${nextMeta.title}`}
              >
                <span className="hidden sm:inline">Siguiente:</span>
                <span>{nextMeta.step}. {nextMeta.title.replace(/^\d+\.\s*/, '')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => openDossierWithTab(activeDossier.id, moduleId)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Modal 360°</span>
            </button>

            <button
              onClick={() => {
                setSelectedDossierId(activeDossier.id);
                setIsPrintModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Dossier Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-400 font-bold shrink-0">Expediente en evaluación:</span>
            <select
              value={activeDossier.id}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 truncate cursor-pointer max-w-xs sm:max-w-md"
            >
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.personal.fullName} ({d.business.businessName}) • S/ {d.terms.requestedAmount.toLocaleString('es-PE')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-[11px] shrink-0">
            <span className="text-slate-400">
              Solicitud: <strong className="text-white">S/ {t.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="text-slate-400">
              Plazo: <strong className="text-white">{t.termMonths}m</strong>
            </span>
            <span className="text-slate-400">
              Cuota: <strong className="text-blue-400 font-mono">S/ {t.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* INDEPENDENT MODULE CONTENT */}

      {/* 1. SOLICITANTE */}
      {moduleId === 'solicitante' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Applicant Card */}
            <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Ficha Integral del Titular Solicitante</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {p.documentType}: {p.documentNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Nombres y Apellidos</span>
                  <strong className="text-white text-base block mt-0.5">{p.fullName}</strong>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Documento de Identidad</span>
                  <strong className="text-white text-base font-mono block mt-0.5">{p.documentType} {p.documentNumber}</strong>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Edad y Fecha de Nacimiento</span>
                  <span className="text-white font-medium block mt-0.5">{p.age} años ({p.birthDate})</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estado Civil</span>
                  <span className="text-white font-medium block mt-0.5">{p.maritalStatus}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Carga Familiar</span>
                  <span className="text-white font-medium block mt-0.5">{p.dependentsCount} dependientes directos</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Teléfono de Contacto</span>
                  <span className="text-white font-medium block mt-0.5">{p.phone}</span>
                </div>
                <div className="sm:col-span-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dirección Domiciliaria</span>
                  <span className="text-white font-medium block mt-0.5">{p.homeAddress}</span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">{p.district}, {p.province} - {p.department}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ubigeo / Región</span>
                  <span className="text-white font-medium block mt-0.5">{p.department}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Provincia / Distrito</span>
                  <span className="text-white font-medium block mt-0.5">{p.province} / {p.district}</span>
                </div>
              </div>
            </div>

            {/* Credit Bureau & Risk Summary */}
            <div className="space-y-4">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Historial Crediticio (SBS)</span>
                </h3>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-300 font-bold">Calificación SBS:</span>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      100% NORMAL (0)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    El solicitante no presenta deudas vencidas, protestos ni morosidades en el sistema financiero regulado.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Score de Buró:</span>
                    <strong className="text-white">745 pts (Bajo Riesgo)</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Obligaciones Actuales:</span>
                    <strong className="text-white">S/ {pc.currentFinancialObligations.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Estado Civil:</span>
                    <strong className="text-white">{p.maritalStatus}</strong>
                  </div>
                </div>
              </div>

              {/* Quick switch to another applicant */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-bold block mb-2">Otros solicitantes registrados:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {dossiers.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDossierId(d.id)}
                      className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                        d.id === activeDossier.id
                          ? 'bg-blue-600/20 text-blue-300 font-bold border border-blue-500/40'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="truncate">{d.personal.fullName}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{d.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. NEGOCIO */}
      {moduleId === 'negocio' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                  <span>Unidad Económica y Comercial</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluación in-situ del negocio, mercado local, antigüedad y referencias comerciales
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 self-start sm:self-auto">
                {b.sector} • {b.formality}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nombre Comercial</span>
                <strong className="text-white text-base block mt-0.5">{b.businessName}</strong>
              </div>
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Giro / Actividad Económica</span>
                <strong className="text-white text-sm block mt-0.5">{b.activityType}</strong>
              </div>
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Antigüedad en el Negocio</span>
                <strong className="text-white text-base block mt-0.5">
                  {b.operatingTimeYears} años y {b.operatingTimeMonths} meses
                </strong>
              </div>
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Condición del Local</span>
                <span className="text-white font-medium block mt-0.5">{b.businessType}</span>
              </div>
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Personal Ocupado</span>
                <span className="text-white font-medium block mt-0.5">{b.employeesCount} trabajadores</span>
              </div>
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Régimen Tributario</span>
                <span className="text-white font-medium block mt-0.5">{b.formality}</span>
              </div>
              <div className="sm:col-span-3 p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Dirección del Negocio / Establecimiento</span>
                <span className="text-white font-medium block mt-0.5">{b.businessAddress}</span>
              </div>
              <div className="sm:col-span-3 p-4 bg-slate-950/90 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Descripción de las Operaciones Diarias</span>
                <p className="text-slate-200 leading-relaxed">{b.activityDescription}</p>
              </div>
            </div>

            {/* Commercial references & suppliers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  <span>Principales Proveedores y Condiciones</span>
                </h4>
                <p className="text-slate-300">
                  Compras al contado y crédito a 15 días con distribuidoras mayoristas reconocidas. Historial de cumplimiento intachable.
                </p>
              </div>
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Clientela y Dinámica de Ventas</span>
                </h4>
                <p className="text-slate-300">
                  Clientela vecinal y recurrente de alto flujo diario. 90% ventas al contado directo y billeteras digitales (Yape / Plin).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CRÉDITO */}
      {moduleId === 'credito' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  <span>Estructura y Condiciones de la Solicitud Crediticia</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Parámetros financieros propuestos, cálculo de cuotas y cronograma referencial
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto">
                Producto: Microcrédito PyME
              </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monto Solicitado</span>
                <strong className="text-xl text-white font-mono block">
                  S/ {t.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
                <span className="text-[10px] text-slate-400">Moneda: Soles (PEN)</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Plazo de Pago</span>
                <strong className="text-xl text-white block">{t.termMonths} meses</strong>
                <span className="text-[10px] text-slate-400">Frecuencia: {t.paymentFrequency}</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuota Mensual Estimada</span>
                <strong className="text-xl text-blue-400 font-mono block">
                  S/ {t.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
                <span className="text-[10px] text-slate-400">Capital + Interés + Desgravamen</span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasa de Interés (TEA)</span>
                <strong className="text-xl text-emerald-400 block">28.50%</strong>
                <span className="text-[10px] text-slate-400">TEM efectiva: 2.11%</span>
              </div>
            </div>

            {/* Credit Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Destino del Crédito</span>
                <p className="text-slate-200 font-medium">
                  {t.destinationDescription || t.destination || 'Capital de trabajo para reposición y diversificación de inventario de alta rotación.'}
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Garantías Ofrecidas</span>
                <p className="text-slate-200 font-medium">
                  Garantía personal y fianza solidaria; prenda sobre mercaderías y activos del establecimiento comercial.
                </p>
              </div>
            </div>

            {/* Amortization Schedule Table */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Cronograma Referencial de Amortización (Cuotas fijas sistema francés)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Simulación a {t.termMonths} meses</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                      <th className="py-2.5 px-3">N° Cuota</th>
                      <th className="py-2.5 px-3">Saldo Inicial</th>
                      <th className="py-2.5 px-3">Amortización</th>
                      <th className="py-2.5 px-3">Interés</th>
                      <th className="py-2.5 px-3">Seguro Desg.</th>
                      <th className="py-2.5 px-3 text-right">Cuota Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].slice(0, Math.min(t.termMonths, 12)).map((cuota) => {
                      const initialBalance = t.requestedAmount - ((cuota - 1) * (t.requestedAmount / t.termMonths));
                      const amort = t.requestedAmount / t.termMonths;
                      const interest = initialBalance * 0.0211;
                      const insurance = 12.50;
                      return (
                        <tr key={cuota} className="hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-sans font-bold text-white">Cuota {cuota}</td>
                          <td className="py-2 px-3">S/ {Math.max(0, initialBalance).toFixed(2)}</td>
                          <td className="py-2 px-3 text-emerald-400">S/ {amort.toFixed(2)}</td>
                          <td className="py-2 px-3 text-slate-400">S/ {interest.toFixed(2)}</td>
                          <td className="py-2 px-3 text-slate-400">S/ {insurance.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-bold text-blue-400">
                            S/ {t.proposedInstallment.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. INGRESOS Y GASTOS */}
      {moduleId === 'ingresos_gastos' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span>Estado de Pérdidas y Ganancias (P&L)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Desglose mensual de ventas, costo de mercaderías, gastos operativos y canasta familiar
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                Margen Bruto: {grossMargin.toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Ingresos & Costos del Negocio */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
                  1. Flujo Operativo del Negocio
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300 font-semibold">Ventas Mensuales Totales (+)</span>
                    <strong className="text-white text-sm font-mono">S/ {is.salesIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60 text-rose-400">
                    <span>Costo de Ventas / Mercaderías (-)</span>
                    <span className="font-mono font-bold">- S/ {is.costOfSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-emerald-400 font-bold bg-emerald-500/10 px-2 rounded">
                    <span>Utilidad Bruta</span>
                    <span className="font-mono">S/ {is.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60 text-slate-400">
                    <span>Gastos Operativos del Negocio (-)</span>
                    <span className="font-mono text-rose-300 font-bold">- S/ {is.operatingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-white font-black text-sm bg-slate-900 px-3 rounded-lg border border-slate-800">
                    <span>Resultado Operativo del Negocio</span>
                    <span className="text-blue-400 font-mono">S/ {is.operatingResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Gastos Familiares y Excedente */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
                  2. Canasta Familiar y Excedente Neto
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-300">Resultado Operativo</span>
                    <strong className="text-white font-mono">S/ {is.operatingResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60 text-rose-400">
                    <span>Gastos Familiares (-)</span>
                    <span className="font-mono font-bold">- S/ {famExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60 text-slate-400">
                    <span>Otros Ingresos (+)</span>
                    <span className="font-mono text-emerald-400 font-bold">+ S/ {is.otherIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-800 text-slate-400">
                    <span>Obligaciones Financieras (-)</span>
                    <span className="font-mono text-rose-400 font-bold">- S/ {is.financialInstallments.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-white font-black text-sm bg-emerald-500/15 px-3 rounded-lg border border-emerald-500/30">
                    <span>Flujo Disponible Neto</span>
                    <span className="text-emerald-400 font-mono">S/ {pc.availableFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ESTADOS FINANCIEROS Y BALANCE */}
      {moduleId === 'balance' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-sky-400" />
                  <span>Balance General y Estructura Patrimonial</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Valorización de activos, inventarios, obligaciones con terceros y patrimonio neto
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Activo = Pasivo + Patrimonio: OK
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* ACTIVOS */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-2">
                  Activos Totales
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                    <span>Efectivo en Caja y Bancos</span>
                    <span className="font-mono font-bold text-white">S/ {(bs.cash + bs.bankDeposits).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                    <span>Cuentas por Cobrar Comerciales</span>
                    <span className="font-mono font-bold text-white">S/ {bs.accountsReceivableValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                    <span>Inventario Valorizado de Mercadería</span>
                    <span className="font-mono font-bold text-white">S/ {bs.inventoryValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-sky-400 font-bold bg-sky-500/10 px-2 rounded">
                    <span>Total Activo Corriente</span>
                    <span className="font-mono">S/ {bs.totalCurrentAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                    <span>Activo No Corriente (Maquinarias, Mobiliario, Inmuebles)</span>
                    <span className="font-mono font-bold text-white">S/ {bs.totalNonCurrentAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-2 text-white font-black text-sm bg-slate-900 px-3 rounded-lg border border-slate-800">
                    <span>TOTAL ACTIVO</span>
                    <span className="text-sky-400 font-mono">S/ {bs.totalAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* PASIVOS Y PATRIMONIO */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
                  Pasivos y Patrimonio Neto
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                    <span>Pasivo Corriente (Deudas a corto plazo)</span>
                    <span className="font-mono font-bold text-rose-300">S/ {bs.totalCurrentLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
                    <span>Pasivo No Corriente (Deudas a largo plazo)</span>
                    <span className="font-mono font-bold text-rose-300">S/ {bs.totalNonCurrentLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-rose-400 font-bold bg-rose-500/10 px-2 rounded">
                    <span>TOTAL PASIVO</span>
                    <span className="font-mono">S/ {bs.totalLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-emerald-400 font-bold bg-emerald-500/10 px-2 rounded">
                    <span>PATRIMONIO NETO</span>
                    <span className="font-mono">S/ {bs.equity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between py-2 text-white font-black text-sm bg-slate-900 px-3 rounded-lg border border-slate-800">
                    <span>TOTAL PASIVO + PATRIMONIO</span>
                    <span className="text-purple-400 font-mono">S/ {(bs.totalLiabilities + bs.equity).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratios Financieros */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Ratios de Liquidez y Solvencia Crediticia
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Ratio de Endeudamiento</span>
                  <strong className="text-white text-base font-mono block mt-0.5">{r.indebtednessRatio.toFixed(1)}%</strong>
                  <span className="text-[10px] text-emerald-400 font-semibold">Saludable (&lt; 60%)</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Carga Financiera</span>
                  <strong className="text-white text-base font-mono block mt-0.5">{r.financialBurdenRatio.toFixed(1)}%</strong>
                  <span className="text-[10px] text-emerald-400 font-semibold">Bajo impacto</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Cobertura de Deuda</span>
                  <strong className="text-white text-base font-mono block mt-0.5">{r.debtCoverageRatio.toFixed(2)}x</strong>
                  <span className="text-[10px] text-blue-400 font-semibold">Capacidad sólida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CAPACIDAD DE PAGO */}
      {moduleId === 'capacidad' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" />
                  <span>Análisis de Capacidad de Pago y Cobertura (RCI)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verificación de solvencia post-cuota, margen de seguridad y simulación de escenarios adversos
                </p>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                coverageRatio >= 1.5
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                RCI Cobertura: {coverageRatio.toFixed(2)}x
              </span>
            </div>

            {/* Capacity Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Flujo Disponible Neto</span>
                <strong className="text-2xl text-emerald-400 font-mono block">
                  S/ {pc.availableFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
                <span className="text-[10px] text-slate-400">Ingresos menos gastos y deudas vigentes</span>
              </div>
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuota Mensual Propuesta</span>
                <strong className="text-2xl text-blue-400 font-mono block">
                  S/ {t.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
                <span className="text-[10px] text-slate-400">Compromiso mensual del crédito</span>
              </div>
              <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Libre Post-Cuota</span>
                <strong className={`text-2xl font-mono block ${
                  pc.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  S/ {pc.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
                <span className="text-[10px] text-slate-400">Colchón de seguridad para imprevistos</span>
              </div>
            </div>

            {/* Stress Test */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Pruebas de Estrés y Sensibilidad Crediticia</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-white font-bold block">Escenario Base Normal</span>
                  <div className="text-emerald-400 font-mono text-sm">RCI: {coverageRatio.toFixed(2)}x</div>
                  <p className="text-[11px] text-slate-400">Excedente post-cuota normal y confortable.</p>
                </div>
                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-white font-bold block">Estrés: Caída de Ventas (-15%)</span>
                  <div className="text-amber-400 font-mono text-sm">
                    RCI: {(coverageRatio * 0.85).toFixed(2)}x
                  </div>
                  <p className="text-[11px] text-slate-400">El cliente aún mantiene cobertura superior a 1.2x.</p>
                </div>
                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-white font-bold block">Estrés: Alza de Costos (+10%)</span>
                  <div className="text-amber-400 font-mono text-sm">
                    RCI: {(coverageRatio * 0.88).toFixed(2)}x
                  </div>
                  <p className="text-[11px] text-slate-400">Capacidad de amortización sólida con margen.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. INVENTARIO Y DOCUMENTOS */}
      {moduleId === 'inventario_documentos' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Valorized Inventory */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span>Inventario Valorizado de Mercadería</span>
                </h3>
                <span className="text-xs font-mono font-bold text-purple-300">
                  Total: S/ {bs.inventoryValue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                      <th className="py-2">Producto / Categoría</th>
                      <th className="py-2 text-right">Cant.</th>
                      <th className="py-2 text-right">C. Unit</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {activeDossier.inventory && activeDossier.inventory.length > 0 ? (
                      activeDossier.inventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 font-sans font-medium text-white">{item.productName}</td>
                          <td className="py-2.5 text-right">{item.quantity} u</td>
                          <td className="py-2.5 text-right">S/ {item.unitCost.toFixed(2)}</td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold">S/ {item.totalCostValue.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="hover:bg-slate-800/40">
                          <td className="py-2.5 font-sans font-medium text-white">Abarrotes y alimentos secos</td>
                          <td className="py-2.5 text-right">120 u</td>
                          <td className="py-2.5 text-right">S/ 45.00</td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold">S/ 5,400.00</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="py-2.5 font-sans font-medium text-white">Bebidas, lácteos y enlatados</td>
                          <td className="py-2.5 text-right">95 u</td>
                          <td className="py-2.5 text-right">S/ 38.00</td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold">S/ 3,610.00</td>
                        </tr>
                        <tr className="hover:bg-slate-800/40">
                          <td className="py-2.5 font-sans font-medium text-white">Artículos de limpieza y aseo</td>
                          <td className="py-2.5 text-right">80 u</td>
                          <td className="py-2.5 text-right">S/ 25.00</td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold">S/ 2,000.00</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Checklist y Documentación Digital</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  100% Verificado
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { name: 'Copia de DNI Titular Solicitante', file: 'DNI_Titular_vigente.pdf', status: 'Conforme', date: '12/10/2026' },
                  { name: 'Recibo de Servicio de Luz / Agua (Domicilio)', file: 'Recibo_Luz_Enel.pdf', status: 'Conforme', date: '10/10/2026' },
                  { name: 'Ficha RUC / Licencia de Funcionamiento', file: 'Ficha_RUC_Sunat.pdf', status: 'Conforme', date: '08/10/2026' },
                  { name: 'Cuaderno / Registro de Compras y Ventas', file: 'Fotos_Registro_Ventas.jpg', status: 'Conforme', date: '12/10/2026' },
                  { name: 'Fotos del Negocio y Mercaderías in situ', file: 'Evidencia_Visita_Local.zip', status: 'Conforme', date: '13/10/2026' },
                  { name: 'Croquis de Ubicación Domicilio y Negocio', file: 'Croquis_Ubicacion.pdf', status: 'Conforme', date: '11/10/2026' },
                ].map((doc, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-200 block truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate">{doc.file} • {doc.date}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. CONCLUSIÓN */}
      {moduleId === 'conclusion' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-teal-400" />
                  <span>Dictamen y Conclusión del Comité de Créditos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Síntesis del analista, factores mitigantes, matriz cualitativa y resolución
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Dictamen: RECOMENDADO FAVORABLE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Fortalezas y Mitigantes */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
                  Fortalezas Clave Identificadas
                </h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Más de 5 años de funcionamiento continuo en el mismo punto comercial.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Historial crediticio 100% normal sin moras en el sistema SBS.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Ratio de cobertura de cuota (RCI) holgado de {coverageRatio.toFixed(2)}x.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Mercaderías de alta rotación y demanda diaria en zona consolidada.</span>
                  </li>
                </ul>
              </div>

              {/* Riesgos y Mitigantes */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400">
                  Riesgos y Factores de Mitigación
                </h4>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Riesgo:</strong> Competencia local en abarrotes. <em>Mitigante:</em> Clientela fidelizada y horarios extendidos de atención.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Riesgo:</strong> Inflación en costos de insumos. <em>Mitigante:</em> Margen de seguridad amplio de S/ {pc.remainingSurplusAfterProposedInstallment.toFixed(2)} post-cuota.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Analyst qualitative notes */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">
                Conclusión y Sustento Técnico del Asesor / Analista:
              </span>
              <p className="text-slate-200 leading-relaxed italic">
                "{q.analystComments || 'Cliente formal y puntual, con alto compromiso crediticio. La visita presencial corroboró inventarios valorizados consistentes con los registros contables. La capacidad de pago permite atender la cuota holgadamente aún bajo escenarios de estrés.'}"
              </p>
            </div>

            {/* Final Action Bar */}
            <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-blue-950/40 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-white font-bold text-xs block">Estado de la Solicitud:</span>
                <span className="text-emerald-400 text-sm font-black uppercase">
                  {activeDossier.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => updateDossierStatus(activeDossier.id, 'finalizada', 'Dictamen favorable aprobado en Comité de Créditos')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  ✓ Aprobar Dictamen Final
                </button>
                <button
                  onClick={() => {
                    setSelectedDossierId(activeDossier.id);
                    setIsPrintModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Acta de Comité</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
