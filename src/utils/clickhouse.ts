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
    const clickhouseUrl = process.env.CLICKHOUSE_URL || 'http://localhost:8123';
    const username = process.env.CLICKHOUSE_USER || 'default';
    const password = process.env.CLICKHOUSE_PASSWORD || '';

    return createClient({
        host: clickhouseUrl,
        username,
        password,
        http_headers: headers
    });
};
