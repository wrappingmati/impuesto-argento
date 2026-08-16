# 🇦🇷 Impuesto Argento

Calculadora del precio final de videojuegos comprados en Argentina, con IVA
y percepción de IIBB estimados según provincia. Pensada para gamers que
quieren saber cuánto van a pagar realmente antes de comprar en dólares.

> Los valores que muestra la app son una **estimación**, no asesoramiento
> impositivo. Las alícuotas de IIBB varían por jurisdicción y pueden
> cambiar sin aviso — confirmá siempre con el resumen de tu tarjeta.

## Características

- Cálculo de IVA (21%) y percepción de IIBB por provincia sobre compras en
  dólar tarjeta.
- Cotización del dólar (blue, oficial, tarjeta) con dos proveedores en
  cascada ([bluelytics.com.ar](https://bluelytics.com.ar) y
  [dolarapi.com](https://dolarapi.com)) y caché local como último recurso
  si ambas APIs fallan.
- Historial de juegos guardado en el navegador (`localStorage`), con
  vista de lista y de comparación.
- Validación de datos con [zod](https://zod.dev), tanto en el formulario
  como en lo que se lee de `localStorage`.

## Stack técnico

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Estado remoto:** TanStack Query
- **Validación:** zod
- **Tests:** Vitest + Testing Library
- **Deploy:** Netlify (estático)

## Normativa vigente en la que se basa el cálculo (relevada agosto 2026)

| Concepto | Alícuota | Norma |
|---|---|---|
| IVA sobre servicios digitales del exterior | 21% | Decreto 813/2018 (reglamentario Ley de IVA) |
| Percepción Ganancias/Bienes Personales sobre consumo en moneda extranjera con tarjeta | 30% | RG (ARCA) 5617/2024 |
| Impuesto PAÍS | **eliminado** | Venció por ley el 2/1/2026 (tenía vigencia de 5 años); hasta esa fecha sumaba otro 30% |
| Percepción de IIBB sobre servicios digitales de sujetos no residentes | 0% – 5,5%, según provincia | Ver tabla en `src/lib/tax.ts` |

La tabla de IIBB por provincia incluye Buenos Aires, CABA, Córdoba, Chaco, La
Pampa, Neuquén, Río Negro, Salta, Santa Fe y Tierra del Fuego (las
jurisdicciones que sí tienen un régimen específico). Entre Ríos y Mendoza
están incluidas en la app pero con alícuota 0%, porque no encontramos una
resolución vigente de ATER / ATM que grave específicamente los servicios
digitales del exterior — si conocés una norma que lo haga, avisá para
corregirla en `src/lib/tax.ts`.

Estos son valores de referencia relevados de fuentes públicas, no
asesoramiento impositivo, y las alícuotas provinciales cambian con
frecuencia.

## Instalación y ejecución local

```bash
git clone https://github.com/wrappingmati/impuesto-argento.git
cd impuesto-argento
npm install
npm run dev       # http://localhost:8080
```

## Scripts disponibles

| Script             | Qué hace                                  |
| ------------------ | ------------------------------------------ |
| `npm run dev`       | Servidor de desarrollo                     |
| `npm run build`     | Build de producción a `dist/`              |
| `npm run preview`   | Sirve el build de producción localmente    |
| `npm run lint`      | ESLint sobre todo el proyecto              |
| `npm run test`      | Corre los tests una vez (CI)               |
| `npm run test:watch`| Tests en modo watch                        |

## Estructura

```
src/
  lib/
    tax.ts        # única fuente de verdad de alícuotas y cálculo de precio
    dolarApi.ts   # cliente de cotizaciones con fallback + caché
    storage.ts    # persistencia en localStorage validada con zod
  hooks/
    useDolarRates.ts
    useSavedGames.ts
  components/      # UI (formulario, desglose, historial, error boundary)
  pages/Index.tsx  # composición de la pantalla principal
```

Si cambia una alícuota (IVA, IIBB, retención de Ganancias sobre el dólar
tarjeta), el único archivo que hay que tocar es `src/lib/tax.ts`.

## Licencia

Proyecto personal de [wrappingmati](https://github.com/wrappingmati).
