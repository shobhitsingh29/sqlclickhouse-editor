// pages/api/query.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClickHouseClient, getClickHouseHeaders } from '../../utils/clickhouse';

interface QueryResult {
    rows: Record<string, unknown>[]
}

type Operation = 'insert' | 'select' | 'delete' | 'update' | 'show';

interface QueryResponse {
    rows?: Record<string, unknown>[];
    success?: boolean;
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<QueryResponse>) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { operation, query } = req.body;

    if (!query || typeof query !== 'string') {
        res.status(400).json({ error: "'query' is required and must be a string" });
        return;
    }

    try {
        const headers = getClickHouseHeaders(req);
        const client = createClickHouseClient(headers);

        switch (operation as Operation) {
            case 'insert':
                await client.exec({ query });
                return res.status(200).json({ success: true });

            case 'select':
            case 'show':
                const resultSet = await client.query({
                    query,
                    format: 'JSONEachRow'
                });
                const rows = await resultSet.json() as Record<string, unknown>[];
                return res.status(200).json({ rows } as QueryResult);

            case 'delete':
            case 'update':
                await client.exec({ query });
                return res.status(200).json({ success: true });

            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    } catch (error) {
        console.error('Query error:', error);
        const message = error instanceof Error ? error.message : 'Database error';
        res.status(500).json({ error: message });
    }
}
