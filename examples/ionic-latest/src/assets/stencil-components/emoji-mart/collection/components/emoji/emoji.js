import { getData, unifiedToNative, getSanitizedData } from 'emoji-mart/dist-es/utils';
export class Emoji {
    constructor() {
        this.EMOJI_DATASOURCE_VERSION = "4.0.2";
        this.SHEET_COLUMNS = 52;
        // @Prop() children: any; 
        this.skin = 1;
        this.set = 'apple';
        this.sheetSize = 64;
        this.native = false;
        this.forceSize = false;
        this.tooltip = false;
        this.backgroundImageFn = (set, sheetSize) => `https://unpkg.com/emoji-datasource-${set}@${this.EMOJI_DATASOURCE_VERSION}/img/${set}/sheets-256/${sheetSize}.png`;
        this.onLoaded = () => { };
        this._getPosition = props => {
            var { sheet_x, sheet_y } = this._getData(props), multiply = 100 / (this.SHEET_COLUMNS - 1);
            return `${multiply * sheet_x}% ${multiply * sheet_y}%`;
        };
        this._getData = props => {
            var { emoji, skin, set } = props;
            return getData(emoji, skin, set);
        };
        this._getSanitizedData = props => {
            var { emoji, skin, set } = props;
            return getSanitizedData(emoji, skin, set);
        };
        this._handleClick = (e, props) => {
            if (!props.onClick) {
                return;
            }
            var { onClick } = props, emoji = this._getSanitizedData(props);
            onClick(emoji, e);
        };
        this._handleOver = (e, props) => {
            if (!props.onOver) {
                return;
            }
            var { onOver } = props, emoji = this._getSanitizedData(props);
            onOver(emoji, e);
        };
        this._handleLeave = (e, props) => {
            if (!props.onLeave) {
                return;
            }
            var { onLeave } = props, emoji = this._getSanitizedData(props);
            onLeave(emoji, e);
        };
        this._isNumeric = value => {
            return !isNaN(value - parseFloat(value));
        };
        this._convertStyleToCSS = style => {
            let div = document.createElement('div');
            for (let key in style) {
                let value = style[key];
                if (this._isNumeric(value)) {
                    value += 'px';
                }
                div.style[key] = value;
            }
            return div.getAttribute('style');
        };
        this._detectImgLoaded = imgSrc => {
            var image = new Image();
            image.src = imgSrc;
            image.onload = () => {
                this.onLoaded();
            };
        };
    }
    componentDidLoad() {
        this._detectImgLoaded(this.backgroundImageFn(this.set, this.sheetSize));
    }
    render() {
        let data = this._getData(this);
        if (!data) {
            return null;
        }
        let style = {};
        let { unified, custom, short_names, imageUrl } = data, children = '', className = 'emoji-mart-emoji', title = null;
        if (!unified && !custom) {
            return null;
        }
        if (this.tooltip) {
            title = short_names[0];
        }
        if (this.native && unified) {
            className += ' emoji-mart-emoji-native';
            style = { fontSize: this.size };
            children = unifiedToNative(unified);
            if (this.forceSize) {
                style.display = 'inline-block';
                style.width = this.size;
                style.height = this.size;
            }
        }
        else if (custom) {
            className += ' emoji-mart-emoji-custom';
            style = {
                width: this.size,
                height: this.size,
                display: 'inline-block',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'contain',
            };
        }
        else {
            let setHasEmoji = this._getData(this)[`has_img_${this.set}`];
            if (!setHasEmoji) {
                if (this.fallback) {
                    style = { fontSize: this.size };
                    children = this.fallback(data);
                }
                else {
                    return null;
                }
            }
            else {
                style = {
                    width: `${this.size}px`,
                    height: `${this.size}px`,
                    display: 'inline-block',
                    backgroundImage: `url(${this.backgroundImageFn(this.set, this.sheetSize)})`,
                    backgroundSize: `${100 * this.SHEET_COLUMNS}%`,
                    backgroundPosition: this._getPosition(this),
                };
            }
        }
        if (this.html) {
            style = this._convertStyleToCSS(style);
            return `<span style='${style}' ${title
                ? `title='${title}'`
                : ''} class='${className}'>${children || ''}</span>`;
        }
        else {
            return (h("span", { onClick: e => this._handleClick(e, this), onMouseEnter: e => this._handleOver(e, this), onMouseLeave: e => this._handleLeave(e, this), title: title, class: className },
                h("span", { style: style }, children)));
        }
    }
    static get is() { return "emart-emoji"; }
    static get properties() { return { "backgroundImageFn": { "type": "Any", "attr": "background-image-fn" }, "emoji": { "type": "Any", "attr": "emoji" }, "fallback": { "type": "Any", "attr": "fallback" }, "forceSize": { "type": "Any", "attr": "force-size" }, "html": { "type": "Any", "attr": "html" }, "native": { "type": "Any", "attr": "native" }, "onClick": { "type": "Any", "attr": "on-click" }, "onLeave": { "type": "Any", "attr": "on-leave" }, "onLoaded": { "type": "Any", "attr": "on-loaded" }, "onOver": { "type": "Any", "attr": "on-over" }, "set": { "type": "Any", "attr": "set" }, "sheetSize": { "type": "Any", "attr": "sheet-size" }, "size": { "type": Number, "attr": "size" }, "skin": { "type": "Any", "attr": "skin" }, "tooltip": { "type": "Any", "attr": "tooltip" } }; }
    static get style() { return "/**style-placeholder:emart-emoji:**/"; }
}
