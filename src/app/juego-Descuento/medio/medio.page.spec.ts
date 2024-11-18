import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedioPage } from './medio.page';

describe('MedioPage', () => {
  let component: MedioPage;
  let fixture: ComponentFixture<MedioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MedioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
