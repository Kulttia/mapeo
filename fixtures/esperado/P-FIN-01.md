# P-FIN-01 — Causación y pago a proveedores (salida esperada)

> Fixture de evaluación. Todo el contenido es ficticio. Fuentes:
> `transcripciones/P-FIN-01-sesion-1.vtt` (S1, 55:12, 322 cues) y `transcripciones/P-FIN-01-sesion-2.vtt` (S2, 35:08, 196 cues, una semana después).
> Los tiempos (mm:ss) son el inicio del cue en el VTT. Cuando S2 corrige o completa a S1, prevalece S2, pero la IA debe dejar rastro de la contradicción.

## 1. Ficha esperada

| Campo | Valor esperado |
|---|---|
| Nombre del proceso | Causación y pago a proveedores (cuentas por pagar) |
| Código | **Pendiente.** En S1 02:28 Sara dice que el proceso no tiene código asignado. "P-FIN-01" es solo el nombre del archivo y no se dice en la reunión. |
| Organización / Área | Comfama, Gestión Financiera (Contabilidad y Tesorería) |
| Dueño del proceso | Luz Marina Ospina, Jefe de Contabilidad (S1 20:34 en adelante) |
| Participantes / roles | Analista de cuentas por pagar (Julián Restrepo); Auxiliar de cuentas por pagar (Valentina Ríos, aparece en S2); Tesorera (Paula Gaviria) y una persona de su equipo que prepara el archivo; Jefe de Contabilidad; Director Financiero; coordinador (revisa la causación); Compras/Abastecimiento; almacén o sedes; Datos Maestros; Jurídica; Impuestos; área de Convenios; proveedor |
| Objetivo | No se enunció formalmente. Se puede inferir: causar y pagar oportunamente las facturas de proveedores con retenciones correctas. Marcarlo como inferido. |
| Disparador | Llega la factura electrónica del proveedor (zip con XML y PDF) al buzón de facturación electrónica (S1 03:30) |
| Antecesor | Compras/Abastecimiento crea el pedido (orden de compra) en SAP, y el almacén o la sede registra la entrada de mercancía (MIGO) (S1 03:55 a 04:09) |
| Hito de cierre | Factura pagada y compensada en SAP, soporte enviado y documentos archivados en el gestor documental (S1 33:10 a 33:28) |
| Sucesores | Conciliación bancaria (Tesorería) y cierre contable mensual (Contabilidad) (S1 33:54 a 34:00) |
| Sistemas | SAP (MIGO, MIRO, FB60, F110, bloqueo de pago, maestro de proveedores, aviso de pago, documento de compensación); plataforma del proveedor tecnológico de facturación (DIAN/RADIAN); buzón de correo de facturación; portales bancarios de Bancolombia y Davivienda; PSE; gestor documental; Excel local "control facturas pendientes"; WhatsApp; correo; chat de Teams |
| Volumetría | **1.640 facturas/mes de promedio en el último año, según reporte** (S2 02:46). Incluye facturas con y sin pedido y servicios públicos; no incluye notas crédito. Cifras anteriores: Julián, unas 1.800 (S1 16:38, con duda); Luz Marina, unas 1.500 en un mes normal y más de 2.000 en diciembre (S1 43:14). Diciembre: **pendiente**. Otras cifras: unas 200 facturas represadas en cada cierre (S2); 20 a 30 correos de soporte por semana (sin contar); 6 o 7 embargos activos; 10 a 15 cuentas de convenios al mes; 15 a 20 áreas o sedes que reciben recordatorios. |
| Tiempos | Unos 8 min por factura con pedido para verificar y causar (S1 17:00; S2 aclara que es solo eso); de 30 min a 1 h cuando la factura tiene novedad; 2 a 3 min de recepción por factura (Valentina, S2); espera por la entrada de mercancía, de 0 días a 1 mes; datos bancarios de un proveedor nuevo, de 2 a 3 días hasta semanas; recordatorios, toda la mañana del lunes; convenios, hasta 1 mes de punta a punta |
| Frecuencia de pago | Ciclos martes y jueves. En semana con festivo el pago se corre al miércoles (S2 07:48). |
| Indicadores (KPI) | **No hay indicador formal.** "Luz Marina mira algo de días de pago pero no es oficial" (S1 47:11). |
| ANS | **Pendiente / no definido.** S1: nadie sabe si existe (48:00, 48:49). S2 17:15: el manual de contratación remite al contrato (normalmente 30 días) y no hay un ANS del proceso. |
| Normatividad / controles mencionados | DIAN (factura electrónica, CUFE, validación previa), eventos RADIAN (aceptación tácita a los 3 días hábiles), revisoría fiscal (correo como soporte de aprobación), Superintendencia (fondos de destinación específica), circular mensual con fecha de corte de facturación (normalmente el día 25), manual de contratación |

