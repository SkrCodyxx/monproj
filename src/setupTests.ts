// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Optional: If you need to globally mock something for all tests, you can do it here.
// For example, mocking a global API or a module:
//
// import { vi } from 'vitest';
//
// vi.mock('./some-module', () => ({
//   default: vi.fn(),
//   someNamedExport: vi.fn(),
// }));
//
// global.fetch = vi.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve({ data: 'mocked data' }),
//   })
// );

// Clean up after each test case (e.g., clear mocks, reset timers)
// Vitest automatically does this for mocks defined with vi.mock,
// but for other global state or manual mocks, you might add cleanup here.
// import { afterEach } from 'vitest';
// afterEach(() => {
//   vi.clearAllMocks();
// });
