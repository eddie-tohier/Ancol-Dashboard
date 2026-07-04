export interface Unit {
  id: string
  name: string
}

export const UNITS: Unit[] = [
  { id: "dfn", name: "Dufan Ancol" },
  { id: "swa", name: "Sea World Ancol" },
  { id: "ods", name: "Samudra Ancol" },
  { id: "awa", name: "Atlantis Ancol" },
  { id: "pgu", name: "Ancol Taman Impian" },
  { id: "jbl", name: "Jakarta Bird Land Ancol" },
]

export const UNIT_BY_ID: Record<string, Unit> = UNITS.reduce(
  (acc, u) => {
    acc[u.id] = u
    return acc
  },
  {} as Record<string, Unit>,
)

export function getUnitName(id: string): string {
  return UNIT_BY_ID[id]?.name ?? id
}