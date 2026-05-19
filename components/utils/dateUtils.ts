//Généré par IA

// Formatage d'une date YYYY-MM-DD en DD/MM/YYYY.
export function formaterDate(date: string): string {
    const [annee, mois, jour] = date.split("-");
    return `${jour}/${mois}/${annee}`;
}

// Nom du mois affiche dans les graphiques.
export function getMonthName(date: Date): string {
    return date.toLocaleDateString("fr-CA", {
        month: "long",
        year: "numeric",
    });
}

// Conversion d'une Date en format local YYYY-MM-DD.
export function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Nombre de jours dans un mois donne.
export function getDaysInMonth(year: number, monthIndex: number): number {
    return new Date(year, monthIndex + 1, 0).getDate();
}
