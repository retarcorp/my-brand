var convaseSettings;

var Slider = {
    init: function(basis){
        this.onSlideClick(basis);
    }
    ,getMainImgSlider: function(){
        var mainImg = document.querySelector('.workspace img');
        return mainImg;
    }
    ,getAllImgSlider: function(){
        var allImgs = document.querySelectorAll('.slider-workspace .img-slider img');
        return allImgs;
    }
    ,onSlideClick: function(basis){
        var slides = this.getAllImgSlider(),
            mainSlide = this.getMainImgSlider();

        slides.forEach((item) => {
            item.addEventListener('click', (e) => {
                mainSlide.src = e.srcElement.getAttribute('src');
                convaseSettings = ConvasSettings.copySettings(basis, mainSlide.getAttribute('src'));
                console.log(convaseSettings);
            });
        });
    }
    ,setSliderImgs: function(arrayImgs){
        var container = $('.slider-workspace'),
            mainSlide = this.getMainImgSlider();
            templateStr = '';
        var template = `<din class="img-slider">
                            <img src="{path}" alt="">
                        </din>`;
        mainSlide.src = arrayImgs[0];
        if(arrayImgs.length > 1){
            arrayImgs.forEach((item) => {
                var temp
                templateStr += template.replace("{path}", item);
            });
            container[0].innerHTML = templateStr;
        } else {
            container[0].innerHTML = template.replace("{path}", arrayImgs[0]);
        }
        

        
    }
};

