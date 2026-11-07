// bpmn-moddle no expone tipos en su entrada principal; basta lo que usan las pruebas.
declare module "bpmn-moddle" {
  export type ElementoModdle = { $type: string; id?: string; [clave: string]: unknown };

  export type ResultadoImportacion = {
    rootElement: ElementoModdle;
    warnings: { message: string }[];
    elementsById: Record<string, ElementoModdle>;
    references: unknown[];
  };

  export class BpmnModdle {
    constructor(paquetes?: Record<string, unknown>);
    fromXML(xml: string, tipo?: string): Promise<ResultadoImportacion>;
  }
}
