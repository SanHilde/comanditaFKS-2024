import { Component, OnInit } from '@angular/core';
import { IonicModule, Platform } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone'; 
import { CommonModule } from '@angular/common';
import { ComponentsModule } from './components/components.module';
import { BirdComponent } from './components/bird/bird.component';


@Component({
  selector: 'app-play-k',
  templateUrl: './play-k.page.html',
  styleUrls: ['./play-k.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    CommonModule,
    IonicModule,
    ComponentsModule 
  ]
})
export class PlayKPage implements OnInit {

  container_height!: number; 
  container_width!: number; 
  gameStarted: boolean = false;
  gameOver: boolean = false;
  score: number = 0;
  musicActive: boolean = false;
  audio = new Audio('../../assets/music/ionic-bird-track.MP3');
  bird_height: number= 38;
  bird_width: number= 43;
  bird_position: number= 300;
  obstacle_height: number= 0;
  obstacle_width: number= 52;
  obstacle_position: number= this.container_width;
  obstacle_gap: number = 200;
  bird_interval!: ReturnType<typeof setInterval>;
  obstacle_interval!: ReturnType<typeof setInterval>;
  constructor(private platform: Platform) { }

  ngOnInit() {
    this.setContainerSize();
    this.bird_interval = setInterval(this.addGravity.bind(this), 24);
    this.obstacle_interval = setInterval(this.moveObstacle.bind(this), 24);

  }

  setContainerSize() {
    this.container_height = this.platform.height();
    this.container_width = this.platform.width();
  }
  playMusic()
  {
    this.musicActive = !this.musicActive;
    if(this.musicActive)
   {
    this.audio.play();
    this.audio.loop;

   }else {
    
    this.audio.pause();
   }	   

  }

  startGame()
  {
    this.gameStarted = true;
    this.gameOver = false;
    this.score = 0;

  }
  addGravity()
  {
    let gravity =4.5;
    if(this.gameStarted) this.bird_position+= gravity;


  } 
  jump()
  {
  if(this.gameStarted)
    {
      if(this.bird_position < this.bird_height)
      {
        this.bird_position = 0;
      }else this.bird_position -=60;

    }
       

  }
  moveObstacle()
 {
  let speed: number = 6;
  if(this.container_width<400) speed =4;

  if(this.gameStarted && this.obstacle_position >= - this.obstacle_width) this.obstacle_position -=speed; 
  else{
    this.resetObstaclePosition();
    if(this.gameStarted) this.score++;

  }
  this.checkCollision();

 } 
 resetObstaclePosition()
  {
    this.obstacle_position = this.container_width;
    this.obstacle_height = Math.floor(Math.random() * (this.container_height - this.obstacle_gap))

  }

  setGameOver()
  {
    this.gameOver=true;
    this.gameStarted=false;
    this.bird_position =300;
  }
  checkCollision(){
    let floor_collision = (this.bird_position +40 )>= this.container_height;
    let top_obstacle_collision = this.bird_position >= 0 && this.bird_position < this.obstacle_height;
    let bottom_obstacle_collision = this.bird_position >= this.container_height-
    (this.container_height - this.obstacle_gap - this.obstacle_height)- this.bird_height;

    if(floor_collision ) this.setGameOver();

    if(this.obstacle_position >= this.obstacle_width && 
      this.obstacle_position  <= this.obstacle_width +80
      && (top_obstacle_collision || bottom_obstacle_collision))
    {
      this.setGameOver();
    }

  }
}
