// Mock for Vite's import.meta.env
export const mockImportMeta = {
  env: {
    VITE_APP_NAME: 'test-app',
    VITE_CATEGORIES: 'subscription,insurance,utilities',
  },
};

// Mock the import.meta object globally
Object.defineProperty(global, 'import', {
  value: { meta: mockImportMeta },
  writable: true,
});

// Also mock it on the global object for better compatibility
(global as any).import = { meta: mockImportMeta }; 