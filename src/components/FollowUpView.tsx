import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { ApplicationStatus } from '../types/evalua';
import {
  CalendarClock,
  PlusCircle,
  Search,
  FolderOpen,
  Clock,
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

  const [targetDossierId, setTargetDossierId] = useState(dossiers[0]?.id || '');
  const [eventStatus, setEventStatus] = useState<ApplicationStatus>('en_evaluacion');
  const [eventObs, setEventObs] = useState('');
  const [eventNext, setEventNext] = useState('');

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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Registrada</span>;
      case 'en_evaluacion':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1D63ED] border border-blue-200">En evaluación</span>;
      case 'documentacion_pendiente':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Doc. pendiente</span>;
      case 'en_verificacion':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">En verificación</span>;
      case 'finalizada':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Finalizada</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/70 text-purple-600 flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
              Seguimiento de Solicitudes y Línea de Tiempo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Historial cronológico de cambios de estado, visitas y próximas acciones programadas
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddEventModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1D63ED] hover:bg-[#1552CC] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar seguimiento</span>
        </button>
      </div>

      {/* Filter and Timeline List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el seguimiento o titular..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500">Expediente:</span>
            <select
              value={selectedDossierFilter}
              onChange={(e) => setSelectedDossierFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-[#1D63ED]"
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

        {/* Timeline Stream */}
        <div className="space-y-3 pt-1">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No se registran eventos de seguimiento con los filtros actuales.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-200 hover:bg-white transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(ev.status)}
                    <span className="font-bold text-xs text-[#0B2545]">
                      {ev.responsibleName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({ev.responsibleRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      {ev.date} {ev.time}
                    </span>
                    <button
                      onClick={() => setSelectedDossierId(ev.dossierId)}
                      className="font-mono font-bold text-[#1D63ED] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{ev.dossierCode}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#0B2545]">Observación: </strong>
                  {ev.observation}
                </div>

                {ev.nextAction && (
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/70 text-purple-800 text-xs flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span><strong>Próxima acción programada:</strong> {ev.nextAction}</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>Titular: <strong className="text-[#0B2545]">{ev.applicantName}</strong></span>
                  <span>{ev.agency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Event */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0B2545]">Registrar Acción de Seguimiento</h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expediente *</label>
                <select
                  value={targetDossierId}
                  onChange={(e) => setTargetDossierId(e.target.value)}
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
                <label className="block font-bold text-slate-700 mb-1">Nuevo Estado</label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:border-[#1D63ED]"
                >
                  <option value="registrada">Registrada</option>
                  <option value="en_evaluacion">En evaluación</option>
                  <option value="documentacion_pendiente">Documentación pendiente</option>
                  <option value="en_verificacion">En verificación</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observación de la Gestión *</label>
                <textarea
                  rows={3}
                  required
                  value={eventObs}
                  onChange={(e) => setEventObs(e.target.value)}
                  placeholder="Detalle de la llamada, visita o recojo..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Próxima Acción / Compromiso</label>
                <input
                  type="text"
                  value={eventNext}
                  onChange={(e) => setEventNext(e.target.value)}
                  placeholder="Ej. Recoger contrato o elevar a comité"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
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
