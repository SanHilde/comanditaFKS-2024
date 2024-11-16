import { CommonModule } from '@angular/common';
import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService, Spinner } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { DatosVinculadosService } from 'src/app/services/datos-vinculados.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,NgxSpinnerModule]
})
export class MesaComponent  implements OnInit, OnChanges {
  estadoActual=1;
  idMesa: string | null="";
  pedido!:Ventas;
  mesa!:Mesa
  huboCambio:boolean=false;
  suscripcionAVenta=false;
  listaDeVentas:any=false;
  

  constructor(private datosVinculados: DatosVinculadosService,private router: Router, private datosService: DatosServiceService, private route: ActivatedRoute, private spinner: NgxSpinnerService) { }

   ngOnInit() {
    this.spinner.show();
    this.route.paramMap.subscribe((params) => {
      this.idMesa = params.get('idMesa');
    });
    this.datosVinculados.suscribirseADatos
    // this.traerDatosMesa();
    if(this.idMesa!="" ){
      this.datosService.ObtenerDatos("Mesa").subscribe((listaDeMesas:any)=>{
        listaDeMesas.forEach((mesaIndividual: Mesa) => {
          if(this.idMesa!=null && mesaIndividual.numero ==  this.idMesa){
            this.mesa=mesaIndividual;
            this.analizarEstadoActual();
            this.spinner.hide();
            // if(this.mesa.pedido){
            if(!this.suscripcionAVenta && this.mesa.pedido){
              this.suscripcionAVenta= true;
              this.datosService.ObtenerDatos("Ventas").subscribe((listaDeVentas:any)=>{
                listaDeVentas.forEach((ventaIndividual:Ventas) => {
                  if(ventaIndividual.id==this.mesa.pedido){
                    this.pedido=ventaIndividual;
                    this.analizarEstadoActual();
                  }                 
                });
              })
            }
          }
       });
     })
    } 
   }
//   async traerDatos(){
//     if(this.idMesa){
//       this.mesa=await this.datosVinculados.traerDatosMesa(this.idMesa);
//       this.pedido= this.datosVinculados.getPedido();
//       console.log(this.mesa)
//       console.log(this.pedido)
//       this.spinner.hide();
//     }
    
//   }
//   async traerDatosMesa(){
//     let listaDeMesas = await this.datosService.ObtenerDatosAsync("Mesa");
//     console.log(listaDeMesas)
//     listaDeMesas.forEach((mesaIdividual:Mesa) => {
//          if(mesaIdividual.numero==this.idMesa){
//             this.mesa=mesaIdividual;
//     };
//   })
//   if(this.mesa){
//     this.spinner.hide();
//     // this.suscribirAPedido();
//     this.buscarPedido();
//   }
// }

//  async buscarPedido(){
//     if(this.mesa.pedido){
//       let listaDePedidos = await this.datosService.ObtenerDatosAsync("Ventas");
//       console.log(listaDePedidos)
//       listaDePedidos.forEach((pedidoIndividual:Ventas) => {
        
//            if(this.mesa.pedido==pedidoIndividual.id){
//             console.log("entre")
//             this.pedido=pedidoIndividual;
//             // this.analizarEstadoActual();
//       };
//     })
//     }
//   }
//   suscribirAPedido(){
//     if(this.mesa.pedido){
//       this.datosService.ObtenerDatos("Ventas").subscribe((listaDeVentasTraida:any)=>{
//         this.listaDeVentas=listaDeVentasTraida;
        
//         let contador=0;
//         this.listaDeVentas.forEach((ventaIndividual:Ventas) => {
//           if(ventaIndividual.id==this.mesa.pedido){
//             this.pedido=ventaIndividual;
//             this.analizarEstadoActual();
//             contador++;
//             console.log(contador);
//             console.log("venta individual id:"+ ventaIndividual.id)
//             console.log("mesa pedido:"+ this.mesa.pedido)
//           }
//         });
//       });
//     }

//   }


  ngOnChanges(){
    // this.analizarEstadoActual(); 
    

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
        this.router.navigate(['/encuestasClientes',this.idMesa]);
      break;
      case "juegos":
        // this.router.navigate(['/menu']);
      break;
      case "resultadosEncuestas":
        this.router.navigate(['/resultadosEncuestas',this.idMesa]);
      break;
      case "confirmarRecepcion":
        this.pedido.confirmarRecepcion=true;
        this.huboCambio = true;
        this.analizarEstadoActual();
      break;
      case "pedirCuenta":
        this.router.navigate(['/detalle', this.idMesa]);
      break;
    }
    // console.log(this.mesa);
    // console.log(this.pedido);
  }
  async analizarEstadoActual(){

    this.estadoActual=1;
    if(this.idMesa!="" && this.pedido){
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
        
         await this.datosService.modificarDatoAsync(this.pedido.id,"Ventas",this.pedido);
         this.huboCambio=false;
        //  if(pedidoGuardado){
          console.log("se guardaron los datos correctamente")
        //  }
      
      }
    }
    }

}
