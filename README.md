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

## Despliegue en Vercel

Sigue estos pasos para publicar tu aplicación en línea de forma rápida y sencilla con Vercel.

### 1. Requisitos Previos

*   Asegúrate de tener una cuenta en [Vercel](https://vercel.com/) (puedes registrarte con tu cuenta de GitHub).
*   Sube el código de tu proyecto a un repositorio de [GitHub](https://github.com/).

### 2. Importar el Proyecto en Vercel

1.  Inicia sesión en tu panel de Vercel.
2.  Haz clic en **"Add New..."** y selecciona **"Project"**.
3.  Busca tu repositorio de GitHub y haz clic en **"Import"**.
4.  Vercel detectará automáticamente que es un proyecto de Vite y configurará los comandos de construcción (`vite build`) y el directorio de salida (`dist`) por ti. No necesitas cambiar nada en la sección "Build & Development Settings".

### 3. Configurar la API Key de Gemini (¡Importante!)

Para que la aplicación funcione, necesita acceso a tu clave de API de Gemini de forma segura.

1.  En la página de configuración del proyecto en Vercel, busca la sección **"Environment Variables"** (Variables de Entorno).
2.  Crea una nueva variable:
    *   **Name**: `API_KEY`
    *   **Value**: Pega aquí tu clave de API de Gemini (la que empieza con `AIzaSy...`).
3.  Asegúrate de que la variable esté disponible para todos los entornos.
4.  Haz clic en **"Add"** para guardarla.

Al hacer esto, tu clave de API se inyecta de forma segura durante el proceso de construcción y **no queda expuesta** en el código del lado del cliente.

### 4. Desplegar

1.  Una vez configurada la variable de entorno, haz clic en el botón **"Deploy"**.
2.  Vercel comenzará a construir e implementar tu aplicación. Puedes ver el progreso en los logs.
3.  Cuando termine, ¡tu aplicación estará en línea! Vercel te proporcionará la URL para que puedas visitarla.

¡Eso es todo! Cada vez que hagas `push` a la rama principal de tu repositorio, Vercel desplegará automáticamente los cambios.
