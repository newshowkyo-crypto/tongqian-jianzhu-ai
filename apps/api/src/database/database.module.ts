import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { PrismaService } from './prisma/prisma.service.js';

/**
 * Global database module. Exposes the single shared {@link PrismaService} and
 * aliases the bare `PrismaClient` token to it so existing repositories that
 * inject `PrismaClient` keep working without per-module instantiation.
 */
@Global()
@Module({
  exports: [PrismaService, PrismaClient],
  providers: [PrismaService, { provide: PrismaClient, useExisting: PrismaService }],
})
// Nest modules are marker classes discovered through decorators.
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DatabaseModule {}
