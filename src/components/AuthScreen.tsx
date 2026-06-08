/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smile, Mail, Lock, Phone, User, GraduationCap, ShieldAlert, CheckCircle } from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { DEMO_ADMINS, DEMO_USERS } from '../data';

interface AuthScreenProps {
  onLogin: (user: AuthUser) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registration, setRegistration] = useState('');
  const [semester, setSemester] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-detect role from email domain
  const detectRole = (emailStr: string): UserRole => {
    const lower = emailStr.toLowerCase().trim();
    if (lower.endsWith('@estacio.br')) return 'ADMIN';
    if (lower.endsWith('@professores.estacio.br')) return 'PROFESSOR';
    return 'ALUNO'; // default if student or generic, but we enforce correct domains
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos do formulário.');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Look up in demo registers or localStorage
    const allRegistered: AuthUser[] = [
      ...DEMO_ADMINS,
      ...DEMO_USERS,
      ...JSON.parse(localStorage.getItem('unimeta_custom_users') || '[]'),
    ];

    const matchUser = allRegistered.find(u => u.email.toLowerCase() === cleanEmail);

    if (matchUser) {
      onLogin(matchUser);
    } else {
      // Allow seamless test login for arbitrary email under correct domains with mock generation
      const detected = detectRole(cleanEmail);
      let defaultReg = 'REG-' + Math.floor(1000 + Math.random() * 9000);
      
      const isEstacioDomain = cleanEmail.endsWith('@estacio.br') || 
                              cleanEmail.endsWith('@professores.estacio.br') || 
                              cleanEmail.endsWith('@alunos.estacio.br');
      
      if (!isEstacioDomain) {
        setError('O e-mail deve corresponder aos domínios institucionais: @estacio.br (Admin), @professores.estacio.br (Prof.) ou @alunos.estacio.br (Alun.).');
        return;
      }

      const generatedUser: AuthUser = {
        uid: 'user_' + Date.now(),
        name: name || cleanEmail.split('@')[0].replace('.', ' '),
        email: cleanEmail,
        phone: '(68) 99900-1122',
        role: detected,
        registrationNumber: defaultReg,
        semesterOfEntry: detected === 'ALUNO' ? '2026.1' : undefined
      };

      onLogin(generatedUser);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !phone) {
      setError('Por favor, preencha todos os campos com asterisco (*).');
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const role = detectRole(cleanEmail);

    const isEstacioDomain = cleanEmail.endsWith('@estacio.br') || 
                            cleanEmail.endsWith('@professores.estacio.br') || 
                            cleanEmail.endsWith('@alunos.estacio.br');

    if (!isEstacioDomain) {
      setError('Domínio de e-mail inválido! Use @estacio.br (Administrativos), @professores.estacio.br (Professores) ou @alunos.estacio.br (Alunos / Clínicos).');
      return;
    }

    // Save user to localStorage list of registered users
    const currentCustom = JSON.parse(localStorage.getItem('unimeta_custom_users') || '[]');
    
    if (currentCustom.some((u: AuthUser) => u.email.toLowerCase() === cleanEmail)) {
      setError('Este endereço de e-mail já está cadastrado no sistema.');
      return;
    }

    const newUser: AuthUser = {
      uid: 'u_' + Date.now(),
      name,
      email: cleanEmail,
      phone,
      role,
      registrationNumber: registration || '2026' + Math.floor(1000 + Math.random() * 9000),
      semesterOfEntry: role === 'ALUNO' ? (semester || '2026.1') : undefined
    };

    currentCustom.push(newUser);
    localStorage.setItem('unimeta_custom_users', JSON.stringify(currentCustom));

    setSuccess('Inscrição realizada com sucesso! Você já pode realizar o seu login.');
    setIsLogin(true);
    // Auto populate login fields
    setEmail(cleanEmail);
    setPassword('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090d16] bg-radial from-slate-900 via-[#030712] to-black px-4 py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Premium background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />
      
      <motion.div 
        id="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900/80 backdrop-blur-md p-8 shadow-2xl border border-slate-800/80 hover:border-orange-500/20 transition-all duration-300 relative z-10"
      >
        {/* Course Logo modeled after uploaded image */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-2 relative">
            <svg className="w-36 h-36 drop-shadow-[0_4px_12px_rgba(249,115,22,0.15)]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE07D" />
                  <stop offset="40%" stopColor="#D4AF37" />
                  <stop offset="70%" stopColor="#AA7C11" />
                  <stop offset="100%" stopColor="#FDF1A9" />
                </linearGradient>
                <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7CD4F5" />
                  <stop offset="50%" stopColor="#1E88E5" />
                  <stop offset="100%" stopColor="#0D47A1" />
                </linearGradient>
                <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF2B2" />
                  <stop offset="50%" stopColor="#CA9E27" />
                  <stop offset="100%" stopColor="#8A6623" />
                </linearGradient>
                <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8A6623" />
                  <stop offset="15%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#FFF2B2" />
                  <stop offset="85%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#8A6623" />
                </linearGradient>
              </defs>

              {/* Laurels Left Branch */}
              <g stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 68,145 C 42,135 32,105 32,75 C 32,50 45,30 57,20" />
                <path d="M 32,120 C 25,115 25,105 34,107 M 32,100 C 22,95 22,85 33,89 M 34,80 C 24,75 24,65 34,70 M 38,60 C 29,53 31,43 40,51 M 45,43 C 38,33 42,24 47,35" fill="url(#goldGrad)" />
              </g>

              {/* Laurels Right Branch */}
              <g stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 132,145 C 158,135 168,105 168,75 C 168,50 155,30 143,20" />
                <path d="M 168,120 C 175,115 175,105 166,107 M 168,100 C 178,95 178,85 167,89 M 166,80 C 176,75 176,65 166,70 M 162,60 C 171,53 169,43 160,51 M 155,43 C 162,33 158,24 153,35" fill="url(#goldGrad)" />
              </g>

              {/* Shield Outline Outer (Golden Thick Border) */}
              <path d="M 100,15 Q 148,18 148,65 C 148,110 110,135 100,143 C 90,135 52,110 52,65 Q 52,18 100,15 Z" fill="url(#shieldBorder)" />
              
              {/* Shield Inner Background Space */}
              <path d="M 100,20 Q 142,23 142,65 C 142,105 108,128 100,136 C 92,128 58,105 58,65 Q 58,23 100,20 Z" fill="#0f172a" />

              {/* Shield Core Blue Gradient */}
              <path d="M 100,22 Q 139,25 139,65 C 139,103 106,126 100,133 C 94,126 61,103 61,65 Q 61,25 100,22 Z" fill="url(#blueGrad)" />

              {/* Caduceus / Rod */}
              <g fill="url(#goldGrad)">
                <rect x="97" y="33" width="6" height="91" rx="2" />
                <circle cx="100" cy="33" r="7" />
                <path d="M 97,124 L 100,129 L 103,124 Z" />
              </g>

              {/* Snake (Gold coils winding up) */}
              <path d="M 100,111 C 115,106 115,96 100,91 C 82,86 82,76 100,71 C 118,66 118,56 100,51 C 85,48 85,43 100,40" 
                    stroke="url(#goldGrad)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              
              <path d="M 100,40 Q 95,38 95,35" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="95" cy="35" r="1.5" fill="#FFE07D" />

              {/* Gold Ribbon Banner */}
              <g>
                <path d="M 22,143 L 42,133 L 42,153 Z" fill="#604615" />
                <path d="M 178,143 L 158,133 L 158,153 Z" fill="#604615" />
                <path d="M 32,153 L 168,153 L 158,135 L 42,135 Z" fill="url(#ribbonGrad)" stroke="url(#shieldBorder)" strokeWidth="0.8" />
                <text x="100" y="148" fill="#0f172a" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1.5" fontFamily="sans-serif">
                  ODONTOLOGIA
                </text>
              </g>
            </svg>
          </div>
          
          <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
            Centro Universitário Estácio Unimeta
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-orange-400 font-bold font-mono mt-1">
            COORDENAÇÃO DE ODONTOLOGIA
          </span>
          <p className="mt-1 text-xs text-slate-400">
            {isLogin ? 'Controle de Chaves de Armários Acadêmicos' : 'Crie o seu perfil acadêmico integrado'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2 rounded-lg bg-rose-950/50 p-3 text-xs text-rose-300 border border-rose-900/50"
          >
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2 rounded-lg bg-orange-950/50 p-3 text-xs text-orange-300 border border-orange-900/50"
          >
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-orange-500" />
            <span>{success}</span>
          </motion.div>
        )}

        {isLogin ? (
          <form id="form-login" className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Institucional</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  placeholder="seu.nome@estacio.br"
                  className="w-full rounded-lg bg-slate-950/40 border border-slate-800 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 focus:outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Senha de Acesso</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-slate-950/40 border border-slate-800 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 focus:outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50 active:scale-[0.98] transition-all cursor-pointer"
            >
              Entrar na Plataforma
            </button>
          </form>
        ) : (
          <form id="form-register" className="space-y-3" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="register-name-input"
                  type="text"
                  required
                  placeholder="Mariana de Souza Costa"
                  className="w-full rounded-lg bg-slate-950/40 border border-slate-800 py-1.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Acadêmico / Funcional *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="register-email-input"
                  type="email"
                  required
                  placeholder="nome@alunos.estacio.br"
                  className="w-full rounded-lg bg-slate-950/40 border border-slate-800 py-1.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 block font-mono">
                Admins: @estacio.br | Professores: @professores.estacio.br | Alunos: @alunos.estacio.br
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Celular / WhatsApp *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Phone className="h-3 w-3" />
                  </span>
                  <input
                    id="register-phone-input"
                    type="tel"
                    required
                    placeholder="(68) 99200-1122"
                    className="w-full rounded-lg bg-slate-950/40 border border-slate-800 py-1.5 pl-8 pr-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nº Matrícula (Opcional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <GraduationCap className="h-3 w-3" />
                  </span>
                  <input
                    id="register-reg-input"
                    type="text"
                    placeholder="202601991"
                    className="w-full rounded-lg bg-slate-950/40 border border-slate-800 py-1.5 pl-8 pr-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {email.toLowerCase().includes('@alunos.estacio.br') && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Semestre de Ingresso</label>
                <input
                  id="register-semester-input"
                  type="text"
                  placeholder="Ex: 2026.1"
                  className="w-full rounded-lg bg-slate-950/40 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Defina uma Senha *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="register-password-input"
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg bg-slate-950/40 border border-slate-800 py-1.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              className="flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 active:scale-95 transition-all cursor-pointer"
            >
              Confirmar Cadastro e Perfil
            </button>
          </form>
        )}

        <div className="text-center pt-1.5">
          <button
            id="toggle-auth-mode-btn"
            type="button"
            className="text-xs text-orange-400 font-semibold hover:text-orange-300 hover:underline cursor-pointer"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
          >
            {isLogin ? 'Não possui uma conta? Cadastre-se na instituição' : 'Já possui cadastro? Realize o login'}
          </button>
        </div>

        {/* Access Demo Accounts Help */}
        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider mb-2">ACESSO DEMONSTRATIVO RÁPIDO:</p>
          <div className="grid grid-cols-3 gap-1.5 text-[9px]">
            <button
              id="quick-demo-admin-btn"
              type="button"
              className="rounded bg-slate-950/60 p-1 px-1.5 border border-slate-800 text-slate-300 hover:bg-orange-950/40 hover:text-orange-400 hover:border-orange-500/30 transition-all font-mono cursor-pointer"
              onClick={() => {
                setEmail('luciana.mendonca@estacio.br');
                setPassword('senha123');
                setIsLogin(true);
              }}
            >
              ADMIN <span className="block text-[8px] text-slate-500">@estacio.br</span>
            </button>
            <button
              id="quick-demo-prof-btn"
              type="button"
              className="rounded bg-slate-950/60 p-1 px-1.5 border border-slate-800 text-slate-300 hover:bg-orange-950/40 hover:text-orange-400 hover:border-orange-500/30 transition-all font-mono cursor-pointer"
              onClick={() => {
                setEmail('roberto.cavalcante@professores.estacio.br');
                setPassword('senha123');
                setIsLogin(true);
              }}
            >
              PROFESSOR <span className="block text-[8px] text-slate-500">@professores.estacio...</span>
            </button>
            <button
              id="quick-demo-student-btn"
              type="button"
              className="rounded bg-slate-950/60 p-1 px-1.5 border border-slate-800 text-slate-300 hover:bg-orange-950/40 hover:text-orange-400 hover:border-orange-500/30 transition-all font-mono cursor-pointer"
              onClick={() => {
                setEmail('mariana.silva@alunos.estacio.br');
                setPassword('senha123');
                setIsLogin(true);
              }}
            >
              ALUNO <span className="block text-[8px] text-slate-500">@alunos.estacio.br</span>
            </button>
          </div>
        </div>
      </motion.div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-500 font-mono tracking-wider">
        Desenvolvido por <span className="text-orange-400/80 font-bold">Rômulo Chaves - SerClin Tec</span>
      </div>
    </div>
  );
}
