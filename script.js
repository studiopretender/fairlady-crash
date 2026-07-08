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

// Character float: profiles opened from team members or the character catalog.
const fcCharacters = window.FC_CHARACTERS || [];
let charaFloat = null;
let charaList = [];
let charaIndex = 0;
let charaLastFocused = null;
let charaPrevHash = "";

const isCharaFloatOpen = () => !!charaFloat && charaFloat.classList.contains("is-open");

function showChara(index) {
  charaIndex = (index + charaList.length) % charaList.length;
  const chara = charaList[charaIndex];
  const visual = charaFloat.querySelector(".chara-float-visual");
  const img = visual.querySelector("img");
  if (chara.image) {
    visual.classList.remove("no-image");
    img.src = chara.image;
    img.alt = chara.name;
  } else {
    visual.classList.add("no-image");
    img.removeAttribute("src");
    img.alt = "";
  }
  charaFloat.querySelector(".chara-float-team").textContent = chara.teamName;
  charaFloat.querySelector(".chara-float-name").textContent = chara.name;
  const reading = charaFloat.querySelector(".chara-float-reading");
  reading.textContent = chara.reading || "";
  reading.style.display = chara.reading ? "" : "none";
  const catchEl = charaFloat.querySelector(".chara-float-catch");
  catchEl.textContent = chara.catch || "";
  catchEl.style.display = chara.catch ? "" : "none";
  const stats = charaFloat.querySelector(".chara-stats");
  stats.innerHTML = "";
  [
    ["年齢", chara.age],
    ["身長・体型", chara.body],
    ["戦闘スタイル", chara.style]
  ].forEach(pair => {
    if (!pair[1]) {
      return;
    }
    const dt = document.createElement("dt");
    dt.textContent = pair[0];
    const dd = document.createElement("dd");
    dd.textContent = pair[1];
    stats.appendChild(dt);
    stats.appendChild(dd);
  });
  const sections = charaFloat.querySelector(".chara-sections");
  sections.innerHTML = "";
  const addSection = (label, text, extraClass) => {
    if (!text) {
      return;
    }
    const labelEl = document.createElement("div");
    labelEl.className = "chara-section-label";
    labelEl.textContent = label;
    sections.appendChild(labelEl);
    String(text).split("\n").forEach(line => {
      if (!line.trim()) {
        return;
      }
      const p = document.createElement("p");
      p.className = "chara-section-text" + (extraClass ? " " + extraClass : "");
      p.textContent = line;
      sections.appendChild(p);
    });
  };
  const wazaName = value => {
    if (!value) {
      return "";
    }
    const names = String(value).match(/【[^】]+】/g);
    return names ? names.join("　") : String(value).split("\n")[0];
  };
  addSection("特性", wazaName(chara.tokusei), "chara-waza");
  addSection("必殺技", wazaName(chara.hissatsu), "chara-waza");
  addSection("超必殺技", wazaName(chara.cho), "chara-waza");
  addSection("性格・特徴", chara.personality);
  addSection("プロフィール", String(chara.profile || "").split("\n").map(v => v.trim()).filter(Boolean)[0] || "");
  addSection("口癖", chara.kuse);
  const shareUrl = "https://studiopretender.github.io/fairlady-crash/chara/" + chara.id + ".html";
  const shareText = "【" + chara.teamName + "】" + chara.name + " " + (chara.catch || "") + " #フェアレディクラッシュ";
  charaFloat.querySelector(".chara-share-x").href =
    "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText) + "&url=" + encodeURIComponent(shareUrl);
  charaFloat.querySelector(".chara-share-copy").dataset.url = shareUrl;
  charaFloat.querySelector(".chara-float-body").scrollTop = 0;
  history.replaceState(null, "", "#chara=" + chara.id);
}

function closeChara() {
  charaFloat.classList.remove("is-open");
  history.replaceState(null, "", charaPrevHash || window.location.pathname + window.location.search);
  document.body.classList.remove("no-scroll");
  if (charaLastFocused) {
    charaLastFocused.focus();
  }
}

