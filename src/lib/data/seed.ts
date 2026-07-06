import { UNITS } from '@/lib/units';
import { TODAY } from './constants';
import type {
    Customer,
    Order,
    OrderItem,
    Payment,
    Ticket,
    PaymentMethod,
    Gateway,
} from './schema';

function rng(seed: number) {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

const rand = rng(42);

function randInt(min: number, max: number) {
    return Math.floor(rand() * (max - min + 1)) + min;
}

function randItem<T>(arr: T[]): T {
    return arr[Math.floor(rand() * arr.length)];
}

function pad(n: number, len = 3) {
    return String(n).padStart(len, '0');
}

function daysAgo(days: number) {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
}

function formatDatetime(dateStr: string, hour: number, minute: number, second: number): string {
    const h = String(hour).padStart(2, '0');
    const m = String(minute).padStart(2, '0');
    const s = String(second).padStart(2, '0');
    return `${dateStr} ${h}:${m}:${s}`;
}

const firstNames = [
    'Budi',
    'Siti',
    'Ahmad',
    'Dewi',
    'Rudi',
    'Nina',
    'Hendra',
    'Maya',
    'Agus',
    'Rina',
    'Bayu',
    'Fitri',
    'Dimas',
    'Putri',
    'Adi',
    'Dian',
    'Eko',
    'Sri',
    'Fajar',
    'Wulan',
    'Gilang',
    'Ratna',
    'Irfan',
    'Yuni',
    'Joko',
    'Tari',
    'Krisna',
    'Laras',
    'Lutfi',
    'Mega',
    'Nanda',
    'Ocha',
    'Pram',
    'Qori',
    'Rizki',
    'Sari',
    'Taufik',
    'Umi',
    'Vino',
    'Winda',
    'Yoga',
    'Zahra',
    'Ardi',
    'Bella',
    'Cakra',
    'Dinda',
    'Edi',
    'Fani',
];

const lastNames = [
    'Santoso',
    'Rahmawati',
    'Hidayat',
    'Lestari',
    'Hartono',
    'Wijaya',
    'Gunawan',
    'Sari',
    'Prakoso',
    'Amalia',
    'Saputra',
    'Handayani',
    'Prayoga',
    'Ayu',
    'Susanto',
    'Kusuma',
    'Prasetyo',
    'Utami',
    'Nugroho',
    'Wati',
    'Setiawan',
    'Dewi',
    'Wibowo',
    'Anggraini',
];

const ticketTypes = [
    { name: 'Reguler', unitPrice: 150000 },
    { name: 'VIP', unitPrice: 300000 },
    { name: 'Annual Pass', unitPrice: 500000 },
    { name: 'Promo Weekend', unitPrice: 100000 },
];

export function seedData() {
    const customers: Customer[] = [];
    const orders: Order[] = [];
    const payments: Payment[] = [];
    const tickets: Ticket[] = [];

    // ── Customers ──
    for (let i = 1; i <= 50; i++) {
        const fn = randItem(firstNames);
        const ln = randItem(lastNames);
        const name = `${fn} ${ln}`;
        const days = randInt(0, 90);
        const createdAt = daysAgo(randInt(60, 365));
        customers.push({
            id: `CUST-${pad(i, 3)}`,
            name,
            phone: `08${String(randInt(100000000, 999999999))}`,
            email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
            loyaltyNo: `L-${pad(i, 4)}`,
            totalOrders: 0,
            lastVisit: daysAgo(days),
            createdAt,
        });
    }

    // ── Orders + Payments + Tickets ──
    const methods: PaymentMethod[] = ['PG', 'VA'];
    const statuses: ('PAID' | 'ISSUED' | 'FAILED' | 'PENDING')[] = [
        'PAID',
        'ISSUED',
        'FAILED',
        'PENDING',
    ];
    const statusWeights = [0.55, 0.2, 0.1, 0.15];

    function pickStatus(): 'PAID' | 'ISSUED' | 'FAILED' | 'PENDING' {
        const r = rand();
        let acc = 0;
        for (let i = 0; i < statuses.length; i++) {
            acc += statusWeights[i];
            if (r < acc) return statuses[i];
        }
        return 'PAID';
    }

    // Distribute 350 orders randomly across 91 days (Apr 6 - Jul 5)
    const allDates: string[] = [];
    const daysCount = 91;
    for (let i = 0; i < 350; i++) {
        const d = randInt(0, daysCount - 1);
        allDates.push(daysAgo(d));
    }
    // Fisher-Yates shuffle using rand()
    for (let i = allDates.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [allDates[i], allDates[j]] = [allDates[j], allDates[i]];
    }

    const mismatchCounts: Record<string, number> = {};
    let tixIdx = 1;
    for (let i = 1; i <= 350; i++) {
        const customer = randItem(customers);
        const itemCount = randInt(1, 3);
        const items: OrderItem[] = [];
        for (let j = 0; j < itemCount; j++) {
            const unit = randItem(UNITS);
            const ticket = randItem(ticketTypes);
            const qty = randInt(1, 5);
            items.push({
                unitId: unit.id,
                ticketType: ticket.name,
                qty,
                unitPrice: ticket.unitPrice,
            });
        }
        const amount = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
        const status = pickStatus();
        let orderDate = allDates[i - 1];
        if (orderDate === TODAY && (i % 24) >= 8) {
            const pastDay = randInt(1, daysCount - 1);
            orderDate = daysAgo(pastDay);
        }
        // consume RNG to avoid affecting downstream randomness
        randInt(0, 90);
        const visitDate = daysAgo(randInt(0, 30));

        const method = randItem(methods);
        const gateway: Gateway = method === 'PG' ? 'Midtrans' : 'Direct Bank';

        orders.push({
            id: `ORD-${pad(i, 3)}`,
            customerId: customer.id,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
            items,
            amount,
            status,
            paymentMethod: method,
            orderDate,
            visitDate,
        });

        // Payment
        const payStatus =
            status === 'PAID' || status === 'ISSUED'
                ? 'SUCCESS'
                : status === 'FAILED'
                  ? 'FAILED'
                  : 'PENDING';
        
        const paidHour = randInt(8, 21);
        const paidMinute = randInt(0, 59);
        const paidSecond = randInt(0, 59);
        const paidAt = payStatus === 'SUCCESS' ? formatDatetime(orderDate, paidHour, paidMinute, paidSecond) : '-';
        const settlement =
            payStatus === 'SUCCESS' ? daysAgo(randInt(0, 5)) : '-';
        const gatewayResponses: Record<string, string[]> = {
            SUCCESS: [
                'Approved (00) — Authorization successful',
                'Approved (00) — Transaction completed',
                'Approved (00) — Payment confirmed by issuer',
            ],
            FAILED: [
                'Declined (05) — Do not honor',
                'Declined (14) — Invalid card number',
                'Declined (51) — Insufficient funds',
                'Declined (54) — Expired card',
                'Declined (91) — Issuer unavailable',
            ],
            PENDING: [
                'Pending (00) — Awaiting issuer confirmation',
                'Pending (68) — Response received too late',
                'Pending (96) — System malfunction, retry pending',
            ],
        };
        const responseList = gatewayResponses[payStatus];
        const gatewayResponse = responseList[randInt(0, responseList.length - 1)];

        const callbackReceivedAt = payStatus === 'SUCCESS'
            ? formatDatetime(orderDate, paidHour, paidMinute + randInt(0, 2), paidSecond + randInt(5, 30))
            : '-';
        const callbackLog = payStatus === 'SUCCESS'
            ? `[${callbackReceivedAt}] POST /callback/payment — status=SUCCESS orderId=${`ORD-${pad(i, 3)}`} amount=${amount}`
            : payStatus === 'FAILED'
            ? `[${orderDate} --:--:--] No callback received — transaction declined`
            : `[${orderDate} --:--:--] No callback received — payment pending`;
        
        // Ensure no 0% match rate: only allow mismatch if there are at least 3 orders on this day,
        // and cap at 1 mismatch per day.
        const totalOnDay = allDates.filter(d => d === orderDate).length;
        const currentMismatches = mismatchCounts[orderDate] || 0;
        
        const roll = rand(); // consume RNG stream once for the mismatch roll
        const isMismatch = totalOnDay >= 3 && currentMismatches === 0 && roll < 0.18;
        if (isMismatch) {
            mismatchCounts[orderDate] = currentMismatches + 1;
        }

        const payAmount = isMismatch ? amount + randInt(10000, 100000) : amount;
        const orphanId = rand() < 0.015 ? 'ORD-999' : `ORD-${pad(i, 3)}`;
        const fee = Math.floor(payAmount * (rand() * 0.02 + 0.01));
        payments.push({
            id: `PAY-${pad(i, 3)}`,
            orderId: orphanId,
            customerId: customer.id,
            customerName: customer.name,
            amount: payAmount,
            fee,
            netAmount: payAmount - fee,
            method,
            gateway,
            status: payStatus,
            paidAt,
            settlement,
            gatewayResponse,
            callbackLog,
        });

        // Tickets per item
        for (const item of items) {
            const ticketStatus: 'ACTIVE' | 'USED' | 'EXPIRED' | 'REFUND' =
                status === 'PAID'
                    ? rand() < 0.6
                        ? 'USED'
                        : 'ACTIVE'
                    : status === 'ISSUED'
                      ? 'ACTIVE'
                      : rand() < 0.3
                        ? 'REFUND'
                        : 'EXPIRED';
            for (let q = 0; q < item.qty; q++) {
                tickets.push({
                    id: `TCK-${pad(tixIdx++, 3)}`,
                    orderId: `ORD-${pad(i, 3)}`,
                    unitId: item.unitId,
                    customerId: customer.id,
                    customerName: customer.name,
                    customerPhone: customer.phone,
                    customerEmail: customer.email,
                    ticketType: item.ticketType,
                    status: ticketStatus,
                    issuedAt: orderDate,
                    usedAt: ticketStatus === 'USED' ? visitDate : undefined,
                    validUntil: daysAgo(randInt(-30, 90)),
                });
            }
        }
    }

    // Update customer totalOrders and lastVisit
    const orderCounts: Record<string, number> = {};
    const lastVisits: Record<string, string> = {};
    for (const o of orders) {
        orderCounts[o.customerId] = (orderCounts[o.customerId] || 0) + 1;
        if (
            !lastVisits[o.customerId] ||
            o.orderDate > lastVisits[o.customerId]
        ) {
            lastVisits[o.customerId] = o.orderDate;
        }
    }
    for (const c of customers) {
        c.totalOrders = orderCounts[c.id] || 0;
        c.lastVisit = lastVisits[c.id] || c.lastVisit;
    }

    return { customers, orders, payments, tickets };
}

export type SeedData = ReturnType<typeof seedData>;
