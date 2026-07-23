
(function () {
    /* Safe-runner: isolates each feature so one failing block never
       blocks the rest of the page from working (this was the main
       reason some sections/features could silently fail to appear). */
    function safe(name, fn) {
        try { fn(); }
        catch (err) { console.warn('[portfolio] fitur "' + name + '" gagal dijalankan:', err); }
    }

    /* ---------- Language state ---------- */
    let currentLang = localStorage.getItem('site-lang') || 'id';

    /* ---------- Boot loader ---------- */
    safe('boot-loader', function () {
        const bootEl = document.getElementById('boot');
        const bootFill = document.getElementById('bootFill');
        const bootPctEl = document.getElementById('bootPct');
        const bootStatusEl = document.getElementById('bootStatus');
        const bootMessages = [
            'menyiapkan antarmuka...',
            'memuat modul: php, javascript, html',
            'menyinkronkan kontribusi github',
            'merender komponen visual',
            'hampir selesai...'
        ];
        let bootPct = 0;
        let bootMsgIndex = 0;

        function setBootStatus(html) {
            bootStatusEl.classList.add('fading');
            setTimeout(() => {
                bootStatusEl.innerHTML = html;
                bootStatusEl.classList.remove('fading');
            }, 220);
        }

        bootStatusEl.innerHTML = bootMessages[0];
        const bootMsgInterval = setInterval(() => {
            bootMsgIndex = (bootMsgIndex + 1) % bootMessages.length;
            setBootStatus(bootMessages[bootMsgIndex]);
        }, 700);
        const bootInterval = setInterval(() => {
            bootPct += Math.random() * 16 + 7;
            if (bootPct >= 100) { bootPct = 100; clearInterval(bootInterval); }
            bootFill.style.width = bootPct + '%';
            bootPctEl.textContent = Math.round(bootPct) + '%';
            if (bootPct >= 100) {
                clearInterval(bootMsgInterval);
                setBootStatus('selesai <span class="ok">[ok]</span>');
                setTimeout(() => bootEl.classList.add('hidden'), 450);
            }
        }, 180);
        setTimeout(() => bootEl.classList.add('hidden'), 3500);
    });
    // Absolute safety net: no matter what happens above, never let the
    // boot overlay stay stuck covering the page.
    setTimeout(() => {
        const b = document.getElementById('boot');
        if (b) b.classList.add('hidden');
    }, 4000);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Custom cursor ---------- */
    safe('custom-cursor', function () {
        const cursorDot = document.getElementById('cursorDot');
        const cursorRing = document.getElementById('cursorRing');
        let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
        const cursorSpotlight = document.getElementById('cursorSpotlight');
        window.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            cursorDot.style.left = mx + 'px'; cursorDot.style.top = my + 'px';
            if (cursorSpotlight) {
                cursorSpotlight.style.setProperty('--spot-x', mx + 'px');
                cursorSpotlight.style.setProperty('--spot-y', my + 'px');
            }
        });
        (function ringLoop() {
            rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
            cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
            requestAnimationFrame(ringLoop);
        })();
    });

    function bindHoverCursor(el) {
        const cursorRing = document.getElementById('cursorRing');
        if (!cursorRing) return;
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    }
    safe('hover-cursor-bind', function () {
        document.querySelectorAll('a, button, .tab, .project-card').forEach(bindHoverCursor);
    });

    /* ---------- Magnetic buttons ---------- */
    safe('magnetic-buttons', function () {
        document.querySelectorAll('.magnetic').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const relX = e.clientX - r.left - r.width / 2;
                const relY = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${relX * 0.25}px, ${relY * 0.25}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0)'; });
        });
    });

    /* ---------- 3D tilt ---------- */
    function attachTilt(el, strength) {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            const rotX = (py - 0.5) * -strength;
            const rotY = (px - 0.5) * strength;
            el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            el.style.setProperty('--mx', (px * 100) + '%');
            el.style.setProperty('--my', (py * 100) + '%');
        });
        el.addEventListener('mouseleave', () => { el.style.transform = 'perspective(700px) rotateX(0) rotateY(0)'; });
    }
    safe('tilt-cards', function () {
        document.querySelectorAll('.tilt-card').forEach(c => attachTilt(c, 10));
        const profileTilt = document.getElementById('profileTilt');
        if (profileTilt) attachTilt(profileTilt, 7);
    });

    /* ---------- Multi-language typing hero (code kept language-agnostic) ---------- */
    const snippets = [
        {
            file: 'hello.js', lines: [
                [{ t: 'const ' }, { t: 'greet', c: 'fn' }, { t: ' = ' }, { t: 'name' }, { t: ' => ' }, { t: '`Hello, ${name}!`', c: 'str' }, { t: ';' }],
                [{ t: 'console', c: 'fn' }, { t: '.log(' }, { t: 'greet(', c: 'fn' }, { t: '"Nathanael Septian Sianipar"', c: 'str' }, { t: '));' }],
            ]
        },
        {
            file: 'hello.py', lines: [
                [{ t: 'def ', c: 'kw' }, { t: 'greet', c: 'fn' }, { t: '(name):' }],
                [{ t: '    return ', c: 'kw' }, { t: 'f"Hello, {name}!"', c: 'str' }],
                [{ t: '' }],
                [{ t: 'print', c: 'fn' }, { t: '(greet(' }, { t: '"Nathanael Septian Sianipar"', c: 'str' }, { t: '))' }],
            ]
        },
        {
            file: 'hello.php', lines: [
                [{ t: '<?php', c: 'com' }],
                [{ t: 'function ', c: 'kw' }, { t: 'greet', c: 'fn' }, { t: '($name) {' }],
                [{ t: '    return ', c: 'kw' }, { t: '"Hello, $name!"', c: 'str' }, { t: ';' }],
                [{ t: '}' }],
                [{ t: 'echo ', c: 'kw' }, { t: 'greet(', c: 'fn' }, { t: '"Nathanael Septian Sianipar"', c: 'str' }, { t: ');' }],
            ]
        },
        {
            file: 'hello.go', lines: [
                [{ t: 'package ', c: 'kw' }, { t: 'main' }],
                [{ t: 'import ', c: 'kw' }, { t: '"fmt"', c: 'str' }],
                [{ t: 'func ', c: 'kw' }, { t: 'main', c: 'fn' }, { t: '() {' }],
                [{ t: '    fmt.Println(', c: 'fn' }, { t: '"Hello, Nathanael Septian Sianipar!"', c: 'str' }, { t: ')' }],
                [{ t: '}' }],
            ]
        },
        {
            file: 'hello.rs', lines: [
                [{ t: 'fn ', c: 'kw' }, { t: 'main', c: 'fn' }, { t: '() {' }],
                [{ t: '    println!(', c: 'fn' }, { t: '"Hello, Nathanael Septian Sianipar!"', c: 'str' }, { t: ');' }],
                [{ t: '}' }],
            ]
        },
        {
            file: 'hello.java', lines: [
                [{ t: 'public class ', c: 'kw' }, { t: 'Hello' }, { t: ' {' }],
                [{ t: '  public static void ', c: 'kw' }, { t: 'main', c: 'fn' }, { t: '(String[] args) {' }],
                [{ t: '    System.out.println(', c: 'fn' }, { t: '"Hello, Nathanael Septian Sianipar!"', c: 'str' }, { t: ');' }],
                [{ t: '  }' }],
                [{ t: '}' }],
            ]
        },
    ];

    safe('hero-code-typer', function () {
        const tabsEl = document.getElementById('tabs');
        const codePane = document.getElementById('codePane');
        const lineNumbers = document.getElementById('lineNumbers');
        const editorScan = document.getElementById('editorScan');

        const indicator = document.createElement('div');
        indicator.className = 'tab-indicator';
        tabsEl.appendChild(indicator);

        const tabEls = [];
        snippets.forEach((s, i) => {
            const tab = document.createElement('div');
            tab.className = 'tab' + (i === 0 ? ' active' : '');
            tab.textContent = s.file;
            tab.addEventListener('click', () => {
                if (i === currentIndex) return;
                clearInterval(autoplayTimer);
                switchToSnippet(i, true);
                startAutoplay(6000);
            });
            tabsEl.insertBefore(tab, indicator);
            tabEls.push(tab);
            bindHoverCursor(tab);
        });

        function moveIndicatorTo(tabEl) {
            if (!tabEl) return;
            const tabsRect = tabsEl.getBoundingClientRect();
            const r = tabEl.getBoundingClientRect();
            indicator.style.width = r.width + 'px';
            indicator.style.transform = `translateX(${r.left - tabsRect.left + tabsEl.scrollLeft}px)`;
        }

        function escapeHtml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        function buildLineHTML(tokens) {
            return tokens.map(tok => {
                const text = escapeHtml(tok.t);
                return tok.c ? `<span class="${tok.c}">${text}</span>` : text;
            }).join('');
        }

        let typingTimer = null, autoplayTimer = null, currentIndex = 0, fadeTimer = null;

        // First paint: no transition needed, just lay out the initial snippet
        // and position the indicator once layout has settled.
        function renderInitial() {
            const snippet = snippets[0];
            lineNumbers.innerHTML = snippet.lines.map((_, i) => `<div>${i + 1}</div>`).join('');
            requestAnimationFrame(() => moveIndicatorTo(tabEls[0]));
        }

        // Smooth handoff between snippets: fade + gently lift the current
        // code out, swap content while invisible, then fade the new
        // content back in — instead of an abrupt instant clear/redraw.
        function switchToSnippet(index, manual) {
            currentIndex = index;
            tabEls.forEach((t, i) => t.classList.toggle('active', i === index));
            moveIndicatorTo(tabEls[index]);
            clearTimeout(typingTimer);
            clearTimeout(fadeTimer);

            codePane.classList.add('switching');
            if (editorScan) {
                editorScan.classList.remove('run');
                void editorScan.offsetWidth; // restart animation
                editorScan.classList.add('run');
            }

            fadeTimer = setTimeout(() => {
                const snippet = snippets[index];
                lineNumbers.innerHTML = snippet.lines.map((_, i) => `<div>${i + 1}</div>`).join('');
                if (reduceMotion) {
                    codePane.innerHTML = snippet.lines.map(buildLineHTML).join('\n');
                    codePane.classList.remove('switching');
                } else {
                    codePane.innerHTML = '';
                    codePane.classList.remove('switching');
                    typeLines(snippet.lines);
                }
            }, manual ? 190 : 220);
        }

        function typeLines(lines) {
            let li = 0, ci = 0;
            codePane.innerHTML = '';
            const rendered = [];
            function step() {
                if (li >= lines.length) { codePane.innerHTML = rendered.join('\n'); return; }
                const flat = lines[li].map(t => ({ ...t }));
                const fullText = flat.map(t => t.t).join('');
                ci++;
                let remaining = ci, partial = [];
                for (const tok of flat) {
                    if (remaining <= 0) break;
                    const take = Math.min(remaining, tok.t.length);
                    partial.push({ t: tok.t.slice(0, take), c: tok.c });
                    remaining -= take;
                }
                codePane.innerHTML = [...rendered, buildLineHTML(partial) + '<span class="caret"></span>'].join('\n');
                if (ci >= fullText.length) {
                    rendered.push(buildLineHTML(flat));
                    li++; ci = 0;
                    typingTimer = setTimeout(step, 170);
                } else {
                    typingTimer = setTimeout(step, 13);
                }
            }
            step();
        }

        function startAutoplay(delay) {
            autoplayTimer = setTimeout(() => {
                const next = (currentIndex + 1) % snippets.length;
                switchToSnippet(next, false);
                startAutoplay(6500);
            }, delay);
        }

        window.addEventListener('resize', () => moveIndicatorTo(tabEls[currentIndex]));

        if (reduceMotion) {
            renderInitial();
            codePane.innerHTML = snippets[0].lines.map(buildLineHTML).join('\n');
        } else {
            renderInitial();
            typeLines(snippets[0].lines);
            startAutoplay(6500);
        }
    });

    /* ---------- Scroll reveal ---------- */
    safe('scroll-reveal', function () {
        const revealEls = document.querySelectorAll('.reveal');
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        revealEls.forEach(el => io.observe(el));

        // Safety net: if for any reason the observer never fires for an
        // element (very short pages, unusual layouts, etc.) reveal it
        // anyway after a short delay so content is never stuck hidden.
        setTimeout(() => {
            document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
        }, 2500);
    });

    /* ---------- Smooth character reveal for section headings (replaces the old scramble effect) ---------- */
    function buildCharReveal(el, finalText, stepMs) {
        el.setAttribute('aria-label', finalText);
        const track = document.createElement('span');
        track.className = 'char-track';
        track.setAttribute('aria-hidden', 'true');
        finalText.split('').forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'char-reveal';
            span.style.animationDelay = (i * stepMs) + 'ms';
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            track.appendChild(span);
        });
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = finalText;

        el.innerHTML = '';
        el.appendChild(track);
        el.appendChild(srText);
    }

    safe('heading-reveal', function () {
        if (reduceMotion) return;
        const revealTargets = document.querySelectorAll('.section-head h2');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    buildCharReveal(e.target, e.target.textContent.trim(), 16);
                    revealObserver.unobserve(e.target);
                }
            });
        }, { threshold: 0.4 });
        revealTargets.forEach(el => revealObserver.observe(el));
    });

    /* ---------- Skills marquee with logos + name tooltip ---------- */
    const skillIcons = [
        { name: 'Laravel', slug: 'laravel' },
        { name: 'Node.js', slug: 'nodedotjs' },
        { name: 'React', slug: 'react' },
        { name: 'Vue', slug: 'vuedotjs' },
        { name: 'Docker', slug: 'docker' },
        { name: 'MySQL', slug: 'mysql' },
        { name: 'PostgreSQL', slug: 'postgresql' },
        { name: 'Redis', slug: 'redis' },
        { name: 'Git', slug: 'git' },
        { name: 'Tailwind CSS', slug: 'tailwindcss' },
        { name: 'Linux', slug: 'linux' },
        { name: 'PHP', slug: 'php' },
        { name: 'JavaScript', slug: 'javascript' },
        { name: 'HTML', slug: 'html5' },
        { name: 'CSS', slug: 'css3' },
        { name: 'Python', slug: 'python' },
        { name: 'Go', slug: 'go' },
        { name: 'Rust', slug: 'rust' },
        { name: 'Figma', slug: 'figma' },
        { name: 'Postman', slug: 'postman' },
        { name: 'GitHub Actions', slug: 'githubactions' },
        { name: 'Nginx', slug: 'nginx' },
        { name: 'VS Code', slug: 'visualstudiocode' },
    ];

    let skillTooltipHideTimer = null;
    function showSkillTooltip(badge, x, y) {
        const skillTooltip = document.getElementById('skillTooltip');
        if (!skillTooltip) return;
        skillTooltip.textContent = badge.dataset.name;
        skillTooltip.style.left = x + 'px';
        skillTooltip.style.top = y + 'px';
        skillTooltip.classList.add('show');
    }
    function hideSkillTooltip() {
        const skillTooltip = document.getElementById('skillTooltip');
        if (skillTooltip) skillTooltip.classList.remove('show');
    }

    function makeSkillBadge(item) {
        const cursorRing = document.getElementById('cursorRing');
        const badge = document.createElement('span');
        badge.className = 'skill-badge';
        badge.dataset.name = item.name;
        badge.tabIndex = 0;

        const img = document.createElement('img');
        img.src = `https://cdn.simpleicons.org/${item.slug}`;
        img.alt = item.name;
        img.loading = 'lazy';
        img.onerror = function () {
            this.onerror = null;
            badge.innerHTML = '';
            badge.style.fontFamily = 'var(--mono)';
            badge.style.fontSize = '1.1rem';
            badge.style.color = 'var(--blue-bright)';
            badge.textContent = item.name.slice(0, 2).toUpperCase();
        };
        badge.appendChild(img);

        badge.addEventListener('mouseenter', (e) => {
            if (cursorRing) cursorRing.classList.add('hovering');
            showSkillTooltip(badge, e.clientX, e.clientY);
        });
        badge.addEventListener('mousemove', (e) => {
            showSkillTooltip(badge, e.clientX, e.clientY);
        });
        badge.addEventListener('mouseleave', () => {
            if (cursorRing) cursorRing.classList.remove('hovering');
            hideSkillTooltip();
        });
        badge.addEventListener('click', (e) => {
            badge.classList.add('badge-active');
            const rect = badge.getBoundingClientRect();
            showSkillTooltip(badge, rect.left + rect.width / 2, rect.top);
            clearTimeout(skillTooltipHideTimer);
            skillTooltipHideTimer = setTimeout(() => {
                hideSkillTooltip();
                badge.classList.remove('badge-active');
            }, 1600);
        });
        badge.addEventListener('focus', (e) => {
            const rect = badge.getBoundingClientRect();
            showSkillTooltip(badge, rect.left + rect.width / 2, rect.top);
        });
        badge.addEventListener('blur', hideSkillTooltip);

        return badge;
    }

    safe('skills-marquee', function () {
        const half = Math.ceil(skillIcons.length / 2);
        const leftItems = skillIcons.slice(0, half);
        const rightItems = skillIcons.slice(half);

        const trackLeft = document.getElementById('marqueeTrackLeft');
        const trackRight = document.getElementById('marqueeTrackRight');
        // Duplicate the item lists (not the DOM/innerHTML) so every badge gets
        // its own fresh event listeners for the hover/click name tooltip.
        [...leftItems, ...leftItems].forEach(item => trackLeft.appendChild(makeSkillBadge(item)));
        [...rightItems, ...rightItems].forEach(item => trackRight.appendChild(makeSkillBadge(item)));
    });

    /* ---------- GitHub contribution heatmap (real data via public API) ---------- */
    const GITHUB_USERNAME = 'NathanaelSianipar';
    const levelColors = ['#0f1626', '#123a6e', '#1a5aa8', '#2f8fff', '#7ec8ff'];
    const monthNamesByLang = {
        id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    };
    const localeByLang = { id: 'id-ID', en: 'en-US', de: 'de-DE' };
    const monthLabelRefs = [];
    let totalContribs = 0;
    let contribDays = [];

    function levelFor(count) {
        if (count === 0) return 0;
        if (count <= 3) return 1;
        if (count <= 7) return 2;
        if (count <= 12) return 3;
        return 4;
    }

    function synthContributions() {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const totalDays = 371;
        let start = new Date(today);
        start.setDate(start.getDate() - totalDays + 1);
        start.setDate(start.getDate() - start.getDay());
        const days = [];
        let cursor = new Date(start);
        while (cursor <= today) {
            const rand = Math.random();
            let count;
            if (rand < 0.32) count = 0;
            else if (rand < 0.6) count = Math.floor(Math.random() * 3) + 1;
            else if (rand < 0.83) count = Math.floor(Math.random() * 4) + 4;
            else if (rand < 0.95) count = Math.floor(Math.random() * 5) + 8;
            else count = Math.floor(Math.random() * 8) + 13;
            days.push({ date: new Date(cursor), count });
            cursor.setDate(cursor.getDate() + 1);
        }
        return days;
    }

    function showTooltip(cell, e) {
        const tooltip = document.getElementById('contribTooltip');
        if (!tooltip) return;
        const t = translations[currentLang];
        const d = new Date(cell.dataset.dateIso);
        const dateStr = d.toLocaleDateString(localeByLang[currentLang], { day: 'numeric', month: 'long', year: 'numeric' });
        tooltip.textContent = t.contrib.tooltip.replace('{count}', cell.dataset.count).replace('{date}', dateStr);
        tooltip.style.left = e.clientX + 'px';
        tooltip.style.top = e.clientY + 'px';
        tooltip.classList.add('show');
    }

    function animateCount(el, target, duration) {
        if (reduceMotion) { el.textContent = target.toLocaleString(localeByLang[currentLang] || 'id-ID'); return; }
        const start = performance.now();
        function frame(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(eased * target);
            el.textContent = value.toLocaleString(localeByLang[currentLang] || 'id-ID');
            if (progress < 1) requestAnimationFrame(frame);
            else el.textContent = target.toLocaleString(localeByLang[currentLang] || 'id-ID');
        }
        requestAnimationFrame(frame);
    }

    function renderHeatmap(days) {
        const contribCols = document.getElementById('contribCols');
        const contribMonths = document.getElementById('contribMonths');
        const contribTotalEl = document.getElementById('contribTotal');
        const contribLoadingEl = document.getElementById('contribLoading');
        const contribGridWrapEl = document.getElementById('contribGridWrap');
        const contribLegendEl = document.getElementById('contribLegend');
        const tooltip = document.getElementById('contribTooltip');

        contribDays = days;
        totalContribs = days.reduce((s, d) => s + d.count, 0);
        animateCount(contribTotalEl, totalContribs, 900);

        contribCols.innerHTML = '';
        contribMonths.innerHTML = '';
        monthLabelRefs.length = 0;

        const weeks = [];
        for (let i = 0; i < days.length; i += 7) { weeks.push(days.slice(i, i + 7)); }

        let lastMonth = -1;
        weeks.forEach((week) => {
            const col = document.createElement('div');
            col.className = 'contrib-col';
            week.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'contrib-cell';
                const lvl = levelFor(day.count);
                cell.style.background = levelColors[lvl];
                if (lvl === 4) cell.style.boxShadow = '0 0 6px rgba(126,200,255,0.5)';
                cell.dataset.count = day.count;
                cell.dataset.dateIso = day.date.toISOString();
                cell.addEventListener('mousemove', (e) => showTooltip(cell, e));
                cell.addEventListener('mouseleave', () => { if (tooltip) tooltip.classList.remove('show'); });
                col.appendChild(cell);
            });
            contribCols.appendChild(col);

            const firstDay = week[0].date;
            const monthIdx = firstDay.getMonth();
            if (monthIdx !== lastMonth) {
                lastMonth = monthIdx;
                const label = document.createElement('div');
                label.textContent = monthNamesByLang[currentLang][monthIdx];
                contribMonths.appendChild(label);
                monthLabelRefs.push({ el: label, monthIdx });
            } else {
                contribMonths.appendChild(document.createElement('div'));
            }
        });

        contribLoadingEl.style.display = 'none';
        contribGridWrapEl.style.display = '';
        contribLegendEl.style.display = '';

        const contribWrapEl = document.querySelector('.contrib-wrap');
        const swipeHintEl = document.getElementById('contribSwipeHint');
        function syncSwipeHint() {
            if (!swipeHintEl || !contribWrapEl) return;
            const overflowing = contribWrapEl.scrollWidth > contribWrapEl.clientWidth + 4;
            swipeHintEl.classList.toggle('visible', overflowing);
        }
        requestAnimationFrame(() => {
            syncSwipeHint();
            if (contribWrapEl && contribWrapEl.scrollWidth > contribWrapEl.clientWidth) {
                contribWrapEl.scrollLeft = contribWrapEl.scrollWidth;
            }
        });
        window.addEventListener('resize', syncSwipeHint);

        // Gentle, calm fade-in for the heatmap cells instead of a rapid
        // pop/scale-in cascade across every single cell.
        const contribObserver = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const cells = document.querySelectorAll('.contrib-cell');
                    cells.forEach((cell, i) => setTimeout(() => cell.classList.add('in'), i * 0.6));
                    contribObserver.disconnect();
                }
            });
        }, { threshold: 0.2 });
        const wrapForObs = document.querySelector('.contrib-wrap');
        if (wrapForObs) contribObserver.observe(wrapForObs);
    }

    function loadGithubContributions() {
        fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`)
            .then(res => { if (!res.ok) throw new Error('bad response'); return res.json(); })
            .then(data => {
                if (!data || !Array.isArray(data.contributions) || !data.contributions.length) throw new Error('empty');
                const days = data.contributions
                    .map(d => ({ date: new Date(d.date + 'T00:00:00'), count: d.count }))
                    .sort((a, b) => a.date - b.date);
                const trimmed = days.slice(-371);
                const first = trimmed[0].date;
                const offset = first.getDay();
                if (offset !== 0) {
                    const pad = [];
                    for (let i = offset; i > 0; i--) {
                        const d = new Date(first);
                        d.setDate(d.getDate() - i);
                        pad.push({ date: d, count: 0 });
                    }
                    trimmed.unshift(...pad);
                }
                renderHeatmap(trimmed);
            })
            .catch(() => { renderHeatmap(synthContributions()); });
    }
    safe('github-heatmap', loadGithubContributions);

    /* ---------- Particle network background ---------- */
    safe('particles-bg', function () {
        const canvas = document.getElementById('particles');
        const ctx = canvas.getContext('2d');
        let W, H, particles;
        const PARTICLE_COUNT = window.innerWidth < 700 ? 32 : 70;
        const pColors = ['#2f8fff', '#7ec8ff', '#123a6e', '#7ee6c4'];

        function resize() { W = canvas.width = window.innerWidth; H = canvas.height = document.body.scrollHeight; }
        function initParticles() {
            particles = Array.from({ length: PARTICLE_COUNT }, () => ({
                x: Math.random() * W, y: Math.random() * Math.min(H, window.innerHeight),
                vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.6 + 0.6,
                color: pColors[Math.floor(Math.random() * pColors.length)]
            }));
        }
        resize(); initParticles();
        window.addEventListener('resize', () => { resize(); });

        const mouseP = { x: -9999, y: -9999 };
        window.addEventListener('mousemove', e => { mouseP.x = e.clientX; mouseP.y = e.clientY + window.scrollY; });

        function drawParticles() {
            ctx.clearRect(0, 0, W, H);
            const viewTop = window.scrollY, viewBottom = viewTop + window.innerHeight;
            for (let p of particles) {
                if (p.y < viewTop - 100 || p.y > viewBottom + 100) continue;
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;
                const dx = p.x - mouseP.x, dy = p.y - mouseP.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) { p.x += dx / dist * 0.6; p.y += dy / dist * 0.6; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.75;
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    if (a.y < viewTop - 150 || a.y > viewBottom + 150) continue;
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = 'rgba(47,143,255,' + (0.16 * (1 - dist / 120)) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawParticles);
        }
        if (!reduceMotion) drawParticles();
        else { ctx.clearRect(0, 0, W, H); }
    });

    /* ================= THEME TOGGLE ================= */
    let currentTheme = 'dark';
    function applyTheme(theme, animate) {
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeIconEl = document.getElementById('themeIcon');
        currentTheme = theme;
        localStorage.setItem('site-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIconEl) themeIconEl.textContent = theme === 'dark' ? '☀' : '🌙';
        const t = translations[currentLang];
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', theme === 'dark' ? t.nav.themeToLight : t.nav.themeToDark);
        if (animate && themeToggleBtn) {
            themeToggleBtn.classList.add('spin');
            setTimeout(() => themeToggleBtn.classList.remove('spin'), 400);
        }
    }
    safe('theme-toggle', function () {
        const themeToggleBtn = document.getElementById('themeToggle');
        themeToggleBtn.addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark', true));
    });

    /* ================= TRANSLATIONS / LANGUAGE SWITCH ================= */
    const translations = {
        id: {
            nav: { home: "Beranda", about: "Tentang", education: "Pendidikan", skills: "Keahlian", activity: "Kontribusi", projects: "Proyek", career: "Pengalaman", contact: "Kontak", themeToLight: "Ganti ke mode terang", themeToDark: "Ganti ke mode gelap" },
            hero: { eyebrow: "tersedia untuk bekerja", title_pre: "Halo, saya", title_post: "Full-Stack Developer.", lead: "Saya seorang mahasiswa yang ingin menjadi Fullstack Developer.", cta_primary: "Lihat proyek saya →", cta_ghost: "Hubungi saya", meta_role: "Fullstack Developer", meta_school: "Institut Teknologi Del", meta_location: "Jambi, Indonesia" },
            about: { tag: "01 · tentang", heading: "Sedikit cerita tentang saya", comment_lead: "Profil Saya:", comment_body: "Saya lahir di Jambi pada 22 September 2007. Saya merupakan mahasiswa dari Institut Teknologi Del dengan jurusan yang saya ambil adalah D3 Teknologi Informasi. Saya memiliki keahlian sebagai Fullstack Developer.", fact_location: "Lokasi", fact_focus: "Fokus", fact_focus_val: "Web & Aplikasi", fact_exp: "Pengalaman", fact_exp_val: "1+ tahun", fact_lang: "Bahasa favorit", fact_learning: "Sedang belajar", fact_learning_val: "Flutter" },
            education: { tag: "02 · pendidikan", heading: "Latar belakang pendidikan", items: [{ school: "Institut Teknologi Del", degree: "D3 Teknologi Informasi" }, { school: "SMA Negeri 2 Kota Jambi", degree: "Saintek" }] },
            skills: { tag: "03 · keahlian", heading: "Bahasa &amp; teknologi yang saya kuasai" },
            contrib: { tag: "04 · aktivitas", heading: "Kontribusi setahun terakhir", summary_suffix: "kontribusi dalam setahun terakhir", legend_less: "Sedikit", legend_more: "Banyak", tooltip: "{count} kontribusi pada {date}", loading: "Mengambil data GitHub..." },
            projects: {
                tag: "05 · proyek", heading: "Beberapa proyek yang pernah saya kerjakan", items: [
                    { title: "Sistem Admin Gereja", desc: "Aplikasi manajemen jemaat, jadwal ibadah, dan pokok doa dengan panel admin yang mudah dipakai." },
                    { title: "Dashboard Analitik", desc: "Dashboard real-time untuk memantau metrik bisnis dengan visualisasi data interaktif." },
                    { title: "API Microservice", desc: "Layanan backend berkinerja tinggi untuk memproses ribuan permintaan per detik." },
                    { title: "Automasi Data", desc: "Script otomasi untuk membersihkan dan memproses data secara berkala tanpa campur tangan manual." }
                ]
            },
            career: {
                tag: "06 · pengalaman", heading: "Perjalanan karier", items: [
                    { title: "Full-Stack Developer, Perusahaan Kamu", desc: "Mengembangkan dan memelihara aplikasi web untuk klien, dari perencanaan sampai deployment." },
                    { title: "Backend Developer, Perusahaan Sebelumnya", desc: "Membangun dan mengoptimalkan API serta arsitektur database untuk produk skala menengah." },
                    { title: "Junior Developer, Perusahaan Pertama", desc: "Memulai karier dengan mengerjakan fitur-fitur kecil dan belajar praktik terbaik dalam tim." }
                ]
            },
            contact: { tag: "07 · kontak", heading: "Mari berkolaborasi", status: "terbuka untuk proyek freelance & posisi full-time", email_label: "email", location_label: "lokasi", btn_email: "Kirim Email", copied: "Email disalin ke clipboard" },
            footer: { desc: "Fullstack Developer yang senang mengubah ide menjadi aplikasi web yang rapi dan reliable.", nav_title: "Navigasi", contact_title: "Kontak", social_title: "Temukan saya di", copyright: "© 2026 Nathanael Septian Sianipar. Seluruh hak cipta dilindungi.", text: "Dibangun dengan </> dan banyak kopi" }
        },
        en: {
            nav: { home: "Home", about: "About", education: "Education", skills: "Skills", activity: "Contributions", projects: "Projects", career: "Experience", contact: "Contact", themeToLight: "Switch to light mode", themeToDark: "Switch to dark mode" },
            hero: { eyebrow: "available for work", title_pre: "Hi, I'm", title_post: "Full-Stack Developer.", lead: "I'm a student aiming to become a Fullstack Developer.", cta_primary: "See my projects →", cta_ghost: "Contact me", meta_role: "Fullstack Developer", meta_school: "Institut Teknologi Del", meta_location: "Jambi, Indonesia" },
            about: { tag: "01 · about", heading: "A little about me", comment_lead: "My profile:", comment_body: "I was born in Jambi on September 22, 2007. I'm currently a student at Institut Teknologi Del, majoring in D3 Information Technology. My focus is on becoming a Fullstack Developer.", fact_location: "Location", fact_focus: "Focus", fact_focus_val: "Web & Apps", fact_exp: "Experience", fact_exp_val: "1+ year", fact_lang: "Favorite languages", fact_learning: "Currently learning", fact_learning_val: "Flutter" },
            education: { tag: "02 · education", heading: "Educational background", items: [{ school: "Institut Teknologi Del", degree: "D3 Information Technology" }, { school: "SMA Negeri 2 Kota Jambi", degree: "Science Track" }] },
            skills: { tag: "03 · skills", heading: "Languages &amp; technologies I work with" },
            contrib: { tag: "04 · activity", heading: "Contributions over the last year", summary_suffix: "contributions in the last year", legend_less: "Less", legend_more: "More", tooltip: "{count} contributions on {date}", loading: "Fetching GitHub data..." },
            projects: {
                tag: "05 · projects", heading: "Some projects I've worked on", items: [
                    { title: "Church Admin System", desc: "A congregation management app with service schedules and prayer requests, with an easy-to-use admin panel." },
                    { title: "Analytics Dashboard", desc: "A real-time dashboard for tracking business metrics with interactive data visualizations." },
                    { title: "API Microservice", desc: "A high-performance backend service handling thousands of requests per second." },
                    { title: "Data Automation", desc: "An automation script that cleans and processes data on a schedule without manual work." }
                ]
            },
            career: {
                tag: "06 · experience", heading: "Career journey", items: [
                    { title: "Full-Stack Developer, Your Company", desc: "Developing and maintaining web applications for clients, from planning through deployment." },
                    { title: "Backend Developer, Previous Company", desc: "Building and optimizing APIs and database architecture for mid-scale products." },
                    { title: "Junior Developer, First Company", desc: "Started my career working on small features and learning best practices as part of a team." }
                ]
            },
            contact: { tag: "07 · contact", heading: "Let's collaborate", status: "open for freelance projects & full-time positions", email_label: "email", location_label: "location", btn_email: "Send Email", copied: "Email copied to clipboard" },
            footer: { desc: "A Fullstack Developer who enjoys turning ideas into clean, reliable web applications.", nav_title: "Navigation", contact_title: "Contact", social_title: "Find me on", copyright: "© 2026 Nathanael Septian Sianipar. All rights reserved.", text: "Built with </> and lots of coffee" }
        },
        de: {
            nav: { home: "Start", about: "Über mich", education: "Bildung", skills: "Fähigkeiten", activity: "Beiträge", projects: "Projekte", career: "Werdegang", contact: "Kontakt", themeToLight: "Zum hellen Modus wechseln", themeToDark: "Zum dunklen Modus wechseln" },
            hero: { eyebrow: "verfügbar für Aufträge", title_pre: "Hallo, ich bin", title_post: "Full-Stack-Entwickler.", lead: "Ich bin Student und möchte Fullstack-Entwickler werden.", cta_primary: "Meine Projekte ansehen →", cta_ghost: "Kontaktiere mich", meta_role: "Fullstack-Entwickler", meta_school: "Institut Teknologi Del", meta_location: "Jambi, Indonesien" },
            about: { tag: "02 · über mich", heading: "Ein bisschen über mich", comment_lead: "Mein Profil:", comment_body: "Ich wurde am 22. September 2007 in Jambi geboren. Ich studiere derzeit am Institut Teknologi Del im Studiengang D3 Informationstechnologie und spezialisiere mich auf Fullstack-Entwicklung.", fact_location: "Standort", fact_focus: "Fokus", fact_focus_val: "Web & Apps", fact_exp: "Erfahrung", fact_exp_val: "1+ Jahr", fact_lang: "Bevorzugte Sprachen", fact_learning: "Lerne gerade", fact_learning_val: "Flutter" },
            education: { tag: "02 · bildung", heading: "Bildungshintergrund", items: [{ school: "Institut Teknologi Del", degree: "D3 Informationstechnologie" }, { school: "SMA Negeri 2 Kota Jambi", degree: "Naturwissenschaftlicher Zweig" }] },
            skills: { tag: "03 · fähigkeiten", heading: "Sprachen &amp; Technologien, die ich beherrsche" },
            contrib: { tag: "04 · aktivität", heading: "Beiträge im letzten Jahr", summary_suffix: "Beiträge im letzten Jahr", legend_less: "Weniger", legend_more: "Mehr", tooltip: "{count} Beiträge am {date}", loading: "GitHub-Daten werden geladen..." },
            projects: {
                tag: "05 · projekte", heading: "Einige Projekte, an denen ich gearbeitet habe", items: [
                    { title: "Kirchen-Verwaltungssystem", desc: "Eine App zur Gemeindeverwaltung mit Gottesdienstplänen und Gebetsanliegen sowie einem einfach zu bedienenden Admin-Panel." },
                    { title: "Analyse-Dashboard", desc: "Ein Echtzeit-Dashboard zur Überwachung von Geschäftskennzahlen mit interaktiven Datenvisualisierungen." },
                    { title: "API-Microservice", desc: "Ein leistungsstarker Backend-Dienst, der tausende Anfragen pro Sekunde verarbeitet." },
                    { title: "Datenautomatisierung", desc: "Ein Automatisierungsskript, das Daten regelmäßig bereinigt und verarbeitet — ganz ohne manuellen Aufwand." }
                ]
            },
            career: {
                tag: "06 · werdegang", heading: "Werdegang", items: [
                    { title: "Full-Stack-Entwickler, Deine Firma", desc: "Entwicklung und Pflege von Webanwendungen für Kunden, von der Planung bis zum Deployment." },
                    { title: "Backend-Entwickler, Vorheriges Unternehmen", desc: "Aufbau und Optimierung von APIs sowie Datenbankarchitektur für mittelgroße Produkte." },
                    { title: "Junior-Entwickler, Erstes Unternehmen", desc: "Karrierestart mit kleinen Features und dem Erlernen von Best Practices im Team." }
                ]
            },
            contact: { tag: "07 · kontakt", heading: "Lass uns zusammenarbeiten", status: "offen für Freelance-Projekte & Festanstellungen", email_label: "E-Mail", location_label: "Standort", btn_email: "E-Mail senden", copied: "E-Mail in die Zwischenablage kopiert" },
            footer: { desc: "Ein Fullstack-Entwickler, der Ideen gerne in saubere, zuverlässige Webanwendungen verwandelt.", nav_title: "Navigation", contact_title: "Kontakt", social_title: "Finde mich auf", copyright: "© 2026 Nathanael Septian Sianipar. Alle Rechte vorbehalten.", text: "Gebaut mit </> und viel Kaffee" }
        }
    };

    function getNested(obj, path) {
        return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
    }

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('site-lang', lang);
        document.documentElement.lang = lang;
        const langCurrentLabel = document.getElementById('langCurrentLabel');
        const langOptions = document.querySelectorAll('.lang-option');
        if (langCurrentLabel) langCurrentLabel.textContent = lang.toUpperCase();
        langOptions.forEach(o => o.classList.toggle('active', o.dataset.lang === lang));
        const t = translations[lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = getNested(t, key);
            if (val !== undefined) el.textContent = val;
        });
        const themeToggleBtn = document.getElementById('themeToggle');
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', currentTheme === 'dark' ? t.nav.themeToLight : t.nav.themeToDark);
        monthLabelRefs.forEach(ref => { ref.el.textContent = monthNamesByLang[lang][ref.monthIdx]; });
        const contribTotalEl = document.getElementById('contribTotal');
        if (contribDays.length && contribTotalEl) {
            contribTotalEl.textContent = totalContribs.toLocaleString(localeByLang[lang]);
        }
    }

    /* --- collapsible language dropdown --- */
    safe('lang-dropdown', function () {
        const langCurrentBtn = document.getElementById('langCurrentBtn');
        const langDropdown = document.getElementById('langDropdown');
        const langOptions = document.querySelectorAll('.lang-option');
        function closeLangDropdown() {
            langDropdown.classList.remove('open');
            langCurrentBtn.setAttribute('aria-expanded', 'false');
        }
        langCurrentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !langDropdown.classList.contains('open');
            langDropdown.classList.toggle('open', willOpen);
            langCurrentBtn.setAttribute('aria-expanded', String(willOpen));
        });
        langOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                setLanguage(btn.dataset.lang);
                closeLangDropdown();
            });
        });
        document.addEventListener('click', (e) => {
            if (!langDropdown.contains(e.target) && e.target !== langCurrentBtn) closeLangDropdown();
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLangDropdown(); });
    });

    /* Apply saved (or default) theme + language now that everything above is wired up */
    safe('apply-theme-lang', function () {
        applyTheme(localStorage.getItem('site-theme') || 'dark');
        setLanguage(currentLang);
    });

    /* ---------- Copy email to clipboard ---------- */
    safe('copy-email', function () {
        const toastEl = document.getElementById('toast');
        let toastTimer = null;
        document.querySelectorAll('.copy-email').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.dataset.email;
                const finish = () => {
                    toastEl.textContent = translations[currentLang].contact.copied;
                    toastEl.classList.add('show');
                    clearTimeout(toastTimer);
                    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(email).then(finish).catch(finish);
                } else {
                    finish();
                }
            });
        });
    });

    /* ---------- Scroll progress bar ---------- */
    safe('scroll-progress', function () {
        const scrollProgressEl = document.getElementById('scrollProgress');
        function updateScrollProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgressEl.style.width = pct + '%';
        }
        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        updateScrollProgress();
    });

    /* ---------- Occasional auto-glitch on the hero name (toned down) ---------- */
    safe('hero-glitch', function () {
        const glitchNameEl = document.querySelector('.hero h1 .glitch');
        if (glitchNameEl && !reduceMotion) {
            setInterval(() => {
                glitchNameEl.classList.add('glitching');
                setTimeout(() => glitchNameEl.classList.remove('glitching'), 380);
            }, 9000 + Math.random() * 6000);
        }
    });

    /* ---------- Occasional CRT flicker on the scanline layer (toned down) ---------- */
    safe('crt-flicker', function () {
        const scanlinesEl = document.querySelector('.scanlines');
        if (scanlinesEl && !reduceMotion) {
            setInterval(() => {
                scanlinesEl.classList.add('flicker');
                setTimeout(() => scanlinesEl.classList.remove('flicker'), 420);
            }, 18000 + Math.random() * 12000);
        }
    });

    /* ---------- Cursor click feedback ---------- */
    safe('cursor-click-feedback', function () {
        const cursorRing = document.getElementById('cursorRing');
        window.addEventListener('mousedown', () => cursorRing.classList.add('clicking'));
        window.addEventListener('mouseup', () => cursorRing.classList.remove('clicking'));
    });

    /* ================= MOBILE NAV ================= */
    safe('mobile-nav', function () {
        const navToggle = document.getElementById('navToggle');
        const mobileNav = document.getElementById('mobileNav');
        const mobileNavClose = document.getElementById('mobileNavClose');
        const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');

        function openMobileNav() {
            mobileNav.classList.add('open');
            navToggle.classList.add('open');
            navToggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
        function closeMobileNav() {
            mobileNav.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
        navToggle.addEventListener('click', () => {
            if (mobileNav.classList.contains('open')) closeMobileNav();
            else openMobileNav();
        });
        mobileNavClose.addEventListener('click', closeMobileNav);
        mobileNavBackdrop.addEventListener('click', closeMobileNav);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobileNav(); });
        mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
        window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMobileNav(); });
    });

    /* ================= SCROLL SPY (active nav link) ================= */
    safe('scroll-spy', function () {
        const spySections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('header nav a[href^="#"], .mobile-nav a[href^="#"]');
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
        spySections.forEach(s => spyObserver.observe(s));
    });
})();