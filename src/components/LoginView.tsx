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
  User,
  Info,
  X,
  FileText,
  KeyRound
} from 'lucide-react';
import { Button } from './ui/Button';

interface LoginViewProps {
  onBackToLanding: () => void;
  defaultAdmin?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBackToLanding, defaultAdmin = false }) => {
  const { login, users } = useEvalua();

  // Inputs are clean and empty by default (no hardcoded passwords or personal email)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!consentAccepted) {
      setErrorMessage('Debe aceptar el consentimiento para tratamiento de datos personales (Ley N° 29733) para continuar.');
      return;
    }

    const result = login(email, password, defaultAdmin);
    if (!result.success) {
      setErrorMessage(result.error || 'Credenciales no válidas.');
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative font-sans selection:bg-evalua-yellow selection:text-slate-950">
      {/* Top Bar for Back Navigation */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-evalua-navy shadow-xs border border-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al portal principal</span>
        </button>
      </div>

      {/* Split Screen Container */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 w-full">
        {/* LEFT COLUMN: Dark Navy #00405F with Financial Capacity Gauge */}
        <div className="hidden lg:flex lg:col-span-5 bg-evalua-navy text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Tag */}
          <div className="relative z-10 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-evalua-yellow" />
              <span>Prototipo de Gestión Crediticia · Huánuco 2026</span>
            </div>
          </div>

          {/* Center Graphic: Authentic Payment Capacity Gauge (Not a fake bureau score) */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
            <div className="relative w-64 h-64 rounded-full border-8 border-slate-700/60 flex items-center justify-center bg-slate-950/60 shadow-2xl p-6 text-center">
              {/* Outer indicator track */}
              <div
                className="absolute inset-0 rounded-full border-8 border-transparent border-t-emerald-400 border-r-emerald-400 pointer-events-none"
                style={{ transform: 'rotate(45deg)' }}
              />

              <div className="space-y-1.5 select-none">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Capacidad de Pago
                </span>
                <span className="block text-4xl font-extrabold text-white tracking-tight font-mono">
                  78.4%
                </span>
                <span className="inline-block text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  Excedente S/ 2,450 / mes
                </span>
                <span className="block text-[10px] text-slate-400 pt-1">
                  Cobertura sobre cuota propuesta
                </span>
              </div>
            </div>

            <div className="mt-8 text-center max-w-sm">
              <h3 className="text-lg font-extrabold tracking-tight text-white mb-1.5">
                Organización objetiva de la información
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                EVALÚA apoya al asesor en el ordenamiento contable y cálculo de capacidad de pago. No emite scores crediticios de centrales de riesgo ni aprueba créditos.
              </p>
            </div>
          </div>

          {/* Bottom Compliance Notes */}
          <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-cyan-300 hover:text-white underline cursor-pointer"
            >
              Ley N° 29733 (Datos Personales)
            </button>
            <span>Sede Huánuco · 2026</span>
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
                className="h-11 sm:h-12 w-auto object-contain mb-4"
              />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-evalua-navy tracking-tight">
                Iniciar sesión
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Ingrese con sus credenciales institucionales de asesor o analista
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
                  Correo o usuario institucional
                </label>
                <div className="relative rounded-xl">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@evalua.pe"
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
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative rounded-xl">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-evalua-blue focus:ring-2 focus:ring-evalua-blue/20 transition-all"
                  />
                </div>
              </div>

              {/* Consentimiento Ley 29733 */}
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="rounded border-slate-300 text-evalua-blue focus:ring-evalua-blue w-4 h-4 mt-0.5"
                  />
                  <span>
                    Acepto el tratamiento de datos y declaro cumplir la{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-evalua-blue font-bold hover:underline cursor-pointer"
                    >
                      Ley N° 29733 de Protección de Datos Personales
                    </button>.
                  </span>
                </label>

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

            {/* Cuentas de evaluación para pruebas del evaluador / docente */}
            <div className="pt-5 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Cuentas Demo para Evaluación Académica:
                </p>
                <span className="text-[10px] text-slate-400">Clic para rellenar</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => fillDemoAccount(u.email, u.password || 'Evaluacion2026!Hco')}
                    className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-evalua-sky border border-slate-200 text-left transition-colors flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-bold text-slate-800 group-hover:text-evalua-blue block">
                        {u.name} ({u.roleTitle})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {u.email}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-evalua-blue group-hover:underline">
                      Usar cuenta →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Política de Privacidad y Tratamiento de Datos (Ley N° 29733) */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-evalua-navy text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-evalua-yellow" />
                <h3 className="text-sm font-bold">
                  Política de Privacidad y Tratamiento de Datos (Ley N° 29733)
                </h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-white/70 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-medium">
                <strong>Aviso de Cumplimiento Normativo (Perú):</strong> La plataforma EVALÚA está diseñada como una herramienta de apoyo analítico para la estructuración y cálculo de expedientes económicos, sujeta a los principios de legalidad, consentimiento, finalidad, proporcionalidad y seguridad establecidos en la <strong>Ley N° 29733 (Ley de Protección de Datos Personales)</strong> y su Reglamento (D.S. 003-2013-JUS).
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">1. Finalidad del Tratamiento</h4>
                <p>
                  Los datos económicos, identificatorios y societarios registrados en EVALÚA son utilizados exclusivamente para realizar análisis cuantitativo de balances, estados de ganancias y pérdidas, flujo de caja libre y capacidad de pago del solicitante.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. Alcance del Prototipo y Almacenamiento Local</h4>
                <p>
                  En esta versión de prototipo funcional, la información se almacena localmente en el navegador del usuario autorizado y puede exportarse como copia de seguridad JSON. EVALÚA no comparte ni comercializa datos personales con terceros no autorizados.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. Distinción entre Datos Declarados y Verificados</h4>
                <p>
                  Conforme a los estándares éticos de auditoría, las cifras ingresadas por el cliente o asesor se registran como datos declarados y requieren documentación física o digital contrastable para ser catalogadas como verificadas.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">4. Ejercicio de Derechos ARCO</h4>
                <p>
                  El titular de los datos personales puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) comunicándose con la administración de EVALÚA a través del correo institucional <code>contacto@evalua.pe</code>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">5. Delimitación de Responsabilidad Crediticia</h4>
                <p>
                  EVALÚA no es una entidad financiera ni una central privada de información de riesgos (CEPIR). El sistema organiza y procesa fórmulas contables; la decisión final sobre el otorgamiento de financiamiento corresponde exclusivamente a los comités o entidades facultadas.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setConsentAccepted(true);
                  setShowPrivacyModal(false);
                }}
              >
                Comprendido y Aceptado
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-evalua-navy">Restablecimiento de Contraseña</h3>
            {forgotSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-evalua-green text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-evalua-green mx-auto" />
                <p className="font-bold text-sm text-slate-800">Solicitud registrada</p>
                <p className="text-slate-600">
                  Si la cuenta existe en el sistema institucional, el administrador de seguridad restablecerá las credenciales de acceso.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="mt-3 px-5 py-2 bg-evalua-navy text-white rounded-full text-xs font-bold hover:bg-evalua-navy/90 cursor-pointer"
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
                  Ingrese su correo institucional registrado para solicitar la clave de recuperación:
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
                    className="px-4 py-2 text-slate-500 font-bold hover:text-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                  >
                    Enviar solicitud
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
