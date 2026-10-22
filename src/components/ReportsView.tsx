import React from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Building2,
  Users,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { dossiers, setSelectedDossierId } = useEvalua();

  // Metrics
  const totalDossiers = dossiers.length;
  const totalRequestedAmount = dossiers.reduce((acc, d) => acc + d.terms.requestedAmount, 0);
  const averageAmount = totalDossiers > 0 ? totalRequestedAmount / totalDossiers : 0;
  const totalSurplus = dossiers.reduce((acc, d) => acc + d.paymentCapacity.remainingSurplusAfterProposedInstallment, 0);

  // Status breakdown
  const statusCounts = {
    registrada: dossiers.filter(d => d.status === 'registrada').length,
    en_evaluacion: dossiers.filter(d => d.status === 'en_evaluacion').length,
    documentacion_pendiente: dossiers.filter(d => d.status === 'documentacion_pendiente').length,
    en_verificacion: dossiers.filter(d => d.status === 'en_verificacion').length,
    finalizada: dossiers.filter(d => d.status === 'finalizada').length
  };

  // Sector breakdown
  const sectorMap = dossiers.reduce((acc, d) => {
    const s = d.business.sector || 'Otros';
    acc[s] = (acc[s] || 0) + d.terms.requestedAmount;
    return acc;
  }, {} as Record<string, number>);

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'Código Expediente',
      'Solicitante',
      'Tipo Doc',
      'N° Documento',
      'Teléfono',
      'Distrito',
      'Nombre Negocio',
      'Sector Económico',
      'Monto Solicitado',
      'Plazo (Meses)',
      'Cuota Propuesta',
      'Ventas Mensuales',
      'Utilidad Bruta',
      'Resultado Operativo',
      'Total Activos',
      'Total Pasivos',
      'Patrimonio',
      'Flujo Neto Caja',
      'Saldo Post-Cuota',
      'Endeudamiento (%)',
      'Carga Financiera (%)',
      'Cobertura Obligaciones',
      'Estado',
      'Analista Asignado',
      'Agencia',
      'Fecha Registro'
    ];

    const rows = dossiers.map((d) => [
      `"${d.code}"`,
      `"${d.personal.fullName}"`,
      `"${d.personal.documentType}"`,
      `"${d.personal.documentNumber}"`,
      `"${d.personal.phone}"`,
      `"${d.personal.district}"`,
      `"${d.business.businessName}"`,
      `"${d.business.sector}"`,
      d.terms.requestedAmount,
      d.terms.termMonths,
      d.terms.proposedInstallment,
      d.incomeStatement.salesIncome,
      d.incomeStatement.grossProfit,
      d.incomeStatement.operatingResult,
      d.balanceSheet.totalAssets,
      d.balanceSheet.totalLiabilities,
      d.balanceSheet.equity,
      d.cashFlow.netCashFlow,
      d.paymentCapacity.remainingSurplusAfterProposedInstallment,
      d.ratios.indebtednessRatio.toFixed(1),
      d.ratios.financialBurdenRatio.toFixed(1),
      d.ratios.debtCoverageRatio.toFixed(2),
      `"${d.status}"`,
      `"${d.assignedAnalystName}"`,
      `"${d.agency}"`,
      `"${d.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `evalua_reporte_cartera_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Reportes Ejecutivos y Estadísticas de Cartera
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consolidado general de expedientes evaluados, indicadores y exportación a Excel / CSV
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Cartera a Excel / CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Cartera Evaluada</span>
          <div className="text-2xl font-black text-white mt-1">
            S/ {totalRequestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">En {totalDossiers} expedientes registrados</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ticket Promedio Solicitado</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            S/ {averageAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Monto medio por crédito</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Solicitantes en Base</span>
          <div className="text-2xl font-black text-purple-400 mt-1">
            {totalDossiers}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Titulares de crédito</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Excedente Post-Cuota Total</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            S/ {totalSurplus.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Capacidad neta agregada</span>
        </div>
      </div>

      {/* Breakdown Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            <span>Distribución de Solicitudes por Estado</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Registradas', count: statusCounts.registrada, color: 'bg-slate-700' },
              { label: 'En Evaluación', count: statusCounts.en_evaluacion, color: 'bg-blue-600' },
              { label: 'Documentación Pendiente', count: statusCounts.documentacion_pendiente, color: 'bg-amber-500' },
              { label: 'En Verificación', count: statusCounts.en_verificacion, color: 'bg-purple-600' },
              { label: 'Finalizadas', count: statusCounts.finalizada, color: 'bg-emerald-600' }
            ].map((item) => {
              const pct = totalDossiers > 0 ? (item.count / totalDossiers) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{item.label}</span>
                    <span className="font-bold">{item.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución por Sector */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Distribución de Cartera por Sector Económico</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(sectorMap).map(([sec, amt]) => {
              const pct = totalRequestedAmount > 0 ? (amt / totalRequestedAmount) * 100 : 0;
              return (
                <div key={sec} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>{sec}</span>
                    <span className="font-bold">S/ {amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
