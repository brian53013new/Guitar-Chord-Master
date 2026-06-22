const API_BASE = '/api';

export const fetchConfig = async () => {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
};

export const fetchChords = async () => {
    const res = await fetch(`${API_BASE}/chords`);
    return res.json();
};

export const fetchScales = async () => {
    const res = await fetch(`${API_BASE}/scales`);
    return res.json();
};
