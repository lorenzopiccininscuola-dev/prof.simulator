export class LessonSystem {
    constructor() {
        this.timerInterval = null;
        this.timeLeft = 1800; // 30 minuti in secondi
        this.totalDuration = 1800;
        this.isRunning = false;
        this.currentTopic = "";
    }

    startHour(topic, onTimeOut, onTick, onSpontaneousEvent) {
        this.currentTopic = topic;
        this.isRunning = true;
        
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                const minutes = Math.floor(this.timeLeft / 60);
                const seconds = this.timeLeft % 60;
                const formatted = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
                
                if (onTick) onTick(this.timeLeft, formatted);

                if (Math.random() < 0.03 && onSpontaneousEvent) {
                    onSpontaneousEvent();
                }
            } else {
                this.stopTimer();
                if (onTimeOut) onTimeOut();
            }
        }, 1000);
    }

    stopTimer() {
        this.isRunning = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.timeLeft = this.totalDuration;
    }

    applyLearning(classroom) {
        if (!classroom || !classroom.students) return;

        classroom.students.forEach(student => {
            const trait = student.personality?.primaryTrait || 'Studente';
            let attentionModifier = 1.0;

            if (trait.includes('Distratto')) attentionModifier = 0.7;
            if (trait.includes('Perfezionista')) attentionModifier = 1.2;
            if (trait.includes('Metodico')) attentionModifier = 1.1;

            const currentKnowledge = student.knowledge.get('Matematica') || 0.3;
            const growth = 0.005 * attentionModifier;
            student.setKnowledge('Matematica', Math.min(1.0, currentKnowledge + growth));
        });
    }
}