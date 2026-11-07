# Resultado esperado — Mapa del área Gestión Financiera (Contabilidad y Tesorería)

Cliente ficticio de prueba: Comfama (caja de compensación familiar, Antioquia). Procesos: P-FIN-01 (escrito por otra persona), P-FIN-02, P-FIN-03, P-FIN-04.
Fuentes: `fixtures/transcripciones/P-FIN-02-sesion-1.vtt`, `P-FIN-03-sesion-1.vtt`, `P-FIN-04-sesion-1.vtt` (P-FIN-01 en su propio fixture). Los minutos (mm:ss) remiten a esos VTT.

## 1. Procesos del mapa

| Código | Proceso | Dueño | Hito de cierre |
|---|---|---|---|
| P-FIN-01 | Causación y pago a proveedores | Cuentas por pagar (Julián Restrepo como analista) | Pagos ejecutados; causación cerrada (día 3 hábil, según P-FIN-04) |
| P-FIN-02 | Conciliación bancaria | Paula Gaviria, Tesorera | Conciliación firmada enviada a Contabilidad día 5 hábil |
| P-FIN-03 | Recaudo y conciliación de aportes (4 %) | Natalia Bedoya, Coord. aportes y recaudo | Distribución del 4 % a Contabilidad día 4 hábil + reporte a Supersubsidio |
| P-FIN-04 | Cierre contable mensual | Luz Marina Ospina, Jefe de Contabilidad | Período cerrado OB52 día 8; EEFF día 10 hábil |

## 2. Relaciones esperadas (aristas del mapa)

| # | Origen → Destino | Objeto que fluye | Evidencia (archivo, mm:ss) |
|---|---|---|---|
| R1 | P-FIN-01 → P-FIN-02 | Pagos ejecutados + archivo/reporte de la corrida de pagos (correo, mismo día) | P-FIN-02 06:11; P-FIN-04 10:54 |
| R2 | P-FIN-02 → P-FIN-01 | Pagos rechazados para reverso y reprogramación (correo) | P-FIN-02 16:57 |
| R3 | P-FIN-02 → P-FIN-03 | Extracto cargado en SAP (FF_5) del que depende la aplicación de aportes; extracto de Davivienda | P-FIN-03 06:31, 06:46, 17:43 |
| R4 | P-FIN-02 → P-FIN-03 | Listado de partidas no identificadas filtrado "parece aporte" (día 5) | P-FIN-02 34:02; P-FIN-03 15:14, 16:41 |
| R5 | P-FIN-03 → P-FIN-02 | Aviso informal de partidas identificadas (chat, "cuando me acuerdo") | P-FIN-03 18:01; P-FIN-02 35:08 |
| R6 | P-FIN-02 → P-FIN-04 | Conciliación bancaria firmada (PDF + Excel) | P-FIN-02 32:35; P-FIN-04 05:12, 11:18 |
| R7 | P-FIN-03 → P-FIN-04 | Distribución del 4 % firmada y recaudo aplicado (día 4 hábil) | P-FIN-03 29:57; P-FIN-04 18:34 |
| R8 | P-FIN-01 → P-FIN-04 | Causaciones cerradas (exigidas día 3 hábil) + reporte causado/pendiente | P-FIN-04 06:21, 10:17 |
| R9 | P-FIN-03 → P-FIN-01 | Devoluciones de aportes aprobadas como solicitudes de pago | P-FIN-03 21:41 |
| R10 | P-FIN-04 → P-FIN-02 / P-FIN-01 | Reapertura de períodos OB52 a solicitud | P-FIN-02 37:58; P-FIN-04 17:16 |
| R11 | P-FIN-03 → (sin receptor confirmado) | Informe de mora mensual | Ver inconsistencia (d) |

Relaciones externas: operadores PILA (SOI, Aportes en Línea, Mi Planilla) → P-FIN-03; bancos → P-FIN-02/P-FIN-03; P-FIN-03 y P-FIN-04 → Superintendencia del Subsidio Familiar; Gestión humana (nómina) → P-FIN-04; P-FIN-04 → Dirección financiera y Revisoría fiscal.

## 3. Inconsistencias entre procesos que la IA del mapa debe detectar

