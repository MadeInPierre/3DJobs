var div_add = document.getElementById('add');
var form_add = div_add.getElementsByTagName('form')[0];

var select_user = document.getElementById('user');
var select_spool = document.getElementById('spool');

var select_m = document.getElementById('date_m');
var select_d = document.getElementById('date_d');
var select_y = document.getElementById('date_y');

var spool_description_input = document.getElementById('spool_description');
var spool_weight_input = document.getElementById('spool_weight');
var spool_price_input = document.getElementById('spool_price');
var first_name_input = document.getElementById('first_name');
var last_name_input = document.getElementById('last_name');
var description_input = document.getElementById('description');
var weight_input = document.getElementById('weight');
var time_h_input = document.getElementById('time_h');
var time_min_input = document.getElementById('time_min');
var inputs = [select_user, select_spool, select_m, select_d, select_y, spool_description_input, spool_weight_input, spool_price_input, first_name_input, last_name_input, description_input, weight_input, time_h_input, time_min_input];

var new_user = document.getElementById('new_user');
var new_spool = document.getElementById('new_spool');

var messages_add_job = document.getElementById('messages_new');
var messages_spools = document.getElementById('messages_spools');
var messages_charts = document.getElementById('messages_charts');

var table_jobs = document.getElementById('jobs');
var ul_spools = document.getElementById('spools').getElementsByTagName('ul')[0];

const req = new XMLHttpRequest();

function show(element) {
    element.style.display = 'initial';
}
function hide(element) {
    element.style.display = 'none';
}
function remove(element) {
    while(element.lastChild) {
        element.removeChild(element.lastChild);
    }
    element.parentNode.removeChild(element);
}

function resetInput(element) {
    if(element.tagName == 'INPUT') {
        element.value = null;
    }
}
function selectValue(element, value) {
    for(var i = 0; i < element.options.length; i++) {
        if(element.options[i].value == value) {
            element.selectedIndex = i;
        }
    }
}

function addMessage(container, type, message, timeout=true) {
    var div_message = document.createElement('div');
    div_message.className = type;

    var p_message = document.createElement('p');
    var p_message_node = document.createTextNode(message);
    p_message.appendChild(p_message_node);

    div_message.appendChild(p_message);

    container.appendChild(div_message);

    if(timeout) {
        setTimeout(function() {
            remove(div_message);
        }, 4000);
    }
}
function addMessageNewJob(type, message, timeout=true) {
    addMessage(messages_add_job, type, message, timeout);
}
function addMessageSpools(type, message, timeout=true) {
    addMessage(messages_spools, type, message, timeout);
}
function addMessageCharts(type, message, timeout=true) {
    addMessage(messages_charts, type, message, timeout);
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
    // TODO: links EDIT & REMOVE

    var new_tr = document.createElement('tr');

    var new_td_id = document.createElement('td');
    var new_td_date = document.createElement('td');
    var new_td_user = document.createElement('td');
    var new_td_description = document.createElement('td');
    var new_td_material = document.createElement('td');
    var new_td_weight = document.createElement('td');
    var new_td_time = document.createElement('td');
    var new_td_estimated_price = document.createElement('td');

    var new_td_id_a_edit = document.createElement('a');
    new_td_id_a_edit.className = 'orange';
    new_td_id_a_edit.setAttribute('href', '/edit_job_' + job.id);
    var new_td_id_a_edit_text = document.createTextNode(job.id);
    new_td_id_a_edit.appendChild(new_td_id_a_edit_text);

    var new_td_id_br = document.createElement('br');
    var new_td_id_a_remove = document.createElement('a');
    new_td_id_a_remove.className = 'small red';
    new_td_id_a_remove.setAttribute('href', '/remove_job_' + job.id);
    var new_td_id_a_remove_text = document.createTextNode('Remove');
    new_td_id_a_remove.appendChild(new_td_id_a_remove_text);

    new_td_id.appendChild(new_td_id_a_edit);
    new_td_id.appendChild(new_td_id_br);
    new_td_id.appendChild(new_td_id_a_remove);

    var date_js = new Date(job.date);
    var new_td_date_text = document.createTextNode(date_js.toDateString());
    var new_td_description_text = document.createTextNode(job.description);
    var new_td_weight_text = document.createTextNode(job.weight + 'g');
    var new_td_time_text = document.createTextNode(job.time_h + 'h' + job.time_m + 'm');
    var new_td_estimated_price_text = document.createTextNode((job.estimated_price / 100).toFixed(2) + '€');

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

    new_tr.appendChild(new_td_id);
    new_tr.appendChild(new_td_date);
    new_tr.appendChild(new_td_user);
    new_tr.appendChild(new_td_description);
    new_tr.appendChild(new_td_material);
    new_tr.appendChild(new_td_weight);
    new_tr.appendChild(new_td_time);
    new_tr.appendChild(new_td_estimated_price);

    var first_tr = table_jobs.getElementsByTagName('tr')[1];
    first_tr.parentNode.insertBefore(new_tr, first_tr);

    remove(first_tr.parentNode.lastChild);

    if(chart) {
        addMessageCharts('warning', 'A job has just been added. You should generate a new chart.', false);
    }
}

function addSpoolToDOM(spool) {
    var new_option = document.createElement('option');
    new_option.setAttribute('value', spool.id);
    var new_option_text = document.createTextNode(spool.description); // + ' (' + spool.weight + 'g, ' + spool.price / 100 + '€)');
    new_option.appendChild(new_option_text);

    select_spool.appendChild(new_option);

    var new_li = document.createElement('li');
    new_li.setAttribute('data-spool_id', spool.id);
    var new_li_text = document.createTextNode(spool.description + ' (' + spool.weight + 'g, ' + spool.price / 100 + '€) ');
    new_li.appendChild(new_li_text);

    var new_a = document.createElement('a');
    new_a.setAttribute('href', '');
    var new_a_text = document.createTextNode('Mark as finished');
    new_a.appendChild(new_a_text);
    new_li.appendChild(new_a);

    new_a.addEventListener('click', a_mark_spool_as_finished_click_listener);
}

