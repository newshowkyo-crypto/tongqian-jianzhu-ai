import { Injectable } from '@nestjs/common';

@Injectable()
export class AutoDowngradeService {
  chooseModel(model: string, downgrade: boolean): string {
    return downgrade ? 'qwen-plus' : model;
  }
}
