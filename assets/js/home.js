document.addEventListener('DOMContentLoaded', function (event) {
  // home HT text animation
  gsap.to('.intro_hero .intro_footer .ht_text', {
    x: () => -(document.querySelector('.ht_text').offsetWidth - window.innerWidth),
    ease: 'power1.inOut',
    scrollTrigger: {
      trigger: '.intro_hero',
      scrub: true,
      start: 'top top',
    },
  });

  gsap.fromTo(
    '.intro_text',
    0.4,
    {
      autoAlpha: 0,
      y: -200,
    },
    {
      autoAlpha: 1,
      y: 0,
    },
    0.1,
  );

  new SplitType('.intro_subtext', {
    types: 'words, chars',
  });

  TweenMax.staggerFromTo(
    '.intro_subtext .char',
    0.3,
    {
      autoAlpha: 0,
      scale: 3,
    },
    {
      autoAlpha: 1,
      scale: 1,
    },
    0.15,
  );

  TweenMax.staggerFromTo(
    '.intro_image',
    0.5,
    {
      autoAlpha: 0,
      scale: 3,
    },
    {
      autoAlpha: 1,
      scale: 1,
    },
    0.15,
  );

  // wwd section hover image
  if (window.innerWidth > 992) {
    document.querySelectorAll('.text_block').forEach((element) => {
      const hoverImg =
        element.parentElement.parentElement.parentElement.querySelector('.hover_img');
      element.addEventListener('mouseenter', (e) => {
        const offRight = window.innerWidth - e.clientX - hoverImg.offsetWidth - 100;
        hoverImg.style.opacity = 1;
        hoverImg.style.scale = 1;
        hoverImg.style.right = `${offRight}px`;
      });

      element.addEventListener('mouseleave', (e) => {
        hoverImg.style.opacity = null;
        hoverImg.style.scale = null;
      });
    });
  }

  gsap.to('.focused_section_row_img_1', {
    yPercent: -20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.focused_section_row',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.to('.focused_section_row_img_2', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.focused_section_row',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.to('.focused_section_row_img_3', {
    yPercent: 40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.focused_section_row',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.utils.toArray('.featured-case-study-card-tags').forEach((tags) => {
    gsap.from(tags.querySelectorAll('span'), {
      opacity: 0,
      y: 10,
      duration: 0.65,
      stagger: 0.05,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: tags,
        start: 'top 85%',
        toggleActions: 'play none play reverse',
      },
    });
  });
});
