// src/utils/clickhouse.test.ts
import { getClickHouseHeaders, createClickHouseClient } from './clickhouse';
import { NextApiRequest } from 'next';
import { createMocks } from 'node-mocks-http';

jest.mock('@clickhouse/client', () => ({
    createClient: jest.fn().mockReturnValue({ test: 'client' })
}));

describe('ClickHouse Utils', () => {
    describe('getClickHouseHeaders', () => {
        it('extracts ClickHouse headers from request', () => {
            const { req } = createMocks<NextApiRequest>({
                headers: {
                    'x-clickhouse-user': 'default',
                    'x-clickhouse-password': 'password',
                    'content-type': 'application/json',
                    'x-other-header': 'value'
                }
            });

            const headers = getClickHouseHeaders(req);

            expect(headers).toEqual({
                'x-clickhouse-user': 'default',
                'x-clickhouse-password': 'password'
            });
            expect(headers['content-type']).toBeUndefined();
            expect(headers['x-other-header']).toBeUndefined();
        });

        it('handles array header values', () => {
            const { req } = createMocks<NextApiRequest>({
                headers: {
                    'x-clickhouse-format': ['JSONEachRow', 'Pretty']
                }
            });

            const headers = getClickHouseHeaders(req);

            expect(headers).toEqual({
                'x-clickhouse-format': 'JSONEachRow, Pretty'
            });
        });

        it('returns empty object when no ClickHouse headers present', () => {
            const { req } = createMocks<NextApiRequest>({
                headers: {
                    'content-type': 'application/json'
                }
            });

            const headers = getClickHouseHeaders(req);

            expect(headers).toEqual({});
        });
    });

    describe('createClickHouseClient', () => {
        it('creates client with default config when no headers provided', () => {
            const client = createClickHouseClient();

            expect(client).toEqual({ test: 'client' });
            expect(require('@clickhouse/client').createClient).toHaveBeenCalledWith({
                url: 'http://localhost:8123',
                http_headers: undefined
            });
        });

        it('creates client with custom headers', () => {
            const headers = {
                'x-clickhouse-user': 'default',
                'x-clickhouse-password': 'password'
            };

            const client = createClickHouseClient(headers);

            expect(client).toEqual({ test: 'client' });
            expect(require('@clickhouse/client').createClient).toHaveBeenCalledWith({
                url: 'http://localhost:8123',
                http_headers: headers
            });
        });
    });
});
