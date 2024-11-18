import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Timestamp } from 'firebase/firestore';
import { Subscription } from 'rxjs';
import { TimerComponent } from '../timer/timer.component';
import { Score } from 'src/app/models/score';
import { Tarjeta } from 'src/app/models/tarjeta';
import { ScoresService } from 'src/app/services/scores.service';


@Component({
  selector: 'app-dificil',
  templateUrl: './dificil.page.html',
  styleUrls: ['./dificil.page.scss'],
})
export class DificilPage implements OnInit {

  tarjeta!: Tarjeta
  botonesBloqueados: boolean = false;

  itemsSeleccionados: Tarjeta[] = []
  itemsEncontrados: Tarjeta[] = []
  itemsError: Tarjeta[] = [];

  constructor(private alertController: AlertController, private scoresService: ScoresService) { }

  shuffle(array: Array<Tarjeta>) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  public alertButtons = [
    {
      text: 'Reiniciar',
      cssClass: 'alert-button-cancel',
    },
    {
      text: 'Siguiente nivel',
      cssClass: 'alert-button-confirm',
    },
  ];

  tarjetas: Tarjeta[] = []
  private timerSubscription!: Subscription;
  @ViewChild(TimerComponent) timerComponent!: TimerComponent;



  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }


  ngOnInit() {
    this.tarjetas = [...Array(8)].map((_, i) => new Tarjeta(i + 1, ''))
    this.tarjetas.push(...[...Array(8)].map((_, i) => new Tarjeta(i + 1, '')))

    this.shuffle(this.tarjetas)
  }


  seleccionarItem(item: Tarjeta) {
    if (this.botonesBloqueados)
      return
    this.botonesBloqueados = true;


    if (this.itemsSeleccionados.length == 0 && this.itemsEncontrados.length == 0) {
      this.timerComponent.resetTimer();
      this.timerComponent.startTimer();
    }
    if(this.itemsSeleccionados.includes(item)){
      this.itemsSeleccionados
    }
    this.itemsSeleccionados.push(item)

    if (this.itemsSeleccionados.length == 2) {
      if (this.itemsSeleccionados[0].valor == this.itemsSeleccionados[1].valor) {

        setTimeout(() => {
          this.itemsEncontrados.push(...this.itemsSeleccionados)
          this.itemsSeleccionados = []
          if (this.itemsEncontrados.length == this.tarjetas.length) {
            this.onWin();
            console.log('win');
          }
          this.botonesBloqueados = false;
        }, 100)

      } else {
        this.itemsError.push(...this.itemsSeleccionados)
        setTimeout(() => {
          this.itemsSeleccionados = []
          this.itemsError = []
          this.botonesBloqueados = false;
        }, 700)
      }
    }else{
      this.botonesBloqueados = false;
    }


    console.log('seleccionados', this.itemsSeleccionados)
    console.log('encontrados', this.itemsEncontrados)
  }

  itemSeleccionado(item: Tarjeta) {
    return this.itemsSeleccionados.includes(item)
  }

  itemEncontrado(item: Tarjeta) {
    return this.itemsEncontrados.includes(item)
  }

  itemError(item: Tarjeta) {
    return this.itemsError.includes(item)
  }

  async onWin() {

    let tiempo = this.timerComponent.stopTimer();

    const alert = await this.alertController.create({
      header: '¡Felicitaciones!',
      subHeader: 'Ganaste en ' + this.timerComponent.totalSeconds + ' segundos!',
      buttons: [{
        text: 'Reiniciar',
        cssClass: 'alert-button-ok',
        handler: () => {
          this.subirScore(tiempo);
          this.reiniciar();
        }
      }
      ],
    });

    await alert.present();
  }


  reiniciar() {
    this.itemsEncontrados = []
    this.itemsError = []
    this.itemsSeleccionados = []
    this.botonesBloqueados = false
    this.timerComponent.resetTimer();
    this.shuffle(this.tarjetas)
  }

  subirScore(tiempo: number) {
    let score = new Score('', '', tiempo, 'dificil', Timestamp.now())
    this.scoresService.add(score)
  }
}
