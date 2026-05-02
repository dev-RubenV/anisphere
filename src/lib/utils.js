import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Escapa caracteres especiais de RegExp no input do utilizador.
 * Previne ataques ReDoS (Regular Expression Denial of Service).
 *
 * @param {string} string - Input a escapar
 * @returns {string} String segura para usar em new RegExp()
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
