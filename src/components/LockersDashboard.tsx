/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, Filter, Plus, Search, CheckCircle, RefreshCcw, 
  Send, AlertTriangle, Download, Database, Users, Check, Clock, Trash2, Edit3 
} from 'lucide-react';
import { AuthUser, CabinetKey, LoanDetails, KeyStatus, SyncLog } from '../types';
import { SEED_KEYS } from '../data';
import { ref, onValue, set, remove } from 'firebase/database';
import { rtdb } from '../firebase';

interface LockersDashboardProps {
  user: AuthUser;
}

export default function LockersDashboard({ user }: LockersDashboardProps) {
  const [keys, setKeys] = useState<CabinetKey[]>([]);
  const [selectedMapKey, setSelectedMapKey] = useState<CabinetKey | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterBlock, setFilterBlock] = useState<string>('todos');

  // Creation State
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newKeyNumber, setNewKeyNumber] = useState<number | ''>('');
  const [newKeyBlock, setNewKeyBlock] = useState('BLOCO C1');
  const [newKeyStatus, setNewKeyStatus] = useState<KeyStatus>('disponivel');

  // Loan/Devolution actions state
  const [isLoaningKey, setIsLoaningKey] = useState<CabinetKey | null>(null);
  const [loanName, setLoanName] = useState('');
  const [loanEmail, setLoanEmail] = useState('');
  const [loanPhone, setLoanPhone] = useState('');
  const [loanRole, setLoanRole] = useState<'ALUNO' | 'PROFESSOR'>('ALUNO');
  const [dueDate, setDueDate] = useState('2026-06-30');

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'alert'>('success');

  // Database Import State
  const [importText, setImportText] = useState('');
  const [showImporter, setShowImporter] = useState(false);

  // Sync System configuration state
  const [syncHistory, setSyncHistory] = useState<SyncLog[]>([]);
  const [autoSync, setAutoSync] = useState(true);

  // Load database and listen/sync with Firebase Realtime Database in real-time
  useEffect(() => {
    let currentUsuariosTermos: any = null;
    let currentArmarios: any = null;

    const buildKeysState = (usuarios: any, armarios: any) => {
      const updatedKeys: CabinetKey[] = [];
      const blocks = ['BLOCO C1', 'BLOCO C2', 'BLOCO C3'];
      
      blocks.forEach(block => {
        const prefix = block === 'BLOCO C1' ? 'C1' : block === 'BLOCO C2' ? 'C2' : 'C3';
        for (let i = 1; i <= 24; i++) {
          const dbKeyId = `${prefix}-${i}`;
          
          let status: KeyStatus = 'disponivel';
          let currentLoan: LoanDetails | null = null;
          
          // Check if active rental exists in Firebase "armarios" node
          const rental = armarios ? armarios[dbKeyId] : null;
          if (rental) {
            status = 'emprestada';
            
            // Try to find email from "usuarios_termos" matching the student uid/name
            let email = '';
            if (rental.uid && usuarios && usuarios[rental.uid]) {
              email = usuarios[rental.uid].email || '';
            }
            if (!email && rental.nome) {
              const sanitizedName = rental.nome.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ".");
              email = `${sanitizedName}@alunos.estacio.br`;
            }
            
            currentLoan = {
              userName: rental.nome || 'Identificado',
              userEmail: email,
              userPhone: rental.whats || '(68) 99999-9999',
              userRole: 'ALUNO',
              loanDate: rental.data || '2026-03-31',
              dueDate: '2026-06-30',
              semester: '2026.1'
            };
          }
          
          updatedKeys.push({
            id: dbKeyId,
            number: i,
            block,
            status,
            currentLoan,
            history: []
          });
        }
      });
      
      setKeys(updatedKeys);
    };

    let unsubscribeArmarios: () => void = () => {};
    let unsubscribeUsuarios: () => void = () => {};

    try {
      const armariosRef = ref(rtdb, 'armarios');
      unsubscribeArmarios = onValue(armariosRef, (snapshot) => {
        currentArmarios = snapshot.val();
        buildKeysState(currentUsuariosTermos, currentArmarios);
      }, (error) => {
        console.error("Firebase error loading armarios:", error);
      });

      const usuariosRef = ref(rtdb, 'usuarios_termos');
      unsubscribeUsuarios = onValue(usuariosRef, (snapshot) => {
        currentUsuariosTermos = snapshot.val();
        buildKeysState(currentUsuariosTermos, currentArmarios);
      }, (error) => {
        console.error("Firebase error loading usuarios_termos:", error);
      });
    } catch (e) {
      console.error("Error setting up Firebase RTDB subscriptions:", e);
      const stored = localStorage.getItem('unimeta_keys_db');
      if (stored) {
        setKeys(JSON.parse(stored));
      } else {
        setKeys(SEED_KEYS);
      }
    }

    // Seed Sync Historical Log
    const storedLogs = localStorage.getItem('unimeta_sync_logs');
    if (storedLogs) {
      setSyncHistory(JSON.parse(storedLogs));
    } else {
      const initialLogs: SyncLog[] = [
        { id: '1', timestamp: '2026-06-08 15:30:15', type: 'AUTO', status: 'SUCESSO', recordsSynced: 32, message: 'Dados escolares conectados em Tempo Real com o Firebase.' },
        { id: '2', timestamp: '2026-06-07 01:00:00', type: 'AUTO', status: 'SUCESSO', recordsSynced: 32, message: 'Sucesso de conexão com chaves-estacio.' }
      ];
      setSyncHistory(initialLogs);
      localStorage.setItem('unimeta_sync_logs', JSON.stringify(initialLogs));
    }

    return () => {
      unsubscribeArmarios();
      unsubscribeUsuarios();
    };
  }, []);

  const saveKeys = (updated: CabinetKey[]) => {
    setKeys(updated);
    localStorage.setItem('unimeta_keys_db', JSON.stringify(updated));
  };

  const triggerToast = (msg: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Create Key
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyNumber) return;

    // Check duplication
    const formattedId = `CH-${String(newKeyNumber).padStart(2, '0')}`;
    if (keys.some(k => k.id === formattedId)) {
      triggerToast(`Duplicado: A chave ${formattedId} já está registrada no estoque clínico.`, 'alert');
      return;
    }

    const newKey: CabinetKey = {
      id: formattedId,
      number: Number(newKeyNumber),
      block: newKeyBlock,
      status: newKeyStatus,
      currentLoan: null,
      history: []
    };

    const updated = [...keys, newKey].sort((a, b) => a.number - b.number);
    saveKeys(updated);
    setIsCreatingKey(false);
    setNewKeyNumber('');
    triggerToast(`Chave ${formattedId} cadastrada com sucesso!`);
  };

  // Perform Loan (Empréstimo sincronizado com Firebase)
  const handlePerformLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaningKey || !loanName || !loanEmail || !loanPhone) return;

    const emailDomain = loanEmail.toLowerCase().trim();
    if (loanRole === 'ALUNO' && !emailDomain.endsWith('@alunos.estacio.br')) {
      triggerToast('Alunos precisam possuir e-mail @alunos.estacio.br', 'alert');
      return;
    }
    if (loanRole === 'PROFESSOR' && !emailDomain.endsWith('@professores.estacio.br')) {
      triggerToast('Professores precisam possuir e-mail @professores.estacio.br', 'alert');
      return;
    }

    const dateStr = new Date().toLocaleDateString('pt-BR');

    try {
      set(ref(rtdb, `armarios/${isLoaningKey.id}`), {
        data: dateStr,
        nome: loanName.trim().toUpperCase(),
        whats: loanPhone.replace(/\D/g, ''),
        uid: ""
      }).then(() => {
        triggerToast(`Chave ${isLoaningKey.id} alocada com sucesso no Firebase!`);
      }).catch((err) => {
        console.error("Firebase error loaning key:", err);
        triggerToast("Erro de gravação no Firebase.", "alert");
      });
    } catch (err) {
      console.error(err);
    }

    setIsLoaningKey(null);
    setLoanName('');
    setLoanEmail('');
    setLoanPhone('');
  };

  // Perform Devolution (Devolução sincronizada com Firebase)
  const handleReceiveDevolution = (keyId: string) => {
    try {
      remove(ref(rtdb, `armarios/${keyId}`)).then(() => {
        triggerToast(`Delegação finalizada! O armário ${keyId} está livre no Firebase.`);
      }).catch((err) => {
        console.error("Firebase error returning key:", err);
        triggerToast("Erro de gravação no Firebase.", "alert");
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle maintenance state
  const handleToggleMaintenance = (keyId: string) => {
    const updated = keys.map(k => {
      if (k.id === keyId) {
        const targetStatus: KeyStatus = k.status === 'manutencao' ? 'disponivel' : 'manutencao';
        return { ...k, status: targetStatus };
      }
      return k;
    });
    saveKeys(updated);
    triggerToast(`Status da chave ${keyId} alterado.`);
  };

  // Delete key completely
  const handleDeleteKey = (keyId: string) => {
    if (confirm(`Tem certeza que deseja apagar a chave ${keyId} do sistema da clínica?`)) {
      const updated = keys.filter(k => k.id !== keyId);
      saveKeys(updated);
      triggerToast(`Chave ${keyId} removida permanentemente.`, 'alert');
    }
  };

  // MASS NOTIFICATION: Falar com todos os pendentes (Não devolveram no fim do semestre / Chave Atrasada)
  const handleSendMassReminder = () => {
    const pendents = keys.filter(k => k.status === 'atrasada' || (k.currentLoan && new Date(k.currentLoan.dueDate) < new Date()));
    
    if (pendents.length === 0) {
      triggerToast('Nenhuma chave com atraso ou pendência de devolução identificada para o semestre corrente.', 'alert');
      return;
    }

    // Simulate warning log sending
    const names = pendents.map(k => k.currentLoan?.userName).join(', ');
    triggerToast(`Comunicação Disparada em Massa! Alerta enviado para ${pendents.length} discentes pendentes: ${names}. Notificados no WhatsApp e Portal Aluno.`);
  };

  // SIMULATOR: Sync academics now
  const handleTriggerSyncNow = () => {
    // Generate new log
    const randomCount = Math.floor(10 + Math.random() * 40);
    const newLog: SyncLog = {
      id: String(syncHistory.length + 1),
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      type: 'MANUAL',
      status: 'SUCESSO',
      recordsSynced: randomCount,
      message: `Sincronização manual completada. ${randomCount} cadastros de alunos atualizados para o semestre vigente.`
    };

    const updatedLogs = [newLog, ...syncHistory];
    setSyncHistory(updatedLogs);
    localStorage.setItem('unimeta_sync_logs', JSON.stringify(updatedLogs));
    triggerToast(`Sistema Acadêmico Sincronizado! ${randomCount} alunos importados com sucesso.`);
  };

  // JSON MOUNT: Import Firebase Database and synchronize in Real-time
  const handleImportJson = () => {
    try {
      if (!importText.trim()) return;
      const parsed = JSON.parse(importText);
      
      // Check if it is the Firebase RTDB JSON structure with "armarios" or raw object map
      let armariosObj: any = null;
      if (parsed && typeof parsed === 'object') {
        if (parsed.armarios) {
          armariosObj = parsed.armarios;
        } else if (!Array.isArray(parsed)) {
          const keysList = Object.keys(parsed);
          if (keysList.length > 0 && keysList.every(k => k.includes('-') && typeof parsed[k] === 'object')) {
            armariosObj = parsed;
          }
        }
      }

      if (armariosObj) {
        set(ref(rtdb, 'armarios'), armariosObj).then(() => {
          triggerToast(`Coleção de armários sincronizada com sucesso no Firebase em Tempo Real!`);
          setShowImporter(false);
          setImportText('');
        }).catch((err) => {
          console.error("Firebase import set error:", err);
          triggerToast("Falha ao salvar dados de importação no Firebase.", "alert");
        });
        return;
      }

      // Basic type validation for traditional array of CabinetKeys
      if (Array.isArray(parsed)) {
        const newArmarios: any = {};
        parsed.forEach((item: any) => {
          if (item.status === 'emprestada' && item.currentLoan) {
            newArmarios[item.id] = {
              data: item.currentLoan.loanDate || new Date().toLocaleDateString('pt-BR'),
              nome: item.currentLoan.userName,
              whats: item.currentLoan.userPhone.replace(/\D/g, ''),
              uid: ""
            };
          }
        });

        set(ref(rtdb, 'armarios'), newArmarios).then(() => {
          triggerToast(`Armários importados e sincronizados no Firebase com sucesso!`);
          setShowImporter(false);
          setImportText('');
        }).catch((err) => {
          console.error("Firebase import array error:", err);
          triggerToast("Erro ao sincronizar lote com Firebase.", "alert");
        });
      } else {
        triggerToast('Formato JSON inválido. Cole a exportação do Firebase ou um array de chaves.', 'alert');
      }
    } catch (e) {
      triggerToast('Erro de sintaxe no JSON colado. Verifique os colchetes e vírgulas.', 'alert');
    }
  };

  // Generate Report of Pending Loans
  const generatePendingReport = () => {
    const delayLoans = keys.filter(k => k.status === 'atrasada' || k.currentLoan);
    let reportContent = `RELATORIO DE CHAVES PENDENTES - ODONTO ESTACIO UNIMETA\nGerado em: ${new Date().toLocaleDateString()}\n==================================================\n\n`;
    
    delayLoans.forEach(k => {
      if (k.currentLoan) {
        reportContent += `CHAVE: ${k.id} | Bloco: ${k.block}\n`;
        reportContent += `Status: ${k.status.toUpperCase()}\n`;
        reportContent += `Portador: ${k.currentLoan.userName} (${k.currentLoan.userRole})\n`;
        reportContent += `Contato: ${k.currentLoan.userPhone} | E-mail: ${k.currentLoan.userEmail}\n`;
        reportContent += `Data Empréstimo: ${k.currentLoan.loanDate} | Prazo Limite: ${k.currentLoan.dueDate}\n`;
        reportContent += `--------------------------------------------------\n`;
      }
    });

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_semanal_chaves_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    triggerToast('Relatório de pendências semanais exportado como arquivo TXT!');
  };

  // Filter logic
  const filteredKeys = keys.filter(k => {
    const matchesSearch = k.id.toLowerCase().includes(search.toLowerCase()) || 
                          k.block.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || k.status === filterStatus;
    const matchesBlock = filterBlock === 'todos' || k.block === filterBlock;
    return matchesSearch && matchesStatus && matchesBlock;
  });

  const availableCount = keys.filter(k => k.status === 'disponivel').length;
  const lentCount = keys.filter(k => k.status === 'emprestada').length;
  const overdueCount = keys.filter(k => k.status === 'atrasada').length;
  const maintenanceCount = keys.filter(k => k.status === 'manutencao').length;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Toast Notification Container */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg p-4 text-xs font-semibold text-white shadow-xl ${
              toastType === 'success' ? 'bg-teal-600' : 'bg-rose-600'
            }`}
          >
            {toastType === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN LEVEL CORE STATS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Chaves Livres</span>
            <h4 id="stat-livres" className="text-2xl font-bold text-teal-600 mt-1">{availableCount}</h4>
          </div>
          <div className="rounded-full bg-teal-50 p-2 text-teal-600">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Alojadas</span>
            <h4 id="stat-emprestadas" className="text-2xl font-bold text-blue-600 mt-1">{lentCount}</h4>
          </div>
          <div className="rounded-full bg-blue-50 p-2 text-blue-600">
            <Key className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Atrasos (Fim Semestre)</span>
            <h4 id="stat-atrasos" className="text-2xl font-bold text-rose-600 mt-1">{overdueCount}</h4>
          </div>
          <div className="rounded-full bg-rose-50 p-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Em Ajuste</span>
            <h4 id="stat-manutencao" className="text-2xl font-bold text-amber-500 mt-1">{maintenanceCount}</h4>
          </div>
          <div className="rounded-full bg-amber-50 p-2 text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* RECEPTIVE ROW: TOOL BUTTONS FOR ADMINISTRATIVE LEVEL */}
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-900 p-4 text-white">
          <div className="mr-auto font-sans">
            <h4 className="text-xs font-bold uppercase text-teal-400 tracking-wider font-mono">Consola de Recepção e Secretaria</h4>
            <p className="text-[10px] text-slate-300 mt-1">Sintonize os registros físicos com os canais do Firebase Estácio.</p>
          </div>

          <button
            id="btn-mass-reminder"
            onClick={handleSendMassReminder}
            className="flex items-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 font-bold px-4 py-2 text-xs transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" /> Cobrar Pendentes GERAL
          </button>

          <button
            id="btn-weekly-report"
            onClick={generatePendingReport}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold border border-slate-700 px-4 py-2 text-xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Relatório de Pendências
          </button>

          <button
            id="btn-trigger-firebase-import"
            onClick={() => setShowImporter(!showImporter)}
            className="flex items-center gap-1.5 rounded-lg bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-500/30 px-3.5 py-2 text-xs transition-colors cursor-pointer"
          >
            <Database className="h-3.5 w-3.5" /> Importar do Firebase
          </button>

          <button
            key="academic-sync-btn"
            id="btn-academic-sync"
            onClick={handleTriggerSyncNow}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold border border-slate-700 px-3.5 py-2 text-xs transition-colors cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5 text-teal-400 animate-spin-slow" /> Sincronizar SIA Acadêmico
          </button>
        </div>
      )}

      {/* FIREBASE IMPORTER SLIDE MODAL */}
      <AnimatePresence>
        {showImporter && (
          <motion.div
            id="firebase-importer-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-orange-200 bg-orange-50/40 p-5 mt-2"
          >
            <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wide font-mono flex items-center gap-1.5">
              <Database className="h-4 w-4" /> Importador de Lote Clínico (Firebase JSON)
            </h4>
            <p className="text-[11px] text-orange-900 mt-1 leading-relaxed">
              Cole abaixo o arranjo de chaves e registros em formato JSON recuperados do seu Firestore. O sistema converterá as propriedades mapeadas de forma automática para garantir a persistência discente.
            </p>
            <div className="mt-3 space-y-2">
              <textarea
                id="firebase-import-json-textarea"
                rows={5}
                className="w-full rounded-lg border border-orange-200 bg-white p-3 font-mono text-[10px] text-orange-950 focus:outline-none focus:ring-1 focus:ring-orange-600"
                placeholder={`[
  {
    "id": "CH-15",
    "number": 15,
    "block": "Clínica de Odonto - Ala C (Cirurgia)",
    "status": "disponivel"
  },
  {
    "id": "CH-16",
    "number": 16,
    "block": "Clínica de Odonto - Ala C (Cirurgia)",
    "status": "atrasada",
    "currentLoan": {
      "userName": "Carlos de Oliveira Nobre",
      "userEmail": "carlos.nobre@alunos.estacio.br",
      "userPhone": "(68) 98411-9211",
      "userRole": "ALUNO",
      "loanDate": "2026-02-10",
      "dueDate": "2026-06-01",
      "semester": "2026.1"
    }
  }
]`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="flex justify-between items-center text-[10px] text-orange-900">
                <button
                  id="btn-load-seed-for-import"
                  type="button"
                  onClick={() => {
                    setImportText(JSON.stringify([
                      { id: "C1-11", number: 11, block: "BLOCO C1", status: "disponivel" },
                      { id: "C1-12", number: 12, block: "BLOCO C1", status: "emprestada", currentLoan: { userName: "Karla Simões", userEmail: "karla.simoes@alunos.estacio.br", userPhone: "(68) 99933-2211", userRole: "ALUNO", loanDate: "2026-03-01", dueDate: "2026-06-30", semester: "2026.1" } }
                    ], null, 2));
                  }}
                  className="hover:underline font-semibold cursor-pointer"
                >
                  Carregar modelo de teste
                </button>
                <div className="flex gap-2">
                  <button
                    id="btn-cancel-import"
                    type="button"
                    onClick={() => setShowImporter(false)}
                    className="px-3 py-1 font-semibold hover:underline cursor-pointer"
                  >
                    Recusar
                  </button>
                  <button
                    id="btn-confirm-import"
                    type="button"
                    onClick={handleImportJson}
                    className="rounded bg-orange-700 hover:bg-orange-650 text-white font-bold px-4 py-1"
                  >
                    Sincronizar Lote
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAPA VISUAL DOS ARMÁRIOS (C1, C2, C3) */}
      <div id="unimeta-lockers-visual-occupancy-map" className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
          <div>
            <h3 className="text-xs font-bold uppercase text-teal-400 font-mono tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50"></span>
              Mapa de Ocupação dos Armários (C1, C2, C3)
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">Visão espacial em tempo real. Passe o cursor para ver quem ocupa ou clique no armário para interagir.</p>
          </div>
          <div className="flex gap-4 text-[10px] uppercase font-bold font-mono">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-b from-[#10B981] to-[#047857] border border-[#059669] block shadow-sm shadow-emerald-500/10"></span> 
              Disponível
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-b from-[#F43F5E] to-[#B91C1C] border border-[#BE123C] block shadow-sm shadow-rose-500/10"></span> 
              Alocado / Ocupado
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['BLOCO C1', 'BLOCO C2', 'BLOCO C3'].map(blockName => {
            const blockKeys = keys.filter(k => k.block === blockName || k.block?.toLowerCase() === blockName.toLowerCase()).sort((a,b) => a.number - b.number);
            const occupiedCount = blockKeys.filter(k => k.status !== 'disponivel').length;
            const availableCount = 24 - occupiedCount;

            return (
              <div key={blockName} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                    <h4 className="text-[13px] font-black tracking-widest text-[#0d47a1] uppercase flex items-center gap-1">
                      <span className="w-1.5 h-3 bg-[#0d47a1] rounded-full inline-block"></span>
                      {blockName}
                    </h4>
                    <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                      {occupiedCount} alocados / {availableCount} livres
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-8 gap-1.5">
                    {Array.from({ length: 24 }).map((_, idx) => {
                      const num = idx + 1;
                      const locker = blockKeys.find(k => k.number === num);
                      
                      const status = locker ? locker.status : 'disponivel';
                      const isAvailable = status === 'disponivel';
                      const currentLoan = locker ? locker.currentLoan : null;
                      
                      return (
                        <div key={num} className="relative group">
                          {/* Sophisticated Rich Tooltip on Hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[170px] bg-slate-900/95 backdrop-blur-md text-white text-[10px] p-2.5 rounded-xl border border-slate-850 shadow-2xl transition-all duration-200 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 z-35 font-medium text-center">
                            <div className="font-bold flex items-center justify-center gap-1.5 text-[11px] mb-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                              {isAvailable ? 'Armário Livre' : 'Armário Alocado'}
                            </div>
                            
                            {!isAvailable && currentLoan && (
                              <div className="border-t border-slate-800 pt-1.5 mt-1 space-y-0.5">
                                <p className="font-bold text-white leading-tight truncate max-w-[140px]">{currentLoan.userName}</p>
                                <p className="text-[8.5px] text-teal-400 uppercase font-mono font-bold">{currentLoan.userRole === 'ALUNO' ? 'Estudante' : 'Docente'}</p>
                                <p className="text-[8px] text-slate-400 font-normal">Prazo: {currentLoan.dueDate}</p>
                              </div>
                            )}

                            {isAvailable && (
                              <p className="text-[9px] text-slate-350 italic">Clique para alocar chaves</p>
                            )}

                            {/* Arrow Pointer */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                          </div>

                          <button
                            type="button"
                            id={`btn-map-locker-${blockName.replace(' ', '')}-${num}`}
                            onClick={() => {
                              if (locker) {
                                setSelectedMapKey(locker);
                              } else {
                                const formattedId = `${blockName === 'BLOCO C1' ? 'C1' : blockName === 'BLOCO C2' ? 'C2' : 'C3'}-${String(num).padStart(2, '0')}`;
                                const tempKey: CabinetKey = {
                                  id: formattedId,
                                  number: num,
                                  block: blockName,
                                  status: 'disponivel',
                                  currentLoan: null,
                                  history: []
                                };
                                setSelectedMapKey(tempKey);
                              }
                            }}
                            className={`w-full h-11 rounded-lg text-white font-extrabold text-[12px] flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer border relative ${
                              isAvailable 
                                ? 'bg-gradient-to-b from-emerald-500/90 to-emerald-650/95 hover:from-emerald-400 hover:to-emerald-600 border-emerald-400/30 shadow-xs shadow-emerald-500/5' 
                                : 'bg-gradient-to-b from-rose-500/90 to-red-650/95 hover:from-rose-450 hover:to-rose-600 border-rose-400/30 shadow-xs shadow-rose-500/5'
                            }`}
                          >
                            <span>{num}</span>
                            {!isAvailable && currentLoan && (
                              <span className="text-[7.5px] text-white/70 font-semibold tracking-tighter truncate w-full px-0.5 block max-w-[40px] text-center font-sans mt-0.2">
                                {currentLoan.userName.split(' ')[0]}
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FILTER & REGISTRY GRID */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-xs">
        {/* Filter header */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              id="search-dashboard-input"
              type="text"
              placeholder="Buscar chaves (ex: CH-01, bloco)..."
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Status Filter */}
            <select
              id="filter-status-select"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 focus:outline-none focus:border-orange-500 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="todos">Status: Todos</option>
              <option value="disponivel">Disponíveis</option>
              <option value="emprestada">Alocadas / Emprestadas</option>
              <option value="atrasada">Atraso de Devolução</option>
              <option value="manutencao">Manutenção técnica</option>
            </select>

            {/* Block Filter */}
            <select
              id="filter-block-select"
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 focus:outline-none focus:border-orange-500 cursor-pointer"
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
            >
              <option value="todos">Blocos: Todos</option>
              <option value="BLOCO C1">BLOCO C1</option>
              <option value="BLOCO C2">BLOCO C2</option>
              <option value="BLOCO C3">BLOCO C3</option>
            </select>

            {/* Admin: Create key action */}
            {isAdmin && (
              <button
                id="btn-open-create-drawer"
                onClick={() => setIsCreatingKey(!isCreatingKey)}
                className="flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 py-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Chave
              </button>
            )}
          </div>
        </div>

        {/* ADMIN DRAWER: CREATE KEY FORM */}
        <AnimatePresence>
          {isCreatingKey && (
            <motion.div
              id="create-key-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-50 p-4 border-b border-slate-100"
            >
              <form onSubmit={handleCreateKey} className="grid grid-cols-1 gap-3 sm:grid-cols-4 items-end text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nº da Chave / Armário *</label>
                  <input
                    id="new-key-num-input"
                    type="number"
                    required
                    min={1}
                    max={999}
                    placeholder="Ex: 12"
                    className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-slate-800"
                    value={newKeyNumber}
                    onChange={(e) => setNewKeyNumber(e.target.value ? Number(e.target.value) : '')}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Ala / Bloco Clínico</label>
                  <select
                    id="new-key-block-select"
                    className="w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800"
                    value={newKeyBlock}
                    onChange={(e) => setNewKeyBlock(e.target.value)}
                  >
                    <option value="BLOCO C1">BLOCO C1</option>
                    <option value="BLOCO C2">BLOCO C2</option>
                    <option value="BLOCO C3">BLOCO C3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Status Inicial</label>
                  <select
                    id="new-key-status-select"
                    className="w-full rounded border border-slate-200 bg-white p-1.5 text-slate-800"
                    value={newKeyStatus}
                    onChange={(e) => setNewKeyStatus(e.target.value as KeyStatus)}
                  >
                    <option value="disponivel">Disponível / Na Recepção</option>
                    <option value="manutencao">Em Manutenção Técnica</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    id="btn-submit-new-key"
                    type="submit"
                    className="flex-1 rounded bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5"
                  >
                    Salvar Registro
                  </button>
                  <button
                    id="btn-cancel-new-key"
                    type="button"
                    onClick={() => setIsCreatingKey(false)}
                    className="rounded border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRIMARY DATABASE MATRIX TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono border-b border-slate-100">
                <th className="p-4">Identificação</th>
                <th className="p-4">Ala / Armário Clinico</th>
                <th className="p-4">Disponibilidade</th>
                <th className="p-4">Situação / Portador Semestral</th>
                <th className="p-4 text-right">Ações de Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhuma chave de armário corresponds aos filtros de busca selecionados.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((k) => {
                  let statusBg = '';
                  let statusTextText = '';
                  if (k.status === 'disponivel') {
                    statusBg = 'bg-orange-50 text-orange-850 border border-orange-100';
                    statusTextText = 'Disponível';
                  } else if (k.status === 'emprestada') {
                    statusBg = 'bg-blue-50 text-blue-800 border border-blue-100';
                    statusTextText = 'Ocupado';
                  } else if (k.status === 'atrasada') {
                    statusBg = 'bg-rose-50 text-rose-800 border border-rose-100 animate-pulse';
                    statusTextText = 'Atrasado';
                  } else {
                    statusBg = 'bg-amber-100 text-amber-900';
                    statusTextText = 'Manutenção';
                  }

                  return (
                    <tr key={k.id} id={`row-key-${k.id}`} className="hover:bg-slate-50/50 transition-colors">
                      {/* Key code with custom icon layout */}
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                        <Key className={`h-4 w-4 shrink-0 ${k.status === 'disponivel' ? 'text-orange-500' : 'text-slate-400'}`} />
                        <span className="font-mono">{k.id}</span>
                      </td>

                      {/* Block locale */}
                      <td className="p-4 text-slate-600 font-medium">
                        {k.block}
                      </td>

                      {/* Badge representation */}
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBg}`}>
                          {statusTextText}
                        </span>
                      </td>

                      {/* Borrower information based on confidential level requested */}
                      <td className="p-4">
                        {k.currentLoan ? (
                          isAdmin ? (
                            // Full display for administrators with @estacio.br
                            <div className="space-y-1 font-sans">
                              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                {k.currentLoan.userName} 
                                <span className="text-[9px] px-1.5 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                                  {k.currentLoan.userRole}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">Tel: {k.currentLoan.userPhone} | {k.currentLoan.userEmail}</p>
                              <p className="text-[9px] text-slate-400 font-mono">Retirado: {k.currentLoan.loanDate} | Prazo: <strong className={k.status === 'atrasada' ? 'text-rose-600 font-bold' : ''}>{k.currentLoan.dueDate}</strong></p>
                            </div>
                          ) : (
                            // REDACTED view for professors and students: "não podem ver os donos das chaves"
                            <div className="text-slate-400 italic">
                              {/* If I am the borrower, permit me to see my own loan details */}
                              {user.email.toLowerCase().trim() === k.currentLoan.userEmail.toLowerCase().trim() ? (
                                <div className="space-y-0.5">
                                  <p className="text-orange-700 font-bold">Minha Chave Alocada</p>
                                  <p className="text-[9px] text-slate-500 font-mono">Devolução Limite: {k.currentLoan.dueDate}</p>
                                </div>
                              ) : (
                                <span>Dados Cadastrais Resguardados (Lei Geral LGPD/Estácio)</span>
                              )}
                            </div>
                          )
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px]">Chave guardada na recepção clínica</span>
                        )}
                      </td>

                      {/* Control buttons with active parameters */}
                      <td className="p-4 text-right">
                        {isAdmin ? (
                          <div className="flex justify-end items-center gap-1.5">
                            {/* Loan Action */}
                            {k.status === 'disponivel' && (
                              <button
                                id={`btn-loan-setup-${k.id}`}
                                onClick={() => setIsLoaningKey(k)}
                                className="rounded bg-orange-600 hover:bg-orange-700 text-white font-bold py-1 px-2.5 text-[10px]"
                              >
                                Emprestar
                              </button>
                            )}

                            {/* Devolution and Maintenance */}
                            {k.currentLoan && (
                              <button
                                id={`btn-return-action-${k.id}`}
                                onClick={() => handleReceiveDevolution(k.id)}
                                className="rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold py-1 px-2.5 text-[10px]"
                              >
                                Receber / Devolver
                              </button>
                            )}

                            <button
                              id={`btn-maint-action-${k.id}`}
                              onClick={() => handleToggleMaintenance(k.id)}
                              className="rounded border border-slate-200 hover:bg-slate-50 text-slate-600 p-1"
                              title="Alterar manutenção"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>

                            <button
                              id={`btn-delete-${k.id}`}
                              onClick={() => handleDeleteKey(k.id)}
                              className="rounded border border-rose-200 hover:bg-rose-50 text-rose-600 p-1"
                              title="Remover chave"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-slate-400 italic font-mono text-[11px]">
                            {/* Student can request support or return */}
                            {k.currentLoan?.userEmail === user.email ? (
                              <button
                                id={`btn-student-notif-ready-${k.id}`}
                                onClick={() => triggerToast(`Alerta de devolução da chave ${k.id} emitido para a coordenação.`)}
                                className="rounded bg-orange-50 border border-orange-200 text-orange-755 font-bold px-2 py-0.5 text-[10px]"
                              >
                                Notificar Devolução
                              </button>
                            ) : (
                              <span>Sem permissão</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOAN DIALOG MODAL FOR OFFICE ADMINS */}
      <AnimatePresence>
        {isLoaningKey && (
          <div id="loan-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              id="loan-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Key className="h-5 w-5 text-orange-600" />
                  Alocação Estagiária: Chave {isLoaningKey.id}
                </h3>
                <button
                  id="btn-close-loan-modal"
                  onClick={() => setIsLoaningKey(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePerformLoan} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qual o papel do portador?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="role-aluno-btn"
                      type="button"
                      onClick={() => {
                        setLoanRole('ALUNO');
                        if (loanEmail && !loanEmail.includes('@')) {
                          setLoanEmail(loanEmail + '@alunos.estacio.br');
                        }
                      }}
                      className={`py-2 rounded font-bold border transition-colors ${
                        loanRole === 'ALUNO' ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Aluno / Clínico
                    </button>
                    <button
                      id="role-professor-btn"
                      type="button"
                      onClick={() => {
                        setLoanRole('PROFESSOR');
                        if (loanEmail && !loanEmail.includes('@')) {
                          setLoanEmail(loanEmail + '@professores.estacio.br');
                        }
                      }}
                      className={`py-2 rounded font-bold border transition-colors ${
                        loanRole === 'PROFESSOR' ? 'bg-orange-600 text-white border-orange-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Professor / Supervisor
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nome Completo do Portador *</label>
                  <input
                    id="loan-user-name-input"
                    type="text"
                    required
                    placeholder="João Bezerra Neto"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800"
                    value={loanName}
                    onChange={(e) => setLoanName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">E-mail Institucional *</label>
                  <input
                    id="loan-user-email-input"
                    type="email"
                    required
                    placeholder={loanRole === 'ALUNO' ? "joao@alunos.estacio.br" : "joao@professores.estacio.br"}
                    className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800"
                    value={loanEmail}
                    onChange={(e) => setLoanEmail(e.target.value)}
                  />
                  <p className="text-[9px] text-slate-400 mt-1">Insira e-mails sob os endereços devidamente autorizados pela Estácio.</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Número de Telefone *</label>
                  <input
                    id="loan-user-phone-input"
                    type="tel"
                    required
                    placeholder="(68) 99244-1100"
                    className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800"
                    value={loanPhone}
                    onChange={(e) => setLoanPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prazo de Devolução (Fim Semestre) *</label>
                  <input
                    id="loan-due-date-input"
                    type="date"
                    required
                    className="w-full rounded border border-slate-200 px-3 py-2 text-slate-800"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    id="btn-confirm-loan-submit"
                    type="submit"
                    className="flex-1 rounded bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 shadow-xs"
                  >
                    Confirmar Empréstimo de Chave
                  </button>
                  <button
                    id="btn-cancel-loan-modal"
                    type="button"
                    onClick={() => setIsLoaningKey(null)}
                    className="rounded border border-slate-200 px-4 py-2 hover:bg-slate-50 text-slate-600 font-semibold"
                  >
                    Voltar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETALHES DO ARMÁRIO CLICADO NO MAPA */}
      <AnimatePresence>
        {selectedMapKey && (
          <div id="map-detail-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              id="map-detail-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Key className="h-5 w-5 text-orange-600" />
                  Visualização: Armário {selectedMapKey.id} ({selectedMapKey.block})
                </h3>
                <button
                  id="btn-close-map-detail"
                  onClick={() => setSelectedMapKey(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-450 font-mono">Disponibilidade Atual</p>
                    <h5 className="text-sm font-bold text-slate-800 mt-0.5">
                      {selectedMapKey.status === 'disponivel' ? 'Disponível na Recepção' : 
                       selectedMapKey.status === 'emprestada' ? 'Alocado / Ocupado' :
                       selectedMapKey.status === 'atrasada' ? 'Atraso de Devolução' : 'Em Manutenção Técnica'}
                    </h5>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    selectedMapKey.status === 'disponivel' ? 'bg-green-50 text-green-700 border border-green-200' :
                    selectedMapKey.status === 'emprestada' ? 'bg-blue-50 text-blue-800 border border-blue-150' : 'bg-rose-50 text-rose-800 border border-rose-250'
                  }`}>
                    {selectedMapKey.status}
                  </span>
                </div>

                {selectedMapKey.currentLoan ? (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 uppercase font-mono text-[10px] tracking-wide border-b border-slate-100 pb-1.5">Portador Ativo</h4>
                    {isAdmin ? (
                      <div className="space-y-2 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                          {selectedMapKey.currentLoan.userName}
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-150 text-slate-700 font-mono font-bold">
                            {selectedMapKey.currentLoan.userRole}
                          </span>
                        </p>
                        <div className="grid grid-cols-2 gap-3 text-slate-650 mt-2">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Telefone</p>
                            <p className="font-medium text-slate-800">{selectedMapKey.currentLoan.userPhone}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">E-mail</p>
                            <p className="font-medium text-slate-800 truncate" title={selectedMapKey.currentLoan.userEmail}>{selectedMapKey.currentLoan.userEmail}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Data Empréstimo</p>
                            <p className="font-mono font-medium text-slate-800">{selectedMapKey.currentLoan.loanDate}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Prazo Limite</p>
                            <p className="font-mono font-bold text-orange-600">{selectedMapKey.currentLoan.dueDate}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-550 italic bg-amber-50/40 rounded-xl border border-amber-100 leading-relaxed">
                        {user.email.toLowerCase().trim() === selectedMapKey.currentLoan.userEmail.toLowerCase().trim() ? (
                          <div className="space-y-2">
                            <p className="text-orange-700 font-bold text-sm">Este armário está alocado para você!</p>
                            <p className="text-[11px] non-italic text-slate-655">Prazo limite estabelecido para devolução das chaves: <strong className="font-bold">{selectedMapKey.currentLoan.dueDate}</strong>.</p>
                            <button
                              id="btn-notif-devolution-from-map"
                              type="button"
                              onClick={() => {
                                triggerToast(`Notificação de devolução enviada com sucesso para a recepção clínica.`);
                                setSelectedMapKey(null);
                              }}
                              className="mt-2 w-full rounded bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 cursor-pointer transition-colors"
                            >
                              Sinalizar Devolução à Recepção
                            </button>
                          </div>
                        ) : (
                          <span>Dados cadastrais resguardados eletronicamente sob diretrizes de segurança da Estácio de acordo com a LGPD.</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-slate-50/60 rounded-xl border border-slate-100 text-slate-500 space-y-2">
                    <p className="font-medium text-slate-600">Nenhum empréstimo ativo registrado.</p>
                    <p className="text-[10px] text-slate-400">O armário está limpo e disponível para novas alocações clínicas.</p>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  {isAdmin && (
                    <>
                      {selectedMapKey.status === 'disponivel' && (
                        <button
                          id="btn-loan-setup-from-map"
                          type="button"
                          onClick={() => {
                            const target = keys.find(k => k.id === selectedMapKey.id);
                            if (target) {
                              setIsLoaningKey(target);
                            } else {
                              setIsLoaningKey(selectedMapKey);
                            }
                            setSelectedMapKey(null);
                          }}
                          className="flex-1 rounded bg-[#22C55E] hover:bg-[#1faa4e] text-white font-bold py-2.5 transition-colors cursor-pointer"
                        >
                          Efetuar Empréstimo
                        </button>
                      )}
                      {selectedMapKey.currentLoan && (
                        <button
                          id="btn-return-action-from-map"
                          type="button"
                          onClick={() => {
                            handleReceiveDevolution(selectedMapKey.id);
                            setSelectedMapKey(null);
                          }}
                          className="flex-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 transition-colors cursor-pointer"
                        >
                          Devolver Chave
                        </button>
                      )}
                    </>
                  )}
                  <button
                    id="btn-close-map-detail-cancel"
                    type="button"
                    onClick={() => setSelectedMapKey(null)}
                    className="flex-1 rounded border border-slate-200 px-4 py-2.5 hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SYSTEM USERS REGISTRY & ACADEMIC GATEWAY SYNC (ADMIN ONLY) */}
      {isAdmin && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Complete Users Registry List */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50 mb-4 justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Cadastro de Usuários Clínicos Estácio
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">Integrado SIA</span>
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-normal">
              Abaixo são listados os discentes e docentes ativos cadastrados nesta plataforma de controle. Apenas administradores oficiais (`@estacio.br`) possuem visibilidade aos dados pessoais descritos.
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {[
                { name: "Mariana Costa Silva", email: "mariana.silva@alunos.estacio.br", phone: "(68) 99245-1289", role: "ALUNO", detail: "Semestre: 2024.1 | Matrícula: 202401889" },
                { name: "Thalles Henrique Ramos", email: "thalles.ramos@alunos.estacio.br", phone: "(68) 98401-4433", role: "ALUNO", detail: "Semestre: 2023.2 | Matrícula: 202302199" },
                { name: "Beatriz Nogueira Lima", email: "beatriz.lima@alunos.estacio.br", phone: "(68) 99201-9988", role: "ALUNO", detail: "Semestre: 2025.1 | Matrícula: 202501004" },
                { name: "Dr. Roberto Cavalcante", email: "roberto.cavalcante@professores.estacio.br", phone: "(68) 99912-3456", role: "PROFESSOR", detail: "ID Docente: PR-8812 (Dentística)" },
                ...JSON.parse(localStorage.getItem('unimeta_custom_users') || '[]').map((u: any) => ({
                  name: u.name,
                  email: u.email,
                  phone: u.phone,
                  role: u.role,
                  detail: u.role === 'ALUNO' ? `Semestre: ${u.semesterOfEntry || '2026.1'} | Matrícula: ${u.registrationNumber || ''}` : `Matrícula: ${u.registrationNumber || ''}`
                }))
              ].map((student, sidx) => (
                <div key={sidx} className="p-3 bg-slate-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between border border-slate-100 gap-2">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      {student.name}
                      <span className={`text-[8px] font-bold px-1.5 rounded ${
                        student.role === 'PROFESSOR' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.role}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono">E-mail: {student.email} | Cel: {student.phone}</p>
                    <p className="text-[9px] text-slate-400 font-medium">{student.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Gateway Sync Console Logs */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <RefreshCcw className="h-4 w-4" /> Gateway de Sincronização Acadêmica
              </h4>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 mr-1.5">Auto-Sincronismo:</span>
                <button
                  id="btn-toggle-auto-sync"
                  onClick={() => setAutoSync(!autoSync)}
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold text-white transition-colors cursor-pointer ${
                    autoSync ? 'bg-orange-600' : 'bg-slate-400'
                  }`}
                >
                  {autoSync ? 'ATIVADO' : 'DESACTIVADO'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-404 leading-normal">
              A sincronização agendada conecta a base local com os servidores SIA Estácio para suspender contas de alunos trancados e recuperar automaticamente termos de estágio pendentes e turmas correntes.
            </p>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 flex-1 font-mono text-[10px]">
              {syncHistory.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-900 text-slate-300 rounded border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-orange-400 font-semibold">{log.timestamp}</span>
                    <span className={`px-1 py-0.2 rounded font-bold ${
                      log.status === 'SUCESSO' ? 'bg-orange-950/50 text-orange-400' : 'bg-rose-900/50 text-rose-300'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-xs text-white mt-1">{log.message}</p>
                  <p className="text-[9px] text-slate-500">Tipo: {log.type} | Registros atualizados: {log.recordsSynced}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
