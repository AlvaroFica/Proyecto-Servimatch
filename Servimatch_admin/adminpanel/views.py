import requests
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse

API_BASE_URL = 'http://192.168.100.4:8000/api'

def usuarios_admin(request):
    return render(request, 'usuarios_admin.html')

def pagos_pendientes_view(request):
    trabajadores_res = requests.get(f'{API_BASE_URL}/trabajadores/', cookies=request.COOKIES)
    if trabajadores_res.status_code != 200:
        return render(request, 'admin/pagos_admin.html', {'trabajadores': []})

    trabajadores = trabajadores_res.json()
    data = []

    for t in trabajadores:
        reservas_res = requests.get(f"{API_BASE_URL}/reservas/?trabajador={t['id']}", cookies=request.COOKIES)
        if reservas_res.status_code != 200:
            continue

        reservas = reservas_res.json()
        pendientes = []
        for r in reservas:
            boleta = r.get('boleta')
            if boleta and not boleta.get('liberado'):
                pendientes.append(r)

        if pendientes:
            t['citas_pendientes'] = pendientes
            data.append(t)

    return render(request, 'pagos_admin.html', {'trabajadores': data})

def trabajadores_admin(request):
    especialidad_id = request.GET.get('especialidad')
    comuna = request.GET.get('comuna')

    r = requests.get(f'{API_BASE_URL}/trabajadores/')
    trabajadores = r.json() if r.ok else []

    r2 = requests.get(f'{API_BASE_URL}/profesiones/')
    especialidades = r2.json() if r2.ok else []

    r3 = requests.get(f'{API_BASE_URL}/usuarios/')
    comunas = list(set(u['direccion'] for u in r3.json() if u['direccion'])) if r3.ok else []

    return render(request, 'trabajadores_admin.html', {
        'trabajadores': trabajadores,
        'especialidades': especialidades,
        'comunas': [{'id': c, 'nombre_comuna': c} for c in comunas],
        'especialidad_seleccionada': especialidad_id,
        'comuna_seleccionada': comuna,
    })

def trabajador_historial(request, trabajador_id):
    r = requests.get(f'{API_BASE_URL}/trabajadores/{trabajador_id}/historial/')
    data = r.json() if r.ok else []
    return render(request, 'trabajador_historial.html', {'trabajador_id': trabajador_id, 'data': data})

def servicios_admin(request):
    tipo_id = request.GET.get('tipo')
    comuna = request.GET.get('comuna')

    r = requests.get(f'{API_BASE_URL}/servicios/')
    servicios = r.json() if r.ok else []

    r2 = requests.get(f'{API_BASE_URL}/usuarios/')
    comunas = list(set(u['direccion'] for u in r2.json() if u['direccion'])) if r2.ok else []

    return render(request, 'servicios_admin.html', {
        'servicios': servicios,
        'tipos': servicios,
        'comunas': [{'id': c, 'nombre_comuna': c} for c in comunas],
        'tipo_seleccionado': tipo_id,
        'comuna_seleccionada': comuna,
    })

def notificaciones_admin(request):
    return render(request, 'notificaciones_dashboard.html')

def reportes_clientes(request):
    rol = request.GET.get('rol')
    r = requests.get(f'{API_BASE_URL}/feedback/')
    data = r.json() if r.ok else []
    sin_responder = sum(1 for x in data if not x.get('respuesta'))

    if rol:
        data = [d for d in data if d.get('role') == rol]

    return render(request, 'reportes_clientes.html', {
        'data': data,
        'sin_responder': sin_responder,
        'rol_actual': rol
    })

def pendientes_verificacion(request):
    r = requests.get(f'{API_BASE_URL}/trabajadores/')
    trabajadores = [t for t in r.json() if not t.get('estado_verificado')] if r.ok else []
    return render(request, 'pendientes_verificacion.html', {'trabajadores': trabajadores})

def pagos_admin(request):
    r = requests.get(f'{API_BASE_URL}/pagos/', cookies=request.COOKIES)
    pagos_raw = r.json() if r.ok else []

    trabajadores_dict = {}

    for p in pagos_raw:
        if p.get('liberado'):
            continue

        solicitud = p.get('solicitud')
        if not solicitud or not solicitud.get('trabajador_asignado'):
            continue

        trabajador_id = solicitud['trabajador_asignado']
        usuario = solicitud['cliente']['usuario']

        if trabajador_id not in trabajadores_dict:
            trabajadores_dict[trabajador_id] = {
                'id': trabajador_id,
                'nombre': f"Trabajador {trabajador_id}",
                'citas_pendientes': []
            }

        trabajadores_dict[trabajador_id]['citas_pendientes'].append({
            'id': solicitud['id'],
            'monto': p['monto'],
            'pago_id': p['id']
        })

    trabajadores = list(trabajadores_dict.values())
    return render(request, 'pagos_admin.html', {'trabajadores': trabajadores})

def dashboard_admin(request):
    return render(request, 'dashboard_admin.html')

def acciones(request):
    return render(request, 'acciones.html')

def boletas_admin(request):
    desde = request.GET.get('desde')
    hasta = request.GET.get('hasta')
    r = requests.get(f'{API_BASE_URL}/boletas/')
    data = r.json() if r.ok else []

    if desde:
        data = [b for b in data if b['fecha_pago'] >= desde]
    if hasta:
        data = [b for b in data if b['fecha_pago'] <= hasta]

    return render(request, 'boletas_admin.html', {'boletas': data, 'desde': desde, 'hasta': hasta})

def citas_admin(request):
    r = requests.get(f'{API_BASE_URL}/solicitudes/')
    citas = r.json() if r.ok else []
    return render(request, 'citas_admin.html', {'citas': citas})

@csrf_exempt
def liberar_pago(request, boleta_id):
    if request.method == 'PATCH':
        url = f'{API_BASE_URL}/boletas/{boleta_id}/liberar/'
        r = requests.patch(url, json={'estado_pago': 'pagado'})
        return JsonResponse({'ok': r.ok}, status=200 if r.ok else 400)
    return HttpResponse(status=405)

@csrf_exempt
def responder_feedback(request, feedback_id):
    if request.method == 'POST':
        import json
        data = json.loads(request.body)
        r = requests.post(f'{API_BASE_URL}/feedback/{feedback_id}/respuesta/', json={'respuesta': data['respuesta']})
        return JsonResponse({'ok': r.ok}, status=200 if r.ok else 400)
    return HttpResponse(status=405)

@csrf_exempt
def verificar_trabajador(request, trabajador_id):
    if request.method == 'PATCH':
        import json
        data = json.loads(request.body)
        r = requests.patch(f'{API_BASE_URL}/trabajadores/{trabajador_id}/', json={'estado_verificado': data['estado']})
        return JsonResponse({'ok': r.ok}, status=200 if r.ok else 400)
    return HttpResponse(status=405)
