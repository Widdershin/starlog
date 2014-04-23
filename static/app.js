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
            var streams = data["streams"];
            
            for (stream_name in streams)
            {
                var lines = streams[stream_name];
                var column = createElement("div", "column2 selectable");
                var container = document.getElementByID("container");

                container.appendChild(column);

                var header = document.createElement("H3");
                header.innerHTML = stream_name;
                column.appendChild(header);

                for (line in lines)
                {
                    var timestamp = line[0];
                    var text = line[1];
                    
                    var position = (timestamp - min_timestamp) / (max_timestamp - min_timestamp);

                    var $line_div = $('<div class="line">' + text + "</div>");

                    $line_div.dataset["position"] = position;
                    $column.append($line_div);
                }
                zoom(20000);
            }
        });
    }

    function zoom(how_big)
    {
        var lines = document.querySelectorAll('.line');
        lines.forEach( function ( line ) {
            
            var height = line.offsetHeight;
            var newPosition = line.dataset["position"] * how_big + 100;
            // var above_line_pos = parseFloat($this.prev().css("top"));

            // if ((new_position - above_line_pos) < height)
            // {
            //     new_position = above_line_pos + height;
            // }

            line.style.top = newPosition + "px";
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

    function createElement(element, class)
    {
        newElement = document.createElement(element);
        newElement.className = class;

        return newElement;
    }
});