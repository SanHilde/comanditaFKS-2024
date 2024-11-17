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

        default:
          this.titulo = `Lista de ${this.tipoTraido} `;
          this.listaDeObjetos = ventas;
      }
      this.spinner.hide();
    });
  }

  verDetalleDelPedido(item: Ventas) {
    this.pedidoSeleccionado = item;
    this.setModalOpen(true);
  }

  setModalOpen(isOpen: boolean) {
    this.estaAbiertoElModal = isOpen;
  }

  volverAtras() {
    this.router.navigate(['/home']);
  }

  modificarPedido(pedidoActual: Ventas) {
    if (!this.tipoTraido || !['pedidos', 'pagos'].includes(this.tipoTraido))
      return;

    this.spinner.show();
    const pedidoModificado: Ventas =
      this.tipoTraido === 'pedidos'
        ? { ...pedidoActual, validacionMozo: true }
        : { ...pedidoActual, pago: true };

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
