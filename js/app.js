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
  initAllCenterModals();
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
        : '🎁 2/2 Christmas Promo';
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
    id: 'house_contem_01',
    title: 'RM-Contem Harmony',
    category: 'Contem',
    categorySlug: 'contem',
    budget: '4.25 ล้านบาท',
    type: 'แบบบ้าน (ยังไม่สร้าง)',
    area: '260',
    floors: '2',
    bedrooms: '3',
    bathrooms: '3',
    parking: '2',
    location: 'อ.บ้านค่าย จ.ระยอง',
    cover: 'assets/images/hero-winter-villa.jpg',
    gallery: [
      'assets/images/hero-winter-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/plan-nordic-fl1.svg',
      'assets/images/plan-nordic-fl2.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'แบบบ้านสไตล์คอนเทมโพรารี (Contemporary) ผสมผสานความร่วมสมัยและกลิ่นอายธรรมชาติเมืองระยอง อบอุ่น เรียบหรู ฟังก์ชันลงตัวคุ้มค่าทุกตารางเมตร',
    features: [
      'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
      'หลังคา SCG Prestige พร้อมฉนวนสะท้อนความร้อน Stay Cool',
      'แปลนชั้น 1: Living Area เพดานสูง + Dining + ครัวไทยแยกส่วน + ห้องนอนผู้สูงอายุ',
      'แปลนชั้น 2: Master Bedroom กว้างขวางพร้อม Walk-in Closet และระเบียงรับลม',
      'สุขภัณฑ์ Cotto / American Standard ประหยัดน้ำระดับพรีเมียม',
      'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_modern_02',
    title: 'RM-Modern Villa Resort',
    category: 'Modern',
    categorySlug: 'modern',
    budget: '4.95 ล้านบาท',
    type: 'ผลงานสร้างเสร็จแล้ว',
    area: '290',
    floors: '1',
    bedrooms: '3',
    bathrooms: '3',
    parking: '2',
    location: 'อ.แกลง จ.ระยอง',
    cover: 'assets/images/house-tropical.jpg',
    gallery: [
      'assets/images/house-tropical.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/hero-winter-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/plan-tropical-fl1.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'บ้านพักตากอากาศสไตล์โมเดิร์น พร้อมสระว่ายน้ำระบบเกลือในตัว ออกแบบเส้นสายคมชัด โปร่งโล่ง เชื่อมต่อพื้นที่ใช้สอยภายในและภายนอกได้อย่างลงตัว',
    features: [
      'สระว่ายน้ำระบบเกลือ Overflow ขนาด 3.5 x 8 เมตร พร้อมระบบไฟ LED ใต้น้ำ',
      'แปลนวิลล่าสไตล์รีสอร์ต: ทุกห้องนอนเปิดก้าวสู่ขอบสระว่ายน้ำได้โดยตรง',
      'พื้นระเบียงไม้เทียม WPC เกรดพรีเมียม ทนแดด ทนฝน ไม่ผุกร่อน',
      'ดีไซน์เชื่อมต่อ Indoor-Outdoor ด้วยประตูกระจกบานเลื่อนขนาดยักษ์',
      'ระบบบำบัดน้ำเสียและระบายน้ำรอบตัวบ้าน ออกแบบป้องกันน้ำท่วมขัง',
      'บริการยื่นขออนุญาตปลูกสร้างและขอน้ำ-ไฟให้ฟรีครบวงจร'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_nordic_03',
    title: 'RM-Nordic Grand',
    category: 'Nordic',
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
    gallery: [
      'assets/images/house-nordic.jpg',
      'assets/images/hero-winter-villa.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/plan-nordic-fl1.svg',
      'assets/images/plan-nordic-fl2.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'แบบบ้านสไตล์นอร์ดิกกลิ่นอายสแกนดิเนเวียน ดีไซน์หลังคาจั่วสูงโปร่ง โอ่โถง พร้อมกระจกบานใหญ่รับแสงธรรมชาติและวิวสวน เหมาะสำหรับครอบครัวคนรุ่นใหม่ในระยองที่ต้องการความสงบ อบอุ่น และฟังก์ชันครบครัน',
    features: [
      'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
      'หลังคา SCG Shingle Roof พร้อมฉนวนกันความร้อน Stay Cool 3 นิ้ว',
      'กระจกเขียวตัดแสงหนา 6 มม. กรอบอะลูมิเนียมเกรดพรีเมียม Powder Coat',
      'แปลนชั้น 1: โถง Living เพดานสูง 3.2 ม. + ครัวเปิดสไตล์ยุโรป + ห้องนอนผู้สูงอายุ',
      'แปลนชั้น 2: Master Penthouse Suite พร้อม Walk-in Closet + ระเบียงชมวิวหน้าบ้าน',
      'ระบบไฟฟ้ารองรับ EV Charger และ Smart Home Control',
      'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
    ],
    tall: false,
    createdAt: '2026-11-01'
  },
  {
    id: 'house_luxury_04',
    title: 'RM-Luxury Mansion Elite',
    category: 'Luxury',
    categorySlug: 'luxury',
    budget: '6.95 ล้านบาท',
    type: 'แบบบ้าน (ยังไม่สร้าง)',
    area: '380',
    floors: '2',
    bedrooms: '4',
    bathrooms: '5',
    parking: '3',
    location: 'อ.บ้านฉาง จ.ระยอง',
    cover: 'assets/images/house-mansion.jpg',
    gallery: [
      'assets/images/house-mansion.jpg',
      'assets/images/hero-winter-villa.jpg',
      'assets/images/hero-villa.jpg',
      'assets/images/luxury-interior.jpg',
      'assets/images/plan-mansion-fl1.svg',
      'assets/images/plan-mansion-fl2.svg',
      'assets/images/quality-engineer.jpg'
    ],
    description: 'คฤหาสน์หรูระดับ Luxury โดดเด่นด้วย Façade หินอ่อนและเส้นสายสีทองแชมเปญ โถง Double Volume สูง 6.5 เมตร พร้อมระเบียง Sky Terrace ชั้นบน ตอบโจทย์การใช้ชีวิตเหนือระดับในระยอง',
    features: [
      'ฐานรากตอกเสาเข็มลึกถึงชั้นดินดาน วิศวกรสามัญเซ็นรับรองทุกจุด',
      'แปลนชั้น 1: โถง Grand Foyer สูง 6.5 ม. + Dining 10 ที่นั่ง + ครัวไทย & ครัวฝรั่ง + ห้องแม่บ้าน',
      'แปลนชั้น 2: Penthouse Master Suite + Sky Terrace ระเบียงใหญ่ + ทุกห้องนอนมีห้องน้ำในตัว',
      'ผนังอิฐมวลเบา Q-CON ป้องกันเสียงและความร้อน 2 ชั้น',
      'ระบบ Smart Home ควบคุมไฟ แอร์ และความปลอดภัยผ่านสมาร์ตโฟน',
      'สุขภัณฑ์อัตโนมัติ TOTO Neorest ในห้อง Master Bedroom',
      'ฟรี จัดสวน Landscape สไตล์ Modern Luxury รอบบ้าน'
    ],
    tall: false,
    createdAt: '2026-11-01'
  }
];

function getCategorySlug(cat) {
  if (!cat) return 'modern';
  const c = cat.toLowerCase().trim();
  if (c.includes('contem') || c.includes('คอนเทม')) return 'contem';
  if (c.includes('nordic') || c.includes('นอร์ดิก')) return 'nordic';
  if (c.includes('luxury') || c.includes('ลักชัวรี') || c.includes('mansion') || c.includes('คฤหาสน์')) return 'luxury';
  if (c.includes('modern') || c.includes('โมเดิร์น') || c.includes('tropical') || c.includes('ทรอปิคอล') || c.includes('pool') || c.includes('พูลวิลล่า') || c.includes('minimal') || c.includes('มินิมอล')) return 'modern';
  return 'modern';
}

function normalizeCategoryName(cat) {
  const slug = getCategorySlug(cat);
  if (slug === 'contem') return 'Contem';
  if (slug === 'modern') return 'Modern';
  if (slug === 'nordic') return 'Nordic';
  if (slug === 'luxury') return 'Luxury';
  return 'Modern';
}

function getStoredPortfolioForWeb() {
  try {
    const raw = localStorage.getItem('rm_portfolio_items');
    if (!raw) {
      localStorage.setItem('rm_portfolio_items', JSON.stringify(DEFAULT_PORTFOLIO_HOUSES));
      return DEFAULT_PORTFOLIO_HOUSES;
    }
    let parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_portfolio_items', JSON.stringify(DEFAULT_PORTFOLIO_HOUSES));
      return DEFAULT_PORTFOLIO_HOUSES;
    }
    let updated = false;
    parsed = parsed.map(item => {
      const newSlug = getCategorySlug(item.categorySlug || item.category);
      const newCat = normalizeCategoryName(item.category || item.categorySlug);
      if (item.categorySlug !== newSlug || item.category !== newCat) {
        updated = true;
        return { ...item, categorySlug: newSlug, category: newCat };
      }
      return item;
    });

    // If contem is not present in stored items, unshift the default contem house so all 4 styles are represented
    const hasContem = parsed.some(item => getCategorySlug(item.categorySlug || item.category) === 'contem');
    if (!hasContem && DEFAULT_PORTFOLIO_HOUSES[0]) {
      parsed.unshift(DEFAULT_PORTFOLIO_HOUSES[0]);
      updated = true;
    }

    if (updated) {
      try { localStorage.setItem('rm_portfolio_items', JSON.stringify(parsed)); } catch (e) {}
    }
    return parsed;
  } catch (e) {
    return DEFAULT_PORTFOLIO_HOUSES;
  }
}

let activeHouseFilter = 'all';

function createHouseCardNode(item) {
  const card = document.createElement('article');
  card.className = `house-card ${item.tall ? 'tall-card' : ''}`;
  card.setAttribute('data-category', getCategorySlug(item.categorySlug || item.category));
  card.setAttribute('data-id', item.id);

  const priceText = item.budget.includes('ล้าน') ? item.budget : `${item.budget} ล้านบาท`;

  card.innerHTML = `
    <div class="house-img-wrap">
      <img src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.src='assets/images/house-nordic.jpg'">
      <span class="house-tag-badge has-ribbon">${item.type || 'แบบบ้าน'}</span>
    </div>
    <div class="house-body">
      <span class="house-meta-code">SERIES: ${normalizeCategoryName(item.category || item.categorySlug).toUpperCase()}</span>
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

  const viewBtn = card.querySelector('.btn-view-house');
  if (viewBtn) {
    viewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openHouseModalById(item.id);
    });
  }

  return card;
}

function openAllHousesModal() {
  const modal = document.getElementById('allHousesModal');
  const grid = document.getElementById('allHousesModalGrid');
  const countText = document.getElementById('allHousesModalCountText');
  if (!modal || !grid) return;

  const allHouses = getStoredPortfolioForWeb();
  const filteredHouses = allHouses.filter(item => {
    if (activeHouseFilter === 'all') return true;
    const cat = getCategorySlug(item.categorySlug || item.category);
    return cat === activeHouseFilter;
  });

  if (countText) {
    countText.textContent = `(ทั้งหมด ${filteredHouses.length} หลัง)`;
  }

  grid.innerHTML = '';
  filteredHouses.forEach(item => {
    grid.appendChild(createHouseCardNode(item));
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderHouseGrid() {
  const container = document.getElementById('houseGridContainer');
  if (!container) return;

  const allHouses = getStoredPortfolioForWeb();

  // Filter by category
  const filteredHouses = allHouses.filter(item => {
    if (activeHouseFilter === 'all') return true;
    const cat = getCategorySlug(item.categorySlug || item.category);
    return cat === activeHouseFilter;
  });

  // Render 3D Orbit Carousel with all matching houses
  renderOrbitCarousel(filteredHouses);

  const totalFiltered = filteredHouses.length;

  // 1. Dynamic Extra Houses Counter Badge & View All Button (เด้งขึ้นโมดอลกลางจอ)
  const badgeWrap = document.getElementById('housesCountBadgeWrap');
  const moreCountText = document.getElementById('housesMoreCountText');
  const toggleBtn = document.getElementById('btnToggleAllHouses');
  const bottomWrap = document.getElementById('housesViewAllBottomWrap');
  const btnBottom = document.getElementById('btnToggleAllHousesBottom');
  const bottomCountText = document.getElementById('housesBottomCountText');

  if (totalFiltered > 3) {
    if (badgeWrap) badgeWrap.style.display = 'block';
    if (bottomWrap) bottomWrap.style.display = 'block';
    const remaining = totalFiltered - 3;

    if (moreCountText) {
      moreCountText.textContent = `✨ มีอีก ${remaining} แบบบ้าน/ผลงานจริง (คลิกเพื่อดูทั้งหมดกลางจอ ➔)`;
    }
    if (bottomCountText) {
      bottomCountText.textContent = `${totalFiltered} หลัง`;
    }
    if (btnBottom) {
      btnBottom.innerHTML = `ดูแบบบ้าน &amp; ผลงานทั้งหมด (${totalFiltered} หลัง) ➔`;
    }
  } else {
    if (badgeWrap) badgeWrap.style.display = 'none';
    if (bottomWrap) bottomWrap.style.display = 'none';
  }

  // Bind modal open clicks
  if (toggleBtn && !toggleBtn._hasModalClick) {
    toggleBtn._hasModalClick = true;
    toggleBtn.addEventListener('click', () => openAllHousesModal());
  }
  if (btnBottom && !btnBottom._hasModalClick) {
    btnBottom._hasModalClick = true;
    btnBottom.addEventListener('click', () => openAllHousesModal());
  }

  // Always render ONLY top 3 houses on the main page (ไม่ต้องไปเติมข้างล่าง)
  const displayedHouses = filteredHouses.slice(0, 3);
  container.innerHTML = '';
  displayedHouses.forEach(item => {
    container.appendChild(createHouseCardNode(item));
  });
}


/* ==========================================================================
   3D Orbit Ferris Wheel Carousel Engine (หมุนวนรอบแกนกลาง RMHome)
   ========================================================================== */
let activePortfolioView = 'orbit'; // 'orbit' or 'grid'
let orbitAnimationId = null;
let orbitCurrentAngle = 0;
let orbitTargetAngle = null;
let orbitIsPlaying = true;
let orbitIsDragging = false;
let orbitDragStartX = 0;
let orbitDragStartAngle = 0;
let orbitCardsData = [];
let orbitCardElements = [];

function getOrbitRadii() {
  const w = window.innerWidth;
  const isMobile = w < 768;
  const isTablet = w < 1024 && w >= 768;
  if (isMobile) {
    // Scaled down cleanly so all houses can be seen thoroughly with ample margin
    const rx = Math.min(w * 0.20, 75);
    return {
      rx: rx,
      rz: 48,
      tiltY: 10
    };
  } else if (isTablet) {
    return {
      rx: 280,
      rz: 155,
      tiltY: 34
    };
  } else {
    // Desktop: 100% UNTOUCHED!
    return {
      rx: 390,
      rz: 210,
      tiltY: 38
    };
  }
}

function updateOrbitPositions() {
  const n = orbitCardElements.length;
  if (n === 0) return;

  const { rx, rz, tiltY } = getOrbitRadii();
  const step = (2 * Math.PI) / n;

  orbitCardElements.forEach((el, i) => {
    const phi = orbitCurrentAngle + (i * step);
    const x = rx * Math.sin(phi);
    const z = rz * Math.cos(phi);
    const y = tiltY * Math.cos(phi);

    // Normalized depth: t = 1 at front (cos(phi) = 1), t = 0 at back (cos(phi) = -1)
    const t = (z + rz) / (2 * rz); // 0 to 1
    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? (0.52 + (0.32 * t)) : (0.68 + (0.35 * t));
    const opacity = 0.45 + (0.55 * t); // 0.45 to 1.0
    const brightness = 0.65 + (0.4 * t); // 0.65 to 1.05
    const zIndex = Math.round(100 + (t * 800));

    el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px), ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
    el.style.opacity = opacity.toFixed(3);
    el.style.filter = `brightness(${brightness.toFixed(3)})`;
    el.style.zIndex = zIndex;

    if (t > 0.88) {
      el.classList.add('is-front');
    } else {
      el.classList.remove('is-front');
    }
  });
}

function orbitTick() {
  if (activePortfolioView !== 'orbit') return;

  if (orbitTargetAngle !== null) {
    // Easing towards target angle
    const diff = orbitTargetAngle - orbitCurrentAngle;
    if (Math.abs(diff) < 0.003) {
      orbitCurrentAngle = orbitTargetAngle;
      orbitTargetAngle = null;
    } else {
      orbitCurrentAngle += diff * 0.08;
    }
    updateOrbitPositions();
  } else if (orbitIsPlaying && !orbitIsDragging) {
    orbitCurrentAngle += 0.0035; // Smooth continuous rotation speed
    if (orbitCurrentAngle > Math.PI * 2) {
      orbitCurrentAngle -= Math.PI * 2;
    }
    updateOrbitPositions();
  }

  orbitAnimationId = requestAnimationFrame(orbitTick);
}

function startOrbitAnimation() {
  if (!orbitAnimationId && activePortfolioView === 'orbit') {
    orbitAnimationId = requestAnimationFrame(orbitTick);
  }
}

function stopOrbitAnimation() {
  if (orbitAnimationId) {
    cancelAnimationFrame(orbitAnimationId);
    orbitAnimationId = null;
  }
}

function rotateCardToFront(targetIndex) {
  const n = orbitCardElements.length;
  if (n === 0) return;
  const step = (2 * Math.PI) / n;
  let desired = -(targetIndex * step);

  let diff = (desired - orbitCurrentAngle) % (2 * Math.PI);
  if (diff > Math.PI) diff -= (2 * Math.PI);
  if (diff < -Math.PI) diff += (2 * Math.PI);

  orbitTargetAngle = orbitCurrentAngle + diff;
}

function renderOrbitCarousel(houses) {
  const track = document.getElementById('houseOrbitTrack');
  if (!track) return;

  orbitCardsData = houses || [];
  track.innerHTML = '';
  orbitCardElements = [];

  if (orbitCardsData.length === 0) {
    track.innerHTML = `
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; color:#94a3b8; background:rgba(3,15,10,0.85); padding:2rem; border-radius:12px; border:1px dashed #d4af37;">
        <p style="color:#ffd700; font-size:1.1rem; margin-bottom:0.25rem;">🏠 ไม่พบแบบบ้านในหมวดหมู่นี้</p>
        <p style="font-size:0.85rem;">กรุณาเลือกหมวดหมู่อื่นด้านบน</p>
      </div>
    `;
    return;
  }

  orbitCardsData.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'orbit-card';
    card.setAttribute('data-house-id', item.id);
    card.setAttribute('data-index', idx);

    let priceText = item.budget || '';
    priceText = priceText.replace('ล้านบาท', '').trim();
    if (!priceText.includes('ล้าน')) priceText += ' ล้าน';

    card.innerHTML = `
      <div class="orbit-card-img-wrap">
        <img src="${item.cover || 'assets/images/house-nordic.jpg'}" alt="${escapeHtml(item.title)}" loading="lazy">
        <span class="orbit-card-badge">${escapeHtml(item.category || 'Luxury')}</span>
      </div>
      <div class="orbit-card-body">
        <span class="orbit-card-series">SERIES: ${escapeHtml((item.category || 'Modern').toUpperCase())}</span>
        <h4 class="orbit-card-title">${escapeHtml(item.title)}</h4>
        <div class="orbit-card-specs">
          <span>📐 ${item.area || '250'} ตร.ม.</span>
          <span>🛏️ ${item.bedrooms || '3'} นอน</span>
          <span>🚿 ${item.bathrooms || '3'} น้ำ</span>
        </div>
        <div class="orbit-card-footer">
          <div class="orbit-card-price">
            <span class="price-label">เริ่มต้น</span>
            <span class="price-val">฿ ${priceText}</span>
          </div>
          <button type="button" class="btn-orbit-view btn-view-house" data-house-id="${item.id}">
            ดูสเปก &amp; แปลน ➔
          </button>
        </div>
      </div>
    `;

    // Click on "ดูสเปก" button
    const btnView = card.querySelector('.btn-view-house');
    if (btnView) {
      btnView.addEventListener('click', (e) => {
        e.stopPropagation();
        openHouseModalById(item.id);
      });
    }

    // Click on card: if background, rotate to front; if front, open modal
    card.addEventListener('click', (e) => {
      if (card.classList.contains('is-front')) {
        openHouseModalById(item.id);
      } else {
        rotateCardToFront(idx);
      }
    });

    track.appendChild(card);
    orbitCardElements.push(card);
  });

  updateOrbitPositions();
  startOrbitAnimation();
}

function initOrbitCarouselEngine() {
  const stage = document.getElementById('houseOrbitStage');
  const btnPrev = document.getElementById('btnOrbitPrev');
  const btnNext = document.getElementById('btnOrbitNext');
  const btnToggle = document.getElementById('btnOrbitToggleSpin');
  const iconSpan = document.getElementById('orbitSpinIcon');
  const textSpan = document.getElementById('orbitSpinText');

  if (btnPrev) {
    btnPrev.onclick = () => {
      const n = orbitCardElements.length;
      if (n > 0) {
        const step = (2 * Math.PI) / n;
        orbitTargetAngle = (orbitTargetAngle !== null ? orbitTargetAngle : orbitCurrentAngle) + step;
      }
    };
  }

  if (btnNext) {
    btnNext.onclick = () => {
      const n = orbitCardElements.length;
      if (n > 0) {
        const step = (2 * Math.PI) / n;
        orbitTargetAngle = (orbitTargetAngle !== null ? orbitTargetAngle : orbitCurrentAngle) - step;
      }
    };
  }

  if (btnToggle) {
    btnToggle.onclick = () => {
      orbitIsPlaying = !orbitIsPlaying;
      if (iconSpan) iconSpan.textContent = orbitIsPlaying ? '⏸️' : '▶';
      if (textSpan) textSpan.textContent = orbitIsPlaying ? 'หยุดหมุนชั่วคราว' : 'เริ่มหมุนต่อ';
    };
  }

  if (stage) {
    stage.addEventListener('mouseenter', () => {
      orbitIsPlaying = false;
    });
    stage.addEventListener('mouseleave', () => {
      if (!btnToggle || (btnToggle.querySelector('#orbitSpinIcon') && btnToggle.querySelector('#orbitSpinIcon').textContent === '⏸️')) {
        orbitIsPlaying = true;
      }
    });

    // Pointer Drag & Swipe
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      orbitIsDragging = true;
      orbitDragStartX = e.clientX;
      orbitDragStartAngle = orbitCurrentAngle;
      orbitTargetAngle = null;
      stage.setPointerCapture?.(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
      if (!orbitIsDragging) return;
      const deltaX = e.clientX - orbitDragStartX;
      orbitCurrentAngle = orbitDragStartAngle + (deltaX * 0.005);
      updateOrbitPositions();
    });

    window.addEventListener('pointerup', () => {
      if (orbitIsDragging) {
        orbitIsDragging = false;
      }
    });
  }

  window.addEventListener('resize', () => {
    updateOrbitPositions();
  });
}

function initPortfolioViewSwitcher() {
  const btnOrbit = document.getElementById('btnModeOrbit');
  const btnGrid = document.getElementById('btnModeGrid');
  const orbitWrap = document.getElementById('houseOrbitWrapper');
  const gridContainer = document.getElementById('houseGridContainer');
  const badgeWrap = document.getElementById('housesCountBadgeWrap');
  const bottomWrap = document.getElementById('housesViewAllBottomWrap');

  function applyViewMode(mode) {
    activePortfolioView = mode;
    if (mode === 'orbit') {
      if (btnOrbit) btnOrbit.classList.add('active');
      if (btnGrid) btnGrid.classList.remove('active');
      if (orbitWrap) orbitWrap.style.display = 'block';
      if (gridContainer) gridContainer.style.display = 'none';
      if (badgeWrap) badgeWrap.style.display = 'none';
      if (bottomWrap) bottomWrap.style.display = 'none';
      startOrbitAnimation();
      updateOrbitPositions();
    } else {
      if (btnOrbit) btnOrbit.classList.remove('active');
      if (btnGrid) btnGrid.classList.add('active');
      if (orbitWrap) orbitWrap.style.display = 'none';
      if (gridContainer) gridContainer.style.display = 'grid';
      stopOrbitAnimation();
      renderHouseGrid();
    }
  }

  if (btnOrbit) {
    btnOrbit.onclick = () => applyViewMode('orbit');
  }
  if (btnGrid) {
    btnGrid.onclick = () => applyViewMode('grid');
  }

  applyViewMode('orbit');
}


function initHouseFilter() {
  initPortfolioViewSwitcher();
  initOrbitCarouselEngine();
  renderHouseGrid();

  const filterBtns = document.querySelectorAll('.filter-bar .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeHouseFilter = btn.getAttribute('data-filter') || 'all';
      renderHouseGrid();
    });
  });

  // Real-time synchronization when admin adds/deletes houses in dashboard
  window.addEventListener('storage', (e) => {
    if (e.key === 'rm_tiktok_clips') renderTikTokFeed();
    if (e.key === 'rm_portfolio_items') {
      renderHouseGrid();
    }
  });

  window.addEventListener('tiktokUpdated', () => { renderTikTokFeed(); });
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
  const gallery = (house.gallery && house.gallery.length > 0) ? house.gallery : [house.cover];
  let currentIndex = 0;

  function getImgTag(url, idx) {
    if (!url) return 'ภาพตัวบ้าน';
    const lower = url.toLowerCase();
    if (lower.includes('plan-nordic-fl1') || lower.includes('fl1') || lower.includes('floor-1')) return 'แปลนชั้น 1';
    if (lower.includes('plan-nordic-fl2') || lower.includes('fl2') || lower.includes('floor-2')) return 'แปลนชั้น 2';
    if (lower.includes('plan') || lower.includes('แปลน') || lower.endsWith('.svg')) return 'แปลนสถาปัตยกรรม';
    if (lower.includes('interior') || lower.includes('โถง') || lower.includes('ห้อง')) return 'ภายใน / ตกแต่ง';
    if (lower.includes('engineer') || lower.includes('qc') || lower.includes('standard')) return 'มาตรฐานวิศวกรรม';
    if (idx === 0) return 'รูปหน้าบ้าน';
    return `มุมที่ ${idx + 1}`;
  }

  const features = (house.features && house.features.length > 0) ? house.features : [
    'โครงสร้างคอนกรีตเสริมเหล็ก ต้านแผ่นดินไหวตาม มยผ.',
    'ควบคุมงานก่อสร้างโดยทีมวิศวกร กว. ทุกขั้นตอน',
    'รับประกันงานโครงสร้าง 20 ปี และงานสถาปัตยกรรม 2 ปีเต็ม'
  ];

  modalContent.innerHTML = `
    <!-- 1. Hero Photo & Plan Viewer with Multi-angle Carousel -->
    <div class="house-modal-hero">
      <img id="modalMainCoverImg" src="${gallery[0]}" alt="${house.title}">
      ${gallery.length > 1 ? `
        <button class="gallery-nav-btn gallery-nav-prev" id="btnModalGalleryPrev" title="รูปก่อนหน้า">❮</button>
        <button class="gallery-nav-btn gallery-nav-next" id="btnModalGalleryNext" title="รูปถัดไป">❯</button>
      ` : ''}
      <div class="gallery-counter-pill" id="modalGalleryCounter">
        รูปที่ 1/${gallery.length} • ${getImgTag(gallery[0], 0)}
      </div>
      <div class="gallery-zoom-hint">
        📐 คลิกภาพเพื่อสลับมุมมอง &amp; แปลน
      </div>
    </div>

    <!-- 2. Thumbnail Strip (Multi-angle photos & Floor plans) -->
    <div class="modal-gallery-thumbs-wrap" id="modalThumbStrip">
      ${gallery.map((imgUrl, i) => `
        <div class="modal-gallery-thumb-item ${i === 0 ? 'active' : ''}" data-index="${i}" data-src="${imgUrl}">
          <img src="${imgUrl}" alt="${house.title} thumb ${i + 1}" loading="lazy">
          <span class="thumb-tag">${getImgTag(imgUrl, i)}</span>
        </div>
      `).join('')}
    </div>

    <!-- 3. Title, Category & Pricing Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.25rem; margin-top:1.5rem; margin-bottom:1.25rem; padding-bottom:1.25rem; border-bottom:1px solid rgba(212,175,55,0.2);">
      <div>
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.35rem;">
          <span style="background:linear-gradient(135deg, #0e3d29, #145338); color:#ffd700; border:1px solid #d4af37; padding:0.2rem 0.75rem; border-radius:9999px; font-size:0.78rem; font-weight:700;">
            ${house.category || 'โมเดิร์น'}
          </span>
          <span style="background:rgba(212,175,55,0.15); color:#ffd700; border:1px solid rgba(212,175,55,0.4); padding:0.2rem 0.75rem; border-radius:9999px; font-size:0.78rem;">
            ${house.type || 'แบบบ้านพร้อมสร้าง'}
          </span>
        </div>
        <h2 style="font-size:1.85rem; color:#fff; font-weight:800; font-family:var(--font-serif); margin:0.35rem 0;">${house.title}</h2>
        <div style="font-size:0.9rem; color:#a7f3d0; display:flex; align-items:center; gap:0.4rem;">
          <span>📍 ทำเลรองรับ: ${house.location || 'จังหวัดระยอง และพื้นที่เศรษฐกิจ EEC'}</span>
        </div>
      </div>
      <div style="text-align:right;">
        <span style="font-size:0.8rem; color:var(--text-dim); display:block; text-transform:uppercase; letter-spacing:1px;">งบประมาณก่อสร้างเริ่มต้น</span>
        <span style="font-size:1.85rem; font-weight:800; color:#ffd700; font-family:var(--font-serif); text-shadow:0 0 20px rgba(212,175,55,0.3);">฿ ${priceFormatted}</span>
      </div>
    </div>

    <!-- 4. Quick Specifications Grid (4 Columns) -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem; background:rgba(7,31,22,0.85); border:1px solid rgba(212,175,55,0.3); border-radius:14px; padding:1.15rem; margin-bottom:1.5rem; text-align:center;">
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:0.2rem;">📐 พื้นที่ใช้สอย</div>
        <strong style="font-size:1.1rem; color:#fff; font-weight:700;">${house.area} ตร.ม.</strong>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:0.2rem;">🏢 จำนวนชั้น</div>
        <strong style="font-size:1.1rem; color:#fff; font-weight:700;">${house.floors || '1'} ชั้น</strong>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:0.2rem;">🛏️ ห้องนอน</div>
        <strong style="font-size:1.1rem; color:#fff; font-weight:700;">${house.bedrooms} ห้อง</strong>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:0.2rem;">🚿 ห้องน้ำ</div>
        <strong style="font-size:1.1rem; color:#fff; font-weight:700;">${house.bathrooms} ห้อง</strong>
      </div>
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:0.2rem;">🚗 ที่จอดรถ</div>
        <strong style="font-size:1.1rem; color:#fff; font-weight:700;">${house.parking} คัน</strong>
      </div>
    </div>

    <!-- 5. Description written by Admin -->
    <div style="margin-bottom:1.75rem; background:rgba(6,36,23,0.5); border-left:3px solid #d4af37; padding:1rem 1.25rem; border-radius:0 12px 12px 0;">
      <h4 style="color:#ffd700; font-size:1rem; margin-bottom:0.4rem; display:flex; align-items:center; gap:0.4rem;">
        <span>📝</span> รายละเอียดโครงการ (RMHome Design):
      </h4>
      <p style="color:#e2e8f0; line-height:1.75; font-size:0.95rem; margin:0;">${house.description || 'แบบบ้านคุณภาพพรีเมียมจาก RMHome ระยอง ออกแบบฟังก์ชันครบครัน คุมงบได้จริง 100%'}</p>
    </div>

    <!-- 6. Features & Plan Specs written by Admin -->
    <div style="margin-bottom:2rem;">
      <h4 style="color:#ffd700; font-size:1.05rem; margin-bottom:0.85rem; display:flex; align-items:center; gap:0.5rem;">
        <span>✦</span> จุดเด่น สเปกวัสดุ &amp; แปลนฟังก์ชัน (Specs &amp; Floor Plans):
      </h4>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.6rem;">
        ${features.map(f => `
          <div style="font-size:0.9rem; color:#cbd5e1; display:flex; align-items:flex-start; gap:0.5rem; background:rgba(255,255,255,0.03); border:1px solid rgba(212,175,55,0.15); padding:0.65rem 0.85rem; border-radius:8px;">
            <span style="color:#ffd700; font-size:0.85rem; line-height:1.4;">✦</span>
            <span style="line-height:1.5;">${f}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 7. Action Buttons -->
    <div style="display:flex; gap:0.85rem; justify-content:space-between; align-items:center; flex-wrap:wrap; padding-top:1.25rem; border-top:1px solid rgba(212,175,55,0.2);">
      <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
        <a href="tel:0912998797" class="btn" style="background:linear-gradient(135deg, #0e3d29, #145338); color:#ffd700; border:1px solid #d4af37; padding:0.65rem 1.25rem; font-weight:700; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none; border-radius:8px;">
          <span>📞</span> โทรปรึกษาวิศวกร: 091-299-8797
        </a>
        <a href="${window.RM_LINE_URL || 'https://line.me/ti/p/~sunny_anavin'}" target="_blank" rel="noopener" class="btn btn-modal-line" style="background:#06c755; color:#fff; padding:0.65rem 1.25rem; font-weight:600; display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none; border-radius:8px;">
          <span>💬</span> ขอแปลนฉบับเต็มทาง LINE
        </a>
      </div>
      <div style="display:flex; gap:0.75rem; align-items:center;">
        <button class="btn btn-outline-gold" id="btnModalCloseSecondary" style="padding:0.65rem 1.2rem; border-radius:8px;">ปิด</button>
        <a href="#contact" class="btn btn-gold" onclick="selectHouseToConsult('${house.title}')" style="padding:0.65rem 1.35rem; border-radius:8px; font-weight:700;">
          ปรึกษาสร้างแบบนี้ ➔
        </a>
      </div>
    </div>
  `;

  // Gallery Navigation Handlers
  const mainCoverImg = modalContent.querySelector('#modalMainCoverImg');
  const counterPill = modalContent.querySelector('#modalGalleryCounter');
  const thumbItems = modalContent.querySelectorAll('.modal-gallery-thumb-item');
  const btnPrev = modalContent.querySelector('#btnModalGalleryPrev');
  const btnNext = modalContent.querySelector('#btnModalGalleryNext');

  function updateGallery(newIndex) {
    if (newIndex < 0) newIndex = gallery.length - 1;
    if (newIndex >= gallery.length) newIndex = 0;
    currentIndex = newIndex;

    const currentUrl = gallery[currentIndex];
    if (mainCoverImg) {
      mainCoverImg.style.opacity = '0.3';
      setTimeout(() => {
        mainCoverImg.src = currentUrl;
        mainCoverImg.style.opacity = '1';
      }, 120);
    }

    if (counterPill) {
      counterPill.innerHTML = `รูปที่ ${currentIndex + 1}/${gallery.length} • ${getImgTag(currentUrl, currentIndex)}`;
    }

    thumbItems.forEach((t, i) => {
      if (i === currentIndex) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        t.classList.remove('active');
      }
    });
  }

  if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); updateGallery(currentIndex - 1); });
  if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); updateGallery(currentIndex + 1); });

  thumbItems.forEach(t => {
    t.addEventListener('click', () => {
      const idx = parseInt(t.getAttribute('data-index'), 10);
      updateGallery(idx);
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
    const allHousesModal = document.getElementById('allHousesModal');
    if (allHousesModal && allHousesModal.classList.contains('open')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function formatLeadDateTime(d = new Date()) {
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()] || '';
  const year = d.getFullYear(); // ค.ศ.
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `เวลา ${hours}:${minutes} น. วันที่ ${day} ${month} ${year}`;
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
    const now = new Date();
    newLead.id = 'lead_' + now.getTime();
    newLead.time = formatLeadDateTime(now);
    newLead.createdAt = now.toISOString();
    leads.unshift(newLead);
    localStorage.setItem('rm_leads', JSON.stringify(leads));
    if (window.CloudSync && window.CloudSync.isConnected()) {
      window.CloudSync.saveItem('rm_leads', leads);
    }
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
  initUserReviewModal();
  renderServices();
  renderStandards();
  renderTikTokFeed();
  renderWorkflow();

  // Cross-tab/window real-time sync via storage event
  window.addEventListener('storage', (e) => {
    if (e.key === 'rm_tiktok_clips') renderTikTokFeed();
    if (e.key === 'rm_site_info' || e.key === 'rm_last_sync_timestamp') renderSiteInfo();
    if (e.key === 'rm_reviews' || e.key === 'rm_last_sync_timestamp') renderReviews();
    if (e.key === 'rm_services' || e.key === 'rm_last_sync_timestamp') renderServices();
    if (e.key === 'rm_standards' || e.key === 'rm_last_sync_timestamp') renderStandards();
    if (e.key === 'rm_why_us' || e.key === 'rm_last_sync_timestamp') renderTikTokFeed();
    if (e.key === 'rm_workflow' || e.key === 'rm_last_sync_timestamp') renderWorkflow();
    if (e.key === 'rm_portfolio_items' || e.key === 'rm_last_sync_timestamp') renderHouseGrid();
  });

  // In-page real-time sync event
  window.addEventListener('contentUpdated', () => {
    renderSiteInfo();
    renderReviews();
    renderServices();
    renderStandards();
    renderTikTokFeed();
    renderWorkflow();
    renderHouseGrid();
  });
}

function createReviewCardNode(rev) {
  const card = document.createElement('div');
  card.className = 'review-card';

  const avatarHtml = rev.image
    ? `<img src="${escapeHtml(rev.image)}" alt="${escapeHtml(rev.name)}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #ffd700;" onerror="this.outerHTML='<div class=\\\'reviewer-avatar\\\'>${escapeHtml((rev.name || 'ค').charAt(0))}</div>'">`
    : `<div class="reviewer-avatar">${escapeHtml((rev.name || 'ค').charAt(0))}</div>`;

  const ratingVal = parseInt(rev.rating, 10) || 5;
  let starsStr = '';
  for (let i = 1; i <= 5; i++) {
    starsStr += (i <= ratingVal) ? '★' : '☆';
  }

  card.innerHTML = `
    <div class="review-stars">${starsStr}</div>
    <p class="review-text">"${escapeHtml(rev.text)}"</p>
    <div class="reviewer-meta">
      ${avatarHtml}
      <div>
        <div class="reviewer-name">${escapeHtml(rev.name)}</div>
        <div class="reviewer-loc">${escapeHtml(rev.role || 'ลูกค้าสร้างบ้าน RM HOME')}</div>
      </div>
    </div>
  `;
  return card;
}

function getStoredReviewsForWeb() {
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
        role: 'เจ้าของบ้าน Modern Tropical',
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
  return reviews;
}

function openAllReviewsModal() {
  const modal = document.getElementById('allReviewsModal');
  const grid = document.getElementById('allReviewsModalGrid');
  const countText = document.getElementById('allReviewsModalCountText');
  if (!modal || !grid) return;

  const reviews = getStoredReviewsForWeb();

  if (countText) {
    countText.textContent = `(ทั้งหมด ${reviews.length} รีวิว)`;
  }

  grid.innerHTML = '';
  reviews.forEach(rev => {
    grid.appendChild(createReviewCardNode(rev));
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderReviews() {
  const container = document.getElementById('reviewsGridContainer');
  if (!container) return;

  const reviews = getStoredReviewsForWeb();
  const totalCount = reviews.length;

  // 1. Dynamic Extra Reviews Counter Badge (เด้งขึ้นโมดอลกลางจอ)
  const badgeWrap = document.getElementById('reviewsCountBadgeWrap');
  const moreCountText = document.getElementById('reviewsMoreCountText');
  const toggleBtn = document.getElementById('btnToggleAllReviews');

  if (totalCount > 3) {
    if (badgeWrap) badgeWrap.style.display = 'block';
    const remaining = totalCount - 3;
    if (moreCountText) {
      moreCountText.textContent = `✨ มีอีก ${remaining} รีวิวจากลูกค้าจริง (คลิกเพื่อดูทั้งหมดกลางจอ ➔)`;
    }
  } else {
    if (badgeWrap) badgeWrap.style.display = 'none';
  }

  // Bind modal open click
  if (toggleBtn && !toggleBtn._hasModalClick) {
    toggleBtn._hasModalClick = true;
    toggleBtn.addEventListener('click', () => openAllReviewsModal());
  }

  // Always render ONLY top 3 reviews on the main page (ไม่ต้องไปเติมข้างล่าง)
  const displayedReviews = reviews.slice(0, 3);
  container.innerHTML = '';
  displayedReviews.forEach(rev => {
    container.appendChild(createReviewCardNode(rev));
  });
}

function initUserReviewModal() {
  const modal = document.getElementById('userReviewModal');
  const openBtn = document.getElementById('btnOpenUserReviewModal');
  const closeBtn = document.getElementById('closeUserReviewModalBtn');
  const cancelBtn = document.getElementById('btnCancelUserReview');
  const form = document.getElementById('userReviewForm');
  const uploadBtn = document.getElementById('btnUserReviewUploadImg');
  const fileInput = document.getElementById('userReviewFileInput');
  const fileNameSpan = document.getElementById('userReviewFileName');
  const previewBox = document.getElementById('userReviewPreviewBox');
  const previewImg = document.getElementById('userReviewPreviewImg');
  const starPicker = document.getElementById('starRatingPicker');
  const ratingInput = document.getElementById('userReviewRatingInput');
  const starLabel = document.getElementById('starRatingLabel');

  if (!modal) return;

  let selectedRating = 5;
  let compressedReviewImg = '';

  const ratingDescriptions = {
    1: '★☆☆☆☆ (1/5 ต้องปรับปรุง)',
    2: '★★☆☆☆ (2/5 พอใช้)',
    3: '★★★☆☆ (3/5 ปานกลาง)',
    4: '★★★★☆ (4/5 ดีมาก)',
    5: '★★★★★ (5/5 ดีเยี่ยม ประทับใจมาก)'
  };

  function updateStars(val) {
    if (!starPicker) return;
    const starBtns = starPicker.querySelectorAll('.star-btn');
    starBtns.forEach(btn => {
      const r = parseInt(btn.getAttribute('data-rating'), 10);
      if (r <= val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    if (ratingInput) ratingInput.value = val;
    if (starLabel) starLabel.textContent = ratingDescriptions[val] || `${val}/5`;
  }

  // Star Rating Interaction
  if (starPicker) {
    const starBtns = starPicker.querySelectorAll('.star-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(btn.getAttribute('data-rating'), 10);
        starBtns.forEach(b => {
          const r = parseInt(b.getAttribute('data-rating'), 10);
          if (r <= hoverVal) b.classList.add('hover');
          else b.classList.remove('hover');
        });
      });

      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => b.classList.remove('hover'));
      });

      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.getAttribute('data-rating'), 10);
        updateStars(selectedRating);
      });
    });
  }

  // Open Modal
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      if (form) form.reset();
      selectedRating = 5;
      compressedReviewImg = '';
      updateStars(5);
      if (fileNameSpan) fileNameSpan.textContent = 'ยังไม่ได้เลือกไฟล์ (ระบบจะย่อรูปให้อัตโนมัติ)';
      if (previewBox) previewBox.style.display = 'none';
      if (previewImg) previewImg.src = '';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Photo Upload & Auto Compression
  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      if (fileNameSpan) fileNameSpan.textContent = `📷 ${file.name}`;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 500;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          compressedReviewImg = canvas.toDataURL('image/jpeg', 0.8);
          if (previewImg) previewImg.src = compressedReviewImg;
          if (previewBox) previewBox.style.display = 'block';
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Handle Submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('userReviewName');
      const roleInput = document.getElementById('userReviewRole');
      const textInput = document.getElementById('userReviewText');

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const roleVal = roleInput ? roleInput.value.trim() : '';
      const textVal = textInput ? textInput.value.trim() : '';

      if (!nameVal || !textVal) {
        alert('กรุณากรอกชื่อและข้อความรีวิวให้ครบถ้วนครับ');
        return;
      }

      const newReview = {
        id: 'rev_' + Date.now(),
        name: nameVal,
        role: roleVal || 'ลูกค้าสร้างบ้าน RM HOME',
        image: compressedReviewImg || '',
        text: textVal,
        rating: selectedRating,
        createdAt: new Date().toISOString()
      };

      let reviews = [];
      try {
        const raw = localStorage.getItem('rm_reviews');
        if (raw) reviews = JSON.parse(raw);
      } catch (err) {}

      if (!reviews || reviews.length === 0) {
        reviews = [
          {
            id: 'rev_01',
            name: 'คุณก้อย',
            role: 'เจ้าของบ้าน Modern Tropical',
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

      // Prepend so new review is at the top
      reviews.unshift(newReview);

      // Save to localStorage (CloudSync intercepts and sends to Firebase Realtime DB)
      localStorage.setItem('rm_reviews', JSON.stringify(reviews));

      // Close modal & reset
      closeModal();
      form.reset();
      compressedReviewImg = '';

      // Re-render reviews on website
      renderReviews();

      // Trigger cross-component sync
      window.dispatchEvent(new Event('contentUpdated'));

      // Friendly notification
      alert(`🎉 ขอบคุณ คุณ"${nameVal}" มากครับสำหรับรีวิวความประทับใจ!\n\nรีวิวของคุณได้รับการบันทึกและแสดงบนเว็บไซต์ รวมถึงส่งไปยังแดชบอร์ดแอดมินเรียบร้อยแล้วครับ ✨`);
    });
  }
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

/* ---------------------------------------------------------
   TikTok Video Feed System (Real-time Sync with Admin Dashboard)
   --------------------------------------------------------- */
const DEFAULT_TIKTOK_CLIPS = [
  {
    id: 'tiktok_01',
    title: '🏡 พาชมแบบบ้านสไตล์นอร์ดิกสร้างเสร็จจริง อ.ปลวกแดง ระยอง คุมงบได้ 100% สเปกวิศวกร กว.',
    url: 'https://www.tiktok.com/@rm.home.design.co/video/7312345678901234567',
    videoId: '7312345678901234567',
    tag: 'พาชมบ้านจริง',
    author: '@rm.home.design.co',
    createdAt: '2026-11-01'
  },
  {
    id: 'tiktok_02',
    title: '🌴 ส่งมอบบ้านพูลวิลล่าสไตล์โมเดิร์น พร้อมสระว่ายน้ำระบบเกลือ อ.แกลง ระยอง สวยตรงปก 100%',
    url: 'https://www.tiktok.com/@rm.home.design.co/video/7323456789012345678',
    videoId: '7323456789012345678',
    tag: 'ส่งมอบบ้าน',
    author: '@rm.home.design.co',
    createdAt: '2026-11-02'
  },
  {
    id: 'tiktok_03',
    title: '👷‍♂️ วิศวกรตรวจงานตอกเสาเข็มลึกถึงชั้นดินดาน (Solid Soil Layer) มั่นใจบ้านไม่ทรุดตัวในระยอง',
    url: 'https://www.tiktok.com/@rm.home.design.co/video/7334567890123456789',
    videoId: '7334567890123456789',
    tag: 'งานวิศวกรรม',
    author: '@rm.home.design.co',
    createdAt: '2026-11-03'
  }
];

function extractTikTokVideoId(url) {
  if (!url) return '';
  url = url.trim();
  if (/^\d{15,22}$/.test(url)) return url;
  const matchVideo = url.match(/\/video\/(\d+)/);
  if (matchVideo && matchVideo[1]) return matchVideo[1];
  const matchItem = url.match(/item_id=(\d+)/);
  if (matchItem && matchItem[1]) return matchItem[1];
  const matchV = url.match(/\/v\/(\d+)/);
  if (matchV && matchV[1]) return matchV[1];
  return '';
}

function getStoredTikTokClipsForWeb() {
  try {
    const raw = localStorage.getItem('rm_tiktok_clips');
    if (!raw) {
      localStorage.setItem('rm_tiktok_clips', JSON.stringify(DEFAULT_TIKTOK_CLIPS));
      return DEFAULT_TIKTOK_CLIPS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('rm_tiktok_clips', JSON.stringify(DEFAULT_TIKTOK_CLIPS));
      return DEFAULT_TIKTOK_CLIPS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_TIKTOK_CLIPS;
  }
}

function renderTikTokFeed() {
  const container = document.getElementById('tiktokGridContainer');
  if (!container) return;

  const clips = getStoredTikTokClipsForWeb();
  container.innerHTML = '';

  if (clips.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem; color:#94a3b8; background:rgba(4,20,14,0.6); border-radius:16px; border:1px dashed rgba(212,175,55,0.3);">
        <p style="font-size:1.1rem; color:#ffd700; margin-bottom:0.5rem;">📱 ยังไม่มีคลิป TikTok ในระบบ</p>
        <p style="font-size:0.88rem; color:#cbd5e1;">แอดมินสามารถแปะลิงก์คลิปจาก TikTok ผ่านระบบหลังบ้านเพื่ออัปเดตขึ้นหน้านี้ได้ทันที</p>
      </div>
    `;
    return;
  }

  clips.forEach(clip => {
    const card = document.createElement('article');
    card.className = 'tiktok-card';
    const videoId = clip.videoId || extractTikTokVideoId(clip.url);
    const author = clip.author || '@rm.home.design.co';
    const tag = clip.tag || 'คลิปผลงานจริง';
    const clipUrl = clip.url || `https://www.tiktok.com/@rm.home.design.co/video/${videoId}`;

    let mediaHtml = '';
    if (videoId) {
      mediaHtml = `
        <div class="tiktok-frame-wrap">
          <iframe 
            src="https://www.tiktok.com/embed/v2/${videoId}" 
            title="${clip.title}"
            loading="lazy" 
            allowfullscreen 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
          </iframe>
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="tiktok-frame-wrap" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0.75rem; background:radial-gradient(circle, #0e3d29 0%, #03140d 100%); text-align:center;">
          <div style="width:40px; height:40px; border-radius:50%; background:#010101; border:1.5px solid #25f4ee; display:flex; align-items:center; justify-content:center; margin-bottom:0.4rem; box-shadow:0 0 10px rgba(37,244,238,0.4);">
            <svg style="width:20px; height:20px; fill:#fff;" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.48V8.75a8.16 8.16 0 0 0 4.82 1.57V6.87c-.334-.047-.667-.107-1-.18z"/></svg>
          </div>
          <p style="color:#ffffff; font-weight:600; font-size:0.72rem; margin-bottom:0.4rem; line-height:1.25;">${clip.title}</p>
          <a href="${clipUrl}" target="_blank" rel="noopener" class="btn btn-gold" style="padding:0.25rem 0.65rem; font-size:0.68rem; border-radius:50px;">
            ▶ ชมบน TikTok
          </a>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="tiktok-card-header">
        <div class="tiktok-card-author">
          <svg style="width:16px; height:16px; fill:#25f4ee;" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.48V8.75a8.16 8.16 0 0 0 4.82 1.57V6.87c-.334-.047-.667-.107-1-.18z"/></svg>
          <span>${author}</span>
        </div>
        <span class="tiktok-badge-pill">${tag}</span>
      </div>
      ${mediaHtml}
      <div class="tiktok-card-body">
        <h4 class="tiktok-card-title">${clip.title}</h4>
        <div class="tiktok-card-action">
          <span style="font-size:0.78rem; color:#94a3b8;">RMHome Official Clip</span>
          <a href="${clipUrl}" target="_blank" rel="noopener" class="btn-open-tiktok-clip">
            ชมคลิปนี้บน TikTok ➔
          </a>
        </div>
      </div>
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
    if (info.address) {
      const elMain = document.getElementById('siteAddressMain');
      if (elMain) elMain.textContent = info.address;
      const elFooter = document.getElementById('siteAddressFooter');
      if (elFooter) elFooter.textContent = `📍 ${info.address}`;
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

    let lineLink = info.lineUrl || 'https://line.me/ti/p/~sunny_anavin';
    let lineId = info.lineId || 'sunny_anavin';
    if (lineId === '@sunny_anavin' || lineId === '@sunny') lineId = 'sunny_anavin';
    if (lineLink.includes('@sunny_anavin') || lineLink.includes('/R/ti/p/@')) {
      lineLink = 'https://line.me/ti/p/~sunny_anavin';
    }
    window.RM_LINE_URL = lineLink;
    window.RM_LINE_ID = lineId;

    const bannerLink = document.getElementById('siteLineBannerLink');
    if (bannerLink) bannerLink.href = lineLink;

    const bannerText = document.getElementById('siteLineIdText');
    if (bannerText) bannerText.textContent = `LINE ID: ${lineId}`;

    const footerLink = document.getElementById('siteFooterLineLink');
    if (footerLink) {
      footerLink.href = lineLink;
      footerLink.textContent = lineId;
    }

    const floatLink = document.getElementById('siteFloatLineLink');
    if (floatLink) floatLink.href = lineLink;
  } catch (e) {}
}

// ==========================================================================
// CloudSync Global Realtime Listener for All Visitors & Devices
// ==========================================================================
(function initCloudRealtime() {
  function refreshAllUI() {
    if (typeof renderHouseGrid === 'function') renderHouseGrid();
    if (typeof renderReviews === 'function') renderReviews();
    if (typeof renderServices === 'function') renderServices();
    if (typeof renderStandards === 'function') renderStandards();
    if (typeof renderWhyUs === 'function') renderTikTokFeed();
    if (typeof renderWorkflow === 'function') renderWorkflow();
    if (typeof renderSiteInfo === 'function') renderSiteInfo();
  }

  if (window.CloudSync && window.CloudSync.isConnected()) {
    // 1. โหลดข้อมูลสดจาก Cloud ทันทีที่เปิดหน้าเว็บ
    window.CloudSync.fetchAll().then(cloudData => {
      if (cloudData) {
        refreshAllUI();
      }
    });

    // 2. ฟังการอัปเดตแบบเรียลไทม์จากแดชบอร์ด (เมื่อแอดมินแก้ไขปุ๊บ หน้าเว็บผู้ใช้จะอัปเดตปั๊บ)
    if (typeof window.CloudSync.startRealtimeListener === 'function') {
      window.CloudSync.startRealtimeListener(() => {
        refreshAllUI();
      });
    }
  }
})();

function initAllCenterModals() {
  const allHousesModal = document.getElementById('allHousesModal');
  const closeHousesBtn = document.getElementById('closeAllHousesModalBtn');
  const allReviewsModal = document.getElementById('allReviewsModal');
  const closeReviewsBtn = document.getElementById('closeAllReviewsModalBtn');
  const btnOpenUserReviewFromAll = document.getElementById('btnOpenUserReviewFromAllModal');

  function closeAllHouses() {
    if (allHousesModal) allHousesModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllReviews() {
    if (allReviewsModal) allReviewsModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeHousesBtn) closeHousesBtn.addEventListener('click', closeAllHouses);
  if (allHousesModal) {
    allHousesModal.addEventListener('click', (e) => {
      if (e.target === allHousesModal) closeAllHouses();
    });
  }

  if (closeReviewsBtn) closeReviewsBtn.addEventListener('click', closeAllReviews);
  if (allReviewsModal) {
    allReviewsModal.addEventListener('click', (e) => {
      if (e.target === allReviewsModal) closeAllReviews();
    });
  }

  if (btnOpenUserReviewFromAll) {
    btnOpenUserReviewFromAll.addEventListener('click', () => {
      closeAllReviews();
      const userRevModal = document.getElementById('userReviewModal');
      if (userRevModal) {
        userRevModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  }

  // Global Escape key to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllHouses();
      closeAllReviews();
    }
  });
}
