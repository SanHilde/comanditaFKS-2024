import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { collection } from 'firebase/firestore';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
// import { FechaService } from 'src/app/services/fecha/fecha.service';
import { FotoService } from 'src/app/services/foto/foto.service';
// import { ListaComponent } from '../lista/lista.component';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexAxisChartSeries,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
// import { ImageOrientationDirective } from 'src/app/directives/image-orientation/image-orientation.directive';
// import { RemoveAtSymbolDirective } from 'src/app/directives/removeAtSymbol/remove-at-symbol.directive';
import { LoaderComponent } from '../loader/loader.component';
import { CommonModule } from '@angular/common';
import { chartOptions, chartOptionsColumna, chartOptionsRadial } from './chart-config';
import { IonicModule } from '@ionic/angular';


type ApexXAxis = {
  type?: 'category' | 'datetime' | 'numeric';
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};

export type chartOptionsColumn = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
};

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

export type ChartOptionsRadial = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
};


@Component({
  selector: 'app-resultados-encuestas',
  templateUrl: './resultados-encuestas.component.html',
  styleUrls: ['./resultados-encuestas.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgApexchartsModule,
    RouterOutlet,
    IonicModule

  ],
})
export class ResultadosEncuestasComponent implements OnInit {
  // public chatCollection: any[]=[];
  // private col:any;
  public eleccion!: string;
  // public tareaSeleccionada: string = 'sinTarea';
  public datosEnviados: any;
  // private titulo:string="";
  // public datosFiltrados:any;
  // public fotoSeleccionada: any;
  // private validIndices: number[] = [];
  // public listaDeFotos: any = [];
  public loader = false;
  // public cambio=false;
  public datosOrdenados: any[] = [];
  //POSIBLES INPORT
  public encuestaTraida = 'encuestas clientes'; //nombre de la base de datos a analizar datos
  public clavesParaPromedios = ['velocidad', 'sabor', 'atencion', 'precio','mejoras']; //claves con las cuales se puede calcular promedios
  public clavesIgnoradas: string[] = ['fotos', 'comentario', 'id']; //claves que no queres que sean analizadas en grafico
  public eleccionIndividual = 'velocidad';

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>=chartOptions;
  public chartOptionsColumn: Partial<chartOptionsColumn>=chartOptionsColumna;
  public chartOptionsRadial: Partial<ChartOptionsRadial>=chartOptionsRadial;


  public promedios: any = {
    velocidad: 0,
    sabor: 0,
    atencion: 0,
    precio: 0,
  };

