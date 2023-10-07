export default {
  '*.{js,jsx,ts,tsx}': [
    () => 'tsc -p tsconfig.json --noEmit',
    'jest --passWithNoTests',
    () => 'pnpm run lint',
  ],
};
