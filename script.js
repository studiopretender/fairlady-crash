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

// Fit headings on a single line: shrink font-size until the text fits.
const oneLineTargets = document.querySelectorAll(
  ".visual-hero .content-stack h1, .about-cinematic-copy h1, .page-hero h1, .teams-intro h1, .story-copy h1, .about-intro h1, .content-card h2, .project-visual-card h2"
);

const fitOneLine = () => {
  oneLineTargets.forEach(el => {
    el.style.fontSize = "";
    el.style.whiteSpace = "nowrap";
    if (!el.clientWidth) {
      el.style.whiteSpace = "";
      return;
    }
    let size = parseFloat(window.getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth && size > 15) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }
    if (el.scrollWidth > el.clientWidth) {
      el.style.whiteSpace = "";
      el.style.fontSize = "";
    }
  });
};

let fitFrame = 0;
const queueFit = () => {
  cancelAnimationFrame(fitFrame);
  fitFrame = requestAnimationFrame(fitOneLine);
};

fitOneLine();
window.addEventListener("resize", queueFit);
window.addEventListener("load", queueFit);

// Gallery lightbox: tap a tile to view the image floating above the page.
const galleryImages = Array.from(document.querySelectorAll(".gallery-tile img"));

if (galleryImages.length) {
  let lightboxIndex = 0;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "画像プレビュー");
  lightbox.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="閉じる">&#10005;</button>' +
    '<button class="lightbox-prev" type="button" aria-label="前の画像">&#8249;</button>' +
    '<img class="lightbox-image" alt="">' +
    '<button class="lightbox-next" type="button" aria-label="次の画像">&#8250;</button>';
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector(".lightbox-image");

  const showImage = index => {
    lightboxIndex = (index + galleryImages.length) % galleryImages.length;
    const source = galleryImages[lightboxIndex];
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt || "";
  };

  const openLightbox = index => {
    showImage(index);
    lightbox.classList.add("is-open");
    document.body.classList.add("no-scroll");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  };

  galleryImages.forEach((img, index) => {
    const tile = img.closest(".gallery-tile");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-label", "画像を拡大表示");
    tile.addEventListener("click", () => openLightbox(index));
    tile.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", event => {
    event.stopPropagation();
    showImage(lightboxIndex - 1);
  });
  lightbox.querySelector(".lightbox-next").addEventListener("click", event => {
    event.stopPropagation();
    showImage(lightboxIndex + 1);
  });
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox || event.target === lightboxImage) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }
    if (event.key === "Escape") {
      closeLightbox();
    } else if (event.key === "ArrowLeft") {
      showImage(lightboxIndex - 1);
    } else if (event.key === "ArrowRight") {
      showImage(lightboxIndex + 1);
    }
  });

  let touchStartX = 0;
  lightbox.addEventListener(
    "touchstart",
    event => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );
  lightbox.addEventListener(
    "touchend",
    event => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 48) {
        showImage(lightboxIndex + (delta < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );
}
