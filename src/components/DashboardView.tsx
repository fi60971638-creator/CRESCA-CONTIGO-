import React from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  FileSpreadsheet,
  Clock,
  FileCheck2,
  FileWarning,
  CalendarClock,
  CheckCircle2,
  PlusCircle,
  FolderOpen,
  Eye,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  UserCheck,
  Activity
} from 'lucide-react';
import { ApplicationStatus } from '../types/evalua';
import { Badge } from './ui/Badge';
import { ScoreRing } from './ui/ScoreRing';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    dossiers,
    setActiveTab,
    setSelectedDossierId,
    setIsNewDossierModalOpen
  } = useEvalua();

  // Metrics:
  const totalRegistered = dossiers.filter(d => d.status === 'registrada').length;
  const inEvaluation = dossiers.filter(d => d.status === 'en_evaluacion' || d.status === 'en_verificacion').length;
  const pendingDocs = dossiers.filter(d => d.status === 'documentacion_pendiente').length;
  const finalized = dossiers.filter(d => d.status === 'finalizada').length;

  const totalDossiersCount = dossiers.length;
  const totalEvaluatedAmount = dossiers.reduce((acc, d) => acc + d.terms.requestedAmount, 0);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'registrada':
        return <Badge variant="neutral" dot>Registrada</Badge>;
      case 'en_evaluacion':
        return <Badge variant="blue" dot>En evaluación</Badge>;
      case 'documentacion_pendiente':
        return <Badge variant="warning" dot>Doc. pendiente</Badge>;
      case 'en_verificacion':
        return <Badge variant="sky" dot>En verificación</Badge>;
      case 'finalizada':
        return <Badge variant="success" dot>Finalizada</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-evalua-blue bg-evalua-sky px-2.5 py-0.5 rounded-full border border-blue-200/60">
              {currentUser?.agency || 'Sede Central'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium capitalize">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-evalua-navy tracking-tight mt-1.5">
            Panel de evaluación crediticia
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Gestión organizada de solicitudes, análisis económico y expedientes en soles (S/)
          </p>
        </div>

        {/* Action Button: Yellow Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewDossierModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-evalua-yellow hover:bg-[#ebd000] text-slate-950 text-xs font-extrabold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>+ Nueva solicitud</span>
          </button>
        </div>
      </div>

      {/* Featured Overview Banner with Score Indicator */}
      <div className="bg-gradient-to-r from-evalua-navy to-[#00557e] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold">
            <Activity className="w-3.5 h-3.5 text-evalua-yellow" />
            <span>Índice Global de Solvencia de Cartera</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Cartera Evaluada: S/ {totalEvaluatedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {totalDossiersCount} expedientes en trámite. Los cálculos de flujo y cobertura de deuda se actualizan automáticamente al ingresar partidas contables o documentos.
          </p>
        </div>

        {/* Score Ring Gauge */}
        <div className="flex items-center gap-4 z-10 shrink-0 bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/15">
          <ScoreRing
            score={743}
            minScore={300}
            maxScore={850}
            size="sm"
            showBadge={true}
            badgePosition="left"
            animate={false}
          >
            <div className="text-center p-1">
              <span className="block text-[9px] font-bold uppercase text-slate-400">Score</span>
              <span className="block text-base font-black text-evalua-navy">743</span>
            </div>
          </ScoreRing>
          <div className="text-xs pr-2">
            <span className="block font-bold text-white text-sm">Calidad Crediticia Promedio</span>
            <span className="block text-slate-300 text-[11px]">84% con excedente positivo</span>
          </div>
        </div>
      </div>

      {/* 5 KPI Cards: White cards with circular sky icon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Solicitudes registradas */}
        <div
          onClick={() => setActiveTab('solicitudes')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-evalua-blue hover:shadow-md transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Registradas</span>
            <div className="w-8 h-8 rounded-full bg-evalua-sky text-evalua-blue flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-evalua-navy group-hover:text-evalua-blue transition-colors">
            {totalRegistered}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Nuevos expedientes</p>
        </div>

        {/* 2. Solicitudes en evaluación */}
        <div
          onClick={() => setActiveTab('solicitudes')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-evalua-blue hover:shadow-md transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">En evaluación</span>
            <div className="w-8 h-8 rounded-full bg-evalua-sky text-evalua-blue flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-evalua-navy group-hover:text-evalua-blue transition-colors">
            {inEvaluation}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Análisis económico</p>
        </div>

        {/* 3. Solicitudes con documentación pendiente */}
        <div
          onClick={() => setActiveTab('inventario_documentos')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Doc. pendiente</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileWarning className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 transition-colors">
            {pendingDocs}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Faltan requisitos</p>
        </div>

        {/* 4. Solicitudes finalizadas */}
        <div
          onClick={() => setActiveTab('solicitudes')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-evalua-green hover:shadow-md transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Finalizadas</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-evalua-green flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-evalua-green transition-colors">
            {finalized}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Comité / Concluidas</p>
        </div>

        {/* 5. Registro y Análisis Financiero Directo */}
        <div
          onClick={() => setActiveTab('registro_financiero')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-evalua-blue hover:shadow-md transition-all cursor-pointer group shadow-2xs col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estados Financ.</span>
            <div className="w-8 h-8 rounded-full bg-evalua-sky text-evalua-blue flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-evalua-navy group-hover:text-evalua-blue transition-colors">
            10
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Pestañas de análisis</p>
        </div>
      </div>

      {/* Main Table: Expedientes en Gestión */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-evalua-sky text-evalua-blue flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-evalua-navy">Expedientes de Crédito Recientes</h2>
              <p className="text-xs text-slate-500">Listado de solicitantes y estado de evaluación</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('solicitudes')}
            className="text-xs text-evalua-blue hover:text-evalua-navy flex items-center gap-1 font-bold cursor-pointer group"
          >
            <span>Ver todas ({totalDossiersCount})</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Dark Navy Table Header */}
            <thead>
              <tr className="bg-evalua-navy text-white font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 pl-4">Código</th>
                <th className="py-3.5 px-3">Solicitante</th>
                <th className="py-3.5 px-3">Actividad / Negocio</th>
                <th className="py-3.5 px-3 text-right">Monto Solicitado</th>
                <th className="py-3.5 px-3 text-right">Excedente Post-Cuota</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                <th className="py-3.5 pr-4 text-right">Acción</th>
              </tr>
            </thead>
            {/* Table Body with Soft Sky Hover */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {dossiers.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedDossierId(d.id)}
                  className="hover:bg-evalua-sky/60 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 pl-4 font-mono font-bold text-evalua-blue">
                    {d.code}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 group-hover:text-evalua-blue transition-colors">
                      {d.personal.fullName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      DNI: {d.personal.documentNumber} • {d.personal.phone}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">
                    <div className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {d.business.businessName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {d.business.sector} ({d.business.operatingTimeYears} años)
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    <div className="text-[10px] text-slate-500 font-normal">
                      {d.terms.termMonths} meses ({d.terms.paymentFrequency})
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold">
                    <span className={d.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-evalua-green' : 'text-rose-600'}>
                      S/ {d.paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-slate-500 font-normal">Saldo disponible</div>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {getStatusBadge(d.status)}
                  </td>
                  <td className="py-3.5 pr-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDossierId(d.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-evalua-sky text-evalua-blue hover:bg-evalua-blue hover:text-white transition-all text-xs font-bold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abrir</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ethical Statement Footer Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-evalua-blue" />
          <span>Información organizada para evaluación técnica. <strong>EVALÚA apoya el análisis pero no aprueba créditos automáticamente.</strong></span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <span>Moneda oficial: <strong>Soles (S/)</strong></span>
        </div>
      </div>
    </div>
  );
};