## 2. Actividades esperadas

| # | Actividad | Responsable | Sistema / transacción | Insumo | Salida |
|---|---|---|---|---|---|
| 0 (antecesor) | Crear el pedido (orden de compra) y registrar la entrada de mercancía | Compras/Abastecimiento; almacén o sede | SAP (pedido, MIGO) | Necesidad de compra o recepción del bien | Pedido y entrada en SAP |
| 1 | Recibir la factura electrónica en el buzón y descargar el XML y el PDF | Auxiliar de CxP (Valentina, desde hace 2 meses según la corrección de S2; en S1 Julián dice que lo hace él) | Buzón de facturación electrónica (correo) | Correo del proveedor con zip | Factura recibida |
| 2 | Validar ante la DIAN (CUFE, validación previa) y registrar el acuse de recibo. Si la factura no es válida, se rechaza y se registra el reclamo. | Auxiliar de CxP | Plataforma del proveedor tecnológico / RADIAN | XML de la factura | Factura validada y acuse registrado (o reclamo al proveedor) |
| 3 | Verificar la factura contra el pedido y la entrada de mercancía (cantidades y precios, con tolerancia de redondeo) | Analista de CxP (Julián) | SAP (pedido, MIGO) | Factura, pedido, entrada | Factura conforme, o novedad registrada en el Excel y escalada a Compras |
| 4 | Gestionar la novedad: solicitar entrada, pedido o corrección a Compras, la sede o el área | Analista de CxP | Correo, grupo de WhatsApp, Excel "control facturas pendientes" | Novedad | Novedad resuelta, o la factura sigue en espera |
| 5 | Registrar el evento de recibo del bien o servicio | Auxiliar de CxP, cuando el analista confirma la entrada (en teoría debería hacerlo quien recibe) | Plataforma / RADIAN | Entrada confirmada | Evento registrado |
| 6 | Causar la factura: MIRO si tiene pedido, FB60 si no tiene | Analista de CxP | SAP MIRO / FB60 | Factura verificada | Documento contable de la factura |
| 7 | Calcular y revisar las retenciones (retención en la fuente, ReteICA por municipio, ReteIVA) | Analista de CxP (Impuestos valida casos especiales) | SAP (indicadores de retención del maestro de proveedores), con ajustes manuales | Factura, maestro de proveedores | Retenciones aplicadas |
| 8 | Aprobar según el monto. Aplica a facturas sin pedido y a excepciones; las que tienen pedido ya traen la aprobación de compras. Hasta 50 M aprueba la Jefe de Contabilidad (el coordinador revisa antes); más de 50 M aprueba el Director Financiero, después de una revisión previa de la Jefe. | Coordinador (revisa), Jefe de Contabilidad, Director Financiero | Correo, con bloqueo de pago en SAP | Factura causada con bloqueo | Aprobación por correo |
| 9 | Liberar el bloqueo de pago y archivar el correo de aprobación | Analista de CxP | SAP; gestor documental (a veces el correo queda solo en el buzón del analista) | Correo de aprobación | Partida liberada para pago |
| 10 | Registrar la aceptación expresa (evento RADIAN) | Auxiliar de CxP (con la lista que le pasa el analista al final del día) | Plataforma / RADIAN | Factura causada | Aceptación expresa (si pasan 3 días hábiles, queda aceptada tácitamente) |
| 11 | Ejecutar y revisar la propuesta de pago el día anterior al ciclo: partidas vencidas, proveedores bloqueados, valores, liquidez. Se excluyen las partidas con problemas. | Tesorería | SAP F110 | Partidas vencidas y liberadas | Propuesta revisada |
| 12 | Ejecutar el pago y generar el archivo plano (martes y jueves) | Tesorería | SAP F110 | Propuesta aprobada | Archivo plano |
| 13 | Cargar el archivo en el portal bancario (preparador) | Persona del equipo de Tesorería | Portal Bancolombia / Davivienda | Archivo plano | Lote cargado |
| 14 | Aprobar el lote en el portal con dos firmas | Tesorera + segundo aprobador (**cargo pendiente**) | Portal bancario | Lote cargado | Pago ejecutado por el banco |
| 15 | Gestionar la respuesta del banco: los rechazos (cuenta errada o inactiva) se reversan en SAP y se pide una certificación bancaria nueva | Tesorería / Analista de CxP / Datos Maestros | SAP, portal | Respuesta del banco | Pagos exitosos aplicados, rechazos en gestión |
| 16 | Enviar el soporte de pago al proveedor: aviso automático de SAP, y comprobante del banco enviado a mano cuando el proveedor lo pide | SAP (automático); Analista de CxP / Tesorería (manual) | SAP aviso de pago; correo | Pago ejecutado | Proveedor notificado |
| 17 | Archivar la factura y los soportes; la factura queda compensada | Auxiliar / Analista de CxP | Gestor documental; SAP | Documentos | Expediente archivado y factura compensada (hito de cierre) |
| Sucesor | Conciliación bancaria; cierre contable mensual (provisión de entradas sin factura en la cuenta puente) | Tesorería; Contabilidad | SAP | — | — |

