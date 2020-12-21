// Gulp.js configuration

const
  gulp = require('gulp'),
  noop = require('gulp-noop'),
  sass = require('gulp-sass'),
  newer = require('gulp-newer'),
  babelify = require('babelify'),
  concat = require('gulp-concat'),
  terser = require('gulp-terser'),
  deporder = require('gulp-deporder'),
  imagemin = require('gulp-imagemin'),
  htmlclean = require('gulp-htmlclean'),
  browserify = require('gulp-browserify'),
  devBuild = (process.env.NODE_ENV !== 'production'),
  stripdebug = devBuild ? null : require('gulp-strip-debug'),
  sourcemaps = devBuild ? require('gulp-sourcemaps') : null,
  src = 'src/',
  build = 'build/';

const sync = require("browser-sync").create();

  // image processing
function images() {

  const out = build + 'images/';

  return gulp.src(src + 'images/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));

};

// HTML processing
function html() {
  const out = build;

  return gulp.src(src + 'html/**/*')
    .pipe(newer(out))
    .pipe(devBuild ? noop() : htmlclean())
    .pipe(gulp.dest(out));
}

// JavaScript processing
function js() {

  return gulp.src(src + 'js/**/*')
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(deporder())
    .pipe(concat('main.js'))
    .pipe(browserify({
        debug: true,
        transform: [babelify.configure({
            presets: ['es2015']
        })]
    }))
    .pipe(stripdebug ? stripdebug() : noop())
    .pipe(terser())
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(gulp.dest(build + 'js/'));

}


// CSS processing
function css() {

  return gulp.src(src + 'scss/**/*', { allowEmpty: true })
    .pipe(sourcemaps ? sourcemaps.init() : noop())
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: '/images/',
      precision: 3,
      errLogToConsole: true
    }).on('error', sass.logError))
    .pipe(sourcemaps ? sourcemaps.write() : noop())
    .pipe(concat('main.css'))
    .pipe(gulp.dest(build + 'css/'));

}

function browserSync(cb) {
    sync.init({
        server: {
            baseDir: "./build"
        }
    });

    if(devBuild){
      gulp.watch(src + 'scss/**/*', css).on('change', sync.reload);
      gulp.watch(src + 'js/**/*', js).on('change', sync.reload);
      gulp.watch("./public/**.html").on('change', sync.reload);
    }
}

// watch for file changes
function watch(done) {

  if(devBuild){
    // image changes
    gulp.watch(src + 'images/**/*', images);

    // html changes
    gulp.watch(src + 'html/**/*', html);

    // css changes
    gulp.watch(src + 'scss/**/*', css);

    // js changes
    gulp.watch(src + 'js/**/*', js);
  }
  done();

}

exports.html = gulp.series(images, html);
exports.css = gulp.series(images, css);
exports.sync = browserSync;
exports.images = images;
exports.watch = watch;
exports.js = js;

// run all tasks
exports.build = gulp.parallel(exports.html, exports.css, exports.js);

exports.default = gulp.series(exports.build, exports.watch, exports.sync);