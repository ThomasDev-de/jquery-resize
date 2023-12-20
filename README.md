# jquery-resize

By default, the resize event is fired on the window element. This small plugin fires the resize event with additional information on all elements.

## Calling up the plugin

```js
$('div').resize();

$('div').on('resize', function(e,direction, afterSizes, beforeSizes, diffSizes){
    console.log(direction, afterSizes, beforeSizes, diffSizes);
    // console output: 'x', {width: 934, height: 665}, {width: 985, height: 665}, {width: -51, height: 0}
});

// or directly with callback function

$('div').resize((direction, afterSizes, beforeSizes, diffSizes) => {
    console.log(direction, afterSizes, beforeSizes, diffSizes);
    // console output: 'x', {width: 934, height: 665}, {width: 985, height: 665}, {width: -51, height: 0}
});
```