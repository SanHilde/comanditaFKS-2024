import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QrService, tipoQr } from '../../../services/qr.service';
import { FotosService } from '../../../services/fotos.service';
import { DatosServiceService } from '../../../services/datos/datos-service.service';
import { ToastService } from '../../../services/toast.service';
import Swal from 'sweetalert2';
import { Producto } from '../../../interfaces/producto.interface';

@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.page.html',
  styleUrls: ['./alta-producto.page.scss'],
})
export class AltaProductoPage implements OnInit {
  productoForm: FormGroup;
  codigoQR: string | null = null;
  fotos: string[] = []; // Almacena las URLs de las fotos del producto

  constructor(
    private fb: FormBuilder,
    private qrService: QrService,
    private fotoService: FotosService,
    private datosService: DatosServiceService,
    private toastService: ToastService
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tiempoElaboracion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
    });
  }

  ngOnInit() {}

  async tomarFoto() {
    if (this.fotos.length < 3) { // Limita a 3 fotos
      try {
        const fotoUrl = await this.fotoService.guardarFoto();
        if (fotoUrl) {
          this.fotos.push(fotoUrl); // Almacena la URL de la foto
        }
      } catch (error) {
        console.error('Error al capturar la foto:', error);
        this.toastService.openErrorToast('No se pudo capturar la foto');
      }
    } else {
      this.toastService.openWarningToast('Solo se pueden cargar 3 fotos');
    }
  }

  onSubmit() {
    if (this.productoForm.valid) {
      const productoData = this.productoForm.value;
      const productoDataQR: Producto = {
        id: '', // Se generará al guardar en la base de datos
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        tiempoElaboracion: productoData.tiempoElaboracion,
        precio: productoData.precio,
        fotos: this.fotos, // Guarda las URLs de las fotos
        codigoQR: '',
        categoria: productoData.categoria,
        creadoPor: 'Admin', // O el usuario que crea el producto
        cantidad:0 //AGREGUE CANTIDAD
      };

      this.qrService.crearImagenQr(productoDataQR, tipoQr.Producto)
        .then(qrImageUrl => {
          this.codigoQR = qrImageUrl;
          productoDataQR.codigoQR = this.codigoQR;

          // Subir todas las fotos a Firebase Storage
          const uploadPromises = this.fotos.map((fotoUrl, index) => {
            const nombreImagen = `producto_${productoDataQR.nombre}_${new Date().getTime()}_${index}.jpg`;
            return this.datosService.subirImagenAsync2('productos', nombreImagen, fotoUrl);
          });

          return Promise.all(uploadPromises).then(uploadedUrls => {
            // Una vez que todas las fotos se han subido, actualizamos las URLs en el producto
            productoDataQR.fotos = uploadedUrls;

            // Guardamos los datos del producto en la base de datos
            return this.datosService.guardarDatos("Producto", productoDataQR);
          });
        })
        .then(() => {
          this.toastService.openSuccessToast('Producto guardado con éxito.');
          
          // Limpia el formulario y las fotos después de 5 segundos
          setTimeout(() => {
            this.limpiarFormulario();
          }, 5000);
        })
        .catch(error => {
          console.error('Error al generar el código QR o guardar el producto:', error);
          this.toastService.openErrorToast('No se pudo generar el código QR o guardar el producto');
        });
    } else {
      this.toastService.openWarningToast('Por favor, complete todos los campos del formulario.');
    }
  }

  // Método para limpiar el formulario
  limpiarFormulario() {
    this.productoForm.reset();
    this.codigoQR = null; // Limpia el código QR
    this.fotos = []; // Limpia las fotos
  }
}
