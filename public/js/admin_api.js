Admin = {

    uploadFont(callback) {
        event.preventDefault();

        let files = document.querySelector('input[name="font_file"]').files,
            data = new FormData();


        $.each(files, (index, file) => {
            data.append(index, file);
            console.log(index, file);
        });

        $.each($('input[name*="font"]'), (index, child) => {
            console.log($(child).attr('name'), $(child).val());
            data.append($(child).attr('name'), $(child).val());
        });

        User.Ajax.post('/upload', data, (data) => {
            let status = JSON.parse(data).status;

            if (status) {
                if (callback) callback();
            }
        });
    }
}