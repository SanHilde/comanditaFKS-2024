import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { SplashScreenComponent } from './componentes/splash-screen/splash-screen.component';
import { provideAnimations } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    SplashScreenComponent,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'comanda-597db',
        appId: '1:183486359819:web:f73790b38ab7f9b5a05a0e',
        storageBucket: 'comanda-597db.appspot.com',
        // locationId: 'us-central',
        apiKey: 'AIzaSyBE7fPAE2R7JA_hMPz5_3xN4OgU019dNZ8',
        authDomain: 'comanda-597db.firebaseapp.com',
        messagingSenderId: '183486359819',
        measurementId: 'G-H895GXE4NH',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideAnimations(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