### (a) Fecha de entrega de la conciliación bancaria
- P-FIN-02: "la conciliación debe estar el día cinco hábil" (Paula, **32:56**); Camilo: "el quinto día hábil… así está en el cronograma" (**33:06**); se reitera "nosotros entregamos el cinco" (**37:58**).
- P-FIN-04: "el auxiliar de bancos me tiene que entregar la conciliación bancaria el día tres hábil" (Luz Marina, **11:18**); el checklist muestra fecha compromiso día 3 (**31:20**).
- Esperado: conflicto de ANS/fecha entre salida de P-FIN-02 e insumo de P-FIN-04 (2 días hábiles de brecha), con efecto en reaperturas de período y en el incumplimiento del KPI de cierre.

### (b) Mismo rol con nombres distintos
- P-FIN-02: "Camilo es el analista de tesorería" (**03:51**).
- P-FIN-04: "Les presento a Camilo, el auxiliar de bancos" (**13:49**); también "el auxiliar de bancos" en **11:18** y "tesorería, auxiliar de bancos" en el checklist (**31:46**).
- Esperado: unificar como un solo rol (analista de tesorería = auxiliar de bancos, persona: Camilo Zapata). Nadie lo aclara en las sesiones.

### (c) Actividad duplicada: revisión de partidas no identificadas
- P-FIN-02: Camilo revisa cada partida no identificada en su Excel, llama al banco y avisa a aportes (**20:11**); reconoce que aportes también revisa (**21:05**, **21:23**); ha habido doble contabilización (**35:08**).
- P-FIN-03: Hernán revisa diariamente los abonos sin planilla en el portal y su propio Excel (**14:32**); Natalia confirma que Tesorería hace lo mismo y que no esperan su listado (**15:14**).
- Esperado: misma actividad ejecutada por dos roles en dos procesos, con dos Excel distintos, sin bandeja compartida; riesgo de doble aplicación y reprocesos.

### (d) Salida sin receptor: informe de mora
- P-FIN-03: el informe de mora mensual se envía a Contabilidad (Luz Marina) y a la Gerencia de servicios empresariales (**24:46**); "nunca nos han dicho nada" (**25:03**, **25:16**).
- P-FIN-04: al enumerar insumos, Luz Marina no lo menciona (**05:12**); ante la pregunta por otros insumos de aportes solo cita distribución y recaudo (**05:56**); la mora no se registra como cartera (**20:04**).
- Esperado: salida de P-FIN-03 sin consumidor en P-FIN-04 (posible desperdicio o receptor real fuera del área, por confirmar con servicios empresariales).

## 4. Otras observaciones de integración (deseables, no obligatorias)

- P-FIN-03 entrega la distribución el día 4 hábil sin esperar la conciliación del día 5 (P-FIN-03 30:07): los aportes identificados tarde pasan al mes siguiente y generan diferencias con Contabilidad (P-FIN-04 19:21) y con el reporte a la Super (P-FIN-03 33:59).
- Plazo de reclasificación de no identificadas: Tesorería duda entre 90 y 180 días (P-FIN-02 22:58); Contabilidad afirma 180 (P-FIN-04 15:50).
- Corte de CxP: P-FIN-04 exige día 3; Julián dice que en la práctica es día 4 a mediodía (P-FIN-04 06:36). Contrastar con el fixture de P-FIN-01.
- Dependencia de una sola persona (Camilo) en P-FIN-02, que alimenta P-FIN-03 y P-FIN-04 (P-FIN-02 40:23).
- Sistemas compartidos: SAP FF_5 (P-FIN-02 carga, P-FIN-03 consume), OB52 (P-FIN-04 controla, P-FIN-02 y P-FIN-01 solicitan reaperturas), F.13 (P-FIN-02 y P-FIN-03).
- Entrada no reconocida por el receptor: P-FIN-03 envía las devoluciones de aportes a Cuentas por pagar como solicitudes de pago, pero en las dos sesiones de P-FIN-01 nadie menciona recibir devoluciones de aportes. Esperado: la IA del mapa lo marca como interfaz por confirmar.
- Envío de la corrida a Tesorería: P-FIN-02 da por hecho que Julián envía el archivo de cada corrida el mismo día; P-FIN-01 solo describe que Tesorería aprueba en el portal bancario. Verificar si es la misma interfaz.
