import { Component, OnInit, Input } from '@angular/core';
import {  OnChanges, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-estado-del-pedido',
  templateUrl: './estado-del-pedido.page.html',
  styleUrls: ['./estado-del-pedido.page.scss'],
})
export class EstadoDelPedidoPage implements OnInit {
  @Input() mostrarAnimacion: boolean = false; // Controla la visualización de la animación
  estadoPedido: string = 'cocinando'; // Estado inicial del pedido
  intervalId: any;
  public animar: boolean=false;

  constructor(public spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.iniciarAnimacion();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Activa la animación cuando mostrarAnimacion cambia a true
    if (changes['mostrarAnimacion'] && this.mostrarAnimacion) {
      this.iniciarAnimacion();
    } else if (!this.mostrarAnimacion) {
      this.detenerAnimacion();
    }
  }

  iniciarAnimacion() {
    this.estadoPedido = 'cocinando'; // Estado inicial
    this.intervalId = setInterval(() => {
      this.actualizarEstado();
    }, 7000); // Cambia de estado cada 5 segundos
  }

  actualizarEstado() {
    if (this.estadoPedido === 'cocinando') {
      this.estadoPedido = 'emplatando';
    } else if (this.estadoPedido === 'emplatando') {
      this.estadoPedido = 'entregando';
    } else if (this.estadoPedido === 'entregando') {
      this.detenerAnimacion(); // Detiene la animación al finalizar
    }
  }

  detenerAnimacion() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.estadoPedido = 'cocinando'; // Reinicia el estado para la próxima vez
  }
 

}
