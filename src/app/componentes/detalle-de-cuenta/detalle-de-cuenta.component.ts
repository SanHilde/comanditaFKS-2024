import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Producto } from 'src/app/interfaces/producto.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { Descuento } from 'src/app/interfaces/descuentos.interface';
import { UsuarioInterface } from 'src/app/interfaces/usuario.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-detalle-de-cuenta',
  templateUrl: './detalle-de-cuenta.component.html',
  styleUrls: ['./detalle-de-cuenta.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxSpinnerModule],
})
export class DetalleDeCuentaComponent implements OnInit {
  // @Input() pedidoTraido!:any;
  public descuentoCalculado = 0;
  public propinaCalculada = 0;
  public tiketDescuento: Descuento | undefined = undefined;
  public personaLog: UsuarioInterface | undefined;
  public mesaActual: Mesa | undefined;
  public VentaPago: Ventas | undefined;
  public totalPago: number = 0;
  public producto: Producto[] = [];
  public propina = 5;
  public totalPropinaCalculada = 0;
  public totalPagoMasPropina = 0;
  public desplegarVentanaDePago: boolean = false;
  metodoPagoSeleccionado: string | null = null;
  public desplegarTicketVenta: boolean = true;
  public ventanaPagoCbu: boolean = false;

  constructor(
    private router: Router,
    public spinner: NgxSpinnerService,

    private datosService: DatosServiceService,
    private AuthService: AuthService,
    private Router: Router
  ) {}

  ngOnInit() {
    while (this.personaLog === undefined) {
      this.personaLog = this.AuthService.usuarioLogeado;
    }

    if (this.personaLog) {
      this.spinner.show();
      this.obtenersilla();
      this.obtenerTicketsDescuento();
      this.obtenerVentas();
      this.spinner.hide();
    }
  }

  obteneProductosVentas() {
    // Verificar si el objeto VentaPago existe
    if (this.VentaPago) {
      // Acceder a la propiedad productosSeleccionados de la venta
      this.VentaPago.productosSeleccionados.forEach((producto: Producto) => {
        this.producto.push(producto);
      });
    } else {
      alert('No hay datos de venta disponibles');
    }
  }

  pagar() {
    //cambiar estado de pago
    this.setSoloUnaVentana('desplegarVentanaDePago');
    // await this.datosService.modificarDatoAsync(this.pedido.id,"Ventas",this.pedido);
    //this.router.navigate(['/mesa', this.mesaActual?.numero]);
  }

  obtenerTicketsDescuento() {
    this.datosService
      .ObtenerDatos('ticketDescuento')
      .subscribe((listaTikets: Descuento[]) => {
        const ticketValido = listaTikets.find(
          (ticket) =>
            ticket.idMesaActual === this.mesaActual?.qrid && !ticket.estaUsado
        );
        if (ticketValido) {
          this.tiketDescuento = ticketValido;
        }
      });
  }

  obtenersilla() {
    this.datosService.ObtenerDatos('Mesa').subscribe((listaDeMesas: Mesa[]) => {
      for (const mesa of listaDeMesas) {
        if (
          mesa.idCliente === this.personaLog?.id &&
          mesa.estado === 'procesoPago'
        ) {
          this.mesaActual = mesa;
          break;
        }
      }
    });
  }

  obtenerVentas() {
    this.datosService
      .ObtenerDatos('Ventas')
      .subscribe((listaVentas: Ventas[]) => {
        const Venta = listaVentas.find(
          (venta) => venta.usuarioId === this.personaLog?.id && !venta.pago
        );
        if (Venta) {
          this.VentaPago = Venta;
          this.obteneProductosVentas();
          this.obtenerPrecio();
        }
      });
  }

  obtenerPrecio() {
    if (!this.VentaPago) return;
    this.totalPago = this.VentaPago.importeTotal;
    this.aplicarDescuento();
  }

  aplicarDescuento() {
    if (!this.tiketDescuento) {
      this.totalPagoMasPropina = this.totalPago;
      return;
    }
    switch (this.tiketDescuento.porcentajesDescuento) {
      case 10:
        this.descuentoCalculado = this.totalPago * 0.1;
        break;
      case 15:
        this.descuentoCalculado = this.totalPago * 0.15;
        break;
      case 20:
        this.descuentoCalculado = this.totalPago * 0.2;
        break;
      default:
        this.descuentoCalculado = this.totalPago;
        break;
    }
    const pagoConDescuento = this.totalPago - this.descuentoCalculado;
    this.totalPropinaCalculada = pagoConDescuento * 0.05;
    this.totalPagoMasPropina = pagoConDescuento + this.totalPropinaCalculada;
  }

  desplieguePagar() {
    if (this.mesaActual) {
      this.mesaActual.idCliente = '';
      this.mesaActual.estado = 'Disponible';
      this.datosService.modificarDato(
        this.mesaActual?.id,
        'Mesa',
        this.mesaActual
      );
    }
    if (this.VentaPago) {
      this.VentaPago.pago = false;
      this.datosService.modificarDato(
        this.VentaPago?.id,
        'Ventas',
        this.VentaPago
      );
    }
    if (this.tiketDescuento) {
      this.tiketDescuento.estaUsado = true;
      this.datosService.modificarDato(
        this.tiketDescuento?.id,
        'ticketDescuento',
        this.tiketDescuento
      );
    }
    this.Router.navigate(['/mesa', this.mesaActual!.numero]);
  }
  seleccionarMetodoPago(metodo: string): void {
    this.metodoPagoSeleccionado = metodo;
    this.setSoloUnaVentana('ventanaPagoCbu');
  }

  setSoloUnaVentana(
    ventana:
      | 'desplegarVentanaDePago'
      | 'desplegarTicketVenta'
      | 'ventanaPagoCbu'
  ): void {
    this.desplegarVentanaDePago = false;
    this.desplegarTicketVenta = false;
    this.ventanaPagoCbu = false;

    // Activa la propiedad especificada
    this[ventana] = true;
  }

  volverAtras() {
    if (
      this.mesaActual &&
      this.AuthService.usuarioLogeado &&
      this.desplegarTicketVenta
    ) {
      this.router.navigate(['/mesa', this.mesaActual?.numero]);
    } else if (this.ventanaPagoCbu) {
      this.setSoloUnaVentana('desplegarVentanaDePago');
    } else if (this.VentaPago) {
      this.setSoloUnaVentana('desplegarTicketVenta');
    }
  }

  obtenerTextoMetodoPago(metodo: string | null): string {
    switch (metodo) {
      case 'mercadoPago':
        return 'Mercado Pago';
      case 'tarjetaCredito':
        return 'Tarjeta de Crédito';
      case 'tarjetaDebito':
        return 'Tarjeta de Débito';
      case 'bancoSantander':
        return 'Banco Santander';
      default:
        return 'Método de Pago No Seleccionado';
    }
  }
}
