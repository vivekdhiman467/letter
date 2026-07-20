document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. STARFIELD + SHOOTING STARS (canvas)
  ========================================================= */
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let shootingStars = [];
  let w, h;

  function resize(){
    w = window.innerWidth;
    h = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    canvas.width = w;
    canvas.height = h;
    generateStars();
  }

  function generateStars(){
    const count = Math.floor((w * h) / 2600);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.4 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function maybeSpawnShootingStar(){
    if (Math.random() < 0.0025 && shootingStars.length < 2){
      const startX = Math.random() * w * 0.6 + w * 0.2;
      const startY = Math.random() * h * 0.3 + window.scrollY;
      shootingStars.push({
        x: startX, y: startY,
        len: Math.random() * 120 + 80,
        speed: Math.random() * 9 + 7,
        angle: Math.PI / 5,
        life: 1
      });
    }
  }

  let t = 0;
  function drawStars(){
    ctx.clearRect(0, 0, w, h);
    t += 1;

    for (const s of stars){
      const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244,241,234,${Math.max(0, alpha)})`;
      ctx.fill();
    }

    maybeSpawnShootingStar();
    shootingStars.forEach((sh, i) => {
      const dx = Math.cos(sh.angle) * sh.speed;
      const dy = Math.sin(sh.angle) * sh.speed;
      sh.x += dx;
      sh.y += dy;
      sh.life -= 0.012;

      const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - dx * (sh.len/10), sh.y - dy * (sh.len/10));
      grad.addColorStop(0, `rgba(240,223,176,${sh.life})`);
      grad.addColorStop(1, 'rgba(240,223,176,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - dx * (sh.len/10), sh.y - dy * (sh.len/10));
      ctx.stroke();

      if (sh.life <= 0 || sh.y > h) shootingStars.splice(i, 1);
    });

    requestAnimationFrame(drawStars);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(drawStars);

  /* =========================================================
     2. CURSOR GLOW + PARALLAX MOON
  ========================================================= */
  const cursorGlow = document.getElementById('cursor-glow');
  const moonWrap = document.getElementById('moon-wrap');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    const px = (e.clientX / window.innerWidth - 0.5) * 18;
    const py = (e.clientY / window.innerHeight - 0.5) * 18;
    moonWrap.style.transform = `translate(${px}px, ${py}px)`;
  });

  /* =========================================================
     3. TYPEWRITER EFFECT
  ========================================================= */
  const typewriterEl = document.getElementById('typewriter');
  const cursorBlink = document.querySelector('.cursor-blink');
  const heroBtn = document.getElementById('hear-me-btn');
  const fullText = "There is something my heart has wanted to say...";
  let idx = 0;

  function typeNext(){
    if (idx <= fullText.length){
      typewriterEl.textContent = fullText.slice(0, idx);
      idx++;
      setTimeout(typeNext, 42 + Math.random() * 40);
    } else {
      heroBtn.classList.add('ready');
    }
  }
  setTimeout(typeNext, 900);

  /* =========================================================
     4. SCROLL REVEALS
  ========================================================= */
  const revealEls = document.querySelectorAll('.reveal, .reveal-line, .poem-line');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('in-view'), i * 40);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach(el => io.observe(el));

  /* =========================================================
     5. DOT NAV + MOON PHASE PER SECTION
  ========================================================= */
  const sections = document.querySelectorAll('.section');
  const dots = document.querySelectorAll('.dot');
  const phaseRect = document.getElementById('phaseRect');
  const sectionOrder = ['landing','apology','promise','about-her','letter','final'];

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        dots.forEach(d => d.classList.toggle('active', d.getAttribute('href') === `#${id}`));

        const phaseIndex = sectionOrder.indexOf(id);
        const fraction = phaseIndex / (sectionOrder.length - 1); // 0 -> 1
        const width = 116 * fraction; // full circle diameter within viewbox
        phaseRect.setAttribute('width', width.toFixed(1));
        phaseRect.setAttribute('x', (42).toFixed(1));

        // Fade moon out during the letter (handwritten, intimate) section
        moonWrap.style.opacity = id === 'letter' ? '0.25' : '1';
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(s => sectionObserver.observe(s));

  /* =========================================================
     6. FLOATING AMBIENT PARTICLES
  ========================================================= */
  const particlefield = document.getElementById('floating-particles');
  function spawnParticle(){
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1.5;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${Math.random() * 10 + 10}s`;
    particlefield.appendChild(p);
    setTimeout(() => p.remove(), 21000);
  }
  setInterval(spawnParticle, 700);
  for (let i = 0; i < 12; i++) setTimeout(spawnParticle, i * 200);

  /* =========================================================
     7. FLOATING HEARTS (final section only)
  ========================================================= */
  const finalSection = document.getElementById('final');
  let heartsActive = false;
  const heartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { heartsActive = entry.isIntersecting; });
  }, { threshold: 0.3 });
  heartObserver.observe(finalSection);

  function spawnHeart(){
    if (!heartsActive) return;
    const heart = document.createElement('div');
    heart.className = 'heart-float';
    heart.textContent = '❤';
    heart.style.left = `${Math.random() * 90 + 5}%`;
    heart.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
    heart.style.fontSize = `${Math.random() * 14 + 14}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 7200);
  }
  setInterval(spawnHeart, 900);

  /* =========================================================
     8. POLAROID GALLERY
  ========================================================= */
  /*const gallery = document.getElementById('gallery');
  const captions = [
    'that day', 'us, laughing', 'a quiet moment', 'the good kind of tired',
    'somewhere new', 'just us', 'before everything', 'still my favorite',
    'that trip', 'unplanned & perfect', 'held onto', 'always this'
  ];
  const tilts = [-4, 3, -2, 5, -5, 2, -3, 4, -2, 3, -4, 2];

  for (let i = 1; i <= 12; i++){
    const card = document.createElement('div');
    card.className = 'polaroid';
    card.style.setProperty('--tilt', `${tilts[i-1]}deg`);
    card.style.animationDelay = `${i * 0.06}s`;

    const photoWrap = document.createElement('div');
    photoWrap.className = 'polaroid-photo';
    photoWrap.textContent = `memory ${i}`;

    const img = document.createElement('img');
    img.src = `images/memory${i}.jpg`;
    img.alt = captions[i-1];
    img.loading = 'lazy';
    img.onload = () => { img.style.display = 'block'; photoWrap.textContent = ''; photoWrap.appendChild(img); };
    img.onerror = () => { img.remove(); };
    photoWrap.appendChild(img);

    const caption = document.createElement('span');
    caption.className = 'polaroid-caption';
    caption.textContent = captions[i-1];

    card.appendChild(photoWrap);
    card.appendChild(caption);
    card.addEventListener('click', () => openLightbox(img.src, captions[i-1], img.complete && img.naturalWidth > 0));
    gallery.appendChild(card);
  }
  window.addEventListener('load', resize);
  setTimeout(resize, 500);

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, caption, hasImage){
    if (!hasImage) return; // no placeholder image uploaded yet
    lightboxImg.src = src;
    lightboxImg.alt = caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });*/

  /* =========================================================
     9. MUSIC TOGGLE
  ========================================================= */
  const musicBtn = document.getElementById('music-toggle');
  const bgMusic = document.getElementById('bg-music');
  const iconMuted = document.getElementById('icon-muted');
  const iconPlaying = document.getElementById('icon-playing');
  let isPlaying = false;

  musicBtn.addEventListener('click', () => {
    if (!isPlaying){
      bgMusic.volume = 0.35;
      bgMusic.play().catch(() => {
        console.log('Add a track at music/song.mp3 for background music to play.');
      });
      iconMuted.style.display = 'none';
      iconPlaying.style.display = 'block';
      musicBtn.setAttribute('aria-pressed', 'true');
    } else {
      bgMusic.pause();
      iconMuted.style.display = 'block';
      iconPlaying.style.display = 'none';
      musicBtn.setAttribute('aria-pressed', 'false');
    }
    isPlaying = !isPlaying;
  });

});
