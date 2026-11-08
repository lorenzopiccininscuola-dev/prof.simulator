export class EventSystem {
    constructor() {
        this.possibleEvents = [
            {
                id: 'talking',
                title: 'Disturbo in Classe',
                getDescription: (student) => `${student.name} sta parlando sottovoce con il compagno di banco, distraendo la fila.`,
                impact: { attention: -0.1, stress: 0.05 },
                options: [
                    { label: 'Ignora', action: 'ignore' },
                    { label: 'Richiamo verbale', action: 'warn' },
                    { label: 'Nota disciplinare', action: 'note' }
                ]
            },
            {
                id: 'enthusiast',
                title: 'Partecipazione Attiva',
                getDescription: (student) => `${student.name} ha alzato la mano con insistenza, desideroso di intervenire sulla lezione.`,
                impact: { confidence: 0.1 },
                options: [
                    { label: 'Interroga subito', action: 'question' },
                    { label: 'Fai completare il ragionamento', action: 'encourage' },
                    { label: 'Rimanda a dopo', action: 'defer' }
                ]
            },
            {
                id: 'tired',
                title: 'Calo di Attenzione',
                getDescription: (student) => `${student.name} sembra esausto e sta lottando per non addormentarsi sul banco.`,
                impact: { energy: -0.15, attention: -0.2 },
                options: [
                    { label: 'Fai una domanda per svegliarlo', action: 'wake_up' },
                    { label: 'Concedi due minuti di pausa', action: 'break' }
                ]
            }
        ];
    }

    generateEvent(classroom) {
        const randomStudent = classroom.students[Math.floor(Math.random() * classroom.students.length)];
        const template = this.possibleEvents[Math.floor(Math.random() * this.possibleEvents.length)];

        return {
            student: randomStudent,
            title: template.title,
            description: template.getDescription(randomStudent),
            options: template.options,
            templateId: template.id
        };
    }
}