import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss'],
  standalone:true,
  imports:[CommonModule, IonicModule,NgxSpinnerModule]
})
export class ListaClientesComponent  implements OnInit {

  @Output() itemSeleccionado = new EventEmitter<any>();
  datosTraidos: any[] = [];
  listas = ['pendientes', 'rechazados', 'aprobados']
  pendientes = [];
  rechazados = [];
  aprobados = [];


  constructor(private datosService: DatosServiceService) { }

  ngOnInit() {
    this.datosService.ObtenerDatos("usuarios").subscribe((listaUsuarios: any) => {
      this.pendientes = listaUsuarios.filter((usuario: any) => usuario.tipoUsuario === "Cliente" && usuario.aprobado=="pendiente");
      this.rechazados = listaUsuarios.filter((usuario: any) => usuario.tipoUsuario === "Cliente" && usuario.aprobado=="rechazado");
      this.aprobados = listaUsuarios.filter((usuario: any) => usuario.tipoUsuario === "Cliente" && usuario.aprobado=="aprobado");
    });
  }
  

  seleccionarFila(item: any): void {
    // this.itemSeleccionado.emit(item);
  }
  // async toggleChanged(event: any,item: any) {
  //   const isChecked = event.detail.checked;
  //   item.aprobado=isChecked;
  //   try {
  //     await this.datosService.modificarDatoAsync(item.id, "usuarios", item );
  //   } catch (error) {
  //     console.error('Error al actualizar el item en la base de datos:', error);
  //   }
  // }
  async aprobacion(orden:string, item:any){
    item.aprobado=orden;
      try {
        await this.datosService.modificarDatoAsync(item.id, "usuarios", item );
      } catch (error) {
        console.error('Error al actualizar el item en la base de datos:', error);
      }
  }
}
