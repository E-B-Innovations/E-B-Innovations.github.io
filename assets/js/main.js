/* PJUD5 · Consola de Turno — lógica de plantillas y modales.
   Vanilla JS, sin dependencias. */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Datos ---------- */
    const TEMPLATES = {
        garantia: "-Se borran templates y plantillas.\n-Se Reset de Word.\n-Se aplica bat de configuración.\n-Se configura SIAGJ(Se habilitan módulos y complementos).\n-Se configura Gestión Penal\n-se activa Office 365.\n-Se configura Word en modo de Compatibilidad.",
        civil: "-Se borran templates y plantillas.\n-Se Reset de Word.\n-Se reinstala Java 231.\n-Se aplica bat de configuración.\n-Se configura SITCI(Se habilitan módulos y complementos).\n-Se agrega DLL AmiOffice.\n-se activa Office 365.",
        letras: "-Se borran templates y plantillas.\n-Se Reset de Word.\n-Se aplica bat de configuración.\n-Se reinstala Java 231.\n-Se configuran Sistemas Judiciales.\n-Se optimiza Google Chrome.",
        monito: "- Se realiza instalación de Monito web.\n- Se realiza configuración de Monito Web.\n- Se instala PDF24.\n- Se envía correo a soporte registro civil.\n- Se agrega vista de compatibilidad.",
        pdf: "-Se instala versión estable de Adobe Reader DC.\n-Se deshabilitan actualizaciones automáticas.",
        impresora: "- Se realiza instalación de driver de impresora.\n- Se realiza configuración de impresora.\n- Se revisan valores de impresión.\n- Se realiza configuración de bandejas.",
        perfil: "- Se realiza habilitación de perfil.\n- Se migra data a disco d.\n- Se ejecuta bat de configuración.\n- Se habilitan complementos.\n- Se realiza configuración de aplicativos.\n- Se realiza configuración de correo.",
        correo: "-Se configura perfil de correo.\n-Se realiza configuración de servidor de entrada y salida.\n-Se configura PST.",
        sitfa: "-Se borran templates y plantillas.\n-Se Reset de Word.\n-Se reinstala Java 231.\n-Se aplica bat de configuración.\n-Se configura SITFA(Se habilitan módulos y complementos).\n-Se establece ProcessControl para abrir documentos \".do\"",
        remoto: "-Se aplica procedimiento de escritorio remoto.\n-Se deshabilita IPV6.\n-Se configura proxy.\n-Se restablece red.\n-Se reinicia equipo.",
        custom: ""
    };

    const TPL_BUTTONS = [
        ['garantia', 'GARANTÍA'], ['civil', 'CIVIL'], ['letras', 'LETRAS'],
        ['monito', 'MONITO'], ['pdf', 'PDF'], ['impresora', 'IMPRESORA'],
        ['correo', 'CORREO'], ['sitfa', 'FAMILIA'], ['remoto', 'REMOTO'],
        ['perfil', 'PERFIL'], ['custom', 'PERSONALIZADO']
    ];

    const MODEL_OPTIONS = {
        'Computadores': [
            ['HP Pro SFF 400 G9 Desktop PC', 'HP Pro SFF 400 G9'],
            ['HP ProDesk 600 G6 Small Form Factor', 'HP ProDesk 600 G6'],
            ['HP ProDesk 600 G5 SFF', 'HP ProDesk 600 G5'],
            ['HP ProDesk 600 G4 SFF', 'HP ProDesk 600 G4'],
            ['HP ProDesk 600 G1 SFF', 'HP ProDesk 600 G1'],
            ['HP ProBook 440 14 inch G10 Notebook', 'HP ProBook 440 G10'],
            ['HP EliteBook 840 G8 Notebook PC', 'HP EliteBook 840 G8'],
            ['HP EliteBook 840 G5 Notebook PC', 'HP EliteBook 840 G5']
        ],
        'Impresoras': [
            ['HP LASER JET MANAGED E40040DN', 'HP E40040DN'],
            ['HP LaserJet MFP E62655', 'HP E62655'],
            ['HP LaserJet 408dn', 'HP 408dn'],
            ['Samsung ProXpress 4020ND', 'Samsung 4020ND']
        ]
    };

    const $ = id => document.getElementById(id);

    /* ---------- Construcción de selects y rejillas (deduplicado) ---------- */
    const buildModelSelect = (sel) => {
        const frag = document.createDocumentFragment();
        const first = new Option('Seleccione Modelo *', '');
        first.disabled = true; first.selected = true;
        frag.append(first);
        for (const [group, items] of Object.entries(MODEL_OPTIONS)) {
            const og = document.createElement('optgroup');
            og.label = group;
            for (const [value, label] of items) og.append(new Option(label, value));
            frag.append(og);
        }
        frag.append(new Option('Otro (Personalizado)', 'custom'));
        sel.append(frag);
    };

    ['Con', 'Sin', 'Fuera'].forEach(suffix => {
        const sel = $(`selectModelo${suffix}`);
        if (!sel) return;
        buildModelSelect(sel);
        sel.addEventListener('change', () => {
            const custom = $(`inputModelo${suffix}Custom`);
            const isCustom = sel.value === 'custom';
            custom.classList.toggle('u-hidden', !isCustom);
            if (isCustom) custom.focus();
            else custom.value = '';
        });
    });

    document.querySelectorAll('.tplgrid').forEach(grid => {
        const suffix = grid.dataset.tplGroup === 'con' ? 'Con' : 'Sin';
        for (const [key, label] of TPL_BUTTONS) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'chip';
            btn.dataset.key = key;
            btn.textContent = label;
            btn.addEventListener('click', () => handleSolution(btn, suffix === 'Con'));
            grid.append(btn);
        }
    });

    /* ---------- Tema ---------- */
    const themeSelector = $('themeSelector');
    const applyTheme = (t) => {
        document.documentElement.setAttribute('data-theme', t);
        try { localStorage.setItem('selectedTheme', t); } catch (_) { /* sin storage */ }
    };
    let savedTheme = 'default';
    try { savedTheme = localStorage.getItem('selectedTheme') || 'default'; } catch (_) { }
    applyTheme(savedTheme);
    themeSelector.value = savedTheme;
    themeSelector.addEventListener('change', e => applyTheme(e.target.value));

    /* ---------- Hora y saludo ---------- */

    const greetingNow = () => new Date().getHours() < 12 ? 'Buenos días' : 'Buenas tardes';
    const timeNow = () => new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateNow = () => new Date().toLocaleDateString('es-CL');

    /* ---------- Clipboard (con fallback) ---------- */
    const writeClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
            document.body.append(ta);
            ta.select();
            try { document.execCommand('copy') ? resolve() : reject(new Error('execCommand')); }
            catch (err) { reject(err); }
            finally { ta.remove(); }
        });
    };

    const flashCopied = (btn) => {
        if (btn.dataset.busy) return;
        btn.dataset.busy = '1';
        const originalHtml = btn.innerHTML;
        btn.classList.add('copied');
        btn.textContent = '¡Copiado!';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('copied');
            delete btn.dataset.busy;
        }, 1000);
    };

    const copyToClipboard = (text, btn) =>
        writeClipboard(text).then(() => flashCopied(btn)).catch(() => alert('No se pudo copiar'));

    const copyAndClose = (text, modal) => {
        writeClipboard(text).then(() => {
            closeModal(modal);
            modal.querySelectorAll('input:not([type=hidden]), textarea').forEach(i => { i.value = ''; });
            modal.querySelectorAll('select').forEach(s => { s.selectedIndex = 0; });
            modal.querySelectorAll('.u-hidden').forEach(e => e.classList.add('u-hidden'));
        }).catch(() => alert('No se pudo copiar'));
    };

    const processModal = (modal, generator) => {
        const text = generator();
        if (text) copyAndClose(text, modal);
    };

    const alertFocus = (msg, el) => { alert(msg); el.focus(); };

    /* ---------- Modales (dialog nativo) ---------- */
    let currentTrigger = null;

    const openModal = (modal, trigger) => {
        currentTrigger = trigger;
        modal.showModal();
        const first = modal.querySelector('input, select, textarea');
        if (first) first.focus();
    };

    const closeModal = (modal) => modal.close();

    document.addEventListener('click', (e) => {
        const opener = e.target.closest('[data-modal-open]');
        if (opener) {
            const modal = $(opener.dataset.modalOpen);
            if (modal) openModal(modal, opener);
            return;
        }
        const closer = e.target.closest('[data-modal-close]');
        if (closer) closeModal(closer.closest('dialog'));
    });

    // Cierre al pulsar el backdrop (clic fuera de la caja)
    document.querySelectorAll('dialog.modal').forEach(dlg => {
        dlg.addEventListener('click', (e) => {
            if (dlg.hasAttribute('data-static')) return;
            if (e.target === dlg) closeModal(dlg);
        });
    });

    /* ---------- Acciones de copiado directo ---------- */
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn');
        if (!copyBtn) return;
        let text = copyBtn.getAttribute('data-text');
        const isDynamic = copyBtn.getAttribute('data-type') === 'dynamic';
        const isGreeting = copyBtn.getAttribute('data-greeting') === 'true';

        if (isDynamic || isGreeting) {
            text = text
                .replace('XX:XX', timeNow())
                .replace('XX/XX/XXXX', dateNow())
                .replace('XX/XX', dateNow().split('/').slice(0, 2).join('/'))
                .replace(/Buenos días|Buenas tardes/gi, greetingNow());
        }
        copyToClipboard(text, copyBtn);
    });

    /* ---------- Guardados por modal ---------- */
    const modalOf = (btn) => btn.closest('dialog');

    const triggerFor = (modalId) =>
        document.querySelector(`[data-modal-open="${modalId}"]`);

    document.addEventListener('click', (e) => {
        const id = e.target.id;

        if (id === 'saveDatosEquipo') return processModal(modalOf(e.target), () => {
            const val = i => $(i).value;
            return `---DATOS DE EQUIPO---\nModelo: ${val('inputModelo')} Serie: ${val('inputSerie')}\n---DATOS DE USUARIO---\nTeléfono: ${val('inputTelefono')}\nNombre: ${val('inputNombre')}\nDirección: ${val('inputDireccion')}\nDependencia: ${val('inputDependencia')}`;
        });

        if (id === 'saveDateTime') return processModal(modalOf(e.target), () => {
            const d = $('inputDate').value;
            const tInput = $('inputTime').value;
            if (!d) return null;
            const timeFormatted = tInput || '00:00';
            const df = d.split('-').reverse().slice(0, 2).join('/');
            return currentTrigger.getAttribute('data-comment')
                .replace('XX/XX/XXXX', df).replace('XX:XX', timeFormatted).replace('XX/XX', df);
        });

        if (id === 'saveCoordVisita') return processModal(modalOf(e.target), () => {
            const u = $('inputCoordUser').value;
            const d = $('inputCoordDate').value;
            const tInput = $('inputCoordTime').value;
            if (!d) return null;
            const timeFormatted = tInput || '00:00';
            const df = d.split('-').reverse().slice(0, 2).join('/');
            return `SEGÚN LO CONVERSADO TELEFÓNICAMENTE SE COORDINA CON USUARIO ${u.toUpperCase()} VISITA DE TÉCNICO A TERRENO PARA EL DIA ${df} A LAS ${timeFormatted}`;
        });

        if (id === 'saveRecoordina') return processModal(modalOf(e.target), () => {
            const tInput = $('inputRecoordinaTime').value;
            const timeFormatted = tInput || '00:00';
            return currentTrigger.getAttribute('data-comment')
                .replace('XX:XX', timeNow()).replace('xx:xx', timeFormatted);
        });

        if (id === 'saveEquipoFueraContrato') return processModal(modalOf(e.target), () => {
            const selModel = $('selectModeloFuera');
            const modelo = selModel.value === 'custom'
                ? $('inputModeloFueraCustom').value.trim()
                : selModel.value;
            if (!selModel.value) return alertFocus('Seleccione un MODELO', selModel), null;
            if (selModel.value === 'custom' && !modelo) return alertFocus('Escriba el modelo personalizado', $('inputModeloFueraCustom')), null;
            const tpl = currentTrigger.getAttribute('data-comment');
            return tpl.replace('{modelo}', modelo)
                      .replace('{serie}', $('inputSerieFuera').value);
        });

        if (id === 'saveCorreoNoContacto' || id === 'btnSinNumero') return processModal(modalOf(e.target), () => {
            const req = $('inputReqCorreo').value || 'xxxxxx';
            const tel = $('inputTelCorreo').value || 'xxxxxxx';
            const reason = id === 'saveCorreoNoContacto'
                ? `debido a que he realizado 3 intentos de llamado al número ${tel} , usuario no contesta.`
                : 'ya que no posee número de contacto.';
            return `Buenos días, me comunico con usted para solicitar número de contacto para atender el Requerimiento Nº ${req} ${reason} De no poder proporcionar esta información en las próximas 2 horas hábiles, el requerimiento quedará “Anulado” y si problema persiste podrá generar un nuevo folio.`;
        });

        if (id === 'saveDerivacionResidente') return processModal(modalOf(e.target), () => {
            const req = $('inputReqDeriv').value || 'XXXXXX';
            const tel = $('inputTelDeriv').value || 'XXXXXXXXXX';
            return `Me comunico con usted para solicitar número de contacto para atender el requerimiento N° ${req}  debido a que he realizado 3 intentos de llamado al número  indicado ${tel} no contesta.  Se deriva requerimiento a técnicos residentes.`;
        });

        if (id === 'saveTelOnly') return processModal(modalOf(e.target), () => {
            let tpl = currentTrigger.getAttribute('data-template');
            const noGreeting = currentTrigger.getAttribute('data-greeting') === 'false';
            const tel = $('inputTelOnly').value;

            if (tel) tpl = tpl.replace(/X{5,}/gi, tel);
            if (/xx:xx/gi.test(tpl)) tpl = tpl.replace(/xx:xx/gi, timeNow());
            if (!noGreeting && /Buenos días|Buenas tardes/i.test(tpl)) {
                tpl = tpl.replace(/Buenos días|Buenas tardes/gi, greetingNow());
            }
            return tpl;
        });
    });

    /* ---------- Soluciones (con/sin verificación) ---------- */
    function handleSolution(btn, isVerif) {
        const suffix = isVerif ? 'Con' : 'Sin';
        const nameEl = $(isVerif ? 'inputNombreVerif' : 'inputNombreSin');
        const selModel = $(`selectModelo${suffix}`);
        const custModel = $(`inputModelo${suffix}Custom`);
        const serEl = $(`inputSerie${suffix}`);
        const noteEl = $(isVerif ? 'inputProcedimiento' : 'inputProcedimientoSin');

        const modelo = selModel.value === 'custom' ? custModel.value.trim() : selModel.value;
        if (!selModel.value) return alertFocus('Seleccione un MODELO', selModel);
        if (selModel.value === 'custom' && !modelo) return alertFocus('Escriba el modelo personalizado', custModel);
        if (isVerif && !nameEl.value.trim()) return alertFocus('Ingrese el NOMBRE del usuario', nameEl);

        const tpl = TEMPLATES[btn.dataset.key] || '';
        const note = noteEl.value.trim();

        let final = `${greetingNow()} se revisa el requerimiento y se realiza el siguiente procedimiento${!isVerif ? ' (Validación técnica)' : ''}:\n\n`;
        if (btn.dataset.key === 'custom') {
            if (note) final += `${note}\n`;
        } else {
            if (tpl) final += `${tpl}\n`;
            if (note) final += `- ${note}\n`;
        }
        final += isVerif
            ? `\nSe realizan pruebas en paralelo con usuario NOMBRE: ${nameEl.value.trim()}\nEquipo está operativo según revisión realizada por usuario.\n`
            : `\nSe realizan pruebas tecnicas en el equipo con cuentas de prueba de MDA, ya que usuario no cuenta con disponibilidad para realizar las pruebas y en caso de que el problema persista se le solicita objetar requerimiento.\n`;
        final += `Modelo: ${modelo}\nserie: ${serEl.value.trim() || 'S/N'}`;

        copyAndClose(final, modalOf(btn));
    }

    /* ---------- Botón volver arriba ---------- */
    const scrollBtn = $('scroll-button');
    const onScroll = () => scrollBtn.classList.toggle('visible', window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* ---------- PIN ---------- */
    const pinModal = $('pinModal');
    const pinInput = $('pinInput');
    const checkPin = () => {
        if (pinInput.value === 'pjud5upg') {
            pinModal.close();
        } else {
            $('errorMsg').hidden = false;
            pinInput.value = '';
        }
    };
    pinModal.showModal();
    pinModal.addEventListener('cancel', e => e.preventDefault());
    $('btnVerificarPin').addEventListener('click', checkPin);
    pinInput.addEventListener('keypress', e => { if (e.key === 'Enter') checkPin(); });

    let magicClicks = 0;
    $('magicButton').addEventListener('click', () => {
        if (++magicClicks === 5) pinModal.close();
    });
});
