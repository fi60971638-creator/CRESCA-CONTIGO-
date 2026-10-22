import React, { useState, useMemo } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  FileSpreadsheet,
  User,
  Building2,
  Briefcase,
  TrendingUp,
  DollarSign,
  Wallet,
  CreditCard,
  FileCheck,
  FileText,
  Clock,
  Printer,
  Download,
  PlusCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Save,
  Check,
  Percent,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  UploadCloud,
  FileCode,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  FinancialRecordFile,
  ClientType,
  FinancialItem,
  ObligationRecord,
  SupportDocumentRecord
} from '../types/financialRecord';
import {
  calculateBalanceSheetTotals,
  calculateIncomeStatementTotals,
  calculateCashFlowTotals,
  calculateObligationsTotals,
  calculatePaymentCapacity,
  calculateFinancialRatios,
  calculateVerificationMetrics,
  FINANCIAL_FORMULAS_EXPLANATION
} from '../utils/financialRecordCalculations';

export const FinancialAnalysisModule: React.FC = () => {
  const {
    currentUser,
    financialRecords,
    selectedFinancialRecordId,
    setSelectedFinancialRecordId,
    createFinancialRecord,
    updateFinancialRecord,
    deleteFinancialRecord,
    addFinancialItem,
    updateFinancialItem,
    deleteFinancialItem,
    addObligation,
    updateObligation,
    deleteObligation,
    addSupportDocument,
    updateSupportDocument,
    deleteSupportDocument,
    addAuditHistoryEntry
  } = useEvalua();

  // Active Tab within the Financial Record
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Selected Record
  const currentRecord: FinancialRecordFile | undefined = useMemo(() => {
    return (
      financialRecords.find((r) => r.id === selectedFinancialRecordId) ||
      financialRecords[0]
    );
  }, [financialRecords, selectedFinancialRecordId]);

  // Calculations for current record
  const bsTotals = useMemo(() => {
    if (!currentRecord) return null;
    return calculateBalanceSheetTotals(currentRecord.balanceSheet);
  }, [currentRecord]);

  const isTotals = useMemo(() => {
    if (!currentRecord) return null;
    return calculateIncomeStatementTotals(currentRecord.incomeStatement);
  }, [currentRecord]);

  const cfTotals = useMemo(() => {
    if (!currentRecord) return null;
    return calculateCashFlowTotals(currentRecord.cashFlow);
  }, [currentRecord]);

  const obTotals = useMemo(() => {
    if (!currentRecord) return null;
    return calculateObligationsTotals(currentRecord.obligations);
  }, [currentRecord]);

  const payCapacity = useMemo(() => {
    if (!currentRecord || !isTotals || !obTotals) return null;
    return calculatePaymentCapacity(
      currentRecord.general.clientType,
      currentRecord.incomeExpenseItems,
      isTotals,
      obTotals.totalMonthlyInstallment,
      currentRecord.cashFlow.familyExpensesOrPersonalDraws,
      currentRecord.evaluationParams.proposedInstallment
    );
  }, [currentRecord, isTotals, obTotals]);

  const ratios = useMemo(() => {
    if (!bsTotals || !isTotals || !payCapacity || !obTotals) return null;
    return calculateFinancialRatios(
      bsTotals,
      isTotals,
      payCapacity,
      obTotals.totalMonthlyInstallment
    );
  }, [bsTotals, isTotals, payCapacity, obTotals]);

  const verificationMetrics = useMemo(() => {
    if (!currentRecord) return null;
    return calculateVerificationMetrics(
      currentRecord.incomeExpenseItems,
      currentRecord.supportDocuments
    );
  }, [currentRecord]);

  const triggerSaveNotification = (msg: string) => {
    setSaveSuccessMessage(msg);
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  if (!currentRecord) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl mx-auto">
        <FileSpreadsheet className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">No hay expedientes financieros registrados</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          Comience creando un nuevo expediente para un cliente Persona natural, Persona con negocio o Empresa.
        </p>
        <button
          onClick={() => setIsNewRecordModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
        >
          + Crear Primer Expediente
        </button>
      </div>
    );
  }

  // 10 Tabs Definition
  const tabs = [
    { id: 1, name: '1. Datos Generales', icon: User },
    { id: 2, name: '2. Ingresos y Gastos', icon: TrendingUp },
    { id: 3, name: '3. Balance General', icon: Building2 },
    { id: 4, name: '4. Ganancias y Pérdidas', icon: DollarSign },
    { id: 5, name: '5. Flujo de Caja', icon: Wallet },
    { id: 6, name: '6. Créditos y Deudas', icon: CreditCard },
    { id: 7, name: '7. Documentos Sustento', icon: FileCheck },
    { id: 8, name: '8. Indicadores y Capacidad', icon: Percent },
    { id: 9, name: '9. Historial Actualizaciones', icon: Clock },
    { id: 10, name: '10. Informes y Reportes', icon: FileText }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Client Selector */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Registro y Análisis de Información Financiera
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                    EVALÚA S/
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Plataforma integral de cálculo económico, balance, flujo y capacidad de pago para asesores financieros y de negocios
                </p>
              </div>
            </div>
          </div>

          {/* Client Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 pl-2">Expediente:</span>
              <select
                value={currentRecord.id}
                onChange={(e) => setSelectedFinancialRecordId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white border-0 outline-none pr-3 py-1 cursor-pointer"
              >
                {financialRecords.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.code} - {r.general.nameOrBusinessName} ({r.general.clientType.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewRecordModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* Client Fast Summary Badge Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo Expediente</span>
            <span className="text-xs font-bold text-white capitalize flex items-center gap-1 mt-1">
              {currentRecord.general.clientType === 'natural' && '👤 Persona Natural'}
              {currentRecord.general.clientType === 'negocio' && '🏪 Con Negocio'}
              {currentRecord.general.clientType === 'empresa' && '🏢 Empresa'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">RUC / DNI</span>
            <span className="text-xs font-mono font-bold text-blue-400 block mt-1">
              {currentRecord.general.documentType} {currentRecord.general.documentNumber}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fecha de Corte</span>
            <span className="text-xs font-mono text-slate-300 block mt-1">
              {currentRecord.general.cutoffDate || '31/01/2025'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Moneda</span>
            <span className="text-xs font-bold text-emerald-400 block mt-1">
              PEN (Soles S/)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sustento Documental</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xs font-bold ${verificationMetrics?.verificationPercentage && verificationMetrics.verificationPercentage >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {verificationMetrics?.verificationPercentage}%
              </span>
              <span className="text-[10px] text-slate-400">respaldado</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado Expediente</span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
              currentRecord.status === 'auditado'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : currentRecord.status === 'completo'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {currentRecord.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Institutional Rule Reminder / Notice */}
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-2.5 text-xs text-blue-200">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white">Declaración Institucional:</span> EVALÚA sirve para organizar información y apoyar la evaluación financiera; no aprueba créditos ni garantiza su otorgamiento. Toda cifra monetaria se consigna en Soles peruanos (S/) y distingue montos declarados de montos verificados.
          </div>
        </div>
      </div>

      {/* Success alert message toast */}
      {saveSuccessMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* 10 Navigation Tabs Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-lg overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80 bg-slate-950/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents View */}
      <div className="transition-all">
        {activeTab === 1 && (
          <GeneralDataTab
            record={currentRecord}
            onSave={(updatedGeneral) => {
              updateFinancialRecord(
                currentRecord.id,
                { general: updatedGeneral },
                'Datos generales',
                'Actualización de datos generales del cliente'
              );
              triggerSaveNotification('Datos generales del cliente guardados correctamente.');
            }}
          />
        )}

        {activeTab === 2 && (
          <IncomeExpensesTab
            record={currentRecord}
            onAddItem={(item) => addFinancialItem(currentRecord.id, item)}
            onUpdateItem={(itemId, updates) => updateFinancialItem(currentRecord.id, itemId, updates)}
            onDeleteItem={(itemId) => deleteFinancialItem(currentRecord.id, itemId)}
          />
        )}

        {activeTab === 3 && (
          <BalanceSheetTab
            record={currentRecord}
            bsTotals={bsTotals!}
            onSave={(updatedBS) => {
              updateFinancialRecord(
                currentRecord.id,
                { balanceSheet: updatedBS },
                'Balance General',
                'Ajuste en cuentas del Balance General'
              );
              triggerSaveNotification('Balance General guardado y recalculado exitosamente.');
            }}
          />
        )}

        {activeTab === 4 && (
          <IncomeStatementTab
            record={currentRecord}
            isTotals={isTotals!}
            onSave={(updatedIS) => {
              updateFinancialRecord(
                currentRecord.id,
                { incomeStatement: updatedIS },
                'Ganancias y Pérdidas',
                'Modificación de partidas del Estado de Resultados'
              );
              triggerSaveNotification('Estado de Ganancias y Pérdidas guardado correctamente.');
            }}
          />
        )}

        {activeTab === 5 && (
          <CashFlowTab
            record={currentRecord}
            cfTotals={cfTotals!}
            onSave={(updatedCF) => {
              updateFinancialRecord(
                currentRecord.id,
                { cashFlow: updatedCF },
                'Flujo de Caja',
                'Actualización de entradas y salidas efectivas de caja'
              );
              triggerSaveNotification('Flujo de Caja guardado y saldo recalculado.');
            }}
          />
        )}

        {activeTab === 6 && (
          <ObligationsTab
            record={currentRecord}
            obTotals={obTotals!}
            onAddObligation={(ob) => addObligation(currentRecord.id, ob)}
            onUpdateObligation={(obId, updates) => updateObligation(currentRecord.id, obId, updates)}
            onDeleteObligation={(obId) => deleteObligation(currentRecord.id, obId)}
          />
        )}

        {activeTab === 7 && (
          <SupportDocsTab
            record={currentRecord}
            verificationMetrics={verificationMetrics!}
            onAddDoc={(doc) => addSupportDocument(currentRecord.id, doc)}
            onUpdateDoc={(docId, updates) => updateSupportDocument(currentRecord.id, docId, updates)}
            onDeleteDoc={(docId) => deleteSupportDocument(currentRecord.id, docId)}
          />
        )}

        {activeTab === 8 && (
          <IndicatorsTab
            record={currentRecord}
            payCapacity={payCapacity!}
            ratios={ratios!}
            obTotals={obTotals!}
            onUpdateParams={(params) => {
              updateFinancialRecord(
                currentRecord.id,
                { evaluationParams: params },
                'Indicadores y Capacidad',
                `Ajuste de cuota propuesta a S/ ${params.proposedInstallment}`
              );
              triggerSaveNotification('Parámetros de evaluación actualizados.');
            }}
          />
        )}

        {activeTab === 9 && (
          <AuditHistoryTab
            record={currentRecord}
            onAddNote={(note) => {
              addAuditHistoryEntry(currentRecord.id, 'Nota del Asesor', 'Historial', note);
              triggerSaveNotification('Nota de auditoría agregada con éxito.');
            }}
          />
        )}

        {activeTab === 10 && (
          <ReportsTab
            record={currentRecord}
            bsTotals={bsTotals!}
            isTotals={isTotals!}
            cfTotals={cfTotals!}
            payCapacity={payCapacity!}
            ratios={ratios!}
            obTotals={obTotals!}
            verificationMetrics={verificationMetrics!}
            onUpdateReportNotes={(notes) => {
              updateFinancialRecord(currentRecord.id, { advisorReportNotes: notes });
              triggerSaveNotification('Observaciones para el informe actualizadas.');
            }}
          />
        )}
      </div>

      {/* Modal: Nuevo Expediente de Cliente */}
      {isNewRecordModalOpen && (
        <NewFinancialRecordModal
          onClose={() => setIsNewRecordModalOpen(false)}
          onCreate={(recordData) => {
            const created = createFinancialRecord({
              ...recordData,
              advisorId: currentUser?.id || 'usr-zonyu',
              advisorName: currentUser?.name || 'Asesor Financiero',
              agency: currentUser?.agency || 'Sede Principal - Lima',
              status: 'en_proceso'
            });
            setIsNewRecordModalOpen(false);
            setActiveTab(1);
            triggerSaveNotification(`Expediente ${created.code} creado con éxito.`);
          }}
        />
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SUBCOMPONENTS FOR EACH OF THE 10 TABS                                      */
/* -------------------------------------------------------------------------- */

// TAB 1: Datos Generales
const GeneralDataTab: React.FC<{
  record: FinancialRecordFile;
  onSave: (general: FinancialRecordFile['general']) => void;
}> = ({ record, onSave }) => {
  const [formData, setFormData] = useState(record.general);

  // Keep state synchronized when record changes
  React.useEffect(() => {
    setFormData(record.general);
  }, [record.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            Pestaña 1: Datos Generales del Cliente
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Información de identificación personal, actividad económica, personería y régimen fiscal
          </p>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {/* Client Profile Selector */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Tipo de Expediente Financiero:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { type: 'natural', label: 'Persona Natural', desc: 'Sueldos, honorarios, gastos familiares y deudas personales' },
              { type: 'negocio', label: 'Persona con Negocio', desc: 'RUC 10, ventas de tienda/taller, costos, inventario y gastos' },
              { type: 'empresa', label: 'Empresa', desc: 'RUC 20, personas jurídicas, manufactura, servicios o comercio formal' }
            ] as const
          ).map((item) => (
            <label
              key={item.type}
              className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                formData.clientType === item.type
                  ? 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{item.label}</span>
                <input
                  type="radio"
                  name="clientType"
                  value={item.type}
                  checked={formData.clientType === item.type}
                  onChange={() => setFormData({ ...formData, clientType: item.type })}
                  className="accent-blue-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 leading-tight">{item.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Documento:</label>
          <select
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="DNI">DNI (Documento Nacional de Identidad)</option>
            <option value="RUC">RUC (Registro Único de Contribuyentes)</option>
            <option value="CE">CE (Carnet de Extranjería)</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Número de Documento:</label>
          <input
            type="text"
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
            placeholder="Ej. 10429182741"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            {formData.clientType === 'empresa' ? 'Razón Social:' : 'Nombre Completo / Titular:'}
          </label>
          <input
            type="text"
            value={formData.nameOrBusinessName}
            onChange={(e) => setFormData({ ...formData, nameOrBusinessName: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 font-semibold"
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Comercial:</label>
          <input
            type="text"
            value={formData.tradeName || ''}
            onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            placeholder="Ej. Minimarket San José"
          />
        </div>

        {formData.clientType === 'empresa' && (
          <>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Representante Legal:</label>
              <input
                type="text"
                value={formData.legalRepresentative || ''}
                onChange={(e) => setFormData({ ...formData, legalRepresentative: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                placeholder="Nombre del Gerente General"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">DNI del Representante:</label>
              <input
                type="text"
                value={formData.representativeDni || ''}
                onChange={(e) => setFormData({ ...formData, representativeDni: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
                placeholder="8 dígitos"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Teléfono / Celular:</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Correo Electrónico:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Dirección:</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Distrito - Provincia - Depto:</label>
          <div className="grid grid-cols-3 gap-1.5">
            <input
              type="text"
              placeholder="Distrito"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            />
            <input
              type="text"
              placeholder="Provincia"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            />
            <input
              type="text"
              placeholder="Dpto"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Sector Económico:</label>
          <input
            type="text"
            value={formData.economicSector}
            onChange={(e) => setFormData({ ...formData, economicSector: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            placeholder="Ej. Comercio, Servicios, Manufactura"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Régimen Tributario:</label>
          <select
            value={formData.taxRegime}
            onChange={(e) => setFormData({ ...formData, taxRegime: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="Nuevo RUS">Nuevo RUS (Régimen Único Simplificado)</option>
            <option value="Régimen MYPE Tributario">Régimen MYPE Tributario (RMT)</option>
            <option value="Régimen Especial (RER)">Régimen Especial de Renta (RER)</option>
            <option value="Régimen General">Régimen General de Renta</option>
            <option value="4ta y 5ta Categoría (Persona Natural)">4ta y 5ta Categoría (Sueldos y Honorarios)</option>
            <option value="No tributa / Sin formalizar">No tributa / En formalización</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">Fecha de Corte del Análisis:</label>
          <input
            type="date"
            value={formData.cutoffDate}
            onChange={(e) => setFormData({ ...formData, cutoffDate: e.target.value })}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-300 block mb-1">Observaciones Iniciales del Asesor:</label>
        <textarea
          rows={3}
          value={formData.advisorNotes}
          onChange={(e) => setFormData({ ...formData, advisorNotes: e.target.value })}
          className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 leading-relaxed"
          placeholder="Anotaciones sobre estabilidad comercial, referencias y evaluación preliminar..."
        />
      </div>
    </form>
  );
};

// TAB 2: Ingresos y Gastos
const IncomeExpensesTab: React.FC<{
  record: FinancialRecordFile;
  onAddItem: (item: Omit<FinancialItem, 'id'>) => void;
  onUpdateItem: (itemId: string, updates: Partial<FinancialItem>) => void;
  onDeleteItem: (itemId: string) => void;
}> = ({ record, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState<FinancialItem['category']>(
    record.general.clientType === 'natural' ? 'ingreso_personal' : 'ingreso_negocio'
  );
  const [newDeclared, setNewDeclared] = useState<number | ''>('');
  const [newVerified, setNewVerified] = useState<number | ''>('');
  const [newDoc, setNewDoc] = useState('');
  const [newIsVerified, setNewIsVerified] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConcept.trim() || newDeclared === '') return;
    onAddItem({
      concept: newConcept.trim(),
      category: newCategory,
      declaredAmount: Number(newDeclared),
      verifiedAmount: newIsVerified ? (newVerified !== '' ? Number(newVerified) : Number(newDeclared)) : 0,
      isVerified: newIsVerified,
      supportDocName: newDoc.trim() || undefined,
      docStatus: newIsVerified ? 'revisado' : 'pendiente'
    });
    setNewConcept('');
    setNewDeclared('');
    setNewVerified('');
    setNewDoc('');
    setNewIsVerified(false);
  };

  const totalDeclared = record.incomeExpenseItems.reduce((acc, i) => acc + (Number(i.declaredAmount) || 0), 0);
  const totalVerified = record.incomeExpenseItems.reduce((acc, i) => acc + (i.isVerified ? Number(i.verifiedAmount) : 0), 0);
  const unverifiedItems = record.incomeExpenseItems.filter((i) => !i.isVerified);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Pestaña 2: Ingresos y Gastos ({record.general.clientType === 'natural' ? 'Personales / Familiares' : 'del Negocio / Empresa'})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro detallado de partidas monetarias en Soles (S/) distinguiendo importes declarados de respaldados
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Declarado por Cliente</span>
          <span className="text-lg font-black text-white mt-1 block">
            S/ {totalDeclared.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400">{record.incomeExpenseItems.length} partidas registradas</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Respaldado / Verificado</span>
          <span className="text-lg font-black text-emerald-400 mt-1 block">
            S/ {totalVerified.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400">
            {totalDeclared > 0 ? ((totalVerified / totalDeclared) * 100).toFixed(1) : 0}% de cobertura documental
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Partidas Sin Sustento</span>
          <span className="text-lg font-black text-amber-400 mt-1 block">
            {unverifiedItems.length} pendientes
          </span>
          <span className="text-[10px] text-slate-400">
            Diferencia no respaldada: S/ {(totalDeclared - totalVerified).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Warning Alert if unverified exist */}
      {unverifiedItems.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Advertencia de Cifras No Verificadas:</span> Existen {unverifiedItems.length} partidas declaradas por el cliente sin respaldo documental verificado. Para fines de evaluación de riesgo, no presente cifras estimadas como respaldadas.
          </div>
        </div>
      )}

      {/* Add New Item Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
          Agregar Nueva Partida Económica
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Concepto o Detalle:</label>
            <input
              type="text"
              value={newConcept}
              onChange={(e) => setNewConcept(e.target.value)}
              placeholder="Ej. Boletas de venta de abarrotes / Sueldo planilla"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Categoría:</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="ingreso_personal">Ingreso Personal / Familiar</option>
              <option value="gasto_personal">Gasto Familiar / Personal</option>
              <option value="ingreso_negocio">Ingreso del Negocio (Ventas)</option>
              <option value="costo_negocio">Costo de Ventas (Mercadería)</option>
              <option value="gasto_operativo">Gasto Operativo (Alquiler, Luz)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Monto Declarado (S/):</label>
            <input
              type="number"
              step="0.01"
              value={newDeclared}
              onChange={(e) => setNewDeclared(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-mono outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Documento Sustento:</label>
            <input
              type="text"
              value={newDoc}
              onChange={(e) => setNewDoc(e.target.value)}
              placeholder="Ej. Boleta 001-2839 / PDT SUNAT"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={newIsVerified}
              onChange={(e) => setNewIsVerified(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            <span>¿Esta partida cuenta con sustento documental revisado y verificado?</span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Registrar Partida</span>
          </button>
        </div>
      </form>

      {/* Items Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">Categoría</th>
              <th className="p-3">Concepto</th>
              <th className="p-3 text-right">Declarado (S/)</th>
              <th className="p-3 text-right">Verificado (S/)</th>
              <th className="p-3">Sustento Documental</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {record.incomeExpenseItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No se han registrado partidas de ingresos o gastos para este cliente.
                </td>
              </tr>
            ) : (
              record.incomeExpenseItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-white">{item.concept}</td>
                  <td className="p-3 text-right font-mono font-bold text-white">
                    S/ {item.declaredAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    {item.isVerified ? (
                      <span className="text-emerald-400">
                        S/ {item.verifiedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Sin verificar</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-300 text-[11px] max-w-xs truncate">
                    {item.supportDocName || <span className="text-slate-500 italic">No especificado</span>}
                  </td>
                  <td className="p-3 text-center">
                    {item.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        Declarado
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateItem(item.id, {
                            isVerified: !item.isVerified,
                            verifiedAmount: !item.isVerified ? item.declaredAmount : 0,
                            docStatus: !item.isVerified ? 'revisado' : 'pendiente'
                          })
                        }
                        title={item.isVerified ? 'Marcar como pendiente' : 'Marcar como verificado'}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                        title="Eliminar partida"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TAB 3: Balance General
const BalanceSheetTab: React.FC<{
  record: FinancialRecordFile;
  bsTotals: ReturnType<typeof calculateBalanceSheetTotals>;
  onSave: (bs: FinancialRecordFile['balanceSheet']) => void;
}> = ({ record, bsTotals, onSave }) => {
  const [bs, setBs] = useState(record.balanceSheet);

  React.useEffect(() => {
    setBs(record.balanceSheet);
  }, [record.id]);

  // Real-time calculation on local form state
  const liveTotals = useMemo(() => calculateBalanceSheetTotals(bs), [bs]);

  const handleChange = (key: keyof typeof bs, val: string) => {
    const num = val === '' ? 0 : Number(val);
    setBs((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            Pestaña 3: Balance General o Estado de Situación Financiera (S/)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cálculo automático de Activos Totales, Pasivos Totales y Patrimonio Neto con comprobación contable
          </p>
        </div>
        <button
          onClick={() => onSave(bs)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Balance</span>
        </button>
      </div>

      {/* Live Formula Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
          Fórmula y Cuadre Contable Automático:
        </span>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Activo Total</span>
            <span className="font-bold text-white">S/ {liveTotals.totalAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
          <span className="text-slate-500 font-bold">=</span>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Pasivo Total</span>
            <span className="font-bold text-rose-400">S/ {liveTotals.totalLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
          <span className="text-slate-500 font-bold">+</span>
          <div className="p-2 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Patrimonio Calculado</span>
            <span className="font-bold text-emerald-400">S/ {liveTotals.calculatedEquity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs">
            {liveTotals.isBalanced ? (
              <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Balance Cuadrado Exacto
              </span>
            ) : (
              <span className="flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                Descuadre: S/ {(liveTotals.totalAssets - (liveTotals.totalLiabilities + liveTotals.calculatedEquity)).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Activos vs Pasivos y Patrimonio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVOS */}
        <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-blue-300">1. ACTIVOS</h3>
            <span className="text-xs font-mono font-bold text-white">
              S/ {liveTotals.totalAssets.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Activos Corrientes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Activos Corrientes (Líquidos & Corto Plazo)</span>
              <span className="font-mono text-blue-400">S/ {liveTotals.totalCurrentAssets.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">Caja y Bancos (Efectivo disponible):</label>
                <input
                  type="number"
                  value={bs.cashAndBanks}
                  onChange={(e) => handleChange('cashAndBanks', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Cuentas por Cobrar:</label>
                <input
                  type="number"
                  value={bs.accountsReceivable}
                  onChange={(e) => handleChange('accountsReceivable', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Inventarios / Existencias valorizadas:</label>
                <input
                  type="number"
                  value={bs.inventory}
                  onChange={(e) => handleChange('inventory', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Otros Activos Corrientes:</label>
                <input
                  type="number"
                  value={bs.otherCurrentAssets}
                  onChange={(e) => handleChange('otherCurrentAssets', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Activos No Corrientes */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Activos No Corrientes (Fijos / Bienes)</span>
              <span className="font-mono text-blue-400">S/ {liveTotals.totalNonCurrentAssets.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">Terrenos e Inmuebles:</label>
                <input
                  type="number"
                  value={bs.propertyAndBuildings}
                  onChange={(e) => handleChange('propertyAndBuildings', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Maquinaria y Equipos:</label>
                <input
                  type="number"
                  value={bs.machineryAndEquipment}
                  onChange={(e) => handleChange('machineryAndEquipment', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Vehículos:</label>
                <input
                  type="number"
                  value={bs.vehicles}
                  onChange={(e) => handleChange('vehicles', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Muebles y Enseres:</label>
                <input
                  type="number"
                  value={bs.furnitureAndFixtures}
                  onChange={(e) => handleChange('furnitureAndFixtures', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-slate-400 block">(-) Depreciación Acumulada:</label>
                <input
                  type="number"
                  value={bs.accumulatedDepreciation}
                  onChange={(e) => handleChange('accumulatedDepreciation', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PASIVOS Y PATRIMONIO */}
        <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-rose-300">2. PASIVOS</h3>
            <span className="text-xs font-mono font-bold text-rose-400">
              S/ {liveTotals.totalLiabilities.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Pasivo Corriente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Pasivos Corrientes (&lt; 12 meses)</span>
              <span className="font-mono text-rose-400">S/ {liveTotals.totalCurrentLiabilities.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">Proveedores por Pagar:</label>
                <input
                  type="number"
                  value={bs.suppliersPayable}
                  onChange={(e) => handleChange('suppliersPayable', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Deuda Bancaria Corto Plazo:</label>
                <input
                  type="number"
                  value={bs.shortTermBankDebt}
                  onChange={(e) => handleChange('shortTermBankDebt', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Tributos / SUNAT por Pagar:</label>
                <input
                  type="number"
                  value={bs.taxesPayable}
                  onChange={(e) => handleChange('taxesPayable', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Otros Pasivos Corrientes:</label>
                <input
                  type="number"
                  value={bs.otherCurrentLiabilities}
                  onChange={(e) => handleChange('otherCurrentLiabilities', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Pasivo No Corriente */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Pasivos No Corrientes (&gt; 12 meses)</span>
              <span className="font-mono text-rose-400">S/ {liveTotals.totalNonCurrentLiabilities.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">Deuda Bancaria Largo Plazo:</label>
                <input
                  type="number"
                  value={bs.longTermBankDebt}
                  onChange={(e) => handleChange('longTermBankDebt', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Hipotecas / Créditos Vehiculares:</label>
                <input
                  type="number"
                  value={bs.mortgages}
                  onChange={(e) => handleChange('mortgages', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* PATRIMONIO */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>3. PATRIMONIO NETO</span>
              <span className="font-mono text-base font-black">
                S/ {liveTotals.calculatedEquity.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">Capital Social / Aportado:</label>
                <input
                  type="number"
                  value={bs.capital}
                  onChange={(e) => handleChange('capital', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Utilidades Acumuladas / Reservas:</label>
                <input
                  type="number"
                  value={bs.retainedEarnings}
                  onChange={(e) => handleChange('retainedEarnings', e.target.value)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TAB 4: Ganancias y Pérdidas
const IncomeStatementTab: React.FC<{
  record: FinancialRecordFile;
  isTotals: ReturnType<typeof calculateIncomeStatementTotals>;
  onSave: (is: FinancialRecordFile['incomeStatement']) => void;
}> = ({ record, isTotals, onSave }) => {
  const [statement, setStatement] = useState(record.incomeStatement);

  React.useEffect(() => {
    setStatement(record.incomeStatement);
  }, [record.id]);

  const liveTotals = useMemo(() => calculateIncomeStatementTotals(statement), [statement]);

  const handleChange = (key: keyof typeof statement, val: string) => {
    const num = val === '' ? 0 : Number(val);
    setStatement((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Pestaña 4: Estado de Ganancias y Pérdidas (P&L Mensual en S/)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresos operacionales, costo de ventas, gastos del negocio y cálculo de utilidad neta
          </p>
        </div>
        <button
          onClick={() => onSave(statement)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Ganancias y Pérdidas</span>
        </button>
      </div>

      {/* Margins Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Utilidad Bruta</span>
          <div className="text-lg font-black text-white mt-1">
            S/ {liveTotals.grossProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Margen Bruto: {liveTotals.grossMarginPct.toFixed(1)}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Resultado Operativo</span>
          <div className={`text-lg font-black mt-1 ${liveTotals.operatingResult >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            S/ {liveTotals.operatingResult.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs font-mono text-blue-400 font-bold">
            Margen Operativo: {liveTotals.operatingMarginPct.toFixed(1)}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Utilidad / Pérdida Neta</span>
          <div className={`text-lg font-black mt-1 ${liveTotals.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            S/ {liveTotals.netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs font-mono text-purple-400 font-bold">
            Margen Neto: {liveTotals.netMarginPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Structured P&L Table Form */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80 text-xs">
        {/* Ventas */}
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="text-emerald-400">(+) Ingresos Operacionales / Ventas</span>
            <span className="font-mono text-sm">
              S/ {liveTotals.netSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block">Ventas Brutas / Facturación Mensual:</label>
              <input
                type="number"
                value={statement.salesOrIncome}
                onChange={(e) => handleChange('salesOrIncome', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">(-) Devoluciones / Descuentos:</label>
              <input
                type="number"
                value={statement.salesReturns}
                onChange={(e) => handleChange('salesReturns', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300"
              />
            </div>
          </div>
        </div>

        {/* Costo de Ventas */}
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="text-rose-400">(-) Costo de Ventas / Costo de Mercaderías</span>
            <span className="font-mono text-sm text-rose-400">
              - S/ {liveTotals.totalCostOfSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block">Compras de Mercadería / Insumos:</label>
              <input
                type="number"
                value={statement.cogsMerchandise}
                onChange={(e) => handleChange('cogsMerchandise', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Mano de Obra Directa Producción:</label>
              <input
                type="number"
                value={statement.cogsLabor}
                onChange={(e) => handleChange('cogsLabor', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Fletes y Otros Costos Directos:</label>
              <input
                type="number"
                value={statement.cogsFreightAndOther}
                onChange={(e) => handleChange('cogsFreightAndOther', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Gastos Operativos */}
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="text-amber-400">(-) Gastos Operativos del Negocio</span>
            <span className="font-mono text-sm text-amber-400">
              - S/ {liveTotals.totalOperatingExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block">Alquiler de Local:</label>
              <input
                type="number"
                value={statement.operatingRent}
                onChange={(e) => handleChange('operatingRent', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Planilla / Sueldos Empleados:</label>
              <input
                type="number"
                value={statement.operatingPayroll}
                onChange={(e) => handleChange('operatingPayroll', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Servicios (Luz, Agua, Tel.):</label>
              <input
                type="number"
                value={statement.operatingServices}
                onChange={(e) => handleChange('operatingServices', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Transporte y Movilidad:</label>
              <input
                type="number"
                value={statement.operatingTransport}
                onChange={(e) => handleChange('operatingTransport', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Mantenimiento y Reparación:</label>
              <input
                type="number"
                value={statement.operatingMaintenance}
                onChange={(e) => handleChange('operatingMaintenance', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Publicidad y Ventas:</label>
              <input
                type="number"
                value={statement.operatingSalesAndMarketing}
                onChange={(e) => handleChange('operatingSalesAndMarketing', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Tributos Municipales / Otros:</label>
              <input
                type="number"
                value={statement.operatingTaxesAndLicenses}
                onChange={(e) => handleChange('operatingTaxesAndLicenses', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">Otros Gastos Operativos:</label>
              <input
                type="number"
                value={statement.otherOperatingExpenses}
                onChange={(e) => handleChange('otherOperatingExpenses', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>

        {/* Otros Resultados e Impuestos */}
        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="text-slate-300">Otros Ingresos, Gastos Financieros e Impuestos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-[10px] text-slate-400 block">(+) Otros Ingresos No Operativos:</label>
              <input
                type="number"
                value={statement.otherNonOpIncome}
                onChange={(e) => handleChange('otherNonOpIncome', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">(-) Gastos Financieros (Intereses):</label>
              <input
                type="number"
                value={statement.financialExpenses}
                onChange={(e) => handleChange('financialExpenses', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block">(-) Impuesto a la Renta Estimado:</label>
              <input
                type="number"
                value={statement.taxesIR}
                onChange={(e) => handleChange('taxesIR', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-rose-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TAB 5: Flujo de Caja
const CashFlowTab: React.FC<{
  record: FinancialRecordFile;
  cfTotals: ReturnType<typeof calculateCashFlowTotals>;
  onSave: (cf: FinancialRecordFile['cashFlow']) => void;
}> = ({ record, cfTotals, onSave }) => {
  const [cf, setCf] = useState(record.cashFlow);

  React.useEffect(() => {
    setCf(record.cashFlow);
  }, [record.id]);

  const liveTotals = useMemo(() => calculateCashFlowTotals(cf), [cf]);

  const handleChange = (key: keyof typeof cf, val: string) => {
    const num = val === '' ? 0 : Number(val);
    setCf((prev) => ({ ...prev, [key]: num }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            Pestaña 5: Flujo de Caja (Movimientos Efectivos en S/)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fórmula: Saldo Inicial + Entradas Efectivas – Salidas Efectivas = Saldo Final de Caja
          </p>
        </div>
        <button
          onClick={() => onSave(cf)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Guardar Flujo de Caja</span>
        </button>
      </div>

      {/* Formula Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Saldo Inicial</span>
          <span className="text-base font-black text-white mt-1 block font-mono">
            S/ {liveTotals.initialBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">(+) Total Entradas</span>
          <span className="text-base font-black text-emerald-400 mt-1 block font-mono">
            S/ {liveTotals.totalInflows.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">(-) Total Salidas</span>
          <span className="text-base font-black text-rose-400 mt-1 block font-mono">
            S/ {liveTotals.totalOutflows.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-blue-400 block">(=) Saldo Final Caja</span>
          <span className={`text-base font-black mt-1 block font-mono ${liveTotals.finalCashBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
            S/ {liveTotals.finalCashBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Live Warning if deficit */}
      {liveTotals.netCashFlow < 0 && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Alerta de Déficit de Caja:</span> El flujo neto del período es negativo (-S/ {Math.abs(liveTotals.netCashFlow).toLocaleString()}). Las salidas efectivas superan a los ingresos de caja del mes.
          </div>
        </div>
      )}

      {/* Inputs Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ENTRADAS */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              1. Entradas Efectivas de Dinero
            </h3>
            <span className="text-xs font-mono font-bold text-white">
              S/ {liveTotals.totalInflows.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Saldo Inicial en Caja / Cuentas Bancarias (S/):</label>
            <input
              type="number"
              value={cf.initialBalance}
              onChange={(e) => handleChange('initialBalance', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Ventas al Contado (Efectivo cobrado):</label>
            <input
              type="number"
              value={cf.cashSales}
              onChange={(e) => handleChange('cashSales', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Cobranza de Cuentas por Cobrar (Créditos a clientes):</label>
            <input
              type="number"
              value={cf.creditCollections}
              onChange={(e) => handleChange('creditCollections', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Sueldo o Ingresos Dependientes / Independientes:</label>
            <input
              type="number"
              value={cf.salaryOrIndependentIncome}
              onChange={(e) => handleChange('salaryOrIndependentIncome', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Otras Entradas de Caja (Aportes, remesas):</label>
            <input
              type="number"
              value={cf.otherInflows}
              onChange={(e) => handleChange('otherInflows', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>
        </div>

        {/* SALIDAS */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              2. Salidas Efectivas de Dinero
            </h3>
            <span className="text-xs font-mono font-bold text-white">
              S/ {liveTotals.totalOutflows.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Pagos a Proveedores / Compras al Contado:</label>
            <input
              type="number"
              value={cf.supplierPayments}
              onChange={(e) => handleChange('supplierPayments', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Gastos Operativos (Alquiler, Servicios, Transporte):</label>
            <input
              type="number"
              value={cf.operatingExpensesPayments}
              onChange={(e) => handleChange('operatingExpensesPayments', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Pago de Planillas / Sueldos:</label>
            <input
              type="number"
              value={cf.payrollPayments}
              onChange={(e) => handleChange('payrollPayments', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Pago de Cuotas de Créditos y Deudas:</label>
            <input
              type="number"
              value={cf.debtInstallmentsPayments}
              onChange={(e) => handleChange('debtInstallmentsPayments', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Gastos Familiares / Retiros del Titular:</label>
            <input
              type="number"
              value={cf.familyExpensesOrPersonalDraws}
              onChange={(e) => handleChange('familyExpensesOrPersonalDraws', e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Pago de Impuestos (SUNAT):</label>
              <input
                type="number"
                value={cf.taxPayments}
                onChange={(e) => handleChange('taxPayments', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Otras Salidas:</label>
              <input
                type="number"
                value={cf.otherOutflows}
                onChange={(e) => handleChange('otherOutflows', e.target.value)}
                className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TAB 6: Créditos y Deudas
const ObligationsTab: React.FC<{
  record: FinancialRecordFile;
  obTotals: ReturnType<typeof calculateObligationsTotals>;
  onAddObligation: (ob: Omit<ObligationRecord, 'id'>) => void;
  onUpdateObligation: (obId: string, updates: Partial<ObligationRecord>) => void;
  onDeleteObligation: (obId: string) => void;
}> = ({ record, obTotals, onAddObligation, onUpdateObligation, onDeleteObligation }) => {
  const [newEntity, setNewEntity] = useState('');
  const [newType, setNewType] = useState('Microcrédito Capital de Trabajo');
  const [newBalance, setNewBalance] = useState<number | ''>('');
  const [newInstallment, setNewInstallment] = useState<number | ''>('');
  const [newRate, setNewRate] = useState<number | ''>(24);
  const [newRemaining, setNewRemaining] = useState<number | ''>(12);
  const [newIsVerifiedSBS, setNewIsVerifiedSBS] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.trim() || newBalance === '' || newInstallment === '') return;
    onAddObligation({
      entityName: newEntity.trim(),
      obligationType: newType,
      originalAmount: Number(newBalance),
      currentBalance: Number(newBalance),
      monthlyInstallment: Number(newInstallment),
      annualRatePct: Number(newRate) || 0,
      remainingInstallments: Number(newRemaining) || 1,
      dueDate: 'Mensual',
      status: 'al_dia',
      isVerifiedWithSBS: newIsVerifiedSBS,
      supportDoc: newIsVerifiedSBS ? 'Reporte SBS Sentinel Calificación Normal' : undefined
    });
    setNewEntity('');
    setNewBalance('');
    setNewInstallment('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            Pestaña 6: Créditos, Deudas y Obligaciones Financieras
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro de pasivos financieros con bancos, cajas, cooperativas y proveedores en Soles (S/)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Deuda Total Consolidada</span>
          <span className="text-lg font-black text-rose-400 mt-1 block font-mono">
            S/ {obTotals.totalBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-400">{obTotals.activeCount} créditos vigentes</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Carga Financiera Mensual (Cuotas)</span>
          <span className="text-lg font-black text-amber-400 mt-1 block font-mono">
            S/ {obTotals.totalMonthlyInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })} / mes
          </span>
          <span className="text-[10px] text-slate-400">Impacto directo en la capacidad de pago</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Verificación Centrales de Riesgo</span>
          <span className="text-lg font-black text-emerald-400 mt-1 block">
            {obTotals.verifiedCount} de {obTotals.activeCount} con SBS
          </span>
          <span className="text-[10px] text-slate-400">Sentinel / Infocorp / SBS verificado</span>
        </div>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
          Registrar Nueva Obligación o Crédito
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Entidad Financiera / Acreedor:</label>
            <input
              type="text"
              value={newEntity}
              onChange={(e) => setNewEntity(e.target.value)}
              placeholder="Ej. Caja Huancayo, BCP, BBVA"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Tipo de Crédito:</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="Microcrédito Capital de Trabajo">Microcrédito Capital de Trabajo</option>
              <option value="Préstamo Comercial Pyme">Préstamo Comercial Pyme</option>
              <option value="Préstamo Personal / Consumo">Préstamo Personal / Consumo</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Crédito Vehicular">Crédito Vehicular</option>
              <option value="Crédito Hipotecario">Crédito Hipotecario</option>
              <option value="Deuda Comercial con Proveedor">Deuda Comercial con Proveedor</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Saldo Deudor Actual (S/):</label>
            <input
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Cuota Mensual (S/):</label>
            <input
              type="number"
              step="0.01"
              value={newInstallment}
              onChange={(e) => setNewInstallment(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Cuotas Pendientes:</label>
            <input
              type="number"
              value={newRemaining}
              onChange={(e) => setNewRemaining(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={newIsVerifiedSBS}
              onChange={(e) => setNewIsVerifiedSBS(e.target.checked)}
              className="accent-blue-600 rounded"
            />
            <span>¿Coincide y está respaldado con el Reporte SBS / Sentinel del cliente?</span>
          </label>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Agregar Deuda</span>
          </button>
        </div>
      </form>

      {/* Obligations Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">Entidad / Acreedor</th>
              <th className="p-3">Tipo de Obligación</th>
              <th className="p-3 text-right">Saldo Actual (S/)</th>
              <th className="p-3 text-right">Cuota Mensual (S/)</th>
              <th className="p-3 text-center">TEA %</th>
              <th className="p-3 text-center">Cuotas Restantes</th>
              <th className="p-3 text-center">Estado</th>
              <th className="p-3 text-center">Sustento SBS</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {record.obligations.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No hay obligaciones financieras registradas para este cliente.
                </td>
              </tr>
            ) : (
              record.obligations.map((ob) => (
                <tr key={ob.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{ob.entityName}</td>
                  <td className="p-3 text-slate-300 text-[11px]">{ob.obligationType}</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-400">
                    S/ {ob.currentBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400">
                    S/ {ob.monthlyInstallment.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center font-mono">{ob.annualRatePct}%</td>
                  <td className="p-3 text-center font-mono">{ob.remainingInstallments}</td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                      {ob.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {ob.isVerifiedWithSBS ? (
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verificado SBS
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[11px] flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Declarado
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onDeleteObligation(ob.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                      title="Eliminar obligación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TAB 7: Documentos de Sustento
const SupportDocsTab: React.FC<{
  record: FinancialRecordFile;
  verificationMetrics: ReturnType<typeof calculateVerificationMetrics>;
  onAddDoc: (doc: Omit<SupportDocumentRecord, 'id' | 'uploadedAt'>) => void;
  onUpdateDoc: (docId: string, updates: Partial<SupportDocumentRecord>) => void;
  onDeleteDoc: (docId: string) => void;
}> = ({ record, verificationMetrics, onAddDoc, onUpdateDoc, onDeleteDoc }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDocType, setNewDocType] = useState<SupportDocumentRecord['documentType']>('boleta_factura');
  const [newSection, setNewSection] = useState<SupportDocumentRecord['relatedSection']>('ingresos');
  const [newConcept, setNewConcept] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setSelectedFileSize(`${(file.size / 1024).toFixed(0)} KB`);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddDoc({
      title: newTitle.trim(),
      documentType: newDocType,
      relatedSection: newSection,
      relatedItemConcept: newConcept.trim() || 'General',
      status: 'revisado',
      declaredAmount: Number(newAmount) || 0,
      verifiedAmount: Number(newAmount) || 0,
      isBacked: true,
      fileName: selectedFileName || 'documento_adjunto.pdf',
      fileSize: selectedFileSize || '250 KB'
    });
    setNewTitle('');
    setNewConcept('');
    setNewAmount('');
    setSelectedFileName('');
    setSelectedFileSize('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-purple-400" />
            Pestaña 7: Documentos de Sustento y Verificación de Cifras
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Relación de comprobantes, declaraciones juradas y títulos que respaldan cada partida financiera
          </p>
        </div>
      </div>

      {/* Distinction Banner: Declarado vs Verificado */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Documentos Adjuntos</span>
          <span className="text-lg font-black text-white mt-1 block">
            {record.supportDocuments.length} archivos
          </span>
          <span className="text-[10px] text-slate-400">
            {verificationMetrics.reviewedDocsCount} revisados • {verificationMetrics.pendingDocsCount} pendientes
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-blue-400 block">Índice de Respaldo Documental</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${verificationMetrics.verificationPercentage}%` }}
              />
            </div>
            <span className="text-sm font-black text-blue-400 font-mono">
              {verificationMetrics.verificationPercentage}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Porcentaje de cifras con documento físico/digital</span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Criterio Institucional</span>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            EVALÚA prohíbe presentar cifras estimadas como verificadas. Toda partida no respaldada debe figurar con advertencia.
          </p>
        </div>
      </div>

      {/* Upload New Document Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
          Adjuntar Nuevo Documento de Sustento
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Título del Documento:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ej. Facturas de compra mayorista Gloria"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Tipo de Documento:</label>
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value as any)}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            >
              <option value="boleta_factura">Boleta o Factura de Venta / Compra</option>
              <option value="declaracion_sunat">Declaración Jurada SUNAT (PDT / RMT)</option>
              <option value="boleta_pago">Boleta de Pago de Haberes (5ta categoría)</option>
              <option value="recibo_honorarios">Recibo por Honorarios Electrónico (4ta)</option>
              <option value="reporte_sbs">Reporte Centrales de Riesgo SBS / Sentinel</option>
              <option value="estado_cuenta">Estado de Cuenta Bancario</option>
              <option value="recibo_servicios">Recibo de Servicios (Luz / Agua)</option>
              <option value="titulo_propiedad">Título de Propiedad / Partida SUNARP</option>
              <option value="contrato">Contrato de Alquiler / Proveedor</option>
              <option value="otro">Otro Documento de Sustento</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Sección o Partida que Sustenta:</label>
            <input
              type="text"
              value={newConcept}
              onChange={(e) => setNewConcept(e.target.value)}
              placeholder="Ej. Ventas del mes S/ 28,500"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Monto Respaldado (S/):</label>
            <input
              type="number"
              step="0.01"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00"
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* File chooser */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <label className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span>Seleccionar archivo (PDF, PNG, JPG)</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            {selectedFileName && (
              <span className="text-xs text-emerald-400 font-mono">
                {selectedFileName} ({selectedFileSize})
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Adjuntar al Expediente</span>
          </button>
        </div>
      </form>

      {/* Documents List Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
            <tr>
              <th className="p-3">Documento</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Partida Vinculada</th>
              <th className="p-3 text-right">Monto Respaldado</th>
              <th className="p-3 text-center">Estado Verificación</th>
              <th className="p-3">Archivo</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {record.supportDocuments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No hay documentos de sustento adjuntos en este expediente.
                </td>
              </tr>
            ) : (
              record.supportDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-semibold text-white">{doc.title}</td>
                  <td className="p-3">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {doc.documentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 text-[11px]">{doc.relatedItemConcept}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    {doc.verifiedAmount > 0
                      ? `S/ ${doc.verifiedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                      : '—'}
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={doc.status}
                      onChange={(e) => onUpdateDoc(doc.id, { status: e.target.value as any })}
                      className={`text-[10px] font-bold px-2 py-1 rounded border outline-none cursor-pointer ${
                        doc.status === 'revisado'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : doc.status === 'recibido'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <option value="pendiente" className="bg-slate-900 text-white">Pendiente</option>
                      <option value="recibido" className="bg-slate-900 text-white">Recibido</option>
                      <option value="revisado" className="bg-slate-900 text-white">Revisado</option>
                    </select>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-400">
                    {doc.fileName || 'archivo_digital.pdf'} ({doc.fileSize || '320 KB'})
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onDeleteDoc(doc.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                      title="Eliminar documento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// TAB 8: Indicadores Financieros y Capacidad de Pago
const IndicatorsTab: React.FC<{
  record: FinancialRecordFile;
  payCapacity: ReturnType<typeof calculatePaymentCapacity>;
  ratios: ReturnType<typeof calculateFinancialRatios>;
  obTotals: ReturnType<typeof calculateObligationsTotals>;
  onUpdateParams: (params: FinancialRecordFile['evaluationParams']) => void;
}> = ({ record, payCapacity, ratios, obTotals, onUpdateParams }) => {
  const [proposedInstallment, setProposedInstallment] = useState(
    record.evaluationParams.proposedInstallment
  );
  const [dropPct, setDropPct] = useState(record.evaluationParams.stressTestDropPct);
  const [notes, setNotes] = useState(record.evaluationParams.advisorAppraisalNotes);

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateParams({
      proposedInstallment: Number(proposedInstallment) || 0,
      stressTestDropPct: Number(dropPct) || 15,
      advisorAppraisalNotes: notes
    });
  };

  // Stress test calculation: simulate a drop in revenue
  const stressedBase = payCapacity.netMonthlyBase * (1 - dropPct / 100);
  const stressedAvailable = stressedBase - payCapacity.deductions - payCapacity.obligationsMonthly;
  const stressedSurplus = stressedAvailable - proposedInstallment;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" />
            Pestaña 8: Indicadores Financieros, Capacidad de Pago y Solvencia
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fórmulas explícitas con importes sustituidos y simulación de escenarios de estrés crediticio
          </p>
        </div>
      </div>

      {/* Main Formulas Display Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Capacidad de Pago Formula */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
            1. Cálculo de Capacidad de Pago Mensual (S/)
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span>(+) Ingreso / Base Operativa:</span>
              <span className="font-bold text-white">S/ {payCapacity.netMonthlyBase.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>(-) Deducciones (Familiares/Gastos):</span>
              <span className="text-rose-400">- S/ {payCapacity.deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>(-) Cuotas de Deudas Existentes:</span>
              <span className="text-rose-400">- S/ {payCapacity.obligationsMonthly.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span className="text-blue-300">(=) Flujo Neto Disponible:</span>
              <span className={payCapacity.availableCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                S/ {payCapacity.availableCashFlow.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Excedente Libre Evaluado */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
            2. Excedente Libre Post-Cuota Propuesta
          </span>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span>Flujo Disponible Previo:</span>
              <span className="font-bold text-white">S/ {payCapacity.availableCashFlow.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>(-) Cuota Mensual Evaluada:</span>
              <span className="text-amber-400">- S/ {payCapacity.proposedInstallment.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span className="text-purple-300">(=) Excedente Libre Remanente:</span>
              <span className={payCapacity.surplusAfterProposed >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                S/ {payCapacity.surplusAfterProposed.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratios Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">RCI (Cobertura de Deuda)</span>
          <div className="text-xl font-black text-white mt-1">
            {ratios.debtCoverageRCI}x
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Fórmula: Flujo Disp. / Cuota Total
          </span>
          <span className={`text-[10px] font-bold mt-1 inline-block ${ratios.debtCoverageRCI >= 1.3 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {ratios.debtCoverageRCI >= 1.3 ? '✓ Holgado (≥ 1.30)' : '⚠ Ajustado (< 1.30)'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Liquidez Corriente</span>
          <div className="text-xl font-black text-white mt-1">
            {ratios.currentRatio}x
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Fórmula: Activo Cte / Pasivo Cte
          </span>
          <span className={`text-[10px] font-bold mt-1 inline-block ${ratios.currentRatio >= 1.2 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {ratios.currentRatio >= 1.2 ? '✓ Solvente (≥ 1.20)' : '⚠ Débil (< 1.20)'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Endeudamiento Total</span>
          <div className="text-xl font-black text-white mt-1">
            {ratios.indebtednessRatio}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Fórmula: (Pasivo / Activo) × 100
          </span>
          <span className={`text-[10px] font-bold mt-1 inline-block ${ratios.indebtednessRatio <= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {ratios.indebtednessRatio <= 60 ? '✓ Adecuado (≤ 60%)' : '⚠ Alto (> 60%)'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Carga Financiera</span>
          <div className="text-xl font-black text-white mt-1">
            {ratios.financialBurdenPct}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">
            Fórmula: (Cuotas / Ingresos) × 100
          </span>
          <span className={`text-[10px] font-bold mt-1 inline-block ${ratios.financialBurdenPct <= 35 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {ratios.financialBurdenPct <= 35 ? '✓ Prudente (≤ 35%)' : '⚠ Elevada (> 35%)'}
          </span>
        </div>
      </div>

      {/* Simulator Form & Stress Test */}
      <form onSubmit={handleSaveParams} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Simulador de Cuota y Prueba de Estrés Financiero
          </h3>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Save className="w-3 h-3" />
            <span>Guardar Parámetros</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Cuota Propuesta Mensual Evaluada (S/):
            </label>
            <input
              type="number"
              step="10"
              value={proposedInstallment}
              onChange={(e) => setProposedInstallment(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Prueba de Estrés: Simular Caída de Ingresos (%):
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={dropPct}
              onChange={(e) => setDropPct(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Resultado en Escenario Estresado (-{dropPct}%)</span>
            <span className={`text-sm font-bold block mt-1 font-mono ${stressedSurplus >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Excedente estresado: S/ {stressedSurplus.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400">
              {stressedSurplus >= 0 ? 'El cliente resiste la caída de ventas' : 'Entra en déficit ante caída de ventas'}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Conclusiones y Dictamen Técnico del Asesor sobre la Capacidad de Pago:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500 leading-relaxed"
            placeholder="Fundamentación sobre la viabilidad de pago y mitigantes de riesgo..."
          />
        </div>
      </form>
    </div>
  );
};

// TAB 9: Historial de Actualizaciones
const AuditHistoryTab: React.FC<{
  record: FinancialRecordFile;
  onAddNote: (note: string) => void;
}> = ({ record, onAddNote }) => {
  const [newNote, setNewNote] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Pestaña 9: Historial de Actualizaciones y Trazabilidad de Cambios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro cronológico inmutable de intervenciones, auditorías y correcciones de partidas
          </p>
        </div>
      </div>

      {/* Add Audit Note Form */}
      <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Añadir una minuta técnica de actualización (ej. Se reajustó inventario tras conteo físico)..."
          className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Agregar Minuta</span>
        </button>
      </form>

      {/* Audit Timeline */}
      <div className="space-y-3">
        {record.auditTrail.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">No hay registros de cambios para este expediente.</p>
        ) : (
          record.auditTrail.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{entry.action}</span>
                  <span className="text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                    {entry.changedTab}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{entry.details}</p>
                <div className="text-[10px] text-slate-500 font-medium">
                  Responsable: <span className="text-slate-400 font-semibold">{entry.advisorName}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                {entry.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// TAB 10: Informes y Reportes
const ReportsTab: React.FC<{
  record: FinancialRecordFile;
  bsTotals: ReturnType<typeof calculateBalanceSheetTotals>;
  isTotals: ReturnType<typeof calculateIncomeStatementTotals>;
  cfTotals: ReturnType<typeof calculateCashFlowTotals>;
  payCapacity: ReturnType<typeof calculatePaymentCapacity>;
  ratios: ReturnType<typeof calculateFinancialRatios>;
  obTotals: ReturnType<typeof calculateObligationsTotals>;
  verificationMetrics: ReturnType<typeof calculateVerificationMetrics>;
  onUpdateReportNotes: (notes: string) => void;
}> = ({
  record,
  bsTotals,
  isTotals,
  cfTotals,
  payCapacity,
  ratios,
  obTotals,
  verificationMetrics,
  onUpdateReportNotes
}) => {
  const [reportNotes, setReportNotes] = useState(record.advisorReportNotes);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['EVALUA - EXPEDIENTE FINANCIERO CONSOLIDADO'],
      ['Codigo de Expediente', record.code],
      ['Cliente / Razon Social', record.general.nameOrBusinessName],
      ['Tipo de Expediente', record.general.clientType.toUpperCase()],
      ['RUC / DNI', `${record.general.documentType} ${record.general.documentNumber}`],
      ['Fecha de Corte', record.general.cutoffDate],
      ['Moneda', 'PEN (Soles S/)'],
      ['Asesor Responsable', record.advisorName],
      ['Agencia', record.agency],
      [''],
      ['--- ESTADOS FINANCIEROS Y BALANCE GENERAL (S/) ---'],
      ['Total Activos Corrientes', bsTotals.totalCurrentAssets.toFixed(2)],
      ['Total Activos No Corrientes', bsTotals.totalNonCurrentAssets.toFixed(2)],
      ['ACTIVO TOTAL', bsTotals.totalAssets.toFixed(2)],
      ['Total Pasivos Corrientes', bsTotals.totalCurrentLiabilities.toFixed(2)],
      ['Total Pasivos No Corrientes', bsTotals.totalNonCurrentLiabilities.toFixed(2)],
      ['PASIVO TOTAL', bsTotals.totalLiabilities.toFixed(2)],
      ['PATRIMONIO NETO', bsTotals.calculatedEquity.toFixed(2)],
      [''],
      ['--- ESTADO DE GANANCIAS Y PERDIDAS (S/) ---'],
      ['Ventas Netas', isTotals.netSales.toFixed(2)],
      ['Costo de Ventas', isTotals.totalCostOfSales.toFixed(2)],
      ['Utilidad Bruta', isTotals.grossProfit.toFixed(2)],
      ['Gastos Operativos', isTotals.totalOperatingExpenses.toFixed(2)],
      ['Resultado Operativo', isTotals.operatingResult.toFixed(2)],
      ['Utilidad Neta', isTotals.netProfit.toFixed(2)],
      [''],
      ['--- FLUJO DE CAJA (S/) ---'],
      ['Saldo Inicial', cfTotals.initialBalance.toFixed(2)],
      ['Total Entradas', cfTotals.totalInflows.toFixed(2)],
      ['Total Salidas', cfTotals.totalOutflows.toFixed(2)],
      ['Flujo Neto', cfTotals.netCashFlow.toFixed(2)],
      ['Saldo Final de Caja', cfTotals.finalCashBalance.toFixed(2)],
      [''],
      ['--- CAPACIDAD DE PAGO E INDICADORES ---'],
      ['Flujo Disponible Mensual', payCapacity.availableCashFlow.toFixed(2)],
      ['Cuota Evaluada Propuesta', payCapacity.proposedInstallment.toFixed(2)],
      ['Excedente Libre Post-Cuota', payCapacity.surplusAfterProposed.toFixed(2)],
      ['Ratio de Cobertura (RCI)', `${ratios.debtCoverageRCI}x`],
      ['Ratio de Liquidez Corriente', `${ratios.currentRatio}x`],
      ['Endeudamiento sobre Activo', `${ratios.indebtednessRatio}%`],
      ['Carga Financiera Mensual', `${ratios.financialBurdenPct}%`],
      [''],
      ['--- SUSTENTO DOCUMENTAL ---'],
      ['Partidas Declaradas', verificationMetrics.totalDeclared.toFixed(2)],
      ['Partidas Verificadas', verificationMetrics.totalVerified.toFixed(2)],
      ['Porcentaje Respaldado', `${verificationMetrics.verificationPercentage}%`],
      ['Documentos Revisados', verificationMetrics.reviewedDocsCount],
      ['Documentos Pendientes', verificationMetrics.pendingDocsCount],
      [''],
      ['--- CLAUSULA INSTITUCIONAL ---'],
      ['EVALUA sirve para organizar informacion y apoyar la evaluacion financiera; no aprueba creditos ni garantiza su otorgamiento.']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${record.code}_informe_financiero_evalua.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Pestaña 10: Informes, Reportes y Dictamen Financiero
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generación de informe técnico formal descargable en PDF o exportable a Excel (CSV)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Descargar / Imprimir en PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Viewport */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 print:p-0 print:shadow-none print:m-0 border border-slate-200">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-blue-700">EVALÚA</span>
              <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded uppercase">
                Informe Financiero Oficial
              </span>
            </div>
            <p className="text-xs text-slate-600 font-semibold mt-0.5">
              Expediente de Registro y Análisis Económico de Clientes
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div className="font-bold text-slate-900 text-sm">{record.code}</div>
            <div className="text-slate-600">Fecha de Corte: {record.general.cutoffDate}</div>
            <div className="text-slate-600">Moneda: Soles (S/)</div>
          </div>
        </div>

        {/* Client Profile Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-100 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Cliente / Titular</span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">{record.general.nameOrBusinessName}</span>
            <span className="text-[11px] text-slate-600">{record.general.tradeName}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Identificación</span>
            <span className="font-bold text-slate-900 font-mono mt-0.5 block">
              {record.general.documentType}: {record.general.documentNumber}
            </span>
            <span className="text-[11px] text-slate-600">Régimen: {record.general.taxRegime}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Perfil & Giro</span>
            <span className="font-bold text-slate-900 capitalize mt-0.5 block">
              {record.general.clientType} ({record.general.operatingTimeYears} años)
            </span>
            <span className="text-[11px] text-slate-600 truncate block">{record.general.economicActivity}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Asesor Responsable</span>
            <span className="font-bold text-slate-900 mt-0.5 block">{record.advisorName}</span>
            <span className="text-[11px] text-slate-600">{record.agency}</span>
          </div>
        </div>

        {/* Verification Alert Banner if unverified exist */}
        {verificationMetrics.hasUnverifiedAlert && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Advertencia de Auditoría:</span> Este expediente cuenta con un {verificationMetrics.verificationPercentage}% de cifras respaldadas documentalmente. Existen {verificationMetrics.unverifiedItems.length} partidas registradas únicamente con valor estimado declarado por el cliente.
            </div>
          </div>
        )}

        {/* 3 Columns: Balance, P&L, Flujo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Balance */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>Balance General</span>
              <span className="text-[10px] font-mono text-blue-600">S/</span>
            </h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Activos Corrientes:</span>
                <span>S/ {bsTotals.totalCurrentAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Activos Fijos / Otros:</span>
                <span>S/ {bsTotals.totalNonCurrentAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-slate-900">
                <span>TOTAL ACTIVOS:</span>
                <span>S/ {bsTotals.totalAssets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-700 pt-1">
                <span>Pasivos Totales:</span>
                <span>S/ {bsTotals.totalLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-emerald-800">
                <span>PATRIMONIO NETO:</span>
                <span>S/ {bsTotals.calculatedEquity.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* P&L */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>Ganancias y Pérdidas</span>
              <span className="text-[10px] font-mono text-emerald-600">P&L</span>
            </h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Ventas Netas:</span>
                <span>S/ {isTotals.netSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>(-) Costo de Ventas:</span>
                <span>-S/ {isTotals.totalCostOfSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                <span>UTILIDAD BRUTA:</span>
                <span>S/ {isTotals.grossProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>(-) Gastos Operativos:</span>
                <span>-S/ {isTotals.totalOperatingExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-emerald-800">
                <span>UTILIDAD NETA:</span>
                <span>S/ {isTotals.netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Flujo y Capacidad */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>Capacidad y Excedente</span>
              <span className="text-[10px] font-mono text-purple-600">Flujo</span>
            </h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span>Ingreso / Base Neta:</span>
                <span>S/ {payCapacity.netMonthlyBase.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Cuotas Actuales:</span>
                <span>-S/ {payCapacity.obligationsMonthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-blue-800">
                <span>Flujo Disponible:</span>
                <span>S/ {payCapacity.availableCashFlow.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Cuota Evaluada:</span>
                <span>-S/ {payCapacity.proposedInstallment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-purple-800">
                <span>EXCEDENTE REMANENTE:</span>
                <span>S/ {payCapacity.surplusAfterProposed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicators Bar */}
        <div className="border border-slate-300 rounded-xl p-4 text-xs space-y-2">
          <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1">
            Matriz de Ratios Financieros Calculados
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 bg-slate-50 rounded">
              <span className="text-[10px] text-slate-500 block">RCI (Cobertura)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{ratios.debtCoverageRCI}x</span>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <span className="text-[10px] text-slate-500 block">Liquidez Corriente</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{ratios.currentRatio}x</span>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <span className="text-[10px] text-slate-500 block">Endeudamiento</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{ratios.indebtednessRatio}%</span>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <span className="text-[10px] text-slate-500 block">Carga Financiera</span>
              <span className="font-bold text-slate-900 font-mono text-sm">{ratios.financialBurdenPct}%</span>
            </div>
          </div>
        </div>

        {/* Advisor Notes in Report */}
        <div className="space-y-1.5 text-xs">
          <label className="font-bold text-slate-900 block">Observaciones y Dictamen del Asesor Financiero:</label>
          <textarea
            rows={3}
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            onBlur={() => onUpdateReportNotes(reportNotes)}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 outline-none print:border-none print:p-0"
            placeholder="Ingrese las observaciones finales que acompañarán al informe impreso o descargado..."
          />
        </div>

        {/* Signatures Row */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
          <div>
            <div className="w-48 border-b border-slate-400 mx-auto mb-1" />
            <span className="font-bold text-slate-800 block">{record.advisorName}</span>
            <span className="text-slate-500 text-[10px]">Asesor / Analista de Negocios</span>
          </div>
          <div>
            <div className="w-48 border-b border-slate-400 mx-auto mb-1" />
            <span className="font-bold text-slate-800 block">{record.general.nameOrBusinessName}</span>
            <span className="text-slate-500 text-[10px]">Firma / Conformidad del Cliente</span>
          </div>
        </div>

        {/* Official Institutional Disclaimer */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 text-center italic">
          EVALÚA sirve para organizar información y apoyar la evaluación financiera; no aprueba créditos ni garantiza su otorgamiento.
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MODAL: NUEVO EXPEDIENTE FINANCIERO                                         */
/* -------------------------------------------------------------------------- */
const NewFinancialRecordModal: React.FC<{
  onClose: () => void;
  onCreate: (record: Omit<FinancialRecordFile, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'auditTrail' | 'advisorId' | 'advisorName' | 'agency' | 'status'>) => void;
}> = ({ onClose, onCreate }) => {
  const [clientType, setClientType] = useState<ClientType>('negocio');
  const [docType, setDocType] = useState<'DNI' | 'RUC' | 'CE'>('RUC');
  const [docNumber, setDocNumber] = useState('');
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [activity, setActivity] = useState('');
  const [sector, setSector] = useState('Comercio');
  const [taxRegime, setTaxRegime] = useState('Régimen MYPE Tributario');
  const [salesEstimate, setSalesEstimate] = useState<number>(15000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !docNumber.trim()) return;

    onCreate({
      general: {
        clientType,
        documentType: docType,
        documentNumber: docNumber.trim(),
        nameOrBusinessName: name.trim(),
        tradeName: tradeName.trim() || undefined,
        birthOrEstablishmentDate: '2020-01-01',
        phone: phone.trim() || '987-000-000',
        email: email.trim() || 'cliente@evalua.pe',
        address: 'Av. Principal 123',
        district: 'Lima',
        province: 'Lima',
        department: 'Lima',
        economicSector: sector,
        economicActivity: activity.trim() || 'Comercio general',
        taxRegime,
        operatingTimeYears: 3,
        cutoffDate: new Date().toISOString().split('T')[0],
        advisorNotes: 'Apertura de expediente para registro y análisis financiero.'
      },
      incomeExpenseItems: [
        {
          id: `item-${Date.now()}-1`,
          category: clientType === 'natural' ? 'ingreso_personal' : 'ingreso_negocio',
          concept: clientType === 'natural' ? 'Sueldo / Ingreso principal' : 'Ventas mensuales estimadas',
          declaredAmount: Number(salesEstimate) || 10000,
          verifiedAmount: 0,
          isVerified: false,
          docStatus: 'pendiente'
        }
      ],
      balanceSheet: {
        cashAndBanks: 3000,
        accountsReceivable: 1000,
        inventory: clientType === 'natural' ? 0 : 12000,
        otherCurrentAssets: 0,
        propertyAndBuildings: 0,
        machineryAndEquipment: clientType === 'natural' ? 5000 : 8000,
        vehicles: 0,
        furnitureAndFixtures: 2000,
        otherNonCurrentAssets: 0,
        accumulatedDepreciation: 0,
        suppliersPayable: 2000,
        shortTermBankDebt: 3000,
        taxesPayable: 200,
        otherCurrentLiabilities: 0,
        longTermBankDebt: 0,
        mortgages: 0,
        otherNonCurrentLiabilities: 0,
        capital: 12000,
        retainedEarnings: 6800
      },
      incomeStatement: {
        salesOrIncome: Number(salesEstimate) || 15000,
        salesReturns: 0,
        cogsMerchandise: clientType === 'natural' ? 0 : (Number(salesEstimate) || 15000) * 0.65,
        cogsLabor: 0,
        cogsFreightAndOther: 0,
        operatingRent: clientType === 'natural' ? 0 : 800,
        operatingPayroll: 0,
        operatingServices: 250,
        operatingTransport: 150,
        operatingMaintenance: 0,
        operatingSalesAndMarketing: 50,
        operatingTaxesAndLicenses: 100,
        otherOperatingExpenses: 100,
        otherNonOpIncome: 0,
        financialExpenses: 250,
        taxesIR: 180
      },
      cashFlow: {
        initialBalance: 2000,
        cashSales: Number(salesEstimate) || 15000,
        creditCollections: 0,
        salaryOrIndependentIncome: clientType === 'natural' ? (Number(salesEstimate) || 15000) : 0,
        otherInflows: 0,
        supplierPayments: clientType === 'natural' ? 0 : (Number(salesEstimate) || 15000) * 0.65,
        operatingExpensesPayments: 1200,
        payrollPayments: 0,
        debtInstallmentsPayments: 450,
        familyExpensesOrPersonalDraws: 1800,
        taxPayments: 180,
        otherOutflows: 100
      },
      obligations: [],
      supportDocuments: [],
      evaluationParams: {
        proposedInstallment: 850,
        stressTestDropPct: 15,
        advisorAppraisalNotes: 'Expediente nuevo registrado para evaluación financiera.'
      },
      advisorReportNotes: 'Cliente registrado en EVALÚA para sistematización de balances y capacidad de pago.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Nuevo Expediente Financiero</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Choice */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Cliente:</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { type: 'natural', label: 'Persona Natural', doc: 'DNI' },
                  { type: 'negocio', label: 'Con Negocio', doc: 'RUC' },
                  { type: 'empresa', label: 'Empresa', doc: 'RUC' }
                ] as const
              ).map((p) => (
                <button
                  type="button"
                  key={p.type}
                  onClick={() => {
                    setClientType(p.type);
                    setDocType(p.doc as any);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    clientType === p.type
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Doc. Identidad:</label>
              <div className="flex gap-1.5">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-24 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="CE">CE</option>
                </select>
                <input
                  type="text"
                  placeholder="Número de documento"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {clientType === 'empresa' ? 'Razón Social:' : 'Nombre y Apellidos:'}
              </label>
              <input
                type="text"
                placeholder="Nombre oficial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Comercial / Giro:</label>
              <input
                type="text"
                placeholder="Ej. Comercial Los Andes"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Actividad Económica:</label>
              <input
                type="text"
                placeholder="Ej. Venta de abarrotes"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Ingresos / Ventas Mensuales Estimadas (S/):</label>
              <input
                type="number"
                value={salesEstimate}
                onChange={(e) => setSalesEstimate(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Régimen Tributario:</label>
              <select
                value={taxRegime}
                onChange={(e) => setTaxRegime(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="Nuevo RUS">Nuevo RUS</option>
                <option value="Régimen MYPE Tributario">Régimen MYPE Tributario</option>
                <option value="Régimen Especial">Régimen Especial</option>
                <option value="Régimen General">Régimen General</option>
                <option value="Quinta / Cuarta Categoría">Quinta / Cuarta Categoría</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer"
            >
              Crear y Abrir Expediente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
