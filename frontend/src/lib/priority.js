import { ChevronDown, Minus, ChevronUp, Flame } from 'lucide-react';

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export const PRIORITY_META = {
  low: { label: 'Low', icon: ChevronDown, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
  medium: { label: 'Medium', icon: Minus, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  high: { label: 'High', icon: ChevronUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  urgent: { label: 'Urgent', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};
