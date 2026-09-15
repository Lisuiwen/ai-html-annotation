import http from 'node:http';

/**
 * Local HTTP server for install-pack e2e tests.
 * Serves registry.json and ref-keyed tarballs: /<ref>.tar.gz
 */
export function createMockPackServer({ registry, tarballs = {} }) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url || '/', 'http://127.0.0.1');

    if (url.pathname === '/registry.json') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(registry));
      return;
    }

    const tarballMatch = url.pathname.match(/^\/([^/]+)\.tar\.gz$/);
    if (tarballMatch) {
      const ref = decodeURIComponent(tarballMatch[1]);
      const body = tarballs[ref];
      if (!body) {
        response.writeHead(404);
        response.end();
        return;
      }
      response.writeHead(200, { 'Content-Type': 'application/gzip' });
      response.end(body);
      return;
    }

    response.writeHead(404);
    response.end();
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        registryUrl: `http://127.0.0.1:${address.port}/registry.json`,
        tarballBase: `http://127.0.0.1:${address.port}`,
        close() {
          return new Promise((closeResolve, closeReject) => {
            server.close((error) => (error ? closeReject(error) : closeResolve()));
          });
        }
      });
    });
  });
}

export function buildRegistryEntry(packSummary, ref) {
  return {
    id: packSummary.id,
    name: packSummary.name,
    description: packSummary.description,
    version: packSummary.version,
    schemaVersion: packSummary.schemaVersion,
    ref,
    foundation: packSummary.foundation,
    providers: packSummary.providers,
    counts: packSummary.counts
  };
}
