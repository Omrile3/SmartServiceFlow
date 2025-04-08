// This file provides utility functions used throughout the app

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}