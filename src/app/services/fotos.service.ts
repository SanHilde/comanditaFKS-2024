import { Injectable } from '@angular/core';
import {
  BarcodeScanner
} from '@capacitor-mlkit/barcode-scanning';
import {Camera, CameraPhoto, CameraResultType,CameraSource,Photo} from '@capacitor/camera';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FotosService {
  isSupported: boolean = false;

  constructor(private alertController: AlertController) {

    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
    });
    BarcodeScanner.installGoogleBarcodeScannerModule();

  }
  async scan(): Promise<string> {
    try {
      const { barcodes } = await BarcodeScanner.scan();
  
      // Verificamos que el array de barcodes no esté vacío y que el primer elemento tenga un rawValue
      if (barcodes.length > 0 && barcodes[0].rawValue) {
        const qrData = barcodes[0].rawValue;
        //alert(`Código escaneado: ${qrData}`);
        return qrData;
      } else {
        alert('No se detectó un valor válido en el QR.');
        return '';
      }
    } catch (error) {
      console.error('Error al escanear:', error);
      alert('Error al escanear, intenta de nuevo.');
      return '';
    }
  }
  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }
  async test(barcode: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Bueno',
      message: barcode,
      buttons: ['OK'],
    });
    await alert.present();
  }
  public async guardarFoto(): Promise<string | null> {
    try {
      const fotoCapturada = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
      });
  
      return fotoCapturada.webPath || null;  // Devuelve la URL de visualización de la foto
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      return null;
    }
  }
  async takePhoto() {
    return await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 60
    })
  }

}
