/*! crm-app - v0.0.1 - 2014-07-22 */$(function(){$(".tree li:has(ul)").addClass("parent_li").find(" > span").attr("title","Collapse this branch"),$(".tree li.parent_li > span").on("click",function(e){var children=$(this).parent("li.parent_li").find(" > ul > li");children.is(":visible")?(children.hide("fast"),$(this).attr("title","Expand this branch").find(" > i").addClass("glyphicon-plus-sign").removeClass("glyphicon-minus-sign")):(children.show("fast"),$(this).attr("title","Collapse this branch").find(" > i").addClass("glyphicon-minus-sign").removeClass("glyphicon-plus-sign")),e.stopPropagation()}),$("img[id^='commodityImage']").hover(function(){$(this).css("cursor","pointer")},function(){$(this).css("cursor","default")}).click(function(e){e.preventDefault();var imageId=this.id.slice("commodityImage".length),imageList=$("#imageList");imageList.find("li").remove(),$.ajax({type:"GET",url:"/commodities/images/"+imageId,data:{},dataType:"json",success:function(results){var success=results.success,data=results.data;if(!success)return void alert(data,"Warning");var imageNum=data.length,imageItemCol=0;switch(imageNum){case 1:imageItemCol=12;break;case 2:imageItemCol=6;break;default:imageItemCol=4}var imgPrefix='<li class="list-unstyled col-md-'+imageItemCol+'"><div class="thumbnail"><img src="',imgSuffix='" class="img-responsive" alt="Responsive image"></div></li>',allImages="";$.each(data,function(index,image){allImages+=imgPrefix+image+imgSuffix}),imageList.append(allImages),$("#imageModal").modal("show")}})}),$("li[id^='imageLi']").hover(function(){$(this).css("cursor","pointer")},function(){$(this).css("cursor","default")}).click(function(e){e.preventDefault();var glyphicon=$(this).find("span");glyphicon.hasClass("glyphicon-remove-sign")?$(this).fadeTo("fast",1,function(){glyphicon.removeClass("glyphicon-remove-sign glyphicon-image-status-remove").addClass("glyphicon-ok-sign glyphicon-image-status-ok")}):$(this).fadeTo("fast",.33,function(){glyphicon.removeClass("glyphicon-ok-sign glyphicon-image-status-ok").addClass("glyphicon-remove-sign glyphicon-image-status-remove")})}),$("#forbidImage").click(function(e){e.preventDefault();var illegalImageIds=[],legalImageIds=[];$("li[id^='imageLi']").each(function(){var imageLi=$(this),id=imageLi.attr("id").slice("imageLi".length);imageLi.find("div > span").hasClass("glyphicon-remove-sign")?illegalImageIds.push(id):legalImageIds.push(id)});var data={illegalImageIds:illegalImageIds,legalImageIds:legalImageIds};$.ajax({type:"POST",url:"/images/forbid",data:JSON.stringify(data),contentType:"application/json",success:function(results){var success=results.success,data=results.data;success?location.href=data:alert(data,"Warning")}})})});