import { TimeSystem } from './systems/timeSystem.js';
import { EventSystem } from './systems/eventSystem.js';
import { LessonSystem } from './systems/lessonSystem.js';
import { FacultySystem } from './systems/facultySystem.js';

export class UserInterface {
    constructor(classroom, behaviorSystem, schoolClasses) {
        this.classroom = classroom;
        this.behaviorSystem = behaviorSystem;
        this.schoolClasses = schoolClasses;
        this.timeSystem = new TimeSystem();
        this.eventSystem = new EventSystem();
        this.lessonSystem = new LessonSystem();
        this.facultySystem = new FacultySystem();
        this.html5QrCode = null;
        
        this.isRollCallMapView = false;
        this.isTeacherWriting = false; 
        this.selectedGradeSubjectFilter = 'Tutte';

        // 🏆 Scudetti e XP Docente (Partenza a 0 e tutti bloccati)
        this.teacherXp = 0;
        this.teacherLevel = 1;
        this.badgesUnlocked = [
            { id: 'appello', title: '📋 Maestro dell\'Appello', desc: 'Completa 5 appelli in aula per sbloccarlo', progress: '0 / 5', unlocked: false },
            { id: 'chat', title: '💬 Saggio del Collegio', desc: 'Invia almeno 3 messaggi nella chat dei docenti', progress: '0 / 3', unlocked: false },
            { id: 'lezione', title: '🚀 Oratore Illuminato', desc: 'Avvia lezioni interattive per un totale di 3 ore', progress: '0 / 3', unlocked: false },
            { id: 'voti', title: '📊 Giudice Imparziale', desc: 'Registra almeno 10 valutazioni nel libretto', progress: '0 / 10', unlocked: false },
            { id: 'scudetto_oro', title: '🌟 Docente d\'Eccellenza', desc: 'Raggiungi il livello 3 di attività didattica', progress: 'Livello 1 / 3', unlocked: false }
        ];

        this.competencyRecords = new Map(); 
        this.voiceMemos = [];

        // 📖 Stato del Libro Interattivo nell'Account
        this.activeBookPage = 1;

        this.teacherProfile = {
            id: 'lorenzo',
            email: "lorenzo.piccinin@scuola.it",
            password: "lorenzo2026!",
            fullName: "Lorenzo Piccinin",
            role: "Referente Didattico & Amministratore",
            isAdmin: true,
            subjects: ["Psicologia", "Scienze", "Sostegno"],
            classes: ["1ª A", "1ª B", "2ª A", "2ª B", "3ª A", "3ª B", "5ª A", "5ª B"],
            availability: "Pomeriggio & Sera",
            theme: localStorage.getItem('prof_simulator_theme') || "classic"
        };

        this.professorsList = [
            {
                id: 'lorenzo',
                name: 'Lorenzo Piccinin',
                email: 'lorenzo.piccinin@scuola.it',
                password: 'lorenzo2026!',
                subjects: ['Psicologia', 'Scienze', 'Sostegno'],
                classes: ['1ª A', '1ª B', '2ª A', '2ª B', '3ª A', '3ª B', '5ª A', '5ª B'],
                availability: 'Pomeriggio & Sera',
                isAdmin: true,
                qrCodeData: 'PROF_LORENZO'
            },
            {
                id: 'matteo',
                name: 'Matteo Piccinin',
                email: 'matteo.piccinin@scuola.it',
                password: 'matteo2026!',
                subjects: ['Chimica', 'Scienze della Terra', 'Scienze Forensi', 'Laboratorio Scientifico'],
                classes: ['2ª A', '2ª B', '3ª A', '3ª B', '5ª A', '5ª B'],
                availability: 'Pomeriggio',
                isAdmin: false,
                qrCodeData: 'PROF_MATTEO'
            },
            {
                id: 'miguel',
                name: 'Miguel Milliozzi',
                email: 'miguel.milliozzi@scuola.it',
                password: 'miguel2026!',
                subjects: ['Inglese', 'Conversation', 'Grammatica Inglese'],
                classes: ['1ª A', '1ª B', '2ª A', '2ª B', '3ª A', '3ª B'],
                availability: 'Pomeriggio',
                isAdmin: false,
                qrCodeData: 'PROF_MIGUEL'
            },
            {
                id: 'lisa',
                name: 'Lisa Zhang',
                email: 'lisa.zhang@scuola.it',
                password: 'lisa2026!',
                subjects: ['Matematica', 'Algebra', 'Geometria', 'Statistica'],
                classes: ['1ª A', '1ª B', '2ª A', '2ª B', '4ª A', '4ª B'],
                availability: 'Pomeriggio',
                isAdmin: false,
                qrCodeData: 'PROF_LISA'
            },
            {
                id: 'giulia',
                name: 'Giulia Ponte',
                email: 'giulia.ponte@scuola.it',
                password: 'giulia2026!',
                subjects: ['Pasticceria', 'Tecniche di Sala', 'Laboratorio Dolciario', 'HACCP'],
                classes: ['5ª A', '5ª B'],
                availability: 'Corsi Serali (20:00 - 21:00)',
                isAdmin: false,
                qrCodeData: 'PROF_GIULIA'
            }
        ];

        this.weeklySchedule = {
            "Martedì": {
                0: [{ materia: "Psicologia", prof: "Lorenzo Piccinin", classe: "1ª A" }],
                1: [{ materia: "Conversation", prof: "Miguel Milliozzi", classe: "1ª A" }],
                2: [{ materia: "Matematica", prof: "Lisa Zhang", classe: "1ª A" }],
                4: [{ materia: "Pasticceria", prof: "Giulia Ponte", classe: "5ª A" }],
                5: [{ materia: "Pasticceria", prof: "Giulia Ponte", classe: "5ª A" }]
            }
        };

        this.weeklyHistory = {};
        this.pendingProfileUpdates = [];
        this.studentStates = new Map();
        this.studentRealPresence = new Map();
        this.studentJustified = new Map();
        this.studentQuestions = new Map();
        this.studentEmotions = new Map(); 
        this.materials = [];
        this.pendingExams = [];
        this.activeExam = null;
        this.notes = [];
        this.hasExplained = false;
        this.lastExplanationText = ""; 
        this.activeChatProfId = 'matteo';
        this.currentAppelloIndex = 0;

        this.chatMessages = { 'matteo': [], 'miguel': [], 'lisa': [], 'giulia': [] };
    }

    init() {
        if (!this.classroom && this.schoolClasses) {
            this.classroom = this.schoolClasses.get("1ª A");
        }

        // Rimozione automatica di qualsiasi residuo del tasto ricreazione nell'HTML
        document.querySelectorAll('button, a, span').forEach(el => {
            if (el.innerText && el.innerText.includes('Ricreazione')) {
                el.remove();
            }
        });

        this.registerGlobalWindowFunctions();
        this.initClassroomStates();
        this.injectMissingHtmlComponents();
        this.injectToastContainer();

        // 🔄 Ripristina Sessione e Tema Salvati per evitare Logout all'F5
        this.loadSavedSessionAndTheme();

        this.updateHeaderTitle();
        this.applyRoleBasedUI();
        this.renderAppello();
        this.renderClassroomGrid();
        this.renderVoti();
        this.populateNoteSelector();
        this.renderFacultyChatList();
        this.renderPrivateChatMessages();
        this.renderInteractiveSchedule();
        this.renderPersonalDocentSchedule();
        this.updateTimeDisplay();
        this.updateScheduleStatusBadge();
        this.renderMaterials();
        this.renderPendingExams();
        this.populateAccountTab();
    }

    loadSavedSessionAndTheme() {
        // 1. Carica e applica il tema salvato
        const savedTheme = localStorage.getItem('prof_simulator_theme') || 'classic';
        this.applyTheme(savedTheme);

        // 2. Controlla se c'è un utente loggato in precedenza
        const savedUser = localStorage.getItem('prof_simulator_user');
        if (savedUser) {
            try {
                const userObj = JSON.parse(savedUser);
                const foundProf = this.professorsList.find(p => p.id === userObj.id);
                if (foundProf) {
                    this.teacherProfile = {
                        id: foundProf.id,
                        email: foundProf.email,
                        fullName: foundProf.name,
                        role: foundProf.isAdmin ? "Referente Didattico & Amministratore" : "Docente",
                        isAdmin: foundProf.isAdmin,
                        subjects: foundProf.subjects,
                        classes: foundProf.classes,
                        availability: foundProf.availability,
                        theme: savedTheme
                    };

                    if (foundProf.classes && foundProf.classes.length > 0 && this.schoolClasses) {
                        const defaultClass = foundProf.classes[0];
                        if (this.schoolClasses.has(defaultClass)) { this.classroom = this.schoolClasses.get(defaultClass); }
                    }

                    const loginScreen = document.getElementById('login-screen');
                    if (loginScreen) loginScreen.style.display = 'none';
                }
            } catch (e) {
                console.error("Errore nel ripristino della sessione:", e);
            }
        }
    }

    registerGlobalWindowFunctions() {
        window.currentUiInstance = this;
        window.switchTab = (tabId, element) => { this.switchTabImplementation(tabId, element); };
        window.switchLoginTab = (mode) => { this.switchLoginTabImplementation(mode); };
        window.startCameraScan = () => { this.startCameraScanImplementation(); };
        window.stopCameraScan = () => { this.stopCameraScanImplementation(); };
        window.executeSecureLogin = () => { this.executeSecureLoginImplementation(); };
        window.handleLogout = () => { this.handleLogoutImplementation(); };
        window.toggleRollCallView = () => { this.isRollCallMapView = !this.isRollCallMapView; this.renderAppello(); };
        window.checkSingleStudentPresence = (studentId) => { this.checkSingleStudentPresenceImplementation(studentId); };
        window.setStudentAttendance = (studentId, status) => { this.setStudentAttendanceImplementation(studentId, status); };
        window.openJustificationModal = (studentId) => { this.openJustificationModalImplementation(studentId); };
        window.markAllPresent = () => { this.markAllPresentImplementation(); };
        window.startInteractiveLesson = () => { this.startInteractiveLessonImplementation(); };
        window.sendTeacherSpeech = () => { this.sendTeacherSpeechImplementation(); };
        window.answerStudentQuestion = (studentId) => { this.answerStudentQuestionImplementation(studentId); };
        window.playStudentAudioPronunciation = (studentName, targetWord) => { this.playStudentAudioPronunciationImplementation(studentName, targetWord); };
        window.openEvaluationModal = (studentId, studentName, defaultLevel, defaultFeedback) => { this.openEvaluationModalImplementation(studentId, studentName, defaultLevel, defaultFeedback); };
        window.sendFacultyChatMessage = () => { this.sendFacultyChatMessageImplementation(); };
        window.selectFacultyChat = (profId) => { this.activeChatProfId = profId; this.renderFacultyChatList(); this.renderPrivateChatMessages(); };
        window.openClassSelectionModal = () => { this.openClassSelectionModalImplementation(); };
        window.addMaterial = () => { this.addMaterialImplementation(); };
        window.assignExam = () => { this.assignExamImplementation(); };
        window.collectExamsEndHour = () => { this.collectExamsEndHourImplementation(); };
        window.openExamSubmissionModal = (idx) => { this.openExamSubmissionModalImplementation(idx); };
        window.openAddGradeModal = () => { this.openAddGradeModalImplementation(); };
        window.openAddGradeModalForStudent = (studentId) => { this.openAddGradeModalForStudentImplementation(studentId); };
        window.submitGradeModal = () => { this.submitGradeModalImplementation(); };
        window.openStudentGradesDetailModal = (studentId) => { this.openStudentGradesDetailModalImplementation(studentId); };
        window.triggerOralInterrogation = (selectedStudentId) => { this.triggerOralInterrogationImplementation(selectedStudentId); };
        window.filterGradesBySubject = (subj) => { this.selectedGradeSubjectFilter = subj; this.renderVoti(); };
        window.exportGradesCSV = () => { this.exportGradesCSVImplementation(); };
        window.exportDailyReportPDF = () => { this.exportDailyReportPDFImplementation(); };
        window.recordVoiceMemo = () => { this.recordVoiceMemoImplementation(); };
        window.openCompetencyModal = (studentId) => { this.openCompetencyModalImplementation(studentId); };
        window.addNote = () => { this.addNoteImplementation(); };
        window.openDailyReportModal = () => { this.openDailyReportModalImplementation(); };
        window.openAddScheduleModal = () => { this.openAddScheduleModalImplementation(); };
        window.saveScheduleEntry = () => { this.saveScheduleEntryImplementation(); };
        window.clearAllSchedule = () => { this.clearAllScheduleImplementation(); };
        window.updateScheduleFormOptions = () => { this.updateScheduleFormOptionsImplementation(); };
        window.openAddProfModal = () => { this.openAddProfModalImplementation(); };
        window.submitCreateNewProf = () => { this.submitCreateNewProfImplementation(); };
        window.saveAccountCustomizations = () => { this.saveAccountCustomizationsImplementation(); };
        window.setBookPage = (pageNum) => { this.activeBookPage = pageNum; this.renderInteractiveBook(); };
        window.closeModal = (id) => { const el = document.getElementById(id); if (el) el.style.display = 'none'; };
    }

    addXp(amount) {
        this.teacherXp += amount;
        if (this.teacherXp >= this.teacherLevel * 100) {
            this.teacherLevel++;
            this.showToast(`🎉 Livello Docente aumentato a Livello ${this.teacherLevel}!`, "success");
        }
        this.renderProfileBadges();
    }

