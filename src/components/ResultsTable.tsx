import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

interface ResultsTableProps {
    results: any[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
    if (results.length === 0) return null;

    const columns = Object.keys(results[0]);

    return (
        <Table>
            <TableHead>
                <TableRow>
                    {columns.map((col) => (
                        <TableCell key={col}>{col}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {results.map((row, index) => (
                    <TableRow key={index}>
                        {columns.map((col) => (
                            <TableCell key={col}>{row[col]}</TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ResultsTable;
