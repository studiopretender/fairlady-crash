const revealTargets = document.querySelectorAll(
  ".portal-card, .episode-preview, .route-grid a, .media-links a, .news-list li, .flow div, .team-catalog article, .character-catalog article, .info-grid article, .beginner-list article, .episode-list article, .music-grid article, .gallery-grid article, .relation-map li"
  + ", .wire-box, .wire-card, .wire-button, .wire-visual, .wire-flow div, .wire-flow a"
);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealTargets.forEach(target => {
  target.classList.add("reveal");
  observer.observe(target);
});
