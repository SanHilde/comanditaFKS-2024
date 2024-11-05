import { Component, HostListener } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './services/auth.service';
import { StatusBar } from '@capacitor/status-bar';

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  bandera = false;
  log: string | null | undefined = null;

  constructor(
    public auth: Auth,
    public authService: AuthService,
    private platform: Platform,
    private router: Router
  ) {
    this.initializeApp();
    if (this.platform.is('capacitor')) this.initPushNotification();
  }

  initPushNotification() {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      alert('Push registration success, token: ' + token.value);
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // SplashScreen.hide();
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
        } else{
          this.router.navigate(['/home']);
        }
        setTimeout(() => {
          SplashScreen.hide();
          this.bandera = true;
        }, 1000);
      }, 3000); // Simulación de carga de datos
    });
  }
  showList = false; // Variable para controlar la visibilidad de la lista

  toggleList(event: MouseEvent) {
    event.stopPropagation(); // Evita que el clic en el botón cierre la lista
    this.showList = !this.showList; // Cambia la visibilidad de la lista
  }

  selectOption(option: string) {
    this.router.navigate(['/altaUsuarios', option]);
    this.showList = false; // Cierra la lista al seleccionar una opción
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.showList) {
      this.showList = false; // Cierra la lista si se hace clic fuera
    }
  }
}