function buildCharaFloat() {
  if (charaFloat) {
    return;
  }
  charaFloat = document.createElement("div");
  charaFloat.className = "chara-float";
  charaFloat.setAttribute("role", "dialog");
  charaFloat.setAttribute("aria-modal", "true");
  charaFloat.setAttribute("aria-label", "キャラクター詳細");
  charaFloat.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="閉じる">&#10005;</button>' +
    '<button class="lightbox-prev" type="button" aria-label="前のキャラクター">&#8249;</button>' +
    '<button class="lightbox-next" type="button" aria-label="次のキャラクター">&#8250;</button>' +
    '<article class="chara-float-panel">' +
    '<div class="chara-float-visual"><img alt=""><span class="chara-card-soon">COMING<br>SOON</span></div>' +
    '<div class="chara-float-body">' +
    '<p class="chara-float-team"></p>' +
    '<h2 class="chara-float-name"></h2>' +
    '<p class="chara-float-reading"></p>' +
    '<p class="chara-float-catch"></p>' +
    '<dl class="chara-stats"></dl>' +
    '<div class="chara-sections"></div>' +
    '<div class="chara-share">' +
    '<a class="chara-share-x" target="_blank" rel="noreferrer">Xでシェア</a>' +
    '<button class="chara-share-copy" type="button">リンクをコピー</button>' +
    "</div>" +
    "</div>" +
    "</article>";
  document.body.appendChild(charaFloat);

  const copyButton = charaFloat.querySelector(".chara-share-copy");
  copyButton.addEventListener("click", () => {
    if (!navigator.clipboard) {
      return;
    }
    navigator.clipboard.writeText(copyButton.dataset.url || "").then(() => {
      copyButton.textContent = "コピーしました！";
      setTimeout(() => {
        copyButton.textContent = "リンクをコピー";
      }, 1600);
    });
  });

  charaFloat.querySelector(".lightbox-close").addEventListener("click", closeChara);
  charaFloat.querySelector(".lightbox-prev").addEventListener("click", event => {
    event.stopPropagation();
    showChara(charaIndex - 1);
  });
  charaFloat.querySelector(".lightbox-next").addEventListener("click", event => {
    event.stopPropagation();
    showChara(charaIndex + 1);
  });
  charaFloat.addEventListener("click", event => {
    if (event.target === charaFloat) {
      closeChara();
    }
  });
  document.addEventListener("keydown", event => {
    if (!isCharaFloatOpen()) {
      return;
    }
    if (event.key === "Escape") {
      closeChara();
    } else if (event.key === "ArrowLeft") {
      showChara(charaIndex - 1);
    } else if (event.key === "ArrowRight") {
      showChara(charaIndex + 1);
    }
  });
  let charaTouchX = 0;
  let charaTouchY = 0;
  charaFloat.addEventListener(
    "touchstart",
    event => {
      charaTouchX = event.changedTouches[0].clientX;
      charaTouchY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );
  charaFloat.addEventListener(
    "touchend",
    event => {
      const deltaX = event.changedTouches[0].clientX - charaTouchX;
      const deltaY = event.changedTouches[0].clientY - charaTouchY;
      if (Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
        showChara(charaIndex + (deltaX < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );
}

function openChara(list, index) {
  if (!list.length) {
    return;
  }
  buildCharaFloat();
  charaList = list;
  charaLastFocused = document.activeElement;
  if (!window.location.hash.startsWith("#chara=")) {
    charaPrevHash = window.location.hash;
  }
  showChara(index);
  charaFloat.classList.add("is-open");
  document.body.classList.add("no-scroll");
  charaFloat.querySelector(".lightbox-close").focus();
}

// Team member links: clicking a member name on a team card opens the profile.
const teamCards = Array.from(document.querySelectorAll(".team-card"));

if (teamCards.length && fcCharacters.length) {
  teamCards.forEach(card => {
    const memberDd = card.querySelector("dd");
    if (!memberDd) {
      return;
    }
    const names = memberDd.textContent.split("/").map(v => v.trim()).filter(Boolean);
    memberDd.textContent = "";
    memberDd.classList.add("member-links");
    const memberDt = card.querySelector("dt");
    if (memberDt) {
      const hint = document.createElement("small");
      hint.className = "member-hint";
      hint.textContent = "タップで詳細";
      memberDt.appendChild(hint);
    }
    names.forEach(name => {
      const hit = fcCharacters.find(chara => chara.name === name);
      if (hit) {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "member-link";
        link.setAttribute("aria-label", name + " のプロフィールを表示");
        if (hit.image) {
          const face = document.createElement("span");
          face.className = "member-link-face";
          const faceImg = document.createElement("img");
          faceImg.src = hit.image;
          faceImg.alt = "";
          faceImg.loading = "lazy";
          faceImg.decoding = "async";
          face.appendChild(faceImg);
          link.appendChild(face);
        }
        const nameSpan = document.createElement("span");
        nameSpan.textContent = name;
        link.appendChild(nameSpan);
        const arrow = document.createElement("span");
        arrow.className = "member-link-arrow";
        arrow.textContent = "›";
        link.appendChild(arrow);
        link.addEventListener("click", () => {
          const teamList = fcCharacters.filter(chara => chara.team === hit.team);
          openChara(teamList, teamList.indexOf(hit));
        });
        memberDd.appendChild(link);
      } else {
        const plain = document.createElement("span");
        plain.className = "member-link is-plain";
        plain.textContent = name;
        memberDd.appendChild(plain);
      }
    });
  });
}

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

// Character catalog (characters.html)
const catalogRoot = document.getElementById("chara-catalog");

if (catalogRoot && fcCharacters.length) {
  fcCharacters.forEach((chara, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "chara-card";
    const visual = document.createElement("span");
    visual.className = "chara-card-visual" + (chara.image ? "" : " no-image");
    if (chara.image) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = chara.image;
      img.alt = chara.name;
      visual.appendChild(img);
    } else {
      const soon = document.createElement("span");
      soon.className = "chara-card-soon";
      soon.innerHTML = "COMING<br>SOON";
      visual.appendChild(soon);
    }
    card.appendChild(visual);
    const name = document.createElement("b");
    name.textContent = chara.name;
    const team = document.createElement("span");
    team.className = "chara-card-team";
    team.textContent = chara.teamName;
    card.appendChild(name);
    card.appendChild(team);
    card.addEventListener("click", () => openChara(fcCharacters, index));
    catalogRoot.appendChild(card);
  });
}

// Deep link: #chara=slug opens the character float directly.
const charaHashMatch = window.location.hash.match(/^#chara=(.+)$/);
if (charaHashMatch && fcCharacters.length) {
  const charaStart = fcCharacters.findIndex(chara => chara.id === decodeURIComponent(charaHashMatch[1]));
  if (charaStart >= 0) {
    openChara(fcCharacters, charaStart);
  }
}
