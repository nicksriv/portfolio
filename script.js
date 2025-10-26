async function loadResume() {
  console.log('loadResume function called');
  let data;
  try {
    const inline = document.getElementById('resume-data');
    console.log('Inline element found:', inline);
    if (inline && inline.textContent.trim()) {
      data = JSON.parse(inline.textContent);
      console.log('Parsed inline data:', data);
    }
  } catch (e) {
    console.warn('Failed to parse inline resume JSON, will fetch data.json', e);
  }
  if (!data) {
    console.log('No inline data, fetching data.json');
    const response = await fetch('data.json', { cache: 'no-cache' });
    data = await response.json();
    console.log('Fetched data.json:', data);
  }

  const avatar = document.getElementById('avatar');
  const nameEl = document.getElementById('name');
  const taglineEl = document.getElementById('tagline');
  const emailEl = document.getElementById('email');
  const phoneEl = document.getElementById('phone');
  const locationEl = document.getElementById('location');
  const linksEl = document.getElementById('links');

  if (data.basics?.image) avatar.src = data.basics.image;
  nameEl.textContent = data.basics?.name ?? 'Your Name';
  taglineEl.textContent = data.basics?.label ?? '';

  if (data.basics?.email) {
    emailEl.href = `mailto:${data.basics.email}`;
    emailEl.textContent = data.basics.email;
  } else emailEl.remove();

  if (data.basics?.phone) {
    phoneEl.href = `tel:${data.basics.phone}`;
    phoneEl.textContent = data.basics.phone;
  } else phoneEl.remove();

  if (data.basics?.location?.city || data.basics?.location?.region) {
    locationEl.href = '#';
    locationEl.textContent = [data.basics.location.city, data.basics.location.region].filter(Boolean).join(', ');
  } else locationEl.remove();

  if (Array.isArray(data.basics?.profiles)) {
    data.basics.profiles.forEach(p => {
      const a = document.createElement('a');
      a.href = p.url || '#';
      a.textContent = p.network ? `${p.network}` : (p.username || 'Profile');
      a.target = '_blank';
      linksEl.appendChild(a);
    });
  }

  document.getElementById('summary').textContent = data.summary ?? data.basics?.summary ?? '';

  const skillsEl = document.getElementById('skills');
  (data.skills || []).forEach(s => {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = s.name || s;
    skillsEl.appendChild(span);
  });

  const expEl = document.getElementById('experience');
  (data.work || data.experience || []).forEach(job => {
    const div = document.createElement('div');
    div.className = 'entry';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${job.position || ''} • ${job.name || job.company || ''}`.replace(/ \u2022 $/, '');
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = [job.startDate, job.endDate || 'Present', job.location].filter(Boolean).join('  ·  ');

    div.appendChild(title);
    div.appendChild(sub);

    const bullets = document.createElement('ul');
    bullets.className = 'bullets';
    (job.highlights || job.summary?.split('\n') || []).forEach(b => {
      const li = document.createElement('li');
      li.textContent = b;
      bullets.appendChild(li);
    });
    if (bullets.children.length) div.appendChild(bullets);
    expEl.appendChild(div);
  });

  const projEl = document.getElementById('projects');
  (data.projects || []).forEach(p => {
    const div = document.createElement('div');
    div.className = 'entry';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = p.name || 'Project';
    if (p.url) {
      const a = document.createElement('a');
      a.href = p.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = ` — ${p.url}`;
      title.appendChild(a);
    }

    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = [
      p.roles?.join(', '),
      p.startDate && (p.endDate || 'Present') ? `${p.startDate} – ${p.endDate || 'Present'}` : null
    ].filter(Boolean).join('  ·  ');

    div.appendChild(title);
    if (sub.textContent) div.appendChild(sub);

    const bullets = document.createElement('ul');
    bullets.className = 'bullets';
    const bulletItems = p.highlights || (p.summary ? [p.summary] : []);
    bulletItems.forEach(b => {
      const li = document.createElement('li');
      li.textContent = b;
      bullets.appendChild(li);
    });
    if (bullets.children.length) div.appendChild(bullets);

    if (Array.isArray(p.images) && p.images.length) {
      const gallery = document.createElement('div');
      gallery.className = 'screenshots';
      p.images.forEach((src, idx) => {
        const a = document.createElement('a');
        a.href = '#';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          showImageModal(src, `${p.name || 'Project'} screenshot ${idx + 1}`);
        });
        const img = document.createElement('img');
        img.src = src;
        img.alt = `${p.name || 'Project'} screenshot ${idx + 1}`;
        a.appendChild(img);
        gallery.appendChild(a);
      });
      div.appendChild(gallery);
    }

    projEl.appendChild(div);
  });

  // Industries chips
  const industriesEl = document.getElementById('industries');
  if (industriesEl && Array.isArray(data.industries)) {
    data.industries.forEach(name => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = name;
      industriesEl.appendChild(span);
    });
  } else {
    const section = document.getElementById('industries-section');
    if (section) section.remove();
  }

  // Project types chips
  const projectTypesEl = document.getElementById('project-types');
  if (projectTypesEl && Array.isArray(data.projectTypes)) {
    data.projectTypes.forEach(name => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = name;
      projectTypesEl.appendChild(span);
    });
  } else {
    const section = document.getElementById('project-types-section');
    if (section) section.remove();
  }

  const eduEl = document.getElementById('education');
  (data.education || []).forEach(e => {
    const div = document.createElement('div');
    div.className = 'entry';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `${e.institution} • ${e.studyType || ''} ${e.area || ''}`;
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = [e.startDate, e.endDate, e.score].filter(Boolean).join('  ·  ');
    div.appendChild(title);
    if (sub.textContent) div.appendChild(sub);
    eduEl.appendChild(div);
  });

  // Handle certifications - populate the certifications grid
  const certGrid = document.querySelector('.certifications-grid');
  console.log('Certifications grid found:', certGrid);
  console.log('Certificates data:', data.certificates);
  
  if (certGrid && Array.isArray(data.certificates)) {
    // Clear existing hardcoded certifications
    certGrid.innerHTML = '';
    console.log('Cleared certifications grid, adding', data.certificates.length, 'certifications');
    
    data.certificates.forEach((cert, index) => {
      const certCard = document.createElement('div');
      certCard.className = `certification-card fade-in-up${index > 0 ? ` delay-${index}` : ''}`;
      
      // Determine icon based on certification name
      let iconClass = 'fas fa-certificate'; // default icon
      if (cert.name.toLowerCase().includes('aws')) {
        iconClass = 'fab fa-aws';
      } else if (cert.name.toLowerCase().includes('azure') || cert.name.toLowerCase().includes('microsoft')) {
        iconClass = 'fab fa-microsoft';
      } else if (cert.name.toLowerCase().includes('security') || cert.name.toLowerCase().includes('cism')) {
        iconClass = 'fas fa-shield-alt';
      } else if (cert.name.toLowerCase().includes('project') || cert.name.toLowerCase().includes('pmp')) {
        iconClass = 'fas fa-project-diagram';
      } else if (cert.name.toLowerCase().includes('kellogg') || cert.name.toLowerCase().includes('executive') || cert.name.toLowerCase().includes('chief product officer')) {
        iconClass = 'fas fa-graduation-cap';
      } else if (cert.name.toLowerCase().includes('mit') || cert.name.toLowerCase().includes('technology leadership') || cert.name.toLowerCase().includes('innovation')) {
        iconClass = 'fas fa-lightbulb';
      }
      
      // Determine logo path based on issuer
      let logoPath = '';
      if (cert.issuer && cert.issuer.toLowerCase().includes('kellogg')) {
        logoPath = 'logos/kellogg.png';
      } else if (cert.issuer && cert.issuer.toLowerCase().includes('mit')) {
        logoPath = 'logos/mit-xpro.png';
      }

      certCard.innerHTML = `
        <div class="certification-header">
          <div class="certification-logo">
            ${logoPath ? `<img src="${logoPath}" alt="${cert.issuer} Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
            <i class="${iconClass}" style="${logoPath ? 'display: none;' : ''}"></i>
          </div>
          <div class="certification-info">
            <div class="certification-name">${cert.name}</div>
            <div class="certification-issuer">${cert.issuer || ''}</div>
            <div class="certification-date">${cert.date || ''}</div>
          </div>
        </div>
      `;
      
      certGrid.appendChild(certCard);
    });
    console.log('Finished adding certifications to grid');
  } else {
    console.log('Certifications grid not found or no certificates data');
  }

  const awardsEl = document.getElementById('awards');
  (data.awards || []).forEach(a => {
    const li = document.createElement('li');
    li.textContent = `${a.title}${a.awarder ? ' — ' + a.awarder : ''}`;
    awardsEl.appendChild(li);
  });

  const pubEl = document.getElementById('publications');
  (data.publications || []).forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name}${p.publisher ? ' — ' + p.publisher : ''}`;
    pubEl.appendChild(li);
  });

  const downloadBtn = document.getElementById('download');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.location.href = 'NikhilSrivastava_Resume_Ver6.pdf';
    });
  }
}

loadResume().catch(err => {
  console.error(err);
  document.getElementById('summary').textContent = 'Failed to load resume data. Please check data.json.';
});

function showImageModal(src, alt) {
  // Create modal elements
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    cursor: pointer;
  `;
  
  const modalImg = document.createElement('img');
  modalImg.src = src;
  modalImg.alt = alt;
  modalImg.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
  `;
  
  const closeBtn = document.createElement('div');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    color: white;
    font-size: 30px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1001;
  `;
  
  // Add event listeners
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === closeBtn) {
      document.body.removeChild(modal);
    }
  });
  
  // Add elements to modal
  modal.appendChild(modalImg);
  modal.appendChild(closeBtn);
  
  // Add modal to body
  document.body.appendChild(modal);
}
