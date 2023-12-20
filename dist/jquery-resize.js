(function ($) {

    $.setupResize = {
        setDefaults(o = {}) {
            this.DEFAULTS = $.extend(true, this.DEFAULTS, o || {})
        }, setDefault(prop, value) {
            this.DEFAULTS[prop] = value;
        }, getDefaults() {
            return this.DEFAULTS;
        }, DEFAULTS: {
            debug: false,
            wait: 100
        }
    };
    /**
     *
     * @param {function|null} callback
     * @return {*|jQuery|HTMLElement}
     */
    $.fn.resize = function (callback = null) {
        if ($(this).length > 1) {
            return $(this).each(function (i, e) {
                return $(e).resize();
            })
        }
        const $element = $(this);
        const SETUP = $.setupResize.getDefaults();
        let sizes = getElementDimensions();
        let waitingTimeout = null;

        /**
         * @description Represents an object that observes changes to the size of a specified element.
         * @constructor
         * @param {function} callback - A function that will be called whenever the size of the observed element changes.
         */
        const resizeObserver = new ResizeObserver((e) => {
            if ($element.data('initResize')) {
                if (waitingTimeout !== null) {
                    clearTimeout(waitingTimeout);
                }
                waitingTimeout = setTimeout(onResizingFinished, SETUP.wait);
            }
            $element.data('initResize', true);
        });

        /**
         * Gets the dimensions (width and height) of the element.
         *
         * @return {Object} An object containing the width and height of the element.
         *                  {width: <number>, height: <number>}
         */
        function getElementDimensions(){
            return {
                width: $element.outerWidth(),
                height: $element.outerHeight()
            }
        }

        /**
         * Called when resizing of an element is finished.
         * Performs necessary actions based on the changes in width and height.
         */
        function onResizingFinished() {
            if (waitingTimeout !== null) {
                clearTimeout(waitingTimeout);
            }

            const newSizes = getElementDimensions();
            const changeWidth = newSizes.width !== sizes.width;
            const changeHeight = newSizes.height !== sizes.height;

            if (! changeWidth && ! changeHeight)
                return;

            let axis;
            if (changeWidth && changeHeight){
                axis = 'both';
            }
            else if (changeWidth) {
                axis = 'x'
            }
            else{
                axis = 'y'
            }

            const diff = {
                width :  newSizes.width - sizes.width,
                height : newSizes.height - sizes.height,
            }

            $element.trigger('resize', [axis, newSizes, sizes, diff]);

            if (SETUP.debug){
                const content = [
                    'resized on axis: ' +axis,
                    'new size: ' + JSON.stringify(newSizes),
                    'before size: ' + JSON.stringify(sizes),
                    'diff size: ' + JSON.stringify(diff),
                ];
                $element.html(content.join('<br>'));
            }


            if (typeof callback === 'function') {
                callback(axis, newSizes, sizes, diff);
            }
            sizes = newSizes;
        }

        resizeObserver.observe($element.get(0));

        return $element;
    }
}(jQuery))