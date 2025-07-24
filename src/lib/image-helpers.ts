/**
 * Advanced image helper functions with optimization for better performance
 * Includes WebP support, lazy loading, and intelligent caching
 */

// Default fallback images - using existing files
export const DEFAULT_PIN = "/amber_pin.png";
export const DEFAULT_PORTRAIT = "/shelly_portrait.png";

/**
 * Check if WebP is supported by the browser
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get optimized image source with WebP fallback
 */
export function getOptimizedImageSrc(basePath: string, useWebP: boolean = false): string {
  if (!basePath) return DEFAULT_PORTRAIT;
  
  // For now, disable WebP conversion since we don't have WebP versions
  // TODO: Add WebP versions of images in the future
  return basePath;
}

/**
 * Generate path for pin images with optimization
 */
export function getPin(name: string): string {
  if (!name) return DEFAULT_PIN;
  
  // Handle special cases for brawler names with spaces or special characters
  let fileName = name.toLowerCase().replace(/\s+/g, ' ');
  
  // Special case mappings
  if (fileName === 'el primo') {
    fileName = 'el primo';
  } else if (fileName === 'larry & lawrie') {
    fileName = 'larry & lawrie';
  }
  
  const basePath = `/${fileName}_pin.png`;
  return basePath;
}

/**
 * Generate path for portrait images with optimization
 */
export function getPortrait(name: string): string {
  if (!name) return DEFAULT_PORTRAIT;
  
  // Handle special cases for brawler names with spaces or special characters
  let fileName = name.toLowerCase().replace(/\s+/g, ' ');
  
  // Special case mappings
  if (fileName === 'el primo') {
    fileName = 'el primo';
  } else if (fileName === 'larry & lawrie') {
    fileName = 'larry & lawrie';
  }
  
  const basePath = `/${fileName}_portrait.png`;
  return basePath;
}

/**
 * Preload image with better error handling and timeout
 */
export function preloadImage(src: string, timeout: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutId = setTimeout(() => {
      reject(new Error(`Image load timeout: ${src}`));
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timeoutId);
      resolve();
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
}

/**
 * Preload multiple images with concurrent limit
 */
export async function preloadImages(srcs: string[], concurrency: number = 5): Promise<void> {
  const chunks: string[][] = [];
  for (let i = 0; i < srcs.length; i += concurrency) {
    chunks.push(srcs.slice(i, i + concurrency));
  }
  
  for (const chunk of chunks) {
    try {
      await Promise.all(chunk.map(src => preloadImage(src)));
    } catch (error) {
      console.warn('Some images in chunk failed to preload:', error);
    }
  }
}

/**
 * Advanced lazy loading with IntersectionObserver
 */
export function setupAdvancedImageLazyLoading(): IntersectionObserver | null {
  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img[data-src]').forEach(img => {
      const imgEl = img as HTMLImageElement;
      const src = imgEl.dataset.src;
      if (src) {
        imgEl.src = src;
        imgEl.removeAttribute('data-src');
      }
    });
    return null;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          // Add loading class for smooth transition
          img.classList.add('loading');
          
          // Create a new image to preload
          const newImg = new Image();
          newImg.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            observer.unobserve(img);
          };
          
          newImg.onerror = () => {
            // Try fallback image
            const fallback = img.dataset.fallback || DEFAULT_PORTRAIT;
            img.src = fallback;
            img.classList.remove('loading');
            img.classList.add('error');
            observer.unobserve(img);
          };
          
          newImg.src = src;
        }
      }
    });
  }, {
    rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
    threshold: 0.1
  });

  // Observe all images with data-src attribute
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  return imageObserver;
}

/**
 * Create responsive image sources for different screen sizes
 */
export function createResponsiveImageSrcs(baseName: string, type: 'pin' | 'portrait'): {
  small: string;
  medium: string;
  large: string;
} {
  const suffix = type === 'pin' ? '_pin.png' : '_portrait.png';
  const base = `/${baseName.toLowerCase()}${suffix}`;
  
  return {
    small: getOptimizedImageSrc(base),
    medium: getOptimizedImageSrc(base),
    large: getOptimizedImageSrc(base)
  };
}

/**
 * Preload critical game images with priority
 */
export async function preloadCriticalImages(): Promise<void> {
  const highPriorityImages = [
    DEFAULT_PIN,
    DEFAULT_PORTRAIT,
    "/ClassicIcon.png",
    "/AudioIcon.png",
    "/GadgetIcon.png",
    "/bs_home_icon.png"
  ];

  const mediumPriorityImages = [
    "/BRAWLDLE-HOME-BACKGROUND-MOBILE.png",
    "/AudioMode_Background.png",
    "/ClassicMode_Background.png",
    "/GadgetMode_Background.png"
  ];

  try {
    // Load high priority images first
    await preloadImages(highPriorityImages, 3);
    console.log('High priority images preloaded');
    
    // Load medium priority images in background
    setTimeout(() => {
      preloadImages(mediumPriorityImages, 2).then(() => {
        console.log('Medium priority images preloaded');
      }).catch(error => {
        console.warn('Some medium priority images failed to preload:', error);
      });
    }, 1000);
    
  } catch (error) {
    console.warn('Some critical images failed to preload:', error);
  }
}

/**
 * Image cache management
 */
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private maxSize = 50;

  get(src: string): HTMLImageElement | undefined {
    return this.cache.get(src);
  }

  set(src: string, img: HTMLImageElement): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(src, img);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();

/**
 * Optimized image loading with caching
 */
export function loadImageWithCache(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Gadget image helper (shared by Daily/Survival modes)
export function getGadgetImagePath(brawler: string, gadgetName?: string): string {
  if (!brawler) {
    return "/GadgetImages/shelly_gadget_01.png";
  }

  const normalized = brawler.toLowerCase().replace(/ /g, '_');

  // Hard-coded special cases whose filenames break the rule
  const specialMap: Record<string, string> = {
    "mr.p": "/GadgetImages/mrp_gadget_01.png",
    "el primo": "/GadgetImages/elprimo_gadget_01.png",
    "colonel ruffs": "/GadgetImages/colonel_ruffs_gadget_01.png",
  };
  const specialKey = brawler.toLowerCase();
  if (specialMap[specialKey]) return specialMap[specialKey];

  // Special short names (e.g. R-T, Jae-Yong) that need custom logic
  const cleaned = brawler.toLowerCase().replace(/[-_ ]/g, "");
  if (cleaned === "rt") {
    return gadgetName && /2|second/i.test(gadgetName)
      ? "/GadgetImages/rt_gadget_02.png"
      : "/GadgetImages/rt_gadget_01.png";
  }
  if (cleaned === "jaeyong") {
    return gadgetName && /2|second/i.test(gadgetName)
      ? "/GadgetImages/Jae-Yong_gadget_2.png"
      : "/GadgetImages/Jae-Yong_gadget_1.png";
  }

  // Determine index suffix
  let idx = "01";
  if (gadgetName) {
    const m = gadgetName.match(/(\d+)/);
    if (m) idx = m[1].padStart(2, "0");
    else if (/second/i.test(gadgetName)) idx = "02";
  }

  return `/GadgetImages/${normalized}_gadget_${idx}.png`;
}

// Legacy exports for backward compatibility
export { setupAdvancedImageLazyLoading as setupImageLazyLoading };