var EditorText = {
    init: function() {
        this.connectAllFonts();
        // this.fillFontEditor();
        this.onBtnWeightText();
        this.onBtnCursiveText();
        this.onBtnUnderlineText();
        this.onBtnColorText();
        this.onBtnSizeText();
        this.onSelectListStyleText();
        this.onBtnTextPosition();
    }
    ,getTextarea: function(){
        var area = document.querySelector('#text-workspace');
        // var selectedText = text.value;

        // if(text.selectionStart != 'undefined' && text.selectionStart != text.value.length){
        //     var startPos = text.selectionStart;
        //     var endPos = text.selectionEnd;
        //     selectedText = text.value.substring(startPos,endPos);
        // }

        return area;
    }
    ,getBtnColorText: function(){
        var btn = document.querySelector('.text-decoration .btn-color');
        return btn;
    }
    ,getBtnWeightText: function(){
        var btn = document.querySelector('.text-decoration .btn-bold');
        return btn;
    }
    ,getBtnCursiveText: function(){
        var btn = document.querySelector('.text-decoration .btn-cursive');
        return btn;
    }
    ,getBtnUnderlineText: function(){
        var btn = document.querySelector('.text-decoration .btn-underline');
        return btn;
    }
    ,getBtnSizeText: function(){
        var btn = document.querySelector('.text-decoration .btn-size');
        return btn;
    }
    ,getAllBtmPositionText: function() {
        var arrayBtn = document.querySelectorAll('.text-position button');
        return arrayBtn;
    }
    ,getAllFontsText: function() {

        var arrayFonts = document.querySelectorAll('#style-text option');
        return arrayFonts;
    }
    // ,getBtnTextPositionLeft: function(){
    //     var btn = document.querySelector('.text-position .btn-text-left');
    //     return btn;
    // }
    // ,getBtnTextPositionCenter: function(){
    //     var btn = document.querySelector('.text-position .btn-text-center');
    //     return btn;
    // }
    // ,getBtnTextPositionRight: function(){
    //     var btn = document.querySelector('.text-position .btn-text-right');
    //     return btn;
    // }
    // ,getBtnTextPositionStretch: function(){
    //     var btn = document.querySelector('.text-position .btn-text-stretch');
    //     return btn;
    // }
    ,onBtnClick: function(btn){

        var background = btn.style.backgroundColor;

        if(btn.style.backgroundColor !== 'rgb(221, 221, 221)'){
            btn.style.backgroundColor = '#ddd';
        } else {
            btn.style.backgroundColor = "#fff";
        }
    }
    ,onBtnWeightText: function(){

        var btn = this.getBtnWeightText();
        var textArea = this.getTextarea();

        btn.addEventListener('click', (e) => {
            this.onBtnClick(btn);
            if(textArea.style.fontWeight == 'bold'){
                textArea.style.fontWeight = '100';
            } else {
                textArea.style.fontWeight = 'bold';                      
            }
        });
    },
    onBtnCursiveText: function(){

        var btn = this.getBtnCursiveText();
        var textArea = this.getTextarea();

        btn.addEventListener('click', (e) => {
            this.onBtnClick(btn);
            if(textArea.style.fontStyle == 'italic'){
                textArea.style.fontStyle = 'normal';
            } else {
                textArea.style.fontStyle = 'italic';                      
            }
        });
    }
    ,onBtnUnderlineText: function(){

        var btn = this.getBtnUnderlineText();
        var textArea = this.getTextarea();

        btn.addEventListener('click', (e) => {
            this.onBtnClick(btn);
            if(textArea.style.textDecoration == 'underline'){
                textArea.style.textDecoration = 'none';
            } else {
                textArea.style.textDecoration = 'underline';                      
            }
        });
    },
    onBtnColorText: function(){   

        var btn = this.getBtnColorText();
        var textArea = this.getTextarea();

        btn.addEventListener('input', (e) => {
            var color = btn.value;
            // this.onBtmClick(btn);
           textArea.style.color = color;
        });
    }
    ,onBtnSizeText: function() {

        var btn = this.getBtnSizeText();
        var textArea = this.getTextarea();

        // btn.addEventListener('input', (e) => {
        //     var size = btn.value;
        //     textArea.style.fontSize = size + 'px';

        // });
    }
    ,connectAllFonts: function(){
        var fonts = ServerJSON.getDataFonts(),
            tempFontFaceString = '';
        var head = document.body || document.getElementsByTagName('body')[0],
            style = document.createElement('style');


        fonts.forEach((item) => {
            var fontFaceTemplate = `@font-face {
                font-family: ${item.name};
                src: url(${item.src});
            }\n`;

            tempFontFaceString += fontFaceTemplate;
        });
        style.type = 'text/css';
        style.innerHTML = tempFontFaceString;
        head.appendChild(style);

        this.fillFontEditor(fonts);
    }
    ,fillFontEditor: function(fonts){
        var listContainer = document.querySelector('.list-fonts'),
            textArea = this.getTextarea(),
            tempString = '';


        fonts.forEach((item) => {
            var template = `<li style="font-family: ${item.name}">${item.name}</li>`;

            tempString += template;

        });

        listContainer.innerHTML = tempString;

    }
    // ,onBtnLeftText: function(){
        
    //     var btn = this.getBtnTextPositionLeft();
    //     var textArea = this.getTextarea();

    //     btn.addEventListener('click', (e) => {
    //         this.onBtnClick(btn);
    //         textArea.style.textAlign = 'left';
    //     });
    // }
    // ,onBtnCenterText: function(){
    //     var btn = this.getBtnTextPositionCenter();
    //     var textArea = this.getTextarea();

    //     btn.addEventListener('click', (e) => {
    //         this.onBtnClick(btn);
    //         textArea.style.textAlign = 'center';
    //     });
    // }
    // ,onBtnRightText: function(){
    //     var btn = this.getBtnTextPositionRight();
    //     var textArea = this.getTextarea();

    //     btn.addEventListener('click', (e) => {
    //         this.onBtnClick(btn);
    //         textArea.style.textAlign = 'right';
    //     });
    // }
    // ,onBtnStretchText: function(){
    //     var btn = this.getBtnTextPositionStretch();
    //     var textArea = this.getTextarea();

    //     btn.addEventListener('click', (e) => {
    //         this.onBtnClick(btn);
    //         textArea.style.textAlign = 'justify';
    //     });
    // }
    ,onBtnTextPosition: function(){

        var arrayBtn = this.getAllBtmPositionText();
        var textArea = this.getTextarea();
        var arrayStyleValue = ['left', 'center', 'right', 'justify'];

        arrayBtn.forEach((item, i) => {
            item.addEventListener('click', (e) => {
                this.clearStyleBtnPositionText();
                this.onBtnClick(item);
                textArea.style.textAlign = arrayStyleValue[i];
            });
        });
    }
    ,onSelectListStyleText: function(){

        var select = document.querySelectorAll('.fonts-text .list-fonts li');
        var textArea = this.getTextarea();

        select.forEach(item => {
            item.addEventListener('click', (e) => {
                this.clearListStyle(select);
                item.style.background = "rgb(244, 242, 243)";
            });
        });
        
    }
    ,clearListStyle: function(array){
        array.forEach((item) => {
            item.style.background = "none";
        });
    }
    ,clearStyleBtnPositionText: function(){

        var arrayBtn = this.getAllBtmPositionText();

        arrayBtn.forEach((item) => {
            item.style.backgroundColor = "#fff";
        });
    }
};


