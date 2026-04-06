let googleMapsPromise = null;

export function loadGoogleMaps() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps solo funciona en navegador'));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(
      new Error('Falta REACT_APP_GOOGLE_MAPS_API_KEY en frontend/.env'),
    );
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', () =>
        reject(new Error('No se pudo cargar Google Maps')),
      );
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&region=AR`;
    script.onload = () => resolve(window.google);
    script.onerror = () =>
      reject(new Error('No se pudo cargar el script de Google Maps'));

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function preloadGoogleMaps() {
  return loadGoogleMaps().catch(() => null);
}
