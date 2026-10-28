import { BudgetChoice, DesignStyle } from '../types';

export const DESIGN_STYLES: { label: DesignStyle; description: string }[] = [
  { label: 'Modern', description: 'Clean lines, purposeful forms, and understated elegance' },
  { label: 'Minimalist', description: 'Essential items only, open negative space, zero clutter' },
  { label: 'Cozy', description: 'Warm textures, gentle amber lighting, inviting materials' },
  { label: 'Scandinavian', description: 'Blonde woods, functional simplicity, natural daylight' },
  { label: 'Traditional', description: 'Timeless architectural details, classic wood tones' },
  { label: 'Industrial', description: 'Exposed textures, dark steel accents, raw character' },
  { label: 'Luxury', description: 'Refined finishes, polished accents, upscale statement pieces' },
  { label: 'Contemporary', description: 'Current trends, balanced geometry, artistic accents' },
  { label: 'Let AI suggest a style', description: 'AI will select the best aesthetic for your space and lighting' },
];

export const BUDGET_CHOICES: BudgetChoice[] = [
  'Under ₹5,000',
  '₹5,000–₹10,000',
  '₹10,000–₹25,000',
  '₹25,000 and above',
  'Custom budget',
  'Not sure yet',
];

export const ITEMS_TO_KEEP_OPTIONS: string[] = [
  'Existing furniture',
  'Doors and windows',
  'Flooring',
  'Wall color',
  'Important decorations',
  'Ceiling light fixtures',
  'Curtains or blinds',
];

export const IMPROVEMENT_GOALS_OPTIONS: string[] = [
  'Better lighting',
  'More storage',
  'Better furniture arrangement',
  'More comfortable space',
  'Better decoration',
  'More seating',
  'Better customer movement',
  'Better product visibility',
  'Better workspace organization',
];

export const CONSTRAINT_OPTIONS: string[] = [
  'Rental property; avoid permanent modifications',
  'No drilling into walls',
  'Keep the existing floor layout',
  'Avoid replacing large furniture',
  'Limited compact space',
  'Accessibility / wheelchair friendly',
];
