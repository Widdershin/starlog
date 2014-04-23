$(document).ready(function () {
    var zoomLevel = 20000;
    var zoomIncrement = 10000;
    var currentMouseY = -1;
    var $container = $(".container");

    load();

    var ctrlPressed = false;
    $(window).keydown(function(evt) {
        if (evt.which == 17) { // ctrl
            ctrlPressed = true;
        }
    }).keyup(function(evt) {
        if (evt.which == 17) { // ctrl
            ctrlPressed = false;
        }
    });
    
    $(document).keydown(function (e) {
        // e = e || window.event;

        //console.log(e.which);

        if (e.which === 61) // +
        {
            zoomLevel += zoomIncrement;
        }
        else if (e.which == 45) // -
        {
            zoomLevel -= zoomIncrement;
        }
        else if (e.which == 32) // space bar
        {
            var selected_range = window.getSelection().getRangeAt(0);
            
            console.log($(selected_range.startContainer).data("position"));
        }

        //zoom(zoomLevel);
    });

    var selectionStartY = -1;

    $(document).mousedown(function () {
        selectionStartY = currentMouseY;
    });

    $(document).mouseup(function () {
        if (ctrlPressed)
        {
            zoomToRange(selectionStartY, currentMouseY);
            selectionStartY = -1;
        }
    });

    
    $(document).mousemove(function(event) {
        currentMouseY = event.pageY;
    });

    function load()
    {
        $.getJSON('/streams', function ( data ) {
            var min_timestamp = data["range"][0];
            var max_timestamp = data["range"][1];

            $.each( data["streams"], function ( stream_name, lines ){
                $column = $('<div class="column2 selectable"></div>');
                $(".container").append($column);
                $column.append("<h3>" + stream_name + "</h3>");

                $.each( lines, function (i, line) {
                    var timestamp = line[0];
                    var text = line[1];
                    var position = (timestamp - min_timestamp) / (max_timestamp - min_timestamp);

                    var $line_div = $('<div class="line">' + text + "</div>");

                    $line_div.data("position", position);
                    $column.append($line_div);
                });
                zoom(20000);
            });
        });
    }

    function zoom(how_big)
    {
        $('.line').each( function ( index ) {
            var $this = $(this);
            var height = $this.height();
            var new_position = $this.data("position") * how_big + 100;
            var above_line_pos = parseFloat($this.prev().css("top"));

            if ((new_position - above_line_pos) < height)
            {
                new_position = above_line_pos + height;
            }

            $this.css({"top": new_position + "px"});
        });
    }

    function zoomToRange(start_y, end_y)
    {
        var currentPageZoom = $(window).height() / $(document).height;
        var oldZoomLevel = zoomLevel;
        var zoomChange = $(window).height() / (end_y - start_y);
        zoomLevel *= zoomChange;

        $(window).scrollTop(start_y * zoomChange);

        console.log("Zooming " + zoomChange)

        zoom(zoomLevel);
    }
});