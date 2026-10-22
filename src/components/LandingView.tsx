import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  User,
  ChevronDown,
  Layers,
  TrendingUp,
  BellRing,
  CheckCircle2,
  FileSpreadsheet,
  LineChart,
  ClipboardList,
  FileText,
  ArrowRight,
  ShieldCheck,
  Building,
  HelpCircle,
  Globe,
  Lock,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ScoreRing } from './ui/ScoreRing';

interface LandingViewProps {
  onEnter: () => void;
  onEnterAsAdmin: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnter, onEnterAsAdmin }) => {
  const [activeSegment, setActiveSegment] = useState<'personas' | 'empresas'>('personas');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  // Sample dossiers for quick search in landing
  const quickSearchDossiers = [
    { id: '1', code: 'EXP-2025-001', name: 'María Elena Torres Vega', doc: 'DNI 43892011', type: 'Persona con Negocio', score: 743, status: 'Aprobado', amount: 'S/ 25,000' },
    { id: '2', code: 'EXP-2025-002', name: 'Carlos Alberto Mendoza Ruiz', doc: 'DNI 10293847', type: 'Persona Natural', score: 685, status: 'En Evaluación', amount: 'S/ 18,000' },
    { id: '3', code: 'EXP-2025-003', name: 'Distribuidora Los Andes S.A.C.', doc: 'RUC 20601234567', type: 'Empresa', score: 780, status: 'Desembolsado', amount: 'S/ 85,000' },
    { id: '4', code: 'EXP-2025-004', name: 'Lucía Fernández Paredes', doc: 'DNI 72910482', type: 'Persona con Negocio', score: 620, status: 'Observado', amount: 'S/ 12,000' },
  ];

  const filteredDossiers = searchQuery.trim() === ''
    ? quickSearchDossiers
    : quickSearchDossiers.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.doc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-[#FFD800] selection:text-slate-900">
      {/* 1. TOP UTILITY BAR (TransUnion exact replica: Dark Navy #003B56) */}
      <div className="bg-[#003B56] text-white text-[11px] font-bold tracking-wider py-2 px-4 sm:px-8 border-b border-white/10 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: • PERSONAL | BUSINESS */}
          <div className="flex items-center">
            <button
              onClick={() => setActiveSegment('personas')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer py-0.5 ${
                activeSegment === 'personas' ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {activeSegment === 'personas' ? (
                <span className="w-2 h-2 rounded-full bg-[#00D2D3] inline-block shadow-xs" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-transparent inline-block" />
              )}
              <span className="font-extrabold tracking-wider">PERSONAL</span>
            </button>

            <span className="h-3.5 w-px bg-white/25 mx-3.5" />

            <button
              onClick={() => setActiveSegment('empresas')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer py-0.5 ${
                activeSegment === 'empresas' ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {activeSegment === 'empresas' ? (
                <span className="w-2 h-2 rounded-full bg-[#00D2D3] inline-block shadow-xs" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-transparent inline-block" />
              )}
              <span className="font-extrabold tracking-wider">BUSINESS</span>
            </button>
          </div>

          {/* Right: 🔍 SEARCH | PERÚ | PE */}
          <div className="flex items-center text-white">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors cursor-pointer py-0.5 group"
            >
              <Search className="w-3.5 h-3.5 text-white group-hover:text-cyan-300 transition-colors" />
              <span className="font-extrabold tracking-wider">SEARCH</span>
            </button>

            <span className="h-3.5 w-px bg-white/25 mx-3.5" />

            <div className="flex items-center gap-1 font-extrabold text-white tracking-wider">
              <span>PERÚ | PE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Clean Pure White with Navy Navigation) */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 backdrop-blur-md bg-white/98 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo EVALÚA */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-3 group focus:outline-hidden">
              <img
                src="/assets/evalua-logo.png"
                alt="EVALÚA - Organiza la información. Evalúa mejor."
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
            </a>
          </div>

          {/* Centered Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-bold text-[#00263E]">
            {/* Gestión crediticia / Your Credit */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('gestion')}
                className="flex items-center gap-1 hover:text-[#0B4A8B] transition-colors cursor-pointer py-2"
              >
                <span>Gestión crediticia</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'gestion' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'gestion' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 mt-1 space-y-1 z-50">
                  <button
                    onClick={onEnter}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-evalua-sky hover:text-evalua-blue transition-colors cursor-pointer"
                  >
                    Expedientes y Solicitantes
                  </button>
                  <button
                    onClick={onEnter}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-evalua-sky hover:text-evalua-blue transition-colors cursor-pointer"
                  >
                    Análisis Financiero y Ratios
                  </button>
                  <button
                    onClick={onEnter}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-evalua-sky hover:text-evalua-blue transition-colors cursor-pointer"
                  >
                    Capacidad de Pago y Flujo
                  </button>
                </div>
              )}
            </div>

            {/* Educación */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('educacion')}
                className="flex items-center gap-1 hover:text-[#0B4A8B] transition-colors cursor-pointer py-2"
              >
                <span>Educación</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'educacion' ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === 'educacion' && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 mt-1 space-y-1 z-50">
                  <a
                    href="#beneficios"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-evalua-sky hover:text-evalua-blue"
                  >
                    Guía de evaluación de riesgos
                  </a>
                  <a
                    href="#funciones"
                    onClick={() => setOpenDropdown(null)}
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-evalua-sky hover:text-evalua-blue"
                  >
                    Cálculo de ratios de solvencia
                  </a>
                </div>
              )}
            </div>

            {/* Nosotros */}
            <a href="#funciones" className="hover:text-[#0B4A8B] transition-colors py-2">
              Nosotros
            </a>

            {/* Soporte */}
            <a href="#contacto" className="hover:text-[#0B4A8B] transition-colors py-2">
              Soporte crediticio
            </a>
          </nav>

          {/* Right Action Button: Only user Zonyu Kim */}
          <div className="flex items-center gap-3">
            <button
              onClick={onEnter}
              className="bg-[#FFD800] hover:bg-[#F2CD00] text-black font-extrabold text-sm px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
              title="Ingresar como Zonyu Kim"
            >
              <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-black" />
              </div>
              <span>Zonyu Kim</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION (Exact TransUnion Screenshot Match: Navy #003E5C, Arc Gauge, White Knob, Green 743 Badge) */}
      <section className="relative bg-[#003E5C] text-white overflow-hidden py-14 lg:py-20 border-b border-[#00314a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Zonyu Kim CTA Button */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 text-left space-y-6 z-10"
            >
              {/* Massive Bold Headline: "Credit confidence starts here" -> "La confianza crediticia empieza aquí" */}
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-white leading-[1.08]">
                La confianza crediticia<br />
                empieza aquí
              </h1>

              {/* Subtitle (Matching TransUnion 2-line rhythm with EVALÚA value proposition) */}
              <p className="text-lg sm:text-[19px] text-white/90 leading-relaxed max-w-xl font-normal">
                Reportes claros, puntajes de crédito precisos y expedientes estructurados para evaluar con agilidad, respaldo y total objetividad.
              </p>

              {/* Action Button: Dedicated Single User Access for Zonyu Kim */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-lg">
                <button
                  onClick={onEnter}
                  className="bg-[#FFD800] hover:bg-[#F2CD00] text-black font-extrabold text-base px-8 py-3.5 rounded-full shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.99] cursor-pointer inline-flex items-center justify-center gap-2.5"
                >
                  <User className="w-5 h-5" />
                  <span>Ingresar como Zonyu Kim</span>
                </button>
              </div>

              {/* Microtext */}
              <div className="pt-1 text-xs text-white/80 font-medium tracking-wide">
                <span>Sesión autorizada: Zonyu Kim · Administrador General</span>
              </div>
            </motion.div>

            {/* Right Column: Exact Circular Arc Gauge with White Knob, Lime Green 743 Badge & Smiling Photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-5 flex justify-center lg:justify-end relative"
            >
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[480px] lg:h-[480px] select-none">
                
                {/* SVG Gauge Arc: Orange to Green with White Knob (Faithful replica of screenshot) */}
                <svg
                  viewBox="0 0 500 500"
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                >
                  <defs>
                    <linearGradient id="transunionArcGrad" x1="0%" y1="100%" x2="80%" y2="0%">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="30%" stopColor="#EAB308" />
                      <stop offset="65%" stopColor="#84CC16" />
                      <stop offset="100%" stopColor="#22C55E" />
                    </linearGradient>
                    <filter id="knobShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
                    </filter>
                  </defs>

                  {/* Curving Arc Track: from lower-left (86, 414) up clockwise to top-right (366, 49) */}
                  <path
                    d="M 86 414 A 232 232 0 0 1 366 49"
                    fill="none"
                    stroke="url(#transunionArcGrad)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* White Slider Knob on the green section of the arc (~10:30 position) */}
                  <circle
                    cx="152"
                    cy="40"
                    r="15"
                    fill="#FFFFFF"
                    stroke="#F1F5F9"
                    strokeWidth="2.5"
                    filter="url(#knobShadow)"
                  />
                  <circle
                    cx="152"
                    cy="40"
                    r="4.5"
                    fill="#CBD5E1"
                    opacity="0.5"
                  />
                </svg>

                {/* Circular Masked Photo of person holding phone/laptop */}
                <div className="absolute inset-4 rounded-full overflow-hidden bg-white shadow-2xl z-0">
                  <img
                    src="/assets/hero.jpg"
                    alt="Evaluación crediticia transparente"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/evalua-logo.png';
                      target.className = 'w-3/4 h-auto object-contain p-8';
                    }}
                  />
                </div>

                {/* Score Pill / Circle: Exact Lime Green Circle "#78C93C" with Bold "743" on Left Edge */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="absolute -left-3 sm:-left-6 top-[32%] -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-[#78C93C] flex items-center justify-center shadow-2xl z-20"
                >
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black font-sans tracking-tight">
                    743
                  </span>
                </motion.div>

                {/* Ambient Decorative Glow behind the arc */}
                <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QUICK SEARCH MODAL (Triggered by Search in Top Bar) */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-[#003B56] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-300" />
                <span className="text-sm font-bold">Buscar Expediente o Solicitante</span>
              </div>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Box */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Escribe nombre, DNI, RUC o código de expediente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0B4A8B]"
                />
              </div>
            </div>

            {/* Results list */}
            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
              {filteredDossiers.length > 0 ? (
                filteredDossiers.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSearchModalOpen(false);
                      onEnter();
                    }}
                    className="p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#00263E] group-hover:text-[#0B4A8B]">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{item.doc}</span>
                        <span>·</span>
                        <span>{item.type}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">{item.amount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#78C93C]/20 text-[#2E7D32] font-black text-xs flex items-center justify-center">
                        {item.score}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0B4A8B] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No se encontraron expedientes con "{searchQuery}"
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Haz clic en cualquier cliente para ingresar y abrir su expediente</span>
              <button
                onClick={() => {
                  setSearchModalOpen(false);
                  onEnter();
                }}
                className="text-[#0B4A8B] font-bold hover:underline cursor-pointer"
              >
                Ver todos los expedientes →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECCIÓN A: "Beneficios para ti" (Fondo Blanco, 3 iconos en círculos) */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-evalua-sky text-evalua-blue px-3 py-1 rounded-full inline-block mb-3">
              Ventajas Competitivas
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-evalua-navy tracking-tight">
              Beneficios para ti
            </h2>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              Optimiza el flujo de trabajo de tu equipo de créditos y asesores de negocios con herramientas diseñadas para la precisión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Beneficio 1 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-evalua-sky border border-blue-200/60 text-evalua-blue flex items-center justify-center mb-6 shadow-xs">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-evalua-navy mb-2">
                Información ordenada en un solo lugar
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Expedientes centralizados por cliente con datos generales, estados financieros, balances y documentación de sustento sin recurrir a formatos dispersos.
              </p>
            </motion.div>

            {/* Beneficio 2 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-evalua-sky border border-blue-200/60 text-evalua-blue flex items-center justify-center mb-6 shadow-xs">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-evalua-navy mb-2">
                Evaluación rápida y objetiva
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Cálculos automáticos de flujo de caja, margen operativo, endeudamiento y capacidad de pago en soles (S/), distinguiendo datos declarados de verificados.
              </p>
            </motion.div>

            {/* Beneficio 3 */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-evalua-sky border border-blue-200/60 text-evalua-blue flex items-center justify-center mb-6 shadow-xs">
                <BellRing className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-evalua-navy mb-2">
                Seguimiento con alertas
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Control de estados del crédito (En evaluación, Aprobado, Observado, Desembolsado), bitácora de observaciones y avisos de documentos faltantes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN B: "Funciones clave" (Fondo Celeste #EEF5FB, Checks Verdes + Mockup) */}
      <section id="funciones" className="py-20 bg-evalua-sky border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Lista con checks verdes */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-white text-evalua-blue px-3 py-1 rounded-full inline-block border border-blue-200/70 shadow-2xs">
                Módulo Financiero Integral
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-evalua-navy tracking-tight">
                Funciones clave para asesores y comités
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Diseñado específicamente para el ecosistema financiero peruano, adaptándose a personas naturales, personas con negocio y empresas jurídicas.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: 'Expediente digital unificado por cliente',
                    desc: '10 pestañas estructuradas desde datos personales hasta informes ejecutivos descargables.',
                  },
                  {
                    title: 'Fórmulas financieras auditables en tiempo real',
                    desc: 'Balance de situación, ganancias y pérdidas, flujo de caja libre y ratio de cobertura de cuota.',
                  },
                  {
                    title: 'Documentación con control de respaldo',
                    desc: 'Distingue cifras sustentadas con boletas o fichas RUC frente a estimaciones del cliente.',
                  },
                  {
                    title: 'Historial de auditoría y reportes para impresión',
                    desc: 'Exportación a PDF y resumen ejecutivo formal para comités de crédito.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3.5 bg-white/70 p-3.5 rounded-xl border border-white">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-evalua-green flex items-center justify-center shrink-0 mt-0.5 font-black">
                      <CheckCircle2 className="w-4 h-4 text-evalua-green" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-evalua-navy">{item.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button variant="navy" size="md" onClick={onEnter}>
                  Probar funciones ahora →
                </Button>
              </div>
            </div>

            {/* Right: Mockup del Dashboard de EVALÚA */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-200/90 relative">
                {/* Mockup Window Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-evalua-green" />
                    <span className="text-xs font-bold text-slate-500 ml-2">Panel EVALÚA v2.5</span>
                  </div>
                  <span className="text-[11px] font-bold text-evalua-blue bg-evalua-sky px-2.5 py-0.5 rounded-full">
                    S/ Moneda Nacional
                  </span>
                </div>

                {/* Mockup Body Content */}
                <div className="mt-4 space-y-4">
                  {/* KPI Mini-cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Cartera Total</span>
                      <span className="text-sm sm:text-base font-extrabold text-evalua-navy">S/ 485,200</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacidad Pago</span>
                      <span className="text-sm sm:text-base font-extrabold text-evalua-green">68.4%</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">En Evaluación</span>
                      <span className="text-sm sm:text-base font-extrabold text-amber-600">8 Casos</span>
                    </div>
                  </div>

                  {/* Financial Evaluation Preview Card */}
                  <div className="bg-evalua-sky/60 p-4 rounded-2xl border border-blue-200/70 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-evalua-navy">Expediente: María Torres Vega</span>
                        <span className="text-[11px] text-slate-500 block">DNI: 43892011 · Persona con Negocio</span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-evalua-green border border-emerald-300">
                        Score 743 · Favorable
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-evalua-green h-full rounded-full" style={{ width: '78%' }} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      <div>Ingresos Netos: <strong>S/ 8,450 / mes</strong></div>
                      <div>Cuota Máxima: <strong>S/ 2,800 / mes</strong></div>
                    </div>
                  </div>

                  {/* Table Sample */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="bg-evalua-navy text-white px-3 py-2 font-bold flex justify-between">
                      <span>Últimas Solicitudes Registradas</span>
                      <span>Estado</span>
                    </div>
                    <div className="divide-y divide-slate-100 bg-white">
                      <div className="p-2.5 flex justify-between items-center">
                        <span className="font-semibold text-slate-800">EXP-2025-001 · Bodega San Juan</span>
                        <span className="text-[10px] font-bold text-evalua-green bg-emerald-50 px-2 py-0.5 rounded-full">Aprobado</span>
                      </div>
                      <div className="p-2.5 flex justify-between items-center">
                        <span className="font-semibold text-slate-800">EXP-2025-002 · Taller Metalmecánica</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Observado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN C: "Toma el control de tu gestión crediticia" (Fondo Blanco, 4 Tarjetas Blancas rounded-2xl) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-evalua-sky text-evalua-blue px-3 py-1 rounded-full inline-block mb-3">
              Módulos Operativos
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-evalua-navy tracking-tight">
              Toma el control de tu gestión crediticia
            </h2>
            <p className="mt-3 text-slate-600 text-base sm:text-lg">
              Accede a las herramientas de registro, análisis, seguimiento y emisión de informes estructurados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tarjeta 1: Nuevo expediente */}
            <Card hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-evalua-sky text-evalua-blue flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-evalua-navy mb-2">Nuevo expediente</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Registra datos del cliente, ingresos, gastos personales o del negocio y sustento formal en moneda nacional (S/).
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onEnter}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-evalua-blue hover:text-evalua-navy transition-colors cursor-pointer group"
                >
                  <span>Comenzar</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Card>

            {/* Tarjeta 2: Análisis financiero */}
            <Card hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-evalua-sky text-evalua-blue flex items-center justify-center mb-4">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-evalua-navy mb-2">Análisis financiero</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cálculo automático de balances, estados de ganancias y pérdidas, flujo de caja y capacidad real de pago.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onEnter}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-evalua-blue hover:text-evalua-navy transition-colors cursor-pointer group"
                >
                  <span>Comenzar</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Card>

            {/* Tarjeta 3: Seguimiento de solicitudes */}
            <Card hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-evalua-sky text-evalua-blue flex items-center justify-center mb-4">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-evalua-navy mb-2">Seguimiento de solicitudes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Traza cada etapa del crédito, agrega observaciones del asesor y programa recordatorios de subsanación.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onEnter}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-evalua-blue hover:text-evalua-navy transition-colors cursor-pointer group"
                >
                  <span>Comenzar</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Card>

            {/* Tarjeta 4: Reportes */}
            <Card hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-evalua-sky text-evalua-blue flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-evalua-navy mb-2">Reportes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Genera informes ejecutivos descargables en PDF listos para sustentar ante comités de riesgo y auditoría.
                </p>
              </div>
              <div className="pt-6">
                <button
                  onClick={onEnter}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-evalua-blue hover:text-evalua-navy transition-colors cursor-pointer group"
                >
                  <span>Comenzar</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN D: Banda Final de CTA (Azul Marino #00405F + Botón Pill Amarillo) */}
      <section className="bg-evalua-navy py-14 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Comienza a gestionar tu cartera con rigor y agilidad
            </h3>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Sin hojas de cálculo dispersas. Toda la evaluación crediticia en una plataforma segura y auditable.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={onEnter}
              className="text-slate-950 font-bold px-8 shadow-xl"
            >
              Ingresar como Zonyu Kim
            </Button>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN E: Footer Corporativo Completo */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Columna 1: Brand & Logo en tarjeta blanca */}
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-block bg-white p-3 rounded-2xl shadow-md">
                <img
                  src="/assets/evalua-logo.png"
                  alt="EVALÚA"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Información que impulsa decisiones.
              </p>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Plataforma tecnológica orientada a asesores de negocios, analistas de crédito y microfinancieras en el Perú.
              </p>
            </div>

            {/* Columna 2: Soluciones */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Soluciones</h4>
              <ul className="space-y-2">
                <li><button onClick={onEnter} className="hover:text-white transition-colors cursor-pointer">Persona Natural</button></li>
                <li><button onClick={onEnter} className="hover:text-white transition-colors cursor-pointer">Persona con Negocio</button></li>
                <li><button onClick={onEnter} className="hover:text-white transition-colors cursor-pointer">Micro y Pequeña Empresa</button></li>
                <li><button onClick={onEnter} className="hover:text-white transition-colors cursor-pointer">Evaluación Cualitativa</button></li>
              </ul>
            </div>

            {/* Columna 3: Empresa */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#beneficios" className="hover:text-white transition-colors">Nosotros</a></li>
                <li><a href="#funciones" className="hover:text-white transition-colors">Metodología</a></li>
                <li><a href="#funciones" className="hover:text-white transition-colors">Seguridad de Datos</a></li>
                <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            {/* Columna 4: Soporte y Legal */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-xs">Soporte & Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cumplimiento Regulatorio</a></li>
              </ul>
            </div>
          </div>

          {/* Legal Notice & Copyright */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-slate-500">
            <p className="max-w-3xl leading-relaxed text-[11px]">
              <strong>Aviso legal:</strong> EVALÚA es un software de gestión y organización de información financiera para apoyar la labor de evaluación. No aprueba ni otorga créditos, ni garantiza su desembolso. Las decisiones crediticias corresponden exclusivamente a las entidades y asesores facultados.
            </p>
            <p className="shrink-0 text-[11px]">
              © {new Date().getFullYear()} EVALÚA S.A.C. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
