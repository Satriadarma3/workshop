import { createRealApi } from './client';
import { createMockApi } from './mock';

export { ApiError, tokenStore, setUnauthorizedHandler } from './client';

/**
 * Satu-satunya pintu ke data. Seluruh UI hanya memakai `api`, jadi mengganti
 * mock dengan backend sungguhan cukup dengan VITE_USE_MOCK=false.
 */
export const api = import.meta.env.VITE_USE_MOCK === 'false' ? createRealApi() : createMockApi();
