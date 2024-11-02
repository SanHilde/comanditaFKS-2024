import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BirdComponent } from './bird/bird.component';
import { ObstacleComponent } from './obstacle/obstacle.component';

@NgModule({
  declarations: [BirdComponent, ObstacleComponent],
  exports: [BirdComponent, ObstacleComponent],
  imports: [CommonModule]
})
export class ComponentsModule {}
