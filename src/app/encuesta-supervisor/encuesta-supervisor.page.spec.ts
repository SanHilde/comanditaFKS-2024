import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncuestaSupervisorPage } from './encuesta-supervisor.page';

describe('EncuestaSupervisorPage', () => {
  let component: EncuestaSupervisorPage;
  let fixture: ComponentFixture<EncuestaSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EncuestaSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
