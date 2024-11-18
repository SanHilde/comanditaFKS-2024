import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-listas-para-aceptar',
  templateUrl: './listas-para-aceptar.component.html',
  styleUrls: ['./listas-para-aceptar.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, NgxSpinnerModule],
})
export class ListasParaAceptarComponent implements OnInit {
  tipoTraido: string | null = null;
  listaDeObjetos: Ventas[] = [];
  titulo: string = '';
  estaAbiertoElModal: boolean = false;
  pedidoSeleccionado: Ventas | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datosService: DatosServiceService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.route.paramMap.subscribe((params) => {
      this.tipoTraido = params.get('tipoLista');
    });
    if (!this.tipoTraido) return;

    this.cargarListaDePedidos();
  }

  // Método para cargar la lista de pedidos desde el servicio
  cargarListaDePedidos() {
    this.datosService.ObtenerDatos('Ventas').subscribe((ventas: Ventas[]) => {
      switch (this.tipoTraido) {
        case 'pagos':
          this.titulo = 'Confirmar pago de las mesas';
          this.listaDeObjetos = ventas.filter((pedido: Ventas) => {
            return (
              !pedido.pago && pedido.validacionMozo && pedido.confirmarRecepcion
            );
          });
          break;
        case 'pedidos':
          this.titulo = 'Confirmar pedidos de las mesas';
          this.listaDeObjetos = ventas.filter((pedido: Ventas) => {
            return !pedido.validacionMozo;
          });
          break;
        case 'pendientes':
          this.titulo = `Lista de pedidos pendientes`;
          this.listaDeObjetos = ventas.filter((pedido) => {
            return (
              !pedido.pago &&
              pedido.validacionMozo &&
              !pedido.confirmarRecepcion &&
              !pedido.seEntregoElPedido
            );
          });
          break;
        default:
          this.titulo = '';
          this.listaDeObjetos = [];
          break;
      }
      this.spinner.hide();
    });
  }

  verDetalleDelPedido(item: Ventas) {
    this.pedidoSeleccionado = item;
    this.setModalOpen(true);
  }

  puedeEntregarElPedido(item: Ventas) {
    return item.estadoBartender === 'listo' && item.estadoCocinero === 'listo';
  }

  obtenerEstadoDelPedido() {
    if (!this.pedidoSeleccionado) return 'Pendiente';
    const estadoBartender = this.pedidoSeleccionado.estadoBartender;
    const estadoCocinero = this.pedidoSeleccionado.estadoCocinero;

    if (!estadoBartender && !estadoCocinero) {
      return 'Pendiente';
    }
    if (estadoBartender === 'en proceso' && estadoCocinero === 'listo') {
      return 'Bartender en proceso, cocinero listo';
    }
    if (estadoBartender === 'listo' && estadoCocinero === 'en proceso') {
      return 'Bartender listo, cocinero en proceso';
    }
    if (estadoBartender === 'en proceso' && estadoCocinero === 'en proceso') {
      return 'En proceso';
    }
    if (estadoBartender === 'listo' && estadoCocinero === 'listo') {
      return 'Listo';
    }
    return 'Pendiente';
  }

  setModalOpen(isOpen: boolean) {
    this.estaAbiertoElModal = isOpen;
  }

  volverAtras() {
    this.router.navigate(['/home']);
  }

  modificarPedido(pedidoActual: Ventas) {
    if (
      !this.tipoTraido ||
      !['pedidos', 'pagos', 'pendientes'].includes(this.tipoTraido)
    )
      return;

    this.spinner.show();
    let pedidoModificado: Ventas = pedidoActual;
    if (this.tipoTraido === 'pendientes') {
      pedidoModificado = { ...pedidoActual, seEntregoElPedido: true };
    } else {
      pedidoModificado =
        this.tipoTraido === 'pedidos'
          ? { ...pedidoActual, validacionMozo: true }
          : { ...pedidoActual, pago: true };
    }

    this.datosService
      .modificarDato(pedidoActual.id, 'Ventas', pedidoModificado)
      .then(
        () => {
          // Recargar la lista actualizada después de modificar el pedido
          this.cargarListaDePedidos();
          this.spinner.hide();
        },
        (error) => {
          console.error('Error al modificar el pedido', error);
          this.spinner.hide();
        }
      );
  }
}
