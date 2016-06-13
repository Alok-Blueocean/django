
window.onload = function() {
		$("#Addp").on('click',function(){
			document.getElementById("addproduct").style.display = "block";
			document.getElementById("Addp").className = "active";
			
			//document.getElementById("editproduct").style.display="none";
			
		});
		
		$("#Editp").on('click',function(){
			
			//document.getElementById("productlist").style.display="none";
			//document.getElementById("addproduct").style.display="none";
			//document.getElementById("editproduct").style.display="block";
			
		});
		
		$("#Addsale").on('click',function(){
			document.getElementById("addsaleform").style.display = "block";
			document.getElementById("Addsale").className = "active";
			
			//document.getElementById("editproduct").style.display="none";
			
		});
		
		$("#productreport").on('click',function(){
			
			//$("#salereport").removeClass("active")
			
			//document.getElementById("productreport").className = "active";
			
			document.getElementById("productlist").style.display="block";
			
			document.getElementById("salelist").style.display="none";
			
		});
		
		$("#salereport").on('click',function(){
			
			//$("#productreport").removeClass("active")

			//document.getElementById("salereport").className = "active";
			
			document.getElementById("productlist").style.display="none";
			
			document.getElementById("salelist").style.display="block";
			
		});
	
		
/*
	$('#go').on('click',function getresult(){
			
			var searchdata =$('#search').val();
			
			
			
			var csrftoken = $.cookie('csrftoken');
			//var file_read = new file_read_display();
			//var head = file_read.output;
			//fileDisplayArea2.innerText = lines[0]; //head;
		    var ajaxresult = null;
		testdata=$.ajax({
			async: false,
            type: "POST",
			url:"/database/search/",
            data: {csrfmiddlewaretoken : csrftoken, searchdata:searchdata}
           
        }).responseJSON;
		
		
		
		});
	*/
}
