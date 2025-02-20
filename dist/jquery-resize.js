(function ($) {
    $.setupResize = {
        setDefaults(o = {}) {
            this.DEFAULTS = $.extend(true, this.DEFAULTS, o || {});
        },
        setDefault(prop, value) {
            this.DEFAULTS[prop] = value;
        },
        getDefaults() {
            return this.DEFAULTS;
        },
        DEFAULTS: {
            debug: false,
            wait: 400, // Standard-Debounce-Zeit
        },
    };

    /**
     * Hauptfunktion für Resize-Handling
     * @param {function|object|string|null} callbackOrOptionsOrMethod
     * @returns {jQuery|HTMLElement}
     */
    $.fn.resize = function (callbackOrOptionsOrMethod = null) {
        if ($(this).length > 1) {
            // Mehrere Elemente: Individuell behandeln
            return $(this).each(function () {
                $(this).resize(callbackOrOptionsOrMethod);
            });
        }

        const $element = $(this);
        let previousSizes = null; // Speichert alte Größen zur Differenzberechnung
        let resizeObserver; // Observer wird hier gespeichert

        /**
         * Hauptlogik für die Größenänderung
         * @param {Object} newSizes - Neu berechnete Größe des Elements
         */
        function onResizing(newSizes, shouldTriggerEvent = true) {
            // Alte Abmessungen holen
            const currentSizes = previousSizes || { width: 0, height: 0 };

            // Änderungen prüfen
            const changeWidth = newSizes.width !== currentSizes.width;
            const changeHeight = newSizes.height !== currentSizes.height;

            // Wenn keine Änderung stattgefunden hat, abbrechen
            if (!changeWidth && !changeHeight) return;

            // Änderungsachse bestimmen
            let axis;
            if (changeWidth && changeHeight) {
                axis = "both";
            } else if (changeWidth) {
                axis = "x";
            } else {
                axis = "y";
            }

            // Differenz berechnen
            const diff = {
                width: newSizes.width - currentSizes.width,
                height: newSizes.height - currentSizes.height,
            };

            // Event nur triggern, wenn es erlaubt ist
            if (shouldTriggerEvent) {
                $element.trigger("resize", [axis, newSizes, currentSizes, diff]);
            }

            // Debugging (falls aktiviert)
            const settings = $element.data("resizeSettings");
            if (settings.debug) {
                console.log("Resized on axis:", axis);
                console.log("New size:", newSizes);
                console.log("Previous size:", currentSizes);
                console.log("Diff:", diff);
            }

            // Callback ausführen (falls festgelegt)
            if (typeof callbackOrOptionsOrMethod === "function") {
                callbackOrOptionsOrMethod(axis, newSizes, currentSizes, diff);
            }

            // Neue Größe speichern
            previousSizes = newSizes;
        }

        /**
         * Initialisiert Resize-Events
         */
        function initEvents() {
            // Cleanup: Observer trennen, wenn das Element entfernt wird
            $element.on("remove", function () {
                if (resizeObserver) {
                    resizeObserver.disconnect();
                }
            });
        }

        /**
         * Startet den ResizeObserver
         */
        function startObserver() {
            // ResizeObserver erstellen
            resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    const { contentRect } = entry;
                    const newSizes = { width: contentRect.width, height: contentRect.height };

                    // Initiale Größe prüfen und ignorieren
                    if (!previousSizes) {
                        previousSizes = newSizes; // Speichere Startgröße
                        return; // Überspringe, da keine Änderung vorliegt
                    }

                    // Verzögerung (debouncing)
                    const settings = $element.data("resizeSettings");
                    clearTimeout($element.data("resizeTimeout")); // Bestehenden Timeout abbrechen
                    $element.data(
                        "resizeTimeout",
                        setTimeout(() => onResizing(newSizes), settings.wait)
                    );
                }
            });

            // Observer aktivieren
            resizeObserver.observe($element.get(0));
        }

        /**
         * Initialisiert die Funktionalität
         */
        function init() {
            const customSettings =
                typeof callbackOrOptionsOrMethod === "object" ? callbackOrOptionsOrMethod : {};
            const settings = $.extend({}, $.setupResize.getDefaults(), customSettings);
            $element.data("resizeSettings", settings);
            $element.data("initResize", true);

            initEvents();
            startObserver();
        }

        /**
         * Verarbeitet Methoden wie "resize"
         */
        function handleMethodCall(method) {
            switch (method) {
                case "resize":
                    const currentSizes = {
                        width: $element.outerWidth(),
                        height: $element.outerHeight(),
                    };
                    onResizing(currentSizes, false); // Manuelle Größenänderung auslösen
                    break;

                default:
                    console.warn(`Method "${method}" is not supported.`);
                    break;
            }
        }

        if ($element.data("initResize") !== true) {
            init();
        }

        // Verarbeiten von Methodenaufrufen
        if (typeof callbackOrOptionsOrMethod === "string") {
            handleMethodCall(callbackOrOptionsOrMethod);
        }

        return $element; // jQuery-Support
    };
})(jQuery);
