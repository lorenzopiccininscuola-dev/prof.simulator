export class TimeSystem {
    constructor() {
        this.currentDayIndex = 0; // 0 = Lunedì, 1 = Martedì, ecc.
        this.daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];
        this.currentHour = 1; // 1ª ora, 2ª ora...
        this.schoolWeek = 1;  // Settimana corrente
    }

    advanceHour(classroom) {
        this.currentHour++;
        if (this.currentHour > 5) { // Supponiamo 5 ore di lezione al giorno
            this.currentHour = 1;
            this.advanceDay(classroom);
        }
        return { day: this.daysOfWeek[this.currentDayIndex], hour: this.currentHour, week: this.schoolWeek };
    }

    advanceDay(classroom) {
        this.currentDayIndex++;
        if (this.currentDayIndex >= this.daysOfWeek.length) {
            this.currentDayIndex = 0;
            this.schoolWeek++;
            this.triggerWeekendReset(classroom);
        }
    }

    // Durante il weekend gli studenti riposano, recuperano energia ma perdono un minimo di attenzione
    triggerWeekendReset(classroom) {
        classroom.students.forEach(student => {
            student.updateState('energy', 0.4);   // Recuperano energia
            student.updateState('stress', -0.3);  // Si rilassano
        });
        console.log("Fine settimana: gli studenti hanno riposato.");
    }

    getCurrentTimeString() {
        return `${this.daysOfWeek[this.currentDayIndex]} - ${this.currentHour}ª Ora (Settimana ${this.schoolWeek})`;
    }
}