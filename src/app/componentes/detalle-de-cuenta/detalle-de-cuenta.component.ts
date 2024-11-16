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
  public productosPedidos!:any;
  public descuentoTraido=10;
  public propinaTraida=15;
  public totalTraido=0;
  public totalFinal=0;
  public detalleArmado!:any;
  public descuentoCalculado=0;
  public propina=0;
  public mesa:Mesa | false = false;
  public pedido!:Ventas;

  constructor(private router:Router,public spinner: NgxSpinnerService, private route: ActivatedRoute, private datosVinculados: DatosVinculadosService, private datosService: DatosServiceService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.idMesa = params.get('idMesa');
    });

    this.productosPedidos=[
      { nombre:"coca",
        precio: "50",
        cantidad: 2,
      },
      {nombre:"hamburguesa",
        precio: "75",
        cantidad: 2
      }
    ];
    this.pedirDatos();

    this.productosPedidos.forEach((productoIndividual:Producto) => {
      this.totalTraido= this.totalTraido+ productoIndividual.precio
      // productoIndividual.foto= productoIndividual.fotos[]
    });
    this.descuentoCalculado = this.totalTraido * (this.descuentoTraido/100);
    this.totalFinal =this.totalTraido- this.descuentoCalculado;
    this.propina = this.totalFinal * (this.propinaTraida/100);

    this.totalFinal=this.totalFinal+this.propina;

     this.detalleArmado={
      pedido:this.productosPedidos,
      descuento:this.descuentoTraido,
      propina:this.propinaTraida,
      total:this.totalTraido,
      totalFinal:this.totalFinal,
    }

  }
  async pedirDatos(){
    if(this.idMesa){
      this.mesa = await this.datosVinculados.traerDatosMesa(this.idMesa);
    }
    if(this.mesa){
      this.pedido= this.datosVinculados.getPedido();
    }
    console.log(this.pedido.productosSeleccionados)
    if(this.pedido){
      this.pedido.productosSeleccionados.forEach(productoIndividual => {
        this.productosPedidos.push(productoIndividual)
      });
      // this.productosPedidos=this.pedido.productosSeleccionados;
      console.log("entre")
    }
    console.log(this.mesa);
    console.log(this.pedido);
  }
  async pagar(){
    //cambiar estado de pago
    // this.pedido.pago=true;
    // await this.datosService.modificarDatoAsync(this.pedido.id,"Ventas",this.pedido);
    this.router.navigate(['/mesa', this.idMesa]);

  }



}
