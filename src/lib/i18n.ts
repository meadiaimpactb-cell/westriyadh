import ar from './ar';
import en from './en';
import type { Lang } from './ar';

export type { Lang };
const arTyped = ar as any;
export type Strings = typeof arTyped;
export const STRINGS: Record<Lang, Strings> = { ar: ar as Strings, en: en as Strings };
