# Resultado esperado — P-FIN-02 Conciliación bancaria

Fuente: `fixtures/transcripciones/P-FIN-02-sesion-1.vtt` (sesión 1, ~45 min, 244 cues). Datos ficticios.
Participantes: Sara Montoya (facilitadora, Excelencia Operativa), Andrés Cárdenas (consultor), Paula Gaviria (Tesorera, dueña), Camilo Zapata (analista de tesorería).

## 1. Ficha esperada

| Campo | Valor esperado |
|---|---|
| Código | P-FIN-02 |
| Nombre | Conciliación bancaria |
| Área / macroproceso | Gestión Financiera — Tesorería |
| Dueño del proceso | Paula Gaviria, Tesorera |
| Ejecutor principal | Camilo Zapata, analista de tesorería |
| Objetivo | Garantizar que el saldo contable (SAP) de cada cuenta bancaria cuadre con el saldo del extracto, o que las diferencias estén explicadas y soportadas |
| Disparador | Cierre de mes y disponibilidad de extractos de todos los bancos (1.er día hábil del mes siguiente). En la práctica hay un cargue diario de la cuenta principal de Bancolombia |
| Frecuencia | Mensual (conciliación formal firmada) + diaria (cargue y revisión de la cuenta principal) |
| Antecesor(es) | P-FIN-01 Causación y pago a proveedores (pagos ejecutados, archivo plano de la corrida de pagos); bancos (extractos) |
| Insumos | Extractos bancarios (portales Bancolombia y Davivienda; Banco de Bogotá), reporte/archivo de la corrida de pagos de CxP (por correo), saldos y partidas abiertas SAP |
| Salidas | Conciliación bancaria firmada (PDF) + Excel; listado de partidas no identificadas filtrado para aportes; reportes de rechazos de pago a CxP; reclamos al banco |
| Sucesor(es) | P-FIN-04 Cierre contable mensual (recibe la conciliación); P-FIN-03 Recaudo y conciliación de aportes (recibe el listado de partidas no identificadas); P-FIN-01 (recibe rechazos para reversar y reprogramar) |
| Hito de cierre | Conciliación firmada (Tesorera + segundo firmante) enviada a Contabilidad el **día 5 hábil** |
| Sistemas | SAP (FF_5, FEBAN, FF67, F.13, FBL3N, FAGLB03), portal Sucursal Virtual Empresas Bancolombia, portal empresarial Davivienda, Excel (plantilla de conciliación, Excel de partidas pendientes, macro local para FF67), correo, chat Teams, WhatsApp con ejecutivo bancario, OneDrive |
| Volumetría | 23 cuentas según Paula / 27 según Camilo (pendiente); 35.000–40.000 movimientos/mes (≈20.000 en la recaudadora Bancolombia); Davivienda recaudadora 800–900 mov/mes; 15–20 % sin compensar automático en Bancolombia; 10–20 rechazos de pago/mes (hasta 40); 150–200 partidas no identificadas nuevas/mes, ~600 acumuladas; 3–4 reclamos de comisiones/mes; ~5 cheques/mes |
| Tiempos | Descarga de extractos 40–60 min; armado de la conciliación 3 días (Camilo) o 4 (Paula), del día 2 al 4 hábil; diario ~1 h; ~60 % del tiempo de Camilo; respuesta de bancos a reclamos 2–3 semanas |
| KPI | No existe formal. Paula sigue en Excel personal las partidas pendientes de más de 30 días; un indicador de oportunidad se propuso pero no se implementó |
| Operación formal vs. real | Formal: conciliación en SAP (reporte estándar) y cargue automático FF_5 para todas las cuentas. Real: conciliación en Excel; Davivienda registrada manual en FF67 con una macro local; extractos por WhatsApp cuando el portal falla; rechazos y avisos por correo/chat |
| Dolores | Partidas no identificadas acumuladas (observación de revisoría abierta); Davivienda no carga automático; dependencia de Excel y de una sola persona (sin respaldo); demora de CxP en reversar rechazos; reapertura de períodos al registrar notas tardías; doble revisión con aportes |
| Riesgos / controles | Segregación: Camilo prepara, Paula revisa; Camilo no aprueba pagos ni abre/cierra períodos. Control visual de lotes duplicados en el portal (manual). Sin umbral de materialidad |
| Fuera de alcance | Conciliación de inversiones (CDT, fiducias) |

