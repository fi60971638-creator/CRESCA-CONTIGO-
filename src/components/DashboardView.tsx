import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useEvalua } from '../context/EvaluaContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Search,
  Eye,
  Printer,
  FolderKanban,
  Upload,
  ShieldCheck,
  Plus,
  TrendingUp,
  AlertTriangle,
  Calendar,
  FileCheck2,
  Layers,
  Activity
} from 'lucide-react';
import { ApplicationStatus, CreditEvaluationDossier } from '../types/evalua';
import { AnimatedNumber } from './dashboard/AnimatedNumber';
import { CreditPortfolioIllustration } from './dashboard/CreditPortfolioIllustration';

type ChartMode = 'evolucion' | 'capacidad' | 'sector';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    dossiers,
    auditLogs,
    setActiveTab,
    setSelectedDossierId,
    setIsPrintModalOpen,
    setIsNewDossierModalOpen
  } = useEvalua();

  const shouldReduce = useReducedMotion();

  const [periodFilter, setPeriodFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [tableSearch, setTableSearch] = useState('');
  const [chartMode, setChartMode] = useState<ChartMode>('evolucion');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [activeDonutStatus, setActiveDonutStatus] = useState<string | null>(null);

  // Extract available years dynamically from dossiers
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(dossiers.map((d) => d.createdAt.slice(0, 4)).filter(Boolean))
    ).sort((a, b) => b.localeCompare(a));
    return years;
  }, [dossiers]);

  // Period-filtered dossiers drive KPIs and charts smoothly
  const periodDossiers = useMemo(() => {
    if (periodFilter === 'todos') return dossiers;
    return dossiers.filter((d) => d.createdAt.startsWith(periodFilter));
  }, [dossiers, periodFilter]);

  const totalDossiers = periodDossiers.length;
  const countRegistered = periodDossiers.filter((d) => d.status === 'registrada').length;
  const countInEvaluation = periodDossiers.filter(
    (d) => d.status === 'en_evaluacion' || d.status === 'en_verificacion'
  ).length;
  const countDocPendingDossiers = periodDossiers.filter(
    (d) => d.status === 'documentacion_pendiente'
  ).length;
  const countPendingIndividualDocs = periodDossiers.reduce(
    (sum, d) =>
      sum + d.documents.filter((doc) => doc.status === 'Pendiente' || doc.status === 'Observado').length,
    0
  );
  const countVerifiedDocs = periodDossiers.reduce(
    (sum, d) => sum + d.documents.filter((doc) => doc.status === 'Verificado').length,
    0
  );
  const totalDocsCount = periodDossiers.reduce((sum, d) => sum + d.documents.length, 0);
  const docsVerificationPct = totalDocsCount > 0 ? (countVerifiedDocs / totalDocsCount) * 100 : 100;

  const countFinalized = periodDossiers.filter((d) => d.status === 'finalizada').length;
  const totalAmount = periodDossiers.reduce((sum, d) => sum + d.terms.requestedAmount, 0);
  const finalizedAmount = periodDossiers
    .filter((d) => d.status === 'finalizada')
    .reduce((sum, d) => sum + d.terms.requestedAmount, 0);

  const evalAndRegCount = countInEvaluation + countRegistered;
  const evalPortfolioPct = totalDossiers > 0 ? (evalAndRegCount / totalDossiers) * 100 : 0;
  const finalizedPortfolioPct = totalDossiers > 0 ? (countFinalized / totalDossiers) * 100 : 0;

  const donutSegments = [
    {
      key: 'en_evaluacion',
      label: 'En evaluación',
      count: evalAndRegCount,
      color: '#004481',
      pct: totalDossiers > 0 ? (evalAndRegCount / totalDossiers) * 100 : 0
    },
    {
      key: 'documentacion_pendiente',
      label: 'Doc. pendiente',
      count: countDocPendingDossiers,
      color: '#B45309',
      pct: totalDossiers > 0 ? (countDocPendingDossiers / totalDossiers) * 100 : 0
    },
    {
      key: 'finalizada',
      label: 'Finalizada',
      count: countFinalized,
      color: '#028448',
      pct: totalDossiers > 0 ? (countFinalized / totalDossiers) * 100 : 0
    }
  ];

  // Chronological chart points sorted by date
  const chartPoints = useMemo(() => {
    const sorted = [...periodDossiers].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return sorted.map((d) => ({
      id: d.id,
      code: d.code,
      label: d.personal.firstNames.split(' ')[0] + ' ' + d.personal.paternalSurname,
      date: d.createdAt,
      amount: d.terms.requestedAmount,
      installment: d.terms.proposedInstallment,
      availableFlow: d.paymentCapacity.availableFlow,
      coveragePct:
        d.terms.proposedInstallment > 0
          ? Math.min(180, (d.paymentCapacity.availableFlow / d.terms.proposedInstallment) * 100)
          : 100,
      status: d.status
    }));
  }, [periodDossiers]);

  const maxChartAmount = useMemo(
    () => Math.max(...chartPoints.map((p) => p.amount), 10000),
    [chartPoints]
  );

  // Sector breakdown
  const sectorColors = ['#072146', '#004481', '#1464A5', '#028448', '#5B6573'];
  const sectorStats = useMemo(() => {
    const grouped: Record<string, { count: number; amount: number }> = {};
    for (const d of periodDossiers) {
      const sec = d.business.sector || 'Otros';
      if (!grouped[sec]) grouped[sec] = { count: 0, amount: 0 };
      grouped[sec].count += 1;
      grouped[sec].amount += d.terms.requestedAmount;
    }

    return Object.entries(grouped).map(([sector, data], idx) => ({
      sector,
      count: data.count,
      amount: data.amount,
      sharePct: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
      color: sectorColors[idx % sectorColors.length]
    }));
  }, [periodDossiers, totalAmount]);

  const maxSectorAmount = Math.max(...sectorStats.map((s) => s.amount), 1);

  // Filtered dossiers for the interactive queue/table
  const filteredDossiers = useMemo(() => {
    return periodDossiers.filter((d) => {
      const q = tableSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.code.toLowerCase().includes(q) ||
        d.personal.fullName.toLowerCase().includes(q) ||
        d.personal.documentNumber.toLowerCase().includes(q) ||
        d.business.businessName.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (statusFilter === 'pendientes') {
        return d.status !== 'finalizada';
      }
      if (statusFilter === 'en_evaluacion') {
        return d.status === 'en_evaluacion' || d.status === 'en_verificacion' || d.status === 'registrada';
      }
      if (statusFilter !== 'todas' && d.status !== statusFilter) return false;
      return true;
    });
  }, [periodDossiers, tableSearch, statusFilter]);

  const recentActivity = auditLogs.slice(0, 6);

  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date());
  }, []);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'registrada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#374151] whitespace-nowrap">
            <FileText className="w-3 h-3 text-[#6B7280]" />
            <span>Registrada</span>
          </span>
        );
      case 'en_evaluacion':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#004481] whitespace-nowrap">
            <Activity className="w-3 h-3 text-[#004481]" />
            <span>En evaluación</span>
          </span>
        );
      case 'documentacion_pendiente':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B45309] whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 text-[#B45309]" />
            <span>Doc. pendiente</span>
          </span>
        );
      case 'en_verificacion':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1464A5] whitespace-nowrap">
            <Clock className="w-3 h-3 text-[#1464A5]" />
            <span>En verificación</span>
          </span>
        );
      case 'finalizada':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#028448] whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-[#028448]" />
            <span>Finalizada</span>
          </span>
        );
    }
  };

  // Donut calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let cumulativePct = 0;

  const activeDonutInfo = useMemo(() => {
    if (!activeDonutStatus) return null;
    return donutSegments.find((s) => s.key === activeDonutStatus) || null;
  }, [activeDonutStatus, donutSegments]);

  // SVG Evolution Area/Line Geometry
  const svgWidth = 560;
  const svgHeight = 200;
  const padX = 44;
  const padTop = 24;
  const padBottom = 34;
  const usableW = svgWidth - padX * 2;
  const usableH = svgHeight - padTop - padBottom;

  const plottedCoords = useMemo(() => {
    if (chartPoints.length === 0) return [];
    return chartPoints.map((pt, idx) => {
      const x =
        chartPoints.length === 1
          ? padX + usableW / 2
          : padX + (idx / (chartPoints.length - 1)) * usableW;
      const y = padTop + usableH - (pt.amount / maxChartAmount) * usableH;
      const barH = Math.max(10, (pt.amount / maxChartAmount) * usableH);
      return { ...pt, x, y, barH };
    });
  }, [chartPoints, maxChartAmount, usableW, usableH]);

  const linePathD = useMemo(() => {
    if (plottedCoords.length === 0) return '';
    if (plottedCoords.length === 1) {
      return `M ${padX} ${plottedCoords[0].y} L ${svgWidth - padX} ${plottedCoords[0].y}`;
    }
    return plottedCoords.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cpX = (prev.x + pt.x) / 2;
      return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [plottedCoords]);

  const areaPathD = useMemo(() => {
    if (!linePathD || plottedCoords.length === 0) return '';
    const baseY = padTop + usableH;
    const firstX = plottedCoords.length === 1 ? padX : plottedCoords[0].x;
    const lastX = plottedCoords.length === 1 ? svgWidth - padX : plottedCoords[plottedCoords.length - 1].x;
    return `${linePathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [linePathD, plottedCoords, usableH]);

  const getDocCompletion = (d: CreditEvaluationDossier) => {
    const total = d.documents.length || 1;
    const verified = d.documents.filter((doc) => doc.status === 'Verificado').length;
    return { verified, total, pct: Math.round((verified / total) * 100) };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduce ? false : 'hidden'}
      animate="visible"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. HERO WELCOME BANNER WITH VECTOR ILLUSTRATION & INTERACTIVE PERIOD FILTERS */}
      <motion.section
        variants={itemVariants}
        className="relative rounded-xl border border-[#E2E6EC] bg-gradient-to-br from-[#F7F9FC] via-white to-[#F0F5FA] overflow-hidden p-5 sm:p-6 lg:p-7"
      >
        {/* Subtle geometric ledger dots background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6573] font-medium">
              <span className="inline-flex items-center gap-1.5 text-[#004481] font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedToday}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentUser?.agency || 'Agencia Principal - Huánuco'}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-mono text-[#121212] font-semibold">
                {totalDossiers} exp. activos
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#1464A5]">
                Hola, {currentUser?.name || 'Asesor Principal'}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#072146] tracking-tight mt-0.5 text-balance">
                Panel de gestión crediticia
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6573] mt-1.5 max-w-xl leading-relaxed">
                Monitorea tu cartera en soles (S/), capacidad de pago y documentación de sustento en tiempo real.
              </p>
            </div>

            {/* Interactive Controls Row: Period Filter + Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div
                role="group"
                aria-label="Filtrar por período"
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#E9EEF5] border border-[#D6DFEB]"
              >
                <button
                  type="button"
                  onClick={() => setPeriodFilter('todos')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    periodFilter === 'todos'
                      ? 'bg-white text-[#072146] shadow-xs'
                      : 'text-[#5B6573] hover:text-[#121212]'
                  }`}
                >
                  Todos
                </button>
                {availableYears.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setPeriodFilter(yr)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer tabular-nums whitespace-nowrap ${
                      periodFilter === yr
                        ? 'bg-white text-[#072146] shadow-xs'
                        : 'text-[#5B6573] hover:text-[#121212]'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>

              <motion.button
                type="button"
                whileHover={shouldReduce ? undefined : { y: -1 }}
                whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                onClick={() => setIsNewDossierModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#004481] hover:bg-[#072146] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo expediente</span>
              </motion.button>

              <motion.button
                type="button"
                whileHover={shouldReduce ? undefined : { y: -1 }}
                whileTap={shouldReduce ? undefined : { scale: 0.98 }}
                onClick={() => setActiveTab('registro_financiero')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F7F8FA] text-[#072146] border border-[#CBD5E1] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#028448]" />
                <span>Análisis financiero</span>
              </motion.button>
            </div>
          </div>

          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
            <CreditPortfolioIllustration
              activeCount={totalDossiers}
              completionPct={docsVerificationPct}
            />
          </div>
        </div>
      </motion.section>

      {/* 2. 4 ANIMATED KPI SUMMARY CARDS */}
      <motion.section
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {/* KPI 1: Expedientes registrados */}
        <motion.button
          type="button"
          whileHover={shouldReduce ? undefined : { y: -3 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setActiveTab('expedientes')}
          className="group text-left p-5 rounded-xl bg-white border border-[#E2E6EC] hover:border-[#004481] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="text-xs font-semibold text-[#5B6573]">Expedientes registrados</span>
            <span className="w-8 h-8 rounded-lg bg-[#F0F5FA] text-[#004481] flex items-center justify-center group-hover:bg-[#004481] group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="text-3xl font-extrabold text-[#121212] tracking-tight">
              <AnimatedNumber value={totalDossiers} />
            </span>

            {/* Mini animated SVG sparkline */}
            <svg width="72" height="26" viewBox="0 0 72 26" className="shrink-0" aria-hidden="true">
              <motion.path
                d="M 2 21 L 16 17 L 30 19 L 44 10 L 58 13 L 70 4"
                fill="none"
                stroke="#004481"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={shouldReduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F1F4F8] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#1464A5] font-mono tabular-nums">
              <AnimatedNumber value={totalAmount} prefix="S/ " decimals={0} />
            </span>
            <span className="text-[#5B6573]">en cartera</span>
          </div>
        </motion.button>

        {/* KPI 2: En evaluación */}
        <motion.button
          type="button"
          whileHover={shouldReduce ? undefined : { y: -3 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setStatusFilter('en_evaluacion')}
          className="group text-left p-5 rounded-xl bg-white border border-[#E2E6EC] hover:border-[#1464A5] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="text-xs font-semibold text-[#5B6573]">En evaluación activa</span>
            <span className="w-8 h-8 rounded-lg bg-[#F0F5FA] text-[#1464A5] flex items-center justify-center group-hover:bg-[#1464A5] group-hover:text-white transition-colors">
              <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold text-[#121212] tracking-tight">
              <AnimatedNumber value={evalAndRegCount} />
            </span>
            <span className="text-xs font-mono font-semibold text-[#1464A5] tabular-nums">
              <AnimatedNumber value={evalPortfolioPct} suffix="%" decimals={0} />
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-[#F1F3F6] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#1464A5]"
                initial={shouldReduce ? false : { scaleX: 0 }}
                animate={{ scaleX: Math.max(0.05, evalPortfolioPct / 100) }}
                style={{ originX: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-[11px] font-medium text-[#5B6573] block">
              Participación sobre cartera
            </span>
          </div>
        </motion.button>

        {/* KPI 3: Documentos pendientes */}
        <motion.button
          type="button"
          whileHover={shouldReduce ? undefined : { y: -3 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setActiveTab('inventario_documentos')}
          className="group text-left p-5 rounded-xl bg-white border border-[#E2E6EC] hover:border-[#B45309] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="text-xs font-semibold text-[#5B6573]">Documentos pendientes</span>
            <span className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#B45309] flex items-center justify-center group-hover:bg-[#B45309] group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold text-[#121212] tracking-tight">
              <AnimatedNumber value={countPendingIndividualDocs} />
            </span>
            <span className="text-xs font-mono font-semibold text-[#B45309] tabular-nums">
              {countDocPendingDossiers} exp.
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-[#F1F3F6] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#B45309]"
                initial={shouldReduce ? false : { scaleX: 0 }}
                animate={{ scaleX: Math.max(0.06, docsVerificationPct / 100) }}
                style={{ originX: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-[11px] font-medium text-[#B45309] block tabular-nums">
              {docsVerificationPct.toFixed(0)}% de sustento verificado
            </span>
          </div>
        </motion.button>

        {/* KPI 4: Solicitudes finalizadas */}
        <motion.button
          type="button"
          whileHover={shouldReduce ? undefined : { y: -3 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setActiveTab('conclusion')}
          className="group text-left p-5 rounded-xl bg-white border border-[#E2E6EC] hover:border-[#028448] transition-colors cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="text-xs font-semibold text-[#5B6573]">Solicitudes finalizadas</span>
            <span className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#028448] flex items-center justify-center group-hover:bg-[#028448] group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-3xl font-extrabold text-[#121212] tracking-tight">
              <AnimatedNumber value={countFinalized} />
            </span>
            <span className="text-xs font-mono font-semibold text-[#028448] tabular-nums">
              <AnimatedNumber value={finalizedPortfolioPct} suffix="%" decimals={0} />
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F1F4F8] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#028448] font-mono tabular-nums">
              <AnimatedNumber value={finalizedAmount} prefix="S/ " decimals={0} />
            </span>
            <span className="text-[#5B6573]">listas PDF</span>
          </div>
        </motion.button>
      </motion.section>

      {/* 3. DYNAMIC CHARTS SECTION (12-COL GRID) */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* MAIN CHART (8 COLS): Evolution / Payment Capacity / Sector */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E6EC] p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E6EC]">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#004481]" />
                <h2 className="text-sm font-bold text-[#121212]">
                  {chartMode === 'evolucion'
                    ? 'Evolución y flujo de solicitudes (S/)'
                    : chartMode === 'capacidad'
                    ? 'Capacidad de pago vs. Monto solicitado'
                    : 'Distribución por sector económico'}
                </h2>
              </div>
              <p className="text-[11px] text-[#5B6573] mt-0.5">
                {chartMode === 'evolucion'
                  ? 'Pasa el cursor sobre los puntos para inspeccionar monto, cuota y flujo disponible'
                  : chartMode === 'capacidad'
                  ? 'Cobertura mensual del flujo disponible frente a la cuota propuesta'
                  : 'Participación en soles (S/) según actividad del solicitante'}
              </p>
            </div>

            {/* Interactive Chart Mode Switcher */}
            <div
              role="group"
              aria-label="Tipo de gráfico"
              className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#F7F8FA] border border-[#E2E6EC] self-start sm:self-auto"
            >
              <button
                type="button"
                onClick={() => setChartMode('evolucion')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  chartMode === 'evolucion'
                    ? 'bg-[#004481] text-white'
                    : 'text-[#5B6573] hover:text-[#121212]'
                }`}
              >
                Evolución
              </button>
              <button
                type="button"
                onClick={() => setChartMode('capacidad')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  chartMode === 'capacidad'
                    ? 'bg-[#004481] text-white'
                    : 'text-[#5B6573] hover:text-[#121212]'
                }`}
              >
                Capacidad
              </button>
              <button
                type="button"
                onClick={() => setChartMode('sector')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  chartMode === 'sector'
                    ? 'bg-[#004481] text-white'
                    : 'text-[#5B6573] hover:text-[#121212]'
                }`}
              >
                Sectores
              </button>
            </div>
          </div>

          <div className="pt-4 flex-1 flex flex-col justify-center min-h-[245px]">
            <AnimatePresence mode="wait">
              {chartPoints.length === 0 ? (
                <motion.div
                  key="empty-chart"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 text-center text-xs text-[#5B6573]"
                >
                  No existen expedientes en el período seleccionado para graficar.
                </motion.div>
              ) : chartMode === 'evolucion' ? (
                <motion.div
                  key={`chart-evol-${periodFilter}`}
                  initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="relative w-full"
                >
                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredPointIdx !== null && plottedCoords[hoveredPointIdx] && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.14 }}
                        className="mb-2 px-3 py-2 rounded-lg bg-[#072146] text-white text-xs flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#8BD04F]">
                            {plottedCoords[hoveredPointIdx].code}
                          </span>
                          <span className="text-slate-200 font-semibold">
                            {plottedCoords[hoveredPointIdx].label}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-300 font-mono">
                            {plottedCoords[hoveredPointIdx].date}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono tabular-nums">
                          <span>
                            Solicitado:{' '}
                            <strong className="text-white">
                              S/ {plottedCoords[hoveredPointIdx].amount.toLocaleString('es-PE')}
                            </strong>
                          </span>
                          <span className="text-emerald-300">
                            Flujo disp.: S/{' '}
                            {plottedCoords[hoveredPointIdx].availableFlow.toLocaleString('es-PE')}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-56 overflow-visible"
                    role="img"
                    aria-label="Gráfico de evolución de montos solicitados por expediente"
                  >
                    <defs>
                      <linearGradient id="evalChartArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#004481" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#004481" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Reference Gridlines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                      const yPos = padTop + usableH * (1 - step);
                      const val = Math.round(maxChartAmount * step);
                      return (
                        <g key={step}>
                          <line
                            x1={padX}
                            y1={yPos}
                            x2={svgWidth - padX}
                            y2={yPos}
                            stroke="#E2E6EC"
                            strokeDasharray={step === 0 ? undefined : '3 4'}
                          />
                          <text
                            x={padX - 8}
                            y={yPos + 3}
                            textAnchor="end"
                            fill="#6B7280"
                            fontSize="9"
                            fontFamily="IBM Plex Mono, monospace"
                          >
                            {val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Background Subtle Bars per Dossier */}
                    {plottedCoords.map((pt, idx) => (
                      <motion.rect
                        key={`bar-${pt.id}`}
                        x={pt.x - 14}
                        y={padTop + usableH - pt.barH}
                        width="28"
                        height={pt.barH}
                        rx="4"
                        fill={hoveredPointIdx === idx ? '#1464A5' : '#E6EEF7'}
                        initial={shouldReduce ? false : { scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        style={{ originY: `${padTop + usableH}px`, transformBox: 'fill-box' }}
                        transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ))}

                    {/* Area Gradient Fill */}
                    <motion.path
                      d={areaPathD}
                      fill="url(#evalChartArea)"
                      initial={shouldReduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.55, delay: 0.15 }}
                    />

                    {/* Main Animated Bezier Curve */}
                    <motion.path
                      d={linePathD}
                      fill="none"
                      stroke="#004481"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      initial={shouldReduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    />

                    {/* Interactive Data Nodes */}
                    {plottedCoords.map((pt, idx) => {
                      const isHovered = hoveredPointIdx === idx;
                      return (
                        <g
                          key={pt.id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPointIdx(idx)}
                          onMouseLeave={() => setHoveredPointIdx(null)}
                          onClick={() => setSelectedDossierId(pt.id)}
                        >
                          {isHovered && (
                            <line
                              x1={pt.x}
                              y1={padTop}
                              x2={pt.x}
                              y2={padTop + usableH}
                              stroke="#1464A5"
                              strokeDasharray="3 3"
                            />
                          )}
                          <motion.circle
                            cx={pt.x}
                            cy={pt.y}
                            r={isHovered ? 6.5 : 4.5}
                            fill={pt.status === 'finalizada' ? '#028448' : '#004481'}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            initial={shouldReduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.25 + idx * 0.08 }}
                          />
                          <text
                            x={pt.x}
                            y={padTop + usableH + 16}
                            textAnchor="middle"
                            fill={isHovered ? '#072146' : '#5B6573'}
                            fontWeight={isHovered ? '700' : '500'}
                            fontSize="9.5"
                            fontFamily="Plus Jakarta Sans, sans-serif"
                          >
                            {pt.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>
              ) : chartMode === 'capacidad' ? (
                <motion.div
                  key={`chart-cap-${periodFilter}`}
                  initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-3.5"
                >
                  {chartPoints.map((pt, idx) => {
                    const coverage = Math.round(pt.coveragePct);
                    const healthy = coverage >= 115;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setSelectedDossierId(pt.id)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-[#F7F8FA] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-[#004481]">{pt.code}</span>
                            <span className="font-semibold text-[#121212] truncate group-hover:text-[#004481]">
                              {pt.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono tabular-nums shrink-0 text-[11px]">
                            <span className="text-[#5B6573]">
                              Cuota: S/ {pt.installment.toLocaleString('es-PE')}
                            </span>
                            <span className={healthy ? 'text-[#028448] font-bold' : 'text-[#B45309] font-bold'}>
                              Cobertura {coverage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#F1F3F6] overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${healthy ? 'bg-[#028448]' : 'bg-[#004481]'}`}
                            initial={shouldReduce ? false : { scaleX: 0 }}
                            animate={{ scaleX: Math.min(1, coverage / 180) }}
                            style={{ originX: 0 }}
                            transition={{
                              duration: 0.6,
                              delay: idx * 0.08,
                              ease: [0.16, 1, 0.3, 1]
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key={`chart-sector-${periodFilter}`}
                  initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-4"
                >
                  {sectorStats.map((item, idx) => {
                    const ratio = Math.max(0.08, item.amount / maxSectorAmount);
                    return (
                      <div key={item.sector} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="font-semibold text-[#121212] truncate">{item.sector}</span>
                          <span className="font-mono font-semibold text-[#374151] tabular-nums shrink-0">
                            S/ {item.amount.toLocaleString('es-PE')} · {item.count} exp. ({item.sharePct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#F1F3F6] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color, originX: 0 }}
                            initial={shouldReduce ? false : { scaleX: 0 }}
                            animate={{ scaleX: ratio }}
                            transition={{
                              duration: 0.65,
                              delay: idx * 0.08,
                              ease: [0.16, 1, 0.3, 1]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* INTERACTIVE DONUT DISTRIBUTION (4 COLS) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E6EC] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E6EC]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#004481]" />
              <h2 className="text-sm font-bold text-[#121212]">Solicitudes por estado</h2>
            </div>
            {statusFilter !== 'todas' && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('todas');
                  setActiveDonutStatus(null);
                }}
                className="text-[11px] font-semibold text-[#1464A5] hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex flex-col items-center justify-center gap-5 my-auto py-4">
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 132 132" className="w-full h-full -rotate-90">
                <circle
                  cx="66"
                  cy="66"
                  r={radius}
                  fill="none"
                  stroke="#F1F3F6"
                  strokeWidth="15"
                />
                {donutSegments.map((seg, idx) => {
                  const dash = (seg.pct / 100) * circumference;
                  const offset = (cumulativePct / 100) * circumference;
                  cumulativePct += seg.pct;
                  if (seg.pct <= 0) return null;
                  const isActive = activeDonutStatus === seg.key || statusFilter === seg.key;
                  return (
                    <motion.circle
                      key={seg.key}
                      cx="66"
                      cy="66"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={isActive ? 18 : 15}
                      strokeLinecap="butt"
                      strokeDashoffset={-offset}
                      className="cursor-pointer transition-all"
                      initial={shouldReduce ? false : { strokeDasharray: `0 ${circumference}` }}
                      animate={{ strokeDasharray: `${dash} ${circumference}` }}
                      transition={{
                        duration: 0.75,
                        delay: idx * 0.1,
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      onMouseEnter={() => setActiveDonutStatus(seg.key)}
                      onMouseLeave={() => setActiveDonutStatus(null)}
                      onClick={() =>
                        setStatusFilter((prev) => (prev === seg.key ? 'todas' : seg.key))
                      }
                    />
                  );
                })}
              </svg>

              {/* Center Animated Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDonutInfo ? activeDonutInfo.key : 'total'}
                    initial={shouldReduce ? false : { opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.16 }}
                  >
                    <span className="text-2xl font-extrabold text-[#121212] tabular-nums block leading-none">
                      {activeDonutInfo ? activeDonutInfo.count : totalDossiers}
                    </span>
                    <span className="text-[11px] font-semibold text-[#5B6573] block mt-1 truncate max-w-[90px]">
                      {activeDonutInfo ? activeDonutInfo.label : 'Total cartera'}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Interactive Legend Buttons */}
            <div className="space-y-1.5 w-full text-xs">
              {donutSegments.map((seg) => {
                const selected = statusFilter === seg.key;
                return (
                  <button
                    key={seg.key}
                    type="button"
                    onMouseEnter={() => setActiveDonutStatus(seg.key)}
                    onMouseLeave={() => setActiveDonutStatus(null)}
                    onClick={() =>
                      setStatusFilter((prev) => (prev === seg.key ? 'todas' : seg.key))
                    }
                    className={`w-full px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer border ${
                      selected
                        ? 'bg-[#F0F5FA] border-[#004481]/40'
                        : 'bg-transparent border-transparent hover:bg-[#F7F8FA]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: seg.color }}
                      />
                      <span className="text-[#374151] font-semibold truncate">{seg.label}</span>
                    </div>
                    <span className="font-mono font-bold text-[#121212] tabular-nums shrink-0">
                      {seg.count} ({seg.pct.toFixed(0)}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. PENDING / ACTIVE APPLICATIONS QUEUE + RECENT ACTIVITY (12-COL GRID) */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT (7 COLS): Solicitudes recientes y pendientes */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E6EC] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#E2E6EC] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#121212]">
                  Solicitudes y expedientes pendientes
                </h2>
                <p className="text-[11px] text-[#5B6573] mt-0.5">
                  Seguimiento de documentación y avance hacia evaluación final
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('solicitudes')}
                className="text-xs font-semibold text-[#1464A5] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <span>Ver todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Interactive Status Segmented Tabs + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div
                role="group"
                aria-label="Filtrar solicitudes por estado"
                className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F7F8FA] border border-[#E2E6EC]"
              >
                {[
                  { key: 'todas', label: 'Todas' },
                  { key: 'pendientes', label: 'Pendientes' },
                  { key: 'en_evaluacion', label: 'En evaluación' },
                  { key: 'documentacion_pendiente', label: 'Doc. pendiente' },
                  { key: 'finalizada', label: 'Finalizadas' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      statusFilter === tab.key
                        ? 'bg-white text-[#072146] shadow-xs'
                        : 'text-[#5B6573] hover:text-[#121212]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Buscar DNI, nombre o código..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-[#F7F8FA] border border-[#D1D5DB] text-xs text-[#121212] placeholder:text-[#6B7280] focus:outline-none focus:bg-white focus:border-[#004481] w-full sm:w-52"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#E2E6EC] flex-1">
            <AnimatePresence mode="popLayout">
              {filteredDossiers.length === 0 ? (
                <motion.div
                  key="empty-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 px-5 text-center text-[#5B6573] text-xs space-y-2.5"
                >
                  <p className="font-semibold">No hay expedientes que coincidan con el filtro.</p>
                  <button
                    type="button"
                    onClick={() => setIsNewDossierModalOpen(true)}
                    className="px-4 py-2 rounded-lg bg-[#004481] hover:bg-[#072146] text-white font-semibold text-xs cursor-pointer"
                  >
                    + Registrar expediente
                  </button>
                </motion.div>
              ) : (
                filteredDossiers.map((d) => {
                  const docStat = getDocCompletion(d);
                  return (
                    <motion.div
                      layout
                      key={d.id}
                      initial={shouldReduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedDossierId(d.id)}
                      className="p-4 sm:px-5 hover:bg-[#F7F9FC] transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-[#004481]">{d.code}</span>
                          <span aria-hidden="true" className="text-[#CBD5E1]">
                            ·
                          </span>
                          <span className="font-semibold text-[#121212] group-hover:text-[#004481] transition-colors truncate">
                            {d.personal.fullName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5B6573]">
                          <span className="truncate">{d.business.businessName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {d.personal.documentType}: {d.personal.documentNumber}
                          </span>
                        </div>
                        {/* Document Progress Bar */}
                        <div className="flex items-center gap-2 pt-1 max-w-xs">
                          <div className="flex-1 h-1.5 rounded-full bg-[#F1F3F6] overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                docStat.pct === 100 ? 'bg-[#028448]' : 'bg-[#004481]'
                              }`}
                              initial={shouldReduce ? false : { scaleX: 0 }}
                              animate={{ scaleX: Math.max(0.05, docStat.pct / 100) }}
                              style={{ originX: 0 }}
                              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-[#5B6573] tabular-nums shrink-0">
                            {docStat.verified}/{docStat.total} docs
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="text-left sm:text-right">
                          <div className="text-xs font-mono font-bold text-[#121212] tabular-nums">
                            S/ {d.terms.requestedAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="mt-0.5">{getStatusBadge(d.status)}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDossierId(d.id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#004481] text-[#004481] hover:text-white border border-[#CBD5E1] hover:border-[#004481] font-semibold text-xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDossierId(d.id);
                              setIsPrintModalOpen(true);
                            }}
                            title="Imprimir / Exportar PDF"
                            className="p-1.5 rounded-lg border border-[#CBD5E1] text-[#5B6573] hover:text-[#121212] hover:bg-[#F7F8FA] bg-white transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT (5 COLS): Actividad reciente */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E6EC] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E6EC] mb-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#004481]" />
                <h2 className="text-base font-bold text-[#121212]">Actividad reciente</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('seguimiento')}
                className="text-xs font-semibold text-[#1464A5] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver bitácora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#F1F4F8]">
              {recentActivity.length === 0 ? (
                <div className="py-10 text-center text-xs text-[#5B6573]">
                  Sin movimientos recientes en la bitácora.
                </div>
              ) : (
                recentActivity.map((log, idx) => {
                  const IconComp = [FileCheck2, CheckCircle2, Upload, Clock][idx % 4];
                  return (
                    <motion.div
                      key={log.id}
                      initial={shouldReduce ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className="py-3 flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#F0F5FA] border border-[#E2E6EC] text-[#004481] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#121212] leading-snug">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#5B6573] mt-0.5">
                            <span className="truncate">{log.userName}</span>
                            {log.targetCode && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-[#004481]">{log.targetCode}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#6B7280] shrink-0 tabular-nums mt-0.5">
                        {log.timestamp.split(' ')[0]}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Jump Footer */}
          <div className="mt-4 pt-3.5 border-t border-[#E2E6EC] flex items-center justify-between gap-2 text-xs">
            <span className="text-[#5B6573]">
              Total registros auditados: <strong className="text-[#121212] tabular-nums">{auditLogs.length}</strong>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('reportes')}
              className="font-semibold text-[#004481] hover:underline cursor-pointer"
            >
              Centro de reportes →
            </button>
          </div>
        </div>
      </motion.section>

      {/* Institutional Support Disclaimer */}
      <motion.div
        variants={itemVariants}
        className="pt-4 border-t border-[#E2E6EC] flex items-start gap-2.5 text-xs text-[#5B6573]"
      >
        <ShieldCheck className="w-4 h-4 text-[#004481] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#121212]">Consideración operativa:</strong> EVALÚA PERÚ organiza, calcula y documenta información crediticia en soles (S/) como soporte para el analista; la decisión crediticia final corresponde a las entidades autorizadas.
        </p>
      </motion.div>
    </motion.div>
  );
};