Actividad transversal (operación real): cada lunes el analista revisa el Excel y envía recordatorios por correo, a mano, a 15–20 áreas o sedes; si no responde nadie, insiste por WhatsApp.

## 3. Casuísticas esperadas

1. **Factura sin pedido.**
   - Las que legítimamente no llevan pedido (servicios públicos, arrendamientos, algunos honorarios) se causan por FB60.
   - Las que debían tener pedido se devuelven al área para que lo gestione con Compras. Si el servicio ya se consumió, se pide una excepción y se causa por FB60 con autorización del jefe del área y de la Jefe de Contabilidad.
   - Es el dolor número uno.
2. **La factura no cruza con la entrada** (diferencia de cantidad o de precio). Compras ajusta el pedido o el proveedor envía una nota crédito. La espera queda en el Excel y en el WhatsApp.
3. **Proveedor nuevo sin datos bancarios.** La F110 lo excluye de la propuesta. Se persigue la certificación bancaria y Datos Maestros la carga.
4. **Pago rechazado por el banco** (cuenta errada o inactiva). Se reversa en SAP y se actualiza la certificación.
5. **Anticipos.** Se hace una solicitud de anticipo en SAP contra el pedido y se paga por la F110. Cuando llega la factura hay que cruzarlo; se ha pagado doble por olvido. El control está en una pestaña del Excel.
6. **Notas crédito.**
   - Llegan por el buzón y se les hace el acuse.
   - Con pedido: MIRO, con el indicador de abono posterior, contra la factura original.
   - Sin pedido: FB60 como abono, la registra la auxiliar (aclaración de S2).
   - Si la factura ya se pagó, el saldo a favor se cruza con la siguiente factura o se pide que el proveedor consigne.
7. **Servicios públicos** (EPM, acueductos municipales, todas las sedes). Se causan por FB60 sin pedido. Se pagan por débito automático, o Tesorería las paga por PSE fuera de la F110 por la fecha de vencimiento.
8. **Pagos urgentes fuera del ciclo.**
   - Se hace una propuesta individual en la F110, o un pago manual en el portal que luego se registra en SAP.
   - Si el monto es grande, lo autoriza la dirección.
   - **No hay umbral definido.**
9. **Fondos de destinación específica (FOVIS, Foniñez).**
   - Se causan con el centro de costos o fondo correspondiente.
   - Se pagan desde la cuenta propia del fondo, con una vía de pago distinta en la F110 y en una propuesta aparte (aprobadores posiblemente distintos, pendiente).
   - Las facturas pueden llegar mezcladas o sin identificar el fondo. Pagar desde la cuenta equivocada es un hallazgo de la Superintendencia.
