import { useState, useEffect } from "react";

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by your browser"
      });
      setLoading(false);
      return;
    }

    // Get current position with fallback options
    const getCurrentPosition = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          });
          setLoading(false);
        },
        (err) => {
          // Handle different error types
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError({
                code: err.code,
                message: "Location access denied. Please enable location services in your browser settings."
              });
              break;
            case err.POSITION_UNAVAILABLE:
              setError({
                code: err.code,
                message: "Location information is unavailable. This may happen when using a VPN."
              });
              break;
            case err.TIMEOUT:
              setError({
                code: err.code,
                message: "Location request timed out. Please try again."
              });
              break;
            default:
              setError({
                code: err.code,
                message: "An unknown error occurred while getting your location."
              });
              break;
          }
          setLoading(false);
        },
        {
          enableHighAccuracy: false, // Try with lower accuracy first
          timeout: 10000,
          maximumAge: 300000 // Use cached position up to 5 minutes old
        }
      );
    };

    // Try high accuracy first, then fall back to low accuracy
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        });
        setLoading(false);
      },
      () => {
        // If high accuracy fails, try low accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setPosition({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp
            });
            setLoading(false);
          },
          (err) => {
            // Handle different error types
            switch (err.code) {
              case err.PERMISSION_DENIED:
                setError({
                  code: err.code,
                  message: "Location access denied. Please enable location services in your browser settings."
                });
                break;
              case err.POSITION_UNAVAILABLE:
                setError({
                  code: err.code,
                  message: "Location information is unavailable. This may happen when using a VPN or if location services are disabled."
                });
                break;
              case err.TIMEOUT:
                setError({
                  code: err.code,
                  message: "Location request timed out. Please try again."
                });
                break;
              default:
                setError({
                  code: err.code,
                  message: "An unknown error occurred while getting your location."
                });
                break;
            }
            setLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 600000 // Use cached position up to 10 minutes old
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Watch position for continuous updates (with longer timeout for VPN compatibility)
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp
        });
        setLoading(false);
      },
      (err) => {
        // Don't set error for watchPosition as it continues trying
        console.warn("Watch position error:", err);
      },
      {
        enableHighAccuracy: false, // Lower accuracy for better VPN compatibility
        timeout: 30000, // Longer timeout for VPN connections
        maximumAge: 120000 // Use cached position up to 2 minutes old
      }
    );

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { position, error, loading };
}