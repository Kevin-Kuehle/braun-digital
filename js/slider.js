import { simulatedImageApiCall } from "./imageApi.js";

const slider = document.querySelector("#slider");
const sliderPlaceholder = document.querySelector("#sliderPlaceholder");

const sliderContentContainer = slider.querySelector(".slider__slides");
const prevButton = slider.querySelector(".slider__prev");
const nextButton = slider.querySelector(".slider__next");
const sliderDotsContainer = slider.querySelector(".slider__controls__dots");

let currentImageIndex = 0;
let maxImageIndex = null;

prevButton.addEventListener("click", prevButtonHandler);
nextButton.addEventListener("click", nextButtonHandler);
window.addEventListener("resize", sliderHeightHandler);
sliderContentContainer.addEventListener("wheel", sliderWheelHandler);
sliderContentContainer.addEventListener("dragstart", sliderDragStartHandler);
sliderContentContainer.addEventListener("drag", slidesContentContainerDragHandler);
sliderContentContainer.addEventListener("touchmove", slidesContentContainerDragHandler);
sliderContentContainer.addEventListener("scroll", sliderScrollHandler);

function sliderScrollHandler($event) {
  calculateImagePostionInsideContainer();
}

function sliderHeightHandler($event) {
  const width = $event.target.innerWidth;
  const paddingInPx = 20;
  const height = (width - paddingInPx) / 1.777777777777778;

  if (width < 500) {
    sliderContentContainer.style.height = `${height}px`;
  } else {
    sliderContentContainer.style.removeProperty("height");
  }
}

function prevButtonHandler() {
  const posibleNextImageIndex = currentImageIndex - 1 >= 0 ? currentImageIndex - 1 : maxImageIndex;
  currentImageIndex = posibleNextImageIndex;

  const imgChild = sliderContentContainer.querySelectorAll(".slider__slides__figure__image")[posibleNextImageIndex];
  scrollImageIntoView(imgChild);
}
function nextButtonHandler() {
  const posibleNextImageIndex = currentImageIndex + 1 <= maxImageIndex ? currentImageIndex + 1 : 0;
  currentImageIndex = posibleNextImageIndex;

  const imgChild = sliderContentContainer.querySelectorAll(".slider__slides__figure__image")[posibleNextImageIndex];
  scrollImageIntoView(imgChild);
}

let images = null;
async function initImages() {
  images = await simulatedImageApiCall();
  insertImages();
}
initImages();

function initSlider() {
  sliderHeightHandler({ target: window });
}
initSlider();

/**
 * called from initImages()
 */
function insertImages() {
  maxImageIndex = images.length - 1;

  for (let [index, image] of images.entries()) {
    const img = document.createElement("img");
    const figure = document.createElement("figure");
    const figcaption = document.createElement("figcaption");
    figcaption.classList.add("slider__slides__figure__figcaption");
    figcaption.classList.add(`slider__slides__figure__figcaption-${index}`);
    figcaption.innerText = image.title;

    figure.classList.add("slider__slides__figure");
    figure.classList.add(`slider__slides__figure-${index}`);

    figure.addEventListener("mouseover", () => figureMouseOverHandler(index));
    figure.addEventListener("mouseleave", () => figureMouseLeaveHandler(index));

    figure.appendChild(img);
    figure.appendChild(figcaption);

    img.src = image.src;
    img.alt = image.title;
    img.id = image.id;

    img.classList.add("slider__slides__figure__image");
    img.classList.add(`slider__slides__figure__image-${index}`);

    img.addEventListener("click", () => imageClickHandler(index));

    if (index === 0) {
      img.classList.add("slider__slides__figure__image--focused");
    }

    if (sliderContentContainer) {
      // sliderContentContainer.appendChild(img);
      sliderContentContainer.appendChild(figure);
      createDot(index);
    } else {
      throw new Error("sliderContentContainer not found");
    }
  }
  replacePlaceholderWithSlider();
}

function figureMouseOverHandler(index) {
  document
    .querySelector(`.slider__slides__figure__figcaption-${index}`)
    .classList.add("slider__slides__figure__figcaption--focused");
}
function figureMouseLeaveHandler(index) {
  document
    .querySelector(`.slider__slides__figure__figcaption-${index}`)
    .classList.remove("slider__slides__figure__figcaption--focused");
}

