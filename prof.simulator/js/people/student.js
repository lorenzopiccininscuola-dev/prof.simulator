export class Student {
    constructor(name, surname, number) {
        this.name = name;
        this.surname = surname;
        this.number = number;
        this.displayName = name;
        this.knowledge = new Map();
        this.state = {
            energy: 1.0,
            attention: 0.8,
            stress: 0.1,
            confidence: 0.5
        };
        this.personality = {};
    }

    setKnowledge(subject, level) {
        this.knowledge.set(subject, level);
    }

    updateState(prop, amount) {
        if (this.state[prop] !== undefined) {
            this.state[prop] = Math.max(0, Math.min(1, this.state[prop] + amount));
        }
    }
}