var MainMenu = {
    init: function(){
        this.onListSettings();
    }
    ,getMenuItems: function(){
        var items = document.querySelectorAll('.main-list-item .list-settings li');
        return items;
    }
    ,clearSelectItem: function(){
        var items = this.getMenuItems();
        items.forEach((i) => {
            i.style.backgroundColor = "#fff";
        });
    }
    ,selectedItem: function(){
        MainMenu.clearSelectItem();
        this.style.backgroundColor = "#F4F2F3";
    }
    ,getAdditionText: function(){
        var blockText = document.querySelectorAll('.settings .addition-text');
        return blockText;
    }
    ,getAdditionPrint: function(){
        var blockPrint = document.querySelectorAll('.settings .addition-print');
        return blockPrint;
    }
    ,getAdditionBasis: function(){
        var blockPrint = document.querySelectorAll('.settings .addition-basis');
        return blockPrint;
    }
    ,getAllSettingsBlock: function(){
        var settingBlock = document.querySelectorAll('.settings>div');
        return settingBlock
    }
    ,hideAllSettings: function(){
        var settings = this.getAllSettingsBlock();
        
        settings.forEach((item) => {
            item.classList.remove('displayBlock');
        });

    }
    ,showBlockSetting: function(){
        this[0].classList.add('displayBlock');
    }
    ,onListSettings: function(){
        var list = this.getMenuItems(),
            print = this.getAdditionPrint(),
            text = this.getAdditionText(),
            basis = this.getAdditionBasis();
        
        list.forEach((item) => {
            item.addEventListener('click', (e) => {
                this.hideAllSettings();
                this.selectedItem.call(item);
                e.preventDefault();
                if(item.className == "basis-set"){
                    this.showBlockSetting.call(basis);
                } else if(item.className == "text-set") {
                    this.showBlockSetting.call(text);
                    EditorText.init();
                }else if(item.className == "print-set") {
                    this.showBlockSetting.call(print);
                    PrintMenu.init();
                }
            });
        });
    }
};


var PrintMenu = {
    init: function(){
        var startTab = this.getTabGallery();
        this.startSettingsTabs();  
        this.onListPrint();

    }
    ,startSettingsTabs: function() {
        this.selectedList.call(this.getAllList()[0]);
        this.showTabPrint.call(this.getTabGallery());
        this.hideTabPrint.call(this.getTabFile());
    }
    ,getAllList: function() {
        var list = document.querySelectorAll('.editor-print .controller-print li');
        return list;
    }
    ,clearSelectList: function(){
        var items = this.getAllList();
        items.forEach((i) => {
            i.style.backgroundColor = "#fff";
        });
    }
    ,selectedList: function(){
        PrintMenu.clearSelectList();
        this.style.backgroundColor = "#F4F2F3";
    }
    ,getTabGallery: function(){
        var tab = document.querySelector('.editor-print .gallery-print');
        return tab;
    }
    ,getTabFile: function(){
        var tab = document.querySelector('.editor-print .file-print');
        return tab;
    }
    ,hideTabPrint: function(){
        this.style.display = "none";
    }
    ,showTabPrint: function(){
        this.style.display = "flex";
    }

    ,onListPrint: function(){
        var list = this.getAllList();

        list.forEach((item) => {
            item.addEventListener('click', (e) => {
                this.selectedList.call(item);
                if(item.className == "pr-gal"){
                    this.hideTabPrint.call(this.getTabFile());
                    this.showTabPrint.call(this.getTabGallery());
                } else if(item.className == "pr-file"){
                    this.hideTabPrint.call(this.getTabGallery());
                    this.showTabPrint.call(this.getTabFile());
                }
            });
        })
    }
};

