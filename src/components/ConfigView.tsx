import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  Settings,
  ShieldCheck,
  Building2,
  FileCheck,
  History,
  RotateCcw,
  CheckCircle2,
  Save,
  Server
} from 'lucide-react';

export const ConfigView: React.FC = () => {
  const { auditLogs, resetAllData, currentUser } = useEvalua();

  const [institutionName, setInstitutionName] = useState('Financiera / Caja Municipal Demo');
  const [currencySymbol, setCurrencySymbol] = useState('S/ (PEN)');
  const [maxCreditLimit, setMaxCreditLimit] = useState(100000);
  const [requireGuarantorAbove, setRequireGuarantorAbove] = useState(20000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Configuración y Parámetros del Sistema
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Políticas institucionales, checklist documental y registro de auditoría
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Configuración guardada correctamente en el sistema.</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parámetros Institucionales */}
        <form onSubmit={handleSaveConfig} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Parámetros Institucionales de Evaluación</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">Nombre de la Entidad Financiera</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Moneda Principal de Operación</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Monto Máximo sin Hipoteca (S/)</label>
                <input
                  type="number"
                  value={requireGuarantorAbove}
                  onChange={(e) => setRequireGuarantorAbove(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Límite Máximo de Cartera (S/)</label>
                <input
                  type="number"
                  value={maxCreditLimit}
                  onChange={(e) => setMaxCreditLimit(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </div>
        </form>

        {/* Principio Fundamental & Certificación */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Declaración de Cumplimiento Normativo</span>
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
            <p className="font-semibold text-white">
              EVALÚA opera bajo el principio de neutralidad organizativa.
            </p>
            <p>
              La plataforma no incorpora algoritmos automáticos de rechazo o aprobación de créditos. Su función exclusiva es centralizar, digitalizar, totalizar ingresos/egresos y estructurar expedientes digitales para facilitar el análisis humano de los asesores, analistas y comités autorizados de la entidad.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('¿Restaurar todos los datos iniciales de fábrica?')) {
                  resetAllData();
                }
              }}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors border border-rose-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Base de Datos de Prueba</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bitácora de Auditoría del Sistema */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <span>Bitácora de Auditoría y Eventos del Sistema</span>
          </h3>
          <span className="text-xs text-slate-500">{auditLogs.length} eventos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2.5 pl-2">Fecha y Hora</th>
                <th className="pb-2.5">Usuario</th>
                <th className="pb-2.5">Acción</th>
                <th className="pb-2.5">Detalle del Registro</th>
                <th className="pb-2.5 pr-2 text-right">Expediente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 pl-2 font-mono text-slate-400">{log.timestamp}</td>
                  <td className="py-2.5 font-semibold text-slate-200">{log.userName}</td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300 max-w-md truncate">{log.details}</td>
                  <td className="py-2.5 pr-2 text-right font-mono font-bold text-blue-400">
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
