# Resultado esperado — P-FIN-04 Cierre contable mensual

Fuente: `fixtures/transcripciones/P-FIN-04-sesion-1.vtt` (sesión 1, ~40 min, 198 cues). Datos ficticios.
Participantes: Sara Montoya (facilitadora), Andrés Cárdenas (consultor), Luz Marina Ospina (Jefe de Contabilidad, dueña), Julián Restrepo (analista de cuentas por pagar), Camilo Zapata (presentado como "auxiliar de bancos", entra 13:49 y sale 18:21).

## 1. Ficha esperada

| Campo | Valor esperado |
|---|---|
| Código | P-FIN-04 |
| Nombre | Cierre contable mensual |
| Área / macroproceso | Gestión Financiera — Contabilidad |
| Dueño del proceso | Luz Marina Ospina, Jefe de Contabilidad (equipo de 5 analistas contables) |
| Objetivo | Cerrar el período contable mensual y emitir estados financieros oportunos y confiables |
| Disparador | Último día hábil del mes: envío por correo del cronograma de cierre (checklist Excel en SharePoint) |
| Frecuencia | Mensual (el cierre anual de diciembre queda fuera de alcance) |
| Antecesor(es) | **P-FIN-01** (causaciones cerradas día 3 hábil); **P-FIN-02** (conciliación bancaria, exigida día 3 hábil); **P-FIN-03** (distribución del 4 % y recaudo aplicado, día 4 hábil); Gestión humana (nómina por interfaz, día 2 hábil); activos fijos; negocios (inventarios de hoteles) |
| Insumos | Confirmación de cierre de causación + reporte de causado/pendiente; conciliación bancaria; distribución del 4 % firmada; nómina; novedades de activos fijos. **No menciona el informe de mora** |
| Salidas | Período cerrado en OB52; estados financieros y notas; análisis de cuentas con soportes; reporte financiero a la Superintendencia (fecha pendiente) |
| Sucesor(es) | Dirección financiera; Revisoría fiscal; Superintendencia del Subsidio Familiar |
| Hito de cierre | Período cerrado en OB52 (día 8 hábil) y estados financieros enviados el **día 10 hábil** (el procedimiento dice día 7) |
| Sistemas | SAP (OB52, FB50, AFAB, FAGLB03, FBL3N), Excel (checklist en SharePoint, Excel personal de pendientes, diferidos, provisiones, análisis de cuentas, macro local de consolidación), correo, grupo de chat de cierre en Teams |
| Volumetría | 3.500–4.000 facturas causadas/mes (CxP); 3–5 reaperturas de período/mes; checklist de "cuarenta y pico" actividades; 5 analistas; asientos manuales: "muchos" (pendiente) |
| Tiempos | Apertura día 1 hábil; nómina día 2; CxP día 3 (real día 4 a mediodía); conciliación día 3 (real día 5–6); distribución día 4; depreciación día 4–5; cierre OB52 día 8; EEFF día 10 |
| KPI | Sí existe: oportunidad del cierre (día hábil de entrega de EEFF), meta día 10, en el tablero de la dirección financiera; cumplido 8 de 12 meses. Fórmula exacta pendiente (envío vs. aprobación) |
| Operación formal vs. real | Formal: checklist en SharePoint y cierre día 7. Real: chat de Teams, Excel personal, correos, reaperturas por chat sin formato, cierre día 8 y EEFF día 10 |
| Dolores | Insumos tardíos (sobre todo bancos y CxP); mucho Excel (diferidos, provisiones, análisis); reaperturas de período; aprobaciones tardías de facturas por las áreas; diferencias en la distribución vs. recaudo contable |
| Fuera de alcance | Cierre anual; proceso de impuestos (retenciones/IVA) |

## 2. Actividades

