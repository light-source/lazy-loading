import BemBlock from '@lightsource/bem-block';

const lazyLoadingSettings = {
    "OFFSET_TO_LOADING": "500px", // will make lazyLoading more smooth, but it will be ignored for native
    "ERROR_CALLBACK": null,
    "data": {
        "SRC": "src",
        "SRCSET": "srcset",
    },
    "event": {
        "LOADING": "_lazy-loading--loading",
        "LOADED": "_lazy-loading--loaded",
    },
    "_class": {
        "LAZY": "lazy-loading",
        "LAZY__LOADED": "lazy-loading--loaded",
    },
};

/**
 * @type {LazyLoading|null}
 * @private
 */
let _lazyLoading = null;
const IS_SUPPORT_NATIVE_LAZY = 'loading' in HTMLImageElement.prototype;

class LazyLoading {


    //////// constructor


    constructor() {

        /**
         * @type {null|IntersectionObserver}
         * @private
         */
        this._intersectionObserver = null;

        this._options = {
            root: null,
            rootMargin: lazyLoadingSettings.OFFSET_TO_LOADING + ' 0px',
            threshold: 0.01,
        };

        this._init();

    }


    //////// methods


    static EmitError(info) {

        if (!lazyLoadingSettings.ERROR_CALLBACK) {
            return;
        }

        try {
            lazyLoadingSettings.ERROR_CALLBACK(info);
        } catch (e) {
            // nothing
        }

    }


    //////// methods


    _init() {

        if (IS_SUPPORT_NATIVE_LAZY) {
            return;
        }

        if ('IntersectionObserver' in window) {
            this._intersectionObserver = new IntersectionObserver(this._onIntersectionCallback.bind(this), this._options);
        } else {

            LazyLoading.EmitError({
                'message': "IntersectionObserver doesn't supported",
            });

        }

    }

    /**
     * @param {LazyImage} lazyImage
     */
    add(lazyImage) {

        if (IS_SUPPORT_NATIVE_LAZY ||
            !this._intersectionObserver) {

            lazyImage.onLoading();

            return;
        }

        this._intersectionObserver.observe(lazyImage.getElement());


    }

    //// events


    _onIntersectionCallback(entries, observer) {

        entries.forEach(entry => {

            if (!entry.isIntersecting) {
                return;
            }

            let target = entry.target

            target.dispatchEvent(new Event(lazyLoadingSettings.event.LOADING));

            observer.unobserve(target);

        });

    }

}

class LazyImage extends BemBlock.Class {


    //////// constructor


    constructor(element) {

        super(element);

        this._isPicture = false;
        this._isLoaded = false;

        this._init();

    }

    //////// methods


    _init() {

        let element = this.getElement();

        this._isPicture = "PICTURE" === element.parent.tagName;

        // load event also work with native browser lazyLoading
        element.addEventListener('onload', this.onImageLoad.bind(this));
        element.addEventListener(lazyLoadingSettings.event.LOADING, this.onLoading.bind(this));

        _lazyLoading.add(this);

    }

    //// events

    onLoading() {

        let element = this.getElement();

        let src = element.getAttribute('data-' + lazyLoadingSettings.data.SRC, null, false);
        let srcSet = element.getAttribute('data-' + lazyLoadingSettings.data.SRCSET, null, false);

        if (!src) {

            LazyLoading.EmitError({
                'message': "Element's data is missing",
                'element': element,
            });

            return;
        }

        element.removeAttribute('data-' + lazyLoadingSettings.data.SRC);

        if (srcSet) {
            element.removeAttribute('data-' + lazyLoadingSettings.data.SRCSET);
        }

        // make sure that the element is marked is nativeLazy is supporting

        if (IS_SUPPORT_NATIVE_LAZY &&
            !element.getAttribute('loading', null, false)) {
            element.setAttribute('loading', 'lazy');
        }

        // set before install sources

        this._isLoaded = true;

        // [source]

        if (this._isPicture) {

            element.parent.querySelectorAll('source').forEach((source) => {

                let sourceSrcSet = source.getAttribute('data-' + lazyLoadingSettings.data.SRCSET, null, false);

                if (!sourceSrcSet) {

                    LazyLoading.EmitError({
                        'message': "Element's data is missing",
                        'source': source,
                    });

                    return;
                }

                source.setAttribute('srcset', sourceSrcSet);
                source.removeAttribute('data-' + lazyLoadingSettings.data.SRCSET);


            });

        }

        // image

        element.setAttribute('src', src);

        if (srcSet) {
            element.setAttribute('srcset', srcSet);
        }


    }

    onImageLoad() {

        // ignore the event for the first (default) source

        if (!this._isLoaded) {
            return;
        }

        let element = this.getElement();
        element.classList.push(lazyLoadingSettings._class.LAZY__LOADED)
        element.dispatchEvent(new Event(lazyLoadingSettings.event.LOADED));

    }

}

_lazyLoading = new LazyLoading();

BemBlock.Register('.' + lazyLoadingSettings._class.LAZY, LazyImage);

export default {
    settings: lazyLoadingSettings,
    setClass: (lazyClass, lazyLoadedClass) => {

        lazyLoadingSettings._class.LAZY = lazyClass;
        lazyLoadingSettings._class.LAZY = lazyLoadedClass;
        BemBlock.Register('.' + lazyClass, LazyImage);

    },
};
