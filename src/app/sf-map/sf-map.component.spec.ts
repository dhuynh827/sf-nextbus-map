import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SfMapComponent } from './sf-map.component';

describe('SfMapComponent', () => {
  let component: SfMapComponent;
  let fixture: ComponentFixture<SfMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SfMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SfMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
