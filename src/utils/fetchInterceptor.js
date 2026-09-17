const originalFetch = window.fetch;

window.fetch = async (...args) => {
  let [resource, config] = args;
  
  if (typeof resource === 'string' && resource.startsWith('/api/') && resource !== '/api/login') {
    const token = localStorage.getItem('auth_token');
    
    let newConfig = { ...(config || {}) };
    let headers = newConfig.headers || {};
    
    if (headers instanceof Headers) {
      const newHeaders = new Headers(headers);
      if (token) newHeaders.set('Authorization', `Bearer ${token}`);
      newHeaders.set('Accept', 'application/json');
      newConfig.headers = newHeaders;
    } else {
      newConfig.headers = { ...headers, 'Accept': 'application/json' };
      if (token) newConfig.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config = newConfig;
  }
  
  const response = await originalFetch.call(window, resource, config);
  
  // If unauthorized, force logout
  if (response.status === 401 && typeof resource === 'string' && resource !== '/api/login' && resource !== '/api/user') {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  
  return response;
};
