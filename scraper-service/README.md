# 🇦🇷 Impuesto Argento - Scraper Service

Microservicio backend desarrollado con **FastAPI**, **Python 3.10+**, **Scrapling** y **BeautifulSoup4** para la extracción de precios en tiempo real y el cálculo de impuestos argentinos sobre consumos en moneda extranjera y suscripciones digitales.

---

## 🚀 Características Principales

1. **Motor Tributario Argentino de Alta Precisión (`app/core/tax_engine.py`)**:
   - Port exacto de las normativas fiscales vigentes (Post Impuesto PAÍS).
   - **IVA Servicios Digitales (21%)** (Decreto 813/2018).
   - **Percepción Ganancias / Bienes Personales (30%)** (RG ARCA 5617/2024).
   - **Tabla completa de Ingresos Brutos (IIBB)** para las 24 jurisdicciones provinciales argentinas (con alícuota diferencial del 3% en Santa Fe para streaming audiovisual).
   - **Exención fiscal y comparativa con Dólar MEP**: Cálculo automático de ahorro al pagar el resumen con dólares propios vía caja de ahorro.

2. **Scraper Universal Heurístico en 3 Capas (`app/scrapers/universal.py`)**:
   - **Capa 1 (JSON-LD)**: Extracción limpia de metadatos estructurados `schema.org/Product` y `Offer`.
   - **Capa 2 (OpenGraph & Meta)**: Extracción de `og:price:amount`, `product:price:amount`, títulos e imágenes.
   - **Capa 3 (DOM & Regex con Scrapling / BeautifulSoup)**: Selectores de precio estándar (`[data-price]`, `.price`, `#price`) y análisis de patrones numéricos monetarios multiformato (ARS, USD, EUR).

3. **Conector Oficial de Steam Store (`app/scrapers/platforms/steam.py`)**:
   - Detección de URLs de Steam (`store.steampowered.com/app/...`).
   - Consulta directa a la API pública oficial de Steam con localización argentina (`cc=ar`).
   - Extracción de precios oficiales en USD (LATAM-USD), juegos gratuitos y títulos. Fallback a scraping web para paquetes y bundles.

4. **Catálogo de Suscripciones Populares (`app/scrapers/platforms/subscriptions.py`)**:
   - Servicios de streaming (Netflix, Spotify, YouTube Premium, Disney+, Max).
   - Plataformas de videojuegos (Xbox Game Pass, PlayStation Store, Nintendo eShop).
   - Herramientas de IA y desarrollo (ChatGPT Plus, Claude Pro, Midjourney, GitHub Copilot).
   - Almacenamiento en la nube (Google One, Apple iCloud+).

5. **Caché con TTL y soporte Redis (`app/core/cache.py`)**:
   - Caché en memoria thread-safe con expiración por timestamp.
   - Conexión opcional a Redis mediante variable `REDIS_URL` con fallback automático.

6. **Cotizaciones de Dólar en Vivo (`app/api/routes_rates.py`)**:
   - Integra DolarApi y Bluelytics para cotizaciones en tiempo real del Dólar Oficial, Tarjeta, MEP y Blue.
   - Caché de 10 minutos para minimizar latencia y consumo de cuota.

---

## 📂 Estructura del Proyecto

```
scraper-service/
├── .env.example                     # Plantilla de variables de entorno
├── .gitignore                       # Ignorados por Git
├── README.md                        # Documentación completa
├── requirements.txt                 # Dependencias del proyecto
├── run.py                           # Script de inicio rápido
├── tests/                           # Tests unitarios con pytest
│   ├── test_tax_engine.py
│   ├── test_cache.py
│   └── test_api.py
└── app/
    ├── __init__.py
    ├── config.py                    # Configuración y settings
    ├── main.py                      # Instancia FastAPI y middleware CORS
    ├── api/                         # Rutas y controladores
    │   ├── routes_rates.py          # GET /api/v1/rates
    │   ├── routes_services.py       # GET /api/v1/services
    │   └── routes_scrape.py         # POST /api/v1/scrape & scrape-and-calculate
    ├── core/                        # Motor tributario y caché
    │   ├── cache.py
    │   └── tax_engine.py
    ├── models/                      # Modelos Pydantic v2
    │   └── schemas.py
    └── scrapers/                    # Arquitectura de web scraping
        ├── base.py
        ├── universal.py
        └── platforms/
            ├── steam.py
            └── subscriptions.py
```

---

## 🛠️ Instalación y Requisitos

### Prerrequisitos
- Python 3.10 o superior (recomendado Python 3.11/3.12/3.14).
- Administrador de paquetes `pip` o `uv`.

### 1. Clonar o acceder al directorio del microservicio
```bash
cd D:\Escritorio\impuesto-argento\scraper-service
```

