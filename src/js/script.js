
$(function(){
	//ページ内リンク
	$('.js-header-item,.mv-btn,.footer-totop').click(function(){
		var id = $(this).attr('href');
		var headerHeight = $('header').outerHeight()
		var position = $(id).offset().top-headerHeight;
		// console.log(id);
		// console.log(headerHeight);
		$('html,body').animate({
			'scrollTop': position
		},500);
	});

	//スクロールしたらフローティングボタン表示
	$(window).on("scroll", function() {
		if ($(this).scrollTop() > 100) {
			$('.footer-totop').show();
		} else {
			$('.totpo').hide();
		}
	});

	//リンクにactiveクラス
	$('.js-header-item').click(function(){
		$('.js-header-item').removeClass('js-header-item-active');
		$(this).addClass('js-header-item-active');
	})
})


//Q&Aアコーディオン
$('.js-qa-item').click(function(){
	$(this).find('.qa-answer').slideToggle();
	$(this).find('.qa-icon').toggleClass('qa-icon-minus');
})

$(document).ready(function() {
	$('.drawer').drawer();
});

//Swiperでスライダー
var swiper = new Swiper('.swiper-container', {
	slidesPerView: 3,
			slidesPerGroup: 1,
			spaceBetween: 28,
			breakpoints: {
				1060: {
					slidesPerView: 3,
					slidesPerGroup: 1,
					spaceBetween: 25,
				},
				767: {
					slidesPerView: 3,
					slidesPerGroup: 1,
					spaceBetween: 24.05,
				}
			},
	// スライドをループ
	loop: true,
	// ページネーションを表示
	pagination: {
		el: '.swiper-pagination',
		type: 'bullets',
		clickable: true,
	},
});

new WOW().init();
