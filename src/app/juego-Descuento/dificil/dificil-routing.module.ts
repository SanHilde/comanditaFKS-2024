import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DificilPage } from './dificil.page';

const routes: Routes = [
  {
    path: '',
    component: DificilPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DificilPageRoutingModule {}
