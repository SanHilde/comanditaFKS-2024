import { Injectable } from '@angular/core';
import { Score } from '../models/score';
import { AuthService } from './auth.service';
import { CollectionsService } from './collections.service';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {

  collectionName:string = 'scores';
  constructor(private collections:CollectionsService,private auth:AuthService) { }

  add(score: Score) {
    if (this.auth.usuarioLogeado) {
      score.email = this.auth.usuarioLogeado.correo as string;
      this.collections.addOne(this.collectionName, score);
    }
  }
   
  get(dificultad:string){
    return this.collections.getAllWhereTop<Score>(this.collectionName,'dificultad',dificultad,5,'score');
  
  }

}
