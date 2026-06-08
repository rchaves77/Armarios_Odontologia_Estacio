/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'PROFESSOR' | 'ALUNO';

export interface AuthUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  semesterOfEntry?: string;
  registrationNumber?: string; // Matricula
}

export type KeyStatus = 'disponivel' | 'emprestada' | 'manutencao' | 'atrasada';

export interface LoanDetails {
  uid?: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  userRole: UserRole;
  loanDate: string;
  dueDate: string;
  semester: string;
  returnedDate?: string;
}

export interface CabinetKey {
  id: string; // e.g. "C-101"
  number: number;
  block: string; // e.g. "Clínica A", "Clínica B", "Laboratório 1"
  status: KeyStatus;
  currentLoan: LoanDetails | null;
  history: LoanDetails[];
}

export interface AcademicNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  date: string;
  category: 'noticias' | 'editais' | 'estudos' | 'geral';
  author: string;
}

export interface RequerimentoGuide {
  id: string;
  title: string;
  description: string;
  steps: string[];
  documentsRequired: string[];
  link?: string;
}

export interface StudyMaterial {
  id: string;
  discipline: string;
  semester: number;
  title: string;
  description: string;
  fileSize?: string;
  downloadUrl?: string; // Simulado
}

export interface TermoEstagioData {
  studentName: string;
  studentRegistration: string;
  supervisorName: string;
  advisorName: string;
  companyName: string;
  companyCnpj: string;
  legalRepresentative: string;
  startDate: string;
  endDate: string;
  weeklyHours: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'AUTO' | 'MANUAL';
  status: 'SUCESSO' | 'ERR_CONEXAO' | 'PARCIAL';
  recordsSynced: number;
  message: string;
}
