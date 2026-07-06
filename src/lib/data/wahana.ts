import { db } from './db';
import { TODAY } from './constants';

export interface UnitStatus {
    id: string;
    name: string;
    lastSync: string;
    syncStatus: 'synced' | 'syncing' | 'error';
    activeProducts: number;
    ticketsIssued: number;
}

export function getUnitStatuses(): UnitStatus[] {
    const unitIds = ['dfn', 'swa', 'ods', 'awa', 'pgu', 'jbl'];
    const unitNames: Record<string, string> = {
        dfn: 'Dufan Ancol',
        swa: 'Sea World Ancol',
        ods: 'Samudra Ancol',
        awa: 'Atlantis Ancol',
        pgu: 'Ancol Taman Impian',
        jbl: 'Jakarta Bird Land Ancol',
    };

    return unitIds.map((id, i) => {
        const unitTickets = db.tickets.filter((t) => t.unitId === id);
        const ticketTypes = [...new Set(unitTickets.map((t) => t.ticketType))];
        const ticketsIssued = unitTickets.length;

        const syncStatus: 'synced' | 'syncing' | 'error' =
            i === 1 ? 'syncing' : i === 5 ? 'error' : 'synced';

        const lastSyncDate = new Date(TODAY);
        lastSyncDate.setMinutes(
            lastSyncDate.getMinutes() - i * 5 - Math.floor(Math.random() * 5),
        );
        const lastSync = `${lastSyncDate.toISOString().slice(0, 10)} ${String(lastSyncDate.getHours()).padStart(2, '0')}:${String(lastSyncDate.getMinutes()).padStart(2, '0')}`;

        return {
            id,
            name: unitNames[id],
            lastSync,
            syncStatus,
            activeProducts: ticketTypes.length || 1,
            ticketsIssued,
        };
    });
}
