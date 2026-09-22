import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, FileText, Award } from "lucide-react";

interface LegalModalProps {
  children?: React.ReactNode;
}

export default function LegalModal({ children }: LegalModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Términos, Privacidad y Marcas
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Información Legal, Privacidad y Términos
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Conocé cómo protegemos tu privacidad, el alcance de los cálculos fiscales y el uso legítimo de marcas comerciales.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm text-muted-foreground/90 mt-2">
          {/* Sección 1: Privacidad y Protección de Datos */}
          <section className="space-y-2 border-b border-border/50 pb-4">
            <h3 className="text-foreground font-semibold flex items-center gap-2 text-base">
              <Shield className="w-4 h-4 text-emerald-500" />
              1. Protección de Datos y Privacidad (Ley 25.326)
            </h3>
            <p className="text-xs leading-relaxed">
              En <strong className="text-foreground">Impuesto Argento</strong> creemos en la privacidad por diseño. Esta aplicación:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>
                <strong className="text-foreground">No solicita ni recopila datos personales (PII):</strong> no requerimos registro, correos electrónicos, nombres ni números de DNI/CUIT.
              </li>
              <li>
                <strong className="text-foreground">Cero datos financieros o bancarios:</strong> jamás te pediremos números de tarjeta de crédito/débito, códigos de seguridad (CVV) ni claves bancarias.
              </li>
              <li>
                <strong className="text-foreground">Almacenamiento 100% en tu dispositivo:</strong> el historial de búsquedas y cálculos guardados se almacena única y exclusivamente en la memoria local de tu navegador (<code className="bg-muted px-1 py-0.5 rounded text-[11px]">localStorage</code>). Podés borrarlo en cualquier momento y nunca se transmite a ningún servidor.
              </li>
              <li>
                <strong className="text-foreground">Sin rastreo publicitario:</strong> no implementamos píxeles de seguimiento ni comercializamos ningún tipo de métrica o perfil de navegación.
              </li>
            </ul>
          </section>

          {/* Sección 2: Exención de Responsabilidad Fiscal */}
          <section className="space-y-2 border-b border-border/50 pb-4">
            <h3 className="text-foreground font-semibold flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-amber-500" />
              2. Simulador Educativo y Responsabilidad Fiscal
            </h3>
            <p className="text-xs leading-relaxed">
              Los cálculos y desgloses impositivos exhibidos en esta plataforma son <strong className="text-foreground">simulaciones de carácter estimativo, informativo y pedagógico</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>
                Están basados en las normativas públicas vigentes en la República Argentina (Resolución General AFIP/ARCA 5617, Ley de IVA 23.349, Ley 27.541 y resoluciones de rentas provinciales respecto de Ingresos Brutos sobre servicios digitales del exterior).
              </li>
              <li>
                <strong className="text-foreground">No revisten validez como factura comercial</strong> ni comprobante fiscal oficial ante la administración tributaria.
              </li>
              <li>
                <strong className="text-foreground">No constituyen asesoramiento financiero, contable o legal oficial.</strong> Las cotizaciones de cambio, percepciones bancarias y comisiones pueden variar según la entidad emisora de tu tarjeta de crédito o débito, o las normativas bancarias del BCRA. Te recomendamos verificar siempre tu resumen de cuenta definitivo.
              </li>
            </ul>
          </section>

          {/* Sección 3: Marcas Registradas y Fair Use */}
          <section className="space-y-2">
            <h3 className="text-foreground font-semibold flex items-center gap-2 text-base">
              <Award className="w-4 h-4 text-blue-500" />
              3. Uso Nominativo de Marcas Comerciales (Fair Use)
            </h3>
            <p className="text-xs leading-relaxed">
              Todas las marcas registradas, nombres comerciales, logotipos, servicios y productos de terceros mencionados en esta aplicación (tales como <em className="text-foreground">Steam, Valve, PlayStation, Sony, Xbox, Microsoft, Nintendo, Netflix, Spotify, Amazon, Disney, OpenAI, Anthropic</em>, entre otros) son <strong className="text-foreground">propiedad exclusiva de sus respectivos titulares y creadores</strong>.
            </p>
            <p className="text-xs leading-relaxed">
              Su mención en esta web responde exclusivamente a la doctrina de <strong className="text-foreground">uso legítimo y nominativo (Fair Use)</strong> con fines de identificación de productos, cotejo de precios públicos e información transparente y accesible para los consumidores y consumidores digitales argentinos (Ley 24.240 de Defensa del Consumidor).
            </p>
            <p className="text-xs leading-relaxed">
              Impuesto Argento es una herramienta de código abierto e independiente que no cuenta con patrocinio, auspicio, vínculo societario ni relación comercial con ninguna de las empresas titulares de dichas marcas.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

