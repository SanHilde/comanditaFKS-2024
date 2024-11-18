import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MedioPage } from './medio.page';

const routes: Routes = [
  {
    path: '',
    component: MedioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MedioPageRoutingModule {}
