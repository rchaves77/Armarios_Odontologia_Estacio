/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Star, CheckSquare, Sparkles, X, Heart } from 'lucide-react';
import { AuthUser } from '../types';

interface NpsPopupsProps {
  user: AuthUser;
}

export default function NpsPopups({ user }: NpsPopupsProps) {
  const [showNPS, setShowNPS] = useState(false);
  const [showISA, setShowISA] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [completedNPS, setCompletedNPS] = useState(false);
  const [completedISA, setCompletedISA] = useState(false);

  useEffect(() => {
    // Check local storage so we only prompt if they haven't answered yet in this simulation
    const npsDone = localStorage.getItem(`nps_done_${user.uid}`);
    const isaDone = localStorage.getItem(`isa_done_${user.uid}`);

    // If student or professor, trigger popups with a slight delay
    if (user.role !== 'ADMIN') {
      if (!npsDone) {
        const timer = setTimeout(() => setShowNPS(true), 3000);
        return () => clearTimeout(timer);
      } else if (!isaDone) {
        const timer = setTimeout(() => setShowISA(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  const handleSubmitNps = () => {
    if (score === null) return;
    
    // Save to local storage
    const list = JSON.parse(localStorage.getItem('nps_results_list') || '[]');
    list.push({
      uid: user.uid,
      userName: user.name,
      userRole: user.role,
      userEmail: user.email,
      score,
      feedback,
      date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('nps_results_list', JSON.stringify(list));
    localStorage.setItem(`nps_done_${user.uid}`, 'true');

    setCompletedNPS(true);
    setTimeout(() => {
      setShowNPS(false);
      // Offer ISA survey right after
      const isaDone = localStorage.getItem(`isa_done_${user.uid}`);
      if (!isaDone) {
        setShowISA(true);
      }
    }, 2000);
  };

  const handleCompleteIsa = () => {
    localStorage.setItem(`isa_done_${user.uid}`, 'true');
    const list = JSON.parse(localStorage.getItem('isa_completed_list') || '[]');
    list.push({
      uid: user.uid,
      userName: user.name,
      email: user.email,
      date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('isa_completed_list', JSON.stringify(list));

    setCompletedISA(true);
    setTimeout(() => {
      setShowISA(false);
    }, 2500);
  };

  return (
    <>
      {/* NPS POPUP */}
      <AnimatePresence>
        {showNPS && (
          <div id="nps-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <motion.div
              id="nps-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-orange-50"
            >
              {/* Close Button */}
              <button
                id="btn-close-nps"
                onClick={() => setShowNPS(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {!completedNPS ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                      <Star className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        Pesquisa Net Promoter Score (NPS)
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Curso de Odontologia Estácio Unimeta</p>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <p className="text-sm leading-relaxed text-slate-600">
                    Olá, <strong className="text-slate-800">{user.name}</strong>! De 0 a 10, qual a probabilidade de você recomendar o curso de Odontologia da Estácio Unimeta para um amigo ou colega?
                  </p>

                  {/* NPS Scale 0 to 10 */}
                  <div className="grid grid-cols-11 gap-1">
                    {Array.from({ length: 11 }).map((_, i) => {
                      const isSelected = score === i;
                      const isPromoter = i >= 9;
                      const isPassive = i === 7 || i === 8;
                      const isDetractor = i <= 6;
                      
                      let btnBg = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600';
                      if (isSelected) {
                        if (isPromoter) btnBg = 'bg-orange-600 border-orange-600 text-white shadow-md';
                        else if (isPassive) btnBg = 'bg-amber-500 border-amber-500 text-white shadow-md';
                        else btnBg = 'bg-rose-500 border-rose-500 text-white shadow-md';
                      }

                      return (
                        <button
                          key={i}
                          id={`nps-btn-${i}`}
                          type="button"
                          onClick={() => setScore(i)}
                          className={`flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${btnBg}`}
                        >
                          {i}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0 - Extremamente Improvável</span>
                    <span>10 - Extremamente Provável</span>
                  </div>

                  {/* Comment box */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Opcional: Deixe sua sugestão ou crítica para melhorarmos o curso:</label>
                    <textarea
                      id="nps-feedback-textarea"
                      rows={2}
                      placeholder="Estrutura de clínicas, materiais disponíveis, professores, etc..."
                      className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      id="btn-nps-skip"
                      type="button"
                      onClick={() => setShowNPS(false)}
                      className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Pular agora
                    </button>
                    <button
                      id="btn-nps-submit"
                      type="button"
                      disabled={score === null}
                      onClick={handleSubmitNps}
                      className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all focus:outline-none ${
                        score === null 
                          ? 'bg-slate-300 cursor-not-allowed' 
                          : 'bg-orange-600 hover:bg-orange-700 active:scale-95'
                      }`}
                    >
                      Enviar Avaliação
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 shadow-inner">
                    <Heart className="h-10 w-10 text-orange-500 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Sua opinião vale muito!</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Obrigado por ajudar a elevar a qualidade do curso de Odontologia Estácio Unimeta. Suas respostas foram salvas com sucesso.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ISA PROMO BANNER (Avaliação do Vestibular ou de Desempenho ISA Estácio) */}
      <AnimatePresence>
        {showISA && (
          <div id="isa-banner-overlay" className="fixed bottom-4 right-4 z-50 max-w-md w-full px-4">
            <motion.div
              id="isa-banner"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="overflow-hidden rounded-xl bg-slate-900 text-white shadow-2xl border border-orange-500/30 p-5 relative"
            >
              <button
                id="btn-close-isa"
                onClick={() => setShowISA(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {!completedISA ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-orange-500/20 p-1.5 text-orange-400 border border-orange-500/20 font-mono">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">Participe da Avaliação ISA 2026!</h4>
                      <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider font-mono">Pesquisa de Engajamento Acadêmico</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    A Pesquisa ISA ajuda a validar a experiência discente. Responda o questionário oficial integrado no SIA e colabore para as melhorias das notas de regulação do MEC do nosso curso!
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      id="btn-isa-apply"
                      onClick={handleCompleteIsa}
                      className="flex-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs text-white font-bold py-2 focus:outline-none transition-colors active:scale-95 text-center cursor-pointer"
                    >
                      Já Respondi no SIA (Ganhar 5 Horas AAC)
                    </button>
                    <a
                      id="link-isa-portal"
                      href="https://sia.estacio.br"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-[11px] text-slate-300 font-semibold px-3 py-2 text-center transition-colors"
                    >
                      Acessar SIA
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 py-2 text-orange-400">
                  <div className="rounded-full bg-orange-500/20 p-2 text-orange-400">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Excelente, obrigado!</h5>
                    <p className="text-[10px] text-slate-400">Sua participação foi registrada e <strong>5 Horas AAC</strong> de atividades complementares foram reservadas para seu perfil.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
