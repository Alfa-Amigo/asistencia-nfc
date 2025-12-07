from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime

app = Flask(__name__, static_folder='.')
CORS(app)

# Ruta para archivos estáticos
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# API Health Check
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'online',
        'service': 'NFC Attendance System',
        'version': '2.0.0',
        'timestamp': datetime.now().isoformat(),
        'deployed_on': 'Render + GitHub'
    })

# API para sincronizar con Google Sheets
@app.route('/api/sync', methods=['POST'])
def sync():
    try:
        data = request.json
        
        if not data:
            return jsonify({'error': 'No data received'}), 400
        
        # En producción aquí se conectaría a Google Sheets
        print(f"📤 Recibidos {len(data)} registros para sincronizar")
        
        # Simular éxito
        return jsonify({
            'success': True,
            'message': f'Datos recibidos ({len(data)} registros)',
            'synced_at': datetime.now().isoformat(),
            'note': 'En producción esto se guardaría en Google Sheets'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API para estudiantes
@app.route('/api/students', methods=['GET'])
def get_students():
    return jsonify({
        'students': [
            {
                'id': '20240001',
                'name': 'Juan Pérez',
                'grade': '10',
                'group': 'A',
                'email': 'juan@ejemplo.com'
            },
            {
                'id': '20240002',
                'name': 'María García',
                'grade': '11',
                'group': 'B',
                'email': 'maria@ejemplo.com'
            }
        ],
        'count': 2,
        'timestamp': datetime.now().isoformat()
    })

# API para registrar asistencia
@app.route('/api/attendance', methods=['POST'])
def attendance():
    try:
        data = request.json
        
        required_fields = ['matricula', 'nombre', 'estado', 'clase']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing field: {field}'}), 400
        
        # Simular éxito
        record = {
            **data,
            'id': int(datetime.now().timestamp() * 1000),
            'fecha': datetime.now().strftime('%Y-%m-%d'),
            'hora': datetime.now().strftime('%H:%M:%S'),
            'timestamp': datetime.now().isoformat(),
            'server_received': True
        }
        
        return jsonify({
            'success': True,
            'message': 'Attendance recorded',
            'record': record
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API para reportes
@app.route('/api/reports/daily', methods=['GET'])
def daily_report():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    return jsonify({
        'date': date,
        'summary': {
            'total': 45,
            'present': 38,
            'late': 5,
            'absent': 2,
            'attendance_rate': 84.4
        },
        'timestamp': datetime.now().isoformat()
    })

# Configuración
@app.route('/api/config/test', methods=['POST'])
def test_config():
    data = request.json
    sheet_id = data.get('sheet_id', '')
    
    if not sheet_id:
        return jsonify({'error': 'No sheet ID provided'}), 400
    
    # Simular prueba de conexión
    return jsonify({
        'success': True,
        'message': 'Conexión exitosa con Google Sheets',
        'sheet_id': sheet_id,
        'tested_at': datetime.now().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return send_from_directory('.', 'index.html')

@app.errorhandler(500)
def server_error(e):
    return jsonify({
        'error': 'Internal server error',
        'message': str(e) if app.debug else 'Something went wrong'
    }), 500

# Iniciar servidor
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Servidor NFC Asistencias iniciado en puerto {port}")
    print(f"📁 Sirviendo desde: {os.getcwd()}")
    print(f"🌐 URL: http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
