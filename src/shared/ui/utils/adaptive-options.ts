export interface AdaptiveOptions {
  XXL: number
  XL: number
  LG: number
  MD: number
  SM: number
  XS: number
  XXS: number
}

export const applyAdaptiveOptions = (width: number, options: AdaptiveOptions | number): number => {
  if (typeof options === 'number') return options;

  if (width >= 1700) return options['XXL'];
  else if (width >= 1440) return options['XL'];
  else if (width >= 1200) return options['LG'];
  else if (width >= 960) return options['MD'];
  else if (width >= 640) return options['SM'];
  else if (width >= 480) return options['XS'];

  return options['XXS'];
};
