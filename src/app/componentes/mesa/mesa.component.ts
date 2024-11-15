import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,NgxSpinnerModule]
})
export class MesaComponent  implements OnInit {
  estadoActual=1;
  idMesa: string | null="";
  pedido!:Ventas;
  mesa!:Mesa
  huboCambio:boolean=false;

  constructor(private router: Router, private datosService: DatosServiceService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.idMesa = params.get('idMesa');
    });
    if(this.idMesa!="" ){
      this.datosService.ObtenerDatos("Mesa").subscribe((listaDeMesas:any)=>{
        listaDeMesas.forEach((mesaIndividual: Mesa) => {
          if(this.idMesa!=null && mesaIndividual.numero ==  parseInt(this.idMesa)){
            this.mesa=mesaIndividual;
            if(this.mesa.pedido){
              this.datosService.ObtenerDatos("Ventas").subscribe((listaDeVentas:any)=>{
                listaDeVentas.forEach((ventaIndividual:Ventas) => {
                  if(ventaIndividual.id==this.mesa.pedido)
                    this.pedido=ventaIndividual;
                });
              })
            }
          }
        });

      })
    } 
  }

  navegarA(ruta:string){
    switch(ruta){
      case "menu":
        // this.router.navigate(['/menu']);
      break;
      case "pedir":
        // this.router.navigate(['/menu']);
      break;
      case "chat":
        this.router.navigate(['/chat', this.mesa.numero]);
      break;
      case "estadoPedido":
        // this.router.navigate(['/menu']);
      break;
      case "completarEncuesta":
        this.router.navigate(['/encuestasClientes',this.pedido.id]);
      break;
      case "juegos":
        // this.router.navigate(['/menu']);
      break;
      case "resultadosEncuestas":
        this.router.navigate(['/resultadosEncuestas']);
      break;
      case "confirmarRecepcion":
        this.pedido.confirmarRecepcion=true;
        this.huboCambio = true;
      break;
      case "pedirCuenta":
        this.router.navigate(['/detalle', this.pedido.id]);
      break;
    }
    this.analizarEstadoActual();
  }
  async analizarEstadoActual(){

    this.estadoActual=1;
    if(this.idMesa!=""){
      if(this.pedido.validacionMozo){
        this.estadoActual++;
      }
      if(this.pedido.confirmarRecepcion){
        this.estadoActual++;
      }
      if(this.pedido.completoEncuesta){
        this.estadoActual++;
      }
      if(this.huboCambio){
        await this.datosService.guardarDatos("Ventas",this.pedido);
      }
    }
    }

}
