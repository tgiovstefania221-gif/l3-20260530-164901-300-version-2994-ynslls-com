(function() {
  var mobileButton = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var show = function(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    var next = function() {
      show(current + 1);
    };
    var prev = function() {
      show(current - 1);
    };
    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    if (nextButton) {
      nextButton.addEventListener('click', next);
    }
    if (prevButton) {
      prevButton.addEventListener('click', prev);
    }
    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
      });
    });
    show(0);
    setInterval(next, 5000);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-select]');
    var region = scope.querySelector('[data-region-select]');
    var type = scope.querySelector('[data-type-select]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var normalize = function(value) {
      return String(value || '').trim().toLowerCase();
    };
    var apply = function() {
      var keyword = normalize(input ? input.value : '');
      var yearValue = normalize(year ? year.value : '');
      var regionValue = normalize(region ? region.value : '');
      var typeValue = normalize(type ? type.value : '');
      cards.forEach(function(card) {
        var text = normalize(card.getAttribute('data-keywords'));
        var okKeyword = !keyword || text.indexOf(keyword) !== -1;
        var okYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var okRegion = !regionValue || normalize(card.getAttribute('data-region')) === regionValue;
        var okType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
        card.classList.toggle('is-hidden-card', !(okKeyword && okYear && okRegion && okType));
      });
    };
    [input, year, region, type].forEach(function(control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
})();
