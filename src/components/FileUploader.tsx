// components/FileUploader.tsx
import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

interface FileUploaderProps {
    onUploadComplete?: (results?: Record<string, unknown>[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        setSuccess(false);

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const fileContent = e.target?.result as string;
                    const response = await axios.post('/api/upload', { fileContent });

                    if (response.data.success) {
                        setSuccess(true);
                        if (onUploadComplete) {
                            onUploadComplete(response.data.results);
                        }
                    }
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Failed to upload file';
                    setError(message);
                } finally {
                    setIsUploading(false);
                }
            };

            reader.onerror = () => {
                setError('Error reading file');
                setIsUploading(false);
            };

            reader.readAsText(file);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload file';
            setError(message);
            setIsUploading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(false);
    };

    return (
        <div>
            <Button
                variant="outlined"
                component="label"
                disabled={isUploading}
                sx={{ mt: 2, mr: 2 }}
            >
                {isUploading ? 'Uploading...' : 'Upload SQL File'}
                <input
                    type="file"
                    hidden
                    accept=".sql"
                    onChange={handleFileUpload}
                    onClick={(e) => {
                        (e.target as HTMLInputElement).value = '';
                    }}
                />
            </Button>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    File uploaded successfully
                </Alert>
            </Snackbar>
        </div>
    );
};

export default FileUploader;
