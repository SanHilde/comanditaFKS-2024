import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ListaDeEsperaService } from 'src/app/services/lista-de-espera.service';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MesasService } from 'src/app/services/mesas.service';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { FotosService } from 'src/app/services/fotos.service';
import { ToastService } from 'src/app/services/toast.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { Ventas } from 'src/app/interfaces/venta.interface';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxSpinnerModule],
})
export class IngresoComponent implements OnInit {
  estaEnListaDeEspera: boolean = false;
  esUsuarioAnonimo: boolean = true;
  yaTieneMesaAsignada: boolean = false;
  mesaAsignada: Mesa | undefined;

  constructor(
    public authService: AuthService,
    public listaDeEsperaService: ListaDeEsperaService,
    public mesasService: MesasService,
    private datosService: DatosServiceService,
    private router: Router,
    public spinner: NgxSpinnerService,
    public fotosServices: FotosService,
    public ToastService: ToastService
  ) {}

  ngOnInit() {
    this.revisarSiEstaEnLaLista();
  }

  revisarSiEstaEnLaLista() {
    this.spinner.show();
    this.listaDeEsperaService.obtenerListaDeEsperaCliente().subscribe(
      (listaDeEspera) => {
        this.listaDeEsperaService.listaDeEsperaDelCliente = listaDeEspera;
        this.estaEnListaDeEspera = listaDeEspera.length > 0;
        if (listaDeEspera.length > 0) {
          this.yaTieneMesaAsignada =
            listaDeEspera.filter((item) => item.estado === 'LISTO').length > 0;
          if (this.yaTieneMesaAsignada) this.obtenerMesaDelCliente();
        }
        this.spinner.hide();
      },
      (error) => {
        console.error('Error al obtener la lista de espera', error);
        this.spinner.hide();
      }
    );
  }

  obtenerMesaDelCliente() {
    if (!this.authService.usuarioLogeado?.id) return;
    this.mesasService
      .obtenerMesaPorCliente(this.authService.usuarioLogeado.id)
      .subscribe((mesa) => {
        this.mesaAsignada = mesa;
      });
  }

  async handleListaDeEspera(estado: boolean) {
    this.spinner.show();
    if (estado) {
      const cantidadDePersonas = await this.pedirCantidadPersonas();
      if (cantidadDePersonas)
        this.listaDeEsperaService.agregarAListaDeEspera(cantidadDePersonas);
    } else {
      this.listaDeEsperaService.sacarDeListaDeEspera();
    }
    this.listaDeEsperaService.obtenerListaDeEsperaCliente();
    this.revisarSiEstaEnLaLista();
    this.spinner.hide();
  }

  async pedirCantidadPersonas(): Promise<number | null> {
    const { value, isConfirmed } = await Swal.fire({
      title: 'Cantidad de personas',
      text: 'Ingresa la cantidad de personas para la mesa',
      input: 'number', // Tipo de input
      inputPlaceholder: 'Ejemplo: 4',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      heightAuto: false,
      inputValidator: (value: string | number) => {
        const valor = typeof value === 'number' ? value : Number(value);
        if (!valor || isNaN(valor) || valor < 1 || valor > 6) {
          return 'Por favor, ingresa un número válido. No pueden ser mas de 6 personas';
        }
        return '';
      },
    });
    if (isConfirmed && value) {
      return parseInt(value, 10);
    }

    return null;
  }

  irACompletarEncuestas() {
    // TODO: Agregar encuestas
    this.router.navigate(['/encuestasClientes']);
  }

  irAResultadosDeLasEncuestas() {
    this.router.navigate(['/resultadosEncuestas', 'sinMesa']);
  }

  // Si ya tiene una mesa asignada
  escanearQrMesa() {
    if (!this.mesaAsignada) return;
    this.fotosServices
      .scan()
      .then((resultado: string) => {
        if (this.mesaAsignada?.qrid == resultado) {
          this.router.navigate(['/mesa', this.mesaAsignada.numero]);
        } else {
          this.ToastService.openErrorToast(
            `Error. Esta mesa no está asignada a ti. Tu mesa el la número ${this.mesaAsignada?.numero}`,
            'bottom'
          );
        }
      })
      .catch((error) => {
        console.error('Error al escanear el código QR:', error);
      });
  }
}
