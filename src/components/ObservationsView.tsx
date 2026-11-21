import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  MessageSquareText,
  Search,
  FolderOpen,
  PlusCircle,
  X,
  Clock
} from 'lucide-react';

export const ObservationsView: React.FC = () => {
  const {
    dossiers,
    setSelectedDossierId,
    addTimelineEvent,
    currentUser
  } = useEvalua();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedDossierId, setLocalSelectedDossierId] = useState(dossiers[0]?.id || '');
  const [obsType, setObsType] = useState('campo_visita');
  const [obsContent, setObsContent] = useState('');
  const [nextAction, setNextAction] = useState('');

  const allObservations = dossiers.flatMap((d) => [
    ...d.timeline.map((ev) => ({
      id: ev.id,
      dossierId: d.id,
      dossierCode: d.code,
      applicantName: d.personal.fullName,
      agency: d.agency,
      authorName: ev.responsibleName,
      authorRole: ev.responsibleRole,
      date: `${ev.date} ${ev.time}`,
      type: 'Seguimiento / Campo',
      content: ev.observation,
      nextAction: ev.nextAction
    })),
    ...(d.qualitative.analystComments
      ? [{
          id: `qual-${d.id}`,
          dossierId: d.id,
          dossierCode: d.code,
          applicantName: d.personal.fullName,
          agency: d.agency,
          authorName: d.assignedAnalystName,
          authorRole: d.assignedAnalystRole,
          date: d.updatedAt,
          type: 'Análisis Cualitativo',
          content: d.qualitative.analystComments,
          nextAction: undefined
        }]
      : [])
  ]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredObservations = allObservations.filter((obs) => {
    const q = search.toLowerCase();
    return (
      !search ||
      obs.content.toLowerCase().includes(q) ||
      obs.applicantName.toLowerCase().includes(q) ||
      obs.dossierCode.toLowerCase().includes(q) ||
      obs.authorName.toLowerCase().includes(q)
    );
  });

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsContent.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    addTimelineEvent(selectedDossierId, {
      date: today,
      time: nowTime,
      status: 'en_evaluacion',
      responsibleName: currentUser?.name || 'Analista de Crédito',
      responsibleRole: currentUser?.roleTitle || 'Analista',
      observation: `[${obsType.toUpperCase()}] ${obsContent.trim()}`,
      nextAction: nextAction.trim() || undefined
    });

    setShowAddModal(false);
    setObsContent('');
    setNextAction('');
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
              Observaciones, Notas Técnicas y Conclusiones
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Bitácora de inspecciones de campo, hallazgos financieros y comentarios del asesor
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CC] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar observación</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el contenido, autor o titular..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredObservations.length} registros mostrados
          </span>
        </div>

        {/* Observations List */}
        <div className="space-y-3">
          {filteredObservations.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No se encontraron observaciones registradas.
            </div>
          ) : (
            filteredObservations.map((obs) => (
              <div
                key={obs.id}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1D63ED] border border-blue-200/70">
                      {obs.type}
                    </span>
                    <span className="font-bold text-xs text-[#0B2545]">
                      {obs.authorName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({obs.authorRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono text-[11px]">{obs.date}</span>
                    <button
                      onClick={() => setSelectedDossierId(obs.dossierId)}
                      className="text-[#1D63ED] hover:underline font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{obs.dossierCode}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{obs.content}</p>

                {obs.nextAction && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/70 text-purple-700 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Próxima acción: {obs.nextAction}</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>Titular: <strong className="text-[#0B2545]">{obs.applicantName}</strong></span>
                  <span>{obs.agency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Observation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0B2545]">Registrar Nueva Observación</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateObservation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expediente *</label>
                <select
                  value={selectedDossierId}
                  onChange={(e) => setLocalSelectedDossierId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-[#1D63ED]"
                >
                  {dossiers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.personal.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Observación</label>
                <select
                  value={obsType}
                  onChange={(e) => setObsType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-[#1D63ED]"
                >
                  <option value="campo_visita">Visita de Campo</option>
                  <option value="financiera">Evaluación Financiera</option>
                  <option value="documentacion">Documentación</option>
                  <option value="subsanacion">Subsanación</option>
                  <option value="general">Nota General</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contenido Técnico *</label>
                <textarea
                  rows={3}
                  required
                  value={obsContent}
                  onChange={(e) => setObsContent(e.target.value)}
                  placeholder="Detalle la información observada..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Próxima Acción (Opcional)</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="Ej. Cotejo de recibos o contrato"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1D63ED] hover:bg-[#1552CC] text-white font-bold rounded-xl cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
