import React, { useState, useEffect } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import { PersonalReference } from '../types/evalua';
import {
  Users,
  MapPin,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Phone,
  Calendar,
  UserCheck,
  FolderOpen
} from 'lucide-react';

export const ReferencesView: React.FC = () => {
  const {
    dossiers,
    selectedDossierId,
    setSelectedDossierId,
    updateDossierReferences,
    updateDossierVisit,
    currentUser,
    activeSubSection
  } = useEvalua();

  const activeDossier = dossiers.find((d) => d.id === selectedDossierId) || dossiers[0];

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [refFilter, setRefFilter] = useState<'todas' | 'personales' | 'comerciales'>('todas');

  useEffect(() => {
    if (activeSubSection === 'ref-personales') {
      setRefFilter('personales');
    } else if (activeSubSection === 'ref-comerciales') {
      setRefFilter('comerciales');
    } else if (activeSubSection === 'ref-resultados') {
      setRefFilter('todas');
      setTimeout(() => {
        document.getElementById('ref-resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      setRefFilter('todas');
    }
  }, [activeSubSection]);

  // Visit verification form state
  const [visitDate, setVisitDate] = useState('');
  const [addressVisited, setAddressVisited] = useState('');
  const [personContacted, setPersonContacted] = useState('');
  const [informationVerified, setInformationVerified] = useState('');
  const [visitObservations, setVisitObservations] = useState('');

  // New reference form state
  const [refType, setRefType] = useState<PersonalReference['referenceType']>('Comercial');
  const [refName, setRefName] = useState('');
  const [refPhone, setRefPhone] = useState('');
  const [refRelation, setRefRelation] = useState('');
  const [refResult, setRefResult] = useState<PersonalReference['verificationResult']>('Favorable');
  const [refObs, setRefObs] = useState('');

  useEffect(() => {
    if (activeDossier) {
      setVisitDate(activeDossier.visitVerification?.visitDate || new Date().toISOString().split('T')[0]);
      setAddressVisited(activeDossier.visitVerification?.addressVisited || activeDossier.business.businessAddress);
      setPersonContacted(activeDossier.visitVerification?.personContacted || activeDossier.personal.fullName);
      setInformationVerified(activeDossier.visitVerification?.informationVerified || '');
      setVisitObservations(activeDossier.visitVerification?.observations || '');
    }
  }, [activeDossier?.id]);

  if (!activeDossier) {
    return (
      <div className="bg-white rounded-lg border border-[#E2E6EC] p-10 text-center max-w-3xl mx-auto">
        <FolderOpen className="w-10 h-10 text-[#6B7280] mx-auto mb-2" />
        <h3 className="text-base font-bold text-[#121212]">No hay expedientes registrados</h3>
        <p className="text-xs text-[#5B6573] mt-1">Cree un expediente para registrar referencias y visitas de campo.</p>
      </div>
    );
  }

  const showSaved = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDossierVisit(activeDossier.id, {
      visitDate,
      addressVisited,
      personContacted,
      informationVerified,
      observations: visitObservations,
      verifiedBy: currentUser?.name || 'Asesor asignado'
    });
    showSaved('Datos de visita de campo guardados correctamente.');
  };

  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim()) return;
    const newRef: PersonalReference = {
      id: `ref-${Date.now()}`,
      referenceType: refType,
      name: refName.trim(),
      phone: refPhone.trim() || 'Por confirmar',
      relationship: refRelation.trim() || refType,
      contactDate: new Date().toISOString().split('T')[0],
      verificationResult: refResult,
      observations: refObs.trim() || undefined
    };
    updateDossierReferences(activeDossier.id, [newRef, ...activeDossier.references]);
    setRefName('');
    setRefPhone('');
    setRefRelation('');
    setRefObs('');
    showSaved('Referencia registrada en el expediente.');
  };

  const handleDeleteReference = (refId: string) => {
    updateDossierReferences(
      activeDossier.id,
      activeDossier.references.filter((r) => r.id !== refId)
    );
    showSaved('Referencia eliminada.');
  };

  const handleUpdateResult = (refId: string, result: PersonalReference['verificationResult']) => {
    updateDossierReferences(
      activeDossier.id,
      activeDossier.references.map((r) => (r.id === refId ? { ...r, verificationResult: result } : r))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Dossier Selector */}
      <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#121212] tracking-tight">
                Referencias y Visita de Campo
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6573]">
                Verificación de referencias personales, comerciales, proveedores y visita presencial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5B6573]">Expediente:</span>
            <select
              value={activeDossier.id}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="px-3 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-semibold text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481] cursor-pointer"
            >
              {dossiers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.personal.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {saveFeedback && (
          <div className="p-3 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#028448] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: References List + Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Add Reference Form */}
          <form
            onSubmit={handleAddReference}
            className="bg-white rounded-lg border border-[#E2E6EC] p-5 space-y-4"
          >
            <div>
              <h2 className="text-sm font-bold text-[#121212] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#004481]" />
                <span>Registrar nueva referencia</span>
              </h2>
              <p className="text-[11px] text-[#1464A5] mt-0.5">
                Registre al menos una referencia comercial y una personal para respaldar la evaluación.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Tipo de referencia</label>
                <select
                  value={refType}
                  onChange={(e) => setRefType(e.target.value as PersonalReference['referenceType'])}
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                >
                  <option value="Comercial">Comercial</option>
                  <option value="Proveedor">Proveedor</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Familiar">Familiar</option>
                  <option value="Vecinal">Vecinal</option>
                  <option value="Laboral">Laboral</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Nombre completo / Razón social *</label>
                <input
                  type="text"
                  required
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="Ej. Distribuidora Centro S.A.C."
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Teléfono</label>
                <input
                  type="text"
                  value={refPhone}
                  onChange={(e) => setRefPhone(e.target.value)}
                  placeholder="Ej. 962-450-120"
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Vínculo / Relación</label>
                <input
                  type="text"
                  value={refRelation}
                  onChange={(e) => setRefRelation(e.target.value)}
                  placeholder="Ej. Proveedor hace 3 años"
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Resultado de verificación</label>
                <select
                  value={refResult}
                  onChange={(e) => setRefResult(e.target.value as PersonalReference['verificationResult'])}
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                >
                  <option value="Favorable">Favorable</option>
                  <option value="Con observaciones">Con observaciones</option>
                  <option value="No contesta">No contesta</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Observaciones</label>
                <input
                  type="text"
                  value={refObs}
                  onChange={(e) => setRefObs(e.target.value)}
                  placeholder="Comentarios del contacto realizado..."
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>+ Agregar referencia</span>
              </button>
            </div>
          </form>

          {/* Existing References */}
          <div className="bg-white rounded-lg border border-[#E2E6EC] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E2E6EC]">
              <h3 className="text-sm font-bold text-[#121212]">
                Referencias registradas ({activeDossier.references.length})
              </h3>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'personales', label: 'Personales' },
                  { id: 'comerciales', label: 'Comerciales' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setRefFilter(f.id as 'todas' | 'personales' | 'comerciales')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      refFilter === f.id
                        ? 'bg-[#004481] text-white'
                        : 'bg-white text-[#374151] border border-[#CBD5E1] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            {(() => {
              const visibleRefs = activeDossier.references.filter((r) => {
                if (refFilter === 'personales') {
                  return r.referenceType === 'Familiar' || r.referenceType === 'Vecinal' || r.referenceType === 'Laboral';
                }
                if (refFilter === 'comerciales') {
                  return r.referenceType === 'Comercial' || r.referenceType === 'Proveedor' || r.referenceType === 'Cliente';
                }
                return true;
              });
              if (visibleRefs.length === 0) {
                return (
                  <p className="text-xs text-[#5B6573] py-6 text-center">
                    No hay referencias registradas en esta categoría todavía.
                  </p>
                );
              }
              return (
              <div className="divide-y divide-[#E2E6EC]">
                {visibleRefs.map((r) => (
                  <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-[#121212]">{r.name}</span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span className="text-[#004481] font-semibold">{r.referenceType}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5B6573]">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {r.phone}
                        </span>
                        <span>{r.relationship}</span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" /> {r.contactDate}
                        </span>
                      </div>
                      {r.observations && (
                        <p className="text-xs text-[#374151]">{r.observations}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={r.verificationResult}
                        onChange={(e) =>
                          handleUpdateResult(r.id, e.target.value as PersonalReference['verificationResult'])
                        }
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer ${
                          r.verificationResult === 'Favorable'
                            ? 'bg-[#ECFDF5] text-[#028448] border-[#A7F3D0]'
                            : r.verificationResult === 'Con observaciones'
                            ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                            : 'bg-[#F7F8FA] text-[#374151] border-[#D1D5DB]'
                        }`}
                      >
                        <option value="Favorable">Favorable</option>
                        <option value="Con observaciones">Con observaciones</option>
                        <option value="No contesta">No contesta</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                      <button
                        onClick={() => handleDeleteReference(r.id)}
                        className="p-1.5 rounded-md text-[#5B6573] hover:text-[#C81E1E] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                        title="Eliminar referencia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        </div>

        {/* Right: Field Visit Verification & Contact Results Form */}
        <div id="ref-resultados" className="lg:col-span-5 scroll-mt-20">
          <form
            onSubmit={handleSaveVisit}
            className={`bg-white rounded-lg border p-5 space-y-4 sticky top-24 transition-colors ${
              activeSubSection === 'ref-resultados'
                ? 'border-[#004481] ring-1 ring-[#004481]/20'
                : 'border-[#E2E6EC]'
            }`}
          >
            <h2 className="text-sm font-bold text-[#121212] flex items-center gap-2 pb-3 border-b border-[#E2E6EC]">
              <MapPin className="w-4 h-4 text-[#004481]" />
              <span>Registro de visita de campo</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Fecha de visita</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Dirección verificada</label>
                <input
                  type="text"
                  value={addressVisited}
                  onChange={(e) => setAddressVisited(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Persona entrevistada</label>
                <input
                  type="text"
                  value={personContacted}
                  onChange={(e) => setPersonContacted(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Información contrastada en visita</label>
                <textarea
                  rows={3}
                  value={informationVerified}
                  onChange={(e) => setInformationVerified(e.target.value)}
                  placeholder="Inventario observado, cuaderno de ventas, condiciones del local..."
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#374151] mb-1.5">Observaciones de campo</label>
                <textarea
                  rows={3}
                  value={visitObservations}
                  onChange={(e) => setVisitObservations(e.target.value)}
                  placeholder="Hallazgos relevantes, consistencia comercial..."
                  className="w-full px-3 py-2.5 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-[#121212] focus:outline-none focus:bg-white focus:border-[#004481]"
                />
              </div>

              <div className="p-3 rounded-md bg-[#F7F8FA] border border-[#E2E6EC] flex items-center gap-2 text-[11px] text-[#374151]">
                <UserCheck className="w-4 h-4 text-[#004481] shrink-0" />
                <span>
                  Responsable de verificación: <strong className="text-[#121212]">{activeDossier.visitVerification?.verifiedBy || currentUser?.name}</strong>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar visita de campo</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
