var form_add = document.getElementById('add').getElementsByTagName('form')[0];

var select_user = document.getElementById('user');
var select_spool = document.getElementById('spool');

var select_m = document.getElementById('date_m');
var select_d = document.getElementById('date_d');
var select_y = document.getElementById('date_y');

var new_user = document.getElementById('new_user');
var new_spool = document.getElementById('new_spool');

var messages_add_job = document.getElementById('messages_new');

var table_jobs = document.getElementById('jobs');


const req = new XMLHttpRequest();

function show(element) {
    element.style.display = 'initial';
}
function hide(element) {
    element.style.display = 'none';
}

function addMessageNewJob(type, message) {
    var div_message = document.createElement('div');
    div_message.className = type;

    var p_message = document.createElement('p');
    var p_message_node = document.createTextNode(message);
    p_message.appendChild(p_message_node);

    div_message.appendChild(p_message);

    messages_add_job.appendChild(div_message);

    setTimeout(function() {
        while(div_message.lastChild) {
            div_message.removeChild(div_message.lastChild);
        }
        div_message.parentNode.removeChild(div_message);
    }, 4000);
}

function addUserToDOM(user) {
    var new_option = document.createElement('option');
    new_option.setAttribute('value', user.id);
    var new_option_text = document.createTextNode(user.first_name + ' ' + user.last_name.toUpperCase());
    new_option.appendChild(new_option_text);

    select_user.appendChild(new_option);

    // TODO: add USER in USER LIST
}

function addJobToDOM(job) {
    // TODO: estimated price & date

    var new_tr = document.createElement('tr');

    var new_td_date = document.createElement('td');
    var new_td_user = document.createElement('td');
    var new_td_description = document.createElement('td');
    var new_td_material = document.createElement('td');
    var new_td_weight = document.createElement('td');
    var new_td_time = document.createElement('td');
    var new_td_estimated_price = document.createElement('td');

    var date_js = new Date(job.date);
    var new_td_date_text = document.createTextNode(date_js.toDateString());
    var new_td_description_text = document.createTextNode(job.description);
    var new_td_weight_text = document.createTextNode(job.weight + 'g');
    var new_td_time_text = document.createTextNode(job.time_h + 'h' + job.time_m + 'm');
    var new_td_estimated_price_text = document.createTextNode(job.estimated_price / 100 + '€');

    var new_td_user_text;
    var new_td_material_text;
    for(var i = 0; i < select_user.options.length; i++) {
        if(select_user.options[i].value == job.user_id) {
            new_td_user_text = document.createTextNode(select_user.options[i].text);
        }
    }
    for(var i = 0; i < select_spool.options.length; i++) {
        if(select_spool.options[i].value == job.spool_id) {
            new_td_material_text = document.createTextNode(select_spool.options[i].text);
        }
    }

    new_td_date.appendChild(new_td_date_text);
    new_td_user.appendChild(new_td_user_text);
    new_td_description.appendChild(new_td_description_text);
    new_td_material.appendChild(new_td_material_text);
    new_td_weight.appendChild(new_td_weight_text);
    new_td_time.appendChild(new_td_time_text);
    new_td_estimated_price.appendChild(new_td_estimated_price_text);

    new_tr.appendChild(new_td_date);
    new_tr.appendChild(new_td_user);
    new_tr.appendChild(new_td_description);
    new_tr.appendChild(new_td_material);
    new_tr.appendChild(new_td_weight);
    new_tr.appendChild(new_td_time);
    new_tr.appendChild(new_td_estimated_price);

    table_jobs.appendChild(new_tr);
}

function addSpoolToDOM(spool) {
    var new_option = document.createElement('option');
    new_option.setAttribute('value', spool.id);
    var new_option_text = document.createTextNode(spool.description); // + ' (' + spool.weight + 'g, ' + spool.price / 100 + '€)');
    new_option.appendChild(new_option_text);

    select_spool.appendChild(new_option);

    // TODO: ADD SPOOL IN UL LIST
}


if(select_user.value != 'new') {
    hide(new_user);
}
if(select_spool.value != 'new') {
    hide(new_spool);
}

select_user.addEventListener('change', function(e) {
    var select = this;

    if(select.value == 'new') {
        show(new_user);
    } else {
        hide(new_user);
    }
});
select_spool.addEventListener('change', function(e) {
    var select = this;

    if(select.value == 'new') {
        show(new_spool);
    } else {
        hide(new_spool);
    }
});


function checkDate() {
    var m = select_m.value;
    var d = select_d.value;
    var y = select_y.value;

    var date = new Date(y, m, d);
    if(y != date.getFullYear() || m != date.getMonth() || d != date.getDate()) {
        return false;
    }
    return true;
}

function select_date_change_listener(e) {
    if(!checkDate()) {
        addMessageNewJob('error', 'The date you selected does not exist.');
        e.preventDefault();
    }
}

select_y.addEventListener('change', select_date_change_listener);
select_m.addEventListener('change', select_date_change_listener);
select_d.addEventListener('change', select_date_change_listener);

form_add.addEventListener('submit', function(e) {
    e.preventDefault();

    var form = this;
    var user_id = select_user.value;
    var spool_id = select_spool.value;
    var spool_description = document.getElementById('spool_description').value;
    var spool_weight = document.getElementById('spool_weight').value;
    var spool_price = document.getElementById('spool_price').value;
    var first_name = document.getElementById('first_name').value;
    var last_name = document.getElementById('last_name').value;
    var m = select_m.value;
    var d = select_d.value;
    var y = select_y.value;
    var description = document.getElementById('description').value;
    var weight = document.getElementById('weight').value;
    var time_h = document.getElementById('time_h').value;
    var time_min = document.getElementById('time_min').value;

    if(!checkDate()) {
        addMessageNewJob('error', 'You must select a valid date before submitting the form.');
        return;
    }

    var params = 'm=' + encodeURIComponent(m) + '&d=' + d + '&y=' + y + '&description=' + encodeURIComponent(description) + '&weight=' + encodeURIComponent(weight) + '&time_h=' + encodeURIComponent(time_h) + '&time_min=' + encodeURIComponent(time_min);

    var new_user = false;
    var new_spool = false;

    if(select_user.value == 'new') { // We add first_name and last_name arguments
        params += '&first_name=' + encodeURIComponent(first_name) + '&last_name=' + encodeURIComponent(last_name);
        new_user = true;
    } else {
        params += '&user_id=' + encodeURIComponent(user_id);
    }

    if(select_spool.value == 'new') {
        params += '&spool_description=' + encodeURIComponent(spool_description) + '&spool_price=' + encodeURIComponent(spool_price) + '&spool_weight=' + encodeURIComponent(spool_weight);
        new_spool = true;
    } else {
        params += '&spool_id=' + encodeURIComponent(spool_id);
    }


    req.open('POST', '/add', true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    req.onreadystatechange = function() {
        if(req.readyState == 4) {
            if(req.status == 200) { // If OK, server returns a JSON object containing the new print job
                var response = JSON.parse(req.responseText);
                if(response.user) {
                    addUserToDOM(response.user);
                }
                if(response.spool) {
                    addSpoolToDOM(response.spool)
                }
                addJobToDOM(response.job);
                addMessageNewJob('success', 'The job has been successfully added');
            } else if(req.status == 400) { // There were errors
                var errors = JSON.parse(req.responseText).errors;
                for(var i = 0; i < errors.length; i++) {
                    addMessageNewJob('error', errors[i]);
                }
            } else {
                console.warn('POST /add : the server responded with an error ' + req.status);
            }
        }
    };

    req.send(params);
});
