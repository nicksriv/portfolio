async function loadResume() {
  let data;
  try {
    const inline = document.getElementById('resume-data');
    if (inline && inline.textContent.trim()) {
      data = JSON.parse(inline.textContent);
    }
  } catch (e) {
    console.warn('Failed to parse inline resume JSON, will fetch data.json', e);
  }
  if (!data) {
    const response = await fetch('data.json', { cache: 'no-cache' });
    data = await response.json();
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
        a.href = src;
        a.target = '_blank';
        a.rel = 'noopener';
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

  const certEl = document.getElementById('certifications');
  (data.certificates || data.certifications || []).forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.name}${c.issuer ? ' — ' + c.issuer : ''}`;
    certEl.appendChild(li);
  });

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
