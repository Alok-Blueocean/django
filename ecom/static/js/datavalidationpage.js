$(document).ready(function(){
    $("#run_models").click(function(){
        extractVal = false;
        $("#test_validate_error").text("");
        $("#model_tfidf_error").hide().text("");
        var modelNameSelected = $("#select-model option:selected").text().trim();
        var tfidfSelected = $("#select-tfidf option:selected").text().trim();
        if($('#data_extr_decider').prop('checked') == false){
            if($("#X-Test-Preview tbody tr").length == 0 || $("#Y-Test-Preview tbody tr").length == 0){
                $("#test_validate_error").text("Please select X-Test and Y-Test data");
                return false;
            }
        }
        if(checkValueNullOrEmpty(modelNameSelected) && checkValueNullOrEmpty(tfidfSelected) && modelNameSelected != "Select Model" && tfidfSelected != "Select TFIDF"){
            //run model
            var csrftoken = $.cookie('csrftoken');
            $("#model_tfidf_error").text("");
            $("#model_tfidf_error").hide()
            xRequest = $.ajax({
                 type:"POST",
                 url:"/runvalidationmodels/?userdirname=" + $("#select-user-directory option:selected").text().trim(),
                 CSRFToken: csrftoken,
                 timeout: 3600000,
                 data: {
                        'modelname': $("#select-model option:selected").text().trim(),
                        'tfidf': $("#select-tfidf option:selected").text().trim(),
                        'dataselection': $('#data_extr_decider').prop('checked')
                 },
                 headers: {'X-CSRFToken': csrftoken},
                 success: function(data){
                    if(data.status === '200'){
                        //show reports
                        $("#f1_score_val").text(data.f1score)
                        $("#acc_matrix_val").text(data.accuracymatrix)
                        $("#accuracy-matrix-modal .modal-title").text("CLASSIFICATION REPORT")
                        $("#accuracy-matrix-modal .modal-body").text(data.classireport)
                        $("#confusion-matrix-modal .modal-title").text("CONFUSION MATRIX")
                        $("#confusion-matrix-modal .modal-body").text(data.confmatrix)
                        $("#section_matrices_details").show()
                    }else{
                        $("#model_tfidf_error").text(data.message);
                        $("#model_tfidf_error").show()
                    }
                 },
                 error: function(err){
                    $("#model_tfidf_error").text("Error in data validation, please check your inputs");
                    $("#model_tfidf_error").show()
                 }
            });
        }else{
            $("#model_tfidf_error").text("Please select Model and TFIDF");
            $("#model_tfidf_error").show();
        }
    });

    $("#data_extr_decider").on('change', function(){
        if($(this).prop('checked')){
            $("#test-section").hide(200);
            $(this).parent().css('padding-top','41px')
        }else{
            $("#test-section").show(200);
            $(this).parent().css('padding-top','0px')
        }
    });

    $("#select-user-directory").on('change',function(){
        $.cookie('userdir', $("#select-user-directory option:selected").text().trim());
        fillModelsAndTfids();
    });
    $('#user_dir_add').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });
    $('#user_dir_add').bind("enterKey",function(e){
        var dirName = $(this).val()
        var csrftoken = $.cookie('csrftoken');
        if(checkValueNullOrEmpty(dirName)){
             xRequest = $.ajax({
                 type:"POST",
                 url:"/adduserdir/?userdirname=" + dirName,
                 CSRFToken: csrftoken,
                 headers: {'X-CSRFToken': csrftoken},
                 success: function(data){
                    if(data.status === '200'){
                        $('#user_dir_add_cont').block({
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
                        $("#user_dir_add").val('')
                        $("#user_dir_add_cont").hide()
                        $.cookie('userdir', dirName);
                        $('#select-user-directory').append($('<option>', {
                            value: dirName,
                            text: dirName
                        }));
                        $("#user_dir_selection select").val($.cookie('userdir'))
                        fillModelsAndTfids()
                    }else{
                         $("#add_dir_error").text(data.message)
                         $("#add_dir_error").show()
                    }
                 },
                 error: function(err){
                    $("#add_dir_error").text("Unable to process your request. Please try again later.!")
                    $("#add_dir_error").show()
                 }
            });
        }else{
            $("#add_dir_error").text("Please fill the directory name")
            $("#add_dir_error").show()
        }

    });
    $("#user_dir_add_btn").click(function(){
        $("#user_dir_add").trigger("enterKey");
    });
    if(checkValueNullOrEmpty($.cookie('userdir'))){
        $("#user_dir_selection select").val($.cookie('userdir'))
        fillModelsAndTfids()
    }
});
function fillModelsAndTfids(){
    selectedUser = $("#select-user-directory option:selected").text().trim()
    var csrftoken = $.cookie('csrftoken');
    $('#select-model').empty()
    $('#select-tfidf').empty()
    $("#add_dir_error").hide()
    if(selectedUser == "Add New Directory"){
        $("#user_dir_add_cont").show(200)
        $(".validation-specs-cont").hide(200);
    }else{
       $("#user_dir_add_cont").hide(200)
       xRequest = $.ajax({
             type:"POST",
             url:"/getvalidationspecs/?userdirname=" + selectedUser,
             CSRFToken: csrftoken,
             timeout: 3600000,
             headers: {'X-CSRFToken': csrftoken},
             success: function(data){
                if(data.status === '200'){
                        $('#select-model').append($('<option>', {
                            value: "Select Model",
                            text : "Select Model"
                        }));
                      $.each(data.models, function(index,value){
                        $('#select-model').append($('<option>', {
                            value: value,
                            text : value
                        }));
                      });
                        $('#select-tfidf').append($('<option>', {
                            value: "Select TFIDF",
                            text : "Select TFIDF"
                        }));
                      $.each(data.tfidf, function(index,value){
                        $('#select-tfidf').append($('<option>', {
                            value: value,
                            text : value
                        }));
                      });
                      $(".validation-specs-cont").show(200);
                }else{
                    $("#add_dir_error").text(data.message)
                    $("#add_dir_error").show()
                }
             },
             error: function(err){
                $("#add_dir_error").text("Unable to process your request now.")
                $("#add_dir_error").show()
             }
        });
    }
}
//Extract Tables for connection URL
function extractTable(headerVal){
    $("#test_validate_error").text("");
    var dbType = $("#"+headerVal+"-db_type").val();
    var dbUrl = $("#"+headerVal+"-db_url").val();
    var dbName = $("#"+headerVal+"-db_name").val();
    var dbUser = $("#"+headerVal+"-db_username").val();
    var dbPassword = $("#"+headerVal+"-db_password").val();
    if(checkValueNullOrEmpty(dbUrl && dbName && dbUser && dbPassword)){
        var csrftoken = $.cookie('csrftoken');
            $("#"+headerVal+"-db_conn_error").text("");
            xRequest = $.ajax({
                 type:"POST",
                 url:"/gettables/",
                 CSRFToken: csrftoken,
                 data: {
                        'dbtype': dbType,
                        'dburl': dbUrl,
                        'dbname': dbName,
                        'dbusername': dbUser,
                        'dbpassword': dbPassword
                 },
                 headers: {'X-CSRFToken': csrftoken},
                 timeout: 3600000,
                 success: function(data){
                    if(data.status == 200){
                        $("#"+headerVal+"-db_tables").empty();
                        $('#'+headerVal+'-db_tables').append($('<option>', {
                            value: '0',
                            text: 'Table'
                        }));
                        var group = $.parseJSON(data.tablesindb);
                        var allPropertyNames = Object.keys(group);
                        for (var j=0; j<allPropertyNames.length; j++) {
                            var name = allPropertyNames[j];
                            var value = group[name];
                            var innerValue = Object.keys(value);
                            for(var i=0;i<innerValue.length;i++){
                                var field = innerValue[i];
                                var tablename = value[field];
                                if($("#"+headerVal+"-db_type option:selected").text().toLowerCase() == 'mysql'){
                                    $("#"+headerVal+"-db_tables").append($('<option>', {
                                        value: tablename,
                                        text : tablename
                                    }));
                                }else if($("#"+headerVal+"-db_type option:selected").text().toLowerCase() == 'mssql'){
                                    if(field.toLowerCase() == 'table_name'){
                                        $('#'+headerVal+'-db_tables').append($('<option>', {
                                            value: tablename,
                                            text : tablename
                                        }));
                                    }
                                }else{
                                }
                            }
                        }
                        $("#"+headerVal+"-from-db-extraction").addClass("hide");
                        $("#"+headerVal+"-right-arrow").removeClass("hide");
                        $("#"+headerVal+"-columns_chooser").removeClass("hide");
                    }else{
                        $("#"+headerVal+"-db_conn_error").text("Error in DB Connection");
                    }
                 },
                 error: function(err){
                    $("#"+headerVal+"-db_conn_error").text("Error in DB Connection. please check your inputs")
                 }
            });
    }else{
        $("#"+headerVal+"-from-db-extraction input[type='text'], #"+headerVal+"-from-db-extraction input[type='password']").each(function(){
            if(!checkValueNullOrEmpty($(this).val())){
                $(this).siblings('.error-info').show();
                $(this).addClass('error-border');
            }else{
                $(this).siblings('.error-info').hide();
                $(this).removeClass('error-border');
            }
        });
    }
}
//Extract cleaned data from database
function extractData(headerVal){
    $("#test_validate_error").text("");
    $("[id$='Extraction_error'").hide();
    var csrftoken = $.cookie('csrftoken');
    $("#"+headerVal+"-Extraction_error").hide()
    if(checkValueNullOrEmpty(selectedValues)){
        var minValue = $("#"+headerVal+"-from_record").val();
        var maxValue = $("#"+headerVal+"-to_record").val();
        if(checkValueNullOrEmpty(minValue && maxValue)){
            if(parseInt(maxValue) > parseInt(tableRecords)){
                $("#"+headerVal+"-Extraction_error").text("Maximum count should be less than "+ tableRecords).show();
                return false;
            }
        }else{
            minValue = 0;
            maxValue = tableRecords;
        }
        extractDbVal(minValue, maxValue, headerVal)
    }else{
        $("#"+headerVal+"-Extraction_error").text("Please select at least one column with table");
        $("#"+headerVal+"-Extraction_error").show();
    }
}
//extrtact and clean xtest ytest data
function extractDbVal(fromVal, toVal,headerVal){
    var csrftoken = $.cookie('csrftoken');
    xRequest = $.ajax({
        type:"POST",
        url:"/extractdata/?datatovalidate="+ (headerVal == 'X-Test' ? "xdata" : "ydata"),
        CSRFToken: csrftoken,
        timeout: 3600000,
        data: {
            'dbtype': $("#"+headerVal+"-db_type option:selected").text(),
            'dburl': $("#"+headerVal+"-db_url").val(),
            'dbname': $("#"+headerVal+"-db_name").val(),
            'dbusername': $("#"+headerVal+"-db_username").val(),
            'dbpassword': $("#"+headerVal+"-db_password").val(),
            'tablename':$("#"+headerVal+"-db_tables option:selected").text(),
            'columns':selectedValues,
            'conditions':$("#"+headerVal+"-where_cond").val(),
            'recordfrom': fromVal,
            'recordto': toVal
        },
        headers: {'X-CSRFToken': csrftoken},
        success: function(data){
            $("#"+headerVal+"-Test-Preview tbody").html('');
            extractVal = true;
            $.blockUI({
                message : '<div id="thread-ui" style="cursor:pointer"> <h3>Please wait...<button class="btn app-btn pull-right" onclick="cancelRecursive()">Abort</button> </h3></div>'
            });
            setTimeout(function(){
                recursiveFilecheckAjax();
            },2000);
            $("#"+headerVal+"-file-preview").addClass('hide');
            $("#"+headerVal+"-db-preview").removeClass('hide');
         },
        error: function(err){
            $("#"+headerVal+"-Extraction_error").text("Error in Data extraction, please check your inputs");
            $("#"+headerVal+"-Extraction_error").show();
            extractVal = false;
        }
    });
}

//Toggle content in checkbox
function toggleDbContent(headerVal){
    $("#test_validate_error").text("");
    $("#"+headerVal+"-from-db-extraction").toggleClass('hide');
    $("#"+headerVal+"-columns_chooser").toggleClass('hide');
}
//Append Test data to modal
function previewDataAppend(appendData){
    var tableData = "";
    for (key in appendData){
        tableData = appendString(tableData, "<tr><td>"+appendData[key]+"</td></tr>");
        extractJsonData.push(tableData);
        tableData = "";
    }
}