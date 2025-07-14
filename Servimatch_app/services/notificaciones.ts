import axios from 'axios';

// Reemplaza esto con la IP real de tu backend si no usas localhost en dispositivo físico
const API_BASE = 'http://192.168.1.51:8000/api';

export async function obtenerNotificaciones(token: string) {
  const response = await axios.get(`${API_BASE}/notificaciones/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function marcarComoLeidas(token: string) {
  await axios.post(`${API_BASE}/notificaciones/marcar_como_leidas/`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
