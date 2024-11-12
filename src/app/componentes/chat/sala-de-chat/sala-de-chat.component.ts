import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService, Spinner } from 'ngx-spinner';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-sala-de-chat',
  templateUrl: './sala-de-chat.component.html',
  styleUrls: ['./sala-de-chat.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NgxSpinnerModule],
})
export class SalaDeChatComponent  implements OnInit {
  public botones: any[] = [];
  public listaDeMesasOcupadas: any[] = [];
  // public mesaElegida!:string;

  constructor(private datosService: DatosServiceService,private router: Router) { }

  ngOnInit() {
    this.datosService.ObtenerDatos("Mesa").subscribe((listaDeMesas: any[]) => {
      this.botones=[];
      listaDeMesas.forEach((mesa: any) => {
        if (mesa.estado === "Ocupada") {
          this.listaDeMesasOcupadas.push(mesa);
          // this.botones.push(mesa.qrid);
          this.botones.push(mesa.numero);
        }
      });
    });
  }
  ingresarAlChat(mesa:string){
    this.router.navigate(['/chat', mesa]);
    // this.mesaElegida=mesa;
  }
}