| # | Actividad | Responsable | Sistema / transacción | Insumo | Salida |
|---|---|---|---|---|---|
| 1 | Enviar cronograma de cierre (último día hábil) | Jefe de Contabilidad | Correo; checklist Excel en SharePoint | Calendario | Cronograma a las áreas |
| 2 | Abrir período del mes nuevo (dejando abierto el que cierra) | Jefe de Contabilidad | SAP OB52 | Cronograma | Período nuevo abierto |
| 3 | Cerrar causación de facturas del mes anterior y confirmar por correo | Analista de CxP (Julián) | SAP, correo | Facturas electrónicas aprobadas | Confirmación + reporte de causado/pendiente |
| 4 | Provisionar facturas grandes llegadas después del corte | Jefe de Contabilidad | SAP (asiento manual), Excel | Facturas tardías | Provisión (se reversa el mes siguiente) |
| 5 | Bloquear período para cuentas de proveedores | Jefe de Contabilidad | SAP OB52 | Confirmación de CxP | Período bloqueado para CxP |
| 6 | Recibir conciliación bancaria (día 3) o revisar saldos de bancos sin ella | Jefe de Contabilidad / "auxiliar de bancos" | Correo; SAP vs. extractos | Conciliación (P-FIN-02) | Ajustes de bancos (notas, comisiones Davivienda, intereses) |
| 7 | Reclasificar partidas no identificadas > 180 días a recaudos por identificar (trimestral) | Analistas contables | SAP | Conciliación bancaria | Reclasificación al pasivo |
| 8 | Registrar asiento de distribución del 4 % y validar contra recaudo contable | Analista contable | SAP FB50; Excel de diferencias | Distribución firmada (P-FIN-03) | Asiento de distribución; explicación de diferencias |
| 9 | Validar nómina recibida por interfaz | Analistas contables | SAP | Nómina (Gestión humana) | Nómina validada |
| 10 | Verificar altas/bajas y correr depreciación | Analista de activos / analista contable | SAP AFAB | Novedades de activos | Depreciación registrada |
| 11 | Calcular y registrar amortización de diferidos y provisiones | Analistas contables | Excel + asiento manual SAP | Excel de diferidos por contrato | Asientos manuales |
| 12 | Analizar cuentas asignadas y reclasificar | Analistas contables | SAP FAGLB03, FBL3N; Excel | Saldos | Análisis por cuenta con soportes en carpeta de cierre |
| 13 | Revisar cuentas principales y balance de prueba (vs. mes anterior y mismo mes año anterior) | Jefe de Contabilidad | SAP, Excel | Análisis | Variaciones explicadas |
| 14 | Atender reaperturas de período (3–5/mes) | Jefe de Contabilidad | SAP OB52; correo/chat | Solicitudes de áreas | Período reabierto/cerrado (sin control formal) |
| 15 | Cerrar período (día 8 hábil) | Jefe de Contabilidad | SAP OB52 | Balance revisado | Período cerrado |
| 16 | Preparar EEFF y notas y enviar a dirección financiera y revisoría (día 10) | Jefe de Contabilidad | Excel / correo | Balance cerrado | EEFF firmados (contadora, revisor fiscal, representante legal) |
| 17 | Reportar información financiera a la Superintendencia | Analista contable | Plataforma de la Super | EEFF | Reporte (fecha pendiente) |

## 3. Casuísticas

- Factura que llega después del corte → se causa el mes siguiente o se provisiona si es grande (~07:42).
- CxP pide plazo de excepción (cierre real día 4 a mediodía) (~06:36, ~07:11).
- Conciliación bancaria tardía → revisión de saldos "por encima" y ajustes posteriores o reapertura (~11:44).
- Reaperturas de período por bancos, CxP o nómina, solicitadas por correo/chat (~17:16).
- Distribución del 4 % no cuadra exacto con el recaudo contable → hoja de diferencias, consulta a aportes (~19:21).
- La mora no se registra como cartera (los aportes se reconocen al recibirse) (~20:04).
- Depreciación corrida dos veces → reverso; control en checklist (~34:35).
- Asientos de provisión duplicados no reversados; facturas en período equivocado (~34:35).
- Aprobaciones de facturas por las áreas tardías (~35:24).

## 4. Contradicciones internas

| mm:ss | Tema | Versión A | Versión B |
|---|---|---|---|
| 06:21 / 06:36 | Día de cierre de causación de CxP | Luz Marina: día 3 hábil (excepciones puntuales) | Julián: en la práctica día 4 a mediodía, "casi siempre" (07:11) |
| 25:05 / 25:18 | Fecha de cierre | Luz Marina: período día 8, EEFF día 10 | Julián: "el cierre era el día ocho"; además el procedimiento dice día 7 (25:31) |
| 15:50 / 16:04 | Plazo de reclasificación de no identificadas | Luz Marina: 180 días, en la política contable | Camilo: "Paula dice que son noventa" |

## 5. Errores de transcripción

| mm:ss | Transcrito | Correcto |
|---|---|---|
| 04:12 | "o be cincuenta y dos" | OB52 |
| 18:59 | "efe be cincuenta" | FB50 |
| 20:51 | "a fab" | AFAB |
| 22:58 | "fa ge ele be cero tres" | FAGLB03 |

## 6. Datos no dichos (deben quedar "Pendiente")

- Código del procedimiento de cierre (lo busca Luz Marina).
- Umbral para provisionar facturas tardías (~08:27).
- Número de asientos manuales por cierre (~22:33).
- Cargo exacto del representante legal que firma los EEFF mensuales (~26:14).
- Fecha y alcance del reporte financiero a la Superintendencia (~26:57).
- Ficha del KPI de oportunidad (¿se mide sobre envío o aprobación?) (~32:52).
- Registro/control formal de reaperturas (~17:46).

## 7. Preguntas para la siguiente sesión

1. ¿El día 3 hábil para la conciliación bancaria está acordado con Tesorería? (Tesorería afirma que su compromiso es el día 5.)
2. ¿Es "auxiliar de bancos" un cargo distinto de "analista de tesorería" o es la misma persona/rol (Camilo)?
3. ¿Cuál es el corte formal de CxP (día 3 o día 4 a mediodía) y cómo se aprueban las excepciones?
4. ¿Contabilidad usa el informe de mora que envía aportes? ¿Para qué?
5. ¿Qué umbral se usa para provisionar facturas tardías?
6. ¿Cuántos asientos manuales hay por cierre y cuáles podrían automatizarse (diferidos)?
7. ¿Quién firma los EEFF mensuales como representante legal tras la reestructuración?
8. ¿Cómo se controlan y registran las reaperturas en OB52?
