/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Check, Printer, AlertCircle, Building2, UserCheck, Calendar } from 'lucide-react';
import { AuthUser, TermoEstagioData } from '../types';

interface TermoEstagioFormProps {
  user: AuthUser;
}

export default function TermoEstagioForm({ user }: TermoEstagioFormProps) {
  const [terms, setTerms] = useState<TermoEstagioData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<TermoEstagioData | null>(null);

  // Form Fields
  const [studentName, setStudentName] = useState(user.name);
  const [studentRegistration, setStudentRegistration] = useState(user.registrationNumber || '');
  const [supervisorName, setSupervisorName] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [legalRepresentative, setLegalRepresentative] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState<number>(20);

  useEffect(() => {
    // Load terms from storage
    const stored = JSON.parse(localStorage.getItem('unimeta_terms_list') || '[]');
    // Filter if not admin (students can only see their own terms, admin sees everything!)
    if (user.role !== 'ADMIN') {
      const filtered = stored.filter((t: any) => t.studentRegistration === (user.registrationNumber || user.name));
      setTerms(filtered);
    } else {
      setTerms(stored);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTerm: TermoEstagioData = {
      studentName: user.name,
      studentRegistration: user.registrationNumber || 'MAT-' + Math.floor(1000 + Math.random() * 9000),
      supervisorName,
      advisorName,
      companyName,
      companyCnpj,
      legalRepresentative,
      startDate,
      endDate,
      weeklyHours,
      status: 'enviado'
    };

    const stored = JSON.parse(localStorage.getItem('unimeta_terms_list') || '[]');
    stored.push(newTerm);
    localStorage.setItem('unimeta_terms_list', JSON.stringify(stored));

    // Update state
    if (user.role !== 'ADMIN') {
      setTerms(stored.filter((t: any) => t.studentRegistration === (user.registrationNumber || user.name)));
    } else {
      setTerms(stored);
    }

    setIsCreating(false);
    setSelectedTerm(newTerm);

    // Reset fields
    setSupervisorName('');
    setAdvisorName('');
    setCompanyName('');
    setCompanyCnpj('');
    setLegalRepresentative('');
    setStartDate('');
    setEndDate('');
    setWeeklyHours(20);
  };

  const handleUpdateStatus = (indexInStored: number, newStatus: 'aprovado' | 'rejeitado') => {
    const stored = JSON.parse(localStorage.getItem('unimeta_terms_list') || '[]');
    if (stored[indexInStored]) {
      stored[indexInStored].status = newStatus;
      localStorage.setItem('unimeta_terms_list', JSON.stringify(stored));
      
      if (user.role !== 'ADMIN') {
        const filt = stored.filter((t: any) => t.studentRegistration === (user.registrationNumber || user.name));
        setTerms(filt);
        if (selectedTerm && selectedTerm.studentRegistration === stored[indexInStored].studentRegistration) {
          setSelectedTerm({ ...selectedTerm, status: newStatus });
        }
      } else {
        setTerms(stored);
        setSelectedTerm({ ...stored[indexInStored] });
      }
    }
  };

  return (
    <div id="termo-estagio-container" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-6 w-6 text-orange-655" />
            Termo de Estágio Odontológico
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gere, gerencie e valide semestralmente os termos de compromisso obrigatório junto às empresas contratantes.
          </p>
        </div>

        {user.role !== 'ADMIN' && !isCreating && (
          <button
            id="btn-new-term"
            onClick={() => setIsCreating(true)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-xs font-semibold text-white px-4 py-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Novo Termo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: List of terms */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">Meus Termos Registrados</h3>
            
            {terms.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-slate-300 stroke-[1.5]" />
                <p className="mt-2 text-xs text-slate-400">Nenhum termo cadastrado.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {terms.map((term, idx) => {
                  const isSel = selectedTerm?.companyCnpj === term.companyCnpj && selectedTerm?.startDate === term.startDate;
                  
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  let statusTxt = 'Em Análise';
                  if (term.status === 'aprovado') {
                    badgeColor = 'bg-orange-50 text-orange-700 border border-orange-100/50';
                    statusTxt = 'Deferido';
                  } else if (term.status === 'rejeitado') {
                    badgeColor = 'bg-rose-50 text-rose-700 border border-rose-100';
                    statusTxt = 'Indeferido';
                  }
 
                  return (
                    <button
                      key={idx}
                      id={`term-item-${idx}`}
                      type="button"
                      onClick={() => setSelectedTerm(term)}
                      className={`w-full text-left p-3 rounded-lg transition-all flex flex-col gap-1 hover:bg-slate-50 border cursor-pointer ${
                        isSel ? 'bg-orange-50/50 border-orange-200' : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-800 line-clamp-1">{term.companyName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {statusTxt}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">CNPJ: {term.companyCnpj}</span>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span>Inicio: {term.startDate}</span>
                        <span className="font-semibold">Estudante: {term.studentName.split(' ')[0]}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Main Form or Term Details */}
        <div className="lg:col-span-2">
          {isCreating ? (
            <motion.div
              id="term-creation-form-wrapper"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-light/50">
                <h3 className="text-sm font-bold text-slate-800">Preencher Novos Parâmetros do Termo</h3>
                <button
                  id="btn-cancel-creation"
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Section 1: Concedente */}
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-orange-655 flex items-center gap-1.5 font-mono">
                    <Building2 className="h-3.5 w-3.5" /> 1. Instituição / Concedente (Empresa/Clínica)
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Razão Social / Nome Fantasia *</label>
                      <input
                        id="term-company-name-input"
                        type="text"
                        required
                        placeholder="Consultório Dentário OdontoClean S/C"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CNPJ da Concedente *</label>
                      <input
                        id="term-company-cnpj-input"
                        type="text"
                        required
                        placeholder="12.345.678/0001-99"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                        value={companyCnpj}
                        onChange={(e) => setCompanyCnpj(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Representante Legal da Concedente *</label>
                    <input
                      id="term-legal-rep-input"
                      type="text"
                      required
                      placeholder="Dr. Alexandre Mendes (Diretor Clínico)"
                      className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                      value={legalRepresentative}
                      onChange={(e) => setLegalRepresentative(e.target.value)}
                    />
                  </div>
                </div>

                {/* Section 2: Orientação */}
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-orange-655 flex items-center gap-1.5 font-mono">
                    <UserCheck className="h-3.5 w-3.5" /> 2. Responsáveis Pedagógicos e Práticos
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Supervisor de Campo * (Clínica Concedente)</label>
                      <input
                        id="term-supervisor-input"
                        type="text"
                        required
                        placeholder="Dr(a). Ana Silva Mendes (CRO-AC 1293)"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                        value={supervisorName}
                        onChange={(e) => setSupervisorName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Orientador Acadêmico * (Professor Estácio)</label>
                      <input
                        id="term-advisor-input"
                        type="text"
                        required
                        placeholder="Prof. Dr. Roberto Cavalcante"
                        className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                        value={advisorName}
                        onChange={(e) => setAdvisorName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Datas */}
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-orange-655 flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3.5 w-3.5" /> 3. Período e Carga Horária Semestral
                  </span>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Data de Início *</label>
                      <input
                        id="term-start-date-input"
                        type="date"
                        required
                        className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Data de Término *</label>
                      <input
                        id="term-end-date-input"
                        type="date"
                        required
                        className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Horas Semanais *</label>
                      <input
                        id="term-weekly-hours-input"
                        type="number"
                        required
                        min={1}
                        max={40}
                        className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800 focus:border-orange-500 focus:outline-none"
                        value={weeklyHours}
                        onChange={(e) => setWeeklyHours(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="btn-submit-term-form"
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 font-bold text-white px-6 py-2.5 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Enviar para Homologação
                  </button>
                </div>
              </form>
            </motion.div>
          ) : selectedTerm ? (
            <motion.div
              id="term-detail-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col gap-6"
            >
              {/* Status Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">STATUS DO REQUERIMENTO</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedTerm.status === 'aprovado' 
                        ? 'bg-orange-50 text-orange-850 border border-orange-100'
                        : selectedTerm.status === 'rejeitado'
                        ? 'bg-rose-50 text-rose-800 border border-rose-100'
                        : 'bg-amber-50 text-amber-800 border border-amber-100'
                    }`}>
                      {selectedTerm.status === 'aprovado' ? 'Deferido / Assinado' : selectedTerm.status === 'rejeitado' ? 'Indeferido / Corrigir' : 'Aguardando Assinatura Coordenador'}
                    </span>
                  </div>
                </div>

                {/* Admin Actions */}
                {user.role === 'ADMIN' && selectedTerm.status === 'enviado' && (
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-admin-approve-term"
                      onClick={() => {
                        const stored = JSON.parse(localStorage.getItem('unimeta_terms_list') || '[]');
                        const idx = stored.findIndex((t: any) => t.companyCnpj === selectedTerm.companyCnpj && t.startDate === selectedTerm.startDate);
                        if (idx !== -1) {
                          handleUpdateStatus(idx, 'aprovado');
                        }
                      }}
                      className="flex items-center gap-1 rounded bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1.5 text-xs shadow-xs cursor-pointer"
                    >
                      <Check className="h-3 w-3" /> Deferir Termo
                    </button>
                    <button
                      id="btn-admin-reject-term"
                      onClick={() => {
                        const stored = JSON.parse(localStorage.getItem('unimeta_terms_list') || '[]');
                        const idx = stored.findIndex((t: any) => t.companyCnpj === selectedTerm.companyCnpj && t.startDate === selectedTerm.startDate);
                        if (idx !== -1) {
                          handleUpdateStatus(idx, 'rejeitado');
                        }
                      }}
                      className="flex items-center gap-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 text-xs shadow-xs cursor-pointer"
                    >
                      Indeferir
                    </button>
                  </div>
                )}

                <button
                  id="btn-print-term"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir Termo
                </button>
              </div>

              {/* Certificate Layout Preview */}
              <div id="term-certificate-printable" className="p-6 border border-slate-200 bg-slate-50/20 rounded-lg font-serif text-slate-800 space-y-6 max-h-[500px] overflow-y-auto">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold uppercase font-sans tracking-wide">ESTÁCIO UNIMETA - CLÍNICAS ODONTOLÓGICAS</h4>
                  <p className="text-[11px] uppercase font-sans text-slate-500 font-semibold tracking-widest">TERMO DE COMPROMISSO DE ESTÁGIO OBRIGATÓRIO (TCE)</p>
                  <div className="h-0.5 w-24 bg-orange-600 mx-auto mt-2"></div>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <p>
                    Por este instrumento, de um lado a instituição de ensino <strong className="font-sans">ESTÁCIO UNIMETA ACADÊMICA</strong>, e de outro a parte concedente <strong className="font-sans font-bold">{selectedTerm.companyName}</strong>, inscrita no CNPJ sob o nº <strong className="font-mono">{selectedTerm.companyCnpj}</strong>, representada legitimamente por seu representante legal <strong className="font-sans">{selectedTerm.legalRepresentative}</strong>, acordam em firmar o presente convênio para estágio Supervisionado Clínico do discente abaixo listado:
                  </p>

                  <div className="bg-white p-3 rounded border border-slate-100 space-y-2 font-sans text-[11px]">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="text-slate-500">Estudante:</strong> {selectedTerm.studentName}</div>
                      <div><strong className="text-slate-500">Matrícula / Identificação:</strong> {selectedTerm.studentRegistration}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong className="text-slate-500">Supervisor Concedente:</strong> {selectedTerm.supervisorName}</div>
                      <div><strong className="text-slate-500">Orientador Acadêmico:</strong> {selectedTerm.advisorName}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><strong className="text-slate-500">Data Início:</strong> {selectedTerm.startDate}</div>
                      <div><strong className="text-slate-500">Data Término:</strong> {selectedTerm.endDate}</div>
                      <div><strong className="text-slate-500">Carga Horária Semanal:</strong> {selectedTerm.weeklyHours} Horas</div>
                    </div>
                  </div>

                  <p>
                    As partes elegem o foro da comarca da Estácio Unimeta para dirimir quaisquer dúvidas oriundas deste Termo. Em concordância com as regras corporativas da instituição, o aluno se compromete com as normas de conduta clínica e portabilidade de EPIs.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-12 text-center text-[10px] uppercase font-sans font-semibold text-slate-500">
                  <div className="border-t border-slate-300 pt-1.5">
                    Assinatura Repr. Legal
                  </div>
                  <div className="border-t border-slate-300 pt-1.5">
                    Assinatura de Estudante
                  </div>
                  <div className="border-t border-slate-300 pt-1.5">
                    Orientador Acadêmico
                  </div>
                </div>
              </div>

              {selectedTerm.status === 'enviado' && (
                <div className="flex gap-2 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>Esse requerimento está em análise pela Secretaria Acadêmica da Unimeta. Um aviso por e-mail será emitido quando finalizado.</span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300 stroke-[1.2]" />
              <h4 className="mt-4 font-bold text-slate-700 text-sm">Nenhum Termo Selecionado</h4>
              <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto">
                Selecione um termo de estágio à esquerda para visualizar os detalhes programados de assessoramento ou crie um novo caso seja estudante.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
