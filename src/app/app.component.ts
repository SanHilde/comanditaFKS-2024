import { Component, HostListener } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './services/auth.service';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  bandera = false;
  log: string | null | undefined = null;
  showList = false; // Variable para controlar la visibilidad de la lista

  constructor(
    public auth: Auth,
    public authService: AuthService,
    private platform: Platform,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
      StatusBar.setBackgroundColor({ color: '#764134' });
      NavigationBar.setNavigationBarColor({ color: '#764134' }); //PERSONALIZA EL COLOR DE LA BARRA
      this.cargarDatosIniciales(); // Cuando la app esté lista, navega a la pantalla principal
    });
  }

  logout() {
    this.authService.logout();
  }

  async cargarDatosIniciales() {
    // Simular una carga de datos, sustituir con tu lógica real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
        this.log = this.auth.currentUser?.email;
        if (this.log == undefined) {
          this.router.navigate(['/login']);
        } else {
          if (
            this.authService.tipoUsuario == 'Dueño' ||
            this.authService.tipoUsuario == 'Supervisor'
          ) {
            this.router.navigate(['/listaClientes']);
          } else {
            this.router.navigate(['/home']);
          }
        }
        setTimeout(() => {
          SplashScreen.hide();
          this.bandera = true;
        }, 1000);
      }, 3000); // Simulación de carga de datos
    });
  }

  toggleList(event: MouseEvent) {
    event.stopPropagation(); // Evita que el clic en el botón cierre la lista
    this.showList = !this.showList; // Cambia la visibilidad de la lista
  }

  selectOption(option: string) {
    if (option === 'Producto') {
      this.router.navigate(['/alta-producto']);
    } else {
      this.router.navigate(['/altaUsuarios', option]);
    }

    this.showList = false; // Cierra la lista al seleccionar una opción
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.showList) {
      this.showList = false; // Cierra la lista si se hace clic fuera
    }
  }
}
