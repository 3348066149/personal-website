/**
 * ============================================================
 *  前端主脚本 - public/js/main.js
 *  功能：控制页面交互效果（导航、动画、筛选、弹窗等）
 *  学习重点：DOM 操作、事件监听、IntersectionObserver
 * ============================================================
 *
 *  【页面加载完成后再执行】
 *  DOMContentLoaded 事件在 HTML 解析完成后触发，
 *  确保所有元素都在 DOM 中，可以安全地操作它们。
 */

document.addEventListener('DOMContentLoaded', function() {

  // ============================================================
  //  1. 页面加载器（Loader）
  //  功能：打开页面时显示加载动画，2.5秒后自动隐藏
  // ============================================================

  // Force scroll to top on refresh（刷新时强制回到顶部）
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const loader = document.getElementById('pageLoader');
  if (loader) {
    // 2.5秒后隐藏加载动画
    setTimeout(function() {
      loader.classList.add('hidden');
    }, 2500);
    // 保险：4秒后强制隐藏（防止加载动画卡住）
    setTimeout(function() {
      if (!loader.classList.contains('hidden')) loader.classList.add('hidden');
    }, 4000);
  }

  // ============================================================
  //  2. 暗黑模式切换（Theme Toggle）
  //  功能：点击按钮切换日间/夜间模式，并记住用户的选择
  // ============================================================

  const themeToggle = document.getElementById('themeToggle');
  // 从 localStorage 读取上次的主题设置，没有则默认 light
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeToggle) {
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    themeToggle.addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);  // 记住选择，刷新页面后不丢失
      this.innerHTML = next === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
  }

  // ============================================================
  //  3. 滚动动画（AOS - Animate On Scroll）
  //  功能：页面元素在滚动到视口时播放淡入动画
  // ============================================================

  AOS.init({
    duration: 800,   // 动画持续 0.8 秒
    once: true,      // 动画只播放一次
    offset: 80,      // 触发动画的偏移量
    easing: 'ease-out-cubic',
  });

  // ============================================================
  //  4. 导航栏效果（Navbar）
  //  功能：滚动时导航栏背景变得半透明
  // ============================================================

  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    // 滚动超过 50px 时给导航栏添加 "scrolled" 类
    navbar.classList.toggle('scrolled', currentScroll > 50);
    lastScroll = currentScroll;
  });

  // ============================================================
  //  5. 移动端菜单（Mobile Nav）
  //  功能：在小屏幕设备上点击汉堡图标展开/收起菜单
  // ============================================================

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle) {
    navToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // 点击导航链接后自动关闭菜单
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // ============================================================
  //  6. 返回顶部按钮（Back to Top）
  //  功能：滚动超过 500px 时显示按钮，点击回到顶部
  // ============================================================

  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.pageYOffset > 500);
    });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  //  7. 统计数字动画（Stats Counter）
  //  功能：当统计区域进入视口时，数字从 0 递增到目标值
  //  学习重点：IntersectionObserver（监听元素是否可见）
  // ============================================================

  const statNumbers = document.querySelectorAll('.stat-number');
  const observerOptions = { threshold: 0.5 };  // 当元素 50% 可见时触发

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count) || 0;
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);  // 动画完成后停止监听
      }
    });
  }, observerOptions);

  statNumbers.forEach(el => observer.observe(el));

  /** 数字递增动画 */
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

  // ============================================================
  //  8. 项目分类筛选 + 分页
  //  功能：点击分类按钮筛选项目，每页显示 9 个
  //  学习重点：数组过滤、DOM 显示隐藏、分页算法
  // ============================================================

  const filterBtns = document.querySelectorAll('.filter-btn');
  var PER_PAGE = 9;          // 每页显示 9 个项目
  var currentFilterCategory = 'all';  // 当前选中的分类（默认全部）
  var currentPage = 1;       // 当前页码

  const projectsGrid = document.getElementById('projectsGrid');
  const pagination = document.getElementById('pagination');

  /**
   * 获取符合当前分类筛选条件的卡片
   * 从所有 .project-card 中选出 data-category 匹配的
   */
  function getFilteredCards() {
    var cards = [];
    projectsGrid.querySelectorAll('.project-card').forEach(function(card) {
      if (currentFilterCategory === 'all' || card.dataset.category === currentFilterCategory) {
        cards.push(card);
      }
    });
    return cards;
  }

  /**
   * 更新项目卡片的显示状态和分页按钮
   * 步骤：
   *   1. 隐藏所有卡片
   *   2. 显示当前分类 + 当前页的卡片
   *   3. 生成分页按钮
   */
  function updateProjectCards() {
    // 第1步：先把所有卡片隐藏（解决切换分类时残留显示的问题）
    projectsGrid.querySelectorAll('.project-card').forEach(function(card) {
      card.style.display = 'none';
    });

    var filtered = getFilteredCards();
    var totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    // 第2步：只显示当前页的卡片
    filtered.forEach(function(card, i) {
      var pageIndex = Math.floor(i / PER_PAGE) + 1;
      if (pageIndex === currentPage) {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
    });

    // 如果只有一页，不显示分页按钮
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    // 第3步：生成分页按钮
    var html = '<button class="page-btn page-prev" data-page="prev"><i class="fas fa-chevron-left"></i></button>';
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="page-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    html += '<button class="page-btn page-next" data-page="next"><i class="fas fa-chevron-right"></i></button>';
    pagination.innerHTML = html;
  }

  // 【核心】点击分类按钮时的处理
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      currentFilterCategory = this.dataset.category;  // 更新当前分类
      currentPage = 1;                                 // 重置到第一页
      updateProjectCards();                            // 刷新显示
    });
  });

  // 页面加载时初始化分页
  updateProjectCards();

  // 【事件委托】点击分页按钮翻页
  // 事件委托：在父元素上监听，通过 e.target 判断实际点击的是谁
  pagination.addEventListener('click', function(e) {
    var btn = e.target.closest('.page-btn');
    if (!btn) return;
    var target = btn.dataset.page;
    if (target === 'prev') {
      if (currentPage > 1) currentPage--;
    } else if (target === 'next') {
      var total = Math.max(1, Math.ceil(getFilteredCards().length / PER_PAGE));
      if (currentPage < total) currentPage++;
    } else {
      currentPage = parseInt(target);
    }
    updateProjectCards();
    // 翻页后自动滚动到项目区域
    document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ============================================================
  //  9. 精选项目轮播（Featured Carousel）
  //  功能：左右滑动展示精选项目
  //  学习重点：CSS transform 实现轮播效果
  // ============================================================

  const featuredCarousel = document.getElementById('featuredCarousel');
  const featuredPrev = document.getElementById('featuredPrev');
  const featuredNext = document.getElementById('featuredNext');
  const featuredDots = document.getElementById('featuredDots');

  if (featuredCarousel) {
    const container = featuredCarousel.parentElement;  // 可视容器
    const PER_PAGE = 3;                                // 每页显示 3 个
    let currentPage = 0;

    featuredCarousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    function getTotalPages() {
      const cards = featuredCarousel.querySelectorAll('.featured-card');
      return Math.max(1, Math.ceil(cards.length / PER_PAGE));
    }

    function goToPage(page) {
      const total = getTotalPages();
      currentPage = Math.max(0, Math.min(page, total - 1));
      // 核心：通过 transform: translateX() 实现滑动
      featuredCarousel.style.transform = 'translateX(' + (-currentPage * container.offsetWidth) + 'px)';
      featuredPrev.disabled = currentPage === 0;
      featuredNext.disabled = currentPage >= total - 1;

      // 生成导航小圆点
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

  // ============================================================
  //  10. 项目弹窗（Modal）
  //  功能：点击项目卡片时弹出详情窗口
  //  学习重点：动态更新 DOM 内容
  // ============================================================

  /**
   * 更新弹窗中的链接按钮（演示、源码、下载、视频）
   * 如果项目没有某个链接，对应的按钮就隐藏
   */
  updateModalLinks = function(project) {
    const sourceLink = document.getElementById('modalSourceLink');
    const downloadLink = document.getElementById('modalDownloadLink');
    const videoLink = document.getElementById('modalVideoLink');

    // 源码链接按钮：有 source_url 就显示
    if (project.source_url) {
      sourceLink.style.display = 'inline-flex';
      sourceLink.href = project.source_url;
    } else {
      sourceLink.style.display = 'none';
    }

    // 下载按钮：有本地文件就显示
    if (project.local_file_path) {
      downloadLink.style.display = 'inline-flex';
      downloadLink.href = '/api/download/' + project.id;
    } else {
      downloadLink.style.display = 'none';
    }

    if (project.video_link) {
      videoLink.style.display = 'inline-flex';
      videoLink.href = project.video_link;
    } else {
      videoLink.style.display = 'none';
    }
  };

  /** 打开项目详情弹窗 */
  window.openProjectModal = function(project) {
    if (typeof project === 'string') project = JSON.parse(project);
    const modal = document.getElementById('projectModal');
    const cover = document.getElementById('modalCover');
    const category = document.getElementById('modalCategory');
    const title = document.getElementById('modalTitle');
    const description = document.getElementById('modalDescription');
    const date = document.getElementById('modalDate');
    const tech = document.getElementById('modalTech');

    // 设置封面图
    cover.src = project.cover_image || '/images/placeholder-' + project.category + '.jpg';
    cover.onerror = function() {
      this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><rect fill="%23e2e8f0" width="400" height="250"/><text x="200" y="125" text-anchor="middle" fill="%2394a3b8" font-size="20" font-family="sans-serif">' + project.title + '</text></svg>';
    };

    category.textContent = project.category_label || project.category;
    category.className = 'category-badge category-' + project.category;

    title.textContent = project.title;
    description.textContent = project.description || '暂无描述';

    // 技术栈（如果有就显示，没有就隐藏）
    if (project.tech_stack) {
      tech.parentElement.style.display = 'flex';
      tech.textContent = project.tech_stack;
    } else {
      tech.parentElement.style.display = 'none';
    }

    // 完成日期（如果有就显示）
    if (project.completion_date) {
      date.parentElement.style.display = 'flex';
      date.textContent = project.completion_date;
    } else {
      date.parentElement.style.display = 'none';
    }

    updateModalLinks(project);

    // 显示弹窗
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';  // 防止弹窗时页面滚动
  };

  /** 关闭项目详情弹窗 */
  window.closeProjectModal = function() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // 按 Escape 键关闭弹窗
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeWechatModal();
    }
  });

  // ============================================================
  //  11. 微信二维码弹窗
  //  功能：点击微信图标弹出二维码
  // ============================================================

  const wechatBtns = document.querySelectorAll('#wechatBtn, .wechat-contact-btn');
  if (wechatBtns.length > 0) {
    wechatBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const modal = document.getElementById('wechatModal');
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  }

  window.closeWechatModal = function() {
    const modal = document.getElementById('wechatModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
});
