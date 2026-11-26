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
  X,
  FileText
} from 'lucide-react';
import { Button } from './ui/Button';

interface LoginViewProps {
  onBackToLanding: () => void;
  defaultAdmin?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBackToLanding, defaultAdmin = false }) => {
  const { login } = useEvalua();

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

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center relative font-sans selection:bg-[#004481] selection:text-white">
      {/* Top Bar for Back Navigation */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F8FA] text-[#072146] border border-[#CBD5E1] text-xs font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al portal principal</span>
        </button>
      </div>

      {/* Split Screen Container */}
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 w-full">
        {/* LEFT COLUMN: Dark Institutional Navy #072146 */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#072146] text-white p-12 flex-col justify-between relative">
          {/* Top Brand Tag */}
          <div className="pt-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Plataforma de Gestión Crediticia · Huánuco 2026</span>
            </span>
          </div>

          {/* Center Graphic: Authentic Payment Capacity Indicator */}
          <div className="flex flex-col items-center justify-center my-auto py-8">
            <div className="w-64 h-64 rounded-full border-4 border-white/20 flex items-center justify-center bg-[#04152E] p-6 text-center">
              <div className="space-y-1.5 select-none">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Capacidad de Pago
                </span>
                <span className="block text-4xl font-bold text-white tracking-tight font-mono tabular-nums">
                  78.4%
                </span>
                <span className="block text-xs font-semibold text-emerald-300 pt-1">
                  Excedente S/ 2,450 / mes
                </span>
                <span className="block text-[11px] text-slate-400">
                  Cobertura sobre cuota propuesta
                </span>
              </div>
            </div>

            <div className="mt-8 text-center max-w-sm">
              <h3 className="text-lg font-bold tracking-tight text-white mb-1.5">
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

        {/* RIGHT COLUMN: Clean White Banking Form */}
        <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
          <div className="w-full max-w-md space-y-6">
            <div className="text-left">
              <img
                src="/assets/evalua-logo.png"
                alt="EVALÚA"
                className="h-10 sm:h-11 w-auto object-contain mb-5"
              />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#121212] tracking-tight">
                Iniciar sesión
              </h2>
              <p className="text-xs sm:text-sm text-[#5B6573] mt-1">
                Ingrese con sus credenciales institucionales de asesor o analista
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#C81E1E] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">
                  Correo o usuario institucional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zonyukimordonezcaqui@gmail.com"
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-[#D1D5DB] bg-[#F7F8FA] text-sm font-medium text-[#121212] placeholder:text-[#6B7280] focus:outline-hidden focus:bg-white focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/15 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#374151]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotPasswordModal(true);
                      setForgotSubmitted(false);
                    }}
                    className="text-xs font-semibold text-[#1464A5] hover:text-[#072146] hover:underline transition-colors cursor-pointer"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-[#D1D5DB] bg-[#F7F8FA] text-sm font-medium text-[#121212] placeholder:text-[#6B7280] focus:outline-hidden focus:bg-white focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/15 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#374151] select-none">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="rounded border-[#D1D5DB] text-[#004481] focus:ring-[#004481] w-4 h-4 mt-0.5"
                  />
                  <span>
                    Acepto el tratamiento de datos y declaro cumplir la{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-[#1464A5] font-semibold hover:underline cursor-pointer"
                    >
                      Ley N° 29733 de Protección de Datos Personales
                    </button>.
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#5B6573] select-none">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded border-[#D1D5DB] text-[#004481] focus:ring-[#004481] w-4 h-4"
                  />
                  <span>Recordar sesión en este equipo</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-6 rounded-md bg-[#004481] hover:bg-[#072146] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Ingresar a la plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
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
