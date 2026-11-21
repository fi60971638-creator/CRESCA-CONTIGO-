import React from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  BarChart3,
  Download,
  PieChart,
  TrendingUp,
  Printer,
  FolderOpen
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { dossiers, setSelectedDossierId, setIsPrintModalOpen } = useEvalua();

  const totalDossiers = dossiers.length;
  const totalRequestedAmount = dossiers.reduce((acc, d) => acc + d.terms.requestedAmount, 0);
  const averageAmount = totalDossiers > 0 ? totalRequestedAmount / totalDossiers : 0;
  const totalSurplus = dossiers.reduce((acc, d) => acc + d.paymentCapacity.remainingSurplusAfterProposedInstallment, 0);

  const statusCounts = {
    registrada: dossiers.filter(d => d.status === 'registrada').length,
    en_evaluacion: dossiers.filter(d => d.status === 'en_evaluacion').length,
    documentacion_pendiente: dossiers.filter(d => d.status === 'documentacion_pendiente').length,
    en_verificacion: dossiers.filter(d => d.status === 'en_verificacion').length,
    finalizada: dossiers.filter(d => d.status === 'finalizada').length
  };

  const sectorMap = dossiers.reduce((acc, d) => {
    const s = d.business.sector || 'Otros';
    acc[s] = (acc[s] || 0) + d.terms.requestedAmount;
    return acc;
  }, {} as Record<string, number>);

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
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
              Reportes Ejecutivos y Estadísticas de Cartera
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Consolidado de expedientes evaluados, exportación Excel/CSV e impresión de fichas en PDF
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar cartera a CSV / Excel</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-white border border-blue-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500">Total Cartera Evaluada</span>
          <div className="text-2xl font-black text-[#0B2545] mt-1 font-mono tabular-nums">
            S/ {totalRequestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">En {totalDossiers} expedientes registrados</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 to-white border border-sky-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500">Ticket Promedio Solicitado</span>
          <div className="text-2xl font-black text-[#1D63ED] mt-1 font-mono tabular-nums">
            S/ {averageAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Monto medio por solicitud</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/90 to-white border border-purple-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500">Solicitantes en Base</span>
          <div className="text-2xl font-black text-purple-700 mt-1 font-mono tabular-nums">
            {totalDossiers}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Titulares registrados</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 to-white border border-emerald-200/80 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-500">Excedente Post-Cuota Total</span>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono tabular-nums">
            S/ {totalSurplus.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Capacidad neta agregada</span>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#1D63ED]" />
            <span>Distribución de Solicitudes por Estado</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Registradas', count: statusCounts.registrada, color: 'bg-slate-400' },
              { label: 'En Evaluación', count: statusCounts.en_evaluacion, color: 'bg-[#1D63ED]' },
              { label: 'Documentación Pendiente', count: statusCounts.documentacion_pendiente, color: 'bg-amber-500' },
              { label: 'En Verificación', count: statusCounts.en_verificacion, color: 'bg-purple-600' },
              { label: 'Finalizadas', count: statusCounts.finalizada, color: 'bg-emerald-500' }
            ].map((item) => {
              const pct = totalDossiers > 0 ? (item.count / totalDossiers) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-semibold">{item.label}</span>
                    <span className="font-bold text-[#0B2545] tabular-nums">{item.count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución por Sector */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Distribución de Cartera por Sector Económico</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(sectorMap).map(([sec, amt]) => {
              const pct = totalRequestedAmount > 0 ? (amt / totalRequestedAmount) * 100 : 0;
              return (
                <div key={sec} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-semibold">{sec}</span>
                    <span className="font-bold text-[#0B2545] font-mono tabular-nums">
                      S/ {amt.toLocaleString('es-PE', { minimumFractionDigits: 2 })} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual Dossier Printable Report Index */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[#0B2545]">
              Informes Individuales Listos para Imprimir / PDF
            </h3>
            <p className="text-xs text-slate-500">
              Genere el reporte completo de evaluación de cada expediente para comité o archivo físico
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 pl-3">Código</th>
                <th className="py-2.5">Titular</th>
                <th className="py-2.5">Negocio</th>
                <th className="py-2.5 text-right">Monto</th>
                <th className="py-2.5 text-right">Saldo Post-Cuota</th>
                <th className="py-2.5 pr-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dossiers.map((d) => (
                <tr key={d.id} className="hover:bg-blue-50/30">
                  <td className="py-3 pl-3 font-mono font-bold text-[#1D63ED]">{d.code}</td>
                  <td className="py-3 font-bold text-[#0B2545]">{d.personal.fullName}</td>
                  <td className="py-3 text-slate-600">{d.business.businessName}</td>
                  <td className="py-3 text-right font-mono font-semibold text-[#0B2545] tabular-nums">
                    S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right font-mono font-bold tabular-nums">
                    <span className={d.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      S/ {d.paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedDossierId(d.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Ficha</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDossierId(d.id);
                          setIsPrintModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-[#1D63ED] text-[#1D63ED] hover:text-white border border-blue-200/70 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Imprimir PDF</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
