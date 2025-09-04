import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VidioCaptureComponent } from './vidio-capture.component';

describe('VidioCaptureComponent', () => {
  let component: VidioCaptureComponent;
  let fixture: ComponentFixture<VidioCaptureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VidioCaptureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VidioCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
