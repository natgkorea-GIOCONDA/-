import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { navy: '#0b1f3a', gold: '#c7a45b', charcoal: '#1f2937' }, boxShadow: { card: '0 18px 45px rgba(11,31,58,.10)' } } }, plugins: [] } satisfies Config;
