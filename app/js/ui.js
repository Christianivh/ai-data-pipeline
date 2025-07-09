// js/ui.js

import { getTicketsForProject } from './apiService.js';  // Importa la función que obtiene los tickets

/**
 * Muestra un indicador de carga (overlay con spinner y mensaje)
 * en el contenedor padre del listado de tickets.
 */
export function showLoadingIndicator() {
  // Usamos el contenedor padre del elemento "detalle-proyecto-tickets"
  const ticketsEl = document.getElementById('detalle-proyecto-tickets');
  if (!ticketsEl) {
    console.error("No se encontró el elemento 'detalle-proyecto-tickets'.");
    return;
  }
  const detailContainer = ticketsEl.parentElement;
  // Comprobar si ya existe el indicador
  let loader = document.getElementById('loading-indicator');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loading-indicator';
    loader.classList.add('d-flex', 'justify-content-center', 'align-items-center');
    // Estilos para cubrir el contenedor
    loader.style.position = 'absolute';
    loader.style.top = 0;
    loader.style.left = 0;
    loader.style.width = '100%';
    loader.style.height = '100%';
    loader.style.backgroundColor = 'rgba(255,255,255,0.7)';
    // Contenido: spinner de Bootstrap y texto "Cargando..."
    loader.innerHTML = `
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <div>Cargando...</div>
      </div>
    `;
    // Asegurarse de que el contenedor tenga posición relativa
    detailContainer.style.position = 'relative';
    detailContainer.appendChild(loader);
  }
}

/**
 * Oculta el indicador de carga.
 */
export function hideLoadingIndicator() {
  const loader = document.getElementById('loading-indicator');
  if (loader) {
    loader.remove();
  }
}

/**
 * Muestra la vista especificada y oculta las demás.
 * Se asume que cada vista tiene la clase "view" y un id "view-[nombre]".
 * @param {string} viewName - Nombre de la vista a mostrar.
 */
export function showView(viewName) {
  const views = document.querySelectorAll('.view');
  views.forEach(view => view.classList.remove('active'));
  const activeView = document.getElementById('view-' + viewName);
  if (activeView) {
    activeView.classList.add('active');
  }
}

/**
 * Configura los eventos del navbar para cambiar de vistas.
 */
export function setupNavEvents() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const view = btn.getAttribute('data-view');
      showView(view);
    });
  });
}

/**
 * Renderiza la lista de proyectos en #lista-proyectos.
 * Cada proyecto se muestra en dos filas:
 *   - Primera fila: la Key a la izquierda y el ProjectType a la derecha.
 *   - Segunda fila: el Name del proyecto.
 * Al hacer click en un proyecto, se marca como activo y se carga el detalle del proyecto.
 * @param {Array} projects - Arreglo de objetos con los datos de cada proyecto.
 */
export function addProjectsToList(projects) {
  const projectList = document.getElementById('lista-proyectos');
  projectList.innerHTML = '';  // Limpia el contenido previo

  projects.forEach(proj => {
    // Crear el <li> principal
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'align-items-start', 'mb-1');

    // Crear la imagen del avatar
    const avatar = document.createElement('img');
    avatar.src = (proj.avatarUrls && proj.avatarUrls['24x24']) || 'https://via.placeholder.com/24';
    avatar.alt = `Avatar de ${proj.name}`;
    avatar.width = 24;
    avatar.height = 24;
    avatar.classList.add('rounded-circle', 'me-2');

    // Contenedor principal para el texto en dos filas
    const textContainer = document.createElement('div');
    textContainer.classList.add('flex-grow-1', 'd-flex', 'flex-column');

    // Primera fila: Key y badge de ProjectType
    const firstRow = document.createElement('div');
    firstRow.classList.add('d-flex', 'justify-content-between');
    const keyElem = document.createElement('span');
    keyElem.classList.add('fw-bold');
    keyElem.textContent = proj.key || 'SIN-KEY';
    const badge = document.createElement('span');
    badge.classList.add('badge', 'bg-primary');
    badge.textContent = proj.projectTypeKey || 'N/A';
    firstRow.appendChild(keyElem);
    firstRow.appendChild(badge);

    // Segunda fila: Nombre del proyecto
    const secondRow = document.createElement('div');
    const nameElem = document.createElement('small');
    nameElem.textContent = proj.name || 'Proyecto sin nombre';
    secondRow.appendChild(nameElem);

    textContainer.appendChild(firstRow);
    textContainer.appendChild(secondRow);

    li.appendChild(avatar);
    li.appendChild(textContainer);

    // Evento de click: marca activo y carga detalle
    li.addEventListener('click', () => {
      // Remueve clase 'active' de todos los items
      document.querySelectorAll('#lista-proyectos .list-group-item')
        .forEach(item => item.classList.remove('active'));
      li.classList.add('active');

      // (Opcional) No es necesario cambiar de vista si la sección de detalle ya está visible.
      // Si la vista unificada es la actual, omite showView()

      // Muestra el indicador de carga inmediatamente en el panel de detalle
      showLoadingIndicator();

      // Llama a la API para obtener los tickets del proyecto y actualiza el detalle
      getTicketsForProject(proj.key)
        .then(data => {
          window.allTickets = data.issues;  // Guarda la colección original de tickets
          window.currentTicketPage = 1;       // Reinicia la paginación
          renderDetalleProyecto(data);
          setupTicketSearch(data.issues);
          hideLoadingIndicator();
        })
        .catch(error => {
          console.error('Error al cargar detalle del proyecto:', error);
          hideLoadingIndicator();
        });
    });

    projectList.appendChild(li);
  });

  // --- SIMULAR CLIC EN EL PRIMER PROYECTO ---
  // if (projects.length > 0) {
  //   // document.getElementById('detalle-proyecto-avatar').src = 'https://via.placeholder.com/48/cccccc/000000?text=Loading';

  //   // Busca el primer <li> recién agregado a la lista
  //   const firstItem = projectList.querySelector('li');
  //   if (firstItem) {
  //     firstItem.click();  // Dispara el mismo event listener que carga el detalle
  //   }
  // }
}

