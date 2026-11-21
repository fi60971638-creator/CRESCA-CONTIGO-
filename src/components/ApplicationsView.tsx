import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { ApplicationStatus } from '../types/evalua';
import {
  FileSpreadsheet,
  Search,
  PlusCircle,
  FolderOpen,
  Building2,
  Trash2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Package,
  User,
  Briefcase,
  Wallet,
  ClipboardCheck,
  Printer
} from 'lucide-react';

export const ApplicationsView: React.FC = () => {
  const {
    dossiers,
    globalSearchQuery,
    setGlobalSearchQuery,
    setSelectedDossierId,
    setActiveTab,
    setIsNewDossierModalOpen,
    setIsPrintModalOpen,
    deleteDossier
  } = useEvalua();

  const [selectedStatus, setSelectedStatus] = useState<string>('todas');
  const [selectedAgency, setSelectedAgency] = useState<string>('todas');
  const [dossierToDelete, setDossierToDelete] = useState<any | null>(null);

  const filteredDossiers = dossiers.filter((d) => {
    const q = globalSearchQuery.toLowerCase();
    const matchesSearch =
      !globalSearchQuery ||
      d.code.toLowerCase().includes(q) ||
      d.personal.fullName.toLowerCase().includes(q) ||
      d.personal.documentNumber.includes(q) ||
      d.personal.phone.includes(q) ||
      d.business.businessName.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedStatus !== 'todas' && d.status !== selectedStatus) return false;
    if (selectedAgency !== 'todas' && d.agency !== selectedAgency) return false;

    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'registrada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Registrada
          </span>
        );
      case 'en_evaluacion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#1D63ED] border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D63ED]" />
            En evaluación
          </span>
        );
      case 'documentacion_pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Doc. pendiente
          </span>
        );
      case 'en_verificacion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            En verificación
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Finalizada
          </span>
        );
    }
  };

  const agencies = Array.from(new Set(dossiers.map((d) => d.agency)));

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/70 text-[#1D63ED] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
                Bandeja General de Solicitudes Crediticias
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Gestión, búsqueda y seguimiento estructurado de expedientes en evaluación
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNewDossierModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CC] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva solicitud</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Buscar por código, DNI, RUC o solicitante..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-blue-500/15 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500">Agencia:</span>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#1D63ED]"
            >
              <option value="todas">Todas las agencias</option>
              {agencies.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          {[
            { id: 'todas', label: 'Todas las solicitudes', count: dossiers.length },
            { id: 'registrada', label: 'Registradas', count: dossiers.filter(d => d.status === 'registrada').length },
            { id: 'en_evaluacion', label: 'En evaluación', count: dossiers.filter(d => d.status === 'en_evaluacion').length },
            { id: 'documentacion_pendiente', label: 'Doc. pendiente', count: dossiers.filter(d => d.status === 'documentacion_pendiente').length },
            { id: 'en_verificacion', label: 'En verificación', count: dossiers.filter(d => d.status === 'en_verificacion').length },
            { id: 'finalizada', label: 'Finalizadas', count: dossiers.filter(d => d.status === 'finalizada').length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-[#1D63ED] text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                  selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-botones de Solicitud (Módulos 1 a 8) */}
        <div className="pt-3 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: 'solicitante', name: '1. Solicitante', icon: User, color: 'text-[#1D63ED]', bg: 'bg-blue-50 border-blue-200/70' },
              { id: 'negocio', name: '2. Negocio', icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200/70' },
              { id: 'credito', name: '3. Crédito', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200/70' },
              { id: 'ingresos_gastos', name: '4. Ingresos y gastos', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200/70' },
              { id: 'balance', name: '5. Estados financieros', icon: Building2, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200/70' },
              { id: 'capacidad', name: '6. Capacidad de pago', icon: Wallet, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200/70' },
              { id: 'inventario_documentos', name: '7. Inventario y docs', icon: Package, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200/70' },
              { id: 'conclusion', name: '8. Conclusión', icon: ClipboardCheck, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200/70' },
            ].map((subBtn) => {
              const Icon = subBtn.icon;
              return (
                <button
                  key={subBtn.id}
                  onClick={() => {
                    const targetDossier = filteredDossiers[0] || dossiers[0];
                    if (targetDossier) {
                      setSelectedDossierId(targetDossier.id);
                    }
                    setActiveTab(subBtn.id);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 text-left transition-all group cursor-pointer"
                  title={`Ir al módulo editable: ${subBtn.name}`}
                >
                  <div className={`w-7 h-7 rounded-lg ${subBtn.bg} border flex items-center justify-center shrink-0 ${subBtn.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#1D63ED] transition-colors truncate">
                    {subBtn.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3 rounded-tl-xl">Expediente</th>
                <th className="py-3">Solicitante</th>
                <th className="py-3">Actividad / Negocio</th>
                <th className="py-3 text-right">Monto Solicitado</th>
                <th className="py-3 text-right">Cuota Mensual</th>
                <th className="py-3 text-right">Saldo Post-Cuota</th>
                <th className="py-3 text-center">Estado</th>
                <th className="py-3 pr-3 text-right rounded-tr-xl">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No se encontraron solicitudes que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDossierId(d.id)}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 pl-3 font-mono font-bold text-[#1D63ED] tabular-nums">
                      {d.code}
                      <div className="text-[10px] text-slate-400 font-sans font-normal">{d.createdAt}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-[#0B2545] group-hover:text-[#1D63ED] transition-colors">
                        {d.personal.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {d.personal.documentType}: {d.personal.documentNumber} • {d.personal.phone}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-700">
                      <div className="font-semibold text-slate-800">{d.business.businessName}</div>
                      <div className="text-[11px] text-slate-500">{d.terms.destination}</div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[#0B2545] font-mono tabular-nums">
                      S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      <div className="text-[10px] text-slate-400 font-sans font-normal">{d.terms.termMonths} meses</div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[#1D63ED] font-mono tabular-nums">
                      S/ {d.terms.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-right font-bold font-mono tabular-nums">
                      <span className={d.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        S/ {d.paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDossierId(d.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-[#1D63ED] hover:bg-[#1D63ED] hover:text-white border border-blue-200/70 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Ver expediente 360°"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDossierId(d.id);
                            setIsPrintModalOpen(true);
                          }}
                          className="inline-flex items-center p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#0B2545] rounded-lg text-xs transition-colors cursor-pointer"
                          title="Imprimir / PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDossierToDelete(d);
                          }}
                          className="inline-flex items-center p-1.5 bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Eliminar expediente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal de Confirmación de Acción Destructiva */}
      {dossierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0B2545]">¿Confirmar eliminación?</h3>
                <p className="text-xs text-slate-500">Acción destructiva permanente</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Está seguro de que desea eliminar permanentemente el expediente{' '}
              <strong className="text-[#0B2545] font-mono">{dossierToDelete.code}</strong> del solicitante{' '}
              <strong className="text-[#0B2545]">{dossierToDelete.personal.fullName}</strong>? Todos los registros asociados serán removidos.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDossierToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDossier(dossierToDelete.id);
                  setDossierToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
              >
                Eliminar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
