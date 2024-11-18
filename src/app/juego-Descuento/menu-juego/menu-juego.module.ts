import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuJuegoPageRoutingModule } from './menu-juego-routing.module';

import { MenuJuegoPage } from './menu-juego.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuJuegoPageRoutingModule
  ],
  declarations: [MenuJuegoPage]
})
export class MenuJuegoPageModule {}
