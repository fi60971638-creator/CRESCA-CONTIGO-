import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { FinancialAnalysisModule } from './FinancialAnalysisModule';
import {
  FolderKanban,
  Search,
  Plus,
  Eye,
  Printer,
  FileSpreadsheet,
  User,
  Briefcase,
  CreditCard,
  TrendingUp,
  BarChart3,
  Scale,
  ClipboardList,
  CheckCircle2,
  Users
} from 'lucide-react';
import { ApplicationStatus } from '../types/evalua';

export const ExpedientesView: React.FC = () => {
  const {
    dossiers,
    globalSearchQuery,
    setGlobalSearchQuery,
    setSelectedDossierId,
    setActiveTab,
    setIsNewDossierModalOpen,
    setIsPrintModalOpen
  } = useEvalua();

  const [subMode, setSubMode] = useState<'digitales' | 'financiero'>('digitales');
  const [statusFilter, setStatusFilter] = useState<string>('todas');

  const filteredDossiers = dossiers.filter((d) => {
    const q = globalSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      d.code.toLowerCase().includes(q) ||
      d.personal.fullName.toLowerCase().includes(q) ||
      d.personal.documentNumber.toLowerCase().includes(q) ||
      d.business.businessName.toLowerCase().includes(q) ||
      d.personal.phone.includes(q);
    if (!matchesSearch) return false;
    if (statusFilter !== 'todas' && d.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'registrada':
        return <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F7F8FA] text-[#374151] border border-[#E2E6EC]">Registrada</span>;
      case 'en_evaluacion':
        return <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F0F5FA] text-[#004481] border border-[#B8D0E6]">En evaluación</span>;
      case 'documentacion_pendiente':
        return <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">Doc. pendiente</span>;
      case 'en_verificacion':
        return <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#F7F8FA] text-[#072146] border border-[#CBD5E1]">En verificación</span>;
      case 'finalizada':
        return <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#ECFDF5] text-[#028448] border border-[#A7F3D0]">Finalizada</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
                Gestión de Expedientes Digitales
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6573]">
                Centraliza la información personal, comercial, estados financieros y documentos por solicitante
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex p-1 bg-[#F7F8FA] rounded-md border border-[#E2E6EC]">
            <button
              onClick={() => setSubMode('digitales')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                subMode === 'digitales'
                  ? 'bg-white text-[#004481] border border-[#E2E6EC]'
                  : 'text-[#5B6573] hover:text-[#121212]'
              }`}
            >
              Expedientes de Crédito ({dossiers.length})
            </button>
            <button
              onClick={() => setSubMode('financiero')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                subMode === 'financiero'
                  ? 'bg-white text-[#004481] border border-[#E2E6EC]'
                  : 'text-[#5B6573] hover:text-[#121212]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Análisis Financiero (10 pestañas)</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewDossierModalOpen(true)}
            className="px-4 py-2 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo expediente</span>
          </button>
        </div>
      </div>

      {subMode === 'financiero' ? (
        <FinancialAnalysisModule />
      ) : (
        <div className="space-y-5">
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Buscar por DNI, RUC, nombre, negocio o código..."
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#004481]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'todas', label: 'Todos' },
                { id: 'registrada', label: 'Registrada' },
                { id: 'en_evaluacion', label: 'En evaluación' },
                { id: 'documentacion_pendiente', label: 'Doc. pendiente' },
                { id: 'en_verificacion', label: 'En verificación' },
                { id: 'finalizada', label: 'Finalizada' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === st.id
                      ? 'bg-[#004481] text-white'
                      : 'bg-white text-[#374151] border border-[#CBD5E1] hover:bg-[#F7F8FA]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Dossier Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredDossiers.length === 0 ? (
              <div className="lg:col-span-2 bg-white rounded-lg border border-[#E2E6EC] p-10 text-center text-xs text-[#5B6573]">
                No se encontraron expedientes digitales con los criterios seleccionados.
              </div>
            ) : (
              filteredDossiers.map((d) => {
                const verifiedDocs = d.documents.filter((doc) => doc.status === 'Verificado').length;
                const totalDocs = d.documents.length;
                const docPct = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-lg border border-[#E2E6EC] hover:border-[#B8D0E6] transition-colors p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E2E6EC]">
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-[#004481]">{d.code}</span>
                            <span className="text-[#CBD5E1]">·</span>
                            <span className="text-[#5B6573] font-mono">{d.createdAt}</span>
                          </div>
                          <h3 className="text-base font-bold text-[#121212] mt-1">
                            {d.personal.fullName}
                          </h3>
                          <p className="text-xs text-[#5B6573] mt-0.5">
                            {d.personal.documentType} {d.personal.documentNumber} · {d.business.businessName} ({d.business.sector})
                          </p>
                        </div>
                        {getStatusBadge(d.status)}
                      </div>

                      {/* Financial Snapshot */}
                      <div className="grid grid-cols-3 gap-3 py-3.5 border-b border-[#E2E6EC] text-xs">
                        <div>
                          <span className="text-[11px] text-[#5B6573] block">Monto solicitado</span>
                          <strong className="font-mono text-sm font-bold text-[#121212] tabular-nums">
                            S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#5B6573] block">Excedente neto</span>
                          <strong
                            className={`font-mono text-sm font-bold tabular-nums ${
                              d.paymentCapacity.remainingSurplusAfterProposedInstallment >= 0
                                ? 'text-[#028448]'
                                : 'text-[#C81E1E]'
                            }`}
                          >
                            S/ {d.paymentCapacity.remainingSurplusAfterProposedInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#5B6573] block">Documentos ({verifiedDocs}/{totalDocs})</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 rounded bg-[#E2E6EC] overflow-hidden">
                              <div
                                className="h-full bg-[#028448] rounded"
                                style={{ width: `${docPct}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[#121212] text-[11px] tabular-nums">
                              {docPct}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Direct Jump Links to 9 Independent Modules */}
                      <div className="pt-3">
                        <span className="text-[11px] font-semibold text-[#1464A5] block mb-2">
                          Acceso directo a formularios del expediente:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: 'solicitante', label: '1. Solicitante', icon: User },
                            { id: 'negocio', label: '2. Negocio', icon: Briefcase },
                            { id: 'credito', label: '3. Crédito', icon: CreditCard },
                            { id: 'ingresos_gastos', label: '4. Ingresos', icon: TrendingUp },
                            { id: 'balance', label: '5. Balance', icon: BarChart3 },
                            { id: 'capacidad', label: '6. Capacidad', icon: Scale },
                            { id: 'inventario_documentos', label: '7. Documentos', icon: ClipboardList },
                            { id: 'conclusion', label: '8. Conclusión', icon: CheckCircle2 },
                            { id: 'referencias', label: 'Referencias', icon: Users }
                          ].map((mod) => {
                            const MIcon = mod.icon;
                            return (
                              <button
                                key={mod.id}
                                onClick={() => {
                                  setSelectedDossierId(d.id);
                                  setActiveTab(mod.id);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F7F8FA] hover:bg-[#F0F5FA] text-[#374151] hover:text-[#004481] border border-[#E2E6EC] hover:border-[#B8D0E6] text-[11px] font-semibold transition-colors cursor-pointer"
                              >
                                <MIcon className="w-3 h-3" />
                                <span>{mod.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-[#E2E6EC] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#5B6573] truncate">
                        Asesor: <strong className="text-[#121212]">{d.assignedAnalystName}</strong>
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedDossierId(d.id);
                            setIsPrintModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F7F8FA] text-[#121212] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#5B6573]" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => setSelectedDossierId(d.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir ficha 360°</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