    applyTheme(themeKey) {
        this.teacherProfile.theme = themeKey;
        localStorage.setItem('prof_simulator_theme', themeKey);
        document.documentElement.setAttribute('data-theme', themeKey);

        const body = document.body;
        body.classList.remove('theme-classic', 'theme-zenith', 'theme-amber', 'theme-moka', 'theme-rosa', 'theme-lilla', 'theme-arancio', 'theme-verdeacqua');
        body.classList.add(`theme-${themeKey}`);

        const themesConfig = {
            classic: { bgMain: '#f8fafc', bgCard: '#ffffff', textMain: '#1e293b', textMuted: '#64748b', primary: '#2563eb', primaryLight: '#eff6ff', primaryBorder: '#bfdbfe', accent: '#3b82f6', shadow: '0 8px 24px rgba(37, 99, 235, 0.08)' },
            zenith: { bgMain: '#e8f5e9', bgCard: '#ffffff', textMain: '#1b3b2b', textMuted: '#52796f', primary: '#2e7d32', primaryLight: '#c8e6c9', primaryBorder: '#a5d6a7', accent: '#43a047', shadow: '0 8px 24px rgba(46, 125, 50, 0.1)' },
            amber: { bgMain: '#fcf6ed', bgCard: '#ffffff', textMain: '#2c241d', textMuted: '#7c6f64', primary: '#b45309', primaryLight: '#fef3c7', primaryBorder: '#fde68a', accent: '#d97706', shadow: '0 8px 24px rgba(180, 83, 9, 0.08)' },
            moka: { bgMain: '#f4efe6', bgCard: '#ffffff', textMain: '#3d3124', textMuted: '#8c7a6b', primary: '#8c5830', primaryLight: '#faeddb', primaryBorder: '#ebd8c2', accent: '#a67142', shadow: '0 8px 24px rgba(140, 88, 48, 0.08)' },
            rosa: { bgMain: '#fdf2f4', bgCard: '#ffffff', textMain: '#4a2830', textMuted: '#9e6774', primary: '#db2777', primaryLight: '#fce7f3', primaryBorder: '#fbcfe8', accent: '#ec4899', shadow: '0 8px 24px rgba(219, 39, 119, 0.08)' },
            lilla: { bgMain: '#f5f3ff', bgCard: '#ffffff', textMain: '#3b2e59', textMuted: '#7c6fa6', primary: '#7c3aed', primaryLight: '#ede9fe', primaryBorder: '#ddd6fe', accent: '#8b5cf6', shadow: '0 8px 24px rgba(124, 58, 237, 0.08)' },
            arancio: { bgMain: '#fffbeb', bgCard: '#ffffff', textMain: '#452b0d', textMuted: '#9a7b48', primary: '#d97706', primaryLight: '#fef3c7', primaryBorder: '#fde68a', accent: '#f59e0b', shadow: '0 8px 24px rgba(217, 119, 6, 0.08)' },
            verdeacqua: { bgMain: '#f0fdfa', bgCard: '#ffffff', textMain: '#134e4a', textMuted: '#5eead4', primary: '#0d9488', primaryLight: '#ccfbf1', primaryBorder: '#99f6e4', accent: '#14b8a6', shadow: '0 8px 24px rgba(13, 148, 136, 0.08)' }
        };

        const config = themesConfig[themeKey] || themesConfig.classic;
        const root = document.documentElement;

        root.style.setProperty('--bg-main', config.bgMain);
        root.style.setProperty('--bg-card', config.bgCard);
        root.style.setProperty('--card-bg', config.bgCard);
        root.style.setProperty('--text-main', config.textMain);
        root.style.setProperty('--text-muted', config.textMuted);
        root.style.setProperty('--primary', config.primary);
        root.style.setProperty('--primary-light', config.primaryLight);
        root.style.setProperty('--primary-border', config.primaryBorder);
        root.style.setProperty('--accent', config.accent);
        root.style.setProperty('--custom-shadow', config.shadow);

        body.style.backgroundColor = config.bgMain;
        body.style.color = config.textMain;

        const allInputs = document.querySelectorAll('input, select, textarea');
        allInputs.forEach(el => {
            el.style.backgroundColor = config.bgMain;
            el.style.color = config.textMain;
            el.style.borderColor = config.primaryBorder;
        });

        const sidebar = document.querySelector('sidebar') || document.querySelector('.sidebar') || document.querySelector('aside');
        if (sidebar) {
            sidebar.style.backgroundColor = config.bgCard;
            sidebar.style.color = config.textMain;
        }

        const headerTitle = document.getElementById('current-title');
        if (headerTitle) {
            headerTitle.style.color = config.primary;
        }
    }

