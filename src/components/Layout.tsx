import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  FileSpreadsheet,
  User,
  Briefcase,
  CreditCard,
  TrendingUp,
  Building2,
  Wallet,
  Package,
  ClipboardCheck,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  PlusCircle,
  Bell,
  CheckCircle2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentUser,
    users,
    switchUserRole,
    logout,
    activeTab,
    setActiveTab,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsNewDossierModalOpen,
    dossiers,
    financialRecords,
    resetAllData
  } = useEvalua();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Core financial records module + 8 credit evaluation tasks:
  const navigationItems = [
    {
      id: 'registro_financiero',
      label: 'Registro y Análisis Financiero',
      icon: FileSpreadsheet,
      badge: financialRecords?.length || 3,
      isCore: true
    },
    { id: 'solicitudes', label: 'Solicitud', icon: FileSpreadsheet, badge: dossiers.length },
    { id: 'solicitante', label: '1. Solicitante', icon: User },
    { id: 'negocio', label: '2. Negocio', icon: Briefcase },
    { id: 'credito', label: '3. Crédito', icon: CreditCard },
    { id: 'ingresos_gastos', label: '4. Ingresos y gastos', icon: TrendingUp },
    { id: 'balance', label: '5. Estados financieros y balance', icon: Building2 },
    { id: 'capacidad', label: '6. Capacidad de pago', icon: Wallet },
    { id: 'inventario_documentos', label: '7. Inventario y documentos', icon: Package },
    { id: 'conclusion', label: '8. Conclusión', icon: ClipboardCheck },
  ];

  const handleNavItemClick = (navId: string) => {
    setActiveTab(navId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-evalua-yellow selection:text-slate-950">
      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Desktop (Clean White with Navy & Sky Active States) */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/90 flex-col justify-between shrink-0 shadow-2xs">
          <div>
            {/* Brand Logo: evalua-icono.png (36px) + text EVALÚA in #0B4A8B */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <img
                src="/assets/evalua-icono.png"
                alt="EVALÚA Ícono"
                className="w-9 h-9 object-contain shrink-0"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-evalua-blue">
                  EVALÚA
                </span>
                <span className="text-[9px] font-black bg-evalua-sky text-evalua-blue px-1.5 py-0.5 rounded-sm uppercase border border-blue-200/60">
                  Perú
                </span>
              </div>
            </div>

            {/* Quick Action Button: Yellow Pill */}
            <div className="p-3">
              <button
                onClick={() => setIsNewDossierModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-full bg-evalua-yellow hover:bg-[#ebd000] text-slate-950 text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>+ Nuevo Expediente</span>
              </button>
            </div>

            {/* Navigation Menu: Line Icons + Active in Sky #EEF5FB with Navy text & border */}
            <nav className="px-2.5 py-1 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-evalua-sky text-evalua-blue border-l-4 border-evalua-blue shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-evalua-navy hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-evalua-blue' : 'text-slate-400 group-hover:text-evalua-blue'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                          isActive
                            ? 'bg-blue-100 text-evalua-blue'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar User and Logout */}
          <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
            {/* Current user card */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-evalua-sky text-evalua-blue flex items-center justify-center text-xs font-extrabold shrink-0 border border-blue-200">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{currentUser?.roleTitle}</p>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/assets/evalua-icono.png"
                      alt="EVALÚA"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="font-extrabold text-lg text-evalua-blue">EVALÚA</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavItemClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-evalua-sky text-evalua-blue border-l-4 border-evalua-blue'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-evalua-blue' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                            isActive ? 'bg-blue-100 text-evalua-blue' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar: Clean White Header with Search, Notifications, Profile */}
          <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-evalua-navy"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Universal Search Bar */}
            <div className="flex-1 max-w-xl relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Buscar por DNI, cliente, RUC, número de solicitud o teléfono..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-evalua-blue focus:ring-2 focus:ring-evalua-blue/20 transition-all"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Right Tools, Notification Bell, & Fast Role Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Reset demo data */}
              <button
                title="Restablecer datos de prueba"
                onClick={() => setShowResetConfirm(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reiniciar Demo</span>
              </button>

              {/* Notification icon */}
              <div className="relative">
                <button
                  title="Notificaciones"
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-evalua-sky text-slate-600 hover:text-evalua-blue flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                </button>
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-evalua-yellow ring-2 ring-white" />
              </div>

              {/* Fast role switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-evalua-blue" />
                  <span className="hidden md:inline font-bold">{currentUser?.agency}</span>
                  <span className="text-[10px] bg-evalua-sky text-evalua-blue px-2 py-0.5 rounded-full font-extrabold uppercase">
                    {currentUser?.role === 'admin' ? 'Admin' : currentUser?.roleTitle.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showRoleSwitcher && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5">
                      Cambiar Perfil de Usuario Demo
                    </p>
                    <div className="space-y-1 mt-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUserRole(u.id);
                            setShowRoleSwitcher(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                            currentUser?.id === u.id
                              ? 'bg-evalua-sky text-evalua-blue font-bold border border-blue-200/70'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{u.roleTitle}</div>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {u.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* View Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
            {children}
          </main>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-extrabold text-evalua-navy">¿Restablecer datos de prueba?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción recargará todos los solicitantes, expedientes y tareas originales de demostración en soles (S/).
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-full bg-evalua-navy hover:bg-[#00344d] text-white text-xs font-bold transition-all shadow-xs"
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
