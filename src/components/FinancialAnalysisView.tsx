import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  TrendingUp,
  DollarSign,
  Building2,
  CreditCard,
  PieChart,
  FolderOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { FINANCIAL_FORMULAS } from '../utils/financialCalculations';

export const FinancialAnalysisView: React.FC = () => {
  const { dossiers, setSelectedDossierId } = useEvalua();
  const [selectedId, setSelectedId] = useState<string>(dossiers[0]?.id || '');

  const currentDossier = dossiers.find((d) => d.id === selectedId) || dossiers[0];

  if (!currentDossier) {
    return (
      <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
        <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No hay expedientes registrados</h3>
        <p className="text-xs text-slate-400 mt-1">
          Cree una nueva solicitud para visualizar y comparar los análisis financieros.
        </p>
      </div>
    );
  }

  const is = currentDossier.incomeStatement;
  const bs = currentDossier.balanceSheet;
  const pc = currentDossier.paymentCapacity;
  const r = currentDossier.ratios;
  const t = currentDossier.terms;
  const p = currentDossier.personal;
  const b = currentDossier.business;

  // Calculo de márgenes
  const grossMargin = is.salesIncome > 0 ? (is.grossProfit / is.salesIncome) * 100 : 0;
  const operatingMargin = is.salesIncome > 0 ? (is.operatingResult / is.salesIncome) * 100 : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Análisis Financiero Crediticio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluación integrada de Estado de Resultados, Balance General, Capacidad de Pago y Ratios Financieros
          </p>
        </div>

        {/* Dossier selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 hidden sm:block">Expediente:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:border-blue-500 outline-none"
          >
            {dossiers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.personal.fullName} (S/ {d.terms.requestedAmount.toLocaleString()})
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedDossierId(currentDossier.id)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Abrir Expediente</span>
          </button>
        </div>
      </div>

      {/* Institutional rule reminder banner */}
      <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Criterio Institucional:</span> Todos los resultados expuestos corresponden a fórmulas financieras objetivas sobre la información declarada y verificada. La plataforma no emite dictámenes automáticos de aprobación o rechazo; la resolución compete al personal autorizado.
        </div>
      </div>

      {/* Applicant Card Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Solicitante & Negocio
          </span>
          <div className="text-sm font-bold text-white mt-1 truncate">{p.fullName}</div>
          <div className="text-xs text-slate-400 truncate">{b.businessName}</div>
          <div className="text-[10px] text-blue-400 mt-2 font-mono">{currentDossier.code} • DNI {p.documentNumber}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Crédito Solicitado
          </span>
          <div className="text-base font-black text-white mt-1">
            S/ {t.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400">{t.termMonths} meses • Cuota S/ {t.proposedInstallment.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-2 truncate">{t.destination}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Flujo Disponible Mensual
          </span>
          <div className={`text-base font-black mt-1 ${pc.availableFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            S/ {pc.availableFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400">Antes de la nueva cuota</div>
          <div className="text-[10px] text-slate-400 mt-2">Ventas: S/ {is.salesIncome.toLocaleString()}</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Saldo Excedente Post-Cuota
          </span>
          <div className={`text-base font-black mt-1 ${pc.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            S/ {pc.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400">Excedente neto libre</div>
          <div className="text-[10px] text-slate-400 mt-2">
            Endeudamiento: {r.indebtednessRatio}%
          </div>
        </div>
      </div>

      {/* Main Financial Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Resultados (P&L) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Estado de Resultados (P&L Mensual)</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Valores en Soles (S/)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 font-bold text-slate-200">
              <span>(+) Ventas / Ingresos del Negocio</span>
              <span className="text-emerald-400">S/ {is.salesIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-300">
              <span className="pl-3">(-) Costo de Ventas (Mercadería, Fletes, Insumos)</span>
              <span className="text-rose-400">S/ {is.costOfSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2 px-3 rounded-lg bg-slate-950 font-bold text-blue-300 border border-slate-800">
              <span>(=) Utilidad Bruta (Margen {grossMargin.toFixed(1)}%)</span>
              <span>S/ {is.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-300">
              <span className="pl-3">(-) Gastos Operativos del Negocio</span>
              <span className="text-rose-400">S/ {is.operatingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2 px-3 rounded-lg bg-slate-950 font-bold text-blue-300 border border-slate-800">
              <span>(=) Resultado Operativo (Margen {operatingMargin.toFixed(1)}%)</span>
              <span>S/ {is.operatingResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            {is.otherIncome > 0 && (
              <div className="flex justify-between py-1 text-slate-300">
                <span className="pl-3">(+) Otros Ingresos Familiares / Personales</span>
                <span className="text-emerald-400">S/ {is.otherIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 text-slate-300">
              <span className="pl-3">(-) Gastos Familiares y Personales</span>
              <span className="text-rose-400">S/ {currentDossier.familyExpenses.totalFamilyExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-1.5 font-bold text-slate-200">
              <span>(=) Resultado Antes de Obligaciones Financieras</span>
              <span>S/ {is.resultBeforeFinancialObligations.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-1.5 text-slate-300">
              <span className="pl-3">(-) Cuotas de Créditos Existentes Registradas</span>
              <span className="text-rose-400">S/ {is.financialInstallments.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between py-2.5 px-3.5 rounded-xl bg-blue-600/15 border border-blue-500/30 font-black text-sm text-white">
              <span>(=) Resultado / Flujo Disponible Mensual</span>
              <span className={is.availableResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                S/ {is.availableResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Fórmula de Estado de Resultados:</span>
            <p className="italic">{FINANCIAL_FORMULAS.availableResult}</p>
          </div>
        </div>

        {/* Balance General / Situación Patrimonial */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">Balance General / Situación Patrimonial</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Al corte de evaluación</span>
          </div>

          {/* Quick Balance summary */}
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Activos</span>
              <span className="text-sm font-black text-emerald-400">S/ {bs.totalAssets.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Pasivos</span>
              <span className="text-sm font-black text-rose-400">S/ {bs.totalLiabilities.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-300 uppercase font-bold block">Patrimonio Neto</span>
              <span className="text-sm font-black text-blue-400">S/ {bs.equity.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Activos */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-1">
                <span>Activos Corrientes</span>
                <span className="text-emerald-400">S/ {bs.totalCurrentAssets.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span>Efectivo & Bancos:</span><span>S/ {(bs.cash + bs.bankDeposits).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Inventarios:</span><span>S/ {bs.inventoryValue.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Cuentas por Cobrar:</span><span>S/ {bs.accountsReceivableValue.toLocaleString()}</span></div>
              </div>

              <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-1 pt-2">
                <span>Activos No Corrientes</span>
                <span className="text-emerald-400">S/ {bs.totalNonCurrentAssets.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span>Inmueble / Vivienda:</span><span>S/ {bs.housingValue.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Vehículos:</span><span>S/ {bs.vehiclesValue.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Maquinaria & Equipos:</span><span>S/ {(bs.machineryValue + bs.equipmentValue).toLocaleString()}</span></div>
              </div>
            </div>

            {/* Pasivos */}
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-1">
                <span>Pasivos Corrientes</span>
                <span className="text-rose-400">S/ {bs.totalCurrentLiabilities.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span>Deudas Corto Plazo:</span><span>S/ {bs.shortTermCredits.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Proveedores x Pagar:</span><span>S/ {bs.suppliersPayable.toLocaleString()}</span></div>
              </div>

              <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-1 pt-2">
                <span>Pasivos No Corrientes</span>
                <span className="text-rose-400">S/ {bs.totalNonCurrentLiabilities.toLocaleString()}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between"><span>Créditos Largo Plazo:</span><span>S/ {bs.longTermCredits.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Otras Obligaciones:</span><span>S/ {bs.otherNonCurrentLiabilities.toLocaleString()}</span></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Ecuación Patrimonial:</span>
            <p className="italic">{FINANCIAL_FORMULAS.equity}</p>
          </div>
        </div>
      </div>

      {/* Capacidad de Pago & Ratios Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">
              Evaluación de Capacidad de Pago & Ratios Financieros
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Cuota propuesta: <strong className="text-blue-400">S/ {t.proposedInstallment.toLocaleString()}</strong> ({t.termMonths} meses)
          </span>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ingreso Total</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 block">S/ {pc.monthlyIncome.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Mensual</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Egresos Totales</span>
            <span className="text-sm font-bold text-rose-400 mt-1 block">S/ {pc.monthlyExpenses.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Operativos + Familia</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cuotas Actuales</span>
            <span className="text-sm font-bold text-rose-400 mt-1 block">S/ {pc.currentFinancialObligations.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Deudas vigentes</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-blue-300 uppercase font-semibold block">Flujo Disponible</span>
            <span className="text-sm font-bold text-blue-400 mt-1 block">S/ {pc.availableFlow.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Para nueva cuota</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cuota Propuesta</span>
            <span className="text-sm font-bold text-white mt-1 block">S/ {pc.proposedInstallment.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">Estimada</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-blue-500/40">
            <span className="text-[10px] text-emerald-300 uppercase font-bold block">Saldo Post-Cuota</span>
            <span className={`text-sm font-black mt-1 block ${pc.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              S/ {pc.remainingSurplusAfterProposedInstallment.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Excedente neto</span>
          </div>
        </div>

        {/* Financial Ratios Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Ratio de Endeudamiento</span>
              <span className="text-sm font-bold text-blue-400">{r.indebtednessRatio}%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {FINANCIAL_FORMULAS.indebtedness}. Porcentaje de activos comprometidos con pasivos.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Carga Financiera Mensual</span>
              <span className="text-sm font-bold text-blue-400">{r.financialBurdenRatio}%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {FINANCIAL_FORMULAS.financialBurden}. Proporción de ingresos mensuales absorbida por cuotas vigentes.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-300">Cobertura de Deuda</span>
              <span className="text-sm font-bold text-blue-400">
                {r.debtCoverageRatio > 0 ? `${r.debtCoverageRatio}x` : 'Sin cuotas vigentes'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {FINANCIAL_FORMULAS.debtCoverage}. Veces que el flujo disponible cubre las obligaciones vigentes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
