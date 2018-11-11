$(function() {
    $(window).on('load', function() {
        stickyFooter();
    });
    $(window).on('resize', function() {
        stickyFooter();
    });
    $('#signup_form .input--email, #login_form .input--email').on('keyup', function() {
        var md5_email = md5($(this).val().toLowerCase().replace(/ /g, ''));
    });

    $('#impcsv_form').on('submit', function() {
        $('.form-control').removeClass('has-error');
        $('.error-message').addClass('hidden');
        var objFile = $('.input--file').get()[0].files[0];

        if (!objFile) {
            $('.error-message').removeClass('hidden');
            return false;
        }
        var formData = new FormData();
        formData.append("uploadCsv", objFile);

        $.ajax({
            url: '/impcsv',
            method: 'post',
            contentType: false,
            processData: false,
            data: formData,
            xhrFields: { withCredentials: true }
        }).success(function(response) {
            console.log('success in csv upload' + JSON.stringify(response));
            loadContacts();
        }).error(function(response) {
            console.log('In Error back ' + response);
            loadContacts();
            // $('.error-message').removeClass('hidden');
            // $('.error-message').text(response.responseJSON.message);
            // $('.submit-btn').removeClass('disabled');
            // $('.submit-btn').text('Submit');
        });
    });


    $('#signup_form .input--file').on('change', function() {
        $('.error-message').removeClass('hidden');
        $('.success-message').addClass('hidden');
        $('.submit-btn').addClass('disabled');
        $('.error-message').text('Uploading Image...');

        // GET FILE OBJECT 
        var objFile = $(this).get()[0].files[0];

        $.ajax({
            url: '/uploadURL',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify({
                "fileName": objFile.name,
                "contentType": objFile.type,
            }),
            xhrFields: { withCredentials: true }
        }).success(function(response) {
            $.ajax({
                url: response.message, // the presigned URL
                type: 'PUT',
                contentType: objFile.type,
                processData: false,
                data: objFile
            }).success(function() {
                console.log('Uploaded data successfully.');
                $('.submit-btn').removeClass('disabled');
                $('.error-message').addClass('hidden');
                $('.error-message').text('All fields are required.');
                $('.profile-img').attr('src', 'https://s3.amazonaws.com/' + response.bucketName + '/images/' + objFile.name);
                $(".input--image").val(objFile.name);

            }).error(function(error) {
                $('.error-message').removeClass('hidden');
                $('.error-message').text(error.responseText);
                $('.submit-btn').removeClass('disabled');
                $('.submit-btn').text('Submit');
            });
        }).error(function(response) {
            $('.error-message').removeClass('hidden');
            $('.error-message').text(response.responseJSON.message);
            $('.submit-btn').removeClass('disabled');
            $('.submit-btn').text('Submit');
        });
    });
    $('#signup_form').on('submit', function() {
        var data = $(this).serializeFormJSON();
        // Do some validation
        $('.form-control').removeClass('has-error');
        $('.error-message').addClass('hidden');
        $('.error-message--email').addClass('hidden');
        if (!data.first_name) {
            $('.input--first-name').addClass('has-error');
            $('.error-message').removeClass('hidden');
            return false;
        }
        if (!data.last_name) {
            $('.input--last-name').addClass('has-error');
            $('.error-message').removeClass('hidden');
            return false;
        }
        if (!data.email || !isValidEmail(data.email)) {
            $('.input--email').addClass('has-error');
            $('.error-message--email').removeClass('hidden');
            return false;
        }
        if (!data.password) {
            $('.input--password').addClass('has-error');
            $('.error-message').removeClass('hidden');
            return false;
        }
        $('.error-message').addClass('hidden');
        $('.success-message').addClass('hidden');
        $('.submit-btn').addClass('disabled');
        $('.submit-btn').text('Submitting...');
        $.ajax({
            url: '/users',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            xhrFields: { withCredentials: true }
        }).success(function(result, status, xhr) {
            console.log('After user registraion : ' + JSON.stringify(result))
            $('.submit-btn').removeClass('disabled');
            $('.submit-btn').text('Submit');
            $('.success-message').removeClass('hidden');
            $('.signup-form__inputs').remove();
        }).error(function(response) {
            console.log('Error in user registraion : ' + JSON.stringify(response))
            $('.error-message').removeClass('hidden');
            $('.error-message').text(response.responseJSON.message);
            $('.submit-btn').removeClass('disabled');
            $('.submit-btn').text('Submit');
        });
        return false;
    });
    $('#login_form').on('submit', function() {
        var data = $(this).serializeFormJSON();
        // Do some validation
        $('.form-control').removeClass('has-error');
        if (!data.email || !isValidEmail(data.email)) {
            $('.input--email').addClass('has-error');
            $('.error-message--email').removeClass('hidden');
            return false;
        }
        if (!data.password) {
            $('.input--password').addClass('has-error');
            $('.error-message').removeClass('hidden');
            return false;
        }
        data.homeurl = "/";
        $('.error-message, .error-message--email').addClass('hidden');
        $('.success-message').addClass('hidden');
        $('.submit-btn').addClass('disabled');
        $('.submit-btn').text('Submitting...');

        $.ajax({
            url: './auth',
            method: 'post',
            contentType: 'application/json',
            data: JSON.stringify(data),
            xhrFields: { withCredentials: true }
        }).success(function(result, status, xhr) {
            console.log("After Auth : "+result);
            //call to get user details to Container 2 service
            loadContacts();

        }).error(function(response) {
            console.log("Error in Auth : "+JSON.stringify(response));
            $('.error-message').removeClass('hidden');
            $('.error-message').text(JSON.stringify(response));
            $('.submit-btn').removeClass('disabled');
            $('.submit-btn').text('Submit');
        });
        return false;
    });
});
// Functions
function stickyFooter() {
    var windowHeight = $(window).height();
    if (windowHeight > $('#footer').height() + $('#header').height() + $('#main').height()) {
        $('#footer').addClass('sticky');
    } else {
        $('#footer').removeClass('sticky');
    }
    $('#footer').removeClass('invisible');
}
(function($) {
    $.fn.serializeFormJSON = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);

function isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function friendlyDate(a) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var day = days[a.getDay()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = {
        day: day,
        date: date,
        month: month,
        year: year,
        hour: hour,
        min: min,
        sec: sec
    }
    return time;
}

function loadUsers() {

    $.ajax({
        url: '/users',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        xhrFields: { withCredentials: true }
    }).success(function(result, status, xhr) {
        console.log("In load users : " + result.status);
        if (result.status != 'error') {
            console.log(JSON.stringify(result));
            window.location.href = '/userspage';

        } else {
            window.location.href = '/?message=unauthorized';
        }


    }).error(function(response) {
        console.log(JSON.stringify(response));
        $('.error-message').removeClass('hidden');
        $('.error-message').text(JSON.stringify(response));
        $('.submit-btn').removeClass('disabled');
        $('.submit-btn').text('Submit');
    });
}

function loadContacts() {

    $.ajax({
        url: '/contacts',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        xhrFields: { withCredentials: true }
    }).success(function(result, status, xhr) {
        console.log("In load contacts : " + result.status);
        if (result.status != 'error') {
            console.log(JSON.stringify(result));
            window.location.href = '/contactspage';

        } else {
            window.location.href = '/?message=unauthorized';
        }
    }).error(function(response) {
        console.log(JSON.stringify(response));
        $('.error-message').removeClass('hidden');
        $('.error-message').text(JSON.stringify(response));
        $('.submit-btn').removeClass('disabled');
        $('.submit-btn').text('Submit');
    });
}