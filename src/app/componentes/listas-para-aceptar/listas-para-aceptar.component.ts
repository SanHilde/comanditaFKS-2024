import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { ListaDeEsperaService } from 'src/app/services/lista-de-espera.service';

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
  subtitulo!:string;
  constructor(  private route: ActivatedRoute, private datosService: DatosServiceService, private spinner: NgxSpinnerService,private listaDeEsperaService: ListaDeEsperaService) { }

  ngOnInit() {
    this.spinner.show();
    this.route.paramMap.subscribe((params) => {
      this.tipoTraido = params.get('tipoLista');
    });
    // this.tipoTraido="usuarios";
    if(this.tipoTraido!=null){
      let lista = this.tipoTraido;
      if(this.tipoTraido=="pagos" || this.tipoTraido=="Ventas"){
        lista = "Ventas";
      }
      this.datosService.ObtenerDatos(lista).subscribe((listasDeTipoTraido:any)=>{
        console.log(listasDeTipoTraido)
        switch(this.tipoTraido){
          case "pagos":
            this.subtitulo = "Confirmar pago:";
            this.listaDeObjetos=listasDeTipoTraido.filter((pedido:any) => {pedido.pago==false});
            break;
          case "pedidos":
            this.listaDeObjetos=listasDeTipoTraido.filter((pedido:any) => {pedido.confirmado==false});
            this.subtitulo = "Confirmar pedido:";
          break;
          default:
            this.subtitulo="Confirmar";
            this.listaDeObjetos = listasDeTipoTraido;
        }
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
      try {
        if(this.tipoTraido!=null){
          if(this.tipoTraido=="pagos"){
            item.pago=true;
            let mesa = item.mesa;
            // await this.datosService.modificarDatoAsync(this.pedido.id,"Ventas",this.pedido);
            let listaDeMesas = await this.datosService.ObtenerDatosAsync("Mesa");
            let mesaBuscada = listaDeMesas.find((mesaIndividual: any) => mesa.numero === mesaIndividual.numero);
            mesaBuscada.estado = "Disponible";
            await this.datosService.modificarDatoAsync(item.id, this.tipoTraido, item );
          }
          if(this.tipoTraido=="pedidos"){
            item.estado="Aprobado para cocina";//????
            await this.datosService.modificarDatoAsync(item.id, this.tipoTraido, item );
          }
          // await this.datosService.modificarDatoAsync(item.id, this.tipoTraido, item );
        }

      } catch (error) {
        console.error('Error al actualizar el item en la base de datos:', error);
      }
  }

}
