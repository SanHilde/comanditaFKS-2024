import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EncuestaSupervisorPageRoutingModule } from './encuesta-supervisor-routing.module';

import { EncuestaSupervisorPage } from './encuesta-supervisor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EncuestaSupervisorPageRoutingModule
  ],
  declarations: [EncuestaSupervisorPage]
})
export class EncuestaSupervisorPageModule {}
