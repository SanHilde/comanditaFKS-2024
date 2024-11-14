import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { QrService, tipoQr } from '../services/qr.service';
import { Mesa } from "../interfaces/mesa.interface";
import { DatosServiceService } from '../services/datos/datos-service.service';
import { ToastService } from '../services/toast.service';
import { FotosService } from '../services/fotos.service';

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class AltaMesaPage {
  mesaForm: FormGroup;
  codigoQR: string | null = null;
  fotoUrl: string | null = null; // Para almacenar la URL de la foto
  fotoUrl2: string | null = null; // Para almacenar la URL de la foto

  constructor(
    private fb: FormBuilder,
    private qrService: QrService,
    private fotoService: FotosService, // Inyecta FotosService
    private datosServices: DatosServiceService,
    private toastService: ToastService
  ) {
    this.mesaForm = this.fb.group({
      numero: ['', Validators.required],
      cantidadComensales: ['', Validators.required],
      tipo: ['', Validators.required],
      fechaCreacion: [new Date().toISOString().substring(0, 10)],
    });

    this.mesaForm.get('numero')?.valueChanges.subscribe(value => {
      this.codigoQR = null;
    });
  }

 // Método para capturar la foto
async tomarFoto() {
  try {
    // Llamar al servicio para capturar la foto
    this.fotoUrl = await this.fotoService.guardarFoto(); // Guarda la foto y obtiene la URL

    if (this.fotoUrl) {
      // Generar un nombre único para la foto, por ejemplo usando el número de la mesa
      const nombreImagen = `foto_mesa_${this.mesaForm.value.numero}_${new Date().getTime()}.png`;
      
      // Subir la imagen a Firebase Storage
      this.fotoUrl2 = await this.datosServices.subirImagenAsync2('mesas', nombreImagen, this.fotoUrl);
      
      // Actualizar la URL de la foto en el formulario
      this.mesaForm.patchValue({ fotoQR:  this.fotoUrl });
    }
  } catch (error) {
    console.error('Error al capturar la foto:', error);
    alert('No se pudo capturar la foto');
  }
}


  // Método para manejar el envío del formulario
  onSubmit() {
    const numero = Math.floor(Math.random() * 1000) + 1; // Genera un número aleatorio para la mesa
    if (this.mesaForm.valid) {
      const mesaData = this.mesaForm.value;
      const mesaDataQR: Mesa = {
        numero: mesaData.numero,
        cantidadComensales: mesaData.cantidadComensales,
        tipo: mesaData.tipo,
        fechaCreacion: new Date(mesaData.fechaCreacion),
        fotoUrl: this.fotoUrl2, // Agrega la URL de la foto al objeto de la mesa
        codigoQR: '',
        estado: 'Disponible',
        asignadaPor: 'Admin',
        id: "",
        idCliente: "",
        numeroRam: numero,
        qrid: "MESA1" + mesaData.numero + mesaData.tipo + mesaData.cantidadComensales + numero,
      };

      // Genera el código QR para la mesa
      this.qrService.crearImagenQr(mesaDataQR, tipoQr.MesaUno)
        .then(qrImageUrl => {
          this.codigoQR = qrImageUrl; // Almacena la URL del código QR
          mesaDataQR.codigoQR = this.codigoQR; // Asocia el código QR a los datos de la mesa

          return this.datosServices.guardarDatos("Mesa", mesaDataQR); // Guarda los datos de la mesa en la base de datos
        })
        .then(() => {
          // Muestra un mensaje de éxito al guardar la mesa
          this.toastService.openSuccessToast('Mesa guardada con éxito.');
          
          // Espera 5 segundos antes de limpiar el formulario
          setTimeout(() => {
            this.limpiarFormulario();
          }, 5000);
        })
        .catch(error => {
          console.error('Error al generar el código QR o guardar los datos:', error);
          this.toastService.openErrorToast('No se pudo generar el código QR o guardar la mesa');
        });
    } else {
      this.toastService.openWarningToast('Por favor, complete todos los campos del formulario.');
    }
  }

  // Método para limpiar el formulario
  limpiarFormulario() {
    this.mesaForm.patchValue({
      numero: '',
      cantidadComensales: '',
      tipo: '',
    });
    this.codigoQR = ''; // Limpia el código QR
    this.fotoUrl = ''; // Limpia la URL de la foto
  }
}
