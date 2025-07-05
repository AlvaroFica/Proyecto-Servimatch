
fetch(`${API_BASE_URL}/usuarios/`, {
  credentials: 'include'
})
  .then(r => r.json())
  .then(usuarios => {
    console.log('usuarios cargados:', usuarios); // ← esto
    const tbody = document.getElementById('usuarios-body');
    tbody.innerHTML = ''; // ← limpia antes de cargar de nuevo
    usuarios.forEach(u => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nombre || ''} ${u.apellido || ''}</td>
        <td>${u.email}</td>
        <td>${u.direccion || '-'}</td>
      `;
      tbody.appendChild(fila);
    });
  })
  .catch(err => console.error('Error cargando usuarios:', err));


fetch(`${API_BASE_URL}/feedback/`)
  .then(r => r.json())
  .then(data => {
    const pendientes = data.filter(f => !f.respuesta).length;
    if (pendientes > 0) {
      const badge = document.getElementById('comentarios-count');
      badge.style.display = 'inline-block';
      badge.textContent = pendientes;
    }
  });
