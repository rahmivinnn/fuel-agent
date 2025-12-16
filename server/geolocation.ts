import { log } from "./vite";

const API_KEY = process.env.GEO_API_KEY;
const API_URL = "https://use.api.co.id/location/ip-geolocation";

interface GeoResponse {
    is_success: boolean;
    message: string;
    data: {
        ip: string;
        location: {
            country_code2: string;
            country_name: string;
        };
    };
}

export async function checkLocation(ip: string): Promise<{ allowed: boolean; country?: string; error?: string }> {
    // If running locally, req.ip might be ::1 or 127.0.0.1.
    // The API likely won't handle this well, but "no mock" means we call it.

    if (!API_KEY) {
        console.warn("Warning: GEO_API_KEY environment variable is not set. Geolocation validation will fail.");
        return { allowed: false, error: "Server Configuration Error: Missing API Key" };
    }

    try {
        const url = `${API_URL}?ip=${ip}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "x-api-co-id": API_KEY,
                "Accept": "application/json"
            },
        });

        if (!response.ok) {
            log(`Geolocation API failed: ${response.status} ${response.statusText}`);
            return { allowed: false, error: "Geolocation Service Unavailable" };
        }

        const data = (await response.json()) as GeoResponse;

        if (data.is_success && data.data && data.data.location) {
            const countryCode = data.data.location.country_code2;
            // Allow only US and UK (GB is the standard code for UK)
            const allowed = ["US", "GB"].includes(countryCode);

            return { allowed, country: countryCode };
        }

        return { allowed: false, error: "Could not determine location" };
    } catch (error) {
        log(`Geolocation error: ${error}`);
        // If external service fails, do we block? 
        // "no mock" implies we rely on the service. If it fails, we can't verify, so safe to block or fallback.
        // I'll block to be strict as requested.
        return { allowed: false, error: "Geolocation Verification Failed" };
    }
}