# ViShield

ViShield es una plataforma de entrenamiento en seguridad corporativa que simula ataques de ingeniería social mediante llamadas de **vishing** generadas con voces sintéticas de IA (ElevenLabs) y comunicación en tiempo real (LiveKit/WebRTC).

## Problema

Las empresas invierten en seguridad perimetral, pero el eslabón más débil sigue siendo el humano. No existe una forma escalable de medir qué tan vulnerable es un equipo frente a un atacante que llama por teléfono haciéndose pasar por soporte, un proveedor o un ejecutivo.

## Solución

ViShield automatiza simulaciones de ataque creíbles —suplantación de identidad, pretextos de urgencia, tácticas de presión— y mide la resistencia real de cada empleado, sin exponer a la organización a un riesgo real.

## Funcionalidades

- **Dashboard ejecutivo**: métricas de riesgo (hackabilidad, puntaje de resistencia) agrupadas por campaña.
- **Campañas**: organiza simulaciones por canal y tipo de ataque, con estado y resultados.
- **Lanzamiento de llamadas**: ejecuta ataques simulados en tiempo real con transcripción en vivo.
- **Perfil de usuario**: histórico de sesiones, nivel de riesgo y vulnerabilidades detectadas por empleado.
- **Biblioteca de voces**: voces sintéticas con consentimiento explícito para personalizar a los atacantes simulados.

## Stack

React 19 + Next.js 16, Supabase (PostgreSQL), ElevenLabs, LiveKit y GSAP para las animaciones.
