const folder = "./images";
const delay = Math.random() * (5000 - 1000) + 1000;
// const delay = 90000;

export function simulatedImageApiCall() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const images = [
        { id: 1, src: "../assets/images/1.jpg", title: "Title 1" },
        { id: 2, src: "../assets/images/2.jpg", title: "Title 2" },
        { id: 3, src: "../assets/images/3.jpg", title: "Title 3" },
        { id: 4, src: "../assets/images/4.jpg", title: "Title 4" },
        { id: 5, src: "../assets/images/5.jpg", title: "Title 5" },
      ];
      resolve(images);
    }, delay);
  });
}
export function simulatedImageApiCall2() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      var images = [];
      var files = FileReader.readdirSync(folder);
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.endsWith(".png") || file.endsWith(".jpg")) {
          images.push(folder + "/" + file);
        }
      }
      resolve(images);
    }, delay);
  });
}
