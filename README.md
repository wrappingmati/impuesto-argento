# 🇦🇷 Impuesto Argento 2.0

Calculadora inteligente del **precio final real** de videojuegos, suscripciones y compras en moneda extranjera para Argentina. Integra un motor de **web scraping indetectable (Scrapling + FastAPI)**, cálculo de alícuotas provinciales de IIBB, IVA (21%), percepción de Ganancias/Bienes Personales (30% RG 5617) y comparativa de ahorro con **Dólar MEP**.

> Los valores que muestra la app son una **estimación técnica**, no asesoramiento fiscal. Las alícuotas de IIBB varían por jurisdicción y pueden cambiar sin aviso — confirmá siempre con el resumen de tu tarjeta.

---

## ✨ Características Principales

- **🔗 Scrapear Cualquier URL**: Pegá el link de cualquier juego o compra en Steam, Xbox / Microsoft Store, PlayStation, Amazon o cualquier tienda y obtené el precio real con impuestos al instante.
- **⭐ Catálogo de Suscripciones**: Grilla interactiva con Netflix, Spotify, YouTube Premium, Disney+, Max, Xbox Game Pass, ChatGPT Plus, Claude Pro, Midjourney y más, con selector de planes e impuestos calculados para tu provincia.
- **💵 Comparativa con Dólar MEP**: Te muestra cuánto dinero te ahorrás si pagás el saldo de tu tarjeta con dólares propios de tu cuenta antes del vencimiento (exento de percepción 30% RG 5617).
- **🇦🇷 Percepción de IIBB por Provincia**: Tabla oficial con las 24 jurisdicciones de Argentina (incluye alícuota reducida del 3% en Santa Fe para streaming audiovisual).
- **⚡ Arquitectura Híbrida**: Si el backend de Python está activo, aprovecha toda la potencia de Scrapling; si está apagado, la web conmuta automáticamente a modo local sin interrumpir la experiencia.

---

## 🛠️ Stack Técnico

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Radix Primitives + TanStack Query + Zod.
- **Backend (Scraper Service):** Python 3.10+ + FastAPI + Scrapling + BeautifulSoup4 + Uvicorn + HTTPX.
- **Testing:** Vitest (Frontend: 20 tests) + Pytest (Backend: 30 tests con validación de seguridad Anti-SSRF).
- **Persistencia:** `localStorage` validado con Zod (Frontend) + Caché TTL en memoria / Redis (Backend).

---

## 🔌 API REST Pública y Gratuita

¿Estás construyendo un bot de Discord, una extensión de navegador (Chrome/Firefox) o una aplicación móvil para gamers o consumidores argentinos? Podés integrar directamente los endpoints de este microservicio:

- 📖 **Documentación Swagger interactiva:** `/docs`
- 📑 **Especificación OpenAPI / ReDoc:** `/redoc`

### Endpoints Disponibles:
* `GET /api/v1/rates`: Cotizaciones del Dólar Oficial, Tarjeta, MEP y Blue en vivo con caché de 10 min.
* `GET /api/v1/services`: Catálogo de servicios populares (Netflix, Spotify, ChatGPT) con cálculo tributario según la provincia.
* `POST /api/v1/scrape`: Extrae título, precio original y moneda desde una URL.
* `POST /api/v1/scrape-and-calculate`: Scrapea cualquier producto y devuelve el comprobante completo con IVA (21%), Ganancias (30%) e IIBB provincial.

---

## 📚 Documentación de Contexto y Arquitectura

Para conocer todos los detalles técnicos, decisiones de diseño, análisis legal de scraping y el desglose impositivo argentino completo, consultá:
👉 **[CONTEXT.md](./CONTEXT.md)**

---

## 🚀 Instalación y Ejecución Local

### 1. Iniciar el Backend (FastAPI + Scrapling)
En una terminal:
```powershell
cd scraper-service
pip install -r requirements.txt
python run.py
```
* API disponible en: `http://localhost:8000`
* Documentación Swagger interactiva: `http://localhost:8000/docs`
* Tests: `python -m pytest tests/`

### 2. Iniciar el Frontend (React + Vite)
En otra terminal:
```powershell
npm install
npm run dev
```
* Web disponible en: `http://localhost:8080` (o el puerto indicado por Vite).
* Tests: `npm test`
* Build: `npm run build`

---

## 🏛️ Normativa Fiscal Vigente (Post-Impuesto PAÍS)

| Concepto | Alícuota | Norma |
|---|---|---|
| **IVA sobre servicios digitales del exterior** | **21%** | Decreto 813/2018 (reglamentario Ley de IVA) |
| **Percepción Ganancias / Bienes Personales sobre consumo en moneda extranjera** | **30%** | RG (ARCA) 5617/2024 |
| **Impuesto PAÍS** | **ELIMINADO** | Venció por ley el 2/1/2026 (tenía vigencia de 5 años) |
| **Percepción de IIBB sobre servicios digitales** | **0% a 5,5%** | Según normativa de cada provincia |

---

## 📄 Licencia

Proyecto de código abierto desarrollado por [wrappingmati](https://github.com/wrappingmati).
