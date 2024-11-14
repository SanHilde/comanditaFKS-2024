import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EncuestaSupervisorPage } from './encuesta-supervisor.page';

const routes: Routes = [
  {
    path: '',
    component: EncuestaSupervisorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EncuestaSupervisorPageRoutingModule {}
