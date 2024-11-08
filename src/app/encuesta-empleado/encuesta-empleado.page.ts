import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EncuestaEmpleado } from '../interfaces/EncuestaEmpleado.interface';  
import { DatosServiceService } from '../services/datos/datos-service.service';
import { ToastService } from '../services/toast.service';
import { FotosService } from '../services/fotos.service'; 
import { AuthService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-encuesta-empleado',
  templateUrl: './encuesta-empleado.page.html',
  styleUrls: ['./encuesta-empleado.page.scss'],
})
export class EncuestaEmpleadoPage  implements OnInit {
  encuestaForm: FormGroup;
  fotoUrl: string | null = null;  // Ahora acepta tanto string como null
  usuarioActual$: Observable<any> = this.authService.getCurrentUser();

  constructor(
    private fb: FormBuilder,
    private datosService: DatosServiceService,
    private toastService: ToastService,
    private fotoService: FotosService, 
    private authService:  AuthService 
  ) {
    // Inicializamos el formulario reactivo con los campos definidos
    this.encuestaForm = this.fb.group({
      espacioTrabajo: ['', Validators.required],
      imagenEspacio: ['', Validators.required],
      organizacionEspacio: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      herramientasCompletas: [false, Validators.required],
      tareasRealizadas: [[], Validators.required],
      categoriaTrabajo: ['', Validators.required],
      saltearEncuesta: [false]
    });
  }

  ngOnInit() {
    this.usuarioActual$.subscribe(
      user => 
      {
        alert('Correo del usuario: ' + user.email);
      }
    )
  }
  
  

  // Método para manejar el envío del formulario
  onSubmit() {
    if (this.encuestaForm.valid) {
      // Obtenemos los datos del formulario
      const encuestaData = this.encuestaForm.value;

      // Creamos un objeto basado en la interfaz EncuestaEmpleado
      const encuestaEmpleado: EncuestaEmpleado = {
        empleadoId: 'empleado123',  // Este dato puede venir de un servicio o contexto de usuario
        fecha: new Date(),          // Se asigna la fecha actual
        espacioTrabajo: encuestaData.espacioTrabajo,
        imagenEspacio: encuestaData.imagenEspacio,
        organizacionEspacio: encuestaData.organizacionEspacio,
        herramientasCompletas: encuestaData.herramientasCompletas,
        tareasRealizadas: encuestaData.tareasRealizadas,
        categoriaTrabajo: encuestaData.categoriaTrabajo,
        saltearEncuesta: encuestaData.saltearEncuesta
      };

      // Guardamos la encuesta en la base de datos
      this.datosService.guardarDatos("EncuestaEmpleado", encuestaEmpleado)
        .then(() => {
          this.toastService.openSuccessToast('Encuesta guardada con éxito.');

          // Limpia el formulario después de un corto tiempo
          setTimeout(() => {
            this.limpiarFormulario();
          }, 5000);
        })
        .catch(error => {
          console.error('Error al guardar la encuesta:', error);
          this.toastService.openErrorToast('No se pudo guardar la encuesta');
        });
    } else {
      this.toastService.openWarningToast('Por favor, complete todos los campos del formulario.');
    }
  }

  // Método para limpiar el formulario
  limpiarFormulario() {
    this.encuestaForm.reset();
  }

  // Método para tomar la foto y almacenar la URL en el formulario
  async tomarFoto() {
    try {
      this.fotoUrl = await this.fotoService.guardarFoto(); // Captura la foto y almacena la URL
      if (this.fotoUrl) {
        // Actualiza el campo imagenEspacio con la URL de la foto tomada
        this.encuestaForm.patchValue({ imagenEspacio: this.fotoUrl });
      }
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      alert('No se pudo capturar la foto');
    }
  }
}
