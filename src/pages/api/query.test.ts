// src/pages/api/query.test.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from './query';
import { createClickHouseClient } from '../../utils/clickhouse';

jest.mock('../../utils/clickhouse');
const mockedCreateClient = createClickHouseClient as jest.MockedFunction<typeof createClickHouseClient>;

describe('Query API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('handles SELECT queries', async () => {
        const mockResults = [{ id: 1, name: 'Test' }];
        const mockClient = {
            query: jest.fn().mockResolvedValueOnce({
                json: jest.fn().mockResolvedValueOnce(mockResults)
            })
        };
        mockedCreateClient.mockReturnValueOnce(mockClient as any);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: {
                operation: 'select',
                query: 'SELECT * FROM test'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({
            rows: mockResults
        });
    });

    it('handles query errors', async () => {
        const mockClient = {
            query: jest.fn().mockRejectedValueOnce(new Error('Query failed'))
        };
        mockedCreateClient.mockReturnValueOnce(mockClient as any);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: {
                operation: 'select',
                query: 'INVALID SQL'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(500);
        expect(JSON.parse(res._getData())).toEqual({
            error: 'Query failed'
        });
    });
});
