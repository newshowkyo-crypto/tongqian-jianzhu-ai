import { createServer } from 'node:net';

export const APP_PREFERRED_PORTS = {
  web: [3000, 3100, 3200, 3300],
  admin: [3010, 3110, 3210, 3310],
  agent: [3011, 3111, 3211, 3311],
  gov: [3012, 3112, 3212, 3312],
  api: [4000, 4100, 4200, 4300],
};

async function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port);
  });
}

export async function allocatePort(appName) {
  const candidates = APP_PREFERRED_PORTS[appName] ?? [];

  for (const port of candidates) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  for (let port = 3500; port < 3999; port += 1) {
    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(`no free port for ${appName}`);
}

if (process.argv[1]?.endsWith('dev-port-allocator.mjs')) {
  const appName = process.argv[2];
  console.log(await allocatePort(appName));
}
