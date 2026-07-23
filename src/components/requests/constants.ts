/** @format */

/**
 * Maximum length for rejection reason textarea
 */
export const MAX_REASON_LENGTH = 200;

/**
 * Default map coordinates (Central Europe - Frankfurt area)
 */
export const DEFAULT_MAP_COORDINATES = {
	lat: 50.1109,
	lng: 8.6821,
};

/**
 * Generate Google Maps embed URL
 */
export const getMapEmbedUrl = (lat?: number, lng?: number): string => {
	const { lat: defaultLat, lng: defaultLng } = DEFAULT_MAP_COORDINATES;
	const mapLat = lat ?? defaultLat;
	const mapLng = lng ?? defaultLng;
	return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d5120.5!2d${mapLng}!3d${mapLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus`;
};
