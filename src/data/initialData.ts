import {
  User,
  CreditEvaluationDossier,
  AuditLog,
  DocumentControlItem
} from '../types/evalua';
import {
  calculateIncomeTotals,
  calculateCostOfSales,
  calculateBusinessExpenses,
  calculateFamilyExpenses,
  calculateIncomeStatement,
  calculateBalanceSheet,
  calculateTotalObligations,
  calculateCashFlow,
  calculatePaymentCapacity,
  calculateFinancialRatios
} from '../utils/financialCalculations';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-zonyu',
    name: 'Zonyu Kim',
    email: 'zonyukimordonezcaqui@gmail.com',
    password: '12346',
    role: 'admin',
    roleTitle: 'Administrador General & Analista Senior',
    agency: 'Sede Central & Agencia Principal - Lima',
    phone: '987-654-321',
    active: true,
    createdAt: '2024-01-10'
  }
];

export const STANDARD_DOCUMENTS_TEMPLATE: DocumentControlItem[] = [
  { id: 'doc-1', name: 'DNI del Titular (Ambas caras)', documentType: 'DNI', status: 'Verificado', fileName: 'dni_titular_anverso_reverso.pdf', fileSize: '1.2 MB', uploadedAt: '2024-09-02', observations: 'DNI vigente y legible' },
  { id: 'doc-2', name: 'Recibo de Servicios (Luz / Agua)', documentType: 'Sustento de ingresos', status: 'Verificado', fileName: 'recibo_luz_agosto2024.pdf', fileSize: '850 KB', uploadedAt: '2024-09-03', observations: 'Domicilio coincide con dirección declarada' },
  { id: 'doc-3', name: 'Ficha RUC / Licencia de Funcionamiento', documentType: 'Documentación del negocio', status: 'Verificado', fileName: 'ficha_ruc_activa.pdf', fileSize: '620 KB', uploadedAt: '2024-09-03', observations: 'Estado activo, condición habido' },
  { id: 'doc-4', name: 'Cuaderno / Registro de Ventas y Compras', documentType: 'Sustento de ingresos', status: 'Verificado', fileName: 'cuaderno_ventas_3meses.pdf', fileSize: '3.4 MB', uploadedAt: '2024-09-04', observations: 'Cotejado físicamente en visita' },
  { id: 'doc-5', name: 'Facturas / Boletas de Compras a Proveedores', documentType: 'Documentación del negocio', status: 'Verificado', fileName: 'boletas_proveedores_makro.pdf', fileSize: '2.1 MB', uploadedAt: '2024-09-05', observations: 'Facturas de los últimos 30 días' },
  { id: 'doc-6', name: 'Fotos de Visita de Campo al Negocio', documentType: 'Documentación del negocio', status: 'Verificado', fileName: 'panel_fotografico_visita.pdf', fileSize: '4.8 MB', uploadedAt: '2024-09-06', observations: '3 tomas de inventario, anaqueles y fachada' },
  { id: 'doc-7', name: 'Título de Propiedad / Contrato de Alquiler', documentType: 'Documentación patrimonial', status: 'Verificado', fileName: 'contrato_alquiler_notariado.pdf', fileSize: '1.9 MB', uploadedAt: '2024-09-06', observations: 'Vigente hasta Diciembre 2025' }
];

// 1. Solicitante Juan Pérez López (Demostración solicitada)
const juanObligations = [
  {
    id: 'obl-1',
    entityName: 'Caja Municipal de Huancayo',
    creditType: 'Microempresa',
    originalAmount: 8000,
    currentBalance: 3500,
    monthlyInstallment: 520,
    totalInstallments: 18,
    paidInstallments: 11,
    pendingInstallments: 7,
    dueDate: '2024-09-20',
    status: 'Al día' as const,
    observations: 'Pagos puntuales en ventanilla'
  },
  {
    id: 'obl-2',
    entityName: 'Banco de Crédito del Perú (BCP)',
    creditType: 'Tarjeta de Crédito',
    originalAmount: 2500,
    currentBalance: 600,
    monthlyInstallment: 180,
    totalInstallments: 12,
    paidInstallments: 8,
    pendingInstallments: 4,
    dueDate: '2024-09-25',
    status: 'Al día' as const,
    observations: 'Uso comercial moderado'
  }
];

