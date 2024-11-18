import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacilPage } from './facil.page';

describe('FacilPage', () => {
  let component: FacilPage;
  let fixture: ComponentFixture<FacilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
