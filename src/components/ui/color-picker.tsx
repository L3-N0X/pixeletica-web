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
        <div className="relative size-9 rounded-md overflow-hidden">
          {/* Chessboard background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
          />
          {/* Color overlay */}
          <Input
            type="color"
            value={tempColor}
            onChange={handleColorChange}
            onBlur={handleColorComplete}
            className="absolute inset-0 z-10 size-full cursor-pointer p-0 border-0 bg-transparent opacity-0"
            style={{}}
            tabIndex={0}
            aria-label="Pick color"
          />
          <div
            className="absolute inset-0 z-5"
            style={{ backgroundColor: hexToRgba(tempColor, tempOpacity) }}
          />
        </div>
        <div className="flex-1">
          {/* Tooltip for alpha slider */}
          <div className="relative group">
            <Slider
              defaultValue={[opacity * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleOpacityChange}
              onValueCommit={handleOpacityComplete}
              className="alpha-slider"
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-20 hidden whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-80 group-hover:block">
              Alpha
            </div>
          </div>
        </div>
        <div className="w-12 text-center text-sm">{Math.round(tempOpacity * 100)}%</div>
      </div>
    </div>
  );
}
