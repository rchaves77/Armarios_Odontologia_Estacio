/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smile, LogOut, Key, FileText, Globe, User, BookOpen, Clock, 
  Sparkles, ShieldCheck, Phone, Mail, GraduationCap 
} from 'lucide-react';
import { AuthUser } from './types';
import AuthScreen from './components/AuthScreen';
import LockersDashboard from './components/LockersDashboard';
import AcademicPortal from './components/AcademicPortal';
import TermoEstagioForm from './components/TermoEstagioForm';
import NpsPopups from './components/NpsPopups';

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeModule, setActiveModule] = useState<'portal' | 'chaves' | 'estagio'>('chaves');
  const [loading, setLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('unimeta_active_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Erro recuperando sessão de login", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    localStorage.setItem('unimeta_active_user', JSON.stringify(authenticatedUser));
    
    // Default module selection upon logging in (only 'chaves' is active for now)
    setActiveModule('chaves');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('unimeta_active_user');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-teal-600">
        <div className="text-center space-y-3">
          <GraduationCap className="h-10 w-10 animate-bounce mx-auto text-teal-600" />
          <p className="font-mono text-xs font-semibold">Iniciando canais Unimeta...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden selection:bg-orange-500/20">
      {/* Dynamic Popups based on role */}
      <NpsPopups user={user} />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-slate-900 flex-col border-r border-slate-800 shrink-0">
        <div className="p-5 flex flex-col gap-2 border-b border-slate-800 bg-[#0f172a]/40">
          <div className="flex items-center gap-3">
            <svg className="w-9 h-9 drop-shadow-md shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="miniGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE07D" />
                  <stop offset="100%" stopColor="#AA7C11" />
                </linearGradient>
                <linearGradient id="miniBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7CD4F5" />
                  <stop offset="100%" stopColor="#0D47A1" />
                </linearGradient>
              </defs>
              <path d="M 50,8 Q 74,10 74,33 C 74,55 55,67 50,71 C 45,67 26,55 26,33 Q 26,10 50,8 Z" fill="url(#miniGold)" />
              <path d="M 50,11 Q 71,13 71,33 C 71,52 54,63 50,67 C 46,63 29,52 29,33 Q 29,13 50,11 Z" fill="#0f172a" />
              <path d="M 50,12 Q 69,14 69,33 C 69,50 53,61 50,65 C 47,61 31,50 31,33 Q 31,14 50,12 Z" fill="url(#miniBlue)" />
              <rect x="48.5" y="15" width="3" height="42" fill="url(#miniGold)" rx="1" />
              <circle cx="50" cy="16" r="3.5" fill="url(#miniGold)" />
              <path d="M 50,53 C 58,50 58,45 50,42 C 41,39 41,34 50,31 C 57,28 57,23 50,20" stroke="url(#miniGold)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </svg>
            <h1 className="text-white font-extrabold text-xs tracking-tight uppercase leading-tight">
              Odontologia
              <br />
              <span className="text-[10px] text-orange-400 font-semibold normal-case not-italic block h-auto mt-0.5">Estácio Unimeta</span>
            </h1>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          {/* 
            Módulo Portal Acadêmico salvo para uso posterior:
            <button
              id="header-tab-portal"
              onClick={() => setActiveModule('portal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                activeModule === 'portal'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Portal Acadêmico</span>
            </button>
          */}

          <button
            id="header-tab-chaves"
            onClick={() => setActiveModule('chaves')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeModule === 'chaves'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Gestão de Chaves</span>
          </button>

          {/* 
            Módulo Termos de Estágio salvo para uso posterior:
            <button
              id="header-tab-estagio"
              onClick={() => setActiveModule('estagio')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                activeModule === 'estagio'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Termos de Estágio</span>
            </button>
          */}
        </nav>

        {/* User Identity Panel at Bottom of Desktop Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 shrink-0 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs uppercase shadow-inner">
                {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold text-white truncate leading-tight flex items-center gap-1">
                  {user.role === 'ADMIN' && <ShieldCheck className="h-3 w-3 text-orange-400 inline shrink-0" />}
                  {user.name.split(' ')[0]}
                </p>
                <p className="text-[9px] text-slate-400 truncate mt-0.5 leading-none uppercase tracking-wider font-mono">
                  {user.role === 'ADMIN' ? 'Administração' : user.role === 'PROFESSOR' ? 'Docente' : 'Discente Clínico'}
                </p>
              </div>
            </div>

            {/* Logout Link */}
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="rounded-lg h-7 w-7 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-1.5"
              title="Sair"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <header id="unimeta-top-navigation-header" className="md:hidden shrink-0 h-16 w-full border-b border-slate-200 bg-[#0f172a] text-white px-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-2.5">
            <svg className="w-9 h-9 drop-shadow-md shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="miniGoldMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE07D" />
                  <stop offset="100%" stopColor="#AA7C11" />
                </linearGradient>
                <linearGradient id="miniBlueMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7CD4F5" />
                  <stop offset="100%" stopColor="#0D47A1" />
                </linearGradient>
              </defs>
              <path d="M 50,8 Q 74,10 74,33 C 74,55 55,67 50,71 C 45,67 26,55 26,33 Q 26,10 50,8 Z" fill="url(#miniGoldMobile)" />
              <path d="M 50,11 Q 71,13 71,33 C 71,52 54,63 50,67 C 46,63 29,52 29,33 Q 29,13 50,11 Z" fill="#0f172a" />
              <path d="M 50,12 Q 69,14 69,33 C 69,50 53,61 50,65 C 47,61 31,50 31,33 Q 31,14 50,12 Z" fill="url(#miniBlueMobile)" />
              <rect x="48.5" y="15" width="3" height="42" fill="url(#miniGoldMobile)" rx="1" />
              <circle cx="50" cy="16" r="3.5" fill="url(#miniGoldMobile)" />
              <path d="M 50,53 C 58,50 58,45 50,42 C 41,39 41,34 50,31 C 57,28 57,23 50,20" stroke="url(#miniGoldMobile)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </svg>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-orange-400 font-extrabold font-mono block">ESTÁCIO UNIMETA</span>
              <h1 className="text-xs font-extrabold text-white tracking-tight leading-3">ODONTOLOGIA</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-xs uppercase">
              {user.name.charAt(0)}
            </div>
            <button
              id="btn-logout-mobile"
              onClick={handleLogout}
              className="rounded-lg h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 transition-colors cursor-pointer"
              title="Sair"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        {/* CORE WORKSPACE container (Content Render with Scrollable Viewport) */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 md:pb-8">
          {/* Module Render Container with motion transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {activeModule === 'portal' && <AcademicPortal user={user} />}
              {activeModule === 'chaves' && <LockersDashboard user={user} />}
              {activeModule === 'estagio' && <TermoEstagioForm user={user} />}
            </motion.div>
          </AnimatePresence>

          {/* Page Footer Credentials inside scroll */}
          <footer className="mt-12 text-center text-[10px] text-slate-400 font-mono tracking-wider space-y-1">
            <p className="uppercase">
              © {new Date().getFullYear()} Centro Universitário Estácio Unimeta | Coordenação de Odontologia
            </p>
            <p className="text-[9px] text-orange-600/70 uppercase">
              Desenvolvido por Rômulo Chaves - SerClin Tec
            </p>
            <p className="mt-1 text-[9px] text-slate-300">Conforme as diretivas regulamentadoras brasileiras (MEC/SIA).</p>
          </footer>
        </main>
      </div>

      {/* MOBILE LOWER NAVIGATION TAB BAR */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-lg border border-slate-200 p-1.5 rounded-2xl flex justify-around text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-xl">
        {/* 
          Mobile Portal Tab salva para uso posterior:
          <button
            id="mobile-tab-portal"
            onClick={() => setActiveModule('portal')}
            className={`flex-1 py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeModule === 'portal' ? 'text-orange-600 bg-orange-50/70' : 'text-slate-500'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Portal</span>
          </button>
        */}

        <button
          id="mobile-tab-chaves"
          onClick={() => setActiveModule('chaves')}
          className={`flex-1 py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
            activeModule === 'chaves' ? 'text-orange-600 bg-orange-50/70' : 'text-slate-500'
          }`}
        >
          <Key className="h-4 w-4" />
          <span>Gestão de Chaves</span>
        </button>

        {/* 
          Mobile Estagio Tab salva para uso posterior:
          <button
            id="mobile-tab-estagio"
            onClick={() => setActiveModule('estagio')}
            className={`flex-1 py-1.5 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
              activeModule === 'estagio' ? 'text-orange-600 bg-orange-50/70' : 'text-slate-500'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Estágio</span>
          </button>
        */}
      </div>
    </div>
  );
}