function onBtnBuy() {
    var btnPay = document.querySelector('.btn-buy'),
        payDialog = document.querySelector('.dialog-pay');

    btnPay.addEventListener('click', (e) => {
        payDialog.style.display = "block";
    });
}

var PayForm = {
    init : function(){
        this.onBtnCancel();
    }
    ,getPayDialog : function(){
        var payDialog = document.querySelector('.dialog-pay');
        return payDialog;
    }
    ,onBtnCancel: function(){
        var btnCancel = document.querySelector('.pay-cancel');
        btnCancel.addEventListener('click', (e) => {
            this.getPayDialog().style.display = "none";
        });
    }
    ,setPrice: function(costs){
        var price = document.querySelector('.price .costs p:last-child');
        
        price.innerHTML = costs + "p";
    }
}



/** 
 * Just run npm install http-server -g 
 * and you will be able to use it in terminal 
 * like http-server C:\location\to\app.
**/



var ServerJSON = {
    getData: function(){
        var data =  $.ajax({
            type: 'GET',
            url: 'server.json',
            dataType: 'json',
            success: function() { },
            data: {},
            async: false
        });
        
        return data.responseJSON;
    },
    getDataFonts: function(){
        var data =  $.ajax({
            type: 'GET',
            url: 'fonts.json',
            dataType: 'json',
            success: function() { },
            data: {},
            async: false
        });
        
        return data.responseJSON.fonts;
    },
    sendData: function(info){
        var data = $.ajax({
            type: 'POST',
            url: 'server.json',
            dataType: 'json',
            success: function() { },
            data: {url: JSON.stringify(info)},
            async: false
        });
    }
};


var Basis = {
    init: function(){
        var data = ServerJSON.getData();

        this.fillBasisList(data);
        this.onBasis(data);
    }
    ,fillBasisList: function(data) {
        var basis = Object.keys(data);
        var container = $('.basis-gallery');
        var template = `<div data-basis="{basis}" class="basis-img">\
                            <img src="{path}" alt="">\
                        </div>`;
        var arrayPath = [],
            templatesString = '';

        basis.forEach((item) => {
            var temp = template.replace("{basis}", item);
            templatesString += temp.replace("{path}", data[item].sliderImgs[0]);
        });

        container[0].innerHTML = templatesString;
            
    }
    ,getBasisList: function() {
        var list = document.querySelectorAll('.basis-gallery .basis-img');
        return list;
    }
    ,onBasis: function(data) {
        var listBasis = this.getBasisList(),
            workspace = Slider.getMainImgSlider();

        listBasis.forEach((item) => {
            item.addEventListener('click', (e) => {
                this.clearBasis(listBasis);
                var basis = item.getAttribute('data-basis');
                item.style.background= "#eee";
                
                $('.price').show();
                Slider.setSliderImgs(data[basis].sliderImgs);
                Slider.init(data[basis]);
                convaseSettings = ConvasSettings.copySettings(data[basis], workspace.getAttribute('src'));
                console.log(convaseSettings);
                PayForm.setPrice(data[basis].price);
                
            });
        });
    }
    ,clearBasis: function(list){
        var settings = "none";
        list.forEach(item => {
            item.style.background = settings; 
        });
    }
}

var ConvasSettings = {
    
    copySettings: function(basis, currentSrc){
        var settings = basis.settings,
            copy = {};
        var conSettings = {};    
        settings.forEach((item, i) => {
            for(var key in item){
                if(item[key] == currentSrc){
                    copy = item;
                }
            }
        });

        return copy;
    }
    ,currentSettings: function(obj){

    }
};


window.onload = function(){
    var arr = [
           {"name": "Вася", "age": 20},
           {"name": "Петя", "age": 22},
           {"name": "Таня", "age": 18}
    ];        
    MainMenu.init();
    PayForm.init();
    Basis.init();
    onBtnBuy();
    // ServerJSON.sendData(arr);
}