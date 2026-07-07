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
    ["戦闘スタイル", chara.style],
    ["相性(有利)", chara.advantage],
    ["相性(不利)", chara.disadvantage]
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
  [
    ["特性", chara.tokusei],
    ["必殺技", chara.hissatsu],
    ["超必殺技", chara.cho],
    ["性格・特徴", chara.personality],
    ["背景・才能", chara.background],
    ["勝利演出", chara.victory],
    ["プロフィール", chara.profile],
    ["口癖", chara.kuse]
  ].forEach(pair => {
    if (!pair[1]) {
      return;
    }
    const label = document.createElement("div");
    label.className = "chara-section-label";
    label.textContent = pair[0];
    sections.appendChild(label);
    String(pair[1]).split("\n").forEach(line => {
      if (!line.trim()) {
        return;
      }
      const p = document.createElement("p");
      p.className = "chara-section-text";
      p.textContent = line;
      sections.appendChild(p);
    });
  });
  charaFloat.querySelector(".chara-float-body").scrollTop = 0;
  history.replaceState(null, "", "#chara=" + chara.id);
}

function closeChara() {
  charaFloat.classList.remove("is-open");
  history.replaceState(null, "", charaPrevHash || window.location.pathname + window.location.search);
  if (!document.querySelector(".team-float.is-open")) {
    document.body.classList.remove("no-scroll");
  }
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
    "</div>" +
    "</article>";
  document.body.appendChild(charaFloat);

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

// Team float: tap a team card to open the team's introduction panel.
const teamCards = Array.from(document.querySelectorAll(".team-card"));

if (teamCards.length) {
  let teamIndex = 0;
  let lastFocused = null;
  let currentTeamSlug = "";

  const teamFloat = document.createElement("div");
  teamFloat.className = "team-float";
  teamFloat.setAttribute("role", "dialog");
  teamFloat.setAttribute("aria-modal", "true");
  teamFloat.setAttribute("aria-label", "チーム詳細");
  teamFloat.innerHTML =
    '<button class="lightbox-close" type="button" aria-label="閉じる">&#10005;</button>' +
    '<button class="lightbox-prev" type="button" aria-label="前のチーム">&#8249;</button>' +
    '<button class="lightbox-next" type="button" aria-label="次のチーム">&#8250;</button>' +
    '<article class="team-float-panel">' +
    '<img class="team-float-image" alt="">' +
    '<div class="team-float-body">' +
    '<h2 class="team-float-name"></h2>' +
    '<p class="team-float-tagline"></p>' +
    '<p class="team-float-desc"></p>' +
    '<div class="team-float-meta"></div>' +
    "</div>" +
    "</article>";
  document.body.appendChild(teamFloat);

  const floatImage = teamFloat.querySelector(".team-float-image");
  const floatName = teamFloat.querySelector(".team-float-name");
  const floatTagline = teamFloat.querySelector(".team-float-tagline");
  const floatDesc = teamFloat.querySelector(".team-float-desc");
  const floatMeta = teamFloat.querySelector(".team-float-meta");

  const teamSlug = card => {
    const src = card.querySelector(".team-image").getAttribute("src") || "";
    const match = src.match(/([^/]+)\.(jpg|jpeg|png|webp)$/i);
    return match ? match[1] : "";
  };

  const chipList = (label, values, extraClass) =>
    '<div class="team-float-label">' + label + "</div>" +
    '<div class="team-float-chips">' +
    values.map(value => '<span class="team-float-chip ' + extraClass + '">' + value + "</span>").join("") +
    "</div>";

  const showTeam = index => {
    teamIndex = (index + teamCards.length) % teamCards.length;
    const card = teamCards[teamIndex];
    const cardImage = card.querySelector(".team-image");
    const slug = teamSlug(card);
    floatImage.src = slug ? "assets/img/teams/" + slug + ".jpg" : cardImage.src;
    floatImage.alt = cardImage.alt || "";
    floatName.textContent = card.querySelector("h2").textContent;
    floatTagline.textContent = card.querySelector("h3").textContent;
    floatDesc.textContent = card.querySelector("p").textContent;
    currentTeamSlug = slug;
    const dds = card.querySelectorAll("dd");
    let metaHtml = "";
    if (dds[0]) {
      const memberChips = dds[0].textContent.split("/").map(v => v.trim()).map(name => {
        const hit = fcCharacters.find(chara => chara.name === name);
        return hit
          ? '<button type="button" class="team-float-chip member has-chara" data-chara="' + hit.id + '">' + name + "</button>"
          : '<span class="team-float-chip member">' + name + "</span>";
      }).join("");
      metaHtml += '<div class="team-float-label">メンバー' +
        (fcCharacters.length ? '<small class="team-float-hint">タップでプロフィール</small>' : "") +
        '</div><div class="team-float-chips">' + memberChips + "</div>";
    }
    if (dds[1]) {
      metaHtml += chipList("チームテーマ", dds[1].textContent.split("/").map(v => v.trim()), "theme");
    }
    floatMeta.innerHTML = metaHtml;
    if (slug) {
      history.replaceState(null, "", "#team=" + slug);
    }
  };

  const openTeam = index => {
    lastFocused = document.activeElement;
    showTeam(index);
    teamFloat.classList.add("is-open");
    document.body.classList.add("no-scroll");
    teamFloat.querySelector(".lightbox-close").focus();
  };

  const closeTeam = () => {
    teamFloat.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    history.replaceState(null, "", window.location.pathname + window.location.search);
    if (lastFocused) {
      lastFocused.focus();
    }
  };

  teamCards.forEach((card, index) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", card.querySelector("h2").textContent + " の詳細を表示");
    card.addEventListener("click", () => openTeam(index));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTeam(index);
      }
    });
  });

  teamFloat.querySelector(".lightbox-close").addEventListener("click", closeTeam);
  teamFloat.querySelector(".lightbox-prev").addEventListener("click", event => {
    event.stopPropagation();
    showTeam(teamIndex - 1);
  });
  teamFloat.querySelector(".lightbox-next").addEventListener("click", event => {
    event.stopPropagation();
    showTeam(teamIndex + 1);
  });
  teamFloat.addEventListener("click", event => {
    const trigger = event.target.closest("[data-chara]");
    if (trigger) {
      const teamList = fcCharacters.filter(chara => chara.team === currentTeamSlug);
      const startIndex = teamList.findIndex(chara => chara.id === trigger.getAttribute("data-chara"));
      if (startIndex >= 0) {
        openChara(teamList, startIndex);
      }
      return;
    }
    if (event.target === teamFloat) {
      closeTeam();
    }
  });

  document.addEventListener("keydown", event => {
    if (isCharaFloatOpen()) {
      return;
    }
    if (!teamFloat.classList.contains("is-open")) {
      return;
    }
    if (event.key === "Escape") {
      closeTeam();
    } else if (event.key === "ArrowLeft") {
      showTeam(teamIndex - 1);
    } else if (event.key === "ArrowRight") {
      showTeam(teamIndex + 1);
    }
  });

  let teamTouchX = 0;
  let teamTouchY = 0;
  teamFloat.addEventListener(
    "touchstart",
    event => {
      teamTouchX = event.changedTouches[0].clientX;
      teamTouchY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );
  teamFloat.addEventListener(
    "touchend",
    event => {
      if (isCharaFloatOpen()) {
        return;
      }
      const deltaX = event.changedTouches[0].clientX - teamTouchX;
      const deltaY = event.changedTouches[0].clientY - teamTouchY;
      if (Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
        showTeam(teamIndex + (deltaX < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );

  const teamHash = window.location.hash.match(/^#team=(.+)$/);
  if (teamHash) {
    const startIndex = teamCards.findIndex(card => teamSlug(card) === decodeURIComponent(teamHash[1]));
    if (startIndex >= 0) {
      openTeam(startIndex);
    }
  }
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
