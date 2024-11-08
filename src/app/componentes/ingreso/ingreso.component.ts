import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ListaDeEsperaService } from 'src/app/services/lista-de-espera.service';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

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

  constructor(
    public authService: AuthService,
    public listaDeEsperaService: ListaDeEsperaService,
    private router: Router,
    public spinner: NgxSpinnerService
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
        this.spinner.hide();
      },
      (error) => {
        console.error('Error al obtener la lista de espera', error);
        this.spinner.hide();
      }
    );
  }

  handleListaDeEspera(estado: boolean) {
    this.spinner.show();
    if (estado) {
      this.listaDeEsperaService.agregarAListaDeEspera();
    } else {
      this.listaDeEsperaService.sacarDeListaDeEspera();
    }
    this.listaDeEsperaService.obtenerListaDeEsperaCliente();
    this.revisarSiEstaEnLaLista();
    this.spinner.hide();
  }

  irACompletarEncuestas() {
    // TODO: Agregar encuestas
    this.router.navigate(['/completarEncuestas']);
  }

  irAResultadosDeLasEncuestas() {
    // TODO: Agregar pagina de los resultados
    this.router.navigate(['/resultadosEncuestas']);
  }
}