## 2. Actividades

| # | Actividad | Responsable | Sistema / transacción | Insumo | Salida |
|---|---|---|---|---|---|
| 1 | Descargar extractos de cada cuenta (multicash) | Analista de tesorería (Camilo) | Portal Bancolombia Sucursal Virtual Empresas; portal empresarial Davivienda | Acceso a portales; si el portal falla, extracto por WhatsApp del ejecutivo | Archivos de extracto |
| 2 | Cargar extracto electrónico y aplicar reglas de contabilización/compensación | Analista de tesorería | SAP FF_5 | Extracto multicash (Bancolombia, Banco de Bogotá) | Partidas contabilizadas/compensadas automáticamente |
| 3 | Registrar manualmente extractos de Davivienda (6 cuentas) | Analista de tesorería | SAP FF67 + macro Excel local | Extracto Davivienda | Extracto manual registrado |
| 4 | Post-procesar partidas no compensadas | Analista de tesorería | SAP FEBAN | Partidas pendientes del cargue | Partidas contabilizadas o enviadas a Excel de pendientes |
| 5 | Conciliar pagos a proveedores contra la cuenta puente de pagos en tránsito | Analista de tesorería | SAP F.13 (o regla automática) | Archivo/reporte de corrida de pagos de CxP (P-FIN-01) | Pagos compensados |
| 6 | Gestionar pagos rechazados: informar a CxP para reverso y reprogramación | Analista de tesorería → Analista de CxP (Julián) | Correo | Devolución del banco | Solicitud de reverso a P-FIN-01; partida abierta hasta reverso |
| 7 | Revisar e identificar partidas no identificadas (consignaciones sin referencia) | Analista de tesorería | Excel de partidas pendientes, llamadas al banco | Partidas FEBAN | Partidas identificadas avisadas a aportes/áreas |
| 8 | Reclamar al banco comisiones no pactadas | Analista de tesorería | Correo al banco | Cargos del extracto | Caso de reclamo (registrado en Excel) |
| 9 | Registrar traslados entre cuentas propias | Analista de tesorería (traslado lo ejecuta la Tesorera en portal) | SAP / portal | Traslado del portal | Partida en tránsito (1 día) |
| 10 | Armar conciliación por cuenta (saldo extracto vs. libros + partidas conciliatorias) | Analista de tesorería | Excel (plantilla, hoja por cuenta); SAP FBL3N, FAGLB03 | Saldos SAP, extracto, Excel de pendientes | Conciliación en Excel + soportes en OneDrive |
| 11 | Revisar conciliación (partidas > 30 días, diferencias grandes); devolver si hay ajustes | Tesorera (Paula) | Excel, correo | Conciliación | Conciliación revisada o devuelta |
| 12 | Firmar digitalmente | Tesorera + segundo firmante (cargo pendiente) | PDF con firma digital | Conciliación revisada | Conciliación firmada |
| 13 | Enviar conciliación a Contabilidad (día 5 hábil) | Tesorera / analista | Correo | Conciliación firmada | Insumo para P-FIN-04 |
| 14 | Enviar listado de partidas no identificadas (filtrado "parece aporte") a aportes | Analista de tesorería | Correo / Excel | Excel de pendientes | Insumo para P-FIN-03 |

## 3. Casuísticas

