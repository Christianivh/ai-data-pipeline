from flask import Flask, jsonify, Response, request
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Habilita CORS para todas las peticiones

# Variables globales para la API de Jira
JIRA_BASE_URL = "https://jiracorp.belcorp.biz"  # Base URL de Jira
JIRA_AUTH_HEADER = "Basic ZXh0amlyYWdwdDoxMjM0NTY="  # extjiragpt:123456 en Base64

DEFAULT_HEADERS = {
    "Authorization": JIRA_AUTH_HEADER,
    "Accept": "application/json"
}

def fetch_from_jira(endpoint):
    """
    Realiza una petición GET a la API de Jira usando el endpoint proporcionado.
    :param endpoint: Cadena que representa la ruta y parámetros (por ejemplo, '/rest/api/2/project?startAt=0&maxResults=10&fields=key,created').
    :return: Objeto response de requests.
    """
    url = f"{JIRA_BASE_URL}{endpoint}"
    try:
        response = requests.get(url, headers=DEFAULT_HEADERS)
        return response
    except Exception as e:
        raise e

@app.route('/jiraProjects', methods=['GET'])
def jira_projects():
    print("Obteniendo proyectos de Jira")
    # Endpoint para obtener proyectos (ajusta los parámetros según lo necesites)
    endpoint = "/rest/api/2/project?startAt=0&maxResults=10&fields=key,created"

    try:
        response = fetch_from_jira(endpoint)
        if not response.ok:
            return Response(response.text, status=response.status_code)
        data = response.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/jiraTickets', methods=['GET'])
def jira_tickets():
    print("Obteniendo tickets de Jira")
    # Endpoint para obtener tickets (ajusta los parámetros según lo necesites)  
    project_key = request.args.get('project')
    if not project_key:
        return jsonify({"error": "Falta el parámetro 'project'"}), 400
    
    start_at = 0
    max_results = 50
    all_issues = []
    total = None
    
    try:
        while total is None or start_at < total:
            print(f"Obteniendo tickets desde {start_at} hasta {start_at + max_results}")
            endpoint = f"/rest/api/2/search?jql=project={project_key}&startAt={start_at}&maxResults={max_results}"
            print("Endpoint: " + endpoint)
            response = fetch_from_jira(endpoint)
            if not response.ok:
                return Response(response.text, status=response.status_code)
            data = response.json()
            if total is None:
                total = data.get("total", 0)
            all_issues.extend(data.get("issues", []))
            start_at += max_results
            
        print(str(len(all_issues)) + " tickets encontrados")
        

        # Se actualiza la data devuelta para incluir todos los tickets
        data["issues"] = all_issues
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
