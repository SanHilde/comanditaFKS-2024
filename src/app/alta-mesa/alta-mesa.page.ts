import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { QrService, tipoQr } from '../services/qr.service'; 
import { Mesa } from "../interfaces/mesa.interface";
import { FotosService } from '../services/fotos.service'; // Importa FotoService
import { DatosServiceService } from '../services/datos/datos-service.service';
import Swal from 'sweetalert2';
import { ToastService } from '../services/toast.service'; 

@Component({
  selector: 'app-alta-mesa',
  templateUrl: './alta-mesa.page.html',
  styleUrls: ['./alta-mesa.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule]
})
export class AltaMesaPage implements OnInit {
  mesaForm: FormGroup;
  codigoQR: string | null = null; 
  fotoUrl: string | null = null; // Para almacenar la URL de la foto

  constructor(
    private fb: FormBuilder,
    private qrService: QrService,
    private fotoService: FotosService, // Inyecta FotoService
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

  ngOnInit() {}

  async tomarFoto() {
    try {
      this.fotoUrl = await this.fotoService.guardarFoto(); // Captura la foto y almacena la URL
      if (this.fotoUrl) {
        this.mesaForm.patchValue({ fotoQR: this.fotoUrl });
      }
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      alert('No se pudo capturar la foto');
    }
  }

  onSubmit() {
    if (this.mesaForm.valid) {
      const mesaData = this.mesaForm.value;
      const mesaDataQR: Mesa = {
        numero: mesaData.numero,
        cantidadComensales: mesaData.cantidadComensales,
        tipo: mesaData.tipo,
        fechaCreacion: new Date(mesaData.fechaCreacion),
        fotoUrl: this.fotoUrl,
        codigoQR: '',
        estado: 'Disponible',
        asignadaPor: 'Admin'
      };

      this.qrService.crearImagenQr(mesaDataQR, tipoQr.MesaUno)
        .then(qrImageUrl => {
          this.codigoQR = qrImageUrl;
          mesaDataQR.codigoQR = this.codigoQR;

          return this.datosServices.guardarDatos("Mesa", mesaDataQR);
        })
        .then(() => {
          // Muestra un toast de éxito
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
    this.fotoUrl = ''; // Limpia la URL de la foto, si es necesario
  }
  

}
