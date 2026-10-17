import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { createGcpApp } from './app';

export const handleRequest = createGcpApp(
  {
    apiKey: process.env.GEMINI_API_KEY ?? '',
    model: process.env.GEMINI_MODEL ?? '',
    hosting: 'cloud-run',
  },
  fileURLToPath(new URL('./client', import.meta.url)),
);
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = createServer(async (req, res) => {
    const abort = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) abort.abort();
    });
    try {
      const headers = new Headers();
      for (const [name, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) value.forEach((v) => headers.append(name, v));
        else if (value) headers.set(name, value);
      }
      // Cloud Run terminates HTTPS. Forwarded proto is used only to compare origins,
      // never as authorization; IAM is enforced before requests reach the container.
      const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const init: RequestInit & { duplex?: 'half' } = {
        method: req.method,
        headers,
        signal: abort.signal,
      };
      if (!['GET', 'HEAD'].includes(req.method ?? 'GET')) {
        init.body = Readable.toWeb(req) as ReadableStream<Uint8Array>;
        init.duplex = 'half';
      }
      const response = await handleRequest(
        new Request(`${protocol}://${req.headers.host ?? 'localhost'}${req.url}`, init),
      );
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      if (response.body) Readable.fromWeb(response.body as any).pipe(res);
      else res.end();
    } catch {
      if (!res.headersSent) res.writeHead(500);
      res.end('Request failed.');
    }
  });
  server.requestTimeout = 60_000;
  server.listen(Number(process.env.PORT ?? 8080), '0.0.0.0', () =>
    console.log('Vigor Cloud Run service ready.'),
  );
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
}
