import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DificilPage } from './dificil.page';

describe('DificilPage', () => {
  let component: DificilPage;
  let fixture: ComponentFixture<DificilPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DificilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
