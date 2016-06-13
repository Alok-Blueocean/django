var csrftoken = $.cookie('csrftoken');
var runSample = false;
$(document).ready(function(){
    $("#tfidf_add, #classifier_add").bind("enterKey", function(event){
        var paramVal = $(this).data("garbage-type");
         if($(this).val() != "" && $(this).val() != undefined && $(this).val() != null){
            $("#"+paramVal+"-list").append("<li class='garbage-words "+paramVal+"-words'> <span class='tag label label-info words-label'><span><span class='param-word editableparam'>"+$(this).val()+"</span><a onclick='removeParameter(this)'><i class='remove glyphicon glyphicon-remove-sign glyphicon-white remove-garbage-words'/></a></span></span></li>");
            writeTfidfParam(paramVal);
            $(this).val("");
            editAllParams();
         }else{
            $("."+paramVal+"_error").text("Please fill "+paramVal+" value").fadeIn('2000');
            setTimeout(function(){
                $("."+paramVal+"_error").fadeOut('slow');
            },3000);
         }
    });
    $("#tfidf_add_btn, #classifier_add_btn").on("click", function(){
        $(this).parent().parent().find('[class$="-add"]').trigger('enterKey')
    });
    $('#tfidf_add, #classifier_add, #user_dir_add_save').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });
    $("#create-TFIDF").on("click", function(){
        $(".tfidf_error").text("");
        var userDirToSave = $("#select-user-directory-save option:selected").text().trim()
        if(checkValueNullOrEmpty(userDirToSave) && userDirToSave != "Select Your Directory" && userDirToSave != "Add New Directory"){
            $("#dir_selection_error").hide(200)
            xRequest = $.ajax({
                type:"POST",
                url:"/createtfidf/?userdirname=" + $("#select-user-directory-save option:selected").text().trim(),
                contentType: 'application/json; charset=utf-8',
                CSRFToken: csrftoken,
                timeout: 3600000,
                headers: {'X-CSRFToken': csrftoken},
                success: function(data){
                    if(data.status == 200){
                        $('#tfidf_classi_sections').block({
                           message: $('div.growlUI'),fadeIn: 700,fadeOut: 700,timeout: 2000,showOverlay: false,centerY: false,
                            css: {
                                width: '350px',
                                border: 'none',
                                padding: '5px',
                                backgroundColor: '#000',
                                '-webkit-border-radius': '10px',
                                '-moz-border-radius': '10px',
                                color: '#fff'
                            }
                        });
                        $("#choose-classifier").removeClass("hide");
                    }else{
                        $(".tfidf_error").text(data.message);
                    }
                },
                error: function(err){
                    $(".tfidf_error").text("Error in creating TFIDF parameters");
                }
            });
        }else{
            $("#dir_selection_error").show(200)
            $('html, body').animate({
                scrollTop: $("#dir_selection_error").offset().top
            }, 500);
        }

    });
    $("#choose-classifier").on("click", function(){
        $(".create_classifier_error").text("");
        var methodVal = $(".classifier-group").find('li a.btn-success').data('method')
        var classiName = $(".classifier-group").find('li a.btn-success').parent().text().trim()
        var userDirToSave = $("#select-user-directory-save option:selected").text().trim()
        if(checkValueNullOrEmpty(userDirToSave) && userDirToSave != "Select Your Directory" && userDirToSave != "Add New Directory"){
            $("#dir_selection_error").hide(200)
            xRequest = $.ajax({
                type:"POST",
                url:"/createclassifier/?userdirname=" + $("#select-user-directory-save option:selected").text().trim() + "&classiname=" + classiName ,
                contentType: 'application/json; charset=utf-8',
                CSRFToken: csrftoken,
                timeout: 3600000,
                headers: {'X-CSRFToken': csrftoken},
                data: methodVal,
                success: function(data){
                    if(data.status == 200){
                        runSample = true;
                        $("#section_matrix").is(':visible') ? changeAccuracy($("#accuracy-group li a.btn-success")) : 0;
                        $('#tfidf_classi_sections').block({
                           message: $('div.growlUI'),
                            fadeIn: 700,fadeOut: 700,timeout: 2000,showOverlay: false,centerY: false,
                            css: {
                                width: '350px',
                                border: 'none',
                                padding: '5px',
                                backgroundColor: '#000',
                                '-webkit-border-radius': '10px',
                                '-moz-border-radius': '10px',
                                color: '#fff'
                            }
                        });
                    }else{
                        $(".create_classifier_error").text(data.message);
                    }
                },
                error: function(err){
                    $(".create_classifier_error").text("Error in creating Classifier parameters");
                }
            });
        }else{
            $("#dir_selection_error").show(200)
            $('html, body').animate({
                scrollTop: $("#dir_selection_error").offset().top
            }, 500);
        }
    });

    $("#select-user-directory-save").on('change', function(){
        var selectedDir = $("#select-user-directory-save option:selected").text().trim()
        if(selectedDir == "Add New Directory"){
            $("#add-dir-cont-save").show(200);
            $("#dir_selection_error").hide(200);
        }else{
            $.cookie('userdir', selectedDir);
            $("#add-dir-cont-save").hide(200);
            $("#dir_selection_error").hide(200);
            $("#user_dir_select_save select").val($.cookie('userdir'));
        }
    });

    $('#user_dir_add_save').bind("enterKey",function(e){
        var dirName = $(this).val();
        var csrftoken = $.cookie('csrftoken');
        if(checkValueNullOrEmpty(dirName)){
            $("#add_dir_save_error").hide();
             xRequest = $.ajax({
                 type:"POST",
                 url:"/adduserdir/?userdirname=" + dirName,
                 CSRFToken: csrftoken,
                 headers: {'X-CSRFToken': csrftoken},
                 success: function(data){
                    if(data.status === '200'){
                        $('#tfidf_classi_sections').block({
                           message: $('div.growlUI'),
                            fadeIn: 700,fadeOut: 700,timeout: 2000,showOverlay: false,centerY: false,
                            css: {
                                width: '350px',
                                border: 'none',
                                padding: '5px',
                                backgroundColor: '#000',
                                '-webkit-border-radius': '10px',
                                '-moz-border-radius': '10px',
                                color: '#fff'
                            }
                        });
                        $("#user_dir_add_save").val('');
                        $("#add-dir-cont-save").hide();
                        $.cookie('userdir', dirName);
                        $('#select-user-directory-save').append($('<option>', {
                            value: dirName,
                            text: dirName
                        }));
                        $("#user_dir_select_save select").val($.cookie('userdir'));
                        $("#choose-classifier").addClass("hide");
                    }else{
                        $("#add_dir_save_error").text(data.message);
                        $("#add_dir_save_error").show();
                    }
                 },
                 error: function(err){
                    $("#add_dir_save_error").text("Please fill the directory name");
                    $("#add_dir_save_error").show();
                 }
            });
        }else{
            $("#add_dir_save_error").text("Please fill the directory name");
            $("#add_dir_save_error").show();
        }

    });
    $("#user_dir_add_btn_save").click(function(){
        $("#user_dir_add_save").trigger("enterKey");
    });
    if(checkValueNullOrEmpty($.cookie('userdir'))){
        $("#user_dir_select_save select").val($.cookie('userdir'));
    }
    //calling editable params function
    editAllParams();
    $("#next_validation_btn").on('click', function(){
        (runSample === false)?
            bootbox.dialog({
                message : "Do you want to proceed without running "+$("#classifier-group li a.btn-success").next().text() ,
                buttons: {
                    run: {
                        label: "Run",
                        className: "btn-success",
                        callback: function() {
                            $("#choose-classifier").click();
                        }
                    },
                    proceed: {
                        label: "Proceed",
                        className: "btn-default",
                        callback: function() {
                            window.location.replace("/validation/");
                        }
                    }
                }
            }) : window.location.replace("/validation/");
    });

    $("#tfidf_remove_btn").on('click', function(){
        $("#tfidf_add").val('');
    });
    $("#classifier_remove_btn").on('click', function(){
        $("#classifier_add").val('')
    });

});
//Remove parameter in the list
function removeParameter(thisElement){
    var paramVal = $(thisElement).parents('ul').attr('id').split('-')[0];
    bootbox.confirm("Are you sure want to remove "+ $(thisElement).parents('li').text().trim(), function(result) {
        if(result){
            $(thisElement).parents('li').remove();
            writeTfidfParam(paramVal);
        }else{
        }
    });
}
//Radio button in classifier
function selectTraining(thisElement){
    var thisElement = $(thisElement);
    (!thisElement.hasClass("btn-success")) ?
        (toggleRadioButton(thisElement), (thisElement.parent().parent().attr('id') == 'classifier-group') ?
            changeClassifer(thisElement) : changeAccuracy(thisElement)) : false;
}
//toggling radio button
function toggleRadioButton(thisElement){
    thisElement.parent().parent().find("a.btn-success").removeClass("btn-success").addClass("btn-default");
    thisElement.removeClass("btn-default").addClass("btn-success");
}
//Change param display for classifier
function changeClassifer(thisElement){
    xRequest = $.ajax({
         type:"POST",
         url:"/retriveparam/",
         contentType: 'application/json; charset=utf-8',
         CSRFToken: csrftoken,
         data: thisElement.data("method"),
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
                if(data.paramlist.length > 0){
                    $(".create_classifier_error").text("");
                    $("#classifier-list").empty();
                    for(key in data.paramlist){
                        $("#classifier-list").append("<li class='garbage-words classifier-words'> <span class='tag label label-info words-label'><span><span class='editableparam param-word'>"+data.paramlist[key].word+"</span><a onclick='removeParameter(this)'><i class='remove glyphicon glyphicon-remove-sign glyphicon-white remove-garbage-words'/></a></span></span></li>");
                    }
                    editAllParams();
                }else{
                    $("#classifier-list").empty();
                }
                runSample = false;
            }else{
                $(".create_classifier_error").text("Error in choosing classifers");
            }
         },
         error: function(err){
         }
    });
}
//calculating accuracy
function changeAccuracy(thisElement){
    xRequest = $.ajax({
         type:"POST",
         url:"/calculateaccuracy/",
         contentType: 'application/json; charset=utf-8',
         CSRFToken: csrftoken,
         timeout: 3600000,
         data: thisElement.data("key"),
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
                bindAccuracyVal(data.message, data.accuracyData);
            }else{
                bootbox.alert("Error: "+ data.message.toString());
            }
         },
         error: function(err){
            bootbox.alert("Error in calculating accuracy score. Please try with diffrent dataset");
         }
    });
}
//binding accuracy
function bindAccuracyVal(keyVal, dataVal){
    $("#section_matrix").removeClass('hide');
    var matrixName = $("#accuracy-group .choose-block a[data-key='"+keyVal+"']").next().text()
    $('#accuracy-head').text(matrixName);
    if(keyVal == 'Class_rep' || keyVal == 'conf_matrix' ){
        $("#accuracy-modal .modal-body").html(dataVal);
        $('#accuracy-response').html("<a href='#accuracy-modal' data-toggle='modal'> View </a> | <a href='/static/download/"+keyVal+".txt' download='"+keyVal+".txt'> Download </a>");
        $("#accuracy-modal .modal-title").text(matrixName);

    }else{
        $('#accuracy-response').html(dataVal);
    }
}
//Add TFIDF parameter
function writeTfidfParam(paramVal){
    var listclassname = paramVal;
    var methodVal = $(".classifier-group").find('li a.btn-success').data('method');
    var garbage_dict = {};
    var garbage_dict_list = [];
    $("#"+paramVal+"-list span.words-label").each(function(){
        garbage_dict['word'] = $(this).find('span.param-word').text();
        garbage_dict_list.push(garbage_dict);
        garbage_dict = {};
    });
    xRequest = $.ajax({
         type:"POST",
         url:"/"+paramVal+"param/?filename=Param_"+methodVal,
         contentType: 'application/json; charset=utf-8',
         CSRFToken: csrftoken,
         data: JSON.stringify(garbage_dict_list),
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
            }else{
                $("."+paramVal+"_error").text("Error in adding TFIDF parameters");
            }
         },
         error: function(err){
         }
    });
}
//Edidting parameter
function editAllParams(){
    $('.editableparam').editable(editableOptions).on('save',function(e,params){
        $(this).data('editable').$element.text(params.newValue);
        writeTfidfParam($(this).parents('ul').attr('id').split("-")[0]);
    });
}
