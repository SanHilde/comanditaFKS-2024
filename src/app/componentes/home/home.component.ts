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

  escanearQr() {
    this.router.navigate(['/ingreso']);
    this.qrService.leerQr();

    // TODO: Manejar los cambios de acción desde cada página donde se vaya hacer el cmabio de acción
    if (this.authService.accionActual === 'PROPINA')
      this.authService.accionActual = 'INGRESO';
  }
}
