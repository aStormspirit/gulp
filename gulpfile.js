const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const sync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");

const js = () => {
  return src("src/js/main.js")
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("src/js"))
    .pipe(sync.stream());
};

const styles = () => {
  return src("src/scss/*/**.scss")
    .pipe(autoprefixer({ overrideBrowserslist: ["last 3 version"] }))
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest("src/css"))
    .pipe(sync.stream());
};

const html = () => {
  return src("src/*.html").pipe(dest("dist"));
};

const watcher = () => {
  watch("src/scss/**/*.scss", series(styles));
  watch("src/js/main.js", series(js, reload));
  watch("src/*.html", series(html, reload));
};

const server = (done) => {
  sync.init({
    server: {
      baseDir: "src/",
    },
    // cors: true,
    // notify: false,
    // ui: false,
  });
  done();
};

const reload = (done) => {
  sync.reload();
  done();
};

const cleanDist = () => {
  return src("dist").pipe(clean());
};

const building = () => {
  return src(["src/css/style.min.css", "src/js/main.min.js", "src/*.html"], {
    base: "src",
  }).pipe(dest("dist"));
};

exports.styles = styles;
exports.js = js;
exports.watcher = watcher;
exports.server = server;
exports.reload = reload;
exports.html = html;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, js, server, watcher);
