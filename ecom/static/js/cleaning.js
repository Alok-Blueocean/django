$(document).ready(function(){
    //toggling cleaning pannels
    $('.clean-item-toggle').on('change', function(event ) {
        if($(this).prop('checked')){
            if(!($(this).parent().parent().hasClass("action-selected"))){
                load_garbage_words(this.getAttribute("data-garbage-type"))
                $(".clean-item-display").hide(200)
                $(".clean-item-title-cont").removeClass('action-selected')
                $(this).parent().parent().addClass('action-selected')
                $(this).parent().parent().siblings('.clean-item-display').show(200)
                //add_click_event_to_enabled_titles();
            }
        }else{
            $(this).parent().parent().removeClass('action-selected')
            $(this).parent().parent().siblings('.clean-item-display').hide(200)
        }
        if($("#clean_data").attr('data-cleaninfo') == "0"){
            enableNextbutton();
        }
    });
    //toggling clean pannel
    $('.clean-item-title-cont').on('click',function(){
        if($(this).find('.clean-item-toggle').prop('checked')){
            if($(this).hasClass("action-selected")){
                $(this).removeClass('action-selected');
                $(this).parent().find('.clean-item-display').hide(200);
            }else{
                load_garbage_words($(this).find('.clean-item-toggle').data("garbage-type"))
                $(".clean-item-display").hide(200);
                $(".clean-item-title-cont").removeClass('action-selected');
                $(this).addClass('action-selected');
                $(this).parent().find('.clean-item-display').show(200);
            }
        }
    });
    //Cleaning parameter operations
    $('#stop_word_add, #junk_words_add').bind("enterKey",function(e){
        var errorField = $(this).parent().parent().find('[id$="_error"]');
        errorField.text('').text('').fadeOut('slow');
        if($(this).val() != "" && $(this).val() !== undefined && $(this).val() != null){
            $(this).parent().parent().siblings('ul.garbage-list').append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage">'+$(this).val()+'</span><a><i data-garbage-type="'+this.getAttribute("data-garbage-type")+'" class="remove glyphicon glyphicon-remove-sign glyphicon-white remove-garbage-words"></i></a></span></li>');
            modify_stop_words_in_file(this.getAttribute("data-garbage-type"));
            $(this).val('');
        }
        else{
            errorField.text('Please Fill '+this.getAttribute("data-garbage-type")).fadeIn("2000");
            errorField.fadeIn("1000");
            setTimeout(function(){
                errorField.fadeOut('slow');
            },3000)
         }
    });
     $(document).on('click', '.remove-garbage-words', function(){
        $(this).parent().parent().parent().remove()
        modify_stop_words_in_file(this.getAttribute("data-garbage-type"))
    });
    $("#regex_add, #regex_add1").bind("enterKey", function(){
        var regex1 = $("#regex_add").val();
        var regex2 = $("#regex_add1").val();
        var errorField = $(this).parent().parent().find('[id$="_error"]');
        if(regex1 != "" && regex1 != undefined && regex1 != null){
            $(this).parent().parent().siblings('ul.garbage-list').append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage"><span>'+regex1+'</span> | <span> '+regex2+'</span></span> <a><i id="prsistRegx" class="remove glyphicon glyphicon-remove-sign glyphicon-white"></i></a> </span></li>');
            writeRegx();
            $("#regex_add").val('');
            $("#regex_add1").val('');
        }
        else{
            errorField.text('Please Fill '+$("#regex_add").data("garbage-type")).fadeIn("2000");
            setTimeout(function(){
                errorField.fadeOut('slow');
            },3000)
         }
    })
    $("#regex_btn").on("click", function(){
        $("#regex_add").trigger("enterKey");
    });
     $(document).on('click', '#prsistRegx', function(){
        $(this).parent().parent().parent().remove()
        writeRegx();
    });
    $(".editable-cancel").click(function(){
        $(this).parent().parent().find('input').val('');
    });
    $("#stop_word_add_btn").click(function(){
        //alert("what is this---" + $(this).attr('id'));
        $("#stop_word_add").trigger("enterKey");
    });
    $("#urls_add_btn").click(function(){
        $("#urls_add").trigger("enterKey")
    });
    $("#special_chars_add_btn").click(function(){
        $("#special_chars_add").trigger("enterKey");
    });
    $("#numbers_add_btn").click(function(){
        $("#numbers_add").trigger("enterKey")
    });
    $("#junk_words_add_btn").click(function(){
        $("#junk_words_add").trigger("enterKey")
    });
    $("#regex_btn").click(function(){
        $("#regex_add").trigger("enterKey")
    });
    $('.garbages-add').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });
    //clean data opetaion initiation
    $("#clean_data").on("click",function(){
        var csrftoken = $.cookie('csrftoken');
        $("#cleaning_error_info").text("");
        $("#sampled_data_preview tr").empty();
        xRequest = $.ajax({
             type:"POST",
             url:"/cleandata/",
             CSRFToken: csrftoken,
             data: {
                "lemm": $("#lemmatization_toggle").prop('checked'),
                "stopwords": $("#stop_words_toggle").prop('checked'),
                "junkwords": $("#junk_words_toggle").prop('checked'),
                "regex": $("#regex_toggle").prop('checked')
             },
             headers: {'X-CSRFToken': csrftoken},
             timeout: 3600000,
             success: function(data){
                    if(data.status == 200){
                        //show_train_test_preview(data)
                        $("#clean_data").attr('data-cleaninfo', '1');
                        $("#next_training_btn").removeClass('disabled');
                        extractVal = true;
                        $.blockUI({
                            message : '<div id="thread-ui" style="cursor:pointer"> <h3>Cleaning in progress...<button class="btn app-btn pull-right" onclick="cancelRecursive()">Abort</button> </h3></div>'
                        });
                        setTimeout(function(){
                            recursiveFilecheckAjax();
                        },2000);
                    }else{
                        $("#cleaning_error_info").text("Error in cleaning.Invalid request..!");
                    }
             },
             error: function(err){
                $("#cleaning_error_info").text("Error in cleaning..Please try again later.!");
             }
        });
    });
    //Initial preview of sampling data
    if(window.location.href.indexOf('cleaning') != -1){
        load_train_test_data_preview()
    }
    $("#stop-file, #regx-file, #junk-file").fileinput({
        uploadUrl: "/extractcleanwords/",
        uploadAsync: true,
        //showPreview: false,
        dropZoneEnabled: false,
        allowedFileExtensions: ['xlsx', 'xls'],
        ajaxSettings: {CSRFToken: $.cookie('csrftoken'), headers: {'X-CSRFToken': $.cookie('csrftoken')}},
        uploadExtraData: { fname: "", listname: ""}
    });
    $("#stop-file, #regx-file, #junk-file").on('filebatchpreupload',function(event, data, previewId, index){
        data.extra.fname  =  $(this).data("file-name");
        data.extra.listname = data.extra.fname === "regular-expression" ? "regex-list" : data.extra.fname+"-list";
    });
    $('#stop-file,#regx-file, #junk-file').on('fileuploaded', function(event, data, previewId, index) {
        var listclassname = data.extra.listname;
        $("ul." + listclassname).empty();
        if(listclassname == "regex-list"){
            var regexList1 = JSON.parse(data.response.garbagewords)[0]
            var regexList2 = JSON.parse(data.response.garbagewords)[1]
            for(i=0; i< regexList1.length; i++){
                $("ul." + listclassname).append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage"><span>'+regexList1[i]+'</span> | <span>'+regexList2[i]+'</span></span> <a><i id="prsistRegx" class="remove glyphicon glyphicon-remove-sign glyphicon-white"></i></a> </span></li>');
            }
        }else{
            $.each(data.response.garbagewords, function() {
                if(this.word != "" && this.word != undefined && this.word != null && this.word != "\n"){
                    $("ul." + listclassname).append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage">'+this.word+'</span><a><i data-garbage-type="'+data.extra.fname+'" class="remove glyphicon glyphicon-remove-sign glyphicon-white remove-garbage-words"></i></a></span></li>')
                }
            });
        }
    });
    $("#data_preview_button_cleaning").click(function(){
        if($("#section_preview").hasClass('col-xs-6')){
            $("#section_operation").hide();
            $("#section_operation").removeClass('col-xs-6');
            $("#section_preview").toggleClass('col-xs-6 col-xs-12');
        }else{
            $("#section_preview").toggleClass('col-xs-12 col-xs-6');
            $("#section_operation").addClass('col-xs-6');
            $("#section_operation").show(200);
        }
    });
});
//checking null val
function isValueDefinedAndNotNull(value){
    if(typeof value !== 'undefined' && value != null && value != ""){
        return true;
    }else{
        return false;
    }
}
//Regular Expression operation
function writeRegx(){
    var listclassname = "regular-expression";
    var csrftoken = $.cookie('csrftoken');
    var garbage_dict = {}
    var garbage_dict_list = []
    $("#regex_list span[class=wordofgarbage]").each(function(){
        regexList = $(this).text().split("|")
        garbage_dict['regex1'] = regexList[0]
        garbage_dict['regex2'] = regexList[1]
        garbage_dict_list.push(garbage_dict)
        garbage_dict = {}
        regexList = []
    });
    xRequest = $.ajax({
         type:"POST",
         url:"/modifyregx/",
         contentType: 'application/json; charset=utf-8',
         CSRFToken: csrftoken,
         data: JSON.stringify(garbage_dict_list),
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
            }else{
                $("#db_conn_error").text("Error in DB Connection");
            }
         },
         error: function(err){
         }
    });
}
//Enabling next button disabling cleaning function
function enableNextbutton(){
    var isAllDisabled = true;
    $("#clean_items_cont input[type=checkbox]").each(function(){
        if($(this).prop('checked')){
            $("#next_training_btn").addClass('disabled');
            isAllDisabled = false;
            //return false;
        }
    });
    if(isAllDisabled){
        $("#next_training_btn").removeClass('disabled');
        $("#clean_data").addClass('disabled');
    }else{
        $("#clean_data").removeClass('disabled');
    }
}
//loading cleaned data parameters
function load_garbage_words(typeofgarbage){
    var csrftoken = $.cookie('csrftoken');
    var ajaxurl = "";
    var listclassname = ""
    switch(typeofgarbage){
        case "url":
            ajaxurl = "geturls";
            listclassname = "urls-list";
            break;
        case "specialchar":
            ajaxurl = "getspecialchars";
            listclassname = "specialchars-list";
            break;
        case "numbers":
            ajaxurl = "getnumbers";
            listclassname = "numbers-list";
            break;
        case "stopwords":
            ajaxurl = "getgarbagewords";
            listclassname = "stopwords-list";
            break;
        case "junkwords":
            ajaxurl = "getjunkwords";
            listclassname = "junkwords-list"
            break;
        case "regex":
            ajaxurl = "getregxwords";
            listclassname = "regex-list";
            break;
        default:
            ajaxurl = "getjunkwords";
            listclassname = "stopwords-list";
            break;
    }
    xRequest = $.ajax({
         type:"GET",
         url:"/" + ajaxurl + "/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
                $("ul." + listclassname).empty();
                if(listclassname == "regex-list"){
                    var regexList1 = $.parseJSON(data.garbagewords)[0]
                    var regexList2 = $.parseJSON(data.garbagewords)[1]
                    for(i=0; i< regexList1.length; i++){
                        $("ul." + listclassname).append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage"><span>'+regexList1[i]+'</span> | <span>'+regexList2[i]+'</span></span> <a><i id="prsistRegx" class="remove glyphicon glyphicon-remove-sign glyphicon-white"></i></a> </span></li>');
                    }
                }else{
                    $.each($.parseJSON(data.garbagewords), function() {
                        if(this.word != "" && this.word != undefined && this.word != null && this.word != "\n"){
                            $("ul." + listclassname).append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage">'+this.word+'</span><a><i data-garbage-type="'+typeofgarbage+'" class="remove glyphicon glyphicon-remove-sign glyphicon-white remove-garbage-words"></i></a></span></li>')
                        }
                    });
                }
            }else{
            }
         },
         error: function(err){
         }
    });
}
//editinf cleaning parameters
function modify_stop_words_in_file(typeofaddedgarbage){
    var garbageTypeToSave = "";
    var whichlist = "";
     switch(typeofaddedgarbage){
        case "stopwords":
            garbageTypeToSave = "stopwords";
            whichlist = "stopwords-list";
            break;
        case "junkwords":
            garbageTypeToSave = "junkwords";
            whichlist = "junkwords-list";
            break;
        default:
            garbageTypeToSave = "junkwords";
            whichlist = "junkwords-list";
            break;
     }
    var csrftoken = $.cookie('csrftoken');
    var garbage_dict = {}
    var garbage_dict_list = []
    $("." + whichlist + " span[class=wordofgarbage]").each(function(){
        garbage_dict['word'] = $(this).text()
        garbage_dict_list.push(garbage_dict)
        garbage_dict = {}
    });
    xRequest = $.ajax({
         type:"POST",
         url:"/modifygarbageword/?garbage=" + garbageTypeToSave,
         contentType: 'application/json; charset=utf-8',
         CSRFToken: csrftoken,
         data: JSON.stringify(garbage_dict_list),
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
            }else{
                $("#db_conn_error").text("Error in DB Connection");
            }
         },
         error: function(err){
         }
    });
}
//loading sampling data
function load_train_test_data_preview(){
    var csrftoken = $.cookie('csrftoken');
    xRequest = $.ajax({
         type:"GET",
         url:"/gettraintestdata/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         timeout: 3600000,
         success: function(data){
            if(data.status == 200){
                pagerRecords = data.lengthRecords;
                show_train_test_preview(data);
                if(parseInt(pagerRecords) > 2000){
                    $("#extract-pager").data("count", 2000);
                    $("#extract-pager").data("job", "cleaning");
                    $("#extract-pager").attr("data-count", 2000);
                    $("#extract-pager").attr("data-job", "cleaning");
                    $("#extract-pager").removeClass("hide");
                    $("#extract-pager .start-value").addClass('disabled');
                    $("#extract-pager .stop-value").removeClass('disabled');
                }else{
                    $("#extract-pager").addClass("hide");
                }
            }else{
                $("#cleaning_error_info").text("Error in cleaning..Please try again later.!");
            }
         },
         error: function(err){
            $("#cleaning_error_info").text("Error in cleaning..Please try again later.!");
         }
    });
}
//Preview of sampling data on loading
function show_train_test_preview(fulldata){
    var xtrain = fulldata.Xtrain;
    var xtest = fulldata.Xtest;
    var ytrain = fulldata.Ytrain;
    var ytest = fulldata.Ytest;
    var tableData = "";
    var tableArray = [];
    tableData = appendString(tableData, "<tr><th>XTrain</th><th>YTrain</th><th>XTest</th><th>YTest</th></tr>");
    tableArray.push(tableData);
    tableData = "";
    var largestArrayLength = Math.max(xtrain.length, xtest.length, ytrain.length, ytest.length)
    for(i=0; i < largestArrayLength; i++){
        tableData = appendString(tableData, "<tr>");
        tableData = isValueDefinedAndNotNull(xtrain[i]) ? appendString(tableData, "<td>"+ xtrain[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = isValueDefinedAndNotNull(ytrain[i]) ? appendString(tableData, "<td>"+ ytrain[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = isValueDefinedAndNotNull(xtest[i]) ? appendString(tableData, "<td>"+ xtest[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = isValueDefinedAndNotNull(ytest[i]) ? appendString(tableData, "<td>"+ ytest[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = appendString(tableData, "</tr>");
        tableArray.push(tableData);
        tableData = "";
    }
    callClusterize(tableArray, 'sampled_data_preview', 'preview_from_cleaning');
}
//Preview of cleaned data
function showCleanedData(cleanedOutData){
    var cleanedData = cleanedOutData.cleaneddata;
    var tableData = "";
    var tableArray = [];
    tableData =  appendString(tableData, "<tr><th>Cleaned data</th></tr>");
    tableArray.push(tableData);
    tableData = "";
    cleanedData.forEach(function(value){
        tableData =  appendString(tableData, "<tr><td>"+ value +"</td></tr>");
        tableArray.push(tableData);
        tableData = "";
    });
    callClusterize(tableArray, 'sampled_data_preview', 'preview_from_cleaning');
}