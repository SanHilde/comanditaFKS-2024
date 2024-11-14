import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-detalle-de-cuenta',
  templateUrl: './detalle-de-cuenta.component.html',
  styleUrls: ['./detalle-de-cuenta.component.scss'],
  standalone:true,
  imports:[CommonModule,IonicModule,NgxSpinnerModule]
})
export class DetalleDeCuentaComponent  implements OnInit {
  
  // @Input() pedidoTraido!:any;
  public idPedido!:string | null;
  public productosPedidos!:any;
  public descuentoTraido=10;
  public propinaTraida=15;
  public totalTraido=0;
  public totalFinal=0;
  public detalleArmado!:any;
  public descuentoCalculado=0;
  public propina=0;

  constructor(private router:Router,public spinner: NgxSpinnerService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.idPedido = params.get('idPedido');
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
    this.productosPedidos.forEach((productoIndividual:any) => {
      this.totalTraido= this.totalTraido+ productoIndividual.precio*productoIndividual.cantidad
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
  pagar(){
    //cambiar estado de pago
    this.router.navigate(['/home']);

  }



}
