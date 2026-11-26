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
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
              Seguimiento de Solicitudes y Línea de Tiempo
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6573] mt-0.5">
              Historial cronológico de cambios de estado, visitas y próximas acciones programadas
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddEventModal(true)}
          className="px-4 py-2.5 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Registrar seguimiento</span>
        </button>
      </div>

      {/* Filter and Timeline List */}
      <div className="bg-white border border-[#E2E6EC] rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en el seguimiento o titular..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] placeholder:text-[#6B7280] outline-none focus:bg-white focus:border-[#004481]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-[#5B6573]">Expediente:</span>
            <select
              value={selectedDossierFilter}
              onChange={(e) => setSelectedDossierFilter(e.target.value)}
              className="px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-semibold text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
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
            <div className="p-8 text-center bg-[#F7F8FA] rounded-md border border-[#E2E6EC] text-xs text-[#5B6573]">
              No se registran eventos de seguimiento con los filtros actuales.
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E2E6EC] hover:bg-white hover:border-[#B8D0E6] transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E6EC] pb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(ev.status)}
                    <span className="font-bold text-xs text-[#121212]">
                      {ev.responsibleName}
                    </span>
                    <span className="text-[11px] text-[#5B6573]">
                      ({ev.responsibleRole})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[#5B6573] font-mono text-[11px]">
                      {ev.date} {ev.time}
                    </span>
                    <button
                      onClick={() => setSelectedDossierId(ev.dossierId)}
                      className="font-mono font-bold text-[#004481] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{ev.dossierCode}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#121212] leading-relaxed">
                  <strong className="text-[#121212]">Observación: </strong>
                  {ev.observation}
                </div>

                {ev.nextAction && (
                  <div className="p-2.5 rounded-md bg-[#F0F5FA] border border-[#B8D0E6] text-[#1464A5] text-xs flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#004481] shrink-0" />
                    <span><strong>Próxima acción programada:</strong> {ev.nextAction}</span>
                  </div>
                )}

                <div className="text-[11px] text-[#5B6573] pt-1 flex items-center justify-between">
                  <span>Titular: <strong className="text-[#121212]">{ev.applicantName}</strong></span>
                  <span>{ev.agency}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Add Event */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#072146]/40 p-4">
          <div className="w-full max-w-md bg-white border border-[#E2E6EC] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6EC]">
              <h3 className="text-base font-bold text-[#121212]">Registrar Acción de Seguimiento</h3>
              <button onClick={() => setShowAddEventModal(false)} className="text-[#5B6573] hover:text-[#121212] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Expediente *</label>
                <select
                  value={targetDossierId}
                  onChange={(e) => setTargetDossierId(e.target.value)}
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
                <label className="block font-semibold text-[#374151] mb-1.5">Nuevo Estado</label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value as ApplicationStatus)}
                  className="w-full p-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
                >
                  <option value="registrada">Registrada</option>
                  <option value="en_evaluacion">En evaluación</option>
                  <option value="documentacion_pendiente">Documentación pendiente</option>
                  <option value="en_verificacion">En verificación</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Observación de la Gestión *</label>
                <textarea
                  rows={3}
                  required
                  value={eventObs}
                  onChange={(e) => setEventObs(e.target.value)}
                  placeholder="Detalle de la llamada, visita o recojo..."
                  className="w-full p-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Próxima Acción / Compromiso</label>
                <input
                  type="text"
                  value={eventNext}
                  onChange={(e) => setEventNext(e.target.value)}
                  placeholder="Ej. Recoger contrato o elevar a comité"
                  className="w-full p-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
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
