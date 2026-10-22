import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  FolderLock,
  Search,
  FileCheck2,
  FileWarning,
  FileText,
  Upload,
  Check,
  FolderOpen
} from 'lucide-react';
import { DocumentVerificationStatus } from '../types/evalua';

export const DocumentsView: React.FC = () => {
  const {
    dossiers,
    setSelectedDossierId,
    toggleDocStatus
  } = useEvalua();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Flatten all documents
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

    if (filterStatus === 'verificados') return doc.status === 'Verificado';
    if (filterStatus === 'pendientes') return doc.status === 'Pendiente';
    if (filterStatus === 'observados') return doc.status === 'Observado';

    return true;
  });

  const totalVerified = allDocs.filter(d => d.status === 'Verificado').length;
  const totalPending = allDocs.filter(d => d.status === 'Pendiente').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FolderLock className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Control Documental y Requisitos de Crédito
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Checklist centralizado: DNI, Sustento de Ingresos, Documentación de Negocio y Patrimonial
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Cotejados</span>
            <span className="text-base font-black text-emerald-400">{totalVerified}</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Pendientes</span>
            <span className="text-base font-black text-amber-400">{totalPending}</span>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar documento, solicitante o código..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'verificados', label: 'Verificados / Conformes' },
              { id: 'pendientes', label: 'Pendientes' },
              { id: 'observados', label: 'Observados' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-amber-600 text-white shadow-sm'
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
                <th className="pb-3 pl-3">Documento Requerido</th>
                <th className="pb-3">Tipo Requisito</th>
                <th className="pb-3">Expediente</th>
                <th className="pb-3">Solicitante</th>
                <th className="pb-3 text-center">Estado Cotejo</th>
                <th className="pb-3 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.map((doc) => (
                <tr key={`${doc.dossierId}-${doc.id}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-3 font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">
                    {doc.documentType}
                  </td>
                  <td className="py-3 font-mono font-bold text-blue-400">
                    {doc.dossierCode}
                  </td>
                  <td className="py-3 text-slate-300">
                    {doc.applicantName}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        doc.status === 'Verificado'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : doc.status === 'Observado'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleDocStatus(doc.dossierId, doc.id, doc.status === 'Verificado' ? 'Pendiente' : 'Verificado')}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          doc.status === 'Verificado' ? 'bg-emerald-600/20 text-emerald-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                        title={doc.status === 'Verificado' ? 'Marcar pendiente' : 'Marcar verificado'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedDossierId(doc.dossierId)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
