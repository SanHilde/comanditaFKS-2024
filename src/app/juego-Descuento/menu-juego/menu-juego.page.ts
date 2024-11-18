import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioInterface } from 'src/app/interfaces/usuario.interface';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-menu-juego',
  templateUrl: './menu-juego.page.html',
  styleUrls: ['./menu-juego.page.scss'],
})
export class MenuJuegoPage implements OnInit {

public usuario: UsuarioInterface | undefined;
 

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.usuario = this.authService.usuarioLogeado;
      
    }, 4000);
   
  }

  irAFacil(){
    this.router.navigateByUrl('facil')
  }

  irAMedio(){
    this.router.navigateByUrl('medio')
  }

  irADificil(){
    this.router.navigateByUrl('dificil')
  }
  irAScores(){
    this.router.navigateByUrl('scores')
  }

}
