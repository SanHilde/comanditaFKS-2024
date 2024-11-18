import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MenuJuegoPage } from './menu-juego.page';

const routes: Routes = [
  {
    path: '',
    component: MenuJuegoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuJuegoPageRoutingModule {}
