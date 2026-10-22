import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  Users,
  Search,
  PlusCircle,
  Phone,
  MapPin,
  Briefcase,
  FolderOpen,
  CheckCircle,
  Eye,
  Filter
} from 'lucide-react';
import { ApplicationStatus } from '../types/evalua';

export const ApplicantsView: React.FC = () => {
  const {
    dossiers,
    globalSearchQuery,
    setGlobalSearchQuery,
    setSelectedDossierId,
    setIsNewDossierModalOpen
  } = useEvalua();

  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Search by DNI, Nombre, Número de solicitud, Teléfono, Estado (Requirement 27)
  const filteredDossiers = dossiers.filter((d) => {
    const q = globalSearchQuery.toLowerCase();
    const matchesSearch =
      !globalSearchQuery ||
      d.personal.fullName.toLowerCase().includes(q) ||
      d.personal.documentNumber.includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.personal.phone.includes(q) ||
      d.status.toLowerCase().includes(q) ||
      d.business.businessName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter !== 'todos' && d.status !== statusFilter) return false;

    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'registrada':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">Registrada</span>;
      case 'en_evaluacion':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400">En evaluación</span>;
      case 'documentacion_pendiente':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400">Doc. pendiente</span>;
      case 'en_verificacion':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400">En verificación</span>;
      case 'finalizada':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">Finalizada</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Buscador y Directorio de Solicitantes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Búsqueda por DNI, Nombre, Número de Solicitud, Teléfono o Estado del Expediente
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

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Buscar por DNI, Nombre, N° Solicitud, Teléfono..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'todos', label: 'Todos los estados' },
              { id: 'registrada', label: 'Registradas' },
              { id: 'en_evaluacion', label: 'En evaluación' },
              { id: 'documentacion_pendiente', label: 'Doc. pendiente' },
              { id: 'en_verificacion', label: 'En verificación' },
              { id: 'finalizada', label: 'Finalizadas' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-3">N° Solicitud</th>
                <th className="pb-3">Solicitante</th>
                <th className="pb-3">DNI / Documento</th>
                <th className="pb-3">Teléfono</th>
                <th className="pb-3">Actividad Económica</th>
                <th className="pb-3 text-right">Monto Solicitado</th>
                <th className="pb-3 text-center">Estado</th>
                <th className="pb-3 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No se encontraron solicitantes que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDossierId(d.id)}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 pl-3 font-mono font-bold text-blue-400">
                      {d.code}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                        {d.personal.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {d.personal.district}, {d.personal.department}
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-300">
                      {d.personal.documentNumber}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {d.personal.phone}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      <div className="font-semibold text-slate-200">{d.business.businessName}</div>
                      <div className="text-[10px] text-slate-400">{d.business.activityType}</div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-100">
                      S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-center">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDossierId(d.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Abrir expediente</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
