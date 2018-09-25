const gulp = require("gulp"),
    useref = require("gulp-useref"),
   connect = require("gulp-connect"),
     image = require("gulp-image"),
    uglify = require("gulp-uglify"),
      csso = require("gulp-csso"),
sourcemaps = require("gulp-sourcemaps"),
      sass = require("gulp-sass"),
    rename = require("gulp-rename"),
    concat = require("gulp-concat"),
    iff    = require("gulp-if"),
  lazypipe = require("lazypipe"),
       del = require("del");

const options = {
  dest : "dist"
};

function compileSass() {
  return gulp.src("sass/global.scss")
             .pipe(sourcemaps.init())
             .pipe(sass())
}

gulp.task("images", function(done) {
  gulp.src(["images/*.jpg", "images/*.png"])
             .pipe(image())
             .pipe(gulp.dest(options.dest + "/content", {base: "./"}))
             .pipe(connect.reload())
             .on("end", done);
});

gulp.task("styles", function(done) {
  compileSass()
             .pipe(rename("all.min.css"))
             .pipe(csso())
             .pipe(sourcemaps.write("./"))
             .pipe(gulp.dest(options.dest + "/styles", {base: "./"}))
             .pipe(connect.reload())
             .on("end", done);
});

gulp.task("compileSass", function(done) {
  compileSass()
             .pipe(sourcemaps.write("./"))
             .pipe(gulp.dest("css", {base: "./"}))
             .on("end", done);


});

gulp.task("html", gulp.series("compileSass", function(done) {
  gulp.src("index.html")
             .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
             .pipe(iff("*.css", csso()))
             .pipe(iff("*.js", uglify()))
             .pipe(sourcemaps.write("./"))
             .pipe(gulp.dest(options.dest))
             .pipe(connect.reload())
             .on("end", done);

}));

gulp.task("scripts", function(done) {
  gulp.src("js/**/*")
             .pipe(sourcemaps.init())
             .pipe(concat("all.min.js"))
             .pipe(uglify())
             .pipe(sourcemaps.write("./"))
             .pipe(gulp.dest(options.dest + "/scripts"))
             .pipe(connect.reload())
             .on("end", done);
});


gulp.task("watch", function() {
  gulp.watch("sass/**/**/*", gulp.series("styles"));
  gulp.watch("js/**/*", gulp.series("scripts"));
  gulp.watch("*.html", gulp.series("html"));
});

gulp.task("clean", function(done) {
  del.sync("./dist");
  done();
});

gulp.task("build", gulp.series("clean", "html", "images", function(done) {
  gulp.src(['icons/**'], {base: './'})
             .pipe(gulp.dest(options.dest))
             .on("end", done);
}));

gulp.task("serve", gulp.series("build", function(done) {
  connect.server({
    name: 'Photostream',
    root: './dist',
    port: 8000,
    livereload: true
  });
}));

gulp.task("default", gulp.parallel("serve", "watch", function() {}));
