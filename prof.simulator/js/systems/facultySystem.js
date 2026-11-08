export class FacultySystem {
    constructor() {
        this.professors = [
            { id: 'lorenzo', name: 'Lorenzo Piccinin', role: 'Referente Didattico & Docente', subjects: ['Psicologia', 'Scienze', 'Sostegno'], isUser: true },
            { id: 'rossi', name: 'Prof. Mario Rossi', role: 'Docente', subjects: ['Matematica e Fisica'], isUser: false },
            { id: 'bianchi', name: 'Prof.ssa Anna Bianchi', role: 'Docente', subjects: ['Lettere e Italiano'], isUser: false },
            { id: 'verdi', name: 'Prof. Giovanni Verdi', role: 'Docente', subjects: ['Storia e Filosofia'], isUser: false }
        ];
        
        this.privateChats = new Map();
        this.professors.forEach(p => {
            if (!p.isUser) {
                this.privateChats.set(p.id, [
                    { sender: p.name, text: `Buongiorno Lorenzo, ti scrivo per coordinarci sugli studenti.`, time: '08:30' }
                ]);
            }
        });
    }

    getProfessor(id) {
        return this.professors.find(p => p.id === id);
    }

    getPrivateMessages(profId) {
        return this.privateChats.get(profId) || [];
    }

    sendPrivateMessage(profId, text) {
        if (!this.privateChats.has(profId)) {
            this.privateChats.set(profId, []);
        }
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.privateChats.get(profId).push({ sender: 'Tu (Lorenzo Piccinin)', text, time: timeNow });
        
        setTimeout(() => {
            const prof = this.getProfessor(profId);
            const responses = [
                "Ho capito perfettamente, procedo subito.",
                "Ricevuto! Ne parliamo al prossimo consiglio.",
                "Grazie per la segnalazione, come Referente hai ragione.",
                "Va bene Lorenzo, aggiorno subito il registro."
            ];
            const randomReply = responses[Math.floor(Math.random() * responses.length)];
            this.privateChats.get(profId).push({ sender: prof.name, text: randomReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        }, 1000);
    }
}