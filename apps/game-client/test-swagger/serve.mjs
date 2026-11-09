import { createServer } from 'vite';
const server = await createServer({ server: { port: 18080, open: false, proxy: { '/api': { target: 'http://127.0.0.1:13000', changeOrigin: true } } } });
await server.listen();
