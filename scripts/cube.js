(function () {
  "use strict";

  var profile = window.PROFILE;
  var faces = [
    { key: "front", number: "01", label: "WORK", title: "Projects & creative work", icon: "✳", summary: "School websites, an application, a ledger system, and a 3D Blender project.", footer: "Projects" },
    { key: "right", number: "02", label: "ABOUT", title: "A little about me", icon: "↗", summary: profile.aboutLead, footer: "The person" },
    { key: "back", number: "03", label: "SKILLS", title: "Skills & toolkit", icon: "◈", summary: "Programming, web, data tools, current subjects, and the way I work.", footer: "Learning" },
    { key: "left", number: "04", label: "EXPERIENCE", title: "Experience & involvement", icon: "⌁", summary: "IT support, freelance work, PSITS, and community involvement.", footer: "Experience" },
    { key: "top", number: "05", label: "EDUCATION", title: "Education & direction", icon: "✳", summary: profile.education.program + " at " + profile.education.institution + ".", footer: "My path" },
    { key: "bottom", number: "06", label: "CONTACT", title: "Let’s talk things through", icon: "＋", summary: "Have a project, question, or idea? Get in touch.", footer: "Say hello" }
  ];
  var angles = {
    front: [-22, -31],
    right: [-22, -121],
    back: [-22, -211],
    left: [-22, 59],
    top: [-68, -31],
    bottom: [68, -31]
  };
  var cube = document.getElementById("cube");
  var navigation = document.getElementById("face-navigation");
  var overlay = document.getElementById("overlay");
  var modal = document.getElementById("modal");
  var modalContent = document.getElementById("modal-content");
  var activeKey = "front";
  var rotationX = -22;
  var rotationY = -31;
  var pointerStart = null;
  var wasDragged = false;
  var previousFocus = null;

  function element(tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function addSection(container, title) {
    var section = element("section", "modal-section");
    section.appendChild(element("h3", "", title));
    container.appendChild(section);
    return section;
  }

  function addParagraph(container, text) {
    container.appendChild(element("p", "", text));
  }

  function addImage(container, src, alt) {
    var figure = element("figure", "detail-media");
    var image = element("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";
    figure.appendChild(image);
    container.appendChild(figure);
  }

  function addVideo(container, src, label) {
    var figure = element("figure", "detail-media");
    figure.setAttribute("role", "img");
    figure.setAttribute("aria-label", label);
    var video = element("video");
    video.controls = false;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("tabindex", "-1");
    video.src = src;
    figure.appendChild(video);
    container.appendChild(figure);
  }

  function addList(container, entries) {
    var list = element("ul", "detail-list");
    entries.forEach(function (entry) {
      var item = element("li");
      if (typeof entry === "string") {
        item.textContent = entry;
      } else {
        if (entry.period) item.appendChild(element("small", "", entry.period));
        item.appendChild(element("strong", "", entry.title || entry.organization || entry.school || entry.name));
        if (entry.role) item.appendChild(element("span", "", entry.role));
        if (entry.program) item.appendChild(element("span", "", entry.program));
        if (entry.detail) item.appendChild(element("span", "", entry.detail));
        (entry.details || []).forEach(function (detail) {
          var paragraph = element("p", "", detail);
          item.appendChild(paragraph);
        });
      }
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  function addTags(container, entries) {
    var list = element("ul", "tag-list");
    entries.forEach(function (entry) {
      list.appendChild(element("li", "", entry));
    });
    container.appendChild(list);
  }

  function renderFaces() {
    faces.forEach(function (face) {
      var button = element("button", "cube-face face-" + face.key);
      button.type = "button";
      button.dataset.face = face.key;
      button.setAttribute("aria-label", "Open " + face.title);
      button.appendChild(element("span", "face-number", face.number + "  /  " + profile.nickname.toUpperCase() + " PORTFOLIO"));
      var title = element("span", "face-title", face.label);
      title.appendChild(element("span", "face-icon", face.icon));
      button.appendChild(title);
      button.appendChild(element("span", "face-summary", face.summary));
      var footer = element("span", "face-footer");
      footer.append(element("span", "", face.footer), element("b", "", "↗"));
      button.appendChild(footer);
      button.addEventListener("click", function () {
        if (!wasDragged) openDetails(face.key);
      });
      cube.appendChild(button);
    });

    faces.forEach(function (face) {
      var button = element("button", "face-btn" + (face.key === activeKey ? " active" : ""));
      button.type = "button";
      button.dataset.face = face.key;
      button.textContent = face.label;
      button.setAttribute("aria-label", "Show " + face.label + " face");
      button.setAttribute("aria-pressed", String(face.key === activeKey));
      button.addEventListener("click", function () { setFace(face.key); });
      navigation.insertBefore(button, navigation.querySelector(".count"));
    });
  }

  function renderProjects(container) {
    var section = addSection(container, "Academic & creative projects");
    addList(section, profile.projects.map(function (project) {
      return { title: project.name, role: project.category, detail: project.description };
    }));
  }

  function renderAbout(container) {
    addImage(container, profile.portraitImage, profile.name + " portrait");
    addParagraph(container, profile.aboutLead);
    addParagraph(container, profile.aboutBackground);
    addParagraph(container, profile.aboutValues);
    var motivation = addSection(container, "What keeps me going");
    addParagraph(motivation, profile.motivation);

    var interests = addSection(container, "Outside the pixels");
    profile.interestHighlights.forEach(function (interest) {
      var entry = element("article", "interest-highlight");
      entry.appendChild(element("h4", "", interest.title));
      addParagraph(entry, interest.description);
      if (interest.image) addImage(entry, interest.image, interest.alt || interest.title);
      if (interest.video) addVideo(entry, interest.video, interest.alt || interest.title);
      interests.appendChild(entry);
    });
    addTags(interests, profile.interests);

    var characters = addSection(container, "Fictional worlds, real values");
    profile.characters.forEach(function (character) {
      var entry = element("article");
      entry.appendChild(element("p", "detail-character-series", character.series));
      entry.appendChild(element("p", "detail-character-name", character.name + " — " + character.quality));
      addParagraph(entry, character.description);
      addImage(entry, character.image, character.name + " from " + character.series);
      characters.appendChild(entry);
    });

    var philosophy = addSection(container, profile.mottoMark + " · A thought to carry");
    addParagraph(philosophy, profile.motto + " — " + profile.mottoAttribution);
    addParagraph(philosophy, profile.closingThought);
  }

  function renderSkills(container) {
    profile.skills.forEach(function (group) {
      var section = addSection(container, group.category);
      addTags(section, group.items);
    });
    var subjects = addSection(container, "Current course subjects · not certifications");
    addTags(subjects, profile.subjects);
    var strengths = addSection(container, "Professional strengths");
    addTags(strengths, profile.strengths);
    var languages = addSection(container, "Languages");
    addList(languages, profile.languages.map(function (language) {
      return { title: language.name, detail: language.level };
    }));
  }

  function renderExperience(container) {
    addParagraph(container, profile.resumeSummary);
    var work = addSection(container, "Practical experience");
    addList(work, profile.experience);
    var involvement = addSection(container, "Campus & community");
    addList(involvement, profile.involvement);
  }

  function renderEducation(container) {
    var current = addSection(container, "Currently studying");
    addList(current, [{
      title: profile.education.institution,
      role: profile.education.status + " · " + profile.education.organization,
      detail: profile.education.program
    }]);
    var history = addSection(container, "Academic history");
    addList(history, profile.educationHistory);
    var training = addSection(container, "Completed training · Cisco Networking Academy");
    addList(training, profile.training);
    var goals = addSection(container, "A five-year vision, still in progress");
    addParagraph(goals, profile.careerGoal);
    addList(goals, profile.futureGoals);
    var journey = addSection(container, "The path so far");
    addList(journey, profile.journey.map(function (entry) {
      return { period: entry.date + " · " + entry.type, title: entry.title, detail: entry.description };
    }));
  }

  function renderContact(container) {
    var methods = addSection(container, "Get in touch");
    var list = element("ul", "detail-list");
    var email = element("li");
    email.appendChild(element("strong", "", "Email"));
    var emailLink = element("a", "", profile.contactEmail);
    emailLink.href = "mailto:" + profile.contactEmail;
    email.appendChild(emailLink);
    list.appendChild(email);
    var phone = element("li");
    phone.appendChild(element("strong", "", "Phone"));
    var phoneLink = element("a", "", profile.contactPhone);
    phoneLink.href = "tel:" + profile.contactPhone.replace(/[^\d+]/g, "");
    phone.appendChild(phoneLink);
    list.appendChild(phone);
    methods.appendChild(list);

    var socials = addSection(container, "Find me online");
    var links = element("div", "social-list");
    profile.socials.forEach(function (social) {
      var link = element("a", "", social.label + " ↗");
      link.href = social.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      links.appendChild(link);
    });
    socials.appendChild(links);
  }

  function renderDetails(key) {
    modalContent.replaceChildren();
    if (key === "front") renderProjects(modalContent);
    if (key === "right") renderAbout(modalContent);
    if (key === "back") renderSkills(modalContent);
    if (key === "left") renderExperience(modalContent);
    if (key === "top") renderEducation(modalContent);
    if (key === "bottom") renderContact(modalContent);
  }

  function openDetails(key) {
    var face = faces.filter(function (item) { return item.key === key; })[0];
    if (!face) return;
    previousFocus = document.activeElement;
    document.getElementById("modal-kicker").textContent = face.number + " / " + face.footer;
    document.getElementById("modal-title").textContent = face.title;
    document.getElementById("modal-lead").textContent = face.summary;
    renderDetails(key);
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("modal-close").focus();
  }

  function closeDetails() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previousFocus) previousFocus.focus();
  }

  function setFace(key) {
    if (!angles[key]) return;
    activeKey = key;
    rotationX = angles[key][0];
    rotationY = angles[key][1];
    cube.style.transform = "rotateX(" + rotationX + "deg) rotateY(" + rotationY + "deg)";
    updateFaceNavigation(key);
  }

  function updateFaceNavigation(key) {
    activeKey = key;
    navigation.querySelectorAll(".face-btn").forEach(function (button) {
      var active = button.dataset.face === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    var index = faces.findIndex(function (face) { return face.key === key; }) + 1;
    document.getElementById("face-count").textContent = "0" + index + " / 06";
  }

  function angleDistance(first, second) {
    var difference = (first - second + 540) % 360 - 180;
    return Math.abs(difference);
  }

  function nearestFace() {
    var nearest = faces[0].key;
    var nearestDistance = Infinity;
    faces.forEach(function (face) {
      var target = angles[face.key];
      var distance = angleDistance(target[0], rotationX) + angleDistance(target[1], rotationY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = face.key;
      }
    });
    return nearest;
  }

  function turn(direction) {
    var currentIndex = faces.findIndex(function (face) { return face.key === nearestFace(); });
    var nextIndex = (currentIndex + (direction === "right" ? 1 : faces.length - 1)) % faces.length;
    setFace(faces[nextIndex].key);
  }

  function releasePointer() {
    if (!pointerStart) return;
    pointerStart = null;
    cube.classList.remove("dragging");
    if (wasDragged) {
      updateFaceNavigation(nearestFace());
      window.setTimeout(function () { wasDragged = false; }, 0);
    }
  }

  renderFaces();
  document.getElementById("cube-name").textContent = profile.nickname.toUpperCase();
  document.getElementById("hero-alias").textContent = profile.alias;
  document.getElementById("hero-name").textContent = profile.name;
  document.getElementById("hero-intro").textContent = profile.intro;
  document.getElementById("hero-location").textContent = profile.location;
  document.getElementById("footer-name").textContent = profile.name;
  document.getElementById("current-year").textContent = new Date().getFullYear();
  document.getElementById("top-contact").href = "mailto:" + profile.contactEmail;

  var stage = document.querySelector(".stage");
  stage.addEventListener("pointerdown", function (event) {
    if (event.target.closest(".face-nav")) return;
    pointerStart = { x: event.clientX, y: event.clientY, rotationX: rotationX, rotationY: rotationY };
    wasDragged = false;
    cube.classList.add("dragging");
  });
  document.addEventListener("pointermove", function (event) {
    if (!pointerStart) return;
    var deltaX = event.clientX - pointerStart.x;
    var deltaY = event.clientY - pointerStart.y;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 6) wasDragged = true;
    rotationX = pointerStart.rotationX - deltaY * .55;
    rotationY = pointerStart.rotationY + deltaX * .55;
    cube.style.transform = "rotateX(" + rotationX + "deg) rotateY(" + rotationY + "deg)";
  });
  document.addEventListener("pointerup", releasePointer);
  document.addEventListener("pointercancel", releasePointer);

  navigation.querySelector('[data-turn="left"]').addEventListener("click", function () { turn("left"); });
  navigation.querySelector('[data-turn="right"]').addEventListener("click", function () { turn("right"); });
  document.getElementById("modal-close").addEventListener("click", closeDetails);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeDetails();
  });
  document.addEventListener("keydown", function (event) {
    if (overlay.classList.contains("open")) {
      if (event.key === "Escape") closeDetails();
      if (event.key === "Tab") {
        var focusable = modal.querySelectorAll("a[href], button:not([disabled])");
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }
    if (event.key === "ArrowLeft") turn("left");
    if (event.key === "ArrowRight") turn("right");
  });
}());
