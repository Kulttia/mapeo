# Resultado esperado — P-FIN-03 Recaudo y conciliación de aportes parafiscales (4 %)

Fuente: `fixtures/transcripciones/P-FIN-03-sesion-1.vtt` (sesión 1, ~50 min, 230 cues). Datos ficticios.
Participantes: Sara Montoya (facilitadora), Andrés Cárdenas (consultor), Natalia Bedoya (Coordinadora de aportes y recaudo, dueña), Hernán Vélez (analista de aportes).

## 1. Ficha esperada

| Campo | Valor esperado |
|---|---|
| Código | P-FIN-03 |
| Nombre | Recaudo y conciliación de aportes parafiscales (4 %) |
| Área / macroproceso | Gestión Financiera — Aportes y Recaudo |
| Dueño del proceso | Natalia Bedoya, Coordinadora de aportes y recaudo (equipo de 4 personas) |
| Ejecutor principal | Hernán Vélez, analista de aportes |
| Objetivo | Recaudar, identificar, aplicar y distribuir el aporte del 4 % de la nómina que pagan las empresas afiliadas vía PILA, gestionar devoluciones y mora, y reportar a la Superintendencia del Subsidio Familiar |
| Disparador | Llegada diaria (días hábiles) de los archivos de los operadores PILA y abono del giro en la cuenta recaudadora (no siempre el mismo día) |
| Frecuencia | Diaria (cargue, cruce, aplicación, sin identificar); mensual (mora, distribución, reporte a la Super); por demanda (devoluciones) |
| Antecesor(es) | Operadores de información PILA (SOI, Aportes en Línea, Mi Planilla y ~5 pequeños); bancos; **P-FIN-02 Conciliación bancaria** (extracto cargado en SAP por FF_5, extracto de Davivienda, listado de partidas no identificadas) |
| Insumos | Archivos planos PILA (SFTP/portal); extracto bancario (SAP o portal Bancolombia; Davivienda vía Tesorería); base de empresas afiliadas (sistema de afiliaciones); solicitudes de devolución (servicios empresariales); tabla de porcentajes de distribución (Planeación financiera) |
| Salidas | Recaudo aplicado en SAP; Excel de aportes sin identificar; solicitudes de pago de devoluciones a CxP; cartas de cobro persuasivo; **informe de mora mensual**; distribución del 4 % firmada; reporte mensual a la Superintendencia |
| Sucesor(es) | **P-FIN-04 Cierre contable** (distribución del 4 % y recaudo aplicado, día 4 hábil); **P-FIN-01 CxP** (devoluciones a pagar); Superintendencia del Subsidio Familiar; Gerencia de servicios empresariales (informe de mora, cobro/desafiliación) |
| Hito de cierre | Mensual: distribución del 4 % firmada y entregada a Contabilidad el día 4 hábil y reporte a la Superintendencia cargado (fecha pendiente) |
| Sistemas | SAP (transacción Z de cargue PILA —código pendiente—, F.13, FF_5 de Tesorería), portales/SFTP de operadores, portal Bancolombia (usuario de consulta), sistema de afiliaciones, plataforma de la Superintendencia, Excel (macro de cruce de operadores, Excel de sin identificar, Excel de distribución, Excel de mora con tablas dinámicas), correo, chat Teams, OneDrive |
| Volumetría | ~45.000 empresas aportantes activas; >50.000 planillas/mes; 3 operadores grandes + ~5 pequeños; 1–2 archivos rechazados/mes, 100–150 errores de registro/mes; 300–350 sin identificar nuevos/mes (Bancolombia) o ~400 con Davivienda; 80–100 sin identificar al cierre; ~80 devoluciones/mes (120 en enero); 3.000–4.000 empresas en mora/mes; ~10 casos/mes entre cajas; recaudo "varios cientos de miles de millones" (cifra pendiente) |
| Tiempos | Diario ~2 h; en el pico (día 2–10 hábil) todo el día; rechazo de archivo se corrige en 1–2 días; devoluciones "tratamos 15 días hábiles" (sin plazo oficial) |
| KPI | Solo recaudo vs. presupuesto (lo reporta Planeación). No hay KPI operativo de sin identificar ni de devoluciones; Hernán lleva conteo en Excel no reportado |
| Operación formal vs. real | Formal: cruce automático en SAP. Real: macro Excel de cruce; consulta directa al portal del banco; control de lotes duplicados en Excel; avisos a Tesorería por chat "cuando me acuerdo" |
| Dolores | Aportes sin identificar; dependencia de Excel/macros; descoordinación con Tesorería (doble revisión); archivos tardíos/erróneos de operadores pequeños; pico de la primera quincena con poco personal; diferencias entre reporte a la Super y contabilidad |
| Fuera de alcance | Cobro coactivo y desafiliación (servicios empresariales); acuerdos entre cajas solo como interfaz |

