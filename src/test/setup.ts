// import '@testing-library/jest-dom'; // if you install jest-dom
// This file is run before each test file.
// You can include global setup here, like importing jest-dom for extended matchers.

// Example: Mocking localStorage if needed for some tests, though zustand persist handles it.
// const localStorageMock = (() => {
//   let store: { [key: string]: string } = {};
//   return {
//     getItem: (key: string) => store[key] || null,
//     setItem: (key: string, value: string) => {
//       store[key] = value.toString();
//     },
//     removeItem: (key: string) => {
//       delete store[key];
//     },
//     clear: () => {
//       store = {};
//     }
//   };
// })();
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Vitest specific setup can go here
// For example, if you need to reset mocks before each test
// import { beforeEach } from 'vitest';
// beforeEach(() => {
//   // vi.resetAllMocks(); // if using vi.spyOn or vi.fn
// });

console.log('Vitest setup file loaded.'); 