/**
 * Renderiza la cabecera del proyecto en el panel de detalle.
 * Se utiliza la información del objeto project (por ejemplo, fields.project en un issue).
 * @param {Object} projectData - Objeto con la información del proyecto.
 */
export function renderProyectoHeader(projectData) {
  const avatarImg = document.getElementById('detalle-proyecto-avatar');
  const projectNameElem = document.getElementById('detalle-proyecto-name');
  const projectKeyElem = document.getElementById('detalle-proyecto-key');
  const projectTypeElem = document.getElementById('detalle-proyecto-type');

  avatarImg.src = projectData.avatarUrls
    ? (projectData.avatarUrls['48x48'] || projectData.avatarUrls['32x32'])
    : 'https://jiracorp.belcorp.biz/s/-xfa5ee/820010/1dlckms/_/images/jira-generic.png';
  projectNameElem.textContent = projectData.name || 'Proyecto sin nombre';
  projectKeyElem.textContent = projectData.key || 'SIN-KEY';
  projectTypeElem.textContent = projectData.projectTypeKey || 'N/A';
}

/**
 * Renderiza la lista de tickets en el panel de detalle del proyecto,
 * aplicando paginación para mostrar solo un subconjunto a la vez.
 * @param {Array} tickets - Arreglo completo de objetos issue.
 */
export function renderTicketsList(tickets) {
  const listContainer = document.getElementById('detalle-proyecto-tickets');
  listContainer.innerHTML = ''; // Limpiar listado previo

  const pageSize = window.ticketPageSize || 50;
  const currentPage = window.currentTicketPage || 1;
  const totalPages = Math.ceil(tickets.length / pageSize);

  // Extrae los tickets para la página actual
  const startIndex = (currentPage - 1) * pageSize;
  const pagedTickets = tickets.slice(startIndex, startIndex + pageSize);

  // Renderiza cada ticket del subconjunto
  pagedTickets.forEach(issue => {
    const fields = issue.fields;
    const li = document.createElement('li');
    li.classList.add('list-group-item');

    // Primera línea: Clave, tipo y (si existe) prioridad
    const firstLine = document.createElement('div');
    firstLine.classList.add('d-flex', 'justify-content-between', 'align-items-center');
    const ticketKey = document.createElement('span');
    ticketKey.classList.add('fw-bold');
    ticketKey.textContent = issue.key;
    const ticketType = document.createElement('span');
    ticketType.classList.add('badge', 'bg-secondary');
    ticketType.textContent = fields.issuetype ? fields.issuetype.name : 'Tipo';
    firstLine.appendChild(ticketKey);
    firstLine.appendChild(ticketType);
    if (fields.priority) {
      const ticketPriority = document.createElement('span');
      ticketPriority.classList.add('badge', 'bg-danger', 'ms-2');
      ticketPriority.textContent = fields.priority.name;
      firstLine.appendChild(ticketPriority);
    }

    // Segunda línea: Resumen y fecha de creación
    const secondLine = document.createElement('div');
    secondLine.classList.add('mt-1');
    secondLine.innerHTML = `<small>${fields.summary} <br>
      <em>Creado: ${new Date(fields.created).toLocaleString()}</em></small>`;

    li.appendChild(firstLine);
    li.appendChild(secondLine);

    // Al hacer click, se abre el modal de detalle del ticket
    li.addEventListener('click', () => {
      console.log(`Ticket seleccionado: ${issue.key}`);
      openTicketModal(issue);
    });

    listContainer.appendChild(li);
  });

  // Renderizar los controles de paginación
  renderTicketsPaginationControls(totalPages, currentPage, tickets);
}

/**
 * Renderiza los controles de paginación para la lista de tickets.
 * Crea botones de "Anterior", "Siguiente" y números de página.
 * @param {number} totalPages - Número total de páginas.
 * @param {number} currentPage - Página actual.
 * @param {Array} tickets - Arreglo completo de tickets (para re-renderizar al cambiar página).
 */
