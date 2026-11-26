import React, { useState, useEffect } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  FolderLock,
  Search,
  FileText,
  Check,
  FolderOpen
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const {
    dossiers,
    setSelectedDossierId,
    toggleDocStatus,
    activeSubSection
  } = useEvalua();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  useEffect(() => {
    if (activeSubSection === 'doc-personales') {
      setFilterCategory('personales');
    } else if (activeSubSection === 'doc-negocio') {
      setFilterCategory('negocio');
    } else if (activeSubSection === 'doc-financieros') {
      setFilterCategory('financieros');
    } else if (!activeSubSection) {
      setFilterCategory('todas');
    }
  }, [activeSubSection]);

  const allDocs = dossiers.flatMap((d) =>
    d.documents.map((doc) => ({
      ...doc,
      dossierId: d.id,
      dossierCode: d.code,
      applicantName: d.personal.fullName,
      agency: d.agency
    }))
  );

  const filteredDocs = allDocs.filter((doc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      doc.name.toLowerCase().includes(q) ||
      doc.applicantName.toLowerCase().includes(q) ||
      doc.dossierCode.toLowerCase().includes(q) ||
      doc.documentType.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterCategory === 'personales' && doc.documentType !== 'DNI') {
      return false;
    }
    if (
      filterCategory === 'negocio' &&
      doc.documentType !== 'Documentación del negocio' &&
      doc.documentType !== 'Otros documentos'
    ) {
      return false;
    }
    if (
      filterCategory === 'financieros' &&
      doc.documentType !== 'Sustento de ingresos' &&
      doc.documentType !== 'Documentación patrimonial'
    ) {
      return false;
    }

    if (filterStatus === 'verificados') return doc.status === 'Verificado';
    if (filterStatus === 'pendientes') return doc.status === 'Pendiente';
    if (filterStatus === 'observados') return doc.status === 'Observado';

    return true;
  });

  const totalVerified = allDocs.filter(d => d.status === 'Verificado').length;
  const totalPending = allDocs.filter(d => d.status === 'Pendiente').length;

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-[#E2E6EC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              Control Documental y Requisitos de Crédito
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6573] mt-0.5">
              Checklist centralizado: DNI, sustento de ingresos, documentación del negocio y patrimonial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-4 py-2 bg-[#ECFDF5] rounded-md border border-[#A7F3D0] text-center">
            <span className="text-[#028448] block text-[10px] uppercase font-bold">Cotejados</span>
            <span className="text-lg font-bold text-[#028448] font-mono tabular-nums">{totalVerified}</span>
          </div>
          <div className="px-4 py-2 bg-[#FFFBEB] rounded-md border border-[#FDE68A] text-center">
            <span className="text-[#B45309] block text-[10px] uppercase font-bold">Pendientes</span>
            <span className="text-lg font-bold text-[#B45309] font-mono tabular-nums">{totalPending}</span>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white border border-[#E2E6EC] rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar documento, solicitante o código..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] placeholder:text-[#6B7280] outline-none focus:bg-white focus:border-[#004481]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'todas', label: 'Todas las categorías' },
              { id: 'personales', label: 'Doc. personales' },
              { id: 'negocio', label: 'Doc. negocio' },
              { id: 'financieros', label: 'Doc. financieros' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  filterCategory === cat.id
                    ? 'bg-[#004481] text-white'
                    : 'bg-white text-[#374151] hover:bg-[#F7F8FA] border border-[#CBD5E1]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#E2E6EC]">
          <span className="text-[11px] font-semibold text-[#5B6573] mr-1">Estado:</span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'verificados', label: 'Verificados / Conformes' },
            { id: 'pendientes', label: 'Pendientes' },
            { id: 'observados', label: 'Observados' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#072146] text-white'
                  : 'bg-white text-[#374151] hover:bg-[#F7F8FA] border border-[#CBD5E1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E2E6EC] bg-[#F7F8FA] text-[#5B6573] font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">Documento Requerido</th>
                <th className="py-3">Tipo Requisito</th>
                <th className="py-3">Expediente</th>
                <th className="py-3">Solicitante</th>
                <th className="py-3 text-center">Estado Cotejo</th>
                <th className="py-3 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6EC]">
              {filteredDocs.map((doc) => (
                <tr key={`${doc.dossierId}-${doc.id}`} className="hover:bg-[#F7F8FA] transition-colors">
                  <td className="py-3 pl-3 font-semibold text-[#121212]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#004481]" />
                      <span>{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-[#5B6573] text-[11px]">
                    {doc.documentType}
                  </td>
                  <td className="py-3 font-mono font-bold text-[#004481]">
                    {doc.dossierCode}
                  </td>
                  <td className="py-3 text-[#121212] font-medium">
                    {doc.applicantName}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                        doc.status === 'Verificado'
                          ? 'bg-[#ECFDF5] text-[#028448] border-[#A7F3D0]'
                          : doc.status === 'Observado'
                          ? 'bg-[#FEF2F2] text-[#C81E1E] border-[#FECACA]'
                          : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleDocStatus(doc.dossierId, doc.id, doc.status === 'Verificado' ? 'Pendiente' : 'Verificado')}
                        className={`p-1.5 rounded-md text-xs font-semibold cursor-pointer border ${
                          doc.status === 'Verificado'
                            ? 'bg-[#ECFDF5] text-[#028448] border-[#A7F3D0]'
                            : 'bg-white text-[#374151] border-[#CBD5E1] hover:bg-[#F7F8FA]'
                        }`}
                        title={doc.status === 'Verificado' ? 'Marcar pendiente' : 'Marcar verificado'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedDossierId(doc.dossierId)}
                        className="p-1.5 rounded-md bg-[#F0F5FA] hover:bg-[#004481] text-[#004481] hover:text-white border border-[#B8D0E6] transition-colors cursor-pointer"
                        title="Ver expediente"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
