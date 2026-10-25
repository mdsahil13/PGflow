import type { Config } from 'tailwindcss';
export default { content: ['./index.html','./src/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#172033', muted:'#6b7280', brand:'#4f46e5', canvas:'#f6f7fb' }, boxShadow:{ soft:'0 8px 30px rgba(20,30,60,.05)' } } }, plugins: [] } satisfies Config;
