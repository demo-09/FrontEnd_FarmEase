import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AichatComponent } from './aichat.component';

describe('AichatComponent', () => {
  let component: AichatComponent;
  let fixture: ComponentFixture<AichatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AichatComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AichatComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
