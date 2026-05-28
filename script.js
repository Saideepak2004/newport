/**
 * Premium Portfolio Animation & Interactive Logic Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global active page elements
  const body = document.body;

  // Initialize all features
  initCustomCursor();
  initParticleCanvas();
  initTypewriterScrambler();
  init3DTiltCards();
  initScrollReveal();
  initProjectsFilterAndModals();
  initContactFormFeedback();
  initProfileStatusRotator();
});

/* ==========================================================================
   1. CUSTOM DUAL-RING CURSOR TRACKER
   ========================================================================== */
function initCustomCursor() {
  const cursorDot = document.querySelector('.custom-cursor');
  const cursorFollower = document.querySelector('.custom-cursor-follower');
  
  if (!cursorDot || !cursorFollower) return;

  let mouseX = 0, mouseY = 0;     // Current mouse coordinates
  let followerX = 0, followerY = 0; // Followers coordinates (delayed)
  const lerpFactor = 0.12;         // Smoothness of follower movement

  // Keep track of cursor coordinates
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot moves instantly
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;
  });

  // Smooth lerped render loop for outer circle follower
  function updateFollower() {
    followerX += (mouseX - followerX) * lerpFactor;
    followerY += (mouseY - followerY) * lerpFactor;
    
    cursorFollower.style.left = `${followerX}px`;
    cursorFollower.style.top = `${followerY}px`;
    
    requestAnimationFrame(updateFollower);
  }
  updateFollower();

  // Attach hover states to links, buttons, and filter tabs
  const interactiveSelector = 'a, button, input, textarea, .filter-btn, .project-card, .social-btn, .modal-close-btn';
  
  document.body.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorDot.classList.add('hovered', 'hidden-interactive');
      cursorFollower.classList.add('hovered', 'hidden-interactive');
    }
  });

  document.body.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorDot.classList.remove('hovered', 'hidden-interactive');
      cursorFollower.classList.remove('hovered', 'hidden-interactive');
    }
  });

  // Hide custom cursor when leaving viewport
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorFollower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursorDot.style.opacity = '1';
    cursorFollower.style.opacity = '1';
  });
}

/* ==========================================================================
   2. PHYSICS-BASED PARTICLE CANVAS CONSTELLATION
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const connectionDistance = 110;
  // Decrease density on smaller mobile screens for rendering performance
  const maxParticles = width < 768 ? 40 : 85; 

  const mouse = {
    x: null,
    y: null,
    radius: 150
  };

  // Capture mouse movement
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Track window resizing
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Particle Class blueprint
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5; // Slight drift velocity
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2 + 1; // Size 1px to 3px
      
      // Assign glowing violet-cyan gradient hues
      this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(130, 87, 229, 0.4)';
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    update() {
      // Float
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off borders
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Attract/Repel dynamically on mouse radius
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < mouse.radius) {
          // Push particles slightly away or drag based on factor
          const force = (mouse.radius - distance) / mouse.radius;
          this.x -= dx / distance * force * 1.5;
          this.y -= dy / distance * force * 1.5;
        }
      }
      this.draw();
    }
  }

  // Generate constellation cloud
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }

  // Physics animation render loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update all particle points
    particles.forEach(p => p.update());

    // Connect close points
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < connectionDistance) {
          // Opacity fades as they drift apart
          const opacity = (1 - dist / connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(130, 87, 229, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   3. CHARACTERS SCRAMBLE TYPEWRITER
   ========================================================================== */
function initTypewriterScrambler() {
  const target = document.getElementById('scramble-text');
  if (!target) return;

  const roles = [
    'Creative Developer',
    'UI/UX Designer',
    'Interactive Architect',
    'Problem Solver'
  ];

  let currentRoleIdx = 0;
  const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';
  
  // Scramble math logic
  class TextScrambler {
    constructor(el) {
      this.el = el;
      this.chars = scrambleChars;
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => this.resolve = resolve);
      this.queue = [];
      
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end, char: '' });
      }
      
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;
      
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="glow-text">${char}</span>`;
        } else {
          output += from;
        }
      }
      
      this.el.innerHTML = output;
      
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  const scrambler = new TextScrambler(target);

  // Interval loop
  const cycleText = () => {
    scrambler.setText(roles[currentRoleIdx]).then(() => {
      setTimeout(() => {
        currentRoleIdx = (currentRoleIdx + 1) % roles.length;
        cycleText();
      }, 3000); // Hold role static on screen
    });
  };
  
  cycleText();
}

/* ==========================================================================
   4. 3D CARD TILT ENGINE
   ========================================================================== */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.skill-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside element
      const y = e.clientY - rect.top;  // y coordinate inside element
      
      // Calculate rotation angles based on cursor offset
      const rotateX = -((y - rect.height / 2) / rect.height) * 20; // Max 20 degrees
      const rotateY = ((x - rect.width / 2) / rect.width) * 20;

      // Apply style transform matrix
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      
      // Dynamic cursor glare overlay spotlight
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(130, 87, 229, 0.15) 0%, rgba(255, 255, 255, 0.03) 70%)`;
      card.style.borderColor = 'rgba(0, 242, 254, 0.35)';
    });

    card.addEventListener('mouseleave', () => {
      // Return cards safely to rest
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.background = '';
      card.style.borderColor = '';
    });
  });
}

