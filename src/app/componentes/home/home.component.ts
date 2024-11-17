import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';
import { AuthService } from 'src/app/services/auth.service';
import { MesasService } from 'src/app/services/mesas.service';
import { QrService } from 'src/app/services/qr.service';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { EstadoPedido, Ventas } from 'src/app/interfaces/venta.interface';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { TareaCocineroYBartender } from 'src/app/interfaces/usuario.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [ModulosComunesModule, RouterOutlet, NgxSpinnerModule],
})
export class HomeComponent implements OnInit {
  tareas: TareaCocineroYBartender[] = [];
  estaAbiertoElModal: boolean = false;
  tareaSeleccionada: TareaCocineroYBartender | undefined;
  ventasLocal: Ventas[] = [];

  constructor(
    public auth: Auth,
    public authService: AuthService,
    public router: Router,
    public qrService: QrService,
    private mesasService: MesasService,
    public spinner: NgxSpinnerService,
    private datosService: DatosServiceService
  ) {}

  ngOnInit() {
    if (
      this.authService.tipoUsuario === 'Cocinero' ||
      this.authService.tipoUsuario === 'Bartender'
    ) {
      this.obtenerTareasBartenderyCocinero();
    }

    if (this.authService.tipoUsuario === 'Cliente') {
      const idUsuario = this.authService.usuarioLogeado?.id;
      if (!idUsuario) return;
      this.spinner.show();
      this.mesasService.obtenerMesas().subscribe((mesas) => {
        const mesaActualDelCliente = mesas.find(
          (item) => item.idCliente === idUsuario
        );
        if (mesaActualDelCliente) {
          this.router.navigate(['/mesa', mesaActualDelCliente.numero]);
        }
        this.spinner.hide();
      });
    }
  }

  obtenerTareasBartenderyCocinero() {
    this.spinner.show();
    this.datosService
      .ObtenerDatos('Ventas')
      .subscribe((listaDeVentas: Ventas[]) => {
        this.ventasLocal = listaDeVentas;
        this.filtrarTareas();
        this.spinner.hide();
      });
  }

  filtrarTareas() {
    const tipoUsuario = this.authService.tipoUsuario;
    const ventasFiltradas = this.ventasLocal.filter((venta) => {
      return (
        venta.validacionMozo === true &&
        venta.pago === false &&
        ((venta.estadoCocinero !== 'listo' && tipoUsuario === 'Cocinero') ||
          (venta.estadoBartender !== 'listo' && tipoUsuario === 'Bartender'))
      );
    });

    // Crear la lista de tareas
    this.tareas = ventasFiltradas.map((venta) => {
      const productosFiltrados = venta.productosSeleccionados.filter(
        (producto) => {
          return producto.categoria === tipoUsuario;
        }
      );
      return {
        listaProductos: productosFiltrados,
        numeroDeMesa: venta.mesaNumero,
        estadoPedido:
          tipoUsuario === 'Bartender'
            ? venta.estadoBartender
            : venta.estadoCocinero,
        idDeLaVenta: venta.id,
      };
    });
  }

  async escanearQr() {
    // this.router.navigate(['/ingreso']);
    let lectura = await this.qrService.leerQr();

    // TODO: Manejar los cambios de acción desde cada página donde se vaya hacer el cambio de acción
    this.authService.accionActual = 'INGRESO';
    // switch(lectura){
    //     case 'INGRESO':
    //       this.router.navigate(['/ingreso']);
    //       this.authService.accionActual = 'INGRESO';
    //     break;
    //     case 'MESA1':
    //       this.router.navigate(['/mesa',"1"]);
    //     break;
    //     case 'MESA2':
    //       this.router.navigate(['/mesa',"2"]);
    //     break;
    //     case 'MESA3':
    //       this.router.navigate(['/mesa',"3"]);
    //     break;
    //     case 'MESA4':
    //       this.router.navigate(['/mesa',"4"]);
    //     break;
    //     case 'MESA6':
    //       this.router.navigate(['/mesa',"5"]);
    //     break;
    // }
  }

  // MAITRE
  navegarSiguienteAccionMaitre(pagina: 'altaCliente' | 'asignarMesas') {
    if (pagina === 'altaCliente') {
      this.router.navigate(['/altaUsuarios', 'Cliente']);
    } else {
      this.router.navigate(['/asignarMesas']);
    }
  }

  // MOZO
  navegarSiguienteAccionMozo(accion: string) {
    this.router.navigate(['/listasParaAceptar', accion]);
  }

  // BARTENDER Y COCINERO
  setModalOpen(isOpen: boolean) {
    this.estaAbiertoElModal = isOpen;
  }

  verDetalleDelPedido(item: TareaCocineroYBartender) {
    this.tareaSeleccionada = item;
    this.setModalOpen(true);
  }

  actualizarEstado(nuevoEstado: EstadoPedido) {
    if (!this.tareaSeleccionada) return;

    if (nuevoEstado === 'listo') {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Si cambias el estado a "Listo", la tarea se eliminará de la lista.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, estoy seguro',
        cancelButtonText: 'No, cancelar',
        heightAuto: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.procederActualizarEstado(nuevoEstado);
        }
      });
    } else {
      this.procederActualizarEstado(nuevoEstado);
    }
  }

  procederActualizarEstado(nuevoEstado: EstadoPedido) {
    if (!this.tareaSeleccionada) return;
    this.setModalOpen(false);
    this.spinner.show();

    const idVenta = this.tareaSeleccionada.idDeLaVenta;
    const tipoUsuario = this.authService.tipoUsuario;

    const venta = this.ventasLocal.find((venta) => venta.id === idVenta);
    if (!venta) return;

    const ventaModificada: Ventas =
      tipoUsuario === 'Bartender'
        ? { ...venta, estadoBartender: nuevoEstado }
        : { ...venta, estadoCocinero: nuevoEstado };

    this.datosService.modificarDato(venta.id, 'Ventas', ventaModificada).then(
      () => {
        this.obtenerTareasBartenderyCocinero();
        this.spinner.hide();
      },
      (error) => {
        console.error('Error al actualizar el estado de la venta:', error);
        this.spinner.hide();
      }
    );
  }
}
