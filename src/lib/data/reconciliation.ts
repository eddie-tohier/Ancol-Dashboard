import { db } from './db';
import { TODAY } from './constants';

export interface ReconciliationSession {
    id: string;
    date: string;
    time: string;
    duration: string;
    totalOrders: number;
    matchRate: number;
    status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'NO_ORDERS';
    unitId: string;
}

export interface LogEntry {
    sessionId: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    step: string;
    message: string;
    createdAt: string;
}

const logStore: LogEntry[] = [];

function pad(n: number) {
    return String(n).padStart(2, '0');
}

// Simulasi logging untuk reconciliation_logs
function logToReconLogs(sessionId: string, level: 'INFO' | 'WARN' | 'ERROR', step: string, message: string) {
    logStore.push({
        sessionId,
        level,
        step,
        message,
        createdAt: new Date().toISOString()
    });
    console.log(`[LOG][${level}][Session: ${sessionId}][Step: ${step}] ${message}`);
}

export function getLogs(sessionId: string): LogEntry[] {
    return logStore.filter(log => log.sessionId === sessionId);
}

export function getSessions(): ReconciliationSession[] {
    // Bersihkan log lama setiap kali sesi dihitung ulang
    logStore.length = 0;
    
    const sessions: ReconciliationSession[] = [];
    const today = TODAY;

    // Ambil daftar tanggal unik dari semua pesanan dan urutkan
    const dates = Array.from(new Set(db.orders.map((o) => o.orderDate))).sort();
    const unitIds = ['dfn', 'swa', 'ods', 'awa', 'pgu', 'jbl'];

    let idx = 1;
    for (const date of dates) {
        const isToday = date === today;
        const dayOrders = db.orders.filter((o) => o.orderDate === date);

        for (let h = 0; h < 24; h++) {
            const hour = pad(h);

            // Stop generating sessions for TODAY after 08:00 — recon service halted at 8am
            if (isToday && h >= 8) continue;
            
            // Assign orders to this hour slot pseudo-randomly based on order ID hash
            const hourOrders = dayOrders.filter((o) => {
                const num = parseInt(o.id.replace('ORD-', ''), 10);
                return num % 24 === h;
            });

            // Find all unique units in hourOrders
            const unitsInHour = Array.from(new Set(
                hourOrders.flatMap(o => o.items.map(it => it.unitId))
            ));

            // If no orders, generate one placeholder session to keep the timeline consistent
            const activeUnits = unitsInHour.length > 0 ? unitsInHour : [unitIds[h % unitIds.length]];

            for (const unitId of activeUnits) {
                const sessionId = `SES-${pad(idx)}`;
                const time = `${hour}:${h % 2 === 0 ? '00' : '30'}:00`;
                
                try {
                    // Simulasikan error teknis acak untuk testing (0.1% chance)
                    if (Math.random() < 0.001) {
                         throw new Error("Simulated Database Connection Failure");
                    }

                    const unitOrders = hourOrders.filter((o) =>
                        o.items.some((it) => it.unitId === unitId),
                    );
                    const totalOrders = unitOrders.length;

                    const durationSec = 300 + Math.floor(totalOrders * 12);
                    const min = Math.floor(durationSec / 60);
                    const sec = durationSec % 60;
                    const duration = `${min}m ${pad(sec)}s`;

                    let matchRate = 0;
                    let status: 'COMPLETED' | 'RUNNING' | 'FAILED' | 'NO_ORDERS';

                    if (totalOrders === 0) {
                        status = 'NO_ORDERS';
                    } else {
                        status = 'COMPLETED';
                        const matched = unitOrders.filter(
                            (o) => o.status === 'PAID' || o.status === 'ISSUED',
                        ).length;
                        matchRate = Number(
                            ((matched / totalOrders) * 100).toFixed(1),
                        );
                        logToReconLogs(sessionId, 'INFO', 'match', `Processed ${totalOrders} orders, match rate: ${matchRate}%`);
                    }

                    sessions.push({
                        id: sessionId,
                        date,
                        time,
                        duration: status !== 'COMPLETED' ? '--' : duration,
                        totalOrders: status !== 'COMPLETED' ? 0 : totalOrders,
                        matchRate: status !== 'COMPLETED' ? 0 : matchRate,
                        status,
                        unitId,
                    });
                } catch (error) {
                    logToReconLogs(sessionId, 'ERROR', 'technical', (error as Error).message);
                    sessions.push({
                        id: sessionId,
                        date,
                        time,
                        duration: '--',
                        totalOrders: 0,
                        matchRate: 0,
                        status: 'FAILED',
                        unitId,
                    });
                }
                idx++;
            }
        }
    }

    return sessions;
}
