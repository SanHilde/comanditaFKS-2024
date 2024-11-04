import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Router, RouterOutlet } from '@angular/router';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';
import { LoginComponent } from '../login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone:true,
  imports: [ReactiveFormsModule, ModulosComunesModule, RouterOutlet],
})
export class HomeComponent  implements OnInit {

  constructor(public auth:Auth,private router: Router, public authService: AuthService) { }

  ngOnInit() {
    
    if(!this.auth.currentUser){
      // console.log(this.auth.currentUser);
      // this.router.navigate(['/login']);
    }
  }
  escanear(){
    if( this.authService.accionActual=="PROPINA" || this.authService.accionActual==""){
      this.authService.accionActual="INGRESO"
    } else{
      if( this.authService.accionActual=="INGRESO" ){
        this.authService.accionActual="MESA"
      } else{
        this.authService.accionActual="PROPINA"
      }

    }
  }

}
