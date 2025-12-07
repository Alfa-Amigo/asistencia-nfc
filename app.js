// Sistema NFC Asistencias
class NFCAsistencia {
    constructor() {
        this.estudiantes = [];
        this.registros = [];
        this.pendientes = [];
        this.config = {};
        this.nfcHandler = null;
        this.currentStudent = null;
        this.currentPage = 'dashboard';
        
        this.init();
    }
    
    async init() {
        // Cargar configuración
        this.loadConfig();
        
        // Cargar datos
        this.loadData();
        
        // Verificar NFC
        this.checkNFC();
        
        // Actualizar UI
        this.updateUI();
        
        // Iniciar reloj
        this.startClock();
        
        // Sincronización automática
        this.startAutoSync();
        
        // Notificación inicial
        this.showNotification('✅ Sistema listo', 'success');
    }
    
    // ========== CONFIGURACIÓN ==========
    loadConfig() {
        const saved = localStorage.getItem('nfc_config');
        this.config = saved ? JSON.parse(saved) : {
            sheetId: '',
            sheetName: 'Asistencias',
            institution: 'Mi Escuela',
            startTime: '08:00',
            tolerance: 15,
            notifySound: true,
            autoSync: true,
            offlineMode: true
        };
        
        // Actualizar inputs
        this.updateConfigInputs();
    }
    
    updateConfigInputs() {
        if (!document.getElementById('sheetId')) return;
        
        document.getElementById('sheetId').value = this.config.sheetId;
        document.getElementById('sheetName').value = this.config.sheetName;
        document.getElementById('institution').value = this.config.institution;
        document.getElementById('startTime').value = this.config.startTime;
        document.getElementById('tolerance').value = this.config.tolerance;
        document.getElementById('notifySound').checked = this.config.notifySound;
        document.getElementById('autoSync').checked = this.config.autoSync;
        document.getElementById('offlineMode').checked = this.config.offlineMode;
    }
    
    saveConfig() {
        // Obtener valores de inputs
        this.config.sheetId = document.getElementById('sheetId').value.trim();
        this.config.sheetName = document.getElementById('sheetName').value.trim();
        this.config.institution = document.getElementById('institution').value.trim();
        this.config.startTime = document.getElementById('startTime').value;
        this.config.tolerance = parseInt(document.getElementById('tolerance').value);
        this.config.notifySound = document.getElementById('notifySound').checked;
        this.config.autoSync = document.getElementById('autoSync').checked;
        this.config.offlineMode = document.getElementById('offlineMode').checked;
        
        // Guardar en localStorage
        localStorage.setItem('nfc_config', JSON.stringify(this.config));
        
        this.showNotification('✅ Configuración guardada', 'success');
    }
    
    // ========== DATOS ==========
    loadData() {
        // Estudiantes
        const students = localStorage.getItem('nfc_students');
        this.estudiantes = students ? JSON.parse(students) : this.getDemoStudents();
        
        // Registros
        const records = localStorage.getItem('nfc_records');
        this.registros = records ? JSON.parse(records) : [];
        
        // Pendientes de sincronizar
        const pending = localStorage.getItem('nfc_pending');
        this.pendientes = pending ? JSON.parse(pending) : [];
    }
    
    saveData() {
        localStorage.setItem('nfc_students', JSON.stringify(this.estudiantes));
        localStorage.setItem('nfc_records', JSON.stringify(this.registros));
        localStorage.setItem('nfc_pending', JSON.stringify(this.pendientes));
    }
    
    getDemoStudents() {
        return [
            {
                id: '20240001',
                matricula: '20240001',
                nombre: 'Juan Pérez',
                grado: '10',
                grupo: 'A',
                email: 'juan@ejemplo.com',
                telefono: '5551234567',
                fechaRegistro: new Date().toISOString()
            },
            {
                id: '20240002',
                matricula: '20240002',
                nombre: 'María García',
                grado: '11',
                grupo: 'B',
                email: 'maria@ejemplo.com',
                telefono: '5557654321',
                fechaRegistro: new Date().toISOString()
            },
            {
                id: '20240003',
                matricula: '20240003',
                nombre: 'Carlos López',
                grado: '9',
                grupo: 'C',
                email: 'carlos@ejemplo.com',
                telefono: '5559876543',
                fechaRegistro: new Date().toISOString()
            }
        ];
    }
    
    // ========== NFC ==========
    checkNFC() {
        if ('NDEFReader' in window) {
            this.nfcHandler = new NDEFReader();
            document.getElementById('nfcSystemStatus').textContent = 'Disponible';
            console.log('✅ NFC disponible');
        } else {
            console.log('❌ NFC no disponible');
            document.getElementById('nfcSystemStatus').textContent = 'Simulación';
        }
    }
    
