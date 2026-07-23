type JwtHeader = {
    alg: string;
    typ: string;
    [key: string]: string;
  };

  // Custom permission from employee direct permissions
  export type JwtPermission = {
    id: number;
    name: string;
    scope: string;
  };

  // Updated JWT payload structure based on actual backend auth.service.js
  export type JwtPayload = {
    sub: string;            // employee_id as string
    userId: number;         // employee_id as number
    role: {
      id: number | null;    // role_id
      name: string | null;  // role_name
    };
    permission: JwtPermission[];  // custom/direct employee permissions
    teamIds: number[];      // team IDs the user belongs to
    iat: number;
    exp: number;
  };
  
  type DecodedToken = {
    header: JwtHeader;
    payload: JwtPayload;
  } | null;
  
  function base64UrlDecode(str: string): string {
    try {
      // Convert from base64url to base64
      str = str.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if needed
      const pad = str.length % 4;
      if (pad) {
        str += '='.repeat(4 - pad);
      }
      return atob(str);
    } catch {
      // Error logged
      throw new Error('Invalid base64 encoding');
    }
  }
  
  export const decodeToken = (token: string): DecodedToken => {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const parts = token.split('.');
      
      if (parts.length !== 3) {
        return null;
      }

      const [header, payload] = parts;
  
      if (!header || !payload) {
        return null;
      }
  
      const decodedHeader = base64UrlDecode(header);
      const decodedPayload = base64UrlDecode(payload);
  
      return {
        header: JSON.parse(decodedHeader) as JwtHeader,
        payload: JSON.parse(decodedPayload) as JwtPayload,
      };
    } catch {
      return null;
    }
  };

  /**
   * Check if a JWT token is expired
   * @param token - The JWT token to check
   * @returns true if token is expired, false if valid, null if invalid token
   */
  export const isTokenExpired = (token: string): boolean | null => {
    try {
      const decoded = decodeToken(token);
      
      if (!decoded || !decoded.payload) {
        return null; // Invalid token
      }

      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      const expirationTime = decoded.payload.exp;

      return currentTime >= expirationTime;
    } catch {
      return null; // Invalid token
    }
  };

  /**
   * Check if a JWT token is valid (not expired and properly formatted)
   * @param token - The JWT token to check
   * @returns true if token is valid, false otherwise
   */
  export const isTokenValid = (token: string): boolean => {
    const expired = isTokenExpired(token);
    return expired === false; // Only valid if not expired and not null
  };
  
