import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EstadoDelPedidoPage } from './estado-del-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: EstadoDelPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstadoDelPedidoPageRoutingModule {}
