document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. GESTIÓN DE TEMAS (COLORES)
    // ==========================================
    const themeSelector = document.getElementById('themeSelector');

    function applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('selectedTheme', themeName);
    }

    const savedTheme = localStorage.getItem('selectedTheme');
    const availableThemes = ['default', 'aura', 'magma', 'botanical', 'synthwave', 'slate'];

    if (savedTheme && availableThemes.includes(savedTheme)) {
        applyTheme(savedTheme);
        if (themeSelector) themeSelector.value = savedTheme;
    } else {
        applyTheme('default');
        if (themeSelector) themeSelector.value = 'default';
    }

    if (themeSelector) {
        themeSelector.addEventListener('change', (e) => applyTheme(e.target.value));
    }

    // ==========================================
    // 2. PIN DE SEGURIDAD (LÓGICA DE ACCESO)
    // ==========================================
    const pinModalElement = document.getElementById('pinModal');
    const pinInput = document.getElementById("pinInput");
    const errorMsg = document.getElementById("errorMsg");
    const btnVerificar = document.getElementById("btnVerificarPin");
    const magicButton = document.getElementById("magicButton"); // El botón invisible

    if (pinModalElement) {
        // Iniciar modal en modo estático (no se cierra con clic afuera ni ESC)
        const pinModal = new bootstrap.Modal(pinModalElement, { backdrop: 'static', keyboard: false });
        pinModal.show();

        // Función centralizada para conceder acceso y limpiar el modal
        function grantAccess() {
            console.log("Acceso concedido."); // Log para depuración
            pinModal.hide();
            
            // Limpieza forzada de residuos de Bootstrap
            setTimeout(() => {
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                document.body.classList.remove('modal-open');
                document.body.style.overflow = 'auto';
                document.body.style.paddingRight = '';
            }, 300); 
        }

        // Verificación estándar por PIN
        function verificarPIN() {
            const PIN_CORRECTO = "pjud5upg";
            if (pinInput.value === PIN_CORRECTO) {
                grantAccess();
            } else {
                errorMsg.classList.remove('d-none');
                errorMsg.innerText = "PIN incorrecto.";
                pinInput.value = "";
                pinInput.focus();
            }
        }

        // Listeners estándar
        if (btnVerificar) btnVerificar.addEventListener("click", verificarPIN);
        
        if (pinInput) {
            pinInput.addEventListener("keypress", (e) => { if (e.key === "Enter") verificarPIN(); });
            pinModalElement.addEventListener('shown.bs.modal', () => pinInput.focus());
        }

        // === LISTENER DEL BOTÓN MÁGICO ===
        if (magicButton) {
            console.log("Botón mágico inicializado."); // Log para confirmar carga
            magicButton.addEventListener("click", (e) => {
                e.stopPropagation(); // Evita que el clic se propague al modal
                console.log("Botón mágico presionado.");
                grantAccess();
            });
        } else {
            console.error("No se encontró el botón mágico en el DOM.");
        }
    }

    // ==========================================
    // 3. LÓGICA DE COPIADO Y MODALES
    // ==========================================
    let currentButton = null;

    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(btn => {
        btn.addEventListener('click', () => currentButton = btn);
    });

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let text = btn.getAttribute('data-text');
            if (btn.getAttribute('data-type') === 'dynamic') text = procesarTextoDinamico(text);
            copiarAlPortapapeles(text, btn);
        });
    });

    // --- CONFIGURACIÓN DE MODALES ---

    function setupModalAction(btnId, modalId, processDataFn) {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (!currentButton) return;
            const finalCookie = processDataFn();

            if (finalCookie) {
                const finalText = procesarTextoDinamico(finalCookie);
                copiarAlPortapapeles(finalText, currentButton);

                const modalEl = document.getElementById(modalId);
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();

                modalEl.querySelectorAll('input, textarea').forEach(input => input.value = '');
            } else {
                alert('Por favor, complete todos los campos.');
            }
        });
    }

    // Modales estándar
    setupModalAction('saveDateTime', 'dateTimeModal', () => {
        const date = document.getElementById('inputDate').value;
        const time = document.getElementById('inputTime').value;
        if (!date || !time) return null;
        const [y, m, d] = date.split('-');
        return currentButton.getAttribute('data-comment').replace('XX/XX/XXXX', `${d}/${m}/${y}`).replace('XX:XX', time);
    });

    setupModalAction('saveRecoordina', 'recoordinaModal', () => {
        const time = document.getElementById('inputRecoordinaTime').value;
        if (!time) return null;
        return currentButton.getAttribute('data-comment').replace('xx:xx', time);
    });

    setupModalAction('saveDatosEquipo', 'datosEquipoModal', () => {
        const fields = ['modelo', 'serie', 'telefono', 'nombre', 'direccion', 'dependencia'];
        let text = currentButton.getAttribute('data-comment');
        for (const f of fields) {
            const val = document.getElementById('input' + f.charAt(0).toUpperCase() + f.slice(1)).value;
            if (!val) return null;
            text = text.replace(`{${f}}`, val);
        }
        return text;
    });

    setupModalAction('saveEquipoFueraContrato', 'equipoFueraContratoModal', () => {
        const mod = document.getElementById('inputModeloFuera').value;
        const ser = document.getElementById('inputSerieFuera').value;
        if (!mod || !ser) return null;
        return currentButton.getAttribute('data-comment').replace('{modelo}', mod).replace('{serie}', ser);
    });

    // ==========================================
    // 4. MODALES DE SOLUCIÓN CON PLANTILLAS (DUAL LOGIC)
    // ==========================================
    const plantillas = {
        'garantia': `-Se borran templates y plantillas.\n-Se Reset de Word.\n-Se aplica bat de configuración.\n-Se configura SIAGJ(Se habilitan módulos y complementos).\n-Se configura Gestión Penal\n-se activa Office 365.\n-Se configura Word en modo de Compatibilidad.`,
        'civil': `-Se borran templates y plantillas.\n-Se Reset de Word.\n-Se reinstala Java 231.\n-Se aplica bat de configuración.\n-Se configura SITCI(Se habilitan módulos y complementos).\n-Se agrega DLL AmiOffice.\n-se activa Office 365.`,
        'letras': `-Se borran templates y plantillas.\n-Se Reset de Word.\n-Se aplica bat de configuración.\n-Se reinstala Java 231.\n-Se configuran Sistemas Judiciales.\n-Se optimiza Google Chrome.`,
        'monito': `- Se realiza instalación de Monito web.\n- Se realiza configuración de Monito Web.\n- Se instala PDF24.\n- Se envía correo a soporte registro civil.\n- Se agrega vista de compatibilidad.`,
        'pdf': `-Se instala versión estable de Adobe Reader DC.\n-Se deshabilitan actualizaciones automáticas.`,
        'impresora': `- Se realiza instalación de driver de impresora.\n- Se realiza configuración de impresora.\n- Se revisan valores de impresión.\n- Se realiza configuración de bandejas.`,
        'perfil': `- Se realiza habilitación de perfil.\n- Se migra data a disco d.\n- Se ejecuta bat de configuración.\n- Se habilitan complementos.\n- Se realiza configuración de aplicativos.\n- Se realiza configuración de correo.`
    };

    // LOGICA A: SOLUCIONADO CON VERIFICACIÓN
    document.querySelectorAll('.btn-template-con').forEach(btn => {
        btn.addEventListener('click', () => {
            const nom = document.getElementById('inputNombreVerif').value;
            const mod = document.getElementById('inputModeloCon').value;
            const ser = document.getElementById('inputSerieCon').value;
            const notaExtra = document.getElementById('inputProcedimiento').value;
            const key = btn.getAttribute('data-key');

            let procedimientoTexto = plantillas[key];
            if (notaExtra && notaExtra.trim() !== "") procedimientoTexto += `\n- Nota: ${notaExtra}`;

            if (!nom || !mod || !ser) { alert("Por favor ingrese Nombre, Modelo y Serie."); return; }

            const textoFinal = `Buenos días se revisa el requerimiento y se realiza el siguiente procedimiento:\n\n${procedimientoTexto}\n\nSe realizan pruebas en paralelo con usuario NOMBRE: ${nom} \nEquipo este operativo según revisión realizada por usuario.\nModelo: ${mod} serie: ${ser}`;
            const textoProcesado = procesarTextoDinamico(textoFinal);

            copiarAlPortapapeles(textoProcesado, btn);
            cerrarModal('solucionadoConModal', ['inputProcedimiento', 'inputNombreVerif', 'inputModeloCon', 'inputSerieCon']);
        });
    });

    // LOGICA B: SOLUCIONADO SIN VERIFICACIÓN
    document.querySelectorAll('.btn-template-sin').forEach(btn => {
        btn.addEventListener('click', () => {
            const mod = document.getElementById('inputModeloSin').value;
            const ser = document.getElementById('inputSerieSin').value;
            const notaExtra = document.getElementById('inputProcedimientoSin').value;
            // Nota: ignoramos el nombre en "sin verificación" para el texto final, pero lo pedimos por si acaso
            const key = btn.getAttribute('data-key');

            if (!mod || !ser) { alert("Por favor ingrese Modelo y Serie."); return; }

            let procedimientoTexto = plantillas[key];
            if (notaExtra && notaExtra.trim() !== "") procedimientoTexto += `\n- Nota: ${notaExtra}`;

            const textoFinal = `Buenos días se revisa el requerimiento y se realiza el siguiente procedimiento:\n\n${procedimientoTexto}\n\nSe realizan pruebas tecnicas en el equipo con cuentas de prueba de MDA, ya que usuario no cuenta con disponibilidad para realizar las pruebas y en caso de que el problema persista se le solicita objetar requerimiento.\nModelo: ${mod} serie: ${ser}`;
            const textoProcesado = procesarTextoDinamico(textoFinal);

            copiarAlPortapapeles(textoProcesado, btn);
            cerrarModal('solucionadoSinModal', ['inputProcedimientoSin', 'inputNombreSin', 'inputModeloSin', 'inputSerieSin']);
        });
    });

    // Helper para cerrar modales complejos
    function cerrarModal(modalId, inputIds) {
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
            if(modal) modal.hide();
            inputIds.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.value = '';
            });
        }, 500);
    }

    // ==========================================
    // 5. UTILIDADES
    // ==========================================

    function procesarTextoDinamico(text) {
        const now = new Date();
        const hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const greeting = hours < 12 ? "Buenos días" : "Buenas tardes";

        let processed = text.replace(/Buenos \(días, tardes\)/gi, greeting).replace(/Buenos días/gi, greeting);
        if (processed.includes('XX:XX') && !text.includes('xx:xx')) {
            processed = processed.replace(/XX:XX/g, `${String(hours).padStart(2, '0')}:${minutes}`);
        }
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        processed = processed.replace(/XX\/XX\/XXXX/g, `${day}/${month}/${year}`);
        return processed;
    }

    function copiarAlPortapapeles(text, btnElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnElement.textContent;
            const originalClass = btnElement.className;
            btnElement.textContent = '¡Copiado!';
            btnElement.classList.remove('btn-outline-light', 'btn-outline-info', 'btn-outline-warning', 'btn-outline-danger', 'btn-outline-success', 'btn-outline-primary', 'btn-outline-secondary');
            btnElement.classList.add('btn-success');

            setTimeout(() => {
                btnElement.textContent = originalText;
                btnElement.className = originalClass;
            }, 2000);
        }).catch(err => { console.error('Error al copiar', err); alert('Error portapapeles.'); });
    }

    window.onscroll = function () {
        const scrollBtn = document.getElementById("scroll-button");
        if (scrollBtn) {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                scrollBtn.style.display = "block";
                setTimeout(() => scrollBtn.style.opacity = "1", 10);
            } else {
                scrollBtn.style.opacity = "0";
                setTimeout(() => scrollBtn.style.display = "none", 500);
            }
        }
    };
});