  public promedioGeneral: any = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };


  valores = [
    { valor: 1, posiblesValores: ['Muy mal', 'Muy caro'] },
    { valor: 2, posiblesValores: ['Mal', 'Caro'] },
    { valor: 3, posiblesValores: ['Normal', 'Normal'] },
    { valor: 4, posiblesValores: ['Buena', 'Barato'] },
    { valor: 5, posiblesValores: ['Excelente', 'Muy barato'] },
  ];

  // @ViewChildren('imagenes') imagenes!: QueryList<ElementRef>;
  // private totalImages!: number;
  // private imagesLoaded: number = 0;

  constructor(
    private router: Router,
    private firestore: Firestore,
    public auth: Auth,
    private datosService: DatosServiceService,
    private route: ActivatedRoute,
    public fotosService: FotoService,
    private cdr: ChangeDetectorRef
  ) {
  
  }

  //}

  async ngOnInit() {
    let datos = await this.datosService.ObtenerDatosAsync(this.encuestaTraida);
    this.ordenarDatos(datos);
    this.calcularPromedios();
    this.eleccionIndividual = this.clavesParaPromedios[0];
  }
  volverAtras(){
    this.router.navigateByUrl('ingreso');
  }

  generarDatosTorta(eleccionTomada: string) {
    this.eleccion = 'torta';
    if (eleccionTomada == 'atención') {
      this.eleccionIndividual = 'atencion';
    } else {
      this.eleccionIndividual = eleccionTomada;
    }
    this.chartOptions.series = [];
    this.chartOptions.labels = [];
    this.datosOrdenados.forEach((dato: any) => {
      if (dato.key == this.eleccionIndividual) {
        dato.datos.forEach((dato: any) => {
          this.chartOptions.series?.push(dato.cant);
          let label = '';
          if (typeof dato.dato == 'number') {
            switch (dato.dato) {
              case 1:
                label = 'Muy mal';
                break;
              case 2:
                label = 'Mal';
                break;
              case 3:
                label = 'Normal';
                break;
              case 4:
                label = 'Bien';
                break;
              case 5:
                label = 'Muy bien';
                break;
            }
          } else {
            label = dato.dato;
          }
          this.chartOptions.labels?.push(label);
        });
      }
    });
    if (this.chart) {
      this.chart.updateOptions(this.chartOptions);
    }

    if (this.eleccionIndividual == 'atencion') {
      this.eleccionIndividual = 'atención';
    }
  }

  generarDatosRadial() {
    this.eleccion = 'radial';
    this.chartOptionsRadial.series = [];
    this.chartOptionsRadial.labels = [];
    const total = this.calcularTotalEncuestas(); // Calcula el total
  
    Object.keys(this.promedioGeneral).forEach((key) => {
      const cantidad = this.promedioGeneral[key];
  
      // Solo agregar si la cantidad es mayor a 0
      if (cantidad > 0) {
        this.chartOptionsRadial.series?.push(Math.round(cantidad*100/total*10)/10);
  
        // Asignar la etiqueta según el valor de la clave
        let label = '';
        switch (parseInt(key, 10)) {
          case 1:
            label = 'No recomiendo';
            break;
          case 2:
            label = 'Recomiendo poco';
            break;
          case 3:
            label = 'Normal';
            break;
          case 4:
            label = 'Recomiendo';
            break;
          case 5:
            label = 'Recomiendo mucho';
            break;
        }
  
        this.chartOptionsRadial.labels?.push(label);
      }
    });
    

    // Aseguramos que el objeto y las propiedades existen
    if (this.chartOptionsRadial?.plotOptions?.radialBar?.dataLabels?.total) {
      this.chartOptionsRadial.plotOptions.radialBar.dataLabels.total.formatter = () => total.toString();
    }
    if (this.chart) {
      this.chart.updateOptions(this.chartOptionsRadial);
    }
  }
  calcularTotalEncuestas(): number {
    let totalEncuestas = 0;
    Object.keys(this.promedioGeneral).forEach((key) => {
      totalEncuestas += this.promedioGeneral[key];
    });
    return totalEncuestas;
  }

  generarDatosColuma() {
    this.eleccion = 'columna';
    // Aseguramos que series y xaxis existan antes de intentar acceder a ellos
    if (this.chartOptionsColumn) {
      // Si existe series y está definida la serie 0, limpiamos los datos
      if (this.chartOptionsColumn?.series) {
        this.chartOptionsColumn.series[0].data = [];
      }
      if (this.chartOptionsColumn?.xaxis?.categories) {
        this.chartOptionsColumn.xaxis.categories = [];
      }

      // Ahora recorremos las claves de 'promedios' que es un objeto
      Object.keys(this.promedios).forEach((key) => {
        if(key!="mejoras"){
          const valor = this.promedios[key];
          if (
            Array.isArray(this.chartOptionsColumn?.series) &&
            this.chartOptionsColumn.series[0]?.data
          ) {
            this.chartOptionsColumn.series[0].data.push(valor);
          }
  
          if (Array.isArray(this.chartOptionsColumn?.xaxis?.categories)) {
           // if (key == 'atencion') {
             // this.chartOptionsColumn.xaxis.categories.push('atención');
            //} else {
              this.chartOptionsColumn.xaxis.categories.push(key);
            //}
          }
        }
      });
    }
  }


  ordenarDatos(datos: any) {
    datos.forEach((encuestaIndividual: any) => {
      this.calcularPromedioGeneral(encuestaIndividual);
      // Recorrer las claves de la encuesta individual
      Object.keys(encuestaIndividual).forEach((key: string) => {
        // Ignorar claves 'fotos' y 'comentario'
        if (this.ignorarClave(key)) {
          return;
        }

        const value = encuestaIndividual[key];

        // Si el valor es un array, procesarlo con procesarArrayDato
        if (Array.isArray(value)) {
          this.procesarArrayDato(value, key);
        } else {
          // Si no es un array, procesar el dato de forma regular
          this.procesarDato(key, value);
        }
      });
    });
  }

  
  calcularPromedioGeneral(encuestaIndividual: any) {
    let sumatoria = 0;
    let contador = 0;
  
    Object.keys(encuestaIndividual).forEach((key: string) => {
      // Verifica si la clave debe ser ignorada
      if (!this.clavesIgnoradas.includes(key) && key != "mejoras") {
        const valor = encuestaIndividual[key];
  
        if (typeof valor === "number") {
          sumatoria += valor;
          contador++;
        } else if (typeof valor === "string") {
          sumatoria += this.obtenerValor(valor, key);
          contador++;
        }
      }
    });
  
    // Redondea el promedio
    const promedio = Math.round(sumatoria / contador);
  
    // Actualiza el conteo en el promedio general
    if (this.promedioGeneral[promedio] !== undefined) {
      this.promedioGeneral[promedio]++;
    }
  }
  

  ignorarClave(key: string): boolean {
    // Verifica si la clave es 'fotos' o 'comentario' y debe ser ignorada
    return key === 'fotos' || key === 'comentario' || key === 'id';
  }

  procesarDato(key: string, value: any) {
    // Verifica si el dato ya existe en 'datosOrdenados'
    let existingKey = this.datosOrdenados.find((item: any) => item.key === key);

    if (!existingKey) {
      // Si la clave no existe, la creamos
      existingKey = { key: key, datos: [] };
      this.datosOrdenados.push(existingKey);
    }

    // Procesar si el valor es un array o un valor único
    if (Array.isArray(value)) {
      value.forEach((item: any) => {
        this.actualizarContador(existingKey, item);
      });
    } else {
      this.actualizarContador(existingKey, value);
    }
  }

  actualizarContador(existingKey: any, dato: any) {
    // Verifica si el dato ya existe en la lista de esa clave
    let existingValue = existingKey.datos.find(
      (datoItem: any) => datoItem.dato === dato
    );

    if (existingValue) {
      // Si el dato ya existe, incrementar el contador
      existingValue.cant += 1;
    } else {
      // Si no existe, añadirlo con un contador de 1
      existingKey.datos.push({ dato: dato, cant: 1 });
    }
  }

  procesarArrayDato(dato: any, key: string) {
    if (dato && Array.isArray(dato)) {
      // Procesar el array de valores
      dato.forEach((item: string) => {
        // Buscar si la clave ya existe en datosOrdenados
        let existingKey = this.datosOrdenados.find(
          (item: any) => item.key === key
        );

        if (!existingKey) {
          // Si no existe la clave, la creamos
          existingKey = { key: key, datos: [] };
          this.datosOrdenados.push(existingKey);
        }

        // Verificar si el elemento ya existe en los datos de esa clave
        this.actualizarContador(existingKey, item);
      });
    }
  }

  calcularPromedios() {
    // Para cada clave que queremos calcular el promedio
    this.clavesParaPromedios.forEach((clave) => {
      // Filtramos los datos correspondientes a la clave
      const datosClave = this.datosOrdenados.find(
        (item: any) => item.key === clave
      )?.datos;

      if (datosClave) {
        let suma = 0;
        let cantidad = 0;

        // Recorremos los datos de cada clave
        datosClave.forEach((dato: any) => {
          // Si el dato es numérico (como velocidad o sabor), lo tratamos directamente
          if (typeof dato.dato === 'number') {
            suma += dato.dato * dato.cant;
          } else {
            // Si el dato es texto (como atencion o precio), lo convertimos con el método obtenerValor
            let valor = this.obtenerValor(dato.dato, clave);
            suma += valor * dato.cant;
          }
          cantidad += dato.cant;
        });

        // Calcular el promedio
        if (cantidad > 0) {
          this.promedios[clave] = (suma / cantidad).toFixed(1); // Limitar a 1 decimal
        } else {
          this.promedios[clave] = 0;
        }
      }
    });
  }

  // Método para obtener el valor numérico correspondiente según el tipo de clave
  obtenerValor(dato: string, clave: string): number {
    // Buscar el valor numérico correspondiente a cada dato
    const valorObj = this.valores.find((item: any) =>
      item.posiblesValores.includes(dato)
    );

    return valorObj ? valorObj.valor : 0; // Si no lo encuentra, retornamos 0
  }
  cambiarTexto(clave: string): string {
    return clave === 'atencion' ? 'atención' : clave;
  }
}
