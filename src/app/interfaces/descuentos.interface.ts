export interface Descuento {
    idMesaActual: string;       
    idCliente: string;            
    ventasIds: string[];         
    id: string;                   
    estaUsado: boolean;           
    porcentajesDescuento: 10 | 15 | 20; 
}