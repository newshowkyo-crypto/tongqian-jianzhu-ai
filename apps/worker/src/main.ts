import 'reflect-metadata';

import { createServer } from 'node:http';

import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class WorkerModule {}

async function bootstrap(): Promise<void> {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  const queueName = 'dummy';
  const queue = new Queue(queueName, { connection });
  const worker = new Worker(queueName, async (job) => ({ id: job.id, name: job.name }), {
    connection,
  });

  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['error', 'warn', 'log'],
  });

  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok', service: 'worker' }));
  });

  const port = Number(process.env.PORT ?? 4100);
  server.listen(port, '0.0.0.0');

  const shutdown = async (): Promise<void> => {
    server.close();
    await worker.close();
    await queue.close();
    await connection.quit();
    await app.close();
  };

  process.once('SIGINT', () => void shutdown());
  process.once('SIGTERM', () => void shutdown());
}

void bootstrap();
