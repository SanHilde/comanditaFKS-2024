import { EventEmitter, Injectable } from '@angular/core';
import { FotosService } from './fotos.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { QRCode } from 'qrcode';
import { toDataURL } from 'qrcode';

export enum tipoQr {
  Atencion = 'ATENCION',
  Ingreso = 'INGRESO',
  Producto = 'PRODUCTO',
  EncuestasAnt = 'ENCUESTAANT',
  EncuestasSat = 'ENCUESTASAT',
  Encuesta = 'ENCUESTA',
  MesaUno = 'MESA1',
  MesaDos = 'MESA2',
  Menu = 'MENU',
  Juegos = 'JUEGO',
  Propina = 'PROPINA',
}

@Injectable({
  providedIn: 'root',
})
export class QrService {
  onMostrarEscanearQr: EventEmitter<boolean> = new EventEmitter();
  onMostrarModal: EventEmitter<string> = new EventEmitter();
  onConsultarEstado: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private router: Router,
    private fotos: FotosService,
    private alertController: AlertController
  ) {}

  // Genera el texto según el tipo de QR
  generarTexto(tipo: tipoQr, objeto: any) {
    switch (tipo) {
      case tipoQr.Producto:
        return tipoQr.Producto + objeto.id;
      case tipoQr.Ingreso:
        return tipoQr.Ingreso + 'Comandita FKS Ingreso';
      case tipoQr.EncuestasAnt:
        return tipoQr.EncuestasAnt + 'Comandita FKS Encuestas Antiguas';
      case tipoQr.EncuestasSat:
        return tipoQr.EncuestasSat + objeto.id;
      case tipoQr.MesaUno:
        return (
          tipoQr.MesaUno +
          objeto.numero +
          objeto.tipo +
          objeto.cantidadComensales +
          objeto.numeroRam
        );
      case tipoQr.MesaDos:
        return tipoQr.MesaDos + objeto.numero;
      case tipoQr.Menu:
        return tipoQr.Menu + 'PERTUTTOMenu';
      case tipoQr.Juegos:
        return tipoQr.Juegos + objeto.id;
      case tipoQr.Propina:
        return tipoQr.Propina + 'PERTUTTOPropina';
      default:
        return '';
    }
  }

  // Genera el código QR basado en el objeto y el tipo de QR
  generarQr(objeto: any, tipo: tipoQr) {
    return this.generarTexto(tipo, objeto);
  }

  // Procesa el QR escaneado o URL proporcionado
  leerQr(url: string = ''): Promise<string> {
    return new Promise((resolve, reject) => {
      const procesarQr = (qr: string) => {
        if (qr.includes('@')) {
          // Procesa QR como DNI (antiguo o nuevo)
          qr.startsWith('@') ? this.leerDNIOld(qr) : this.leerDNINew(qr);
        } else {
          // Sin "@", dirige a buscarAccion
          const tipo = qr
            .substring(0, qr.indexOf(' ') > -1 ? qr.indexOf(' ') : qr.length)
            .toUpperCase();
          const id = qr.substring(qr.indexOf(' ') + 1);
          this.buscarAccion(tipo, id);
        }
        resolve(qr);
      };

      // Escanea QR o procesa el URL proporcionado
      if (url === '') {
        this.fotos.scan().then(procesarQr).catch(reject);
      } else {
        procesarQr(url);
      }
    });
  }

  // Realiza una acción basada en el tipo de QR
  buscarAccion(tipo: string, id: string) {
    switch (tipo) {
      case tipoQr.Producto:
        break;
      case tipoQr.Ingreso:
        // Redirige a la pagina de ingreso
        this.router.navigate(['/ingreso']);
        break;
      case tipoQr.EncuestasAnt:
        // Navegación para encuestas antiguas
        break;
      case tipoQr.EncuestasSat:
        // Navegación para encuestas de satisfacción
        break;
      case tipoQr.MesaUno:
        // Acción para Mesa Uno
        break;
      case tipoQr.Menu:
        // Acción para Menu
        break;
      case tipoQr.Propina:
        // Acción para Propina
        break;
      default:
        console.warn('Tipo de QR no reconocido');
    }
  }

  // Lee el DNI nuevo
  leerDNINew(qr: string) {
    if (qr) {
      const infoDNI = qr.split('@');
      const dni = parseInt(infoDNI[4]);
      const apellido = infoDNI[1];
      const nombres = infoDNI[2];
      // console.log(`DNI Nuevo - Nombre: ${nombres}, Apellido: ${apellido}, DNI: ${dni}`);
      // alert(`DNI Nuevo - Nombre: ${nombres}, Apellido: ${apellido}, DNI: ${dni}`);
      let persona = {
        dni: dni,
        apellido: apellido,
        nombre: nombres,
      };
    }
  }

  // Lee el DNI antiguo
  leerDNIOld(qr: string) {
    if (qr) {
      const infoDNI = qr.split('@');
      const dni = parseInt(infoDNI[1]);
      const apellido = infoDNI[4];
      const nombres = infoDNI[5];
      let persona = {
        dni: dni,
        apellido: apellido,
        nombre: nombres,
      };

      // console.log(`DNI Antiguo - Nombre: ${nombres}, Apellido: ${apellido}, DNI: ${dni}`);
      // alert(`DNI Nuevo - Nombre: ${nombres}, Apellido: ${apellido}, DNI: ${dni}`);
    }
  }

  // Presenta una alerta en la pantalla
  async presentAlert(
    header: string,
    message: string
  ): Promise<HTMLIonAlertElement> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    return alert;
  }
  async crearImagenQr(objeto: any, tipo: tipoQr): Promise<string> {
    const textoQr = this.generarQr(objeto, tipo); // Genera el texto para el QR
    try {
      const qrDataUrl = await toDataURL(textoQr, { errorCorrectionLevel: 'H' });
      return qrDataUrl; // Retorna la URL de la imagen del QR
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      throw new Error('No se pudo generar la imagen del código QR');
    }
  }
}
