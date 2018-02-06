import emojiIndex from 'emoji-mart/dist-es/utils/emoji-index';
import { I18N } from '../../lib/emoji-mart/data/I18N';
export class Search {
    constructor() {
        this.onSearch = () => { };
        this.maxResults = 75;
        this.emojisToShowFilter = null;
        this.autoFocus = false;
        this.custom = [];
        this.i18n = I18N;
        this.render = () => h("div", { class: "emoji-mart-search" },
            h("input", Object.assign({ ref: this.setRef, type: "text", onInput: this.handleInput, placeholder: this.i18n.search }, this.autoFocus && { 'autofocus': 'autofocus' })));
        this.setRef = this.setRef.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }
    handleInput() {
        var value = this._input.value;
        this.onSearch(emojiIndex.search(value, {
            emojisToShowFilter: this.emojisToShowFilter,
            maxResults: this.maxResults,
            include: this.include,
            exclude: this.exclude,
            custom: this.custom,
        }));
    }
    setRef(c) {
        this._input = c;
    }
    clear() {
        this._input.value = '';
    }
    static get is() { return "emart-search"; }
    static get properties() { return { "_input": { "state": true }, "autoFocus": { "type": Boolean, "attr": "auto-focus" }, "clear": { "method": true }, "custom": { "type": "Any", "attr": "custom" }, "emojisToShowFilter": { "type": "Any", "attr": "emojis-to-show-filter" }, "exclude": { "type": "Any", "attr": "exclude" }, "i18n": { "type": "Any", "attr": "i18n" }, "include": { "type": "Any", "attr": "include" }, "maxResults": { "type": Number, "attr": "max-results" }, "onSearch": { "type": "Any", "attr": "on-search" } }; }
}