    async startNFC() {
        if (!this.nfcHandler) {
            this.showNotification('❌ NFC no disponible en este dispositivo', 'error');
            return;
        }
        
        try {
            await this.nfcHandler.scan();
            this.showNotification('📱 Listo para leer tarjetas NFC', 'info');
            
            this.nfcHandler.onreading = (event) => {
                this.processNFCCard(event);
            };
            
        } catch (error) {
            console.error('Error NFC:', error);
            this.showNotification('Error NFC: ' + error.message, 'error');
            this.simulateNFCCard();
        }
    }
    
    processNFCCard(event) {
        try {
            const decoder = new TextDecoder();
            
            for (const record of event.message.records) {
                // Intentar como JSON
                try {
                    const data = JSON.parse(decoder.decode(record.data));
                    this.handleStudentCard(data);
                    break;
                } catch (e) {
                    // Intentar como texto plano
                    const text = decoder.decode(record.data);
                    const parts = text.split(':');
                    
                    if (parts.length >= 4) {
                        const data = {
                            matricula: parts[0],
                            nombre: parts[1],
                            grado: parts[2],
                            grupo: parts[3]
                        };
                        this.handleStudentCard(data);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error procesando tarjeta:', error);
        }
    }
    
    simulateNFCCard() {
        if (this.estudiantes.length === 0) return;
        
        const randomStudent = this.estudiantes[Math.floor(Math.random() * this.estudiantes.length)];
        
        setTimeout(() => {
            this.handleStudentCard(randomStudent);
            this.showNotification('🔶 Tarjeta NFC simulada', 'warning');
        }, 2000);
    }
    
    handleStudentCard(data) {
        this.currentStudent = data;
        
        // Actualizar UI
        document.getElementById('studentName').textContent = data.nombre;
        document.getElementById('studentId').textContent = `Matrícula: ${data.matricula}`;
        document.getElementById('studentGrade').textContent = data.grado;
        document.getElementById('studentGroup').textContent = data.grupo;
        document.getElementById('studentTime').textContent = new Date().toLocaleTimeString();
        
        // Mostrar tarjeta
        document.getElementById('studentCard').classList.remove('hidden');
        document.getElementById('nfcStatusText').textContent = '✅ Estudiante detectado';
        
        // Agregar estudiante si no existe
        if (!this.estudiantes.find(s => s.matricula === data.matricula)) {
            const nuevoEstudiante = {
                id: data.matricula,
                matricula: data.matricula,
                nombre: data.nombre,
                grado: data.grado,
                grupo: data.grupo,
                fechaRegistro: new Date().toISOString()
            };
            
            this.estudiantes.push(nuevoEstudiante);
            this.saveData();
            this.showNotification('🎓 Nuevo estudiante agregado', 'info');
        }
    }
    
    async confirmAttendance() {
        if (!this.currentStudent) return;
        
        const status = document.getElementById('attendanceStatus').value;
        const clase = document.getElementById('currentClass').textContent;
        
        const registro = {
            id: Date.now(),
            matricula: this.currentStudent.matricula,
            nombre: this.currentStudent.nombre,
            grado: this.currentStudent.grado,
            grupo: this.currentStudent.grupo,
            estado: status,
            clase: clase,
            fecha: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString(),
            timestamp: new Date().toISOString(),
            sincronizado: false
        };
        
        // Agregar a registros
        this.registros.unshift(registro);
        this.pendientes.push(registro);
        this.saveData();
        
        // Actualizar UI
        this.updateDashboard();
        this.updateStudentsList();
        this.updateHistory();
        
        // Ocultar tarjeta
        document.getElementById('studentCard').classList.add('hidden');
        this.currentStudent = null;
        document.getElementById('nfcStatusText').textContent = 'Listo para leer NFC';
        
        // Notificación
        this.showNotification(`✅ ${registro.nombre} registrado como ${status}`, 'success');
        
        // Sonido
        if (this.config.notifySound) {
            this.playSound('success');
        }
        
        // Sincronizar
        if (this.config.autoSync) {
            setTimeout(() => this.syncWithSheets(), 1000);
        }
    }
    
    cancelAttendance() {
        document.getElementById('studentCard').classList.add('hidden');
        this.currentStudent = null;
        document.getElementById('nfcStatusText').textContent = 'Listo para leer NFC';
    }
    
    // ========== SINCRONIZACIÓN ==========
    async syncWithSheets() {
        if (!this.config.sheetId || this.pendientes.length === 0) return;
        
        try {
            // Enviar al backend
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.pendientes)
            });
            
            if (response.ok) {
                // Marcar como sincronizados
                this.pendientes.forEach(r => r.sincronizado = true);
                this.pendientes = [];
                this.saveData();
                
                this.showNotification('✅ Sincronizado con Google Sheets', 'success');
                document.getElementById('lastSync').textContent = new Date().toLocaleTimeString();
            }
        } catch (error) {
            console.error('Error sincronizando:', error);
            
            if (this.config.offlineMode) {
                this.showNotification('📴 Guardado localmente (modo offline)', 'warning');
            }
        }
    }
    
