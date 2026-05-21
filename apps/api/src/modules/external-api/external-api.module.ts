import { Module } from '@nestjs/common';

import { QichachaApiProvider } from './qichacha-api.provider.js';
import { TianyanchaApiProvider } from './tianyancha-api.provider.js';
import { WenshuApiProvider } from './wenshu-api.provider.js';

@Module({ exports: [QichachaApiProvider, TianyanchaApiProvider, WenshuApiProvider], providers: [QichachaApiProvider, TianyanchaApiProvider, WenshuApiProvider] })
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ExternalApiModule {}
