import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoDelPedidoPage } from './estado-del-pedido.page';

describe('EstadoDelPedidoPage', () => {
  let component: EstadoDelPedidoPage;
  let fixture: ComponentFixture<EstadoDelPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoDelPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
