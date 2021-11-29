export type ScrapedSection = [string, string, string, number[], string, number];

export type SectionData = [string, ...[number, number][]];

export interface ClassData {
    name: string,
    credits: number,
    label: string,
    lectures: SectionData[],
    extras: SectionData[],
    lastCached: Date
}

export interface SelectionRestriction {
    minCredit: number,
    maxCredit: number,
    minCourses: number,
    maxCourses: number
}

export interface ClassSelection {
    classList: [string, string][],
    locked: string[],
    restrictions: SelectionRestriction
}