function removeSpoolFromDOM(spool_id) {
    // Remove from select
    for(var i = 0; i < select_spool.options.length; i++) {
        if(select_spool.options[i].value == spool_id) {
            select_spool.removeChild(select_spool.options[i]);
        }
    }

    // Remove from current spools UL
    for(var i = 0; i < ul_spools.getElementsByTagName('li').length; i++) {
        if(ul_spools.getElementsByTagName('li')[i].getAttribute('data-spool_id') == spool_id) {
            remove(ul_spools.getElementsByTagName('li')[i]);
        }
    }

    displaySelectOrNew(select_spool, new_spool);
}

function displaySelectOrNew(select, element) {
    if(select.value == 'new') {
        show(element);
    } else {
        hide(element);
    }
}

displaySelectOrNew(select_user, new_user);
displaySelectOrNew(select_spool, new_spool);

select_user.addEventListener('change', function(e) {
    displaySelectOrNew(this, new_user);
});
select_spool.addEventListener('change', function(e) {
    displaySelectOrNew(this, new_spool);
});

/*
function fullDivAdd() {
    clearTimeout(div_add_timeout);
    div_add.style.maxHeight = 'initial';
    div_add.style.overflow = 'initial';
}
function miniDivAdd() {
    div_add.style.maxHeight = '10vh';
    div_add.style.overflow = 'hidden';
}

var div_add_timeout;
var mouse_focus = false;
var form_focus = false;

div_add.addEventListener('mouseover', function(e) {
    fullDivAdd();
    mouse_focus = true;
});
div_add.addEventListener('mouseout', function(e) {
    mouse_focus = false;
    if(!form_focus) {
        div_add_timeout = setTimeout(miniDivAdd, 700);
    }
});

function addInputListeners(input) {
    input.addEventListener('focus', function(e) {
        form_focus = true;
        fullDivAdd();
    });
    input.addEventListener('blur', function(e) {
        form_focus = false;
        if(!mouse_focus) {
            div_add_timeout = setTimeout(miniDivAdd, 700);
        }
    });
}

for(var i = 0; i < inputs.length; i++) {
    addInputListeners(inputs[i]);
}
addInputListeners(form_add.getElementsByTagName('button')[0]);
setTimeout(miniDivAdd, 1000);
*/

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


function a_mark_spool_as_finished_click_listener(e) {
    e.preventDefault();

    var spool_id = this.parentNode.getAttribute('data-spool_id');
    var params = 'spool_id=' + spool_id;

    req.open('POST', '/mark_spool_as_finished', true);
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    req.onreadystatechange = function() {
        if(req.readyState == 4) {
            if(req.status == 200) { // If OK, server returns nothing with a code 200
                removeSpoolFromDOM(spool_id);
                addMessageSpools('success', 'The spool has been marked as finished.');
            } else if(req.status == 404) { // Spool not found
                addMessageSpools('error', 'There is no spool with ID #' + spool_id + '.')
            } else {
                console.warn('POST /add : the server responded with an error ' + req.status);
            }
        }
    };

    req.send(params);
}
for(var i = 0; i < ul_spools.getElementsByTagName('a').length; i++) {
    var a = ul_spools.getElementsByTagName('a')[i];
    if(a.getAttribute('href') == '') { // Other links are "edit"
        a.addEventListener('click', a_mark_spool_as_finished_click_listener);
    }
}



form_add.addEventListener('submit', function(e) {
    e.preventDefault();

    var form = this;
    var user_id = select_user.value;
    var spool_id = select_spool.value;

    var spool_description = spool_description_input.value;
    var spool_weight = spool_weight_input.value;
    var spool_price = spool_price_input.value;
    var first_name = first_name_input.value;
    var last_name = last_name_input.value;

    var m = select_m.value;
    var d = select_d.value;
    var y = select_y.value;

    var description = description_input.value;
    var weight = weight_input.value;
    var time_h = time_h_input.value;
    var time_min = time_min_input.value;

    if(!checkDate()) {
        addMessageNewJob('error', 'You must select a valid date before submitting the form.');
        return;
    }

    var params = 'm=' + encodeURIComponent(m) + '&d=' + d + '&y=' + y + '&description=' + encodeURIComponent(description) + '&weight=' + encodeURIComponent(weight) + '&time_h=' + encodeURIComponent(time_h) + '&time_min=' + encodeURIComponent(time_min);

    if(select_user.value == 'new') { // We add first_name and last_name arguments
        params += '&first_name=' + encodeURIComponent(first_name) + '&last_name=' + encodeURIComponent(last_name);
    } else {
        params += '&user_id=' + encodeURIComponent(user_id);
    }

    if(select_spool.value == 'new') {
        params += '&spool_description=' + encodeURIComponent(spool_description) + '&spool_price=' + encodeURIComponent(spool_price) + '&spool_weight=' + encodeURIComponent(spool_weight);
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

                for(var i = 0; i < inputs.length; i++) {
                    resetInput(inputs[i]);
                }
                selectValue(select_user, response.job.user_id);
                selectValue(select_spool, response.job.spool_id);
                displaySelectOrNew(select_user, new_user);
                displaySelectOrNew(select_spool, new_spool);

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
