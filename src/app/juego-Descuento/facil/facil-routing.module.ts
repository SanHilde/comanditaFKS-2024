import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacilPage } from './facil.page';

const routes: Routes = [
  {
    path: '',
    component: FacilPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilPageRoutingModule {}
