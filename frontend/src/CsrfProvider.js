import React, { createContext, useContext, useState, useEffect } from 'react';

const CsrfContext = createContext();

export function useCsrfToken() {
  return useContext(CsrfContext);
}

export function CsrfProvider({ children }) {
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    async function fetchCsrf() {
      const response = await fetch('/csrf/', {
        credentials: 'include',
      });
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    }
    fetchCsrf();
  }, []);

  return (
    <CsrfContext.Provider value={csrfToken}>
      {children}
    </CsrfContext.Provider>
  );
}