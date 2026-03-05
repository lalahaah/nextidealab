import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn 'cn' utility
 * @param {any[]} inputs - class names or objects
 * @returns {string} merged tailwind class names
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
