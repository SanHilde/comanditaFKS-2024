import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { TimerComponent } from '../timer/timer.component';
import { Score } from 'src/app/models/score';
import { Tarjeta } from 'src/app/models/tarjeta';
import { ScoresService } from 'src/app/services/scores.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import Swal from 'sweetalert2';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { UsuarioInterface } from 'src/app/interfaces/usuario.interface';
import { AuthService } from 'src/app/services/auth.service';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { Descuento } from 'src/app/interfaces/descuentos.interface';
import { ToastService } from 'src/app/services/toast.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dificil',
  templateUrl: './dificil.page.html',
  styleUrls: ['./dificil.page.scss'],
})
export class DificilPage implements OnInit, OnDestroy {
  tarjeta!: Tarjeta;
  botonesBloqueados: boolean = false;

  itemsSeleccionados: Tarjeta[] = [];
  itemsEncontrados: Tarjeta[] = [];
  itemsError: Tarjeta[] = [];
  public listaMesa: Mesa[] = [];
  public usuario: UsuarioInterface | undefined;
  public VentasActual: Ventas[] = [];
  public mesaActual: Mesa | undefined = undefined;
  public DescuentoActual: Descuento | undefined = undefined;

  constructor(
    private alertController: AlertController,
    private scoresService: ScoresService,
    private DatosServiceService: DatosServiceService,
    private authService: AuthService,
    private ToastService: ToastService,
    private Router: Router
  ) {}