10. **Factura rechazada en la validación DIAN.** Se registra el reclamo en la plataforma y se pide la corrección al proveedor. Es poco frecuente.
11. **Retenciones mal calculadas.** El indicador o el concepto está mal, o el ReteICA es de otro municipio. Exige reproceso: anular, ajustar y volver a causar. A menudo lo detecta el proveedor cuando reclama.
12. **Cierre de mes.** Avalancha de facturas, fecha de corte (circular, día 25) que no se respeta, unas 200 facturas represadas, provisión en la cuenta puente.
13. **Nuevo en S2: embargos a proveedores.**
    - El oficio del juzgado o la DIAN llega a Jurídica, que lo pasa a Contabilidad.
    - Se bloquea el pago al proveedor en el maestro de SAP.
    - Se consigna, como pago manual de Tesorería, en la cuenta de depósitos judiciales del Banco Agrario hasta el límite del oficio; el saldo se paga al proveedor partiendo el pago a mano.
    - El control va en una pestaña del Excel. El levantamiento llega por otro oficio vía Jurídica.
14. **Nuevo en S2: cuentas por pagar a otras cajas por convenios** (recreación, turismo).
    - La otra caja envía una cuenta de cobro o factura sin pedido, que se causa por FB60 contra la cuenta de convenios.
    - Antes de causar, se valida con el área de Convenios la liquidación del convenio, y con Impuestos el tratamiento tributario (ReteICA).
    - Se paga por la F110 o se cruzan cuentas con un documento de compensación en SAP.
    - Son 10 a 15 al mes, de montos altos.

## 4. Contradicciones que deben detectarse

| # | Tema | Afirmación A | Afirmación B | Estado tras S2 |
|---|---|---|---|---|
| C1 | Quién aprueba más de 50 M | Julián, S1 **23:17**: "por encima de cincuenta millones las firma la Jefe de Contabilidad" | Luz Marina, S1 **44:09**: "Por encima de cincuenta millones eso lo aprueba el Director Financiero" | **Resuelta** en S2 **05:09**: hasta 50 M aprueba la Jefe de Contabilidad y por encima de 50 M el Director Financiero. Julián se confundió porque la Jefe hace una revisión previa. |
| C2 | Día de pago | Paula, S1 **25:12**: "Los ciclos de pago son martes y jueves" | Julián, S1 **31:38**: "los pagos salen los miércoles" | **Resuelta** en S2 **07:48**: martes y jueves; el miércoles es solo en semana con festivo. |
| C3 | Volumen mensual | Julián, S1 **16:38**: unas 1.800/mes | Luz Marina, S1 **43:14**: más de 2.000 en diciembre y unas 1.500 en un mes normal | **Parcial.** S2 **02:46** da el promedio del último año (1.640) y Julián lo explica en S2. **El dato de diciembre queda sin resolver** (S2 03:55: "Eso no lo tengo separado"). |
| C4 (menor, corrección) | Quién hace la recepción del buzón y los eventos RADIAN | Julián, S1 **05:45**: "Yo lo reviso todos los días" | Valentina, S2 **10:08 a 10:18**: desde hace dos meses lo hace ella | **Resuelta** en S2 (prevalece S2). |
| C5 (menor, precisión) | Registro de notas crédito | Julián, S1 ~36:40: las registra él contra la factura original | Julián, S2 **29:32**: con pedido, MIRO con abono posterior; sin pedido, Valentina por FB60 | **Precisada** en S2. |

Una IA que solo lea S1 debe marcar C1, C2 y C3 como contradicciones abiertas. Con S1 y S2, debe dejar C1 y C2 resueltas y C3 abierta en cuanto a diciembre.

## 5. Errores de transcripción sembrados

