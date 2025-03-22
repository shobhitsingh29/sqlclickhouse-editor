// src/components/FileUploader.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import FileUploader from './FileUploader';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FileUploader', () => {
    const mockOnUploadComplete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders upload button', () => {
        render(<FileUploader />);
        expect(screen.getByText('Upload SQL File')).toBeInTheDocument();
    });

    it('handles successful file upload with SELECT results', async () => {
        const mockResults = [{ id: 1, name: 'Test' }];
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                success: true,
                results: mockResults
            }
        });

        render(<FileUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['SELECT * FROM test'], 'test.sql', {
            type: 'application/sql'
        });

        const input = screen.getByLabelText('Upload SQL File');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(mockOnUploadComplete).toHaveBeenCalledWith(mockResults);
            expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
        });
    });

    it('displays error message on upload failure', async () => {
        const errorMessage = 'Upload failed';
        mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

        render(<FileUploader onUploadComplete={mockOnUploadComplete} />);

        const file = new File(['INVALID SQL'], 'test.sql', {
            type: 'application/sql'
        });

        const input = screen.getByLabelText('Upload SQL File');
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });
});
