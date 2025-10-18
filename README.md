# Johana Tatuajes - AI Tattoo Studio Assistant

Esta es una aplicación web creada para la tatuadora Johana, utilizando React, TypeScript y la API de Gemini para proporcionar un conjunto de herramientas de IA que ayudan en el proceso creativo del tatuaje.

## Características

*   **Generador de Diseños**: Crea diseños de tatuajes únicos a partir de descripciones de texto.
*   **Creador de Trazos**: Convierte dibujos o imágenes en plantillas de trazos listas para usar.
*   **Visualizador de Tatuajes**: Previsualiza cómo se vería un diseño de tatuaje en diferentes partes del cuerpo.
*   **Asistente de IA**: Un chatbot experto para responder preguntas sobre técnicas, materiales y mejores prácticas.
*   **Gestión de Citas y Clientes**: Una agenda y un CRM integrados para gestionar el negocio.
*   **Galería de Trabajos**: Muestra tus tatuajes finalizados en una galería filtrable.

---

## Despliegue en GitHub Pages

Sigue estos pasos para publicar tu aplicación en línea usando GitHub Pages.

### 1. Requisitos Previos

*   Asegúrate de tener [Node.js](https://nodejs.org/) y [npm](https://www.npmjs.com/) instalados.
*   Crea un nuevo repositorio en [GitHub](https://github.com/).

### 2. Configuración

Antes de desplegar, necesitas configurar dos archivos con la información de tu repositorio.

1.  **`vite.config.ts`**:
    *   Abre el archivo `vite.config.ts`.
    *   Cambia el valor de `base` de `'/johana-tatuajes-app/'` al nombre de tu repositorio, encerrado entre barras. Por ejemplo, si tu repositorio se llama `mi-app-de-tatuajes`, debería ser `base: '/mi-app-de-tatuajes/'`.

2.  **`package.json`**:
    *   Abre el archivo `package.json`.
    *   Busca la línea `"homepage": "https://<TU-USUARIO-DE-GITHUB>.github.io/johana-tatuajes-app/",`.
    *   Reemplaza `<TU-USUARIO-DE-GITHUB>` con tu nombre de usuario de GitHub.
    *   Reemplaza `johana-tatuajes-app` con el nombre de tu repositorio.

### 3. API Key de Gemini

**ADVERTENCIA DE SEGURIDAD IMPORTANTE:** Desplegar en GitHub Pages hará que tu API Key de Gemini sea **visible públicamente** en el código de la aplicación. Esto es un riesgo de seguridad significativo, ya que cualquiera podría usar tu clave y generar costos en tu cuenta.

Para un proyecto real, **nunca expongas tu clave de API en el lado del cliente**. La solución recomendada es usar un backend (como un servidor Node.js o una función serverless) que actúe como intermediario para llamar a la API de Gemini de forma segura.

Para este despliegue de prueba, puedes proceder bajo tu propio riesgo:

1.  Crea un archivo llamado `.env` en la raíz de tu proyecto.
2.  Añade tu clave de API dentro de este archivo, así:
    ```
    API_KEY="AIzaSy...tu...clave...aqui"
    ```
3.  **Importante**: Asegúrate de que el archivo `.env` esté incluido en tu `.gitignore` para no subir tu clave al repositorio público. El despliegue la usará durante el proceso de construcción, pero no será visible en tu código fuente en GitHub.

### 4. Despliegue

Una vez que hayas configurado todo y tu código esté en tu repositorio de GitHub:

1.  Abre tu terminal.
2.  Instala las dependencias del proyecto si aún no lo has hecho:
    ```bash
    npm install
    ```
3.  Ejecuta el script de despliegue:
    ```bash
    npm run deploy
    ```
    Este comando primero construirá tu aplicación y luego la subirá a una rama especial llamada `gh-pages` en tu repositorio.

### 5. Activar GitHub Pages

1.  Ve a tu repositorio de GitHub en el navegador.
2.  Haz clic en la pestaña "Settings" (Configuración).
3.  En el menú de la izquierda, selecciona "Pages".
4.  En la sección "Build and deployment", bajo "Source", selecciona `gh-pages` como la rama desde la que se servirá tu sitio.
5.  Guarda los cambios.

¡Listo! Después de unos minutos, tu aplicación debería estar disponible en la URL que configuraste en el campo `homepage` de tu `package.json`.
