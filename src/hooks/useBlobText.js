// src/hooks/useBlobText.js
import { useState, useEffect } from 'react';

export default function useBlobText(name) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  async function save(value) {
    await fetch(`/api/blob/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: value,              // raw markdown string
    });
  }

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/blob/${name}`);
        let data;
        if (res.status === 404) {
          data = '';
        } else if (res.ok) {
          data = await res.text();
        } else {
          console.error(`Error fetching blob: ${res.statusText}`);
          data = '';
        }
        if (isMounted) setText(data);
      } catch (err) {
        console.error('Fetch error:', err);
        if (isMounted) setText('');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [name]);

  return { text, loading, save };
}