export function renderTicketsPaginationControls(totalPages, currentPage, tickets) {
  // Busca o crea el contenedor de paginación
  let paginationContainer = document.getElementById('tickets-pagination');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'tickets-pagination';
    paginationContainer.classList.add('mt-3', 'd-flex', 'justify-content-center');
    // Se asume que el contenedor de tickets es el padre inmediato
    const listContainer = document.getElementById('detalle-proyecto-tickets');
    listContainer.parentElement.appendChild(paginationContainer);
  }
  paginationContainer.innerHTML = ''; // Limpiar controles previos

  // Botón "Anterior"
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2');
    prevBtn.addEventListener('click', () => {
      window.currentTicketPage = currentPage - 1;
      renderTicketsList(tickets);
    });
    paginationContainer.appendChild(prevBtn);
  }

  // Botones para cada página (opcional: se pueden limitar, pero aquí mostramos todas)
  for (let p = 1; p <= totalPages; p++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = p;
    pageBtn.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'me-2');
    if (p === currentPage) {
      pageBtn.classList.remove('btn-outline-primary');
      pageBtn.classList.add('btn-primary');
    }
    pageBtn.addEventListener('click', () => {
      window.currentTicketPage = p;
      renderTicketsList(tickets);
    });
    paginationContainer.appendChild(pageBtn);
  }

  // Botón "Siguiente"
  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Siguiente';
    nextBtn.classList.add('btn', 'btn-sm', 'btn-outline-primary');
    nextBtn.addEventListener('click', () => {
      window.currentTicketPage = currentPage + 1;
      renderTicketsList(tickets);
    });
    paginationContainer.appendChild(nextBtn);
  }
}


/**
 * Renderiza el panel de detalle del proyecto usando el JSON completo retornado por el proxy (/jiraTickets?project=...).
 * Se extrae la información del proyecto a partir del primer issue (asumiendo que todos pertenecen al mismo proyecto)
 * y se renderiza la cabecera y el listado de tickets.
 * @param {Object} data - Objeto JSON que contiene la propiedad "issues": [ ... ]
 */
export function renderDetalleProyecto(data) {
  if (!data.issues || data.issues.length === 0) {
    console.error('No se encontraron issues para el proyecto.');
    return;
  }
  const projectData = data.issues[0].fields.project;
  renderProyectoHeader(projectData);
  renderTicketsList(data.issues);
}

/**
 * Abre el modal de detalle del ticket y rellena sus campos con la información del ticket.
 * @param {Object} ticket - Objeto ticket (issue) con sus campos.
 */
export function openTicketModal(ticket) {
  // Rellena cada campo del modal usando la información del ticket
  document.getElementById('modal-ticket-key').textContent = ticket.key || '';
  document.getElementById('modal-ticket-summary').textContent = ticket.fields.summary || '';
  document.getElementById('modal-ticket-type').textContent = ticket.fields.issuetype ? ticket.fields.issuetype.name : '';
  document.getElementById('modal-ticket-priority').textContent = ticket.fields.priority ? ticket.fields.priority.name : '';
  document.getElementById('modal-ticket-status').textContent = ticket.fields.status ? ticket.fields.status.name : '';
  document.getElementById('modal-ticket-description').textContent = ticket.fields.description || 'Sin descripción';
  document.getElementById('modal-ticket-created').textContent = ticket.fields.created ? new Date(ticket.fields.created).toLocaleString() : '';
  document.getElementById('modal-ticket-updated').textContent = ticket.fields.updated ? new Date(ticket.fields.updated).toLocaleString() : '';

  // Abre el modal utilizando la API de Bootstrap 5.
  const modalEl = document.getElementById('ticketDetailModal');
  const ticketModal = new bootstrap.Modal(modalEl);
  ticketModal.show();
}

/**
 * Configura el buscador para filtrar la lista de proyectos.
 * @param {Array} projects - Arreglo original de proyectos.
 */
export function setupProjectSearch(projects) {
  const searchInput = document.getElementById('search-projects');
  if (!searchInput) {
    console.error("No se encontró el campo 'search-projects'.");
    return;
  }
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    // Filtra comparando el key, name y projectTypeKey
    const filteredProjects = projects.filter(proj => {
      return (proj.key && proj.key.toLowerCase().includes(searchTerm)) ||
        (proj.name && proj.name.toLowerCase().includes(searchTerm)) ||
        (proj.projectTypeKey && proj.projectTypeKey.toLowerCase().includes(searchTerm));
    });
    // Vuelve a renderizar la lista de proyectos con los resultados filtrados.
    addProjectsToList(filteredProjects);
  });
}

export function setupTicketSearch(tickets) {
  const searchInput = document.getElementById('search-tickets');
  if (!searchInput) {
    console.error("No se encontró el campo 'search-tickets'.");
    return;
  }
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    // Reinicia la página al filtrar
    window.currentTicketPage = 1;
    const filteredTickets = tickets.filter(issue => {
      const fields = issue.fields;
      return (issue.key && issue.key.toLowerCase().includes(searchTerm)) ||
        (fields.summary && fields.summary.toLowerCase().includes(searchTerm)) ||
        (fields.description && fields.description.toLowerCase().includes(searchTerm));
    });
    renderTicketsList(filteredTickets);
  });
}


