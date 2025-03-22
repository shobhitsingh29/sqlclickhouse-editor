// components/SqlEditor.tsx
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { TextField, Button, Container, Typography } from '@mui/material';
import ResultsTable from './ResultsTable';
import FileUploader from './FileUploader';

interface QueryResponse {
    success: boolean;
    rows?: Record<string, unknown>[];
    error?: string;
}

type SqlOperation = 'select' | 'insert' | 'delete' | 'update';

interface QueryResult {
    message?: string;
    [key: string]: unknown;
}

const SqlEditor: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<QueryResult[]>([]);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const detectOperation = (sql: string): SqlOperation => {
        const normalizedSql = sql.trim().toLowerCase();
        if (!normalizedSql) {
            throw new Error('Query cannot be empty');
        }
        if (normalizedSql.startsWith('select')) return 'select';
        if (normalizedSql.startsWith('insert')) return 'insert';
        if (normalizedSql.startsWith('delete')) return 'delete';
        if (normalizedSql.startsWith('update')) return 'update';
        throw new Error('Invalid SQL operation');
    };

    const runQuery = async (): Promise<void> => {
        if (!query.trim()) {
            setError('Query cannot be empty');
            return;
        }

        try {
            const operation = detectOperation(query);
            const response = await axios.post<QueryResponse>('/api/query', {
                operation,
                query: query.trim()
            });

            if (operation !== 'select') {
                setResults([{
                    message: response.data.success
                        ? 'Operation completed successfully'
                        : 'Operation failed'
                }]);
            } else {
                setResults(response.data.rows || []);
            }
            setError('');
        } catch (err) {
            // tslint:disable-next-line:no-shadowed-variable
            const error = err as AxiosError<QueryResponse>;
            setError(error.response?.data?.error || error.message || 'An error occurred');
            setResults([]);
        }
    };

    const handleRunQuery = async (): Promise<void> => {
        setIsLoading(true);
        await runQuery();
        setIsLoading(false);
    };

    const handleUploadComplete = (uploadResults?: Record<string, unknown>[]) => {
        if (uploadResults && uploadResults.length > 0) {
            setResults(uploadResults);
            setError('');
        }
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>SQL Editor</Typography>

            <TextField
                label="SQL Query"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                margin="normal"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRunQuery}
                    disabled={isLoading || !query.trim()}
                    sx={{ mt: 2, mb: 2 }}
                >
                    {isLoading ? 'Running...' : 'Run Query'}
                </Button>
                <FileUploader onUploadComplete={handleUploadComplete} />
            </div>

            {error && (
                <Typography color="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                </Typography>
            )}

            <ResultsTable results={results} />
        </Container>
    );
};

export default SqlEditor;
