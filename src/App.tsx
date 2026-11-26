import React, { useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { EvaluaProvider, useEvalua } from './context/EvaluaContext';
import { LandingView } from './components/LandingView';
import { LoginView } from './components/LoginView';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { ApplicantsView } from './components/ApplicantsView';
import { ApplicationsView } from './components/ApplicationsView';
import { FollowUpView } from './components/FollowUpView';
import { DocumentsView } from './components/DocumentsView';
import { ObservationsView } from './components/ObservationsView';
import { ReportsView } from './components/ReportsView';
import { FinancialAnalysisModule } from './components/FinancialAnalysisModule';
import { UsersView } from './components/UsersView';
import { ConfigView } from './components/ConfigView';
import { NewDossierWizardModal } from './components/NewDossierWizardModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { PrintApplicationModal } from './components/PrintApplicationModal';
import { CreditModuleIndependentView } from './components/CreditModuleIndependentView';
import { ExpedientesView } from './components/ExpedientesView';
import { ReferencesView } from './components/ReferencesView';

const EvaluaApp: React.FC = () => {
  const {
    currentUser,
    activeTab,
    selectedDossierId,
    setSelectedDossierId,
    modalInitialTab,
    isPrintModalOpen,
    setIsPrintModalOpen,
    isNewDossierModalOpen,
    setIsNewDossierModalOpen,
    dossiers
  } = useEvalua();

  const [inLanding, setInLanding] = useState(true);
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);

  // If no user is authenticated, show Landing or Login screen
  if (!currentUser) {
    if (inLanding) {
      return (
        <LandingView
          onEnter={() => {
            setLoginAsAdmin(false);
            setInLanding(false);
          }}
          onEnterAsAdmin={() => {
            setLoginAsAdmin(true);
            setInLanding(false);
          }}
        />
      );
    }
    return (
      <LoginView
        onBackToLanding={() => setInLanding(true)}
        defaultAdmin={loginAsAdmin}
      />
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Panel principal & Expedientes */}
          {(activeTab === 'panel_principal' || activeTab === 'inicio') && <DashboardView />}
          {activeTab === 'expedientes' && <ExpedientesView />}

          {/* Primary Financial Analysis Module */}
          {(activeTab === 'registro_financiero' || activeTab === 'analisis_financiero') && (
            <FinancialAnalysisModule />
          )}

          {/* Tab Routes - Solicitud & 8 Independent Credit Modules */}
          {activeTab === 'solicitudes' && <ApplicationsView />}
          {activeTab === 'solicitante' && <CreditModuleIndependentView moduleId="solicitante" />}
          {activeTab === 'negocio' && <CreditModuleIndependentView moduleId="negocio" />}
          {activeTab === 'credito' && <CreditModuleIndependentView moduleId="credito" />}
          {activeTab === 'ingresos_gastos' && <CreditModuleIndependentView moduleId="ingresos_gastos" />}
          {activeTab === 'balance' && <CreditModuleIndependentView moduleId="balance" />}
          {activeTab === 'capacidad' && <CreditModuleIndependentView moduleId="capacidad" />}
          {activeTab === 'inventario_documentos' && <CreditModuleIndependentView moduleId="inventario_documentos" />}
          {activeTab === 'conclusion' && <CreditModuleIndependentView moduleId="conclusion" />}

          {/* Referencias, Observaciones, Seguimiento, Reportes y Administración */}
          {activeTab === 'referencias' && <ReferencesView />}
          {activeTab === 'observaciones' && <ObservationsView />}
          {activeTab === 'seguimiento' && <FollowUpView />}
          {activeTab === 'solicitantes' && <ApplicantsView />}
          {activeTab === 'documentos' && <DocumentsView />}
          {activeTab === 'reportes' && <ReportsView />}
          {activeTab === 'usuarios' && <UsersView />}
          {activeTab === 'configuracion' && <ConfigView />}
        </motion.div>
      </AnimatePresence>

      {/* 8-Step Wizard Modal for New Credit Application Dossier */}
      <NewDossierWizardModal
        isOpen={isNewDossierModalOpen}
        onClose={() => setIsNewDossierModalOpen(false)}
      />

      {/* 360-Degree Comprehensive Digital Dossier Detail Modal */}
      <ApplicationDetailModal
        dossierId={selectedDossierId}
        initialTab={modalInitialTab}
        onClose={() => setSelectedDossierId(null)}
        onOpenPrint={() => setIsPrintModalOpen(true)}
      />

      {/* Formal Printable Assessment Dossier for Credit Committee */}
      <PrintApplicationModal
        dossierId={selectedDossierId || dossiers[0]?.id || null}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </Layout>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <EvaluaProvider>
        <EvaluaApp />
      </EvaluaProvider>
    </MotionConfig>
  );
}