### 2. Crear y activar un entorno virtual (Recomendado)
En Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Instalar las dependencias
```bash
pip install -r requirements.txt
```

### 4. Configurar variables de entorno (Opcional)
Copiar el archivo de ejemplo:
```powershell
copy .env.example .env
```

Variables disponibles:
- `HOST`: Dirección de escucha (default: `0.0.0.0`).
- `PORT`: Puerto TCP (default: `8000`).
- `CORS_ORIGINS`: Lista JSON o separada por comas de orígenes permitidos.
- `REDIS_URL`: URL de conexión a Redis (ej: `redis://localhost:6379/0`). Si se omite, se usa la caché en memoria.
- `CACHE_TTL_SECONDS`: Tiempo de vida de la caché (default: `600` segundos = 10 min).

---

## ⚡ Ejecución

Iniciá el microservicio con el script de arranque:
```bash
python run.py
```

O directamente con Uvicorn:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

El servicio estará disponible en:
- **API Base:** `http://localhost:8000`
- **Documentación Interactiva (Swagger UI):** `http://localhost:8000/docs`
- **Documentación Alternativa (ReDoc):** `http://localhost:8000/redoc`

---

## 📡 Endpoints de la API

### 1. Cotizaciones de Dólar
`GET /api/v1/rates`
Devuelve las cotizaciones del Dólar Oficial, Tarjeta, MEP y Blue (con caché de 10 minutos).

**Respuesta ejemplo:**
```json
{
  "oficial": 1060.50,
  "tarjeta": 1378.65,
  "mep": 1215.30,
  "blue": 1235.00
}
```

### 2. Catálogo de Suscripciones y Servicios
`GET /api/v1/services?province=CABA&paymentMethod=TARJETA_ARS`
Devuelve las suscripciones populares (Netflix, Spotify, ChatGPT, Xbox Game Pass, etc.) con los impuestos calculados en tiempo real para la provincia y método de pago seleccionados.

### 3. Scraping de Precios
`POST /api/v1/scrape`

**Payload:**
```json
{
  "url": "https://store.steampowered.com/app/730/CounterStrike_2/"
}
```

**Respuesta:**
```json
{
  "title": "Counter-Strike 2",
  "amount": 14.99,
  "currency": "USD",
  "domain": "store.steampowered.com",
  "thumbnail": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg",
  "isDigitalService": true
}
```

### 4. Scraping y Cálculo Fiscal Completo
`POST /api/v1/scrape-and-calculate`

**Payload:**
```json
{
  "url": "https://store.steampowered.com/app/1086940/Baldurs_Gate_3/",
  "province": "BA",
  "paymentMethod": "TARJETA_ARS"
}
```

**Respuesta:**
```json
{
  "scraped": {
    "title": "Baldur's Gate 3",
    "amount": 34.99,
    "currency": "USD",
    "domain": "store.steampowered.com",
    "isDigitalService": true
  },
  "calculation": {
    "category": "DIGITAL_SERVICE_USD",
    "paymentMethod": "TARJETA_ARS",
    "province": "BA",
    "originalPrice": {
      "amount": 34.99,
      "currency": "USD"
    },
    "baseArs": 37106.89,
    "exchangeRateUsed": 1060.5,
    "taxes": [
      {
        "id": "iva-21",
        "name": "IVA Servicios Digitales (21%)",
        "rate": 0.21,
        "amountArs": 7792.45,
        "appliedOnArs": 37106.89,
        "legalReference": "Decreto 813/2018 (Reglamentario Ley de IVA)",
        "isWithholding": false
      },
      {
        "id": "rg-5617-30",
        "name": "Percepción Ganancias / Bienes Personales (30%)",
        "rate": 0.30,
        "amountArs": 11132.07,
        "appliedOnArs": 37106.89,
        "legalReference": "RG (ARCA) 5617/2024",
        "isWithholding": true
      },
      {
        "id": "iibb-ba",
        "name": "Percepción IIBB (Buenos Aires (Provincia)) (2.0%)",
        "rate": 0.02,
        "amountArs": 742.14,
        "appliedOnArs": 37106.89,
        "legalReference": "Resolución Normativa (ARBA) 38/2019",
        "isWithholding": true
      }
    ],
    "totalArs": 56773.55,
    "mepComparison": {
      "mepRate": 1215.3,
      "totalWithMepArs": 51060.50,
      "savingsArs": 5713.05,
      "savingsPercentage": 10.1,
      "isRecommended": true
    },
    "notes": []
  }
}
```

---

## 🧪 Tests Automatizados

Para ejecutar la suite completa de pruebas unitarias:
```bash
pytest
```
O con reporte detallado:
```bash
pytest -v
```

