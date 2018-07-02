Bases = {
    formBaseData(form_fields) {
        let workzones = [];

        console.log(form_fields);

        for (key in form_fields) {
            if (parseInt(key) || parseInt(key) === 0) {
                //workzones.push(JSON.stringify(form_fields[key]));
            }
        }


    }
}

module.exports = Bases;