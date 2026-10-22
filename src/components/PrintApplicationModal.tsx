import React from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  Printer,
  X,
  ShieldCheck,
  Building2,
  User,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Button } from './ui/Button';

interface PrintApplicationModalProps {
  dossierId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintApplicationModal: React.FC<PrintApplicationModalProps> = ({
  dossierId,
  isOpen,
  onClose
}) => {
  const { dossiers } = useEvalua();

  if (!isOpen || !dossierId) return null;

  const d = dossiers.find((item) => item.id === dossierId);
  if (!d) return null;

  const p = d.personal;
  const b = d.business;
  const t = d.terms;
  const is = d.incomeStatement;
  const bs = d.balanceSheet;
  const cf = d.cashFlow;
  const pc = d.paymentCapacity;
  const r = d.ratios;
  const q = d.qualitative;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Top bar controls (hidden in print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-evalua-blue" />
            <h3 className="text-sm font-extrabold text-evalua-navy">
              Expediente Formal Imprimible · Dictamen Técnico
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Imprimir / Guardar PDF
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-5 bg-white text-slate-900 print:overflow-visible text-xs font-sans">
          {/* Header with Full EVALÚA Logo */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/assets/evalua-logo.png"
                alt="EVALÚA"
                className="h-12 w-auto object-contain"
              />
            </div>

            <div className="text-right">
              <div className="text-base font-extrabold font-mono text-evalua-navy">
                {d.code}
              </div>
              <div className="text-[11px] text-slate-500">
                Fecha Registro: {d.createdAt}
              </div>
              <div className="text-[11px] font-bold text-slate-700">
                Agencia: {d.agency}
              </div>
            </div>
          </div>

          {/* 1. Solicitante */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-evalua-blue">
              1. Solicitante (Datos Principales)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div><span className="text-slate-500 block text-[10px] font-semibold">Titular:</span><strong className="text-slate-900">{p.fullName}</strong></div>
              <div><span className="text-slate-500 block text-[10px] font-semibold">Doc. Identidad:</span><strong className="font-mono text-slate-900">{p.documentType} {p.documentNumber}</strong></div>
              <div><span className="text-slate-500 block text-[10px] font-semibold">Edad & Estado Civil:</span><strong>{p.age} años • {p.maritalStatus}</strong></div>
              <div><span className="text-slate-500 block text-[10px] font-semibold">Teléfono:</span><strong>{p.phone}</strong></div>
              <div className="sm:col-span-2"><span className="text-slate-500 block text-[10px] font-semibold">Dirección:</span><strong>{p.homeAddress}, {p.district}, {p.department}</strong></div>
              <div className="sm:col-span-2"><span className="text-slate-500 block text-[10px] font-semibold">Negocio:</span><strong>{b.businessName} ({b.sector} - {b.operatingTimeYears} años)</strong></div>
            </div>
          </div>

          {/* 2. Solicitud de Crédito */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-evalua-blue">
              2. Solicitud de Crédito
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div><span className="text-slate-500 block text-[10px] font-semibold">Monto Solicitado:</span><strong className="text-sm text-evalua-navy">S/ {t.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong></div>
              <div><span className="text-slate-500 block text-[10px] font-semibold">Plazo & Frecuencia:</span><strong>{t.termMonths} meses ({t.paymentFrequency})</strong></div>
              <div><span className="text-slate-500 block text-[10px] font-semibold">Destino del Crédito:</span><strong>{t.destination}</strong></div>
              <div><span className="text-slate-500 block text-[10px] font-semibold">Cuota Propuesta:</span><strong className="text-evalua-blue font-extrabold">S/ {t.proposedInstallment.toLocaleString()}</strong></div>
            </div>
          </div>

          {/* 3. Información Económica & Estado de Resultados */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-evalua-blue">
              3. Información Económica y Estado de Resultados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center border-b border-slate-200 pb-2">
              <div><span className="text-[10px] text-slate-500 block font-semibold">Ventas Mensuales</span><strong className="text-evalua-green text-sm">S/ {is.salesIncome.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-semibold">Costo de Ventas</span><strong className="text-rose-600">S/ {is.costOfSales.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-semibold">Utilidad Bruta</span><strong className="text-slate-900">S/ {is.grossProfit.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-semibold">Resultado Operativo</span><strong className="text-evalua-blue">S/ {is.operatingResult.toLocaleString()}</strong></div>
            </div>
          </div>

          {/* 4. Situación Patrimonial & Balance General */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-evalua-blue">
              4. Situación Patrimonial (Balance General)
            </h2>
            <div className="grid grid-cols-3 gap-2.5 text-center text-[11px]">
              <div><span className="text-[10px] text-slate-500 block font-semibold">Total Activos</span><strong className="text-evalua-green">S/ {bs.totalAssets.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-semibold">Total Pasivos</span><strong className="text-rose-600">S/ {bs.totalLiabilities.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-semibold">Patrimonio Neto</span><strong className="text-evalua-blue">S/ {bs.equity.toLocaleString()}</strong></div>
            </div>
          </div>

          {/* 5. Obligaciones, Flujo de Caja & Capacidad de Pago */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-evalua-blue">
              5. Obligaciones Financieras y Capacidad de Pago
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-[11px]">
              <div><span className="text-[10px] text-slate-500 block font-semibold">Flujo Neto de Caja</span><strong>S/ {cf.netCashFlow.toLocaleString()} ({cf.isPositive ? 'Positivo' : 'Negativo'})</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-semibold">Cuotas Deudas Actuales</span><strong className="text-rose-600">S/ {pc.currentFinancialObligations.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-semibold">Flujo Disponible</span><strong className="text-evalua-blue">S/ {pc.availableFlow.toLocaleString()}</strong></div>
              <div><span className="text-[10px] text-slate-500 block font-bold">Saldo Post-Cuota Propuesta</span><strong className="text-evalua-green font-extrabold text-sm">S/ {pc.remainingSurplusAfterProposedInstallment.toLocaleString()}</strong></div>
            </div>
            <div className="text-[10px] text-slate-500 text-center pt-1 font-medium">
              Ratios: Endeudamiento {r.indebtednessRatio.toFixed(1)}% • Carga Financiera {r.financialBurdenRatio.toFixed(1)}% • Cobertura {r.debtCoverageRatio.toFixed(2)}x
            </div>
          </div>

          {/* 6. Conclusión del Analista & Observaciones */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-evalua-blue">
              6. Conclusión y Observaciones del Analista
            </h2>
            <p className="text-[11px] text-slate-800 leading-relaxed italic">
              "{q.analystConclusion}"
            </p>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-3 gap-6 pt-10 text-center text-[11px]">
            <div className="border-t border-slate-400 pt-1.5">
              <strong className="text-slate-900">{p.fullName}</strong>
              <span className="text-slate-500 text-[10px] block">Firma del Solicitante / Titular</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <strong className="text-slate-900">{d.assignedAnalystName}</strong>
              <span className="text-slate-500 text-[10px] block">Analista de Crédito Evaluador</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <strong className="text-slate-900">Comité de Créditos</strong>
              <span className="text-slate-500 text-[10px] block">Resolución y Dictamen Institucional</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-[9px] text-slate-500 pt-2 border-t border-slate-200">
            EVALÚA organiza y facilita la información necesaria para la evaluación crediticia, pero no reemplaza al analista ni toma la decisión final sobre el crédito.
          </div>
        </div>
      </div>
    </div>
  );
};
