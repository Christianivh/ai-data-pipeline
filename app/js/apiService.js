// js/apiService.js

export async function getProjects() {
  const url = "http://127.0.0.1:5000/jiraProjects";

  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.body || !response.body.locked) { 
      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Respuesta del Proxy:", data);
      return data;
    } else {
      throw new Error(`Error en la petición: The response was interrupted before it finished downloading.`);
    }
  } catch (error) {
    console.error("Error fetching Proyecto data:", error);
    throw error;
  }
}

/**
 * Obtiene los tickets (issues) para un proyecto dado.
 * Llama al endpoint del proxy en http://localhost:5000/jiraTickets pasando el parámetro project.
 *
 * @param {string} projectKey - La clave del proyecto, por ejemplo "ISA".
 * @returns {Promise<Object>} - Promesa que retorna la data de tickets.
 */
export async function getTicketsForProject(projectKey) {
  // Construir la URL con el parámetro 'project'
  const url = `http://127.0.0.1:5000/jiraTickets?project=${projectKey}`;
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`Tickets para el proyecto ${projectKey}:`, data);
    return data;
  } catch (error) {
    console.error("Error fetching tickets for project:", error);
    throw error;
  }
}