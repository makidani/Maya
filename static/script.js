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

})();