const juanIncome = calculateIncomeTotals(5000, 0, 0, 0, 0, 0);
const juanCostOfSales = calculateCostOfSales(5000, 1500, 0, 100, 0, 0);
const juanBusinessExpenses = calculateBusinessExpenses(juanCostOfSales.grossProfit, 300, 150, 80, 0, 100, 0, 0, 0, 70);
const juanFamilyExpenses = calculateFamilyExpenses(900, 0, 300, 150, 150, 120, 80, 0);
const juanTotalObligations = calculateTotalObligations(juanObligations); // 700

// Total egresos mensuales operativos y familiares (Costo + Gastos Negocio + Gastos Familiares)
const juanTotalOperatingAndFamilyExpenses =
  juanCostOfSales.totalCostOfSales +
  juanBusinessExpenses.totalBusinessExpenses +
  juanFamilyExpenses.totalFamilyExpenses; // 1600 + 700 + 1700 = 4000

const juanIncomeStatement = calculateIncomeStatement(
  juanIncome.monthlySales,
  juanCostOfSales.totalCostOfSales,
  juanBusinessExpenses.totalBusinessExpenses,
  0,
  0,
  juanFamilyExpenses.totalFamilyExpenses,
  juanTotalObligations
);

const juanBalanceSheet = calculateBalanceSheet(
  1200, 800, 18000, 1500, 0, // Current Assets
  0, 65000, 0, 12000, 8000, 3500, 0, // Non-Current Assets
  juanTotalObligations, 2100, 0, // Current Liab
  4100, 0 // Non-Current Liab
);

const juanCashFlow = calculateCashFlow(
  juanIncome.monthlySales, 0, 0, 0,
  juanCostOfSales.totalCostOfSales, juanBusinessExpenses.totalBusinessExpenses, juanFamilyExpenses.totalFamilyExpenses, juanTotalObligations, 0
);

const juanPaymentCapacity = calculatePaymentCapacity(
  juanIncome.totalMonthlyIncome,
  juanTotalOperatingAndFamilyExpenses,
  juanTotalObligations,
  600 // Cuota propuesta para S/ 10,000 a 18 meses
);

const juanRatios = calculateFinancialRatios(
  juanBalanceSheet.totalAssets,
  juanBalanceSheet.totalLiabilities,
  juanIncome.totalMonthlyIncome,
  juanTotalObligations,
  juanPaymentCapacity.availableFlow
);

