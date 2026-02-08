/* script.js - RZ Motors Premium (Versão Final: Liquid Aero) */

// ==========================================
// 1. GESTÃO DO SITE (PRELOADER, MENU, SCROLL)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Preloader (Motion Blur)
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Corre a animação de velocidade durante 2.5 segundos
        setTimeout(() => {
            preloader.classList.add('finished');
            // Só inicia o 3D quando o site for visível para performance
            initThreeJS(); 
        }, 2500);
    } else {
        initThreeJS();
    }

    // B. Menu Mobile (Hambúrguer)
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-links");
    const body = document.querySelector("body");

    if(hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            body.classList.toggle("menu-open");
        });

        // Fechar ao clicar num link
        document.querySelectorAll(".nav-links a").forEach(n => n.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
            body.classList.remove("menu-open");
        }));
    }

    // C. Header Scroll Effect (Vidro ao descer)
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if(window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
    });

    // D. Animações de Entrada (Scroll Reveal)
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    reveals.forEach(el => observer.observe(el));

    // E. Lógica do Simulador (Apenas na página Financiamento)
    const slider = document.getElementById('priceRange');
    const display = document.getElementById('priceDisplay');
    const monthly = document.getElementById('monthlyResult');
    const monthsRange = document.getElementById('monthsRange');
    const monthsDisplay = document.getElementById('monthsDisplay');
    const monthsLabel = document.getElementById('monthsLabel');
    const monthChips = document.querySelectorAll('.month-chip');
    const priceChips = document.querySelectorAll('.price-chip');
    const financedAmount = document.getElementById('financedAmount');
    const totalCost = document.getElementById('totalCost');
    const totalInterest = document.getElementById('totalInterest');
    const entryAmount = document.getElementById('entryAmount');
    const sideMonthly = document.getElementById('sideMonthly');
    const sideMonths = document.getElementById('sideMonths');
    const planHeadline = document.getElementById('planHeadline');
    const planSubtext = document.getElementById('planSubtext');
    const taegLabel = document.getElementById('taegLabel');
    const taegValue = document.getElementById('taegValue');
    const taegFill = document.getElementById('taegFill');
    const riskLabel = document.getElementById('riskLabel');
    const priceLevel = document.getElementById('priceLevel');
    
    const formatMoney = (value, fractionDigits = 0) => new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: fractionDigits
    }).format(value);

    const formatEuroRounded = (value) => `${Math.round(value).toLocaleString('pt-PT')} €`;

    const getTaegByMonths = (months) => {
        if (months <= 36) return 6.1;
        if (months <= 60) return 6.6;
        if (months <= 84) return 7.0;
        if (months <= 108) return 7.4;
        return 7.8;
    };

    const setRangeProgress = (input) => {
        if (!input) return;
        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        const value = Number(input.value || 0);
        const pct = ((value - min) / (max - min)) * 100;
        input.style.setProperty('--range-progress', `${Math.max(0, Math.min(100, pct))}%`);
    };

    const applyMonthlyProfile = (months) => {
        if (!planHeadline || !planSubtext || !riskLabel) return;

        if (months <= 48) {
            planHeadline.textContent = 'Plano Dinâmico';
            planSubtext.textContent = 'Prazo curto com custo total reduzido e aprovação rápida.';
            riskLabel.textContent = 'Baixo';
            return;
        }
        if (months <= 84) {
            planHeadline.textContent = 'Plano Equilibrado';
            planSubtext.textContent = 'Boa relação entre mensalidade e duração do contrato.';
            riskLabel.textContent = 'Moderado';
            return;
        }

        planHeadline.textContent = 'Plano Conforto';
        planSubtext.textContent = 'Mensalidade mais leve para proteger tesouraria mensal.';
        riskLabel.textContent = 'Controlado';
    };

    const updateFinance = () => {
        if (!slider || !display || !monthly || !monthsRange) return;

        const priceVal = Number(slider.value);
        const monthsVal = Number(monthsRange.value);
        const taeg = getTaegByMonths(monthsVal);
        const entry = priceVal * 0.1;
        const principal = Math.max(0, priceVal - entry);
        const monthlyRate = taeg / 100 / 12;
        const installment = monthlyRate > 0
            ? principal * (monthlyRate / (1 - Math.pow(1 + monthlyRate, -monthsVal)))
            : principal / monthsVal;
        const total = installment * monthsVal;
        const interest = Math.max(0, total - principal);

        display.textContent = formatMoney(priceVal, 2);
        monthly.classList.remove('value-pop');
        void monthly.offsetWidth;
        monthly.classList.add('value-pop');
        monthly.textContent = formatEuroRounded(installment);

        if (monthsDisplay) monthsDisplay.textContent = monthsVal;
        if (monthsLabel) monthsLabel.textContent = monthsVal;
        if (sideMonths) sideMonths.textContent = monthsVal;
        if (sideMonthly) sideMonthly.textContent = formatEuroRounded(installment);

        if (taegLabel) taegLabel.textContent = `${taeg.toFixed(1)}%`;
        if (taegValue) taegValue.textContent = `${taeg.toFixed(1)}%`;
        if (taegFill) {
            const taegPct = ((taeg - 5.5) / (8.2 - 5.5)) * 100;
            taegFill.style.width = `${Math.max(10, Math.min(100, taegPct))}%`;
        }

        if (entryAmount) entryAmount.textContent = formatMoney(entry, 0);
        if (financedAmount) financedAmount.textContent = formatMoney(principal, 0);
        if (totalCost) totalCost.textContent = formatMoney(total, 0);
        if (totalInterest) totalInterest.textContent = formatMoney(interest, 0);

        if (priceLevel) {
            if (priceVal < 25000) priceLevel.textContent = 'Entrada';
            else if (priceVal < 60000) priceLevel.textContent = 'Equilibrado';
            else if (priceVal < 100000) priceLevel.textContent = 'Premium';
            else priceLevel.textContent = 'Exclusivo';
        }

        monthChips.forEach(chip => {
            chip.classList.toggle('active', Number(chip.dataset.months) === monthsVal);
        });
        priceChips.forEach(chip => {
            chip.classList.toggle('active', Number(chip.dataset.price) === priceVal);
        });

        applyMonthlyProfile(monthsVal);
        setRangeProgress(slider);
        setRangeProgress(monthsRange);
    };

    if (slider && display && monthly && monthsRange) {
        slider.addEventListener('input', updateFinance);
        monthsRange.addEventListener('input', updateFinance);

        monthChips.forEach(chip => {
            chip.addEventListener('click', () => {
                monthsRange.value = chip.dataset.months;
                updateFinance();
            });
        });

        priceChips.forEach(chip => {
            chip.addEventListener('click', () => {
                slider.value = chip.dataset.price;
                updateFinance();
            });
        });

        updateFinance();
    }

    // F. Dinâmica da página Sobre (contadores)
    const countElements = document.querySelectorAll('.count-up');
    if (countElements.length > 0) {
        const animateCount = (el) => {
            const target = Number(el.dataset.count || 0);
            if (!Number.isFinite(target) || target <= 0) return;
            const start = performance.now();
            const duration = 1200;

            const tick = (now) => {
                const progress = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = String(Math.round(target * eased));
                if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
        };

        const countObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                if (!el.classList.contains('counted')) {
                    el.classList.add('counted');
                    animateCount(el);
                }
                obs.unobserve(el);
            });
        }, { threshold: 0.55 });

        countElements.forEach(el => countObserver.observe(el));
    }

    // G. Dinâmica da página Contactos (estado + formulário)
    const showroomStatus = document.getElementById('showroomStatus');
    if (showroomStatus) {
        const now = new Date();
        const day = now.getDay(); // 0 domingo, 6 sábado
        const hour = now.getHours();
        const isOpen = day >= 1 && day <= 6 && hour >= 11 && hour < 19;
        showroomStatus.textContent = isOpen ? 'Aberto neste momento' : 'Fechado neste momento';
        showroomStatus.classList.toggle('is-open', isOpen);
        showroomStatus.classList.toggle('is-closed', !isOpen);
    }

    const contactMessage = document.getElementById('contactMessage');
    const messageCount = document.getElementById('messageCount');
    const contactModes = document.querySelectorAll('.contact-mode');
    const contactModeInput = document.getElementById('contactModeInput');
    const contactForm = document.getElementById('contactForm');
    const contactFormStatus = document.getElementById('contactFormStatus');

    if (contactMessage && messageCount) {
        const updateMessageCount = () => {
            messageCount.textContent = String(contactMessage.value.length);
        };
        contactMessage.addEventListener('input', updateMessageCount);
        updateMessageCount();
    }

    if (contactModes.length > 0 && contactModeInput) {
        contactModes.forEach(btn => {
            btn.addEventListener('click', () => {
                contactModes.forEach(item => item.classList.remove('active'));
                btn.classList.add('active');
                contactModeInput.value = btn.dataset.mode || 'Chamada';
            });
        });
    }

    if (contactForm && contactFormStatus) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const mode = contactModeInput ? contactModeInput.value : 'Chamada';
            contactFormStatus.classList.remove('error');
            contactFormStatus.classList.add('success');
            contactFormStatus.textContent = `Pedido recebido. Responderemos por ${mode.toLowerCase()} nas próximas horas.`;
            contactForm.reset();
            if (contactModes.length > 0) {
                contactModes.forEach(item => item.classList.remove('active'));
                contactModes[0].classList.add('active');
                if (contactModeInput) {
                    contactModeInput.value = contactModes[0].dataset.mode || 'Chamada';
                }
            }
            if (messageCount) messageCount.textContent = '0';
        });
    }

    // H. Mapa do Footer (interativo + movimento automático)
    const footerMaps = document.querySelectorAll('.footer-map');
    const renderIframeFallback = (mapWrap) => {
        if (!mapWrap) return;
        const address = mapWrap.dataset.address || 'Rua do Campo Alegre 1518, 4150-181 Porto';
        mapWrap.innerHTML = `<iframe title="Mapa RZ Motors" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed"></iframe>`;
    };

    if (footerMaps.length > 0 && window.L) {
        footerMaps.forEach((mapWrap) => {
            const canvas = mapWrap.querySelector('.footer-map-canvas');
            if (!canvas) return;
            const address = mapWrap.dataset.address || 'Rua do Campo Alegre 1518, 4150-181 Porto';

            const map = L.map(canvas, {
                zoomControl: true,
                scrollWheelZoom: true,
                dragging: true,
                doubleClickZoom: true,
                tap: true
            });

            const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            });
            tileLayer.addTo(map);
            let tileErrors = 0;
            tileLayer.on('tileerror', () => {
                tileErrors += 1;
                if (tileErrors >= 6) {
                    renderIframeFallback(mapWrap);
                }
            });

            let marker = null;
            let autoPanId = null;
            let autoPanPaused = false;
            let resumeTimer = null;
            let angle = Math.random() * Math.PI * 2;

            const startAutoPan = () => {
                if (autoPanId) return;
                const step = () => {
                    if (autoPanPaused) return;
                    angle += 0.01;
                    const dx = Math.cos(angle) * 0.35;
                    const dy = Math.sin(angle) * 0.35;
                    map.panBy([dx, dy], { animate: false });
                    autoPanId = requestAnimationFrame(step);
                };
                autoPanId = requestAnimationFrame(step);
            };

            const stopAutoPan = () => {
                if (autoPanId) cancelAnimationFrame(autoPanId);
                autoPanId = null;
            };

            const pauseAutoPan = () => {
                autoPanPaused = true;
                stopAutoPan();
                if (resumeTimer) clearTimeout(resumeTimer);
                resumeTimer = setTimeout(() => {
                    autoPanPaused = false;
                    startAutoPan();
                }, 3500);
            };

            map.on('mousedown touchstart dragstart zoomstart', pauseAutoPan);
            map.on('dragend zoomend', pauseAutoPan);

            const setMapView = (lat, lon) => {
                map.setView([lat, lon], 16, { animate: false });
                if (marker) marker.remove();
                marker = L.marker([lat, lon]).addTo(map);
                startAutoPan();
            };

            fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`)
                .then(res => res.json())
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setMapView(Number(data[0].lat), Number(data[0].lon));
                        return;
                    }
                    setMapView(41.1579, -8.6291);
                })
                .catch(() => setMapView(41.1579, -8.6291));
        });
    } else if (footerMaps.length > 0) {
        footerMaps.forEach((mapWrap) => renderIframeFallback(mapWrap));
    }
});


// ==========================================
// 2. FUNDO 3D (LIQUID AERODYNAMICS)
// ==========================================
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // --- CENA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000'); // Preto puro
    // Nevoeiro subtil para as linhas desaparecerem ao longe
    scene.fog = new THREE.FogExp2('#000000', 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Posição: um pouco elevada para ver as ondas de cima
    camera.position.z = 30;
    camera.position.y = 10;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- CRIAÇÃO DAS ONDAS ---
    const linesCount = 40; 
    const pointsPerLine = 100;
    const group = new THREE.Group();

    // Material das linhas: Azul RZ subtil
    const material = new THREE.LineBasicMaterial({
        color: 0x3b82f6, 
        transparent: true,
        opacity: 0.35, // Transparência para elegância
        blending: THREE.AdditiveBlending // Brilho nas sobreposições
    });

    // Array para guardar geometria para animação
    const geometries = [];

    for (let i = 0; i < linesCount; i++) {
        const points = [];
        const width = 120; // Largura da "estrada" de ondas
        
        for (let j = 0; j < pointsPerLine; j++) {
            const x = (j / pointsPerLine - 0.5) * width;
            const y = 0;
            // Espalhar em profundidade (Z)
            const z = (i / linesCount - 0.5) * width; 
            points.push(new THREE.Vector3(x, y, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Guardar dados únicos para cada linha (velocidade e desvio diferentes)
        geometry.userData = {
            offset: i * 0.5, 
            speed: 0.002 + Math.random() * 0.002
        };

        const line = new THREE.Line(geometry, material);
        geometries.push(geometry);
        group.add(line);
    }
    
    // Rotação inicial para dar perspetiva dinâmica
    group.rotation.x = 0.2; 
    scene.add(group);

    // --- ANIMAÇÃO ---
    let time = 0;

    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.03; // Velocidade do fluxo

        // Animar onda
        geometries.forEach((geo) => {
            const positions = geo.attributes.position.array;
            const offset = geo.userData.offset;
            
            for (let j = 0; j < pointsPerLine; j++) {
                const index = j * 3;
                const x = positions[index];
                
                // Fórmula Matemática da Onda (Seno + Coseno combinados)
                // Isto cria o efeito líquido que não se repete de forma óbvia
                const y = Math.sin(x * 0.1 + time * 0.5 + offset) * 2.5 
                        + Math.cos(x * 0.05 + time * 0.3) * 1.5;
                
                positions[index + 1] = y; 
            }
            geo.attributes.position.needsUpdate = true;
        });

        // Rotação lenta de todo o grupo (como se o carro curvasse)
        group.rotation.y = Math.sin(time * 0.05) * 0.05;

        renderer.render(scene, camera);
    };
    
    // Resize Inteligente
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}
