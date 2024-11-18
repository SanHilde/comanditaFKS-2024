import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TimerComponent } from './timer.component';



@NgModule({
  declarations: [
    TimerComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [TimerComponent]
})
export class TimerModule { }