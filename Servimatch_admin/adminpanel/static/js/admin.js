const API_BASE_URL = 'http://localhost:8000/api';

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

      // Detectar y renderizar gráficos si los canvas existen
      if (document.getElementById('grafFeedback')) {
        renderChart('grafFeedback', 'bar', `${API_BASE_URL}/graficos/feedback-tipo/`, 'Cantidad');
      }
      if (document.getElementById('grafBoletas')) {
        renderChart('grafBoletas', 'doughnut', `${API_BASE_URL}/graficos/boletas-por-estado/`, 'Estado');
      }
      if (document.getElementById('grafServicios')) {
        renderChart('grafServicios', 'bar', `${API_BASE_URL}/graficos/servicios-populares/`, 'Servicios');
      }
    })
    .catch(err => {
      console.error('Error cargando contenido:', err);
      contenedor.innerHTML = '<p>Error al cargar el contenido.</p>';
    });
}

function cerrarVentana() {
  document.querySelector('.overlay').style.display = 'none';
  document.getElementById('ventanaContenido').style.display = 'none';
}


function actualizarHora() {
  const ahora = new Date();
  const horaFormateada = ahora.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  const horaEl = document.getElementById('horaActual');
  if (horaEl) horaEl.textContent = horaFormateada;
}
setInterval(actualizarHora, 1000);
actualizarHora();

fetch(`${API_BASE_URL}/feedback/?estado=pending`, {
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

function renderChart(id, type, url, label, bgList = []) {
  fetch(url).then(r => r.json()).then(data => {
    new Chart(document.getElementById(id), {
      type: type,
      data: {
        labels: data.labels,
        datasets: [{
          label: label,
          data: data.cantidades,
          backgroundColor: bgList.length ? bgList : 'rgba(75, 60, 145, 0.7)',
          borderRadius: type === 'bar' ? 10 : 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          title: {
            display: true,
            text: label,
            color: '#333',
            font: { size: 18 }
          }
        },
        scales: type === 'bar' ? {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, color: '#555' },
            grid: { color: '#eee' }
          },
          x: {
            ticks: { color: '#555', maxRotation: 0, minRotation: 0 },
            grid: { display: false }
          }
        } : {}
      }
    });
  });
}
