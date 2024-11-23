import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
  NavigationStart,
} from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { AuthService } from 'src/app/services/auth.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { FotosService } from 'src/app/services/fotos.service';
import { ToastService } from 'src/app/services/toast.service';
import Swal from 'sweetalert2';
import { filter, pairwise } from 'rxjs/operators';

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
  bandera = false;
  confirmoRecepcion = false;
  pidioLaCuenta = false;
  yaPago = false;
  mostrarCompletarEncuesta = true;

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
    let mesaEncontrada: any = false;
    // Obtener el ID de la mesa
    this.route.paramMap.subscribe((params) => {
      this.idMesa = params.get('idMesa');
    });
    if (!this.idMesa) return;

    this.datosService.ObtenerDatos('Mesa').subscribe((listaDeMesas: Mesa[]) => {
      mesaEncontrada = listaDeMesas.find((mesa) => mesa.numero == this.idMesa);
      if (!mesaEncontrada) return;
      this.mesa = mesaEncontrada;
      this.spinner.hide();
    });

    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        pairwise()
      )
      .subscribe(([previous, current]: [NavigationEnd, NavigationEnd]) => {
        if (previous.url === `/encuestasClientes/${this.idMesa}`) {
          this.mostrarCompletarEncuesta = false;
          //this.buscarPedidoActual();
          // this.pedido;
          console.log('La ruta anterior antes de /home fue:', previous.url);
          // Lógica adicional aquí si es necesario
        }
      });

    // if(this.idMesa=="" || mesaEncontrada){
    //   this.spinner.hide();
    //   this.toastService.openErrorToast("Error al encontrar la mesa",'bottom');
    //   this.router.navigate(['/home']);
    // }
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
        this.yaPago = true;
        this.router.navigate(['/detalleDeLaCuenta']);
        break;
    }
  }

  async buscarPedidoActual() {
    this.spinner.show();

    // this.datosService
    //   .ObtenerDatos('Ventas')
    //   .subscribe((listaDeVentas: Ventas[]) => {
    //     // if (!this.mesa) return;
    //     // Buscar el pedido correspondiente en ventas
    //     const venta = listaDeVentas.find(
    //       (venta) => venta.mesaId == this.mesa?.qrid
    //     );

    //     // if (!venta) return;
    //     if(venta){
    //       this.pedido = venta;
    //       this.obtenerStepActual();
    //       this.spinner.hide();
    //     }
    //     else{
    //       this.spinner.hide();
    //       this.router.navigate(['/hacerPedido']);
    //     }

    //   });
    let listaDeVentas = await this.datosService.ObtenerDatosAsync('Ventas');

    const venta = listaDeVentas.find(
      (venta) => venta.mesaId == this.mesa?.qrid
    );
    if (venta) {
      this.pedido = venta;
      console.log(this.pedido);
      this.obtenerStepActual();
      this.spinner.hide();
    } else {
      this.spinner.hide();
      this.router.navigate(['/hacerPedido']);
    }
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
        if (resultado == 'INGRESO') {
          if (
            !this.mesa.idCliente ||
            this.mesa.idCliente !== this.authService.usuarioLogeado?.id
          ) {
            this.router.navigate(['/ingreso']);
          } else {
            this.toastService.openErrorToast(
              `Error. Ya tienes una mesa asignada`,
              'bottom'
            );
          }
          return;
        } else if (resultado === this.mesa.qrid) {
          if (this.mesa.idCliente !== this.authService.usuarioLogeado?.id) {
            this.toastService.openErrorToast(
              `Error. No tienes mesa asignada. Escanea el QR de ingreso para ingresar a la lista de espera.`,
              'bottom'
            );
            this.stepActual = -1;
          } else {
            this.buscarPedidoActual();
          }
        } else if (this.mesa.numero) {
          this.toastService.openErrorToast(
            `Error. Esta mesa no está asignada a ti. Tu mesa es la número ${this.mesa.numero}`,
            'bottom'
          );
        } else if (resultado == 'PROPINA') {
          this.mostrarAlertaPropina();
          return;
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
        this.datosService
          .modificarDato(this.pedido.id, 'Ventas', pedidoModificado)
          .then(
            () => {
              this.toastService.openSuccessToast(
                'Gracias por confirmar que recibiste el pedido. ¡Esperamos disfrutes de la comida!'
              );
              this.confirmoRecepcion = true;
              this.spinner.hide();
            },
            (error) => {
              console.error('Error al actualizar el la venta:', error);
              this.spinner.hide();
            }
          );
      }
    });
  }

  pedirCuenta() {
    if (!this.pedido) return;
    this.spinner.show();
    const pedidoModificado = { ...this.pedido, pidioLaCuenta: true };

    this.datosService
      .modificarDato(this.pedido.id, 'Ventas', pedidoModificado)
      .then(
        () => {
          this.pidioLaCuenta = true;
          this.toastService.openSuccessToast(
            'Espere unos minutos, ya le traemos la cuenta. ¡Gracias!'
          );
          this.spinner.hide();
        },
        (error) => {
          console.error('Error al actualizar el la venta:', error);
          this.spinner.hide();
        }
      );
  }

  obtenerMensajeEstadoDelPedido() {
    if (!this.pedido) return '';
    if (
      this.pedido.estadoBartender === 'listo' &&
      this.pedido.estadoCocinero === 'listo' &&
      this.pedido.seEntregoElPedido
    ) {
      return 'Entregado';
    } else {
      return this.estadoDelPedido;
    }
  }

  // escanearQrPropina() {
  //   this.fotosService
  //     .scan()
  //     .then((resultado: string) => {
  //       this.toastService.openSuccessToast(`${resultado}`, 'bottom');
  //       if ('PROPINA' == resultado) {
  //         this.mostrarAlertaPropina();
  //       } else {
  //         this.toastService.openErrorToast(
  //           `Error. Este no es el QR para dar propina`,
  //           'bottom'
  //         );
  //       }
  //     })
  //     .catch((error) => {
  //       console.error('Error al escanear el código QR:', error);
  //     });
  // }

  mostrarAlertaPropina() {
    Swal.fire({
      title: 'Elija el nivel de satisfacción',
      input: 'select',
      inputOptions: {
        Excelente: 'Excelente (20%)',
        'Muy Bueno': 'Muy bueno (15%)',
        Bueno: 'Bueno (10%)',
        Regular: 'Regular (5%)',
        Malo: 'Malo (0%)',
      },
      inputPlaceholder: 'Seleccione una opción',
      showCancelButton: true,
      heightAuto: false,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return '¡Debe seleccionar una opción!';
        }
        return;
      },
    }).then((result) => {
      this.spinner.show();
      if (result.isConfirmed) {
        const nivel = result.value;
        let propina = 0;
        switch (nivel) {
          case 'Excelente':
            propina = 20;
            break;
          case 'Muy Bueno':
            propina = 15;
            break;
          case 'Bueno':
            propina = 10;
            break;
          case 'Regular':
            propina = 5;
            break;
          case 'Malo':
            propina = 0;
            break;
        }
        const ventaModificada: Ventas = {
          ...this.pedido,
          propina: propina,
          pidioLaCuenta: true,
        };

        this.datosService
          .modificarDato(this.pedido.id, 'Ventas', ventaModificada)
          .then(
            () => {
              this.toastService.openSuccessToast(
                '¡Muchas gracias por su propina!'
              );
              this.spinner.hide();
            },
            (error) => {
              console.error(
                'Error al actualizar el estado de la venta:',
                error
              );
              this.spinner.hide();
            }
          );
        Swal.close();
      }
    });
  }
}
