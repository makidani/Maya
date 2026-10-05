/* =====================================================
   Maya Massage — script.js
   Language toggle · Mobile menu · Smooth scroll
   Gallery lightbox · Navbar shadow · Team slider
   Scroll to top

   English text is IN the HTML — JS only swaps when
   the user picks Amharic.
   ===================================================== */

(function () {
    'use strict';

    const LANG_KEY = 'Maya-lang';

    /* ---------------------------------------------------
       1. LANGUAGE TOGGLE
       --------------------------------------------------- */
    function fillLanguage(lang) {
        document.documentElement.setAttribute('data-lang', lang);

        document.querySelectorAll('.i18n').forEach(function (el) {
            let text = el.getAttribute('data-' + lang);
            if (!text) {
                text = el.getAttribute('data-en');
            }
            if (text !== null && text !== undefined) {
                el.textContent = text;
            }
        });

        document.body.style.fontFamily = (lang === 'am')
            ? "'Noto Sans Ethiopic', 'Poppins', system-ui, sans-serif"
            : "'Poppins', 'Noto Sans Ethiopic', system-ui, sans-serif";

        const optEn = document.querySelector('.lang-en');
        const optAm = document.querySelector('.lang-am');
        if (optEn && optAm) {
            optEn.classList.toggle('active', lang === 'en');
            optAm.classList.toggle('active', lang === 'am');
        }

        try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    }

    let savedLang = 'en';
    try { savedLang = localStorage.getItem(LANG_KEY) || 'en'; } catch (e) {}

    if (savedLang === 'am') {
        fillLanguage('am');
    } else {
        document.documentElement.setAttribute('data-lang', 'en');
    }

    const toggle = document.getElementById('langToggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            const current = document.documentElement.getAttribute('data-lang') || 'en';
            fillLanguage(current === 'en' ? 'am' : 'en');
        });
    }

    /* ---------------------------------------------------
       2. MOBILE MENU
       --------------------------------------------------- */
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () {
                navLinks.classList.remove('open');
            });
        });
    }

    /* ---------------------------------------------------
       3. NAVBAR SHADOW ON SCROLL
       --------------------------------------------------- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.style.boxShadow = (window.scrollY > 20)
                ? '0 4px 22px rgba(15, 81, 50, 0.18)'
                : '0 1px 12px rgba(15, 81, 50, 0.08)';
        }, { passive: true });
    }

    /* ---------------------------------------------------
       4. SMOOTH SCROLL
       --------------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    /* ---------------------------------------------------
       5. GALLERY LIGHTBOX — with title + description
       --------------------------------------------------- */
    const galleryItems = document.querySelectorAll('#galleryGrid .gallery-item');
    const lightbox = document.getElementById('galleryLightbox');

    if (galleryItems.length && lightbox) {
        const lbImage   = document.getElementById('glbImage');
        const lbTitle   = document.getElementById('glbTitle');
        const lbDesc    = document.getElementById('glbDesc');
        const lbCounter = document.getElementById('glbCounter');
        const btnClose  = document.getElementById('glbClose');
        const btnPrev   = document.getElementById('glbPrev');
        const btnNext   = document.getElementById('glbNext');

        let currentIndex = 0;

        // Build slides: src + title + description
        const slides = Array.from(galleryItems).map(function (item) {
            const img   = item.querySelector('img');
            const title = item.querySelector('figcaption h4');
            const desc  = item.querySelector('figcaption p');
            return {
                src:   img ? img.src : '',
                alt:   img ? (img.alt || '') : '',
                title: title ? title.textContent.trim() : '',
                desc:  desc ? desc.textContent.trim() : ''
            };
        });

        function showSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            currentIndex = index;
            const s = slides[currentIndex];

            lbImage.src = s.src;
            lbImage.alt = s.alt;
            if (lbTitle) lbTitle.textContent = s.title;
            if (lbDesc)  lbDesc.textContent  = s.desc;
            lbCounter.textContent = (currentIndex + 1) + ' / ' + slides.length;
        }

        function openLightbox(index) {
            showSlide(index);
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        // Open on click
        galleryItems.forEach(function (item, i) {
            item.addEventListener('click', function () {
                openLightbox(i);
            });
        });

        // Close button
        if (btnClose) btnClose.addEventListener('click', closeLightbox);

        // Prev / Next
        if (btnPrev) btnPrev.addEventListener('click', function (e) {
            e.stopPropagation();
            showSlide(currentIndex - 1);
        });
        if (btnNext) btnNext.addEventListener('click', function (e) {
            e.stopPropagation();
            showSlide(currentIndex + 1);
        });

        // Backdrop click → close
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard nav
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('open')) return;
            if (e.key === 'Escape')     closeLightbox();
            if (e.key === 'ArrowLeft')  showSlide(currentIndex - 1);
            if (e.key === 'ArrowRight') showSlide(currentIndex + 1);
        });

        // Swipe (touch)
        let touchStartX = 0;
        let touchEndX = 0;

        lightbox.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            const SWIPE_THRESHOLD = 50;

            if (Math.abs(diff) > SWIPE_THRESHOLD) {
                if (diff > 0) {
                    showSlide(currentIndex + 1);
                } else {
                    showSlide(currentIndex - 1);
                }
            }
        }, { passive: true });
    }

    /* ---------------------------------------------------
       6. TEAM SLIDER
       --------------------------------------------------- */
    const teamTrack = document.getElementById('teamTrack');
    const teamDotsEl = document.getElementById('teamDots');

    if (teamTrack && teamDotsEl) {
        const teamCards = teamTrack.querySelectorAll('.team-card');
        const totalCards = teamCards.length;
        let teamIndex = 0;
        let teamTimer = null;
        const TEAM_INTERVAL = 5500;

        function cardsPerView() {
            if (window.innerWidth <= 700) return 1;
            if (window.innerWidth <= 960) return 2;
            return 3;
        }

        function buildDots() {
            teamDotsEl.innerHTML = '';
            const perView = cardsPerView();
            const maxIndex = Math.max(0, totalCards - perView);

            for (let i = 0; i <= maxIndex; i++) {
                const btn = document.createElement('button');
                btn.className = 'dot';
                btn.dataset.index = i;
                btn.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                if (i === teamIndex) btn.classList.add('active');
                btn.addEventListener('click', function () {
                    teamIndex = i;
                    updateTeamSlider();
                    restartTeamTimer();
                });
                teamDotsEl.appendChild(btn);
            }
        }

        function updateTeamSlider() {
            const perView = cardsPerView();
            const maxIndex = Math.max(0, totalCards - perView);

            if (teamIndex > maxIndex) teamIndex = maxIndex;
            if (teamIndex < 0) teamIndex = 0;

            const firstCard = teamTrack.querySelector('.team-card');
            if (!firstCard) return;
            const cardWidth = firstCard.getBoundingClientRect().width;
            const offset = -(teamIndex * cardWidth);

            teamTrack.style.transform = 'translateX(' + offset + 'px)';

            const allDots = teamDotsEl.querySelectorAll('.dot');
            allDots.forEach(function (d, i) {
                d.classList.toggle('active', i === teamIndex);
            });
        }

        function nextTeamSlide() {
            const perView = cardsPerView();
            const maxIndex = Math.max(0, totalCards - perView);
            if (teamIndex >= maxIndex) {
                teamIndex = 0;
            } else {
                teamIndex++;
            }
            updateTeamSlider();
        }

        function prevTeamSlide() {
            const perView = cardsPerView();
            const maxIndex = Math.max(0, totalCards - perView);
            if (teamIndex <= 0) {
                teamIndex = maxIndex;
            } else {
                teamIndex--;
            }
            updateTeamSlider();
        }

        function startTeamTimer() {
            stopTeamTimer();
            teamTimer = setInterval(nextTeamSlide, TEAM_INTERVAL);
        }

        function stopTeamTimer() {
            if (teamTimer) {
                clearInterval(teamTimer);
                teamTimer = null;
            }
        }

        function restartTeamTimer() {
            stopTeamTimer();
            startTeamTimer();
        }

        const prevBtn = document.getElementById('teamPrev');
        const nextBtn = document.getElementById('teamNext');
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                prevTeamSlide();
                restartTeamTimer();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                nextTeamSlide();
                restartTeamTimer();
            });
        }

        buildDots();
        updateTeamSlider();
        startTeamTimer();

        if (window.matchMedia('(hover: hover)').matches) {
            teamTrack.addEventListener('mouseenter', stopTeamTimer);
            teamTrack.addEventListener('mouseleave', startTeamTimer);
        }

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                stopTeamTimer();
            } else {
                startTeamTimer();
            }
        });

        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                teamIndex = 0;
                buildDots();
                updateTeamSlider();
            }, 200);
        });
    }

    /* ---------------------------------------------------
       7. SCROLL TO TOP BUTTON
       --------------------------------------------------- */
    (function initScrollTop() {
        let btn = document.getElementById('scrollTop');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'scrollTop';
            btn.className = 'scroll-top';
            btn.setAttribute('aria-label', 'Scroll to top');
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
            document.body.appendChild(btn);
        }

        let ticking = false;

        function updateButton() {
            if (window.scrollY > 400) {
                btn.classList.add('show');
            } else {
                btn.classList.remove('show');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateButton);
                ticking = true;
            }
        }, { passive: true });

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        updateButton();
    })();

        /* ---------------------------------------------------
       8. BOOKING FORM — phone/email, validation, modal
       --------------------------------------------------- */
    (function initBookingForm() {
        const form = document.getElementById('bookingForm');
        const modal = document.getElementById('bookingModal');
        const overlay = document.getElementById('bookingModalOverlay');
        const closeBtn = document.getElementById('bookingModalClose');
        const sendTelegram = document.getElementById('sendTelegram');
        const sendWhatsapp = document.getElementById('sendWhatsapp');

        if (!form || !modal) return;

        // ============ BUSINESS INFO — CHANGE HERE ============
        const BUSINESS_PHONE = '251901529662';        // WhatsApp — international, no +
        const BUSINESS_TELEGRAM = 'Makkkk17';         // Telegram username (no @)
        const BUSINESS_EMAIL = 'makidani116@gmail.com';
        // =====================================================

        const contactType = document.getElementById('contactType');
        const phoneRow = document.getElementById('phoneRow');
        const emailRow = document.getElementById('emailRow');
        const phoneField = document.getElementById('phoneField');
        const emailField = document.getElementById('emailField');
        const nameField = document.getElementById('nameField');
        const serviceField = document.getElementById('serviceField');
        const dateField = document.getElementById('preferredDate');
        const messageField = document.getElementById('messageField');
        const formError = document.getElementById('formError');

        /* ---------- Contact type toggle ---------- */
        function updateContactFields() {
            const type = contactType.value;
            if (type === 'phone') {
                phoneRow.style.display = '';
                emailRow.style.display = 'none';
                phoneField.required = true;
                emailField.required = false;
                emailField.value = '';
            } else {
                phoneRow.style.display = 'none';
                emailRow.style.display = '';
                phoneField.required = false;
                emailField.required = true;
                phoneField.value = '';
            }
            hideError();
        }
        contactType.addEventListener('change', updateContactFields);
        updateContactFields();

        /* ---------- Date: disable past ---------- */
        function setMinDate() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayStr = yyyy + '-' + mm + '-' + dd;
            dateField.min = todayStr;
            if (dateField.value && dateField.value < todayStr) {
                dateField.value = '';
            }
        }
        setMinDate();

        /* ---------- Phone input: digits only ---------- */
        phoneField.addEventListener('input', function () {
            let digits = phoneField.value.replace(/\D/g, '');
            if (digits.length > 10) digits = digits.slice(0, 10);
            phoneField.value = digits;
            hideError();
        });

        /* ---------- Helpers ---------- */
        function showError(msg) {
            formError.textContent = msg;
            formError.style.display = 'block';
        }

        function hideError() {
            formError.textContent = '';
            formError.style.display = 'none';
        }

        function openModal() {
            modal.classList.add('open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        /* ---------- Normalize Ethiopian phone ---------- */
        function normalizePhone(raw) {
            let digits = String(raw).replace(/\D/g, '');
            if (digits.startsWith('251') && digits.length > 9) digits = digits.slice(3);
            if (digits.startsWith('0')) digits = digits.slice(1);
            if (!/^[97]/.test(digits)) return null;
            if (digits.length !== 9) return null;
            return '251' + digits;
        }

        function validatePhone(raw) {
            const digits = String(raw).replace(/\D/g, '');
            if (!digits) return 'Please enter your phone number.';
            const full = normalizePhone(digits);
            if (!full) return 'Please enter a valid Ethiopian phone number (e.g. 0912 345 678).';
            return '';
        }

        /* ---------- Format date nicely ---------- */
        function formatDate(iso) {
            if (!iso) return '';
            const d = new Date(iso + 'T00:00:00');
            const months = ['January','February','March','April','May','June',
                            'July','August','September','October','November','December'];
            return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
        }

        /* ---------- Detect current language ---------- */
        function currentLang() {
            return document.documentElement.getAttribute('data-lang') || 'en';
        }

        /* ---------- Build beautiful bilingual message ---------- */
        function buildMessage(customerContact) {
            const name = (nameField.value || '').trim();
            const service = serviceField.value || '';
            const date = dateField.value || '';
            const note = (messageField.value || '').trim();
            const isAm = currentLang() === 'am';

            // Bilingual greeting
            const greeting = '🌿 Hello Maya Massage / ሰላም ማያ ማሳጅ 🌿';

            const labelName    = isAm ? 'ስም' : 'Name';
            const labelContact = isAm ? 'የመገኛ መንገድ' : 'Contact';
            const labelService = isAm ? 'አገልግሎት' : 'Service';
            const labelDate    = isAm ? 'የሚፈልጉት ቀን' : 'Preferred Date';
            const labelNote    = isAm ? 'ተጨማሪ መልእክት' : 'Message';

            const thanks = isAm
                ? '🙏 እባክዎ ይህንን ጥያቄ ያረጋግጡልኝ። አመሰግናለሁ!'
                : '🙏 Please confirm this booking. Thank you!';

            const line = '━━━━━━━━━━━━━━━━━━━━━';

            let msg = greeting + '\n\n';
            msg += '📋 ' + (isAm ? 'አዲስ የቀን ጥያቄ' : 'New Booking Request') + '\n';
            msg += line + '\n';
            msg += '👤 ' + labelName + ': ' + name + '\n';
            msg += '📞 ' + labelContact + ': ' + customerContact + '\n';
            msg += '💆 ' + labelService + ': ' + service + '\n';
            if (date) msg += '📅 ' + labelDate + ': ' + formatDate(date) + '\n';
            if (note) msg += '\n💬 ' + labelNote + ':\n' + note + '\n';
            msg += line + '\n\n';
            msg += thanks;

            return msg;
        }

        /* ---------- Copy to clipboard with fallback ---------- */
        function copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            }
            // Fallback for older browsers
            return new Promise(function (resolve) {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (e) {}
                document.body.removeChild(ta);
                resolve();
            });
        }

        /* ---------- Handle submit ---------- */
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            hideError();

            const name = (nameField.value || '').trim();
            const service = serviceField.value;
            const type = contactType.value;

            if (!name || name.length < 2) {
                showError('Please enter your name (at least 2 characters).');
                return;
            }

            if (!service) {
                showError('Please choose a service.');
                return;
            }

            if (dateField.value) {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const todayStr = yyyy + '-' + mm + '-' + dd;
                if (dateField.value < todayStr) {
                    showError('Please choose today or a future date.');
                    return;
                }
            }

            // ============ PHONE PATH ============
            if (type === 'phone') {
                const phoneError = validatePhone(phoneField.value);
                if (phoneError) {
                    showError(phoneError);
                    return;
                }

                const fullPhone = normalizePhone(phoneField.value);
                const displayPhone = '+' + fullPhone;

                const text = buildMessage(displayPhone);
                const encoded = encodeURIComponent(text);

                // ✅ FIX 1: WhatsApp goes to BUSINESS_PHONE (not customer's)
                sendWhatsapp.href = 'https://wa.me/' + BUSINESS_PHONE + '?text=' + encoded;

                // ✅ FIX 2: Telegram — copy message to clipboard, open chat
                sendTelegram.href = 'https://t.me/' + BUSINESS_TELEGRAM;
                sendTelegram.onclick = function (ev) {
                    copyToClipboard(text).then(function () {
                        showCopyToast();
                    });
                    // Let Telegram open normally (target=_blank)
                };

                openModal();
                return;
            }

            // ============ EMAIL PATH ============
            const email = (emailField.value || '').trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email || !emailPattern.test(email)) {
                showError('Please enter a valid email address.');
                return;
            }

            const text = buildMessage(email);
            const subject = encodeURIComponent('Booking Request — Maya Massage');
            const body = encodeURIComponent(text);
            const mailto = 'mailto:' + BUSINESS_EMAIL +
                           '?subject=' + subject +
                           '&body=' + body;

            window.location.href = mailto;
        });

        /* ---------- Copy toast (small popup) ---------- */
        function showCopyToast() {
            let toast = document.getElementById('copyToast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'copyToast';
                toast.className = 'copy-toast';
                document.body.appendChild(toast);
            }
            const lang = currentLang();
            toast.textContent = lang === 'am'
                ? '✅ መልእክቱ ተቀድቷል — በቴሌግራም ውስጥ ይላኩት'
                : '✅ Message copied — paste it in Telegram';
            toast.classList.add('show');

            clearTimeout(toast._timeout);
            toast._timeout = setTimeout(function () {
                toast.classList.remove('show');
            }, 3500);
        }

        /* ---------- Modal close handlers ---------- */
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeModal();
            }
        });
    })();


    /* ---------------------------------------------------
       9. DATE INPUT — disable past dates
       --------------------------------------------------- */
    (function initDateLimit() {
        const dateInput = document.getElementById('preferredDate');
        if (!dateInput) return;

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = yyyy + '-' + mm + '-' + dd;

        // Set minimum date to today
        dateInput.min = todayStr;

        // If user somehow has a past date, clear it
        if (dateInput.value && dateInput.value < todayStr) {
            dateInput.value = '';
        }

        // Block manual typing of past dates
        dateInput.addEventListener('input', function () {
            if (dateInput.value && dateInput.value < todayStr) {
                dateInput.setCustomValidity('Please choose today or a future date.');
            } else {
                dateInput.setCustomValidity('');
            }
        });
    })();
})();
