/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, FileText, Compass, Megaphone, Info, 
  ChevronRight, Calendar, User, ArrowRight, Download, Calculator, 
  HelpCircle, CheckCircle, Percent, Plus, Trash2, HeartHandshake, Eye
} from 'lucide-react';
import { AuthUser, AcademicNews, StudyMaterial, RequerimentoGuide } from '../types';
import { SEED_NEWS, SEED_STUDY_MATERIALS, SEED_GUIDES } from '../data';

interface AcademicPortalProps {
  user: AuthUser;
}

export default function AcademicPortal({ user }: AcademicPortalProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'requirements' | 'materials' | 'equivalence' | 'nps-results'>('news');
  const [news, setNews] = useState<AcademicNews[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [guides, setGuides] = useState<RequerimentoGuide[]>([]);

  // News creation state (for admins with @estacio.br)
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState<'noticias' | 'editais' | 'estudos' | 'geral'>('noticias');

  // Material creation state (for admins)
  const [isCreatingMaterial, setIsCreatingMaterial] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDiscipline, setMaterialDiscipline] = useState('');
  const [materialSemester, setMaterialSemester] = useState<number>(1);
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialSize, setMaterialSize] = useState('2.5 MB');

  // Equivalence Calculator State
  const [prevDiscipline, setPrevDiscipline] = useState('');
  const [prevGrade, setPrevGrade] = useState<number>(8);
  const [prevHours, setPrevHours] = useState<number>(80);
  const [targetDiscipline, setTargetDiscipline] = useState('Anatomia Dental e Cabeça');
  const [equivalenceResults, setEquivalenceResults] = useState<{
    compatible: boolean;
    percentage: number;
    notes: string;
  } | null>(null);

  // NPS Statistics (Admin View)
  const [npsList, setNpsList] = useState<any[]>([]);
  const [isaList, setIsaList] = useState<any[]>([]);

  useEffect(() => {
    // Load lists
    const storedNews = localStorage.getItem('unimeta_news');
    if (storedNews) {
      setNews(JSON.parse(storedNews));
    } else {
      setNews(SEED_NEWS);
      localStorage.setItem('unimeta_news', JSON.stringify(SEED_NEWS));
    }

    const storedMaterials = localStorage.getItem('unimeta_materials');
    if (storedMaterials) {
      setMaterials(JSON.parse(storedMaterials));
    } else {
      setMaterials(SEED_STUDY_MATERIALS);
      localStorage.setItem('unimeta_materials', JSON.stringify(SEED_STUDY_MATERIALS));
    }

    const storedGuides = localStorage.getItem('unimeta_guides');
    if (storedGuides) {
      setGuides(JSON.parse(storedGuides));
    } else {
      setGuides(SEED_GUIDES);
      localStorage.setItem('unimeta_guides', JSON.stringify(SEED_GUIDES));
    }

    // Load surveys
    setNpsList(JSON.parse(localStorage.getItem('nps_results_list') || '[]'));
    setIsaList(JSON.parse(localStorage.getItem('isa_completed_list') || '[]'));
  }, []);

  const saveNews = (updated: AcademicNews[]) => {
    setNews(updated);
    localStorage.setItem('unimeta_news', JSON.stringify(updated));
  };

  const saveMaterials = (updated: StudyMaterial[]) => {
    setMaterials(updated);
    localStorage.setItem('unimeta_materials', JSON.stringify(updated));
  };

  // Create article
  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return;

    const newArticle: AcademicNews = {
      id: 'news-' + Date.now(),
      title: newsTitle,
      summary: newsSummary || newsContent.slice(0, 100) + '...',
      content: newsContent,
      imageUrl: undefined,
      date: new Date().toISOString().split('T')[0],
      category: newsCategory,
      author: user.name
    };

    const updated = [newArticle, ...news];
    saveNews(updated);
    setIsCreatingNews(false);
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
  };

  const handleDeleteNews = (id: string) => {
    if (confirm('Deseja excluir permanentemente este comunicado acadêmico do portal?')) {
      const updated = news.filter(n => n.id !== id);
      saveNews(updated);
    }
  };

  // Create Study Material
  const handleCreateMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle || !materialDiscipline) return;

    const newMat: StudyMaterial = {
      id: 'mat-' + Date.now(),
      discipline: materialDiscipline,
      semester: Number(materialSemester),
      title: materialTitle,
      description: materialDesc,
      fileSize: materialSize,
      downloadUrl: '#'
    };

    const updated = [newMat, ...materials];
    saveMaterials(updated);
    setIsCreatingMaterial(false);
    setMaterialTitle('');
    setMaterialDiscipline('');
    setMaterialDesc('');
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Tem certeza que deseja apagar este material didático?')) {
      const updated = materials.filter(m => m.id !== id);
      saveMaterials(updated);
    }
  };

  // Equivalence Simulator logic
  const handleSimulateEquivalence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prevDiscipline) return;

    // Simulate compatibility algorithm based on hours and grade
    const hoursRatio = prevHours >= 80 ? 1 : prevHours / 80;
    const gradeRatio = prevGrade >= 7.0 ? 1.1 : 0.8;
    
    // Exact match modifier
    let matchMultiplier = 0.85;
    const targetLower = targetDiscipline.toLowerCase();
    const prevLower = prevDiscipline.toLowerCase();
    if (
      prevLower.includes('anatomia') && targetLower.includes('anatomia') ||
      prevLower.includes('patologia') && targetLower.includes('patologia') ||
      prevLower.includes('radiologia') && targetLower.includes('radiologia') ||
      prevLower.includes('cirurgia') && targetLower.includes('cirurgia') ||
      prevLower.includes('estágio') && targetLower.includes('estágio')
    ) {
      matchMultiplier = 1.05;
    }

    const calculatedPercent = Math.min(100, Math.round(hoursRatio * gradeRatio * matchMultiplier * 85));
    const compatible = calculatedPercent >= 75; // Standard Estácio rule: 75% program compatibility

    let notes = '';
    if (calculatedPercent >= 75) {
      notes = `Excelente compatibilidade! Carga horária acumulada de (${prevHours}h) atende aos requisitos mínimos exigidos. Dispensa recomendada após submissão do plano pedagógico via SIA sob anexo de ementa em PDF institucional.`;
    } else if (calculatedPercent >= 50) {
      notes = `Compatibilidade parcial (${calculatedPercent}%). A carga horária de (${prevHours}h) poderá necessitar de complementações didáticas específicas na Estácio Unimeta. Solicite parecer oficial junto à coordenação.`;
    } else {
      notes = `Baixa compatibilidade garantida. O programa da disciplina de origem não cumpre com 75% dos conteúdos fundamentais ou carga horária sugerida pela matriz pedagógica de Odontologia Estácio.`;
    }

    setEquivalenceResults({
      compatible,
      percentage: calculatedPercent,
      notes
    });
  };

  const isAdmin = user.role === 'ADMIN';

  // Statistics Calculation
  const totalNpsResponses = npsList.length;
  const npsAverage = totalNpsResponses > 0 
    ? (npsList.reduce((acc, curr) => acc + curr.score, 0) / totalNpsResponses).toFixed(1)
    : '0';

  const promoterCount = npsList.filter(n => n.score >= 9).length;
  const detractorCount = npsList.filter(n => n.score <= 6).length;
  const npsCalculatedScore = totalNpsResponses > 0
    ? Math.round(((promoterCount - detractorCount) / totalNpsResponses) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Course Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-md border border-slate-800">
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-orange-500/10 blur-2xl"></div>
        <div className="relative max-w-2xl space-y-3 font-sans">
          <span className="inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400 border border-orange-500/10">
            Odontologia Estácio Unimeta
          </span>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Portal de Centralização Acadêmica
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Bem-vindo ao espaço digital discente do curso de Odontologia. Acesse manuais, ementas de estudo básicos, abra requerimentos, simule dispensas de crédito e responda nossas pesquisas de feedback.
          </p>
        </div>
      </div>

      {/* Grid: Navigation & Subsystem view selector */}
      <div id="portal-tab-group" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        <button
          id="tab-news"
          onClick={() => { setActiveTab('news'); setEquivalenceResults(null); }}
          className={`rounded-lg px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'news' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="h-4 w-4" /> Notícias e Editais
        </button>

        <button
          id="tab-requirements"
          onClick={() => { setActiveTab('requirements'); setEquivalenceResults(null); }}
          className={`rounded-lg px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'requirements' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-4 w-4" /> Requerimentos e Tutoriais
        </button>

        <button
          id="tab-materials"
          onClick={() => { setActiveTab('materials'); setEquivalenceResults(null); }}
          className={`rounded-lg px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'materials' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Recursos de Estudos (Downloads)
        </button>

        <button
          id="tab-equivalence"
          onClick={() => { setActiveTab('equivalence'); setEquivalenceResults(null); }}
          className={`rounded-lg px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'equivalence' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="h-4 w-4" /> Avaliação de Equivalência (MEC)
        </button>

        {isAdmin && (
          <button
            id="tab-nps-results"
            onClick={() => { setActiveTab('nps-results'); setEquivalenceResults(null); }}
            className={`rounded-lg px-4 py-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'nps-results' ? 'bg-slate-800 text-orange-400 border border-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Percent className="h-4 w-4 text-orange-500" /> Resultados NPS & ISA ({totalNpsResponses})
          </button>
        )}
      </div>

      {/* CONTENT COMPOSITION BY SELECTED ACTIVE TAB */}
      <div id="portal-tab-content" className="font-sans">
        
        {/* TAB 1: NEWS AND NOTICES */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Comunicados Recentes e Editais Urgentes</h3>
                <p className="text-xs text-slate-400">Verifique os canais de monitoria, prazos de provas e avisos de coordenação.</p>
              </div>

              {isAdmin && (
                <button
                  id="btn-open-news-form"
                  onClick={() => setIsCreatingNews(!isCreatingNews)}
                  className="rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 cursor-pointer"
                >
                  {isCreatingNews ? 'Fechar Painel' : 'Postar Comunicado'}
                </button>
              )}
            </div>

            {/* Admin News editor drawer */}
            {isAdmin && isCreatingNews && (
              <motion.div
                id="news-form-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
              >
                <form onSubmit={handleCreateNews} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Título do Comunicado *</label>
                      <input
                        id="news-title-input"
                        type="text"
                        required
                        placeholder="Edital de Vagas de Reingresso 2026.2"
                        className="w-full bg-white border border-slate-200 rounded p-2 text-slate-850"
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Categoria</label>
                      <select
                        id="news-category-select"
                        className="w-full bg-white border border-slate-200 rounded p-2 text-slate-800 cursor-pointer"
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value as any)}
                      >
                        <option value="noticias">Artigo de Notícia</option>
                        <option value="editais">Inscrição ou Edital Clínico</option>
                        <option value="estudos">Lista de Estudo ou Material</option>
                        <option value="geral">Aviso Geral aos Alunos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Resumo Rápido (Exibido nos cards) *</label>
                    <input
                      id="news-summary-input"
                      type="text"
                      required
                      placeholder="Prazo vai até sexta ou detalhe sucinto..."
                      className="w-full bg-white border border-slate-200 rounded p-2 text-slate-850"
                      value={newsSummary}
                      onChange={(e) => setNewsSummary(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Conteúdo Completo *</label>
                    <textarea
                      id="news-content-textarea"
                      rows={4}
                      required
                      placeholder="Digite o texto detalhado oficial com especificações do termo."
                      className="w-full bg-white border border-slate-200 rounded p-2 text-slate-850"
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      id="news-submit-btn"
                      type="submit"
                      className="rounded bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2"
                    >
                      Publicar no Mural Acadêmico
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* List entries for reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item) => {
                let catBadge = 'bg-slate-100 text-slate-700';
                if (item.category === 'editais') catBadge = 'bg-rose-50 text-rose-700 font-bold border border-rose-100';
                else if (item.category === 'estudos') catBadge = 'bg-orange-50 text-orange-700 font-bold border border-orange-100';
                else if (item.category === 'noticias') catBadge = 'bg-blue-50 text-blue-700 border border-blue-100';

                return (
                  <div key={item.id} id={`news-card-${item.id}`} className="rounded-xl border border-slate-100 bg-white p-5 hover:shadow-xs transition-all flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full ${catBadge}`}>
                          {item.category === 'editais' ? 'Edital Clínico' : item.category === 'estudos' ? 'Didáticos' : item.category === 'noticias' ? 'Notícias' : 'Avisos'}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <Calendar className="h-3 w-3" />
                          <span>{item.date}</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-850 text-xs md:text-sm line-clamp-2">{item.title}</h4>
                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">{item.summary}</p>
                    </div>

                    <div className="border-t border-slate-50 mt-4 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Postador: <strong>{item.author.split(' ')[0]}</strong></span>
                      <div className="flex gap-2">
                        {isAdmin && (
                          <button
                            id={`btn-del-news-${item.id}`}
                            onClick={() => handleDeleteNews(item.id)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 rounded p-1 text-xs"
                            title="Remover comunicado"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          id={`btn-read-news-${item.id}`}
                          onClick={() => alert(`DETALHES DO COMUNICADO:\n\n${item.title.toUpperCase()}\n\n${item.content}\n\nAutor: ${item.author} | Publicado: ${item.date}`)}
                          className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1 cursor-pointer animate-none"
                        >
                          Ler Comunicado <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: HOW TO SUBMIT REQUESTS */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Guia de Submissão de Requerimentos e Pendências Administrativas</h3>
              <p className="text-xs text-slate-400">Instruções de como abrir justificativas acadêmicas, pedir reposição de clínica perdida e outros pareceres.</p>
            </div>

                      {guides.map((g) => (
                <div key={g.id} className="rounded-xl border border-slate-100 bg-white p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                      <Info className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{g.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">{g.description}</p>
                    </div>
                  </div>

                  <hr className="border-slate-50" />

                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Etapas Obrigatórias (Portal Aluno)</h5>
                    <ol className="space-y-2">
                      {g.steps.map((step, sidx) => (
                        <li key={sidx} className="flex gap-2 text-xs text-slate-600">
                           <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {sidx + 1}
                          </span>
                          <span className="leading-normal">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-100/50">
                    <span className="text-[10px] font-bold text-amber-800 font-mono block mb-1">DOCUMENTAÇÃO ANEXA EXIGIDA</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-600">
                      {g.documentsRequired.map((doc, didx) => (
                        <li key={didx}>{doc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 text-right">
                    <a
                      id={`link-guide-sia-${g.id}`}
                      href="https://sia.estacio.br"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 px-4 py-2 transition-all"
                    >
                      Abrir Requerimento no SIA <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* TAB 3: STUDY DEPOSIT SYSTEM */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">Manuais Científicos, Ementas de Laboratório e Periódicos</h3>
                <p className="text-xs text-slate-400 font-medium">Faça o download rápido dos materiais disponibilizados pelos seus docentes da clínica.</p>
              </div>

              {isAdmin && (
                <button
                  id="btn-open-material-form"
                  onClick={() => setIsCreatingMaterial(!isCreatingMaterial)}
                  className="rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-1.5 cursor-pointer"
                >
                  {isCreatingMaterial ? 'Fechar Painel' : 'Postar Material Didático'}
                </button>
              )}
            </div>

            {/* Admin add study resources inside library */}
            {isAdmin && isCreatingMaterial && (
              <motion.div
                id="material-form-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4"
              >
                <form onSubmit={handleCreateMaterial} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Título do Documento ou Manual *</label>
                      <input
                        id="mat-title-input"
                        type="text"
                        required
                        placeholder="Manual de Farmacologia Odontológica Básica"
                        className="w-full bg-white border border-slate-200 rounded p-2 text-slate-800"
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Disciplina Correspondente *</label>
                      <input
                        id="mat-disc-input"
                        type="text"
                        required
                        placeholder="Farmacodinâmica"
                        className="w-full bg-white border border-slate-200 rounded p-2 text-slate-800"
                        value={materialDiscipline}
                        onChange={(e) => setMaterialDiscipline(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Semestre Recomendado</label>
                      <input
                        id="mat-semester-input"
                        type="number"
                        min={1}
                        max={10}
                        required
                        className="w-full bg-white border border-slate-200 rounded p-2 text-slate-800"
                        value={materialSemester}
                        onChange={(e) => setMaterialSemester(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Descrição Breve *</label>
                    <input
                      id="mat-desc-input"
                      type="text"
                      required
                      placeholder="Indicações de prescrições usuais de amoxicilina e anti-inflamatórios."
                      className="w-full bg-white border border-slate-200 rounded p-2 text-slate-800"
                      value={materialDesc}
                      onChange={(e) => setMaterialDesc(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      id="mat-submit-btn"
                      type="submit"
                      className="rounded bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2"
                    >
                      Adicionar Material ao Portal
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="space-y-3">
              {materials.map((mat) => (
                <div key={mat.id} id={`material-item-${mat.id}`} className="rounded-xl border border-slate-100 bg-white p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-orange-200 transition-all gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        Semestre Ativo: {mat.semester}º
                      </span>
                      <span className="text-[10px] font-bold text-orange-600 font-mono tracking-tight uppercase">{mat.discipline}</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{mat.title}</h4>
                    <p className="text-slate-500 text-xs">{mat.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono font-bold shrink-0">{mat.fileSize || '1.8 MB'}</span>
                    <div className="flex gap-1">
                      {isAdmin && (
                        <button
                          id={`btn-del-mat-${mat.id}`}
                          onClick={() => handleDeleteMaterial(mat.id)}
                          className="text-rose-600 hover:bg-rose-50 border border-slate-100 rounded p-2"
                          title="Remover material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        id={`btn-dl-mat-${mat.id}`}
                        onClick={() => alert(`Simulação de Download Iniciada!\nDocumento: "${mat.title}"\nArquivo está sendo compactado de forma segura e transferido por canais Estácio Unimeta.`)}
                        className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-100/50 rounded-lg text-xs font-bold px-4 py-2 shrink-0 cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" /> Baixar PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADVANCED DISCIPLINE EQUIVALENCY CHECKER */}
        {activeTab === 'equivalence' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Simulador de Aproveitamento e Equivalência de Disciplinas</h3>
              <p className="text-xs text-slate-400">Estima a possibilidade de dispensa de matérias anteriormente cursadas comparando o conteúdo com as regras da Estácio.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calculator Panel */}
              <div className="lg:col-span-1 rounded-xl border border-slate-100 bg-white p-5 h-fit">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-650 font-mono flex items-center gap-1 mr-0.5">
                  <Calculator className="h-4 w-4" /> Parâmetros de Entrada
                </span>
                <form id="equivalence-form" onSubmit={handleSimulateEquivalence} className="space-y-4 mt-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Nome da Disciplina que já Cursou *</label>
                    <input
                      id="equiv-prev-disp-input"
                      type="text"
                      required
                      placeholder="Ex: Anatomia Geral e Cabeça"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-805"
                      value={prevDiscipline}
                      onChange={(e) => setPrevDiscipline(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nota Final (0 a 10) *</label>
                      <input
                        id="equiv-prev-grade-input"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-850"
                        value={prevGrade}
                        onChange={(e) => setPrevGrade(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Carga Horária (horas) *</label>
                      <input
                        id="equiv-prev-hours-input"
                        type="number"
                        min="1"
                        max="300"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-850"
                        value={prevHours}
                        onChange={(e) => setPrevHours(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Disciplina Alvo da Estácio Unimeta *</label>
                    <select
                      id="equiv-target-disp-select"
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-800 cursor-pointer"
                      value={targetDiscipline}
                      onChange={(e) => setTargetDiscipline(e.target.value)}
                    >
                      <option value="Anatomia Dental e Cabeça">Anatomia Dental e Cabeça (80h)</option>
                      <option value="Patologia Bucal Integrada">Patologia Bucal Integrada (80h)</option>
                      <option value="Radiologia Odontológica e Imagenologia">Radiologia Odontológica e Imagenologia (80h)</option>
                      <option value="Cirurgia e Traumatologia Bucomaxilofacial I">Cirurgia e Traumatologia Bucomaxilofacial I (100h)</option>
                      <option value="Estágio Supervisionado Clínico I">Estágio Supervisionado Clínico I (120h)</option>
                    </select>
                  </div>

                  <button
                    id="btn-simulate-equiv-submit"
                    type="submit"
                    className="w-full rounded bg-orange-600 hover:bg-orange-700 text-white font-bold p-2.5 transition-colors active:scale-95"
                  >
                    Simular Compatibilidade
                  </button>
                </form>
              </div>

              {/* Compatibility result display */}
              <div className="lg:col-span-2">
                {equivalenceResults ? (
                  <motion.div
                    id="equivalence-results-match"
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-xl border p-6 h-full flex flex-col justify-between ${
                      equivalenceResults.compatible 
                        ? 'border-orange-200 bg-orange-50/25' 
                        : 'border-rose-200 bg-rose-50/25'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-3 ${equivalenceResults.compatible ? 'bg-orange-600 text-white' : 'bg-rose-600 text-white'}`}>
                          <Percent className="h-6 w-6 stroke-[2.5]" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">ÍNDICE DE COMPATIBILIDADE ESTIMADO</span>
                          <h4 className="text-xl font-bold text-slate-800 mt-0.5">{equivalenceResults.percentage}% de Similaridade</h4>
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      <div className="space-y-2">
                        <h5 className="font-bold text-slate-800 text-xs">Análise de Requisitos Regimentais:</h5>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">{equivalenceResults.notes}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px] pt-4 font-mono font-medium">
                        <div className="p-3 bg-white border border-slate-100 rounded-lg">
                          <span className="text-slate-400 block mb-0.5">EXIGIDO POR LEI (MEC)</span>
                          <strong className="text-slate-700 text-xs">Mínimo de 75%</strong> da similaridade programática ou carga horária superior.
                        </div>
                        <div className="p-3 bg-white border border-slate-100 rounded-lg">
                          <span className="text-slate-400 block mb-0.5">ANÁLISE DE HORAS</span>
                          <strong className={prevHours >= 80 ? 'text-orange-650 text-xs font-bold' : 'text-rose-600 text-xs font-bold'}>
                            {prevHours}h apresentadas / desejadas 80h+
                          </strong>
                        </div>
                      </div>
                    </div>

                    {equivalenceResults.compatible && (
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-orange-600 text-white rounded-lg gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold">Deseja formalizar esta dispensa?</p>
                          <p className="text-[10px] text-orange-100">Abra o Requerimento Acadêmico anexando suas ementas em PDF.</p>
                        </div>
                        <button
                          id="btn-apply-equiv-sia"
                          onClick={() => {
                            alert('Redirecionando para a área de envio de ementas do SIA Estácio...\n\nProcesso sugerido: Pedagógico -> Solicitação de Dispensa de Matéria.');
                            window.open('https://sia.estacio.br', '_blank');
                          }}
                          className="rounded bg-white text-orange-700 font-bold px-4 py-2 text-xs shrink-0 hover:bg-slate-50 cursor-pointer"
                        >
                          Ir Para Envio de Ementa
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center h-full flex flex-col items-center justify-center">
                    <Compass className="mx-auto h-12 w-12 text-slate-300 stroke-[1.2]" />
                    <h4 className="mt-4 font-bold text-slate-700 text-sm">Pronto para Simular</h4>
                    <p className="mt-2 text-xs text-slate-405 max-w-sm mx-auto leading-normal">
                      Insira os dados da ementa que você já realizou na sua instituição de origem à esquerda e clique em simular para receber uma estimativa automática de compatibilidade com a matriz Estácio Unimeta.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADMIN VIEWS SURVEY SUMMARY */}
        {activeTab === 'nps-results' && isAdmin && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Satisfação e Auditoria Discente (NPS & ISA)</h3>
                <p className="text-xs text-slate-400">Contabilização confidencial das opiniões de infraestrutura e satisfação.</p>
              </div>

              {/* Reset metrics option */}
              <button
                id="btn-clear-surveys"
                onClick={() => {
                  if (confirm('Deseja limpar todos os resultados arquivados das pesquisas para iniciar um novo ciclo semestral?')) {
                    localStorage.removeItem('nps_results_list');
                    localStorage.removeItem('isa_completed_list');
                    setNpsList([]);
                    setIsaList([]);
                  }
                }}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Limpar Métricas
              </button>
            </div>

            {/* Dashboard blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-white p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Média Geral de Notas (NPS)</span>
                  <p className="text-3xl font-extrabold text-orange-600 mt-1">{npsAverage}/10</p>
                </div>
                <p className="text-[10px] text-slate-405 mt-2">Média ponderada baseada em {totalNpsResponses} questionários clínicos preenchidos.</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">NPS Classificado Calculado</span>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-3xl font-extrabold text-amber-500">{npsCalculatedScore}</p>
                    <span className="text-[10.5px] font-bold text-slate-650 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                      {npsCalculatedScore >= 75 ? 'Excelente' : npsCalculatedScore >= 50 ? 'Aperfeiçoamento' : 'Crítico'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-405 mt-2">Promotoras (9-10): {promoterCount} | Detratores (0-6): {detractorCount}.</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Adesão de Engajamento ISA (SIA)</span>
                  <p className="text-3xl font-extrabold text-blue-600 mt-1">{isaList.length} Alunos</p>
                </div>
                <p className="text-[10px] text-slate-405 mt-2">Comprovantes de finalização validados para crédito de 5 horas complementares.</p>
              </div>
            </div>

            {/* Responses List */}
            <div className="rounded-xl border border-slate-100 bg-white p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-3">Feedbacks Detalhados dos Alunos</h4>
              
              {npsList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhum feedback de NPS foi enviado pelos discentes neste período.
                </div>
              ) : (
                <div className="divide-y divide-slate-105 max-h-[350px] overflow-y-auto pr-1">
                  {npsList.map((item, idx) => {
                    let scoreBg = 'bg-rose-100 text-rose-800';
                    if (item.score >= 9) scoreBg = 'bg-orange-100 text-orange-900';
                    else if (item.score >= 7) scoreBg = 'bg-amber-100 text-amber-805';

                    return (
                      <div key={idx} className="py-3 flex items-start justify-between gap-4 text-xs font-sans">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800">{item.userName}</span>
                            <span className="text-[9px] text-slate-400 font-mono">({item.userRole})</span>
                            <span className="text-[9px] text-slate-450 font-mono">{item.date}</span>
                          </div>
                          <p className="text-slate-650 italic leading-relaxed">
                            {item.feedback ? `"${item.feedback}"` : 'Sem comentários adicionais.'}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded font-extrabold font-mono text-center shrink-0 ${scoreBg}`}>
                          Nota: {item.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