/* ==========================================================================
   5. SCROLL REVEAL OBSERVERS & NAVBAR STICKY
   ========================================================================== */
function initScrollReveal() {
  // Reveal animations on scroll
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Custom progression indicator logic for progress bars
        const skillFills = entry.target.querySelectorAll('.skill-progress-fill');
        if (skillFills.length > 0) {
          skillFills.forEach(fill => {
            const progress = fill.getAttribute('data-level');
            fill.style.width = `${progress}%`;
          });
        }
        
        // Once visible, no need to keep checking
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15, // Trigger when 15% of element is visible
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(r => revealObserver.observe(r));

  // Navbar background change on scroll
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section, hero');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active navigation links highlighted dynamically on scroll position
    let currentActive = '';
    sections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secHeight = sec.clientHeight;
      if (window.scrollY >= (secTop - 250)) {
        currentActive = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentActive}`) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Hamburger menu toggle
  const burger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-links');

  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close mobile drawer on navigation link clicks
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   6. PROJECTS FILTER & GLASSMORPHIC DETAIL MODALS
   ========================================================================== */
function initProjectsFilterAndModals() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const modalOverlay = document.getElementById('project-modal');
  const modalClose = document.querySelector('.modal-close-btn');

  // Custom Projects details dictionary database
  const projectDatabase = {
    'ai-nexus': {
      title: 'AI Nexus Analytics',
      desc: 'AI Nexus Analytics is a state-of-the-art predictive SaaS dashboard designed to assist organizations in monitoring machine learning telemetry. It features a complete serverless backend pipeline running lightweight clustering algorithms alongside interactive canvas reporting widgets.',
      client: 'Synthetix Inc',
      date: 'Dec 2025',
      techs: ['HTML5', 'Vanilla CSS3', 'JavaScript', 'ChartJS', 'TensorFlow.js'],
      liveLink: '#',
      codeLink: '#',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
    },
    'hyper-mesh': {
      title: 'HyperMesh E-Commerce Hub',
      desc: 'HyperMesh transforms digital marketplaces with highly scalable client engines, modular shopping grids, and seamless dynamic styling variables. Complete with glassmorphic dashboards that adapt based on browser profiles.',
      client: 'HyperMesh Global',
      date: 'Feb 2026',
      techs: ['HTML5', 'CSS Variables', 'JS ES6', 'Stripe API'],
      liveLink: '#',
      codeLink: '#',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
    },
    'crypta': {
      title: 'Crypta Visual Ledger',
      desc: 'An beautiful dark-mode interactive ledger that allows users to audit virtual coin transactions. Built using vanilla JS WebSockets for constant price changes and CSS custom animations to visualize network node movements.',
      client: 'DeFi Labs',
      date: 'Oct 2025',
      techs: ['HTML5', 'CSS Grid', 'WebSockets', 'Canvas API'],
      liveLink: '#',
      codeLink: '#',
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=800&q=80'
    },
    'prism': {
      title: 'Prism Creative Agency Portfolio',
      desc: 'Prism is an experimental aesthetic web portfolio designed for multimedia agencies. Built utilizing custom physics-based scroll triggers, rich full-bleed color panels, and dynamic typography to capture organic movements.',
      client: 'Prism Studios',
      date: 'Jan 2026',
      techs: ['HTML5', 'CSS Flexbox', 'Interactions API', 'SVG Filters'],
      liveLink: '#',
      codeLink: '#',
      image: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80'
    },
    'stellar-os': {
      title: 'Stellar Simulation OS',
      desc: 'A full browser-based mini simulator representing a stellar planetary ecosystem. Users can spawn customizable planets, set masses, and watch gravity orbits calculate in real time via high-performance Canvas equations.',
      client: 'Astro Research',
      date: 'Mar 2026',
      techs: ['Canvas 2D', 'Physics Engines', 'MathJS', 'Vanilla JS'],
      liveLink: '#',
      codeLink: '#',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
    },
    'pulse': {
      title: 'Pulse Audio Synthesizer',
      desc: 'An web-based audio keyboard synthesizer that enables users to record loops and render real-time waveforms using custom CSS frequency animations. Uses modern HTML5 Web Audio components.',
      client: 'SoundLab Group',
      date: 'Nov 2025',
      techs: ['Web Audio API', 'HTML5', 'CSS Animations', 'Modern JS'],
      liveLink: '#',
      codeLink: '#',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    }
  };

  // 1. Grid Filtering Mechanism
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active classes
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterType = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');

        if (filterType === 'all' || categories.includes(filterType)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // 2. Modals Detail Binding
  const openModal = (projKey) => {
    const data = projectDatabase[projKey];
    if (!data) return;

    // Populate modal components
    document.getElementById('modal-img').src = data.image;
    document.getElementById('modal-title').innerText = data.title;
    document.getElementById('modal-desc').innerText = data.desc;
    document.getElementById('modal-client').innerText = data.client;
    document.getElementById('modal-date').innerText = data.date;
    
    // Tech tags
    const tagsWrapper = document.getElementById('modal-tags');
    tagsWrapper.innerHTML = '';
    data.techs.forEach(t => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'project-tag';
      tagSpan.innerText = t;
      tagsWrapper.appendChild(tagSpan);
    });

    // Links
    document.getElementById('modal-live-btn').href = data.liveLink;
    document.getElementById('modal-code-btn').href = data.codeLink;

    // Open Overlay
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  };

  const closeModal = () => {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = ''; // Unlock scroll
  };

  // Wire cards click events
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent double triggers if custom tags are clicked
      if (e.target.closest('.project-link')) return;
      
      const key = card.getAttribute('data-project');
      openModal(key);
    });
  });

  // Close triggers
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Escape key support to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ==========================================================================
   7. INTERACTIVE CONTACT FORM GLOW FEEDBACK
   ========================================================================== */
function initContactFormFeedback() {
  const form = document.getElementById('contact-form');
  const feedbackMsg = document.getElementById('form-feedback');

  if (!form || !feedbackMsg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit-btn');
    const originalText = submitBtn.innerText;
    
    // Add glowing mock loading state
    submitBtn.disabled = true;
    submitBtn.innerText = 'Transmitting...';
    submitBtn.style.opacity = '0.7';

    // Simulated API timeout
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
      submitBtn.style.opacity = '1';

      // Simple mock validations
      const emailInput = form.querySelector('#email');
      if (emailInput && !emailInput.value.includes('@')) {
        feedbackMsg.className = 'form-feedback error';
        feedbackMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Transmission failed. Check your coordinates (email address).';
        return;
      }

      // Success
      feedbackMsg.className = 'form-feedback success';
      feedbackMsg.innerHTML = '<i class="fas fa-check-circle"></i> Message transmitted successfully into deep space! I\'ll reply shortly.';
      form.reset();

      // Clear feedback message automatically after 5 seconds
      setTimeout(() => {
        feedbackMsg.className = 'form-feedback';
        feedbackMsg.innerHTML = '';
      }, 5000);

    }, 1800);
  });
}

/* ==========================================================================
   8. PROFILE STATUS TEXT AUTO-ROTATOR
   ========================================================================== */
function initProfileStatusRotator() {
  const statusEl = document.getElementById('status-text');
  if (!statusEl) return;

  const statuses = [
    'Designing Web Physics',
    'Coding 3D Interfaces',
    'Analyzing Telemetry Systems',
    'Synthesizing Layout Particles'
  ];

  let currentIdx = 0;

  setInterval(() => {
    currentIdx = (currentIdx + 1) % statuses.length;
    
    // Smoothly fade out, change text, and fade in
    statusEl.style.opacity = '0';
    statusEl.style.transition = 'opacity 0.4s ease';
    
    setTimeout(() => {
      statusEl.innerText = `Currently: ${statuses[currentIdx]}`;
      statusEl.style.opacity = '1';
    }, 400);
  }, 4000);
}
