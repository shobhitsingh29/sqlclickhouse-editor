// src/pages/api/upload.test.ts
import {NextApiRequest, NextApiResponse} from 'next';
import {createMocks} from 'node-mocks-http';
import handler from './upload';
import {createClickHouseClient} from '../../utils/clickhouse';

jest.mock('../../utils/clickhouse');
const mockedCreateClient = createClickHouseClient as jest.MockedFunction<typeof createClickHouseClient>;

describe('Upload API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('handles missing file error', async () => {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: {}
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({
            error: 'File content is required'
        });
    });

    it('handles invalid SQL query', async () => {
        const mockClient = {
            query: jest.fn().mockRejectedValueOnce(new Error('Invalid query'))
        };
        mockedCreateClient.mockReturnValueOnce(mockClient as any);

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
            method: 'POST',
            body: {
                query: 'INVALID SQL'
            },
            headers: {
                'content-type': 'multipart/form-data'
            }
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toEqual({
            error: 'File content is required'
        });
    });
});
