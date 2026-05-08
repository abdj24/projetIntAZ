//Classe générée par IA

export function formaterDate(date: string): string {
    const [annee, mois, jour] = date.split("-");
    return `${jour}/${mois}/${annee}`;
}

export function getMonthName(date: Date): string {
    return date.toLocaleDateString("fr-CA", {
        month: "long",
        year: "numeric",
    });
}

export function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
    return new Date(year, monthIndex + 1, 0).getDate();
}