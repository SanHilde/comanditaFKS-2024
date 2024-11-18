import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { AuthService } from 'src/app/services/auth.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxSpinnerModule],
})
export class MesaComponent implements OnInit {
  estadoActual = 1;
  idMesa: string | null = '';
  pedido!: Ventas;
  mesa!: Mesa;
  huboCambio: boolean = false;
  suscripcionAVenta = false;
  listaDeVentas: any = false;
  habilitarPropina = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private datosService: DatosServiceService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService
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
      // Buscamos el pedido de la mesa
      this.datosService
        .ObtenerDatos('Ventas')
        .subscribe((listaDeVentas: Ventas[]) => {
          // Buscar el pedido correspondiente en ventas
          const venta = listaDeVentas.find(
            (venta) => venta.mesaId == this.mesa.qrid
          );
          if (venta) {
            this.pedido = venta;
            this.analizarEstadoActual();
          }
        });
      this.analizarEstadoActual();
      this.spinner.hide();
    });
  }

  async navegarA(ruta: string) {
    switch (ruta) {
      case 'chat':
        this.router.navigate(['/chat', this.mesa.numero]);
        break;
      case 'completarEncuesta':
        this.router.navigate(['/encuestasClientes', this.idMesa]);
        break;
      case 'juegos':
        this.router.navigate(['/menu-juego']);
        break;
      case 'confirmarRecepcion':
        // mostrar sweet alert que confirme y luego si
        this.pedido.confirmarRecepcion = true;
        this.huboCambio = true;
        this.analizarEstadoActual();
        break;
      case 'resultadosEncuestas':
        this.router.navigate(['/resultadosEncuestas', this.idMesa]);
        break;
      case 'pedirCuenta':
        const lectura = 'PROPINA'; // se cambia
        if (lectura == 'PROPINA') {
          this.habilitarPropina = true;
        }
        break;
    }
  }

  propina(eleccion: String) {
    let propina = eleccion;
    this.habilitarPropina = false;
    this.router.navigate(['/detalle', this.idMesa, propina]);
  }

  async analizarEstadoActual() {
    // Inicializamos el estado como 1
    this.estadoActual = 1;

    // Si el mozo ya confirma el pedido se muestra: ver estado pedido, completar encuesta y juegos
    if (this.pedido.validacionMozo) {
      this.estadoActual = 2;
    }

    // Si el mozo entregó el pedido, se puede ver el botón de confirmar pedido, ver estado pedido, completar encuesta y juegos
    if (this.pedido.seEntregoElPedido) {
      this.estadoActual = 3;
    }

    // Si ya se ha confirmado la recepción, se puede completar encuesta, juegos y pedir la cuenta
    if (this.pedido.confirmarRecepcion) {
      this.estadoActual = 4;
    }

    // Si el pago está hecho, avanzamos al último paso
    if (this.pedido.pago) {
      this.estadoActual = 5;
    }
    console.log(this.estadoActual, 'estado actualll');
    
  }

  escanearQr() {}
}
