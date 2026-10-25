import { clsx, type ClassValue } from 'clsx'; import { twMerge } from 'tailwind-merge';
export function cn(...inputs:ClassValue[]){return twMerge(clsx(inputs));}
export function money(value:number|undefined|null){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(value||0));}
export function dateLabel(value:string|undefined){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?value:d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
