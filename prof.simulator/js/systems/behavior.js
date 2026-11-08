export class BehaviorSystem {
    constructor() {
        this.possibleReactions = [
            'participa',
            'esita',
            'chiede_aiuto',
            'rimane_in_silenzio',
            'sbaglia_risposta',
            'risponde_parzialmente',
            'osserva_altri'
        ];
    }

    evaluateBehavior(student, context) {
        const difficulty = context.difficulty ?? 0.5;
        const studentKnowledge = student.getKnowledge(context.topic || 'generale');

        let weights = {
            participa: 0,
            esita: 0,
            chiede_aiuto: 0,
            rimane_in_silenzio: 0,
            sbaglia_risposta: 0,
            risponde_parzialmente: 0,
            osserva_altri: 0
        };

        const competenceGap = studentKnowledge - difficulty;
        const { confidence, energy, attention, stress } = student.state;
        const { participation, independence, sensitivity } = student.personality;

        if (competenceGap >= 0.2) {
            weights.participa += (0.6 * participation) + (0.4 * confidence * energy);
            weights.risponde_parzialmente += 0.2;
            weights.rimane_in_silenzio += (0.4 * (1 - participation));
        } else if (competenceGap >= -0.2) {
            weights.esita += 0.4 * (1 - confidence);
            weights.risponde_parzialmente += 0.4;
            weights.participa += 0.3 * confidence * participation;
            weights.rimane_in_silenzio += 0.3;
        } else {
            weights.sbaglia_risposta += 0.3 * (1 - independence);
            weights.chiede_aiuto += 0.4 * (1 - independence) + (0.3 * sensitivity * stress);
            weights.rimane_in_silenzio += 0.4 * independence + (0.3 * (1 - attention));
            weights.osserva_altri += 0.3 * student.personality.sociality;
        }

        if (stress > 0.7) {
            weights.chiede_aiuto += 0.2;
            weights.rimane_in_silenzio += 0.2;
        }
        if (energy < 0.3) {
            weights.rimane_in_silenzio += 0.4;
            weights.participa -= 0.3;
        }

        Object.keys(weights).forEach(key => {
            if (weights[key] < 0) weights[key] = 0.01;
        });

        const chosenReaction = this._weightedRandomSelect(weights);

        return {
            reaction: chosenReaction,
            weightsDebug: weights,
            metrics: { competenceGap, confidence, stress }
        };
    }

    _weightedRandomSelect(weights) {
        const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
        let randomVal = Math.random() * totalWeight;

        for (const [reaction, weight] of Object.entries(weights)) {
            if (randomVal < weight) {
                return reaction;
            }
            randomVal -= weight;
        }
        return 'rimane_in_silenzio';
    }
}