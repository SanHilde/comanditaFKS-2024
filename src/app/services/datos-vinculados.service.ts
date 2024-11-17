import { Injectable } from '@angular/core';
import { DatosServiceService } from './datos/datos-service.service';
import { Mesa } from '../interfaces/mesa.interface';
import { Ventas } from '../interfaces/venta.interface';

@Injectable({
  providedIn: 'root',
})
export class DatosVinculadosService {
  constructor(private datosService: DatosServiceService) {}
  public pedido!: Ventas;
  public mesa!: Mesa;
  suscripcionAVenta = false;

  getPedido() {
    return this.pedido;
  }

  getMesa() {
    return this.mesa;
  }

  suscribirseADatos(idMesa: string) {
    if (idMesa != '') {
      this.datosService.ObtenerDatos('Mesa').subscribe((listaDeMesas: any) => {
        listaDeMesas.forEach((mesaIndividual: Mesa) => {
          if (idMesa != null && mesaIndividual.numero == idMesa) {
            this.mesa = mesaIndividual;
            if (!this.suscripcionAVenta && this.mesa.qrid) {
              this.suscripcionAVenta = true;
              this.datosService
                .ObtenerDatos('Ventas')
                .subscribe((listaDeVentas: any) => {
                  listaDeVentas.forEach((ventaIndividual: Ventas) => {
                    if (ventaIndividual.id == this.mesa.qrid) {
                      this.pedido = ventaIndividual;
                      // resolve(true);
                      return;
                    }
                  });
                });
            } else {
              // resolve(true);
              return;
            }
          }
        });
      });
    }
  }

  buscarDatoMesa(idMesa: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.datosService.ObtenerDatos('Mesa').subscribe(
        (listaDeMesas: any) => {
          for (let mesaIndividual of listaDeMesas) {
            if (idMesa != null && mesaIndividual.numero === idMesa) {
              this.mesa = mesaIndividual;
              resolve(true);
              return; // Termina la suscripción si se encuentra la mesa
            }
          }
          // Si no se encuentra la mesa, resolvemos con false
          resolve(false);
        },
        (error) => {
          // En caso de error, rechazamos la promesa
          reject(error);
        }
      );
    });
  }

  obtenerDatoPedidoDeMesa(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.datosService.ObtenerDatos('Ventas').subscribe(
        (listaDeVentas: any) => {
          for (let ventaIndividual of listaDeVentas) {
            if (ventaIndividual.id == this.mesa.qrid) {
              this.pedido = ventaIndividual;
              resolve(true);
              return; // Termina la suscripción si se encuentra la mesa
            }
          }
          // Si no se encuentra la mesa, resolvemos con false
          resolve(false);
        },
        (error) => {
          // En caso de error, rechazamos la promesa
          reject(error);
        }
      );
    });
  }

  async traerDatosMesa(idMesa: string) {
    let listaDeMesas = await this.datosService.ObtenerDatosAsync('Mesa');
    listaDeMesas.forEach((mesaIdividual: Mesa) => {
      if (mesaIdividual.numero == idMesa) {
        this.mesa = mesaIdividual;
      }
    });
    // await this.buscarPedido();
    return this.mesa;
  }

  async buscarPedido() {
    if (this.mesa.qrid) {
      let listaDePedidos = await this.datosService.ObtenerDatosAsync('Ventas');
      listaDePedidos.forEach((pedidoIndividual: Ventas) => {
        if (this.mesa.qrid == pedidoIndividual.id) {
          this.pedido = pedidoIndividual;
        }
      });
    }
    return this.pedido;
  }
}
