import { Student } from '../people/student.js';
import { Classroom } from '../systems/classroom.js';

export function createSchoolData() {
    const classes = new Map();
    const classNames = ["1ª A", "1ª B", "2ª A", "2ª B", "3ª A", "3ª B", "4ª A", "4ª B", "5ª A", "5ª B"];
    
    const firstNames = ["Marco", "Sofia", "Luca", "Giulia", "Alessandro", "Francesca", "Matteo", "Alice", "Lorenzo", "Chiara", "Gabriele", "Emma", "Tommaso", "Giorgia", "Riccardo", "Martina", "Davide", "Elena", "Federico", "Sara"];
    const lastNames = ["Rossi", "Ferrari", "Russo", "Bianchi", "Esposito", "Colombo", "Romano", "Ricci", "Marini", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti"];

    const archetypes = [
        { trait: "Ansioso Perfezionista", desc: "Tende ad andare in crisi se non capisce subito, ma consegna elaborati impeccabili." },
        { trait: "Creativo Distratto", desc: "Mente vivace e piena di idee, ma perde facilmente la concentrazione durante le spiegazioni teoriche." },
        { trait: "Chiacchierone Sociabile", desc: "Trascina la classe nelle discussioni; ottimo nelle prove orali, ma tende a disturbare i vicini." },
        { trait: "Silenzioso e Metodico", desc: "Parla raramente, osserva molto ed elabora i concetti con calma e precisione." },
        { trait: "Ribelle Intelligente", desc: "Mette spesso in discussione le regole, ma ha un intuito logico notevole." },
        { trait: "Atleta Stanco", desc: "Sempre impegnato negli allenamenti pomeridiani; ha picchi di stanchezza nelle prime ore." },
        { trait: "Logico Razionale", desc: "Ama la precisione dei numeri e le formule, ma fatica nelle valutazioni intuitive." }
    ];

    const learningStyles = ["Visivo (schemi e mappe)", "Auditivo (ascolto attivo)", "Cinestetico (pratica e collegamenti)", "Logico-Duttile"];
    const hobbies = ["Pallavolo", "Programmazione / Roblox", "Pasticceria e Cucina", "Musica e Chitarra", "Disegno / Gaming", "Scienze & Natura", "Scrittura"];

    classNames.forEach(className => {
        const students = [];
        for (let i = 0; i < 20; i++) {
            const firstName = firstNames[(i + Math.floor(Math.random() * 20)) % firstNames.length];
            const lastName = lastNames[(i + Math.floor(Math.random() * 20)) % lastNames.length];
            
            const student = new Student(firstName, lastName, i + 1);
            const chosenArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
            
            student.personality = {
                primaryTrait: chosenArchetype.trait,
                traitDescription: chosenArchetype.desc,
                learningStyle: learningStyles[Math.floor(Math.random() * learningStyles.length)],
                hobby: hobbies[Math.floor(Math.random() * hobbies.length)],
                participation: parseFloat((Math.random() * 0.7 + 0.25).toFixed(2)),
                anxietyLevel: parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)),
                workSpeed: parseFloat((Math.random() * 0.6 + 0.7).toFixed(2))
            };

            const mathLevel = parseFloat((Math.random() * 0.6 + 0.25).toFixed(2));
            student.setKnowledge('Matematica', mathLevel);

            students.push(student);
        }
        
        classes.set(className, new Classroom(className, students));
    });

    return classes;
}