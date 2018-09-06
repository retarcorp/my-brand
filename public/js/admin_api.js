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

        data.append('fancywork', AdminApp.font_fancywork.prop('checked'));
        data.append('print', AdminApp.font_print.prop('checked'));
        data.append('_3D', AdminApp.font_3D.prop('checked'));

        User.Ajax.post('/upload/font', data, (data) => {
            let status = JSON.parse(data).status;

            if (status) {
                if (callback) callback();
            } else {

            }
        });
    }
}