## 2. Actividades

| # | Actividad | Responsable | Sistema / transacción | Insumo | Salida |
|---|---|---|---|---|---|
| 1 | Descargar archivos PILA de cada operador | Analista de aportes (Hernán) | SFTP / portales de operadores | Archivos de operadores | Archivos planos |
| 2 | Cargar archivos y validar estructura; revisar log de errores | Analista de aportes | SAP transacción Z de cargue PILA (código pendiente) | Archivos planos, base de afiliados | CxC de aportes por empresa; log de errores; rechazo al operador por correo |
| 3 | Validar lote contra lista de lotes cargados (antiduplicado) | Analista de aportes | Excel | Número de lote del operador | Lote validado |
| 4 | Cruzar total del archivo contra el giro del operador en el extracto | Analista de aportes | Macro Excel "cruce de operadores"; extracto de SAP (FF_5 de Tesorería) o portal Bancolombia | Archivo + extracto | Resultado verde/amarillo/rojo; consulta al operador si no cuadra |
| 5 | Aplicar recaudo (compensar CxC contra abono) por lotes | Analista de aportes | SAP F.13 | Cruce cuadrado | Recaudo aplicado |
| 6 | Revisar diariamente abonos sin planilla (aportes sin identificar) | Analista de aportes | Portal Bancolombia, Excel de sin identificar, llamadas/correos | Extracto; listado de Tesorería (día 5) | Aportes identificados (planilla manual o asistida) y aplicados; aviso informal a Tesorería |
| 7 | Recibir y validar solicitudes de devolución (pago doble, otra caja, mayor valor, independiente no afiliado); cruzar deudas | Analista de aportes | SAP, correo | Solicitud vía servicios empresariales (carta, certificado bancario, soportes) | Solicitud validada |
| 8 | Aprobar devolución | Coordinadora (Natalia); > $20 millones posible segundo aprobador (pendiente) | Correo / firma | Solicitud validada | Devolución aprobada |
| 9 | Enviar devolución a CxP como solicitud de pago | Coordinadora / analista | Correo | Aprobación y soportes | Insumo para P-FIN-01 (pago en corrida normal) |
| 10 | Identificar empresas en mora (base afiliados vs. recaudado) y enviar cobro persuasivo | Analista de aportes | Sistema de afiliaciones, Excel, correo | Base afiliados, recaudo del mes | Cartas de cobro |
| 11 | Elaborar y enviar informe de mora mensual (2.ª semana) | Coordinadora / analista | Excel con tablas dinámicas + presentación, correo | Resultado de mora | Informe de mora → Contabilidad (Luz Marina) y Gerencia de servicios empresariales |
| 12 | Calcular distribución del 4 % (subsidio monetario, FOVIS, Foniñez, FOSFEC, contribución Supersubsidio, gastos de administración, reserva legal, servicios sociales) | Analista de aportes | Excel de distribución | Recaudo aplicado; tabla de porcentajes de Planeación | Distribución calculada |
| 13 | Revisar, firmar y entregar distribución a Contabilidad (día 4 hábil) | Coordinadora | Correo | Distribución | Insumo para P-FIN-04 |
| 14 | Preparar y cargar reporte mensual a la Superintendencia del Subsidio Familiar | Analista prepara; Coordinadora revisa y carga | Plataforma de la Superintendencia | Recaudo, empresas, trabajadores, distribución | Reporte cargado; comparación informal con Contabilidad por chat |

