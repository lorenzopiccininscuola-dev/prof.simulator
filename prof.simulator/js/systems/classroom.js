export class Classroom {
    constructor(name, students) {
        this.name = name;
        this.students = students || [];
        this.gradeBook = new Map();
    }

    assignGrade(studentName, subject, grade, type, note = "") {
        if (!this.gradeBook.has(studentName)) {
            this.gradeBook.set(studentName, []);
        }
        this.gradeBook.get(studentName).push({
            subject,
            grade,
            type,
            note,
            date: new Date().toLocaleDateString()
        });
    }
}