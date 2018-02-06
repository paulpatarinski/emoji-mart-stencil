import frequently from 'emoji-mart/dist-es/utils/frequently';
import { getData } from 'emoji-mart/dist-es/utils';
import { I18N } from '../../lib/emoji-mart/data/I18N';
export class Category {
    constructor() {
        this.emojis = [];
        this.hasStickyPosition = true;
        this.i18n = I18N;
        this.categoryLoaded = () => { };
        this.setContainerRef = this.setContainerRef.bind(this);
        this.setLabelRef = this.setLabelRef.bind(this);
    }
    ;
    getTop() {
        return this._top;
    }
    componentDidLoad() {
        this._parent = this._container.parentNode;
        this._margin = 0;
        this._minMargin = 0;
        // this.memoizeSize()
    }
    shouldComponentUpdate(nextProps) {
        var { name, perLine, native, hasStickyPosition, emojis, emojiProps, } = this, { skin, size, set } = emojiProps, { perLine: nextPerLine, native: nextNative, hasStickyPosition: nextHasStickyPosition, emojis: nextEmojis, emojiProps: nextEmojiProps, } = nextProps, { skin: nextSkin, size: nextSize, set: nextSet } = nextEmojiProps, shouldUpdate = false;
        if (name == 'Recent' && perLine != nextPerLine) {
            shouldUpdate = true;
        }
        if (name == 'Search') {
            shouldUpdate = !(emojis == nextEmojis);
        }
        if (skin != nextSkin ||
            size != nextSize ||
            native != nextNative ||
            set != nextSet ||
            hasStickyPosition != nextHasStickyPosition) {
            shouldUpdate = true;
        }
        return shouldUpdate;
    }
    memoizeSize() {
        var { top, height } = this._container.getBoundingClientRect();
        var { top: parentTop } = this._parent.getBoundingClientRect();
        var { height: labelHeight } = this._label.getBoundingClientRect();
        this._top = top - parentTop + this._parent.scrollTop;
        if (height == 0) {
            this._maxMargin = 0;
        }
        else {
            this._maxMargin = height - labelHeight;
        }
    }
    handleScroll(scrollTop) {
        var margin = scrollTop - this._top;
        margin = margin < this._minMargin ? this._minMargin : margin;
        margin = margin > this._maxMargin ? this._maxMargin : margin;
        if (margin == this._margin)
            return;
        if (!this.hasStickyPosition) {
            this._label.style.top = `${margin}px`;
        }
        this._margin = margin;
        return true;
    }
    getEmojis() {
        var { emojis } = this;
        if (this.name == 'Recent') {
            let { custom } = this;
            let frequentlyUsed = this.recent || frequently.get(this.perLine);
            if (frequentlyUsed.length) {
                emojis = frequentlyUsed
                    .map(id => {
                    const emoji = custom.filter(e => e.id === id)[0];
                    if (emoji) {
                        return emoji;
                    }
                    return id;
                })
                    .filter(id => !!getData(id));
            }
            if (emojis.length === 0 && frequentlyUsed.length > 0) {
                return null;
            }
        }
        if (emojis) {
            emojis = emojis.slice(0);
        }
        return emojis;
    }
    updateDisplay(display) {
        var emojis = this.getEmojis();
        if (!emojis) {
            return;
        }
        this._container.style.display = display;
    }
    forceUpdate() {
        //This is a way to force an update https://github.com/ionic-team/stencil/issues/185
        this.i18n = Object.assign({}, this.i18n);
    }
    setContainerRef(c) {
        this._container = c;
    }
    setLabelRef(c) {
        this._label = c;
    }
    emojiLoaded(allEmojis, loadedEmojiIndex) {
        //Special case...should never occur
        if (!allEmojis) {
            this.categoryLoaded(0);
            return;
        }
        //Last emoji was loaded
        if (loadedEmojiIndex === allEmojis.length - 1) {
            this.categoryLoaded(allEmojis.length);
            return;
        }
    }
    render() {
        var { categoryId, name, hasStickyPosition, emojiProps, i18n } = this, emojis = this.getEmojis(), labelStyles = {}, labelSpanStyles = {}, containerStyles = {};
        if (!emojis) {
            containerStyles = {
                display: 'none',
            };
        }
        if (!hasStickyPosition) {
            labelStyles = {
                height: 28,
            };
            labelSpanStyles = {
                position: 'absolute',
            };
        }
        return (h("div", { ref: this.setContainerRef, class: `emoji-mart-category ${emojis && !emojis.length
                ? 'emoji-mart-no-results'
                : ''}`, style: containerStyles },
            h("div", { style: labelStyles, "data-name": name, class: "emoji-mart-category-label" },
                h("span", { style: labelSpanStyles, ref: this.setLabelRef }, i18n.categories[categoryId])),
            emojis && emojis.map((emoji, index) => (h("emart-emoji", Object.assign({ emoji: emoji, onLoaded: this.emojiLoaded.bind(this, emojis, index) }, emojiProps)))),
            emojis &&
                !emojis.length && (h("div", null,
                h("div", null,
                    h("emart-emoji", Object.assign({}, emojiProps, { size: 38, emoji: 'sleuth_or_spy', "on-over": null, "on-leave": null, "on-click": null }))),
                h("div", { class: "emoji-mart-no-results-label" }, i18n.notfound)))));
    }
    static get is() { return "emart-category"; }
    static get properties() { return { "categoryId": { "type": "Any", "attr": "category-id" }, "categoryKey": { "type": "Any", "attr": "category-key" }, "categoryLoaded": { "type": "Any", "attr": "category-loaded" }, "custom": { "type": "Any", "attr": "custom" }, "emojiProps": { "type": "Any", "attr": "emoji-props" }, "emojis": { "type": "Any", "attr": "emojis" }, "forceUpdate": { "method": true }, "getTop": { "method": true }, "handleScroll": { "method": true }, "hasStickyPosition": { "type": Boolean, "attr": "has-sticky-position" }, "i18n": { "type": "Any", "attr": "i18n" }, "memoizeSize": { "method": true }, "name": { "type": String, "attr": "name" }, "native": { "type": Boolean, "attr": "native" }, "perLine": { "type": Number, "attr": "per-line" }, "recent": { "type": "Any", "attr": "recent" }, "updateDisplay": { "method": true } }; }
}
