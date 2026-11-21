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
    currentUser
  } = useEvalua();

  const activeDossier = dossiers.find((d) => d.id === selectedDossierId) || dossiers[0];

  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

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
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-3xl mx-auto">
        <FolderOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-[#0B2545]">No hay expedientes registrados</h3>
        <p className="text-xs text-slate-500 mt-1">Cree un expediente para registrar referencias y visitas de campo.</p>
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0EA5E9] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2545] tracking-tight">
                Referencias y Visita de Campo
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Verificación de referencias personales, comerciales, proveedores y visita presencial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Expediente:</span>
            <select
              value={activeDossier.id}
              onChange={(e) => setSelectedDossierId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2545] focus:outline-none focus:border-[#1D63ED] cursor-pointer"
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
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
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
            className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4"
          >
            <h2 className="text-sm font-bold text-[#0B2545] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#1D63ED]" />
              <span>Registrar nueva referencia</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tipo de referencia</label>
                <select
                  value={refType}
                  onChange={(e) => setRefType(e.target.value as PersonalReference['referenceType'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
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
                <label className="block font-semibold text-slate-600 mb-1">Nombre completo / Razón social *</label>
                <input
                  type="text"
                  required
                  value={refName}
                  onChange={(e) => setRefName(e.target.value)}
                  placeholder="Ej. Distribuidora Centro S.A.C."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={refPhone}
                  onChange={(e) => setRefPhone(e.target.value)}
                  placeholder="Ej. 962-450-120"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Vínculo / Relación</label>
                <input
                  type="text"
                  value={refRelation}
                  onChange={(e) => setRefRelation(e.target.value)}
                  placeholder="Ej. Proveedor hace 3 años"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Resultado de verificación</label>
                <select
                  value={refResult}
                  onChange={(e) => setRefResult(e.target.value as PersonalReference['verificationResult'])}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                >
                  <option value="Favorable">Favorable</option>
                  <option value="Con observaciones">Con observaciones</option>
                  <option value="No contesta">No contesta</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={refObs}
                  onChange={(e) => setRefObs(e.target.value)}
                  placeholder="Comentarios del contacto realizado..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar referencia</span>
              </button>
            </div>
          </form>

          {/* Existing References */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#0B2545]">
              Referencias registradas ({activeDossier.references.length})
            </h3>
            {activeDossier.references.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No hay referencias registradas en este expediente todavía.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeDossier.references.map((r) => (
                  <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[#1D63ED] font-semibold">{r.referenceType}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {r.phone}
                        </span>
                        <span>{r.relationship}</span>
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" /> {r.contactDate}
                        </span>
                      </div>
                      {r.observations && (
                        <p className="text-xs text-slate-600">{r.observations}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={r.verificationResult}
                        onChange={(e) =>
                          handleUpdateResult(r.id, e.target.value as PersonalReference['verificationResult'])
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                          r.verificationResult === 'Favorable'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : r.verificationResult === 'Con observaciones'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="Favorable">Favorable</option>
                        <option value="Con observaciones">Con observaciones</option>
                        <option value="No contesta">No contesta</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                      <button
                        onClick={() => handleDeleteReference(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Eliminar referencia"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Field Visit Verification Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSaveVisit}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4 sticky top-24"
          >
            <h2 className="text-sm font-bold text-[#0B2545] flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-[#16A34A]" />
              <span>Registro de visita de campo</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Fecha de visita</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Dirección verificada</label>
                <input
                  type="text"
                  value={addressVisited}
                  onChange={(e) => setAddressVisited(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Persona entrevistada</label>
                <input
                  type="text"
                  value={personContacted}
                  onChange={(e) => setPersonContacted(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Información contrastada en visita</label>
                <textarea
                  rows={3}
                  value={informationVerified}
                  onChange={(e) => setInformationVerified(e.target.value)}
                  placeholder="Inventario observado, cuaderno de ventas, condiciones del local..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Observaciones de campo</label>
                <textarea
                  rows={3}
                  value={visitObservations}
                  onChange={(e) => setVisitObservations(e.target.value)}
                  placeholder="Hallazgos relevantes, consistencia comercial..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D63ED]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-600">
                <UserCheck className="w-4 h-4 text-[#1D63ED] shrink-0" />
                <span>
                  Responsable de verificación: <strong>{activeDossier.visitVerification?.verifiedBy || currentUser?.name}</strong>
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
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
