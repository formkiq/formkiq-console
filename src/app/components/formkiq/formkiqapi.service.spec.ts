import { TestBed } from '@angular/core/testing';

import { FormkiqapiService } from './formkiqapi.service';

describe('FormkiqapiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormkiqapiService = TestBed.get(FormkiqapiService);
    expect(service).toBeTruthy();
  });
});
