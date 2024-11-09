import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/services/auth.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { FotoService } from 'src/app/services/foto/foto.service';
import { FotosService } from 'src/app/services/fotos.service';
import { QrService } from 'src/app/services/qr.service';
import { confirmarCalveValidator } from 'src/app/validadores/clave.validator';
import { isNumberValidator } from 'src/app/validadores/numero.validator';

@Component({
  selector: 'app-alta-usuarios',
  templateUrl: './alta-usuarios.component.html',
  styleUrls: ['./alta-usuarios.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, IonicModule, NgxSpinnerModule],
  standalone: true,
})
export class AltaUsuariosComponent implements OnInit {
  formulario: FormGroup;
  isSubmitting: boolean = false;
  loader = false;
  imagenSubida: any = false;
  tipos: string[] = [];
  errorMessage = '';
  succesMessage = '';
  tipoTraido: string | null = 'Cliente';

  constructor(
    private formBuilder: FormBuilder,
    private fotosService: FotoService,
    private cdr: ChangeDetectorRef,
    public auth: Auth,
    private newAuth: Auth,
    private datosService: DatosServiceService,
    public spinner: NgxSpinnerService,
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
    private qrService: QrService,
    private scanService: FotosService
  ) {
    this.formulario = this.formBuilder.group(
      {
        nombre: ['', [Validators.pattern('^[a-zA-Z ]+$'), Validators.required]],
        apellido: [
          '',
          [Validators.pattern('^[a-zA-Z ]+$'), Validators.required],
        ],
        dni: [
          '',
          [isNumberValidator(), Validators.required, Validators.min(10000000)],
        ],
        cuil: [
          '',
          [
            isNumberValidator(),
            Validators.required,
            Validators.min(10000000000),
          ],
        ],
        correo: ['', [Validators.required, Validators.email]],
        clave: ['', [Validators.required, Validators.minLength(6)]],
        repiteClave: ['', [Validators.required]],
        foto: ['', [Validators.required]],
        tipoUsuario: ['', Validators.required],
      },
      {
        validators: confirmarCalveValidator(),
      }
    );
  }

  ngOnInit() {
    console.log(this.tipoTraido);
    this.route.paramMap.subscribe((params) => {
      this.tipoTraido = params.get('tipoUsuario');
    });
    if (this.tipoTraido == 'Dueño' || this.tipoTraido == 'Supervisor') {
      this.tipos = ['Dueño', 'Supervisor'];
    } else {
      this.tipos = ['Maître', 'Mozo', 'Cocinero', 'Bartender'];
      if (this.tipoTraido != 'Empleado') {
        this.tipoUsuario?.setValue(this.tipoTraido);
        this.eliminarValidacion('cuil');
        this.eliminarValidacion('tipoUsuario');
        if (this.tipoTraido == 'Anónimo') {
          this.eliminarValidacion('apellido');
          this.eliminarValidacion('dni');
          this.eliminarValidacion('correo');
          this.eliminarValidacion('clave');
          this.eliminarValidacion('repiteClave');
        }
      } else {
        // Si es empleado la foto se puede subir después
        this.eliminarValidacion('foto');
      }
    }
  }

  eliminarValidacion(validacion: string) {
    this.formulario.get(validacion)?.clearValidators();
    this.formulario.get(validacion)?.updateValueAndValidity();
  }

  async guardarDatos() {
    if (this.formulario.valid) {
      this.spinner.show();
      this.formulario.markAllAsTouched();
      this.formulario.markAsPristine();
      this.isSubmitting = true;
      try {
        let nuevoUsuario: any;
        let urlFotoSubida;
        if (this.tipoTraido != 'Anónimo') {
          nuevoUsuario = await this.crearOtroUsuario();
          urlFotoSubida = await this.datosService.subirImagenAsync(
            'Fotos de perfil',
            `${this.dni?.value}-FotoDePerfil`,
            this.imagenSubida.fotoCamara
          );
          await this.datosService.guardarDatos(
            'usuarios',
            this.ajustarDatos(urlFotoSubida)
          );
          if (this.authService.usuarioLogeado !== undefined) {
            this.router.navigateByUrl('/login');
          }
        } else {
          urlFotoSubida = await this.datosService.subirImagenAsync(
            'Fotos de perfil anonimas',
            `${this.nombre?.value}-FotoDePerfil`,
            this.imagenSubida.fotoCamara
          );
          await this.datosService.guardarDatos(
            'usuariosAnonimos',
            this.ajustarDatos(urlFotoSubida)
          );
          this.authService.usuarioLogeado = {
            id: `Usuario Anónimo ${this.nombre?.value}`,
            nombre: this.nombre?.value,
            foto: urlFotoSubida,
            tipoUsuario: 'Anónimo',
            aprobado: 'anónimo',
          };
          this.authService.tipoUsuario = 'Anónimo';

          this.router.navigateByUrl('/home');
        }
        // if (nuevoUsuario.user || this.tipoTraido=="Anónimo")
        // {
        // urlFotoSubida = await this.datosService.subirImagenAsync("Fotos de perfil", `${this.dni?.value}-FotoDePerfil`, this.imagenSubida.fotoCamara);
        this.formulario.reset();
        this.imagenSubida = false;
        this.spinner.hide();
        this.succesMessage = 'Usuario creado exitosamente';
      } catch (error) {
        this.spinner.hide();
        this.obtenerMensajeDeError(error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.errorMessage = 'Error, formulario incompleto';
    }
  }

  ajustarDatos(url: string) {
    const formData = { ...this.formulario.value };
    const keysToRemove = ['repiteClave'];
    formData.aprobado = 'aprobado';

    if (this.tipoTraido === 'Cliente') {
      keysToRemove.push('cuil');
      formData.aprobado = 'pendiente';
    }

    if (this.tipoTraido === 'Anónimo') {
      Object.keys(formData).forEach((key) => {
        if (key !== 'nombre' && key !== 'foto') {
          delete formData[key];
        }
      });
    } else {
      keysToRemove.forEach((key) => delete formData[key]);
    }

    formData.foto = url;
    return formData;
  }

  async crearOtroUsuario() {
    const authGuardado = this.auth.currentUser;
    let userCredential;
    // Si hay un usuario autenticado, usa newAuth para crear una nueva cuenta
    userCredential = await createUserWithEmailAndPassword(
      this.newAuth,
      this.formulario.get('correo')?.value,
      this.formulario.get('clave')?.value
    );
    this.auth.updateCurrentUser(authGuardado);
    return userCredential;
  }

  async sacarFoto() {
    this.loader = true;
    let foto = await this.fotosService.guardarFoto();
    if (foto) {
      this.imagenSubida = {
        foto: URL.createObjectURL(foto),
        fotoCamara: foto,
      };
    }
    this.foto?.setValue(foto);
    this.cdr.detectChanges(); // Forzar actualización de la vista
    this.loader = false;
  }

  volverLogin() {
    if (this.authService.usuarioLogeado) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  obtenerMensajeDeError(error: any) {
    let texto = 'Error al registrar usuario';

    if (error && error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          texto = 'Mail ya registrado';
          break;
        case 'auth/too-many-requests':
          texto = 'Demasiados intentos. Reestablecer contraseña.';
          break;
        case 'auth/invalid-credential':
          texto = 'Contraseña o email incorrectos!';
          break;
        case 'auth/weak-password':
          texto = 'Contraseña muy corta, debe tener al menos 6 caracteres';
          break;
        case 'auth/invalid-email':
          texto =
            'Correo inválido. Debe ser una cuenta de correo electrónico válida';
          break;
        case 'auth/missing-password':
          texto = 'Falta ingresar la clave';
          break;
        default:
          texto = 'Hubo un error, no se pudo proceder.';
      }
    }
    this.errorMessage = texto;
  }

  async escanearDatos() {
    // let codigoLeido;
    let traduccion;
    // codigoLeido= await this.scanService.scan()
    traduccion = await this.qrService.leerQr();
    // this.succesMessage = traduccion;
    this.parsearDatosDesdeString(traduccion);
  }

  parsearDatosDesdeString(qrString: string) {
    // Dividimos el string en partes usando "@" como delimitador
    const partes = qrString.split('@');

    // Verificamos que existan al menos tres partes después del primer "@" para extraer apellido, nombre y dni
    if (partes.length >= 4) {
      // Capitalizamos la primera letra de apellido y nombre
      const capitalizar = (texto: string) =>
        texto
          .trim()
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase());

      const apellido = capitalizar(partes[1]); // Primer elemento después del primer "@" es el apellido
      const nombre = capitalizar(partes[2]); // Segundo elemento después del primer "@" es el nombre
      const dni = partes[4].trim(); // Tercer elemento después del primer "@" es el dni

      // Asignamos los valores a los campos correspondientes
      this.apellido?.setValue(apellido);
      this.nombre?.setValue(nombre);
      this.dni?.setValue(dni);
      this.succesMessage = 'QR leído con éxito';
    } else {
      // Si el formato es incorrecto y no tiene los elementos necesarios, mostramos un mensaje de error
      this.errorMessage = 'Error al leer el QR';
    }
  }

  get nombre() {
    return this.formulario.get('nombre');
  }

  get apellido() {
    return this.formulario.get('apellido');
  }

  get dni() {
    return this.formulario.get('dni');
  }

  get correo() {
    return this.formulario.get('correo');
  }

  get clave() {
    return this.formulario.get('clave');
  }

  get repiteClave() {
    return this.formulario.get('repiteClave');
  }

  get foto() {
    return this.formulario.get('foto');
  }
  get cuit() {
    return this.formulario.get('cuit');
  }
  get tipoUsuario() {
    return this.formulario.get('tipoUsuario');
  }
}
