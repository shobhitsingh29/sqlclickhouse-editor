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
    return createClient({
        url: 'http://localhost:8123',
        http_headers: headers
    });
};