  ngOnInit() {
    this.tarjetas = [...Array(8)].map((_, i) => new Tarjeta(i + 1, ''));
    this.tarjetas.push(...[...Array(8)].map((_, i) => new Tarjeta(i + 1, '')));

    this.shuffle(this.tarjetas);

    this.usuario = this.authService.usuarioLogeado;

    if (this.usuario) {
      this.cargarDatosMesa();
      this.cargarDatosVentas();

      setTimeout(() => {
        if (this.listaMesa.length > 0 && this.VentasActual.length > 0) {
          this.llenarDescuento();
        } else {
          console.error('Datos incompletos para inicializar el descuento.');
        }
      }, 1000);
    } else {
      console.error('Usuario no inicializado');
    }
    this.verificarTicketDescuento().subscribe((tieneTicket) => {
      if (tieneTicket) {
        this.Router.navigate(['/mesa', this.mesaActual!.numero]);
      }
    });
  }
  verificarTicketDescuento(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.DatosServiceService.ObtenerDatos('ticketDescuento').subscribe(
        (tickets) => {
          const ticketDescuento = tickets.find(
            (ticket) =>
              ticket.idCliente === this.usuario!.id &&
              ticket.estaUsado === false
          );
          if (ticketDescuento) {
            switch (ticketDescuento && !ticketDescuento.estaUsado) {
              case 10:
                this.ToastService.openSuccessToast(
                  '¡Ticket de descuento del 10% cargado correctamente!',
                  'top'
                );
                break;
              case 15:
                this.ToastService.openSuccessToast(
                  '¡Ticket de descuento del 15% cargado correctamente!',
                  'top'
                );
                break;
              case 20:
                this.ToastService.openSuccessToast(
                  '¡Ticket de descuento del 20% cargado correctamente!',
                  'top'
                );
                break;
              default:
                this.ToastService.openSuccessToast(
                  '¡Ticket de descuento cargado correctamente!',
                  'top'
                );
                break;
            }
            observer.next(true); // Enviamos true porque se encontró un ticket
          } else {
            observer.next(false); // Enviamos false si no se encuentra el ticket
          }

          observer.complete(); // Terminamos el observable
        },
        (error) => {
          this.ToastService.openErrorToast(
            'Error al obtener los datos del ticket.',
            'top'
          );
          observer.next(false); // Si hay un error, enviamos false
          observer.complete(); // Terminamos el observable
        }
      );
    });
  }

  cargarDatosMesa() {
    this.DatosServiceService.ObtenerDatos('Mesa').subscribe((listaMesa) => {
      this.listaMesa = listaMesa;
      this.mesaActual = this.listaMesa.find(
        (mesa) =>
          mesa.idCliente === this.usuario?.id &&
          (mesa.estado === 'Ocupada' || mesa.estado === 'procesoPago')
      );
      console.log('Mesa actual:', this.mesaActual);
    });
  }

  cargarDatosVentas() {
    this.DatosServiceService.ObtenerDatos('Ventas').subscribe((listaVentas) => {
      this.VentasActual = listaVentas.filter(
        (venta) => venta.usuarioId === this.usuario?.id
      );
      console.log('Ventas actuales:', this.VentasActual);
    });
  }

  shuffle(array: Array<Tarjeta>) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }

  public alertButtons = [
    {
      text: 'Cerrar',
      cssClass: 'alert-button-cancel',
    },
    {
      text: 'Siguiente nivel',
      cssClass: 'alert-button-confirm',
    },
  ];

  tarjetas: Tarjeta[] = [];
  private timerSubscription!: Subscription;
  @ViewChild(TimerComponent) timerComponent!: TimerComponent;

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  seleccionarItem(item: Tarjeta) {
    if (this.botonesBloqueados) return;
    this.botonesBloqueados = true;

    if (
      this.itemsSeleccionados.length == 0 &&
      this.itemsEncontrados.length == 0
    ) {
      this.timerComponent.resetTimer();
      this.timerComponent.startTimer();
    }
    if (this.itemsSeleccionados.includes(item)) {
      this.itemsSeleccionados;
    }
    this.itemsSeleccionados.push(item);

    if (this.itemsSeleccionados.length == 2) {
      if (
        this.itemsSeleccionados[0].valor == this.itemsSeleccionados[1].valor
      ) {
        setTimeout(() => {
          this.itemsEncontrados.push(...this.itemsSeleccionados);
          this.itemsSeleccionados = [];
          if (this.itemsEncontrados.length == this.tarjetas.length) {
            this.subirTicketDescuento();
            console.log('win');
            this.onWin();
            this.Router.navigate(['/mesa', this.mesaActual!.numero]);
          }
          this.botonesBloqueados = false;
        }, 100);
      } else {
        this.itemsError.push(...this.itemsSeleccionados);
        setTimeout(() => {
          this.itemsSeleccionados = [];
          this.itemsError = [];
          this.botonesBloqueados = false;
        }, 700);
      }
    } else {
      this.botonesBloqueados = false;
    }
  }

  itemSeleccionado(item: Tarjeta) {
    return this.itemsSeleccionados.includes(item);
  }

  itemEncontrado(item: Tarjeta) {
    return this.itemsEncontrados.includes(item);
  }

  itemError(item: Tarjeta) {
    return this.itemsError.includes(item);
  }

  reiniciar() {
    this.itemsEncontrados = [];
    this.itemsError = [];
    this.itemsSeleccionados = [];
    this.botonesBloqueados = false;
    this.timerComponent.resetTimer();
    this.shuffle(this.tarjetas);
  }

  subirScore(tiempo: number) {
    let score = new Score('', '', tiempo, 'facil', Timestamp.now());
    this.scoresService.add(score);
  }

  subirTicketDescuento() {
    if (!this.DescuentoActual || !this.usuario || !this.mesaActual) {
      this.ToastService.openErrorToast(
        'Faltan datos de descuento o usuario.',
        'top'
      );
      return;
    }
    if (
      !this.DescuentoActual ||
      this.DescuentoActual.porcentajesDescuento <= 0
    ) {
      this.ToastService.openErrorToast(
        'El descuento actual no es válido.',
        'top'
      );
      return;
    }

    this.DatosServiceService.guardarDatos(
      'ticketDescuento',
      this.DescuentoActual
    )
      .then(() => {
        this.ToastService.openSuccessToast(
          '¡Enhorabuena! El ticket de descuento ha sido cargado.',
          'top'
        );

        // Navegar después de que el toast se ha mostrado
        setTimeout(() => {
          this.Router.navigate(['/mesa', this.mesaActual!.numero]);
        }, 8000); // Espera 3 segundos antes de navegar
      })
      .catch((error) => {
        this.ToastService.openErrorToast(
          'Error al guardar el ticket de descuento. Por favor, inténtalo nuevamente.',
          'top'
        );
      });
  }
  async onWin() {
    let tiempo = this.timerComponent.stopTimer();

    const alert = await this.alertController.create({
      header: '¡Felicitaciones!',
      subHeader:
        'Ganaste en ' + this.timerComponent.totalSeconds + ' segundos!',
      buttons: [
        {
          text: 'Cerrar',
          cssClass: 'alert-button-ok',
          handler: () => {
            this.reiniciar();
          },
        },
      ],
    });

    await alert.present();
  }

  llenarDescuento(): boolean {
    if (!this.mesaActual) {
      console.warn('No se encontró una mesa asociada al usuario.');
      return false;
    }
    if (this.VentasActual.length === 0) {
      console.warn('No hay ventas asociadas al usuario.');
      return false;
    }
    if (!this.usuario) {
      console.warn('El usuario no está inicializado.');
      return false;
    }

    this.DescuentoActual = {
      idMesaActual: this.mesaActual.qrid,
      idCliente: this.usuario.id,
      ventasIds: this.VentasActual.map((venta) => venta.id),
      id: '',
      estaUsado: false,
      porcentajesDescuento: 20,
    };
    console.log('DescuentoActual llenado correctamente:', this.DescuentoActual);
    return true;
  }

  resetearDescuento() {
    this.DescuentoActual = {
      idMesaActual: '',
      idCliente: '',
      ventasIds: [],
      id: '',
      estaUsado: false,
      porcentajesDescuento: 10,
    };
  }
}
