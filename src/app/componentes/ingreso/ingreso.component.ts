import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ListaDeEsperaService } from 'src/app/services/lista-de-espera.service';

@Component({
  selector: 'app-ingreso',
  templateUrl: './ingreso.component.html',
  styleUrls: ['./ingreso.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class IngresoComponent implements OnInit {
  estaEnListaDeEspera: boolean = false;
  esUsuarioAnonimo: boolean = true;

  constructor(
    public authService: AuthService,
    public listaDeEsperaService: ListaDeEsperaService,
    private router: Router
  ) {}

  ngOnInit() {
    this.revisarSiEstaEnLaLista();
  }

  revisarSiEstaEnLaLista() {
    console.log(
      this.listaDeEsperaService.listaDeEsperaDelCliente,
      ';ahbhdbdhgvbdv'
    );

    return (this.estaEnListaDeEspera = this.listaDeEsperaService
      .listaDeEsperaDelCliente.length
      ? true
      : false);
  }

  handleListaDeEspera(estado: boolean) {
    if (estado) {
      this.listaDeEsperaService.agregarAListaDeEspera();
    } else {
      this.listaDeEsperaService.sacarDeListaDeEspera();
    }
    this.listaDeEsperaService.obtenerListaDeEsperaCliente();
    this.revisarSiEstaEnLaLista();
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
