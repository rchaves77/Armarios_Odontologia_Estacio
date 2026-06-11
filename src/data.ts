/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CabinetKey, AcademicNews, RequerimentoGuide, StudyMaterial, AuthUser } from './types';

export const SEED_KEYS: CabinetKey[] = [
  // ================= BLOCO C1 =================
  { id: "C1-01", number: 1, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Ana Júlia Pinheiro", userEmail: "anajulia.pinheiro@alunos.estacio.br", userPhone: "(68) 99201-4455", userRole: "ALUNO", loanDate: "2026-03-10", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-02", number: 2, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Bruno Souza Melo", userEmail: "bruno.melo@alunos.estacio.br", userPhone: "(68) 99192-3844", userRole: "ALUNO", loanDate: "2026-03-12", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-03", number: 3, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Camila Guimarães Rocha", userEmail: "camila.rocha@alunos.estacio.br", userPhone: "(68) 99233-7812", userRole: "ALUNO", loanDate: "2026-03-02", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-04", number: 4, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-05", number: 5, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-06", number: 6, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-07", number: 7, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Daniel Costa Mendes", userEmail: "daniel.mendes@alunos.estacio.br", userPhone: "(68) 99244-1100", userRole: "ALUNO", loanDate: "2026-03-14", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-08", number: 8, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Eduarda Lima Nogueira", userEmail: "eduarda.nogueira@alunos.estacio.br", userPhone: "(68) 99281-2299", userRole: "ALUNO", loanDate: "2026-03-15", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-09", number: 9, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-10", number: 10, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-11", number: 11, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Gabriel Alves Pinto", userEmail: "gabriel.pinto@alunos.estacio.br", userPhone: "(68) 99234-5511", userRole: "ALUNO", loanDate: "2026-03-18", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-12", number: 12, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Heitor Vieira Santos", userEmail: "heitor.santos@alunos.estacio.br", userPhone: "(68) 99252-8822", userRole: "ALUNO", loanDate: "2026-03-20", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-13", number: 13, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Isabela Martins Cruz", userEmail: "isabela.cruz@alunos.estacio.br", userPhone: "(68) 99111-2233", userRole: "ALUNO", loanDate: "2026-03-22", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-14", number: 14, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Julia Negreiros Assis", userEmail: "julia.assis@alunos.estacio.br", userPhone: "(68) 99212-3490", userRole: "ALUNO", loanDate: "2026-03-24", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-15", number: 15, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Kaique Barbosa Ribeiro", userEmail: "kaique.ribeiro@alunos.estacio.br", userPhone: "(68) 99266-7788", userRole: "ALUNO", loanDate: "2026-03-26", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-16", number: 16, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Larissa Cunha Lopes", userEmail: "larissa.lopes@alunos.estacio.br", userPhone: "(68) 99155-2244", userRole: "ALUNO", loanDate: "2026-03-28", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-17", number: 17, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-18", number: 18, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-19", number: 19, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Matheus Silveira Guedes", userEmail: "matheus.guedes@alunos.estacio.br", userPhone: "(68) 99288-1122", userRole: "ALUNO", loanDate: "2026-04-01", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-20", number: 20, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Natália Rezende Fontes", userEmail: "natalia.fontes@alunos.estacio.br", userPhone: "(68) 99244-9988", userRole: "ALUNO", loanDate: "2026-04-02", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-21", number: 21, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Otávio Rocha Macedo", userEmail: "otavio.macedo@alunos.estacio.br", userPhone: "(68) 99188-3344", userRole: "ALUNO", loanDate: "2026-04-05", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-22", number: 22, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },
  { id: "C1-23", number: 23, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Patrícia Sales Viana", userEmail: "patricia.viana@alunos.estacio.br", userPhone: "(68) 99211-5566", userRole: "ALUNO", loanDate: "2026-04-08", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C1-24", number: 24, block: "BLOCO C1", status: "disponivel", currentLoan: null, history: [] },

  // ================= BLOCO C2 =================
  { id: "C2-01", number: 1, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Renan Moura Campos", userEmail: "renan.campos@alunos.estacio.br", userPhone: "(68) 99233-1122", userRole: "ALUNO", loanDate: "2026-04-10", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-02", number: 2, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Sabrina Leal Peixoto", userEmail: "sabrina.peixoto@alunos.estacio.br", userPhone: "(68) 99122-8899", userRole: "ALUNO", loanDate: "2026-04-12", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-03", number: 3, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-04", number: 4, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-05", number: 5, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-06", number: 6, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Thiago Cardoso Dias", userEmail: "thiago.dias@alunos.estacio.br", userPhone: "(68) 99244-5500", userRole: "ALUNO", loanDate: "2026-04-15", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-07", number: 7, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Úrsula Mendes Ramos", userEmail: "ursula.ramos@alunos.estacio.br", userPhone: "(68) 99155-8811", userRole: "ALUNO", loanDate: "2026-04-16", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-08", number: 8, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-09", number: 9, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Victor Hugo Freire", userEmail: "victor.freire@alunos.estacio.br", userPhone: "(68) 99233-0099", userRole: "ALUNO", loanDate: "2026-04-18", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-10", number: 10, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-11", number: 11, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-12", number: 12, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-13", number: 13, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-14", number: 14, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-15", number: 15, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Yasmin Valente Neves", userEmail: "yasmin.neves@alunos.estacio.br", userPhone: "(68) 99211-0012", userRole: "ALUNO", loanDate: "2026-04-20", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-16", number: 16, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-17", number: 17, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-18", number: 18, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-19", number: 19, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-20", number: 20, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Agnaldo Farias Rocha", userEmail: "agnaldo.rocha@alunos.estacio.br", userPhone: "(68) 99188-4422", userRole: "ALUNO", loanDate: "2026-04-22", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-21", number: 21, block: "BLOCO C2", status: "emprestada", currentLoan: { userName: "Bianca Siqueira Lima", userEmail: "bianca.lima@alunos.estacio.br", userPhone: "(68) 99244-1188", userRole: "ALUNO", loanDate: "2026-04-25", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C2-22", number: 22, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-23", number: 23, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },
  { id: "C2-24", number: 24, block: "BLOCO C2", status: "disponivel", currentLoan: null, history: [] },

  // ================= BLOCO C3 =================
  { id: "C3-01", number: 1, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Caio Fontes Neto", userEmail: "caio.neto@alunos.estacio.br", userPhone: "(68) 99177-3311", userRole: "ALUNO", loanDate: "2026-04-28", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-02", number: 2, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-03", number: 3, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-04", number: 4, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-05", number: 5, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Davi Correia Siqueira", userEmail: "davi.siqueira@alunos.estacio.br", userPhone: "(68) 99233-4411", userRole: "ALUNO", loanDate: "2026-05-02", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-06", number: 6, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-07", number: 7, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Elisa Barbosa Cunha", userEmail: "elisa.cunha@alunos.estacio.br", userPhone: "(68) 99188-5522", userRole: "ALUNO", loanDate: "2026-05-04", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-08", number: 8, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Felipe Andrade Bezerra", userEmail: "felipe.andrade@alunos.estacio.br", userPhone: "(68) 99988-1122", userRole: "ALUNO", loanDate: "2026-05-05", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-09", number: 9, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-10", number: 10, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Gisele Martins Cruz", userEmail: "gisele.cruz@alunos.estacio.br", userPhone: "(68) 99244-1122", userRole: "ALUNO", loanDate: "2026-05-10", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-11", number: 11, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-12", number: 12, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Hugo Negreiros Assis", userEmail: "hugo.assis@alunos.estacio.br", userPhone: "(68) 99155-4433", userRole: "ALUNO", loanDate: "2026-05-12", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-13", number: 13, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-14", number: 14, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-15", number: 15, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-16", number: 16, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-17", number: 17, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-18", number: 18, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-19", number: 19, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] },
  { id: "C3-20", number: 20, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Ícaro Barbosa Ribeiro", userEmail: "icaro.ribeiro@alunos.estacio.br", userPhone: "(68) 99288-7711", userRole: "ALUNO", loanDate: "2026-05-15", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-21", number: 21, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Janaína Cunha Lopes", userEmail: "janaina.lopes@alunos.estacio.br", userPhone: "(68) 99144-2233", userRole: "ALUNO", loanDate: "2026-05-18", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-22", number: 22, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Kleber Silveira Guedes", userEmail: "kleber.guedes@alunos.estacio.br", userPhone: "(68) 99233-8899", userRole: "ALUNO", loanDate: "2026-05-20", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-23", number: 23, block: "BLOCO C3", status: "emprestada", currentLoan: { userName: "Lívia Rezende Fontes", userEmail: "livia.fontes@alunos.estacio.br", userPhone: "(68) 99111-9922", userRole: "ALUNO", loanDate: "2026-05-22", dueDate: "2026-06-30", semester: "2026.1" }, history: [] },
  { id: "C3-24", number: 24, block: "BLOCO C3", status: "disponivel", currentLoan: null, history: [] }
];

export const SEED_NEWS: AcademicNews[] = [
  {
    id: "news-1",
    title: "Edital de Monitoria de Anatomia Dental 2026.2",
    summary: "Estão abertas as inscrições para monitoria voluntária e remunerada de Anatomia Dental e Oclusão.",
    content: "A coordenação do curso de Odontologia da Estácio Unimeta informa que as inscrições para o processo seletivo de monitoria para o semestre 2026.2 começam hoje e vão até o dia 20 de junho. São 4 vagas disponíveis, sendo 2 com bolsas de desconto na mensalidade e 2 voluntárias. Requisitos: Nota igual ou superior a 8.0 na disciplina e histórico limpo de reprovações.",
    date: "2026-06-08",
    category: "editais",
    author: "Coordenação de Odontologia"
  },
  {
    id: "news-2",
    title: "Entrega Obrigatória dos Termos de Estágio Supervisionado",
    summary: "Atenção alunos do 7º ao 10º semestre. Saiba como preencher o Termo de Compromisso de Estágio Semestral.",
    content: "O prazo máximo de assinatura física e digital dos termos de convênio e compromisso para o atual ciclo expira em 10 dias. Lembre-se de recolher todos os dados obrigatórios estipulados pela instituição (Orientador Acadêmico, Supervisor de Campo, CNPJ da concedente e assinatura digital do representante legal). Para facilitar, utilize o nosso preenchedor automático nesta plataforma e exporte os seus dados cadastrados para análise prévia do comitê estagiário.",
    date: "2026-06-05",
    category: "geral",
    author: "Setor de Carreiras Estácio"
  },
  {
    id: "news-3",
    title: "Oficina Prática de Restaurações em Resina Composta",
    summary: "Sucesso no último sábado na oficina extracurricular ministrada pelo Prof. Dr. Roberto Cavalcante.",
    content: "Com mais de 45 estudantes em nosso laboratório de simulação avançada, revisamos as técnicas de inserção incremental, seleção correta de cor de opacidade e métodos eficientes de polimento para restaurações de classe IV. Devido à alta procura, abriremos uma turma extra nas férias de julho. Acompanhem os editais na nossa plataforma.",
    date: "2026-06-02",
    category: "noticias",
    author: "Liga de Dentística Unimeta"
  },
  {
    id: "news-4",
    title: "Materiais Recomendados para Clínica de Endodontia I",
    summary: "Lista oficial de instrumentais de ponta e materiais odontológicos requeridos para o laboratório de Endo.",
    content: "Caros alunos, para garantir a biossegurança e eficiência durante as aulas práticas de tratamento de canal, atualizamos nossa lista de materiais sugeridos (limas manuais, guta-percha, cimento obturador, brocas Gates-Glidden e insumos esterilizáveis). O link do PDF completo está disponibilizado no painel de recursos acadêmicos abaixo.",
    date: "2026-05-28",
    category: "estudos",
    author: "Profa. Juliana Mendes"
  }
];

export const SEED_GUIDES: RequerimentoGuide[] = [
  {
    id: "req-1",
    title: "Como abrir Requerimento Acadêmico",
    description: "Siga o passo a passo para submeter solicitações na Secretaria Geral (SIA) como segunda chamada de prova, revisão de nota ou trancamento.",
    steps: [
      "Acesse a sua área de aluno no portal do SIA Estácio.",
      "Vá até o menu esquerdo em 'Atendimento' e depois clique em 'Requerimentos'.",
      "Selecione 'Novo Requerimento' e escolha a categoria correta (Financeira, Pedagógica ou Administrativa).",
      "Anexe os documentos comprobatórios relevantes (Atestado médico em formato PDF para repetições de provas, histórico, etc).",
      "Confirme e anote o número de protocolo gerado para acompanhamento oficial."
    ],
    documentsRequired: ["Documento oficial de identidade com foto", "Atestado médico original ou comprovante de justo impedimento (se aplicável)", "Histórico acadêmico atualizado"]
  },
  {
    id: "req-2",
    title: "Equivalência e Aproveitamento de Disciplinas",
    description: "Dúvidas sobre como dispensar disciplinas previamente cursadas em outra instituição ou em transferências internas de curso.",
    steps: [
      "Compareça com o Coordenador após obter o Histórico Oficial carimbado e assinado.",
      "Reúna as Ementas Científicas completas de todas as matérias que você cursou que tenham compatibilidade com a grade de Odontologia da Unimeta.",
      "Abra um Requerimento de dispensa no portal SIA, anexando ementa individual e histórico.",
      "Aguarde o parecer da banca examinadora do curso. A compatibilidade mínima do conteúdo programático deve ser de 75% e carga horária equivalente."
    ],
    documentsRequired: ["Histórico Escolar da instituição de origem", "Ementas das disciplinas assinadas e carimbadas pela faculdade anterior", "Plano de ensino correspondente da disciplina solicitada"]
  }
];

export const SEED_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: "mat-1",
    discipline: "Patologia Bucal",
    semester: 5,
    title: "Guia Visual de Diagnóstico de Lesões de Tecidos Moles",
    description: "Imagens reais e fluxograma simplificado de identificação clínica para hiperplasias, aftas recorrentes e carcinoma espinocelular.",
    fileSize: "14.5 MB"
  },
  {
    id: "mat-2",
    discipline: "Radiologia Odontológica",
    semester: 3,
    title: "Manual de Técnicas Intrabucais Periapicais e de Bissecção",
    description: "Guia definitivo com posicionamento correto do cabeçote, filme radiográfico e tempos de exposição de raios X por dente.",
    fileSize: "8.2 MB"
  },
  {
    id: "mat-3",
    discipline: "Biossegurança na Clínica",
    semester: 1,
    title: "Manual Unimeta de Esterilização de Autoclave e EPIs Básicos",
    description: "Fluxo de lavagem, embalagem em papel grau cirúrgico, indicadores químicos biológicos e colocação correta de capotes estéreis.",
    fileSize: "3.1 MB"
  }
];

export const DEMO_ADMINS: AuthUser[] = [
  {
    uid: "admin1",
    name: "Dra. Luciana Mendonça Correia",
    email: "luciana.mendonca@estacio.br",
    phone: "(68) 99933-2211",
    role: "ADMIN",
    registrationNumber: "CO-10294"
  },
  {
    uid: "admin2",
    name: "Ana Carla Silveira (Recepção Clínica)",
    email: "anacarla.recepcao@estacio.br",
    phone: "(68) 99222-8877",
    role: "ADMIN",
    registrationNumber: "COL-9923"
  }
];

export const DEMO_USERS: AuthUser[] = [];
