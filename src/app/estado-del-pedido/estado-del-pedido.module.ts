import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EstadoDelPedidoPageRoutingModule } from './estado-del-pedido-routing.module';

import { EstadoDelPedidoPage } from './estado-del-pedido.page';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EstadoDelPedidoPageRoutingModule,
    NgxSpinnerModule
  ],
  declarations: [EstadoDelPedidoPage]
})
export class EstadoDelPedidoPageModule {}
