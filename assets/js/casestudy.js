document.addEventListener('DOMContentLoaded', function (event) {
  new Flickity('.casestudy_featured_carousel', {
    // options
    cellAlign: 'left',
    contain: true,
    draggable: true,
    freeScroll: false,
    prevNextButtons: false,
    pageDots: false,
    watchCSS: true,
  });

  smoother.effects('.casestudy_mobile_image.img_1', {
    speed: 0.985,
  });

  smoother.effects('.casestudy_mobile_image.img_2', {
    speed: 1.005,
  });

  smoother.effects('.casestudy_mobile_image.img_3', {
    speed: 1.003,
  });

  smoother.effects('.casestudy_mobile_image.img_4', {
    speed: 0.935,
  });

  // scale image animation
  const scaleImages = document.querySelectorAll('[data-animation="scale"]');
  scaleImages.forEach((scaleImage) => {
    gsap.to(scaleImage, {
      scale: 1.15,
      duration: 1.5,
      ease: 'back.out',
      scrollTrigger: {
        trigger: scaleImage,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  const headerImage = document.querySelector('.cs_anim_header');
  const logo = document.querySelector('.cs_anim_logo');
  const heading = document.querySelector('.cs_anim_heading');
  const restSection = document.querySelector('.rest_of_the_section');
  const animationClass = 'scroll-animation';
  const logoAnimationClass = 'scroll-animation-logo';
  const restAnimationClass = 'scroll-animation-rest';
  const headingAnimationClass = 'scroll-animation-heading';
  var scrollPosition = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > scrollPosition) {
      if (!headerImage.classList.contains(animationClass)) {
        headerImage.classList.add(animationClass);
      }

      if (logo) {
        if (!logo.classList.contains(logoAnimationClass)) {
          logo.classList.add(logoAnimationClass);
        }
      }

      if (!heading.classList.contains(headingAnimationClass)) {
        heading.classList.add(headingAnimationClass);
      }

      if (!restSection.classList.contains(restAnimationClass)) {
        restSection.classList.add(restAnimationClass);
      }
    } else {
      // Scrolling back to the top
      if (headerImage.classList.contains(animationClass)) {
        headerImage.classList.remove(animationClass);
      }

      if (logo) {
        if (logo.classList.contains(logoAnimationClass)) {
          logo.classList.remove(logoAnimationClass);
        }
      }

      if (heading.classList.contains(headingAnimationClass)) {
        heading.classList.remove(headingAnimationClass);
      }

      if (restSection.classList.contains(restAnimationClass)) {
        restSection.classList.remove(restAnimationClass);
      }
    }
    scrollPosition = currentScroll;
  });

  const section = document.querySelector('.casestudy_intro');
  const cards = gsap.utils.toArray('.casestudy_intro_image');

  /* STACKED INITIAL STATE */
  gsap.set(cards[0], {
    //opacity: 0,
    scale: 0.98,
    rotate: 0, // same as first card
  });
  gsap.set(cards[1], {
    opacity: 0,
    scale: 0.96,
    rotate: 0, // same as first card
    x: 0,
    y: 0,
  });

  gsap.set(cards[2], {
    opacity: 0,
    scale: 0.94,
    rotate: 0,
    x: 0,
    y: 0,
  });

  const stackTL = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top 65%',
      end: 'top 90%',
      //scrub: true,
      toggleActions: 'play none reverse none',
      //markers: true,
    },
  });

  stackTL
    .to(cards[0], {
      //opacity: 1,
      rotate: 11.31,
      scale: 1,
      duration: 0.5,
      ease: 'power2.out',
    })
    .to(
      cards[1],
      {
        opacity: 1,
        rotate: 3.35,
        x: 24,
        y: 30,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      },
      '-=0.25',
    )
    .to(
      cards[2],
      {
        opacity: 1,
        rotate: -14.45,
        x: 30,
        y: 30,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      },
      '-=0.5',
    );

  gsap.fromTo(
    '.casestudy_intro_text',
    { yPercent: -100 },
    {
      yPercent: 100,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    },
  );
});
