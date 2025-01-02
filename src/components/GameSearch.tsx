import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GameSearchProps {
  onSave: (game: { name: string; price: number; thumbnail: string }) => void;
}

export default function GameSearch({ onSave }: GameSearchProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim()) return;

    onSave({
      name: name.trim(),
      price: parseFloat(price),
      thumbnail: thumbnail || "/placeholder.svg",
    });

    setName("");
    setPrice("");
    setThumbnail("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="game-name">Nombre del Juego</Label>
        <Input
          id="game-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ingresa el nombre del juego..."
          className="bg-gaming-darker/50 border-gaming-accent/20 focus:border-gaming-accent"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="game-price">Precio (ARS)</Label>
        <Input
          id="game-price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Ingresa el precio..."
          className="bg-gaming-darker/50 border-gaming-accent/20 focus:border-gaming-accent"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="game-thumbnail">URL de la imagen (opcional)</Label>
        <Input
          id="game-thumbnail"
          type="url"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https://..."
          className="bg-gaming-darker/50 border-gaming-accent/20 focus:border-gaming-accent"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gaming-accent hover:bg-gaming-accent/90"
        disabled={!name.trim() || !price.trim()}
      >
        Calcular y Guardar
      </Button>
    </form>
  );
}