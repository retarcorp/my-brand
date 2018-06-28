Admin = {
    init() {
        $('.panel__font-form').on('submit', this.uploadFont);
    }

    ,uploadFont() {

        event.preventDefault();

        let files = document.querySelector('input[name="font_file"]').files,
            data = new FormData();


        $.each(files, (index, file) => {
            data.append(index, file);
            console.log(index, file);
        });

        $.each($('input'), (index, child) => {
            console.log($(child).attr('name'), $(child).val());
            data.append($(child).attr('name'), $(child).val());
        });

        console.log(data);

        User.Ajax.post('/upload', data, (data) => {
            console.log(data);

            let status = JSON.parse(data).status;



            if (status) {
                location.reload();
            }
        });
    }
}