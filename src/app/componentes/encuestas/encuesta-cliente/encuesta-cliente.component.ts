import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output,OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Ventas } from 'src/app/interfaces/venta.interface';
import { AuthService } from 'src/app/services/auth.service';
import { DatosVinculadosService } from 'src/app/services/datos-vinculados.service';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { FechaService } from 'src/app/services/fecha/fecha.service';
import { FotoService } from 'src/app/services/foto/foto.service';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.component.html',
  styleUrls: ['./encuesta-cliente.component.scss'],
  standalone:true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,IonicModule,NgxSpinnerModule],
})
export class EncuestaClienteComponent  implements OnInit {

  encuestaForm!: FormGroup;
  fotoUrl!: string;
  public listaDeFotos: any = [];
  tiposSelect=["Muy mal", "Mal", "Normal", "Buena", "Excelente"];
  opcionesRadio=["Muy caro", "Caro", "Normal", "Barato", "Muy barato"]
  opcionesCheck=["Velocidad", "Precio", "Sabor", "Atención", "Nada"];
  errorMessage = '';
  succesMessage = '';
  seleccionados: string[] = [];
  cantFotos=3;
  comentario: string = '';
  idMesa!:string | null; 
  pedido!:Ventas;
  

  // @Output() encuestaTerminada= new EventEmitter<any>;
  
  preguntas = [
    { key: 'velocidad', texto: 'Velocidad de atención', tipo: 'range', textoError:"Seleccione algun rango" },
    { key: 'sabor', texto: '¿Qué tanto te gustó el sabor?', tipo: 'input', textoError:"Solo números del 1 al 5" },
    { key: 'atencion', texto: 'Califica la atención', tipo: 'select', textoError:"Seleccione alguna opción"},
    { key: 'precio', texto: 'Precios', tipo: 'radio', textoError:"Seleccione opción" },
    { key: 'mejoras', texto: 'Para mejorar', tipo: 'check', textoError:"Seleccione opción" }
  ];

   constructor(private datosVinculados: DatosVinculadosService,private route: ActivatedRoute ,private fb: FormBuilder, private datosService: DatosServiceService, public fotosService: FotoService, private cdr: ChangeDetectorRef, private router: Router, public spinner: NgxSpinnerService, private fechaService: FechaService, private auth:AuthService) {}
 
   ngOnInit(): void {
     this.encuestaForm = this.fb.group({
      velocidad: [3, Validators.required],
      precio: ['', Validators.required],
      sabor: ['', Validators.required],
      mejoras: [[], Validators.required],
      atencion: ['', Validators.required],
     });
     const arrayDePreguntas = this.generarArrayDeObjetos(20);
    //  console.log(arrayDePreguntas);
    this.route.paramMap.subscribe((params) => {
      this.idMesa = params.get('idMesa');
    });
    this.buscarPedido();
   }
   
    async generarObjetoAleatorio(){
    let objeto= {
      velocidad: Math.floor(Math.random() * 5) + 1, // Valor entre 1 y 5
      precio: this.opcionesRadio[Math.floor(Math.random() * this.opcionesRadio.length)], // Selección aleatoria de precio
      sabor: Math.floor(Math.random() * 5) + 1, // Valor entre 1 y 5
      mejoras: this.opcionesCheck.filter(() => Math.random() > 0.5), // Selección aleatoria de opciones de mejoras
      atencion: this.tiposSelect[Math.floor(Math.random() * this.tiposSelect.length)] // Selección aleatoria de atención
    };
    await this.datosService.guardarDatos("encuestas clientes", objeto);
    return objeto;
  };
  
   generarArrayDeObjetos = (cantidad: number) => {
    const arrayDeObjetos = [];
    for (let i = 0; i < cantidad; i++) {
      arrayDeObjetos.push(this.generarObjetoAleatorio());
    }
    return arrayDeObjetos;
  };


