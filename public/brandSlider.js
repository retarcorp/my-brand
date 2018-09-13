var BrandSlider = {

    init: function(){
        // let slides = this.getAllSlides();
        let btnNextSlide = document.querySelector('.btn-slider-next'),
            btnPrevSlide = document.querySelector('.btn-slider-prev');

        btnPrevSlide.style.display = "none";
        btnNextSlide.addEventListener('click', BrandSlider.onNextBtn.bind(this));
        btnPrevSlide.addEventListener('click', BrandSlider.onPrevBtn.bind(this));

    },
    getAllSlides: function(){
        return document.querySelectorAll('.slider__wrapper .slider__item');
    },
    onPrevBtn: function(){
        this.setPrevMiddleSlide();
    },
    getMiddleSlide: function() {
        return document.querySelector('.middle-slide');
    },
    onNextBtn: function() {
        this.setNextMiddleSlide();
    },
    setNextMiddleSlide: function() {
        let currentSlide = this.getMiddleSlide(),
            arraySlides = Array.prototype.slice.call(this.getAllSlides()),
            btnNext = document.querySelector('.btn-slider-next'),
            btnPrev = document.querySelector('.btn-slider-prev');
        
        if(arraySlides.indexOf(currentSlide) < (arraySlides.length - 2)){
            console.log(arraySlides.length);
            console.log(arraySlides.indexOf(currentSlide) + 2);
            arraySlides[arraySlides.indexOf(currentSlide) + 1].classList.add('middle-slide');
            currentSlide.classList.remove('middle-slide');
            if(arraySlides.indexOf(currentSlide) + 2 < arraySlides.length){
                btnNext.style.display = 'none'; 
            }
            btnPrev.style.display = 'block';
            this.scrollWrapperRight();
        }

    },
    setPrevMiddleSlide: function(){
        let currentSlide = this.getMiddleSlide(),
            arraySlides = Array.prototype.slice.call(this.getAllSlides()),
            btnNext = document.querySelector('.btn-slider-next'),
            btnPrev = document.querySelector('.btn-slider-prev');
        
        if(1 < arraySlides.indexOf(currentSlide)){
            arraySlides[arraySlides.indexOf(currentSlide) - 1].classList.add('middle-slide');
            currentSlide.classList.remove('middle-slide');
            if(arraySlides.indexOf(currentSlide) > 1){
                btnPrev.style.display = 'none';
            }
            btnNext.style.display = 'block'; 
            this.scrollWrapperLeft();    
        }
    },
    scrollWrapperRight: function(){
        let scrollWrapper = document.querySelector('.slider__wrapper'),
            slideWidth = document.querySelector('.slider__item').offsetWidth;
            transformScroll = scrollWrapper.style.transform;
        // The number 30 is a margin slider item
        if(transformScroll){
            let translateValue = Number(transformScroll.replace(/\D+/g,"")) + slideWidth + 30;
            scrollWrapper.style.transform = `translate(-${translateValue}px)`;
            console.log(scrollWrapper.style.transform );

        } else {
            scrollWrapper.style.transform = `translate(-240px)`;
        }
    },
    scrollWrapperLeft: function(){
        let scrollWrapper = document.querySelector('.slider__wrapper'),
            slideWidth = document.querySelector('.slider__item').offsetWidth;
            transformScroll = scrollWrapper.style.transform;
        
        if(transformScroll){
            let translateValue = Number(transformScroll.replace(/\D+/g,"")) - slideWidth - 30;
            scrollWrapper.style.transform = `translate(-${translateValue}px)`;
        } else {
            scrollWrapper.style.transform = `translate(0px)`;
        }
    }
}
