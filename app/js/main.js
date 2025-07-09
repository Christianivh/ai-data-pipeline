// js/main.js
import { showView, setupNavEvents, addProjectsToList, renderDetalleProyecto, setupProjectSearch, setupTicketSearch } from './ui.js';
import { getProjects, getTicketsForProject } from './apiService.js';

window.currentTicketPage = 1;
window.ticketPageSize = 50;

document.addEventListener('DOMContentLoaded', () => {
  // Mostrar la vista inicial: "explorador"
  showView('explorador');

  // Configurar eventos de la barra de navegación
  setupNavEvents();

  // Cargar proyectos desde el proxy y renderizarlos en la lista
  getProjects()
    .then(projectData => {
      // Se espera que projectData sea un arreglo de objetos de proyecto
      window.allProjects = projectData;
      addProjectsToList(projectData);
      setupProjectSearch(projectData);
    })
    .catch(error => {
      console.error("Error al cargar los proyectos:", error);
    });
});