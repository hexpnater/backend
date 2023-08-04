var express = require('express');
const { Validator } = require('node-input-validator');
module.exports = {
    checkValidation: async (v) => {
        var erroResponse;
        await v.check().then(
            function (matched) {
                if (!matched) {
                    var valdErrors = v.errors;
                    var respErrors = [];
                    Object.keys(valdErrors).forEach(
                        function (key) {
                            if (valdErrors && valdErrors[key] && valdErrors[key].message) {
                                respErrors.push(valdErrors[key].message);
                            }
                        }
                    );
                    erroResponse = respErrors.join("");
                }
            }
        );
        return erroResponse;
    }

}