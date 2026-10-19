(function () {
  "use strict";

  var profile = window.PROFILE;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setText(selector, value) {
    document.querySelectorAll('[data-profile="' + selector + '"]').forEach(function (element) {
      if (selector === "motto") {
        element.innerHTML = escapeHtml(value).replace(/\n/g, "<br>");
      } else {
        element.textContent = value;
      }
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function renderProfile() {
    setText("name", profile.name);
    setText("nickname", profile.nickname);
    setText("alias", profile.alias);
    setText("initials", profile.initials);
    setText("location", profile.location);
    setText("heroFirstLine", profile.heroFirstLine);
    setText("heroLastLine", profile.heroLastLine);
    setText("intro", profile.intro);
    setText("aboutLead", profile.aboutLead);
    setText("aboutBackground", profile.aboutBackground);
    setText("aboutValues", profile.aboutValues);
    setText("motivation", profile.motivation);
    setText("educationInstitution", profile.education.institution);
    setText("educationProgram", profile.education.program);
    setText("educationStatus", profile.education.status);
    setText("educationOrganization", profile.education.organization);
    setText("careerGoal", profile.careerGoal);
    setText("mottoMark", profile.mottoMark);
    setText("motto", profile.motto);
    setText("mottoAttribution", profile.mottoAttribution);
    setText("closingThought", profile.closingThought);
    document.title = profile.name + " — " + profile.nickname + " / " + profile.alias;

    if (profile.portraitImage) {
      var portrait = document.getElementById("hero-portrait");
      var image = document.createElement("img");
      image.src = profile.portraitImage;
      image.alt = profile.name + " portrait";
      image.className = "portrait-image";
      portrait.replaceChildren(image);
      portrait.setAttribute("aria-label", profile.name + " portrait");
      image.addEventListener("error", function () {
        var placeholder = document.createElement("div");
        placeholder.className = "portrait-placeholder";
        placeholder.innerHTML = '<span class="portrait-initials">' + escapeHtml(profile.initials) + '</span><span>PHOTO NOT FOUND<br>CHECK THE IMAGE PATH</span>';
        portrait.replaceChildren(placeholder);
        portrait.setAttribute("aria-label", "Profile photo placeholder");
      });
    }

    renderSkills();
    renderEducation();
    renderInterests();
    renderProjects();
    renderJourney();
    renderCharacters();
    renderContact();
  }

  function renderSkills() {
    var container = document.getElementById("skill-groups");
    container.replaceChildren();
    profile.skills.forEach(function (group, index) {
      var article = document.createElement("article");
      article.className = "skill-group reveal";
      var title = document.createElement("h3");
      title.innerHTML = '<span class="skill-index">0' + (index + 1) + '</span>' + escapeHtml(group.category);
      var list = document.createElement("ul");
      list.className = "skill-list";
      if (group.items.length) {
        group.items.forEach(function (item) {
          var chip = document.createElement("li");
          chip.textContent = item;
          list.appendChild(chip);
        });
      } else {
        var placeholder = document.createElement("li");
        placeholder.className = "skill-placeholder";
        placeholder.textContent = "Add your " + group.category.toLowerCase();
        list.appendChild(placeholder);
      }
      article.append(title, list);
      container.appendChild(article);
      observeReveal(article);
    });
  }

  function renderEducation() {
    var subjects = document.getElementById("subject-list");
    var goals = document.getElementById("future-goals");
    subjects.replaceChildren();
    goals.replaceChildren();
    profile.subjects.forEach(function (subject) {
      var item = document.createElement("li");
      item.textContent = subject;
      subjects.appendChild(item);
    });
    profile.futureGoals.forEach(function (goal) {
      var item = document.createElement("li");
      item.textContent = goal;
      goals.appendChild(item);
    });
  }

  function renderInterests() {
    var container = document.getElementById("interest-tags");
    container.replaceChildren();
    profile.interests.forEach(function (interest) {
      var item = document.createElement("span");
      item.className = "interest-tag";
      item.textContent = interest;
      container.appendChild(item);
    });
  }

  function renderProjects() {
    var container = document.getElementById("project-grid");
    var empty = document.getElementById("projects-empty");
    var filters = document.getElementById("project-filters");
    container.replaceChildren();
    if (!profile.projects.length) {
      empty.hidden = false;
      filters.hidden = true;
      return;
    }
    empty.hidden = true;

    var categories = ["All"].concat(Array.from(new Set(profile.projects.map(function (project) { return project.category; }).filter(Boolean))));
    filters.hidden = categories.length < 2;
    filters.replaceChildren();
    categories.forEach(function (category, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "filter-button" + (index === 0 ? " is-active" : "");
      button.textContent = category;
      button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
      button.addEventListener("click", function () {
        filters.querySelectorAll("button").forEach(function (filter) {
          var active = filter === button;
          filter.classList.toggle("is-active", active);
          filter.setAttribute("aria-pressed", String(active));
        });
        container.querySelectorAll(".project-card").forEach(function (card) {
          card.hidden = category !== "All" && card.dataset.category !== category;
        });
      });
      filters.appendChild(button);
    });

    profile.projects.forEach(function (project, index) {
      var card = document.createElement("article");
      card.className = "project-card reveal";
      card.dataset.category = project.category || "";

      var preview = document.createElement("div");
      preview.className = "project-preview";
      if (project.image) {
        var image = document.createElement("img");
        image.src = project.image;
        image.alt = project.name + " project preview";
        image.loading = "lazy";
        preview.appendChild(image);
      } else {
        var mark = document.createElement("span");
        mark.className = "project-preview-mark";
        mark.textContent = String(index + 1).padStart(2, "0");
        preview.appendChild(mark);
      }
      if (project.category) {
        var category = document.createElement("span");
        category.className = "project-category";
        category.textContent = project.category;
        preview.appendChild(category);
      }

      var copy = document.createElement("div");
      copy.className = "project-copy";
      var title = document.createElement("h3");
      title.textContent = project.name;
      var description = document.createElement("p");
      description.textContent = project.description;
      copy.append(title, description);
      if (project.technologies && project.technologies.length) {
        var tags = document.createElement("ul");
        tags.className = "project-tags";
        project.technologies.forEach(function (technology) {
          var tag = document.createElement("li");
          tag.textContent = technology;
          tags.appendChild(tag);
        });
        copy.appendChild(tags);
      }
      var links = document.createElement("div");
      links.className = "project-links";
      [["repository", "GitHub"], ["demo", "Live demo"]].forEach(function (entry) {
        if (!project[entry[0]]) return;
        var link = document.createElement("a");
        link.href = project[entry[0]];
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = entry[1] + " ↗";
        links.appendChild(link);
      });
      if (links.childElementCount) copy.appendChild(links);
      card.append(preview, copy);
      container.appendChild(card);
      observeReveal(card);
    });
  }

  function renderJourney() {
    var container = document.getElementById("timeline");
    var empty = document.getElementById("journey-empty");
    container.replaceChildren();
    if (!profile.journey.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    profile.journey.forEach(function (entry, index) {
      var article = document.createElement("article");
      article.className = "timeline-entry reveal";
      var date = document.createElement("span");
      date.className = "timeline-date";
      date.textContent = entry.date;
      var marker = document.createElement("span");
      marker.className = "timeline-marker";
      marker.setAttribute("aria-hidden", "true");
      var copy = document.createElement("div");
      copy.className = "timeline-copy";
      var label = document.createElement("span");
      label.className = "timeline-kind";
      label.textContent = entry.type || "Milestone";
      var title = document.createElement("h3");
      title.textContent = entry.title;
      var description = document.createElement("p");
      description.textContent = entry.description;
      copy.append(label, title, description);
      article.append(date, marker, copy);
      container.appendChild(article);
      observeReveal(article);
    });
  }

  function renderCharacters() {
    var container = document.getElementById("character-grid");
    container.replaceChildren();
    profile.characters.forEach(function (character, index) {
      var article = document.createElement("article");
      article.className = "character-card reveal";
      var indexLabel = document.createElement("span");
      indexLabel.className = "character-index";
      indexLabel.textContent = "0" + (index + 1);
      var series = document.createElement("span");
      series.className = "character-series";
      series.textContent = character.series;
      var title = document.createElement("h3");
      title.textContent = character.name;
      var quality = document.createElement("p");
      quality.className = "character-quality";
      quality.textContent = character.quality;
      var description = document.createElement("p");
      description.className = "character-description";
      description.textContent = character.description;
      article.append(indexLabel, series, title, quality, description);
      container.appendChild(article);
      observeReveal(article);
    });
  }

  function renderContact() {
    var methods = document.getElementById("contact-methods");
    var socials = document.getElementById("social-links");
    var socialEmpty = document.getElementById("social-empty");
    var footerSocials = document.getElementById("footer-social-links");
    methods.replaceChildren();
    if (profile.contactEmail) {
      var email = document.createElement("a");
      email.className = "contact-method contact-email";
      email.href = "mailto:" + profile.contactEmail.trim();
      email.setAttribute("aria-label", "Email Seth at " + profile.contactEmail);
      email.textContent = profile.contactEmail;
      methods.appendChild(email);
    }
    if (profile.contactPhone) {
      var phone = document.createElement("a");
      phone.className = "contact-method";
      phone.href = "tel:" + profile.contactPhone.replace(/[^\d+]/g, "");
      phone.setAttribute("aria-label", "Call Seth");
      phone.textContent = profile.contactPhone;
      methods.appendChild(phone);
    }
    socials.replaceChildren();
    footerSocials.replaceChildren();
    socialEmpty.hidden = Boolean(profile.socials.length);
    profile.socials.forEach(function (social) {
      [socials, footerSocials].forEach(function (container) {
        var link = document.createElement("a");
        link.href = social.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", social.label + " profile");
        link.textContent = social.label + " ↗";
        container.appendChild(link);
      });
    });
  }

  function observeReveal(element) {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return;
    }
    revealObserver.observe(element);
  }

  var revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }) : null;

  function setupNavigation() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    var navigation = document.querySelector(".site-nav");
    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      navigation.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });
    navigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    var navLinks = Array.from(navigation.querySelectorAll('a[href^="#"]'));
    var sections = navLinks.map(function (link) { return document.querySelector(link.getAttribute("href")); }).filter(Boolean);
    if ("IntersectionObserver" in window) {
      var activeObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            if (link.getAttribute("href") === "#" + entry.target.id) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      sections.forEach(function (section) { activeObserver.observe(section); });
    }

    var progress = document.getElementById("scroll-progress");
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = "scaleX(" + (scrollable > 0 ? window.scrollY / scrollable : 0) + ")";
        header.classList.toggle("is-scrolled", window.scrollY > 24);
        ticking = false;
      });
    }, { passive: true });
  }

  renderProfile();
  setupNavigation();
  document.getElementById("current-year").textContent = new Date().getFullYear();
  document.querySelectorAll(".reveal").forEach(observeReveal);
}());
