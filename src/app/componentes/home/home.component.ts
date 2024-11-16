import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';
import { AuthService } from 'src/app/services/auth.service';
import { QrService } from 'src/app/services/qr.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [ModulosComunesModule, RouterOutlet],
})
export class HomeComponent {
  constructor(
    public auth: Auth,
    public authService: AuthService,
    public router: Router,
    public qrService: QrService
  ) {}

  async escanearQr() {
    // this.router.navigate(['/ingreso']);
    let lectura = await this.qrService.leerQr();

    // TODO: Manejar los cambios de acción desde cada página donde se vaya hacer el cmabio de acción
    // if (this.authService.accionActual === 'PROPINA')
    this.authService.accionActual = 'INGRESO';
    switch(lectura){
        case 'INGRESO':
          this.router.navigate(['/ingreso']);
          this.authService.accionActual = 'INGRESO';
        break;
        case 'MESA1':
          this.router.navigate(['/mesa',"1"]);
        break;
        case 'MESA2':
          this.router.navigate(['/mesa',"2"]);
        break;
        case 'MESA3':
          this.router.navigate(['/mesa',"3"]);
        break;
        case 'MESA4':
          this.router.navigate(['/mesa',"4"]);
        break;
        case 'MESA6':
          this.router.navigate(['/mesa',"5"]);
        break;
    }
  }

  navegarSiguienteAccionMaitre(pagina: 'altaCliente' | 'asignarMesas') {
    if (pagina === 'altaCliente') {
      this.router.navigate(['/altaUsuarios', 'Cliente']);
    } else {
      this.router.navigate(['/asignarMesas']);
    }
  }
  navegarSiguienteAccionMozo(accion: string) {
    this.router.navigate(['/listasParaAceptar', accion]);
  }
}
