import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { ListaDeEsperaInterface } from 'src/app/interfaces/listaDeEspera.interface';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { ListaDeEsperaService } from 'src/app/services/lista-de-espera.service';
import { MesasService } from 'src/app/services/mesas.service';

@Component({
  selector: 'app-asignar-mesas',
  templateUrl: './asignar-mesas.component.html',
  styleUrls: ['./asignar-mesas.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxSpinnerModule],
})
export class AsignarMesasComponent implements OnInit {
  mesasDisponibles: Mesa[] = [];
  listaDeEspera: ListaDeEsperaInterface[] = [];
  mostrarMesas: boolean = false;
  itemDeLaListaSeleccionado: ListaDeEsperaInterface | undefined;
  mesasFiltradas: Mesa[] = []; // Las mesas filtradas por cantidad de personas
  mesaSeleccionada: Mesa | undefined;

  constructor(
    public listaDeEsperaService: ListaDeEsperaService,
    public mesasService: MesasService,
    private router: Router,
    public spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.obtenerListaDeEspera();
    this.obtenerMesasDisponibles();
  }

  obtenerListaDeEspera() {
    this.spinner.show();
    this.listaDeEsperaService.obtenerListaDeEspera().subscribe(
      (datos) => {
        this.listaDeEspera = datos.filter(
          (item) => item.estado === 'PENDIENTE'
        );
        this.ordenarListaPorPrioridad();
        this.spinner.hide();
      },
      (error) => {
        console.error('Error al obtener la lista de espera', error);
        this.spinner.hide();
      }
    );
  }

  ordenarListaPorPrioridad() {
    this.listaDeEspera.sort((a, b) => {
      const horaA = new Date(a.horaEntrada).getTime();
      const horaB = new Date(b.horaEntrada).getTime();
      return horaA - horaB; // Los más antiguos (menor hora) tendrán mayor prioridad
    });
  }

  obtenerMesasDisponibles() {
    this.spinner.show();
    this.mesasService.obtenerMesas().subscribe(
      (datos) => {
        this.mesasDisponibles = datos.filter(
          (item) => item.estado === 'Disponible'
        );
        this.spinner.hide();
      },
      (error) => {
        console.error('Error al obtener mesas disponibles', error);
        this.spinner.hide();
      }
    );
  }

  calcularPrioridad(cliente: ListaDeEsperaInterface): string {
    const now = new Date();
    const diferencia = now.getTime() - new Date(cliente.horaEntrada).getTime(); // Diferencia en milisegundos
    const minutos = Math.floor(diferencia / 1000 / 60); // Convertir a minutos

    // Prioridad: la menor cantidad de minutos tiene mayor prioridad
    return `${minutos} min`;
  }

  onClienteSeleccionado(ev: Event) {
    const target = ev.target as HTMLIonRadioGroupElement;
    const cliente = target.value as ListaDeEsperaInterface;

    this.itemDeLaListaSeleccionado = cliente;
    this.mesaSeleccionada = undefined;
    this.mesasFiltradas = this.mesasDisponibles.filter(
      (mesa) => mesa.cantidadComensales >= cliente.cantidadDePersonas
    );
  }

  onMesaSeleccionada(ev: Event) {
    const target = ev.target as HTMLIonRadioGroupElement;
    const mesa = target.value as Mesa;
    this.mesaSeleccionada = mesa;
  }

  asignarMesa() {
    if (!this.mesaSeleccionada || !this.itemDeLaListaSeleccionado?.id) return;
    this.spinner.show();

    this.mesasService.modificarMesa(
      this.mesaSeleccionada.id,
      this.itemDeLaListaSeleccionado.idCliente,
      'Ocupada'
    );

    this.listaDeEsperaService.modificarListaDeEspera(
      this.itemDeLaListaSeleccionado.id,
      'LISTO'
    );

    this.mesasFiltradas = [];
    this.spinner.hide();
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
