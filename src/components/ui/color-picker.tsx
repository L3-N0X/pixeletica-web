import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';
import { Input } from './input';
import { Slider } from './slider';

interface ColorPickerProps {
  label?: string;
  color: string;
  opacity: number;
  onChange: (color: string, opacity: number) => void;
  className?: string;
}

export function ColorPicker({ label, color, opacity, onChange, className }: ColorPickerProps) {
  const [hexColor, setHexColor] = React.useState<string>(color);
  const [tempColor, setTempColor] = React.useState<string>(color);
  const [tempOpacity, setTempOpacity] = React.useState<number>(opacity);

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempColor(e.target.value);
  };

  const handleColorComplete = () => {
    setHexColor(tempColor);
    onChange(tempColor, opacity);
  };

  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0] / 100;
    setTempOpacity(newOpacity);
  };

  const handleOpacityComplete = (value: number[]) => {
    const newOpacity = value[0] / 100;
    onChange(color, newOpacity);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div
          className="size-9 rounded-md border"
          style={{ backgroundColor: hexToRgba(tempColor, tempOpacity) }}
        />
        <Input
          type="color"
          value={tempColor}
          onChange={handleColorChange}
          onBlur={handleColorComplete}
          className="size-9 cursor-pointer p-0 border-0"
        />
        <div className="flex-1">
          <Slider
            defaultValue={[opacity * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={handleOpacityChange}
            onValueCommit={handleOpacityComplete}
          />
        </div>
        <div className="w-12 text-center text-sm">{Math.round(tempOpacity * 100)}%</div>
      </div>
    </div>
  );
}