| Sesión / tiempo | Texto en el VTT | Corrección |
|---|---|---|
| S1 06:27 | "eventos en radián" | RADIAN |
| S2 10:18 | "eventos en radian" | RADIAN |
| S1 09:10 | "miro que tenga la amigo hecha" | MIGO (la entrada de mercancía) |
| S1 14:11 | "la causo por la mi ro" | MIRO |
| S1 14:32 | "por la f b sesenta" | FB60 |
| S2 23:24 | "por la efe be sesenta" | FB60 |
| S1 18:03 | "rete y ca" | ReteICA |
| S1 19:35 | "el rete y ca depende del municipio" | ReteICA |
| S2 25:23 | "se les aplica rete y ca" | ReteICA |
| S1 18:03 | "rete IVA" | ReteIVA |
| S1 24:56 | "la efe ciento diez" | F110 |
| S1 26:42 | "la F ciento diez" | F110 |
| S1 40:24 | "fon niñez" | Foniñez |
| S1 41:26 | "facturas de foninis" | Foniñez |
| S2 26:25 | "lo de foninis" | Foniñez |

En la ficha y en el BPMN la IA debe usar la forma corregida (MIGO, MIRO, FB60, F110, RADIAN, ReteICA, ReteIVA, Foniñez).

## 6. Datos que NO se dijeron (deben quedar como "Pendiente", sin inventar)

1. **Código del proceso.** Se dijo explícitamente que no tiene (S1 02:28). No debe inventarse ni copiarse "P-FIN-01" del nombre del archivo como si fuera oficial.
2. **ANS formal.** No existe ni está definido (S1 48:00 y 48:49; S2 17:15). Solo se menciona el plazo contractual, normalmente de 30 días.
3. **Cargo exacto del segundo aprobador en el portal bancario.** Paula no lo sabe (S1 27:59) y en S2 tampoco lo confirma (09:00). Tampoco se sabe si es el mismo en Bancolombia, en Davivienda y en las cuentas de los fondos.
4. **Umbral o monto de los pagos urgentes.** No hay número; es criterio caso a caso (S1 39:11; S2 15:53).
5. **Ubicación del Excel de control.** No se dijo en S1: Julián empieza a responder en 13:33, lo interrumpen y en 54:10 lo aplaza. **Se resuelve en S2 14:15:** OneDrive de Julián (empresa), carpeta "cuentas por pagar", compartido con Valentina. Con solo S1 debe quedar pendiente.
6. **Volumen de diciembre / mes a mes.** Sin dato confirmado.
7. Otros datos no dichos que la IA no debe inventar:
   - el monto de la tolerancia de precio en SAP;
   - el número de facturas de servicios públicos;
   - el nombre del proveedor tecnológico de facturación y del gestor documental;
   - el porcentaje de facturas sin pedido;
   - el porcentaje de reclamos por retenciones ("la mitad" es solo una percepción);
   - el nombre o cargo del coordinador;
   - el objetivo formal del proceso;
   - las tarifas de retención.

## 7. Preguntas razonables para la siguiente sesión

1. ¿Qué cargo exacto tiene el segundo aprobador en los portales de Bancolombia y Davivienda? ¿Es el mismo para las cuentas de FOVIS y Foniñez?
2. ¿Cuál es el criterio o monto para que un pago sea urgente fuera del ciclo, y quién de la dirección lo autoriza?
3. ¿Cuántas facturas hay mes a mes, en particular en diciembre y en los meses de cierre?
4. ¿Qué porcentaje de facturas llega sin pedido y cuántas son excepciones causadas por FB60?
5. ¿Cuántas facturas de servicios públicos hay al mes y cuáles van por débito automático y cuáles por PSE?
6. ¿Se van a definir indicadores (días de pago, facturas pendientes, reprocesos por retenciones) y un ANS interno con Compras y las sedes para registrar la entrada de mercancía?
7. ¿Cómo se respalda el Excel de control (hoy en el OneDrive personal) y quién lo consulta además del equipo de CxP?
8. ¿Cuál es el procedimiento formal para levantar un embargo? ¿Cómo se controla el límite consignado al juzgado?
9. ¿Quién mantiene los indicadores de retención en el maestro de proveedores? ¿Hay validación de Impuestos al crear un proveedor?
10. ¿Por qué el evento de recibo del bien lo registra Cuentas por Pagar y no quien recibe? ¿Preocupa la aceptación tácita de las facturas en espera?
11. ¿Cuánto mide la tolerancia de precio configurada en SAP?
12. ¿Qué convenios con otras cajas se compensan, y con qué periodicidad?
