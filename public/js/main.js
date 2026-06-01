// ===== Main Frontend JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
  // Force scroll to top on refresh
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // Page loader
  const loader = document.getElementById('pageLoader');
  if (loader) {
    setTimeout(function() {
      loader.classList.add('hidden');
    }, 2300);
  }

  // Dark mode
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    themeToggle.addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      this.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
  }

  // Initialize AOS
  AOS.init({
    duration: 800,
    once: true,
    offset: 80,
    easing: 'ease-out-cubic',
  });

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    navbar.classList.toggle('scrolled', currentScroll > 50);
    lastScroll = currentScroll;
  });

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Close nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.pageYOffset > 500);
    });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Stats counter animation
  const statNumbers = document.querySelectorAll('.stat-number');
  const observerOptions = { threshold: 0.5 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count) || 0;
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  statNumbers.forEach(el => observer.observe(el));

  function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = current;
    }, 30);
  }

  // Project filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const category = this.dataset.category;

      projectCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Featured carousel
  const featuredCarousel = document.getElementById('featuredCarousel');
  const featuredPrev = document.getElementById('featuredPrev');
  const featuredNext = document.getElementById('featuredNext');
  const featuredDots = document.getElementById('featuredDots');

  if (featuredCarousel) {
    const container = featuredCarousel.parentElement;
    const PER_PAGE = 3;
    let currentPage = 0;

    featuredCarousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    function getTotalPages() {
      const cards = featuredCarousel.querySelectorAll('.featured-card');
      return Math.max(1, Math.ceil(cards.length / PER_PAGE));
    }

    function goToPage(page) {
      const total = getTotalPages();
      currentPage = Math.max(0, Math.min(page, total - 1));
      featuredCarousel.style.transform = 'translateX(' + (-currentPage * container.offsetWidth) + 'px)';
      featuredPrev.disabled = currentPage === 0;
      featuredNext.disabled = currentPage >= total - 1;

      featuredDots.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === currentPage ? ' active' : '');
        dot.addEventListener('click', () => goToPage(i));
        featuredDots.appendChild(dot);
      }
    }

    featuredPrev.addEventListener('click', () => goToPage(currentPage - 1));
    featuredNext.addEventListener('click', () => goToPage(currentPage + 1));

    window.addEventListener('resize', () => goToPage(currentPage));
    goToPage(0);
  }

  // Modal functionality
  updateModalLinks = function(project) {
    const demoLink = document.getElementById('modalDemoLink');
    const codeLink = document.getElementById('modalCodeLink');
    const downloadLink = document.getElementById('modalDownloadLink');
    const videoLink = document.getElementById('modalVideoLink');

    // Demo
    if (project.demo_link) {
      demoLink.style.display = 'inline-flex';
      demoLink.href = project.demo_link;
    } else {
      demoLink.style.display = 'none';
    }

    // Code/GitHub
    if (project.code_link) {
      codeLink.style.display = 'inline-flex';
      codeLink.href = project.code_link;
    } else {
      codeLink.style.display = 'none';
    }

    // Download
    if (project.source_type === 'local' || project.source_type === 'both') {
      downloadLink.style.display = 'inline-flex';
      downloadLink.href = '/api/download/' + project.id;
    } else if (project.source_url) {
      downloadLink.style.display = 'inline-flex';
      downloadLink.href = project.source_url;
      downloadLink.innerHTML = '<i class="fas fa-external-link-alt"></i> 下载';
    } else {
      downloadLink.style.display = 'none';
    }

    // Video
    if (project.video_link) {
      videoLink.style.display = 'inline-flex';
      videoLink.href = project.video_link;
    } else {
      videoLink.style.display = 'none';
    }
  };

  window.openProjectModal = function(project) {
    if (typeof project === 'string') project = JSON.parse(project);
    const modal = document.getElementById('projectModal');
    const cover = document.getElementById('modalCover');
    const category = document.getElementById('modalCategory');
    const title = document.getElementById('modalTitle');
    const description = document.getElementById('modalDescription');
    const date = document.getElementById('modalDate');
    const tech = document.getElementById('modalTech');

    // Set content
    cover.src = project.cover_image || '/images/placeholder-' + project.category + '.jpg';
    cover.onerror = function() {
      this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><rect fill="%23e2e8f0" width="400" height="250"/><text x="200" y="125" text-anchor="middle" fill="%2394a3b8" font-size="20" font-family="sans-serif">' + project.title + '</text></svg>';
    };

    const categoryLabels = { ai: 'AI 项目', unity: 'Unity 项目', comprehensive: '综合项目' };
    category.textContent = categoryLabels[project.category] || project.category;
    category.className = 'category-badge category-' + project.category;

    title.textContent = project.title;
    description.textContent = project.description || '暂无描述';

    // Tech stack
    if (project.tech_stack) {
      tech.parentElement.style.display = 'flex';
      tech.textContent = project.tech_stack;
    } else {
      tech.parentElement.style.display = 'none';
    }

    // Date
    if (project.completion_date) {
      date.parentElement.style.display = 'flex';
      date.textContent = project.completion_date;
    } else {
      date.parentElement.style.display = 'none';
    }

    // Update action buttons
    updateModalLinks(project);

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeProjectModal = function() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeProjectModal();
  });
});
