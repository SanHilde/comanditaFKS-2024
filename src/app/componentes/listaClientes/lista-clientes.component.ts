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

  constructor(private datosService: DatosServiceService) { }

  ngOnInit() {
    this.datosService.ObtenerDatos("usuarios").subscribe((listaUsuarios: any) => {
      this.datosTraidos = listaUsuarios
        .filter((usuario: any) => usuario.tipoUsuario === "Cliente" && usuario.aprobado=="pendiente")
        .sort((a: any, b: any) => {
          // Primero ordena por aprobación
          if (a.aprobado !== b.aprobado) {
            return Number(a.aprobado) - Number(b.aprobado);
          }
          // Si tienen el mismo estado de aprobación, ordena por nombre
          return a.nombre.localeCompare(b.nombre);
        });
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
