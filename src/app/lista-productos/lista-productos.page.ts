import { Component, OnInit, Input  } from '@angular/core';
import { FotosService } from '../services/fotos.service';
import { DatosServiceService } from '../services/datos/datos-service.service';
import { Mesa } from '../interfaces/mesa.interface';
import { Producto } from '../interfaces/producto.interface';
import { Ventas } from '../interfaces/venta.interface';
import { UsuarioInterface } from '../interfaces/usuario.interface';
import { AuthService } from 'src/app/services/auth.service';
import {  OnChanges, SimpleChanges } from '@angular/core';
import { PreCargaimgService } from '../services/pre-cargaimg.service';
import { ToastService } from '../services/toast.service';
 
@Component({
  selector: 'app-lista-productos',
  templateUrl: './lista-productos.page.html',
  styleUrls: ['./lista-productos.page.scss'],
})
export class ListaProductosPage implements OnInit {
 
  public QrMesaId: string = "";
  public entrarLista: boolean = false;
  public listaMesa: Mesa[] = [];
  public personaLog: UsuarioInterface | undefined;
  public listarProductos: boolean = false;
  public listaProducto: Producto[] = [];
  public botonQr: boolean = true;
  public bebidas: Producto[] = [];
  public comidas: Producto[] = [];
  public ventaActual: Ventas | null = null;
  public chat: boolean = false;
  public tiempoEstimado: number = 0; 
  public precioPagar: number = 0;
  @Input() mostrarAnimacion: boolean = false; // Controla la visualización de la animación
  estadoPedido: string = 'cocinando'; // Estado inicial del pedido
  intervalId: any;
  public animar: boolean=false;
  

  constructor(private fotosServices: FotosService, private DatosServices: DatosServiceService,
    private authService: AuthService, private PreCargaimgService: PreCargaimgService,
    private ToastService: ToastService
  ) { }

  ngOnInit() {
  
  

    this.DatosServices.ObtenerDatos('Mesa').subscribe((listaMesa) => {
      this.listaMesa = listaMesa;
    });
    setTimeout(() => {
      this.personaLog = this.authService.usuarioLogeado;
      
    }, 4000);
    
   
    
    this.DatosServices.ObtenerDatos('Producto').subscribe((listaProducto) => {
      this.listaProducto = listaProducto;
      console.log('Productos cargados:', this.listaProducto);
      this.cargarImagenesProductos();
    });
  
  }

  /*scanerDQrMesa() {
    this.fotosServices.scan().then((resultado: string) => {
      this.QrMesaId = resultado;
      for (const mesa of this.listaMesa) {
      if (mesa.qrid === this.QrMesaId) {
          if (mesa.idCliente === this.personaLog?.id) {
            this.botonQr = false;
            this.listarProductos = true;
            this.iniciarVenta();
          } else {
            console.log("El idCliente no coincide con personaLog.");
           }
          break; 
        }
       }
  
      console.log("Código QR escaneado y almacenado en QrMesaId:", this.QrMesaId);
    }).catch(error => {
      console.error("Error al escanear el código QR:", error);
    });
  }*/
 scanerDQrMesa() {
    
      this.fotosServices.scan().then((resultado: string) => {
        
        if(this.personaLog)
          {
            this.QrMesaId = resultado;
        if(this.animar){
          this.botonQr = false;
            this.mostrarAnimacion = true; // Esto activará la animación de estados
        
        }else{
          this.botonQr = false; // Ocultar el botón de escaneo
          this.listarProductos = true; // Mostrar la lista de productos
        }
          }else
          {
            console.log("no ha cargado de forma correcta el usuario");
          }
        this.iniciarVenta();
        console.log("Código QR escaneado y almacenado en QrMesaId:", this.QrMesaId);
      }).catch(error => {
        console.error("Error al escanear el código QR:", error);
      });
    }


  private clasificarProductos() {
    this.bebidas = this.listaProducto.filter(producto => producto.categoria === 'Bartender');
    this.comidas = this.listaProducto.filter(producto => producto.categoria === 'Cocinero');
  }

