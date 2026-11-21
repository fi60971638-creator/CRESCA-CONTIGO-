import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  FileText,
  Clock,
  Bell,
  CheckCircle2,
  BarChart3,
  Zap,
  ArrowRight,
  Search,
  Filter,
  Eye,
  Printer,
  Info,
  FolderKanban,
  Upload,
  ShieldCheck
} from 'lucide-react';
import { ApplicationStatus } from '../types/evalua';

export const DashboardView: React.FC = () => {
  const {
    dossiers,
    auditLogs,
    setActiveTab,
    setSelectedDossierId,
    setIsPrintModalOpen,
    setIsNewDossierModalOpen
  } = useEvalua();

  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');

  // Real metrics derived from dossiers
  const totalDossiers = dossiers.length;
  const countRegistered = dossiers.filter((d) => d.status === 'registrada').length;
  const countInEvaluation = dossiers.filter(
    (d) => d.status === 'en_evaluacion' || d.status === 'en_verificacion'
  ).length;
  const countDocPendingDossiers = dossiers.filter(
    (d) => d.status === 'documentacion_pendiente'
  ).length;
  const countPendingIndividualDocs = dossiers.reduce(
    (sum, d) =>
      sum + d.documents.filter((doc) => doc.status === 'Pendiente' || doc.status === 'Observado').length,
    0
  );
  const countFinalized = dossiers.filter((d) => d.status === 'finalizada').length;
  const totalAmount = dossiers.reduce((sum, d) => sum + d.terms.requestedAmount, 0);

  // Donut Chart Calculations
  const evalAndRegCount = countInEvaluation + countRegistered;
  const donutSegments = [
    {
      label: 'En evaluación',
      count: evalAndRegCount,
      color: '#1D63ED',
      pct: totalDossiers > 0 ? (evalAndRegCount / totalDossiers) * 100 : 0
    },
    {
      label: 'Doc. pendiente',
      count: countDocPendingDossiers,
      color: '#F59E0B',
      pct: totalDossiers > 0 ? (countDocPendingDossiers / totalDossiers) * 100 : 0
    },
    {
      label: 'Finalizada',
      count: countFinalized,
      color: '#16A34A',
      pct: totalDossiers > 0 ? (countFinalized / totalDossiers) * 100 : 0
    }
  ];

  // SVG Donut Stroke Math (r = 52, circumference = 2 * PI * 52 ≈ 326.73)
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let cumulativePct = 0;

  // Activity by Economic Sector (differentiated colors)
  const sectorColors = ['#1D63ED', '#16A34A', '#8B5CF6', '#F59E0B', '#0EA5E9'];
  const sectorStats = Object.entries(
    dossiers.reduce((acc, d) => {
      const sec = d.business.sector || 'Otros';
      if (!acc[sec]) acc[sec] = { count: 0, amount: 0 };
      acc[sec].count += 1;
      acc[sec].amount += d.terms.requestedAmount;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>)
  ).map(([sector, data], idx) => ({
    sector,
    count: data.count,
    amount: data.amount,
    color: sectorColors[idx % sectorColors.length]
  }));

  const maxSectorAmount = Math.max(...sectorStats.map((s) => s.amount), 1);

  // Recent Activity combined from auditLogs
  const recentActivity = auditLogs.slice(0, 4);

  // Filtered table dossiers
  const filteredDossiers = dossiers.filter((d) => {
    const q = tableSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.code.toLowerCase().includes(q) ||
      d.personal.fullName.toLowerCase().includes(q) ||
      d.personal.documentNumber.toLowerCase().includes(q) ||
      d.business.businessName.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter !== 'todas' && d.status !== statusFilter) return false;
    return true;
  });

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case 'registrada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-[#0284C7] border border-sky-200/70 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
            Registrada
          </span>
        );
      case 'en_evaluacion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EFF6FF] text-[#1D63ED] border border-blue-200/70 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED]" />
            En evaluación
          </span>
        );
      case 'documentacion_pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Doc. pendiente
          </span>
        );
      case 'en_verificacion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/70 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            En verificación
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Finalizada
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Panel de gestión crediticia
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organiza, consulta y da seguimiento a tus expedientes en soles (S/)
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-blue-200/80 text-xs font-semibold text-[#1D63ED] shadow-2xs self-start md:self-auto">
          <Info className="w-4 h-4 shrink-0" />
          <span>Entorno de demostración · Datos referenciales</span>
        </div>
      </div>

      {/* 4 KPI Cards Row (Exact visual reference: tinted white cards + circular colored icon + sparkline) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Expedientes registrados (Blue) */}
        <button
          onClick={() => setActiveTab('expedientes')}
          className="text-left p-5 rounded-2xl bg-gradient-to-br from-white to-[#EFF6FF] border border-blue-200/70 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#1D63ED] text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 block">Expedientes registrados</span>
                <span className="text-3xl font-extrabold text-[#0B2545] tracking-tight tabular-nums block mt-0.5">
                  {totalDossiers}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#1D63ED] tabular-nums">
              S/ {totalAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })} en análisis
            </span>
            <svg viewBox="0 0 80 24" className="w-16 h-6 text-[#1D63ED] shrink-0" fill="none">
              <path
                d="M2 20 C 16 18, 22 10, 34 14 C 46 18, 54 6, 78 4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        {/* KPI 2: En evaluación (Green) */}
        <button
          onClick={() => setActiveTab('solicitudes')}
          className="text-left p-5 rounded-2xl bg-gradient-to-br from-white to-[#ECFDF5] border border-emerald-200/70 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-sm shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 block">En evaluación</span>
                <span className="text-3xl font-extrabold text-[#0B2545] tracking-tight tabular-nums block mt-0.5">
                  {evalAndRegCount}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#16A34A] tabular-nums">
              {totalDossiers > 0 ? `${((evalAndRegCount / totalDossiers) * 100).toFixed(0)}% del total` : '0% del total'}
            </span>
            <svg viewBox="0 0 80 24" className="w-16 h-6 text-[#16A34A] shrink-0" fill="none">
              <path
                d="M2 19 C 18 16, 26 17, 40 11 C 54 5, 64 11, 78 5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        {/* KPI 3: Documentos pendientes (Purple) */}
        <button
          onClick={() => setActiveTab('inventario_documentos')}
          className="text-left p-5 rounded-2xl bg-gradient-to-br from-white to-[#F5F3FF] border border-purple-200/70 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center shadow-sm shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 block">Documentos pendientes</span>
                <span className="text-3xl font-extrabold text-[#0B2545] tracking-tight tabular-nums block mt-0.5">
                  {countPendingIndividualDocs}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#8B5CF6] tabular-nums">
              {countDocPendingDossiers} expediente(s) observados
            </span>
            <svg viewBox="0 0 80 24" className="w-16 h-6 text-[#8B5CF6] shrink-0" fill="none">
              <path
                d="M2 16 C 16 20, 28 8, 42 14 C 56 20, 66 9, 78 12"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        {/* KPI 4: Solicitudes finalizadas (Amber/Orange) */}
        <button
          onClick={() => setActiveTab('conclusion')}
          className="text-left p-5 rounded-2xl bg-gradient-to-br from-white to-[#FFFBEB] border border-amber-200/70 shadow-2xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600 block">Solicitudes finalizadas</span>
                <span className="text-3xl font-extrabold text-[#0B2545] tracking-tight tabular-nums block mt-0.5">
                  {countFinalized}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#D97706] tabular-nums">
              Listas para informe PDF
            </span>
            <svg viewBox="0 0 80 24" className="w-16 h-6 text-[#F59E0B] shrink-0" fill="none">
              <path
                d="M2 21 C 18 19, 30 12, 46 13 C 58 14, 66 5, 78 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Charts + Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Donut Chart - Solicitudes por estado */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#1D63ED]" />
            <h2 className="text-sm font-bold text-[#0B2545]">Solicitudes por estado</h2>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-5 my-auto py-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0">
              <svg viewBox="0 0 132 132" className="w-full h-full -rotate-90">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="18"
                />
                {donutSegments.map((seg) => {
                  const dash = (seg.pct / 100) * circumference;
                  const offset = (cumulativePct / 100) * circumference;
                  cumulativePct += seg.pct;
                  if (seg.pct <= 0) return null;
                  return (
                    <circle
                      key={seg.label}
                      cx="66"
                      cy="66"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="18"
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeDashoffset={-offset}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-[#0B2545] tabular-nums leading-none">
                  {totalDossiers}
                </span>
                <span className="text-[11px] font-medium text-slate-500 mt-1">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 w-full text-xs">
              {donutSegments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-slate-600 font-medium truncate">{seg.label}</span>
                  </div>
                  <span className="font-bold text-[#0B2545] tabular-nums shrink-0">
                    {seg.count} ({seg.pct.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Gráfico de actividad de expedientes (Sectores y Montos en S/) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#16A34A]" />
              <h2 className="text-sm font-bold text-[#0B2545]">Actividad de expedientes</h2>
            </div>
            <span className="text-[11px] font-medium text-slate-500">Por sector</span>
          </div>

          <div className="space-y-3.5 my-auto">
            {sectorStats.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Registra un expediente para visualizar la distribución por sector.
              </div>
            ) : (
              sectorStats.map((item) => {
                const widthPct = Math.max(8, (item.amount / maxSectorAmount) * 100);
                return (
                  <div key={item.sector} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate">{item.sector}</span>
                      <span className="font-mono font-bold text-[#0B2545] tabular-nums shrink-0">
                        S/ {item.amount.toLocaleString('es-PE')} · {item.count} exp.
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Card 3: Actividad reciente */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-[#0B2545]">Actividad reciente</h2>
            </div>
            <button
              onClick={() => setActiveTab('seguimiento')}
              className="text-xs font-bold text-[#1D63ED] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Sin movimientos recientes en la bitácora.
              </div>
            ) : (
              recentActivity.map((log, idx) => {
                const iconStyles = [
                  { bg: 'bg-[#EFF6FF] text-[#1D63ED]', Icon: FileText },
                  { bg: 'bg-emerald-50 text-[#16A34A]', Icon: CheckCircle2 },
                  { bg: 'bg-purple-50 text-[#8B5CF6]', Icon: Upload },
                  { bg: 'bg-amber-50 text-[#F59E0B]', Icon: Clock }
                ][idx % 4];
                const LogIcon = iconStyles.Icon;
                return (
                  <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconStyles.bg}`}>
                        <LogIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{log.details}</p>
                        <p className="text-[11px] text-slate-500 truncate">{log.userName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 tabular-nums">
                      {log.timestamp.split(' ')[0]}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Table Section: Solicitudes recientes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1D63ED] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0B2545]">Solicitudes recientes</h2>
              <p className="text-[11px] text-slate-500">
                Haz clic en un expediente para revisar sus formularios e imprimir en PDF
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Buscar DNI, RUC, nombre o código..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63ED] w-56 sm:w-64"
              />
            </div>

            <div className="relative inline-flex items-center">
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-7 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1D63ED] cursor-pointer"
              >
                <option value="todas">Todos los estados</option>
                <option value="registrada">Registrada</option>
                <option value="en_evaluacion">En evaluación</option>
                <option value="documentacion_pendiente">Doc. pendiente</option>
                <option value="en_verificacion">En verificación</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clean Light Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-600 font-bold">
                <th className="py-3.5 pl-5">Código</th>
                <th className="py-3.5 px-3">Solicitante</th>
                <th className="py-3.5 px-3">Negocio</th>
                <th className="py-3.5 px-3 text-right">Monto solicitado</th>
                <th className="py-3.5 px-3">Fecha</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                <th className="py-3.5 pr-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <p className="font-semibold">No hay expedientes que coincidan con el filtro.</p>
                    <button
                      onClick={() => setIsNewDossierModalOpen(true)}
                      className="mt-2 px-4 py-1.5 rounded-xl bg-[#1D63ED] text-white font-bold text-xs cursor-pointer"
                    >
                      + Registrar primer expediente
                    </button>
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDossierId(d.id)}
                    className="hover:bg-[#EFF6FF]/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 pl-5 font-mono font-bold text-[#1D63ED] whitespace-nowrap">
                      {d.code}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-[#1D63ED] transition-colors">
                        {d.personal.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {d.personal.documentType}: {d.personal.documentNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <div className="font-medium text-slate-800">{d.business.businessName}</div>
                      <div className="text-[11px] text-slate-500">{d.business.sector}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                      S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                      {d.createdAt}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {getStatusLabel(d.status)}
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDossierId(d.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EFF6FF] hover:bg-[#1D63ED] text-[#1D63ED] hover:text-white font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDossierId(d.id);
                            setIsPrintModalOpen(true);
                          }}
                          title="Imprimir / Exportar PDF"
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-[#1D63ED] hover:border-blue-200 bg-white transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Support Disclaimer */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-[#1D63ED] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#0B2545]">Consideración operativa:</strong> EVALÚA PERÚ es una herramienta de apoyo para organizar, calcular y documentar información crediticia y financiera. No aprueba ni rechaza créditos ni sustituye el criterio ni la decisión final de las entidades financieras autorizadas. Los registros precargados corresponden a datos ficticios de demostración.
        </p>
      </div>
    </div>
  );
};
