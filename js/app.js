/**
 * RMHome Rayong (สร้างบ้านระยอง)
 * Interactive Application Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initHeroSlider();
  initHouseFilter();
  initCalculator();
  initHouseModal();
  initContactForm();
  initMobileMenu();
  initScrollTop();
  initSnowEffect();
  initHoppingSnowman();
  initScrollReveal();
  trackAnalytics();
  initDynamicCMSContent();
});

/* ---------------------------------------------------------
   1. Sticky Header & Scroll Effects
   --------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ---------------------------------------------------------
   1.1 Hero Banner Interactive Slider (Swipe / Arrow / Auto)
   --------------------------------------------------------- */
function initHeroSlider() {
  const slider = document.getElementById('heroSlider');
  const track = document.getElementById('heroSliderTrack');
  const prevBtn = document.getElementById('heroSlidePrev');
  const nextBtn = document.getElementById('heroSlideNext');
  const dots = document.querySelectorAll('#heroSliderDots .slider-dot');
  const heroSection = document.getElementById('home');
  const badgeEl = document.getElementById('slideIndicatorBadge');

  if (!slider || !track) return;

  const slides = track.querySelectorAll('.hero-slide');
  const totalSlides = slides.length;
  if (totalSlides <= 1) return;

  let currentSlide = 0;
  let autoSlideTimer = null;
  let startX = 0;
  let isDragging = false;

  function goToSlide(index) {
    if (index < 0) {
      currentSlide = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }

    track.style.transition = 'transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)';
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });

    // Update slide state class on hero section
    if (heroSection) {
      heroSection.classList.toggle('slide-2-active', currentSlide === 1);
    }

    // Update indicator badge
    if (badgeEl) {
      badgeEl.innerHTML = currentSlide === 0
        ? '🎄 1/2 RMHome Villa'
        : '✨ 2/2 NewJeans Edition';
    }

    restartAutoSlide();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      goToSlide(idx);
    });
  });

  // Mobile Touch Swipe Handling
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAutoSlide();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide(); // Swipe left -> go right/next
      } else {
        prevSlide(); // Swipe right -> go left/prev
      }
    } else {
      restartAutoSlide();
    }
  });

  // Desktop Mouse Drag Handling
  let mouseStartX = 0;
  let isMouseDown = false;

  slider.addEventListener('mousedown', (e) => {
    if (e.target.closest('button, a, input, select, textarea')) return;
    isMouseDown = true;
    mouseStartX = e.clientX;
    stopAutoSlide();
  });

  window.addEventListener('mouseup', (e) => {
    if (!isMouseDown) return;
    isMouseDown = false;
    const diff = mouseStartX - e.clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) nextSlide();
      else prevSlide();
    } else {
      restartAutoSlide();
    }
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (window.scrollY < 550) {
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
    }
  });

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      nextSlide();
    }, 7000);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  function restartAutoSlide() {
    startAutoSlide();
  }

  slider.addEventListener('mouseenter', stopAutoSlide);
  slider.addEventListener('mouseleave', startAutoSlide);

  startAutoSlide();
}

/* ---------------------------------------------------------
   2. House Models & Portfolio Dynamic System (บ้านอบอุ่นที่เรามอบให้คุณ)
   --------------------------------------------------------- */
const DEFAULT_PORTFOLIO_HOUSES = [
  {
    id: 'house_nordic_01',
    title: 'RM-Nordic Grand',
    category: 'นอร์ดิก',
    categorySlug: 'nordic',
    budget: '3.89 ล้านบาท',
    type: 'แบบบ้าน (ยังไม่สร้าง)',
    area: '245',
    floors: '2',
    bedrooms: '3',
    bathrooms: '4',
    parking: '2 (EV)',
    location: 'อ.เมืองระยอง จ.ระยอง',
    cover: 'assets/images/house-nordic.jpg',
    gallery: ['assets/images/house-nordic.jpg', 'assets/images/luxury-interior.jpg'],
    description: 'แบบบ้านสไตล์นอร์ดิกกลิ่นอายสแกนดิเนเวียน ดีไซน์หลังคาจั่วสูงโปร่ง โอ่โถง พร้อมกระจกบานใหญ่รับแสงธรรมชาติและวิวสวน เหมาะสำหรับครอบครัวคนรุ่นใหม่ในระยองที่ต้องการความสงบ อบอุ่น และฟังก์ชันครบครัน',
    features: [
      'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
      'หลังคา SCG Shingle Roof พร้อมฉนวนกันความร้อน Stay Cool 3 นิ้ว',
      'กระจกเขียวตัดแสงหนา 6 มม. กรอบอะลูมิเนียมเกรดพรีเมียม Powder Coat',
      'สุขภัณฑ์ Cotto / American Standard ประหยัดน้ำระดับพรีเมียม',
      'ระบบไฟฟ้ารองรับ EV Charger และ Smart Home Control',
      'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_mansion_02',
    title: 'RM-Mansion Elite',
    category: 'โมเดิร์นคฤหาสน์',
    categorySlug: 'mansion',
    budget: '6.95 ล้านบาท',
    type: 'แบบบ้าน (ยังไม่สร้าง)',
    area: '380',
    floors: '2',
    bedrooms: '4',
    bathrooms: '5',
    parking: '3',
    location: 'อ.บ้านฉาง จ.ระยอง',
    cover: 'assets/images/house-mansion.jpg',
    gallery: ['assets/images/house-mansion.jpg', 'assets/images/luxury-interior.jpg'],
    description: 'คฤหาสน์หรูระดับ High-End โดดเด่นด้วย Façade หินอ่อนและเส้นสายสีทองแชมเปญ โถง Double Volume สูง 6.5 เมตร พร้อมระเบียง Sky Terrace ชั้นบน ตอบโจทย์การใช้ชีวิตเหนือระดับในระยอง',
    features: [
      'ฐานรากตอกเสาเข็มลึกถึงชั้นดินดาน วิศวกรสามัญเซ็นรับรองทุกจุด',
      'ผนังอิฐมวลเบา Q-CON ป้องกันเสียงและความร้อน 2 ชั้น',
      'โถง Living Room เพดานสูง Double Volume โปร่งโล่งสง่างาม',
      'ระบบ Smart Home ควบคุมไฟ แอร์ และความปลอดภัยผ่านสมาร์ตโฟน',
      'สุขภัณฑ์อัตโนมัติ TOTO Neorest ในห้อง Master Bedroom',
      'ฟรี จัดสวน Landscape สไตล์ Modern Luxury รอบบ้าน'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_tropical_03',
    title: 'RM-Tropical Pool Villa',
    category: 'พูลวิลล่า',
    categorySlug: 'tropical',
    budget: '4.95 ล้านบาท',
    type: 'ผลงานสร้างเสร็จแล้ว',
    area: '290',
    floors: '1',
    bedrooms: '3',
    bathrooms: '3',
    parking: '2',
    location: 'อ.แกลง จ.ระยอง',
    cover: 'assets/images/house-tropical.jpg',
    gallery: ['assets/images/house-tropical.jpg', 'assets/images/luxury-interior.jpg'],
    description: 'บ้านพักตากอากาศสไตล์โมเดิร์นทรอปิคอล พร้อมสระว่ายน้ำระบบเกลือในตัว ออกแบบระแนงไม้ธรรมชาติช่วยกรองแสงแดดเมืองระยอง ทุกห้องนอนเชื่อมต่อสู่สระว่ายน้ำได้โดยตรง เหมาะสำหรับอยู่อาศัยหรือปล่อยเช่าพูลวิลล่า',
    features: [
      'สระว่ายน้ำระบบเกลือ Overflow ขนาด 3.5 x 8 เมตร พร้อมระบบไฟ LED ใต้น้ำ',
      'พื้นระเบียงไม้เทียม WPC เกรดพรีเมียม ทนแดด ทนฝน ไม่ผุกร่อน',
      'ดีไซน์เชื่อมต่อ Indoor-Outdoor ด้วยประตูกระจกบานเลื่อนขนาดยักษ์',
      'ห้องน้ำสไตล์ Semi-Outdoor พร้อมอ่างอาบน้ำสั่งทำพิเศษ',
      'ระบบบำบัดน้ำเสียและระบายน้ำรอบตัวบ้าน ออกแบบป้องกันน้ำท่วมขัง',
      'บริการยื่นขออนุญาตประกอบกิจการวิลล่าตากอากาศให้ครบวงจร'
    ],
    tall: false,
    createdAt: '2026-11-01'
  }
];

function getStoredPortfolioForWeb() {
  try {
    const raw = localStorage.getItem('rm_portfolio_items');
    if (!raw) {
      localStorage.setItem('rm_portfolio_items', JSON.stringify(DEFAULT_PORTFOLIO_HOUSES));
      return DEFAULT_PORTFOLIO_HOUSES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_portfolio_items', JSON.stringify(DEFAULT_PORTFOLIO_HOUSES));
      return DEFAULT_PORTFOLIO_HOUSES;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_PORTFOLIO_HOUSES;
  }
}

let activeHouseFilter = 'all';

function renderHouseGrid() {
  const container = document.getElementById('houseGridContainer');
  if (!container) return;

  const houses = getStoredPortfolioForWeb();
  container.innerHTML = '';

  houses.forEach((item) => {
    const card = document.createElement('article');
    card.className = `house-card ${item.tall ? 'tall-card' : ''}`;
    card.setAttribute('data-category', item.categorySlug || 'modern');
    card.setAttribute('data-id', item.id);

    const priceText = item.budget.includes('ล้าน') ? item.budget : `${item.budget} ล้านบาท`;

    card.innerHTML = `
      <div class="house-img-wrap">
        <img src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.src='assets/images/house-nordic.jpg'">
        <span class="house-tag-badge has-ribbon">${item.type || 'แบบบ้าน'}</span>
      </div>
      <div class="house-body">
        <span class="house-meta-code">SERIES: ${(item.category || 'MODERN').toUpperCase()}</span>
        <h3 class="house-name">${item.title}</h3>
        <div class="house-specs-list">
          <div class="spec-pill">
            <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            <span>${item.area} ตร.ม.</span>
          </div>
          <div class="spec-pill">
            <svg viewBox="0 0 24 24"><path d="M19.5 4H4.5A2.5 2.5 0 0 0 2 6.5v11A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 19.5 4zm-7 3a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm-4.5 10a1.5 1.5 0 0 1-1.5-1.5V14h7v1.5a1.5 1.5 0 0 1-1.5 1.5h-4z"/></svg>
            <span>${item.bedrooms} ห้องนอน</span>
          </div>
          <div class="spec-pill">
            <svg viewBox="0 0 24 24"><path d="M20 13V4.83C20 3.27 18.73 2 17.17 2c-.75 0-1.47.3-2 .83l-1.25 1.25c-.16-.05-.33-.08-.51-.08h-2.82c-.18 0-.35.03-.51.08L8.83 2.83C8.3 2.3 7.58 2 6.83 2 5.27 2 4 3.27 4 4.83V13H2v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6h-2z"/></svg>
            <span>${item.bathrooms} ห้องน้ำ</span>
          </div>
          <div class="spec-pill">
            <svg viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
            <span>${item.parking} ที่จอดรถ</span>
          </div>
        </div>
        <div class="house-footer">
          <div class="house-price-block">
            <span class="price-label">ราคาเริ่มต้นพร้อมสร้าง</span>
            <span class="price-val">฿ ${priceText}</span>
          </div>
          <button class="btn btn-outline-gold btn-view-house" data-house-id="${item.id}">
            ดูสเปก & แปลน
          </button>
        </div>
      </div>
    `;

    // Click handler for modal
    const viewBtn = card.querySelector('.btn-view-house');
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openHouseModalById(item.id);
      });
    }

    container.appendChild(card);
  });

  applyCurrentFilter();
}

function applyCurrentFilter() {
  const houseCards = document.querySelectorAll('#houseGridContainer .house-card');
  houseCards.forEach(card => {
    const cardCategory = card.getAttribute('data-category') || '';
    if (activeHouseFilter === 'all' || cardCategory === activeHouseFilter || cardCategory.includes(activeHouseFilter)) {
      card.style.display = 'flex';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    } else {
      card.style.display = 'none';
      card.style.opacity = '0';
    }
  });
}

function initHouseFilter() {
  renderHouseGrid();

  const filterBtns = document.querySelectorAll('.filter-bar .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeHouseFilter = btn.getAttribute('data-filter') || 'all';
      applyCurrentFilter();
    });
  });

  // Real-time synchronization when admin adds/deletes houses in dashboard
  window.addEventListener('storage', (e) => {
    if (e.key === 'rm_portfolio_items') {
      renderHouseGrid();
    }
  });

  window.addEventListener('portfolioUpdated', () => {
    renderHouseGrid();
  });
}

function openHouseModalById(houseId) {
  const modalBackdrop = document.getElementById('houseDetailModal');
  const modalContent = document.getElementById('modalDynamicContent');
  if (!modalBackdrop || !modalContent) return;

  const houses = getStoredPortfolioForWeb();
  const house = houses.find(h => h.id === houseId) || houses[0];
  if (!house) return;

  const priceFormatted = house.budget.includes('ล้าน') ? house.budget : `${house.budget} ล้านบาท`;
  const gallery = house.gallery && house.gallery.length > 0 ? house.gallery : [house.cover];
  const features = house.features && house.features.length > 0 ? house.features : [
    'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
    'ควบคุมงานก่อสร้างโดยทีมวิศวกร กว. ทุกขั้นตอน',
    'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
  ];

  let galleryThumbsHtml = '';
  if (gallery.length > 1) {
    galleryThumbsHtml = `
      <div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap;">
        ${gallery.map((imgUrl, i) => `
          <img src="${imgUrl}" class="modal-gallery-thumb" data-src="${imgUrl}" style="width:75px; height:50px; object-fit:cover; border-radius:6px; cursor:pointer; border:2px solid ${i === 0 ? 'var(--color-gold-400)' : 'rgba(255,255,255,0.2)'};" alt="thumb ${i + 1}">
        `).join('')}
      </div>
    `;
  }

  modalContent.innerHTML = `
    <div style="margin-bottom: 1.25rem; border-radius: 14px; overflow: hidden; height: 320px; border: 1px solid rgba(212,175,55,0.3); background:#051d14;">
      <img id="modalMainCoverImg" src="${house.cover}" alt="${house.title}" style="width:100%; height:100%; object-fit:cover; transition:opacity 0.2s;">
    </div>
    ${galleryThumbsHtml}
    
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-top:1.25rem; margin-bottom:1rem;">
      <div>
        <span style="color:var(--color-gold-400); font-family:var(--font-serif); font-size:0.85rem; letter-spacing:1px;">
          หมวดหมู่: ${house.category || 'โมเดิร์น'} • ${house.type || 'แบบบ้าน'}
        </span>
        <h2 style="font-size:1.6rem; color:#fff; font-weight:700; margin-top:0.25rem;">${house.title}</h2>
        <span style="font-size:0.85rem; color:#94a3b8;">📍 ทำเล: ${house.location || 'จ.ระยอง'}</span>
      </div>
      <div style="text-align:right;">
        <span style="font-size:0.8rem; color:var(--text-muted); display:block;">ราคาเริ่มต้นพร้อมก่อสร้าง</span>
        <span style="font-size:1.6rem; font-weight:700; color:var(--color-gold-300); font-family:var(--font-serif);">฿ ${priceFormatted}</span>
      </div>
    </div>
    
    <p style="color:var(--text-muted); line-height:1.7; margin-bottom:1.5rem; font-size:0.95rem;">${house.description}</p>
    
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:0.75rem; background:rgba(7,31,22,0.8); border:1px solid rgba(212,175,55,0.2); border-radius:12px; padding:1rem; margin-bottom:1.5rem; text-align:center;">
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim);">พื้นที่ใช้สอย</div>
        <strong style="font-size:0.95rem; color:#fff;">${house.area} ตร.ม.</strong>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim);">ห้องนอน</div>
        <strong style="font-size:0.95rem; color:#fff;">${house.bedrooms} ห้อง</strong>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim);">ห้องน้ำ</div>
        <strong style="font-size:0.95rem; color:#fff;">${house.bathrooms} ห้อง</strong>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim);">ที่จอดรถ</div>
        <strong style="font-size:0.95rem; color:#fff;">${house.parking} คัน</strong>
      </div>
    </div>

    <h4 style="color:var(--color-gold-400); font-size:1.1rem; margin-bottom:0.75rem;">จุดเด่น & สเปกมาตรฐาน RMHome:</h4>
    <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:2rem;">
      ${features.map(f => `<li style="font-size:0.9rem; color:var(--text-main); display:flex; align-items:flex-start; gap:0.5rem;"><span style="color:var(--color-gold-400);">✦</span> ${f}</li>`).join('')}
    </ul>

    <div style="display:flex; gap:1rem; justify-content:flex-end; flex-wrap:wrap;">
      <button class="btn btn-outline-gold" id="btnModalCloseSecondary">ปิดหน้าต่าง</button>
      <a href="#contact" class="btn btn-gold" onclick="selectHouseToConsult('${house.title}')">ปรึกษาสร้างแบบนี้กับวิศวกร</a>
    </div>
  `;

  // Setup gallery thumbnail click to change main cover
  const thumbs = modalContent.querySelectorAll('.modal-gallery-thumb');
  const mainCover = modalContent.getElementById('modalMainCoverImg');
  thumbs.forEach(t => {
    t.addEventListener('click', () => {
      thumbs.forEach(other => other.style.border = '2px solid rgba(255,255,255,0.2)');
      t.style.border = '2px solid var(--color-gold-400)';
      if (mainCover) mainCover.src = t.getAttribute('data-src');
    });
  });

  const secondaryClose = modalContent.querySelector('#btnModalCloseSecondary');
  if (secondaryClose) {
    secondaryClose.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function initHouseModal() {
  const modalBackdrop = document.getElementById('houseDetailModal');
  const closeBtn = document.getElementById('closeModalBtn');

  if (!modalBackdrop) return;

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  window.closeModal = closeModal;

  window.selectHouseToConsult = function(houseTitle) {
    closeModal();
    const msgInput = document.getElementById('formMessage');
    if (msgInput) {
      msgInput.value = `สนใจสร้างแบบบ้าน "${houseTitle}" ต้องการปรึกษาเรื่องแปลงที่ดินและขอรับสเปกวัสดุอย่างละเอียด`;
    }
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ---------------------------------------------------------
   3. Interactive Budget Calculator
   --------------------------------------------------------- */
function initCalculator() {
  const areaSlider = document.getElementById('calcAreaSlider');
  const areaDisplay = document.getElementById('calcAreaDisplay');
  const specOptions = document.querySelectorAll('.spec-option-card');
  const poolCheckbox = document.getElementById('optPool');
  const smartCheckbox = document.getElementById('optSmart');
  const interiorCheckbox = document.getElementById('optInterior');
  const totalPriceDisplay = document.getElementById('calcTotalPrice');
  const monthlyEstDisplay = document.getElementById('calcMonthlyEst');
  const bookEstimateBtn = document.getElementById('btnBookEstimate');

  let currentRate = 18500; // Default: Luxury Gold

  // Handle spec card selection
  specOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      specOptions.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      currentRate = parseInt(opt.getAttribute('data-rate'), 10);
      updateCalculation();
    });
  });

  // Slider change with festive sparkle fireworks (ลูกอม & โบว์)
  if (areaSlider && areaDisplay) {
    let lastSparkleTime = 0;

    areaSlider.addEventListener('input', (e) => {
      areaDisplay.textContent = `${e.target.value} ตร.ม.`;
      updateCalculation();

      // Trigger sparkle fireworks (ลูกอม & โบว์)
      const now = Date.now();
      if (now - lastSparkleTime > 55) {
        triggerSliderSparkles(areaSlider);
        lastSparkleTime = now;
      }
    });

    areaSlider.addEventListener('change', () => {
      triggerSliderSparkles(areaSlider, 4);
    });
  }

  // Checkboxes change
  [poolCheckbox, smartCheckbox, interiorCheckbox].forEach(cb => {
    if (cb) cb.addEventListener('change', updateCalculation);
  });

  function updateCalculation() {
    const area = parseInt(areaSlider.value, 10);
    let basePrice = area * currentRate;

    // Additional options
    if (poolCheckbox && poolCheckbox.checked) basePrice += 450000;
    if (smartCheckbox && smartCheckbox.checked) basePrice += 220000;
    if (interiorCheckbox && interiorCheckbox.checked) basePrice += (area * 3500);

    // Format millions or thousands in Thai Baht
    const millions = (basePrice / 1000000).toFixed(2);
    totalPriceDisplay.textContent = `฿ ${millions} ล้านบาท`;

    // Monthly installment estimate (Approx 30 yrs @ 4.8% per month ~ 5,200 per million)
    const monthlyRatePerMillion = 5240;
    const estimatedMonthly = Math.round((basePrice / 1000000) * monthlyRatePerMillion);
    monthlyEstDisplay.textContent = `${estimatedMonthly.toLocaleString('th-TH')} บาท/เดือน`;
  }

  // Pre-fill contact form on clicking estimate
  if (bookEstimateBtn) {
    bookEstimateBtn.addEventListener('click', () => {
      const area = areaSlider.value;
      const budgetText = totalPriceDisplay.textContent;
      const contactSection = document.getElementById('contact');
      const budgetInput = document.getElementById('formBudget');
      const msgInput = document.getElementById('formMessage');

      if (budgetInput) {
        budgetInput.value = budgetText;
      }
      if (msgInput) {
        msgInput.value = `สนใจสร้างบ้านขนาดพื้นที่ประมาณ ${area} ตร.ม. งบประมาณประเมิน ${budgetText} ขอรับรายละเอียดและปรึกษาวิศวกร`;
      }

      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Initial calculation
  updateCalculation();
}

/* ---------------------------------------------------------
   5. Interactive Contact Form with Validation & Feedback
   --------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('mainContactForm');
  const toast = document.getElementById('toastNotice');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const phone = document.getElementById('formPhone').value.trim();
    const location = document.getElementById('formLocation').value;
    const budgetInput = document.getElementById('formBudget');
    const budget = budgetInput ? budgetInput.value.trim() : 'ไม่ระบุ';
    const messageInput = document.getElementById('formMessage');
    const message = messageInput ? messageInput.value.trim() : 'ไม่มีข้อความเพิ่มเติม';

    if (!name || !phone) {
      showToast('⚠️ กรุณากรอกชื่อและเบอร์โทรศัพท์สำหรับติดต่อกลับ');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ กำลังส่งข้อมูล...';
    submitBtn.disabled = true;

    // Save lead to localStorage for Admin Report
    saveLeadToLocalStorage({
      name,
      phone,
      location,
      budget: budget || 'ตามประเมินหน้างาน',
      message: message || 'สนใจสร้างบ้านกับ RMHome',
      status: 'new'
    });

    // Simulate instant secure processing
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();

      showToast(`✨ ขอบคุณคุณ ${name} ทีมวิศวกร RMHome ระยอง ได้รับข้อมูลแล้ว และจะติดต่อกลับที่ ${phone} ภายใน 24 ชม.`);
    }, 1000);
  });
}

function saveLeadToLocalStorage(newLead) {
  try {
    let leads = [];
    const raw = localStorage.getItem('rm_leads');
    if (raw) {
      try {
        leads = JSON.parse(raw) || [];
      } catch (e) {
        leads = [];
      }
    }
    newLead.id = 'lead_' + Date.now();
    newLead.time = 'เพิ่งส่งเข้ามา';
    newLead.createdAt = new Date().toLocaleString('th-TH');
    leads.unshift(newLead);
    localStorage.setItem('rm_leads', JSON.stringify(leads));
  } catch (err) {
    console.error('Error saving lead:', err);
  }
}

function trackAnalytics() {
  try {
    let views = parseInt(localStorage.getItem('rm_page_views') || '0', 10);
    localStorage.setItem('rm_page_views', (views + 1).toString());

    let sessions = parseInt(localStorage.getItem('rm_sessions') || '0', 10);
    if (!sessionStorage.getItem('rm_visited_session')) {
      sessionStorage.setItem('rm_visited_session', '1');
      localStorage.setItem('rm_sessions', (sessions + 1).toString());
    }
  } catch (e) {
    // Ignore storage errors
  }
}

function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

/* ---------------------------------------------------------
   6. Mobile Nav Menu Toggle
   --------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('mainNavMenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close when clicking nav links
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

/* ---------------------------------------------------------
   7. Scroll to Top
   --------------------------------------------------------- */
function initScrollTop() {
  const scrollTopBtn = document.getElementById('btnScrollTop');

  if (!scrollTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ---------------------------------------------------------
   8. Gentle Background Snow & Subtle Interactive Mouse Trail
   --------------------------------------------------------- */
function initSnowEffect() {
  const canvas = document.getElementById('snowCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  // -------------------------------------------------------------
  // Pre-rendered offscreen Snowflake Crystal Sprites (เกล็ดหิมะ 6 แฉกแท้ๆ แบบเป็นเกล็ด ไม่ใช่วงกลม)
  // -------------------------------------------------------------
  function createSnowflakeSprite(isGold = false, variant = 1) {
    const sprite = document.createElement('canvas');
    const size = 80; // High-DPI 80x80 canvas
    sprite.width = size;
    sprite.height = size;
    const sCtx = sprite.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const r = 30; // Outer radius of arms

    sCtx.save();
    sCtx.translate(cx, cy);

    const mainColor = isGold ? '#ffd700' : '#ffffff';
    const glowColor = isGold ? 'rgba(255, 215, 0, 0.45)' : 'rgba(224, 242, 254, 0.7)';

    sCtx.strokeStyle = mainColor;
    sCtx.fillStyle = mainColor;
    sCtx.lineWidth = 2.2;
    sCtx.lineCap = 'round';
    sCtx.lineJoin = 'round';
    sCtx.shadowBlur = 4;
    sCtx.shadowColor = glowColor;

    if (variant === 1) {
      // Variant 1: Classic 6-Arm Stellar Dendrite (เกล็ดหิมะ 6 กิ่ง มีแขนง V สวยงาม)
      for (let i = 0; i < 6; i++) {
        sCtx.save();
        sCtx.rotate((i * Math.PI) / 3);

        // Main spine arm
        sCtx.beginPath();
        sCtx.moveTo(0, 0);
        sCtx.lineTo(0, -r);
        sCtx.stroke();

        // Outer chevron branches
        sCtx.beginPath();
        sCtx.moveTo(-8.5, -r * 0.72);
        sCtx.lineTo(0, -r * 0.88);
        sCtx.lineTo(8.5, -r * 0.72);
        sCtx.stroke();

        // Middle chevron branches
        sCtx.beginPath();
        sCtx.moveTo(-6.5, -r * 0.44);
        sCtx.lineTo(0, -r * 0.58);
        sCtx.lineTo(6.5, -r * 0.44);
        sCtx.stroke();

        // Tip crystal diamond
        sCtx.beginPath();
        sCtx.moveTo(0, -r);
        sCtx.lineTo(-2.2, -r + 3.5);
        sCtx.lineTo(0, -r + 6.5);
        sCtx.lineTo(2.2, -r + 3.5);
        sCtx.closePath();
        sCtx.fill();

        sCtx.restore();
      }

      // Center glowing hexagon
      sCtx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        const hx = Math.sin(a) * 6;
        const hy = -Math.cos(a) * 6;
        if (i === 0) sCtx.moveTo(hx, hy);
        else sCtx.lineTo(hx, hy);
      }
      sCtx.closePath();
      sCtx.lineWidth = 1.6;
      sCtx.stroke();

      // Center nucleus dot
      sCtx.beginPath();
      sCtx.arc(0, 0, 2.5, 0, Math.PI * 2);
      sCtx.fill();

    } else {
      // Variant 2: 6-Pointed Star Crystal (เกล็ดหิมะดวงดาว 6 แฉก มีกิ่งกากบาท)
      for (let i = 0; i < 6; i++) {
        sCtx.save();
        sCtx.rotate((i * Math.PI) / 3);

        // Main arm
        sCtx.beginPath();
        sCtx.moveTo(0, 0);
        sCtx.lineTo(0, -r);
        sCtx.stroke();

        // Angled crossbar
        sCtx.beginPath();
        sCtx.moveTo(-7, -r * 0.65);
        sCtx.lineTo(7, -r * 0.65);
        sCtx.stroke();

        // Outer arrow
        sCtx.beginPath();
        sCtx.moveTo(-6, -r * 0.82);
        sCtx.lineTo(0, -r * 0.95);
        sCtx.lineTo(6, -r * 0.82);
        sCtx.stroke();

        // Small circle at tip
        sCtx.beginPath();
        sCtx.arc(0, -r, 2.0, 0, Math.PI * 2);
        sCtx.fill();

        // Secondary alternating star spikes at 30 degrees
        sCtx.rotate(Math.PI / 6);
        sCtx.beginPath();
        sCtx.moveTo(0, 0);
        sCtx.lineTo(0, -r * 0.42);
        sCtx.lineWidth = 1.4;
        sCtx.stroke();
        sCtx.beginPath();
        sCtx.arc(0, -r * 0.42, 1.5, 0, Math.PI * 2);
        sCtx.fill();

        sCtx.restore();
      }

      // Center nucleus dot
      sCtx.beginPath();
      sCtx.arc(0, 0, 3.0, 0, Math.PI * 2);
      sCtx.fill();
    }

    sCtx.restore();
    return sprite;
  }

  const flakeSprites = [
    createSnowflakeSprite(false, 1), // White Dendrite ❄️
    createSnowflakeSprite(false, 2), // White Star ❄️
    createSnowflakeSprite(true, 1),  // Gold Dendrite ❄️
    createSnowflakeSprite(true, 2)   // Gold Star ❄️
  ];

  // Background snowflakes (เกล็ดหิมะ 6 แฉกแท้ๆ โรยน้อยๆ สบายตา ไม่ถี่)
  const bgFlakeCount = Math.min(13, Math.max(7, Math.floor(width / 130)));
  const bgFlakes = [];

  class BgFlake {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -40;
      // Real snowflake crystal size: 18px to 36px diameter (clearly visible hexagonal crystals)
      this.size = Math.random() * 16 + 18;
      this.speedY = Math.random() * 0.35 + 0.28; // gentle slow snowfall drift
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.012 + 0.006;
      this.swayDistance = Math.random() * 1.3 + 0.6;
      
      // Gentle rotation as the crystal falls
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.012;
      
      this.baseAlpha = Math.random() * 0.25 + 0.75; // 0.75 - 1.0 (crisp, clearly visible)
      
      // 15% gold crystals, 85% white crystals
      const isGold = Math.random() < 0.15;
      const variant = Math.random() < 0.5 ? 0 : 1;
      this.sprite = isGold ? (variant === 0 ? flakeSprites[2] : flakeSprites[3]) : flakeSprites[variant];
    }

    update() {
      this.swayAngle += this.swaySpeed;
      this.x += Math.sin(this.swayAngle) * this.swayDistance;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;

      if (this.y > height + 40 || this.x < -40 || this.x > width + 40) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.baseAlpha;
      ctx.drawImage(this.sprite, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  for (let i = 0; i < bgFlakeCount; i++) {
    bgFlakes.push(new BgFlake());
  }

  // Pre-rendered offscreen stocking sprite for crisp high-DPI rendering and 60fps performance
  const stockingSprite = document.createElement('canvas');
  stockingSprite.width = 88;
  stockingSprite.height = 120;
  const sCtx = stockingSprite.getContext('2d');
  sCtx.scale(2, 2);
  
  // Draw stocking on 44x60 canvas coordinates (rendered at 2x resolution)
  sCtx.save();
  // Hanging loop
  sCtx.beginPath();
  sCtx.arc(17, 10, 4, Math.PI, 0);
  sCtx.strokeStyle = '#ffd700';
  sCtx.lineWidth = 1.8;
  sCtx.stroke();

  // Stocking body (Festive Christmas Red)
  sCtx.beginPath();
  sCtx.moveTo(12, 17);
  sCtx.lineTo(12, 38);
  sCtx.bezierCurveTo(12, 49, 24, 52, 31, 46);
  sCtx.bezierCurveTo(36, 41, 33, 35, 25, 35);
  sCtx.lineTo(23, 35);
  sCtx.lineTo(23, 17);
  sCtx.closePath();
  sCtx.fillStyle = '#d90429';
  sCtx.fill();
  sCtx.lineWidth = 1.2;
  sCtx.strokeStyle = '#8b0000';
  sCtx.stroke();

  // Evergreen stripe
  sCtx.fillStyle = '#1b4d3e';
  sCtx.fillRect(12, 24, 11, 4.5);

  // Evergreen toe & heel accents
  sCtx.beginPath();
  sCtx.arc(14, 40, 3.5, 0, Math.PI * 2);
  sCtx.fillStyle = '#1b4d3e';
  sCtx.fill();

  sCtx.beginPath();
  sCtx.arc(28, 42, 3.8, 0, Math.PI * 2);
  sCtx.fillStyle = '#1b4d3e';
  sCtx.fill();

  // White fluffy cuff
  sCtx.beginPath();
  if (sCtx.roundRect) {
    sCtx.roundRect(10, 11, 16, 7.5, 3.5);
  } else {
    sCtx.rect(10, 11, 16, 7.5);
  }
  sCtx.fillStyle = '#ffffff';
  sCtx.fill();
  sCtx.lineWidth = 0.9;
  sCtx.strokeStyle = '#e2e8f0';
  sCtx.stroke();

  // Golden snowflake stitch
  sCtx.strokeStyle = '#ffd700';
  sCtx.lineWidth = 1.2;
  sCtx.beginPath();
  sCtx.moveTo(17, 30); sCtx.lineTo(17, 34);
  sCtx.moveTo(15, 32); sCtx.lineTo(19, 32);
  sCtx.stroke();
  sCtx.restore();

  // Falling Mini Red Christmas Stockings (ถุงเท้าสีแดงร่วงโรยแบบหิมะ ร่วงน้อยๆ ไม่ถี่ สบายตา)
  const stockingCount = Math.min(3, Math.max(2, Math.floor(width / 500)));
  const bgStockings = [];

  class BgStocking {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -45;
      // Size: 32px to 46px tall, clearly visible and festive
      this.height = Math.random() * 14 + 32; // 32px to 46px tall
      this.width = this.height * (44 / 60);  // ~23.5px to 33.7px wide
      this.speedY = Math.random() * 0.38 + 0.28; // gentle slow snowfall drift
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.012 + 0.006;
      this.swayDistance = Math.random() * 1.3 + 0.6;
      this.rotation = (Math.random() - 0.5) * 0.3;
      this.facing = Math.random() < 0.5 ? 1 : -1; // some face left, some right
      this.alpha = Math.random() * 0.15 + 0.85;   // 0.85 - 1.0 (clear festive red)
    }

    update() {
      this.swayAngle += this.swaySpeed;
      this.x += Math.sin(this.swayAngle) * this.swayDistance;
      this.y += this.speedY;
      // Gentle pendulum sway while drifting down
      this.rotation = Math.sin(this.swayAngle) * 0.24;

      if (this.y > height + 45 || this.x < -45 || this.x > width + 45) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      if (this.facing < 0) {
        ctx.scale(-1, 1);
      }
      ctx.globalAlpha = this.alpha;
      ctx.drawImage(stockingSprite, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    }
  }

  for (let i = 0; i < stockingCount; i++) {
    bgStockings.push(new BgStocking());
  }

  // Interactive mouse snow trail particles
  const mouseFlakes = [];
  const maxMouseFlakes = 60;
  let lastMouseX = null;
  let lastMouseY = null;
  let lastMoveTime = 0;

  class MouseFlake {
    constructor(x, y) {
      this.x = x + (Math.random() - 0.5) * 10;
      this.y = y + (Math.random() - 0.5) * 10;
      this.radius = Math.random() * 1.6 + 1.0; // small delicate size
      this.vx = (Math.random() - 0.5) * 1.4;
      this.vy = Math.random() * 0.8 + 0.4; // drifts softly downward
      this.life = 1.0;
      this.decay = Math.random() * 0.025 + 0.018; // smooth gradual fade
      this.isGold = Math.random() < 0.25;
      this.twinkleOffset = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      this.twinkleOffset += 0.1;
    }

    draw() {
      if (this.life <= 0) return;
      const twinkle = Math.sin(this.twinkleOffset) * 0.15;
      const alpha = Math.max(0, Math.min(1, this.life * 0.85 + twinkle));
      const mSize = Math.max(4, this.radius * 3.2 * Math.max(0.3, this.life));

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = alpha;
      ctx.drawImage(this.isGold ? flakeSprites[2] : flakeSprites[0], -mSize / 2, -mSize / 2, mSize, mSize);
      ctx.restore();
    }
  }

  function addMouseParticles(clientX, clientY) {
    const now = performance.now();
    // Throttle slightly (every 25ms) so trail remains light and smooth
    if (now - lastMoveTime < 25) return;
    lastMoveTime = now;

    lastMouseX = clientX;
    lastMouseY = clientY;

    // Emit 2-3 delicate particles per movement
    const count = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < count; i++) {
      if (mouseFlakes.length < maxMouseFlakes) {
        mouseFlakes.push(new MouseFlake(clientX, clientY));
      }
    }
  }

  window.addEventListener('mousemove', (e) => {
    addMouseParticles(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      addMouseParticles(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Animation Loop
  let isRunning = true;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
    } else {
      isRunning = true;
      requestAnimationFrame(animate);
    }
  });

  function animate() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw & update background falling snow
    for (let i = 0; i < bgFlakes.length; i++) {
      bgFlakes[i].update();
      bgFlakes[i].draw();
    }

    // 2. Draw & update background falling mini red stockings (ถุงเท้าสีแดงร่วงโรยแบบหิมะ)
    for (let i = 0; i < bgStockings.length; i++) {
      bgStockings[i].update();
      bgStockings[i].draw();
    }

    // 3. Draw & update mouse trail snowflakes
    for (let i = mouseFlakes.length - 1; i >= 0; i--) {
      const flake = mouseFlakes[i];
      flake.update();
      flake.draw();
      if (flake.life <= 0) {
        mouseFlakes.splice(i, 1);
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/* ---------------------------------------------------------
   Slider Festive Fireworks / Sparkles (ลูกอม & โบว์ ฟุ้งๆ)
   --------------------------------------------------------- */
const SLIDER_SPARKLE_SVGS = [
  // 1. Mini Christmas Ribbon Bow (โบว์ริบบิ้นสีทองแดง 🎀)
  `<svg viewBox="0 0 24 24"><path d="M12 10 C7 4 3 11 11 11 C4 15 8 21 12 13 C16 21 20 15 13 11 C21 11 17 4 12 10 Z" fill="#ffd700" stroke="#d90429" stroke-width="0.9"/><circle cx="12" cy="11" r="2.2" fill="#d90429"/><path d="M10 12 L7 19 M14 12 L17 19" stroke="#ffd700" stroke-width="1.6" stroke-linecap="round"/></svg>`,

  // 2. Mini Wrapped Christmas Candy (ลูกอมห่อโบว์สีแดงขาว 🍬)
  `<svg viewBox="0 0 24 24"><path d="M7 12 L2 8 L2 16 Z" fill="#c9182b"/><path d="M17 12 L22 8 L22 16 Z" fill="#c9182b"/><circle cx="12" cy="12" r="5.5" fill="#ffffff" stroke="#c9182b" stroke-width="1.2"/><path d="M9.5 8 C11 10 11 14 9.5 16" stroke="#c9182b" stroke-width="1.4" fill="none"/><path d="M14.5 8 C13 10 13 14 14.5 16" stroke="#c9182b" stroke-width="1.4" fill="none"/></svg>`,

  // 3. Mini Festive Candy Cane / Spiral Lollipop (อมยิ้มคริสต์มาส 🍭)
  `<svg viewBox="0 0 24 24"><line x1="12" y1="13" x2="12" y2="22" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="8" r="5.5" fill="#c9182b" stroke="#ffd700" stroke-width="1"/><path d="M12 4.5 A 3.5 3.5 0 0 1 15.5 8 A 2 2 0 0 1 13.5 10" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round"/></svg>`,

  // 4. Mini Golden Sparkle Star (ประกายดาวทองพลุ ✨)
  `<svg viewBox="0 0 24 24"><path d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9 Z" fill="#ffd700"/></svg>`
];

function triggerSliderSparkles(slider, customCount) {
  if (!slider) return;

  const rect = slider.getBoundingClientRect();
  const min = parseFloat(slider.min) || 100;
  const max = parseFloat(slider.max) || 600;
  const val = parseFloat(slider.value) || 200;
  const pct = (val - min) / (max - min);

  // Range thumb is 24px wide
  const thumbWidth = 24;
  const availableWidth = rect.width - thumbWidth;
  const startX = rect.left + (thumbWidth / 2) + (pct * availableWidth);
  const startY = rect.top + (rect.height / 2);

  const count = customCount || (Math.floor(Math.random() * 2) + 2); // 2 to 3 particles

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'slider-sparkle';

    // Pick random SVG (candies, bows, stars)
    const svgIndex = Math.floor(Math.random() * SLIDER_SPARKLE_SVGS.length);
    el.innerHTML = SLIDER_SPARKLE_SVGS[svgIndex];

    // Firework burst physics: gentle upward arc
    // Angle: mostly popping upward, left, and right (-165 to -15 degrees)
    const angle = (Math.random() * Math.PI * 0.9) - (Math.PI * 0.95);
    const distance = 26 + Math.random() * 38; // 26px to 64px distance
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - (12 + Math.random() * 16); // upward lift
    const rot = Math.random() * 140 - 70; // rotation
    const duration = 650 + Math.random() * 200; // 650ms - 850ms
    const size = 14 + Math.random() * 5; // 14px - 19px (อันเล็กๆ น่ารัก)

    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${startX - size / 2}px`;
    el.style.top = `${startY - size / 2}px`;
    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.setProperty('--rot', `${rot}deg`);
    el.style.setProperty('--duration', `${duration}ms`);

    document.body.appendChild(el);

    // Clean up
    setTimeout(() => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, duration + 50);
  }
}

/* ---------------------------------------------------------
   Scroll Reveal & Cascade Animations
   (ลูกเล่นเลื่อนหน้าจอ ค่อยๆ เข้ม / สไลด์ข้าง / มาเรียงลำดับ)
   --------------------------------------------------------- */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  // 1. Section Header Elements: ค่อยๆ เข้มและลอยขึ้นนุ่มนวล
  document.querySelectorAll('.section-tag, .section-title, .section-subtitle, .areas-wrap h3, .areas-wrap p').forEach(el => {
    el.classList.add('reveal-init', 'reveal-fade-up');
  });

  // 2. เนื้อหาแบ่ง 2 ฝั่ง ซ้าย-ขวา: โผล่มาจากด้านข้าง
  // เครื่องคิดเลข: สไลเดอร์จากซ้าย, สรุปผลจากขวา
  const calcForm = document.querySelector('.calc-form-side');
  const calcResult = document.querySelector('.calc-result-side');
  if (calcForm) calcForm.classList.add('reveal-init', 'reveal-fade-left');
  if (calcResult) calcResult.classList.add('reveal-init', 'reveal-fade-right');

  // มาตรฐานวิศวกรรม: ภาพวิศวกรจากซ้าย, รายละเอียดและเช็กลิสต์จากขวา
  const standImg = document.querySelector('.standards-img-container');
  const standContent = document.querySelector('.standards-content');
  if (standImg) standImg.classList.add('reveal-init', 'reveal-fade-left');
  if (standContent) standContent.classList.add('reveal-init', 'reveal-fade-right');

  // ติดต่อเรา: ข้อมูลและ LINE จากซ้าย, ฟอร์มติดต่อจากขวา
  const contactInfo = document.querySelector('.contact-info-side');
  const contactForm = document.querySelector('.contact-form-side');
  if (contactInfo) contactInfo.classList.add('reveal-init', 'reveal-fade-left');
  if (contactForm) contactForm.classList.add('reveal-init', 'reveal-fade-right');

  // 3. กริดที่มาแบบเรียงลำดับทีละชิ้น (Stagger Cascades)
  const staggerGroups = [
    // บริการครบวงจรของเรา (Our Services) 4 รายการ
    { container: '.services-grid', items: '.service-item-card', animation: 'reveal-fade-up' },
    // แบบบ้านยอดนิยมทั้ง 6 แบบ
    { container: '.house-grid', items: '.house-card', animation: 'reveal-fade-up' },
    // จุดเด่น 4 ข้อ Why RMHome
    { container: '.why-grid', items: '.why-card', animation: 'reveal-fade-up' },
    // 6 ขั้นตอนสร้างบ้าน (01-06)
    { container: '.workflow-grid', items: '.step-card', animation: 'reveal-fade-up' },
    // รีวิวจากลูกค้าจริง
    { container: '.reviews-grid', items: '.review-card', animation: 'reveal-zoom-in' },
    // ป้ายพื้นที่ให้บริการ (ระยอง + ชลบุรี จันทบุรี ตราด ปราจีน ฉะเชิงเทรา สระแก้ว)
    { container: '.areas-badges-grid', items: '.area-pill', animation: 'reveal-zoom-in' },
    // เช็กลิสต์มาตรฐานงานก่อสร้าง
    { container: '.checklist-items', items: '.check-item', animation: 'reveal-fade-up' },
    // สถิติ Hero Section
    { container: '.hero-stats', items: '.stat-item', animation: 'reveal-fade-up' }
  ];

  staggerGroups.forEach(({ container, items, animation }) => {
    const parent = document.querySelector(container);
    if (!parent) return;
    const elements = parent.querySelectorAll(items);
    elements.forEach((item, index) => {
      const staggerClass = `reveal-stagger-${Math.min(index + 1, 8)}`;
      item.classList.add('reveal-init', animation, staggerClass);
    });
  });

  // 4. IntersectionObserver ตรวจจับการเลื่อนจอ
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        setTimeout(() => {
          if (entry.target) {
            entry.target.style.transitionProperty = '';
            entry.target.style.transitionDuration = '';
            entry.target.style.transitionDelay = '';
          }
        }, 1200);
        obs.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  });

  document.querySelectorAll('.reveal-init').forEach(el => {
    revealObserver.observe(el);
  });
}

/* ---------------------------------------------------------
   10. Cute Hopping Snowman across Screen (มนุษย์หิมะกระโดดไป-กลับขอบล่างจอ)
   --------------------------------------------------------- */
function initHoppingSnowman() {
  const snowman = document.getElementById('bottomSnowman');
  if (!snowman) return;

  // Directions: 1 = moving right, -1 = moving left
  let dir = 1;
  let minX = 18;
  const getSnowmanWidth = () => (window.innerWidth < 768 ? 42 : 54);
  let maxX = Math.max(minX + 80, window.innerWidth - getSnowmanWidth() - 16);
  let posX = minX;

  window.addEventListener('resize', () => {
    maxX = Math.max(minX + 80, window.innerWidth - getSnowmanWidth() - 16);
    posX = Math.max(minX, Math.min(posX, maxX));
  });

  // Hop States: 'crouch' -> 'hop' -> 'land' -> 'rest' | 'turnaround' | 'cheer'
  let state = 'crouch';
  let stateTime = 0;
  let hopStartX = posX;
  let hopTargetX = posX;
  let flippedThisTurn = false;
  let cheerTime = 0;

  const getHopDist = () => (window.innerWidth < 768 ? 20 : 30);
  const getHopHeight = () => (window.innerWidth < 768 ? 12 : 16);

  const DURATION_CROUCH = 80;   // ms ย่อตัวเตรียมโดด
  const DURATION_HOP = 380;     // ms ลอยตัวกระโดดพุ่งไปข้างหน้า
  const DURATION_LAND = 110;    // ms ลงแตะพื้นหิมะ ยุบตัวรับแรง
  const DURATION_REST = 260;    // ms ยืนพักหายใจ ยิ้มหวาน
  const DURATION_TURN = 850;    // ms หยุดพักที่ขอบจอ กลับทิศแล้วโดดกลับ

  let isHovered = false;
  snowman.addEventListener('mouseenter', () => { isHovered = true; });
  snowman.addEventListener('mouseleave', () => { isHovered = false; });

  // Playful click interaction: big cheerful double-bounce!
  snowman.addEventListener('click', (e) => {
    e.stopPropagation();
    state = 'cheer';
    cheerTime = 0;
  });

  function spawnLandingPuff(x) {
    const puff = document.createElement('div');
    puff.className = 'snowman-puff';
    const offsetX = dir === 1 ? 22 : 26;
    puff.style.left = `${Math.round(x + offsetX)}px`;
    puff.style.bottom = '8px';
    document.body.appendChild(puff);
    setTimeout(() => {
      if (puff.parentNode) puff.remove();
    }, 400);
  }

  let lastTime = performance.now();

  function animateSnowman(now) {
    const dt = Math.min(now - lastTime, 50);
    lastTime = now;

    // Pause advancing states if user is hovering over snowman on ground
    if (isHovered && state === 'rest') {
      const idleRot = Math.sin(now * 0.005) * 4 * dir;
      snowman.style.transform = `translate3d(${posX.toFixed(1)}px, 0px, 0) scale(${dir * 1.1}, 1.1) rotate(${idleRot.toFixed(1)}deg)`;
      requestAnimationFrame(animateSnowman);
      return;
    }

    stateTime += dt;

    let jumpY = 0;
    let scaleX = 1;
    let scaleY = 1;
    let rot = 0;

    if (state === 'crouch') {
      // 1. Squash down preparing to leap
      scaleY = 0.86;
      scaleX = 1.12;
      rot = dir * 2;
      jumpY = 0;

      if (stateTime >= DURATION_CROUCH) {
        state = 'hop';
        stateTime = 0;
        hopStartX = posX;
        const dist = getHopDist();
        hopTargetX = dir === 1 ? Math.min(maxX, posX + dist) : Math.max(minX, posX - dist);
      }
    } else if (state === 'hop') {
      // 2. Parabolic arc flight
      const p = Math.min(stateTime / DURATION_HOP, 1);
      const arc = Math.sin(p * Math.PI);
      const hopHeight = getHopHeight();

      jumpY = -arc * hopHeight;
      posX = hopStartX + (hopTargetX - hopStartX) * p;
      rot = dir * arc * 6.5; // gentle forward tilt during leap
      scaleY = 1.0 + arc * 0.12; // stretch upwards in air
      scaleX = 1.0 - arc * 0.08;

      if (stateTime >= DURATION_HOP) {
        state = 'land';
        stateTime = 0;
        posX = hopTargetX;
        spawnLandingPuff(posX);
      }
    } else if (state === 'land') {
      // 3. Squash cushion upon landing on soft snow
      scaleY = 0.82;
      scaleX = 1.16;
      jumpY = 0;
      rot = 0;

      if (stateTime >= DURATION_LAND) {
        stateTime = 0;
        // Check if edge reached (stop and turnaround)
        if ((dir === 1 && posX >= maxX - 2) || (dir === -1 && posX <= minX + 2)) {
          state = 'turnaround';
          flippedThisTurn = false;
        } else {
          state = 'rest';
        }
      }
    } else if (state === 'rest') {
      // 4. Ground rest & gentle breathing before next hop
      const p = Math.min(stateTime / DURATION_REST, 1);
      scaleY = 0.82 + 0.18 * p + Math.sin(p * Math.PI) * 0.04;
      scaleX = 1.16 - 0.16 * p;
      rot = Math.sin(p * Math.PI * 2) * 2 * dir;
      jumpY = 0;

      if (stateTime >= DURATION_REST) {
        state = 'crouch';
        stateTime = 0;
      }
    } else if (state === 'turnaround') {
      // 5. Arrived at edge: pause, do a cute mini turnaround hop & flip
      const p = Math.min(stateTime / DURATION_TURN, 1);
      jumpY = -Math.sin(p * Math.PI) * 7;
      rot = Math.sin(p * Math.PI * 2) * 4 * dir;

      if (!flippedThisTurn && stateTime >= DURATION_TURN * 0.45) {
        dir = -dir; // Flip direction!
        flippedThisTurn = true;
      }

      if (stateTime >= DURATION_TURN) {
        state = 'crouch';
        stateTime = 0;
      }
    } else if (state === 'cheer') {
      // 6. Excited cheer bounce on click
      cheerTime += dt;
      const cheerP = Math.min(cheerTime / 520, 1);
      jumpY = -Math.sin(cheerP * Math.PI) * 28;
      rot = Math.sin(cheerP * Math.PI * 4) * 12;
      scaleY = 1.18;
      scaleX = 0.9;

      if (cheerTime >= 520) {
        state = 'land';
        stateTime = 0;
        spawnLandingPuff(posX);
      }
    }

    snowman.style.transform = `translate3d(${posX.toFixed(1)}px, ${jumpY.toFixed(1)}px, 0) scale(${(dir * scaleX).toFixed(3)}, ${scaleY.toFixed(3)}) rotate(${rot.toFixed(1)}deg)`;

    requestAnimationFrame(animateSnowman);
  }

  requestAnimationFrame(animateSnowman);
}

/* ==========================================================================
   Dynamic CMS Content Rendering & Real-Time Sync System
   ========================================================================== */

function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initDynamicCMSContent() {
  renderSiteInfo();
  renderReviews();
  renderServices();
  renderStandards();
  renderWhyUs();
  renderWorkflow();

  // Cross-tab/window real-time sync via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'rm_site_info' || e.key === 'rm_last_sync_timestamp') renderSiteInfo();
    if (e.key === 'rm_reviews' || e.key === 'rm_last_sync_timestamp') renderReviews();
    if (e.key === 'rm_services' || e.key === 'rm_last_sync_timestamp') renderServices();
    if (e.key === 'rm_standards' || e.key === 'rm_last_sync_timestamp') renderStandards();
    if (e.key === 'rm_why_us' || e.key === 'rm_last_sync_timestamp') renderWhyUs();
    if (e.key === 'rm_workflow' || e.key === 'rm_last_sync_timestamp') renderWorkflow();
    if (e.key === 'rm_portfolio_items' || e.key === 'rm_last_sync_timestamp') renderHouseGrid();
  });

  // In-page real-time sync event
  window.addEventListener('contentUpdated', () => {
    renderSiteInfo();
    renderReviews();
    renderServices();
    renderStandards();
    renderWhyUs();
    renderWorkflow();
    renderHouseGrid();
  });
}

function renderReviews() {
  const container = document.getElementById('reviewsGridContainer');
  if (!container) return;

  let reviews = [];
  try {
    const raw = localStorage.getItem('rm_reviews');
    if (raw) reviews = JSON.parse(raw);
  } catch (e) {}

  if (!reviews || reviews.length === 0) {
    reviews = [
      {
        id: 'rev_01',
        name: 'คุณก้อย',
        role: 'เจ้าของบ้าน',
        image: 'assets/images/quality-engineer.jpg',
        text: 'ลูกค้าประทับใจในความเป็นมืออาชีพของทีม RM HOME ทั้งเรื่องความสะอาด ความเรียบร้อยของหน้างาน ทีมช่างสุภาพ และการแก้ไขปัญหาที่รวดเร็ว ทำให้มั่นใจและไว้วางใจในการดูแลบ้านทุกขั้นตอน',
        rating: 5
      },
      {
        id: 'rev_02',
        name: 'คุณธีรศักดิ์ วิจิตรจินดา',
        role: 'บ้านเดี่ยว 2 ชั้น • อ.เมืองระยอง',
        image: 'assets/images/luxury-interior.jpg',
        text: 'ประทับใจทีมงาน RMHome มากครับ ทำงานมืออาชีพจริงๆ สัญญาชัดเจน งวดงานตรงไปตรงมา ตอนแรกกลัวเรื่องผู้รับเหมาทิ้งงานมาก แต่ที่นี่มีวิศวกรส่งรูปให้ดูทุกวัน บ้านเสร็จเร็วกว่ากำหนด 2 สัปดาห์ แนะนำเลยครับ',
        rating: 5
      },
      {
        id: 'rev_03',
        name: 'พญ. นภัสวรรณ รัตนศิลป์',
        role: 'พูลวิลล่าตากอากาศ • อ.บ้านฉาง ระยอง',
        image: 'assets/images/house-tropical.jpg',
        text: 'จ้าง RMHome สร้างบ้านพูลวิลล่าสไตล์โมเดิร์นที่บ้านฉาง สวยตรงปกเหมือนรูป 3D ทุกประการเลยค่ะ สเปกวัสดุใช้ของ SCG แท้ทุกชิ้น ทีมงานสุภาพ เก็บงานเนี้ยบมาก บริการเรื่องยื่นกู้ธนาคารผ่านฉลุยเลยค่ะ',
        rating: 5
      },
      {
        id: 'rev_04',
        name: 'คุณวรัญญู เอกอนันต์',
        role: 'แบบบ้านนอร์ดิก • อ.นิคมพัฒนา ระยอง',
        image: 'assets/images/house-nordic.jpg',
        text: 'ผมเป็นวิศวกรโรงงานในมาบตาพุด ค่อนข้างละเอียดเรื่องโครงสร้าง พอได้เห็นขั้นตอนการตอกเสาเข็มและการผูกเหล็กของ RMHome แล้วยอมรับเลยว่าได้มาตรฐานจริง คุมงบได้ไม่มีบานปลายแม้แต่บาทเดียวครับ',
        rating: 5
      }
    ];
  }

  container.innerHTML = '';
  reviews.forEach(rev => {
    const card = document.createElement('div');
    card.className = 'review-card';

    const avatarHtml = rev.image
      ? `<img src="${escapeHtml(rev.image)}" alt="${escapeHtml(rev.name)}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #ffd700;" onerror="this.outerHTML='<div class=\\'reviewer-avatar\\'>${escapeHtml((rev.name || 'ค').charAt(0))}</div>'">`
      : `<div class="reviewer-avatar">${escapeHtml((rev.name || 'ค').charAt(0))}</div>`;

    card.innerHTML = `
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"${escapeHtml(rev.text)}"</p>
      <div class="reviewer-meta">
        ${avatarHtml}
        <div>
          <div class="reviewer-name">${escapeHtml(rev.name)}</div>
          <div class="reviewer-loc">${escapeHtml(rev.role || 'ลูกค้าสร้างบ้าน RMHome')}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderServices() {
  const container = document.getElementById('servicesGridContainer');
  if (!container) return;

  let services = [];
  try {
    const raw = localStorage.getItem('rm_services');
    if (raw) services = JSON.parse(raw);
  } catch (e) {}

  if (!services || services.length === 0) {
    services = [
      { id: 'srv_01', title: 'บริการ สำรวจหน้างาน', freeTag: 'ฟรี', desc: 'สำรวจฟรีไม่มีค่าใช้จ่าย' },
      { id: 'srv_02', title: 'บริการ ยื่นกู้', freeTag: 'ฟรี', desc: 'ลดความยุ่งยาก ประหยัดเวลา พร้อมดูแลจนดำเนินการเสร็จ' },
      { id: 'srv_03', title: 'บริการ ขออนุญาตปลูกสร้าง', freeTag: 'ฟรี', desc: 'อำนวยความสะดวกทุกขั้นตอน พร้อมยื่นเอกสารตามกฎหมาย' },
      { id: 'srv_04', title: 'บริการ ยื่นขอน้ำปะปา-ไฟฟ้า(ชั่วคราว)', freeTag: 'ฟรี', desc: 'ดำเนินการยื่นเอกสารและประสานงานกับหน่วยงานราชการให้ครบ จบในที่เดียว' }
    ];
  }

  container.innerHTML = '';
  services.forEach(srv => {
    const card = document.createElement('div');
    card.className = 'service-item-card';

    const tagHtml = srv.freeTag ? `<span class="tag-free">${escapeHtml(srv.freeTag)}</span>` : '';

    card.innerHTML = `
      <div class="service-icon-box">
        <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
      </div>
      <div class="service-item-body">
        <h4 class="service-item-title">${escapeHtml(srv.title)}${tagHtml}</h4>
        <p class="service-item-desc">${escapeHtml(srv.desc)}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderStandards() {
  const container = document.getElementById('standardsChecklistContainer');
  if (!container) return;

  let standards = [];
  try {
    const raw = localStorage.getItem('rm_standards');
    if (raw) standards = JSON.parse(raw);
  } catch (e) {}

  if (!standards || standards.length === 0) {
    standards = [
      { title: 'ฐานรากตอกเสาเข็มลึกถึงชั้นดินดาน (Solid Soil Layer)', desc: 'คำนวณกำลังรับน้ำหนักตามผลเจาะสำรวจดินในระยอง มั่นใจบ้านไม่ทรุดตัว' },
      { title: 'คอนกรีตผสมเสร็จแบรนด์ชั้นนำ (CPAC / SCG Standard)', desc: 'ควบคุมความข้นเหลวและค่าความแข็งแรง (Cylinder Strength) มีใบรับรองทุกคันรถ' },
      { title: 'ระบบท่อและสายไฟร้อยท่อฝังผนัง 100%', desc: 'ใช้อุปกรณ์สายไฟมาตรฐาน มอก. (Thai Yazaki / BCC) พร้อมระบบตัดไฟรั่วอัตโนมัติ Safe-T-Cut' },
      { title: 'รายงานความคืบหน้าแบบเรียลไทม์ผ่าน Mobile Cloud', desc: 'ลูกค้าไม่ต้องลางานมาดูไซต์งานเอง เราอัปเดตภาพและวิดีโอ 360 องศาทุกสัปดาห์' }
    ];
  }

  container.innerHTML = '';
  standards.forEach(std => {
    const li = document.createElement('li');
    li.className = 'check-item';
    li.innerHTML = `
      <div class="check-circle">✓</div>
      <div>
        <strong>${escapeHtml(std.title)}</strong>
        <span>${escapeHtml(std.desc)}</span>
      </div>
    `;
    container.appendChild(li);
  });
}

function renderWhyUs() {
  const container = document.getElementById('whyGridContainer');
  if (!container) return;

  let whyUs = [];
  try {
    const raw = localStorage.getItem('rm_why_us');
    if (raw) whyUs = JSON.parse(raw);
  } catch (e) {}

  if (!whyUs || whyUs.length === 0) {
    whyUs = [
      { title: 'สัญญาโปร่งใส จ่ายตามงวดงาน', desc: 'แบ่งจ่ายเป็นงวดตามงานที่สร้างเสร็จจริง ไม่มีการเรียกเก็บเงินล่วงหน้าเกินเนื้องาน คุมงบได้ 100% ไม่มีงบบานปลาย' },
      { title: 'รับประกันโครงสร้างยาวนาน 20 ปี', desc: 'อุ่นใจด้วยหนังสือค้ำประกันโครงสร้าง 20 ปีเต็ม และรับประกันสถาปัตยกรรม 2 ปี พร้อมทีมเซอร์วิสดูแลรวดเร็ว' },
      { title: 'วัสดุแท้เกรดพรีเมียม SCG & TOA', desc: 'เลือกใช้เฉพาะแบรนด์ชั้นนำระดับประเทศ มอก. ทุกชิ้น ไม่มีสับเปลี่ยนของเกรดต่ำ มั่นใจในอายุการใช้งานยาวนาน' },
      { title: 'บริการยื่นสินเชื่อธนาคาร 100%', desc: 'มีเจ้าหน้าที่ฝ่ายการเงินประสานงานกับธนาคารชั้นนำ ให้คำแนะนำเรื่องเอกสาร ช่วยดันยอดกู้สูงสุด ดอกเบี้ยพิเศษ' },
      { title: 'สำนักงานตั้งอยู่ในระยอง ดูแลง่าย', desc: 'มีออฟฟิศและทีมงานประจำพื้นที่ระยอง พร้อมเข้าสำรวจหน้างานทันที ติดต่อง่าย ไม่ใช่ผู้รับเหมาจร' },
      { title: 'วันสต็อปเซอร์วิส ครบวงจร', desc: 'ตั้งแต่ขอเลขที่บ้าน มิเตอร์น้ำ มิเตอร์ไฟ ขุดเจาะบ่อบาดาล ขออนุญาตเทศบาล จบครบในที่เดียวแบบ One Stop' }
    ];
  }

  container.innerHTML = '';
  whyUs.forEach(w => {
    const card = document.createElement('div');
    card.className = 'why-card';
    card.innerHTML = `
      <div class="why-icon-wrap">
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <h4>${escapeHtml(w.title)}</h4>
      <p>${escapeHtml(w.desc)}</p>
    `;
    container.appendChild(card);
  });
}

function renderWorkflow() {
  const container = document.getElementById('workflowGridContainer');
  if (!container) return;

  let workflow = [];
  try {
    const raw = localStorage.getItem('rm_workflow');
    if (raw) workflow = JSON.parse(raw);
  } catch (e) {}

  if (!workflow || workflow.length === 0) {
    workflow = [
      { step: '01', title: 'ปรึกษา & สำรวจที่ดินระยอง ฟรี', desc: 'ทีมสถาปนิกและวิศวกรเข้าสำรวจสภาพดิน ทิศทางแดด ลม และผังเมืองระยอง เพื่อประเมินความเป็นไปได้' },
      { step: '02', title: 'ออกแบบ 3D & ปรับฟังก์ชัน', desc: 'เขียนแบบบ้าน 3D เสมือนจริง ปรับแก้ตามความพึงพอใจและฟังก์ชันการใช้งานของครอบครัวคุณ' },
      { step: '03', title: 'ทำใบเสนอราคา BOQ ละเอียด', desc: 'แจกแจงรายการวัสดุและค่าแรงชัดเจนทุกตารางนิ้ว ไม่มีหมกเม็ด ก่อนลงนามทำสัญญามาตรฐาน' },
      { step: '04', title: 'ยื่นขออนุญาต & ยื่นกู้ธนาคาร', desc: 'ทีมงานจัดการเอกสารราชการ ยื่นขออนุญาตก่อสร้าง และยื่นกู้สถาบันการเงินให้จนผ่านอนุมัติ' },
      { step: '05', title: 'ลงมือก่อสร้างตามมาตรฐาน QC', desc: 'วิศวกรและโฟร์แมนควบคุมงานทุกวัน ส่งรายงานความคืบหน้าภาพถ่ายและวิดีโอ 360 องศาให้ท่านทราบ' },
      { step: '06', title: 'ตรวจรับ & ส่งมอบบ้านพร้อมอยู่', desc: 'ทำความสะอาดแบบ Big Cleaning ส่งมอบกุญแจ ใบรับประกันโครงสร้าง 20 ปี และของขวัญขึ้นบ้านใหม่' }
    ];
  }

  container.innerHTML = '';
  workflow.forEach((wf, idx) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.innerHTML = `
      <div class="step-number">${escapeHtml(wf.step || (idx + 1).toString().padStart(2, '0'))}</div>
      <h4>${escapeHtml(wf.title)}</h4>
      <p>${escapeHtml(wf.desc)}</p>
    `;
    container.appendChild(card);
  });
}

function renderSiteInfo() {
  try {
    const raw = localStorage.getItem('rm_site_info');
    if (!raw) return;
    const info = JSON.parse(raw);
    if (!info) return;

    if (info.promoText) {
      const el = document.getElementById('sitePromoText');
      if (el) el.textContent = info.promoText;
    }
    if (info.promoPill) {
      const el = document.getElementById('sitePromoPill');
      if (el) el.textContent = info.promoPill;
    }
    if (info.phone) {
      const el = document.getElementById('siteHotlineText');
      if (el) el.textContent = `สายด่วนวิศวกร: ${info.phone}`;
      const link = document.getElementById('siteHotlineLink');
      if (link) link.href = `tel:${info.phone.replace(/[^0-9]/g, '')}`;
    }
    if (info.hours) {
      const el = document.getElementById('siteHoursText');
      if (el) el.textContent = info.hours;
    }
    if (info.navModelsLabel) {
      const el = document.getElementById('navLinkModels');
      if (el) el.textContent = info.navModelsLabel;
    }
    if (info.heroBadge) {
      const el = document.getElementById('heroBadgeText');
      if (el) el.textContent = info.heroBadge;
    }
    if (info.heroTitle) {
      const el = document.getElementById('heroTitleEl');
      if (el) el.innerHTML = info.heroTitle;
    }
    if (info.heroSubtitle) {
      const el = document.getElementById('heroDescEl');
      if (el) el.textContent = info.heroSubtitle;
    }
  } catch (e) {}
}
