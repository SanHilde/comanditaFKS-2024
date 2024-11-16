import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Producto } from 'src/app/interfaces/producto.interface';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { Router } from '@angular/router';
import { MesasService } from 'src/app/services/mesas.service';
import { AuthService } from 'src/app/services/auth.service';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-hacer-pedido',
  templateUrl: './hacer-pedido.component.html',
  styleUrls: ['./hacer-pedido.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxSpinnerModule],
})
export class HacerPedidoComponent implements OnInit {
  listaProductos: Producto[] = [];
  listaProductosFiltrados: Producto[] = [];
  opcionSeleccionada: string = 'comida';

  // Datos que se agregan en la venta/pedido
  listaProductosDelPedido: Producto[] = [];
  importeTotal: number = 0;
  tiempoEstimadoTotal: number = 0; // en minutos

  estaAbiertoElModal: boolean = false;
  mensajeModal: string = '';

  // Mesa actual del cliente
  mesaActualDelCliente: Mesa | undefined;

  constructor(
    private authService: AuthService,
    private datosService: DatosServiceService,
    private mesasService: MesasService,
    public spinner: NgxSpinnerService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.spinner.show();
    // Obtenemos todos los productos
    this.datosService.ObtenerDatos('Producto').subscribe((lista) => {
      console.log(lista, 'todos los productos');
      this.listaProductos = lista;
      this.filtrarProductos();
      this.spinner.hide();
    });

    // Obtenemos la mesa actual del usuario
    const idUsuario = this.authService.usuarioLogeado?.id;
    if (!idUsuario) return;
    this.mesasService.obtenerMesas().subscribe((mesas) => {
      this.mesaActualDelCliente = mesas.find(
        (item) => item.idCliente === idUsuario
      );
      console.log(this.mesaActualDelCliente, 'mesa actual del cliente');
    });
  }

  mostrarCards(ev: Event) {
    const target = ev.target as HTMLIonSegmentElement;
    const valor = target.value as string;
    this.opcionSeleccionada = valor;
    this.filtrarProductos();
  }

  filtrarProductos() {
    this.listaProductosFiltrados = this.listaProductos.filter((producto) => {
      switch (this.opcionSeleccionada) {
        case 'comida':
          return producto.categoria === 'Cocinero';
        case 'bebidas':
          return producto.categoria === 'Bartender';
        case 'postres':
          return producto.categoria === 'Cocinero' && producto.esUnPostre;
        default:
          return true;
      }
    });
  }

  isProductoEnPedido(producto: Producto): boolean {
    return this.listaProductosDelPedido.some((p) => p.id === producto.id);
  }

  agregarProducto(productoSeleccionado: Producto) {
    // Buscar si el producto ya está en la lista del pedido
    const productoExistente = this.listaProductosDelPedido.find(
      (producto) => producto.id === productoSeleccionado.id
    );

    if (productoExistente) {
      // Si el producto ya está en la lista, incrementar la cantidad solicitada
      productoExistente.cantidadSolicitada++;
    } else {
      // Si el producto no está en la lista, agregarlo con cantidad solicitada 1
      const nuevoProducto: Producto = {
        ...productoSeleccionado,
        cantidadSolicitada: 1,
      };
      this.listaProductosDelPedido.push(nuevoProducto);
    }
    this.calcularTotales();
  }

  eliminarProductoDelPedido(producto: Producto) {
    // Encontramos el producto en la lista
    const index = this.listaProductosDelPedido.findIndex(
      (p) => p.id === producto.id
    );

    // Si encontramos el producto, eliminamos
    if (index !== -1) {
      // Si la cantidad es mayor a 1, simplemente decrementamos la cantidad
      if (this.listaProductosDelPedido[index].cantidadSolicitada > 1) {
        this.listaProductosDelPedido[index].cantidadSolicitada--;
      } else {
        // Si la cantidad es 1, eliminamos el producto de la lista
        this.listaProductosDelPedido.splice(index, 1);
      }
    }

    this.calcularTotales();
  }

  calcularTotales() {
    // Inicializamos los valores en 0
    this.importeTotal = 0;
    this.tiempoEstimadoTotal = 0;

    // Sumamos el precio y el tiempo de cada producto multiplicado por la cantidad solicitada
    this.listaProductosDelPedido.forEach((producto) => {
      this.importeTotal += producto.precio * producto.cantidadSolicitada;
      this.tiempoEstimadoTotal +=
        producto.tiempoElaboracion * producto.cantidadSolicitada;
    });
  }

  irAlChat() {
    if (!this.mesaActualDelCliente) return;
    this.router.navigate(['/chat', this.mesaActualDelCliente.numero]);
  }

  mostrarDetallePedido() {
    let productosDetalles = this.listaProductosDelPedido
      .map((producto) => {
        return (
          `<strong>${producto.nombre}</strong> (Cantidad: ${producto.cantidadSolicitada})<br/>` +
          `Tiempo de elaboración: ${producto.tiempoElaboracion} min<br/>` +
          `Precio unitario: $${producto.precio}<br/><br/>`
        );
      })
      .join('');

    this.mensajeModal =
      productosDetalles +
      `<strong>Total:</strong><br/>` +
      `Importe total: $${this.importeTotal}<br/>` +
      `Tiempo estimado total: ${this.tiempoEstimadoTotal} minutos`;

    this.estaAbiertoElModal = true;
  }

  setModalOpen(isOpen: boolean) {
    this.estaAbiertoElModal = isOpen;
  }

  enviarPedido() {
    this.setModalOpen(false);
    this.spinner.show();
    const idUsuario = this.authService.usuarioLogeado?.id;
    if (!this.mesaActualDelCliente || !idUsuario) {
      console.error('mesaActual no está definido.');
      return;
    }

    const venta: Ventas = {
      usuarioId: idUsuario,
      mesaId: this.mesaActualDelCliente.qrid,
      productosSeleccionados: this.listaProductosDelPedido,
      pago: false,
      importeTotal: this.importeTotal,
      validacionMozo: false,
      completoEncuesta: false,
      confirmarRecepcion: false,
      id: '',
      estadoCocinero: 'pendiente',
      estadoBartender: 'pendiente',
      mesaNumero: this.mesaActualDelCliente.numero,
    };

    this.datosService
      .guardarDatos('Ventas', venta)
      .then(() => {
        this.toastService.openSuccessToast('Pedido enviado exitosamente');
        this.listaProductosDelPedido = [];
        this.importeTotal = 0;
        this.tiempoEstimadoTotal = 0;
        this.spinner.hide();
        this.router.navigate(['/mesa', this.mesaActualDelCliente?.numero]);
      })
      .catch((error) => {
        console.error('Error al guardar la venta:', error);
        this.toastService.openErrorToast(
          'Error al enviar pedido. Intente más tarde.'
        );
      });
  }
}
