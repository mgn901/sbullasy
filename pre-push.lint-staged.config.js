export default {
  '*.{js,jsx,ts,tsx}': [
    'jest --passWithNoTests',
    () => 'pnpm run lint',
    () => 'pnpm run format',
  ],
};