export const INITIAL_DOSSIERS: CreditEvaluationDossier[] = [
  {
    id: 'dos-001',
    code: 'EXP-2024-0842',
    status: 'en_evaluacion',
    createdAt: '2024-09-05',
    updatedAt: '2024-09-10',
    assignedAnalystId: 'usr-1',
    assignedAnalystName: 'Carlos Méndez Salazar',
    assignedAnalystRole: 'Analista de Crédito Senior',
    agency: 'Agencia Principal - Lima Centro',

    personal: {
      firstNames: 'Juan',
      paternalSurname: 'Pérez',
      maternalSurname: 'López',
      fullName: 'Juan Pérez López',
      documentType: 'DNI',
      documentNumber: '41892015',
      birthDate: '1986-04-12',
      age: 38,
      maritalStatus: 'Casado(a)',
      dependentsCount: 2,
      homeAddress: 'Av. Las Palmeras 450',
      district: 'Los Olivos',
      province: 'Lima',
      department: 'Lima',
      phone: '984-512-309',
      email: 'bodega.perez@gmail.com'
    },

    business: {
      businessName: 'Bodega y Abarrotes "Don Juan"',
      activityType: 'Comercio Minorista de Abarrotes y Bebidas',
      sector: 'Comercio',
      businessAddress: 'Av. Las Palmeras 450 (Local en 1er piso de vivienda propia)',
      operatingTimeYears: 6,
      operatingTimeMonths: 3,
      businessType: 'Propio',
      employeesCount: 1,
      formality: 'RUS (Régimen Único Simplificado)',
      activityDescription: 'Comercialización diaria de abarrotes, bebidas, lácteos, embutidos y artículos de aseo para el hogar.'
    },

    terms: {
      creditProduct: 'Microcrédito Capital de Trabajo',
      requestedAmount: 10000,
      termMonths: 18,
      paymentFrequency: 'Mensual',
      estimatedPaymentDate: '2024-10-15',
      destination: 'Capital de trabajo',
      destinationDescription: 'Compra de mercadería al por mayor (abarrotes de alta rotación) para abastecimiento de campaña.',
      proposedInstallment: 600
    },

    income: juanIncome,
    costOfSales: juanCostOfSales,
    businessExpenses: juanBusinessExpenses,
    familyExpenses: juanFamilyExpenses,
    incomeStatement: juanIncomeStatement,
    balanceSheet: juanBalanceSheet,
    obligations: juanObligations,
    cashFlow: juanCashFlow,
    paymentCapacity: juanPaymentCapacity,
    ratios: juanRatios,

    inventory: [
      { id: 'inv-1', productName: 'Arroz Superior por sacos de 50kg', quantity: 15, unitCost: 140, totalCostValue: 2100, sellingPrice: 175, observations: 'Alta rotación semanal' },
      { id: 'inv-2', productName: 'Azúcar Rubia sacos de 50kg', quantity: 10, unitCost: 160, totalCostValue: 1600, sellingPrice: 195, observations: 'Stock de 15 días' },
      { id: 'inv-3', productName: 'Aceite Vegetal caja x 12 botellas 1L', quantity: 20, unitCost: 85, totalCostValue: 1700, sellingPrice: 108, observations: 'Marcas Primor y Cil' },
      { id: 'inv-4', productName: 'Leche evaporada caja x 48 tarros', quantity: 12, unitCost: 150, totalCostValue: 1800, sellingPrice: 182, observations: 'Gloria Azul' },
      { id: 'inv-5', productName: 'Abarrotes variados (fideos, atún, menestras)', quantity: 1, unitCost: 10800, totalCostValue: 10800, sellingPrice: 13500, observations: 'Inventario exhibido en anaqueles' }
    ],

    accountsReceivable: [
      { id: 'ar-1', clientName: 'Comedor Popular Santa Rosa', concept: 'Fiado quincenal abarrotes', amount: 850, dueDate: '2024-09-15', status: 'Pendiente', observations: 'Cliente cumplido' },
      { id: 'ar-2', clientName: 'Vecinos de la cuadra', concept: 'Consumos menores corrientes', amount: 650, dueDate: '2024-09-30', status: 'Pendiente' }
    ],

    accountsPayable: [
      { id: 'ap-1', supplierName: 'Distribuidora Mayorista Lima S.A.C.', concept: 'Factura crédito a 15 días mercadería', amount: 2100, dueDate: '2024-09-22', status: 'Pendiente' }
    ],

    references: [
      { id: 'ref-1', referenceType: 'Proveedor', name: 'Distribuidora Mayorista Lima S.A.C.', phone: '981-223-456', relationship: 'Proveedor de Abarrotes', contactDate: '2024-09-06', verificationResult: 'Favorable', observations: 'Línea de crédito comercial de S/ 3,000 que cumple puntualmente cada 15 días.' },
      { id: 'ref-2', referenceType: 'Vecinal', name: 'Manuel Arana Salazar', phone: '974-112-983', relationship: 'Presidente de Junta Vecinal', contactDate: '2024-09-06', verificationResult: 'Favorable', observations: 'Confirma que el negocio opera de manera continua desde hace más de 6 años.' }
    ],

    visitVerification: {
      visitDate: '2024-09-06',
      addressVisited: 'Av. Las Palmeras 450, Los Olivos',
      personContacted: 'Juan Pérez López (Titular) y cónyuge',
      informationVerified: 'Se verificó local comercial propio en primer piso de vivienda familiar de 2 pisos material noble. Anaqueles abastecidos, 2 vitrinas refrigeradas y cuaderno de ventas al día.',
      observations: 'Negocio con buena afluencia peatonal, frente a parque vecinal.',
      verifiedBy: 'Carlos Méndez Salazar'
    },

    documents: STANDARD_DOCUMENTS_TEMPLATE,

    qualitative: {
      activityExperience: 'Más de 8 años de experiencia en el rubro de comercio minorista y abarrotes. Conoce a sus proveedores y clientes de la zona.',
      businessStability: 'Local comercial en vivienda familiar propia con 6 años continuos de operación en el mismo punto de venta.',
      businessOrganization: 'Maneja cuaderno de ventas y compras diarias. Cuenta con POS para pagos con tarjeta y transferencias Yape/Plin.',
      referencesSummary: 'Referencias comerciales y vecinales 100% favorables sin incidencias negativas.',
      visitSummary: 'Visita realizada satisfactoriamente, corroborando inventario valorizado en aprox. S/ 18,000.',
      analystComments: 'El solicitante presenta flujo de caja estable y excedente operativo suficiente para cubrir la cuota solicitada de S/ 600.',
      analystConclusion: 'De acuerdo con la información registrada y la documentación presentada, se deja constancia de los principales aspectos observados durante la evaluación para sustento en comité de créditos.',
      finalObservations: 'Expediente estructurado conforme a las políticas de evaluación de la institución.'
    },

    timeline: [
      { id: 'tl-1', date: '2024-09-05', time: '10:30', status: 'registrada', responsibleName: 'Carlos Méndez Salazar', responsibleRole: 'Analista de Crédito', observation: 'Registro inicial de la solicitud y ficha socioeconómica.', nextAction: 'Programar visita de campo' },
      { id: 'tl-2', date: '2024-09-06', time: '15:00', status: 'en_verificacion', responsibleName: 'Carlos Méndez Salazar', responsibleRole: 'Analista de Crédito', observation: 'Visita de verificación al negocio y toma de fotografías del inventario.', nextAction: 'Cotejo de boletas' },
      { id: 'tl-3', date: '2024-09-08', time: '11:15', status: 'en_evaluacion', responsibleName: 'Carlos Méndez Salazar', responsibleRole: 'Analista de Crédito', observation: 'Elaboración de Estado de Resultados, Balance General y Flujo de Caja.', nextAction: 'Elevar a Comité de Créditos' }
    ]
  },

  // 2. Solicitante Rosa Morales Quispe (Frutas y Verduras al por mayor)
  {
    id: 'dos-002',
    code: 'EXP-2024-0843',
    status: 'documentacion_pendiente',
    createdAt: '2024-09-04',
    updatedAt: '2024-09-08',
    assignedAnalystId: 'usr-2',
    assignedAnalystName: 'Elena Ramos Quispe',
    assignedAnalystRole: 'Asesora de Créditos Microempresa',
    agency: 'Agencia Huancayo',

    personal: {
      firstNames: 'Rosa María',
      paternalSurname: 'Morales',
      maternalSurname: 'Quispe',
      fullName: 'Rosa María Morales Quispe',
      documentType: 'DNI',
      documentNumber: '10348291',
      birthDate: '1979-11-04',
      age: 44,
      maritalStatus: 'Conviviente',
      dependentsCount: 3,
      homeAddress: 'Jr. Huánuco 780, Int. 3',
      district: 'El Tambo',
      province: 'Huancayo',
      department: 'Junín',
      phone: '964-987-123',
      email: 'rosa.morales.huancayo@gmail.com'
    },

    business: {
      businessName: 'Distribuidora y Frutería "Santa Rosa"',
      activityType: 'Comercio Mayorista de Frutas y Hortalizas',
      sector: 'Comercio',
      businessAddress: 'Pabellón C, Puesto 45 - Mercado Mayorista de Huancayo',
      operatingTimeYears: 8,
      operatingTimeMonths: 2,
      businessType: 'Puesto de Mercado',
      employeesCount: 3,
      formality: 'Régimen Especial',
      activityDescription: 'Distribución al por mayor de cítricos y frutas de estación traídas de la Selva Central.'
    },

    terms: {
      creditProduct: 'Microcrédito Comercial',
      requestedAmount: 15000,
      termMonths: 18,
      paymentFrequency: 'Mensual',
      estimatedPaymentDate: '2024-10-20',
      destination: 'Compra de mercadería',
      destinationDescription: 'Compra de carga de naranjas y plátanos directamente a agricultores de Chanchamayo.',
      proposedInstallment: 850
    },

    income: calculateIncomeTotals(12000, 0, 0, 0, 0, 0),
    costOfSales: calculateCostOfSales(12000, 5500, 0, 500, 0, 0),
    businessExpenses: calculateBusinessExpenses(6000, 450, 100, 50, 900, 400, 0, 0, 0, 100),
    familyExpenses: calculateFamilyExpenses(1200, 400, 350, 100, 200, 150, 60, 0),
    incomeStatement: calculateIncomeStatement(12000, 6000, 2000, 0, 0, 2460, 520),
    balanceSheet: calculateBalanceSheet(
      2500, 1800, 12000, 3000, 0,
      0, 45000, 0, 0, 0, 2500, 0,
      520, 2000, 0,
      1900, 0
    ),
    obligations: [
      {
        id: 'obl-3',
        entityName: 'Caja Municipal de Arequipa',
        creditType: 'Microempresa',
        originalAmount: 8000,
        currentBalance: 1900,
        monthlyInstallment: 520,
        totalInstallments: 18,
        paidInstallments: 14,
        pendingInstallments: 4,
        dueDate: '2024-09-18',
        status: 'Al día',
        observations: 'Excelente récord'
      }
    ],
    cashFlow: calculateCashFlow(12000, 0, 0, 0, 6000, 2000, 2460, 520, 0),
    paymentCapacity: calculatePaymentCapacity(12000, 10460, 520, 850),
    ratios: calculateFinancialRatios(64300, 4420, 12000, 520, 1020),

    inventory: [
      { id: 'inv-r1', productName: 'Cajones de Naranja Valencia (x 50)', quantity: 50, unitCost: 45, totalCostValue: 2250, sellingPrice: 65, observations: 'Directo de Chanchamayo' },
      { id: 'inv-r2', productName: 'Plátano seda por ciento (x 80)', quantity: 80, unitCost: 28, totalCostValue: 2240, sellingPrice: 42, observations: 'Rotación cada 3 días' }
    ],

    accountsReceivable: [],
    accountsPayable: [],

    references: [
      { id: 'ref-r1', referenceType: 'Proveedor', name: 'Ing. Juan Camargo - Fundo La Merced', phone: '964-778-901', relationship: 'Proveedor de Cítricos', contactDate: '2024-09-05', verificationResult: 'Favorable', observations: 'Cliente desde hace 5 años.' }
    ],

    visitVerification: {
      visitDate: '2024-09-05',
      addressVisited: 'Pabellón C Puesto 45 Mercado Mayorista',
      personContacted: 'Rosa Morales Quispe',
      informationVerified: 'Puesto comercial activo con mercadería fresca y flujo de compradores mayoristas.',
      observations: 'Falta entregar copia de las 4 últimas semanas del cuaderno de ventas.',
      verifiedBy: 'Elena Ramos Quispe'
    },

    documents: [
      { id: 'doc-1', name: 'DNI del Titular (Ambas caras)', documentType: 'DNI', status: 'Verificado', fileName: 'dni_rosa_morales.pdf', fileSize: '1.1 MB', uploadedAt: '2024-09-04' },
      { id: 'doc-2', name: 'Recibo de Servicios (Luz / Agua)', documentType: 'Sustento de ingresos', status: 'Verificado', fileName: 'recibo_luz_huancayo.pdf', fileSize: '780 KB', uploadedAt: '2024-09-04' },
      { id: 'doc-3', name: 'Ficha RUC / Licencia', documentType: 'Documentación del negocio', status: 'Verificado', fileName: 'ruc_mercado.pdf', fileSize: '520 KB', uploadedAt: '2024-09-05' },
      { id: 'doc-4', name: 'Cuaderno / Registro de Ventas', documentType: 'Sustento de ingresos', status: 'Pendiente', observations: 'Falta entrega física de últimas 4 semanas' }
    ],

    qualitative: {
      activityExperience: '8 años de comercialización de frutas en el mercado mayorista.',
      businessStability: 'Puesto alquilado continuo con derecho de uso municipal.',
      businessOrganization: 'Ventas al contado y depósitos en agente.',
      referencesSummary: 'Referencias de agricultores favorables.',
      visitSummary: 'Visita presencial completada.',
      analystComments: 'Pendiente subsanación de cuaderno de ventas.',
      analystConclusion: 'Información registrada a la espera de completar requisitos documentales para pase a comité.',
      finalObservations: 'En seguimiento con la titular.'
    },

    timeline: [
      { id: 'tl-r1', date: '2024-09-04', time: '09:00', status: 'registrada', responsibleName: 'Elena Ramos Quispe', responsibleRole: 'Asesora de Créditos', observation: 'Registro inicial de solicitud crediticia.', nextAction: 'Visita a mercado' },
      { id: 'tl-r2', date: '2024-09-05', time: '11:30', status: 'documentacion_pendiente', responsibleName: 'Elena Ramos Quispe', responsibleRole: 'Asesora de Créditos', observation: 'Se observó falta de cuaderno de ventas.', nextAction: 'Recojo de cuaderno' }
    ]
  },

  // 3. Solicitante Marco Quispe Mamani (Taller Textil - Confecciones)
  {
    id: 'dos-003',
    code: 'EXP-2024-0844',
    status: 'finalizada',
    createdAt: '2024-08-20',
    updatedAt: '2024-09-01',
    assignedAnalystId: 'usr-4',
    assignedAnalystName: 'Jorge Luis Morales',
    assignedAnalystRole: 'Gestor de Crédito',
    agency: 'Agencia Arequipa',

    personal: {
      firstNames: 'Marco Aurelio',
      paternalSurname: 'Quispe',
      maternalSurname: 'Mamani',
      fullName: 'Marco Aurelio Quispe Mamani',
      documentType: 'DNI',
      documentNumber: '72198453',
      birthDate: '1992-03-25',
      age: 32,
      maritalStatus: 'Soltero(a)',
      dependentsCount: 1,
      homeAddress: 'Calle Las Begonias 312',
      district: 'Paucarpata',
      province: 'Arequipa',
      department: 'Arequipa',
      phone: '958-334-902',
      email: 'marco.quispe.textil@gmail.com'
    },

    business: {
      businessName: 'Confecciones y Bordados Industriales Andinos',
      activityType: 'Manufactura y Confección Textil',
      sector: 'Producción / Manufactura',
      businessAddress: 'Av. Kennedy 890, Paucarpata',
      operatingTimeYears: 4,
      operatingTimeMonths: 6,
      businessType: 'Alquilado',
      employeesCount: 4,
      formality: 'Formal (RUC 10 / 20)',
      activityDescription: 'Confección de uniformes escolares e indumentaria industrial de seguridad.'
    },

    terms: {
      creditProduct: 'Crédito Activo Fijo Pyme',
      requestedAmount: 25000,
      termMonths: 24,
      paymentFrequency: 'Mensual',
      estimatedPaymentDate: '2024-09-30',
      destination: 'Compra de activos',
      destinationDescription: 'Adquisición de máquina bordadora computarizada industrial de 6 cabezales.',
      proposedInstallment: 1350
    },

    income: calculateIncomeTotals(19500, 1200, 0, 0, 0, 0),
    costOfSales: calculateCostOfSales(19500, 6500, 1200, 300, 0, 0),
    businessExpenses: calculateBusinessExpenses(11500, 1200, 650, 120, 3600, 300, 200, 100, 0, 200),
    familyExpenses: calculateFamilyExpenses(1100, 700, 300, 150, 250, 200, 100, 0),
    incomeStatement: calculateIncomeStatement(19500, 8000, 6370, 1200, 0, 2800, 920),
    balanceSheet: calculateBalanceSheet(
      4500, 3200, 22000, 8500, 0,
      0, 0, 0, 0, 38000, 12000, 0,
      920, 4200, 0,
      3280, 0
    ),
    obligations: [
      {
        id: 'obl-4',
        entityName: 'Mibanco',
        creditType: 'Pyme',
        originalAmount: 15000,
        currentBalance: 4200,
        monthlyInstallment: 920,
        totalInstallments: 18,
        paidInstallments: 13,
        pendingInstallments: 5,
        dueDate: '2024-09-15',
        status: 'Al día',
        observations: 'Puntual'
      }
    ],
    cashFlow: calculateCashFlow(19500, 0, 1200, 0, 8000, 6370, 2800, 920, 0),
    paymentCapacity: calculatePaymentCapacity(20700, 17170, 920, 1350),
    ratios: calculateFinancialRatios(88200, 8400, 20700, 920, 2610),

    inventory: [
      { id: 'inv-t1', productName: 'Rollos de tela polar y drill x 100m', quantity: 12, unitCost: 850, totalCostValue: 10200, sellingPrice: 1350, observations: 'Materia prima en almacén' },
      { id: 'inv-t2', productName: 'Uniformes escolares terminados (lotes)', quantity: 80, unitCost: 65, totalCostValue: 5200, sellingPrice: 110, observations: 'Para entrega a colegios' }
    ],

    accountsReceivable: [
      { id: 'art-1', clientName: 'Consorcio Educativo San Jerónimo', concept: 'Lote 1 uniformes', amount: 8500, dueDate: '2024-09-25', status: 'Pendiente', observations: 'Contrato firmado' }
    ],

    accountsPayable: [],

    references: [
      { id: 'ref-t1', referenceType: 'Cliente', name: 'Consorcio Educativo San Jerónimo', phone: '958-889-102', relationship: 'Cliente Corporativo', contactDate: '2024-08-24', verificationResult: 'Favorable', observations: 'Confirma orden de compra anual.' }
    ],

    visitVerification: {
      visitDate: '2024-08-22',
      addressVisited: 'Av. Kennedy 890, Paucarpata',
      personContacted: 'Marco Quispe Mamani',
      informationVerified: 'Taller operativo con 5 máquinas de coser y 4 operarios en jornada continua.',
      observations: 'Proforma del importador de bordadora verificada.',
      verifiedBy: 'Jorge Luis Morales'
    },

    documents: STANDARD_DOCUMENTS_TEMPLATE,

    qualitative: {
      activityExperience: 'Confeccionista con 6 años de experiencia técnica.',
      businessStability: 'Contratos vigentes con instituciones educativas y empresas.',
      businessOrganization: 'Plan de producción y registro de pedidos por cliente.',
      referencesSummary: 'Referencias comerciales y de clientes intachables.',
      visitSummary: 'Inspección técnica satisfactoria.',
      analystComments: 'La máquina a financiar incrementará la capacidad instalada en 40%.',
      analystConclusion: 'Expediente formalizado y sustentado ante el Comité de Créditos de Agencia Arequipa.',
      finalObservations: 'Comité registró dictamen institucional favorable según Acta ACTA-COM-2024-092.'
    },

    timeline: [
      { id: 'tl-t1', date: '2024-08-20', time: '14:00', status: 'registrada', responsibleName: 'Jorge Luis Morales', responsibleRole: 'Gestor de Crédito', observation: 'Registro de solicitud.', nextAction: 'Visita técnica' },
      { id: 'tl-t2', date: '2024-08-22', time: '16:30', status: 'en_verificacion', responsibleName: 'Jorge Luis Morales', responsibleRole: 'Gestor de Crédito', observation: 'Inspección al taller textil.', nextAction: 'Evaluación de flujo' },
      { id: 'tl-t3', date: '2024-08-28', time: '10:00', status: 'en_evaluacion', responsibleName: 'Jorge Luis Morales', responsibleRole: 'Gestor de Crédito', observation: 'Cierre de balance y capacidad de pago.', nextAction: 'Comité' },
      { id: 'tl-t4', date: '2024-09-01', time: '17:00', status: 'finalizada', responsibleName: 'Jorge Luis Morales', responsibleRole: 'Gestor de Crédito', observation: 'Sesión de comité realizada y dictamen institucional registrado.', nextAction: 'Archivado formal' }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2024-09-10 14:22:10',
    userId: 'usr-1',
    userName: 'Carlos Méndez Salazar',
    action: 'REGISTRO_SOLICITUD',
    details: 'Registró el expediente EXP-2024-0842 para Juan Pérez López por S/ 10,000.',
    targetCode: 'EXP-2024-0842'
  },
  {
    id: 'log-2',
    timestamp: '2024-09-08 17:40:15',
    userId: 'usr-1',
    userName: 'Carlos Méndez Salazar',
    action: 'ACTUALIZACION_ESTADO',
    details: 'Actualizó estado a [En Evaluación Técnica] para EXP-2024-0842.',
    targetCode: 'EXP-2024-0842'
  },
  {
    id: 'log-3',
    timestamp: '2024-09-05 11:30:00',
    userId: 'usr-2',
    userName: 'Elena Ramos Quispe',
    action: 'DOCUMENTACION_OBSERVADA',
    details: 'Registró requerimiento pendiente de cuaderno de ventas para EXP-2024-0843.',
    targetCode: 'EXP-2024-0843'
  },
  {
    id: 'log-4',
    timestamp: '2024-09-01 17:05:00',
    userId: 'usr-4',
    userName: 'Jorge Luis Morales',
    action: 'DICTAMEN_COMITE',
    details: 'Registró dictamen de comité para EXP-2024-0844 (Acta ACTA-COM-2024-092).',
    targetCode: 'EXP-2024-0844'
  }
];
