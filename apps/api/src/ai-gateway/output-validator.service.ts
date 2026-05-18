import { Injectable } from '@nestjs/common';
import { RequiredElementsSchema, type RequiredElements } from '@tongqian/types';

@Injectable()
export class OutputValidatorService {
  validate<T extends RequiredElements>(output: unknown): T {
    return RequiredElementsSchema.passthrough().parse(output) as T;
  }
}
