const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const sync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const svgSprite = require("gulp-svg-sprite");
const svgmin = require("gulp-svgmin");
const cheerio = require("gulp-cheerio");
const fileinclude = require("gulp-file-include");
const replace = require("gulp-replace");

const srcFolder = "./src";
const buildFolder = "./dist";
const paths = {
  srcSvg: `${srcFolder}/img/svg/**.svg`,
  srcImgFolder: `${srcFolder}/img`,
  buildImgFolder: `${buildFolder}/img`,
  srcScss: `${srcFolder}/scss/**/*.scss`,
  buildCssFolder: `${buildFolder}/css`,
  srcFullJs: `${srcFolder}/js/**/*.js`,
  srcMainJs: `${srcFolder}/js/main.js`,
  buildJsFolder: `${buildFolder}/js`,
  srcPartialsFolder: `${srcFolder}/partials`,
  resourcesFolder: `${srcFolder}/resources`,
  srcHtml: `${srcFolder}/*.html`,
  srcPartials: `${srcFolder}/partials/**/*.html`,
};

// HTML с file-include
const html = () => {
  return src(paths.srcHtml)
    .pipe(
      fileinclude({
        prefix: '@@', // Префикс для включения файлов
        basepath: '@file', // Путь для поиска файлов
        indent: true, // Сохраняем отступы
      })
    )
    .pipe(dest(buildFolder));
};

// javaScripts
const js = () => {
  return src(paths.srcMainJs)
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest(`${buildFolder}/js`))
    .pipe(sync.stream());
};

// Scss
const styles = () => {
  return src(paths.srcScss)
    .pipe(
      autoprefixer({
        cascade: false,
        grid: true,
        overrideBrowserslist: ["last 5 versions"],
      })
    )
    .pipe(concat("style.min.css"))
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(dest(`${buildFolder}/css`))
    .pipe(sync.stream());
};

const watcher = () => {
  watch(paths.srcScss, series(styles));
  watch(paths.srcMainJs, series(js, reload));
  watch([paths.srcHtml, paths.srcPartials], series(html, reload));
};

const server = (done) => {
  sync.init({
    server: {
      baseDir: buildFolder,
    },
  });
  done();
};

const reload = (done) => {
  sync.reload();
  done();
};

const cleanDist = () => {
  return src(buildFolder).pipe(clean());
};

const copyResources = () => {
  return src(`${srcFolder}/resources/**/*`).pipe(dest(`${buildFolder}/resources`));
};

const svgSprites = () => {
  return src(paths.srcSvg)
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $("[fill]").removeAttr("fill");
          $("[stroke]").removeAttr("stroke");
          $("[style]").removeAttr("style");
        },
        parserOptions: {
          xmlMode: true,
        },
      })
    )
    .pipe(replace("&gt;", ">"))
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest(paths.buildImgFolder));
};

// Обновленная задача build
exports.build = series(
  cleanDist, 
  parallel(styles, js, html, svgSprites, copyResources)
);

// Задача по умолчанию для разработки
exports.default = series(
  parallel(styles, js, html, svgSprites, copyResources),
  parallel(server, watcher)
);

exports.styles = styles;
exports.js = js;
exports.html = html;
exports.watcher = watcher;
exports.server = server;
exports.svgSprites = svgSprites;