interface ColorPair {
  background: string;
  foreground: string;
}

/**
 * Generates a more distributed hash from a string to avoid similar colors for similar names
 */
function distributedHash(str: string): number {
  let hash = 5381; // Use a different initial value

  // Process string in both directions to increase variation
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) + hash + char; // hash * 33 + char
  }

  // Add reverse processing for more entropy
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str.charCodeAt(i);
    hash = (hash << 3) + hash + char * (i + 1); // Position-weighted
  }

  // Additional mixing to spread similar inputs
  hash ^= hash >>> 16;
  hash *= 0x85ebca6b;
  hash ^= hash >>> 13;
  hash *= 0xc2b2ae35;
  hash ^= hash >>> 16;

  return Math.abs(hash);
}

/**
 * Converts HSL values to hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Calculates relative luminance of a color
 */
function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const sRGB = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculates contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Generates unique background and foreground colors for a given name
 * Uses improved hashing to minimize similar colors for similar names
 */
export function generateColorsForName(name: string): ColorPair {
  if (!name || name.trim().length === 0) {
    return { background: '#6b7280', foreground: '#ffffff' };
  }

  const normalizedName = name.toLowerCase().trim();
  const hash = distributedHash(normalizedName);

  // Use multiple hash segments for better distribution
  const hash1 = distributedHash(normalizedName + '_hue');
  const hash2 = distributedHash(normalizedName + '_sat');
  const hash3 = distributedHash(normalizedName + '_light');

  // Generate hue from first hash with better distribution
  const hue = hash1 % 360;

  // Use golden ratio for better hue distribution
  const goldenAngle = 137.5; // Golden angle in degrees
  const adjustedHue = (hue + ((hash % 1000) * goldenAngle) / 1000) % 360;

  // Generate saturation and lightness from different hash segments
  const saturationSeed = hash2 % 100;
  const lightnessSeed = hash3 % 100;

  // Generate background color with good saturation and moderate lightness
  const bgSaturation = 0.45 + (saturationSeed / 100) * 0.35; // 45-80%
  const bgLightness = 0.25 + (lightnessSeed / 100) * 0.5; // 25-75%

  const backgroundColor = hslToHex(adjustedHue, bgSaturation, bgLightness);

  // Determine if we need light or dark foreground
  const bgLuminance = getLuminance(backgroundColor);

  // Choose foreground color based on background luminance
  let foregroundColor: string;

  if (bgLuminance > 0.5) {
    // Dark background, use light foreground
    foregroundColor = '#ffffff';
  } else {
    // Light background, use dark foreground
    foregroundColor = '#000000';
  }

  // Check contrast ratio and adjust if needed
  const contrastRatio = getContrastRatio(backgroundColor, foregroundColor);

  if (contrastRatio < 4.5) {
    // If contrast is too low, use high contrast alternatives
    if (bgLuminance < 0.3) {
      foregroundColor = '#ffffff';
    } else if (bgLuminance > 0.7) {
      foregroundColor = '#000000';
    } else {
      // For mid-range luminance, choose based on which gives better contrast
      const whiteContrast = getContrastRatio(backgroundColor, '#ffffff');
      const blackContrast = getContrastRatio(backgroundColor, '#000000');
      foregroundColor = whiteContrast > blackContrast ? '#ffffff' : '#000000';
    }
  }

  return {
    background: backgroundColor,
    foreground: foregroundColor,
  };
}

// Example usage with better distribution:
// const colors1 = generateColorsForName("John");     // Different colors
// const colors2 = generateColorsForName("Jon");      // Now more different
// const colors3 = generateColorsForName("Johnny");   // Also different

// Alternative function for even more distinction
export function generateDistinctColorsForName(
  name: string,
  context?: string,
): ColorPair {
  const seed = context ? `${name}_${context}` : name;
  const hash = distributedHash(seed.toLowerCase().trim());

  // Pre-defined color palette for maximum distinction
  const colorPalette = [
    { h: 0, s: 0.7, l: 0.5 }, // Red
    { h: 30, s: 0.8, l: 0.6 }, // Orange
    { h: 60, s: 0.7, l: 0.5 }, // Yellow
    { h: 120, s: 0.6, l: 0.4 }, // Green
    { h: 180, s: 0.7, l: 0.5 }, // Cyan
    { h: 240, s: 0.8, l: 0.6 }, // Blue
    { h: 270, s: 0.7, l: 0.5 }, // Purple
    { h: 300, s: 0.6, l: 0.5 }, // Magenta
    { h: 15, s: 0.8, l: 0.4 }, // Brown
    { h: 200, s: 0.9, l: 0.3 }, // Dark Blue
    { h: 320, s: 0.7, l: 0.4 }, // Pink
    { h: 80, s: 0.6, l: 0.3 }, // Olive
  ];

  const colorIndex = hash % colorPalette.length;
  const selectedColor = colorPalette[colorIndex];

  // Add slight variation while keeping distinction
  const hueVariation = (hash % 20) - 10; // ±10 degrees
  const finalHue = (selectedColor.h + hueVariation + 360) % 360;

  const backgroundColor = hslToHex(finalHue, selectedColor.s, selectedColor.l);
  const bgLuminance = getLuminance(backgroundColor);
  const foregroundColor = bgLuminance > 0.5 ? '#000000' : '#ffffff';

  return {
    background: backgroundColor,
    foreground: foregroundColor,
  };
}

// You can also create a utility for CSS styles:
export function generateStylesForName(name: string): {
  backgroundColor: string;
  color: string;
} {
  const colors = generateColorsForName(name);
  return {
    backgroundColor: colors.background,
    color: colors.foreground,
  };
}
