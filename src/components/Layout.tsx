import React, { useState, useRef, useEffect } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  User,
  Briefcase,
  CreditCard,
  TrendingUp,
  BarChart3,
  Scale,
  ClipboardList,
  CheckCircle2,
  Users,
  MessageSquareText,
  CalendarClock,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  Plus,
  Bell,
  Download,
  Upload,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  UserCog,
  Clock
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentUser,
    logout,
    activeTab,
    setActiveTab,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsNewDossierModalOpen,
    setSelectedDossierId,
    dossiers,
    financialRecords,
    auditLogs,
    resetAllData,
    exportBackupData,
    importBackupData
  } = useEvalua();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [backupImportStatus, setBackupImportStatus] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNav = [
    { id: 'panel_principal', label: 'Panel principal', icon: LayoutDashboard, iconColor: 'text-[#1D63ED]' },
    { id: 'expedientes', label: 'Expedientes', icon: FolderKanban, iconColor: 'text-slate-500' },
    { id: 'solicitudes', label: 'Solicitudes', icon: FileText, iconColor: 'text-slate-500' }
  ];

  const moduleStepsNav = [
    { id: 'solicitante', label: '1. Solicitante', icon: User, iconColor: 'text-[#1D63ED]' },
    { id: 'negocio', label: '2. Negocio', icon: Briefcase, iconColor: 'text-[#16A34A]' },
    { id: 'credito', label: '3. Crédito', icon: CreditCard, iconColor: 'text-[#8B5CF6]' },
    { id: 'ingresos_gastos', label: '4. Ingresos y gastos', icon: TrendingUp, iconColor: 'text-[#F59E0B]' },
    { id: 'balance', label: '5. Estados financieros y balance', icon: BarChart3, iconColor: 'text-[#0EA5E9]' },
    { id: 'capacidad', label: '6. Capacidad de pago', icon: Scale, iconColor: 'text-[#16A34A]' },
    { id: 'inventario_documentos', label: '7. Inventario y documentos', icon: ClipboardList, iconColor: 'text-[#8B5CF6]' },
    { id: 'conclusion', label: '8. Conclusión', icon: CheckCircle2, iconColor: 'text-[#F59E0B]' }
  ];

  const operationalNav = [
    { id: 'referencias', label: 'Referencias', icon: Users, iconColor: 'text-[#0EA5E9]' },
    { id: 'observaciones', label: 'Observaciones', icon: MessageSquareText, iconColor: 'text-[#1D63ED]' },
    { id: 'seguimiento', label: 'Seguimiento', icon: CalendarClock, iconColor: 'text-[#8B5CF6]' },
    { id: 'reportes', label: 'Reportes y PDF', icon: FileSpreadsheet, iconColor: 'text-[#16A34A]' }
  ];

  const handleNavItemClick = (navId: string) => {
    setActiveTab(navId);
    setIsMobileMenuOpen(false);
  };

  // Pending documents & active alerts for Notification Bell
  const pendingDocsAlerts = dossiers.flatMap((d) =>
    d.documents
      .filter((doc) => doc.status === 'Pendiente' || doc.status === 'Observado')
      .map((doc) => ({
        id: `${d.id}-${doc.id}`,
        dossierId: d.id,
        code: d.code,
        applicant: d.personal.fullName,
        docName: doc.name,
        status: doc.status
      }))
  );

  // Instant search results
  const searchResults = globalSearchQuery.trim()
    ? dossiers.filter((d) => {
        const q = globalSearchQuery.toLowerCase();
        return (
          d.code.toLowerCase().includes(q) ||
          d.personal.fullName.toLowerCase().includes(q) ||
          d.personal.documentNumber.toLowerCase().includes(q) ||
          d.business.businessName.toLowerCase().includes(q) ||
          d.personal.phone.includes(q)
        );
      })
    : [];

  const handleExportCSV = () => {
    const headers = [
      'Código',
      'Solicitante',
      'Documento',
      'Negocio',
      'Monto Solicitado (S/)',
      'Plazo (Meses)',
      'Cuota Estimada (S/)',
      'Excedente Post-Cuota (S/)',
      'Estado',
      'Fecha'
    ];
    const rows = dossiers.map((d) => [
      `"${d.code}"`,
      `"${d.personal.fullName}"`,
      `"${d.personal.documentType} ${d.personal.documentNumber}"`,
      `"${d.business.businessName}"`,
      d.terms.requestedAmount,
      d.terms.termMonths,
      d.terms.proposedInstallment,
      d.paymentCapacity.remainingSurplusAfterProposedInstallment,
      `"${d.status}"`,
      `"${d.createdAt}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `evalua_peru_expedientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="overflow-y-auto flex-1">
        {/* Brand Header */}
        <div className="px-4 h-16 border-b border-slate-200/80 flex items-center gap-2.5 shrink-0">
          <img
            src="/assets/evalua-icono.png"
            alt="EVALÚA PERÚ"
            className="w-8 h-8 object-contain shrink-0"
          />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-lg font-extrabold tracking-tight text-[#0B2545] whitespace-nowrap">
              EVALÚA
            </span>
            <span className="text-[10px] font-bold text-[#1D63ED] bg-[#EFF6FF] px-1.5 py-0.5 rounded border border-blue-200/70 tracking-wide whitespace-nowrap">
              PERÚ
            </span>
          </div>
        </div>

        {/* Primary CTA Button (+ Nuevo expediente in Electric Blue) */}
        <div className="p-3.5 pb-2">
          <button
            onClick={() => {
              setIsNewDossierModalOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo expediente</span>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="px-3 py-2 space-y-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#1D63ED] font-bold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1D63ED]' : item.iconColor}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mx-4 my-1.5 border-t border-slate-200/80" />

        {/* Numbered 8 Dossier Sections */}
        <div className="px-3 py-1 space-y-0.5">
          {moduleStepsNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#1D63ED] font-bold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1D63ED]' : item.iconColor}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mx-4 my-1.5 border-t border-slate-200/80" />

        {/* Complementary Operational Modules */}
        <div className="px-3 py-1 pb-4 space-y-0.5">
          {operationalNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#1D63ED] font-bold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/70 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1D63ED]' : item.iconColor}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Bottom Security & Session */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 space-y-1.5 shrink-0">
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => handleNavItemClick('usuarios')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-[#EFF6FF] text-[#1D63ED] font-bold'
                : 'text-slate-600 hover:bg-slate-100 font-semibold'
            }`}
          >
            <UserCog className="w-4 h-4 shrink-0" />
            <span className="truncate">Usuarios y roles</span>
          </button>
        )}
        <button
          onClick={() => handleNavItemClick('configuracion')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
            activeTab === 'configuracion'
              ? 'bg-[#EFF6FF] text-[#1D63ED] font-bold'
              : 'text-slate-600 hover:bg-slate-100 font-semibold'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Seguridad y auditoría</span>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-slate-900 flex font-sans selection:bg-[#1D63ED] selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 flex-col shrink-0 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex">
          <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl relative">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
              className="absolute top-3.5 right-3 p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {renderSidebarContent()}
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean White Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Universal Search Input */}
            <div ref={searchRef} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                placeholder="Buscar por DNI, RUC, cliente o código de expediente"
                className="w-full pl-10 pr-8 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#1D63ED] focus:ring-2 focus:ring-[#1D63ED]/15 transition-all"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => {
                    setGlobalSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Live Search Dropdown */}
              {showSearchDropdown && globalSearchQuery.trim() !== '' && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                  <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 flex items-center justify-between">
                    <span>Resultados ({searchResults.length})</span>
                    <button
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setActiveTab('solicitudes');
                      }}
                      className="text-[#1D63ED] hover:underline cursor-pointer"
                    >
                      Ver en solicitudes
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No se encontraron expedientes para "{globalSearchQuery}".
                      </div>
                    ) : (
                      searchResults.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            setSelectedDossierId(d.id);
                            setShowSearchDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#EFF6FF] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {d.personal.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">
                              {d.code} · {d.personal.documentType} {d.personal.documentNumber} · {d.business.businessName}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#1D63ED] font-mono shrink-0 tabular-nums">
                            S/ {d.terms.requestedAmount.toLocaleString('es-PE')}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Respaldar / Exportar Dropdown */}
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#1D63ED]" />
                <span className="hidden sm:inline">Respaldar / Exportar</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setShowBackupModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#EFF6FF] text-slate-700 hover:text-[#1D63ED] font-semibold text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#1D63ED]" />
                    <span>Copia de seguridad (JSON)</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Exportar cartera (Excel/CSV)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setActiveTab('reportes');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold text-left cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>Centro de reportes</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-amber-50 text-slate-600 hover:text-amber-700 font-semibold text-left cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-600" />
                    <span>Restablecer datos demo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Real Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="Notificaciones y pendientes"
                className="relative p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {pendingDocsAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {pendingDocsAlerts.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Documentos pendientes ({pendingDocsAlerts.length})
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('inventario_documentos');
                      }}
                      className="text-[11px] font-bold text-[#1D63ED] hover:underline cursor-pointer"
                    >
                      Gestionar
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {pendingDocsAlerts.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-500">
                        Todos los documentos de sustento se encuentran al día.
                      </div>
                    ) : (
                      pendingDocsAlerts.slice(0, 8).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedDossierId(item.dossierId);
                            setShowNotifications(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-[#1D63ED]">{item.code}</span>
                            <span className="text-amber-600 font-semibold">{item.status}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">{item.docName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{item.applicant}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1D63ED] flex items-center justify-center font-bold shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden md:inline max-w-[120px] truncate">
                  {currentUser?.role === 'admin' ? 'Administrador' : currentUser?.name || 'Analista'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900 truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser?.roleTitle}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser?.agency}</p>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('usuarios');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-left cursor-pointer"
                    >
                      <UserCog className="w-4 h-4 text-[#1D63ED]" />
                      <span>Administrar usuarios y roles</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('configuracion');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Parámetros y auditoría ({auditLogs.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold text-left mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* MODAL: Copia de Seguridad y Respaldo (Exportar e Importar JSON) */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] text-[#1D63ED] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Copias de Seguridad y Respaldo</h3>
                  <p className="text-[11px] text-slate-500">Portabilidad y protección de expedientes en formato JSON</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  setBackupImportStatus(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl border border-blue-200/80 bg-[#EFF6FF]/60 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-sm text-[#0B2545] block">Exportar respaldo completo</span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Incluye {dossiers.length} expedientes, {financialRecords.length} análisis financieros y {auditLogs.length} registros de auditoría.
                  </span>
                </div>
                <button
                  onClick={exportBackupData}
                  className="px-4 py-2.5 bg-[#1D63ED] hover:bg-[#1552CE] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#1D63ED]" />
                  <span>Restaurar desde archivo de respaldo</span>
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Seleccione un archivo <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">.json</code> exportado previamente desde EVALÚA PERÚ:
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        const res = importBackupData(content);
                        if (res.success) {
                          setBackupImportStatus('Copia de seguridad restaurada correctamente.');
                        } else {
                          setBackupImportStatus(`Error: ${res.error}`);
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1D63ED] file:text-white hover:file:bg-[#1552CE] cursor-pointer"
                />

                {backupImportStatus && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      backupImportStatus.includes('Error')
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {backupImportStatus}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  setBackupImportStatus(null);
                }}
                className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-[#0B2545]">¿Restablecer datos de demostración?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción recargará los expedientes ficticios de demostración en soles (S/) y limpiará las modificaciones locales actuales.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#1D63ED] hover:bg-[#1552CE] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Confirmar reinicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