  seleccionarProducto(producto: Producto) {
    console.log("entro seleccionar pedido");

    if (this.ventaActual?.usuarioId) {
      this.ventaActual.productosSeleccionados.push(producto);
      console.log("Producto agregado a la venta:", producto);
      console.log("entro entro a la funcion");
      console.log(this.tiempoEstimado);
      this.calcularTiempoEstimado();
      this.actualizarPrecioPagar(producto);
      this.ventaActual.precioPaga = this.precioPagar;
      
    }
  }
  chatConsultaMozo()
  {
    this.chat = !this.chat; 
  }
  async cargarImagenesProductos() {
    for (const producto of this.listaProducto) {
      if (producto.fotos && producto.fotos.length > 0) {
        // Reemplazar las rutas relativas de las imágenes con las URLs de Firebase
        for (let i = 0; i < producto.fotos.length; i++) {
          const nombreImagen = producto.fotos[i];  // Nombre de la imagen
          try {
            const urlImagen = await this.DatosServices.getImagenAsync('Producto', nombreImagen);  // Obtener URL
            producto.fotos[i] = urlImagen;  // Reemplazar la URL en el array de fotos
          } catch (error) {
            console.error('Error al obtener la imagen:', error);
          }
        }
      }
    }
    this.clasificarProductos();  // Llamar después de cargar todas las imágenes
  }

   // Inicia una nueva venta para el usuario y la mesa actual
   iniciarVenta() {
    this.QrMesaId = "MESA11VIP4803";
    if (this.personaLog && this.QrMesaId) {
      this.ventaActual = {
        usuarioId: this.personaLog.id,
        mesaId: this.QrMesaId,
        productosSeleccionados: [],
        pago: false,
        validacionMozo: false,
        precioPaga: 0
      };
      console.log("Venta iniciada:", this.ventaActual);
    } else {
      console.error("No se pudo iniciar la venta: usuario o mesa no están definidos.");
    }
  }

  // Guarda la venta actual en la base de datos
  guardarVenta() {
    if (this.ventaActual) {
      this.DatosServices.guardarDatos('Ventas', this.ventaActual).then(() => {
        console.log("Venta guardada exitosamente:", this.ventaActual);
        this.resetVenta();  // Resetea la venta después de guardar
      }).catch(error => {
        console.error("Error al guardar la venta:", error);
      });
    } else {
      console.error("No hay ninguna venta actual para guardar.");
    }
  }

  // Resetea la venta actual
  private resetVenta() {
    this.ventaActual = null;
    console.log("Venta actual reseteada.");
  }

  calcularTiempoEstimado() {
    if (this.ventaActual && this.ventaActual.productosSeleccionados.length > 0) {
      // Encuentra el mayor tiempo de preparación entre los productos seleccionados
      this.tiempoEstimado = Math.max(
        ...this.ventaActual.productosSeleccionados.map(prod => prod.tiempoElaboracion)
      );
    } else {
      this.tiempoEstimado = 0; // Si no hay productos seleccionados, el tiempo estimado es 0
    }
    
  }
  actualizarPrecioPagar(producto: Producto) {
    if (producto.precio) {
      this.precioPagar += producto.precio;  // Sumar el precio del producto al total
      console.log("Precio total actualizado:", this.precioPagar);
    } else {
      console.error("El producto no tiene un precio definido.");
    }
  }
  finalizarVenta() {
    console.log("Venta finalizada");
    this.guardarVenta();
    this.resetVenta();
    this.botonQr = true; // Ocultar el botón de escaneo
    this.listarProductos = false; // Mostrar la lista de productos
    this.animar = true;
    this.iniciarAnimacion();

  }
  ngOnChanges(changes: SimpleChanges) {
    // Activa la animación cuando mostrarAnimacion cambia a true
    if (changes['mostrarAnimacion'] && this.mostrarAnimacion) {
      this.iniciarAnimacion();
    } else if (!this.mostrarAnimacion) {
      this.detenerAnimacion();
    }
  }

  iniciarAnimacion() {
    this.estadoPedido = 'cocinando'; // Estado inicial
    this.intervalId = setInterval(() => {
      this.actualizarEstado();
    }, 7000); // Cambia de estado cada 5 segundos
  }

  actualizarEstado() {
    if (this.estadoPedido === 'cocinando') {
      this.estadoPedido = 'emplatando';
    } else if (this.estadoPedido === 'emplatando') {
      this.estadoPedido = 'entregando';
    } else if (this.estadoPedido === 'entregando') {
      this.detenerAnimacion(); // Detiene la animación al finalizar
    }
  }

  detenerAnimacion() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.estadoPedido = 'cocinando'; // Reinicia el estado para la próxima vez
  }
 

}
