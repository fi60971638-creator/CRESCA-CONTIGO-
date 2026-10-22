import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { ApplicationStatus, TimelineEvent } from '../types/evalua';
import {
  CalendarClock,
  PlusCircle,
  Search,
  FolderOpen,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';

export const FollowUpView: React.FC = () => {
  const {
    dossiers,
    setSelectedDossierId,
    addTimelineEvent,
    updateDossierStatus,
    currentUser
  } = useEvalua();

  const [selectedDossierFilter, setSelectedDossierFilter] = useState<string>('todos');
  const [search, setSearch] = useState('');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Event modal form
  const [targetDossierId, setTargetDossierId] = useState(dossiers[0]?.id || '');
  const [eventStatus, setEventStatus] = useState<ApplicationStatus>('en_evaluacion');
  const [eventObs, setEventObs] = useState('');
  const [eventNext, setEventNext] = useState('');

  // Collect all timeline events from all dossiers
  const allEvents = dossiers.flatMap((d) =>
    d.timeline.map((ev) => ({
      ...ev,
      dossierId: d.id,
      dossierCode: d.code,
      applicantName: d.personal.fullName,
      agency: d.agency
    }))
  ).sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

  const filteredEvents = allEvents.filter((ev) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      ev.applicantName.toLowerCase().includes(q) ||
      ev.dossierCode.toLowerCase().includes(q) ||
      ev.observation.toLowerCase().includes(q) ||
      ev.responsibleName.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (selectedDossierFilter !== 'todos' && ev.dossierId !== selectedDossierFilter) return false;

    return true;
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventObs.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    addTimelineEvent(targetDossierId, {
      date: today,
      time: nowTime,
      status: eventStatus,
      responsibleName: currentUser?.name || 'Analista de Crédito',
      responsibleRole: currentUser?.roleTitle || 'Analista',
      observation: eventObs.trim(),
      nextAction: eventNext.trim() || undefined
    });

    updateDossierStatus(targetDossierId, eventStatus, eventObs.trim(), eventNext.trim());

    setShowAddEventModal(false);
    setEventObs('');
    setEventNext('');
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'registrada':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">Registrada</span>;
      case 'en_evaluacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400">En evaluación</span>;
      case 'documentacion_pendiente':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400">Doc. pendiente</span>;
      case 'en_verificacion':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-400">En verificación</span>;
      case 'finalizada':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">Finalizada</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Seguimiento de Solicitudes y Línea de Tiempo
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historial cronológico de cambios de estado, observaciones de campo y próximas acciones
          </p>
        </div>

        <button
          onClick={() => setShowAddEventModal(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Registrar Seguimiento</span>
        </button>
      </div>

      {/* Filter and Timeline List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el seguimiento o titular..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtrar por Expediente:</span>
            <select
              value={selectedDossierFilter}
              onChange={(e) => setSelectedDossierFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="todos">Todos los expedientes</option>
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.personal.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline Stream (Requirement 26) */}
        <div className="space-y-4 pt-2">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400">
              No se registran eventos de seguimiento con los filtros actuales.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-2 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ev.status)}
                    <span className="font-bold text-xs text-slate-200">
                      {ev.responsibleName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({ev.responsibleRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {ev.date} {ev.time}
                    </span>
                    <button
                      onClick={() => setSelectedDossierId(ev.dossierId)}
                      className="font-mono font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{ev.dossierCode}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-200 leading-relaxed pt-1">
                  <strong>Observación: </strong> {ev.observation}
                </div>

                {ev.nextAction && (
                  <div className="p-2 rounded bg-purple-950/30 border border-purple-800/40 text-purple-300 text-xs flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span><strong>Próxima acción programada:</strong> {ev.nextAction}</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>Titular: <strong className="text-slate-300">{ev.applicantName}</strong></span>
                  <span>Agencia: {ev.agency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Event */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Registrar Acción de Seguimiento</h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Expediente *</label>
                <select
                  value={targetDossierId}
                  onChange={(e) => setTargetDossierId(e.target.value)}
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                >
                  {dossiers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.personal.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nuevo Estado</label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="registrada">Registrada</option>
                  <option value="en_evaluacion">En evaluación</option>
                  <option value="documentacion_pendiente">Documentación pendiente</option>
                  <option value="en_verificacion">En verificación</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Observación de la Gestión *</label>
                <textarea
                  rows={3}
                  required
                  value={eventObs}
                  onChange={(e) => setEventObs(e.target.value)}
                  placeholder="Detalle de la llamada, visita o recojo..."
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Próxima Acción / Compromiso</label>
                <input
                  type="text"
                  value={eventNext}
                  onChange={(e) => setEventNext(e.target.value)}
                  placeholder="Ej. Recoger contrato o elevar a comité"
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
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
