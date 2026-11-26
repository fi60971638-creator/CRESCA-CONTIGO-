import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  Settings,
  ShieldCheck,
  Building2,
  History,
  RotateCcw,
  CheckCircle2,
  Save
} from 'lucide-react';

export const ConfigView: React.FC = () => {
  const { auditLogs, resetAllData } = useEvalua();

  const [institutionName, setInstitutionName] = useState('EVALÚA PERÚ · Entorno de Demostración');
  const [currencySymbol, setCurrencySymbol] = useState('S/ (PEN)');
  const [maxCreditLimit, setMaxCreditLimit] = useState(100000);
  const [requireGuarantorAbove, setRequireGuarantorAbove] = useState(20000);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-[#0B2545] flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
              Seguridad, Auditoría y Parámetros del Sistema
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Políticas institucionales, bitácora de auditoría y cumplimiento normativo
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuración guardada correctamente en el sistema.</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parámetros Institucionales */}
        <form onSubmit={handleSaveConfig} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1D63ED]" />
            <span>Parámetros Institucionales de Evaluación</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre de la Entidad o Consultora</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Moneda Principal de Operación</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Monto Referencial sin Hipoteca (S/)</label>
                <input
                  type="number"
                  value={requireGuarantorAbove}
                  onChange={(e) => setRequireGuarantorAbove(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0B2545] font-bold font-mono outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Límite Referencial de Cartera (S/)</label>
                <input
                  type="number"
                  value={maxCreditLimit}
                  onChange={(e) => setMaxCreditLimit(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[#0B2545] font-bold font-mono outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1D63ED] hover:bg-[#1552CC] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </div>
        </form>

        {/* Principio Fundamental & Certificación */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Declaración de Cumplimiento y Alcance</span>
          </h3>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs text-slate-700 space-y-2 leading-relaxed">
            <p className="font-bold text-[#0B2545]">
              EVALÚA PERÚ opera bajo el principio de neutralidad organizativa.
            </p>
            <p>
              La plataforma no incorpora algoritmos automáticos de rechazo o aprobación de créditos ni emite calificaciones de centrales de riesgo. Su función exclusiva es centralizar, digitalizar, totalizar ingresos/egresos y estructurar expedientes digitales para facilitar el análisis de los asesores, analistas y comités autorizados, en cumplimiento con la Ley N° 29733.
            </p>
          </div>

          <div className="pt-1 flex items-center gap-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-rose-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Base de Datos de Prueba</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <span className="text-rose-800 font-semibold">¿Restaurar datos de ejemplo?</span>
                <button
                  type="button"
                  onClick={() => {
                    resetAllData();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan y Suscripción de la Plataforma EVALÚA */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#0B2545]">
              Estructura de Planes y Suscripción de EVALÚA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tarifas vigentes del servicio digital por usuario (no modifica datos de expedientes crediticios)
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold self-start sm:self-auto">
            Prueba gratuita: 30 días sin costo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Plan Mensual</span>
            <div className="text-xl font-black text-[#0B2545] font-mono tabular-nums">
              S/ 25.00 <span className="text-xs font-sans font-semibold text-slate-500">/ usuario al mes</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Acceso mensual por usuario con 30 días de prueba sin costo.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#EFF6FF]/70 border border-blue-200/80 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D63ED] block">Plan Anual · Beneficio 2 meses</span>
            <div className="text-xl font-black text-[#0B2545] font-mono tabular-nums">
              S/ 250.00 <span className="text-xs font-sans font-semibold text-slate-500">/ usuario al año</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Equivalente a 10 meses respecto al pago mensual (beneficio de 2 meses al año).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Entidades Financieras</span>
            <div className="text-xl font-black text-[#0B2545]">
              Precio a convenir
            </div>
            <p className="text-slate-600 leading-relaxed">
              Según la cantidad de usuarios y las necesidades operativas de cada entidad.
            </p>
          </div>
        </div>
      </div>

      {/* Bitácora de Auditoría del Sistema */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#0B2545] flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            <span>Bitácora de Auditoría y Eventos del Sistema</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">{auditLogs.length} eventos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 pl-3">Fecha y Hora</th>
                <th className="py-2.5">Usuario</th>
                <th className="py-2.5">Acción</th>
                <th className="py-2.5">Detalle del Registro</th>
                <th className="py-2.5 pr-3 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-blue-50/30">
                  <td className="py-2.5 pl-3 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-2.5 font-bold text-[#0B2545]">{log.userName}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-600 max-w-md truncate">{log.details}</td>
                  <td className="py-2.5 pr-3 text-right font-mono font-bold text-[#1D63ED]">
                    {log.targetCode || '-'}
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
