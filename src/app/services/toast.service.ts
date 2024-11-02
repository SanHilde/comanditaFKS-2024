import { EventEmitter, Injectable } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastCtrl: ToastController) { }

  onMostrarQr = new EventEmitter<boolean>()

  private async presentToast(mensaje: string, color: string, icon: string, position: "bottom" | "top" | "middle" = 'bottom') {
    this.onMostrarQr.emit(false);
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      position: position,
      color: color,
      icon: icon,
      cssClass: 'miToast'
    })

    toast.onDidDismiss().then(() => {this.onMostrarQr.emit(true)})
    toast.onWillDismiss().then(() => {this.onMostrarQr.emit(true)})
    await toast.present();
  }

  async openErrorToast(mensaje: string, position: "bottom" | "top" | "middle" = 'bottom') {
    this.presentToast(mensaje, "danger", "close-circle", position)
    this.vibrar(3000);
  }

  async openSuccessToast(mensaje: string, position: "bottom" | "top" | "middle" = 'bottom') {
    this.presentToast(mensaje, "success", "checkmark-circle", position)
  }

  async openWarningToast(mensaje: string, position: "bottom" | "top" | "middle" = 'bottom') {
    this.presentToast(mensaje, "warning", "alert-circle", position)
    this.vibrar(3000);
  }

  // Función para activar la vibración
  async vibrar(milisec: number) {
    try {
      await Haptics.vibrate({ duration: milisec });
    } catch (error) {
      console.error('Error al activar la vibración:', error);
    }
  }
}
