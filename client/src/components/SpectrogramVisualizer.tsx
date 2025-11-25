import { useEffect, useRef } from 'react';

interface SpectrogramVisualizerProps {
  data: number[][] | null;
  width?: number;
  height?: number;
  colorMap?: 'viridis' | 'magma' | 'inferno' | 'plasma';
  showAxes?: boolean;
  title?: string;
}

const colorMaps = {
  viridis: [
    [68, 1, 84], [72, 35, 116], [64, 67, 135], [52, 94, 141],
    [41, 120, 142], [32, 144, 140], [34, 167, 132], [68, 190, 112],
    [121, 209, 81], [189, 222, 38], [253, 231, 37]
  ],
  magma: [
    [0, 0, 4], [28, 16, 68], [79, 18, 123], [129, 37, 129],
    [181, 54, 122], [229, 80, 100], [251, 135, 97], [254, 194, 135],
    [252, 253, 191]
  ],
  inferno: [
    [0, 0, 4], [40, 11, 84], [101, 21, 110], [159, 42, 99],
    [212, 72, 66], [245, 125, 21], [250, 193, 39], [252, 255, 164]
  ],
  plasma: [
    [13, 8, 135], [75, 3, 161], [125, 3, 168], [168, 34, 150],
    [203, 70, 121], [229, 107, 93], [248, 148, 65], [253, 195, 40],
    [240, 249, 33]
  ]
};

function interpolateColor(
  colors: number[][],
  value: number
): [number, number, number] {
  const clampedValue = Math.max(0, Math.min(1, value));
  const index = clampedValue * (colors.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
  const t = index - lowerIndex;

  const lowerColor = colors[lowerIndex];
  const upperColor = colors[upperIndex];

  return [
    Math.round(lowerColor[0] + (upperColor[0] - lowerColor[0]) * t),
    Math.round(lowerColor[1] + (upperColor[1] - lowerColor[1]) * t),
    Math.round(lowerColor[2] + (upperColor[2] - lowerColor[2]) * t),
  ];
}

export function SpectrogramVisualizer({
  data,
  width = 400,
  height = 200,
  colorMap = 'viridis',
  showAxes = true,
  title,
}: SpectrogramVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = colorMaps[colorMap];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const axisOffset = showAxes ? 40 : 0;
    const plotWidth = width - axisOffset;
    const plotHeight = height - (showAxes ? 30 : 0);

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const numTimeFrames = data.length;
    const numFreqBins = data[0]?.length || 0;

    if (numTimeFrames === 0 || numFreqBins === 0) return;

    const cellWidth = plotWidth / numTimeFrames;
    const cellHeight = plotHeight / numFreqBins;

    for (let t = 0; t < numTimeFrames; t++) {
      for (let f = 0; f < numFreqBins; f++) {
        const value = data[t][f] || 0;
        const [r, g, b] = interpolateColor(colors, value);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        
        const x = axisOffset + t * cellWidth;
        const y = plotHeight - (f + 1) * cellHeight;
        ctx.fillRect(x, y, Math.ceil(cellWidth), Math.ceil(cellHeight));
      }
    }

    if (showAxes) {
      ctx.strokeStyle = '#4a4a6a';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(axisOffset, 0);
      ctx.lineTo(axisOffset, plotHeight);
      ctx.lineTo(width, plotHeight);
      ctx.stroke();

      ctx.fillStyle = '#8a8aaa';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      
      const timeLabels = ['0s', '1s', '2s', '3s'];
      timeLabels.forEach((label, i) => {
        const x = axisOffset + (i / (timeLabels.length - 1)) * plotWidth;
        ctx.fillText(label, x, height - 5);
      });

      ctx.textAlign = 'right';
      const freqLabels = ['0', '5k', '10k'];
      freqLabels.forEach((label, i) => {
        const y = plotHeight - (i / (freqLabels.length - 1)) * plotHeight + 4;
        ctx.fillText(label, axisOffset - 5, y);
      });

      ctx.textAlign = 'center';
      ctx.fillText('Zaman', width / 2 + axisOffset / 2, height - 15);
      
      ctx.save();
      ctx.translate(12, plotHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Frekans (Hz)', 0, 0);
      ctx.restore();
    }

  }, [data, width, height, colorMap, colors, showAxes]);

  return (
    <div className="relative">
      {title && (
        <div className="text-sm text-muted-foreground mb-2 text-center">{title}</div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-md border border-border"
        data-testid="spectrogram-canvas"
      />
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-md">
          <span className="text-muted-foreground text-sm">Spektrogram bekleniyor...</span>
        </div>
      )}
    </div>
  );
}
