import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { ApplicationStatus } from '../types/evalua';
import {
  FileSpreadsheet,
  Search,
  PlusCircle,
  FolderOpen,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  Package,
  User,
  Briefcase,
  Wallet,
  ClipboardCheck
} from 'lucide-react';

export const ApplicationsView: React.FC = () => {
  const {
    dossiers,
    globalSearchQuery,
    setGlobalSearchQuery,
    setSelectedDossierId,
    setActiveTab,
    openDossierWithTab,
    setIsNewDossierModalOpen,
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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">Registrada</span>;
      case 'en_evaluacion':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400">En evaluación</span>;
      case 'documentacion_pendiente':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400">Doc. pendiente</span>;
      case 'en_verificacion':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400">En verificación</span>;
      case 'finalizada':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">Finalizada</span>;
    }
  };

  const agencies = Array.from(new Set(dossiers.map((d) => d.agency)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Bandeja General de Solicitudes Crediticias
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión y consulta organizada de expedientes en evaluación
          </p>
        </div>

        <button
          onClick={() => setIsNewDossierModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nueva Solicitud</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Buscar por código, DNI, solicitante..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Agencia:</span>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="todas">Todas las agencias</option>
              {agencies.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-botones de Solicitud (Estructura crediticia 1 a 8, íconos y nombres sin texto redundante) */}
        <div className="pt-2 border-t border-slate-800/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: 'solicitante', name: '1. Solicitante', icon: User, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
              { id: 'negocio', name: '2. Negocio', icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
              { id: 'credito', name: '3. Crédito', icon: CreditCard, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              { id: 'ingresos_gastos', name: '4. Ingresos y gastos', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              { id: 'balance', name: '5. Estados financieros y balance', icon: Building2, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
              { id: 'capacidad', name: '6. Capacidad de pago', icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
              { id: 'inventario_documentos', name: '7. Inventario y documentos', icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
              { id: 'conclusion', name: '8. Conclusión', icon: ClipboardCheck, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
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
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all group cursor-pointer shadow-sm hover:scale-[1.01]"
                  title={`Ir al módulo independiente: ${subBtn.name}`}
                >
                  <div className={`w-7 h-7 rounded-lg ${subBtn.bg} border flex items-center justify-center shrink-0 ${subBtn.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                    {subBtn.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-3">Expediente</th>
                <th className="pb-3">Solicitante</th>
                <th className="pb-3">Actividad / Negocio</th>
                <th className="pb-3 text-right">Monto Solicitado</th>
                <th className="pb-3 text-right">Cuota Mensual</th>
                <th className="pb-3 text-right">Saldo Post-Cuota</th>
                <th className="pb-3 text-center">Estado</th>
                <th className="pb-3 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDossiers.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedDossierId(d.id)}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                >
                  <td className="py-3.5 pl-3 font-mono font-bold text-blue-400">
                    {d.code}
                    <div className="text-[10px] text-slate-500 font-normal">{d.createdAt}</div>
                  </td>
                  <td className="py-3.5">
                    <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                      {d.personal.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      DNI: {d.personal.documentNumber} • {d.personal.phone}
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-300">
                    <div className="font-semibold text-slate-200">{d.business.businessName}</div>
                    <div className="text-[10px] text-slate-400">{d.terms.destination}</div>
                  </td>
                  <td className="py-3.5 text-right font-bold text-slate-100">
                    S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    <div className="text-[10px] text-slate-400 font-normal">{d.terms.termMonths} meses</div>
                  </td>
                  <td className="py-3.5 text-right font-bold text-blue-400">
                    S/ {d.terms.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right font-bold">
                    <span className={d.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
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
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Ver expediente 360°"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDossierToDelete(d);
                        }}
                        className="inline-flex items-center p-1.5 bg-slate-800 text-slate-400 hover:bg-rose-600/20 hover:text-rose-400 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Eliminar expediente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmación de Acción Destructiva */}
      {dossierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Confirmar eliminación?</h3>
                <p className="text-xs text-slate-400">Acción destructiva permanente</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              ¿Está seguro de que desea eliminar permanentemente el expediente{' '}
              <strong className="text-white font-mono">{dossierToDelete.code}</strong> del solicitante{' '}
              <strong className="text-white">{dossierToDelete.personal.fullName}</strong>? Todos los registros asociados serán removidos.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDossierToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDossier(dossierToDelete.id);
                  setDossierToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer"
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
