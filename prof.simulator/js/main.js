import { createSchoolData } from './data/schoolData.js';
import { UserInterface } from './ui.js';
import { BehaviorSystem } from './systems/behavior.js';

document.addEventListener('DOMContentLoaded', () => {
    const schoolClasses = createSchoolData();
    const initialClassroom = schoolClasses.get("1ª A");
    const behaviorSystem = new BehaviorSystem();

    const ui = new UserInterface(initialClassroom, behaviorSystem, schoolClasses);
    ui.init();
});