   async addPhotoToGallery() {
    // this.loader=true;
    if(this.cantFotos!=0){
      let foto = await this.fotosService.guardarFoto();
      if (foto) {
        this.listaDeFotos.push({
          foto:URL.createObjectURL(foto),
          fotoCamara:foto},
          );
      }
      this.cdr.detectChanges(); // Forzar actualización de la vista
      this.cantFotos--;
      // this.loader=false;
    } else{
      this.errorMessage="Solo puede subir hasta 3 fotos, puede eliminar la última presionando el boton de abajo"
    }
  }

  async subirFotos() {
    let titulo ="Fotos comentarios"
    let listaDeURLS=[];
    let date = new Date();
    let fecha = this.fechaService.convertirFechaAlDiaYHora(date);
    let contador=0
    for (const foto of this.listaDeFotos) {
      // Aquí debes asegurarte de que 'foto' es del tipo correcto (e.g. File)
      let url = await this.datosService.subirImagenAsync(
        titulo,
        `${fecha}--${this.auth.usuarioLogeado?.nombre}--${this.auth.usuarioLogeado?.tipoUsuario}--${contador}`,
        foto.fotoCamara
      );
      listaDeURLS.push(url);
    }
    this.listaDeFotos=[];
    return listaDeURLS;
  }
  async buscarPedido(){
    if(this.idMesa){
      await this.datosVinculados.traerDatosMesa(this.idMesa);
      this.pedido = await this.datosVinculados.buscarPedido();
    }

    // let listaPedidos = await this.datosService.ObtenerDatosAsync("Ventas");
    // this.pedido = listaPedidos.find((pedidoIndividual: Ventas) => pedidoIndividual.id === this.idPedido);
  }


  async subirEncuesta(){
    this.spinner.show();
    this.encuestaForm.markAllAsTouched();
    this.encuestaForm.markAsPristine();
    try {
      if (this.encuestaForm.valid) {
        let objetoASubir:any={};
        let listasURL= await this.subirFotos();
        objetoASubir=this.encuestaForm.value;
        if(listasURL.length>0){
          objetoASubir.fotos=listasURL;
        }
        if(this.comentario!=''){
          objetoASubir.comentario = this.comentario;
        }
        await this.datosService.guardarDatos("encuestas clientes", objetoASubir);

        
        if (this.pedido) {
          this.pedido.completoEncuesta = true;
          await this.datosService.modificarDatoAsync(this.pedido.id,"Ventas", this.pedido);
        }
        
        this.succesMessage="Formulario subido con éxtio";
        this.resetCheckboxesManual();
        this.encuestaForm.reset();
        this.router.navigate(['/mesa',this.idMesa]);

        // setTimeout(()=>this.router.navigateByUrl('mesas',pedido.mesaId),3000);
        // this.router.navigate(['/mesa', pedido.mesaId]);
        
      } else{
        this.errorMessage="Falta completar datos del formulario";
      }
      
    } catch (error) {
      this.errorMessage="Error al subir los datos";
    } finally{

      this.spinner.hide();
    }
  }
  volverAtras(){
    console.log(this.pedido)
    this.router.navigate(['/mesa',this.idMesa]);
    // this.router.navigateByUrl('c');
  }
  eliminarUltimaFoto(){
    this.listaDeFotos.pop();
  }

  onCheckboxChange(opcion: string, event: any) {
    if (event.detail.checked) {
      this.seleccionados.push(opcion); // Agrega la opción seleccionada
    } else {
      const index = this.seleccionados.indexOf(opcion);
      if (index > -1) {
        this.seleccionados.splice(index, 1); // Elimina la opción desmarcada
      }
    }
    let mejoras=this.encuestaForm.get('mejoras');
    mejoras?.setValue(this.seleccionados);
  }
  resetCheckboxesManual() {
    // Selecciona todos los checkboxes en el HTML y los desmarca
    const checkboxes = document.querySelectorAll('ion-checkbox');
    checkboxes.forEach((checkbox: any) => {
      checkbox.checked = false; // Marca cada checkbox como desmarcado
    });
  
    // Limpia el array `seleccionados`
    this.seleccionados = [];
  }

  actualizarComentario(event: any) {
    this.comentario = event.detail.value;
    console.log('Comentario actualizado:', this.comentario);
  }

}