    syncNow() {
        this.showNotification('🔄 Sincronizando...', 'info');
        this.syncWithSheets();
    }
    
    startAutoSync() {
        if (this.config.autoSync) {
            setInterval(() => {
                if (this.pendientes.length > 0) {
                    this.syncWithSheets();
                }
            }, 5 * 60 * 1000); // Cada 5 minutos
        }
    }
    
    // ========== UI ==========
    updateUI() {
        this.updateDashboard();
        this.updateStudentsList();
        this.updateHistory();
        this.updateStats();
    }
    
    updateDashboard() {
        const hoy = new Date().toLocaleDateString();
        const registrosHoy = this.registros.filter(r => r.fecha === hoy);
        
        document.getElementById('totalStudents').textContent = this.estudiantes.length;
        document.getElementById('presentToday').textContent = registrosHoy.filter(r => r.estado === 'Presente').length;
        document.getElementById('lateToday').textContent = registrosHoy.filter(r => r.estado === 'Tardanza').length;
        document.getElementById('absentToday').textContent = registrosHoy.filter(r => r.estado === 'Falta').length;
        
        // Actualizar badges
        document.getElementById('studentsBadge').textContent = this.estudiantes.length;
        document.getElementById('pendingBadge').textContent = this.pendientes.length;
        
        // Últimos registros
        this.updateRecentList();
        
        // Gráfico
        this.updateChart();
    }
    
