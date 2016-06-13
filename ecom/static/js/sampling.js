$(document).ready(function(){
    //drag and drop the fields into datasets
    $(".drop-content").droppable({ activeClass: 'active' });
    $("#drag-content").droppable({ activeClass: 'active' });
    $(".drag-content").draggable();
    $("#right_arrow_concat_opener").hide();
    $("#navigate_to_cleaning").hide();
    //concat datasets
    $("#concatDataset").on('click',function(){
        fieldLength = $("#fieldLength").val();
        datasetLength = getDatasetLength(fieldLength);
        if(validateDataset(fieldLength, datasetLength)){
            var dataset = []
            dataset = getFieldIndex();
            concatDataset(dataset);
        }
    });
    //initializing slider
    training = $("#training-slide").slider(sliderOption).on('change', function(){
        $("#training-val").val(training.slider('getValue'));
        testing.slider("setValue", (100-training.slider("getValue")));
    });
    testing = $("#testing-slide").slider(sliderOption).on('change', function(){
        $("#testing-val").val(testing.slider('getValue'));
        training.slider("setValue", (100-testing.slider("getValue")));
    });
    //initializing popover for changing slider value manual
    $("#edit-training-value").popover(popoverOption('training'));
    $("#edit-testing-value").popover(popoverOption('testing'));
    //hide and show slider value
    $("#edit-training-value, #edit-testing-value").on('click', function(){
        var sliderVal =  $(this).attr('id').split("-")[1];
        $("popover_error").text("");
        $(".popover").length>0 ? $(this).popover('hide') : (($(this).popover('show')), $("#"+sliderVal+"-val").val(window[sliderVal].slider('getValue')), $(".popover").find(".popover-value").focus());
    });
    //hide popover on outside click
    $('body').on('click', function (e) {
        //did not click a popover toggle or popover
        if ($('.popover ').length > 0) {
            if ($(e.target).data('toggle') !== 'popover'
            && $(e.target).parents('.popover.in').length === 0){
                targetId = $("#popover-val").val();
                if($(e.target).hasClass("slider-handle") || $(e.target).hasClass("slider-track") || $(e.target).hasClass("slider")) {
                    if($(e.target).parents("#"+targetId+"-slider").length == 0){
                        $('[data-toggle="popover"]').popover('hide');
                    }
                }else{
                    $('[data-toggle="popover"]').popover('hide');
                }
            }
        }
    });
    //toogling preview section
    $("#data_preview_button_sampling").click(function(){
        if($("#sampling_preview").hasClass('col-xs-6')){
            $("#section_operation").hide();
            $("#section_operation").removeClass('col-xs-6');
            $("#sampling_preview").toggleClass('col-xs-6 col-xs-12');
        }else{
            $("#sampling_preview").toggleClass('col-xs-12 col-xs-6');
            $("#section_operation").addClass('col-md-6');
            $("#section_operation").show(200);
        }
    });
    //toggle concat in data split section
    $("#show-concat").on("click", function(){
        $("#concat-section").toggleClass("hide");
        $("#sampling-section").toggleClass("hide");
        //$("#show-concat span.glyphicon").toggleClass("glyphicon-plus").toggleClass("glyphicon-remove");
    });
    //add sampling parameters
    $("#sample_params_add_btn").on('click',function(){
        $("#sample_params_add").trigger('enterKey');
    });
    //add sampling parameters
    $("#sample_params_add").bind("enterKey", function(){
        var param = $(this).val();
        $("#add_sample_params_error").text("");
        if(param != "" && param != undefined != param != null){
            $(this).parent().parent().find('ul.sample-params-list').append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage editableparam">'+param+'</span><a><i data-garbage-type="'+this.getAttribute("data-garbage-type")+'" class="remove glyphicon glyphicon-remove-sign glyphicon-white remove-garbage-words"></i></a></span></li>');
            modifySamplingParams();
            editAllParams();
            $(this).val('');
        }else{
            $("#add_sample_params_error").text("Please enter sampling parameter");
        }
    });
    $(".sampling-add").keyup(function(e){
        if(e.keyCode == 13){
            $(this).trigger("enterKey");
        }
    });
    $(document).on('click', '.remove-garbage-words', function(){
        var msg = "Are you sure want to remove '" + $(this).parent().parent().parent().text() + "'?";
        var liElem = $(this).parent().parent().parent();
        bootbox.confirm(msg, function(result) {
            if(result){
                liElem.remove();
                modifySamplingParams();
            }else{
            }
        });
    });
    $("#sample_params_remove_btn").click(function(){
        $("#sample_params_add").val('');
    });
    //list param on changing sampling method
    $("#sampling-type").on('change', function(){
        listSamplingParams()
    });
    if(window.location.href.indexOf('sampling') != -1){
        load_concat_data_preview();
    }
});
function load_concat_data_preview(){
    var csrftoken = $.cookie('csrftoken');
    var responseAppended = [];
    xRequest = $.ajax({
         type:"GET",
         url:"/getconcatdetails/",
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            pagerRecords = data.lengthRecords;
            previewConcatData(data);
            $("#extract-pager .start-value").attr("data-start-value", 0);
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
            //$("#sampling_error").text("Error in getting concat detials")
         }
    });
}
//validating datasets
function getDatasetLength(){
    return ($("#dataset1").find('.drop-content li.drag-content').length) + ($("#dataset2").find('.drop-content li.drag-content').length);
}
//validating datasets
function validateDataset(fieldLength, datasetLength){
    return (fieldLength == datasetLength) ? ($("span.sampling_error").text(""), true) : ($("span.sampling_error").text("Please split all field values among datasets"), false)
}
//getting index value from two datasets
function getFieldIndex(){
    var dataset = {"dataset1": [],"dataset2": []}
    if($("#dataset1 .drop-content li").length > 0){
        $("#dataset1 .drop-content li").each(function(){
            dataset.dataset1.push($(this).data("key"));
        });
    }
    if($("#dataset2 .drop-content li").length > 0){
        $("#dataset2 .drop-content li").each(function(){
            dataset.dataset2.push($(this).data("key"));
        });
    }
    return dataset;
}
//concating ajax request
function concatDataset(dataset){
    var csrftoken = $.cookie('csrftoken');
    xRequest = $.ajax({
        type:"POST",
         url:"/concatdataset/",
         CSRFToken: csrftoken,
         data: {'dataset' : JSON.stringify(dataset)},
         headers: {'X-CSRFToken': csrftoken},
         timeout: 3600000,
         success: function(data){
            pagerRecords = data.count;
            previewConcatData(data);
            listSamplingParams();
            $("#extract-pager .start-value").attr("data-start-value", 0);
            if(parseInt(pagerRecords) > 2000){
                $("#extract-pager").data("count", 2000);
                $("#extract-pager").attr("data-count", 2000);
                $("#extract-pager").removeClass("hide");
                $("#extract-pager .start-value").addClass('disabled');
                $("#extract-pager .stop-value").removeClass('disabled');
            }else{
                $("#extract-pager").addClass("hide");
            }
            $("#concat-section").addClass("hide");
            $("#sampling-section").removeClass("hide");
            $("#show-concat").removeClass("hide");
            if($("#show-concat span.glyphicon").hasClass("glyphicon-remove")){
                $("#show-concat span.glyphicon").removeClass("glyphicon-remove").addClass("glyphicon-plus");
            }
         },
         error: function(data){
            $("#sampling_error").text("Error in concating datasets")
         }
    });
}
//append concated data into UI
function previewConcatData(fulldataset){
    $("#concatenated_preview tr").empty();
    $("#sampled_preview tbody").empty();
    var tableData = "";
    var tableArray = [];
    tableData = appendString(tableData, "<tr><th>Predictor Variables</th><th>Dependent Variables</th></tr>");
    tableArray.push(tableData);
    tableData = "";
    var xdataset = fulldataset.Xdataset;
    var ydataset = fulldataset.Ydataset;
    var maximumLength = 0;
    if(xdataset.length > ydataset.length){
        maximumLength = xdataset.length;
    }else{
        maximumLength = ydataset.length;
    }
    for(i=0;i < maximumLength ;i++){
        tableData = appendString(tableData, "<tr>");
        tableData = (xdataset[i] == undefined || xdataset == null || xdataset == "") ? appendString(tableData, "<td></td>") :  appendString(tableData, "<td>"+xdataset[i]+"</td>");
        tableData = (ydataset[i] == undefined || ydataset[i] == null || ydataset[i] == "") ? appendString(tableData, "<td></td>") :  appendString(tableData, "<td>"+ydataset[i]+"</td>");
        tableData = appendString(tableData, "</tr>");
        tableArray.push(tableData);
        tableData = "";
    }
    callClusterize(tableArray, 'concatenated_preview', 'preview_from_conctat');
}
function isValueDefinedAndNotNull(value){
    return (typeof value !== 'undefined' && value != null && value != "") ? true : false;
}
//slide options for testing training
sliderOption = {
    formatter: function(value){
        return value + "%"
    },
    step: 0.1,
    tooltip: 'always'
};
// popover options with input field
popoverOption = function(popVal){
    return{
        html: true,
        container: 'body',
        content: "<div class='row'><div class='col-md-10'><div class='input-group'><input type='hidden' id='popover-val' value='"+popVal+"'><input type='text' id="+popVal+"-val value='' class='popover-value form-control' onkeypress='return popoverValidate(event)'><span class='input-group-addon'> (%) </span></div></div><div style='padding-top:3px;'><button class='btn btn-primary' id='change-"+popVal+"' onclick='changeSlider("+popVal+")'> <span class='glyphicon glyphicon-ok'></span> </button></div></div><div class='row'><span class='popover_error'></span></div>"
    }
};
//allow only numbers and dot in popover textbox
function popoverValidate(evt){
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    return ((charCode < 48 || charCode > 57) && (charCode != 46 && charCode > 31)) ? false :
        (charCode == 13 ? ($(".popover-value").parents('.popover-content').find("button").trigger("click"), true) : true);
}
//changing slider value from textbox
function changeSlider(sliderVal){
    var regEx =  /^(([0-9]\d?)(\.\d{1})?(\.0?)?)$/;
    var sliderId = sliderVal.attr('id').split('-')[0];
    var otherSliderId = "";
    sliderId == "testing" ? otherSliderId ="training" : otherSliderId = "testing";
    (($("#"+sliderId+"-val").val()).match(regEx) && $("#"+sliderId+"-val").val() != 0.0 ) ?
        (sliderVal.slider("setValue", parseFloat($("#"+sliderId+"-val").val())), window[otherSliderId].slider("setValue", 100 - (window[sliderId].slider('getValue'))), $("#edit-"+sliderId+"-value").popover('hide')) :
            $(".popover_error").text("Please enter value less than 100 with one decimal place");
}
//validating data split and sampling page
function validateSampling(thisVal){
    var trainingSlider = training.slider("getValue");
    var testingSlider = testing.slider("getValue");
    if((trainingSlider && testingSlider) ==0 ? ($(".slider_error").text("Slider value should not be 0"), false) : ($(".slider_error").text(""), true)){
        if((trainingSlider + testingSlider) == 100 ? ($(".slider_error").text(""),true) : ($(".slider_error").text("Sum of slider should be 100"), false)){
            if($("#sampling-type").val() == 0 ? ($(".slider_error").text("Please Choose file type"),false) : ($(".slider_error").text(""), true)){
                    var csrftoken = $.cookie('csrftoken');
                    $("#sampling_error").text("");
                    xRequest = $.ajax({
                        type:"POST",
                         url:"/datasplit/",
                         CSRFToken: csrftoken,
                         data: {'testing' : testingSlider, 'sampling-type': $("#sampling-type").val() },
                         headers: {'X-CSRFToken': csrftoken},
                         timeout: 3600000,
                         success: function(data){
                            if(data.status == -2){
                                $("#sampling_error").text(data.message);
                            }else{
                                pagerRecords = data.lengthRecords;
                                if(parseInt(pagerRecords) > 2000){
                                    $("#extract-pager").data("count", 2000);
                                    $("#extract-pager").data("job", "sampling");
                                    $("#extract-pager").attr("data-count", 2000);
                                    $("#extract-pager").attr("data-job", "sampling");
                                    $("#extract-pager").removeClass("hide");
                                    $("#extract-pager .start-value").addClass('disabled');
                                    $("#extract-pager .stop-value").removeClass('disabled');
                                }else{
                                    $("#extract-pager").addClass("hide");
                                }
                                 previewSampledData(data);
                                 $("#navigate_to_cleaning").show();
                            }
                         },
                         error: function(data){
                            $("#sampling_error").text("An error occured.please check you params!");
                         }
                    });
            }
        }
    }
}
//modifying params
function modifySamplingParams(){
    var csrftoken = $.cookie('csrftoken');
    var garbage_dict = {}
    var garbage_dict_list = []
    $(".wordofgarbage").each(function(){
        garbage_dict['param'] = $(this).text()
        garbage_dict_list.push(garbage_dict)
        garbage_dict = {}
    });
    xRequest = $.ajax({
         type:"POST",
         url:"/modifysamplingparams/?samplemethod="+$("#sampling-type").val(),
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
//display sampling params
function listSamplingParams(){
      var csrftoken = $.cookie('csrftoken');
      xRequest = $.ajax({
         type:"GET",
         url:"/getsamplingparams/?samplemethod="+$("#sampling-type").val(),
         CSRFToken: csrftoken,
         headers: {'X-CSRFToken': csrftoken},
         success: function(data){
            if(data.status == 200){
                $("ul.sample-params-list").empty();
                $.each($.parseJSON(data.sampleparams), function() {
                    if(this.word != "" && this.word != undefined && this.word != null && this.word != "\n"){
                        $("ul.sample-params-list").append('<li class="garbage-words"><span class="tag label label-info words-label"><span class="wordofgarbage editableparam">'+this.word+'</span><a><i data-garbage-type="sampleparams" class="remove glyphicon glyphicon-remove-sign glyphicon-white remove-garbage-words"></i></a></span></li>')
                    }
                });
                editAllParams();
                $('.editableparam').on('save',function(e,params){
                     $(this).data('editable').$element.text(params.newValue);
                     modifySamplingParams();
                });
                $('.editableparam').editable({
                    type: 'text',
                    title: 'Enter Param'
                 });
            }else{
            }
         },
         error: function(err){
         }
    });
}
//previewing sampling data
function previewSampledData(testTrainDataSet){
    $("#concatenated_preview tbody").empty();
    $("#sampled_preview tbody").empty();
    var tableData = "";
    var tableArray = [];
    tableData = appendString(tableData, "<tr><th>XTrain</th><th>YTrain</th><th>XTest</th><th>YTest</th></tr>");
    tableArray.push(tableData);
    tableData = "";
    var xtr = testTrainDataSet.Xtrain;
    var xte = testTrainDataSet.Xtest;
    var ytr = testTrainDataSet.Ytrain;
    var yte = testTrainDataSet.Ytest;
    var largestArray = Math.max(xtr.length, xte.length, ytr.length, yte.length);
    for(i=0; i < largestArray ; i++){
        tableData = appendString(tableData, "<tr>");
        tableData = isValueDefinedAndNotNull(xtr[i]) ? appendString(tableData, "<td>"+ xtr[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = isValueDefinedAndNotNull(ytr[i]) ? appendString(tableData, "<td>"+ ytr[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = isValueDefinedAndNotNull(xte[i]) ? appendString(tableData, "<td>"+ xte[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = isValueDefinedAndNotNull(yte[i]) ? appendString(tableData, "<td>"+ yte[i] +"</td>") : appendString(tableData, "<td> </td>");
        tableData = appendString(tableData, "</tr>");
        tableArray.push(tableData);
        tableData = "";
    }
    callClusterize(tableArray, 'sampled_preview', 'preview_from_sampling');
}
//Edidting parameter
function editAllParams(){
    $('.editableparam').editable(editableOptions).on('save', function(e,params){
        $(this).data('editable').$element.text(params.newValue);
        modifySamplingParams();
    });
}