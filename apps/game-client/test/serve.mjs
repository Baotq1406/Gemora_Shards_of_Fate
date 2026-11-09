import { createServer } from 'vite';
const server = await createServer({ server: { open: false } });
await server.listen();
