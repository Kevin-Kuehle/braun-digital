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

function updateCurrentImageIndex(index) {
  currentImageIndex = index;
}

let images = null;
async function initImages() {
  try {
    images = await simulatedImageApiCall();
    insertImages();
  } catch (error) {
    throw new Error("initImages", initImages);
  }
}
initImages();

function initSlider() {
  sliderHeightHandler({ target: window });
}
initSlider();

/**
 * @description
 * This function inserts the images into the slider.
 * It also creates the dots for the slider and sets the first image as focused.
 * It also replaces the placeholder with the slider.
 * It also sets the maxImageIndex.
 * It also sets the event listeners for the images and the dots.
 * @returns {void}
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
  updateCurrentImageIndex(index);
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
  updateCurrentImageIndex(index);
  scrollImageIntoView(imgChild);
}

function replacePlaceholderWithSlider() {
  sliderPlaceholder.remove();
  slider.classList.remove("hidden");
}

function scrollImageIntoView(nodeElement) {
  if (!nodeElement) {
    throw new Error("scrollImageIntoView", "nodeElement not found");
  }

  const options = {
    behavior: "smooth",
    block: "center",
    inline: "center",
  };
  imageFocusHandler(nodeElement);
  nodeElement.scrollIntoView(options);
}

function imageFocusHandler(nodeElement) {
  // check if nodeElement is type of an image and not a figure
  if (!nodeElement || !nodeElement.classList.contains("slider__slides__figure__image")) {
    throw new Error("imageFocusHandler", "nodeElement is not an image");
  }

  const allImages = sliderContentContainer.querySelectorAll(".slider__slides__figure__image");

  for (let image of allImages) {
    image.classList.remove("slider__slides__figure__image--focused");
  }
  nodeElement.classList.add("slider__slides__figure__image--focused");
}

function dotsFocusHandler(index) {
  if (index === null || index === undefined) {
    throw new Error("dotsFocusHandler", "index not found");
  }

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
    return;
  }

  if (direction === "left") {
    sliderContentContainer.scrollLeft -= speed;
    return;
  }

  throw new Error("scrollSlider", "direction not found");
}

function getSliderMiddlePoint() {
  const { width, height } = slider.getBoundingClientRect();
  return { x: width / 2, y: height / 2 };
}

let closestImage = null;
let calculateImagePostionTimeout = null;

/**
 * @description
 * This function calculates the closest image to the middle of the slider.
 * It uses the middle point of the slider and the middle point of each image to calculate the distance.
 * The image with the smallest distance to the middle point of the slider is the closest image.
 * It also sets the focused dot.
 *
 */
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
    closestImage = allImages[0];
  } else if (
    sliderContentContainer.scrollLeft + sliderContentContainer.offsetWidth >=
    sliderContentContainer.scrollWidth
  ) {
    closestImage = allImages[allImages.length - 1];
  }

  const index = [...allImages].indexOf(closestImage);
  dotsFocusHandler(index);

  calculateImagePostionTimeout = setTimeout(() => {
    scrollImageIntoView(closestImage);
  }, 300);
}

/**
 * @description
 * This function removes all event listeners from the slider.
 * It is used to clean up the event listeners when the slider is removed from the DOM.
 */
function removeAllEventListeners() {
  prevButton.removeEventListener("click", prevButtonHandler);
  nextButton.removeEventListener("click", nextButtonHandler);
  window.removeEventListener("resize", sliderHeightHandler);
  sliderContentContainer.removeEventListener("wheel", sliderWheelHandler);
  sliderContentContainer.removeEventListener("dragstart", sliderDragStartHandler);
  sliderContentContainer.removeEventListener("drag", slidesContentContainerDragHandler);
  sliderContentContainer.removeEventListener("touchmove", slidesContentContainerDragHandler);
  sliderContentContainer.removeEventListener("scroll", sliderScrollHandler);
}
