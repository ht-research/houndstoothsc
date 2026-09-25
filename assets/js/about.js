document.addEventListener('DOMContentLoaded', function () {
  // services blob parallax - same treatment as the homepage
  // focused_section_row images
  gsap.to('.services_blob', {
    yPercent: -40,
    ease: 'none',
    scrollTrigger: {
      trigger: '.about_services_section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });

  // marquee text animation
  const marqueeElements = document.querySelectorAll('.marquee-text');
  let marqueeStart = 0;

  function animateMarquee() {
    requestAnimationFrame(animateMarquee);

    marqueeElements.forEach((element) => {
      element.setAttributeNS(null, 'startOffset', marqueeStart + '%');
    });

    if (marqueeStart >= 50) {
      marqueeStart = 0;
    }

    marqueeStart += 0.03;
  }

  animateMarquee();

  // Hero Animation
  window.onbeforeunload = () => {
    window.scrollTo(0, 0);
  };

  //Type Effect
  // array with texts to type in typewriter
  var dataText = ['Thinkers &'];
  var dataText2 = ['Builders'];

  // type one text in the typwriter
  // keeps calling itself until the text is finished
  function typeWriter(text, i, fnCallback) {
    // chekc if text isn't finished yet
    if (i < text.length) {
      // add next character to h1
      document.querySelector('h1').innerHTML =
        text.substring(0, i + 1) + '<span aria-hidden="true"></span>';

      // wait for a while and call this function again for next character
      setTimeout(function () {
        typeWriter(text, i + 1, fnCallback);
      }, 90);
    }
    // text finished, call callback if there is a callback function
    else if (typeof fnCallback == 'function') {
      // call callback after timeout
      setTimeout(fnCallback, 700);
    }
  }
  // type one text in the typwriter
  // keeps calling itself until the text is finished
  function typeWriter2(text, i, fnCallback) {
    // chekc if text isn't finished yet
    if (i < text.length) {
      // add next character to h1
      document.querySelector('h1.heading2').innerHTML =
        '<span aria-hidden="true"></span>' + text.substring(i, text.length);

      // wait for a while and call this function again for next character
      setTimeout(function () {
        typeWriter2(text, i - 1, fnCallback);
      }, 100);
    }
    // text finished, call callback if there is a callback function
    else if (typeof fnCallback == 'function') {
      // call callback after timeout
      setTimeout(fnCallback, 700);
    }
  }

  // start a typewriter animation for a text in the dataText array
  function StartTextAnimation(i) {
    if (typeof dataText[i] == 'undefined') {
      setTimeout(function () {
        StartTextAnimation(0);
      }, 20000);
    }
    // check if dataText[i] exists
    if (i < dataText[i].length) {
      // text exists! start typewriter animation
      typeWriter(dataText[i], 0, function () {
        // after callback (and whole text has been animated), start next text
        // StartTextAnimation(i + 1);
      });
    }
  }
  // start a typewriter animation for a text in the dataText array
  function StartTextAnimation2(i) {
    if (typeof dataText2[i] == 'undefined') {
      setTimeout(function () {
        StartTextAnimation2(0);
      }, 20000);
    }
    // check if dataText[i] exists
    if (i < dataText2[i].length) {
      // text exists! start typewriter animation
      typeWriter2(dataText2[i], dataText2[i].length - 1, function () {
        // after callback (and whole text has been animated), start next text
        //StartTextAnimation2(i + 1);
      });
    }
  }

  // start the text animation
  setTimeout(function () {
    StartTextAnimation(0);
    StartTextAnimation2(0);
  }, 100);

  // Award Animation
  // Get all elements with the class 'menu__link'
  const elements = document.querySelectorAll('.award_title');

  // Loop through each element
  elements.forEach((el) => {
    // Create options object
    const options = {
      animation: {
        text: false,
        line: true,
      },
    };

    // Create 'text' and 'line' elements
    const text = document.createElement('span');
    text.classList.add('menu__link-inner');
    text.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.appendChild(text);

    const line = document.createElement('span');
    line.classList.add('menu__link-deco');
    el.appendChild(line);

    // Set animation options based on data attributes
    if (el.dataset.text !== undefined) {
      options.animation.text = el.dataset.text === 'false' ? false : true;
    }
    if (el.dataset.line !== undefined) {
      options.animation.line = el.dataset.line === 'false' ? false : true;
    }

    // Initialize event listeners
    let tl;

    const onMouseEnterFn = () => tl.restart();
    const onMouseLeaveFn = () => tl.progress(1).kill();

    el.addEventListener('mouseenter', onMouseEnterFn);
    el.addEventListener('mouseleave', onMouseLeaveFn);

    // Create timeline
    function createTimeline() {
      tl = gsap.timeline({
        paused: true,
        onStart: () => {
          if (options.animation.line) {
            line.style.filter = `url(${filterId})`;
          }
          if (options.animation.text) {
            text.style.filter = `url(${filterId})`;
          }
        },
        onComplete: () => {
          if (options.animation.line) {
            line.style.filter = 'none';
          }
          if (options.animation.text) {
            text.style.filter = 'none';
          }
        },
      });
    }

    // Define filterId and other properties specific to LinkFx2
    const filterId = '#filter-2';
    const feTurbulence = document.querySelector(`${filterId} > feTurbulence`);
    const primitiveValues = { turbulence: 0 };

    createTimeline();

    // Update turbulence attribute during timeline update
    tl.eventCallback('onUpdate', () => {
      feTurbulence.setAttribute('baseFrequency', primitiveValues.turbulence);
    });

    // Add animation to turbulence
    tl.to(primitiveValues, {
      duration: 0.4,
      ease: "rough({ template: none.out, strength: 2, points: 120, taper: 'none', randomize: true, clamp: false})",
      startAt: { turbulence: 0.07 },
      turbulence: 0,
    });
  });

  let previousScrollPosition = window.scrollY;

  // Listen for the scroll event
  window.addEventListener('scroll', () => {
    const currentScrollPosition = window.scrollY;

    const leadership1 = document.querySelector('#leadership1');
    const leadership2 = document.querySelector('#leadership2');
    const teamScroll = document.querySelector('#teamScroll');

    let scrollDiff = 400;

    if (window.innerWidth > 992) {
      scrollDiff = 600;
    }
    let rate = currentScrollPosition * 1.2 - currentScrollPosition - scrollDiff;

    leadership1.style.transform = 'translate3d( 0, ' + rate + 'px , 0 ) rotate(-90deg)';
    leadership2.style.transform = 'translate3d( 0, ' + -rate + 'px , 0 ) rotate(90deg)';
    if (window.innerWidth > 992) {
      teamScroll.style.transform = 'translate3d( 0, ' + -rate + 'px , 0 )';
    }

    // Update the previous scroll position
    previousScrollPosition = currentScrollPosition;
  });
});
