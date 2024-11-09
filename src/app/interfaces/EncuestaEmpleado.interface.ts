export interface EncuestaEmpleado {
    // Información básica sobre la encuesta
    empleadoId: string;    // Identificador del empleado
    fecha: Date;           // Fecha de la encuesta
    
    // Controles de la encuesta
    espacioTrabajo: string;   // Respuesta al espacio de trabajo (p.ej., bueno, regular, malo)
    imagenEspacio: string;    // URL de la imagen relacionada al espacio de trabajo
    
    // Pregunta con 'range'
    organizacionEspacio: number;   // Escala de 1 a 10
    
    // Pregunta con 'radio' (Sí/No)
    herramientasCompletas: boolean; // Si las herramientas estaban completas
    
    // Pregunta con 'checkbox' (varios seleccionables)
    tareasRealizadas: string[];    // Tareas realizadas (puede ser una lista de opciones seleccionadas)
    
    // Pregunta con 'select' (opciones de tipo dropdown)
    categoriaTrabajo: string;      // Categoría de trabajo (por ejemplo, cocina, atención al cliente, limpieza)
  
    // Opción para saltarse la encuesta (es opcional, puede ser un booleano)
    saltearEncuesta: boolean;      // Indica si se saltó la encuesta
  }
  