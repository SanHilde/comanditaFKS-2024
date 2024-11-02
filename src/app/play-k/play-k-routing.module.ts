import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayKPage } from './play-k.page';

const routes: Routes = [
  {
    path: '',
    component: PlayKPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayKPageRoutingModule {}
