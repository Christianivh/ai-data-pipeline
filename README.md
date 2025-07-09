# 🧠 Data Pipeline SDLC Emulator

Una aplicación web que emula el ciclo de vida completo de desarrollo de pipelines de datos (Data Pipeline SDLC), desde la ideación hasta el despliegue. Utiliza agentes inteligentes para automatizar tareas clave, generar documentación, producir datos sintéticos, y validar la calidad de los datos en cada etapa.

---

## 🚀 ¿Qué hace esta plataforma?

Esta aplicación guía y automatiza el flujo completo de construcción de un pipeline de datos moderno, siguiendo buenas prácticas de ingeniería y analítica:

1. **Historias de usuario → ARD + Jira**
   - Transforma historias de usuario en requerimientos analíticos (ARD) validados y publicados en Confluence.
   - Crea automáticamente las tareas técnicas en Jira.

2. **Diseño de recolección de datos**
   - Genera automáticamente especificaciones de eventos (Tagging Spec) incluyendo nombres, condiciones de activación y parámetros.
   - Crea un plan de tracking versionado, alineado con el ARD, para fuentes digitales o sistemas legacy.

3. **Desarrollo inicial con copiloto**
   - Genera scripts SQL que implementan la lógica de negocio sobre Snowflake.
   - Produce el documento `snowformation`, el contrato de datos del framework IRIS.

4. **Generación de datos sintéticos**
   - Simula datasets para cada fase del pipeline (tracking, Google Analytics, S3, dominio, etc.).
   - Permite validar los flujos desde etapas tempranas.

5. **Pruebas automatizadas del pipeline**
   - Ejecuta validaciones automáticas de datos.
   - Evalúa métricas de calidad en 6 dimensiones clave: *completitud, exactitud, validez, unicidad, integridad, puntualidad*.

6. **Documentación de evidencias**
   - Genera documentación y evidencia para soportar la puesta en producción del modelo o flujo de datos.
   - Integra con entornos de despliegue y asegura la trazabilidad.

---

## 🧩 Arquitectura Modular

- **Frontend:** Interfaz web para navegar cada fase del SDLC.
- **Backend:** Orquestador de agentes y generación de artefactos.
- **Integraciones:** APIs para Confluence, Jira, Google Analytics, Snowflake, etc.
- **Almacenamiento:** Base de datos para configuración y estado de ejecución.

---

## 🤖 Agentes Inteligentes

- **Story-to-ARD Agent:** Traduce requerimientos en documentos analíticos.
- **TrackingSpec Agent:** Crea y valida convenciones de eventos y metadatos.
- **Pipeline Generator Agent:** Produce SQL y contratos de datos (`snowformation`).
- **Synthetic Data Agent:** Genera datasets falsos para pruebas unitarias y QA.
- **QA Agent:** Ejecuta pruebas y validaciones automatizadas.
- **Deployment Evidence Agent:** Documenta resultados y flujos de aprobación.

---

## 🛠️ Instalación (próximamente)

```bash
# Clonar el repositorio
git clone https://github.com/christianivh/ai-data-pipeline.git
cd ai-data-pipeline

# Instalar dependencias (por definir: Node, Python, etc.)
npm install
# o
pip install -r requirements.txt

# Iniciar entorno local
npm run dev
# o
streamlit run app.py
