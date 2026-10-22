import React, { useState } from 'react';
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
import { FinancialAnalysisView } from './components/FinancialAnalysisView';
import { FinancialAnalysisModule } from './components/FinancialAnalysisModule';
import { UsersView } from './components/UsersView';
import { ConfigView } from './components/ConfigView';
import { NewDossierWizardModal } from './components/NewDossierWizardModal';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { PrintApplicationModal } from './components/PrintApplicationModal';
import { CreditModuleIndependentView } from './components/CreditModuleIndependentView';

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
    dossiers,
    login
  } = useEvalua();

  const [inLanding, setInLanding] = useState(true);
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);

  // If no user is authenticated, show Landing or Login screen
  if (!currentUser) {
    if (inLanding) {
      return (
        <LandingView
          onEnter={() => {
            login('zonyukimordonezcaqui@gmail.com', '12346', true);
          }}
          onEnterAsAdmin={() => {
            login('zonyukimordonezcaqui@gmail.com', '12346', true);
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
      {/* Primary Financial Analysis Module */}
      {activeTab === 'registro_financiero' && <FinancialAnalysisModule />}

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

      {/* Fallback legacy tab routes */}
      {activeTab === 'inicio' && <ApplicationsView />}
      {activeTab === 'solicitantes' && <CreditModuleIndependentView moduleId="solicitante" />}
      {activeTab === 'analisis_financiero' && <FinancialAnalysisModule />}
      {activeTab === 'seguimiento' && <ApplicationsView />}
      {activeTab === 'documentos' && <CreditModuleIndependentView moduleId="inventario_documentos" />}
      {activeTab === 'observaciones' && <CreditModuleIndependentView moduleId="conclusion" />}
      {activeTab === 'reportes' && <ReportsView />}
      {activeTab === 'usuarios' && <UsersView />}
      {activeTab === 'configuracion' && <ConfigView />}

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
    <EvaluaProvider>
      <EvaluaApp />
    </EvaluaProvider>
  );
}
