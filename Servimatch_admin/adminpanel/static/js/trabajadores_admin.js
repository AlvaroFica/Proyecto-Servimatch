
fetch(`${API_BASE_URL}/trabajadores/`)
  .then(r => r.json())
  .then(arr => {
    const tbody = document.getElementById('trabajadores-body');
    arr.forEach(t => {
      const nombre = t.nombre || '-';
      const apellido = t.apellido || '-';
      const profesion = t.profesion || '-';
      const direccion = t.direccion || '-';
      const verificado = '❌';

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${nombre} ${apellido}</td>
        <td>${profesion}</td>
        <td>${direccion}</td>
        <td>${verificado}</td>
      `;
      tbody.appendChild(fila);
    });

  });
