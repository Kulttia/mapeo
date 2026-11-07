# Mapeo

Plataforma para levantar procesos desde reuniones de Microsoft Teams: sube la transcripción, la IA propone el levantamiento AS IS, el equipo lo revisa, se convierte en un flujo BPMN 2.0 y se integra en el mapa del área.

- **Guía para usuarios (no técnica):** [docs/GUIA.md](docs/GUIA.md)
- **Arquitectura:** [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)

Los datos de ejemplo (área "Gestión Financiera", personas y reuniones) son ficticios.

## Qué hace

1. **Subir** una transcripción de Teams (.docx, .vtt o .txt) y asociarla a un área y un proceso.
2. **Levantar**: Claude extrae la ficha del proceso, actividades, casuísticas, diagnóstico y pendientes, cada dato con su cita al minuto de la reunión. Varias sesiones alimentan la misma ficha.
3. **Revisar**: aceptar, rechazar o corregir cada dato con la transcripción al lado y validar el levantamiento.
4. **Modelar**: generar el flujo BPMN 2.0 (un carril por responsable, una compuerta por casuística), ajustarlo en el editor y descargarlo para Bizagi Modeler.
5. **Integrar**: ver cómo se conectan los procesos del área, las inconsistencias entre ellos y quién participa en qué.

## Arrancar en local

Requisitos: Node.js 20 o superior.

```bash
git clone https://github.com/Kulttia/mapeo.git
cd mapeo
npm install
cp .env.example .env.local   # y completa los valores
npm run db:setup             # crea las tablas y carga el área de ejemplo
npm run dev                  # http://localhost:3000
```

Sin `DATABASE_URL` la app usa PGlite (Postgres embebido) en `~/.mapeo/pglite`: no hay que instalar base de datos.

### Variables de entorno

| Variable | Para qué | Obligatoria |
|---|---|---|
| `ANTHROPIC_API_KEY` | Llamar a Claude (console.anthropic.com) | Para usar la IA |
| `MAPEO_CLAVE_PILOTO` | Clave que se pide para subir transcripciones y lanzar la IA | Sí |
| `DATABASE_URL` | Postgres en la nube (Neon, Azure, etc.) | En producción |
| `MAPEO_MODELO_IA` | Modelo de Claude; por defecto `claude-haiku-5-5` | No |

## Desplegar en Vercel

1. Importa el repositorio en Vercel (framework Next.js).
2. En *Storage* agrega una base Neon: Vercel crea `DATABASE_URL`.
3. Agrega `ANTHROPIC_API_KEY` y `MAPEO_CLAVE_PILOTO` en *Settings → Environment Variables*.
4. Crea las tablas contra esa base: `vercel env pull .env.local` y luego `npm run db:setup`.
5. Despliega. `https://<tu-app>/api/estado` confirma que todo quedó configurado (sin mostrar las claves).

Para llevarlo a Azure o integrarlo con Teams, ver la sección 5 de [la arquitectura](docs/ARQUITECTURA.md#5-integración-con-microsoft-365).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas (lectores de transcripción y generador BPMN) |
| `npm run typecheck` | Genera los tipos de rutas y revisa TypeScript |
| `npm run db:generate` | Genera una migración tras cambiar `src/db/schema.ts` |
| `npm run db:setup` | Aplica migraciones y carga el área de ejemplo |
| `npm run db:seed` | Recarga solo el área de ejemplo (borra y vuelve a crear) |
| `npm run levantar -- P-FIN-01` | Procesa con IA, desde la terminal, las sesiones pendientes de un proceso |

## Estructura

```
docs/                     Guía de usuario y arquitectura
fixtures/
  area-financiera.json    Área, usuarios y procesos de ejemplo (ficticios)
  glosario-financiera.json  Términos y cómo los transcribe Teams
  transcripciones/        Reuniones de ejemplo en .vtt y .docx
  esperado/               Lo que la IA debería encontrar en cada reunión
src/
  app/                    Páginas y acciones del servidor
  components/             Revisión, editor BPMN, mapa del área
  db/                     Esquema y conexión a la base
  lib/ia/                 Reglas, esquemas y llamadas a Claude
  lib/bpmn/               Generador BPMN 2.0
  lib/transcripcion/      Lectores de transcripciones de Teams
scripts/                  Migración, carga de ejemplo y procesamiento por terminal
```

## Marca

La interfaz usa los colores, la tipografía y los íconos del sistema de diseño de Comfama (`src/app/globals.css`, `src/app/icons.css`, `public/brand`). Para otra organización se reemplazan esos archivos.
