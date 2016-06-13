var selectedValues = "";
var xRequest;
var fileVal = false;
var tableRecords = 0;
var pagerRecords = 0;
var extractVal = false;
var extractJsonData = [];
$(document).ready(function() {
    //toggle `popup` / `inline` mode
    $.fn.editable.defaults.mode = 'popup';
    //make username editable
    $('#analysisname').editable();
    $("#from-file-extraction").show();
    $("#from-db-extraction").hide();
    $("#columns_chooser").hide();
    $("#right_arrow_db_details_opener").hide();
    $('.error-info').hide();
    $("#text_delimiter_decider").hide();
    $("#extraction_next").hide();
    //toggle file tab
    $("#from-file-select").click(function(){
        $("#from-db-extraction").hide(200);
        $("#columns_chooser").hide(200);
        $("#right_arrow_db_details_opener").hide();
        $("#from-db-select").removeClass('action-selected');
        $("#from-file-select").addClass('action-selected');
        $("#from-file-extraction").show(200);
        $("#action-btns").show(200);
        //$('#preview_from_file').show();
        //$('#preview_from_db').hide();
    });
    //toggle database tab
    $("#from-db-select").click(function(){
        $("#from-file-extraction").hide(200);
        $("#action-btns").hide(200);
        $("#from-file-select").removeClass('action-selected');
        $("#from-db-select").addClass('action-selected');
        $("#columns_chooser").hide();
        $("#from-db-extraction").show(200);
        $(".error-info").hide();
        $(".error-border").removeClass('error-border');
        $("#db_conn_error").text("");
        $("#file-0a").fileinput("clear");
        if(!($(".btn-file").hasClass("disabled"))){
            $(".btn-file").removeClass("disabled");
            $(".fileinput-upload-button").removeClass("disabled");
        }
        //$('#preview_from_file').hide();
        //$('#preview_from_db').show();
    });
    //toggle db details and column chooser
    $("#right_arrow_db_details_opener").click(function(){
        $("#from-db-extraction").toggle(200);
        $("#columns_chooser").toggle(200);
        $("#Extraction_error").hide(200);
        $("#db_conn_error").text("");
    });
    $("[id$='db_url'], [id$='db_name'], [id$='db_username'], [id$='db_password']").blur(function(){
        if(!checkValueNullOrEmpty($(this).val())){
            $(this).siblings('.error-info').show();
            $(this).addClass('error-border');
        }else{
            $(this).siblings('.error-info').hide();
            $(this).removeClass('error-border');
        }
    });
    //retrieve tables for the databases
    $("#db_connect").click(function(){
        if(checkValueNullOrEmpty($("#db_type option:selected").text()) && checkValueNullOrEmpty($("#db_url").val()) && checkValueNullOrEmpty($("#db_name").val()) && checkValueNullOrEmpty($("#db_username").val()) && checkValueNullOrEmpty($("#db_password").val()) ){
            var csrftoken = $.cookie('csrftoken');
            $("#db_conn_error").text("");
            xRequest = $.ajax({
                 type:"POST",
                 url:"/gettables/",
                 CSRFToken: csrftoken,
                 data: {
                        'dbtype': $("#db_type option:selected").text(),
                        'dburl': $("#db_url").val(),
                        'dbname': $("#db_name").val(),
                        'dbusername': $("#db_username").val(),
                        'dbpassword': $("#db_password").val()
                 },
                 headers: {'X-CSRFToken': csrftoken},
                 success: function(data){
                    if(data.status == 200){
                        $("#db_tables").empty();
                        $('#db_tables').append($('<option>', {
                            value: '0',
                            text: 'Table'
                        }));
                        //making existing data preview empty
                        $("#preview_from_db tr").empty();
                        appendTableNames(data)
                        $("#from-db-extraction").hide(200);
                        $("#right_arrow_db_details_opener").show(200);
                        $("#columns_chooser").show(200);
                    }else{
                        $("#db_conn_error").text("Error in DB Connection");
                    }
                 },
                 error: function(err){
                    $("#db_conn_error").text("Error in DB Connection. please check your inputs")
                 }
            });
        }else{
            $("#from-db-extraction input[type='text'], #from-db-extraction input[type='password']").each(function(){
                if(!checkValueNullOrEmpty($(this).val())){
                    $(this).siblings('.error-info').show();
                    $(this).addClass('error-border');
                }
            });
        }
    });
    //retrieve columns for the tables
    $("[id$='db_tables']").change(function(){
        var csrftoken = $.cookie('csrftoken');
        appendList = $(this).parents("[id$='columns_chooser']").find("[id$='tablle_columns_list']");
        dbElement = $(this).parents("[id$='columns_chooser']").prev();
        dbElement.next().find("[id='Extraction_error']").text("");
        if($(this).val() == '0'){
            appendList.empty();
            appendList.parents('dl').find('.multiSel').text('');
            appendList.parents('dl').find('.hida').show();
        }else{
            xRequest = $.ajax({
                 type:"POST",
                 url:"/getcolumns/",
                 CSRFToken: csrftoken,
                 data: {
                        'dbtype': dbElement.find("[id$='db_type'] option:selected").text(),
                        'dburl': dbElement.find("[id$='db_url']").val(),
                        'dbname': dbElement.find("[id$='db_name']").val(),
                        'dbusername': dbElement.find("[id$='db_username']").val(),
                        'dbpassword': dbElement.find("[id$='db_password']").val(),
                        'tablename': $(this).parents("[id$='columns_chooser']").find("[id$='db_tables'] option:selected").text()
                 },
                 headers: {'X-CSRFToken': csrftoken},
                 success: function(data){
                    if(data.status == 200){
                        tableRecords = data.recordcount;
                        appendList.empty();
                        appendList.parents('dl').find('.multiSel').text('');
                        appendList.parents('dl').find('.hida').show();
                        appendList.append($('<li>').append('<input type="checkbox" value="select all" class="select_all">Select all'));
                        selectedValues = "";
                        if(dbElement.find("[id$='db_type'] option:selected").text().toLowerCase() == 'mysql'){
                            $.each($.parseJSON(data.columnsintable), function() {
                                appendList.append($('<li>').append('<input type="checkbox" class="columnchecks" value='+this.Field+'>'+this.Field));
                            });
                        }else if(dbElement.find("[id$='db_type'] option:selected").text().toLowerCase() == 'mssql'){
                            $.each($.parseJSON(data.columnsintable), function() {
                                appendList.append($('<li>').append('<input type="checkbox" class="columnchecks" value='+this.All_Columns+'>'+this.All_Columns));
                            });
                        }else{
                        }
                    }else{
                        dbElement.next().find("[id='Extraction_error']").text("Error in DB Connection");
                    }
                 },
                 error: function(err){
                    dbElement.next().find("[id='Extraction_error']").text("Error in DB Connection");
                 }
            });
        }
    });
    //----for multiselect dropdown start-------
    $(".dropdown dt a").on('click', function () {
        $(this).parents('dl').find('ul').slideToggle('fast');
    });
    $(".dropdown dd ul li a").on('click', function () {
        $(this).parents('dl').find('ul').hide();
    });
    function getSelectedValue(id) {
       return $("#" + id).find("dt a span.value").html();
    }
    $(document).bind('click', function (e) {
        var $clicked = $(e.target);
        if($("[id$='where_cond']").css('display') == 'none' && !$clicked.parents().hasClass("dropdown")) $("#where_cond").show()
        if (!$clicked.parents().hasClass("dropdown")) $(".dropdown dd ul").hide();
    });
    $('.mutliSelect input[type="checkbox"]').on('click', function () {
        var title = $(this).closest('.mutliSelect').find('input[type="checkbox"]').val(),
            title = $(this).val() + ",";
        selectedValues = selectedValues + title;
        if ($(this).is(':checked')) {
            var html = '<span title="' + title + '">' + title + '</span>';
            $('.multiSel').append(html);
            $(".hida").hide();
        }
        else {
            $('span[title="' + title + '"]').remove();
            var ret = $(".hida");
            $('.dropdown dt a').append(ret);
        }
    });
    //----for multiselect dropdown end-------
    $(document).on("change", ".columnchecks", function(){
        if($(this).prop('checked') == false){
            $(this).parents('ul').find('.select_all').prop('checked', false);
        }
    });
    $(document).on('change', '.select_all', function() {
        if($(this).prop('checked') == true){
            $(this).parents('ul').find('li:not(li:first) input').each(function(){
                $(this).prop('checked') == false ? $(this).click() : 0
            });
        }else{
            $(this).parents('ul').find('li:not(li:first) input').each(function(){
                $(this).prop('checked') == true ? $(this).click() : 0
            });
            $(".hida").show();
        }
    });
    $(document).on('click', '[id$="tablle_columns_list"] li:not(li:first)', function(){
        selectedValues = "";
        $checkedCheckboxes = $(this).parents('ul').find('input[type="checkbox"]:checked');
        $checkedCheckboxes.each(function () {
            if($(this).val() != "select all"){
                selectedValues +=  $(this).val() +",";
            }
        });
        var html = '<span>' + selectedValues + '</span>';
        $(this).parents("[id$='columns_chooser']").find('.multiSel').empty();
        //$("#tablle_columns_list").append($('<li>').append('<input type="checkbox" value="select all" id="select_all">Select all'));
        $(this).parents("[id$='columns_chooser']").find('.multiSel').append(html);
        $(this).parents("[id$='columns_chooser']").find('.hida').hide();
        if(selectedValues == ""){
            $(this).parents("[id$='columns_chooser']").find('.hida').show();
        }
    });
    //extracting data from db
    $(document).on('click', '#extract_db_data', function(){
        $("#Extraction_error").hide();
        if(checkValueNullOrEmpty(selectedValues)){
            var minValue = $("#from_record").val();
            var maxValue = $("#to_record").val();
            if(checkValueNullOrEmpty(minValue && maxValue)){
                if(parseInt(maxValue) > parseInt(tableRecords)){
                    $("#Extraction_error").text("Maximum count should be less than "+ tableRecords);
                    $("#Extraction_error").show();
                    return false;
                }
            }else{
                minValue = 0;
                maxValue = tableRecords;
            }
            pagerRecords = maxValue;
            extractVal = true;
            extractDb(minValue, maxValue)
        }else{
            $("#Extraction_error").text("Please select at least one column with table");
            $("#Extraction_error").show();
        }
    });
    //toggle preview section
    $("#data_preview_button").click(function(){
        if($("#section_preview").hasClass('col-xs-7')){
            $("#section_operation").hide();
            $("#section_operation").removeClass('col-xs-5');
            $("#section_preview").toggleClass('col-xs-7 col-xs-12');
        }else{
            $("#section_preview").toggleClass('col-xs-12 col-xs-7');
            $("#section_operation").addClass('col-xs-5');
            $("#section_operation").show(200);
        }
    });
    $("#selecting_space").click(function(){
        $("#where_cond").toggle();
    });
    $('.clean-item-toggle').bootstrapToggle({
        on: 'Enabled',
        off: 'Disabled',
        size: 'mini',
        onstyle: 'success'
    });
    //text delimiter handler
    textFileDelimiter = "";
    headerDecider = false;
    $("[id$='text_file_delimiter']").keyup(function(){
        textFileDelimiter = JSON.stringify($(this).val());
    });
    $("[id$='header_decider']").change(function(){
        headerDecider = $(this).prop('checked');
     });
    //file upload section
    $("#file-0a, #file-X-Test, #file-Y-Test").fileinput({
        uploadUrl: "/uploadfile/",
        uploadAsync: true,
        dropZoneEnabled: false,
        allowedFileExtensions: ['txt', 'csv', 'xlsx', 'xls'],
        ajaxSettings: {CSRFToken: $.cookie('csrftoken'), headers: {'X-CSRFToken': $.cookie('csrftoken')}, timeout: 3600000},
        uploadExtraData: { delimitter: "", dataheader: "", datatovalidate : "" }
    });
    //changing extra data value in delimiter
    $("#file-0a, #file-X-Test, #file-Y-Test").on('filebatchpreupload',function(event, data, previewId, index){
        data.extra.delimitter  =  textFileDelimiter;
        data.extra.dataheader = headerDecider;
        data.extra.datatovalidate = $(this).data("validate") == 'X-Test' ? "xdata" : $(this).data("validate") == "Y-Test" ? "ydata" : "";
        fileVal = false;
        extractVal = true;
    });
    //Action after uploading file
    $("#file-0a, #file-X-Test, #file-Y-Test").on('fileuploaded',function(event, data, previewId, index){
        if(data.response.status === "-1"){
            $(".file-error-message").text(data.response.message).show();
        }else{
            if(data.extra.datatovalidate == ""){
                $("#preview_from_db tbody").empty();
                fileVal = false;
                extractVal = true;
                $.blockUI({
                    message : '<div id="thread-ui" style="cursor:pointer"> <h3>Extraction in progress... <button class="btn app-btn pull-right" onclick="cancelRecursive()">Abort</button> </h3></div>'
                });
                setTimeout(function(){
                    recursiveFilecheckAjax();
                },2000);
            }else{
                $("#test_validate_error").text("");
                $("#"+$(this).data("validate")+"-file-preview").removeClass('hide');
                $("#"+$(this).data("validate")+"-db-preview").addClass('hide');
                extractVal = true;
                $.blockUI({
                    message : '<div id="thread-ui" style="cursor:pointer"> <h3>Please wait...<button class="btn app-btn pull-right" onclick="cancelRecursive()">Abort</button> </h3></div>'
                });
                setTimeout(function(){
                    recursiveFilecheckAjax();
                },2000);
            }
            fileVal = false;
            $(this).parents('form').find('[id$="text_file_delimiter"]').attr("readonly", true);
        }
        fileVal = false;
    });
    //disabling browse butoon on succesfull update
    $("#file-0a, #file-X-VX-Test, #file-Y-Test").on("filebatchuploadcomplete", function(){
        $(this).parent().addClass("disabled");
        $(this).parents('.input-group-btn').find('a.fileinput-upload-button').addClass("disabled");
    });
    // Action on clearing the file
    $("#file-0a, #file-X-Test, #file-Y-Test").on("fileclear", function(){
        $(this).parent().removeClass("disabled");
        $(this).parents('.input-group-btn').find('a.fileinput-upload-button').removeClass("disabled");
        $(this).parents('form').find('[id$="text_delimiter_decider"]').hide();
        $(this).parents('form').find('[id$="text_file_delimiter"]').removeAttr("readonly");
        $(this).parents('form').find('[id$="text_file_delimiter"]').val('');
    });
    //Action on wrong file
    $("#file-0a, #file-X-Test, #file-Y-Test").on('fileuploaderror',function(event, data, previewId, index){
        $(this).parents('.input-group-btn').find('a.fileinput-upload-button').addClass('disabled');
    });
    //Action on loading file
    $('#file-0a, #file-X-Test, #file-Y-Test').on('fileloaded', function(event, file, previewId, index, reader) {
        if($(this).val().indexOf('.txt') != -1){
            $(this).parents('form').find('[id$="text_delimiter_decider"]').show();
            $(this).parents('.input-group-btn').find('a.fileinput-upload-button').addClass('disabled');
            $(this).parents('form').find('[id$="text_delimiter"]').focus();
        }else{
            $(this).parents('form').find('[id$="text_delimiter_decider"]').hide();
            $(this).parents('.input-group-btn').find('a.fileinput-upload-button').removeClass('disabled');
        }
    });
    //updating delimiter
    $("[id$='text_file_delimiter']").keyup(function(){
        $(this).val() == '' ? $(this).parents('form').find('a.fileinput-upload-button').addClass('disabled') : $(this).parents('form').find('a.fileinput-upload-button').removeClass('disabled');
    });
    //cleaning functions
    $("#clean_urls").click(function(){
        $("#urls_error").hide();
        clean_garbages("cleanurls", "urls_error");
    });
    $("#clean_special_chars").click(function(){
        $("#special_chars_error").hide();
        clean_garbages("cleanspecialchars", "urls_error");
    });
    $("#clean_numbers").click(function(){
        $("#numbers_error").hide();
        clean_garbages("cleannumbers", "numbers_error");
    });
    $("#clean_stop_words").click(function(){
        $("#clean_stop_words_error").hide();
        clean_garbages("cleanstopwords", "clean_stop_words_error")
    });
    $("#clean_junk_words").click(function(){
        $("#junk_words_error").hide();
        clean_garbages("cleanjunkwords", "junk_words_error");
    });
    if(window.location.href.indexOf('home') != -1){
        populateDbCreds();
        getSavedTableNames();
        load_extracted_data_preview();
    }
    if(window.location.href.indexOf('validation') != -1){
        //load_extracted_data_preview();
        populateDbCreds()
    }
    $("#text_file_delimiter").allowTabChar();
    //adding link url to right side tabs
    $("#extraction, #sampling, #cleaning, #training, #validation").click(function(){
        switch($(this).attr('id')) {
            case "extraction":
                if($(this).find("img").length > 0){
                    $(location).attr('href',"/home/");
                }
                break;
            case "sampling":
                if($(this).find("img").length > 0){
                    $(location).attr('href',"/sampling/");
                }
                break;
            case "cleaning":
                if($(this).find("img").length > 0){
                    $(location).attr('href',"/cleaning/");
                }
                break;
            case "training":
                if($(this).find("img").length > 0){
                    $(location).attr('href',"/training/");
                }
                break;
            case "validation":
                if($(this).find("img").length > 0){
                    $(location).attr('href',"/validation/");
                }
                break;
            default:
        }
    });
    $("#app-close").on("click", function(){
        var exitMessage = "Model can be saved only after cleaning is completed. Do you still want to terminate the session?";
        if(window.location.href.endsWith('cleaning/') || window.location.href.endsWith('training/') || window.location.href.endsWith('validation/')){
            exitMessage = "Please save your data before terminating the session to save progress.";
        }
        bootbox.dialog({
            message : exitMessage,
            buttons: {
                stayhere: {
                    label: "Stay on this page",
                    className: "btn-default",
                    callback: function() {
                        return 0;
                    }
                },
                Ignore: {
                    label: "Ignore & Exit",
                    className: "btn-primary",
                    callback: function() {
                        window.location.href = "/sessionclear/";
                    }
                }
            }
        });
    });
    //this code is to implement exit caution message on browser close button - start
    /*window.onbeforeunload = function() {
        var exitMessage = "Model can be saved only after cleaning is completed. Do you still want to terminate the session?";
        if(window.location.href.endsWith('cleaning/') || window.location.href.endsWith('training/') || window.location.href.endsWith('validation/')){
            exitMessage = "Please save you data before terminating the session to save progress.";
        }
        return exitMessage;
    };*/
    //this code is to implement exit caution message on browser close button - ends
});
//other functions
//initial loading of session data
function load_extracted_data_preview(){
    var csrftoken = $.cookie('csrftoken');
    var responseAppended = [];
    xRequest = $.ajax({
         type:"GET",
         url:"/getextractiondetails/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            appendJsonData(data.dataContent);
            callClusterize(extractJsonData, 'preview_from_db', 'preview_from_extract');
            extractJsonData = [];
            pagerRecords = data.lengthRecords;
            if(parseInt(pagerRecords) > 2000){
                $("#extract-pager").data("count", 2000);
                $("#extract-pager").attr("data-count", 2000);
                $("#extract-pager").removeClass("hide");
                $("#extract-pager .start-value").addClass('disabled');
                $("#extract-pager .stop-value").removeClass('disabled');
            }else{
                $("#extract-pager").addClass("hide");
            }
         },
         error: function(err){
            //$("#db_conn_error").text("No data extracted");
         }
    });
}
//validation for db fields
function checkValueNullOrEmpty(valueToCheck){
    if(valueToCheck == null || valueToCheck == undefined || valueToCheck === ""){
        return false;
    }else{
        return true;
    }
}
//clean garbages
function clean_garbages(cleanurl, errorContentId){
    var csrftoken = $.cookie('csrftoken');
    xRequest = $.ajax({
         type:"GET",
         url:"/" + cleanurl + "/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
                $("#" + errorContentId).hide();
                show_extracted_data_preview(data)
            }else{
                $("#" + errorContentId).text("Error in cleaning, please try with different data");
                $("#" + errorContentId).show();
            }
         },
         error: function(err){
            $("#" + errorContentId).text("Error in cleaning , please try with different data");
            $("#" + errorContentId).show();
         }
    });
}
//to enable the 'tab' entering in a text box
function pasteIntoInput(el, text) {
    el.focus();
    if (typeof el.selectionStart == "number") {
        var val = el.value;
        var selStart = el.selectionStart;
        el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
        el.selectionEnd = el.selectionStart = selStart + text.length;
    } else if (typeof document.selection != "undefined") {
        var textRange = document.selection.createRange();
        textRange.text = text;
        textRange.collapse(false);
        textRange.select();
    }
}
//allow tab spaces in textbox
function allowTabChar(el) {
    $(el).keydown(function(e) {
        if (e.which == 9) {
            pasteIntoInput(this, "\t");
            return false;
        }
    });
    // For Opera, which only allows suppression of keypress events, not keydown
    $(el).keypress(function(e) {
        if (e.which == 9) {
            return false;
        }
    });
}
$.fn.allowTabChar = function() {
    if (this.jquery) {
        this.each(function() {
            if (this.nodeType == 1) {
                var nodeName = this.nodeName.toLowerCase();
                if (nodeName == "textarea" || (nodeName == "input" && this.type == "text")) {
                    allowTabChar(this);
                }
            }
        })
    }
    return this;
}
//Extract data from db
function extractDb(fromVal, toVal){
    var jsonData =  {};
    var csrftoken = $.cookie('csrftoken');
    xRequest =  $.ajax({
         type:"POST",
         url:"/extractdata/",
         CSRFToken: csrftoken,
         timeout: 3600000,
         data: {
                'dbtype': $("#db_type option:selected").text(),
                'dburl': $("#db_url").val(),
                'dbname': $("#db_name").val(),
                'dbusername': $("#db_username").val(),
                'dbpassword': $("#db_password").val(),
                'tablename':$("#db_tables option:selected").text(),
                'columns':selectedValues,
                'conditions':$("#where_cond").val(),
                'recordfrom': fromVal,
                'recordto': toVal
         },
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            $("#preview_from_db tbody").empty();
            //$("#preview_from_file tbody").empty();
            extractVal = true;
            $.blockUI({
                message : '<div id="thread-ui" style="cursor:pointer"> <h3>Extraction in progress... <button class="btn app-btn pull-right" onclick="cancelRecursive()">Abort</button> </h3></div>'
            });
            setTimeout(function(){
                recursiveFilecheckAjax();
            },2000);
         },
         error: function(err){
            $("#Extraction_error").text("Error in Data extraction, please check your inputs");
            $("#Extraction_error").show();
         }
    });
}
//Recursion in long time out
function recursiveFilecheckAjax(){
    var csrftoken = $.cookie('csrftoken');
    xRequest = $.ajax({
        type:"POST",
        url:"/checkThread/",
        contentType: 'application/json; charset=utf-8',
        CSRFToken: csrftoken,
        headers: {'X-CSRFToken': csrftoken},
        success:function(data){
            if(JSON.parse(data).status === "100"){
                setTimeout(function(){
                    recursiveFilecheckAjax();
                },5000)
                //console.log("on going");
            }else if(JSON.parse(data).status === "200"){
                setProgressWidth(75);
                xRequest = $.ajax({
                    type:"POST",
                    url:"/getfilerecords/",
                    timeout: 3600000,
                    contentType: 'application/json; charset=utf-8',
                    CSRFToken: csrftoken,
                    headers: {'X-CSRFToken': csrftoken},
                    success: function(data){
                        if(data.source === "file"){
                            appendJsonData(data.dataContent);
                            callClusterize(extractJsonData, 'preview_from_db', 'preview_from_extract');
                            $("#extraction_next").show();
                        }else if(data.source === "database"){
                            appendJsonData(data.dataContent);
                            callClusterize(extractJsonData, 'preview_from_db', 'preview_from_extract');
                            $("#extr_next").show();
                        }else if(data.source === "cleaning"){
                            show_train_test_preview(data)
                        }else if(data.source === "xdata"){
                            previewDataAppend(data.dataContent);
                            callClusterize(extractJsonData, 'X-Test-Preview', 'X-Test-Preview-Row');
                        }else if(data.source === "ydata"){
                            previewDataAppend(data.dataContent);
                            callClusterize(extractJsonData, 'Y-Test-Preview', 'Y-Test-Preview-Row');
                        }else if(data.source === "empty"){
                            $.unblockUI();
                            bootbox.alert("Error: "+ data.message.toString());
                            return false;
                        }else{
                            $.unblockUI();
                            bootbox.alert("Error: "+ data.message.toString());
                            return false;
                        }
                        extractJsonData = [];
                        $.unblockUI();
                        extractVal = false;
                        pagerRecords = data.lengthRecords;
                        if(parseInt(pagerRecords) > 2000){
                            $("#extract-pager").data("count", 2000);
                            $("#extract-pager").attr("data-count", 2000);
                            $("#extract-pager").removeClass("hide");
                            $("#extract-pager .start-value").addClass('disabled');
                            $("#extract-pager .stop-value").removeClass('disabled');
                        }else{
                            $("#extract-pager").addClass("hide");
                        }
                    },
                    error: function(data){
                        $.unblockUI();
                        bootbox.alert("Unexpected Error. Please try again later");
                    }
                });
            }else{
                $.unblockUI();
                bootbox.alert("Unexpected Error. Please try again later");
            }
        },
        err:function(data){
            $.unblockUI();
            bootbox.alert("Unexpected Error. Please try again later");
        }
    });
}
//Pager
function refreshPager(actionDo){
    var countVal = parseInt($("#extract-pager").data("count"));
    var startVal = 0;
    var endVal = 0;
    var csrftoken = $.cookie('csrftoken');
    if(actionDo === "next"){
        startVal = countVal;
        endVal = (parseInt(pagerRecords) >= (countVal+2000)) ? countVal + 2000 : pagerRecords;
        countVal = endVal;
    }else{
        countVal = countVal - ($("#preview_from_"+$("#extract-pager").data("job")+" tr").length - 1);
        startVal = (parseInt(countVal) <= 2000) ? 0 : countVal - 2000;
        endVal = countVal;
        countVal = endVal;
    }
    xRequest =  $.ajax({
        type:"POST",
         url: "/getpartialdata/",
         CSRFToken: csrftoken,
         timeout: 3600000,
         data: {
                'startval' : startVal,
                'endVal' : endVal,
                'sessionname' : $("#extract-pager").data("job")
         },
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(!data.status){
                if($("#extract-pager").data("job") === "extract"){
                    appendJsonData(data);
                    callClusterize(extractJsonData, 'preview_from_db', 'preview_from_extract');
                    extractJsonData = [];
                }else if($("#extract-pager").data("job") === "concat"){
                    previewConcatData(data);
                }else if($("#extract-pager").data("job") === "sampling"){
                    previewSampledData(data);
                }else if($("#extract-pager").data("job") === "cleaning"){
                    show_train_test_preview(data);
                }
                $("#extract-pager").data("count", countVal)
                if(countVal <= 2000){
                    $("#extract-pager .start-value").addClass('disabled');
                    $("#extract-pager .stop-value").removeClass('disabled');
                }else if(countVal === pagerRecords){
                    $("#extract-pager .stop-value").addClass('disabled');
                    $("#extract-pager .start-value").removeClass('disabled');
                }else{
                    $("#extract-pager .start-value").removeClass('disabled');
                    $("#extract-pager .stop-value").removeClass('disabled');
                }
            }
         },
         error: function(data){
            console.log("error");
         }
    });
}
//Form Json array to append table
function appendJsonData(data_as_json){
    var tableData = "";
    var group = data_as_json;
    var allPropertyNames = Object.keys(group);
    for (var j=0; j < allPropertyNames.length; j++) {
        var name = allPropertyNames[j];
        var value = group[name];
        var innerValue = Object.keys(value);
        tableData = appendString(tableData, "<tr>");
        if(j == 0){
            for(var i=0;i<innerValue.length;i++){
                tableData = appendString(tableData, "<th>"+innerValue[i]+"</th>");
            }
            tableData = appendString(tableData, "</tr>");
            extractJsonData.push(tableData);
            tableData = "";
        }
        for(var i=0;i<innerValue.length;i++){
            tableData = appendString(tableData, "<td>"+value[innerValue[i]]+"</td>");
        }
        tableData = appendString(tableData, "</tr>");
        extractJsonData.push(tableData);
        tableData = "";
    }
}
//appending rows in database preview
function show_extracted_data_preview(data_as_json){
    var tableData = "";
    var tableArray = [];
    var group = $.parseJSON(data_as_json.tabledata);
    var allPropertyNames = Object.keys(group);
    for (var j=0; j<allPropertyNames.length; j++) {
        var name = allPropertyNames[j];
        var value = group[name];
        var innerValue = Object.keys(value);
        tableData = appendString(tableData, "<tr>");
        for(var i=0;i<innerValue.length;i++){
            tableData = (j == 0) ? appendString(tableData, "<th>"+innerValue[i]+"</th>") : appendString(tableData, "<td>"+value[innerValue[i]]+"</td>");
        }
        tableData = appendString(tableData, "</tr>");
        tableArray.push(tableData);
        tableData = "";
    }
    callClusterize(tableArray, 'preview_from_db', 'preview_from_extract');
    $("#extr_save_session,#extr_next").show(200);
}
//appending string
function appendString(init, newVal){
    return init += newVal;
}
//Initializing clusterize for large amt of data
function callClusterize(data, scroll, content){
    var clusterize = new Clusterize({
        rows: data,
        scrollId: scroll,
        contentId: content,
        blocks_in_cluster: Math.ceil(data.length/10)
    });
}
function populateDbCreds(){
    var csrftoken = $.cookie('csrftoken');
    xRequest = $.ajax({
         type:"GET",
         url:"/getdbcreds/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
            if(window.location.href.indexOf('home') != -1){
                $("#db_url").val(""+data.dburl)
                $("#db_name").val(""+data.dbname)
                $("#db_username").val(""+data.dbusername)
                $("#db_password").val(""+data.dbpassword)
            }else if(window.location.href.indexOf('validation') != -1){
                $("#X-Test-db_url").val(""+data.dburl)
                $("#X-Test-db_name").val(""+data.dbname)
                $("#X-Test-db_username").val(""+data.dbusername)
                $("#X-Test-db_password").val(""+data.dbpassword)

                $("#Y-Test-db_url").val(""+data.dburl)
                $("#Y-Test-db_name").val(""+data.dbname)
                $("#Y-Test-db_username").val(""+data.dbusername)
                $("#Y-Test-db_password").val(""+data.dbpassword)
            }
            }else{
            }
         },
         error: function(err){

         }
    });
}
function appendTableNames(data){
    var group = $.parseJSON(data.tablesindb);
    var allPropertyNames = Object.keys(group);
    for (var j=0; j<allPropertyNames.length; j++) {
        var name = allPropertyNames[j];
        var value = group[name];
        var innerValue = Object.keys(value);
        for(var i=0;i<innerValue.length;i++){
            var field = innerValue[i];
            var tablename = value[field];
            if($("#db_type option:selected").text().toLowerCase() == 'mysql'){
                $('#db_tables').append($('<option>', {
                    value: tablename,
                    text : tablename
                }));
            }else if($("#db_type option:selected").text().toLowerCase() == 'mssql'){
                if(field.toLowerCase() == 'table_name'){
                    $('#db_tables').append($('<option>', {
                        value: tablename,
                        text : tablename
                    }));
                }
            }else{
            }
        }
    }
}
function getSavedTableNames(){
    var csrftoken = $.cookie('csrftoken');
    $("#from-db-select").trigger('click');
    xRequest =$.ajax({
         type:"GET",
         url:"/getsavedtables/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
                $("#db_tables").empty();
                $('#db_tables').append($('<option>', {
                    value: '0',
                    text: 'Table'
                }));
                //making existing data preview empty
                $("#preview_from_db tr").empty();
                appendTableNames(data)
                $("#from-db-extraction").hide(200);
                $("#right_arrow_db_details_opener").show(200);
                $("#columns_chooser").show(200);
            }else{

            }
         },
         error: function(err){

         }
    });
}
//Editable params options
var editableOptions = {
    type: 'text',
    title: 'Enter Param',
    container: 'body',
    placement: 'right',
    validate: function(value) {
        return $.trim(value) == '' ? 'This field is required' :
            value.indexOf("=") == -1 ? 'Assignment statement is required' :
                (!(value.split("=").length == 2 && value.split("=")[1] != "")) ? 'Assignment statement is required' : null;
    }
}
//progress bar handler
function setProgressWidth(prgVal){
    $('.block-ui .progress-bar').width(prgVal+"%");
    $('.block-ui .progress-bar span').text(prgVal+"%");
    $(".block-ui .progress-bar").attr("aria-valuenow", prgVal);
}
//random number generator
function randomNumberFromRange(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
//cancel ajax request
function cancelAjaxRequest(){
    xRequest.abort();
    $.unblockUI();
    extractVal = false;
    fileVal = false;
}
function cancelRecursive(){
    var csrftoken = $.cookie('csrftoken');
    $.ajax({
        type:"GET",
         url:"/stopactivethread/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            //location.reload();
         },
         error: function(err){

         }
    });
}
//UI blocker for all ajax call request.
$(document).ajaxStart(function(){
    fileVal === true ?
        ($(".block-ui .app-btn").hide(),
        $.blockUI({
            message: $('div.block-ui')
        })) : ($(".block-ui .app-btn").show(), fileVal = false);
    extractVal === false ?
        ($.blockUI({
            message: $('div.block-ui')
        }),setProgressWidth(randomNumberFromRange(0,10))) : setProgressWidth(0);
    extractVal === false ? setProgressWidth(randomNumberFromRange(0,25)) : 0;
}).ajaxSend(function(){
    extractVal === false ? setProgressWidth(randomNumberFromRange(45,65)) : 0;
}).ajaxComplete(function(){
    extractVal === false ? setProgressWidth(randomNumberFromRange(80,90)) : 0;
}).ajaxStop(function(){
    extractVal === false ? setProgressWidth(randomNumberFromRange(90,95)) : 0;
    extractVal === false ? $.when(setProgressWidth(100)).done(function(){
            $.unblockUI({
                onUnblock: function(){
                    setProgressWidth(0);
                }
            });
        }) : 0;
}).ajaxError(function(){
    extractVal === false ? setProgressWidth(randomNumberFromRange(80,90)) : 0;
    extractVal === false ? $.when(setProgressWidth(100)).done(function(){
            $.unblockUI({
                onUnblock: function(){ setProgressWidth(0); }
            });
        }) : 0;
});
