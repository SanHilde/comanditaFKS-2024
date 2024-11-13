import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-listas-para-aceptar',
  templateUrl: './listas-para-aceptar.component.html',
  styleUrls: ['./listas-para-aceptar.component.scss'],
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule, NgxSpinnerModule],

})
export class ListasParaAceptarComponent  implements OnInit {
  tipoTraido: string | null = null;
  listaDeObjetos=[];
  constructor(  private route: ActivatedRoute, private datosService: DatosServiceService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.route.paramMap.subscribe((params) => {
      this.tipoTraido = params.get('tipoLista');
    });
    if(this.tipoTraido!=null){
      this.datosService.ObtenerDatos(this.tipoTraido).subscribe((listasDeTipoTraido:any)=>{
      this.listaDeObjetos = listasDeTipoTraido;
      this.spinner.hide();
      })
    } else{
    this.spinner.hide();

    }
  }
  seleccionarFila(item: any): void {
    // this.itemSeleccionado.emit(item);
  }

  async aprobacion(orden:string, item:any){
    item.aprobado=orden;
    console.log(item);
      try {
        if(this.tipoTraido!=null){
          // await this.datosService.modificarDatoAsync(item.id, this.tipoTraido, item );
        }

      } catch (error) {
        console.error('Error al actualizar el item en la base de datos:', error);
      }
  }

}
