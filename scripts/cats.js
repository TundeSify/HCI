(function () {
  "use strict";

  var cats = [
    { name: "The midnight supervisor", coat: "#b5a1d5", glow: "rgba(170, 134, 225, .26)", face: "tabby" },
    { name: "A very small loaf", coat: "#e6d5ba", glow: "rgba(220, 190, 154, .19)", face: "round" },
    { name: "Head of afternoon naps", coat: "#80758f", glow: "rgba(168, 139, 222, .23)", face: "sleepy" },
    { name: "Neighborhood observer", coat: "#c69276", glow: "rgba(220, 158, 123, .18)", face: "curious" },
    { name: "Chief snack inspector", coat: "#c9bfac", glow: "rgba(198, 187, 166, .2)", face: "tabby" },
    { name: "Professional sunbeam finder", coat: "#d4b75e", glow: "rgba(232, 199, 98, .21)", face: "round" },
    { name: "Part-time chaos artist", coat: "#534b61", glow: "rgba(158, 132, 202, .26)", face: "curious" },
    { name: "Tiny guardian of the keyboard", coat: "#e8e1d5", glow: "rgba(185, 156, 245, .21)", face: "sleepy" }
  ];
  var gallery = document.querySelector(".cat-gallery");
  var svgNamespace = "http://www.w3.org/2000/svg";

  function svgElement(tag, attributes) {
    var element = document.createElementNS(svgNamespace, tag);
    Object.keys(attributes).forEach(function (attribute) {
      element.setAttribute(attribute, attributes[attribute]);
    });
    return element;
  }

  function drawCat(cat, index) {
    var article = document.createElement("article");
    article.className = "cat-card";
    article.style.setProperty("--cat-glow", cat.glow);
    article.style.setProperty("--cat-delay", (index % 4) * 55 + "ms");

    var art = document.createElement("div");
    art.className = "cat-art";
    var drawing = svgElement("svg", {
      viewBox: "0 0 200 190",
      role: "img",
      "aria-labelledby": "cat-title-" + index,
      focusable: "false"
    });
    var title = svgElement("title", { id: "cat-title-" + index });
    title.textContent = "Original illustrated cat placeholder";
    drawing.append(title);

    var ears = svgElement("path", { d: "M53 76 44 28 82 52Q100 43 118 52l38-24-9 48", fill: cat.coat, "stroke-linejoin": "round" });
    var head = svgElement("ellipse", { cx: "100", cy: "92", rx: "57", ry: cat.face === "round" ? "51" : "55", fill: cat.coat });
    var innerEars = svgElement("path", { d: "m54 64-4-23 20 17m57 0 20-17-4 23", fill: "#c495d9", opacity: ".8" });
    var forehead = svgElement("path", { d: "M100 52v21m-13-18 8 17m18-17-8 17", fill: "none", stroke: "#6f557f", "stroke-linecap": "round", "stroke-width": "3", opacity: cat.face === "tabby" ? ".72" : ".22" });
    var eyes = svgElement("path", {
      d: cat.face === "sleepy" ? "M66 91q10 10 20 0m28 0q10 10 20 0" : "M68 89q8-9 17 0-8 10-17 0m30 0q8-9 17 0-8 10-17 0",
      fill: cat.face === "sleepy" ? "none" : "#211c27",
      stroke: cat.face === "sleepy" ? "#362d3b" : "none",
      "stroke-width": "3",
      "stroke-linecap": "round"
    });
    var glints = svgElement("circle", { cx: "77", cy: "88", r: "2.3", fill: "#fff8ed" });
    var otherGlint = svgElement("circle", { cx: "107", cy: "88", r: "2.3", fill: "#fff8ed" });
    var nose = svgElement("path", { d: "m94 103 6-4 6 4-6 5z", fill: "#9a668c" });
    var mouth = svgElement("path", { d: "M100 108q-2 8-9 8m9-8q2 8 9 8", fill: "none", stroke: "#55434f", "stroke-linecap": "round", "stroke-width": "2" });
    var whiskers = svgElement("path", {
      d: "m73 105-23-5m24 11-26 3m79-9 23-5m-24 11 26 3",
      fill: "none",
      stroke: "#76667b",
      "stroke-linecap": "round",
      "stroke-width": "2",
      opacity: ".8"
    });
    var body = svgElement("path", { d: "M55 169q0-35 25-39 20-6 40 0 25 4 25 39", fill: cat.coat });
    drawing.append(body, ears, innerEars, head, forehead, eyes);
    if (cat.face !== "sleepy") drawing.append(glints, otherGlint);
    drawing.append(nose, mouth, whiskers);
    art.appendChild(drawing);

    var label = document.createElement("span");
    label.className = "cat-placeholder-label";
    label.textContent = "Illustration placeholder";
    var heading = document.createElement("h2");
    heading.textContent = cat.name;
    article.append(art, label, heading);
    gallery.appendChild(article);
  }

  cats.forEach(drawCat);
}());
