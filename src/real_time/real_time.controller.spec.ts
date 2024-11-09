import { Test, TestingModule } from '@nestjs/testing';
import { RealTimeController } from './real_time.controller';

describe('RealTimeController', () => {
  let controller: RealTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RealTimeController],
    }).compile();

    controller = module.get<RealTimeController>(RealTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