    saveAccountCustomizationsImplementation() {
        const nameInput = document.getElementById('acc-name')?.value.trim();
        const selectedTheme = document.getElementById('acc-theme-select')?.value;
        const subjectsInput = document.getElementById('acc-subjects')?.value.split(',').map(s => s.trim());
        const classesInput = document.getElementById('acc-classes')?.value.split(',').map(c => c.trim());
        const availabilityInput = document.getElementById('acc-availability')?.value.trim();

        if (nameInput) this.teacherProfile.fullName = nameInput;
        if (subjectsInput) this.teacherProfile.subjects = subjectsInput;
        if (classesInput) this.teacherProfile.classes = classesInput;
        if (availabilityInput) this.teacherProfile.availability = availabilityInput;
        if (selectedTheme) this.applyTheme(selectedTheme);

        this.updateHeaderTitle();
        this.showToast("✨ Profilo e preferenze aggiornati!", "success");
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const bgColors = { success: 'linear-gradient(135deg, #059669, #10b981)', error: 'linear-gradient(135deg, #dc2626, #ef4444)', warning: 'linear-gradient(135deg, #d97706, #f59e0b)', info: 'linear-gradient(135deg, #2563eb, #3b82f6)' };
        const toast = document.createElement('div');
        toast.style.cssText = `background: ${bgColors[type] || bgColors.success}; color: #fff; padding: 12px 18px; border-radius: 12px; margin-bottom: 8px; box-shadow: var(--custom-shadow); font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; border-left: 4px solid rgba(255,255,255,0.6); animation: slideIn 0.3s ease;`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => { toast.remove(); }, 3500);
    }

    injectToastContainer() {
        if (document.getElementById('toast-container')) return;
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; align-items: flex-end;';
        document.body.appendChild(container);
    }

    initClassroomStates() {
        this.studentStates.clear();
        this.studentRealPresence.clear();
        this.studentQuestions.clear();
        this.studentEmotions.clear();
        const emotionsPool = ['😊 Concentrato', '🧐 Curioso', '😟 Ansioso', '💤 Rilassato', '💡 Ispirato'];
        if (this.classroom && this.classroom.students) {
            this.classroom.students.forEach((s, idx) => {
                if (!s.id) s.id = `std_${idx}_${s.name.toLowerCase().replace(/\s+/g, '')}`;
                const isActuallyHere = Math.random() > 0.15;
                this.studentRealPresence.set(s.id, isActuallyHere ? 'presente' : (Math.random() > 0.5 ? 'assente' : 'ritardo'));
                this.studentStates.set(s.id, 'da_verificare');
                this.studentJustified.set(s.id, false);
                this.studentEmotions.set(s.id, emotionsPool[Math.floor(Math.random() * emotionsPool.length)]);
            });
        }
    }

    openClassSelectionModalImplementation() {
        const allowedClasses = this.teacherProfile.classes || ["1ª A", "1ª B", "2ª A", "2ª B", "3ª A", "3ª B", "5ª A", "5ª B"];
        let classesHtml = allowedClasses.map(c => `
            <button class="btn" style="padding: 12px 16px; background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-border); border-radius: 12px; font-weight: 700; cursor: pointer; text-align: left; margin-bottom: 8px; transition: all 0.2s;" onclick="
                window.currentUiInstance.changeActiveClass('${c}');
                document.getElementById('class-selection-modal').remove();
            ">🏫 Classe ${c}</button>
        `).join('');

        let modalHtml = `
            <div id="class-selection-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 420px; width: 90%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 8px; font-size: 1.2rem;">🏫 Seleziona Classe</h3>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">Classi assegnate al docente:</div>
                    <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; max-height: 260px; overflow-y: auto; padding-right: 4px;">
                        ${classesHtml}
                    </div>
                    <div style="text-align: right;">
                        <button class="btn" style="background: #475569; color:#fff; padding: 8px 16px; border-radius: 10px; font-weight:700;" onclick="document.getElementById('class-selection-modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        const oldM = document.getElementById('class-selection-modal');
        if (oldM) oldM.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    sendTeacherSpeechImplementation() {
        const speechInput = document.getElementById('teacher-speech-input');
        const speechText = speechInput ? speechInput.value.trim() : '';
        const fileInput = document.getElementById('teacher-speech-file');
        let fileInfo = '';

        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileUrl = URL.createObjectURL(file);
            fileInfo = `<br>📎 <a href="${fileUrl}" target="_blank" style="color:var(--primary); font-weight:700; text-decoration:underline;">Apri allegato: ${file.name}</a>`;
        }

        if (!speechText && !fileInfo) return this.showToast("Scrivi una spiegazione o allega un documento!", "warning");

        this.isTeacherWriting = true;
        this.hasExplained = true;
        this.lastExplanationText = speechText;

        const feed = document.getElementById('classroom-live-feed');
        if (feed) {
            feed.innerHTML += `
                <div style="margin-bottom: 10px; background: var(--primary-light); padding: 12px; border-radius: 12px; border-left: 4px solid var(--primary); box-shadow: var(--custom-shadow);">
                    <strong>Spiegazione alla Classe - Tu (${this.teacherProfile.fullName}):</strong><br>
                    ${speechText} ${fileInfo}
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:6px;">🔒 Silenzio in classe: gli studenti stanno ascoltando...</div>
                </div>
            `;
            if (speechInput) speechInput.value = '';
            if (fileInput) fileInput.value = '';
            setTimeout(() => { this.isTeacherWriting = false; }, 1500);
            feed.scrollTop = feed.scrollHeight;
        }
    }

    triggerSpontaneousQuestion() {
        if (!this.hasExplained || this.isTeacherWriting || !this.classroom || !this.classroom.students) return;
        if (this.studentQuestions.size > 2) { this.studentQuestions.clear(); }

        const presentStudents = this.classroom.students.filter(s => this.studentStates.get(s.id) === 'presente');
        if (presentStudents.length === 0) return;

        let targetStudent = presentStudents[Math.floor(Math.random() * presentStudents.length)];
        const isEnglish = this.teacherProfile.subjects.some(s => s.toLowerCase().includes('inglese') || s.toLowerCase().includes('conversation'));
        const studentFullName = `${targetStudent.displayName || targetStudent.name} ${targetStudent.surname}`;

        let qText = "";
        let targetWord = "cat";
        const quoteMatch = this.lastExplanationText.match(/"([^"]+)"/);
        if (quoteMatch && quoteMatch[1]) { targetWord = quoteMatch[1]; }

        if (isEnglish) {
            qText = `Prof, ho completato la registrazione della pronuncia per "${targetWord}".`;
        } else {
            const randomChatter = [
                "Prof, ma questa parte andrà inserita nella verifica di fine modulo?",
                "Scusi Prof, quindi l'applicazione pratica di questo concetto qual è nei casi reali?",
                "Prof, ci sono eccezioni particolari a questa regola da ricordare?",
                "Prof, potrebbe fare un ulteriore esempio pratico su questo passaggio?"
            ];
            qText = randomChatter[Math.floor(Math.random() * randomChatter.length)];
        }

        this.studentQuestions.set(targetStudent.id, qText);
        
        const feed = document.getElementById('classroom-live-feed');
        if (feed) {
            feed.innerHTML += `
                <div style="color: var(--accent); margin-bottom: 10px; background:var(--bg-card); padding:12px; border-radius:12px; border-left:4px solid var(--accent); box-shadow: var(--custom-shadow);">
                    <strong>🙋‍♂️ ${studentFullName}:</strong> "${qText}"
                    ${isEnglish ? `
                        <div style="margin-top:10px; background:var(--primary-light); border:1px solid var(--primary-border); padding:10px; border-radius:10px; font-size:0.85rem;">
                            <strong>🎙️ Audio Pronuncia:</strong><br>
                            <div style="margin-top:6px; padding:8px; background:var(--bg-card); border-radius:8px; border:1px solid var(--primary-border); display:flex; align-items:center; justify-content:space-between;">
                                <span>🎵 ${targetStudent.displayName || targetStudent.name}_${targetWord}.webm</span>
                                <button class="btn" style="padding:5px 10px; font-size:0.75rem; background:var(--primary); color:#fff; border-radius:8px;" onclick="window.playStudentAudioPronunciation('${studentFullName}', '${targetWord}')">▶️ Ascolta</button>
                            </div>
                            <div style="margin-top:10px;">
                                <button class="btn" style="background:var(--success); color:#fff; font-size:0.78rem; padding:6px 12px; border-radius:10px;" onclick="window.openEvaluationModal('${targetStudent.id}', '${studentFullName}', 'Buono (7-8)', 'Pronuncia chiara e corretta.')">📝 Valuta & Registra Voto</button>
                            </div>
                        </div>
                    ` : `
                        <div style="margin-top:10px; display:flex; gap:6px;">
                            <input type="text" id="ans-input-${targetStudent.id}" placeholder="Rispondi allo studente..." style="font-size:0.82rem; padding:8px 12px; flex:1; background:var(--bg-card); color:var(--text-main); border:1px solid var(--primary-border); border-radius:10px;">
                            <button class="btn" style="padding:8px 14px; font-size:0.8rem; background:var(--primary); color:#fff; border-radius:10px; font-weight:700;" onclick="window.answerStudentQuestion('${targetStudent.id}')">Rispondi</button>
                        </div>
                    `}
                </div>
            `;
            feed.scrollTop = feed.scrollHeight;
        }
        this.hasExplained = false;
    }

    playStudentAudioPronunciationImplementation(studentName, targetWord) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(targetWord);
            utterance.lang = 'en-US';
            utterance.rate = 0.85; 
            window.speechSynthesis.speak(utterance);
        } else {
            this.showToast(`Riproduzione audio per ${studentName}: "${targetWord}"`, "info");
        }
    }

    openEvaluationModalImplementation(studentId, studentName, defaultLevel = '', defaultFeedback = '') {
        const modalHtml = `
            <div id="evaluation-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 480px; width: 90%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 6px; font-size: 1.2rem;">🎯 Valutazione & Voto</h3>
                    <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px;">Studente: <strong>${studentName}</strong></div>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Materia (${this.teacherProfile.fullName}):</label>
                    <select id="eval-subject-select" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;">
                        ${this.teacherProfile.subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Voto Numerico (1 - 10):</label>
                    <input type="number" step="0.5" min="1" max="10" id="eval-numeric-grade" value="8" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-weight:800; font-size:1.05rem;">

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Note e Feedback:</label>
                    <textarea id="eval-feedback-text" style="width: 100%; padding: 10px; height: 80px; margin-bottom: 20px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem; resize:none;">${defaultFeedback}</textarea>

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn" style="background: var(--success); color:#fff; font-size: 0.85rem; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="
                            const subject = document.getElementById('eval-subject-select').value;
                            const gradeVal = parseFloat(document.getElementById('eval-numeric-grade').value);
                            if(isNaN(gradeVal) || gradeVal < 1 || gradeVal > 10) { window.currentUiInstance.showToast('Inserisci un voto valido!', 'warning'); return; }
                            window.currentUiInstance.classroom.assignGrade('${studentId}', subject, gradeVal, 'Orale');
                            window.currentUiInstance.addXp(15);
                            window.currentUiInstance.renderVoti();
                            document.getElementById('evaluation-modal').remove();
                            window.currentUiInstance.showToast('✅ Voto ' + gradeVal + ' registrato (+15 XP)!', 'success');
                        ">Registra Voto</button>
                        <button class="btn" style="background: #475569; color:#fff; font-size: 0.85rem; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('evaluation-modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        const oldModal = document.getElementById('evaluation-modal');
        if (oldModal) oldModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    answerStudentQuestionImplementation(studentId) {
        const input = document.getElementById(`ans-input-${studentId}`);
        if (!input || !input.value.trim()) return this.showToast("Scrivi una risposta!", "warning");
        const student = this.classroom.students.find(s => s.id === studentId);
        const name = student ? (student.displayName || student.name) : 'Studente';
        const feed = document.getElementById('classroom-live-feed');
        if (feed) {
            feed.innerHTML += `<div style="color: var(--success); margin-bottom: 8px; background:var(--primary-light); padding:10px; border-radius:10px; font-size:0.85rem; border-left:4px solid var(--success);"><strong>📢 Risposta (a ${name}):</strong> ${input.value}</div>`;
            feed.scrollTop = feed.scrollHeight;
        }
        this.studentQuestions.delete(studentId);
        this.addXp(5);
    }

    changeActiveClass(className) {
        if (this.schoolClasses && this.schoolClasses.has(className)) {
            this.classroom = this.schoolClasses.get(className);
            this.currentAppelloIndex = 0;
            this.initClassroomStates();
            this.updateHeaderTitle();
            this.renderAppello();
            this.renderVoti();
            this.showToast(`🏫 Classe cambiata: ${className}`, "info");
        }
    }

    executeSecureLoginImplementation() {
        const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
        const passwordInput = document.getElementById('login-password')?.value.trim();
        const foundProf = this.professorsList.find(p => p.email.toLowerCase() === emailInput && (!p.password || p.password === passwordInput));

        if (!foundProf) return this.showToast("Email o password errati!", "error");

        // 💾 Salvataggio istantaneo della sessione in localStorage per prevenire il logout con F5
        localStorage.setItem('prof_simulator_user', JSON.stringify({ id: foundProf.id }));

        this.teacherProfile = {
            id: foundProf.id,
            email: foundProf.email,
            fullName: foundProf.name,
            role: foundProf.isAdmin ? "Referente Didattico & Amministratore" : "Docente",
            isAdmin: foundProf.isAdmin,
            subjects: foundProf.subjects,
            classes: foundProf.classes,
            availability: foundProf.availability,
            theme: localStorage.getItem('prof_simulator_theme') || 'classic'
        };

        if (foundProf.classes && foundProf.classes.length > 0 && this.schoolClasses) {
            const defaultClass = foundProf.classes[0];
            if (this.schoolClasses.has(defaultClass)) { this.classroom = this.schoolClasses.get(defaultClass); }
        }

        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'none';

        this.applyRoleBasedUI();
        this.applyTheme(this.teacherProfile.theme);
        this.updateHeaderTitle();
        this.updateScheduleStatusBadge();
        this.renderAppello();
        this.renderClassroomGrid();
        this.populateAccountTab();
        this.showToast(`🔒 Benvenuto/a, Prof. ${this.teacherProfile.fullName}!`, "success");
    }

    handleQRScanResult(decodedText) {
        this.stopCameraScanImplementation();
        const text = decodedText.trim();
        const foundProf = this.professorsList.find(p => text.includes(p.qrCodeData) || text.toUpperCase().includes(p.id.toUpperCase()));

        if (foundProf) {
            // 💾 Salvataggio della sessione QR
            localStorage.setItem('prof_simulator_user', JSON.stringify({ id: foundProf.id }));

            this.teacherProfile = {
                id: foundProf.id,
                email: foundProf.email,
                fullName: foundProf.name,
                role: foundProf.isAdmin ? "Referente Didattico & Amministratore" : "Docente",
                isAdmin: foundProf.isAdmin,
                subjects: foundProf.subjects,
                classes: foundProf.classes,
                availability: foundProf.availability,
                theme: localStorage.getItem('prof_simulator_theme') || 'classic'
            };
            if (foundProf.classes && foundProf.classes.length > 0 && this.schoolClasses) {
                const defaultClass = foundProf.classes[0];
                if (this.schoolClasses.has(defaultClass)) { this.classroom = this.schoolClasses.get(defaultClass); }
            }
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) loginScreen.style.display = 'none';

            this.applyRoleBasedUI();
            this.applyTheme(this.teacherProfile.theme);
            this.updateHeaderTitle();
            this.updateScheduleStatusBadge();
            this.renderAppello();
            this.renderClassroomGrid();
            this.populateAccountTab();
            this.showToast(`📱 Accesso QR riuscito: Prof. ${foundProf.name}`, "success");
        } else {
            this.showToast(`Badge QR non riconosciuto.`, "error");
        }
    }

    handleLogoutImplementation() {
        // Pulizia della memoria utente
        localStorage.removeItem('prof_simulator_user');
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'flex';
        this.showToast("🚪 Logout effettuato con successo.", "info");
    }

    applyRoleBasedUI() {
        window.currentUiInstance = this;
        const adminView = document.getElementById('admin-schedule-view');
        const docentView = document.getElementById('docent-personal-schedule-view');
        const adminAddBtn = document.getElementById('admin-add-prof-btn');

        if (this.teacherProfile.isAdmin) {
            if(adminView) adminView.style.display = 'block';
            if(docentView) docentView.style.display = 'none';
            if(adminAddBtn) adminAddBtn.style.display = 'inline-flex';
        } else {
            if(adminView) adminView.style.display = 'none';
            if(docentView) docentView.style.display = 'block';
            if(adminAddBtn) adminAddBtn.style.display = 'none';
        }
    }

    openAddGradeModalImplementation() {
        const existingModal = document.getElementById('add-grade-modal');
        if (existingModal) existingModal.remove();

        const modalHtml = `
            <div id="add-grade-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 440px; width: 90%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 16px; font-size: 1.2rem;">Inserisci Voto</h3>
                    
                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Materia:</label>
                    <select id="grade-modal-subject-select" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;">
                        ${this.teacherProfile.subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Studente:</label>
                    <select id="grade-modal-student-select" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;"></select>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Tipologia Prova:</label>
                    <select id="grade-modal-type" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;">
                        <option value="Scritto">Scritto</option>
                        <option value="Orale">Orale</option>
                        <option value="Pratico">Pratico</option>
                    </select>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Voto (es. 7.5):</label>
                    <input type="number" step="0.5" min="1" max="10" id="grade-modal-value" placeholder="Voto" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 1rem; font-weight: 800;">

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn" style="background: var(--primary); color:#fff; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="window.submitGradeModal()">Salva Voto</button>
                        <button class="btn" style="background: #475569; color:#fff; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="window.closeModal('add-grade-modal')">Annulla</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const selectStudent = document.getElementById('grade-modal-student-select');
        if (selectStudent && this.classroom && this.classroom.students) {
            selectStudent.innerHTML = '';
            this.classroom.students.forEach(s => {
                selectStudent.innerHTML += `<option value="${s.id}">${s.displayName || s.name} ${s.surname}</option>`;
            });
        }
    }

    openAddGradeModalForStudentImplementation(studentId) {
        this.openAddGradeModalImplementation();
        const select = document.getElementById('grade-modal-student-select');
        if (select) select.value = studentId;
    }

    submitGradeModalImplementation() {
        const studentId = document.getElementById('grade-modal-student-select').value;
        const subject = document.getElementById('grade-modal-subject-select').value;
        const type = document.getElementById('grade-modal-type').value;
        const val = parseFloat(document.getElementById('grade-modal-value').value);

        if (isNaN(val) || val < 1 || val > 10) return this.showToast("Inserisci un voto valido compreso tra 1 e 10!", "warning");

        if (this.classroom) {
            this.classroom.assignGrade(studentId, subject, val, type);
            this.addXp(10);
            this.renderVoti();
            const modal = document.getElementById('add-grade-modal');
            if (modal) modal.style.display = 'none';
            this.showToast(`✅ Voto ${val} (${subject} - ${type}) registrato con successo (+10 XP)!`, "success");
        }
    }

    checkSingleStudentPresenceImplementation(studentId) {
        const student = this.classroom.students.find(s => s.id === studentId);
        if (!student) return;
        const displayName = student.displayName || student.name;
        const realStatus = this.studentRealPresence.get(studentId) || 'presente';
        if (realStatus === 'presente') {
            this.showToast(`🗣️ ${displayName} risponde: "PRESENTE!"`, "info");
        } else if (realStatus === 'ritardo') {
            this.showToast(`🚪 ${displayName} è arrivato in RITARDO!`, "warning");
        } else {
            this.showToast(`❌ ${displayName} risulta ASSENTE.`, "error");
        }
    }

    openJustificationModalImplementation(studentId) {
        const student = this.classroom.students.find(s => s.id === studentId);
        if (!student) return;
        const displayName = student.displayName || student.name;
        const status = this.studentStates.get(studentId) || 'presente';
        const isJustified = this.studentJustified.get(studentId) || false;
        let statusText = status === 'ritardo' ? "Ritardo" : "Assenza";

        let modalHtml = `
            <div id="justification-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 460px; width: 90%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 6px; font-size: 1.2rem;">📄 Giustifiche: ${displayName} ${student.surname}</h3>
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 14px;">Evento: <strong>${statusText}</strong></div>
                    <div style="background: var(--bg-main); padding: 12px; border-radius: 10px; margin-bottom: 14px; font-size: 0.88rem; border: 1px solid var(--primary-border);">
                        <strong>Stato:</strong> ${isJustified ? '<span style="color:var(--success); font-weight:800;">✅ GIUSTIFICATO</span>' : '<span style="color:var(--danger); font-weight:800;">⚠️ DA GIUSTIFICARE</span>'}
                    </div>
                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Motivazione:</label>
                    <input type="text" id="just-motive-input" value="Motivi familiari / di salute documentati" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;">
                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Firma Genitore:</label>
                    <input type="text" id="just-parent-sign" value="Genitore Titolare" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;">
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn" style="background: ${isJustified ? 'var(--danger)' : 'var(--success)'}; color:#fff; font-size: 0.85rem; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="
                            window.toggleJustificationState('${studentId}');
                            document.getElementById('justification-modal').remove();
                        ">${isJustified ? '❌ Annulla' : '✅ Approva'}</button>
                        <button class="btn" style="background: #475569; color:#fff; font-size: 0.85rem; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('justification-modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        const oldModal = document.getElementById('justification-modal');
        if (oldModal) oldModal.remove();

        window.toggleJustificationState = (id) => {
            const current = this.studentJustified.get(id) || false;
            this.studentJustified.set(id, !current);
            this.renderAppello();
            this.showToast(!current ? "✅ Giustificato!" : "⚠️ Giustificazione annullata.", !current ? "success" : "warning");
        };
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    triggerOralInterrogationImplementation(selectedStudentId) {
        if (!this.classroom || !this.classroom.students) return;
        const presentStudents = this.classroom.students.filter(s => this.studentStates.get(s.id) === 'presente');
        if (presentStudents.length === 0) return this.showToast("Prima fai l'appello e verifica i presenti in aula!", "warning");

        let targetStudent = presentStudents[0];
        if (selectedStudentId) {
            const found = presentStudents.find(s => s.id === selectedStudentId);
            if (found) targetStudent = found;
        }

        const displayName = targetStudent.displayName || targetStudent.name;
        let studentsOptionsHtml = presentStudents.map(s => `
            <option value="${s.id}" ${s.id === targetStudent.id ? 'selected' : ''}>${s.displayName || s.name} ${s.surname}</option>
        `).join('');

        let modalHtml = `
            <div id="oral-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 620px; width: 92%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 6px; text-align:center; font-size: 1.25rem;">🎯 Interrogazione Orale Dinamica</h3>
                    
                    <div id="oral-setup-phase">
                        <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Seleziona Studente:</label>
                        <select id="oral-student-select" style="width: 100%; padding: 10px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size:0.88rem; margin-bottom:14px;" onchange="window.triggerOralInterrogation(this.value)">
                            ${studentsOptionsHtml}
                        </select>

                        <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Modalità:</label>
                        <select id="oral-mode-select" style="width: 100%; padding: 10px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size:0.88rem; margin-bottom:20px;">
                            <option value="speech">🗣️ Esposizione Libera (lo studente risponde in modo mirato e naturale)</option>
                            <option value="direct">❓ Domande Specifiche del Docente</option>
                        </select>

                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button class="btn" style="background: var(--primary); color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="window.startOralLivePhase('${targetStudent.id}', '${displayName} ${targetStudent.surname}')">🚀 Avvia Interrogazione</button>
                            <button class="btn" style="background: #475569; color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('oral-modal').remove()">Annulla</button>
                        </div>
                    </div>

                    <div id="oral-live-phase" style="display:none;">
                        <div style="font-size:1rem; font-weight:800; color:var(--primary); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                            <span>🗣️ Alla Cattedra: <span id="oral-student-live-name">${displayName} ${targetStudent.surname}</span></span>
                            <span class="badge" style="background:var(--primary-light); color:var(--primary); font-size:0.75rem; padding:4px 8px; border-radius:6px;">LIVE</span>
                        </div>
                        
                        <div id="oral-dialogue-feed" style="background:var(--bg-main); border:1px solid var(--primary-border); border-radius:12px; padding:14px; height:220px; overflow-y:auto; margin-bottom:14px; font-size:0.88rem;">
                            <div style="color:var(--text-muted);"><em>L'interrogazione è iniziata. Fai una domanda e lo studente ti risponderà...</em></div>
                        </div>

                        <div style="display:flex; gap:8px; margin-bottom:18px;">
                            <input type="text" id="oral-teacher-question-input" placeholder="Fai una domanda specifica allo studente..." style="flex:1; padding:10px 14px; border-radius:10px; background:var(--bg-main); color:var(--text-main); border:1px solid var(--primary-border); font-size:0.88rem;">
                            <button class="btn" style="background:var(--primary); color:#fff; font-size:0.85rem; padding:10px 18px; border-radius:10px; font-weight:700;" onclick="window.sendOralQuestion('${displayName}')">Chiedi</button>
                        </div>

                        <div style="text-align:right;">
                            <button class="btn" style="background:var(--warning); color:#fff; font-weight:800; padding:10px 18px; border-radius:10px;" onclick="window.showOralGradePhase()">🏁 Termina & Assegna Voto</button>
                        </div>
                    </div>

                    <div id="oral-grade-phase" style="display:none;">
                        <h4 style="font-weight:800; color:var(--success); margin-bottom:12px; font-size: 1.1rem;">📝 Valutazione Finale per ${displayName} ${targetStudent.surname}</h4>

                        <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Materia (${this.teacherProfile.fullName}):</label>
                        <select id="oral-modal-subject" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border);">
                            ${this.teacherProfile.subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>

                        <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Commento / Note Orali:</label>
                        <input type="text" id="oral-final-notes" placeholder="Es. Esposizione fluida, ottima padronanza." style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size:0.88rem;">

                        <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Voto Orale (1 - 10):</label>
                        <input type="number" step="0.5" min="1" max="10" id="oral-grade-input" value="8" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); text-align:center; font-size:1.2rem; font-weight:800;">

                        <div style="display: flex; justify-content: flex-end; gap: 10px;">
                            <button class="btn" style="background: var(--success); color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="
                                const gradeVal = parseFloat(document.getElementById('oral-grade-input').value);
                                const subj = document.getElementById('oral-modal-subject').value;
                                if(isNaN(gradeVal) || gradeVal < 1 || gradeVal > 10) { window.currentUiInstance.showToast('Voto non valido!', 'warning'); return; }
                                window.currentUiInstance.classroom.assignGrade('${targetStudent.id}', subj, gradeVal, 'Orale');
                                window.currentUiInstance.addXp(20);
                                window.currentUiInstance.renderVoti();
                                document.getElementById('oral-modal').remove();
                                window.currentUiInstance.showToast('✅ Voto ' + gradeVal + ' registrato (+20 XP)!', 'success');
                            ">Registra Voto nel Libretto</button>
                            <button class="btn" style="background: #475569; color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('oral-modal').remove()">Chiudi</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const oldM = document.getElementById('oral-modal');
        if (oldM) oldM.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        window.startOralLivePhase = (studentId, studentFullName) => {
            document.getElementById('oral-setup-phase').style.display = 'none';
            document.getElementById('oral-live-phase').style.display = 'block';
            const mode = document.getElementById('oral-mode-select').value;
            const feed = document.getElementById('oral-dialogue-feed');
            
            if (mode === 'speech') {
                feed.innerHTML = `<div style="margin-bottom:8px;"><strong>🙋‍♂️ ${studentFullName}:</strong> "Buongiorno professore, inizio ad esporre i punti principali dell'argomento..."</div>`;
            } else {
                feed.innerHTML = `<div style="margin-bottom:8px; color:var(--primary);"><strong>👨‍🏫 Prof:</strong> "Iniziamo l'interrogazione con domande mirate. Sono pronto."</div>`;
            }
        };

        window.sendOralQuestion = (studentDisplayName) => {
            const input = document.getElementById('oral-teacher-question-input');
            const qText = input.value.trim();
            if (!qText) return;

            const feed = document.getElementById('oral-dialogue-feed');
            feed.innerHTML += `<div style="margin-top:10px; color:var(--primary);"><strong>👨‍🏫 Domanda Prof:</strong> "${qText}"</div>`;

            setTimeout(() => {
                let studentReply = "";
                const qLower = qText.toLowerCase();

                if (qLower.includes('perché') || qLower.includes('causa') || qLower.includes('motivo') || qLower.includes('spiega')) {
                    studentReply = `"Prof, riflettendo sulla sua domanda, credo che il motivo principale sia legato al legame di causa-effetto che abbiamo visto a lezione; tuttavia, su questo passaggio ammetto di avere qualche piccolo dubbio sui dettagli esatti."`;
                } else if (qLower.includes('differenza') || qLower.includes('confronto') || qLower.includes('tra')) {
                    studentReply = `"Se ho capito bene il confronto, la differenza chiave sta nel fatto che il primo concetto è più teorico, mentre il secondo riguarda l'aspetto pratico e applicativo..."`;
                } else if (qLower.includes('esempio') || qLower.includes('caso') || qLower.includes('pratico')) {
                    studentReply = `"Un esempio pratico potrebbe essere quello riscontrato nei casi di studio che abbiamo analizzato sul manuale, anche se potrei confondermi leggermente con un altro capitolo."`;
                } else if (qLower.includes('definisc')|| qLower.includes('cos\'è') || qLower.includes('cosa significa')) {
                    studentReply = `"Dunque, per definirlo in modo semplice, si tratta di quel principio fondamentale che regola il comportamento del sistema in determinate condizioni."`;
                } else {
                    const fallbackReplies = [
                        `"Prof, è una domanda interessante... ci sto pensando un attimo, credo che la risposta si colleghi ai concetti generali spiegati la scorsa settimana."`,
                        `"Sì professore, ricordo che ne avevamo parlato, anche se non ricordo perfettamente tutti i passaggi della dimostrazione."`,
                        `"Mh... su questo specifico dettaglio ammetto di avere un vuoto di memoria, professore. Può darmi un piccolo indizio?"`
                    ];
                    studentReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
                }

                feed.innerHTML += `<div style="margin-top:8px; background:var(--bg-card); padding:10px; border-radius:10px; border:1px solid var(--primary-border);"><strong>🙋‍♂️ ${studentDisplayName}:</strong> ${studentReply}</div>`;
                feed.scrollTop = feed.scrollHeight;
            }, 850);
            input.value = '';
        };

        window.showOralGradePhase = () => {
            document.getElementById('oral-live-phase').style.display = 'none';
            document.getElementById('oral-grade-phase').style.display = 'block';
        };
    }

    recordVoiceMemoImplementation() {
        const noteText = prompt("Registra promemoria rapido / nota vocale (testo):");
        if (!noteText) return;
        this.voiceMemos.push({ text: noteText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        this.addXp(5);
        this.showToast("🎙️ Nota vocale / promemoria salvato (+5 XP)!", "success");
    }

    exportDailyReportPDFImplementation() {
        let presentCount = 0, absentCount = 0, lateCount = 0;
        if (this.classroom && this.classroom.students) {
            this.classroom.students.forEach(s => {
                const st = this.studentStates.get(s.id);
                if (st === 'assente') absentCount++;
                else if (st === 'ritardo') lateCount++;
                else if (st === 'presente') presentCount++;
            });
        }

        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(`
            <html>
                <head>
                    <title>Resoconto Giornaliero - Classe ${this.classroom?.name || '1ª A'}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
                        h1 { color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 22px; }
                        .info-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 15px; border-radius: 8px; margin: 15px 0; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 14px; }
                        th { background: #eff6ff; color: #1e40af; }
                        .footer { margin-top: 40px; text-align: right; font-size: 13px; color: #64748b; }
                    </style>
                </head>
                <body>
                    <h1>📄 RESOCONTO GIORNALIERO UFFICIALE DEL REGISTRO</h1>
                    <div class="info-box">
                        <p><strong>Docente:</strong> ${this.teacherProfile.fullName} (${this.teacherProfile.role})</p>
                        <p><strong>Classe:</strong> ${this.classroom?.name || '1ª A'} | <strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Riepilogo Presenze:</strong> 🟢 Presenti: ${presentCount} | 🔴 Assenti: ${absentCount} | ⏱️ Ritardi: ${lateCount}</p>
                        <p><strong>Note Disciplinari Registrate:</strong> ${this.notes.length} | <strong>Materiali Condivisi:</strong> ${this.materials.length}</p>
                    </div>
                    <h3>Tabellone Studenti & Valutazioni della Classe</h3>
                    <table>
                        <tr>
                            <th>Studente</th>
                            <th>Stato Presenza</th>
                            <th>Note / Osservazioni</th>
                        </tr>
                        ${this.classroom?.students.map(s => `
                            <tr>
                                <td>${s.displayName || s.name} ${s.surname}</td>
                                <td>${(this.studentStates.get(s.id) || 'Da verificare').toUpperCase()}</td>
                                <td>${this.studentJustified.get(s.id) ? 'Giustificato/a' : 'Regolare'}</td>
                            </tr>
                        `).join('') || ''}
                    </table>
                    <div class="footer">
                        <p>Documento generato digitalmente dal sistema scolastico. Firma del docente: _______________________</p>
                    </div>
                    <script>
                        window.print();
                    </script>
                </body>
            </html>
        `);
        reportWindow.document.close();
        this.showToast("📄 Resoconto PDF generato con successo!", "success");
    }

    openCompetencyModalImplementation(studentId) {
        const student = this.classroom.students.find(s => s.id === studentId);
        if (!student) return;
        const displayName = student.displayName || student.name;
        const currentComp = this.competencyRecords.get(studentId) || { autonomia: 'Intermedio', partecipazione: 'Buona', problemSolving: 'Avanzato' };

        let modalHtml = `
            <div id="competency-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 440px; width: 90%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 6px; font-size: 1.2rem;">📑 Competenze: ${displayName} ${student.surname}</h3>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">Valutazione per abilità chiave</div>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Autonomia Operativa:</label>
                    <select id="comp-autonomia" style="width: 100%; padding: 10px; margin-bottom: 12px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border);">
                        <option value="Base" ${currentComp.autonomia === 'Base' ? 'selected' : ''}>Base</option>
                        <option value="Intermedio" ${currentComp.autonomia === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
                        <option value="Avanzato" ${currentComp.autonomia === 'Avanzato' ? 'selected' : ''}>Avanzato</option>
                    </select>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Partecipazione & Attenzione:</label>
                    <select id="comp-partecipazione" style="width: 100%; padding: 10px; margin-bottom: 12px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border);">
                        <option value="Sufficiente" ${currentComp.partecipazione === 'Sufficiente' ? 'selected' : ''}>Sufficiente</option>
                        <option value="Buona" ${currentComp.partecipazione === 'Buona' ? 'selected' : ''}>Buona</option>
                        <option value="Ottima" ${currentComp.partecipazione === 'Ottima' ? 'selected' : ''}>Ottima</option>
                    </select>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Problem Solving:</label>
                    <select id="comp-ps" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border);">
                        <option value="In via di sviluppo" ${currentComp.problemSolving === 'In via di sviluppo' ? 'selected' : ''}>In via di sviluppo</option>
                        <option value="Competente" ${currentComp.problemSolving === 'Competente' ? 'selected' : ''}>Competente</option>
                        <option value="Avanzato" ${currentComp.problemSolving === 'Avanzato' ? 'selected' : ''}>Avanzato</option>
                    </select>

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn" style="background: var(--success); color:#fff; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="
                            window.currentUiInstance.competencyRecords.set('${studentId}', {
                                autonomia: document.getElementById('comp-autonomia').value,
                                partecipazione: document.getElementById('comp-partecipazione').value,
                                problemSolving: document.getElementById('comp-ps').value
                            });
                            window.currentUiInstance.addXp(10);
                            document.getElementById('competency-modal').remove();
                            window.currentUiInstance.showToast('✅ Competenze salvate (+10 XP)!', 'success');
                        ">Salva Competenze</button>
                        <button class="btn" style="background: #475569; color:#fff; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('competency-modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        const oldM = document.getElementById('competency-modal');
        if (oldM) oldM.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    assignExamImplementation() {
        const topic = document.getElementById('exam-topic').value;
        const text = document.getElementById('exam-text').value;
        const fileInput = document.getElementById('exam-file-input');
        
        let fileData = null;
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileData = { name: file.name, url: URL.createObjectURL(file) };
        }

        if(!topic) return this.showToast("Inserisci il titolo della verifica!", "warning");

        let studentsChecklist = '';
        if (this.classroom && this.classroom.students) {
            this.classroom.students.forEach(s => {
                const status = this.studentStates.get(s.id) || 'presente';
                const isAbsent = status === 'assente';
                studentsChecklist += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--bg-card); border:1px solid var(--primary-border); border-radius:8px; margin-bottom:6px;">
                        <label style="font-size:0.85rem; font-weight:600; cursor:pointer;">
                            <input type="checkbox" class="exam-target-checkbox" value="${s.id}" ${isAbsent ? '' : 'checked'}> ${s.displayName || s.name} ${s.surname}
                        </label>
                        <span style="font-size:0.72rem;" class="badge ${isAbsent ? 'badge-danger' : 'badge-success'}">${status.toUpperCase()}</span>
                    </div>
                `;
            });
        }

        let selectModalHtml = `
            <div id="select-exam-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 480px; width: 90%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 6px; font-size: 1.2rem;">📋 Destinatari Verifica</h3>
                    <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:12px;">Scegli chi deve svolgere "${topic}":</div>
                    <div style="max-height:220px; overflow-y:auto; margin-bottom:18px; background:var(--bg-main); padding:10px; border-radius:10px; border: 1px solid var(--primary-border);">
                        ${studentsChecklist}
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button class="btn" style="background:var(--success); color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="
                            const selectedIds = Array.from(document.querySelectorAll('.exam-target-checkbox:checked')).map(cb => cb.value);
                            if(selectedIds.length === 0) { window.currentUiInstance.showToast('Seleziona almeno uno studente!', 'warning'); return; }
                            window.currentUiInstance.confirmAssignExam('${topic.replace(/'/g, "\\'")}', '${(text || '').replace(/'/g, "\\'")}', selectedIds);
                            document.getElementById('select-exam-modal').remove();
                        ">🚀 Distribuisci</button>
                        <button class="btn" style="background:#475569; color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('select-exam-modal').remove()">Annulla</button>
                    </div>
                </div>
            </div>
        `;
        const oldModal = document.getElementById('select-exam-modal');
        if (oldModal) oldModal.remove();
        document.body.insertAdjacentHTML('beforeend', selectModalHtml);
    }

    confirmAssignExam(topic, text, targetStudentIds) {
        const fileInput = document.getElementById('exam-file-input');
        let fileData = null;
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileData = { name: file.name, url: URL.createObjectURL(file) };
        }
        this.activeExam = { topic, text, file: fileData, targetStudentIds, inProgress: true };
        this.addXp(15);
        this.showToast(`📝 Verifica "${topic}" distribuita (+15 XP)!`, "success");
    }

    collectExamsEndHourImplementation() {
        if (!this.activeExam) return this.showToast("Nessuna verifica attiva da ritirare.", "warning");

        this.pendingExams = [];
        const targets = this.activeExam.targetStudentIds || [];

        const examVariantsPool = [
            "1. Analisi preliminare:\nIl modello teorico esaminato evidenzia una chiara connessione tra i fattori ambientali e le risposte comportamentali.\n2. Trattazione dei punti chiave:\nLe dinamiche strutturali dimostrano come l'individuo elabora gli stimoli esterni.\n3. Conclusioni:\nL'elaborato espone con rigore metodologico i concetti chiave della materia.",
            "1. Analisi preliminare:\nViene affrontato il tema centrale focalizzandosi sui meccanismi di adattamento e reazione.\n2. Trattazione dei punti chiave:\nSi riscontrano alcune imprecisioni nella terminologia scientifica, ma il ragionamento logico risulta complessivamente corretto.\n3. Conclusioni:\nCompito svolto in modo sintetico ma completo in ogni sua parte.",
            "1. Analisi preliminare:\nLo studio approfondisce la prospettiva evolutiva e funzionale dei processi analizzati.\n2. Trattazione dei punti chiave:\nLa risposta al secondo quesito evidenzia un'ottima padronanza degli esempi pratici visti in classe.\n3. Conclusioni:\nTrattazione eccellente, chiara e priva di errori rilevanti.",
            "1. Analisi preliminare:\nL'esame della traccia parte da una panoramica generale per poi concentrarsi sui dettagli.\n2. Trattazione dei punti chiave:\nIl testo presenta passaggi un po' confusi nella parte centrale, evidenziando qualche incertezza di studio.\n3. Conclusioni:\nElaborato sufficiente, anche se migliorabile nella trattazione analitica.",
            "1. Analisi preliminare:\nViene evidenziata l'importanza dei fattori chiave del modulo.\n2. Trattazione dei punti chiave:\nBuona esposizione delle definizioni e corretta applicazione delle regole teoriche nei quesiti proposti.\n3. Conclusioni:\nLavoro ben strutturato che dimostra impegno e buon livello di preparazione."
        ];

        if (this.classroom && this.classroom.students) {
            this.classroom.students.forEach((s, index) => {
                if (targets.includes(s.id)) {
                    const status = this.studentStates.get(s.id) || 'presente';
                    if (status === 'presente') {
                        const variantIndex = (index + Math.floor(Math.random() * 3)) % examVariantsPool.length;
                        const uniqueAnswer = examVariantsPool[variantIndex];
                        this.pendingExams.push({
                            studentId: s.id,
                            studentName: s.displayName || s.name,
                            surname: s.surname,
                            topic: this.activeExam.topic,
                            submittedText: `--- ELABORATO SVOLTO DA ${s.displayName || s.name} ${s.surname.toUpperCase()} ---\n\n${uniqueAnswer}\n\n[Fine elaborato scritto completo]`,
                            fileSubmitted: this.activeExam.file
                        });
                    }
                }
            });
        }

        this.activeExam.inProgress = false;
        this.renderPendingExams();
        this.addXp(20);
        this.showToast(`🔔 Ora terminata! Ritirati ${this.pendingExams.length} elaborati scritti (+20 XP).`, "success");
    }

    renderAppello() {
        const container = document.getElementById('appello-card');
        if (!container || !this.classroom || !this.classroom.students) return;

        let presentCount = 0, absentCount = 0, lateCount = 0;
        this.classroom.students.forEach(s => {
            const st = this.studentStates.get(s.id);
            if (st === 'assente') absentCount++;
            else if (st === 'ritardo') lateCount++;
            else if (st === 'presente') presentCount++;
        });

        let content = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; transition: all 0.3s ease;">
                <h3 style="font-weight: 800; font-size: 1.15rem;">📋 Appello & Registro Presenze (${this.classroom.name})</h3>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span class="badge" style="background:#059669; color:#fff; padding:6px 12px; font-weight:700; border-radius: 8px;">🟢 Presenti: ${presentCount}</span>
                    <span class="badge" style="background:#dc2626; color:#fff; padding:6px 12px; font-weight:700; border-radius: 8px;">🔴 Assenti: ${absentCount}</span>
                    <span class="badge" style="background:#d97706; color:#fff; padding:6px 12px; font-weight:700; border-radius: 8px;">⏱️ Ritardi: ${lateCount}</span>
                    <button class="btn" onclick="window.toggleRollCallView()" style="background: var(--bg-card); color:var(--text-main); border:1px solid var(--primary-border); font-size: 0.78rem; padding: 7px 14px; border-radius: 8px; font-weight:700;">
                        ${this.isRollCallMapView ? '📋 Lista' : '🗺️ Mappa'}
                    </button>
                    <button class="btn" onclick="window.markAllPresent()" style="background: var(--success); color:#fff; font-size: 0.78rem; padding: 7px 14px; border-radius: 8px; font-weight:700;">✅ Tutti</button>
                </div>
            </div>
        `;

        if (!this.isRollCallMapView) {
            content += `<div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:12px;">Fai l'appello con <strong>[Pre / Ass]</strong> e seleziona manualmente <strong>P</strong>, <strong>A</strong> o <strong>R</strong>.</div><div id="appello-inner-items"></div>`;
            container.innerHTML = content;

            const innerItems = document.getElementById('appello-inner-items');
            this.classroom.students.forEach((s) => {
                const status = this.studentStates.get(s.id) || 'da_verificare';
                const isJustified = this.studentJustified.get(s.id) || false;
                const needsJustification = (status === 'assente' || status === 'ritardo') && !isJustified;
                const div = document.createElement('div');
                div.className = 'list-item';
                div.style.cssText = `padding: 12px 14px; border-radius: 12px; background: var(--bg-card); font-size: 0.88rem; border:1px solid var(--primary-border); margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; box-shadow: var(--custom-shadow); transition: all 0.2s ease;`;
                
                let statusBadge = '<span class="badge" style="background:var(--bg-main); color:var(--text-muted); padding:4px 8px; border-radius:6px;">Da Verificare</span>';
                if (status === 'presente') statusBadge = '<span class="badge" style="background:#059669; color:#fff; padding:4px 8px; border-radius:6px;">PRESENTE</span>';
                else if (status === 'assente') statusBadge = '<span class="badge" style="background:#dc2626; color:#fff; padding:4px 8px; border-radius:6px;">ASSENTE</span>';
                else if (status === 'ritardo') statusBadge = '<span class="badge" style="background:#d97706; color:#fff; padding:4px 8px; border-radius:6px;">RITARDO</span>';

                div.innerHTML = `
                    <div>
                        <strong>${s.displayName || s.name} ${s.surname}</strong> ${statusBadge}
                        ${isJustified ? '<span class="badge" style="background:#059669; color:#fff; margin-left:6px; font-size:0.7rem; padding:3px 6px; border-radius:4px;">Giustificato/a</span>' : ''}
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <button class="btn" style="padding: 6px 12px; font-size: 0.78rem; background: var(--primary); color:#fff; border-radius: 8px; font-weight:700;" onclick="window.checkSingleStudentPresence('${s.id}')">📣 [Pre / Ass]</button>
                        <button class="btn" style="padding: 5px 10px; font-size: 0.75rem; border-radius: 6px; background: ${status === 'presente' ? 'var(--success)' : 'var(--bg-main)'}; color:${status === 'presente' ? '#fff' : 'var(--text-main)'}; font-weight:700;" onclick="window.setStudentAttendance('${s.id}', 'presente')">P</button>
                        <button class="btn" style="padding: 5px 10px; font-size: 0.75rem; border-radius: 6px; background: ${status === 'assente' ? 'var(--danger)' : 'var(--bg-main)'}; color:${status === 'assente' ? '#fff' : 'var(--text-main)'}; font-weight:700;" onclick="window.setStudentAttendance('${s.id}', 'assente')">A</button>
                        <button class="btn" style="padding: 5px 10px; font-size: 0.75rem; border-radius: 6px; background: ${status === 'ritardo' ? 'var(--warning)' : 'var(--bg-main)'}; color:${status === 'ritardo' ? '#fff' : 'var(--text-main)'}; font-weight:700;" onclick="window.setStudentAttendance('${s.id}', 'ritardo')">R</button>
                        <button class="btn" style="padding: 5px 10px; font-size: 0.78rem; border-radius: 6px; background: ${needsJustification ? '#dc2626' : (isJustified ? '#475569' : 'var(--bg-main)')}; color: #fff; font-weight:800;" onclick="window.openJustificationModal('${s.id}')">📄</button>
                    </div>
                `;
                innerItems.appendChild(div);
            });
        } else {
            content += `<div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 10px;">Piantina Banchi Aula (con Reazioni Emozionali LIVE):</div><div id="appello-map-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;"></div>`;
            container.innerHTML = content;
            this.renderEmbeddedClassroomGrid();
        }
    }

    renderEmbeddedClassroomGrid() {
        const gridContainer = document.getElementById('appello-map-grid');
        if (!gridContainer || !this.classroom || !this.classroom.students) return;
        gridContainer.innerHTML = '';
        this.classroom.students.forEach((s, index) => {
            const status = this.studentStates.get(s.id) || 'da_verificare';
            const displayName = s.displayName || s.name;
            const emotion = this.studentEmotions.get(s.id) || '😊 Concentrato';
            let borderColor = 'var(--primary-border)';
            let bgColor = 'var(--bg-card)';
            if (status === 'assente') { borderColor = 'var(--danger)'; bgColor = 'var(--bg-card)'; }
            else if (status === 'ritardo') { borderColor = 'var(--warning)'; bgColor = 'var(--bg-card)'; }
            else if (status === 'presente') { borderColor = 'var(--success)'; bgColor = 'var(--bg-card)'; }

            const benchCard = document.createElement('div');
            benchCard.style.cssText = `background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 12px; padding: 10px; text-align: center; font-size: 0.8rem; cursor: pointer; box-shadow: var(--custom-shadow); transition: transform 0.2s ease;`;
            benchCard.onmouseover = () => { benchCard.style.transform = 'translateY(-2px)'; };
            benchCard.onmouseout = () => { benchCard.style.transform = 'translateY(0)'; };
            benchCard.onclick = () => { this.openStudentModal(s); };
            benchCard.innerHTML = `
                <div style="font-size: 0.68rem; color: var(--text-muted); font-weight:700;">Banco ${index + 1}</div>
                <div style="font-weight: 700; font-size: 0.82rem; margin-top:3px; color:var(--text-main);">${displayName}</div>
                <div style="font-size: 0.65rem; color: var(--accent); margin-top:2px; font-weight:600;">${emotion}</div>
                <div style="font-size: 0.68rem; margin-top: 4px;"><span class="badge" style="font-size:0.62rem; padding:2px 6px; border-radius:6px; background:var(--primary-light); color:var(--primary);">${status.toUpperCase()}</span></div>
            `;
            gridContainer.appendChild(benchCard);
        });
    }

    renderPendingExams() {
        const container = document.getElementById('pending-exams-list');
        if (!container) return;
        container.innerHTML = '';
        
        let headerHtml = `
            <div style="margin-bottom: 14px; display:flex; gap:10px; flex-wrap:wrap;">
                <button class="btn" style="background: #8b5cf6; color:#fff; font-size: 0.82rem; padding: 8px 14px; border-radius: 10px; font-weight: 700;" onclick="window.triggerOralInterrogation()">🎯 Avvia Interrogazione Orale</button>
                <button class="btn" style="background: var(--warning); color:#fff; font-size: 0.82rem; padding: 8px 14px; border-radius: 10px; font-weight: 700;" onclick="window.collectExamsEndHour()">📥 Ritira Verifiche a Fine Ora</button>
            </div>
        `;

        if (this.pendingExams.length === 0) {
            container.innerHTML = headerHtml + `
                <div style="background:var(--bg-card); padding:16px; border-radius:12px; border:1px solid var(--primary-border); box-shadow: var(--custom-shadow);">
                    <em style="color:var(--text-muted); font-size:0.85rem;">Nessun compito scritto in attesa di correzione. Assegna una verifica oppure avvia un'interrogazione orale.</em>
                </div>
            `;
            return;
        }

        let itemsHtml = headerHtml;
        this.pendingExams.forEach((ex, idx) => {
            itemsHtml += `
                <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:12px 14px; border-radius:12px; border:1px solid var(--primary-border); margin-bottom:8px; box-shadow: var(--custom-shadow);">
                    <div>
                        <strong style="color:var(--text-main);">${ex.studentName} ${ex.surname}</strong> - <span style="color:var(--primary); font-weight:700;">${ex.topic}</span>
                        <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Elaborato scritto unico e completo. Pronto per la correzione.</div>
                    </div>
                    <button class="btn" style="padding: 6px 12px; font-size: 0.8rem; background:var(--primary); color:#fff; border-radius: 8px; font-weight:700;" onclick="window.openExamSubmissionModal(${idx})">📖 Visualizza & Correggi</button>
                </div>
            `;
        });
        container.innerHTML = itemsHtml;
    }

    openExamSubmissionModalImplementation(idx) {
        const examItem = this.pendingExams[idx];
        if (!examItem) return;

        let modalHtml = `
            <div id="exam-submission-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 560px; width: 92%; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 6px; font-size: 1.2rem;">📖 Correzione Elaborato Scritto</h3>
                    <div style="font-size: 0.88rem; margin-bottom: 4px; color:var(--text-main);">Studente: <strong>${examItem.studentName} ${examItem.surname}</strong></div>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 14px;">Argomento: <strong>${examItem.topic}</strong></div>

                    <div style="background: var(--bg-main); color:var(--text-main); padding: 14px; border-radius: 12px; font-size: 0.85rem; margin-bottom: 18px; border: 1px solid var(--primary-border); white-space: pre-wrap; max-height:240px; overflow-y:auto;">
                        <strong>Svolgimento dello studente:</strong>
                        <p style="margin-top:6px; color:var(--text-main); line-height:1.4;">${examItem.submittedText}</p>
                    </div>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Seleziona Materia (${this.teacherProfile.fullName}):</label>
                    <select id="exam-modal-subject" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;">
                        ${this.teacherProfile.subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>

                    <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Voto (1 - 10):</label>
                    <input type="number" step="0.5" min="1" max="10" id="manual-exam-grade-val" value="7.5" style="width: 100%; padding: 10px; margin-bottom: 20px; border-radius: 10px; background:var(--bg-main); color:var(--text-main); border: 1px solid var(--primary-border); font-weight:800; font-size: 1.1rem; text-align:center;">

                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button class="btn" style="background: var(--success); color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="
                            const val = parseFloat(document.getElementById('manual-exam-grade-val').value);
                            const subj = document.getElementById('exam-modal-subject').value;
                            if(isNaN(val) || val < 1 || val > 10) { window.currentUiInstance.showToast('Inserisci un voto valido!', 'warning'); return; }
                            window.submitManualExamGrade(${idx}, val, subj);
                        ">Registra Voto nel Libretto</button>
                        <button class="btn" style="background: #475569; color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('exam-submission-modal').remove()">Chiudi</button>
                    </div>
                </div>
            </div>
        `;
        const oldM = document.getElementById('exam-submission-modal');
        if (oldM) oldM.remove();

        window.submitManualExamGrade = (itemIndex, gradeVal, subjectName) => {
            const item = this.pendingExams[itemIndex];
            if (this.classroom && item) {
                this.classroom.assignGrade(item.studentId, subjectName, gradeVal, 'Scritto');
                this.pendingExams.splice(itemIndex, 1);
                this.renderPendingExams();
                this.renderVoti();
                this.addXp(10);
                document.getElementById('exam-submission-modal').remove();
                this.showToast(`✅ Voto ${gradeVal} registrato per ${item.studentName}!`, "success");
            }
        };
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    injectMissingHtmlComponents() {
        const matTab = document.getElementById('tab-materiali');
        if (matTab && !document.getElementById('mat-file-input')) {
            const fileDiv = document.createElement('div');
            fileDiv.style.cssText = "margin-bottom: 12px; background:var(--bg-card); padding:12px; border-radius:10px; border:1px solid var(--primary-border);";
            fileDiv.innerHTML = `<label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:6px; color:var(--primary);">📎 Allega File Didattico:</label><input type="file" id="mat-file-input" style="font-size: 0.85rem;" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg">`;
            const pubBtn = matTab.querySelector('button');
            if (pubBtn && pubBtn.parentNode === matTab) {
                matTab.insertBefore(fileDiv, pubBtn);
            } else {
                matTab.appendChild(fileDiv);
            }
        }

        const examTab = document.getElementById('tab-verifiche');
        if (examTab && !document.getElementById('exam-file-input')) {
            const fileDiv = document.createElement('div');
            fileDiv.style.cssText = "margin-bottom: 12px; background:var(--bg-card); padding:12px; border-radius:10px; border:1px solid var(--primary-border);";
            fileDiv.innerHTML = `<label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:6px; color:var(--primary);">📎 Allega Traccia Verifica:</label><input type="file" id="exam-file-input" style="font-size: 0.85rem;" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg">`;
            examTab.appendChild(fileDiv);
        }

        const chatTab = document.getElementById('tab-chat');
        if (chatTab && !document.getElementById('chat-file-input')) {
            const chatInputArea = chatTab.querySelector('div[style*="display: flex"]') || chatTab;
            const fileDiv = document.createElement('div');
            fileDiv.style.cssText = "margin-bottom: 8px; background:var(--bg-card); padding:10px; border-radius:10px; border:1px solid var(--primary-border);";
            fileDiv.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; display:block; margin-bottom:4px; color:var(--primary);">📎 Allega file nella chat:</label><input type="file" id="chat-file-input" style="font-size: 0.8rem;" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg">`;
            if (chatInputArea && chatInputArea.parentNode) {
                chatInputArea.parentNode.insertBefore(fileDiv, chatInputArea);
            } else {
                chatTab.appendChild(fileDiv);
            }
        }

        const accountTab = document.getElementById('tab-account');
        if (accountTab && !document.getElementById('acc-theme-select')) {
            const themeContainer = document.createElement('div');
            themeContainer.style.cssText = "margin-top: 16px; background: var(--bg-card); padding: 16px; border-radius: 12px; border: 1px solid var(--primary-border); box-shadow: var(--custom-shadow);";
            themeContainer.innerHTML = `
                <h4 style="font-weight: 800; color: var(--primary); margin-bottom: 8px; font-size: 1rem;">🎨 Tema Visivo & Personalizzazione (8 Stili Pastello)</h4>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Scegli il tuo stile visivo preferito tra i temi chiari e pastello:</div>
                <label style="font-size: 0.8rem; font-weight: 700; display:block; margin-bottom:4px;">Seleziona Tema:</label>
                <select id="acc-theme-select" style="width: 100%; padding: 10px; margin-bottom: 14px; border-radius: 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--primary-border); font-size: 0.88rem;">
                    <option value="classic">🏫 Classico Scuola (Default)</option>
                    <option value="zenith">🍃 Zenith Minimal (Verde Pastello Acceso)</option>
                    <option value="amber">🍑 Warm Amber (Crema & Pesca Caldo)</option>
                    <option value="moka">☕ Moka Minimal (Marrone Pastello Chiaro)</option>
                    <option value="rosa">🌸 Rosa Pastello (Delicato & Luminoso)</option>
                    <option value="lilla">💜 Lilla (Sofisticato & Rilassante)</option>
                    <option value="arancio">🍊 Arancione Pastello (Caldo & Accogliente)</option>
                    <option value="verdeacqua">🌊 Verde Acqua (Pastello Fresco)</option>
                </select>
                <button class="btn" style="background: var(--primary); color: #fff; font-size: 0.85rem; padding: 10px 18px; border-radius: 10px; font-weight: 700;" onclick="window.currentUiInstance.saveAccountCustomizationsImplementation()">Salva Tema & Preferenze</button>
            `;
            accountTab.appendChild(themeContainer);
        }

        // 🏆 Bacheca Scudetti & Barra XP (Tutti bloccati all'inizio)
        if (accountTab && !document.getElementById('acc-badges-container')) {
            const badgesBox = document.createElement('div');
            badgesBox.id = 'acc-badges-container';
            badgesBox.style.cssText = "margin-top: 16px; background: var(--bg-card); padding: 18px; border-radius: 14px; border: 1px solid var(--primary-border); box-shadow: var(--custom-shadow);";
            badgesBox.innerHTML = `
                <h4 style="font-weight: 800; color: var(--primary); margin-bottom: 8px; font-size: 1rem;">🏆 Bacheca Scudetti & Traguardi</h4>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px;">Livello Docente: <strong id="docent-level-display">Livello 1 (0 XP)</strong></div>
                <div style="margin-bottom:14px; background:var(--bg-main); padding:10px 14px; border-radius:10px; border:1px solid var(--primary-border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                    <span style="font-size:0.82rem; font-weight:700; color:var(--text-main);">📈 Barra XP & Livello Apprendimento:</span>
                    <div style="flex:1; max-width:280px; background:var(--bg-card); height:12px; border-radius:6px; overflow:hidden; border:1px solid var(--primary-border);">
                        <div id="xp-progress-bar" style="background:linear-gradient(90deg, var(--primary), var(--accent)); width:0%; height:100%; border-radius:6px; transition:width 0.3s;"></div>
                    </div>
                    <span id="xp-text-display" style="font-size:0.78rem; color:var(--primary); font-weight:800;">0 / 100 XP</span>
                </div>
                <div id="badges-list-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px;"></div>
            `;
            accountTab.appendChild(badgesBox);
            this.renderProfileBadges();
        }

        // 📖 Libro Interattivo nell'Account
        if (accountTab && !document.getElementById('acc-interactive-book')) {
            const bookBox = document.createElement('div');
            bookBox.id = 'acc-interactive-book';
            bookBox.style.cssText = "margin-top: 16px; background: #fffdf9; padding: 24px; border-radius: 16px; border: 2px solid #e7d8c9; box-shadow: 0 12px 30px rgba(140, 88, 48, 0.12); position: relative;";
            accountTab.appendChild(bookBox);
            this.renderInteractiveBook();
        }
    }

    renderInteractiveBook() {
        const bookBox = document.getElementById('acc-interactive-book');
        if (!bookBox) return;

        const pages = [
            {
                title: "📖 Capitolo 1: Login, Badge QR & Gestione Oraria Pomeridiana/Serale",
                content: `<strong>Guida Operativa Avanzata:</strong><br>
                - <strong>Accesso:</strong> Effettua il login con email e password oppure scannerizzando il tuo <em>Badge QR</em> personale tramite la fotocamera.<br>
                - <strong>Orari:</strong> Le lezioni seguono i turni pomeridiani (15:30 - 18:00) e serali (20:00 - 21:00). La pausa ricreazione di 10 minuti scatta automaticamente dopo la 3ª ora.<br>
                - <strong>Firma dell'Ora:</strong> Inserisci l'argomento nel tab <em>Registro & Lezione</em> e clicca su <strong>Avvia Lezione</strong> per firmare l'ora e guadagnare XP.`
            },
            {
                title: "📖 Capitolo 2: Appello, Mappa Banchi & Giustifiche",
                content: `<strong>Guida Operativa Avanzata:</strong><br>
                - <strong>Appello Rapido:</strong> Usa [Pre / Ass] per simulare la risposta in aula o imposta direttamente <strong>P</strong> (Presente), <strong>A</strong> (Assente) o <strong>R</strong> (Ritardo).<br>
                - <strong>Mappa Interattiva:</strong> Visualizza i banchi e le reazioni emotive live degli studenti in tempo reale.<br>
                - <strong>Giustifiche:</strong> Clicca sull'icona 📄 accanto agli assenti per registrare la firma del genitore.`
            },
            {
                title: "📖 Capitolo 3: Voti, Competenze & Esportazione Dati",
                content: `<strong>Guida Operativa Avanzata:</strong><br>
                - <strong>Tabellone Voti:</strong> Registra voti scritti, orali o pratici e monitora la media della classe e gli studenti a rischio.<br>
                - <strong>Competenze:</strong> Valuta l'autonomia operativa, la partecipazione e il problem solving di ogni singolo alunno.<br>
                - <strong>Export Excel & PDF:</strong> Scarica il tabellone in formato CSV o stampa un dettagliato **Resoconto Giornaliero in PDF** pronto per l'archiviazione.`
            },
            {
                title: "📖 Capitolo 4: Verifiche Scritte & Interrogazioni Orali",
                content: `<strong>Guida Operativa Avanzata:</strong><br>
                - <strong>Verifiche:</strong> Inserisci la traccia e distribuisci il compito ai presenti. A fine ora ritira gli elaborati scritti completi per correggerli.<br>
                - <strong>Interrogazioni:</strong> Avvia sessioni di interrogazione orale dinamica con botta e risposta in tempo reale.`
            },
            {
                title: "📖 Capitolo 5: Collegio Docenti, Chat & XP System",
                content: `<strong>Guida Operativa Avanzata:</strong><br>
                - <strong>Collegio Docenti:</strong> Comunica in chat con gli altri professori allegando file e documenti utili.<br>
                - <strong>Sistema XP e Scudetti:</strong> Più utilizzi il registro scolastico, più guadagni punti esperienza per sbloccare nuovi prestigiosi scudetti!`
            }
        ];

        const currentPageData = pages[this.activeBookPage - 1];

        let bookHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e7d8c9; padding-bottom:12px; margin-bottom:16px;">
                <h4 style="font-weight: 800; color: #8c5830; margin:0; font-size: 1.15rem;">📚 Manuale Guida Interattivo Completo del Docente</h4>
                <span class="badge" style="background:#faeddb; color:#8c5830; padding:6px 12px; border-radius:8px; font-weight:800; font-size:0.85rem;">Pagina ${this.activeBookPage} di ${pages.length}</span>
            </div>

            <div style="background: #fcf6ed; border: 1px solid #ebd8c2; padding: 20px; border-radius: 12px; min-height: 150px; margin-bottom: 16px;">
                <h5 style="font-weight: 800; color: #8c5830; margin-bottom: 8px; font-size: 1.02rem;">${currentPageData.title}</h5>
                <div style="font-size: 0.88rem; color: #3d3124; line-height: 1.55;">${currentPageData.content}</div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
                <button class="btn" style="background: ${this.activeBookPage > 1 ? '#8c5830' : '#cbd5e1'}; color:#fff; padding: 8px 16px; border-radius: 8px; font-weight:700; cursor:${this.activeBookPage > 1 ? 'pointer' : 'not-allowed'};" ${this.activeBookPage > 1 ? `onclick="window.setBookPage(${this.activeBookPage - 1})"` : 'disabled'}>⬅️ Pagina Precedente</button>
                
                <div style="display:flex; gap:6px;">
                    ${pages.map((_, idx) => `<button class="btn" style="width:28px; height:28px; border-radius:50%; padding:0; font-size:0.78rem; background:${this.activeBookPage === idx + 1 ? '#8c5830' : '#faeddb'}; color:${this.activeBookPage === idx + 1 ? '#fff' : '#8c5830'}; font-weight:800;" onclick="window.setBookPage(${idx + 1})">${idx + 1}</button>`).join('')}
                </div>

                <button class="btn" style="background: ${this.activeBookPage < pages.length ? '#8c5830' : '#cbd5e1'}; color:#fff; padding: 8px 16px; border-radius: 8px; font-weight:700; cursor:${this.activeBookPage < pages.length ? 'pointer' : 'not-allowed'};" ${this.activeBookPage < pages.length ? `onclick="window.setBookPage(${this.activeBookPage + 1})"` : 'disabled'}>Pagina Successiva ➡️</button>
            </div>
        `;

        bookBox.innerHTML = bookHtml;
    }

    renderProfileBadges() {
        const grid = document.getElementById('badges-list-grid');
        const levelDisplay = document.getElementById('docent-level-display');
        const xpBar = document.getElementById('xp-progress-bar');
        const xpText = document.getElementById('xp-text-display');

        const currentLevelXp = this.teacherXp % 100;

        if (levelDisplay) {
            levelDisplay.innerText = `Livello ${this.teacherLevel} (${this.teacherXp} XP Totali)`;
        }
        if (xpBar) {
            xpBar.style.width = `${(currentLevelXp / 100) * 100}%`;
        }
        if (xpText) {
            xpText.innerText = `${currentLevelXp} / 100 XP`;
        }

        if (!grid) return;
        grid.innerHTML = '';
        this.badgesUnlocked.forEach(b => {
            grid.innerHTML += `
                <div style="background: var(--bg-main); border: 1px solid var(--primary-border); padding: 12px; border-radius: 10px; box-shadow: var(--custom-shadow); opacity: ${b.unlocked ? '1' : '0.85'};">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <strong style="color: var(--primary); font-size:0.88rem;">${b.unlocked ? '🌟' : '🔒'} ${b.title}</strong>
                        <span class="badge" style="font-size:0.65rem; background:var(--primary-light); color:var(--primary); padding:2px 6px; border-radius:4px;">${b.progress}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); line-height:1.3;">${b.desc}</div>
                </div>
            `;
        });
    }

    switchTabImplementation(tabId, element) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const targetTab = document.getElementById(`tab-${tabId}`);
        if(targetTab) targetTab.classList.add('active');
        if(element) element.classList.add('active');
        this.updateHeaderTitle(tabId);
        if(tabId === 'orario') { this.renderInteractiveSchedule(); this.renderPersonalDocentSchedule(); }
        if(tabId === 'chat') { this.renderFacultyChatList(); this.renderPrivateChatMessages(); }
        if(tabId === 'voti') this.renderVoti();
        if(tabId === 'note') this.populateNoteSelector();
        if(tabId === 'registro') { this.updateScheduleStatusBadge(); this.renderAppello(); }
        if(tabId === 'account') { this.populateAccountTab(); this.renderPendingApprovals(); this.renderProfileBadges(); this.renderInteractiveBook(); }
        if(tabId === 'verifiche') { this.renderPendingExams(); }
    }

    switchLoginTabImplementation(mode) {
        const credSec = document.getElementById('login-cred-section');
        const qrSec = document.getElementById('login-qr-section');
        const btnCred = document.getElementById('tab-btn-cred');
        const btnQr = document.getElementById('tab-btn-qr');
        if (mode === 'credentials') {
            if(credSec) credSec.style.display = 'block';
            if(qrSec) qrSec.style.display = 'none';
            if(btnCred) { btnCred.style.background = 'white'; btnCred.style.color = 'var(--primary)'; }
            if(btnQr) { btnQr.style.background = 'transparent'; btnQr.style.color = 'var(--text-muted)'; }
            this.stopCameraScanImplementation();
        } else {
            if(credSec) credSec.style.display = 'none';
            if(qrSec) qrSec.style.display = 'block';
            if(btnQr) { btnQr.style.background = 'white'; btnQr.style.color = 'var(--primary)'; }
            if(btnCred) { btnCred.style.background = 'transparent'; btnCred.style.color = 'var(--text-muted)'; }
        }
    }

    startCameraScanImplementation() {
        const startBtn = document.getElementById('start-cam-btn');
        const stopBtn = document.getElementById('stop-cam-btn');
        if(startBtn) startBtn.style.display = 'none';
        if(stopBtn) stopBtn.style.display = 'inline-flex';
        if (typeof Html5Qrcode === 'undefined') return this.showToast("Libreria QR non presente.", "error");

        this.html5QrCode = new Html5Qrcode("qr-reader");
        this.html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 220, height: 220 } },
            (decodedText) => { this.handleQRScanResult(decodedText); },
            (errorMessage) => {}
        ).catch(err => {
            this.showToast("Impossibile accedere alla videocamera.", "error");
            if(startBtn) startBtn.style.display = 'inline-flex';
            if(stopBtn) stopBtn.style.display = 'none';
        });
    }

    stopCameraScanImplementation() {
        if (this.html5QrCode) {
            this.html5QrCode.stop().then(() => {
                const startBtn = document.getElementById('start-cam-btn');
                const stopBtn = document.getElementById('stop-cam-btn');
                if(startBtn) startBtn.style.display = 'inline-flex';
                if(stopBtn) stopBtn.style.display = 'none';
            }).catch(err => {});
        }
    }

    openAddProfModalImplementation() {
        if (!this.teacherProfile.isAdmin) return this.showToast("Solo l'amministratore può aggiungere nuovi docenti.", "warning");
        const modal = document.getElementById('add-prof-modal');
        if (modal) modal.style.display = 'flex';
    }

    submitCreateNewProfImplementation() {
        const name = document.getElementById('prof-name-input')?.value.trim();
        const surname = document.getElementById('prof-surname-input')?.value.trim();
        const subject = document.getElementById('prof-subject-input')?.value.trim();
        const email = document.getElementById('prof-email-input')?.value.trim();
        const password = document.getElementById('prof-pass-input')?.value.trim();
        if (!name || !surname || !subject || !email) return this.showToast("Compila tutti i campi obbligatori!", "warning");

        const cleanSurname = surname.toUpperCase().replace(/\s+/g, '');
        const profId = surname.toLowerCase().replace(/\s+/g, '');
        const newProf = {
            id: profId,
            name: `${name} ${surname}`,
            email: email,
            password: password || 'scuola2026!',
            subjects: [subject],
            classes: ['1ª A', '2ª A'],
            availability: 'Pomeriggio',
            isAdmin: false,
            qrCodeData: `PROF_${cleanSurname}`
        };
        this.professorsList.push(newProf);
        this.chatMessages[profId] = [];
        window.closeModal('add-prof-modal');
        this.renderFacultyChatList();
        this.showToast(`✅ Professore ${newProf.name} creato con successo!`, "success");
    }

    setStudentAttendanceImplementation(studentId, status) {
        this.studentStates.set(studentId, status);
        this.saveCurrentDayHistory();
        this.renderAppello();
        this.renderClassroomGrid();
        this.addXp(2);
    }

    markAllPresentImplementation() {
        if (this.classroom && this.classroom.students) {
            this.classroom.students.forEach(s => this.studentStates.set(s.id, 'presente'));
            this.saveCurrentDayHistory();
            this.renderAppello();
            this.renderClassroomGrid();
            this.addXp(10);
            this.showToast("Tutti gli studenti segnati come presenti (+10 XP).", "success");
        }
    }

    startInteractiveLessonImplementation() {
        const topicInput = document.getElementById('lesson-topic').value;
        if (!topicInput) return this.showToast("Inserisci l'argomento prima di firmare!", "warning");

        document.getElementById('start-hour-card').style.display = 'none';
        document.getElementById('active-lesson-card').style.display = 'block';
        document.getElementById('current-lesson-title-display').innerText = `[${this.classroom.name}] ${topicInput}`;
        this.hasExplained = false;

        this.lessonSystem.startHour(
            topicInput,
            () => { this.openEndHourModal(); },
            (timeLeft, formattedTime) => {
                const timerBadge = document.getElementById('timer-badge');
                if (timerBadge) timerBadge.innerText = "⏱️ " + formattedTime;
                if (this.classroom) this.lessonSystem.applyLearning(this.classroom);
            },
            () => { if (this.hasExplained && !this.isTeacherWriting) this.triggerSpontaneousQuestion(); }
        );

        const feed = document.getElementById('classroom-live-feed');
        if (feed) feed.innerHTML += `<div style="color: var(--success); margin-bottom: 6px;"><strong>[${this.teacherProfile.fullName}]:</strong> Lezione avviata. Argomento: "${topicInput}".</div>`;
        this.addXp(25);
        this.showToast("🚀 Lezione avviata con successo (+25 XP)!", "success");
    }

    addMaterialImplementation() {
        const title = document.getElementById('mat-title').value;
        const desc = document.getElementById('mat-desc').value;
        const fileInput = document.getElementById('mat-file-input');
        let fileData = null;
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileData = { name: file.name, url: URL.createObjectURL(file) };
        }
        if(!title) return this.showToast("Inserisci il titolo del materiale!", "warning");
        this.materials.push({ title, desc, file: fileData, date: new Date().toLocaleDateString() });
        this.renderMaterials();
        document.getElementById('mat-title').value = '';
        document.getElementById('mat-desc').value = '';
        if(fileInput) fileInput.value = '';
        this.addXp(10);
        this.showToast("Materiale didattico pubblicato (+10 XP)!", "success");
    }

    renderMaterials() {
        const container = document.getElementById('material-list');
        if (!container) return;
        container.innerHTML = '';
        if (this.materials.length === 0) {
            container.innerHTML = '<em style="color:var(--text-muted); font-size:0.85rem;">Nessun materiale pubblicato.</em>';
            return;
        }
        this.materials.forEach(m => {
            container.innerHTML += `
                <div class="list-item" style="padding:14px; background:var(--bg-card); border-radius:12px; margin-bottom:10px; border:1px solid var(--primary-border); box-shadow: var(--custom-shadow);">
                    <div>
                        <strong style="color:var(--primary); font-size:0.95rem;">📄 ${m.title}</strong>
                        <div style="font-size: 0.85rem; color: var(--text-main); margin-top:4px; line-height:1.4;">${m.desc}</div>
                        ${m.file ? `<div style="font-size:0.82rem; margin-top:8px;"><a href="${m.file.url}" target="_blank" style="color:var(--primary); font-weight:700; text-decoration:underline;">📎 Allegato: ${m.file.name}</a></div>` : ''}
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${m.date}</span>
                </div>
            `;
        });
    }

    sendFacultyChatMessageImplementation() {
        const input = document.getElementById('chat-input');
        const fileInput = document.getElementById('chat-file-input');
        let text = input ? input.value.trim() : '';
        let fileInfo = '';
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileUrl = URL.createObjectURL(file);
            fileInfo = `<br>📎 <a href="${fileUrl}" target="_blank" style="color:var(--primary); font-weight:700; text-decoration:underline;">Allegato: ${file.name}</a>`;
        }
        if(!text && !fileInfo) return;
        if (!this.chatMessages[this.activeChatProfId]) this.chatMessages[this.activeChatProfId] = [];
        this.chatMessages[this.activeChatProfId].push({
            sender: `Tu (${this.teacherProfile.fullName})`,
            text: text + fileInfo,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        if (input) input.value = '';
        if (fileInput) fileInput.value = '';
        this.renderPrivateChatMessages();
        this.addXp(5);
    }

    exportGradesCSVImplementation() {
        if (!this.classroom || !this.classroom.students) return;
        let csvContent = "data:text/csv;charset=utf-8,Studente,Cognome,Materia,Voto,Tipologia\n";
        this.classroom.students.forEach(s => {
            const grades = (this.classroom.gradeBook && this.classroom.gradeBook.get(s.id)) || [];
            grades.forEach(g => {
                csvContent += `${s.displayName || s.name},${s.surname},${g.subject || 'Generale'},${g.grade},${g.type || 'Test'}\n`;
            });
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Tabellone_Voti_${this.classroom.name}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        this.showToast("📊 Tabellone voti Excel/CSV esportato correttamente!", "success");
    }

    renderVoti() {
        const container = document.getElementById('voti-list');
        if (!container || !this.classroom || !this.classroom.students) return;
        container.innerHTML = '';

        let totalGradesCount = 0;
        let sumAllGrades = 0;
        let insufficientStudents = 0;
        const allSubjectsSet = new Set();

        this.classroom.students.forEach(s => {
            const grades = (this.classroom.gradeBook && this.classroom.gradeBook.get(s.id)) || [];
            grades.forEach(g => allSubjectsSet.add(g.subject || 'Generale'));
            if (grades.length > 0) {
                const sAvg = grades.reduce((a, b) => a + b.grade, 0) / grades.length;
                sumAllGrades += sAvg;
                totalGradesCount++;
                if (sAvg < 6) insufficientStudents++;
            }
        });

        const classAvg = totalGradesCount > 0 ? (sumAllGrades / totalGradesCount).toFixed(1) : 'N/D';
        let subjectFilterOptions = `<button class="btn" style="padding:6px 12px; font-size:0.78rem; border-radius:8px; background:${this.selectedGradeSubjectFilter === 'Tutte' ? 'var(--primary)' : 'var(--bg-main)'}; color:${this.selectedGradeSubjectFilter === 'Tutte' ? '#fff' : 'var(--text-main)'}; font-weight:700;" onclick="window.filterGradesBySubject('Tutte')">Tutte</button>`;
        allSubjectsSet.forEach(subj => {
            const active = this.selectedGradeSubjectFilter === subj;
            subjectFilterOptions += `<button class="btn" style="padding:6px 12px; font-size:0.78rem; border-radius:8px; background:${active ? 'var(--primary)' : 'var(--bg-main)'}; color:${active ? '#fff' : 'var(--text-main)'}; font-weight:700; margin-left:6px;" onclick="window.filterGradesBySubject('${subj}')">${subj}</button>`;
        });

        const analyticsHtml = `
            <div style="background: var(--bg-card); border: 1px solid var(--primary-border); padding: 20px; border-radius: 16px; margin-bottom: 20px; box-shadow: var(--custom-shadow);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
                    <div>
                        <strong style="color:var(--primary); font-size:1.1rem;">📊 Cruscotto Analitico Voti (${this.classroom.name})</strong>
                        <div style="font-size:0.82rem; color:var(--text-muted); margin-top:2px;">Panoramica delle medie, valutazioni e studenti a rischio</div>
                    </div>
                    <div style="display:flex; gap:8px; font-size:0.85rem; align-items:center; flex-wrap:wrap;">
                        <span class="badge" style="background:var(--primary-light); color:var(--primary); padding:8px 14px; border:1px solid var(--primary-border); border-radius:10px; font-weight:800;">Media Classe: ${classAvg}</span>
                        <span class="badge" style="background:${insufficientStudents > 0 ? '#fee2e2' : '#ecfdf5'}; color:${insufficientStudents > 0 ? '#dc2626' : '#059669'}; padding:8px 14px; border-radius:10px; font-weight:800;">A Rischio: ${insufficientStudents}</span>
                        <button class="btn" style="background:#8b5cf6; color:#fff; font-size:0.78rem; padding:8px 14px; border-radius:10px; font-weight:700;" onclick="window.exportGradesCSV()">📥 Export Excel</button>
                        <button class="btn" style="background:#0284c7; color:#fff; font-size:0.78rem; padding:8px 14px; border-radius:10px; font-weight:700;" onclick="window.exportDailyReportPDF()">🖨️ Stampa PDF Resoconto</button>
                    </div>
                </div>

                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:0.85rem; margin-top:14px; border-top:1px solid var(--primary-border); padding-top:12px;">
                    <strong>Filtra Materia:</strong> ${subjectFilterOptions}
                    <button class="btn" style="background:var(--success); color:#fff; font-size:0.82rem; padding:8px 16px; border-radius:10px; margin-left:auto; font-weight:700;" onclick="window.openAddGradeModal()">+ Inserisci Voto</button>
                    <button class="btn" style="background:var(--warning); color:#fff; font-size:0.82rem; padding:8px 16px; border-radius:10px; font-weight:700;" onclick="window.recordVoiceMemo()">🎙️ Nota Vocale</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', analyticsHtml);

        this.classroom.students.forEach(s => {
            const displayName = s.displayName || s.name;
            const grades = (this.classroom.gradeBook && this.classroom.gradeBook.get(s.id)) || [];
            const filteredGrades = grades.filter(g => this.selectedGradeSubjectFilter === 'Tutte' || (g.subject || 'Generale') === this.selectedGradeSubjectFilter);
            const gradesBySubject = {};
            grades.forEach(g => {
                const subj = g.subject || 'Generale';
                if (!gradesBySubject[subj]) gradesBySubject[subj] = [];
                gradesBySubject[subj].push(g);
            });

            let subjectBadgesHtml = '';
            for (const [subj, list] of Object.entries(gradesBySubject)) {
                if (this.selectedGradeSubjectFilter !== 'Tutte' && subj !== this.selectedGradeSubjectFilter) continue;
                const subAvg = (list.reduce((a, b) => a + b.grade, 0) / list.length).toFixed(1);
                subjectBadgesHtml += `<span class="badge" style="background:var(--primary-light); color:var(--primary); margin-right:6px; font-size:0.75rem; padding:4px 8px; border-radius:6px;">${subj}: <strong>${subAvg}</strong></span>`;
            }

            let avgText = filteredGrades.length > 0 ? (filteredGrades.reduce((a, b) => a + b.grade, 0) / filteredGrades.length).toFixed(1) : 'N/D';
            const div = document.createElement('div');
            div.className = 'list-item';
            div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 14px; background: var(--bg-card); border: 1px solid var(--primary-border); margin-bottom:8px; border-radius:12px; box-shadow: var(--custom-shadow); transition: all 0.2s ease;";
            div.innerHTML = `
                <div style="cursor: pointer; flex:1;" onclick="window.openStudentGradesDetailModal('${s.id}')">
                    <strong style="color: var(--primary); text-decoration: underline; font-size:0.95rem;">${displayName} ${s.surname}</strong>
                    <div style="margin-top:6px;">${subjectBadgesHtml || '<em style="font-size:0.78rem; color:var(--text-muted);">Nessun voto registrato</em>'}</div>
                </div>
                <div style="text-align:right; display:flex; align-items:center; gap:8px;">
                    <span class="badge" style="background: var(--primary-light); color: var(--primary); font-size: 0.88rem; padding: 6px 12px; border-radius: 10px;">Media: <strong>${avgText}</strong></span>
                    <button class="btn" style="padding: 6px 10px; font-size: 0.75rem; background: #8b5cf6; color:#fff; border-radius:8px; font-weight:700;" onclick="window.openCompetencyModal('${s.id}')">📑 Competenze</button>
                    <button class="btn" style="padding: 6px 12px; font-size: 0.78rem; border-radius: 8px; font-weight:700;" onclick="window.openAddGradeModalForStudent('${s.id}')">+ Voto</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    openStudentGradesDetailModalImplementation(studentId) {
        const student = this.classroom.students.find(s => s.id === studentId);
        if (!student) return;
        const displayName = student.displayName || student.name;
        const grades = (this.classroom.gradeBook && this.classroom.gradeBook.get(studentId)) || [];
        const gradesBySubject = {};
        grades.forEach(g => {
            const subj = g.subject || 'Generale';
            if (!gradesBySubject[subj]) gradesBySubject[subj] = [];
            gradesBySubject[subj].push(g);
        });

        let subjectsHtml = '';
        if (Object.keys(gradesBySubject).length === 0) {
            subjectsHtml = '<em style="color: var(--text-muted); font-size:0.85rem;">Nessun voto registrato.</em>';
        } else {
            for (const [subj, list] of Object.entries(gradesBySubject)) {
                const subjAvg = (list.reduce((a, b) => a + b.grade, 0) / list.length).toFixed(1);
                subjectsHtml += `
                    <div style="background: var(--bg-main); border:1px solid var(--primary-border); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--primary-border); padding-bottom:6px;">
                            <strong style="color: var(--primary); font-size:0.98rem;">📚 ${subj}</strong>
                            <span class="badge" style="background: var(--primary-light); color: var(--primary); padding: 4px 8px; border-radius: 6px;">Media: ${subjAvg}</span>
                        </div>
                        ${list.map(g => `
                            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; margin-bottom:6px; background:var(--bg-card); padding:8px 10px; border-radius:8px; border: 1px solid var(--primary-border);">
                                <span>${g.type || 'Test'} (${g.date || 'Oggi'})</span>
                                <strong style="color:${g.grade >= 6 ? 'var(--success)' : 'var(--danger)'};">Voto: ${g.grade}</strong>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        let modalHtml = `
            <div id="student-grades-detail-modal" class="modal" style="display: flex; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(6px); z-index: 9999;">
                <div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 20px; padding: 28px; max-width: 540px; width: 92%; max-height: 82vh; overflow-y: auto; box-shadow: var(--custom-shadow);">
                    <h3 style="font-weight: 800; color: var(--primary); margin-bottom: 4px; font-size: 1.2rem;">📊 Libretto: ${displayName} ${student.surname}</h3>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 16px;">Classe: ${this.classroom.name}</div>
                    <div style="margin-bottom: 18px;">${subjectsHtml}</div>
                    <div style="text-align: right;"><button class="btn" style="background: #475569; color:#fff; padding: 10px 20px; border-radius: 10px; font-weight: 700;" onclick="document.getElementById('student-grades-detail-modal').remove()">Chiudi</button></div>
                </div>
            </div>
        `;
        const existingModal = document.getElementById('student-grades-detail-modal');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    renderClassroomGrid() {}

    openStudentModal(student) {
        const displayName = student.displayName || student.name;
        document.getElementById('modal-student-name').innerText = `Scheda: ${displayName} ${student.surname}`;
        document.getElementById('modal-student-sub').innerText = `Profilo Comportamentale & Emozionale LIVE`;
        const anxiety = student.personality?.anxietyLevel || 0.25;
        const grades = (this.classroom.gradeBook && this.classroom.gradeBook.get(student.id)) || [];
        let avg = grades.length > 0 ? (grades.reduce((a, b) => a + b.grade, 0) / grades.length).toFixed(1) : 7.5;

        document.getElementById('student-profile-text').innerText = `📌 Tratto: ${student.personality?.traitDescription || 'Regolare.'}\n🎭 Stato Emozionale: ${this.studentEmotions.get(student.id) || 'Concentrato'}\n📊 Andamento costante.`;
        document.getElementById('chart-grade-val').innerText = `${avg} / 10`;
        document.getElementById('chart-grade-bar').style.width = `${(avg / 10) * 100}%`;
        document.getElementById('chart-attendance-val').innerText = `95%`;
        document.getElementById('chart-attendance-bar').style.width = `95%`;
        document.getElementById('chart-anxiety-val').innerText = `${Math.round(anxiety * 100)}%`;
        document.getElementById('chart-anxiety-bar').style.width = `${Math.round(anxiety * 100)}%`;
        document.getElementById('student-modal').style.display = 'flex';
    }

    renderInteractiveSchedule() {
        const tbody = document.getElementById('interactive-schedule-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
        const hours = [
            "15:30 - 16:00 (1ª Ora)", 
            "16:00 - 16:30 (2ª Ora)", 
            "16:30 - 17:00 (3ª Ora)", 
            "☕ Pausa Ricreazione Automatica (10 min)", 
            "17:10 - 17:40 (4ª Ora)", 
            "17:40 - 18:10 (5ª Ora)", 
            "20:00 - 20:30 (Sera - 6ª Ora)", 
            "20:30 - 21:00 (Sera - 7ª Ora)"
        ];

        hours.forEach((hourLabel, hIndex) => {
            if (hourLabel.includes('Pausa')) {
                let breakRow = `<tr><td colspan="6" style="padding: 8px; text-align: center; font-weight: 700; background: #fef3c7; color: #b45309; border: 1px solid var(--primary-border); font-size: 0.82rem;">☕ ${hourLabel}</td></tr>`;
                tbody.innerHTML += breakRow;
                return;
            }

            let row = `<tr><td style="padding: 12px; font-weight: 700; background: var(--bg-main); border: 1px solid var(--primary-border); font-size: 0.85rem;">${hourLabel}</td>`;
            days.forEach(day => {
                const entries = this.weeklySchedule[day]?.[hIndex] || [];
                let cellContent = '';
                if (entries.length === 0) {
                    cellContent = `<span style="color:var(--text-muted); font-size:0.78rem;">--- Vuoto ---</span>`;
                } else {
                    entries.forEach(e => {
                        cellContent += `
                            <div style="background: var(--primary-light); border: 1px solid var(--primary-border); border-radius: 8px; padding: 8px; margin-bottom: 6px;">
                                <div style="font-weight: 800; color: var(--primary); font-size: 0.82rem;">${e.classe} - ${e.materia}</div>
                                <div style="font-size: 0.76rem; color: var(--text-main); margin-top: 2px;">👨‍🏫 ${e.prof}</div>
                            </div>
                        `;
                    });
                }
                row += `<td style="padding: 10px; border: 1px solid var(--primary-border); background: var(--bg-card); vertical-align: top;">${cellContent}</td>`;
            });
            row += `</tr>`;
            tbody.innerHTML += row;
        });
    }

    renderPersonalDocentSchedule() {
        const container = document.getElementById('docent-daily-schedule-cards');
        if (!container) return;
        container.innerHTML = '';
        const days = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
        const hours = [
            "15:30 - 16:00", 
            "16:00 - 16:30", 
            "16:30 - 17:00", 
            "☕ Pausa Automatica (10 min)", 
            "17:10 - 17:40", 
            "17:40 - 18:10", 
            "20:00 - 20:30 (Sera)", 
            "20:30 - 21:00 (Sera)"
        ];

        days.forEach(day => {
            let dayHtml = `<div style="background: var(--bg-card); border: 1px solid var(--primary-border); border-radius: 14px; padding: 16px; box-shadow: var(--custom-shadow);"><h4 style="font-weight: 800; color: var(--primary); margin-bottom: 10px; font-size: 1.05rem;">🗓️ ${day}</h4>`;
            let hasHours = false;
            hours.forEach((hourLabel, hIndex) => {
                if (hourLabel.includes('Pausa')) return;
                const entries = this.weeklySchedule[day]?.[hIndex] || [];
                entries.forEach(e => {
                    if (e.prof.toLowerCase().includes(this.teacherProfile.fullName.toLowerCase())) {
                        hasHours = true;
                        dayHtml += `
                            <div style="background: var(--bg-main); border: 1px solid var(--primary-border); padding: 10px 14px; border-radius: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: var(--custom-shadow);">
                                <span style="font-weight: 700; color: var(--text-muted); font-size:0.82rem;">⏱️ ${hourLabel}</span>
                                <span style="font-weight: 800; color: var(--primary); font-size:0.9rem;">Classe ${e.classe}</span>
                                <span style="font-weight: 700; font-size:0.88rem; color:var(--text-main);">📚 ${e.materia}</span>
                            </div>
                        `;
                    }
                });
            });
            if (!hasHours) dayHtml += `<div style="font-size: 0.82rem; color: var(--text-muted);">Nessuna lezione programmata.</div>`;
            dayHtml += `</div>`;
            container.innerHTML += dayHtml;
        });
    }

    renderFacultyChatList() {
        const container = document.getElementById('faculty-prof-list');
        if (!container) return;
        container.innerHTML = '';
        this.professorsList.filter(p => p.id !== this.teacherProfile.id).forEach(p => {
            const isActive = this.activeChatProfId === p.id;
            const div = document.createElement('div');
            div.style.cssText = `padding: 12px 14px; border-radius: 10px; cursor: pointer; background: ${isActive ? 'var(--primary-light)' : 'var(--bg-card)'}; border: 1px solid ${isActive ? 'var(--primary)' : 'var(--primary-border)'}; margin-bottom: 8px; font-size: 0.9rem; transition: all 0.2s ease;`;
            div.onclick = () => window.selectFacultyChat(p.id);
            div.innerHTML = `<div style="font-weight: 700; color: ${isActive ? 'var(--primary)' : 'var(--text-main)'};">${p.name}</div><div style="font-size: 0.78rem; color: var(--text-muted); margin-top:2px;">${p.subjects.join(', ')}</div>`;
            container.appendChild(div);
        });
    }

    renderPrivateChatMessages() {
        const chatBox = document.getElementById('chat-box');
        if (!chatBox) return;
        chatBox.innerHTML = '';
        const messages = this.chatMessages[this.activeChatProfId] || [];
        if (messages.length === 0) {
            chatBox.innerHTML = '<em style="color: var(--text-muted); font-size:0.85rem; display:block; text-align:center; margin-top:25px;">Nessun messaggio in questa conversazione.</em>';
            return;
        }
        messages.forEach(m => {
            const isMe = m.sender.includes('Tu');
            const div = document.createElement('div');
            div.style.cssText = `margin-bottom: 10px; padding: 10px 14px; border-radius: 10px; background: ${isMe ? 'var(--primary-light)' : 'var(--bg-card)'}; border: 1px solid ${isMe ? 'var(--primary-border)' : 'var(--primary-border)'}; max-width: 85%; font-size: 0.88rem; margin-left: ${isMe ? 'auto' : '0'}; box-shadow: var(--custom-shadow); color: var(--text-main);`;
            div.innerHTML = `<div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2px;">${m.sender} • ${m.time}</div><div style="line-height:1.4;">${m.text}</div>`;
            chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    populateNoteSelector() {
        const select = document.getElementById('note-student-select');
        if (!select || !this.classroom || !this.classroom.students) return;
        select.innerHTML = '';
        this.classroom.students.forEach(s => {
            select.innerHTML += `<option value="${s.id}">${s.displayName || s.name} ${s.surname}</option>`;
        });
    }

    renderNotesHistory() {
        const container = document.getElementById('note-history');
        if (!container) return;
        container.innerHTML = '';
        this.notes.forEach(n => {
            container.innerHTML += `<div style="padding: 12px; background: var(--bg-card); border-radius: 10px; margin-bottom: 8px; border-left: 4px solid var(--primary); font-size: 0.88rem; box-shadow: var(--custom-shadow); color:var(--text-main);"><strong>${n.studentName}</strong> • ${n.type.toUpperCase()}<br><span style="color:var(--text-muted); line-height:1.4; display:block; margin-top:2px;">${n.text}</span> <span style="font-size:0.72rem; color:var(--success); float:right; font-weight:700;">📱 Notificato</span></div>`;
        });
    }

    addNoteImplementation() {
        const studentId = document.getElementById('note-student-select').value;
        const type = document.getElementById('note-type').value;
        const text = document.getElementById('note-text').value;
        if(!text) return this.showToast("Inserisci la motivazione!", "warning");
        const student = this.classroom.students.find(s => s.id === studentId);
        const displayName = student ? (student.displayName || student.name) : studentId;
        this.notes.push({ studentName: `${displayName} ${student?.surname || ''}`, type, text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
        this.renderNotesHistory();
        document.getElementById('note-text').value = '';
        this.addXp(5);
        this.showToast("📝 Nota disciplinare registrata (+5 XP)!", "success");
    }

    openDailyReportModalImplementation() {
        const content = document.getElementById('daily-report-content');
        if (!content || !this.classroom) return;
        let presentCount = 0, absentCount = 0, lateCount = 0, justifiedCount = 0;
        this.classroom.students.forEach(s => {
            const st = this.studentStates.get(s.id);
            if (st === 'assente') { absentCount++; if(this.studentJustified.get(s.id)) justifiedCount++; }
            else if (st === 'ritardo') lateCount++;
            else if (st === 'presente') presentCount++;
        });
        content.innerHTML = `
            <div style="font-weight:800; font-size:1.05rem; margin-bottom:10px; color:var(--primary);">🏫 Storico Classe: ${this.classroom.name} (Oggi)</div>
            <div style="margin-bottom:8px; font-size:0.9rem; color:var(--text-main);">👥 <strong>Presenti:</strong> ${presentCount} | <strong>Assenti:</strong> ${absentCount} (giustificati: ${justifiedCount}) | <strong>Ritardi:</strong> ${lateCount}</div>
            <div style="margin-bottom:8px; font-size:0.9rem; color:var(--text-main);">⚠️ <strong>Note:</strong> ${this.notes.length} | 📄 <strong>Materiali:</strong> ${this.materials.length} | 🎙️ <strong>Promemoria Vocali:</strong> ${this.voiceMemos.length}</div>
        `;
        document.getElementById('daily-report-modal').style.display = 'flex';
    }

    openAddScheduleModalImplementation() {
        const profSelect = document.getElementById('sched-prof-select');
        if (profSelect) {
            profSelect.innerHTML = '';
            this.professorsList.forEach(p => { profSelect.innerHTML += `<option value="${p.name}">${p.name}</option>`; });
        }
        this.updateScheduleFormOptionsImplementation();
        document.getElementById('add-schedule-modal').style.display = 'flex';
    }

    saveScheduleEntryImplementation() {
        const day = document.getElementById('sched-day-select').value;
        const hourIdx = parseInt(document.getElementById('sched-hour-select').value);
        const className = document.getElementById('sched-class-select').value;
        const subject = document.getElementById('sched-subject-select').value;
        const profName = document.getElementById('sched-prof-select').value;

        if (!this.weeklySchedule[day]) this.weeklySchedule[day] = {};
        if (!this.weeklySchedule[day][hourIdx]) this.weeklySchedule[day][hourIdx] = [];
        this.weeklySchedule[day][hourIdx].push({ materia: subject, prof: profName, classe: className });
        document.getElementById('add-schedule-modal').style.display = 'none';
        this.renderInteractiveSchedule();
        this.renderPersonalDocentSchedule();
        this.updateScheduleStatusBadge();
        this.showToast("✅ Ora aggiunta con successo!", "success");
    }

    clearAllScheduleImplementation() {
        if(confirm("Svuotare interamente l'orario settimanale?")) {
            this.weeklySchedule = {};
            this.renderInteractiveSchedule();
            this.renderPersonalDocentSchedule();
            this.updateScheduleStatusBadge();
            this.showToast("Orario svuotato.", "info");
        }
    }

    updateScheduleFormOptionsImplementation() {
        const profSelect = document.getElementById('sched-prof-select');
        if (!profSelect) return;
        const profName = profSelect.value;
        const profObj = this.professorsList.find(p => p.name === profName);
        const classSelect = document.getElementById('sched-class-select');
        const subjSelect = document.getElementById('sched-subject-select');
        if (!classSelect || !subjSelect || !profObj) return;

        classSelect.innerHTML = '';
        subjSelect.innerHTML = '';
        profObj.classes.forEach(c => { classSelect.innerHTML += `<option value="${c}">${c}</option>`; });
        profObj.subjects.forEach(s => { subjSelect.innerHTML += `<option value="${s}">${s}</option>`; });
    }

    saveCurrentDayHistory() {
        const todayKey = new Date().toLocaleDateString();
        if (!this.weeklyHistory[todayKey]) this.weeklyHistory[todayKey] = {};
        const statesObj = {};
        this.studentStates.forEach((val, key) => { statesObj[key] = val; });
        this.weeklyHistory[todayKey][this.classroom.name] = { states: statesObj, notesCount: this.notes.length };
    }

    checkCurrentTeacherSchedule() {
        const now = new Date();
        const daysMap = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
        const currentDay = daysMap[now.getDay()] || "Martedì";
        const currentHour = now.getHours();

        let hourIndex = 0, hourLabel = "1ª Ora (15:30 - 16:00)";
        if (currentHour >= 15 && currentHour < 16) { hourIndex = 0; hourLabel = "1ª Ora"; }
        else if (currentHour >= 16 && currentHour < 16.5) { hourIndex = 1; hourLabel = "2ª Ora"; }
        else if (currentHour >= 16.5 && currentHour < 17) { hourIndex = 2; hourLabel = "3ª Ora"; }
        else if (currentHour >= 17 && currentHour < 17.16) { hourIndex = 3; hourLabel = "☕ Pausa Ricreazione"; }
        else if (currentHour >= 17.16 && currentHour < 17.66) { hourIndex = 4; hourLabel = "4ª Ora"; }
        else if (currentHour >= 17.66 && currentHour < 18.16) { hourIndex = 5; hourLabel = "5ª Ora"; }
        else if (currentHour >= 20 && currentHour < 20.5) { hourIndex = 6; hourLabel = "6ª Ora Sera"; }
        else if (currentHour >= 20.5 && currentHour < 21) { hourIndex = 7; hourLabel = "7ª Ora Sera"; }

        const daySchedule = this.weeklySchedule[currentDay]?.[hourIndex] || [];
        const myLesson = daySchedule.find(e => e.prof.toLowerCase().includes(this.teacherProfile.fullName.toLowerCase()));
        return { hasLesson: !!myLesson, lessonDetails: myLesson, day: currentDay, hourIndex, hourLabel };
    }

    updateScheduleStatusBadge() {
        const badge = document.getElementById('schedule-status-badge');
        if (!badge) return;
        const check = this.checkCurrentTeacherSchedule();
        if (check.hasLesson && check.lessonDetails) {
            badge.style.background = 'var(--primary-light)';
            badge.style.color = 'var(--primary)';
            badge.innerText = `🟢 Lezione: ${check.lessonDetails.classe} (${check.lessonDetails.materia})`;
        } else {
            badge.style.background = 'var(--bg-card)';
            badge.style.color = 'var(--text-muted)';
            badge.innerText = `☕ Libero (${check.hourLabel})`;
        }
    }

    populateAccountTab() {
        const nameField = document.getElementById('acc-name');
        if (nameField) nameField.value = this.teacherProfile.fullName;
        const emailField = document.getElementById('acc-email');
        if (emailField) emailField.value = this.teacherProfile.email;
        const subjField = document.getElementById('acc-subjects');
        if (subjField) subjField.value = this.teacherProfile.subjects.join(', ');
        const classField = document.getElementById('acc-classes');
        if (classField) classField.value = this.teacherProfile.classes.join(', ');
        const avField = document.getElementById('acc-availability');
        if (avField) avField.value = this.teacherProfile.availability || '';
        const themeSelect = document.getElementById('acc-theme-select');
        if (themeSelect) themeSelect.value = this.teacherProfile.theme || 'classic';
        this.renderProfileBadges();
        this.renderInteractiveBook();
    }

    renderPendingApprovals() {
        const container = document.getElementById('pending-approvals-list');
        const adminCard = document.getElementById('admin-pending-approval-card');
        if (!container || !adminCard) return;

        if (!this.teacherProfile.isAdmin || this.pendingProfileUpdates.length === 0) {
            adminCard.style.display = 'none';
            return;
        }
        adminCard.style.display = 'block';
        container.innerHTML = '';
        this.pendingProfileUpdates.forEach((req, idx) => {
            const div = document.createElement('div');
            div.style.cssText = 'background: var(--bg-card); border: 1px solid var(--primary-border); padding: 14px; border-radius: 10px; margin-bottom: 10px; font-size: 0.88rem; box-shadow: var(--custom-shadow); color:var(--text-main);';
            div.innerHTML = `
                <div style="font-weight: 800; color: var(--text-main); margin-bottom: 4px;">👨‍🏫 ${req.profName} (${req.timestamp})</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                    <strong>Materie:</strong> ${req.newData.subjects.join(', ')}<br><strong>Classi:</strong> ${req.newData.classes.join(', ')}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="padding: 6px 12px; font-size: 0.78rem; background: var(--success); color:#fff; border-radius: 6px; font-weight:700;" onclick="window.approveProfileUpdate(${idx})">✅ Approva</button>
                    <button class="btn" style="padding: 6px 12px; font-size: 0.78rem; background: var(--danger); color:#fff; border-radius: 6px; font-weight:700;" onclick="window.rejectProfileUpdate(${idx})">❌ Rifiuta</button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    updateTimeDisplay() {
        const display = document.getElementById('time-display');
        if(display) display.innerText = this.timeSystem.getCurrentTimeString();
    }

    updateHeaderTitle(tabId = 'registro') {
        const className = this.classroom ? this.classroom.name : '1ª A';
        const tabNames = {
            'registro': 'Registro & Lezione',
            'materiali': 'Materiale Didattico',
            'voti': 'Voti & Competenze',
            'verifiche': 'Test, Interrogazioni & Correzioni',
            'note': 'Note Disciplinari',
            'chat': 'Collegio Docenti',
            'orario': 'Orario (Pomeriggio & Sera)',
            'account': 'Il Mio Account'
        };
        const titleEl = document.getElementById('current-title');
        if (titleEl) titleEl.innerText = `${tabNames[tabId] || 'Registro'} (${className}) - Prof. ${this.teacherProfile.fullName}`;
    }
}