# Requerimientos Funcionales: Keryo

## RF-01: Landing Page de Configuración
[cite_start]**Dependencias:** 
* Framework React.js (Vite)
* Tailwind CSS
* React Router

[cite_start]**Descripción:** 
Se debe crear una interfaz web que sirva como panel de control central. El sistema debe permitir al usuario seleccionar el tipo de periférico (mando o teclado) y personalizar el estilo visual (skin), generando una vista previa antes de su uso en OBS.

[cite_start]**Detalles de implementación:** 
* Implementar un selector de dispositivos que diferencie entre mandos (Xbox/PS) y teclado/ratón.
* Crear un módulo para la selección de temas visuales (skins).
* Desarrollar un generador de URL dinámico que codifique las opciones seleccionadas en parámetros de consulta.
* La interfaz debe incluir un botón de "Copiar enlace" para facilitar la integración en OBS.

[cite_start]**Criterios de aceptación:** 
* El sistema debe generar una URL válida que refleje las opciones elegidas por el usuario.
* El usuario debe poder ver los cambios de configuración reflejados en tiempo real en una previsualización.

---

## RF-02: Sistema de Detección de Inputs
[cite_start]**Dependencias:** 
* Gamepad API nativa
* Keyboard Event API
* Hook personalizado `useInput`

[cite_start]**Descripción:** 
Se debe implementar un sistema encargado de monitorear en tiempo real todas las entradas físicas de los periféricos conectados para enviarlas al motor de renderizado.

[cite_start]**Detalles de implementación:** 
* El sistema de detección de mandos debe funcionar de forma asíncrona mediante un bucle de consulta (`requestAnimationFrame`).
* Se debe crear un diccionario de mapeo para normalizar los botones de diferentes fabricantes a un estándar interno.
* El servicio debe detectar automáticamente cuándo un mando es conectado o desconectado del sistema.

[cite_start]**Criterios de aceptación:** 
* El sistema debe ser capaz de reconocer al menos un mando estándar y el teclado básico.
* La latencia entre la presión física del botón y la detección en pantalla no debe exceder los 16ms.

---

## RF-03: Motor de Renderizado (Overlay)
[cite_start]**Dependencias:** 
* Framer Motion
* Repositorio de assets (SVGs)

[cite_start]**Descripción:** 
Se debe implementar un lienzo visual diseñado para ser utilizado como "Browser Source" en OBS. Este debe interpretar la configuración de la URL y mostrar gráficamente el periférico activo.

[cite_start]**Detalles de implementación:** 
* El renderizador debe obtener los parámetros de configuración (dispositivo, skin) directamente desde la URL.
* Los componentes visuales deben reaccionar a los cambios de estado del sistema de detección mediante animaciones fluidas.
* El fondo del renderizado debe ser transparente de forma nativa.

[cite_start]**Criterios de aceptación:** 
* El overlay debe representarse correctamente en OBS con transparencia total.
* Cada input detectado debe iluminar o animar la tecla/botón correspondiente en el diseño visual seleccionado.

---

## RF-04: Sistema de Despliegue (Hosting)
[cite_start]**Dependencias:** 
* GitHub Actions
* GitHub Pages

[cite_start]**Descripción:** 
Se debe configurar un sistema que permita que el proyecto esté disponible públicamente en la web y se actualice de manera automatizada tras cada cambio en el código.

[cite_start]**Detalles de implementación:** 
* Configurar un flujo de trabajo de integración continua (CI) que realice el build de producción automáticamente.
* Desplegar el resultado del build hacia la rama `gh-pages` del repositorio.

[cite_start]**Criterios de aceptación:** 
* El sistema debe estar accesible vía URL pública de GitHub desde que se inicia el despliegue.
* El despliegue automático debe completarse exitosamente tras cada actualización en la rama principal.
