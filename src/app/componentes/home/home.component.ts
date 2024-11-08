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
    private router: Router,
    public authService: AuthService,
    public qrService: QrService
  ) {}

  escanearQr() {
    console.log('holaaaaa');

    this.router.navigate(['/ingreso']);

    //this.qrService.leerQr();
    // if (
    //   this.authService.accionActual == 'PROPINA' ||
    //   this.authService.accionActual == ''
    // ) {
    //   this.authService.accionActual = 'INGRESO';
    // } else {
    //   if (this.authService.accionActual == 'INGRESO') {
    //     this.authService.accionActual = 'MESA';
    //   } else {
    //     this.authService.accionActual = 'PROPINA';
    //   }
    // }
  }
}
