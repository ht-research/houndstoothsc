gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const smoother = ScrollSmoother.create({
  smooth: 1.25,
  smoothTouch: 0,
  normalizeScroll: true,
});

document.addEventListener('DOMContentLoaded', function () {
  // marquee init
  Marquee3k.init();
  // lozad init
  const observer = lozad();
  observer.observe();

  document.querySelector('.site_menu_modal').style.display = 'none';
  var menuOpen = new TimelineLite({ paused: true });
  menuOpen.to('.site_menu_modal', {
    duration: 1.25,
    ease: 'circ.out',
    yPercent: 100,
    yoyo: true,
  });

  var menuLine = new TimelineLite({ paused: true });
  menuLine.to('.site_navbar li .site_nav_line', {
    duration: 0.5,
    stagger: 0.2,
    backgroundColor: '#000',
    width: '100%',
    ease: 'easy.out',
  });

  var menuList = new TimelineLite({ paused: true });
  menuList.to('.site_navbar li .site_nav_content', {
    duration: 0.6,
    stagger: 0.25,
    opacity: 1,
    ease: 'easy.out',
    y: 0,
  });

  // Mega menu
  document.querySelector('.menu_toggle_open').addEventListener('click', () => {
    menuOpen.play();
    menuList.play();
    menuLine.play();
    //document.body.setAttribute('data-modal', true)
    document.body.setAttribute('data-overflow', true);
  });

  document.querySelector('.menu_toggle_close').addEventListener('click', () => {
    menuLine.reverse();
    menuList.reverse();
    menuOpen.reverse().duration(0.75);
    //document.body.removeAttribute('data-modal')
    document.body.removeAttribute('data-overflow');
  });

  const scaleDownImages = document.querySelectorAll('[data-animation="scale-down"]');
  if (scaleDownImages.length > 0) {
    scaleDownImages.forEach((scaleImage) => {
      gsap.fromTo(
        scaleImage,
        { scale: 1.25 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: scaleImage,
            start: 'top 80%',
            end: 'bottom center',
            scrub: true,
          },
        },
      );
    });
  }

  const handleFadeAnimation = (selector) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      const dataDelay = parseFloat(element.dataset.delay) || 0;
      const dataDuration = parseFloat(element.dataset.duration) || 1;
      const dataFade = element.dataset.animation;
      const dataOnce = element.dataset.once === 'true';
      let dataStart = element.dataset.start;
      let yStart = 0;

      // Determine the Y start and default dataStart based on dataFade
      if (!dataStart) {
        if (!dataFade || !dataFade.includes('fade')) return;
        if (dataFade === 'fade-up') {
          yStart = 80;
          dataStart = 'top 98%';
        } else if (dataFade === 'fade-down') {
          yStart = -80;
          dataStart = 'top bottom+=80px';
        } else {
          dataStart = 'top 98%';
        }
      }

      gsap.fromTo(
        element,
        { autoAlpha: 0, y: yStart },
        {
          autoAlpha: 1,
          y: 0,
          duration: dataDuration,
          ease: 'power3.inOut',
          delay: dataDelay,
          scrollTrigger: {
            trigger: element,
            start: dataStart,
            once: dataOnce,
            toggleActions: 'play none play reverse',
          },
        },
      );
    });
  };

  // Initialize fade animations
  handleFadeAnimation('[data-animation]');
});

const siteHeader = document.querySelector('.site_header');

// sticky header
function stickyOnScroll() {
  if (window.scrollY >= siteHeader.offsetHeight) {
    siteHeader.classList.add('sticky_header');
  } else {
    siteHeader.classList.remove('sticky_header');
  }
}

// Apply for window scroll
window.addEventListener('scroll', function () {
  stickyOnScroll();
});

// Apply for window load complete
window.addEventListener('load', () => {
  document.querySelector('.site_menu_modal').style.display = null;
});
