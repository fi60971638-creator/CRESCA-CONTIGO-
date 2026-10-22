import React, { useState } from 'react';
import { useEvalua } from '../context/EvaluaContext';
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  UserCog,
  User,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { ScoreRing } from './ui/ScoreRing';

interface LoginViewProps {
  onBackToLanding: () => void;
  defaultAdmin?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBackToLanding, defaultAdmin = false }) => {
  const { login, users } = useEvalua();

  const [email, setEmail] = useState('zonyukimordonezcaqui@gmail.com');
  const [password, setPassword] = useState('12346');
  const [rememberSession, setRememberSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = login(email, password);
    if (!result.success) {
      setErrorMessage(result.error || 'El correo o la contraseña no son correctos.');
    }
  };

  const handleQuickLogin = (userEmail: string, userPass?: string) => {
    const passToUse = userPass || '12346';
    setEmail(userEmail);
    setPassword(passToUse);
    setErrorMessage(null);
    login(userEmail, passToUse);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative font-sans selection:bg-evalua-yellow selection:text-slate-950">
      {/* Top Bar for Back Navigation */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-evalua-navy shadow-xs border border-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al portal principal</span>
        </button>
      </div>

      {/* Split Screen Container */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 w-full">
        {/* LEFT COLUMN: Dark Navy #00405F with TransUnion Conic Ring Graphic */}
        <div className="hidden lg:flex lg:col-span-5 bg-evalua-navy text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-evalua-yellow" />
              <span>Acceso Seguro a la Red Financiera</span>
            </div>
          </div>

          {/* Center Graphic: Score Ring Gauge */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
            <ScoreRing
              score={743}
              minScore={300}
              maxScore={850}
              size="lg"
              showBadge={true}
              badgePosition="left"
              animate={true}
            >
              <div className="text-center p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Índice de Certeza
                </span>
                <span className="block text-3xl font-black text-evalua-navy mt-0.5">
                  743
                </span>
                <span className="inline-block mt-1 text-[11px] font-bold text-evalua-green bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Calificación Óptima
                </span>
              </div>
            </ScoreRing>

            <div className="mt-8 text-center max-w-sm">
              <h3 className="text-xl font-black tracking-tight text-white mb-2">
                Decisiones de crédito con sustento técnico
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Centraliza estados de resultados, balances y flujos de caja en soles (S/) con auditoría documental.
              </p>
            </div>
          </div>

          {/* Bottom Security Notes */}
          <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
            <span>Encriptación TLS 256-bit</span>
            <span>Normativa SBS / Perú</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean White Form with Yellow Pill CTA */}
        <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-md space-y-6">
            {/* Header: EVALÚA horizontal logo (40–48px) */}
            <div className="text-left">
              <img
                src="/assets/evalua-logo.png"
                alt="EVALÚA"
                className="h-11 sm:h-12 w-auto object-contain mb-5"
              />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-evalua-navy tracking-tight">
                Iniciar sesión
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Ingresa con tus credenciales asignadas por tu entidad
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Usuario o correo institucional
                </label>
                <div className="relative rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analista@evalua.pe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-evalua-blue focus:ring-2 focus:ring-evalua-blue/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotPasswordModal(true);
                      setForgotSubmitted(false);
                    }}
                    className="text-xs font-semibold text-evalua-blue hover:text-evalua-navy hover:underline transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative rounded-xl">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-evalua-blue focus:ring-2 focus:ring-evalua-blue/20 transition-all"
                  />
                </div>
              </div>

              {/* Recordar sesión */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded border-slate-300 text-evalua-blue focus:ring-evalua-blue w-4 h-4"
                  />
                  <span>Recordar sesión en este equipo</span>
                </label>
              </div>

              {/* Botón Pill Amarillo (#FFD800) */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-evalua-yellow hover:bg-[#ebd000] text-slate-950 font-extrabold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer mt-2"
              >
                <span>Ingresar a la plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Acceso Rápido: Solo usuario Zonyu Kim */}
            <div className="pt-6 border-t border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Usuario Autorizado
              </p>
              <div className="grid grid-cols-1 gap-2">
                {users
                  .filter((u) => u.email === 'zonyukimordonezcaqui@gmail.com' || u.name.toLowerCase().includes('zonyu'))
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u.email, u.password || '12346')}
                      className="w-full p-3 rounded-2xl bg-evalua-sky/80 hover:bg-evalua-sky border border-blue-200/80 hover:border-evalua-blue transition-all flex items-center justify-between text-left group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-blue-200 text-evalua-navy flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs">
                          <UserCog className="w-5 h-5 text-evalua-navy" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-evalua-navy group-hover:text-evalua-blue transition-colors">
                            {u.name}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {u.email} · {u.roleTitle}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-evalua-blue group-hover:translate-x-1 transition-transform pr-2">
                        Entrar →
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-evalua-navy">¿Olvidaste tu contraseña?</h3>
            {forgotSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-evalua-green text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-evalua-green mx-auto" />
                <p className="font-bold text-sm text-slate-800">Instrucciones enviadas</p>
                <p className="text-slate-600">
                  Se ha enviado un enlace de restablecimiento seguro a tu correo institucional.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="mt-3 px-5 py-2 bg-evalua-navy text-white rounded-full text-xs font-bold hover:bg-evalua-navy/90"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSubmitted(true);
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-slate-600">
                  Ingresa tu correo institucional registrado para recibir las instrucciones de restablecimiento:
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="analista@evalua.pe"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-evalua-blue/20 focus:border-evalua-blue"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                  >
                    Enviar instrucciones
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