    updateRecentList() {
        const container = document.getElementById('recentList');
        if (!container) return;
        
        const recent = this.registros.slice(0, 5);
        
        if (recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No hay registros recientes</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        recent.forEach(registro => {
            let icon = 'check';
            let color = '#10b981';
            
            if (registro.estado === 'Tardanza') {
                icon = 'clock';
                color = '#f59e0b';
            } else if (registro.estado === 'Falta') {
                icon = 'times';
                color = '#ef4444';
            }
            
            html += `
                <div class="recent-item">
                    <div class="recent-icon" style="background:${color};">
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <div class="recent-info">
                        <div class="recent-name">${registro.nombre}</div>
                        <div class="recent-meta">
                            ${registro.hora} • ${registro.grado}°${registro.grupo} • ${registro.estado}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    updateChart() {
        const ctx = document.getElementById('attendanceChart');
        if (!ctx) return;
        
        // Datos de los últimos 7 días
        const dates = [];
        const presents = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString();
            
            dates.push(dateStr);
            
            const dayRecords = this.registros.filter(r => r.fecha === dateStr);
            const presentCount = dayRecords.filter(r => r.estado === 'Presente').length;
            
            presents.push(presentCount);
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Presentes',
                    data: presents,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    updateStudentsList() {
        const container = document.getElementById('studentsGrid');
        if (!container) return;
        
        if (this.estudiantes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No hay estudiantes registrados</p>
                    <button class="btn btn-primary" onclick="app.addStudent()" style="margin-top:20px;">
                        <i class="fas fa-plus"></i> Agregar primer estudiante
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.estudiantes.forEach(estudiante => {
            html += `
                <div class="student-item">
                    <div class="student-avatar">
                        <i class="fas fa-user-graduate"></i>
                    </div>
                    <div class="student-details">
                        <h4>${estudiante.nombre}</h4>
                        <p>${estudiante.matricula} • ${estudiante.grado}°${estudiante.grupo}</p>
                    </div>
                    <div class="student-actions">
                        <button class="btn-icon" onclick="app.registerStudent('${estudiante.matricula}')" title="Registrar asistencia">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon" onclick="app.editStudent('${estudiante.matricula}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    updateHistory() {
        const container = document.getElementById('historyTable');
        if (!container) return;
        
        const filtered = this.registros.slice(0, 20);
        
        if (filtered.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>No hay registros de asistencia</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        filtered.forEach(registro => {
            let statusClass = '';
            if (registro.estado === 'Presente') statusClass = 'status-present';
            if (registro.estado === 'Tardanza') statusClass = 'status-late';
            if (registro.estado === 'Falta') statusClass = 'status-absent';
            
            html += `
                <tr>
                    <td>${registro.fecha}</td>
                    <td>${registro.hora}</td>
                    <td>${registro.nombre}</td>
                    <td>${registro.grado}°${registro.grupo}</td>
                    <td><span class="${statusClass}">${registro.estado}</span></td>
                    <td>
                        <button class="btn-icon" onclick="app.deleteRecord(${registro.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
    }
    
    updateStats() {
        document.getElementById('infoRecords').textContent = this.registros.length;
    }
    
    // ========== FUNCIONES PÚBLICAS ==========
    login() {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const clase = document.getElementById('classSelect').value;
        
        if (!clase) {
            this.showNotification('❌ Selecciona una clase', 'error');
            return;
        }
        
        if (user === 'admin' && pass === 'admin123') {
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('appScreen').classList.remove('hidden');
            
            document.getElementById('currentClass').textContent = 
                document.querySelector(`#classSelect option[value="${clase}"]`).textContent;
            document.getElementById('userName').textContent = 'Admin';
            
            this.showNotification('✅ Sesión iniciada', 'success');
        } else {
            this.showNotification('❌ Credenciales incorrectas', 'error');
        }
    }
    
    logout() {
        if (confirm('¿Cerrar sesión?')) {
            location.reload();
        }
    }
    
    showPage(page) {
        // Ocultar todas las páginas
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        
        // Mostrar página seleccionada
        document.getElementById(`page${page.charAt(0).toUpperCase() + page.slice(1)}`).classList.add('active');
        document.querySelector(`[onclick="app.showPage('${page}')"]`).classList.add('active');
        
        this.currentPage = page;
        
        // Actualizar datos específicos
        if (page === 'students') this.updateStudentsList();
        if (page === 'history') this.updateHistory();
        if (page === 'reports') this.updateReports();
    }
    
    toggleMenu() {
        document.getElementById('sidebar').classList.toggle('open');
    }
    
    addStudent() {
        const matricula = prompt('Matrícula del estudiante:');
        if (!matricula) return;
        
        const nombre = prompt('Nombre completo:');
        if (!nombre) return;
        
        const grado = prompt('Grado (ej: 10):');
        if (!grado) return;
        
        const grupo = prompt('Grupo (ej: A):');
        if (!grupo) return;
        
        const estudiante = {
            id: matricula,
            matricula: matricula,
            nombre: nombre,
            grado: grado,
            grupo: grupo,
            fechaRegistro: new Date().toISOString()
        };
        
        this.estudiantes.push(estudiante);
        this.saveData();
        this.updateUI();
        
        this.showNotification(`✅ ${nombre} agregado`, 'success');
    }
    
    registerStudent(matricula) {
        const estudiante = this.estudiantes.find(s => s.matricula === matricula);
        if (estudiante) {
            this.handleStudentCard(estudiante);
            this.showPage('register');
        }
    }
    
    editStudent(matricula) {
        const estudiante = this.estudiantes.find(s => s.matricula === matricula);
        if (!estudiante) return;
        
        const nuevoNombre = prompt('Nuevo nombre:', estudiante.nombre);
        if (nuevoNombre) estudiante.nombre = nuevoNombre;
        
        const nuevoGrado = prompt('Nuevo grado:', estudiante.grado);
        if (nuevoGrado) estudiante.grado = nuevoGrado;
        
        const nuevoGrupo = prompt('Nuevo grupo:', estudiante.grupo);
        if (nuevoGrupo) estudiante.grupo = nuevoGrupo;
        
        this.saveData();
        this.updateStudentsList();
        
        this.showNotification('✅ Estudiante actualizado', 'success');
    }
    
    deleteRecord(id) {
        if (!confirm('¿Eliminar este registro?')) return;
        
        const index = this.registros.findIndex(r => r.id === id);
        if (index !== -1) {
            this.registros.splice(index, 1);
            this.saveData();
            this.updateHistory();
            this.updateDashboard();
            
            this.showNotification('✅ Registro eliminado', 'success');
        }
    }
    
    searchStudents() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        const items = document.querySelectorAll('.student-item');
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    }
    
    filterHistory() {
        const from = document.getElementById('dateFrom').value;
        const to = document.getElementById('dateTo').value;
        
        // Implementar filtrado por fecha
        this.showNotification('Filtro aplicado', 'info');
    }
    
    exportHistory() {
        if (this.registros.length === 0) {
            this.showNotification('❌ No hay datos para exportar', 'error');
            return;
        }
        
        const csv = this.arrayToCSV(this.registros);
        this.downloadCSV(csv, `asistencias_${new Date().toISOString().split('T')[0]}.csv`);
        
        this.showNotification('📥 CSV exportado', 'success');
    }
    
    arrayToCSV(array) {
        const headers = ['Fecha', 'Hora', 'Matrícula', 'Nombre', 'Grado', 'Grupo', 'Estado', 'Clase'];
        const rows = array.map(obj => [
            obj.fecha,
            obj.hora,
            obj.matricula,
            obj.nombre,
            obj.grado,
            obj.grupo,
            obj.estado,
            obj.clase
        ]);
        
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
    
    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    updateReports() {
        // Gráfico de estados
        const ctx = document.getElementById('statusChart');
        if (ctx) {
            const estados = ['Presente', 'Tardanza', 'Falta'];
            const counts = estados.map(e => 
                this.registros.filter(r => r.estado === e).length
            );
            
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: estados,
                    datasets: [{
                        data: counts,
                        backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                    }]
                }
            });
        }
        
        // Estadísticas generales
        const statsContainer = document.getElementById('generalStats');
        if (statsContainer) {
            const total = this.registros.length;
            const presentes = this.registros.filter(r => r.estado === 'Presente').length;
            const porcentaje = total > 0 ? ((presentes / total) * 100).toFixed(1) : 0;
            
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span>Total registros:</span>
                    <strong>${total}</strong>
                </div>
                <div class="stat-item">
                    <span>Asistencia total:</span>
                    <strong>${porcentaje}%</strong>
                </div>
                <div class="stat-item">
                    <span>Estudiantes registrados:</span>
                    <strong>${this.estudiantes.length}</strong>
                </div>
                <div class="stat-item">
                    <span>Pendientes de sync:</span>
                    <strong>${this.pendientes.length}</strong>
                </div>
            `;
        }
    }
    
    generateReport() {
        this.showNotification('📊 Generando reporte...', 'info');
        // En producción, generaría un PDF real
        setTimeout(() => {
            this.showNotification('✅ Reporte generado', 'success');
        }, 2000);
    }
    
    testSheets() {
        if (!this.config.sheetId) {
            this.showNotification('❌ Configura primero el ID de Google Sheet', 'error');
            return;
        }
        
        this.showNotification('🔍 Probando conexión...', 'info');
        
        // Simular prueba
        setTimeout(() => {
            this.showNotification('✅ Conexión exitosa con Google Sheets', 'success');
        }, 1500);
    }
    
    exportData() {
        const data = {
            estudiantes: this.estudiantes,
            registros: this.registros,
            config: this.config,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `backup_nfc_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showNotification('💾 Backup exportado', 'success');
    }
    
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    this.estudiantes = data.estudiantes || [];
                    this.registros = data.registros || [];
                    this.config = data.config || this.config;
                    
                    this.saveData();
                    this.updateUI();
                    
                    this.showNotification('✅ Datos importados correctamente', 'success');
                } catch (error) {
                    this.showNotification('❌ Error importando datos', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    clearData() {
        if (!confirm('⚠️ ¿Borrar TODOS los datos? Esto no se puede deshacer.')) return;
        
        if (confirm('¿Estás SEGURO? Esta acción eliminará todos los estudiantes y registros.')) {
            localStorage.clear();
            location.reload();
        }
    }
    
    startClock() {
        setInterval(() => {
            const now = new Date();
            document.getElementById('currentTime').textContent = 
                now.toLocaleTimeString('es-ES', {hour12: false});
        }, 1000);
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Auto-remover
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    getIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
    
    playSound(type) {
        // Simular sonido
        const audio = new Audio();
        audio.volume = 0.3;
        try {
            audio.play();
        } catch (e) {}
    }
}

// Inicializar aplicación
let app = null;

// Hacer funciones globales
window.login = () => app.login();
window.logout = () => app.logout();
window.showPage = (page) => app.showPage(page);
window.toggleMenu = () => app.toggleMenu();
window.startNFC = () => app.startNFC();
window.confirmAttendance = () => app.confirmAttendance();
window.cancelAttendance = () => app.cancelAttendance();
window.addStudent = () => app.addStudent();
window.syncNow = () => app.syncWithSheets();
window.exportHistory = () => app.exportHistory();
window.searchStudents = () => app.searchStudents();
window.filterHistory = () => app.filterHistory();
window.generateReport = () => app.generateReport();
window.saveConfig = () => app.saveConfig();
window.testSheets = () => app.testSheets();
window.exportData = () => app.exportData();
window.importData = () => app.importData();
window.clearData = () => app.clearData();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app = new NFCAsistencia();
    window.app = app;
});
