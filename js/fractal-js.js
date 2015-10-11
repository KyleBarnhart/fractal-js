"use strict";

document.addEventListener("DOMContentLoaded", function() {
    new FractalJs(1024, 768);
});

var FractalJs = function(width, height, element) {
    var NUMBER_OF_COOLOURS = 1792;

    var maxIterations = 40

    var dx = -0.75;
    var dy = 0;
    var zoomFactor = 1;
    var previousZoomFactor = 1;
    
    var canvas = document.createElement('canvas');
    canvas.width  = width;
    canvas.height = height;
    
    if(!element) {
        element = document.body;
    }
    element.appendChild(canvas);
    
    canvas.addEventListener('click', function() {
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = this;

        do{
            totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
            totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        }
        while(currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;

        var offsetX = canvasX - canvas.width / 2;
        var offsetY = canvas.height / 2 - canvasY;

        previousZoomFactor = zoomFactor;
        zoomFactor *= 1.5;
        maxIterations = Math.floor(maxIterations * 1.04);

        generateFractal(offsetX, offsetY, 1);
    }, false);

    function fractal(c_r, c_i) {
        var z_r = c_r;
        var z_i = c_i;

        var z2_r = z_r * z_r;
        var z2_i = z_i * z_i;

        var n = 0;

        while(n < maxIterations && z2_r + z2_i < 4.0)
        {
            z_i = 2.0 * z_r * z_i + c_i;
            z_r = z2_r - z2_i + c_r;

            z2_r = z_r * z_r;
            z2_i = z_i * z_i;

            n++;
        }

        if(n > maxIterations - 1) {
            return maxIterations - 1;
        }

        z_i = 2.0 * z_r * z_i + c_i;
        z_r = z2_r - z2_i + c_r;

        z2_r = z_r * z_r;
        z2_i = z_i * z_i;

        z_i = 2.0 * z_r * z_i + c_i;
        z_r = z2_r - z2_i + c_r;

        z2_r = z_r * z_r;
        z2_i = z_i * z_i;

        z_i = 2.0 * z_r * z_i + c_i;
        z_r = z2_r - z2_i + c_r;

        z2_r = z_r * z_r;
        z2_i = z_i * z_i;

        n += 3;

        var n = n - Math.log(Math.log(Math.sqrt(z2_r + z2_i))) / Math.log(2.0);

        if(n > maxIterations - 1) {
            return maxIterations - 1;
        }

        if(n < 1.0) {
            return 0;
        }

        return n;
    }

    function getRGB (value) {
       var rgb = new Array(3);

       var colourValue = value * NUMBER_OF_COOLOURS;
       var bracket = Math.floor(colourValue / 256);
       var colour = Math.floor(colourValue % 256);

       switch (bracket)
       {
          case 0:
             rgb[0] = colour;
             rgb[1] = 0;
             rgb[2] = 0;
             break;

          case 1:
             rgb[0] = 255;
             rgb[1] = colour;
             rgb[2] = 0;
             break;

          case 2:
             rgb[0] = 255 - colour;
             rgb[1] = 255;
             rgb[2] = 0;
             break;

          case 3:
             rgb[0] = 0;
             rgb[1] = 255;
             rgb[2] = colour;
              break;

          case 4:
             rgb[0] = 0;
             rgb[1] = 255 - colour;
             rgb[2] = 255;
             break;

          case 5:
             rgb[0] = colour;
             rgb[1] = 0;
             rgb[2] = 255;
             break;

          case 6:
             rgb[0] = 255 - colour;
             rgb[1] = 0;
             rgb[2] = 255 - colour;
             break;

          default:
             rgb[0] = 0;
             rgb[1] = 0;
             rgb[2] = 0;
             break;
       }

       return rgb;
    }

    function generateFractal(offsetX, offsetY) {
        if(!offsetX) {
            offsetX = 0;
        }
        if(!offsetY) {
            offsetY = 0;
        }
        var context = canvas.getContext("2d");
        var imageData = context.getImageData(0, 0, width, height);
        var data = imageData.data;

        var interationData = new Uint32Array(width * height);
        var histogram = new Uint32Array(NUMBER_OF_COOLOURS);

        var rSize = 3.0 / zoomFactor;
        var iSize = 3.0 * height / width / zoomFactor;

        var xSize = rSize / width;
        var ySize = iSize / height;

        dx += xSize * offsetX * zoomFactor / previousZoomFactor;
        dy += ySize * offsetY * zoomFactor / previousZoomFactor;

        var minX = -rSize / 2 + dx;
        var minY = -iSize / 2.0 - dy;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var n = fractal(minX + x * xSize , minY + y * ySize);
                var interations = Math.floor(n * NUMBER_OF_COOLOURS / maxIterations);
                interationData[y * width + x] = interations;
                histogram[interations]++;
            }
        }

        var histogramTotal = 0
        for (var i = 0; i < NUMBER_OF_COOLOURS; i++)
        {
          histogramTotal += histogram[i]
        }

        var hues = new Uint32Array(NUMBER_OF_COOLOURS * 3);
        var hue = 0;
        for (var i = 0; i < NUMBER_OF_COOLOURS; i++) {
            hue += histogram[i] / histogramTotal
            
            var rgb = getRGB(hue);
            var index = i * 3;
            hues[index] = rgb[0];
            hues[index + 1] = rgb[1];
            hues[index + 2] = rgb[2];
        }

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var index = y * width + x;
                var hueIndex = interationData[index] * 3;

                index *= 4;

                data[index] = hues[hueIndex];
                data[index + 1] = hues[hueIndex + 1];
                data[index + 2] = hues[hueIndex + 2];
                data[index + 3] = 255;
            }
        }
        
        context.putImageData(imageData, 0, 0);
    }
    
    generateFractal();
};

