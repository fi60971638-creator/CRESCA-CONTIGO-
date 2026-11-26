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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-[#E2E6EC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              Observaciones, Notas Técnicas y Conclusiones
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6573] mt-0.5">
              Bitácora de inspecciones de campo, hallazgos financieros y comentarios del asesor
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Registrar observación</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-[#E2E6EC] rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el contenido, autor o titular..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] placeholder:text-[#6B7280] outline-none focus:bg-white focus:border-[#004481]"
            />
          </div>
          <span className="text-xs font-semibold text-[#5B6573]">
            {filteredObservations.length} registros mostrados
          </span>
        </div>

        {/* Observations List */}
        <div className="space-y-3">
          {filteredObservations.length === 0 ? (
            <div className="p-8 text-center bg-[#F7F8FA] rounded-md border border-[#E2E6EC] text-xs text-[#5B6573]">
              No se encontraron observaciones registradas.
            </div>
          ) : (
            filteredObservations.map((obs) => (
              <div
                key={obs.id}
                className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E2E6EC] hover:bg-white hover:border-[#B8D0E6] transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E6EC] pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-[#F0F5FA] text-[#004481] border border-[#B8D0E6]">
                      {obs.type}
                    </span>
                    <span className="font-bold text-xs text-[#121212]">
                      {obs.authorName}
                    </span>
                    <span className="text-[11px] text-[#5B6573]">
                      ({obs.authorRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#5B6573]">
                    <span className="font-mono text-[11px]">{obs.date}</span>
                    <button
                      onClick={() => setSelectedDossierId(obs.dossierId)}
                      className="text-[#004481] hover:underline font-mono font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{obs.dossierCode}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#121212] leading-relaxed">{obs.content}</p>

                {obs.nextAction && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F0F5FA] border border-[#B8D0E6] text-[#1464A5] text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Próxima acción: {obs.nextAction}</span>
                  </div>
                )}

                <div className="text-[11px] text-[#5B6573] pt-1 flex items-center justify-between">
                  <span>Titular: <strong className="text-[#121212]">{obs.applicantName}</strong></span>
                  <span>{obs.agency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Observation */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#072146]/40 p-4">
          <div className="w-full max-w-md bg-white border border-[#E2E6EC] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6EC]">
              <h3 className="text-base font-bold text-[#121212]">Registrar Nueva Observación</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#5B6573] hover:text-[#121212] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateObservation} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Expediente *</label>
                <select
                  value={selectedDossierId}
                  onChange={(e) => setLocalSelectedDossierId(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
                >
                  {dossiers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.personal.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Tipo de Observación</label>
                <select
                  value={obsType}
                  onChange={(e) => setObsType(e.target.value)}
                  className="w-full p-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
                >
                  <option value="campo_visita">Visita de Campo</option>
                  <option value="financiera">Evaluación Financiera</option>
                  <option value="documentacion">Documentación</option>
                  <option value="subsanacion">Subsanación</option>
                  <option value="general">Nota General</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Contenido Técnico *</label>
                <textarea
                  rows={3}
                  required
                  value={obsContent}
                  onChange={(e) => setObsContent(e.target.value)}
                  placeholder="Detalle la información observada..."
                  className="w-full p-3 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Próxima Acción (Opcional)</label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="Ej. Cotejo de recibos o contrato"
                  className="w-full p-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#121212] font-semibold bg-white border border-[#CBD5E1] hover:bg-[#F7F8FA] rounded-md cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004481] hover:bg-[#072146] text-white font-semibold rounded-md cursor-pointer"
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
