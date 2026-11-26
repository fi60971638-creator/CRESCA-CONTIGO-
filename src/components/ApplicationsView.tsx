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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F7F8FA] text-[#374151] border border-[#E2E6EC]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" />
            Registrada
          </span>
        );
      case 'en_evaluacion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F0F5FA] text-[#004481] border border-[#B8D0E6]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#004481]" />
            En evaluación
          </span>
        );
      case 'documentacion_pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
            Doc. pendiente
          </span>
        );
      case 'en_verificacion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F7F8FA] text-[#072146] border border-[#CBD5E1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#072146]" />
            En verificación
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#028448] border border-[#A7F3D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#028448]" />
            Finalizada
          </span>
        );
    }
  };

  const agencies = Array.from(new Set(dossiers.map((d) => d.agency)));

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-[#E2E6EC]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
                Bandeja General de Solicitudes Crediticias
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6573] mt-0.5">
                Gestión, búsqueda y seguimiento estructurado de expedientes en evaluación
              </p>
            </div>
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

      {/* Filter and Search */}
      <div className="bg-white border border-[#E2E6EC] rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Buscar por código, DNI, RUC o solicitante..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] placeholder:text-[#6B7280] outline-none focus:bg-white focus:border-[#004481]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-[#5B6573]">Agencia:</span>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-semibold text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
            >
              <option value="todas">Todas las agencias</option>
              {agencies.map((ag) => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#E2E6EC]">
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
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-[#004481] text-white'
                  : 'bg-white text-[#374151] hover:bg-[#F7F8FA] border border-[#CBD5E1]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums ${
                  selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-[#F7F8FA] text-[#374151] border border-[#E2E6EC]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sub-botones de Solicitud (Módulos 1 a 8) */}
        <div className="pt-3 border-t border-[#E2E6EC]">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { id: 'solicitante', name: '1. Solicitante', icon: User },
              { id: 'negocio', name: '2. Negocio', icon: Briefcase },
              { id: 'credito', name: '3. Crédito', icon: CreditCard },
              { id: 'ingresos_gastos', name: '4. Ingresos y gastos', icon: TrendingUp },
              { id: 'balance', name: '5. Estados financieros', icon: Building2 },
              { id: 'capacidad', name: '6. Capacidad de pago', icon: Wallet },
              { id: 'inventario_documentos', name: '7. Inventario y docs', icon: Package },
              { id: 'conclusion', name: '8. Conclusión', icon: ClipboardCheck },
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
                  className="flex items-center gap-2 p-2 rounded-md bg-[#F7F8FA] hover:bg-[#F0F5FA] border border-[#E2E6EC] hover:border-[#B8D0E6] text-left transition-colors group cursor-pointer"
                  title={`Ir al módulo editable: ${subBtn.name}`}
                >
                  <div className="w-7 h-7 rounded bg-white border border-[#E2E6EC] flex items-center justify-center shrink-0 text-[#004481]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#121212] group-hover:text-[#004481] transition-colors truncate">
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
              <tr className="border-b border-[#E2E6EC] bg-[#F7F8FA] text-[#5B6573] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">Expediente</th>
                <th className="py-3">Solicitante</th>
                <th className="py-3">Actividad / Negocio</th>
                <th className="py-3 text-right">Monto Solicitado</th>
                <th className="py-3 text-right">Cuota Mensual</th>
                <th className="py-3 text-right">Saldo Post-Cuota</th>
                <th className="py-3 text-center">Estado</th>
                <th className="py-3 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EC]">
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#5B6573]">
                    No se encontraron solicitudes que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDossierId(d.id)}
                    className="hover:bg-[#F7F8FA] transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 pl-3 font-mono font-bold text-[#004481] tabular-nums">
                      {d.code}
                      <div className="text-[10px] text-[#6B7280] font-sans font-normal">{d.createdAt}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-[#121212] group-hover:text-[#004481] transition-colors">
                        {d.personal.fullName}
                      </div>
                      <div className="text-[11px] text-[#5B6573] font-mono">
                        {d.personal.documentType}: {d.personal.documentNumber} · {d.personal.phone}
                      </div>
                    </td>
                    <td className="py-3.5 text-[#374151]">
                      <div className="font-semibold text-[#121212]">{d.business.businessName}</div>
                      <div className="text-[11px] text-[#5B6573]">{d.terms.destination}</div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[#121212] font-mono tabular-nums">
                      S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      <div className="text-[10px] text-[#6B7280] font-sans font-normal">{d.terms.termMonths} meses</div>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[#004481] font-mono tabular-nums">
                      S/ {d.terms.proposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 text-right font-bold font-mono tabular-nums">
                      <span className={d.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0 ? 'text-[#028448]' : 'text-[#C81E1E]'}>
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
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#F0F5FA] text-[#004481] hover:bg-[#004481] hover:text-white border border-[#B8D0E6] rounded-md text-xs font-semibold transition-colors cursor-pointer"
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
                          className="inline-flex items-center p-1.5 bg-white border border-[#CBD5E1] text-[#374151] hover:bg-[#F7F8FA] rounded-md text-xs transition-colors cursor-pointer"
                          title="Imprimir / PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDossierToDelete(d);
                          }}
                          className="inline-flex items-center p-1.5 bg-white border border-[#CBD5E1] text-[#5B6573] hover:bg-[#FEF2F2] hover:text-[#C81E1E] hover:border-[#FECACA] rounded-md text-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#072146]/40 p-4">
          <div className="w-full max-w-md bg-white border border-[#E2E6EC] rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#C81E1E]">
              <div className="p-2.5 rounded-md bg-[#FEF2F2] border border-[#FECACA]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#121212]">¿Confirmar eliminación?</h3>
                <p className="text-xs text-[#5B6573]">Acción destructiva permanente</p>
              </div>
            </div>

            <p className="text-xs text-[#374151] leading-relaxed">
              ¿Está seguro de que desea eliminar permanentemente el expediente{' '}
              <strong className="text-[#121212] font-mono">{dossierToDelete.code}</strong> del solicitante{' '}
              <strong className="text-[#121212]">{dossierToDelete.personal.fullName}</strong>? Todos los registros asociados serán removidos.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDossierToDelete(null)}
                className="px-4 py-2 rounded-md text-xs font-semibold text-[#121212] bg-white border border-[#CBD5E1] hover:bg-[#F7F8FA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDossier(dossierToDelete.id);
                  setDossierToDelete(null);
                }}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-[#C81E1E] hover:bg-[#991B1B] text-white cursor-pointer"
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
