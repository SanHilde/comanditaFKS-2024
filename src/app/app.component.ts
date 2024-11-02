import { Component } from '@angular/core';
import { StatusBar, StatusBarStyle } from '@capacitor/status-bar';
import { isPlatform, MenuController, NavController, Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
import { Router } from '@angular/router';
import {NavigationBar} from '@capgo/capacitor-navigation-bar'
import { Auth } from '@angular/fire/auth';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  bandera= false;
  log:any=null;
  constructor(private menu: MenuController, public auth: Auth,private platform: Platform, private navCtrl: NavController, private router: Router) {
    this.initializeApp();
  }
  isCurrentRoute(route: string): boolean {
    return this.router.url === route;
  }

  initializeApp() {
  this.platform.ready().then(() => {
    SplashScreen.hide();
    //StatusBar.setBackgroundColor({color: '#d4b483'});
    //NavigationBar.setNavigationBarColor({ color: '#d4b483' }); //PERSONALIZA EL COLOR DE LA BARRA
    
    
    this.cargarDatosIniciales().then(() => {
      // Cuando la app esté lista, navega a la pantalla principal
      // this.navCtrl.navigateRoot('');
      
    });
  });
}
    logout(){
      this.auth.signOut();
      this.router.navigate(['/login']);
    }
    async cargarDatosIniciales() {
      // Simular una carga de datos, sustituir con tu lógica real
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
          this.log=this.auth.currentUser?.email
          if(this.log==undefined){
            this.router.navigate(['/login']);
          }
          setTimeout(() => {     
            this.bandera=true;
          },1000);

        }, 3000); // Simulación de carga de datos
      });
    }
}