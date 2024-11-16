import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Mesa } from 'src/app/interfaces/mesa.interface';
import { Producto } from 'src/app/interfaces/producto.interface';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { DatosVinculadosService } from 'src/app/services/datos-vinculados.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';

@Component({
  selector: 'app-detalle-de-cuenta',
  templateUrl: './detalle-de-cuenta.component.html',
  styleUrls: ['./detalle-de-cuenta.component.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,NgxSpinnerModule]
})
export class DetalleDeCuentaComponent  implements OnInit {
  
  // @Input() pedidoTraido!:any;
  public idMesa!:string | null;
  public descuentoTraido=10;
  public propinaTraida=15;
  public totalTraido=0;
  public totalFinal=0;
  public detalleArmado!:any;
  public descuentoCalculado=0;
  public propinaCalculada=0;
  public propina!: string | null;
  // public productosPedidos: any[] = [];
  public productosPedidos: any=false;
  public mesa:Mesa | false = false;
  public pedido!:Ventas;

  constructor(private router:Router,public spinner: NgxSpinnerService, private route: ActivatedRoute, private datosVinculados: DatosVinculadosService, private datosService: DatosServiceService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.idMesa = params.get('idMesa');
      this.propina = params.get('porcentajePropina');
      if(this.propina){
        this.propinaTraida = parseInt(this.propina);
        console.log(this.propinaTraida)
      }
    });

    // this.productosPedidos=[
    //   { nombre:"coca",
    //     precio: "50",
    //     cantidad: 2,
    //   },
    //   {nombre:"hamburguesa",
    //     precio: "75",
    //     cantidad: 2
    //   }
    // ];
    this.pedirDatos();

    // console.log(this.productosPedidos)
   

  }

  async pedirDatos() {
    try {
      if (this.idMesa) {
        this.mesa = await this.datosVinculados.traerDatosMesa(this.idMesa);  
          if (this.mesa) {
            this.pedido =await this.datosVinculados.buscarPedido();
        }
      if (this.pedido ) {
        this.productosPedidos = [...this.pedido.productosSeleccionados];
      }
      this.actualizarDatos();
      }
    } catch (error) {
      console.error("Error al pedir datos:", error);
    }
  }

  actualizarDatos(){
    if(this.productosPedidos.length>0){
      console.log("entre a la lista")
      this.productosPedidos.forEach((productoIndividual:Producto) => {
        if(!productoIndividual.cantidad){
          productoIndividual.cantidad=1;
        } 
        this.totalTraido= this.totalTraido+ productoIndividual.precio*productoIndividual.cantidad;
        
      });
      this.descuentoCalculado = this.totalTraido * (this.descuentoTraido/100);
      this.totalFinal =this.totalTraido- this.descuentoCalculado;
      this.propinaCalculada = this.totalFinal * (this.propinaTraida/100);
      
      this.totalFinal=this.totalFinal+this.propinaCalculada;
  
       this.detalleArmado={
        pedido:this.productosPedidos,
        descuento:this.descuentoTraido,
        propina:this.propinaTraida,
        total:this.totalTraido,
        totalFinal:this.totalFinal,
      }
    } else{
      console.log("no entre a la lista")
    }
  }
  
  async pagar(){
    //cambiar estado de pago
    this.pedido.pago=true;
    // await this.datosService.modificarDatoAsync(this.pedido.id,"Ventas",this.pedido);
    this.router.navigate(['/mesa', this.idMesa]);

  }



}
