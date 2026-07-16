/**
 * Utilidad para manejar imágenes con fallback
 * Cuando el backend no está disponible, las rutas /uploads/... no funcionan
 * Este helper detecta eso y usa URLs de Unsplash como respaldo
 */

// Mapa de imágenes de respaldo (Unsplash) organizadas por categoría de producto
const IMAGENES_FALLBACK: Record<string, string[]> = {
  'Electrónicos': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
  ],
  'Deportes': [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=500&q=80',
  ],
  'Ropa': [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=500&q=80',
  ],
  'Hogar': [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80',
  ],
  'Salud': [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80',
    'https://images.unsplash.com/photo-1570194065650-d99fb4b8e0b6?w=500&q=80',
  ],
  'Juguetes': [
    'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=500&q=80',
  ],
  'Libros': [
    'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&q=80',
  ],
};

const PLACEHOLDER = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80';

// Cache para saber si el backend está disponible
let backendDisponible: boolean | null = null;

export async function verificarBackend(): Promise<boolean> {
  if (backendDisponible !== null) return backendDisponible;
  try {
    const response = await fetch('http://localhost:5000/api/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    backendDisponible = response.ok;
    return backendDisponible;
  } catch {
    backendDisponible = false;
    return false;
  }
}

/**
 * Obtiene una URL de imagen válida
 * Si la imagen es local (/uploads/...) y el backend no está disponible,
 * usa una imagen de Unsplash como respaldo
 */
export function obtenerImagen(url: string | undefined, categoria?: string, index: number = 0): string {
  if (!url || url === '/placeholder.png') {
    return getFallback(categoria, index);
  }

  // Si es una imagen local y el backend no está disponible, usar fallback
  if (url.startsWith('/uploads/') && backendDisponible === false) {
    return getFallback(categoria, index);
  }

  // Si es URL de Unsplash, usarla directamente
  if (url.includes('unsplash.com') || url.includes('images.unsplash.com')) {
    return url;
  }

  // Si es URL local y no sabemos si backend está disponible, asumir que sí
  if (url.startsWith('/uploads/')) {
    return `http://localhost:5000${url}`;
  }

  return url;
}

function getFallback(categoria?: string, index: number = 0): string {
  if (categoria && IMAGENES_FALLBACK[categoria]) {
    const imgs = IMAGENES_FALLBACK[categoria];
    return imgs[index % imgs.length];
  }
  // Si no hay categoría, usar la primera imagen de Electrónicos
  const todas = Object.values(IMAGENES_FALLBACK).flat();
  return todas[index % todas.length] || PLACEHOLDER;
}

/**
 * Obtiene múltiples imágenes para un producto
 */
export function obtenerImagenes(images: string[], categoria?: string): string[] {
  if (images.length === 0) {
    return [getFallback(categoria, 0)];
  }
  return images.map((img, i) => obtenerImagen(img, categoria, i));
}