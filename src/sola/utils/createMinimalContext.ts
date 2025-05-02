import { ApiClient, SolaKitToolContext } from '..';

// Mock context for initialization
export const createMinimalContext = (): SolaKitToolContext => ({
  walletPublicKey: '',
  authToken: '',
  apiClient: new ApiClient({
    enableLogging: false,
  }),
});
