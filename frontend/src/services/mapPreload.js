let leafletPreloadPromise = null;

export function preloadLeaflet() {
  if (leafletPreloadPromise) return leafletPreloadPromise;

  leafletPreloadPromise = Promise.all([
    import('leaflet'),
    import('leaflet/dist/leaflet.css'),
  ]).catch(() => null);

  return leafletPreloadPromise;
}
