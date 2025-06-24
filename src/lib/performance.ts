/**
 * Performance monitoring utilities for tracking loading times and optimization
 */

// Performance metrics interface
interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

// Track page load performance
export function trackPageLoadPerformance(): PerformanceMetrics {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  const metrics: PerformanceMetrics = {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
  };

  // Try to get Web Vitals if available
  try {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.largestContentfulPaint = lastEntry.startTime;
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      metrics.cumulativeLayoutShift = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.firstInputDelay = (entry as any).processingStart - entry.startTime;
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

  } catch (error) {
    console.warn('Web Vitals not available:', error);
  }

  return metrics;
}

// Log performance metrics
export function logPerformanceMetrics(metrics: PerformanceMetrics): void {
  console.group('🚀 Performance Metrics');
  console.log('Load Time:', `${metrics.loadTime.toFixed(2)}ms`);
  console.log('DOM Content Loaded:', `${metrics.domContentLoaded.toFixed(2)}ms`);
  
  if (metrics.firstContentfulPaint) {
    console.log('First Contentful Paint:', `${metrics.firstContentfulPaint.toFixed(2)}ms`);
  }
  
  if (metrics.largestContentfulPaint) {
    console.log('Largest Contentful Paint:', `${metrics.largestContentfulPaint.toFixed(2)}ms`);
  }
  
  if (metrics.cumulativeLayoutShift) {
    console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift.toFixed(4));
  }
  
  if (metrics.firstInputDelay) {
    console.log('First Input Delay:', `${metrics.firstInputDelay.toFixed(2)}ms`);
  }
  
  console.groupEnd();
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  // Wait for page to fully load
  window.addEventListener('load', () => {
    // Small delay to ensure all metrics are captured
    setTimeout(() => {
      const metrics = trackPageLoadPerformance();
      logPerformanceMetrics(metrics);
    }, 100);
  });
}

// Bundle size analysis (development only)
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    // Estimate bundle size from loaded resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;
    
    resources.forEach(resource => {
      if (resource.transferSize) {
        totalSize += resource.transferSize;
      }
    });
    
    console.group('📦 Bundle Analysis');
    console.log('Total Transfer Size:', `${(totalSize / 1024).toFixed(2)} KB`);
    console.log('Resources Loaded:', resources.length);
    
    // Group by type
    const byType = resources.reduce((acc, resource) => {
      const url = new URL(resource.name);
      const ext = url.pathname.split('.').pop() || 'unknown';
      acc[ext] = (acc[ext] || 0) + (resource.transferSize || 0);
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byType)
      .sort(([,a], [,b]) => b - a)
      .forEach(([type, size]) => {
        console.log(`${type.toUpperCase()}:`, `${(size / 1024).toFixed(2)} KB`);
      });
    
    console.groupEnd();
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.group('💾 Memory Usage');
    console.log('Used JS Heap:', `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('Total JS Heap:', `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('JS Heap Limit:', `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    console.groupEnd();
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
} 