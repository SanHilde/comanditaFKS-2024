import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FacilPageRoutingModule } from './facil-routing.module';

import { FacilPage } from './facil.page';
import { TimerComponent } from '../timer/timer.component';
import { TimerModule } from '../timer/timer.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilPageRoutingModule,
    TimerModule
  ],
  declarations: [FacilPage]
})
export class FacilPageModule {}
