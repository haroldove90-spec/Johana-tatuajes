# Johana Tatuajes - Asistente de IA para Tatuajes

Esta es una aplicación web creada para la tatuadora Johana, utilizando React, TypeScript y la API de Gemini para proporcionar un conjunto de herramientas de IA que ayudan en el proceso creativo del tatuaje.

## Características

*   **Generador de Diseños**: Crea diseños de tatuajes únicos a partir de descripciones de texto.
*   **Creador de Trazos**: Convierte dibujos o imágenes en plantillas de trazos listas para usar.
*   **Visualizador de Tatuajes**: Previsualiza cómo se vería un diseño de tatuaje en diferentes partes del cuerpo.
*   **Asistente de IA**: Un chatbot experto para responder preguntas sobre técnicas, materiales y mejores prácticas.
*   **Gestión de Citas y Clientes**: Una agenda y un CRM integrados para gestionar el negocio.
*   **Galería de Trabajos**: Muestra tus tatuajes finalizados en una galería filtrable.

---

## Despliegue en Netlify

Sigue estos pasos para publicar tu aplicación en línea de forma rápida y sencilla con Netlify.

### 1. Requisitos Previos

*   Asegúrate de tener una cuenta en [Netlify](https://www.netlify.com/) (puedes registrarte con tu cuenta de GitHub).
*   Sube el código de tu proyecto a un repositorio de [GitHub](https://github.com/).

### 2. Importar el Proyecto en Netlify

1.  Inicia sesión en tu panel de Netlify.
2.  Haz clic en **"Add new site"** y selecciona **"Import an existing project"**.
3.  Conéctate a tu proveedor de Git (ej. GitHub) y elige tu repositorio.
4.  Netlify detectará automáticamente que es un proyecto de Vite. Los ajustes de construcción deberían ser correctos por defecto:
    *   **Build command**: `npm run build` (o `vite build`)
    *   **Publish directory**: `dist`

### 3. Configurar la API Key de Gemini (¡Importante!)

Para que la aplicación pueda comunicarse con la API de Gemini, necesita acceso a tu clave de API de forma segura.

1.  Dentro de la configuración de tu sitio en Netlify, ve a **Site configuration > Build & deploy > Environment**.
2.  En la sección **"Environment variables"**, haz clic en **"Edit variables"**.
3.  Crea una nueva variable con el siguiente nombre y valor:
    *   **Key**: `VITE_API_KEY`
    *   **Value**: Pega aquí tu clave de API de Gemini (la que empieza con `AIzaSy...`).
4.  Haz clic en **"Save"** para guardarla.

**¿Por qué `VITE_API_KEY`?**

El proyecto utiliza Vite como herramienta de construcción. Por seguridad, Vite solo expone las variables de entorno que comienzan con el prefijo `VITE_` al código que se ejecuta en el navegador. Esto evita que claves secretas se filtren accidentalmente. El código de la aplicación está configurado para leer esta variable específica (`import.meta.env.VITE_API_KEY`).

### 4. Desplegar

1.  Una vez configurada la variable de entorno, ve a la pestaña **"Deploys"** de tu sitio.
2.  Haz clic en **"Trigger deploy"** y selecciona **"Deploy site"**.
3.  Netlify comenzará a construir e implementar tu aplicación. Puedes ver el progreso en los logs de despliegue.
4.  Cuando termine, ¡tu aplicación estará en línea! Netlify te proporcionará la URL pública.

¡Eso es todo! Cada vez que hagas `push` a la rama principal de tu repositorio, Netlify desplegará automáticamente los cambios.