## 3. Casuísticas

- Archivo y plata llegan en días distintos (~04:08).
- Extracto aún no cargado por Tesorería (FF_5) → no se puede aplicar, atraso de 1–2 días (~06:46).
- Archivo con error de estructura → rechazo completo y reenvío del operador (~09:37); error por registro (NIT inexistente) → log y revisión manual (~09:59).
- Giro del operador no cuadra (dos días juntos, planilla anulada) → consulta al operador (~12:05).
- Abonos sin planilla → Excel de sin identificar, llamadas, planilla manual/asistida (~14:32).
- Davivienda: sin usuario de portal, depende del extracto de Tesorería (~17:43).
- Devoluciones: pago doble, empresa de otra caja, mayor valor, independiente no afiliado (~19:11); empresa con deuda → se cruza antes de devolver (~20:15).
- Empresa con tarifa progresiva mal marcada → menor valor que se vuelve mora (~31:44).
- Lote cargado dos veces (archivo repetido con otro nombre) → reverso; control manual de lotes (~34:46).
- Planillas de corrección asociadas a período cerrado → quedan en el mes actual (~41:24).
- Traslados entre cajas → coordinación manual por correo (~41:58).
- Aportes identificados tarde → diferencia entre reporte a la Super y Contabilidad (~33:59).

## 4. Contradicciones internas

| mm:ss | Tema | Versión A | Versión B |
|---|---|---|---|
| 20:35 / 20:43 | Aprobación de devoluciones > $20 millones | Natalia: ella aprueba todas, al director solo se informa | Hernán: también las firma el director administrativo (o gerente) |
| 33:10 / 33:15 | Fecha del reporte a la Superintendencia | Hernán: el 20 de cada mes, fijo | Natalia: cambió con nueva circular, "creo que el 15", no segura |
| 17:00 / 17:13 | Aportes sin identificar nuevos/mes | Hernán: 300–350 | Natalia: ~400 (Hernán aclara que solo contaba Bancolombia) |

## 5. Errores de transcripción

| mm:ss | Transcrito | Correcto |
|---|---|---|
| 03:37 y 08:02 | "soy" | SOI (operador) |
| 06:46 | "efe efe cinco" | FF_5 |
| 12:48 | "efe punto trece" | F.13 |
| 27:50 | "fo vis" | FOVIS |
| 27:50 | "fon niñez" | Foniñez |
| 28:10 | "fos fec" | FOSFEC |

## 6. Datos no dichos (deben quedar "Pendiente")

- Código de la transacción Z de cargue PILA (~09:12).
- Aprobador y cargo exacto para devoluciones > $20 millones (~20:43).
- Plazo oficial / ANS / plazo normativo de devoluciones (~22:34).
- Fecha exacta y circular del reporte a la Superintendencia (~33:15).
- Código del procedimiento (~43:55).
- Cifra de recaudo mensual (~05:56).
- Porcentajes vigentes de la distribución del 4 % (tabla de Planeación, ~28:37).
- KPI operativo (sin identificar, devoluciones): no existe.

## 7. Preguntas para la siguiente sesión

1. ¿Cuál es el código de la transacción Z y quién la mantiene?
2. ¿Quién aprueba formalmente las devoluciones mayores a $20 millones?
3. ¿Qué plazo normativo aplica a las devoluciones y cómo se mide?
4. ¿Cuál es la fecha vigente del reporte a la Superintendencia y qué circular aplica?
5. ¿Quién usa el informe de mora? ¿Contabilidad lo necesita? (Contabilidad no lo menciona como insumo.)
6. ¿Cómo se coordina con Tesorería la revisión de partidas no identificadas para evitar duplicidad y doble aplicación?
7. ¿Cómo se concilia la distribución del día 4 hábil con la conciliación bancaria que llega el día 5?
8. ¿Se puede obtener la tabla de porcentajes de distribución vigente?
