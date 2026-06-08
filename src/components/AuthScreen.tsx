/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Mail, Lock, Phone, User, GraduationCap, ShieldAlert, CheckCircle, Camera } from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { DEMO_ADMINS, DEMO_USERS } from '../data';
import { ref, set, onValue } from 'firebase/database';
import { rtdb } from '../firebase';

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

  // Terms and conditions state
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Camera & Photo State
  const [showCamera, setShowCamera] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cached Firebase Users to support full cross-device login matching
  const [firebaseUsers, setFirebaseUsers] = useState<Record<string, any>>({});

  useEffect(() => {
    const unsubscribe = onValue(ref(rtdb, 'usuarios_termos'), (snapshot) => {
      if (snapshot.exists()) {
        setFirebaseUsers(snapshot.val());
      }
    }, (err) => {
      console.warn("Erro ao ler usuários cadastrados para login integrado:", err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError('');
    setCameraLoading(true);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' }
      });
      streamRef.current = stream;
      setShowCamera(true);
      // Wait a tick for videoRef to mount before binding
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (e: any) {
      console.error(e);
      setError('Não foi possível acessar a câmera do seu dispositivo. Por favor, libere as permissões de vídeo ou tente novamente.');
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoBase64(dataUrl);
      }
      stopCamera();
    }
  };

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

    // 1. Look up in Firebase registered users
    let matchUser: AuthUser | undefined = undefined;
    if (firebaseUsers) {
      const matchEntry = Object.entries(firebaseUsers).find(([uid, u]: [string, any]) => {
        return u.email?.toLowerCase().trim() === cleanEmail;
      });
      if (matchEntry) {
        const [uid, uRaw] = matchEntry;
        const u = uRaw as any;
        matchUser = {
          uid,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          registrationNumber: u.registrationNumber || '',
          semesterOfEntry: u.semesterOfEntry || undefined
        };
      }
    }

    // 2. Look up in demo registers or localStorage
    if (!matchUser) {
      const allRegistered: AuthUser[] = [
        ...DEMO_ADMINS,
        ...DEMO_USERS,
        ...JSON.parse(localStorage.getItem('unimeta_custom_users') || '[]'),
      ];
      matchUser = allRegistered.find(u => u.email.toLowerCase() === cleanEmail);
    }

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

    if (!photoBase64) {
      setError('Atenção: A captura da foto do seu rosto (📸 Tirar Foto) é obrigatória para habilitar o seu perfil clínico e possibilitar auditorias ou cobranças.');
      return;
    }

    if (!agreedToTerms) {
      setError('Atenção: Você precisa ler e aceitar o Termo de Responsabilidade e Uso da Estácio Unimeta para cadastrar seu perfil clínico.');
      return;
    }

    // Save user to localStorage list of registered users
    const currentCustom = JSON.parse(localStorage.getItem('unimeta_custom_users') || '[]');
    
    // Cross check in custom cache and Firebase users Cache
    const existsInLocal = currentCustom.some((u: AuthUser) => u.email.toLowerCase() === cleanEmail);
    const existsInFirebase = firebaseUsers && Object.values(firebaseUsers).some((u: any) => u.email?.toLowerCase().trim() === cleanEmail);
    
    if (existsInLocal || existsInFirebase) {
      setError('Este endereço de e-mail já está cadastrado no sistema.');
      return;
    }

    const newUser: AuthUser = {
      uid: 'u_' + Date.now(),
      name: name.toUpperCase(),
      email: cleanEmail,
      phone,
      role,
      registrationNumber: registration || '2026' + Math.floor(1000 + Math.random() * 9000),
      semesterOfEntry: role === 'ALUNO' ? (semester || '2026.1') : undefined
    };

    // Save to Firebase RTDB for full global accessibility
    set(ref(rtdb, `usuarios_termos/${newUser.uid}`), {
      uid: newUser.uid,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      registrationNumber: newUser.registrationNumber,
      semesterOfEntry: newUser.semesterOfEntry || "",
      foto: photoBase64
    }).then(() => {
      console.log("Cadastro persistido no Firebase com sucesso!");
    }).catch(err => {
      console.error("Database save failed:", err);
    });

    currentCustom.push(newUser);
    localStorage.setItem('unimeta_custom_users', JSON.stringify(currentCustom));

    setSuccess('Cadastro clínico realizado com sucesso! Sua foto facial foi vinculada e você já pode se autenticar.');
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

            {/* Registro de Foto Clínico Facial */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/25 p-3.5 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Camera className="h-4 w-4 text-orange-400" /> Foto Facial de Identificação *
              </label>

              {showCamera ? (
                <div className="space-y-3">
                  <div className="relative mx-auto rounded-xl overflow-hidden border border-orange-500/30 max-w-[220px] aspect-square bg-[#030712] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <div className="absolute inset-0 border-4 border-dashed border-orange-400/40 rounded-full m-6 animate-pulse pointer-events-none" />
                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                      Ao vivo
                    </span>
                  </div>
                  <div className="flex gap-2 justify-center max-w-[220px] mx-auto">
                    <button
                      id="btn-auth-capture-photo"
                      type="button"
                      onClick={capturePhoto}
                      className="w-full rounded bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-1.5 transition-all cursor-pointer shadow hover:shadow-orange-755"
                    >
                      Capturar Foto
                    </button>
                    <button
                      id="btn-auth-cancel-camera"
                      type="button"
                      onClick={stopCamera}
                      className="rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-1.5 px-3 transition-colors cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : photoBase64 ? (
                <div className="flex items-center gap-4 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                  <div className="relative shrink-0">
                    <img
                      src={photoBase64}
                      alt="Sua foto acadêmica"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-700 bg-slate-100"
                    />
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 p-0.5 rounded-full ring-2 ring-slate-900">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-950 fill-emerald-500 stroke-2" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[11px] font-bold text-teal-400">Foto Registrada com Sucesso!</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 leading-snug">Sua foto foi integrada ao seu perfil clínico de chaves.</p>
                    <button
                      id="btn-auth-retake-photo"
                      type="button"
                      onClick={startCamera}
                      className="text-[10px] text-orange-400 hover:text-orange-300 font-bold underline mt-1.5 block cursor-pointer"
                    >
                      Tirar Outra Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-900/60 flex items-center justify-center text-slate-400 mb-2">
                    <Camera className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal max-w-[240px] mx-auto">
                    A captura da foto facial é obrigatória para habilitar o seu perfil clínico no sistema.
                  </p>
                  <button
                    id="btn-auth-start-camera"
                    type="button"
                    onClick={startCamera}
                    disabled={cameraLoading}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors bg-orange-950/20 active:bg-orange-950/45 px-3 py-1.5 rounded-lg border border-orange-950 cursor-pointer"
                  >
                    {cameraLoading ? 'Iniciando câmera...' : 'Capturar Foto do Rosto'}
                  </button>
                </div>
              )}
            </div>

            {/* Termo de Responsabilidade e Uso */}
            <div className="space-y-2 border-t border-slate-850 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Termo de Responsabilidade *</span>
                <button
                  id="btn-auth-open-terms"
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[10px] text-orange-400 hover:text-orange-300 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  Ler em tela cheia / Imprimir Termo
                </button>
              </div>

              {/* Scrollable Terms Container */}
              <div className="w-full h-24 rounded-lg bg-slate-950/60 border border-slate-850 p-2.5 text-[9.5px] text-slate-400 overflow-y-auto leading-relaxed text-left scrollbar-thin select-none">
                <p className="font-extrabold text-slate-300 mb-1 uppercase text-[10px]">TERMO DE RESPONSABILIDADE E USO – ESTÁCIO UNIMETA</p>
                <p className="mb-2">O usuário declara estar ciente de que os armários da clínica são rotativos e destinados exclusivamente ao uso temporário durante as atividades acadêmicas.</p>
                <p className="mb-2">A Estácio Unimeta isenta-se de qualquer responsabilidade por perda, dano, dolo, furto ou sumiço de materiais, equipamentos ou valores guardados nos armários. O zelo pelo cadeado/chave e pelo conteúdo é de inteira responsabilidade do aluno.</p>
                <p>Ao final do semestre letivo, a chave deve ser devolvida imediatamente após o último uso, sob pena de bloqueio de uso no semestre seguinte.</p>
              </div>

              {/* Checkbox agreement */}
              <label 
                id="label-auth-agreement"
                className="flex items-start gap-2 text-[10px] text-slate-300 cursor-pointer select-none text-left pt-1"
              >
                <input
                  id="register-terms-checkbox"
                  type="checkbox"
                  className="rounded border-slate-800 text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-900 bg-slate-950 w-3.5 h-3.5 mt-0.5 shrink-0 cursor-pointer"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="leading-tight">
                  Li, entendi e concordo integralmente com os termos descritos no Termo de Responsabilidade e Uso da Estácio Unimeta. *
                </span>
              </label>
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

      {/* TERMO DE RESPONSABILIDADE MODAL */}
      <AnimatePresence>
        {showTermsModal && (
          <div id="terms-modal-overlay" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 text-orange-400">
                  <Smile className="h-5 w-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Termo de Responsabilidade</h3>
                </div>
                <button
                  id="btn-close-terms-modal"
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="text-slate-400 hover:text-white transition-colors text-xs font-bold font-mono px-2 py-1 rounded bg-slate-800"
                >
                  FECHAR
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 text-left leading-relaxed max-h-72 overflow-y-auto pr-2 scrollbar-thin">
                <p className="font-extrabold text-white text-center text-sm border-b border-slate-800 pb-2 mb-2 uppercase">
                  TERMO DE RESPONSABILIDADE E USO – ESTÁCIO UNIMETA
                </p>
                <div className="space-y-2.5">
                  <p className="p-3 bg-slate-950/40 rounded border border-slate-850 leading-normal">
                    <strong>1. Uso Temporário e Rotativo:</strong> O usuário declara estar ciente de que os armários da clínica são rotativos e destinados exclusivamente ao uso temporário durante as atividades acadêmicas.
                  </p>
                  <p className="p-3 bg-slate-950/40 rounded border border-slate-850 leading-normal">
                    <strong>2. Isenção de Responsabilidade de Perdas:</strong> A Estácio Unimeta isenta-se de qualquer responsabilidade por perda, dano, dolo, furto ou sumiço de materiais, equipamentos ou valores guardados nos armários. O zelo pelo cadeado/chave e pelo conteúdo é de inteira responsabilidade do aluno.
                  </p>
                  <p className="p-3 bg-slate-950/40 rounded border border-slate-850 leading-normal">
                    <strong>3. Devolução e Penalidades:</strong> Ao final do semestre letivo, a chave deve ser devolvida imediatamente após o último uso, sob pena de bloqueio de uso no semestre seguinte.
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-2">
                  * Este termo de responsabilidade constitui validação eletrônica em tempo de registro com foto oficial do estudante discente cadastrado no sistema.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  id="btn-print-terms-modal"
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-extrabold transition-all py-2.5 rounded-lg text-xs uppercase flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  🖨️ Imprimir Termo
                </button>
                <button
                  id="btn-agree-close-terms-modal"
                  type="button"
                  onClick={() => {
                    setAgreedToTerms(true);
                    setShowTermsModal(false);
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-extrabold transition-all py-2.5 rounded-lg text-xs uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  Concordar e Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT-ONLY CSS STYLES & PRINTABLE DOCUMENT */}
      <style>{`
        @media print {
          /* Hide all page content during print */
          body * {
            visibility: hidden !important;
          }
          /* Show only the targeted print element */
          #printable-term, #printable-term * {
            visibility: visible !important;
          }
          #printable-term {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            display: block !important;
            font-family: sans-serif !important;
          }
        }
      `}</style>

      {/* DOCUMENTO DE IMPRESSÃO (ESTÁTICO OU COM DADOS PREENCHIDOS) */}
      <div id="printable-term" className="hidden bg-white text-black p-10 max-w-4xl mx-auto font-sans text-xs tracking-normal leading-relaxed">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-extrabold uppercase text-black">Centro Universitário Estácio Unimeta</h1>
            <p className="text-[10px] uppercase text-gray-600 font-bold">Curso de Odontologia – Termo Clínico de Armários</p>
          </div>
          <div className="text-right text-[9px] text-gray-500 font-mono">
            MATRÍCULA: {registration || '________________'} <br />
            DATA EMISSÃO: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>

        <h2 className="text-center text-sm font-black uppercase text-black tracking-wide mb-6">
          TERMO DE RESPONSABILIDADE E USO DE ARMÁRIOS ACADÊMICOS
        </h2>

        {/* Informações do discente */}
        <div className="grid grid-cols-2 gap-4 border border-gray-300 p-4 rounded-md mb-6 bg-gray-50">
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase">Nome do Discente</p>
            <p className="font-extrabold text-black uppercase text-xs">{name || '_________________________________________'}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase">E-mail de Cadastro</p>
            <p className="font-bold text-black text-xs">{email || '_________________________________________'}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase">Celular / WhatsApp de Contato</p>
            <p className="font-bold text-black text-xs">{phone || '______________________'}</p>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-500 uppercase">Curso / Semestre</p>
            <p className="font-bold text-black text-xs">ODONTOLOGIA – {semester || '2026.1'}</p>
          </div>
        </div>

        {/* Texto do Termo */}
        <div className="space-y-4 text-gray-800 text-[11px] text-justify border border-gray-300 p-6 rounded-md mb-6 bg-white leading-relaxed">
          <p className="font-bold text-black">
            O usuário acima identificado declara estar ciente de que os armários da clínica são rotativos e destinados exclusivamente ao uso temporário durante as atividades acadêmicas.
          </p>
          <p>
            A Estácio Unimeta isenta-se de qualquer responsabilidade por perda, dano, dolo, furto ou sumiço de materiais, equipamentos ou valores guardados nos armários. O zelo pelo cadeado/chave e pelo conteúdo é de inteira responsabilidade do aluno.
          </p>
          <p className="font-semibold text-black">
            Ao final do semestre letivo, a chave deve ser devolvida imediatamente após o último uso, sob pena de bloqueio de uso no semestre seguinte.
          </p>
        </div>

        {/* Foto de identificação do print se existir */}
        <div className="mb-8 flex items-center gap-4 border border-gray-300 p-3 rounded-md w-fit">
          {photoBase64 ? (
            <img src={photoBase64} alt="Preenchimento Biométrico" className="w-16 h-16 object-cover rounded border border-gray-400 bg-gray-50" />
          ) : (
            <div className="w-16 h-16 border border-dashed border-gray-400 flex items-center justify-center text-[8px] text-gray-400 uppercase font-bold text-center leading-none p-1">
              Foto Facial Biométrica
            </div>
          )}
          <div>
            <h4 className="text-[10px] font-black uppercase text-black">Assinatura Biométrica Digital</h4>
            <p className="text-[9px] text-gray-500 leading-normal max-w-[280px]">
              O perfil clínico de usuário foi validado eletronicamente e atrelado com fotografia facial no banco de dados sincronizado.
            </p>
          </div>
        </div>

        {/* Linhas de Assinatura */}
        <div className="grid grid-cols-2 gap-12 mt-12 text-center text-xs pt-10">
          <div className="border-t border-gray-400 pt-3">
            <p className="font-black uppercase text-black text-[10px]">{name || 'Mariana de Souza Costa'}</p>
            <p className="text-[9px] text-gray-500 uppercase">Assinatura do Discente (Titular)</p>
          </div>
          <div className="border-t border-gray-400 pt-3">
            <p className="font-black uppercase text-black text-[10px]">Estácio Unimeta Práxis</p>
            <p className="text-[9px] text-gray-500 uppercase">Coordenação / Secretaria Odontologia</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-slate-500 font-mono tracking-wider">
        Desenvolvido por <span className="text-orange-400/80 font-bold">Rômulo Chaves - SerClin Tec</span>
      </div>
    </div>
  );
}