- Portal bancario caído (Davivienda) → espera o solicitud del extracto por WhatsApp al ejecutivo de cuenta (~10:25).
- Extractos de Davivienda no legibles por FF_5 → registro manual por FF67 con macro (~11:53, ~13:04).
- Lote de pagos no coincide por rechazos (cuenta cancelada o errada) → aviso a CxP, reverso y reprogramación; partida abierta hasta semanas (~16:57).
- Pago duplicado (archivo subido dos veces, ~15 proveedores) detectado en la conciliación → recobro a proveedores; control visual en portal (~18:20).
- Partidas no identificadas → Excel, llamadas, aviso a aportes; reclasificación a pasivo por Contabilidad tras 90 o 180 días (~20:11, ~22:58).
- Doble aplicación de una partida (tesorería reclasifica y aportes aplica) → reverso de una (~35:08).
- Comisión no pactada → reclamo al banco, partida conciliatoria con número de caso (~24:28).
- Cheques no cobrados → partida conciliatoria por meses (~25:15).
- Traslados entre cuentas propias que salen viernes y entran lunes → partida en tránsito (~26:01).
- Período ya cerrado al registrar notas → solicitud de reapertura a Contabilidad (~37:36, ~37:58).
- Ausencia del analista (vacaciones) → conciliación entregada el día 9 hábil (~40:23).
- Meses pico (diciembre, enero) → mayor volumen sin compensar (~14:40).

## 4. Contradicciones internas

| mm:ss | Tema | Versión A | Versión B |
|---|---|---|---|
| 08:01 / 08:13 | Número de cuentas conciliadas | Paula: 23 cuentas | Camilo: 27 (incluye 4 de convenios y las del FOVIS). Se reitera la confusión en 38:40 |
| 11:43 / 11:53 | Cargue de extractos | Paula: todas las cuentas cargan automático por FF_5 | Camilo: Davivienda (6 cuentas) es manual por FF67 |
| 29:45 / 29:57 | Duración del armado | Camilo: 3 días | Paula: 4 días (menor) |

## 5. Errores de transcripción

| mm:ss | Transcrito | Correcto |
|---|---|---|
| 09:09 | "Banco Colombia" | Bancolombia |
| 11:15 | "efe efe guion bajo cinco" | FF_5 |
| 11:53 | "efe efe sesenta y siete" | FF67 |
| 14:07 | "fe van" | FEBAN |
| 16:18 | "efe punto trece" | F.13 |
| 27:29 | "efe ele be tres ene" | FBL3N (Camilo lo corrige en 27:50) |

## 6. Datos no dichos (deben quedar "Pendiente")

- Número exacto de cuentas bancarias en alcance (23 vs. 27) e inventario de cuentas.
- Cargo exacto del segundo firmante de la conciliación (~31:46).
- Plazo de reclasificación de partidas no identificadas: 90 o 180 días (~22:58).
- Código y versión del procedimiento documentado (~29:10).
- Umbral de materialidad para la revisión (~31:01).
- ANS con CxP para reversar rechazos: no existe (~17:56).
- Plazo para anular cheques no cobrados (~25:15).
- Fórmula/meta de un KPI: no existe.

## 7. Preguntas para la siguiente sesión

1. ¿Cuál es el inventario oficial de cuentas y cuáles entran en esta conciliación (convenios, FOVIS, Banco de Bogotá)?
2. ¿Qué cargo tiene hoy el segundo firmante tras la reestructuración?
3. ¿Qué dice la política sobre reclasificar partidas no identificadas (90 o 180 días)? Contabilidad dijo 180.
4. ¿Por qué Tesorería tiene el día 5 hábil si Contabilidad dice necesitarla el día 3? ¿Cuál es el cronograma vigente?
5. ¿Cómo unificar la revisión de partidas no identificadas con aportes (una sola bandeja)?
6. ¿Estado del requerimiento a tecnología para el formato de Davivienda en FF_5?
7. ¿Quién es el respaldo formal del analista y dónde se almacena la macro?
8. ¿Se puede definir un ANS con CxP para reversos de pagos rechazados?
