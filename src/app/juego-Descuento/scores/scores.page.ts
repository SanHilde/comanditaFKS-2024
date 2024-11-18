import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Score } from 'src/app/models/score';
import { ScoresService } from 'src/app/services/scores.service';
import { InterceptorService } from '../../services/interceptor.service';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.page.html',
  styleUrls: ['./scores.page.scss'],
})
export class ScoresPage implements OnInit {

  constructor(private scores:ScoresService,private interceptor:InterceptorService,private router:Router) { }
  scoresArr:Score[] = []
  dificultad:string = "facil"

  ngOnInit() {
    
    this.buscar(this.dificultad);
  }

  buscar(dificultad:string){
    this.dificultad = dificultad;
    this.interceptor.updateOverlayState(true)
    this.scores.get(dificultad).then(scores =>{
      this.scoresArr = scores;
      this.interceptor.updateOverlayState(false)
    })
  }
   

  irAJugar(dificultad:string)
  {    
    this.router.navigateByUrl(dificultad)
  }
}
