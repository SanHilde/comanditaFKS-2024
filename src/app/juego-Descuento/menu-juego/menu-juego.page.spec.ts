import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuJuegoPage } from './menu-juego.page';

describe('MenuJuegoPage', () => {
  let component: MenuJuegoPage;
  let fixture: ComponentFixture<MenuJuegoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuJuegoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
