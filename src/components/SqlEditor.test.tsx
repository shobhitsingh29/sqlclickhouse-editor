// src/components/SqlEditor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import SqlEditor from './SqlEditor';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SqlEditor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders SQL editor components', () => {
        render(<SqlEditor />);
        expect(screen.getByText('SQL Editor')).toBeInTheDocument();
        expect(screen.getByLabelText('SQL Query')).toBeInTheDocument();
        expect(screen.getByText('Run Query')).toBeInTheDocument();
    });

    it('handles successful query', async () => {
        const mockData = { rows: [{ id: 1, name: 'Test' }] };
        mockedAxios.post.mockResolvedValueOnce({ data: mockData });

        render(<SqlEditor />);

        const queryInput = screen.getByLabelText('SQL Query');
        fireEvent.change(queryInput, { target: { value: 'SELECT * FROM test' } });

        const runButton = screen.getByText('Run Query');
        fireEvent.click(runButton);

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/query', {
                operation: 'select',
                query: 'SELECT * FROM test'
            });
        });
    });

    it('displays error message on query failure', async () => {
        const errorMessage = 'Invalid SQL operation';
        mockedAxios.post.mockRejectedValueOnce({
            response: { data: { error: errorMessage } }
        });

        render(<SqlEditor />);

        const queryInput = screen.getByLabelText('SQL Query');
        fireEvent.change(queryInput, { target: { value: 'INVALID QUERY' } });

        const runButton = screen.getByText('Run Query');
        fireEvent.click(runButton);

        await waitFor(() => {
            const errorElement = screen.getByText(errorMessage);
            expect(errorElement).toBeInTheDocument();
        });
    });
});
