import React, { useState } from 'react';
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
    toggleDocStatus
  } = useEvalua();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

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
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
            <FolderLock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
              Control Documental y Requisitos de Crédito
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Checklist centralizado: DNI, sustento de ingresos, documentación del negocio y patrimonial
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 text-center">
            <span className="text-emerald-700 block text-[10px] uppercase font-bold">Cotejados</span>
            <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">{totalVerified}</span>
          </div>
          <div className="px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-center">
            <span className="text-amber-700 block text-[10px] uppercase font-bold">Pendientes</span>
            <span className="text-lg font-black text-amber-700 font-mono tabular-nums">{totalPending}</span>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar documento, solicitante o código..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1D63ED]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'verificados', label: 'Verificados / Conformes' },
              { id: 'pendientes', label: 'Pendientes' },
              { id: 'observados', label: 'Observados' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
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
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 pl-3">Documento Requerido</th>
                <th className="py-3">Tipo Requisito</th>
                <th className="py-3">Expediente</th>
                <th className="py-3">Solicitante</th>
                <th className="py-3 text-center">Estado Cotejo</th>
                <th className="py-3 pr-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={`${doc.dossierId}-${doc.id}`} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3 pl-3 font-bold text-[#0B2545]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#1D63ED]" />
                      <span>{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-600 text-[11px]">
                    {doc.documentType}
                  </td>
                  <td className="py-3 font-mono font-bold text-[#1D63ED]">
                    {doc.dossierCode}
                  </td>
                  <td className="py-3 text-slate-700 font-medium">
                    {doc.applicantName}
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.status === 'Verificado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : doc.status === 'Observado'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleDocStatus(doc.dossierId, doc.id, doc.status === 'Verificado' ? 'Pendiente' : 'Verificado')}
                        className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          doc.status === 'Verificado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={doc.status === 'Verificado' ? 'Marcar pendiente' : 'Marcar verificado'}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedDossierId(doc.dossierId)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-[#1D63ED] text-[#1D63ED] hover:text-white transition-colors cursor-pointer"
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