function imageClickHandler(index) {
  const imgChild = sliderContentContainer.querySelectorAll(".slider__slides__figure__image")[index];
  dotsFocusHandler(index);
  scrollImageIntoView(imgChild);
}

function createDot(index) {
  const dot = document.createElement("span");
  dot.classList.add("slider__controls__dots__dot");
  dot.classList.add(`slider__controls__dots__dot-${index}`);

  if (index === 0) {
    dot.classList.add("slider__controls__dots__dot--focused");
  }

  dot.innerText = "•";
  dot.addEventListener("click", () => dotClickHandler(index));

  if (sliderDotsContainer) {
    sliderDotsContainer.appendChild(dot);
  } else {
    throw new Error("sliderDotsContainer not found");
  }
}

function dotClickHandler(index) {
  const imgChild = sliderContentContainer.querySelectorAll(".slider__slides__figure__image")[index];
  scrollImageIntoView(imgChild);
}

function replacePlaceholderWithSlider() {
  sliderPlaceholder.remove();
  slider.classList.remove("hidden");
}

function scrollImageIntoView(nodeElement) {
  const options = {
    behavior: "smooth",
    block: "center",
    inline: "center",
  };
  imageFocusHandler(nodeElement);
  nodeElement.scrollIntoView(options);
}

function imageFocusHandler(nodeElement) {
  const allImages = sliderContentContainer.querySelectorAll(".slider__slides__figure__image");

  for (let image of allImages) {
    image.classList.remove("slider__slides__figure__image--focused");
  }
  nodeElement.classList.add("slider__slides__figure__image--focused");
}

function dotsFocusHandler(index) {
  const allDots = sliderDotsContainer.querySelectorAll(".slider__controls__dots__dot");

  for (let dot of allDots) {
    dot.classList.remove("slider__controls__dots__dot--focused");
  }

  allDots[index].classList.add("slider__controls__dots__dot--focused");
}

let startX = null;
function sliderDragStartHandler($event) {
  startX = $event.clientX;
}

let lastClientX = null;
function slidesContentContainerDragHandler($event) {
  const { clientX } = $event;
  const direction = clientX > lastClientX ? "left" : "right";

  if (Math.abs(clientX - startX) > 10) {
    scrollSlider(direction);
  }
  calculateImagePostionInsideContainer();
  lastClientX = clientX;
}

function scrollSlider(direction, speed = 1.5) {
  if (direction === "right") {
    sliderContentContainer.scrollLeft += speed;
  } else {
    sliderContentContainer.scrollLeft -= speed;
  }
}

function getSliderMiddlePoint() {
  const { width, height } = slider.getBoundingClientRect();
  return { x: width / 2, y: height / 2 };
}

function getMiddlOfTarget(target) {
  const { width, height } = target.getBoundingClientRect();
  return { x: width / 2, y: height / 2 };
}

let closestImage = null;
let calculateImagePostionTimeout = null;
function calculateImagePostionInsideContainer() {
  const middle = getSliderMiddlePoint().x;
  const allImages = sliderContentContainer.querySelectorAll(".slider__slides__figure__image");
  if (calculateImagePostionTimeout) clearTimeout(calculateImagePostionTimeout);
  let smallestDistance = Infinity;

  allImages.forEach((image) => {
    const imageRect = image.getBoundingClientRect();
    const sliderRect = sliderContentContainer.getBoundingClientRect();
    const imageMiddle = imageRect.left + imageRect.width / 2 - sliderRect.left;

    const distance = Math.abs(middle - imageMiddle);

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestImage = image;
    }
  });

  if (sliderContentContainer.scrollLeft === 0) {
    // If at the start, select the first image
    closestImage = allImages[0];
  } else if (
    sliderContentContainer.scrollLeft + sliderContentContainer.offsetWidth >=
    sliderContentContainer.scrollWidth
  ) {
    // If at the end, select the last image
    closestImage = allImages[allImages.length - 1];
  }

  // get index of the closest image
  const index = [...allImages].indexOf(closestImage);
  dotsFocusHandler(index);

  calculateImagePostionTimeout = setTimeout(() => {
    scrollImageIntoView(closestImage);
  }, 300);
}

function sliderWheelHandler($event) {
  const { deltaY } = $event;
  const direction = deltaY > 0 ? "left" : "right";
  const speed = 20;

  if (direction === "right") {
    scrollSlider("left", speed);
  } else {
    scrollSlider("right", speed);
  }
  calculateImagePostionInsideContainer();
}
