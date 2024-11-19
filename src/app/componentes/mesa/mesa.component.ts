import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { AuthService } from 'src/app/services/auth.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { FotosService } from 'src/app/services/fotos.service';
import { ToastService } from 'src/app/services/toast.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxSpinnerModule],
})
export class MesaComponent implements OnInit {
  idMesa: string | null = '';
  mesa: Mesa | undefined;
  pedido!: Ventas;
  stepActual = 0;
  estadoDelPedido: 'Pendiente' | 'En proceso' | 'Listo' | undefined;

  constructor(
    public authService: AuthService,
    private router: Router,
    private datosService: DatosServiceService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private fotosService: FotosService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.spinner.show();

    // Obtener el ID de la mesa
    this.route.paramMap.subscribe((params) => {
      this.idMesa = params.get('idMesa');
    });
    if (!this.idMesa) return;

    this.datosService.ObtenerDatos('Mesa').subscribe((listaDeMesas: Mesa[]) => {
      const mesaEncontrada = listaDeMesas.find(
        (mesa) => mesa.numero == this.idMesa
      );
      if (!mesaEncontrada) return;

      this.mesa = mesaEncontrada;
      this.spinner.hide();
    });
  }

  navegarA(ruta: string) {
    switch (ruta) {
      case 'juegos':
        this.router.navigate(['/menu-juego']);
        break;
      case 'completarEncuesta':
        this.router.navigate(['/encuestasClientes', this.idMesa]);
        break;
      case 'resultadosEncuestas':
        this.router.navigate(['/resultadosEncuestas', this.idMesa]);
        break;
      case 'pagarCuenta':
        this.router.navigate(['/detalleDeLaCuenta']);
        break;
    }
  }

  buscarPedidoActual() {
    this.spinner.show();

    this.datosService
      .ObtenerDatos('Ventas')
      .subscribe((listaDeVentas: Ventas[]) => {
        if (!this.mesa) return;
        // Buscar el pedido correspondiente en ventas
        const venta = listaDeVentas.find(
          (venta) => venta.mesaId == this.mesa?.qrid
        );

        if (!venta) return;
        this.pedido = venta;
        this.obtenerStepActual();
        this.spinner.hide();
      });
  }

  obtenerEstadoDelPedido() {
    if (!this.pedido) return 'Pendiente';
    const { estadoBartender, estadoCocinero } = this.pedido;
    if (!estadoBartender && !estadoCocinero) return 'Pendiente';

    const enProceso =
      estadoBartender === 'en proceso' || estadoCocinero === 'en proceso';
    const listo = estadoBartender === 'listo' && estadoCocinero === 'listo';

    if (enProceso) return 'En proceso';
    if (listo) return 'Listo';
    return 'Pendiente';
  }

  // Ver resultados de la encuesta aparece si completó la encuesta
  // Steps: 0, 1, 2, 3, 4, 5
  // 1: Sólo ve el estado del pedido
  // 2: Estado del pedido, Juegos, Completar encuesta (Este último ya tiene otra flag)
  // 3: Estado del pedido, Juegos, Completar encuesta y Confirmar recepción del pedido
  // 4: Estado del pedido, Juegos, Completar encuesta y Pedir cuenta
  // 5: Estado del pedido, Completar encuesta
  // Si ya pagó significa que se terminó su proceso, así que lo enviamos a la página de ingreso
  obtenerStepActual() {
    // Validación de la existencia de pedido
    if (!this.pedido) {
      this.stepActual = 0;
      return;
    }

    const step1 = this.pedido.validacionMozo;
    const step2 =
      step1 &&
      !this.pedido.confirmarRecepcion &&
      !this.pedido.seEntregoElPedido;
    const step3 =
      step1 && !this.pedido.confirmarRecepcion && this.pedido.seEntregoElPedido;
    const step4 =
      step1 &&
      this.pedido.seEntregoElPedido &&
      this.pedido.confirmarRecepcion &&
      !this.pedido.pidioLaCuenta;
    const step5 =
      step1 &&
      this.pedido.seEntregoElPedido &&
      this.pedido.confirmarRecepcion &&
      this.pedido.pidioLaCuenta;

    // Evaluar en qué paso está
    if (!step1) {
      this.stepActual = 1;
    } else if (step2) {
      this.stepActual = 2; // Pedido recibido pero sin confirmar recepción, no se ha entregado
    } else if (step3) {
      this.stepActual = 3; // Pedido entregado pero falta confirmar recepción
    } else if (step4) {
      this.stepActual = 4; // Pedido entregado y confirmado recepción, falta pedir la cuenta
    } else if (step5) {
      this.stepActual = 5; // Pedido entregado, confirmado recepción y ya se pidió la cuenta
    } else {
      this.stepActual = 0;
    }

    this.estadoDelPedido = this.obtenerEstadoDelPedido();
  }

  async escanearQr() {
    this.fotosService
      .scan()
      .then((resultado: string) => {
        if (!this.mesa) return;
        if (resultado === this.mesa.qrid) {
          this.buscarPedidoActual();
        } else if (this.mesa.numero) {
          this.toastService.openErrorToast(
            `Error. Esta mesa no está asignada a ti. Tu mesa el la número ${this.mesa.numero}`,
            'bottom'
          );
        }
      })
      .catch((error) => {
        console.error('Error al escanear el código QR:', error);
        this.toastService.openErrorToast('No se pudo leer el código QR');
      });
  }

  confirmarRecepcionDelPedido() {
    Swal.fire({
      title: '¿Recibiste tu pedido?',
      text: 'Si lo recibiste, por favor presiona el botón correspondiente',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmo',
      cancelButtonText: 'No, cancelar',
      heightAuto: false,
    }).then((result) => {
      if (result.isConfirmed) {
        const pedidoModificado = { ...this.pedido, confirmarRecepcion: true };
        this.modificarVenta(pedidoModificado);
        this.toastService.openSuccessToast(
          'Gracias por confirmar que recibiste el pedido. ¡Esperamos disfrutes de la comida!'
        );
      }
    });
  }

  pedirCuenta() {
    const pedidoModificado = { ...this.pedido, pidioLaCuenta: true };
    this.modificarVenta(pedidoModificado);
    this.toastService.openSuccessToast(
      'Espere unos minutos, ya le traemos la cuenta. ¡Gracias!'
    );
  }

  modificarVenta(ventaModificada: Ventas) {
    this.spinner.show();
    this.datosService
      .modificarDato(this.pedido.id, 'Ventas', ventaModificada)
      .then(
        () => {
          this.spinner.hide();
        },
        (error) => {
          console.error('Error al actualizar el la venta:', error);
          this.spinner.hide();
        }
      );
  }
}
