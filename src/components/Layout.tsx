import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  ClipboardCheck,
  CheckCircle2,
  Users,
  MessageSquareText,
  CalendarClock,
  LogOut,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Plus,
  Bell,
  Download,
  Upload,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  UserCog,
  Wallet,
  Receipt,
  Landmark,
  ArrowLeftRight,
  PieChart,
  FilePenLine,
  Calculator,
  Banknote,
  CalendarCheck,
  Activity,
  Building2,
  Boxes,
  Shield,
  FolderOpen,
  UserCheck,
  FileBadge,
  UserPlus,
  PhoneCall,
  History,
  Lock
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface SubMenuItem {
  key: string;
  label: string;
  tab: string;
  subSection: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarCategoryItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  activeBadgeClass: string;
  tab?: string;
  children?: SubMenuItem[];
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentUser,
    logout,
    activeTab,
    activeNavKey,
    navigateTo,
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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

  const generalNav: SidebarCategoryItem[] = [
    {
      key: 'panel_principal',
      label: 'Panel principal',
      tab: 'panel_principal',
      icon: LayoutDashboard,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white'
    },
    {
      key: 'expedientes',
      label: 'Expedientes',
      tab: 'expedientes',
      icon: FolderKanban,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white'
    },
    {
      key: 'solicitudes',
      label: 'Solicitudes',
      tab: 'solicitudes',
      icon: FileText,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white'
    }
  ];

  const expedienteNav: SidebarCategoryItem[] = [
    {
      key: 'solicitante',
      label: '1. Solicitante',
      tab: 'solicitante',
      icon: User,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white'
    },
    {
      key: 'negocio',
      label: '2. Negocio y actividad económica',
      tab: 'negocio',
      icon: Briefcase,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white'
    },
    {
      key: 'credito',
      label: '3. Solicitud de crédito',
      tab: 'credito',
      icon: CreditCard,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white'
    },
    {
      key: 'cat_info_economica',
      label: '4. Información económica',
      icon: Wallet,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white',
      children: [
        {
          key: 'econ_ingresos',
          label: 'Ingresos',
          tab: 'ingresos_gastos',
          subSection: 'econ-ingresos',
          icon: TrendingUp
        },
        {
          key: 'econ_gastos',
          label: 'Gastos',
          tab: 'ingresos_gastos',
          subSection: 'econ-gastos',
          icon: Receipt
        },
        {
          key: 'econ_obligaciones',
          label: 'Deudas y obligaciones',
          tab: 'capacidad',
          subSection: 'econ-obligaciones',
          icon: Landmark
        }
      ]
    },
    {
      key: 'cat_estados_financieros',
      label: '5. Estados financieros',
      icon: BarChart3,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white',
      children: [
        {
          key: 'ef_balance',
          label: 'Balance general',
          tab: 'balance',
          subSection: 'ef-balance',
          icon: Scale
        },
        {
          key: 'ef_resultados',
          label: 'Estado de resultados',
          tab: 'balance',
          subSection: 'ef-resultados',
          icon: FileSpreadsheet
        },
        {
          key: 'ef_flujo',
          label: 'Flujo de caja',
          tab: 'capacidad',
          subSection: 'ef-flujo',
          icon: ArrowLeftRight
        },
        {
          key: 'ef_patrimonio',
          label: 'Cambios en el patrimonio',
          tab: 'balance',
          subSection: 'ef-patrimonio',
          icon: PieChart
        },
        {
          key: 'ef_notas',
          label: 'Notas y observaciones',
          tab: 'conclusion',
          subSection: 'ef-notas',
          icon: FilePenLine
        }
      ]
    },
    {
      key: 'cat_capacidad_pago',
      label: '6. Capacidad de pago',
      icon: Calculator,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white',
      children: [
        {
          key: 'cap_ingresos',
          label: 'Ingresos disponibles',
          tab: 'capacidad',
          subSection: 'cap-ingresos',
          icon: Banknote
        },
        {
          key: 'cap_cuotas',
          label: 'Cuotas y obligaciones',
          tab: 'capacidad',
          subSection: 'cap-cuotas',
          icon: CalendarCheck
        },
        {
          key: 'cap_excedente',
          label: 'Excedente mensual',
          tab: 'capacidad',
          subSection: 'cap-excedente',
          icon: TrendingUp
        },
        {
          key: 'cap_indicadores',
          label: 'Indicadores de capacidad de pago',
          tab: 'capacidad',
          subSection: 'cap-indicadores',
          icon: Activity
        }
      ]
    },
    {
      key: 'cat_patrimonio_garantias',
      label: '7. Patrimonio y garantías',
      icon: ShieldCheck,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white',
      children: [
        {
          key: 'pat_bienes',
          label: 'Bienes y activos',
          tab: 'balance',
          subSection: 'pat-bienes',
          icon: Building2
        },
        {
          key: 'pat_inventario',
          label: 'Inventario del negocio',
          tab: 'inventario_documentos',
          subSection: 'pat-inventario',
          icon: Boxes
        },
        {
          key: 'pat_garantias',
          label: 'Garantías y avales',
          tab: 'credito',
          subSection: 'pat-garantias',
          icon: Shield
        }
      ]
    },
    {
      key: 'cat_documentacion',
      label: '8. Documentación',
      icon: FolderOpen,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white',
      children: [
        {
          key: 'doc_personales',
          label: 'Documentos personales',
          tab: 'documentos',
          subSection: 'doc-personales',
          icon: UserCheck
        },
        {
          key: 'doc_negocio',
          label: 'Documentos del negocio',
          tab: 'documentos',
          subSection: 'doc-negocio',
          icon: FileBadge
        },
        {
          key: 'doc_financieros',
          label: 'Documentos financieros',
          tab: 'documentos',
          subSection: 'doc-financieros',
          icon: FileSpreadsheet
        },
        {
          key: 'doc_control',
          label: 'Control de documentos',
          tab: 'inventario_documentos',
          subSection: 'doc-control',
          icon: ClipboardCheck
        }
      ]
    },
    {
      key: 'cat_referencias',
      label: '9. Referencias',
      icon: Users,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white',
      children: [
        {
          key: 'ref_personales',
          label: 'Personales',
          tab: 'referencias',
          subSection: 'ref-personales',
          icon: UserPlus
        },
        {
          key: 'ref_comerciales',
          label: 'Comerciales',
          tab: 'referencias',
          subSection: 'ref-comerciales',
          icon: Briefcase
        },
        {
          key: 'ref_resultados',
          label: 'Resultados de contacto',
          tab: 'referencias',
          subSection: 'ref-resultados',
          icon: PhoneCall
        }
      ]
    },
    {
      key: 'cat_obs_seguimiento',
      label: '10. Observaciones y seguimiento',
      icon: CalendarClock,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white',
      children: [
        {
          key: 'obs_analista',
          label: 'Observaciones del analista',
          tab: 'observaciones',
          subSection: 'obs-analista',
          icon: MessageSquareText
        },
        {
          key: 'obs_historial',
          label: 'Historial de actividades',
          tab: 'seguimiento',
          subSection: 'obs-historial',
          icon: History
        },
        {
          key: 'obs_estado',
          label: 'Estado de la solicitud',
          tab: 'conclusion',
          subSection: 'obs-estado',
          icon: CheckCircle2
        }
      ]
    }
  ];

  const configNav: SidebarCategoryItem[] = [
    {
      key: 'usuarios',
      label: 'Usuarios y permisos',
      tab: 'usuarios',
      icon: UserCog,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#004481] text-white'
    },
    {
      key: 'configuracion',
      label: 'Configuración general',
      tab: 'configuracion',
      icon: Settings,
      badgeClass: 'bg-[#F7F8FA] text-[#5B6573]',
      activeBadgeClass: 'bg-[#072146] text-white'
    }
  ];

  // Auto-expand parent category when navigating from external views (e.g. dashboard, wizard, step buttons)
  useEffect(() => {
    const matchingParent = expedienteNav.find(
      (cat) =>
        cat.children &&
        (cat.children.some((child) => child.key === activeNavKey) ||
          cat.children.some((child) => child.tab === activeTab))
    );
    if (matchingParent) {
      setExpandedCategory(matchingParent.key);
    }
  }, [activeNavKey, activeTab]);

  const isChildActive = (child: SubMenuItem) => {
    if (activeNavKey === child.key) return true;
    // Fallback highlight when navigated via generic tab without specific subKey
    if (activeNavKey === activeTab && child.tab === activeTab) {
      const parentCat = expedienteNav.find((c) => c.children?.some((ch) => ch.key === child.key));
      const firstMatch = parentCat?.children?.find((ch) => ch.tab === activeTab);
      return firstMatch?.key === child.key;
    }
    return false;
  };

  const isCategoryActive = (item: SidebarCategoryItem) => {
    if (item.tab && activeTab === item.tab && activeNavKey === item.key) return true;
    if (item.tab && activeTab === item.tab && !item.children) return true;
    if (item.children) {
      return item.children.some((child) => isChildActive(child));
    }
    return false;
  };

  const handleToggleCategory = (catKey: string) => {
    setExpandedCategory((prev) => (prev === catKey ? null : catKey));
  };

  const handleLeafClick = (tab: string, navKey: string, subSection: string | null = null) => {
    navigateTo(tab, navKey, subSection);
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

  const renderCategoryItem = (item: SidebarCategoryItem) => {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isExpanded = expandedCategory === item.key;
    const active = isCategoryActive(item);
    const isRestrictedAdminItem = item.key === 'usuarios' && currentUser?.role !== 'admin';

    return (
      <div key={item.key} className="space-y-0.5">
        <button
          type="button"
          aria-expanded={hasChildren ? isExpanded : undefined}
          onClick={() => {
            if (hasChildren) {
              handleToggleCategory(item.key);
            } else if (item.tab) {
              handleLeafClick(item.tab, item.key, null);
            }
          }}
          className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-[12.5px] transition-all duration-150 cursor-pointer text-left group ${
            active
              ? 'bg-[#F0F5FA] text-[#072146] font-bold'
              : isExpanded
              ? 'bg-[#F7F8FA] text-[#121212] font-semibold'
              : 'text-[#374151] hover:text-[#121212] hover:bg-[#F7F8FA] hover:translate-x-0.5 font-medium'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                active ? item.activeBadgeClass : item.badgeClass
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span className="truncate leading-snug">{item.label}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isRestrictedAdminItem && (
              <Lock className="w-3 h-3 text-[#6B7280]" aria-label="Solo administrador" />
            )}
            {hasChildren && (
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  isExpanded
                    ? 'rotate-90 text-[#004481]'
                    : active
                    ? 'text-[#004481]'
                    : 'text-[#6B7280] group-hover:text-[#121212]'
                }`}
              />
            )}
          </div>
        </button>

        {/* Collapsible Submenu */}
        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="ml-[20px] pl-2.5 py-1 border-l border-[#E2E6EC] space-y-0.5 overflow-hidden"
            >
              {item.children!.map((child) => {
                const ChildIcon = child.icon;
                const childActive = isChildActive(child);
                return (
                  <button
                    key={child.key}
                    type="button"
                    onClick={() => handleLeafClick(child.tab, child.key, child.subSection)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] transition-all duration-150 cursor-pointer text-left ${
                      childActive
                        ? 'bg-[#F0F5FA] text-[#004481] font-bold'
                        : 'text-[#5B6573] hover:text-[#121212] hover:bg-[#F7F8FA] hover:translate-x-0.5 font-medium'
                    }`}
                  >
                    <ChildIcon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        childActive ? 'text-[#004481]' : 'text-[#6B7280]'
                      }`}
                    />
                    <span className="truncate leading-snug">{child.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between bg-white">
      {/* Brand Header (Fixed top) */}
      <div className="px-4 h-16 border-b border-[#E2E6EC] flex items-center gap-2.5 shrink-0 bg-white">
        <img
          src="/assets/evalua-icono.png"
          alt="EVALÚA PERÚ"
          className="w-7 h-7 object-contain shrink-0"
        />
        <span className="text-base font-extrabold tracking-tight text-[#072146] whitespace-nowrap">
          EVALÚA PERÚ
        </span>
      </div>

      {/* Primary CTA Button (+ Nuevo expediente in Institutional Banking Blue) */}
      <div className="px-3.5 pt-3.5 pb-2 shrink-0 bg-white">
        <button
          onClick={() => {
            setIsNewDossierModalOpen(true);
            setIsMobileMenuOpen(false);
          }}
          className="w-full py-2.5 px-4 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.25]" />
          <span>Nuevo expediente</span>
        </button>
      </div>

      {/* Scrollable Hierarchical Navigation */}
      <nav aria-label="Navegación principal" className="overflow-y-auto flex-1 px-3 py-2 space-y-4">
        {/* GENERAL */}
        <div className="space-y-1">
          <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            GENERAL
          </div>
          <div className="space-y-0.5">
            {generalNav.map(renderCategoryItem)}
          </div>
        </div>

        <div className="mx-2 border-t border-[#E2E6EC]" />

        {/* GESTIÓN DEL EXPEDIENTE */}
        <div className="space-y-1">
          <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            GESTIÓN DEL EXPEDIENTE
          </div>
          <div className="space-y-0.5">
            {expedienteNav.map(renderCategoryItem)}
          </div>
        </div>

        <div className="mx-2 border-t border-[#E2E6EC]" />

        {/* CONFIGURACIÓN */}
        <div className="space-y-1 pb-2">
          <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
            CONFIGURACIÓN
          </div>
          <div className="space-y-0.5">
            {configNav.map(renderCategoryItem)}
          </div>
        </div>
      </nav>

      {/* Sidebar Bottom Session Footer */}
      <div className="p-3 border-t border-[#E2E6EC] bg-white shrink-0">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[#C81E1E] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#121212] flex font-sans selection:bg-[#004481] selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-[#E2E6EC] flex-col shrink-0 sticky top-0 h-screen">
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
        <header className="h-16 bg-white border-b border-[#E2E6EC] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-2 rounded-md border border-[#CBD5E1] bg-white text-[#121212] hover:bg-[#F7F8FA] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Universal Search Input */}
            <div ref={searchRef} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={globalSearchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setGlobalSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                placeholder="Buscar por DNI, RUC, cliente o código de expediente"
                className="w-full pl-10 pr-8 py-2 rounded-md bg-[#F7F8FA] border border-[#D1D5DB] text-xs font-medium text-[#121212] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/15 transition-colors"
              />
              {globalSearchQuery && (
                <button
                  onClick={() => {
                    setGlobalSearchQuery('');
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#121212] text-xs font-bold cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Live Search Dropdown */}
              {showSearchDropdown && globalSearchQuery.trim() !== '' && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-lg border border-[#E2E6EC] shadow-sm overflow-hidden z-50">
                  <div className="px-3.5 py-2 bg-[#F7F8FA] border-b border-[#E2E6EC] text-[11px] font-semibold text-[#5B6573] flex items-center justify-between">
                    <span>Resultados ({searchResults.length})</span>
                    <button
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setActiveTab('solicitudes');
                      }}
                      className="text-[#1464A5] hover:underline cursor-pointer"
                    >
                      Ver en solicitudes
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E6EC]">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#5B6573]">
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
                          className="w-full px-4 py-2.5 text-left hover:bg-[#F7F8FA] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#121212] truncate">
                              {d.personal.fullName}
                            </div>
                            <div className="text-[11px] text-[#5B6573] font-mono truncate">
                              {d.code} · {d.personal.documentType} {d.personal.documentNumber} · {d.business.businessName}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#004481] font-mono shrink-0 tabular-nums">
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
          <div className="flex items-center gap-2 shrink-0">
            {/* Respaldar / Exportar Dropdown */}
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white hover:bg-[#F7F8FA] text-[#121212] border border-[#CBD5E1] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 text-[#004481]" />
                <span className="hidden sm:inline">Respaldar / Exportar</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-lg border border-[#E2E6EC] shadow-sm p-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setShowBackupModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F7F8FA] text-[#121212] hover:text-[#004481] font-medium text-left cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#004481]" />
                    <span>Copia de seguridad (JSON)</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F7F8FA] text-[#121212] hover:text-[#028448] font-medium text-left cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#028448]" />
                    <span>Exportar cartera (Excel/CSV)</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setActiveTab('reportes');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F7F8FA] text-[#121212] font-medium text-left cursor-pointer"
                  >
                    <BarChart3 className="w-4 h-4 text-[#5B6573]" />
                    <span>Centro de reportes</span>
                  </button>
                  <div className="my-1 border-t border-[#E2E6EC]" />
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#FFFBEB] text-[#5B6573] hover:text-[#B45309] font-medium text-left cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#B45309]" />
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
                className="relative p-2 rounded-md bg-white hover:bg-[#F7F8FA] border border-[#CBD5E1] text-[#374151] hover:text-[#121212] transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {pendingDocsAlerts.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded bg-[#C81E1E] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {pendingDocsAlerts.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-lg border border-[#E2E6EC] shadow-sm overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#E2E6EC] flex items-center justify-between bg-[#F7F8FA]">
                    <span className="text-xs font-bold text-[#121212]">
                      Documentos pendientes ({pendingDocsAlerts.length})
                    </span>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab('inventario_documentos');
                      }}
                      className="text-[11px] font-semibold text-[#1464A5] hover:underline cursor-pointer"
                    >
                      Gestionar
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E6EC]">
                    {pendingDocsAlerts.length === 0 ? (
                      <div className="p-5 text-center text-xs text-[#5B6573]">
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
                          className="w-full px-4 py-2.5 text-left hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono font-bold text-[#004481]">{item.code}</span>
                            <span className="text-[#B45309] font-semibold">{item.status}</span>
                          </div>
                          <p className="text-xs font-semibold text-[#121212] truncate mt-0.5">{item.docName}</p>
                          <p className="text-[11px] text-[#5B6573] truncate">{item.applicant}</p>
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F8FA] border border-[#CBD5E1] text-xs font-semibold text-[#121212] transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-6 h-6 rounded bg-[#F0F5FA] text-[#004481] flex items-center justify-center font-bold shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden md:inline max-w-[120px] truncate">
                  {currentUser?.role === 'admin' ? 'Administrador' : currentUser?.name || 'Analista'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg border border-[#E2E6EC] shadow-sm p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-[#E2E6EC] mb-1">
                    <p className="font-bold text-[#121212] truncate">{currentUser?.name}</p>
                    <p className="text-[11px] text-[#5B6573] truncate">{currentUser?.roleTitle}</p>
                    <p className="text-[10px] text-[#6B7280] truncate mt-0.5">{currentUser?.agency}</p>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('usuarios');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F7F8FA] text-[#121212] font-medium text-left cursor-pointer"
                    >
                      <UserCog className="w-4 h-4 text-[#004481]" />
                      <span>Administrar usuarios y roles</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setActiveTab('configuracion');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F7F8FA] text-[#121212] font-medium text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-[#5B6573]" />
                    <span>Parámetros y auditoría ({auditLogs.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#FEF2F2] text-[#C81E1E] font-medium text-left mt-1 cursor-pointer"
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-white">
          {children}
        </main>
      </div>

      {/* MODAL: Copia de Seguridad y Respaldo (Exportar e Importar JSON) */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#072146]/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg border border-[#E2E6EC] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#E2E6EC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-[#F0F5FA] text-[#004481] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#121212]">Copias de Seguridad y Respaldo</h3>
                  <p className="text-[11px] text-[#5B6573]">Portabilidad y protección de expedientes en formato JSON</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  setBackupImportStatus(null);
                }}
                className="text-[#5B6573] hover:text-[#121212] p-1.5 rounded-md hover:bg-[#F7F8FA] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[#374151]">
              <div className="p-4 rounded-md border border-[#E2E6EC] bg-[#F7F8FA] flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-sm text-[#121212] block">Exportar respaldo completo</span>
                  <span className="text-[11px] text-[#5B6573] block mt-0.5">
                    Incluye {dossiers.length} expedientes, {financialRecords.length} análisis financieros y {auditLogs.length} registros de auditoría.
                  </span>
                </div>
                <button
                  onClick={exportBackupData}
                  className="px-4 py-2 bg-[#004481] hover:bg-[#072146] text-white font-semibold rounded-md flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-md border border-[#E2E6EC] bg-[#F7F8FA] space-y-2.5">
                <span className="font-bold text-sm text-[#121212] flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#004481]" />
                  <span>Restaurar desde archivo de respaldo</span>
                </span>
                <span className="text-[11px] text-[#5B6573] block">
                  Seleccione un archivo <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#E2E6EC]">.json</code> exportado previamente desde EVALÚA PERÚ:
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
                  className="w-full text-xs text-[#5B6573] file:mr-3 file:py-2 file:px-3.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#004481] file:text-white hover:file:bg-[#072146] cursor-pointer"
                />

                {backupImportStatus && (
                  <div
                    className={`p-3 rounded-md text-xs font-semibold ${
                      backupImportStatus.includes('Error')
                        ? 'bg-[#FEF2F2] text-[#C81E1E] border border-[#FECACA]'
                        : 'bg-[#ECFDF5] text-[#028448] border border-[#A7F3D0]'
                    }`}
                  >
                    {backupImportStatus}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 bg-[#F7F8FA] border-t border-[#E2E6EC] flex justify-end">
              <button
                onClick={() => {
                  setShowBackupModal(false);
                  setBackupImportStatus(null);
                }}
                className="px-4 py-2 bg-white border border-[#CBD5E1] hover:bg-[#F7F8FA] text-[#121212] rounded-md font-semibold text-xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#072146]/40 p-4">
          <div className="w-full max-w-sm bg-white border border-[#E2E6EC] rounded-lg p-6 space-y-4">
            <h4 className="text-base font-bold text-[#121212]">¿Restablecer datos de demostración?</h4>
            <p className="text-xs text-[#5B6573] leading-relaxed">
              Esta acción recargará los expedientes ficticios de demostración en soles (S/) y limpiará las modificaciones locales actuales.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-md border border-[#CBD5E1] bg-white text-xs font-semibold text-[#121212] hover:bg-[#F7F8FA] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-md bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors cursor-pointer"
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
