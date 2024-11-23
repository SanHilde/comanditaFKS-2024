import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QrService, tipoQr } from '../../../services/qr.service';
import { FotosService } from '../../../services/fotos.service';
import { DatosServiceService } from '../../../services/datos/datos-service.service';
import { ToastService } from '../../../services/toast.service';
import Swal from 'sweetalert2';
import { Producto } from '../../../interfaces/producto.interface';
import  {AuthService}  from '../../../services/auth.service';
import { UsuarioInterface } from 'src/app/interfaces/usuario.interface';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.page.html',
  styleUrls: ['./alta-producto.page.scss'],
})
export class AltaProductoPage implements OnInit {
  productoForm: FormGroup;
  codigoQR: string | null = null;
  fotos: string[] = []; // Almacena las URLs de las fotos del producto
  usuariolog: UsuarioInterface | undefined;

  constructor(
    private fb: FormBuilder,
    private qrService: QrService,
    private fotoService: FotosService,
    private datosService: DatosServiceService,
    private toastService: ToastService,  private AuthService: AuthService,
    private Router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tiempoElaboracion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      esPostre: [''],
    });
  }
  ngOnInit(): void {
    while (this.usuariolog === undefined) {
      this.usuariolog = this.AuthService.usuarioLogeado;
    }

    const defaultCategoria =
    this.usuariolog?.tipoUsuario === 'Bartender' ? 'Bartender' : 'Cocinero';

  this.productoForm = this.fb.group({
    categoria: [defaultCategoria, Validators.required],
  });
}
  async tomarFoto() {
    if (this.fotos.length < 3) {
      // Limita a 3 fotos
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
      if (
        (productoData.categoria === 'Bartender' && this.usuariolog?.tipoUsuario !== 'Bartender') ||
        (productoData.categoria === 'Cocinero' && this.usuariolog?.tipoUsuario !== 'Cocinero')
      ) {
        this.limpiarFormulario();
        this.toastService.openErrorToast(
          `No tienes permisos para crear productos de la categoría ${productoData.categoria}.`
        );
        return;
      }
      const productoDataQR: Producto = {
        id: '', // Se generará al guardar en la base de datos
        nombre: productoData.nombre,
        descripcion: productoData.descripcion,
        tiempoElaboracion: productoData.tiempoElaboracion,
        precio: productoData.precio,
        fotos: this.fotos, // Guarda las URLs de las fotos
        codigoQR: '',
        categoria: productoData.categoria,
        esUnPostre: productoData.esPostre,
        creadoPor: this.usuariolog?.tipoUsuario, // O el usuario que crea el producto
        cantidadSolicitada: 0, //AGREGUE CANTIDAD
      };

      this.qrService
        .crearImagenQr(productoDataQR, tipoQr.Producto)
        .then((qrImageUrl) => {
          this.codigoQR = qrImageUrl;
          productoDataQR.codigoQR = this.codigoQR;

          // Subir todas las fotos a Firebase Storage
          const uploadPromises = this.fotos.map((fotoUrl, index) => {
            const nombreImagen = `producto_${
              productoDataQR.nombre
            }_${new Date().getTime()}_${index}.jpg`;
            return this.datosService.subirImagenAsync2(
              'productos',
              nombreImagen,
              fotoUrl
            );
          });

          return Promise.all(uploadPromises).then((uploadedUrls) => {
            // Una vez que todas las fotos se han subido, actualizamos las URLs en el producto
            productoDataQR.fotos = uploadedUrls;

            // Guardamos los datos del producto en la base de datos
            return this.datosService.guardarDatos('Producto', productoDataQR);
          });
        })
        .then(() => {
          this.toastService.openSuccessToast('Producto guardado con éxito.');
          setTimeout(() => {
            this.limpiarFormulario();
          }, 5000);
          this.Router.navigate(['/home']);
        })
        .catch((error) => {
          console.error(
            'Error al generar el código QR o guardar el producto:',
            error
          );
          this.toastService.openErrorToast(
            'No se pudo generar el código QR o guardar el producto'
          );
        });
    } else {
      this.toastService.openWarningToast(
        'Por favor, complete todos los campos del formulario.'
      );
    }
  }

  // Método para limpiar el formulario
  limpiarFormulario() {
    this.productoForm.reset();
    this.codigoQR = null; // Limpia el código QR
    this.fotos = []; // Limpia las fotos
  }
}
