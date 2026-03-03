# BoliBridge Online

BoliBridge Online es un juego competitivo de construcción de puentes donde los jugadores deben diseñar una estructura capaz de soportar el paso de un vehículo y permitirle llegar al otro lado en el menor tiempo posible.

Cada jugador cuenta con un presupuesto limitado y 3 vidas. La estrategia, la optimización de recursos y la eficiencia estructural son claves para ganar.

---

## 📌 Tabla de Contenidos

* [Concepto General](#-concepto-general)
* [Estructura de la Partida](#-estructura-de-la-partida)
* [Sistema de 3 Vidas](#-sistema-de-3-vidas)
* [Materiales de Construcción](#-materiales-de-construcción)
* [Sistema de Físicas](#-sistema-de-físicas)
* [Vehículos](#-vehículos)
* [Eventos Dinámicos](#-eventos-dinámicos)
* [Modos de Juego](#-modos-de-juego)
* [Sistema de Usuarios](#-sistema-de-usuarios)
* [Condiciones de Victoria](#-condiciones-de-victoria)
* [Casos de Uso Principales](#-casos-de-uso-principales)

---

## 🎮 Concepto General

El objetivo del juego es:

* Completar el cruce con éxito.
* Optimizar el tiempo.
* No agotar las 3 vidas disponibles.

### La partida termina cuando:

* Un jugador pierde sus 3 vidas.
* O ambos completan al menos un cruce válido y gana el que tenga el menor tiempo registrado.

---

## 🔄 Estructura de la Partida

Cada jugador dispone de:

* Presupuesto inicial fijo.
* 3 vidas.
* Un vehículo asignado.
* Tiempo limitado para construir.

### Flujo de una ronda

1. Fase de construcción.
2. Fase de simulación.
3. Si el puente se rompe → pierde 1 vida.
4. Puede reconstruir y volver a intentar.
5. Se registran hasta 3 intentos.

Cada intento es independiente en términos de tiempo, pero las vidas son acumulativas.

---

## ❤️ Sistema de 3 Vidas

* Cada jugador puede fallar hasta 3 veces.
* Si el puente colapsa durante la simulación → pierde una vida.
* Si pierde las 3 vidas → queda eliminado automáticamente.
* El sistema registra los tiempos obtenidos en cada intento exitoso.

### Escenarios posibles

* Si un jugador completa el cruce en el primer intento y el otro falla 3 veces → gana automáticamente el primero.
* Si ambos completan al menos un cruce válido → gana el que tenga el menor tiempo.
* Si ninguno logra completar → empate o definición por mayor progreso.

---

## 🏗 Materiales de Construcción

Cada material tiene:

* Costo
* Peso
* Resistencia estructural

### Vigas de madera

* Bajo costo
* Resistencia media
* Mayor probabilidad de ruptura bajo carga elevada

### Vigas de metal

* Mayor costo
* Alta resistencia
* Mayor peso estructural

### Cables

* Soportan tensión
* No soportan compresión
* Ideales para estructuras colgantes

### Calle

* Elemento obligatorio para el paso del vehículo
* Peso medio

---

## ⚙ Sistema de Físicas

El motor físico debe simular:

* Gravedad
* Fuerza aplicada por el vehículo
* Compresión en vigas
* Tensión en cables
* Deformación estructural
* Ruptura al superar la resistencia máxima

---

## 🚗 Vehículos

Los vehículos modifican la dificultad del cruce.

### Auto

* Más liviano
* Más caro
* Menor exigencia estructural

### Camioneta

* Peso medio
* Dificultad intermedia

### Camión

* Muy pesado
* Más barato
* Alta exigencia estructural

El vehículo puede asignarse automáticamente o formar parte de la estrategia del jugador.

---

## 🌪 Eventos Dinámicos

Algunas partidas pueden incluir condiciones especiales que aumentan la dificultad.

### Ejemplos

**Viento lateral**

* Aplica fuerza horizontal sobre el puente
* Incrementa la tensión en cables

**Lluvia**

* Reduce fricción del vehículo
* Puede generar inestabilidad

**Peso variable**

* El vehículo aumenta ligeramente su peso durante el cruce

**Micro-sismo**

* Genera vibraciones
* Aumenta el estrés estructural

### Configuración de eventos

* Aleatorios
* Asociados a mapas específicos
* Activables en modos competitivos avanzados

---

## 🌐 Modos de Juego

### Online 1 vs 1

* Emparejamiento automático
* Mismo mapa y presupuesto
* 3 vidas por jugador
* Gana quien sobreviva o tenga el menor tiempo válido

### Amigos

* Sala privada
* Reglas personalizables
* Eventos dinámicos configurables

### Local (Individual)

* El jugador compite contra su propio récord
* Sin rival
* Intentos ilimitados
* Se guarda el mejor tiempo histórico

### Desafío Diario

* Mapa fijo para todos los jugadores
* Ranking global
* Clasificación por mejor tiempo y menor costo

---

## 👤 Sistema de Usuarios

Cada usuario posee:

* ID único
* Nombre de usuario
* Monedas
* Ranking (ELO o sistema de puntos)
* Historial de partidas

### Estadísticas

* Partidas jugadas
* Partidas ganadas
* Puentes colapsados
* Mejor tiempo
* Costo promedio de construcción

---

## 🏆 Condiciones de Victoria

Una partida finaliza cuando:

1. Un jugador pierde sus 3 vidas → el otro gana automáticamente.
2. Ambos completan al menos un cruce válido → gana el de menor tiempo.
3. Ambos pierden sus 3 vidas sin completar → empate o definición por progreso alcanzado.

---

## 📋 Casos de Uso Principales

### Registrarse

**Actor:** Usuario

Flujo:

1. Ingresa nombre y contraseña.
2. El sistema valida los datos.
3. Se crea la cuenta con ID único.
4. Se almacena en base de datos.

---

### Crear partida online

**Actor:** Usuario

Flujo:

1. Selecciona modo online.
2. El sistema busca rival.
3. Se asigna mapa, presupuesto y eventos.
4. Comienza la fase de construcción.

---

### Construir puente

**Actor:** Jugador

Flujo:

1. Selecciona material.
2. Lo coloca en el mapa.
3. Se descuenta dinero.
4. Puede editar o eliminar piezas.
5. Finaliza construcción.

---

### Simulación

**Actor:** Sistema

Flujo:

1. Inicia el motor físico.
2. El vehículo avanza.
3. Se detectan tensiones y deformaciones.
4. Si colapsa → resta una vida.
5. Si llega al final → registra tiempo.

---

### Finalizar partida

**Actor:** Sistema

Flujo:

1. Evalúa vidas restantes.
2. Evalúa tiempos válidos.
3. Determina ganador.
4. Actualiza ranking y estadísticas.


