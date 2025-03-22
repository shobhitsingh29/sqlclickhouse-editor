import { NextApiRequest, NextApiResponse } from 'next';
import { createClickHouseClient } from '../../utils/clickhouse';

interface UploadResponse {
    success?: boolean;
    error?: string;
    message?: string;
    results?: Record<string, unknown>[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<UploadResponse>) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { fileContent } = req.body;

    if (!fileContent) {
        res.status(400).json({ error: 'File content is required' });
        return;
    }

    try {
        const client = createClickHouseClient();
        const results: Record<string, unknown>[] = [];

        // Split content into individual queries
        const queries = fileContent
            .split(';')
            .map(q => q.trim())
            .filter(Boolean);

        // Execute each query sequentially
        for (const query of queries) {
            const queryLower = query.toLowerCase().trim();

            // Handle different types of queries
            if (queryLower.startsWith('select')) {
                const resultSet = await client.query({
                    query,
                    format: 'JSONEachRow'
                });
                const rows = await resultSet.json();
                results.push(...rows);
            } else if (
                queryLower.startsWith('insert') ||
                queryLower.startsWith('create') ||
                queryLower.startsWith('alter') ||
                queryLower.startsWith('drop') ||
                queryLower.startsWith('truncate')
            ) {
                // DDL and DML operations
                await client.exec({ query });
            } else if (queryLower.startsWith('delete')) {
                // ClickHouse doesn't support DELETE directly
                throw new Error('DELETE operations must use ALTER TABLE ... DELETE instead');
            } else if (queryLower.startsWith('update')) {
                // ClickHouse doesn't support UPDATE directly
                throw new Error('UPDATE operations must use ALTER TABLE ... UPDATE instead');
            } else {
                // Handle other valid ClickHouse operations
                await client.exec({ query });
            }
        }

        res.status(200).json({
            success: true,
            message: queries.length > 1
                ? `${queries.length} queries executed successfully`
                : 'Query executed successfully',
            results: results.length > 0 ? results : undefined
        });
    } catch (error) {
        console.error('Upload error:', error);
        const message = error instanceof Error
            ? error.message
            : 'Query execution failed';
        res.status(500).json({ error: message });
    }
}
