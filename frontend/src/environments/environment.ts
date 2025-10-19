export const environment = {
  production: false,
  get API_BASE_URL(): string {
    try {
      // runtime config injected into page (see /assets/config.json or injected script)
      const win: any = window as any;
      if (win && win.__RUNTIME_CONFIG__ && win.__RUNTIME_CONFIG__.API_BASE_URL) {
        return win.__RUNTIME_CONFIG__.API_BASE_URL;
      }
    } catch (e) {
      // ignore
    }
    return 'http://backend:5000';
  }
};
