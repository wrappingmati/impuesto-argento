// src/components/DolarInfo.tsx
import { useEffect, useState } from "react";

export default function DolarInfo() {
  const [blue, setBlue] = useState<number | null>(null);
  const [oficial, setOficial] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.bluelytics.com.ar/v2/latest")
      .then((res) => res.json())
      .then((data) => {
        setBlue(data.blue.value_avg);
        setOficial(data.oficial.value_avg);
      })
      .catch((err) => console.error("Error al traer dólar:", err));
  }, []);

  return (
    <div className="bg-gaming-card p-4 rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-2 text-gaming-accent">
        Cotización del dólar
      </h2>
      {blue && oficial ? (
        <div className="space-y-1">
          <p><strong>Blue:</strong> ${blue}</p>
          <p><strong>Oficial:</strong> ${oficial}</p>
        </div>
      ) : (
        <p className="text-muted-foreground">Cargando datos...</p>
      )}
    </div>
  );
}
