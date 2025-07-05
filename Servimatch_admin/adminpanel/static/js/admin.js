API_BASE_URL = 'https://Recnok.pythonanywhere.com/api'

function abrirVentana(url, titulo) {
  document.querySelector('.overlay').style.display = 'block';
  const modal = document.getElementById('ventanaContenido');
  modal.style.display = 'block';
  const contenedor = document.getElementById('contenidoVentana');
  contenedor.innerHTML = '<p style="padding:2rem;">Cargando ' + titulo + '...</p>';

  fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(r => r.text())
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const contenido = doc.querySelector('main') || doc.body;
      contenedor.innerHTML = contenido.innerHTML;
      contenido.querySelectorAll('script').forEach(script => {
        const s = document.createElement('script');
        if (script.src) s.src = script.src;
        else s.innerHTML = script.innerHTML;
        document.body.appendChild(s);
      });
    })
    .catch(() => contenedor.innerHTML = '<p>Error al cargar contenido.</p>');
}


function cerrarVentana() {
  document.querySelector('.overlay').style.display = 'none';
  document.getElementById('ventanaContenido').style.display = 'none';
}

fetch(`${API}/feedback/?estado=pending`, {
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})
  .then(res => res.json())
  .then(data => {
    const count = data.length || 0;
    const badge = document.getElementById('noti-count');
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'block';
    }
  });

  function actualizarHora() {
    const ahora = new Date();
    const horaFormateada = ahora.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    document.getElementById('horaActual').textContent = horaFormateada;
  }

  setInterval(actualizarHora, 1000);
  actualizarHora();
