import { createClient, ClickHouseClient } from '@clickhouse/client';
import { NextApiRequest } from 'next';

export const getClickHouseHeaders = (req: NextApiRequest): Record<string, string> => {
    return Object.keys(req.headers).reduce(
        (acc, key) => {
            if (key.startsWith('x-clickhouse-')) {
                const value = req.headers[key];
                acc[key] = Array.isArray(value) ? value.join(', ') : value || '';
            }
            return acc;
        },
        {} as Record<string, string>
    );
};

export const createClickHouseClient = (headers?: Record<string, string>): ClickHouseClient => {
    if (!process.env.NEXT_PUBLIC_CLICKHOUSE_HOST) {
        throw new Error('ClickHouse configuration missing');
    }

    return createClient({
        host: process.env.NEXT_PUBLIC_CLICKHOUSE_HOST,
        username: process.env.NEXT_PUBLIC_CLICKHOUSE_USERNAME || 'default',
        password: process.env.NEXT_PUBLIC_CLICKHOUSE_PASSWORD,
        database: process.env.NEXT_PUBLIC_CLICKHOUSE_DATABASE,
        http_headers: headers
    });
};
