import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  Users,
  Search,
  PlusCircle,
  FolderOpen
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
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#F7F8FA] text-[#374151] border border-[#E2E6EC]">Registrada</span>;
      case 'en_evaluacion':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#F0F5FA] text-[#004481] border border-[#B8D0E6]">En evaluación</span>;
      case 'documentacion_pendiente':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">Doc. pendiente</span>;
      case 'en_verificacion':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#F7F8FA] text-[#072146] border border-[#CBD5E1]">En verificación</span>;
      case 'finalizada':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#ECFDF5] text-[#028448] border border-[#A7F3D0]">Finalizada</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-[#E2E6EC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              Buscador y Directorio de Solicitantes
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6573] mt-0.5">
              Búsqueda por DNI, RUC, nombre, número de expediente, teléfono o estado
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewDossierModalOpen(true)}
          className="px-4 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nueva solicitud</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-[#E2E6EC] rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Buscar por DNI, Nombre, N° Solicitud, Teléfono..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] placeholder:text-[#6B7280] outline-none focus:bg-white focus:border-[#004481]"
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
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#004481] text-white'
                    : 'bg-white text-[#374151] hover:bg-[#F7F8FA] border border-[#CBD5E1]'
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
              <tr className="border-b border-[#E2E6EC] bg-[#F7F8FA] text-[#5B6573] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">N° Solicitud</th>
                <th className="py-3">Solicitante</th>
                <th className="py-3">DNI / Documento</th>
                <th className="py-3">Teléfono</th>
                <th className="py-3">Actividad Económica</th>
                <th className="py-3 text-right">Monto Solicitado</th>
                <th className="py-3 text-center">Estado</th>
                <th className="py-3 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EC]">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5B6573]">
                    No se encontraron solicitantes que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDossierId(d.id)}
                    className="hover:bg-[#F7F8FA] transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 pl-3 font-mono font-bold text-[#004481]">
                      {d.code}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-[#121212] group-hover:text-[#004481] transition-colors">
                        {d.personal.fullName}
                      </div>
                      <div className="text-[11px] text-[#5B6573]">
                        {d.personal.district}, {d.personal.department}
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-[#374151]">
                      {d.personal.documentNumber}
                    </td>
                    <td className="py-3.5 font-mono text-[#374151]">
                      {d.personal.phone}
                    </td>
                    <td className="py-3.5 text-[#374151]">
                      <div className="font-semibold text-[#121212]">{d.business.businessName}</div>
                      <div className="text-[11px] text-[#5B6573]">{d.business.activityType}</div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[#121212] font-mono tabular-nums">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#F0F5FA] text-[#004481] hover:bg-[#004481] hover:text-white border border-[#B8D0E6] rounded-md text-xs font-semibold transition-colors cursor-pointer"
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
