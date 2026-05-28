
import React, { useEffect, useRef, useState } from 'react';
import profilePhoto from './assets/photo.png'
import resumeFile from './assets/resume.pdf'

export default function App() {
  const [photo, setPhoto] = useState(profilePhoto);
  const [statusIdx, setStatusIdx] = useState(0);

  const statusWords = [
    'Open to Internships or Full-time',
    'Seeking AIML Roles',
    'Building Cool Things with AI',
    "Let's Collaborate!",
  ];

  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const followerRef = useRef(null);
  const fileInputRef = useRef(null);
  const mousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // Status Word Rotator
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statusWords.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Enhanced Canvas — mouse-reactive particles, cyan/teal palette
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const hueOptions = [185, 190, 195, 200, 175, 178, 165, 42, 46];
    const particles = Array.from({ length: 120 }, () => {
      const bvx = (Math.random() - 0.5) * 0.38;
      const bvy = (Math.random() - 0.5) * 0.38;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: bvx, vy: bvy, baseVx: bvx, baseVy: bvy,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.45 + 0.1,
        hue: hueOptions[Math.floor(Math.random() * hueOptions.length)],
      };
    });

    const orbs = [
      { px: 0.15, py: 0.18, r: 240, hue: 195, sx: 0.28, sy: 0.22, amp: 0.06 },
      { px: 0.82, py: 0.12, r: 180, hue: 44,  sx: 0.38, sy: 0.32, amp: 0.07 },
      { px: 0.5,  py: 0.55, r: 280, hue: 180, sx: 0.22, sy: 0.18, amp: 0.05 },
      { px: 0.1,  py: 0.78, r: 160, hue: 162, sx: 0.45, sy: 0.4,  amp: 0.07 },
      { px: 0.88, py: 0.7,  r: 200, hue: 200, sx: 0.32, sy: 0.28, amp: 0.06 },
    ];

    let t = 0;
    let rafId;

    const renderLoop = () => {
      t += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Orbs
      orbs.forEach((o) => {
        const ox = o.px * width  + Math.sin(t * o.sx) * o.amp * width;
        const oy = o.py * height + Math.cos(t * o.sy) * o.amp * height;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, `hsla(${o.hue},80%,60%,0.07)`);
        g.addColorStop(1, `hsla(${o.hue},80%,60%,0)`);
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      const { x: mx, y: my } = mousePosRef.current;

      // Particles
      particles.forEach((p) => {
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 100 && dist > 0) {
          const f = (100 - dist) / 100;
          p.vx += (dx / dist) * f * 0.18;
          p.vy += (dy / dist) * f * 0.18;
        }
        p.vx += (p.baseVx - p.vx) * 0.04;
        p.vy += (p.baseVy - p.vy) * 0.04;
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 2) { p.vx *= 2 / speed; p.vy *= 2 / speed; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},85%,65%,${p.alpha})`;
        ctx.fill();
      });

      // Connections
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dist = Math.hypot(particles[a].x - particles[b].x, particles[a].y - particles[b].y);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(0,180,216,${(1 - dist / 115) * 0.13})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Elastic cursor follower
  useEffect(() => {
    const cur = cursorRef.current;
    const ctr = followerRef.current;
    if (!cur || !ctr) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; cur.style.left = `${mx}px`; cur.style.top = `${my}px`; };
    window.addEventListener('mousemove', onMove);
    let rafId;
    const tick = () => {
      cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14;
      ctr.style.left = `${cx}px`; ctr.style.top = `${cy}px`;
      rafId = requestAnimationFrame(tick);
    };
    tick();
    const onOver = (e) => { if (e.target.closest('a,button,input,textarea,.proj,.sk-chip,.photo-frame')) { document.body.style.cursor = 'pointer'; cur.style.display = 'none'; ctr.style.display = 'none'; } };
    const onOut  = (e) => { if (e.target.closest('a,button,input,textarea,.proj,.sk-chip,.photo-frame')) { document.body.style.cursor = 'none'; cur.style.display = ''; ctr.style.display = ''; } };
    document.body.addEventListener('mouseover', onOver);
    document.body.addEventListener('mouseout',  onOut);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); document.body.removeEventListener('mouseover', onOver); document.body.removeEventListener('mouseout', onOut); };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const ob = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('vis')), { threshold: 0.08 });
    document.querySelectorAll('.fu').forEach((el) => ob.observe(el));
    return () => document.querySelectorAll('.fu').forEach((el) => ob.unobserve(el));
  }, []);

  // Sticky nav
  useEffect(() => {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3D Card tilt
  const handleTilt = (e) => {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    card.style.setProperty('--rx', `${(y - 0.5) * -8}deg`);
    card.style.setProperty('--ry', `${(x - 0.5) *  8}deg`);
  };
  const resetTilt = (e) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const techs = ['Python','React','Machine Learning','Node.js','TensorFlow','C','DSA','SQL','Docker','Git','Kubernetes','NLP','Deep Learning','RAG','MCP','LangChain'];

  return (
    <>
      <canvas ref={canvasRef} id="bg-canvas"></canvas>
      <div ref={cursorRef} id="cur"></div>
      <div ref={followerRef} id="ctr"></div>

      {/* ── NAV ── */}
      <nav id="nav">
        <a className="nav-logo" href="#">SD<span>.</span></a>
        <div className="nav-links">
          <a className="nav-link" href="#about">About</a>
          <a className="nav-link" href="#skills">Skills</a>
          <a className="nav-link" href="#projects">Projects</a>
          <a className="nav-link" href="#contact">Contact</a>
          <a className="nav-resume" href={resumeFile} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Resume
          </a>
        </div>
      </nav>

      <div className="wrap">
        {/* ── HERO ── */}
        <section className="hero">
          <div className="fu vis">
            <p className="hero-eyebrow">
              <span className="eyebrow-line"></span>
              Creative Developer &amp; AIML Researcher
            </p>
            <h1 className="hero-name">Sai<br /><em>Deepak</em></h1>
            <div className="hero-role">
              <div className="live-dot"></div>
              <span>Currently — <b>{statusWords[statusIdx]}</b></span>
            </div>
          </div>

          <div className="hero-profile fu vis" style={{ transitionDelay: '.12s' }} id="about">
            <div className="photo-frame" onClick={() => fileInputRef.current.click()}>
              {!photo ? (
                <div className="ph-pl">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                  <span>photo.png</span>
                </div>
              ) : (
                <img src={photo} alt="Profile photo" />
              )}
              <div className="ph-ov">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span>Upload photo</span>
              </div>
              <div className="pc tl"></div><div className="pc tr"></div>
              <div className="pc bl"></div><div className="pc br"></div>
            </div>
            <input type="file" ref={fileInputRef} id="photo-input" onChange={handlePhotoChange} accept="image/*" />

            <div className="hero-bio-col">
              <p className="hero-quote">"I build things that matter — from ML models to full-stack apps. Passionate about solving real-world problems with clean, thoughtful code."</p>
              <p className="hero-sub">B.Tech Electronics &amp; Communication Engineering · IIITDM Kancheepuram<br />Focus: Artificial Intelligence , Machine Learning &amp; Full stack Development</p>
              <div className="hero-tags">
                <span className="tag green">Open to Work</span>
              </div>
            </div>
          </div>

          {/* Resume strip */}
          <div className="resume-strip fu vis" style={{ transitionDelay: '.22s' }}>
            <div className="resume-strip-text">
              <div className="resume-strip-label">Resume</div>
              <div className="resume-strip-name">Saideepak — B.Tech ECE, IIITDM Kancheepuram</div>
            </div>
            <div className="resume-actions">
              <a className="res-btn ghost" href={resumeFile} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                View
              </a>
              <a className="res-btn primary" href={resumeFile} target="_blank" rel="noopener noreferrer" download>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download
              </a>
            </div>
          </div>

          {/* Marquee */}
          <div className="mq-wrap fu vis" style={{ transitionDelay: '.3s' }}>
            <div className="mq">
              {[...techs, ...techs].map((t, i) => (
                <span key={i} className="mqi"><span>✦</span>{t}</span>
              ))}
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── EDUCATION ── */}
        <div className="section fu">
          <p className="sec-eyebrow">01 — Education</p>
          <h2 className="sec-title">Where I <em>studied</em></h2>

          {[
            { deg: 'B.Tech — Electronics and Communication Engineering', yr: '2022 – 2026', school: 'Indian Institute of Information Technology Design and Manufacturing (IIITDM), Kancheepuram' },
            { deg: 'Class XII — Science (PCM)', yr: '2020 – 2022', school: 'Narayana Junior College, Gudur · State Board' },
            { deg: 'Class X', yr: '2019 – 2020', school: 'Sri Chaitanya EM School, Gudur · State Board' },
          ].map((e) => (
            <div className="edu-card" key={e.yr}>
              <div className="edu-top">
                <div className="edu-deg">{e.deg}</div>
                <span className="edu-yr">{e.yr}</span>
              </div>
              <div className="edu-school">{e.school}</div>
            </div>
          ))}
        </div>

        <hr className="divider" />

        {/* ── PROJECTS ── */}
        <div className="section fu" id="projects">
          <p className="sec-eyebrow">02 — Projects</p>
          <h2 className="sec-title">Things I've <em>built</em></h2>

          {[
            {
              meta: '· AI · Deep Learning · Machine Learning',
              title: 'Fake News Detection Using NLP and BERT',
              slug: 'fake-news-detection',
              githubUrl:"https://github.com/Saideepak2004/fake-news-detection-using-the-NLP-and-BERT.git",
              desc: 'Developed a fake news detection system using Natural Language Processing (NLP) techniques to classify news articles as real or fake. Implemented BERT for contextual text understanding and improved classification accuracy.',
              pills: ['Python', 'PyTorch', 'NLP', 'Transformers', 'BERT'],
            },
            {
              meta: '· Deep Learning',
              title: 'Bitcoin Price Prediction',
              slug: 'bitcoin-price-prediction',
              githubUrl:"https://github.com/Saideepak2004/Bitcoin-price-prediction.git",
              desc: 'Developed an LSTM-based deep learning model to predict Bitcoin prices from historical time-series data, outperforming traditional regression on volatile trends.',
              pills: ['Python', 'PyTorch', 'Pandas'],
            },
            {
              meta: '· AI · Computer Vision',
              title: 'Music Genre Classification using Neural Networks',
              slug: 'music-genre-classification',
              githubUrl:"https://github.com/Saideepak2004/Music-genre-classification.git",
              desc: 'Developed a neural network model to classify music genres based on audio features, achieving high accuracy in distinguishing between different musical styles.',
              pills: ['Python', 'TensorFlow', 'Librosa'],
            },
          ].map((p) => (
            <div className="proj" key={p.slug} onMouseMove={handleTilt} onMouseLeave={resetTilt}>
              <div className="proj-glow"></div>
              <div className="proj-meta">{p.meta}</div>
              <div className="proj-head">
                <div className="proj-title">{p.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a className="proj-github" href={p.githubUrl} target="_blank" rel="noopener noreferrer">{p.slug}</a>
                  <span className="proj-arrow">↗</span>
                </div>
              </div>
              <div className="proj-desc">{p.desc}</div>
              <div className="proj-pills">
                {p.pills.map((pill) => <span className="proj-pill" key={pill}>{pill}</span>)}
              </div>
            </div>
          ))}
        </div>

        <hr className="divider" />

        {/* ── EXPERIENCE ── */}
        <div className="section fu">
          <p className="sec-eyebrow">03 — Experience</p>
          <h2 className="sec-title">Where I've <em>worked</em></h2>
          <div style={{ paddingTop: '6px' }}>
            <div className="exp-item">
              <div className="exp-top">
                <div className="exp-role">AIML Intern</div>
                <span className="exp-period">May – Jul 2025</span>
              </div>
              <div className="exp-co">Nokia Networks and Solutions · Chennai</div>
              <ul className="exp-bullets">
                <li>Designed and implemented a real-time predictive maintenance system for screw-tightening operations.</li>
                <li>Built a real-time screw testing tool using Python, Tkinter, and MySQL.</li>
                <li>Predicted torque and angle ranges with Random Forest Regression.</li>
                <li>Shifted to online learning using River for dynamic updates. Designed a GUI to classify screws as Pass/Fail.</li>
              </ul>
              <div className="exp-tags">
                <span className="tag muted">Python</span>
                <span className="tag muted">SQL</span>
                <span className="tag muted">Tkinter</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* ── SKILLS ── */}
        <div className="section fu" id="skills">
          <p className="sec-eyebrow">04 — Skills</p>
          <h2 className="sec-title">Tools of my <em>trade</em></h2>

          <div className="sk-group sk-lang">
            <div className="sk-group-title">Languages</div>
            <div className="sk-chips">
              {[['🐍','Python'],['⚡','C'],['🟨','JavaScript'],['🗄️','SQL'],['🖥️','YAML']].map(([icon,name]) => (
                <div className="sk-chip" key={name}><span className="sk-icon">{icon}</span><span className="sk-name">{name}</span></div>
              ))}
            </div>
          </div>

          <div className="sk-group sk-fw">
            <div className="sk-group-title">Frameworks &amp; Libraries</div>
            <div className="sk-chips">
              {[['🧠','TensorFlow'],['🔥','PyTorch'],['🤗','HuggingFace'],['⚛️','React'],['▲','Next.js'],['🚀','FastAPI'],['🟢','Node.js'],['🍃','Express']].map(([icon,name]) => (
                <div className="sk-chip" key={name}><span className="sk-icon">{icon}</span><span className="sk-name">{name}</span></div>
              ))}
            </div>
          </div>

          <div className="sk-group sk-tools">
            <div className="sk-group-title">Tools &amp; Platforms</div>
            <div className="sk-chips">
              {[['🐙','Git / GitHub'],['🐳','Docker'],['☸️','Kubernetes']].map(([icon,name]) => (
                <div className="sk-chip" key={name}><span className="sk-icon">{icon}</span><span className="sk-name">{name}</span></div>
              ))}
            </div>
          </div>

          <div className="sk-group sk-cs">
            <div className="sk-group-title">CS Fundamentals</div>
            <div className="sk-chips">
              {[['🌳','Data Structures'],['🔁','Algorithms'],['🏗️','System Design'],['🗃️','DBMS'],['💻','OS'],['🌐','Networks'],['🧠','Machine Learning'],['🤖','Deep Learning'],['💬','NLP']].map(([icon,name]) => (
                <div className="sk-chip" key={name}><span className="sk-icon">{icon}</span><span className="sk-name">{name}</span></div>
              ))}
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* ── CERTIFICATIONS ── */}
        <div className="section fu">
          <p className="sec-eyebrow">Certifications</p>
          <h3 className="cert-section-title">Selected <em>certifications</em></h3>
          <div className="cert-grid">
            <div className="cert">
              <div className="cert-ico">🧠</div>
              <div>
                <div className="cert-name">Supervised Machine Learning: Regression &amp; Classification</div>
                <div className="cert-by">deeplearning.ai · Coursera · 2025</div>
              </div>
            </div>
            <div className="cert">
              <div className="cert-ico">🔐</div>
              <div>
                <div className="cert-name">Ethical Hacking</div>
                <div className="cert-by">NPTEL</div>
              </div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* ── CONTACT ── */}
        <div className="section fu" id="contact">
          <p className="sec-eyebrow">05 — Contact</p>
          <h2 className="sec-title">Let's <em>connect</em></h2>
          <p className="contact-intro">Open to internships, research collaborations, and ambitious side projects. I reply within 24 hours — don't be a stranger.</p>
          {[
            ['Mail', 'mailto:saideepak0608@gmail.com'],
            ['LinkedIn', 'https://www.linkedin.com/in/saideepakmunjuluru/'],
            ['GitHub', 'https://github.com/Saideepak2004'],
          ].map(([label, val]) => (
            <a href={val} className="c-link" key={label} target="_blank" rel="noopener noreferrer">
              <span>{label} — {val}</span>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M1 13L13 1M13 1H5M13 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          ))}
        </div>

        <footer>
          <p>© 2026 saideepak · IIITDM Kancheepuram</p>
          <p>Built from scratch · All vibes intact</p>
        </footer>
      </div>
    </>
  );
}







