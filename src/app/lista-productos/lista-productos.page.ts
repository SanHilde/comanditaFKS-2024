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
import { Router } from '@angular/router';
 
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
  public mesaActual: Mesa | undefined;
  

  constructor(private fotosServices: FotosService, private DatosServices: DatosServiceService,
    private authService: AuthService, private PreCargaimgService: PreCargaimgService,
    private ToastService: ToastService,
    private router: Router,
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

  scanerDQrMesa() {
    this.fotosServices.scan().then((resultado: string) => {
      this.QrMesaId = resultado;
      for (const mesa of this.listaMesa) {
      if (mesa.qrid === this.QrMesaId) {
          if (mesa.idCliente === this.personaLog?.id) {
            switch (mesa.estado) {
              case "Ocupada":
                this.mesaActual = mesa;
                this.botonQr = false;
                this.listarProductos = true;
                this.ToastService.openSuccessToast(
                  '¡Bienvenido a La Comandita FKS! Puede generar su compra aquí. Este es el menú principal de comida y bebidas.',
                  'bottom'
                );
                this.ToastService.vibrar(5000);
                this.iniciarVenta();
                break;
            
              case "procesoPago":
                this.router.navigate([`/mesa/${mesa.id}`]);
                break;
            
              default:
                this.ToastService.openErrorToast("Estado de la mesa no reconocido: " + mesa.estado, 'bottom');
                console.warn("Estado de la mesa no reconocido:", mesa.estado);
                break;
            }
            
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
  }
 /*
 scanerDQrMesa() {
    
      this.fotosServices.scan().then((resultado: string) => {
        
        if(this.personaLog)
          {
            this.QrMesaId = resultado;
            this.botonQr = false; // Ocultar el botón de escaneo
            this.listarProductos = true; // Mostrar la lista de productos
          }else
          {
            console.log("no ha cargado de forma correcta el usuario");
          }
        this.iniciarVenta();
        console.log("Código QR escaneado y almacenado en QrMesaId:", this.QrMesaId);
      }).catch(error => {
        console.error("Error al escanear el código QR:", error);
      });
    }*/


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
      this.ToastService.openSuccessToast(
        `¡Muchas gracias por comprar el producto "${producto.nombre}" por un precio de $${producto.precio.toFixed(2)}!`,
        'bottom'
      );
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
   async iniciarVenta() {
    if (!this.mesaActual) {
      console.error('mesaActual no está definido.');
      return;
    }
    
    if (this.personaLog && this.QrMesaId) {
      this.ventaActual = {
        usuarioId: this.personaLog.id,
        mesaId: this.QrMesaId,
        productosSeleccionados: [], // Inicializado como un array vacío
        listoPago: false,
        precioPaga: 0,
        validacionMozo: false,
        completoEncuesta:false,
        confirmarRecepcion:false,
        id:"",
        estadoCocinero:"pendiente",
        estadoBartender:"pendiente",
        mesaNumero: this.mesaActual.numero

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
    this.modificarEstadoMesa();

  }
  
  modificarEstadoMesa()
  {
    if (!this.mesaActual) {
      console.error('mesaActual no está definido.');
      return;
    }
  
    this.mesaActual.estado = "procesoPago";
  
    this.DatosServices.modificarDatoAsync(this.mesaActual.id, "Mesa", this.mesaActual)
      .then(() => {
        this.ToastService.openSuccessToast(
          '¡Ya su pedido ha sido tomado!',
          'bottom'
        );
      })
      .catch((error) => {
        console.error('Error al actualizar la mesa:', error);
      });

  }



}
