// jest.setup.js
require('@testing-library/jest-dom');

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        pathname: '',
        route: '',
        asPath: '',
        query: ''
    })
}));

// Mock axios
jest.mock('axios');

// Setup global fetch mock
global.fetch = jest.fn();
