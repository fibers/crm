$(function () {

    // Category tree view.
    $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').addClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('glyphicon-minus-sign').removeClass('glyphicon-plus-sign');
        }
        e.stopPropagation();
    });

    $("img[id^='commodityImage']").hover(function () {
        $(this).css("cursor", "pointer");
    }, function () {
        $(this).css("cursor", "default");
    }).click(function (e) {

        e.preventDefault();

        var imageId = this.id.slice('commodityImage'.length);
        var imageList = $('#imageList');

        imageList.find('li').remove();

        $.ajax({
            type: "GET",
            url: "/commodities/images/" + imageId,
            data: {},
            dataType: "json",
            success: function (results) {

                var success = results.success;
                var data = results.data;

                if (!success) {
                    alert(data, 'Warning');
                    return;
                }

                var imageNum = data.length;
                var imageItemCol = 0;

                switch (imageNum) {
                    case 1:
                        imageItemCol = 12;
                        break;
                    case 2:
                        imageItemCol = 6;
                        break;
                    default:
                        imageItemCol = 4;
                        break;
                }

                var imgPrefix = '<li class="list-unstyled col-md-' + imageItemCol +
                    '"><div class="thumbnail"><img src="';
                var imgSuffix = '" class="img-responsive" alt="Responsive image"></div></li>';

                var allImages = '';
                $.each(data, function (index, image) {
                    allImages += imgPrefix + image + imgSuffix;
                });

                imageList.append(allImages);

                $('#imageModal').modal('show');

            }
        });
    });

    $("li[id^='imageLi']").hover(function () {
        $(this).css("cursor", "pointer");
    }, function () {
        $(this).css("cursor", "default");
    }).click(function (e) {

        e.preventDefault();

        var glyphicon = $(this).find('span');

        if (glyphicon.hasClass('glyphicon-remove-sign')) {
            $(this).fadeTo('fast', 1, function () {
                glyphicon.removeClass('glyphicon-remove-sign glyphicon-image-status-remove')
                    .addClass('glyphicon-ok-sign glyphicon-image-status-ok');
            });
        } else {
            $(this).fadeTo('fast', 0.33, function () {
                glyphicon.removeClass('glyphicon-ok-sign glyphicon-image-status-ok')
                    .addClass('glyphicon-remove-sign glyphicon-image-status-remove');
            });
        }
    });

    $('#forbidImage').click(function (e) {

        e.preventDefault();

        var illegalImageIds = [];
        var legalImageIds = [];

        $("li[id^='imageLi']").each(function (index) {

            var imageLi = $(this);
            var id = imageLi.attr('id').slice('imageLi'.length);

            if (imageLi.find('div > span').hasClass('glyphicon-remove-sign')) {
                illegalImageIds.push(id);
            } else {
                legalImageIds.push(id);
            }
        });

        var data = {
            illegalImageIds: illegalImageIds,
            legalImageIds: legalImageIds
        };

        $.ajax({
            type: "POST",
            url: "/images/forbid",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (results) {
                var success = results.success;
                var data = results.data;

                if (success) {
                    location.href = data;
                } else {
                    alert(data, 'Warning');
                }
            }
        });
    });
});