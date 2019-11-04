var gulp = require('gulp');
var sass = require('gulp-sass'); //Sassコンパイル
var plumber = require('gulp-plumber'); //エラー時のwatch強制終了を防止
var notify = require('gulp-notify'); //エラー発生時にデスクトップ通知する
var sassGlob = require('gulp-sass-glob'); //@importの記述を簡潔にする
var browserSync = require( 'browser-sync' ); //ブラウザ反映
var postcss = require('gulp-postcss'); //autoprefixerとセット
var autoprefixer = require('autoprefixer'); //ベンダープレフィックス付与
var cssdeclsort = require('css-declaration-sorter'); //css並べ替え
var assets = require('postcss-assets'); //画像名で画像パスやサイズ取得
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var mozjpeg = require('imagemin-mozjpeg');
var mqpacker = require('css-mqpacker');
var cleanCSS = require('gulp-clean-css'); //css圧縮
var uglify = require('gulp-uglify'); //js圧縮
var rename = require('gulp-rename'); //.ejsの拡張子を変更
var ejs = require('gulp-ejs');
var replace = require('gulp-replace');

// scssのコンパイル
gulp.task('sass', function() {
return gulp
//scssを格納している場所
.src( './src/sass/**/*.scss', { sourcemaps: true })
.pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) )//エラーチェック
.pipe( sassGlob() )//importの読み込みを簡潔にする
.pipe( sass({
outputStyle: 'expanded' //expanded, nested, campact, compressedから選択
}) )
.pipe(postcss([assets({
	loadPaths: ['dist/img'],
	relative: true,//画像パスを相対パスへ
	cachebuster: true
 }) ])) //画像名で画像パスやサイズ取得
.pipe( postcss([ autoprefixer(
{
// ☆IEは11以上、Androidは4.4以上
// その他は最新2バージョンで必要なベンダープレフィックスを付与する
// browsers: ["last 2 versions", "ie >= 11", "Android >= 4"],
cascade: false}
) ]) )
.pipe(postcss([mqpacker()])) //メディアクエリをまとめる
.pipe( postcss([ cssdeclsort({ order: 'smacss' }) ]) )//プロパティをソートし直す(アルファベット順)
.pipe(gulp.dest('./src/css', { sourcemaps: true }));//コンパイル後の出力先
});

//cssをmin.cssへ圧縮
gulp.task("cleanCSS", function() {
	return gulp
	.src('src/css/*.css')
	.pipe(cleanCSS())
	.pipe(rename({
			extname: '.min.css'
	}))
	.pipe(gulp.dest('./dist/css'));
});

//jsをmin.jsへ圧縮
gulp.task("uglify", function() {
	return gulp
	.src('src/js/*.js')
	.pipe(uglify())
	.pipe(rename({
			extname: '.min.js'
	}))
	.pipe(gulp.dest('./dist/js'));
});

// 保存時のリロード
gulp.task( 'browser-sync', function(done) {
browserSync.init({

//ローカル開発
server: {
baseDir: "./",
index: "index.html"
}
});
done();
});

gulp.task( 'bs-reload', function(done) {
browserSync.reload();
done();
});

gulp.task("ejs", (done) => {
	return gulp
.src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
.pipe( plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }) )//エラーチェック
.pipe(ejs({}, {}, { ext: '.html' })) //ejsを纏める
.pipe(rename({extname: ".html"})) //拡張子をhtmlに
.pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1")) //冒頭の余白を削除
.pipe(gulp.dest("./")); //出力先
done();
});

// 監視
gulp.task( 'watch', function(done) {
gulp.watch( './src/sass/**/*.scss', gulp.task('sass') ); //sassが更新されたらgulp sassを実行
gulp.watch( './src/sass/**/*.scss', gulp.task('cleanCSS') ); //sassが更新されたらgulp cleanCSSを実行
gulp.watch('./src/sass/**/*.scss', gulp.task('bs-reload')); //sassが更新されたらbs-reloadを実行
gulp.watch( './src/js/*.js', gulp.task('bs-reload') ); //jsが更新されたらbs-relaodを実行
gulp.watch( './src/js/*.js', gulp.task('uglify') ); //jsが更新されたらbs-relaodを実行
//下層のhtmlファイルも監視対象に含めるため/**/を追加
gulp.watch('./**/*.html', gulp.task('bs-reload') );
gulp.watch('./src/ejs/**/*.ejs',gulp.task('ejs') ) ; //ejsが更新されたらgulp-ejsを実行
gulp.watch('./src/ejs/**/*.ejs',gulp.task('bs-reload') ) ; //ejsが更新されたらbs-reloadを実行
});

// default ”gulp”コマンドを打てばwatchとbrowser-syncが自動で走るように
gulp.task('default', gulp.series(gulp.parallel('browser-sync', 'watch')));

//圧縮率の定義
var imageminOption = [
pngquant({ quality: [.7, .85], }),
mozjpeg({ quality: 85 }),
imagemin.gifsicle({
interlaced: false,
optimizationLevel: 1,
colors: 256
}),
imagemin.jpegtran(),
imagemin.optipng(),
imagemin.svgo()
];
// 画像の圧縮
// $ gulp imageminで./src/img/base/フォルダ内の画像を圧縮し./src/img/フォルダへ
// .gifが入っているとエラーが出る
gulp.task('imagemin', function () {
return gulp
.src('./src/img/base/*.{png,jpg,gif,svg}')
.pipe(imagemin(imageminOption))
.pipe(gulp.dest('./dist/img'));
});
